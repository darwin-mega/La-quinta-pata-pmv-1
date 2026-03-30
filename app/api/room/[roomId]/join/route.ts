import { NextResponse } from "next/server";
import { generatePlayerId, mutateRoom } from "@/lib/store";
import { setRoomSessionCookie } from "@/lib/session";

class JoinError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
    try {
        const roomId = params.roomId.toUpperCase();
        const body = await req.json();
        const playerName = typeof body?.playerName === "string" ? body.playerName.trim() : "";

        if (!playerName) {
            return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
        }

        const result = await mutateRoom(roomId, room => {
            if (room.state !== "lobby") {
                throw new JoinError(403, "La partida ya ha comenzado");
            }

            const normalizedExistingNames = new Set(room.players.map(player => player.name.trim().toLowerCase()));
            if (normalizedExistingNames.has(playerName.toLowerCase())) {
                throw new JoinError(409, "Ese nombre ya está en uso en la sala");
            }

            const playerId = generatePlayerId();
            room.players.push({
                id: playerId,
                name: playerName,
                role: "jurado",
                isHost: false,
                score: 0,
                wins: 0
            });

            return { room, playerId };
        });

        if (!result) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        const response = NextResponse.json(result);
        setRoomSessionCookie(response, roomId, result.playerId, false);
        return response;
    } catch (error) {
        if (error instanceof JoinError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        return NextResponse.json({ error: "Error al unirse" }, { status: 500 });
    }
}
