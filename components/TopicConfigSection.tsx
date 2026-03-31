"use client";

import { useMemo, useState } from "react";
import styles from "@/app/create-room/page.module.css";
import {
    RoomTopicConfig,
    TOPIC_CATEGORY_OPTIONS,
    TOPIC_INTENSITY_OPTIONS,
    TOPIC_MODE_OPTIONS,
    TopicIntensity,
    TopicValidationResult,
} from "@/lib/topic-types";
import {
    getSystemTopicCounts,
    getTopicCategoryLabel,
    getTopicIntensityLabel,
    validateTopicConfig,
} from "@/lib/topic-engine";

type TopicConfigSectionProps = {
    value: RoomTopicConfig;
    onChange: (nextValue: RoomTopicConfig) => void;
    validation: TopicValidationResult;
};

type CustomTopicDraft = {
    text: string;
    category: string;
    intensity: TopicIntensity | "";
};

const createTopicId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const EMPTY_DRAFT: CustomTopicDraft = {
    text: "",
    category: "",
    intensity: "",
};

export default function TopicConfigSection({ value, onChange, validation }: TopicConfigSectionProps) {
    const [draft, setDraft] = useState<CustomTopicDraft>(EMPTY_DRAFT);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editorError, setEditorError] = useState("");
    const { categoryCounts, intensityCounts } = useMemo(() => getSystemTopicCounts(), []);
    const preview = useMemo(() => validateTopicConfig(value), [value]);

    const updateConfig = (patch: Partial<RoomTopicConfig>) => {
        onChange({ ...value, ...patch });
    };

    const toggleCategory = (categoryId: string) => {
        const nextCategories = value.selectedCategories.includes(categoryId)
            ? value.selectedCategories.filter(category => category !== categoryId)
            : [...value.selectedCategories, categoryId];
        updateConfig({ selectedCategories: nextCategories });
    };

    const toggleIntensity = (intensityId: TopicIntensity) => {
        const nextIntensities = value.selectedIntensities.includes(intensityId)
            ? value.selectedIntensities.filter(intensity => intensity !== intensityId)
            : [...value.selectedIntensities, intensityId];
        updateConfig({ selectedIntensities: nextIntensities });
    };

    const resetEditor = () => {
        setDraft(EMPTY_DRAFT);
        setEditingId(null);
        setEditorError("");
    };

    const submitCustomTopic = () => {
        const normalizedText = draft.text.trim().replace(/\s+/g, " ");
        if (!normalizedText) {
            setEditorError("Escribí un tema antes de agregarlo.");
            return;
        }

        const duplicatedTopic = value.customTopics.find(topic =>
            topic.id !== editingId &&
            topic.text.trim().toLowerCase() === normalizedText.toLowerCase()
        );

        if (duplicatedTopic) {
            setEditorError("Ese tema ya está cargado en la lista.");
            return;
        }

        const nextTopic = {
            id: editingId || createTopicId(),
            text: normalizedText,
            category: draft.category || undefined,
            intensity: draft.intensity || undefined,
        };

        const nextTopics = editingId
            ? value.customTopics.map(topic => topic.id === editingId ? nextTopic : topic)
            : [...value.customTopics, nextTopic];

        updateConfig({ customTopics: nextTopics });
        resetEditor();
    };

    const editTopic = (topicId: string) => {
        const topic = value.customTopics.find(item => item.id === topicId);
        if (!topic) return;

        setEditingId(topicId);
        setDraft({
            text: topic.text,
            category: topic.category || "",
            intensity: topic.intensity || "",
        });
        setEditorError("");
    };

    const removeTopic = (topicId: string) => {
        updateConfig({ customTopics: value.customTopics.filter(topic => topic.id !== topicId) });
        if (editingId === topicId) {
            resetEditor();
        }
    };

    const moveTopic = (topicId: string, direction: -1 | 1) => {
        const currentIndex = value.customTopics.findIndex(topic => topic.id === topicId);
        const nextIndex = currentIndex + direction;

        if (currentIndex < 0 || nextIndex < 0 || nextIndex >= value.customTopics.length) {
            return;
        }

        const reordered = [...value.customTopics];
        [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
        updateConfig({ customTopics: reordered });
    };

    const modeNeedsSystemFilters = value.mode === "system" || value.mode === "mixed";
    const modeNeedsCustomTopics = value.mode === "custom" || value.mode === "mixed";

    return (
        <div className={styles.formGroup} style={{ gap: "1rem" }}>
            <div>
                <label style={{ marginBottom: "0.35rem", display: "block" }}>Configuración de Temas</label>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.5 }}>
                    Elegí si la sala usa el catálogo del juego, temas propios o una mezcla de ambos.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
                {TOPIC_MODE_OPTIONS.map(mode => {
                    const isActive = value.mode === mode.id;
                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => updateConfig({ mode: mode.id })}
                            style={{
                                padding: "1rem",
                                borderRadius: "var(--radius-md)",
                                border: `1px solid ${isActive ? "var(--accent-color)" : "rgba(255,255,255,0.08)"}`,
                                background: isActive ? "rgba(255, 94, 58, 0.12)" : "rgba(255,255,255,0.03)",
                                color: "white",
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: isActive ? "0 8px 24px rgba(255, 94, 58, 0.18)" : "none",
                            }}
                        >
                            <div style={{ fontWeight: 800, marginBottom: "0.35rem", color: isActive ? "var(--accent-color)" : "white" }}>
                                {mode.label}
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                                {mode.description}
                            </div>
                        </button>
                    );
                })}
            </div>

            {modeNeedsSystemFilters && (
                <div className="glass-panel" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <h3 style={{ margin: 0, color: "white", fontSize: "1rem" }}>Temas del sistema</h3>
                        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                            Filtrá el catálogo por categoría e intensidad. Si no marcás nada, la sala usa un mezclado amplio.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>Categorías</span>
                            <button
                                type="button"
                                onClick={() => updateConfig({ selectedCategories: [] })}
                                style={{ background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "0.82rem" }}
                            >
                                Mezclado
                            </button>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {TOPIC_CATEGORY_OPTIONS.map(category => {
                                const isSelected = value.selectedCategories.includes(category.id);
                                const count = categoryCounts[category.id] || 0;
                                const isDisabled = count === 0;
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => toggleCategory(category.id)}
                                        style={{
                                            padding: "0.55rem 0.8rem",
                                            borderRadius: "999px",
                                            border: `1px solid ${isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.12)"}`,
                                            background: isSelected ? "rgba(255, 94, 58, 0.14)" : "rgba(255,255,255,0.04)",
                                            color: isDisabled ? "rgba(255,255,255,0.25)" : "white",
                                            cursor: isDisabled ? "not-allowed" : "pointer",
                                            fontSize: "0.82rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                        }}
                                    >
                                        <span>{category.label}</span>
                                        <span style={{ color: isSelected ? "var(--accent-color)" : "var(--text-secondary)" }}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>Intensidades</span>
                            <button
                                type="button"
                                onClick={() => updateConfig({ selectedIntensities: [] })}
                                style={{ background: "transparent", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "0.82rem" }}
                            >
                                Mezclado
                            </button>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {TOPIC_INTENSITY_OPTIONS.map(intensity => {
                                const isSelected = value.selectedIntensities.includes(intensity.id);
                                const count = intensityCounts[intensity.id] || 0;
                                return (
                                    <button
                                        key={intensity.id}
                                        type="button"
                                        onClick={() => toggleIntensity(intensity.id)}
                                        style={{
                                            padding: "0.55rem 0.8rem",
                                            borderRadius: "999px",
                                            border: `1px solid ${isSelected ? "var(--accent-color)" : "rgba(255,255,255,0.12)"}`,
                                            background: isSelected ? "rgba(255, 94, 58, 0.14)" : "rgba(255,255,255,0.04)",
                                            color: "white",
                                            cursor: "pointer",
                                            fontSize: "0.82rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                        }}
                                    >
                                        <span>{intensity.label}</span>
                                        <span style={{ color: isSelected ? "var(--accent-color)" : "var(--text-secondary)" }}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.9rem", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                        Temas disponibles con la selección actual: <strong style={{ color: "white" }}>{preview.systemCount}</strong>
                    </div>
                </div>
            )}

            {modeNeedsCustomTopics && (
                <div className="glass-panel" style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <h3 style={{ margin: 0, color: "white", fontSize: "1rem" }}>Temas personalizados</h3>
                        <p style={{ margin: "0.35rem 0 0", color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                            Cargá temas propios de la sala. Podés dejar categoría e intensidad vacías si querés algo más libre.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <textarea
                            value={draft.text}
                            onChange={event => setDraft(current => ({ ...current, text: event.target.value }))}
                            placeholder="Ej: La universidad debería prohibir el uso de IA en evaluaciones."
                            className={styles.input}
                            rows={3}
                            style={{ minHeight: "110px", resize: "vertical" }}
                        />

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
                            <select
                                value={draft.category}
                                onChange={event => setDraft(current => ({ ...current, category: event.target.value }))}
                                className={styles.select}
                            >
                                <option value="">Sin categoría</option>
                                {TOPIC_CATEGORY_OPTIONS.map(category => (
                                    <option key={category.id} value={category.id}>{category.label}</option>
                                ))}
                            </select>

                            <select
                                value={draft.intensity}
                                onChange={event => setDraft(current => ({ ...current, intensity: event.target.value as TopicIntensity | "" }))}
                                className={styles.select}
                            >
                                <option value="">Sin intensidad</option>
                                {TOPIC_INTENSITY_OPTIONS.map(intensity => (
                                    <option key={intensity.id} value={intensity.id}>{intensity.label}</option>
                                ))}
                            </select>
                        </div>

                        {editorError && (
                            <div className={styles.errorMessage} style={{ textAlign: "left" }}>
                                {editorError}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <button type="button" onClick={submitCustomTopic} className={styles.primaryButton} style={{ marginTop: 0, flex: 1 }}>
                                {editingId ? "Guardar tema" : "Agregar tema"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetEditor}
                                    style={{
                                        padding: "1rem 1.2rem",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "transparent",
                                        color: "var(--text-secondary)",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ color: "white", fontWeight: 700 }}>Lista cargada</span>
                            <span style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                                {value.customTopics.length} tema(s)
                            </span>
                        </div>

                        {value.customTopics.length === 0 ? (
                            <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                                Todavía no agregaste temas propios.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {value.customTopics.map((topic, index) => (
                                    <div key={topic.id} style={{ padding: "0.95rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: "white", fontWeight: 700, lineHeight: 1.45 }}>{topic.text}</div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.65rem" }}>
                                                    {topic.category && (
                                                        <span style={{ padding: "0.25rem 0.55rem", borderRadius: "999px", background: "rgba(59,130,246,0.12)", color: "#93c5fd", fontSize: "0.75rem" }}>
                                                            {getTopicCategoryLabel(topic.category)}
                                                        </span>
                                                    )}
                                                    {topic.intensity && (
                                                        <span style={{ padding: "0.25rem 0.55rem", borderRadius: "999px", background: "rgba(255, 94, 58, 0.12)", color: "var(--accent-color)", fontSize: "0.75rem" }}>
                                                            {getTopicIntensityLabel(topic.intensity)}
                                                        </span>
                                                    )}
                                                    {!topic.category && !topic.intensity && (
                                                        <span style={{ padding: "0.25rem 0.55rem", borderRadius: "999px", background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                                                            Tema libre
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                <button type="button" onClick={() => moveTopic(topic.id, -1)} disabled={index === 0} style={smallActionButton(index === 0)}>↑</button>
                                                <button type="button" onClick={() => moveTopic(topic.id, 1)} disabled={index === value.customTopics.length - 1} style={smallActionButton(index === value.customTopics.length - 1)}>↓</button>
                                                <button type="button" onClick={() => editTopic(topic.id)} style={smallActionButton(false)}>Editar</button>
                                                <button type="button" onClick={() => removeTopic(topic.id)} style={dangerActionButton}>Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="glass-panel" style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <span style={{ color: "white", fontWeight: 700 }}>Resumen del pool</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                        Sistema: {validation.systemCount} · Personalizados: {validation.customCount} · Total: {validation.totalCount}
                    </span>
                </div>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                    {value.mode === "system" && "La partida usa solo el catalogo del juego filtrado por esta configuracion. Los temas no se repiten hasta agotar el pool de la sesion."}
                    {value.mode === "custom" && "La partida usa solo los temas cargados en esta sala. Los temas no se repiten hasta agotar el pool de la sesion."}
                    {value.mode === "mixed" && "En modo mixto los dos pools se mezclan aleatoriamente. Los temas no se repiten hasta agotar el pool de la sesion."}
                </p>
                {validation.errors.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                        {validation.errors.map(error => (
                            <div key={error} className={styles.errorMessage} style={{ textAlign: "left" }}>
                                {error}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const smallActionButton = (disabled: boolean) => ({
    padding: "0.45rem 0.7rem",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: disabled ? "rgba(255,255,255,0.25)" : "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.75rem",
});

const dangerActionButton = {
    padding: "0.45rem 0.7rem",
    borderRadius: "999px",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "rgba(239, 68, 68, 0.08)",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: "0.75rem",
};
