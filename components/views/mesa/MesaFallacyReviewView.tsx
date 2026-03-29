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
    const speakerId = round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;
    const speaker = room.players.find(p => p.id === speakerId);
    const accuser = room.players.find(p => p.id === challenge.accuserId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', background: 'var(--danger-color)', color: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}>
                <h1 style={{ fontSize: '3rem', margin: 0, textTransform: 'uppercase', lineHeight: 1.1, fontWeight: 900 }}>¡DEBATE PAUSADO!</h1>
                <p style={{ margin: '1rem 0 0', fontWeight: 'bold', fontSize: '1.5rem', opacity: 0.9 }}>
                    <span style={{ color: 'var(--warning-color)' }}>{accuser?.name}</span> señaló una trampa en el argumento de {speaker?.name}.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', borderLeft: '8px solid var(--warning-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>FALACIA DENUNCIADA:</span>
                    <h2 style={{ fontSize: '2.5rem', color: 'white', margin: '0.5rem 0' }}>{fallacyDef?.name} <span style={{fontSize:'1.2rem', color:'var(--text-secondary)'}}>({fallacyDef?.technicalName})</span></h2>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--warning-color)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Definición</h3>
                    <p style={{ color: 'white', fontSize: '1.3rem', lineHeight: 1.5 }}>"{fallacyDef?.definition}"</p>
                </div>

                {fallacyDef?.example && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ejemplo</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontStyle: 'italic' }}>{fallacyDef.example}</p>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '2rem' }}>¿El grupo acepta que {speaker?.name} cometió esta falacia?</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <button
                        onClick={onForceReject}
                        style={{ padding: '2rem', backgroundColor: 'var(--surface-color)', border: '2px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        ❌ RECHAZAR<br/><span style={{fontSize: '1rem', fontWeight: 500, opacity: 0.7}}>Continuar debate normal</span>
                    </button>
                    <button
                        onClick={onForceAccept}
                        style={{ padding: '2rem', backgroundColor: 'var(--success-color)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' }}
                    >
                        ✅ ACEPTAR FALACIA<br/><span style={{fontSize: '1rem', fontWeight: 600}}>Queda registrada</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
