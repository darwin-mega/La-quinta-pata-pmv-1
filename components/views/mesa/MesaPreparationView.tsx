import { Room } from "@/lib/store";
import styles from "./MesaRoundLayout.module.css";

export default function MesaPreparationView({ room, onStartDebate }: { room: Room, onStartDebate: () => void }) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;

    const topic = round.topic;
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    return (
        <div className={`${styles.shell} ${styles.shellNarrow}`}>
            <div className={styles.centerHeader}>
                <span className={styles.eyebrow}>Nuevo debate: {topic?.category}</span>
                <h1 className={styles.statement}>"{topic?.statement}"</h1>
            </div>

            <div className={styles.cardsGrid}>
                <div className={`glass-panel ${styles.debaterCard}`} style={{ borderTop: "6px solid var(--success-color)" }}>
                    <div className={styles.debaterTitle}>Postura: a favor</div>
                    <div className={styles.debaterName}>{pA?.name}</div>
                    <div className={styles.debaterAngle} style={{ color: "var(--success-color)" }}>
                        Defiende que: {topic?.angleA}
                    </div>
                </div>

                <div className={`glass-panel ${styles.debaterCard}`} style={{ borderTop: "6px solid var(--danger-color)" }}>
                    <div className={styles.debaterTitle}>Postura: en contra</div>
                    <div className={styles.debaterName}>{pB?.name}</div>
                    <div className={styles.debaterAngle} style={{ color: "var(--danger-color)" }}>
                        Defiende que: {topic?.angleB}
                    </div>
                </div>
            </div>

            <button onClick={onStartDebate} className={styles.primaryAction}>
                Comenzar debate
            </button>
        </div>
    );
}
