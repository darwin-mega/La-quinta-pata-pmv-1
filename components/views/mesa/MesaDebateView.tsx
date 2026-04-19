import { useState, useEffect } from "react";
import { Room } from "@/lib/store";
import Timer from "../../Timer";
import FallacyPanel from "../../FallacyPanel";
import { playTurnSound, playFallacySound } from "@/lib/sounds";
import styles from "./MesaRoundLayout.module.css";

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
    const [elapsedSec, setElapsedSec] = useState(0);
    const [lastSpeaker, setLastSpeaker] = useState("");
    const [accusedFallacyId, setAccusedFallacyId] = useState<string | null>(null);
    const [selectingAccuser, setSelectingAccuser] = useState(false);
    const round = room.rounds[room.currentRoundIndex];
    const activeSpeaker = round?.activeSpeaker;
    const isSpeakingState = round?.debateState === "speaking";

    useEffect(() => {
        if (!round?.turnStartTime || round.debateState === "finished") {
            setElapsedSec(0);
            return;
        }

        const turnStartTime = round.turnStartTime;
        const tick = () => {
            setElapsedSec(Math.floor((Date.now() - turnStartTime) / 1000));
        };
        tick();
        const int = setInterval(tick, 200);
        return () => clearInterval(int);
    }, [round?.turnStartTime, round?.debateState]);

    useEffect(() => {
        if (isSpeakingState && activeSpeaker && activeSpeaker !== lastSpeaker) {
            playTurnSound();
            setLastSpeaker(activeSpeaker);
        }
    }, [isSpeakingState, activeSpeaker, lastSpeaker]);

    if (!round) return null;

    const topic = round.topic;
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    const isTransitionState = round.debateState === "transition";
    const isFinishedState = round.debateState === "finished";

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

    const bothExhausted = round.timeRemainingA === 0 && round.timeRemainingB === 0;
    const activePlayer = round.activeSpeaker === "debatiente_a" ? pA : pB;

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
        <div className={styles.shell}>
            <div className={styles.topicStrip}>
                <span className={styles.topicStripTitle}>Tema en debate</span>
                <h3 className={styles.topicStripText}>&quot;{topic?.statement}&quot;</h3>
            </div>

            {isTransitionState && (
                <div className={`animate-pulse-glow ${styles.statusBanner}`} style={{ background: "var(--warning-color)", color: "black" }}>
                    <h1 className={styles.statusTitle}>Cambio de turno</h1>
                    <p className={styles.statusText}>El tiempo de {activePlayer?.name} empieza en {displayTransition}s</p>
                    <button onClick={onStartSpeaking} className={styles.secondaryAction}>
                        Adelantar tiempo
                    </button>
                </div>
            )}

            {isSpeakingState && (
                <div className={styles.statusBanner} style={{ background: "linear-gradient(135deg, var(--success-color) 0%, #10b981 100%)", color: "white", boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)" }}>
                    <h1 className={styles.statusTitle}>Habla {activePlayer?.name}</h1>
                    <p className={styles.statusText}>El reloj esta corriendo</p>
                </div>
            )}

            <div className={styles.timersGrid}>
                <div
                    className={styles.timerColumn}
                    style={{
                        opacity: (isSpeakingState && round.activeSpeaker === "debatiente_a") || isTransitionState ? 1 : 0.5,
                        transform: isSpeakingState && round.activeSpeaker === "debatiente_a" ? "scale(1.03)" : "scale(1)",
                    }}
                >
                    <div className={styles.timerName} style={{ color: "var(--success-color)" }}>{pA?.name}</div>
                    <div className={styles.timerRole}>A favor</div>
                    <div className={styles.timerScale}>
                        <Timer durationSec={displayTimeA} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_a"} />
                    </div>
                </div>

                <div className={styles.vs}>VS</div>

                <div
                    className={styles.timerColumn}
                    style={{
                        opacity: (isSpeakingState && round.activeSpeaker === "debatiente_b") || isTransitionState ? 1 : 0.5,
                        transform: isSpeakingState && round.activeSpeaker === "debatiente_b" ? "scale(1.03)" : "scale(1)",
                    }}
                >
                    <div className={styles.timerName} style={{ color: "var(--danger-color)" }}>{pB?.name}</div>
                    <div className={styles.timerRole}>En contra</div>
                    <div className={styles.timerScale}>
                        <Timer durationSec={displayTimeB} isPaused={!isSpeakingState || round.activeSpeaker !== "debatiente_b"} />
                    </div>
                </div>
            </div>

            {!isFinishedState ? (
                <div className={styles.actionsGrid}>
                    <button
                        onClick={onPassTurn}
                        disabled={!isSpeakingState}
                        className={styles.actionButton}
                        style={{
                            backgroundColor: "var(--surface-color)",
                            border: "2px solid var(--accent-light)",
                            color: "white",
                            cursor: isSpeakingState ? "pointer" : "not-allowed",
                            opacity: isSpeakingState ? 1 : 0.5,
                        }}
                    >
                        Pasar palabra al rival
                    </button>

                    <button
                        onClick={() => setShowFallacies(true)}
                        disabled={!isSpeakingState || bothExhausted}
                        className={styles.actionButton}
                        style={{
                            backgroundColor: "transparent",
                            border: "3px solid var(--danger-color)",
                            color: "var(--danger-color)",
                            cursor: !isSpeakingState || bothExhausted ? "not-allowed" : "pointer",
                            opacity: !isSpeakingState || bothExhausted ? 0.3 : 1,
                        }}
                    >
                        Interrumpir por falacia
                    </button>

                    <button
                        onClick={onFinishDebate}
                        className={`${styles.actionButton} ${styles.fullWidth}`}
                        style={{
                            padding: "1rem",
                            backgroundColor: "transparent",
                            border: "1px solid var(--danger-color)",
                            color: "var(--danger-color)",
                            fontSize: "1rem",
                            fontWeight: 600,
                        }}
                    >
                        Terminar debate
                    </button>
                </div>
            ) : (
                <div className={styles.finishedCard}>
                    <h2 className={styles.finishedTitle}>Debate finalizado</h2>
                    <p className={styles.finishedText}>El tiempo se ha agotado o el debate se ha cerrado.</p>
                    <button onClick={onFinishDebate} className={`animate-pulse-glow ${styles.finishedPrimary}`}>
                        Ir a votacion
                    </button>
                </div>
            )}

            {showFallacies && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)" }}>
                    <FallacyPanel onClose={() => setShowFallacies(false)} onSignal={handleSignalClick} />
                </div>
            )}

            {selectingAccuser && (
                <div className={styles.overlay}>
                    <h2 className={styles.overlayTitle}>Quien detecto la falacia?</h2>
                    <p className={styles.overlayText}>Buscamos al dueno del punto.</p>

                    <div className={styles.overlayGrid}>
                        {room.players
                            .filter(p => p.id !== (round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id))
                            .map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => confirmSignal(p.id)}
                                    className={styles.overlayButton}
                                >
                                    {p.name}
                                </button>
                            ))}
                    </div>

                    <button onClick={() => setSelectingAccuser(false)} className={styles.overlayCancel}>
                        Cancelar y volver
                    </button>
                </div>
            )}
        </div>
    );
}
