"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import TopicSources from "@/components/TopicSources";
import { topics } from "@/data/topics";
import { TOPIC_CATEGORY_OPTIONS, TopicIntensity } from "@/lib/topic-types";
import styles from "./topics.module.css";

const INTENSITY_LABELS: Record<TopicIntensity, string> = {
    baja: "Tranqui",
    media: "Con picante",
    alta: "Se pone serio",
    muy_alta: "Sin filtro",
};

const normalize = (value: string) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function TopicsPage() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");

    const filteredTopics = useMemo(() => {
        const normalizedQuery = normalize(query.trim());
        return topics.filter(topic => {
            const matchesCategory = category === "all" || topic.category === category;
            const searchable = normalize(`${topic.statement} ${topic.angleA} ${topic.angleB} ${topic.categoryLabel}`);
            return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
        });
    }, [category, query]);

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.back}>← Inicio</Link>
                <span className={styles.count}>{topics.length} premisas curadas</span>
            </header>

            <section className={styles.intro}>
                <span className={styles.eyebrow}>Banco editorial</span>
                <h1 className={`title-serif ${styles.title}`}>Ideas que vale la pena discutir.</h1>
                <p>Explorá las premisas, compará sus dos posturas y consultá el origen de los temas de actualidad.</p>
            </section>

            <section className={`glass-panel ${styles.filters}`} aria-label="Filtros de premisas">
                <label className={styles.searchField}>
                    <Search size={18} aria-hidden="true" />
                    <span className={styles.srOnly}>Buscar premisas</span>
                    <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar aborto, conciencia, IA..." />
                </label>
                <label className={styles.selectField}>
                    <SlidersHorizontal size={18} aria-hidden="true" />
                    <span className={styles.srOnly}>Filtrar por categoría</span>
                    <select value={category} onChange={event => setCategory(event.target.value)}>
                        <option value="all">Todas las categorías</option>
                        {TOPIC_CATEGORY_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                </label>
            </section>

            <div className={styles.resultsHeader} aria-live="polite">
                {filteredTopics.length} {filteredTopics.length === 1 ? "resultado" : "resultados"}
            </div>

            <section className={styles.grid}>
                {filteredTopics.map(topic => (
                    <details key={topic.id} className={`glass-panel ${styles.topicCard}`}>
                        <summary>
                            <span className={styles.meta}>
                                <span>{topic.categoryLabel}</span>
                                <span>{INTENSITY_LABELS[topic.intensity]}</span>
                            </span>
                            <strong>{topic.statement}</strong>
                            <span className={styles.openHint}>Ver posturas y contexto</span>
                        </summary>
                        <div className={styles.detailBody}>
                            <div className={styles.angle} data-side="a"><b>A favor</b><span>{topic.angleA}</span></div>
                            <div className={styles.angle} data-side="b"><b>En contra</b><span>{topic.angleB}</span></div>
                            <TopicSources topic={topic} />
                        </div>
                    </details>
                ))}
            </section>

            {filteredTopics.length === 0 ? (
                <div className={styles.empty}>No encontramos una premisa con esos filtros.</div>
            ) : null}
        </main>
    );
}
