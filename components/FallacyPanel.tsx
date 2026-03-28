import { useState } from "react";
import { getFallaciesByHierarchy, FallacyLevel, Fallacy } from "@/data/fallacies";

export default function FallacyPanel({ onSignal, onClose }: { onSignal: (fId: string) => void, onClose: () => void }) {
    const categories = getFallaciesByHierarchy();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FallacyLevel | "todas">("base");

    const renderFallacyCard = (f: Fallacy) => {
        const isExpanded = expandedId === f.id;
        const isConfirming = confirmingId === f.id;

        return (
            <div key={f.id} className="glass-panel" style={{
                padding: isExpanded ? '1.5rem' : '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                borderColor: isExpanded ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                backgroundColor: isExpanded ? 'rgba(255, 94, 58, 0.05)' : 'rgba(255,255,255,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: !isExpanded ? 'pointer' : 'default',
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isExpanded ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
                zIndex: isExpanded ? 10 : 1
            }}
                onClick={() => !isExpanded && setExpandedId(f.id)}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{f.name}</h3>
                        {!isExpanded && <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>{f.technicalName}</span>}
                    </div>
                    {!isExpanded && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ver más</span>}
                    {isExpanded && <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }} onClick={(e) => { e.stopPropagation(); setExpandedId(null); setConfirmingId(null); }}>✕</span>}
                </div>

                {isExpanded && (
                    <div className="animate-fade-in" style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>{f.technicalName}</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.5, marginBottom: '1rem', fontWeight: 400 }}>{f.definition}</p>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-color)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.4 }}>“{f.example}”</p>
                            </div>
                        </div>

                        {!isConfirming ? (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmingId(f.id); }}
                                    style={{ flex: 2, padding: '1rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
                                >
                                    DENUNCIAR FALACIA
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setExpandedId(null); setConfirmingId(null); }}
                                    style={{ flex: 1, padding: '1rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in" style={{ padding: '1.2rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ color: 'white', textAlign: 'center', marginBottom: '1.2rem', fontWeight: 700, fontSize: '1.1rem' }}>¿Confirmar denuncia?</p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setConfirmingId(null); }}
                                        style={{ flex: 1, padding: '0.9rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSignal(f.id);
                                            onClose();
                                        }}
                                        style={{ flex: 1, padding: '0.9rem', backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 800, border: 'none' }}
                                    >
                                        SÍ, CONFIRMAR
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10, 10, 12, 0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 200,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className="title-serif" style={{ fontSize: '2rem', color: 'var(--accent-color)', lineHeight: 1, marginBottom: '0.5rem' }}>Detectar Falacia</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Escuchá con atención y denunciá errores de lógica.</p>
                </div>
                <button 
                    onClick={onClose} 
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        color: 'white', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Selector de jerarquía */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '2rem', 
                padding: '0.3rem', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: 'var(--radius-md)',
                position: 'sticky',
                top: 0,
                zIndex: 20
            }}>
                {(['base', 'intermedia', 'avanzada', 'todas'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '0.7rem 0.2rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            backgroundColor: activeTab === tab ? 'var(--accent-color)' : 'transparent',
                            color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        {tab === 'base' ? 'Básicas' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingBottom: '3rem' }}>
                {activeTab === 'todas' ? (
                    Object.entries(categories).map(([level, items]) => (
                        <div key={level} style={{ marginBottom: '1rem' }}>
                            <h4 style={{ 
                                fontSize: '0.7rem', 
                                color: level === 'base' ? 'var(--accent-color)' : 'var(--text-secondary)', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.2em', 
                                marginBottom: '1rem',
                                borderLeft: `2px solid ${level === 'base' ? 'var(--accent-color)' : 'var(--text-secondary)'}`,
                                paddingLeft: '0.75rem'
                            }}>
                                {level === 'base' ? 'Nivel Base - Fundamentales' : level === 'intermedia' ? 'Nivel Medio' : 'Nivel Avanzado'}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {items.map(renderFallacyCard)}
                            </div>
                        </div>
                    ))
                ) : (
                    categories[activeTab as FallacyLevel]?.map(renderFallacyCard)
                )}
            </div>
        </div>
    );
}
