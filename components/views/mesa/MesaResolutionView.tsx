import { Room } from "@/lib/store";
import { topics } from "@/data/topics";

export default function MesaResolutionView({ room, onShowLeaderboard }: { room: Room, onShowLeaderboard: () => void }) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;

    const topic = topics.find(t => t.id === round.topicId);
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    // Calcular en UI temporalmente para no tener que esperar polling (aunque el server ya lo calculó)
    const votes = round.resolutionVotes || {};
    let rawA = 0; let rawB = 0;
    Object.values(votes).forEach(v => {
        if (v === "A") rawA++;
        if (v === "B") rawB++;
    });

    let falA = 0; let falB = 0;
    round.fallaciesSignaled.forEach(f => {
        if (f.accusedId === round.debatienteA_Id) falA++;
        else if (f.accusedId === round.debatienteB_Id) falB++;
    });

    const finalA = Math.max(0, rawA - falA);
    const finalB = Math.max(0, rawB - falB);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '2px' }}>RESULTADO DE RONDA</span>
                <h1 style={{ fontSize: '2rem', color: 'white', marginTop: '0.5rem', lineHeight: 1.2 }}>
                    “{topic?.statement}”
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: finalA > finalB ? '6px solid var(--success-color)' : '6px solid var(--border-color)', opacity: finalA > finalB ? 1 : 0.8 }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>A FAVOR</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem' }}>{pA?.name}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Votos Recibidos:</span>
                        <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+{rawA}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Falacias en Contra:</span>
                        <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>-{falA}</span>
                    </div>

                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Puntos Obtenidos</div>
                    <div style={{ fontSize: '4rem', fontWeight: 900, color: finalA > finalB ? 'var(--success-color)' : 'white' }}>{finalA}</div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: finalB > finalA ? '6px solid var(--success-color)' : '6px solid var(--border-color)', opacity: finalB > finalA ? 1 : 0.8 }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>EN CONTRA</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem' }}>{pB?.name}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Votos Recibidos:</span>
                        <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+{rawB}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Falacias en Contra:</span>
                        <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>-{falB}</span>
                    </div>

                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Puntos Obtenidos</div>
                    <div style={{ fontSize: '4rem', fontWeight: 900, color: finalB > finalA ? 'var(--success-color)' : 'white' }}>{finalB}</div>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <h2 className="title-serif" style={{ fontSize: '2.5rem', color: 'var(--warning-color)', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}>
                    {finalA === finalB ? '¡EMPATE!' : finalA > finalB ? `¡GANA ${pA?.name.toUpperCase()}!` : `¡GANA ${pB?.name.toUpperCase()}!`}
                </h2>
            </div>

            <button
                onClick={onShowLeaderboard}
                style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(255, 94, 58, 0.4)' }}
            >
                Ver Tabla de Posiciones 🏆
            </button>
        </div>
    );
}
