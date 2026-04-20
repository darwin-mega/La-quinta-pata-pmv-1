import { NextResponse } from "next/server";
import { GameDuration, GameIntensity, TopicSelectionMode, createRoom, generatePlayerId, Room } from "@/lib/store";
import { setRoomSessionCookie } from "@/lib/session";
import { buildTopicConfigFromGameIntensity, normalizeTopicConfigInput, validateTopicConfig } from "@/lib/topic-engine";
import { MAX_HOST_NAME_LENGTH, MAX_PLAYER_NAME_LENGTH, MAX_ROOM_NAME_LENGTH } from "@/lib/topic-types";

const VALID_DURATIONS = new Set(["corta", "larga", "leyenda"]);
const VALID_MODES = new Set(["multiplayer", "individual", "mesa"]);
const VALID_INTENSITIES = new Set(["liviano", "medio", "filoso"]);
const VALID_TOPIC_SELECTION_MODES = new Set(["automatic", "manual"]);
const MIN_MESA_PLAYERS = 3;
const MAX_MESA_PLAYERS = 12;
const DEFAULT_HOST_NAME = "Anfitrion";

const getDefaultRoomName = (mode: Room["mode"]) => {
    return mode === "mesa" ? "Mesa rapida" : "Partida rapida";
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            duration,
            hostName,
            intensity,
            topicSelectionMode,
            mode = "multiplayer",
            playerCount,
            playerNames = [],
            topicConfig,
        } = body;

        const requestedMode = typeof mode === "string" ? mode : "multiplayer";
        const normalizedMode = requestedMode === "individual" ? "multiplayer" : requestedMode;
        const validatedMode = normalizedMode as Room["mode"];

        const normalizedDuration = typeof duration === "string" ? duration : "";
        const normalizedIntensity = VALID_INTENSITIES.has(intensity)
            ? intensity as GameIntensity
            : "medio";
        const normalizedTopicSelectionMode = VALID_TOPIC_SELECTION_MODES.has(topicSelectionMode)
            ? topicSelectionMode as TopicSelectionMode
            : "automatic";

        const requestedRoomName = typeof name === "string" ? name.trim() : "";
        const normalizedRoomName = requestedRoomName || getDefaultRoomName(validatedMode);
        const requestedHostName = typeof hostName === "string" ? hostName.trim() : "";
        const normalizedHostName = requestedHostName || DEFAULT_HOST_NAME;

        const normalizedPlayerNames = Array.isArray(playerNames)
            ? playerNames
                .map((playerName: unknown) => typeof playerName === "string" ? playerName.trim() : "")
                .filter(Boolean)
            : [];
        const normalizedPlayerCount = typeof playerCount === "number" && Number.isInteger(playerCount)
            ? playerCount
            : normalizedPlayerNames.length;

        const derivedTopicConfig = normalizeTopicConfigInput(
            topicConfig === undefined
                ? buildTopicConfigFromGameIntensity(normalizedIntensity)
                : topicConfig
        );
        const topicValidation = validateTopicConfig(derivedTopicConfig);

        if (!normalizedDuration) {
            return NextResponse.json({ error: "Faltan datos requeridos para crear la sala." }, { status: 400 });
        }

        if (normalizedRoomName.length > MAX_ROOM_NAME_LENGTH) {
            return NextResponse.json({ error: `El nombre de la sala puede tener hasta ${MAX_ROOM_NAME_LENGTH} caracteres.` }, { status: 400 });
        }

        if (!VALID_DURATIONS.has(normalizedDuration) || !VALID_MODES.has(requestedMode)) {
            return NextResponse.json({ error: "La configuracion general de la sala no es valida." }, { status: 400 });
        }

        if (!topicValidation.isValid) {
            return NextResponse.json({ error: topicValidation.errors[0] }, { status: 400 });
        }

        if (validatedMode === "multiplayer" && normalizedHostName.length > MAX_HOST_NAME_LENGTH) {
            return NextResponse.json({ error: `El nombre del host puede tener hasta ${MAX_HOST_NAME_LENGTH} caracteres.` }, { status: 400 });
        }

        if (validatedMode === "mesa" && normalizedPlayerCount < MIN_MESA_PLAYERS) {
            return NextResponse.json({ error: `Se necesitan al menos ${MIN_MESA_PLAYERS} jugadores para el modo mesa.` }, { status: 400 });
        }

        if (validatedMode === "mesa" && normalizedPlayerCount > MAX_MESA_PLAYERS) {
            return NextResponse.json({ error: `El modo mesa admite hasta ${MAX_MESA_PLAYERS} jugadores.` }, { status: 400 });
        }

        if (validatedMode === "mesa" && normalizedPlayerNames.some(playerName => playerName.length > MAX_PLAYER_NAME_LENGTH)) {
            return NextResponse.json({ error: `Cada jugador puede tener hasta ${MAX_PLAYER_NAME_LENGTH} caracteres en su nombre.` }, { status: 400 });
        }

        const finalMesaPlayerNames = validatedMode === "mesa"
            ? Array.from({ length: normalizedPlayerCount }, (_, index) => {
                const submittedName = Array.isArray(playerNames) && typeof playerNames[index] === "string"
                    ? playerNames[index].trim()
                    : "";

                return submittedName || `Jugador ${index + 1}`;
            })
            : [];

        if (validatedMode === "mesa" && finalMesaPlayerNames.some(playerName => playerName.length > MAX_PLAYER_NAME_LENGTH)) {
            return NextResponse.json({ error: `Cada jugador puede tener hasta ${MAX_PLAYER_NAME_LENGTH} caracteres en su nombre.` }, { status: 400 });
        }

        if (validatedMode === "mesa") {
            const uniqueNames = new Set(finalMesaPlayerNames.map(playerName => playerName.toLowerCase()));
            if (uniqueNames.size !== finalMesaPlayerNames.length) {
                return NextResponse.json({ error: "No puede haber nombres repetidos en la mesa." }, { status: 400 });
            }
        }

        const validatedDuration = normalizedDuration as GameDuration;
        const hostId = generatePlayerId();

        const initialPlayers = validatedMode === "mesa"
            ? finalMesaPlayerNames.map(playerName => ({
                id: generatePlayerId(),
                name: playerName,
                role: "jurado" as const,
                isHost: false,
                score: 0,
                wins: 0,
            }))
            : [{
                id: hostId,
                name: normalizedHostName,
                role: "jurado" as const,
                isHost: true,
                score: 0,
                wins: 0,
            }];

        const newRoomData: Omit<Room, "id" | "createdAt"> = {
            mode: validatedMode,
            name: normalizedRoomName,
            intensity: normalizedIntensity,
            duration: validatedDuration,
            topicConfig: derivedTopicConfig,
            topicSelectionMode: normalizedTopicSelectionMode,
            playerCount: validatedMode === "mesa" ? finalMesaPlayerNames.length : undefined,
            state: "lobby",
            hostId,
            players: initialPlayers,
            rounds: [],
            currentRoundIndex: -1,
            usedTopics: [],
            savedTopics: [],
        };

        const room = await createRoom(newRoomData);
        const response = NextResponse.json({ room, playerId: hostId });
        setRoomSessionCookie(response, room.id, hostId, true);
        return response;
    } catch {
        return NextResponse.json({ error: "Error al crear la sala." }, { status: 500 });
    }
}
