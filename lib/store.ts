import { Redis } from "@upstash/redis";
import { topics as systemTopics } from "@/data/topics";
import { deriveLegacyGameIntensity, normalizeTopicConfigInput } from "@/lib/topic-engine";
import { DebateTopic, RoomTopicConfig, SavedTopic } from "@/lib/topic-types";

export type GameIntensity = "liviano" | "medio" | "filoso";
export type GameDuration = "corta" | "larga" | "leyenda";
export type GameState =
    | "lobby"
    | "topic_selection"
    | "preparation"
    | "debate"
    | "fallacy_review"
    | "voting"
    | "resolution"
    | "results"
    | "finished";
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
export type RoundTopicMode = "random" | "custom" | "saved";

export type Round = {
    number: number;
    topicId: string;
    topic: DebateTopic | null;
    roundTopic: RoundTopicMode | null;
    selectedTopic: string | null;
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
    topicConfig: RoomTopicConfig;
    playerCount?: number;
    state: GameState;
    hostId: string;
    players: Player[];
    rounds: Round[];
    currentRoundIndex: number;
    usedTopics: string[];
    savedTopics: SavedTopic[];
    createdAt: number;
};

type MaybePromise<T> = T | Promise<T>;

const buildFallbackTopic = (topicId: string): DebateTopic => ({
    id: topicId,
    text: "Tema no disponible",
    statement: "Tema no disponible",
    category: "sociedad",
    categoryLabel: "Sociedad",
    intensity: "media",
    source: "system",
    context: "Este tema proviene de una ronda anterior y no pudo reconstruirse desde el catálogo actual.",
    angleA: "Defiende la tesis principal con la mejor reconstrucción posible.",
    angleB: "Cuestiona la tesis principal con la mejor reconstrucción posible.",
    prompts: [],
    enabled: true,
});

const hydrateRoom = (room: Room): Room => {
    const normalizedTopicConfig = normalizeTopicConfigInput((room as Partial<Room>).topicConfig);
    const normalizedRounds = Array.isArray(room.rounds)
        ? room.rounds.map(round => {
            const roundTopicId = typeof round.topicId === "string" ? round.topicId : "";
            const hasTopic = !!(round.topic || roundTopicId);
            const fallbackTopic = roundTopicId
                ? systemTopics.find(topic => topic.id === roundTopicId) || buildFallbackTopic(roundTopicId)
                : null;

            return {
                ...round,
                topicId: round.topic?.id || roundTopicId,
                topic: round.topic || fallbackTopic,
                roundTopic: round.roundTopic || (hasTopic ? "random" : null),
                selectedTopic: typeof round.selectedTopic === "string"
                    ? round.selectedTopic
                    : (round.topic?.id || roundTopicId || null),
            };
        })
        : [];
    const normalizedSavedTopics = Array.isArray(room.savedTopics)
        ? room.savedTopics
            .filter(topic => topic && typeof topic === "object" && typeof topic.id === "string" && typeof topic.text === "string")
            .map(topic => ({
                ...topic,
                text: topic.text.trim(),
                createdAt: typeof topic.createdAt === "number" ? topic.createdAt : Date.now(),
                source: topic.source || "user",
            }))
            .filter(topic => topic.text.length > 0)
        : [];

    return {
        ...room,
        topicConfig: normalizedTopicConfig,
        intensity: room.intensity || deriveLegacyGameIntensity(normalizedTopicConfig),
        playerCount: room.mode === "mesa"
            ? (typeof room.playerCount === "number" && room.playerCount > 0 ? room.playerCount : room.players.length)
            : undefined,
        rounds: normalizedRounds,
        usedTopics: Array.isArray(room.usedTopics) ? room.usedTopics : [],
        savedTopics: normalizedSavedTopics,
    };
};

const KV_REST_API_URL =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_URL;
const KV_REST_API_TOKEN =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisAvailable = !!(KV_REST_API_URL && KV_REST_API_TOKEN);

let redis: Redis | null = null;
if (isRedisAvailable) {
    redis = new Redis({
        url: KV_REST_API_URL!,
        token: KV_REST_API_TOKEN!,
    });
    console.log("[Store] Persistence: REDIS active");
} else {
    console.warn("[Store] Persistence: RAM fallback active (Sessions will be lost on Vercel)");
}

export const getPersistenceStatus = () => (isRedisAvailable ? "redis" : "memory");

const globalStore = global as unknown as {
    rooms: Record<string, Room>;
    roomQueues: Map<string, Promise<unknown>>;
};

if (!globalStore.rooms) {
    globalStore.rooms = {};
}

if (!globalStore.roomQueues) {
    globalStore.roomQueues = new Map();
}

const ROOM_KEY = (id: string) => `lqp:${id.toUpperCase()}`;
const ROOM_LOCK_KEY = (id: string) => `lqp:lock:${id.toUpperCase()}`;
const ROOM_TTL = 60 * 60 * 4;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withQueuedRoomOperation = async <T>(id: string, task: () => Promise<T>) => {
    const key = id.toUpperCase();
    const previous = globalStore.roomQueues.get(key) || Promise.resolve();
    const current = previous
        .catch(() => undefined)
        .then(task);

    globalStore.roomQueues.set(key, current.then(() => undefined, () => undefined));
    return current;
};

const acquireRedisRoomLock = async (id: string) => {
    if (!redis) return null;

    const key = id.toUpperCase();
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    for (let attempt = 0; attempt < 40; attempt++) {
        const acquired = await redis.set(ROOM_LOCK_KEY(key), token, { nx: true, ex: 5 });
        if (acquired) return token;
        await sleep(50);
    }

    throw new Error(`No se pudo adquirir el lock de la sala ${key}`);
};

const releaseRedisRoomLock = async (id: string, token: string | null) => {
    if (!redis || !token) return;

    const key = id.toUpperCase();

    try {
        const currentToken = await redis.get<string>(ROOM_LOCK_KEY(key));
        if (currentToken === token) {
            await redis.del(ROOM_LOCK_KEY(key));
        }
    } catch (err) {
        console.error("[Redis] releaseRoomLock error:", err);
    }
};

export const getRoom = async (id: string): Promise<Room | undefined> => {
    const key = id.toUpperCase();

    if (redis) {
        try {
            const data = await redis.get<Room>(ROOM_KEY(key));
            if (data) {
                const normalizedRoom = hydrateRoom(data);
                globalStore.rooms[key] = normalizedRoom;
                return normalizedRoom;
            }
            return undefined;
        } catch (err) {
            console.error("[Redis] getRoom error, using memory fallback:", err);
            return globalStore.rooms[key] ? hydrateRoom(globalStore.rooms[key]) : undefined;
        }
    }

    return globalStore.rooms[key] ? hydrateRoom(globalStore.rooms[key]) : undefined;
};

export const getRooms = async (): Promise<Record<string, Room>> => {
    return globalStore.rooms;
};

export const saveRoom = async (room: Room): Promise<void> => {
    const normalizedRoom = hydrateRoom({ ...room, id: room.id.toUpperCase() });

    globalStore.rooms[normalizedRoom.id] = normalizedRoom;

    if (redis) {
        try {
            await redis.set(ROOM_KEY(normalizedRoom.id), JSON.stringify(normalizedRoom), { ex: ROOM_TTL });
        } catch (err) {
            console.error("[Redis] saveRoom error:", err);
        }
    }
};

export const createRoom = async (roomData: Omit<Room, "id" | "createdAt">): Promise<Room> => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";

    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existing = await getRoom(id);
    if (existing) {
        return createRoom(roomData);
    }

    const room: Room = {
        ...roomData,
        id,
        createdAt: Date.now(),
    };

    await saveRoom(room);
    return room;
};

export const mutateRoom = async <T>(id: string, mutator: (room: Room) => MaybePromise<T>): Promise<T | undefined> => {
    return withQueuedRoomOperation(id, async () => {
        const lockToken = await acquireRedisRoomLock(id);

        try {
            const room = await getRoom(id);
            if (!room) return undefined;

            const result = await mutator(room);
            await saveRoom(room);
            return result;
        } finally {
            await releaseRedisRoomLock(id, lockToken);
        }
    });
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<void> => {
    await mutateRoom(id, room => {
        Object.assign(room, updates);
    });
};

export const generatePlayerId = () => {
    return Math.random().toString(36).substring(2, 9);
};

export const syncTimers = (room: Room) => {
    if (room.state !== "debate" || room.currentRoundIndex < 0 || !room.rounds[room.currentRoundIndex]) {
        return room;
    }

    const round = room.rounds[room.currentRoundIndex];
    if (round.debateState === "finished" || !round.turnStartTime) {
        return room;
    }

    const now = Date.now();
    let elapsedSec = Math.floor((now - round.turnStartTime) / 1000);

    if (round.debateState === "transition" && elapsedSec >= round.transitionRemaining) {
        round.debateState = "speaking";
        round.turnStartTime = round.turnStartTime + (round.transitionRemaining * 1000);
        elapsedSec = Math.floor((Date.now() - round.turnStartTime) / 1000);
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
        } else if (elapsedSec >= round.timeRemainingB) {
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

    return room;
};
