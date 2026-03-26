import Link from 'next/link';
import Logo from '@/components/Logo';
import JoinInput from '@/components/JoinInput';

export default function Home() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.5rem', overflowX: 'hidden' }}>

            {/* HEROS SECTION */}
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '4rem', gap: '1.5rem', maxWidth: '800px' }}>

                <div style={{ position: 'relative', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0 }}></div>
                    <div style={{ position: 'relative', zIndex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <Logo width={280} />
                    </div>
                </div>

                <div style={{ display: 'inline-block', border: '1px solid var(--accent-light)', backgroundColor: 'rgba(255, 94, 58, 0.08)', padding: '0.4rem 1.2rem', borderRadius: '100px', fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    El juego donde las ideas se ponen a prueba
                </div>

                <h1 className="title-serif" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, color: '#ffffff', textShadow: '0 4px 10px rgba(0,0,0,0.5)', marginTop: '0.5rem' }}>
                    No gana el que grita más.<br />
                    <span style={{ color: 'var(--accent-color)' }}>Gana el que argumenta mejor.</span>
                </h1>

                <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, margin: '1rem auto' }}>
                    Convertí una charla cualquiera en una experiencia de tensión, puntos y estrategia. Entrás por diversión. Salís con mejores herramientas para pensar.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '350px', marginTop: '1rem' }}>
                    <Link href="/create-room" style={{ display: 'block', padding: '1.25rem', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 8px 25px rgba(255, 94, 58, 0.3)', transition: 'transform 0.2s', textAlign: 'center' }}>
                        Crear Sala ⚡
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>O ingresá un código</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <JoinInput />

                    <Link href="/how-to-play" style={{ display: 'block', padding: '1rem', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1rem', transition: 'background-color 0.2s', textAlign: 'center', marginTop: '1rem' }}>
                        Ver cómo funciona
                    </Link>
                </div>
            </div>

            {/* BENEFITS SECTION */}
            <div className="animate-fade-in" style={{
                marginTop: '6rem',
                marginBottom: '4rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                maxWidth: '900px',
                width: '100%'
            }}>
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--accent-color)' }}>
                    <div style={{ fontSize: '2rem' }}>🔥</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Divertido de verdad</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Convertí una discusión en un juego social con estructura, turnos cerrados, puntaje y tensión estratégica.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--brand-secondary)' }}>
                    <div style={{ fontSize: '2rem' }}>🧠</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Te deja algo más</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Mientras jugás y tratás de ganar, en realidad practicás lógica, retórica, y detectás trampas discursivas.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--success-color)' }}>
                    <div style={{ fontSize: '2rem' }}>👥</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Ideal para grupo</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Entran todos por QR, se asignan roles, debaten cara a cara, el jurado vota en el celular y se resuelve en minutos.</p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--warning-color)' }}>
                    <div style={{ fontSize: '2rem' }}>🗡️</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Para ir al hueso</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>Elegí temas livianos para romper el hielo o métete en la intensidad filosa de política, moral y filosofía.</p>
                </div>
            </div>

            <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                La Quinta Pata © 2026. Tu cerebro te lo agradece.
            </footer>
        </main>
    );
}
