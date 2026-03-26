import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
    return (
        <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh', padding: '2rem' }}>
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '500px' }}>
                <div style={{ opacity: 0.5 }}>
                    <Logo width={160} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 className="title-serif" style={{ fontSize: '4rem', color: 'var(--accent-color)', margin: 0, lineHeight: 1, textShadow: '0 4px 20px rgba(255, 94, 58, 0.3)' }}>
                        404
                    </h1>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'white' }}>
                        Premisa Denegada
                    </h2>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--danger-color)', width: '100%' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                        Esta sala fue clausurada, el debate se quedó sin tiempo, o el enlace simplemente no existe en nuestros registros.
                    </p>
                </div>

                <Link 
                    href="/" 
                    className="animate-pulse-glow"
                    style={{ 
                        padding: '1rem 2rem', 
                        backgroundColor: 'var(--accent-color)', 
                        color: 'white', 
                        borderRadius: 'var(--radius-md)', 
                        fontWeight: 700, 
                        fontSize: '1.1rem',
                        marginTop: '1rem',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                    }}
                >
                    Volver a la civilización
                </Link>
            </div>
        </div>
    );
}
