import { Room } from "@/lib/store";
import { fallacies } from "@/data/fallacies";
import { useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, Scale } from "lucide-react";

export default function FallacyReviewView({ room, playerId, isHost, onVote }: {
    room: Room, playerId: string, isHost: boolean, onVote: (v: "yes" | "no" | "resolve_force" | "force_accept" | "force_reject") => void
}) {
    const round = room.rounds[room.currentRoundIndex];
    const challenge = round.activeChallenge;

    if (!challenge) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay falacia activa...</div>;

    const fallacyDef = fallacies.find(f => f.id === challenge.fallacyId);
    const accuser = room.players.find(p => p.id === challenge.accuserId);
    
    // El acusado es quien estaba hablando
    const accused = room.players.find(p => p.id === challenge.accusedId);

    const isInvolved = playerId === challenge.accuserId || playerId === challenge.accusedId;
    const hasVoted = challenge.yesVotes.includes(playerId) || challenge.noVotes.includes(playerId);

    const totalVoters = Math.max(1, room.players.length - 2); // Todos menos acusador y acusado
    const votesCount = challenge.yesVotes.length + challenge.noVotes.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', animation: 'fadeIn 0.3s ease-out', padding: '1rem' }}>
            
            {/* CABECERA DE ALERTA */}
            <div style={{ 
                textAlign: 'center', 
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
                color: 'white', 
                padding: '1.2rem', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.2 }}>
                    <ShieldAlert size={80} />
                </div>
                <h1 style={{ fontSize: '1.6rem', margin: 0, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>¡JUICIO EXPRESS!</h1>
                <p style={{ margin: '0.2rem 0 0', fontWeight: 700, fontSize: '0.9rem', opacity: 0.9 }}>EL DEBATE SE HA DETENIDO</p>
            </div>

            {/* DETALLE DE LA DENUNCIA */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '5px solid var(--accent-color)', background: 'rgba(255, 94, 58, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>DENUNCIA DE {accuser?.name}</span>
                </div>
                
                <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 800, margin: '0.5rem 0', lineHeight: 1.2 }}>{fallacyDef?.name}</h2>
                <p style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>{fallacyDef?.technicalName}</p>
                
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.4, margin: 0 }}>{fallacyDef?.definition}</p>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>¿Cometió {accused?.name} esta falacia?</p>
                </div>
            </div>

            {/* ZONA DE VOTACIÓN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                {!isInvolved ? (
                    !hasVoted ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => onVote("no")}
                                    style={{ 
                                        flex: 1, 
                                        padding: '1.5rem 1rem', 
                                        backgroundColor: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.2)', 
                                        color: 'white', 
                                        borderRadius: 'var(--radius-md)', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <XCircle color="rgba(255,255,255,0.5)" />
                                    <span>NO</span>
                                </button>
                                <button
                                    onClick={() => onVote("yes")}
                                    style={{ 
                                        flex: 1, 
                                        padding: '1.5rem 1rem', 
                                        backgroundColor: 'var(--success-color)', 
                                        border: 'none', 
                                        color: 'white', 
                                        borderRadius: 'var(--radius-md)', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CheckCircle />
                                    <span>SÍ</span>
                                </button>
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Los involucrados no votan. El jurado restante decide.
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
                            <Scale size={40} color="var(--accent-color)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 800 }}>Veredicto Enviado</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Escrutinio en progreso: <strong>{votesCount} de {totalVoters}</strong> votos registrados.</p>
                            
                            {/* Barra de progreso visual */}
                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', marginTop: '1.5rem', overflow: 'hidden' }}>
                                <div style={{ width: `${(votesCount / totalVoters) * 100}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(255, 94, 58, 0.05)', border: '1px solid rgba(255, 94, 58, 0.2)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{playerId === challenge.accusedId ? "🤐" : "⚖️"}</div>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            {playerId === challenge.accusedId ? "Estás bajo juicio" : "Denuncia realizada"}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Como parte involucrada, no podés votar en esta instancia.<br/>El jurado está deliberando...
                        </p>
                    </div>
                )}

                {isHost && (
                    <div style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => onVote("force_reject")}
                                style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Forzar Rechazo
                            </button>
                            <button
                                onClick={() => onVote("force_accept")}
                                style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px dashed var(--accent-color)', color: 'var(--accent-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                                Forzar Aceptación
                            </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem' }}>SOLO PARA CASOS EXCEPCIONALES / DESCONEXIONES</p>
                    </div>
                )}
            </div>
        </div>
    );
}
