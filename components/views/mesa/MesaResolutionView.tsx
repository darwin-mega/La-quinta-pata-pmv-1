import { useEffect } from "react";
import { Room } from "@/lib/store";
import { playWinSound } from "@/lib/sounds";
import styles from "./MesaRoundLayout.module.css";

export default function MesaResolutionView({ room, onShowLeaderboard }: { room: Room, onShowLeaderboard: () => void }) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;

    const topic = round.topic;
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    const votes = round.resolutionVotes || {};
    let rawA = 0;
    let rawB = 0;
    Object.values(votes).forEach(v => {
        if (v === "A") rawA++;
        if (v === "B") rawB++;
    });

    let falA = 0;
    let falB = 0;
    round.fallaciesSignaled.forEach(f => {
        if (f.accusedId === round.debatienteA_Id) falA++;
        else if (f.accusedId === round.debatienteB_Id) falB++;
    });

    const finalA = rawA - falA > rawB - falB ? 3 : rawA - falA === rawB - falB ? 1 : 0;
    const finalB = rawB - falB > rawA - falA ? 3 : rawB - falB === rawA - falA ? 1 : 0;

    useEffect(() => {
        playWinSound();
    }, []);

    const borderA = finalA > finalB ? "6px solid var(--success-color)" : finalA === finalB && finalA > 0 ? "6px solid var(--warning-color)" : "6px solid var(--border-color)";
    const borderB = finalB > finalA ? "6px solid var(--success-color)" : finalA === finalB && finalB > 0 ? "6px solid var(--warning-color)" : "6px solid var(--border-color)";

    return (
        <div className={styles.shell}>
            <div className={styles.centerHeader}>
                <span className={styles.eyebrow}>Resultado de ronda</span>
                <h1 className={styles.statement}>"{topic?.statement}"</h1>
            </div>

            <div className={styles.cardsGrid}>
                <div className={`glass-panel ${styles.scoreCard}`} style={{ borderTop: borderA, opacity: finalA > 0 || finalA === finalB ? 1 : 0.8 }}>
                    <div className={styles.debaterTitle}>A favor</div>
                    <div className={styles.debaterName}>{pA?.name}</div>

                    <div className={styles.scoreRow}>
                        <span style={{ color: "var(--text-secondary)" }}>Votos recibidos:</span>
                        <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>+{rawA}</span>
                    </div>
                    <div className={styles.scoreRow} style={{ marginBottom: "1.5rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Falacias en contra:</span>
                        <span style={{ color: "var(--danger-color)", fontWeight: "bold" }}>-{falA}</span>
                    </div>

                    <div className={styles.bonusLabel}>Bono de victoria</div>
                    <div className={styles.bonusValue} style={{ color: finalA > 0 ? "var(--success-color)" : "white" }}>+{finalA}</div>
                </div>

                <div className={`glass-panel ${styles.scoreCard}`} style={{ borderTop: borderB, opacity: finalB > 0 || finalA === finalB ? 1 : 0.8 }}>
                    <div className={styles.debaterTitle}>En contra</div>
                    <div className={styles.debaterName}>{pB?.name}</div>

                    <div className={styles.scoreRow}>
                        <span style={{ color: "var(--text-secondary)" }}>Votos recibidos:</span>
                        <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>+{rawB}</span>
                    </div>
                    <div className={styles.scoreRow} style={{ marginBottom: "1.5rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Falacias en contra:</span>
                        <span style={{ color: "var(--danger-color)", fontWeight: "bold" }}>-{falB}</span>
                    </div>

                    <div className={styles.bonusLabel}>Bono de victoria</div>
                    <div className={styles.bonusValue} style={{ color: finalB > 0 ? "var(--success-color)" : "white" }}>+{finalB}</div>
                </div>
            </div>

            <div className={styles.winner}>
                <h2 className={`title-serif ${styles.winnerTitle}`}>
                    {finalA === finalB ? "Empate" : finalA > finalB ? `Gana ${pA?.name}` : `Gana ${pB?.name}`}
                </h2>
            </div>

            <button onClick={onShowLeaderboard} className={styles.primaryAction}>
                Ver tabla de posiciones
            </button>
        </div>
    );
}
