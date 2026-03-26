import { useState } from "react";
import { getFallacies } from "@/data/fallacies";

export default function FallacyPanel({ onSignal, onClose }: { onSignal: (fId: string) => void, onClose: () => void }) {
    const fallacies = getFallacies();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--bg-color)',
            zIndex: 100,
            padding: 'var(--spacing-4)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h2 className="title-serif" style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>Detectar Falacia</h2>
                <button onClick={onClose} style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', padding: '0.5rem' }}>✕</button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Toca una falacia para ver su explicación. Si estás seguro, denunciala para que el resto de la sala la valide.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '3rem' }}>
                {fallacies.map(f => {
                    const isExpanded = expandedId === f.id;
                    const isConfirming = confirmingId === f.id;

                    return (
                        <div key={f.id} className="glass-panel" style={{
                            padding: '1.2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            borderColor: isExpanded ? 'var(--accent-color)' : 'var(--border-color)',
                            transition: 'all 0.2s',
                            cursor: !isExpanded ? 'pointer' : 'default'
                        }}
                            onClick={() => !isExpanded && setExpandedId(f.id)}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>{f.name}</h3>
                                {!isExpanded && <span style={{ color: 'var(--text-secondary)' }}>▼</span>}
                                {isExpanded && <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setExpandedId(null); setConfirmingId(null); }}>▲</span>}
                            </div>

                            {isExpanded && (
                                <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{f.technicalName}</p>
                                    <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{f.definition}</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '0.5rem', borderLeft: '2px solid var(--text-secondary)', marginBottom: '1.5rem' }}>Ej: {f.example}</p>

                                    {!isConfirming ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmingId(f.id); }}
                                                style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}
                                            >
                                                Denunciar falacia
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedId(null); setConfirmingId(null); }}
                                                style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-sm)' }}>
                                            <p style={{ color: 'white', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>¿Seguro que quieres denunciar esta falacia?</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingId(null); }}
                                                    style={{ flex: 1, padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSignal(f.id);
                                                        onClose();
                                                    }}
                                                    style={{ flex: 1, padding: '0.8rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 700, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                                                >
                                                    Sí, Confirmar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
