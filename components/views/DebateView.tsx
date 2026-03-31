import { useState, useEffect } from "react";
import { Room } from "@/lib/store";
import Timer from "../Timer";
import FallacyPanel from "../FallacyPanel";
import { playTurnSound, playFallacySound } from "@/lib/sounds";
import { Info, AlertTriangle, MessageSquare } from "lucide-react";

export default function DebateView({
    room, myRole, playerId, isHost,
    onPassTurn, onStartSpeaking, onFinishDebate, onSignalFallacy, onSurrender
}: {
    room: Room, myRole: string, playerId: string, isHost: boolean,
    onPassTurn: () => void, onStartSpeaking: () => void, onFinishDebate: () => void, onSignalFallacy: (fId: string) => void, onSurrender: () => void
}) {
    const [showFallacies, setShowFallacies] = useState(false);
    const round = room.rounds[room.currentRoundIndex];
    const topic = round.topic;

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

    // Derived flags for display
    const bothExhausted = round.timeRemainingA === 0 && round.timeRemainingB === 0;
    const canSignalFallacy = room.players.length > 2;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', position: 'relative', paddingBottom: '2rem' }}>
            
            {/* AYUDA CONTEXTUAL SUPERIOR */}
            <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: '0.6rem 1rem', 
                borderRadius: 'var(--radius-sm)', 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Info size={14} color="var(--accent-color)" />
                {isActiveSpeaker ? (
                    <span><strong>Tu turno:</strong> Argumentá con solidez y evitá falacias.</span>
                ) : isSpeakingState ? (
                    <span>Escuchá atentamente. Si detectás una <strong>falacia</strong>, denunciala.</span>
                ) : (
                    <span>Preparate para entrar al intercambio.</span>
                )}
            </div>

            {/* AVISO GIGANTE DE TRANSICIÓN */}
            {isTransitionState && isActiveSpeaker && (
                <div className="animate-fade-in" style={{
                    background: 'var(--warning-color)',
                    color: 'black',
                    padding: '1.2rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 30px rgba(234, 179, 8, 0.4)',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, fontWeight: 900 }}>¡PREPÁRATE!</h1>
                    <p style={{ margin: '0.4rem 0 0', fontWeight: 800, fontSize: '1rem' }}>EMPIEZAS EN {displayTransition}s</p>
                </div>
            )}

            {/* AVISO GIGANTE DE HABLA */}
            {isSpeakingState && isActiveSpeaker && (
                <div className="animate-fade-in" style={{
                    background: 'linear-gradient(135deg, var(--success-color) 0%, #10b981 100%)',
                    color: 'white',
                    padding: '1.2rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <h1 style={{ fontSize: '2rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, fontWeight: 900 }}>EN EL AIRE 🎙️</h1>
                    <p style={{ margin: '0.4rem 0 0', fontWeight: 800, fontSize: '0.9rem' }}>LA PALABRA ES TUYA</p>
                </div>
            )}

            {/* ESTRUCTURA DEL DEBATE */}
            <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--accent-color)' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                         <MessageSquare size={14} color="var(--accent-color)" />
                         <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PREMISA</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', lineHeight: 1.3, margin: 0 }}>
                        “{topic?.statement || 'Premisa no encontrada'}”
                    </h3>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    {myRole === "debatiente_a" && (
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                            <span style={{ color: 'var(--success-color)', fontWeight: 800 }}>TU POSTURA:</span> {topic?.angleA}
                        </div>
                    )}
                    {myRole === "debatiente_b" && (
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                            <span style={{ color: 'var(--danger-color)', fontWeight: 800 }}>TU POSTURA:</span> {topic?.angleB}
                        </div>
                    )}
                    {(myRole !== "debatiente_a" && myRole !== "debatiente_b") && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--success-color)', fontWeight: 800 }}>{pA?.name}:</span> {topic?.angleA}</div>
                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--danger-color)', fontWeight: 800 }}>{pB?.name}:</span> {topic?.angleB}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* SISTEMA DE RELOJ DE AJEDREZ */}
            <div style={{ margin: '0.5rem 0' }}>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_a") ? 1 : 0.3, transition: 'all 0.3s' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{pA?.name}</span>
                        <Timer durationSec={displayTimeA} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_a"} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', opacity: 0.2 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900 }}>VS</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_b") ? 1 : 0.3, transition: 'all 0.3s' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>{pB?.name}</span>
                        <Timer durationSec={displayTimeB} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_b"} />
                    </div>
                </div>
            </div>

            {/* ACCIONES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
                {isTransitionState && isActiveSpeaker && (
                    <button
                        onClick={onStartSpeaking}
                        className="animate-pulse-glow"
                        style={{ width: '100%', padding: '1.2rem', backgroundColor: 'var(--warning-color)', color: 'black', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)' }}
                    >
                        Entrar ahora ⚠️
                    </button>
                )}

                {isSpeakingState && isActiveSpeaker && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <button
                            onClick={onPassTurn}
                            style={{ width: '100%', padding: '1.2rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}
                        >
                            Ceder Palabra ⏩
                        </button>
                        <button
                            onClick={() => confirm("¿Abandonar el debate? Perderás el turno restante.") && onSurrender()}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.7)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0.4rem' }}
                        >
                            Rendirse en esta ronda
                        </button>
                    </div>
                )}

                {!isActiveSpeaker && isSpeakingState && !bothExhausted && canSignalFallacy && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <button
                            onClick={() => setShowFallacies(true)}
                            style={{ 
                                width: '100%', 
                                padding: '1.3rem', 
                                backgroundColor: 'var(--danger-color)', 
                                color: 'white', 
                                borderRadius: 'var(--radius-md)', 
                                fontSize: '1.2rem', 
                                fontWeight: 900, 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: '0.6rem', 
                                boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)',
                                border: 'none',
                                cursor: 'pointer',
                                textTransform: 'uppercase'
                            }}
                        >
                            <AlertTriangle size={24} /> ¡FALACIA!
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Si la denuncia es válida: <strong>+1 punto</strong><br/>Si es incorrecta: <strong>-1 punto</strong>
                        </p>
                    </div>
                )}

                {round.debateState === "finished" && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>Debate concluido. Preparando veredicto...</p>
                        {isHost && (
                            <button
                                onClick={onFinishDebate}
                                style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                            >
                                IR A VOTACIÓN 🗳️
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showFallacies && (
                <FallacyPanel
                    onClose={() => setShowFallacies(false)}
                    onSignal={onSignalFallacy}
                />
            )}
        </div>
    );
}
