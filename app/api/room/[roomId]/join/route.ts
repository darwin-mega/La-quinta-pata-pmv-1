import { NextResponse } from "next/server";
import { getRoom, updateRoom, generatePlayerId } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomId = params.roomId.toUpperCase();
        const room = await getRoom(roomId);

        if (!room) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        if (room.state !== "lobby") {
            return NextResponse.json({ error: "La partida ya ha comenzado" }, { status: 403 });
        }

        const body = await req.json();
        const { playerName } = body;

        if (!playerName) {
            return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
        }

        const playerId = generatePlayerId();

        const upPlayers = [...room.players];
        upPlayers.push({
            id: playerId,
            name: playerName,
            role: "jurado",
            isHost: false,
            score: 0,
            wins: 0
        });

        await updateRoom(roomId, { players: upPlayers });

        return NextResponse.json({ room, playerId });
    } catch (error) {
        return NextResponse.json({ error: "Error al unirse" }, { status: 500 });
    }
}
