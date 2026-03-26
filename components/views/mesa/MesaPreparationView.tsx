import { Room } from "@/lib/store";
import { topics } from "@/data/topics";

export default function MesaPreparationView({ room, onStartDebate }: { room: Room, onStartDebate: () => void }) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;

    const topic = topics.find(t => t.id === round.topicId);
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', padding: '1rem', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '2px' }}>NUEVO DEBATE: {topic?.category}</span>
                <h1 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem', lineHeight: 1.2, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    “{topic?.statement}”
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '6px solid var(--success-color)' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>POSTURA: A FAVOR</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>{pA?.name}</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--success-color)', fontStyle: 'italic' }}>Defiende que: {topic?.angleA}</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '6px solid var(--danger-color)' }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>POSTURA: EN CONTRA</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>{pB?.name}</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--danger-color)', fontStyle: 'italic' }}>Defiende que: {topic?.angleB}</div>
                </div>
            </div>

            <button
                onClick={onStartDebate}
                style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    backgroundColor: 'var(--accent-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '1.5rem', 
                    fontWeight: 900, 
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(255, 94, 58, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}
            >
                ¡Comenzar Debate!
            </button>

        </div>
    );
}
