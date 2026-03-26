import { useState } from "react";
import { Room } from "@/lib/store";

export default function VotingView({ room, playerId, isHost, onVote, onCloseVoting }: {
    room: Room, playerId: string, isHost: boolean,
    onVote: (votedForId: string, reason: string) => void,
    onCloseVoting: () => void
}) {
    const round = room.rounds[room.currentRoundIndex];
    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    const [mainVote, setMainVote] = useState<string | null>(null);
    const [reasonVote, setReasonVote] = useState<string>("claro");
    const [hasVoted, setHasVoted] = useState(false);

    // Debaters cannot vote in this MVP
    const isDebater = playerId === round.debatienteA_Id || playerId === round.debatienteB_Id;

    const handleVoteSubmit = () => {
        if (mainVote) {
            onVote(mainVote, reasonVote);
            setHasVoted(true);
        }
    };

    const totalVotes = Object.keys(round.votes).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 className="title-serif" style={{ fontSize: '1.8rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                    Tiempo de Votar
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    El debate ha concluido. El jurado elige.
                </p>
            </div>

            {room.players.length === 2 ? (
                hasVoted ? (
                    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Decisión registrada</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Esperando la resolución del otro jugador...</p>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>¿Quién argumentó mejor?</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>Ambos deben elegir el mismo resultado para que sea válido, de lo contrario será empate.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button onClick={() => { onVote("A", ""); setHasVoted(true) }} style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `2px solid var(--border-color)`, backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
                                    🔴 Ganó {pA?.name}
                                </button>
                                <button onClick={() => { onVote("B", ""); setHasVoted(true) }} style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `2px solid var(--border-color)`, backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>
                                    🔵 Ganó {pB?.name}
                                </button>
                                <button onClick={() => { onVote("empate", ""); setHasVoted(true) }} style={{ padding: '1.2rem', borderRadius: 'var(--radius-md)', border: `2px solid var(--warning-color)`, backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning-color)', fontWeight: 600, fontSize: '1.1rem' }}>
                                    🤝 Empatar Ronda
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : !isDebater && room.players.length > 2 ? (
                hasVoted ? (
                    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Tu voto fue registrado</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Esperando que los demás terminen...</p>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}>¿Quién argumentó mejor?</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setMainVote(round.debatienteA_Id)}
                                    style={{ flex: 1, padding: '1.5rem 1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${mainVote === round.debatienteA_Id ? '#ef4444' : 'var(--border-color)'}`, backgroundColor: mainVote === round.debatienteA_Id ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-color)', color: 'var(--text-primary)', transition: 'all 0.2s', fontWeight: 600, fontSize: '1.1rem' }}
                                >
                                    🔴 {pA?.name}
                                </button>
                                <button
                                    onClick={() => setMainVote(round.debatienteB_Id)}
                                    style={{ flex: 1, padding: '1.5rem 1rem', borderRadius: 'var(--radius-md)', border: `2px solid ${mainVote === round.debatienteB_Id ? '#3b82f6' : 'var(--border-color)'}`, backgroundColor: mainVote === round.debatienteB_Id ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-color)', color: 'var(--text-primary)', transition: 'all 0.2s', fontWeight: 600, fontSize: '1.1rem' }}
                                >
                                    🔵 {pB?.name}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Principal virtud (Opcional)</h3>
                            <select
                                value={reasonVote}
                                onChange={(e) => setReasonVote(e.target.value)}
                                style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '1rem' }}
                            >
                                <option value="claro">Fue más claro/didáctico</option>
                                <option value="solido">Sus argumentos fueron más sólidos</option>
                                <option value="respuesta">Respondió mejor y arrinconó al rival</option>
                            </select>
                        </div>

                        <button
                            onClick={handleVoteSubmit}
                            disabled={!mainVote}
                            style={{ padding: '1rem', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600, opacity: mainVote ? 1 : 0.5, marginTop: '1rem' }}
                        >
                            Confirmar Voto
                        </button>
                    </div>
                )
            ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Como debatiente de esta ronda, no puedes votar.</p>
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>Espera los resultados del jurado.</p>
                </div>
            )}

            {isHost && (
                <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px dashed var(--border-color)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Votos registrados: {totalVotes}</p>
                    <button
                        onClick={onCloseVoting}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 500 }}
                    >
                        Finalizar Votación 📊
                    </button>
                </div>
            )}
        </div>
    );
}
