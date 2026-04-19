import { NextResponse } from "next/server";
import { getPersistenceStatus, getRoomWithSyncedTimers } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { roomId: string } }) {
    const roomId = params.roomId.toUpperCase();

    try {
        const room = await getRoomWithSyncedTimers(roomId);

        if (!room) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        const response = NextResponse.json({ room, persistenceMode: getPersistenceStatus() });
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
