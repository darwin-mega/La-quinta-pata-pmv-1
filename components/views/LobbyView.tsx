import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, Info, Users, ShieldAlert, Award } from "lucide-react";
import { Room } from "@/lib/store";
import Logo from "@/components/Logo";

const MOTIVATIONAL_PHRASES = [
    "Detectar falacias ayuda a que no te engañen.",
    "Discutir mejor también es pensar mejor.",
    "Argumentar bien vale más que repetir slogans.",
    "Aprender a debatir te obliga a pensar mejor.",
    "No alcanza con opinar: hay que sostener lo que pensás.",
    "Conocer falacias mejora de verdad la forma de debatir.",
    "Saber pensar vale más que saber atacar."
];

export default function LobbyView({ room, isHost, onStart }: { room: Room, isHost: boolean, onStart: () => void }) {
    const [randomTip, setRandomTip] = useState(MOTIVATIONAL_PHRASES[0]);
    const [localIp, setLocalIp] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        setRandomTip(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);

        // Resolver IP local si estamos en localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            fetch('/api/lan-ip')
                .then(res => res.json())
                .then(data => {
                    if (data.ip && data.ip !== '127.0.0.1') {
                        setLocalIp(data.ip);
                    }
                })
                .catch(console.error);
        }
    }, []);

    let baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lajaula.app';
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && localIp) {
        baseUrl = `http://${localIp}:${window.location.port || 3000}`;
    }

    const joinUrl = `${baseUrl}/join/${room.id}`;

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Logo width={160} />
            </div>

            {/* Sala info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '350px' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>SALA</span>
                    <span className="title-serif" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-color)' }}>{room.id}</span>
                </div>
            </div>

            {/* Selector de Onboarding */}
            <button 
                onClick={() => setShowOnboarding(!showOnboarding)}
                style={{ 
                    background: 'rgba(255, 94, 58, 0.1)', 
                    border: '1px solid var(--accent-color)', 
                    color: 'var(--accent-color)', 
                    padding: '0.6rem 1.2rem', 
                    borderRadius: '100px', 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <Info size={16} /> {showOnboarding ? 'Cerrar Guía' : '¿Cómo se juega?'}
            </button>

            {showOnboarding && (
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '380px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '4px solid var(--accent-color)' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={18} color="var(--accent-color)" /> Objetivo</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Debatir una premisa y convencer al jurado. Pero ojo: el jurado no vota su opinión, sino <strong>quién razonó mejor</strong>.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '4px solid #3b82f6' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#3b82f6" /> Roles</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}><strong>Debatientes:</strong> Defienden su postura y evitan errores. <br/><strong>Jurado:</strong> Escucha y denuncia <strong>falacias</strong> en tiempo real.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '4px solid #ef4444' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={18} color="#ef4444" /> Falacias</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Son trucos sucios o errores lógicos. Si detectás una, denunciala. Si el grupo la valida: +1 punto para vos, -1 para el debatiente.</p>
                    </div>
                </div>
            )}

            {!showOnboarding && (
                <>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '350px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.8rem 0' }}>Invitá a los demás escaneando el QR:</p>
                            
                            <div style={{ padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'inline-block' }}>
                                <QRCodeCanvas value={joinUrl} size={160} />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>
                                {joinUrl}
                            </span>
                            <button 
                                onClick={handleCopy}
                                style={{ background: 'transparent', border: 'none', color: copied ? 'var(--success-color)' : 'var(--accent-color)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {copied ? <Check size={18} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ width: '100%', maxWidth: '350px', textAlign: 'left', marginTop: '1rem' }}>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', letterSpacing: '0.1em', fontWeight: 800 }}>
                            <span>Jugadores en espera</span>
                            <span style={{ color: 'white', fontWeight: 900 }}>{room.players.length}</span>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {room.players.map(p => (
                                <div key={p.id} className="animate-fade-in" style={{ padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                                    {p.id === room.hostId && <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>👑</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div style={{ marginTop: '1rem', width: '100%', maxWidth: '350px' }}>
                {isHost ? (
                    <button
                        onClick={() => {
                            import('@/lib/sounds').then(m => m.playButtonSound());
                            onStart();
                        }}
                        className={room.players.length >= 2 ? "animate-pulse-glow" : ""}
                        style={{
                            width: '100%', padding: '1.25rem',
                            background: room.players.length < 2 ? 'rgba(255,255,255,0.05)' : 'var(--accent-color)',
                            border: 'none',
                            color: room.players.length < 2 ? 'rgba(255,255,255,0.2)' : 'white',
                            borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 900,
                            boxShadow: room.players.length < 2 ? 'none' : '0 8px 30px rgba(255, 94, 58, 0.4)',
                            transition: 'all 0.3s',
                            cursor: room.players.length < 2 ? 'not-allowed' : 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                        disabled={room.players.length < 2}
                    >
                        {room.players.length < 2 ? "Esperando Rivales" : "¡SALIR AL RUEDO! ⚡"}
                    </button>
                ) : (
                    <div style={{ 
                        padding: '1.25rem', 
                        background: 'rgba(255, 94, 58, 0.05)', 
                        border: '1px dashed var(--accent-color)', 
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--accent-color)',
                        fontWeight: 700
                    }}>
                        El host iniciará pronto...
                    </div>
                )}
            </div>

            {/* FRASE DE CARGA */}
            <div style={{ marginTop: '1.5rem', opacity: 0.6, maxWidth: '300px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                    “{randomTip}”
                </p>
            </div>
        </div>
    );
}
