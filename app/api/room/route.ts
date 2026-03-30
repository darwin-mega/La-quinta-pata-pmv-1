import { NextResponse } from "next/server";
import { GameDuration, GameIntensity, createRoom, generatePlayerId, Room } from "@/lib/store";
import { setRoomSessionCookie } from "@/lib/session";

const VALID_INTENSITIES = new Set(["liviano", "medio", "filoso"]);
const VALID_DURATIONS = new Set(["corta", "larga", "leyenda"]);
const VALID_MODES = new Set(["multiplayer", "mesa"]);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, intensity, duration, hostName, mode = "multiplayer", playerNames = [] } = body;

        const normalizedMode = typeof mode === "string" ? mode : "multiplayer";
        const normalizedRoomName = typeof name === "string" ? name.trim() : "";
        const normalizedHostName = typeof hostName === "string" ? hostName.trim() : "";
        const normalizedPlayerNames = Array.isArray(playerNames)
            ? playerNames
                .map((playerName: unknown) => typeof playerName === "string" ? playerName.trim() : "")
                .filter(Boolean)
            : [];

        if (!normalizedRoomName || !intensity || !duration) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        if (!VALID_INTENSITIES.has(intensity) || !VALID_DURATIONS.has(duration) || !VALID_MODES.has(normalizedMode)) {
            return NextResponse.json({ error: "Configuración inválida" }, { status: 400 });
        }

        if (normalizedMode === "multiplayer" && !normalizedHostName) {
            return NextResponse.json({ error: "Falta el nombre del host" }, { status: 400 });
        }

        if (normalizedMode === "mesa" && normalizedPlayerNames.length < 4) {
            return NextResponse.json({ error: "Se necesitan al menos 4 jugadores para el modo mesa" }, { status: 400 });
        }

        if (normalizedMode === "mesa") {
            const uniqueNames = new Set(normalizedPlayerNames.map(playerName => playerName.toLowerCase()));
            if (uniqueNames.size !== normalizedPlayerNames.length) {
                return NextResponse.json({ error: "No puede haber nombres repetidos en la mesa" }, { status: 400 });
            }
        }

        const validatedMode = normalizedMode as Room["mode"];
        const validatedIntensity = intensity as GameIntensity;
        const validatedDuration = duration as GameDuration;
        const hostId = generatePlayerId();

        const initialPlayers = normalizedMode === "mesa"
            ? normalizedPlayerNames.map((playerName: string) => ({
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
            intensity: validatedIntensity,
            duration: validatedDuration,
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
        return NextResponse.json({ error: "Error al crear la sala" }, { status: 500 });
    }
}
