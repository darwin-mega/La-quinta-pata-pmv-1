import Link from "next/link";
import JoinInput from "@/components/JoinInput";
import styles from "./page.module.css";

const BENEFITS = [
    {
        title: "Empieza rapido",
        description: "Creas sala en segundos, entras por QR y el debate arranca sin configuraciones pesadas.",
    },
    {
        title: "Temas con ritmo",
        description: "Puedes dejar que el juego elija o tomar el control y decidir el tema de cada ronda.",
    },
    {
        title: "Ideal para grupo",
        description: "Funciona para aula, juntada o sobremesa, con modo individual o modo mesa.",
    },
];

export default function Home() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <video
                    className={styles.heroBackground}
                    src="/media/intro-la-quinta-pata.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/media/fondo.png"
                />
                <div className={styles.heroOverlay} />

                <div className={styles.heroContent}>
                    <div className={styles.copyColumn}>
                        <div className={styles.kicker}>Debate social en modo juego</div>
                        <h1 className={`title-serif ${styles.title}`}>
                            La discusion deja de ser ruido
                            <span className={styles.titleAccent}> y se vuelve juego.</span>
                        </h1>
                        <p className={styles.description}>
                            La Quinta Pata mezcla tension, turnos, falacias, puntos y decisiones rapidas.
                            Entras a debatir. Sales pensando mejor.
                        </p>

                        <div className={styles.actionStack}>
                            <Link href="/create-room" className={styles.primaryCta}>
                                Crear sala
                            </Link>

                            <div className={styles.joinPanel}>
                                <div className={styles.joinLabel}>Entrar con codigo</div>
                                <JoinInput />
                            </div>

                            <div className={styles.secondaryLinks}>
                                <Link href="/how-to-play" className={styles.secondaryCta}>
                                    Ver como funciona
                                </Link>
                                <a href="#trailer" className={styles.ghostLink}>
                                    Ver trailer
                                </a>
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>2 modos</span>
                                <span className={styles.statLabel}>Individual o mesa</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>Hasta 12</span>
                                <span className={styles.statLabel}>Jugadores en mesa</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>1 tema</span>
                                <span className={styles.statLabel}>Por ronda, sin friccion</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.mediaColumn}>
                        <div className={styles.logoShell}>
                            <video
                                className={styles.logoVideo}
                                src="/media/logo-mov.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster="/media/fondo.png"
                            />
                        </div>

                        <div className={styles.heroNote}>
                            <div className={styles.noteTitle}>Ritmo real</div>
                            <p>
                                Crea sala, suma jugadores, define intensidad y arranca. Nada de listas eternas antes de jugar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="trailer" className={styles.trailerSection}>
                <div className={styles.trailerCopy}>
                    <div className={styles.sectionTag}>Trailer</div>
                    <h2 className={`title-serif ${styles.sectionTitle}`}>Mira como se siente una partida</h2>
                    <p className={styles.sectionText}>
                        Una mezcla de juego social, argumentacion, turnos cortos y decision rapida. Ideal para clase,
                        grupo de amigos o dinamicas donde nadie tiene paciencia para configurar de mas.
                    </p>
                </div>

                <div className={styles.trailerFrame}>
                    <div className={styles.trailerDevice}>
                        <div className={styles.trailerTopBar} />
                        <video
                            className={styles.trailerVideo}
                            src="/media/trailer-la-quinta-pata.mp4"
                            controls
                            preload="metadata"
                            playsInline
                            poster="/media/fondo.png"
                        />
                    </div>
                </div>
            </section>

            <section className={styles.benefitsSection}>
                {BENEFITS.map((benefit, index) => (
                    <article key={benefit.title} className={styles.benefitCard} data-tone={index}>
                        <div className={styles.benefitIndex}>0{index + 1}</div>
                        <h3>{benefit.title}</h3>
                        <p>{benefit.description}</p>
                    </article>
                ))}
            </section>

            <footer className={styles.footer}>
                La Quinta Pata © 2026. Argumentar mejor tambien se entrena.
            </footer>
        </main>
    );
}
