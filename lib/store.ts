export type GameIntensity = "liviano" | "medio" | "filoso";
export type GameDuration = "corta" | "larga";
export type GameState = "lobby" | "preparation" | "debate" | "fallacy_review" | "voting" | "resolution" | "results" | "finished";
export type Role = "host" | "debatiente_a" | "debatiente_b" | "jurado";

export type Player = {
    id: string;
    name: string;
    role: Role;
    isHost: boolean;
    score: number;
    wins: number;
};

export type FallacySignal = {
    id: string; // unique ID for the signal
    signaledBy: string; // playerName or playerId
    accusedId: string; // playerId of the speaker who committed it
    fallacyId: string;
    roundNumber: number;
    timestamp: number;
};

export type FallacyChallenge = {
    fallacyId: string;
    accuserId: string;
    accusedId: string;
    yesVotes: string[];
    noVotes: string[];
};

export type TurnPhase = {
    id: string;
    name: string;      // e.g. "Apertura A"
    speakerRole: Role; // who speaks
    durationSec: number; // planned duration
};

export type DebateState = "transition" | "speaking" | "finished";

export type Round = {
    number: number;
    topicId: string;
    debatienteA_Id: string;
    debatienteB_Id: string;

    // CHESS CLOCK STATE
    timeRemainingA: number;
    timeRemainingB: number;
    debateState: DebateState;
    activeSpeaker: "debatiente_a" | "debatiente_b";
    transitionRemaining: number;

    turnStartTime: number | null;
    votes: Record<string, string>; // VoterId -> Debatiente_Id
    secondaryVotes: Record<string, string>; // VoterId -> reason
    resolutionVotes?: Record<string, string>; // PlayerId -> "A" | "B" | "empate"
    fallaciesSignaled: FallacySignal[];
    activeChallenge?: FallacyChallenge | null;
    winnerId: string | null;
};

export type Room = {
    id: string;
    /**
     * Define el estilo arquitectónico de la sala:
     * - "multiplayer" (o Varios dispositivos): Cada jugador ingresa desde su propio dispositivo usando un código/QR. 
     *   Tienen vistas privadas y votan individualmente.
     * - "mesa": Se usa un único dispositivo como tablero central. La sala se pre-carga con todos los jugadores 
     *   desde el principio, no requiere QR ni código para unirse, y toda la información es pública en la misma pantalla.
     */
    mode: "multiplayer" | "mesa";
    name: string;
    intensity: GameIntensity;
    duration: GameDuration;
    state: GameState;
    hostId: string;
    players: Player[];
    rounds: Round[];
    currentRoundIndex: number;
    usedTopics: string[];
    createdAt: number;
};

// Global store to prevent data loss on hot reload during development
const globalStore = global as unknown as {
    rooms: Record<string, Room>;
};

if (!globalStore.rooms) {
    globalStore.rooms = {};
}

export const getRooms = () => globalStore.rooms;

export const getRoom = (id: string): Room | undefined => {
    return globalStore.rooms[id.toUpperCase()];
};

export const createRoom = (roomData: Omit<Room, "id" | "createdAt">): Room => {
    // Generate random 4 letter code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure unique
    if (globalStore.rooms[id]) {
        return createRoom(roomData);
    }

    const room: Room = {
        ...roomData,
        id,
        createdAt: Date.now()
    };

    globalStore.rooms[id] = room;
    return room;
};

export const updateRoom = (id: string, updates: Partial<Room>) => {
    const room = getRoom(id);
    if (room) {
        globalStore.rooms[room.id] = { ...room, ...updates };
    }
};

export const generatePlayerId = () => {
    return Math.random().toString(36).substring(2, 9);
};

export const syncTimers = (room: Room) => {
    if (room.state !== "debate" || room.currentRoundIndex < 0 || !room.rounds[room.currentRoundIndex]) return room;
    const round = room.rounds[room.currentRoundIndex];
    if (round.debateState === "finished" || !round.turnStartTime) return room;

    // Avoid updating multiple times exactly the same millisecond timestamp logic, keep it purely dynamic
    const now = Date.now();
    let elapsedSec = Math.floor((now - round.turnStartTime) / 1000);

    if (round.debateState === "transition") {
        if (elapsedSec >= round.transitionRemaining) {
            // Se le acabó la transición, empieza automáticamente a contar su tiempo principal
            round.debateState = "speaking";
            // Ajustamos el turnStartTime como si hubiese empezado justo cuando acabó la transición
            round.turnStartTime = round.turnStartTime + (round.transitionRemaining * 1000);
            elapsedSec = Math.floor((Date.now() - round.turnStartTime) / 1000);
        }
    }

    if (round.debateState === "speaking") {
        if (round.activeSpeaker === "debatiente_a") {
            if (elapsedSec >= round.timeRemainingA) {
                round.timeRemainingA = 0;
                if (round.timeRemainingB > 0) {
                    round.activeSpeaker = "debatiente_b";
                    round.debateState = "transition";
                    round.transitionRemaining = 10;
                    round.turnStartTime = Date.now();
                } else {
                    round.debateState = "finished";
                }
            }
        } else {
            if (elapsedSec >= round.timeRemainingB) {
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
    }

    return room;
};
