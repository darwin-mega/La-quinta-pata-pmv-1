import { Room } from "@/lib/store";

export default function MesaLeaderboardView({ room, onNextRound }: { room: Room, onNextRound: () => void }) {
    
    // Ordenar jugadores por score descendente
    const sortedPlayers = [...room.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.wins - a.wins; // Desempate por victorias
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', fontWeight: 900, color: 'var(--warning-color)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>TABLA DE POSICIONES</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.5rem' }}>Acumulado después de {room.currentRoundIndex + 1} ronda(s)</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                {/* Cabecera de la tabla */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px', padding: '0 1rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    <div>Pos</div>
                    <div>Jugador</div>
                    <div style={{ textAlign: 'center' }}>Victorias</div>
                    <div style={{ textAlign: 'right', color: 'white' }}>PUNTOS</div>
                </div>
                
                {/* Filas */}
                {sortedPlayers.map((player, index) => (
                    <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px', alignItems: 'center', padding: '1rem', background: index === 0 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: index === 0 ? '1px solid var(--warning-color)' : '1px solid transparent' }}>
                        
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: index === 0 ? 'var(--warning-color)' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-secondary)' }}>
                            #{index + 1}
                        </div>
                        
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {player.name} {index === 0 && '👑'}
                        </div>
                        
                        <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                            {player.wins}
                        </div>
                        
                        <div style={{ textAlign: 'right', fontSize: '1.8rem', fontWeight: 900, color: index === 0 ? 'var(--warning-color)' : 'white' }}>
                            {player.score}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                <button
                    onClick={() => {
                        if(confirm('¿Seguro quieres terminar la partida y volver al inicio?')) {
                            window.location.href = '/';
                        }
                    }}
                    style={{ padding: '1.5rem', backgroundColor: 'transparent', border: '2px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    Terminar Partida
                </button>
                <button
                    onClick={onNextRound}
                    style={{ padding: '1.5rem', backgroundColor: 'var(--success-color)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }}
                >
                    Siguiente Debate ⏭
                </button>
            </div>
        </div>
    );
}
