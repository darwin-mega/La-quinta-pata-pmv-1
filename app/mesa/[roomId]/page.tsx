"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Room } from "@/lib/store";
import Logo from "@/components/Logo";
import RoomSetupSummaryCard from "@/components/RoomSetupSummaryCard";
import RoundTopicSelectionView from "@/components/views/RoundTopicSelectionView";
import MesaPreparationView from "@/components/views/mesa/MesaPreparationView";
import MesaDebateView from "@/components/views/mesa/MesaDebateView";
import MesaFallacyReviewView from "@/components/views/mesa/MesaFallacyReviewView";
import MesaVotingView from "@/components/views/mesa/MesaVotingView";
import MesaResolutionView from "@/components/views/mesa/MesaResolutionView";
import MesaLeaderboardView from "@/components/views/mesa/MesaLeaderboardView";
import { getGameDurationLabel, getGameIntensityLabel } from "@/lib/game";

export default function MesaPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const consecutiveErrors = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchState = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const res = await fetch(`/api/room/${roomId}/state`, {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache, no-store" },
                signal,
            });
            if (res.ok) {
                const data = await res.json();
                setRoom(data.room);
                setConnectionError(false);
                consecutiveErrors.current = 0;
            } else if (res.status === 404) {
                consecutiveErrors.current += 1;
                if (consecutiveErrors.current >= 5) setConnectionError(true);
            }
        } catch (err: any) {
            if (err.name === "AbortError") return;
            consecutiveErrors.current += 1;
            if (consecutiveErrors.current >= 6) setConnectionError(true);
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchState();
        intervalRef.current = setInterval(() => fetchState(), 1000);

        const handleVisibility = () => {
            if (document.visibilityState === "visible") fetchState();
        };
        const handleFocus = () => fetchState();

        window.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleFocus);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
            window.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleFocus);
        };
    }, [fetchState]);

    useEffect(() => {
        if (room?.state && room.state !== "lobby") {
            import("@/lib/sounds").then(module => module.playPhaseChangeSound());
        }
    }, [room?.state]);

    const dispatchAction = async (action: string, payload: any = {}) => {
        let attempts = 0;
        const maxAttempts = 2;

        const performAction = async () => {
            try {
                const res = await fetch(`/api/room/${roomId}/action`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action, payload }),
                });

                if (res.ok) {
                    await fetchState();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return performAction();
                }
            } catch (err) {
                if (attempts < maxAttempts) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return performAction();
                }
                console.error("Error dispatching action:", err);
            }
        };

        return performAction();
    };

    if (loading) {
        return (
            <div className="page-container" style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #3b82f6", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: "var(--text-secondary)" }}>Conectando al tablero de mesa...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="page-container" style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem" }}>📡</div>
                <h2 style={{ color: "white" }}>{connectionError ? "Sala no encontrada" : "Reconectando..."}</h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: "300px" }}>
                    {connectionError ? "La sala expiro o el codigo es incorrecto." : "Intentando conectar..."}
                </p>
                {connectionError && (
                    <button onClick={() => router.push("/")} style={{ padding: "1rem 2rem", background: "var(--accent-color)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer" }}>
                        Volver al inicio
                    </button>
                )}
            </div>
        );
    }

    if (room.mode !== "mesa") {
        return (
            <div className="page-container" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                <h2>Esta sala no es modo mesa</h2>
                <button onClick={() => router.push(`/join/${roomId}`)} style={{ color: "var(--accent-color)", marginTop: "1rem", background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                    Ir a la vista normal
                </button>
            </div>
        );
    }

    return (
        <div className={styles.mesaContainer}>
            <header style={{ background: "rgba(18, 19, 25, 0.8)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Logo width={45} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#3b82f6", letterSpacing: "2px", textTransform: "uppercase" }}>Modo mesa</span>
                        <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "white" }}>{room.name}</span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ padding: "0.35rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid #3b82f6", color: "#3b82f6" }}>
                        Codigo: {room.id}
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Seguro que queres cerrar el tablero de mesa?")) {
                                router.push("/");
                            }
                        }}
                        style={{ background: "rgba(255,255,255,0.05)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: "var(--text-secondary)", cursor: "pointer", border: "none" }}
                        title="Salir del tablero"
                    >
                        ×
                    </button>
                </div>
            </header>

            <main className={styles.mesaMain}>
                {room.state === "lobby" && (
                    <div className={styles.dashboard}>
                        <div className={`glass-panel ${styles.headerCard}`}>
                            <h1 className={`title-serif ${styles.title}`}>Tablero principal</h1>
                            <p className={styles.subtitle}>Todo listo para arrancar rapido</p>
                        </div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoLabel}>Intensidad</div>
                                <div className={styles.infoValue}>{getGameIntensityLabel(room.intensity)}</div>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoLabel}>Largo</div>
                                <div className={styles.infoValue}>{getGameDurationLabel(room.duration)}</div>
                            </div>
                            <div className={styles.infoCard}>
                                <div className={styles.infoLabel}>Estado</div>
                                <div className={styles.infoValue}>Esperando inicio</div>
                            </div>
                        </div>

                        <div style={{ width: "100%", maxWidth: "980px" }}>
                            <RoomSetupSummaryCard room={room} accentColor="#3b82f6" title="Configuracion de la mesa" />
                        </div>

                        <div className="glass-panel" style={{ padding: "2rem" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem", color: "white" }}>Jugadores en la mesa ({room.players.length})</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Los roles se asignan automaticamente al iniciar.</p>

                            <div className={styles.playersList}>
                                {room.players.map(player => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={styles.playerAvatar}>{player.name.charAt(0).toUpperCase()}</div>
                                        <div className={styles.playerName}>{player.name}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={styles.primaryButton}
                                onClick={async (event) => {
                                    const button = event.currentTarget;
                                    button.disabled = true;
                                    const originalText = button.innerText;
                                    button.innerText = "Abriendo...";

                                    try {
                                        await dispatchAction("START_GAME");
                                    } finally {
                                        setTimeout(() => {
                                            if (button && document.body.contains(button)) {
                                                button.disabled = false;
                                                button.innerText = originalText;
                                            }
                                        }, 3000);
                                    }
                                }}
                            >
                                Elegir tema y empezar
                            </button>
                        </div>
                    </div>
                )}

                {room.state === "topic_selection" && (
                    <RoundTopicSelectionView
                        room={room}
                        isHost={true}
                        onSelectTopic={(payload) => dispatchAction("SELECT_ROUND_TOPIC", payload)}
                    />
                )}

                {room.state === "preparation" && (
                    <MesaPreparationView
                        room={room}
                        onStartDebate={() => dispatchAction("START_DEBATE")}
                    />
                )}

                {room.state === "debate" && (
                    <MesaDebateView
                        room={room}
                        onPassTurn={() => dispatchAction("PASS_TURN")}
                        onStartSpeaking={() => dispatchAction("START_SPEAKING")}
                        onSignalFallacyWithAccuser={(fallacyId, accuserId) => dispatchAction("SIGNAL_FALLACY", { fallacyId, accuserId })}
                        onFinishDebate={() => dispatchAction("FINISH_DEBATE")}
                    />
                )}

                {room.state === "fallacy_review" && (
                    <MesaFallacyReviewView
                        room={room}
                        onForceAccept={() => dispatchAction("VOTE_FALLACY", { vote: "force_accept" })}
                        onForceReject={() => dispatchAction("VOTE_FALLACY", { vote: "force_reject" })}
                    />
                )}

                {room.state === "voting" && (
                    <MesaVotingView
                        room={room}
                        onSubmitVotes={(votes) => dispatchAction("SUBMIT_MESA_VOTES", { votes })}
                    />
                )}

                {room.state === "resolution" && (
                    <MesaResolutionView
                        room={room}
                        onShowLeaderboard={() => dispatchAction("SHOW_LEADERBOARD")}
                    />
                )}

                {room.state === "results" && (
                    <MesaLeaderboardView
                        room={room}
                        onNextRound={() => dispatchAction("NEXT_ROUND")}
                    />
                )}

                {room.state === "finished" && (
                    <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", maxWidth: "800px", width: "100%" }}>
                        <h2 style={{ fontSize: "2.5rem", margin: 0, color: "white" }}>Partida finalizada</h2>
                        <button onClick={() => window.location.href = "/"} style={{ marginTop: "2rem", padding: "1rem 2rem", background: "var(--accent-color)", color: "white", borderRadius: "var(--radius-md)", fontWeight: "bold", fontSize: "1.2rem", border: "none", cursor: "pointer" }}>
                            Volver al inicio
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
