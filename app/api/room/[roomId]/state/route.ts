import { NextResponse } from "next/server";
import { getRoom, syncTimers, saveRoom } from "@/lib/store";

// No caching — always get fresh state
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
    const roomId = params.roomId.toUpperCase();
    
    try {
        let room = await getRoom(roomId);

        if (!room) {
            return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
        }

        // Sincronizar timers: si el debate está activo y el tiempo expiró,
        // calcular el nuevo estado. Sólo persistir si hubo un cambio real.
        const originalState = room.state;
        const originalDebateState = room.rounds[room.currentRoundIndex]?.debateState;
        
        room = syncTimers(room);
        
        const newDebateState = room.rounds[room.currentRoundIndex]?.debateState;
        const timerChanged = newDebateState !== originalDebateState || room.state !== originalState;

        // Solo escribir en Redis si el timer causó un cambio de estado
        if (timerChanged) {
            await saveRoom(room);
        }

        const response = NextResponse.json({ room });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        return response;

    } catch (error) {
        // Si Redis falla temporalmente, retornar 503 en lugar de 500
        // para que el cliente reintente sin mostrar error fatal
        console.error('Error fetching room state:', error);
        return NextResponse.json(
            { error: "Error temporal del servidor, reintentando..." },
            { 
                status: 503,
                headers: { 'Retry-After': '2' }
            }
        );
    }
}
