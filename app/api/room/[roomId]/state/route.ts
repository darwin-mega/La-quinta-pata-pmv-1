import { NextResponse } from "next/server";
import { getRoom, syncTimers } from "@/lib/store";

// Add no-store behavior to ensure standard caching doesn't block polling
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
    const roomId = params.roomId.toUpperCase();
    let room = getRoom(roomId);

    if (!room) {
        return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    room = syncTimers(room);

    return NextResponse.json({ room });
}
