import { NextResponse } from "next/server";
import { getRoom, updateRoom, saveRoom, Round, FallacySignal, generatePlayerId, syncTimers } from "@/lib/store";
import { topics } from "@/data/topics";

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomId = params.roomId.toUpperCase();
        let room = await getRoom(roomId);

        if (!room) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        room = syncTimers(room);

        const { action, payload } = await req.json();

        switch (action) {
            case "START_GAME":
            case "NEXT_ROUND": {
                if (room.players.length < 2) {
                    return NextResponse.json({ error: "Se necesitan al menos 2 jugadores" }, { status: 400 });
                }

                // Filtrar temas por intensidad y no usados
                let availableTopics = topics.filter(t => t.intensity === room.intensity && !room.usedTopics.includes(t.id));

                // Si se agotaron, reciclar los de la misma intensidad
                if (availableTopics.length === 0) {
                    availableTopics = topics.filter(t => t.intensity === room.intensity);
                    room.usedTopics = []; // reset
                }

                const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
                room.usedTopics.push(randomTopic.id);

                // Selector de debatientes
                let debA: typeof room.players[0];
                let debB: typeof room.players[0];

                if (room.mode === "mesa" && room.rounds.length > 0) {
                    const lastRound = room.rounds[room.rounds.length - 1];
                    const availableForDebate = room.players.filter(p => p.id !== lastRound.debatienteA_Id && p.id !== lastRound.debatienteB_Id);
                    
                    if (availableForDebate.length >= 2) {
                        const shuffledAvailable = [...availableForDebate].sort(() => 0.5 - Math.random());
                        debA = shuffledAvailable[0];
                        debB = shuffledAvailable[1];
                    } else if (availableForDebate.length === 1) {
                        debA = availableForDebate[0];
                        const others = room.players.filter(p => p.id !== debA.id);
                        debB = others[Math.floor(Math.random() * others.length)];
                    } else {
                        const shuffled = [...room.players].sort(() => 0.5 - Math.random());
                        debA = shuffled[0];
                        debB = shuffled[1];
                    }
                } else {
                    const shuffled = [...room.players].sort(() => 0.5 - Math.random());
                    debA = shuffled[0];
                    debB = shuffled[1];
                }

                const updatedPlayers = room.players.map(p => {
                    let role: "jurado" | "debatiente_a" | "debatiente_b" | "host" = "jurado";
                    if (p.id === debA.id) role = "debatiente_a";
                    else if (debB && p.id === debB.id) role = "debatiente_b";
                    else if (p.id === room.hostId) role = "host";
                    return { ...p, role };
                });

                const isCorta = room.duration === "corta";
                const timeSecs = isCorta ? 120 : 180; // 2 o 3 minutos por cada uno

                const newRound: Round = {
                    number: room.currentRoundIndex + 2,
                    topicId: randomTopic.id,
                    debatienteA_Id: debA.id,
                    debatienteB_Id: debB.id,
                    timeRemainingA: timeSecs,
                    timeRemainingB: timeSecs,
                    debateState: "transition",
                    activeSpeaker: "debatiente_a",
                    transitionRemaining: 10,
                    turnStartTime: null,
                    votes: {},
                    secondaryVotes: {},
                    resolutionVotes: {},
                    fallaciesSignaled: [],
                    winnerId: null
                };

                const newRounds = [...room.rounds, newRound];

                const isGameOver = false; // El NEXT_ROUND solo ocurre si no terminó

                await updateRoom(roomId, {
                    state: "preparation",
                    players: updatedPlayers,
                    rounds: newRounds,
                    currentRoundIndex: room.currentRoundIndex + 1,
                    usedTopics: room.usedTopics
                });

                return NextResponse.json({ success: true });
            }

            case "START_DEBATE": {
                const round = room.rounds[room.currentRoundIndex];
                round.turnStartTime = Date.now();
                await updateRoom(roomId, { state: "debate", rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "PASS_TURN": {
                const round = room.rounds[room.currentRoundIndex];
                if (round.turnStartTime && round.debateState === "speaking") {
                    const elapsed = Math.floor((Date.now() - round.turnStartTime) / 1000);
                    if (round.activeSpeaker === "debatiente_a") {
                        round.timeRemainingA = Math.max(0, round.timeRemainingA - elapsed);
                        if (round.timeRemainingB > 0) {
                            round.activeSpeaker = "debatiente_b";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    } else {
                        round.timeRemainingB = Math.max(0, round.timeRemainingB - elapsed);
                        if (round.timeRemainingA > 0) {
                            round.activeSpeaker = "debatiente_a";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    }
                }
                await updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "START_SPEAKING": {
                const round = room.rounds[room.currentRoundIndex];
                if (round.debateState === "transition") {
                    round.debateState = "speaking";
                    round.turnStartTime = Date.now();
                    await updateRoom(roomId, { rounds: [...room.rounds] });
                }
                return NextResponse.json({ success: true });
            }

            case "SURRENDER": {
                const { playerId } = payload;
                const round = room.rounds[room.currentRoundIndex];

                if (round.debateState === "speaking") {
                    if (round.activeSpeaker === "debatiente_a" && playerId === round.debatienteA_Id) {
                        round.timeRemainingA = 0;
                        if (round.timeRemainingB > 0) {
                            round.activeSpeaker = "debatiente_b";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    } else if (round.activeSpeaker === "debatiente_b" && playerId === round.debatienteB_Id) {
                        round.timeRemainingB = 0;
                        if (round.timeRemainingA > 0) {
                            round.activeSpeaker = "debatiente_a";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    }
                } else if (round.debateState === "transition") {
                    if (round.activeSpeaker === "debatiente_a" && playerId === round.debatienteA_Id) {
                        round.timeRemainingA = 0;
                        if (round.timeRemainingB > 0) {
                            round.activeSpeaker = "debatiente_b";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    } else if (round.activeSpeaker === "debatiente_b" && playerId === round.debatienteB_Id) {
                        round.timeRemainingB = 0;
                        if (round.timeRemainingA > 0) {
                            round.activeSpeaker = "debatiente_a";
                            round.debateState = "transition";
                            round.transitionRemaining = 10;
                            round.turnStartTime = Date.now();
                        } else {
                            round.debateState = "finished";
                        }
                    }
                }

                await updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "FINISH_DEBATE": {
                if (room.players.length === 2) {
                    await updateRoom(roomId, { state: "resolution" });
                } else {
                    await updateRoom(roomId, { state: "voting" });
                }
                return NextResponse.json({ success: true });
            }

            case "SIGNAL_FALLACY": {
                const { playerId, fallacyId } = payload;
                const round = room.rounds[room.currentRoundIndex];
                if (round.turnStartTime) {
                    const elapsed = Math.floor((Date.now() - round.turnStartTime) / 1000);
                    if (round.debateState === "transition") {
                        round.transitionRemaining = Math.max(0, round.transitionRemaining - elapsed);
                    } else if (round.activeSpeaker === "debatiente_a") {
                        round.timeRemainingA = Math.max(0, round.timeRemainingA - elapsed);
                    } else {
                        round.timeRemainingB = Math.max(0, round.timeRemainingB - elapsed);
                    }
                    round.turnStartTime = null;
                }

                const accusedId = round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;

                round.activeChallenge = {
                    fallacyId,
                    accuserId: playerId,
                    accusedId,
                    yesVotes: [],
                    noVotes: []
                };

                await updateRoom(roomId, { state: "fallacy_review", rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "VOTE_FALLACY": {
                const { playerId, vote } = payload;
                const round = room.rounds[room.currentRoundIndex];
                if (!round.activeChallenge) return NextResponse.json({ error: "No active challenge" }, { status: 400 });

                if (vote === "yes" && !round.activeChallenge.yesVotes.includes(playerId) && !round.activeChallenge.noVotes.includes(playerId)) {
                    round.activeChallenge.yesVotes.push(playerId);
                } else if (vote === "no" && !round.activeChallenge.noVotes.includes(playerId) && !round.activeChallenge.yesVotes.includes(playerId)) {
                    round.activeChallenge.noVotes.push(playerId);
                }

                // El resto de jugadores (no involucrados) son los que votan
                const expectedVotersCount = Math.max(1, room.players.length - 2); 
                const totalVotes = round.activeChallenge.yesVotes.length + round.activeChallenge.noVotes.length;

                const isForceMode = vote === "resolve_force" || vote === "force_accept" || vote === "force_reject";

                if (totalVotes >= expectedVotersCount || isForceMode) {
                    const shouldAccept = vote === "force_accept" || (vote !== "force_reject" && round.activeChallenge.yesVotes.length >= round.activeChallenge.noVotes.length);
                    
                    const accuser = room.players.find(p => p.id === round.activeChallenge!.accuserId);
                    const accused = room.players.find(p => p.id === round.activeChallenge!.accusedId);

                    if (shouldAccept) {
                        const signal: FallacySignal = {
                            id: generatePlayerId(),
                            signaledBy: round.activeChallenge.accuserId,
                            accusedId: round.activeChallenge.accusedId,
                            fallacyId: round.activeChallenge.fallacyId,
                            roundNumber: round.number,
                            timestamp: Date.now()
                        };
                        round.fallaciesSignaled.push(signal);
                        
                        // Premiar con 1 punto al acusador y restar 1 al acusado
                        if (accuser) accuser.score += 1;
                        if (accused) accused.score = Math.max(0, accused.score - 1);
                    } else {
                        // Penalizar al acusador con 1 punto si se equivocó
                        if (accuser) accuser.score = Math.max(0, accuser.score - 1);
                    }
                    round.activeChallenge = null;
                    round.turnStartTime = Date.now();
                    await updateRoom(roomId, { state: "debate", rounds: [...room.rounds], players: [...room.players] });
                } else {
                    await updateRoom(roomId, { rounds: [...room.rounds] });
                }

                return NextResponse.json({ success: true });
            }

            case "VOTE": {
                const { playerId, votedForId, reason } = payload;
                const round = room.rounds[room.currentRoundIndex];

                round.votes[playerId] = votedForId;
                if (reason) round.secondaryVotes[playerId] = reason;

                // Cierre automático si todos los jurados votaron
                const juridicoPlayers = room.players.filter(p => p.id !== round.debatienteA_Id && p.id !== round.debatienteB_Id);
                const totalJurado = juridicoPlayers.length;
                const votesReceived = Object.keys(round.votes).length;

                if (votesReceived >= totalJurado && totalJurado > 0) {
                    // Esperar un poquito o disparar el cierre inmediato
                    // Para ser más fluido, llamamos a la lógica de cierre aquí
                    await handle_CLOSE_VOTING(roomId, room);
                } else {
                    await updateRoom(roomId, { rounds: [...room.rounds] });
                }

                return NextResponse.json({ success: true });
            }

            case "VOTE_RESOLUTION": {
                const { playerId, vote } = payload;
                const round = room.rounds[room.currentRoundIndex];

                if (!round.resolutionVotes) round.resolutionVotes = {};
                round.resolutionVotes[playerId] = vote;
                await updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "SUBMIT_MESA_VOTES": {
                if (room.mode !== "mesa") return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
                const { votes } = payload;
                const round = room.rounds[room.currentRoundIndex];
                
                let votesA = 0;
                let votesB = 0;
                let empates = 0;
                
                Object.values(votes).forEach(vote => {
                    if (vote === "A") votesA++;
                    else if (vote === "B") votesB++;
                    else empates++;
                });
                
                let fallaciesA = 0;
                let fallaciesB = 0;
                round.fallaciesSignaled.forEach(f => {
                    if (f.accusedId === round.debatienteA_Id) fallaciesA++;
                    else if (f.accusedId === round.debatienteB_Id) fallaciesB++;
                });
                
                const scoreA = Math.max(0, votesA - fallaciesA);
                const scoreB = Math.max(0, votesB - fallaciesB);
                
                const pA = room.players.find(p => p.id === round.debatienteA_Id);
                const pB = room.players.find(p => p.id === round.debatienteB_Id);
                
                if (pA) pA.score += scoreA;
                if (pB) pB.score += scoreB;
                
                if (scoreA > scoreB) {
                    round.winnerId = round.debatienteA_Id;
                    if (pA) pA.wins += 1;
                } else if (scoreB > scoreA) {
                    round.winnerId = round.debatienteB_Id;
                    if (pB) pB.wins += 1;
                } else {
                    round.winnerId = "empate";
                }
                
                round.resolutionVotes = votes as Record<string, string>;
                await updateRoom(roomId, { state: "resolution", rounds: [...room.rounds], players: [...room.players] });
                return NextResponse.json({ success: true, scoreA, scoreB });
            }

            case "SHOW_LEADERBOARD": {
                if (room.mode === "mesa") {
                    await updateRoom(roomId, { state: "results" });
                }
                return NextResponse.json({ success: true });
            }

            case "CLOSE_VOTING": {
                await handle_CLOSE_VOTING(roomId, room);
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error in action handler:", error);
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}

async function handle_CLOSE_VOTING(roomId: string, room: any) {
    const round = room.rounds[room.currentRoundIndex];
    let winner = "empate";

    if (room.players.length === 2) {
        const votes = Object.values(round.resolutionVotes || {});
        if (votes.length === 2 && votes[0] === votes[1]) {
            if (votes[0] === "A") winner = round.debatienteA_Id;
            else if (votes[0] === "B") winner = round.debatienteB_Id;
        }
    } else {
        let votesA = 0;
        let votesB = 0;
        Object.values(round.votes).forEach(vId => {
            if (vId === round.debatienteA_Id) votesA++;
            if (vId === round.debatienteB_Id) votesB++;
        });

        if (votesA > votesB) winner = round.debatienteA_Id;
        else if (votesB > votesA) winner = round.debatienteB_Id;
    }

    round.winnerId = winner;

    const pA = room.players.find((p: any) => p.id === round.debatienteA_Id);
    const pB = room.players.find((p: any) => p.id === round.debatienteB_Id);

    if (pA && pB) {
        if (winner === pA.id) {
            pA.score += 5; // +5 para el ganador
            pA.wins += 1;
            // pB recibe 0 (no cambia nada, pero explícito por las reglas)
        } else if (winner === pB.id) {
            pB.score += 5; // +5 para el ganador
            pB.wins += 1;
            // pA recibe 0
        } else { // empate
            pA.score += 2; // +2 cada uno
            pB.score += 2;
        }
    }

    // Determinar si el juego terminó según el modo
    const numPlayers = room.players.length;
    let maxRounds = 999;
    
    if (room.duration === "corta") {
        maxRounds = Math.ceil(numPlayers / 2); // Cada uno debate al menos 1 vez
    } else if (room.duration === "larga") {
        maxRounds = Math.ceil((numPlayers * 3) / 2); // Cada uno debate 3 veces
    } else if (room.duration === "leyenda") {
        maxRounds = (numPlayers * (numPlayers - 1)) / 2; // Todos contra todos
    }

    const isGameOver = (room.currentRoundIndex + 1) >= maxRounds;
    const newState = isGameOver ? "results" : "results"; // Seguimos yendo a results para ver el puntaje de la ronda

    await updateRoom(roomId, { 
        state: newState, 
        rounds: [...room.rounds], 
        players: [...room.players] 
    });
}
