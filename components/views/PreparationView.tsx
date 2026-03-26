import { Room } from "@/lib/store";
import { topics } from "@/data/topics";
import Timer from "../Timer";

export default function PreparationView({ room, myRole, onStartDebate, isHost }: { room: Room, myRole: string, onStartDebate: () => void, isHost: boolean }) {
    const round = room.rounds[room.currentRoundIndex];
    const topic = topics.find(t => t.id === round.topicId);
    const prepTime = room.duration === "corta" ? 60 : 120; // 1 or 2 minutes

    if (!topic) return <div>Cargando tema...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: 'var(--accent-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fase de Preparación</h2>
                <Timer durationSec={prepTime} />
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 className="title-serif" style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    "{topic.statement}"
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {topic.context}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'var(--surface-hover)', padding: '0.75rem', borderRadius: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#ef4444' }}>🔴 </span> {topic.angleA}
                    </div>
                    <div style={{ background: 'var(--surface-hover)', padding: '0.75rem', borderRadius: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>🔵 </span> {topic.angleB}
                    </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Ejes disparadores</h4>
                    <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topic.prompts?.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            </div>

            {myRole !== "jurado" && myRole !== "host" && (
                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--accent-color)', textAlign: 'center' }}>
                        ¡Atención! Te toca debatir pronto. Revisa los enfoques.
                    </p>
                </div>
            )}

            {isHost ? (
                <button
                    onClick={onStartDebate}
                    style={{ width: '100%', padding: '1rem', background: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600 }}
                >
                    Iniciar Debate (Saltar reloj)
                </button>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>El host iniciará el debate...</p>
            )}
        </div>
    );
}
