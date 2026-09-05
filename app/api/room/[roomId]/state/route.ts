import { NextResponse } from "next/server";
import { getPersistenceStatus, getRoomWithSyncedTimers } from "@/lib/store";
import { readRoomSession } from "@/lib/session";
import { buildRoomView, sessionBelongsToRoom } from "@/lib/room-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request, props: { params: Promise<{ roomId: string }> }) {
    const params = await props.params;
    const roomId = params.roomId.toUpperCase();

    try {
        const room = await getRoomWithSyncedTimers(roomId);

        if (!room) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        const session = readRoomSession(req, roomId);
        if (!sessionBelongsToRoom(room, session) || !session) {
            return NextResponse.json({ error: "Necesitas entrar a la sala para ver la partida" }, { status: 401 });
        }

        const response = NextResponse.json({ room: buildRoomView(room, session), persistenceMode: getPersistenceStatus() });
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
        response.headers.set("Pragma", "no-cache");
        return response;
    } catch (error) {
        console.error("Error fetching room state:", error);
        return NextResponse.json(
            { error: "Error temporal del servidor, reintentando..." },
            {
                status: 503,
                headers: { "Retry-After": "2" },
            }
        );
    }
}
