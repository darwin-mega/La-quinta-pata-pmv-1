"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock3, RotateCcw, TriangleAlert } from "lucide-react";
import { playButtonSound, playFallacySound, playTurnSound } from "@/lib/sounds";
import styles from "./tutorial.module.css";

const TOTAL_STEPS = 4;

export default function TutorialPage() {
    const [step, setStep] = useState(0);
    const [side, setSide] = useState<"a" | "b" | null>(null);
    const [argument, setArgument] = useState<string | null>(null);
    const [fallacy, setFallacy] = useState<string | null>(null);

    const advance = () => {
        playButtonSound();
        setStep(current => Math.min(TOTAL_STEPS, current + 1));
    };

    const restart = () => {
        setStep(0);
        setSide(null);
        setArgument(null);
        setFallacy(null);
    };

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.back}>← Inicio</Link>
                <span className={styles.badge}>Tutorial jugable · 3 min</span>
            </header>

            <div className={styles.progress} aria-label={`Paso ${Math.min(step + 1, TOTAL_STEPS)} de ${TOTAL_STEPS}`}>
                <div style={{ width: `${Math.min(((step + 1) / TOTAL_STEPS) * 100, 100)}%` }} />
            </div>

            <section className={`glass-panel ${styles.stage}`} aria-live="polite">
                {step === 0 && (
                    <>
                        <span className={styles.eyebrow}>1 · Recibí una postura</span>
                        <h1 className={`title-serif ${styles.title}`}>“La inteligencia artificial ayuda más a aprender que a hacer trampa.”</h1>
                        <p className={styles.copy}>En una partida no siempre defendés lo que pensás. Elegí un lado para practicar.</p>
                        <div className={styles.choiceGrid}>
                            <button className={side === "a" ? styles.selected : ""} onClick={() => { setSide("a"); playTurnSound(); }}>
                                <strong>A favor</strong>
                                <span>Bien usada, potencia el aprendizaje.</span>
                            </button>
                            <button className={side === "b" ? styles.selectedBlue : ""} onClick={() => { setSide("b"); playTurnSound(); }}>
                                <strong>En contra</strong>
                                <span>Facilita esquivar el esfuerzo propio.</span>
                            </button>
                        </div>
                        <button className={styles.primary} disabled={!side} onClick={advance}>Tomar postura <ChevronRight size={18} /></button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <span className={styles.eyebrow}>2 · Construí un argumento</span>
                        <div className={styles.turnCue}><Clock3 size={18} /> Tu turno · 0:45</div>
                        <h1 className={`title-serif ${styles.title}`}>¿Qué argumento es más sólido?</h1>
                        <div className={styles.options}>
                            <button onClick={() => setArgument("weak")}>“Todo el mundo lo usa, así que debe ser bueno.”</button>
                            <button onClick={() => setArgument("strong")} className={argument === "strong" ? styles.selected : ""}>
                                “Permite recibir explicaciones y preguntas adaptadas, pero exige verificar y producir una respuesta propia.”
                            </button>
                            <button onClick={() => setArgument("weak")}>“Es obvio que funciona; quien lo niega no entiende tecnología.”</button>
                        </div>
                        {argument && <p className={argument === "strong" ? styles.good : styles.tryAgain}>{argument === "strong" ? "Bien: da un mecanismo, reconoce un límite y evita exagerar." : "Ese argumento afirma o ataca, pero todavía no demuestra. Probá otra opción."}</p>}
                        <button className={styles.primary} disabled={argument !== "strong"} onClick={advance}>Ceder la palabra <ChevronRight size={18} /></button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <span className={styles.eyebrow}>3 · Detectá la falacia</span>
                        <div className={styles.alert}><TriangleAlert size={20} /> “La IA es buena porque millones de estudiantes ya la usan.”</div>
                        <h1 className={`title-serif ${styles.title}`}>¿Qué error aparece?</h1>
                        <div className={styles.options}>
                            {[
                                ["straw", "Hombre de paja"],
                                ["popular", "Ad populum · Todos lo hacen"],
                                ["cause", "Causa falsa"],
                            ].map(([id, label]) => <button key={id} onClick={() => { setFallacy(id); playFallacySound(); }} className={fallacy === id ? styles.selected : ""}>{label}</button>)}
                        </div>
                        {fallacy && <p className={fallacy === "popular" ? styles.good : styles.tryAgain}>{fallacy === "popular" ? "Exacto: que sea popular no demuestra que sea verdadero o conveniente." : "No es esa. Mirá qué usa la frase como única prueba."}</p>}
                        <button className={styles.primary} disabled={fallacy !== "popular"} onClick={advance}>Confirmar denuncia <ChevronRight size={18} /></button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <span className={styles.eyebrow}>4 · Votá con criterio</span>
                        <h1 className={`title-serif ${styles.title}`}>No votes a quien piensa como vos.</h1>
                        <p className={styles.copy}>Elegí a quien argumentó mejor: claridad, evidencia, respuesta al rival y ausencia de falacias. La app suma el veredicto y muestra el ranking.</p>
                        <div className={styles.summary}>
                            <span>Postura tomada</span><strong>{side === "a" ? "A favor" : "En contra"}</strong>
                            <span>Argumento sólido</span><strong>Listo</strong>
                            <span>Falacia detectada</span><strong>Ad populum</strong>
                        </div>
                        <button className={styles.primary} onClick={advance}>Ver resultado <ChevronRight size={18} /></button>
                    </>
                )}

                {step === 4 && (
                    <div className={styles.finished}>
                        <CheckCircle2 size={54} />
                        <span className={styles.eyebrow}>Entrenamiento completo</span>
                        <h1 className={`title-serif ${styles.title}`}>Ya sabés jugar.</h1>
                        <p className={styles.copy}>En la partida real habrá turnos, denuncias validadas por el jurado, votación y puntos.</p>
                        <Link href="/create-room" className={styles.primary}>Crear una sala</Link>
                        <button className={styles.secondary} onClick={restart}><RotateCcw size={17} /> Repetir tutorial</button>
                    </div>
                )}
            </section>
        </main>
    );
}
