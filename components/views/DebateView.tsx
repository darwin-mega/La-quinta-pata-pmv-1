import { useState, useEffect } from "react";
import { Room } from "@/lib/store";
import Timer from "../Timer";
import FallacyPanel from "../FallacyPanel";
import { topics } from "@/data/topics";
import { playTurnSound, playFallacySound } from "@/lib/sounds";

export default function DebateView({
    room, myRole, playerId, isHost,
    onPassTurn, onStartSpeaking, onFinishDebate, onSignalFallacy, onSurrender
}: {
    room: Room, myRole: string, playerId: string, isHost: boolean,
    onPassTurn: () => void, onStartSpeaking: () => void, onFinishDebate: () => void, onSignalFallacy: (fId: string) => void, onSurrender: () => void
}) {
    const [showFallacies, setShowFallacies] = useState(false);
    const round = room.rounds[room.currentRoundIndex];
    const topic = topics.find(t => t.id === round.topicId);

    // Derived states
    const isSpeakingState = round.debateState === "speaking";
    const isTransitionState = round.debateState === "transition";
    const isActiveSpeaker = myRole === round.activeSpeaker;

    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    // Local manual tracking of passed time to smooth between polling intervals
    const [elapsedSec, setElapsedSec] = useState(0);
    useEffect(() => {
        if (!round.turnStartTime || round.debateState === "finished") {
            setElapsedSec(0);
            return;
        }

        const tick = () => {
            setElapsedSec(Math.floor((Date.now() - round.turnStartTime!) / 1000));
        };
        tick();
        const int = setInterval(tick, 200); // UI smoother check
        return () => clearInterval(int);
    }, [round.turnStartTime, round.debateState]);

    let displayTimeA = round.timeRemainingA;
    let displayTimeB = round.timeRemainingB;
    let displayTransition = round.transitionRemaining;

    if (isTransitionState) {
        displayTransition = Math.max(0, round.transitionRemaining - elapsedSec);
    } else if (isSpeakingState) {
        if (round.activeSpeaker === "debatiente_a") {
            displayTimeA = Math.max(0, round.timeRemainingA - elapsedSec);
        } else {
            displayTimeB = Math.max(0, round.timeRemainingB - elapsedSec);
        }
    }

    // Trigger sound on transitions to speaking
    const [lastSpeaker, setLastSpeaker] = useState("");
    useEffect(() => {
        if (isSpeakingState && round.activeSpeaker !== lastSpeaker) {
            if (isActiveSpeaker) playTurnSound();
            setLastSpeaker(round.activeSpeaker);
        }
    }, [isSpeakingState, round.activeSpeaker, isActiveSpeaker, lastSpeaker]);

    // Recent fallacy toasts
    const [recentFallacy, setRecentFallacy] = useState<string | null>(null);
    useEffect(() => {
        if (round.fallaciesSignaled.length > 0) {
            const last = round.fallaciesSignaled[round.fallaciesSignaled.length - 1];
            if (Date.now() - last.timestamp < 5000) {
                playFallacySound();
                setRecentFallacy(`⚠️ ¡Alguien señaló una falacia!`);
                const t = setTimeout(() => setRecentFallacy(null), 3000);
                return () => clearTimeout(t);
            }
        }
    }, [round.fallaciesSignaled.length]);

    // Derived flags for display
    const bothExhausted = round.timeRemainingA === 0 && round.timeRemainingB === 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', position: 'relative' }}>
            {recentFallacy && (
                <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--danger-color)', color: 'white', padding: '1rem 2rem', borderRadius: '100px', fontWeight: 800, fontSize: '1.1rem', zIndex: 100, boxShadow: '0 10px 30px rgba(244, 63, 94, 0.6)', animation: 'fadeIn 0.3s ease-out' }}>
                    {recentFallacy}
                </div>
            )}

            {/* AVISO GIGANTE DE TRANSICIÓN */}
            {isTransitionState && isActiveSpeaker && (
                <div className="animate-fade-in" style={{
                    background: 'var(--warning-color)',
                    color: 'black',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: '0 8px 30px rgba(234, 179, 8, 0.4)',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ fontSize: '2rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, letterSpacing: '1px', fontWeight: 900 }}>¡PREPÁRATE!</h1>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 800, fontSize: '1.1rem' }}>TU TIEMPO EMPIEZA EN {displayTransition}s</p>
                </div>
            )}

            {/* AVISO GIGANTE DE HABLA */}
            {isSpeakingState && isActiveSpeaker && (
                <div className="animate-fade-in" style={{
                    background: 'linear-gradient(135deg, var(--danger-color) 0%, var(--accent-color) 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <h1 style={{ fontSize: '2.2rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, letterSpacing: '1px', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>¡TE TOCA DEBATIR!</h1>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>EL RELOJ ESTÁ CORRIENDO</p>
                </div>
            )}

            {/* ESTADO FINALIZADO */}
            {round.debateState === "finished" && (
                <div className="animate-fade-in" style={{
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    textAlign: 'center',
                    border: '1px solid var(--text-secondary)'
                }}>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', color: 'var(--warning-color)' }}>Debate Finalizado</h2>
                    <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>El tiempo se agotó o los debatientes abandonaron su turno.</p>
                    
                    {isHost ? (
                        <button
                            onClick={onFinishDebate}
                            className="animate-pulse-glow"
                            style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.4rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(255, 94, 58, 0.4)' }}
                        >
                            IR A VOTACIÓN 🗳️
                        </button>
                    ) : (
                        <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Esperando que el Host inicie la votación... ⏳</p>
                    )}
                </div>
            )}

            {/* ESTRUCTURA DEL DEBATE: TEMA, PREMISA Y POSTURA */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-color)', background: 'linear-gradient(rgba(255,255,255,0.05), transparent)' }}>
                {/* BLOQUE 1: TEMA GENERAL */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>TEMA GENERAL</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{topic?.category || 'Sin tema'}</span>
                </div>

                {/* BLOQUE 2: PREMISA CONTROVERSIAL */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--danger-color)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>PREMISA A DISCUTIR</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1.3, margin: 0, textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                        “{topic?.statement || 'Premisa no encontrada'}”
                    </h3>
                </div>

                {/* BLOQUE 3: POSTURAS ASIGNADAS */}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.75rem' }}>POSICIONES ASIGNADAS</span>

                    {myRole === "debatiente_a" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span style={{ flexShrink: 0, background: 'var(--success-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>TU POSTURA: A FAVOR</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleA}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', opacity: 0.6 }}>
                                <span style={{ flexShrink: 0, background: 'var(--danger-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>RIVAL: EN CONTRA</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleB}</span>
                            </div>
                        </div>
                    )}

                    {myRole === "debatiente_b" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span style={{ flexShrink: 0, background: 'var(--danger-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>TU POSTURA: EN CONTRA</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleB}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', opacity: 0.6 }}>
                                <span style={{ flexShrink: 0, background: 'var(--success-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>RIVAL: A FAVOR</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleA}</span>
                            </div>
                        </div>
                    )}

                    {(myRole !== "debatiente_a" && myRole !== "debatiente_b") && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span style={{ flexShrink: 0, background: 'var(--success-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>{pA?.name}: A FAVOR</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleA}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span style={{ flexShrink: 0, background: 'var(--danger-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>{pB?.name}: EN CONTRA</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{topic?.angleB}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SISTEMA DE RELOJ DE AJEDREZ */}
            <div style={{ marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '2px' }}>
                        {isTransitionState ? "TRANSICIÓN..." : isSpeakingState ? "DEBATE ACTIVO" : "TIEMPO AGOTADO"}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
                    {/* Reloj Jugador A */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_a") ? 1 : 0.4, transition: 'all 0.3s', transform: (isSpeakingState && round.activeSpeaker === "debatiente_a") ? 'scale(1.05)' : 'scale(1)' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: (isSpeakingState && round.activeSpeaker === "debatiente_a") ? 'var(--danger-color)' : 'transparent', display: 'inline-block' }}></span>
                            {pA?.name}
                        </span>
                        <Timer durationSec={displayTimeA} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_a"} />
                    </div>

                    {/* VS divider */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 800, opacity: 0.5 }}>VS</span>
                    </div>

                    {/* Reloj Jugador B */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_b") ? 1 : 0.4, transition: 'all 0.3s', transform: (isSpeakingState && round.activeSpeaker === "debatiente_b") ? 'scale(1.05)' : 'scale(1)' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {pB?.name}
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: (isSpeakingState && round.activeSpeaker === "debatiente_b") ? 'var(--danger-color)' : 'transparent', display: 'inline-block' }}></span>
                        </span>
                        <Timer durationSec={displayTimeB} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_b"} />
                    </div>
                </div>
            </div>

            <div style={{ flex: 1 }}></div>

            {/* ACCIONES INFERIORES */}
            {round.debateState !== "finished" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>

                    {/* Botón de Transición (Comenzar Ahora) */}
                    {isTransitionState && isActiveSpeaker && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            <button
                                onClick={onStartSpeaking}
                                className="animate-pulse-glow"
                                style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--warning-color)', color: 'black', borderRadius: 'var(--radius-md)', fontSize: '1.15rem', fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)' }}
                            >
                                Comenzar Ahora ⚠️
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("¿Estás seguro de ceder todo tu tiempo y bajarte del debate? No podrás volver a hablar.")) {
                                        onSurrender();
                                    }
                                }}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px dashed var(--danger-color)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', marginTop: '0.5rem' }}
                            >
                                Ceder mi tiempo y bajarme del debate 🛑
                            </button>
                        </div>
                    )}

                    {/* Botón de Pasar Turno durante el habla */}
                    {isSpeakingState && isActiveSpeaker && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                            <button
                                onClick={onPassTurn}
                                style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--surface-color)', border: '2px solid var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(255, 94, 58, 0.2)' }}
                            >
                                Pasar la palabra ⏩
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("¿Estás seguro de ceder todo tu tiempo y bajarte del debate? No podrás volver a hablar.")) {
                                        onSurrender();
                                    }
                                }}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: '1px dashed var(--danger-color)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', marginTop: '0.5rem' }}
                            >
                                Ceder mi tiempo y bajarme del debate 🛑
                            </button>
                        </div>
                    )}

                    {/* Jurados u Oponentes pueden señalar falacias (siempre que se esté hablando) */}
                    {!isActiveSpeaker && isSpeakingState && !bothExhausted && (
                        <button
                            onClick={() => setShowFallacies(true)}
                            style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.15rem', fontWeight: 800, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.4)', transition: 'transform 0.1s' }}
                        >
                            ⚠️ Detectar Falacia
                        </button>
                    )}

                    {/* Acciones de Host */}
                    {isHost && (
                        <button
                            onClick={() => {
                                if (confirm("¿Forzar cierre de este debate?")) {
                                    onFinishDebate();
                                }
                            }}
                            style={{ width: '100%', padding: '1.25rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, transition: 'background-color 0.2s' }}
                        >
                            Terminar Debate (Host) ⏭
                        </button>
                    )}
                </div>
            )}

            {showFallacies && (
                <FallacyPanel
                    onClose={() => setShowFallacies(false)}
                    onSignal={onSignalFallacy}
                />
            )}
        </div>
    );
}
