import { Redis } from "@upstash/redis";

export type GameIntensity = "liviano" | "medio" | "filoso";
export type GameDuration = "corta" | "larga" | "leyenda";
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
    id: string;
    signaledBy: string;
    accusedId: string;
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
    name: string;
    speakerRole: Role;
    durationSec: number;
};

export type DebateState = "transition" | "speaking" | "finished";

export type Round = {
    number: number;
    topicId: string;
    debatienteA_Id: string;
    debatienteB_Id: string;
    timeRemainingA: number;
    timeRemainingB: number;
    debateState: DebateState;
    activeSpeaker: "debatiente_a" | "debatiente_b";
    transitionRemaining: number;
    turnStartTime: number | null;
    votes: Record<string, string>;
    secondaryVotes: Record<string, string>;
    resolutionVotes?: Record<string, string>;
    fallaciesSignaled: FallacySignal[];
    activeChallenge?: FallacyChallenge | null;
    winnerId: string | null;
};

export type Room = {
    id: string;
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

// ─── Detectar si estamos en producción con Redis disponible ───
const isRedisAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let redis: Redis | null = null;
if (isRedisAvailable) {
    redis = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
    });
}

// ─── Fallback: memoria local para desarrollo ───
const globalStore = global as unknown as { rooms: Record<string, Room> };
if (!globalStore.rooms) {
    globalStore.rooms = {};
}

// ─── Prefijo para las claves en Redis ───
const ROOM_KEY = (id: string) => `room:${id.toUpperCase()}`;
const ROOM_TTL = 60 * 60 * 4; // 4 horas en segundos => Las salas expiran automáticamente

// ─── Funciones CRUD (funcionan tanto en local como en producción) ───

export const getRoom = async (id: string): Promise<Room | undefined> => {
    const key = id.toUpperCase();
    if (redis) {
        const data = await redis.get<Room>(ROOM_KEY(key));
        return data ?? undefined;
    }
    return globalStore.rooms[key];
};

export const getRooms = async (): Promise<Record<string, Room>> => {
    // En Redis no listamos todas las salas (no es necesario para el juego).
    // Solo se usa en desarrollo.
    return globalStore.rooms;
};

export const createRoom = async (roomData: Omit<Room, "id" | "createdAt">): Promise<Room> => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Verificar que no exista
    const existing = await getRoom(id);
    if (existing) {
        return createRoom(roomData);
    }

    const room: Room = {
        ...roomData,
        id,
        createdAt: Date.now()
    };

    if (redis) {
        await redis.set(ROOM_KEY(id), JSON.stringify(room), { ex: ROOM_TTL });
    } else {
        globalStore.rooms[id] = room;
    }

    return room;
};

export const saveRoom = async (room: Room): Promise<void> => {
    if (redis) {
        await redis.set(ROOM_KEY(room.id), JSON.stringify(room), { ex: ROOM_TTL });
    } else {
        globalStore.rooms[room.id] = room;
    }
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<void> => {
    const room = await getRoom(id);
    if (room) {
        const updated = { ...room, ...updates };
        await saveRoom(updated);
    }
};

export const generatePlayerId = () => {
    return Math.random().toString(36).substring(2, 9);
};

export const syncTimers = (room: Room) => {
    if (room.state !== "debate" || room.currentRoundIndex < 0 || !room.rounds[room.currentRoundIndex]) return room;
    const round = room.rounds[room.currentRoundIndex];
    if (round.debateState === "finished" || !round.turnStartTime) return room;

    const now = Date.now();
    let elapsedSec = Math.floor((now - round.turnStartTime) / 1000);

    if (round.debateState === "transition") {
        if (elapsedSec >= round.transitionRemaining) {
            round.debateState = "speaking";
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
