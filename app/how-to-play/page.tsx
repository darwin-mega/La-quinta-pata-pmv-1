"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function Accordion({ title, brief, children }: { title: string, brief: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`glass-panel animate-fade-in ${styles.stepCard}`} style={{ padding: '1.5rem', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
            <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>{brief}</p>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-color)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        marginTop: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: 0
                    }}
                >
                    {isOpen ? 'Ocultar detalles ⬆' : 'Ver más detalles ⬇'}
                </button>
            </div>

            {isOpen && (
                <div className="animate-fade-in" style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function HowToPlay() {
    return (
        <main className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className={styles.header}>
                <h1 className="title-serif">Cómo se juega</h1>
                <p className={styles.subtitle}>El manual táctico para ganar en La Quinta Pata</p>
            </div>

            <div className={styles.steps}>

                <Accordion
                    title="1. La Sala y los Jugadores"
                    brief="Cualquiera puede crear la sala. Los demás entran escaneando el código QR con el celular y eligen su alias."
                >
                    <div style={{ padding: '0.5rem 0' }}>
                        <p style={{ fontWeight: 800, color: 'var(--success-color)', marginBottom: '0.2rem' }}>¿Qué pasa si juegan exactamente 2 personas?</p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>El motor del juego se adapta. Evidentemente no contarán con audiencias o jurados externos. Al final del duelo ustedes mismos definirán mediante votación cómo se sintieron con el choque, si la victoria pesa hacia alguien o si consideran que terminaron en empate de argumentos.</p>
                    </div>
                </Accordion>

                <Accordion
                    title="2. Tema, Premisa y Postura"
                    brief="La app selecciona sorpresivamente dos personas para debatir y les asigna tajantemente de qué lado deben tirar."
                >
                    <div style={{ padding: '0.5rem 0' }}>
                        <p style={{ fontWeight: 800, color: 'var(--success-color)', marginBottom: '0.2rem' }}>¿Cuál es la diferencia entre Tema, Premisa y Postura?</p>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong style={{ color: 'white' }}>El Tema:</strong> La categoría global (Ej.: <em>Tecnología y Sociedad</em>).</li>
                            <li><strong style={{ color: 'white' }}>La Premisa:</strong> Es la frase de choque. La chispa exacta donde nos vamos a pelear (Ej.: <em>La Inteligencia Artificial está arruinando la educación</em>).</li>
                            <li><strong style={{ color: 'white' }}>La Postura:</strong> Lo que a ti te toca defender sí o sí. Ya sea <em>A favor</em> o <em>En contra</em>, debes acomodar la cabeza a eso, sin importar tu verdadera moral en la vida.</li>
                        </ul>
                    </div>
                </Accordion>

                <Accordion
                    title="3. El Reloj de Ajedrez (Tiempo)"
                    brief="Debates de estilo ágil con tiempo global. Si hablas mucho te fundes, pasa el turno cuando debas."
                >
                    <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--warning-color)', marginBottom: '0.2rem' }}>¿Cómo funciona el tiempo individual?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Tienen cada uno un reloj con su tiempo neto total de la ronda (Ej. 2 minutos). Tu reloj solo corre mientras es tu palabra y tienes el micrófono. Lo que sobra de tu exposición, se te guarda.</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--warning-color)', marginBottom: '0.2rem' }}>¿Cómo paso la palabra?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Cuando mandas tu golpe retórico tocas el botón <strong>Pasar la palabra</strong>. Tu reloj clava los frenos al instante. Entra una transición de hasta 10 segundos donde tu rival se acomoda, y luego su reloj empezará a descontar.</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--warning-color)', marginBottom: '0.2rem' }}>¿Qué pasa cuando se me acaba el tiempo?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Que te quedas en absoluto silencio argumental. El otro jugador, si aún dispone de tiempo, puede quedarse acaparando el estrado para cerrar su idea hasta que se agote su reloj a gusto (o hasta que pulse <strong>Ceder mi tiempo restante</strong>).</p>
                        </div>
                    </div>
                </Accordion>

                <Accordion
                    title="4. Denuncia de Falacias"
                    brief="Una de tus principales armas es saber identificar si el otro hace trampa lógicamente y sacarlo de lugar."
                >
                    <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--danger-color)', marginBottom: '0.2rem' }}>¿Cómo se señalan y cómo frenan la ronda las Falacias?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Sí, señalar falacias <strong>frena instantáneamente el reloj</strong> de la ronda. Tantos los jurados como los rivales ven el botón de <em>Detectar Falacia</em> en su celular. Al pulsarlo despliega los tipos y una descripción. Si lo señalas, el tiempo activo se paraliza, la ronda entra en revisión, y todos revisarán de forma anónima y veloz si el golpe de falacia es genuino o no.</p>
                        </div>
                    </div>
                </Accordion>

                <Accordion
                    title="5. Resolución y Puntaje"
                    brief="Cuando ambos agotan su tiempo el sistema solicita las cartas al jurado de forma secreta."
                >
                    <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.2rem' }}>¿Cómo funciona la votación y los puntos?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>El jurado tiene su celular para emitir votos secretos. Ganar la confrontación te arroja +3 puntos al score. Pero si alguien del jurado detecta hacia dónde va inclinada la balanza real del grupo, ese espectador gana +1 punto por olfato agudo del público.</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.2rem' }}>¿Cuándo acaba la partida?</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Una ronda finaliza explícitamente cuando las votaciones secretas cierran. A partir de allí mostrará los puntajes de victoria. Luego de eso dependerá enteramente del perfil del Host seguir lanzando rondas enérgicas con los otros participantes pasivos de la sala, hasta que agoten los temas candentes de curiosidad del grupo.</p>
                        </div>
                    </div>
                </Accordion>

            </div>

            <div className={styles.actions} style={{ marginTop: '2.5rem' }}>
                <Link href="/" className={styles.backButton}>
                    Volver al inicio
                </Link>
                <Link href="/create-room" className={styles.primaryButton}>
                    ¡Crear una sala!
                </Link>
            </div>
        </main>
    );
}
