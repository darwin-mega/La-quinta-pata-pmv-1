import { NextResponse } from "next/server";
import { getRoom, updateRoom, Round, FallacySignal, generatePlayerId, syncTimers } from "@/lib/store";
import { topics } from "@/data/topics";

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomId = params.roomId.toUpperCase();
        let room = getRoom(roomId);

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

                updateRoom(roomId, {
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
                updateRoom(roomId, { state: "debate", rounds: [...room.rounds] });
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
                updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "START_SPEAKING": {
                const round = room.rounds[room.currentRoundIndex];
                if (round.debateState === "transition") {
                    round.debateState = "speaking";
                    round.turnStartTime = Date.now();
                    updateRoom(roomId, { rounds: [...room.rounds] });
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

                updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "FINISH_DEBATE": {
                if (room.players.length === 2) {
                    updateRoom(roomId, { state: "resolution" });
                } else {
                    updateRoom(roomId, { state: "voting" });
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

                updateRoom(roomId, { state: "fallacy_review", rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "VOTE_FALLACY": {
                const { playerId, vote } = payload; // vote = 'yes' | 'no' | 'resolve_force' | 'force_accept' | 'force_reject'
                const round = room.rounds[room.currentRoundIndex];
                if (!round.activeChallenge) return NextResponse.json({ error: "No active challenge" }, { status: 400 });

                if (vote === "yes" && !round.activeChallenge.yesVotes.includes(playerId) && !round.activeChallenge.noVotes.includes(playerId)) {
                    round.activeChallenge.yesVotes.push(playerId);
                } else if (vote === "no" && !round.activeChallenge.noVotes.includes(playerId) && !round.activeChallenge.yesVotes.includes(playerId)) {
                    round.activeChallenge.noVotes.push(playerId);
                }

                const expectedVotersCount = room.players.length - 1; // Todos menos el orador
                const totalVotes = round.activeChallenge.yesVotes.length + round.activeChallenge.noVotes.length;

                const isForceMode = vote === "resolve_force" || vote === "force_accept" || vote === "force_reject";

                if (totalVotes >= expectedVotersCount || isForceMode) {
                    const shouldAccept = vote === "force_accept" || (vote !== "force_reject" && round.activeChallenge.yesVotes.length >= round.activeChallenge.noVotes.length);
                    
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
                        
                        // Premiar con 1 punto al acusador por detectar la falacia correctamente
                        const accuser = room.players.find(p => p.id === round.activeChallenge!.accuserId);
                        if (accuser) accuser.score += 1;
                    }
                    round.activeChallenge = null;
                    round.turnStartTime = Date.now();
                    updateRoom(roomId, { state: "debate", rounds: [...room.rounds] });
                } else {
                    updateRoom(roomId, { rounds: [...room.rounds] });
                }

                return NextResponse.json({ success: true });
            }

            case "VOTE": {
                const { playerId, votedForId, reason } = payload;
                const round = room.rounds[room.currentRoundIndex];

                round.votes[playerId] = votedForId;
                if (reason) round.secondaryVotes[playerId] = reason;

                updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "VOTE_RESOLUTION": {
                // For 2 players
                const { playerId, vote } = payload; // vote is "A", "B", or "empate"
                const round = room.rounds[room.currentRoundIndex];

                if (!round.resolutionVotes) round.resolutionVotes = {};
                round.resolutionVotes[playerId] = vote;
                updateRoom(roomId, { rounds: [...room.rounds] });
                return NextResponse.json({ success: true });
            }

            case "SUBMIT_MESA_VOTES": {
                if (room.mode !== "mesa") return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
                const { votes } = payload; // Record<playerId, "A" | "B" | "empate">
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
                updateRoom(roomId, { state: "resolution", rounds: [...room.rounds], players: [...room.players] });
                return NextResponse.json({ success: true, scoreA, scoreB });
            }

            case "SHOW_LEADERBOARD": {
                if (room.mode === "mesa") {
                    updateRoom(roomId, { state: "results" });
                }
                return NextResponse.json({ success: true });
            }

            case "CLOSE_VOTING": {
                const round = room.rounds[room.currentRoundIndex];
                let winner = "empate";

                // Logic based on player count
                if (room.players.length === 2) {
                    const votes = Object.values(round.resolutionVotes || {});
                    if (votes.length === 2 && votes[0] === votes[1]) { // Both agree
                        if (votes[0] === "A") winner = round.debatienteA_Id;
                        else if (votes[0] === "B") winner = round.debatienteB_Id;
                    }
                    // else mismatch = empate
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

                // Score distribution for generic multi-device mode
                const pA = room.players.find(p => p.id === round.debatienteA_Id);
                const pB = room.players.find(p => p.id === round.debatienteB_Id);

                if (pA && pB) {
                    if (winner === pA.id) {
                        pA.score += 3;
                        pA.wins += 1;
                        if (room.players.length > 2 && Object.values(round.votes).includes(pB.id)) pB.score += 1;
                    } else if (winner === pB.id) {
                        pB.score += 3;
                        pB.wins += 1;
                        if (room.players.length > 2 && Object.values(round.votes).includes(pA.id)) pA.score += 1;
                    } else { // empate
                        pA.score += 2;
                        pB.score += 2;
                    }
                }

                updateRoom(roomId, { state: "results", rounds: [...room.rounds], players: [...room.players] });
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}
