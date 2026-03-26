import { NextResponse } from "next/server";
import { createRoom, generatePlayerId, Room } from "@/lib/store";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // mode: "multiplayer" | "mesa"
        // playerNames: array of string para modo mesa
        const { name, intensity, duration, hostName, mode = "multiplayer", playerNames = [] } = body;

        if (!name || !intensity || !duration) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }

        if (mode === "multiplayer" && !hostName) {
            return NextResponse.json({ error: "Falta el nombre del host" }, { status: 400 });
        }

        if (mode === "mesa" && (!playerNames || playerNames.length < 4)) {
            return NextResponse.json({ error: "Se necesitan al menos 4 jugadores para el modo mesa" }, { status: 400 });
        }

        const hostId = generatePlayerId();

        // En modo mesa, creamos los jugadores a partir de la lista
        const initialPlayers = mode === "mesa" 
            ? playerNames.map((pName: string) => ({
                id: generatePlayerId(),
                name: pName,
                role: "jurado" as const, // Base para Stage 1
                isHost: false, // El dispositivo es el host lógico, los jugadores de la mesa no necesitan control de la sala
                score: 0,
                wins: 0
            }))
            : [{
                id: hostId,
                name: hostName,
                role: "jurado" as const,
                isHost: true,
                score: 0,
                wins: 0
            }];

        const newRoomData: Omit<Room, "id" | "createdAt"> = {
            mode,
            name,
            intensity,
            duration,
            state: "lobby",
            hostId, // El ID de quien creó la sala (para control del tablero)
            players: initialPlayers,
            rounds: [],
            currentRoundIndex: -1,
            usedTopics: []
        };

        const room = createRoom(newRoomData);

        return NextResponse.json({ room, playerId: hostId });
    } catch (error) {
        return NextResponse.json({ error: "Error al crear la sala" }, { status: 500 });
    }
}
