import { useState, useEffect } from "react";
import { Room } from "@/lib/store";
import Timer from "../Timer";
import FallacyPanel from "../FallacyPanel";
import { playTurnSound, playFallacySound } from "@/lib/sounds";
import { AlertTriangle, MessageSquare } from "lucide-react";
import styles from "./DebateView.module.css";

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
    const activePlayer = round.activeSpeaker === "debatiente_a" ? pA : pB;

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
        <div className={styles.shell}>
            <div
                className={`${styles.phaseCard} ${isActiveSpeaker ? (isTransitionState ? styles.phaseCardWaiting : styles.phaseCardActive) : ""}`}
                aria-live="polite"
            >
                <span className={styles.phaseEyebrow}>{isTransitionState ? "Cambio de turno" : "Debate en curso"}</span>
                <h1 className={styles.phaseTitle}>
                    {isTransitionState
                        ? (isActiveSpeaker ? `Prepárate · ${displayTransition}s` : `Sigue ${activePlayer?.name || "el próximo turno"}`)
                        : (isActiveSpeaker ? "Tu turno · estás al aire" : `Habla ${activePlayer?.name || "otro jugador"}`)}
                </h1>
                <p className={styles.phaseHint}>
                    {isActiveSpeaker
                        ? "Defiende tu postura y cede la palabra cuando termines."
                        : canSignalFallacy
                            ? "Escucha el argumento. Puedes señalar una falacia."
                            : "Escucha el argumento y prepara tu respuesta."}
                </p>
            </div>

            <div className={styles.timers} aria-label="Tiempo de los debatientes">
                <div className={`${styles.timerPlayer} ${(isSpeakingState && round.activeSpeaker === "debatiente_a") ? styles.timerPlayerActive : ""}`}>
                    <span className={styles.timerName}>{pA?.name}</span>
                    <Timer durationSec={displayTimeA} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_a"} accentColor="var(--success-color)" />
                </div>
                <span className={styles.versus}>VS</span>
                <div className={`${styles.timerPlayer} ${(isSpeakingState && round.activeSpeaker === "debatiente_b") ? styles.timerPlayerActive : ""}`}>
                    <span className={styles.timerName}>{pB?.name}</span>
                    <Timer durationSec={displayTimeB} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_b"} accentColor="#3b82f6" />
                </div>
            </div>

            {/* ESTRUCTURA DEL DEBATE */}
            <div className={`glass-panel ${styles.premiseCard}`}>
                <div>
                    <div className={styles.premiseLabel}>
                         <MessageSquare size={14} color="var(--accent-color)" />
                         <span>Premisa</span>
                    </div>
                    <h3 className={styles.premise}>
                        “{topic?.statement || 'Premisa no encontrada'}”
                    </h3>
                </div>

                {(myRole === "debatiente_a" || myRole === "debatiente_b") ? (
                    <div className={styles.position}>
                        <span style={{ color: myRole === "debatiente_a" ? 'var(--success-color)' : '#3b82f6', fontWeight: 800 }}>TU POSTURA:</span>{" "}
                        {myRole === "debatiente_a" ? topic?.angleA : topic?.angleB}
                    </div>
                ) : (
                    <details className={styles.positionsDisclosure}>
                        <summary>Ver las dos posturas</summary>
                        <div className={styles.positionsList}>
                            <div><span style={{ color: 'var(--success-color)', fontWeight: 800 }}>{pA?.name}:</span> {topic?.angleA}</div>
                            <div><span style={{ color: '#3b82f6', fontWeight: 800 }}>{pB?.name}:</span> {topic?.angleB}</div>
                        </div>
                    </details>
                )}
            </div>

            {/* ACCIONES */}
            <div className={styles.actions}>
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
                            onClick={() => {
                                playFallacySound();
                                setShowFallacies(true);
                            }}
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
