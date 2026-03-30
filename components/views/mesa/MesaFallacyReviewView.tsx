import { Room } from "@/lib/store";
import { fallacies } from "@/data/fallacies";

export default function MesaFallacyReviewView({ 
    room, onForceAccept, onForceReject 
}: {
    room: Room,
    onForceAccept: () => void,
    onForceReject: () => void
}) {
    const round = room.rounds[room.currentRoundIndex];
    if (!round) return null;
    
    const challenge = round.activeChallenge;
    if (!challenge) return <div>No hay falacia activa...</div>;

    const fallacyDef = fallacies.find(f => f.id === challenge.fallacyId);
    const accused = room.players.find(p => p.id === challenge.accusedId);
    const accuser = room.players.find(p => p.id === challenge.accuserId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            
            {/* HEADER */}
            <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--danger-color), #b91c1c)', color: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1.1, fontWeight: 900 }}>⚠️ ¡FALACIA DETECTADA!</h1>
                <p style={{ margin: '1rem 0 0', fontWeight: 'bold', fontSize: '1.3rem', opacity: 0.9 }}>
                    El debate ha sido pausado para revisión del grupo.
                </p>
            </div>

            {/* QUIÉN VS QUIÉN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--warning-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-color)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                        DETECTÓ LA TRAMPA
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{accuser?.name ?? '?'}</div>
                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(245,158,11,0.15)', borderRadius: '100px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--warning-color)', fontWeight: 700 }}>
                        Si se acepta → <strong>+1 punto</strong>
                    </div>
                </div>

                <div style={{ fontSize: '2rem', color: 'var(--text-secondary)', fontWeight: 900, opacity: 0.4, textAlign: 'center' }}>
                    VS
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--danger-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--danger-color)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                        ACUSADO DE LA FALACIA
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{accused?.name ?? '?'}</div>
                    <div style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.15)', borderRadius: '100px', display: 'inline-block', fontSize: '0.85rem', color: 'var(--danger-color)', fontWeight: 700 }}>
                        Si se acepta → <strong>-1 punto</strong>
                    </div>
                </div>
            </div>

            {/* DETALLE DE LA FALACIA */}
            <div className="glass-panel" style={{ padding: '2rem', borderLeft: '8px solid var(--warning-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>FALACIA SEÑALADA:</span>
                    <h2 style={{ fontSize: '2rem', color: 'white', margin: '0.5rem 0 0' }}>
                        {fallacyDef?.name}{' '}
                        <span style={{ fontSize: '1rem', color: 'var(--accent-color)', fontWeight: 600 }}>({fallacyDef?.technicalName})</span>
                    </h2>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--warning-color)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Definición</h3>
                    <p style={{ color: 'white', fontSize: '1.15rem', lineHeight: 1.6, margin: 0 }}>"{fallacyDef?.definition}"</p>
                </div>

                {fallacyDef?.example && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Ejemplo</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>"{fallacyDef.example}"</p>
                    </div>
                )}
            </div>

            {/* PREGUNTA DE DECISIÓN */}
            <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    ¿El grupo acepta que <span style={{ color: 'var(--danger-color)' }}>{accused?.name}</span> cometió esta falacia?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
                    Discutid en mesa y que el conductor tome la decisión.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <button
                        onClick={onForceReject}
                        style={{ 
                            padding: '2rem', 
                            backgroundColor: 'transparent', 
                            border: '2px solid rgba(255,255,255,0.2)', 
                            color: 'white', 
                            borderRadius: 'var(--radius-md)', 
                            fontSize: '1.4rem', 
                            fontWeight: 800, 
                            cursor: 'pointer', 
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        ❌ RECHAZAR
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.6 }}>Continuar debate, sin cambios de puntaje</span>
                    </button>
                    <button
                        onClick={onForceAccept}
                        style={{ 
                            padding: '2rem', 
                            backgroundColor: 'var(--success-color)', 
                            border: 'none', 
                            color: 'white', 
                            borderRadius: 'var(--radius-md)', 
                            fontSize: '1.4rem', 
                            fontWeight: 900, 
                            cursor: 'pointer', 
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)', 
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        ✅ ACEPTAR FALACIA
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.85 }}>
                            {round.fallaciesSignaled.length < 3 
                                ? `+1 para ${accuser?.name} · -1 para ${accused?.name}` 
                                : "Puntos al límite por esta ronda (máx 3)"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
