import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check } from "lucide-react";
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Logo width={180} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '350px' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-color)', borderLeft: '4px solid var(--accent-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>SALA</span>
                    <span className="title-serif" style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '2px', color: 'white' }}>{room.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'var(--surface-color)', borderLeft: `4px solid ${room.intensity === 'liviano' ? 'var(--success-color)' : room.intensity === 'medio' ? 'var(--brand-secondary)' : 'var(--danger-color)'}`, borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Intensidad</div>
                        <div style={{ fontWeight: 700, color: 'white' }}>{room.intensity.toUpperCase()}</div>
                    </div>
                    <div style={{ flex: 1, padding: '0.75rem', background: 'var(--surface-color)', borderLeft: '4px solid var(--warning-color)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Duración</div>
                        <div style={{ fontWeight: 700, color: 'white' }}>{room.duration.toUpperCase()}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '350px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Entrá desde otro dispositivo con esta dirección:</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '0.5rem', gap: '0.5rem', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {joinUrl}
                        </span>
                        <button 
                            onClick={handleCopy}
                            style={{ background: 'transparent', border: 'none', color: copied ? 'var(--success-color)' : 'var(--accent-color)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Copiar link"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>

                    {typeof window !== 'undefined' && window.location.hostname === 'localhost' && !localIp && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                            (Abrí la app usando la IP local en vez de localhost para que otros puedan unirse)
                        </p>
                    )}
                </div>

                <div style={{ padding: '12px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <QRCodeCanvas value={joinUrl} size={150} />
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.5rem' }}>O escaneá el QR con la cámara.</p>
            </div>

            <div style={{ width: '100%', maxWidth: '350px', textAlign: 'left', marginTop: '1rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Jugadores en sala</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>{room.players.length}</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {room.players.map(p => (
                        <li key={p.id} className="animate-fade-in" style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'white' }}>{p.name}</span>
                            {p.id === room.hostId && <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '100px' }}>👑 Host</span>}
                        </li>
                    ))}
                </ul>
            </div>

            {isHost ? (
                <button
                    onClick={() => {
                        import('@/lib/sounds').then(m => m.playButtonSound());
                        onStart();
                    }}
                    className={room.players.length >= 2 ? "animate-pulse-glow" : ""}
                    style={{
                        width: '100%', maxWidth: '350px', padding: '1.25rem',
                        background: room.players.length < 2 ? 'var(--surface-color)' : 'var(--accent-color)',
                        border: room.players.length < 2 ? '1px solid var(--border-color)' : 'none',
                        color: room.players.length < 2 ? 'var(--text-secondary)' : 'white',
                        borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 700, marginTop: '1rem',
                        boxShadow: room.players.length < 2 ? 'none' : '0 8px 25px rgba(255, 94, 58, 0.3)',
                        transition: 'all 0.3s'
                    }}
                    disabled={room.players.length < 2}
                >
                    {room.players.length < 2 ? "Faltan jugadores..." : "Iniciar Partida ⚡"}
                </button>
            ) : (
                <p className="animate-fade-in" style={{ color: 'var(--accent-color)', marginTop: '1rem', fontWeight: 600 }}>Esperando al host para iniciar...</p>
            )}

            {/* FRASE MOTIVADORA / EDUCATIVA */}
            <div className="glass-panel" style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--text-secondary)', width: '100%', maxWidth: '350px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>TIP DE DEBATE</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>“{randomTip}”</p>
            </div>
        </div>
    );
}
