import { useEffect } from "react";
import { Room } from "@/lib/store";
import { fallacies } from "@/data/fallacies";
import { playWinSound } from "@/lib/sounds";

export default function ResultView({ room, isHost, onNextRound }: { room: Room, isHost: boolean, onNextRound: () => void }) {
    const round = room.rounds[room.currentRoundIndex];
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    useEffect(() => {
        playWinSound();
    }, []);

    let votesA = 0;
    let votesB = 0;
    Object.values(round.votes).forEach(vId => {
        if (vId === round.debatienteA_Id) votesA++;
        if (vId === round.debatienteB_Id) votesB++;
    });

    const totalFallacies = round.fallaciesSignaled.length;

    // Aggregate fallacies for UI
    const fallacyCounts: Record<string, number> = {};
    round.fallaciesSignaled.forEach(f => {
        fallacyCounts[f.fallacyId] = (fallacyCounts[f.fallacyId] || 0) + 1;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>

            {/* HEREDERO DEL RESULTADO */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'inline-block', padding: '0.25rem 1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Resolución de Ronda {round.number}
                </div>
                <h2 className="title-serif" style={{ fontSize: '2.5rem', color: round.winnerId === 'empate' ? 'var(--warning-color)' : 'var(--success-color)', marginBottom: '0.5rem', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    {round.winnerId === 'empate' ? '🤝 ¡Empate!' : '🏆 ¡Ganador!'}
                </h2>
                {round.winnerId !== 'empate' && (
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        El debate fue para <strong style={{ color: round.winnerId === round.debatienteA_Id ? '#ef4444' : '#3b82f6', fontSize: '1.4rem' }}>{round.winnerId === round.debatienteA_Id ? pA?.name : pB?.name}</strong>.
                    </p>
                )}
            </div>

            {/* BARRA DE VOTOS */}
            {room.players.length > 2 && (
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(145deg, rgba(239,68,68,0.05) 0%, rgba(59,130,246,0.05) 100%)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: round.winnerId === pB?.id ? 0.4 : 1, transition: 'all 0.3s' }}>
                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔴</span>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>{pA?.name}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{votesA} votos</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.5 }}>vs</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: round.winnerId === pA?.id ? 0.4 : 1, transition: 'all 0.3s' }}>
                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔵</span>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>{pB?.name}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{votesB} votos</span>
                    </div>
                </div>
            )}

            {/* TABLA GENERAL */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-color)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ranking Global</span>
                    <span>📈</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[...room.players].sort((a, b) => b.score - a.score).map((p, idx) => {
                        const isFirst = idx === 0 && p.score > 0;
                        return (
                            <div key={p.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem',
                                background: isFirst ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                                border: isFirst ? '1px solid var(--accent-color)' : '1px solid transparent',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isFirst ? 'var(--accent-color)' : 'var(--text-secondary)', width: '20px', textAlign: 'center' }}>
                                        {idx + 1}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white' }}>{p.name}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: isFirst ? 'var(--accent-color)' : 'white' }}>{p.score} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>pts</span></span>
                                    {p.wins > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>{p.wins} {p.wins === 1 ? 'voto/victoria' : 'victorias'}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SECCIÓN FALACIAS */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.05)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⚠️ Inspección de Lógica
                </h3>

                {totalFallacies === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>¡Un debate muy limpio! No se detectaron trampas discursivas graves.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>El radar detectó {totalFallacies} posibles fallos argumentativos:</p>
                        {Object.entries(fallacyCounts).map(([fid, count]) => {
                            const fData = fallacies.find(f => f.id === fid);
                            return (
                                <div key={fid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--danger-color)' }}>
                                    <span style={{ fontWeight: 600, color: 'white' }}>{fData?.name}</span>
                                    <span style={{ color: 'var(--danger-color)', fontWeight: 800, background: 'rgba(244,63,94,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>x{count}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ACCIONES */}
            {isHost ? (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={onNextRound}
                        style={{ width: '100%', padding: '1.25rem', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 800, boxShadow: '0 8px 25px rgba(255, 94, 58, 0.3)', transition: 'transform 0.2s' }}
                    >
                        Siguiente Ronda ⏭
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>O podés salir cerrando desde arriba.</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <p className="animate-fade-in" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Esperando que el Host inicie la próxima ronda...</p>
                </div>
            )}
        </div>
    );
}
