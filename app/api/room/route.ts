import { NextResponse } from "next/server";
import { GameDuration, createRoom, generatePlayerId, Room } from "@/lib/store";
import { setRoomSessionCookie } from "@/lib/session";
import { deriveLegacyGameIntensity, normalizeTopicConfigInput, validateTopicConfig } from "@/lib/topic-engine";
import { MAX_HOST_NAME_LENGTH, MAX_PLAYER_NAME_LENGTH, MAX_ROOM_NAME_LENGTH } from "@/lib/topic-types";

const VALID_DURATIONS = new Set(["corta", "larga", "leyenda"]);
const VALID_MODES = new Set(["multiplayer", "mesa"]);
const MAX_MESA_PLAYERS = 10;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, duration, hostName, mode = "multiplayer", playerNames = [], topicConfig } = body;

        const normalizedMode = typeof mode === "string" ? mode : "multiplayer";
        const normalizedRoomName = typeof name === "string" ? name.trim() : "";
        const normalizedHostName = typeof hostName === "string" ? hostName.trim() : "";
        const normalizedPlayerNames = Array.isArray(playerNames)
            ? playerNames
                .map((playerName: unknown) => typeof playerName === "string" ? playerName.trim() : "")
                .filter(Boolean)
            : [];
        const normalizedTopicConfig = normalizeTopicConfigInput(topicConfig);
        const topicValidation = validateTopicConfig(normalizedTopicConfig);

        if (!normalizedRoomName || !duration) {
            return NextResponse.json({ error: "Faltan datos requeridos para crear la sala." }, { status: 400 });
        }

        if (normalizedRoomName.length > MAX_ROOM_NAME_LENGTH) {
            return NextResponse.json({ error: `El nombre de la sala puede tener hasta ${MAX_ROOM_NAME_LENGTH} caracteres.` }, { status: 400 });
        }

        if (!VALID_DURATIONS.has(duration) || !VALID_MODES.has(normalizedMode)) {
            return NextResponse.json({ error: "La configuración general de la sala no es válida." }, { status: 400 });
        }

        if (!topicValidation.isValid) {
            return NextResponse.json({ error: topicValidation.errors[0] }, { status: 400 });
        }

        if (normalizedMode === "multiplayer" && !normalizedHostName) {
            return NextResponse.json({ error: "Falta el nombre del host." }, { status: 400 });
        }

        if (normalizedMode === "multiplayer" && normalizedHostName.length > MAX_HOST_NAME_LENGTH) {
            return NextResponse.json({ error: `El nombre del host puede tener hasta ${MAX_HOST_NAME_LENGTH} caracteres.` }, { status: 400 });
        }

        if (normalizedMode === "mesa" && normalizedPlayerNames.length < 4) {
            return NextResponse.json({ error: "Se necesitan al menos 4 jugadores para el modo mesa." }, { status: 400 });
        }

        if (normalizedMode === "mesa" && normalizedPlayerNames.length > MAX_MESA_PLAYERS) {
            return NextResponse.json({ error: `El modo mesa admite hasta ${MAX_MESA_PLAYERS} jugadores.` }, { status: 400 });
        }

        if (normalizedMode === "mesa" && normalizedPlayerNames.some(playerName => playerName.length > MAX_PLAYER_NAME_LENGTH)) {
            return NextResponse.json({ error: `Cada jugador puede tener hasta ${MAX_PLAYER_NAME_LENGTH} caracteres en su nombre.` }, { status: 400 });
        }

        if (normalizedMode === "mesa") {
            const uniqueNames = new Set(normalizedPlayerNames.map(playerName => playerName.toLowerCase()));
            if (uniqueNames.size !== normalizedPlayerNames.length) {
                return NextResponse.json({ error: "No puede haber nombres repetidos en la mesa." }, { status: 400 });
            }
        }

        const validatedMode = normalizedMode as Room["mode"];
        const validatedDuration = duration as GameDuration;
        const hostId = generatePlayerId();

        const initialPlayers = validatedMode === "mesa"
            ? normalizedPlayerNames.map(playerName => ({
                id: generatePlayerId(),
                name: playerName,
                role: "jurado" as const,
                isHost: false,
                score: 0,
                wins: 0
            }))
            : [{
                id: hostId,
                name: normalizedHostName,
                role: "jurado" as const,
                isHost: true,
                score: 0,
                wins: 0
            }];

        const newRoomData: Omit<Room, "id" | "createdAt"> = {
            mode: validatedMode,
            name: normalizedRoomName,
            intensity: deriveLegacyGameIntensity(normalizedTopicConfig),
            duration: validatedDuration,
            topicConfig: normalizedTopicConfig,
            state: "lobby",
            hostId,
            players: initialPlayers,
            rounds: [],
            currentRoundIndex: -1,
            usedTopics: []
        };

        const room = await createRoom(newRoomData);
        const response = NextResponse.json({ room, playerId: hostId });
        setRoomSessionCookie(response, room.id, hostId, true);
        return response;
    } catch {
        return NextResponse.json({ error: "Error al crear la sala." }, { status: 500 });
    }
}
