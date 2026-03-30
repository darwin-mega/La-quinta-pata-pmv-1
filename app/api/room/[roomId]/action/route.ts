import { NextResponse } from "next/server";
import {
    FallacySignal,
    Room,
    Round,
    generatePlayerId,
    mutateRoom,
    syncTimers,
} from "@/lib/store";
import { topics } from "@/data/topics";
import { hasGameEnded, isTwoPlayerRoom } from "@/lib/game";
import { readRoomSession, RoomSession } from "@/lib/session";

class ActionError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

type ActionPayload = Record<string, unknown>;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomId = params.roomId.toUpperCase();
        const session = readRoomSession(req, roomId);

        if (!session) {
            return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
        }

        const body = await req.json();
        const action = typeof body?.action === "string" ? body.action : "";
        const payload = (body?.payload ?? {}) as ActionPayload;

        if (!action) {
            return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
        }

        const result = await mutateRoom(roomId, room => {
            syncTimers(room);
            return handleAction(room, session, action, payload);
        });

        if (!result) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof ActionError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        console.error("Error in action handler:", error);
        return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
    }
}

function handleAction(room: Room, session: RoomSession, action: string, payload: ActionPayload) {
    const sessionPlayer = room.players.find(player => player.id === session.playerId) || null;
    const isHost = session.playerId === room.hostId && session.isHost;

    if (!sessionPlayer && !isHost) {
        throw new ActionError(403, "Tu sesión no corresponde a esta sala");
    }

    switch (action) {
        case "START_GAME":
            requireHost(isHost);
            if (room.state !== "lobby") {
                throw new ActionError(409, "La partida ya fue iniciada");
            }
            startNextRound(room);
            return { success: true };

        case "NEXT_ROUND":
            requireHost(isHost);
            if (room.state !== "results") {
                throw new ActionError(409, "La partida no está lista para una nueva ronda");
            }
            if (hasGameEnded(room)) {
                throw new ActionError(409, "La partida ya terminó");
            }
            startNextRound(room);
            return { success: true };

        case "START_DEBATE": {
            requireHost(isHost);
            if (room.state !== "preparation") {
                throw new ActionError(409, "La ronda no está en preparación");
            }

            const round = getCurrentRound(room);
            round.turnStartTime = Date.now();
            room.state = "debate";
            return { success: true };
        }

        case "PASS_TURN": {
            const round = getCurrentRound(room);
            ensureSpeakerControl(room, round, isHost, sessionPlayer, "speaking");
            consumeSpeakingTime(round);
            moveToNextSpeaker(round);
            return { success: true };
        }

        case "START_SPEAKING": {
            const round = getCurrentRound(room);
            ensureSpeakerControl(room, round, isHost, sessionPlayer, "transition");
            round.debateState = "speaking";
            round.turnStartTime = Date.now();
            return { success: true };
        }

        case "SURRENDER": {
            const round = getCurrentRound(room);
            if (room.state !== "debate") {
                throw new ActionError(409, "No hay debate activo");
            }

            const activeSpeakerId =
                round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;

            if (!sessionPlayer || sessionPlayer.id !== activeSpeakerId) {
                throw new ActionError(403, "Solo el debatiente activo puede rendirse");
            }

            if (round.activeSpeaker === "debatiente_a") {
                round.timeRemainingA = 0;
            } else {
                round.timeRemainingB = 0;
            }

            moveToNextSpeaker(round);
            return { success: true };
        }

        case "FINISH_DEBATE":
            requireHost(isHost);
            if (room.state !== "debate") {
                throw new ActionError(409, "No hay debate activo");
            }
            room.state = isTwoPlayerRoom(room) ? "resolution" : "voting";
            return { success: true };

        case "SIGNAL_FALLACY": {
            const round = getCurrentRound(room);
            if (room.state !== "debate" || round.debateState !== "speaking") {
                throw new ActionError(409, "Solo se pueden señalar falacias durante el debate activo");
            }

            if (room.mode !== "mesa" && room.players.length < 3) {
                throw new ActionError(409, "Se necesitan al menos 3 jugadores para arbitrar falacias");
            }

            const fallacyId = typeof payload.fallacyId === "string" ? payload.fallacyId : "";
            if (!fallacyId) {
                throw new ActionError(400, "Falta la falacia señalada");
            }

            const accusedId = round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;
            const accuserId = room.mode === "mesa"
                ? (typeof payload.accuserId === "string" ? payload.accuserId : "")
                : sessionPlayer?.id || "";

            if (!accuserId) {
                throw new ActionError(403, "No se pudo identificar quién señaló la falacia");
            }

            if (accuserId === accusedId) {
                throw new ActionError(403, "El debatiente activo no puede acusarse a sí mismo");
            }

            const accuser = room.players.find(player => player.id === accuserId);
            if (!accuser) {
                throw new ActionError(400, "El acusador no pertenece a la sala");
            }

            if (room.mode !== "mesa" && (!sessionPlayer || sessionPlayer.id !== accuserId)) {
                throw new ActionError(403, "La señalización no coincide con tu sesión");
            }

            pauseDebateClock(round);
            round.activeChallenge = {
                fallacyId,
                accuserId,
                accusedId,
                yesVotes: [],
                noVotes: []
            };
            room.state = "fallacy_review";
            return { success: true };
        }

        case "VOTE_FALLACY": {
            const round = getCurrentRound(room);
            if (room.state !== "fallacy_review" || !round.activeChallenge) {
                throw new ActionError(409, "No hay una falacia activa para resolver");
            }

            const vote = typeof payload.vote === "string" ? payload.vote : "";
            const isForceMode = vote === "force_accept" || vote === "force_reject";

            if (isForceMode) {
                requireHost(isHost);
            } else {
                if (room.mode === "mesa") {
                    throw new ActionError(403, "En modo mesa la resolución la hace el conductor");
                }

                if (!sessionPlayer) {
                    throw new ActionError(403, "Jugador no identificado");
                }

                const { accuserId, accusedId } = round.activeChallenge;
                if (sessionPlayer.id === accuserId || sessionPlayer.id === accusedId) {
                    throw new ActionError(403, "Los involucrados no pueden votar esta falacia");
                }

                if (vote !== "yes" && vote !== "no") {
                    throw new ActionError(400, "Voto de falacia inválido");
                }

                if (
                    round.activeChallenge.yesVotes.includes(sessionPlayer.id) ||
                    round.activeChallenge.noVotes.includes(sessionPlayer.id)
                ) {
                    return { success: true };
                }

                if (vote === "yes") {
                    round.activeChallenge.yesVotes.push(sessionPlayer.id);
                } else {
                    round.activeChallenge.noVotes.push(sessionPlayer.id);
                }
            }

            const expectedVotersCount = room.players.filter(player =>
                player.id !== round.activeChallenge!.accuserId &&
                player.id !== round.activeChallenge!.accusedId
            ).length;
            const totalVotes = round.activeChallenge.yesVotes.length + round.activeChallenge.noVotes.length;

            if (isForceMode || totalVotes >= expectedVotersCount) {
                resolveFallacyVote(room, round, vote);
            }

            return { success: true };
        }

        case "VOTE": {
            const round = getCurrentRound(room);
            if (room.state !== "voting") {
                throw new ActionError(409, "La sala no está en etapa de votación");
            }

            if (!sessionPlayer) {
                throw new ActionError(403, "Jugador no identificado");
            }

            if (sessionPlayer.id === round.debatienteA_Id || sessionPlayer.id === round.debatienteB_Id) {
                throw new ActionError(403, "Los debatientes no votan esta ronda");
            }

            const votedForId = typeof payload.votedForId === "string" ? payload.votedForId : "";
            const reason = typeof payload.reason === "string" ? payload.reason : "";

            if (votedForId !== round.debatienteA_Id && votedForId !== round.debatienteB_Id) {
                throw new ActionError(400, "Voto inválido");
            }

            const existingVote = round.votes[sessionPlayer.id];
            if (existingVote && existingVote !== votedForId) {
                throw new ActionError(409, "Tu voto ya fue registrado");
            }

            round.votes[sessionPlayer.id] = votedForId;
            if (reason) {
                round.secondaryVotes[sessionPlayer.id] = reason;
            }

            const totalJurado = room.players.filter(player =>
                player.id !== round.debatienteA_Id && player.id !== round.debatienteB_Id
            ).length;

            if (Object.keys(round.votes).length >= totalJurado && totalJurado > 0) {
                closeVoting(room);
            }

            return { success: true };
        }

        case "VOTE_RESOLUTION": {
            const round = getCurrentRound(room);
            if (room.state !== "resolution" || !isTwoPlayerRoom(room)) {
                throw new ActionError(409, "Esta ronda no usa resolución directa");
            }

            if (!sessionPlayer) {
                throw new ActionError(403, "Jugador no identificado");
            }

            const vote = typeof payload.vote === "string" ? payload.vote : "";
            if (!["A", "B", "empate"].includes(vote)) {
                throw new ActionError(400, "Voto de resolución inválido");
            }

            if (!round.resolutionVotes) {
                round.resolutionVotes = {};
            }

            const existingVote = round.resolutionVotes[sessionPlayer.id];
            if (existingVote && existingVote !== vote) {
                throw new ActionError(409, "Tu voto ya fue registrado");
            }

            round.resolutionVotes[sessionPlayer.id] = vote;

            if (Object.keys(round.resolutionVotes).length >= 2) {
                closeVoting(room);
            }

            return { success: true };
        }

        case "SUBMIT_MESA_VOTES": {
            requireHost(isHost);
            if (room.mode !== "mesa" || room.state !== "voting") {
                throw new ActionError(409, "La mesa no está lista para resolver votos");
            }

            const round = getCurrentRound(room);
            const votes = payload.votes as Record<string, "A" | "B" | "empate"> | undefined;
            if (!votes || typeof votes !== "object") {
                throw new ActionError(400, "No se recibieron votos de mesa");
            }

            for (const player of room.players) {
                if (!votes[player.id]) {
                    throw new ActionError(400, "Faltan votos por registrar en la mesa");
                }
            }

            let votesA = 0;
            let votesB = 0;

            Object.values(votes).forEach(vote => {
                if (vote === "A") votesA += 1;
                if (vote === "B") votesB += 1;
            });

            let fallaciesA = 0;
            let fallaciesB = 0;
            round.fallaciesSignaled.forEach(signal => {
                if (signal.accusedId === round.debatienteA_Id) fallaciesA += 1;
                if (signal.accusedId === round.debatienteB_Id) fallaciesB += 1;
            });

            const qualityA = Math.max(0, votesA - fallaciesA);
            const qualityB = Math.max(0, votesB - fallaciesB);

            const pA = room.players.find(player => player.id === round.debatienteA_Id);
            const pB = room.players.find(player => player.id === round.debatienteB_Id);

            const WIN_BONUS = 3;
            const TIE_BONUS = 1;

            if (qualityA > qualityB) {
                round.winnerId = round.debatienteA_Id;
                if (pA) {
                    pA.wins += 1;
                    pA.score += WIN_BONUS;
                }
            } else if (qualityB > qualityA) {
                round.winnerId = round.debatienteB_Id;
                if (pB) {
                    pB.wins += 1;
                    pB.score += WIN_BONUS;
                }
            } else {
                round.winnerId = "empate";
                if (pA) pA.score += TIE_BONUS;
                if (pB) pB.score += TIE_BONUS;
            }

            round.resolutionVotes = votes as Record<string, string>;
            room.state = "resolution";
            return { success: true, qualityA, qualityB };
        }

        case "SHOW_LEADERBOARD":
            requireHost(isHost);
            if (room.mode !== "mesa" || room.state !== "resolution") {
                throw new ActionError(409, "La tabla no está disponible todavía");
            }
            room.state = "results";
            return { success: true };

        case "CLOSE_VOTING":
            requireHost(isHost);
            if (room.state !== "voting" && room.state !== "resolution") {
                throw new ActionError(409, "No hay votación para cerrar");
            }
            if (room.state === "resolution") {
                const round = getCurrentRound(room);
                const totalResolutionVotes = Object.keys(round.resolutionVotes || {}).length;
                if (isTwoPlayerRoom(room) && totalResolutionVotes < 2) {
                    throw new ActionError(409, "Aún faltan votos de resolución");
                }
            }
            closeVoting(room);
            return { success: true };

        default:
            throw new ActionError(400, "Acción no válida");
    }
}

function requireHost(isHost: boolean) {
    if (!isHost) {
        throw new ActionError(403, "Solo el host puede realizar esta acción");
    }
}

function getCurrentRound(room: Room) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) {
        throw new ActionError(409, "No hay una ronda activa");
    }
    return round;
}

function ensureSpeakerControl(
    room: Room,
    round: Round,
    isHost: boolean,
    sessionPlayer: Room["players"][number] | null,
    expectedState: Round["debateState"]
) {
    if (room.state !== "debate" || round.debateState !== expectedState) {
        throw new ActionError(409, "La ronda no está en el estado esperado");
    }

    if (room.mode === "mesa") {
        requireHost(isHost);
        return;
    }

    const activeSpeakerId =
        round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;

    if (!sessionPlayer || sessionPlayer.id !== activeSpeakerId) {
        throw new ActionError(403, "Solo el debatiente activo puede controlar este turno");
    }
}

function startNextRound(room: Room) {
    if (room.players.length < 2) {
        throw new ActionError(400, "Se necesitan al menos 2 jugadores");
    }

    let availableTopics = topics.filter(topic =>
        topic.intensity === room.intensity && !room.usedTopics.includes(topic.id)
    );

    if (availableTopics.length === 0) {
        availableTopics = topics.filter(topic => topic.intensity === room.intensity);
        room.usedTopics = [];
    }

    const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
    if (!randomTopic) {
        throw new ActionError(500, "No hay temas disponibles para esta intensidad");
    }

    room.usedTopics.push(randomTopic.id);

    let debA = room.players[0];
    let debB = room.players[1];

    if (room.mode === "mesa" && room.rounds.length > 0) {
        const lastRound = room.rounds[room.rounds.length - 1];
        const availableForDebate = room.players.filter(player =>
            player.id !== lastRound.debatienteA_Id && player.id !== lastRound.debatienteB_Id
        );

        if (availableForDebate.length >= 2) {
            const shuffledAvailable = [...availableForDebate].sort(() => 0.5 - Math.random());
            debA = shuffledAvailable[0];
            debB = shuffledAvailable[1];
        } else if (availableForDebate.length === 1) {
            debA = availableForDebate[0];
            const others = room.players.filter(player => player.id !== debA.id);
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

    room.players = room.players.map(player => {
        let role: "jurado" | "debatiente_a" | "debatiente_b" | "host" = "jurado";

        if (player.id === debA.id) role = "debatiente_a";
        else if (player.id === debB.id) role = "debatiente_b";
        else if (player.id === room.hostId) role = "host";

        return { ...player, role };
    });

    const timeSecs = room.duration === "corta" ? 120 : 180;

    room.rounds.push({
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
    });

    room.currentRoundIndex += 1;
    room.state = "preparation";
}

function consumeSpeakingTime(round: Round) {
    if (!round.turnStartTime || round.debateState !== "speaking") return;

    const elapsed = Math.floor((Date.now() - round.turnStartTime) / 1000);
    if (round.activeSpeaker === "debatiente_a") {
        round.timeRemainingA = Math.max(0, round.timeRemainingA - elapsed);
    } else {
        round.timeRemainingB = Math.max(0, round.timeRemainingB - elapsed);
    }
}

function pauseDebateClock(round: Round) {
    if (!round.turnStartTime) return;

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

function moveToNextSpeaker(round: Round) {
    if (round.activeSpeaker === "debatiente_a") {
        if (round.timeRemainingB > 0) {
            round.activeSpeaker = "debatiente_b";
            round.debateState = "transition";
            round.transitionRemaining = 10;
            round.turnStartTime = Date.now();
        } else {
            round.debateState = "finished";
            round.turnStartTime = null;
        }
        return;
    }

    if (round.timeRemainingA > 0) {
        round.activeSpeaker = "debatiente_a";
        round.debateState = "transition";
        round.transitionRemaining = 10;
        round.turnStartTime = Date.now();
    } else {
        round.debateState = "finished";
        round.turnStartTime = null;
    }
}

function resolveFallacyVote(room: Room, round: Round, vote: string) {
    const challenge = round.activeChallenge;
    if (!challenge) {
        throw new ActionError(409, "No hay desafío de falacia activo");
    }

    const shouldAccept = vote === "force_accept"
        ? true
        : vote === "force_reject"
            ? false
            : challenge.yesVotes.length >= challenge.noVotes.length;
    const accuserIndex = room.players.findIndex(player => player.id === challenge.accuserId);
    const accusedIndex = room.players.findIndex(player => player.id === challenge.accusedId);

    if (shouldAccept) {
        const MAX_PUNTUABLE_FALLACIES = 3;
        const previouslyScored = round.fallaciesSignaled.length;

        if (previouslyScored < MAX_PUNTUABLE_FALLACIES) {
            if (accuserIndex !== -1) room.players[accuserIndex].score += 1;
            if (accusedIndex !== -1) {
                room.players[accusedIndex].score = Math.max(0, room.players[accusedIndex].score - 1);
            }
        }

        const signal: FallacySignal = {
            id: generatePlayerId(),
            signaledBy: challenge.accuserId,
            accusedId: challenge.accusedId,
            fallacyId: challenge.fallacyId,
            roundNumber: round.number,
            timestamp: Date.now()
        };
        round.fallaciesSignaled.push(signal);
    } else if (room.mode !== "mesa" && accuserIndex !== -1) {
        room.players[accuserIndex].score = Math.max(0, room.players[accuserIndex].score - 1);
    }

    round.activeChallenge = null;
    round.turnStartTime = Date.now();
    room.state = "debate";
}

function closeVoting(room: Room) {
    const round = getCurrentRound(room);
    let winner = "empate";

    if (isTwoPlayerRoom(room)) {
        const votes = Object.values(round.resolutionVotes || {});
        if (votes.length === 2 && votes[0] === votes[1]) {
            if (votes[0] === "A") winner = round.debatienteA_Id;
            if (votes[0] === "B") winner = round.debatienteB_Id;
        }
    } else {
        let votesA = 0;
        let votesB = 0;

        Object.values(round.votes).forEach(voteId => {
            if (voteId === round.debatienteA_Id) votesA += 1;
            if (voteId === round.debatienteB_Id) votesB += 1;
        });

        if (votesA > votesB) winner = round.debatienteA_Id;
        if (votesB > votesA) winner = round.debatienteB_Id;
    }

    round.winnerId = winner;

    const pA = room.players.find(player => player.id === round.debatienteA_Id);
    const pB = room.players.find(player => player.id === round.debatienteB_Id);

    if (pA && pB) {
        if (winner === pA.id) {
            pA.score += 5;
            pA.wins += 1;
        } else if (winner === pB.id) {
            pB.score += 5;
            pB.wins += 1;
        } else {
            pA.score += 2;
            pB.score += 2;
        }
    }

    room.state = "results";
}
