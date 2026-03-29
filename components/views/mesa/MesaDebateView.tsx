import { useState, useEffect } from "react";
import { Room } from "@/lib/store";
import Timer from "../../Timer";
import FallacyPanel from "../../FallacyPanel";
import { topics } from "@/data/topics";
import { playTurnSound, playFallacySound } from "@/lib/sounds";

export default function MesaDebateView({
    room, onPassTurn, onStartSpeaking, onSignalFallacyWithAccuser, onFinishDebate
}: {
    room: Room,
    onPassTurn: () => void,
    onStartSpeaking: () => void,
    onSignalFallacyWithAccuser: (fId: string, accuserId: string) => void,
    onFinishDebate: () => void
}) {
    const [showFallacies, setShowFallacies] = useState(false);
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;

    const topic = topics.find(t => t.id === round.topicId);
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    const isSpeakingState = round.debateState === "speaking";
    const isTransitionState = round.debateState === "transition";
    const isFinishedState = round.debateState === "finished";
    
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
        const int = setInterval(tick, 200);
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

    const [lastSpeaker, setLastSpeaker] = useState("");
    useEffect(() => {
        if (isSpeakingState && round.activeSpeaker !== lastSpeaker) {
            playTurnSound();
            setLastSpeaker(round.activeSpeaker);
        }
    }, [isSpeakingState, round.activeSpeaker, lastSpeaker]);

    const bothExhausted = round.timeRemainingA === 0 && round.timeRemainingB === 0;
    const activePlayer = round.activeSpeaker === "debatiente_a" ? pA : pB;
    const [accusedFallacyId, setAccusedFallacyId] = useState<string | null>(null);
    const [selectingAccuser, setSelectingAccuser] = useState(false);

    const handleSignalClick = (fId: string) => {
        setAccusedFallacyId(fId);
        setShowFallacies(false);
        setSelectingAccuser(true);
        playFallacySound();
    };

    const confirmSignal = (accuserId: string) => {
        if (accusedFallacyId) {
            onSignalFallacyWithAccuser(accusedFallacyId, accuserId);
            setAccusedFallacyId(null);
            setSelectingAccuser(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            
            {/* TEMA EN PEQUEÑO */}
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase' }}>TEMA EN DEBATE</span>
                <h3 style={{ fontSize: '1.2rem', margin: '0.25rem 0 0 0', color: 'white' }}>“{topic?.statement}”</h3>
            </div>

            {/* AVISOS DE TRANSICIÓN O DE HABLA */}
            {isTransitionState && (
                <div className="animate-pulse-glow" style={{ background: 'var(--warning-color)', color: 'black', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, fontWeight: 900 }}>CAMBIO DE TURNO</h1>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 800, fontSize: '1.2rem' }}>EL TIEMPO DE {activePlayer?.name.toUpperCase()} EMPIEZA EN {displayTransition}s</p>
                    <button onClick={onStartSpeaking} style={{ marginTop: '1rem', padding: '1rem 2rem', background: 'black', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer' }}>
                        Adelantar Tiempo (Comenzar Ahora)
                    </button>
                </div>
            )}

            {isSpeakingState && (
                <div style={{ background: 'linear-gradient(135deg, var(--danger-color) 0%, var(--accent-color) 100%)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4)' }}>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', lineHeight: 1, fontWeight: 900 }}>¡HABLA {activePlayer?.name.toUpperCase()}!</h1>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 800, fontSize: '1.2rem' }}>EL RELOJ ESTÁ CORRIENDO</p>
                </div>
            )}

            {/* RELOJES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_a") || isTransitionState ? 1 : 0.5, transform: (isSpeakingState && round.activeSpeaker === "debatiente_a") ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--success-color)' }}>{pA?.name}</div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>A FAVOR</div>
                    <div style={{ transform: 'scale(1.5)', margin: '1rem 0' }}>
                        <Timer durationSec={displayTimeA} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_a"} />
                    </div>
                </div>

                <div style={{ fontSize: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: 900, opacity: 0.3 }}>VS</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', opacity: (isSpeakingState && round.activeSpeaker === "debatiente_b") || isTransitionState ? 1 : 0.5, transform: (isSpeakingState && round.activeSpeaker === "debatiente_b") ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--danger-color)' }}>{pB?.name}</div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>EN CONTRA</div>
                    <div style={{ transform: 'scale(1.5)', margin: '1rem 0' }}>
                        <Timer durationSec={displayTimeB} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_b"} />
                    </div>
                </div>
            </div>

            {/* BOTONES INFERIORES */}
            {!isFinishedState ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                    <button
                        onClick={onPassTurn}
                        disabled={!isSpeakingState}
                        style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '2px solid var(--accent-light)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 800, cursor: isSpeakingState ? 'pointer' : 'not-allowed', opacity: isSpeakingState ? 1 : 0.5 }}
                    >
                        ⏩ PASAR PALABRA AL RIVAL
                    </button>

                    <button
                        onClick={() => setShowFallacies(true)}
                        disabled={!isSpeakingState || bothExhausted}
                        style={{ padding: '1.5rem', backgroundColor: 'transparent', border: '3px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 800, cursor: (!isSpeakingState || bothExhausted) ? 'not-allowed' : 'pointer', opacity: (!isSpeakingState || bothExhausted) ? 0.3 : 1 }}
                    >
                        ⚠️ INTERRUMPIR (FALACIA)
                    </button>
                    
                    <button
                        onClick={onFinishDebate}
                        style={{ gridColumn: 'span 2', padding: '1rem', backgroundColor: 'transparent', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', transition: 'all 0.2s' }}
                    >
                        Terminar Debate (Host / Forzar)
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--text-secondary)' }}>
                    <h2 style={{ color: 'white', fontSize: '2.5rem', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>Debate Finalizado</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: '0 0 2rem 0' }}>El tiempo se ha agotado o el debate se ha cerrado.</p>
                    <button
                        onClick={onFinishDebate}
                        className="animate-pulse-glow"
                        style={{ padding: '1.5rem 3rem', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '2rem', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255, 94, 58, 0.4)' }}
                    >
                        IR A VOTACIÓN 🗳️
                    </button>
                </div>
            )}

            {showFallacies && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)' }}>
                    {/* Panel de falacias */}
                    <FallacyPanel onClose={() => setShowFallacies(false)} onSignal={handleSignalClick} />
                </div>
            )}

            {selectingAccuser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: 'rgba(10, 10, 12, 0.98)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>¿Quién detectó la falacia?</h2>
                    <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Buscamos al dueño del punto.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>
                        {room.players
                            .filter(p => p.id !== (round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id))
                            .map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => confirmSignal(p.id)}
                                style={{
                                    padding: '2rem',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setSelectingAccuser(false)}
                        style={{ marginTop: '4rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Cancelar y volver
                    </button>
                </div>
            )}
        </div>
    );
}
