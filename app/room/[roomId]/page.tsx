"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import LobbyView from "@/components/views/LobbyView";
import PreparationView from "@/components/views/PreparationView";
import DebateView from "@/components/views/DebateView";
import VotingView from "@/components/views/VotingView";
import ResultView from "@/components/views/ResultView";
import FallacyReviewView from "@/components/views/FallacyReviewView";
import { Room } from "@/lib/store";
import Logo from "@/components/Logo";

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const [room, setRoom] = useState<Room | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const consecutiveErrors = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Read local identity on mount
    useEffect(() => {
        const savedPid = localStorage.getItem(`laJaula_playerId_${roomId}`);
        const savedRole = localStorage.getItem(`laJaula_isHost_${roomId}`);
        if (savedPid) setPlayerId(savedPid);
        if (savedRole === "true") setIsHost(true);
    }, [roomId]);

    // Polling logic — stable interval, no restart on state changes
    const fetchState = useCallback(async () => {
        try {
            const res = await fetch(`/api/room/${roomId}/state`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache, no-store' }
            });
            if (res.ok) {
                const data = await res.json();
                setRoom(data.room);
                setConnectionError(false);
                consecutiveErrors.current = 0;
            } else if (res.status === 404) {
                // Solo mostrar error de sala no encontrada después de 3 intentos fallidos
                consecutiveErrors.current += 1;
                if (consecutiveErrors.current >= 3) {
                    setConnectionError(true);
                }
            }
        } catch (err) {
            // Silently retry — network hiccup or Vercel cold start
            consecutiveErrors.current += 1;
            if (consecutiveErrors.current >= 4) {
                setConnectionError(true);
            }
        } finally {
            setLoading(prev => prev ? false : prev); // Only update if still loading
        }
    }, [roomId]);

    useEffect(() => {
        // Initial fetch
        fetchState();
        // Stable polling every 2s — does NOT restart when room state updates
        intervalRef.current = setInterval(fetchState, 2000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchState]);

    // Play sound on phase change
    useEffect(() => {
        if (room?.state && room.state !== 'lobby' && room.state !== 'results') {
            import('@/lib/sounds').then(m => m.playPhaseChangeSound());
        }
    }, [room?.state]);

    const dispatchAction = async (action: string, payload: any = {}) => {
        try {
            await fetch(`/api/room/${roomId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload: { ...payload, playerId } })
            });
            // The polling will pick up the resulting state change soon
        } catch (err) {
            console.error("Error dispatching action:", err);
        }
    };

    if (loading) return (
        <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-color)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Conectando a la sala...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (!room) return (
        <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>📡</div>
            <h2 style={{ color: 'white' }}>{connectionError ? 'Sala no encontrada o expirada' : 'Reconectando...'}</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                {connectionError
                    ? 'La sala puede haber expirado (4h de límite) o el código es incorrecto.'
                    : 'Intentando conectar con el servidor...'}
            </p>
            {connectionError && (
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ padding: '1rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                >
                    Volver al inicio
                </button>
            )}
        </div>
    );
    if (!playerId) return (
        <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <h2>No estás en esta sala</h2>
            <a href={`/join/${roomId}`} style={{ color: 'var(--accent-color)', marginTop: '1rem' }}>Entrar ahora</a>
        </div>
    );

    const myPlayer = room.players.find(p => p.id === playerId);
    const myRole = myPlayer?.role || "jurado";

    return (
        <div className={styles.roomContainer}>
            {/* HEADER: Always shows room info and your role */}
            <header style={{ background: 'rgba(18, 19, 25, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Logo width={45} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', letterSpacing: '2px', textTransform: 'uppercase' }}>SALA: {room.id}</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white' }}>{room.name}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'var(--surface-hover)', border: `1px solid ${myRole === 'host' ? 'var(--warning-color)' : myRole.includes('A') ? '#ef4444' : myRole.includes('B') ? '#3b82f6' : 'var(--success-color)'}`, color: 'white' }}>
                        {myRole === "host" ? "Host" : myRole.replace('_', ' ')}
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('¿Estás seguro de que deseas salir de la sala?')) {
                                window.location.href = '/';
                            }
                        }}
                        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'background-color 0.2s', color: 'var(--text-secondary)' }}
                        title="Salir de la partida"
                    >
                        ✕
                    </button>
                </div>
            </header>

            <main className={styles.roomMain}>
                {room.state === "lobby" && (
                    <LobbyView room={room} isHost={isHost} onStart={() => dispatchAction("START_GAME")} />
                )}

                {room.state === "preparation" && (
                    <PreparationView room={room} myRole={myRole} onStartDebate={() => dispatchAction("START_DEBATE")} isHost={isHost} />
                )}

                {room.state === "debate" && (
                    <DebateView
                        room={room}
                        myRole={myRole}
                        playerId={playerId}
                        isHost={isHost}
                        onPassTurn={() => dispatchAction("PASS_TURN")}
                        onStartSpeaking={() => dispatchAction("START_SPEAKING")}
                        onFinishDebate={() => dispatchAction("FINISH_DEBATE")}
                        onSurrender={() => dispatchAction("SURRENDER")}
                        onSignalFallacy={(fId) => dispatchAction("SIGNAL_FALLACY", { fallacyId: fId })}
                    />
                )}

                {room.state === "fallacy_review" && (
                    <FallacyReviewView room={room} playerId={playerId} isHost={isHost} onVote={(vote) => dispatchAction("VOTE_FALLACY", { vote })} />
                )}

                {room.state === "voting" && (
                    <VotingView room={room} playerId={playerId} isHost={isHost} onVote={(vId, reason) => dispatchAction("VOTE", { votedForId: vId, reason })} onCloseVoting={() => dispatchAction("CLOSE_VOTING")} />
                )}

                {room.state === "resolution" && (
                    <VotingView room={room} playerId={playerId} isHost={isHost} onVote={(vId, reason) => dispatchAction("VOTE_RESOLUTION", { vote: vId })} onCloseVoting={() => dispatchAction("CLOSE_VOTING")} />
                )}

                {room.state === "results" && (
                    <ResultView room={room} isHost={isHost} onNextRound={() => dispatchAction("NEXT_ROUND")} />
                )}
            </main>
        </div>
    );
}
