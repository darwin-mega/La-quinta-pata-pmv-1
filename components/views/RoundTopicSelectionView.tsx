"use client";

import { useEffect, useState } from "react";
import { Room } from "@/lib/store";
import { MAX_CUSTOM_TOPIC_LENGTH } from "@/lib/topic-types";

type TopicChoice = "random" | "custom" | "saved";

export default function RoundTopicSelectionView({
    room,
    isHost,
    onSelectTopic,
}: {
    room: Room;
    isHost: boolean;
    onSelectTopic: (payload: { roundTopic: TopicChoice; selectedTopic?: string }) => Promise<void> | void;
}) {
    const round = room.rounds[room.currentRoundIndex];
    const [choice, setChoice] = useState<TopicChoice>("random");
    const [customTopic, setCustomTopic] = useState("");
    const [savedTopicId, setSavedTopicId] = useState(room.savedTopics[0]?.id || "");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const firstSavedTopicId = room.savedTopics[0]?.id || "";

    useEffect(() => {
        setChoice("random");
        setCustomTopic("");
        setSavedTopicId(firstSavedTopicId);
        setError("");
        setSubmitting(false);
    }, [room.currentRoundIndex, firstSavedTopicId]);

    if (!round) return null;

    const accentColor = room.mode === "mesa" ? "#3b82f6" : "var(--accent-color)";
    const debatienteA = room.players.find(player => player.id === round.debatienteA_Id);
    const debatienteB = room.players.find(player => player.id === round.debatienteB_Id);
    const hasSavedTopics = room.savedTopics.length > 0;

    const submitSelection = async () => {
        if (!isHost) return;

        if (choice === "custom" && !customTopic.trim()) {
            setError("Escribi un tema para continuar.");
            return;
        }

        if (choice === "saved" && !savedTopicId) {
            setError("Elegi un tema guardado.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await onSelectTopic({
                roundTopic: choice,
                selectedTopic: choice === "random"
                    ? undefined
                    : choice === "custom"
                        ? customTopic.trim()
                        : savedTopicId,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "840px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{ color: accentColor, fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Ronda {round.number}
                </div>
                <h1 className="title-serif" style={{ margin: "0.5rem 0 0", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                    Que tema van a debatir?
                </h1>
                <p style={{ margin: "0.85rem 0 0", color: "var(--text-secondary)" }}>
                    {debatienteA?.name} vs {debatienteB?.name}
                </p>
            </div>

            {!isHost ? (
                <div className="glass-panel" style={{ padding: "1.5rem", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "1rem" }}>
                        El host esta eligiendo el tema de esta ronda.
                    </p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${hasSavedTopics ? 3 : 2}, minmax(0, 1fr))`, gap: "0.75rem" }}>
                        <OptionButton
                            isActive={choice === "random"}
                            accentColor={accentColor}
                            title="Aleatorio"
                            description="El juego elige el tema"
                            onClick={() => setChoice("random")}
                        />
                        <OptionButton
                            isActive={choice === "custom"}
                            accentColor={accentColor}
                            title="Escribir tema"
                            description="Ingresar un tema puntual"
                            onClick={() => setChoice("custom")}
                        />
                        {hasSavedTopics && (
                            <OptionButton
                                isActive={choice === "saved"}
                                accentColor={accentColor}
                                title="Guardado"
                                description="Reutilizar un tema ya usado"
                                onClick={() => setChoice("saved")}
                            />
                        )}
                    </div>

                    {choice === "custom" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <input
                                type="text"
                                value={customTopic}
                                maxLength={MAX_CUSTOM_TOPIC_LENGTH}
                                onChange={event => setCustomTopic(event.target.value)}
                                placeholder="Escriban el tema del debate"
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "var(--radius-md)",
                                    color: "white",
                                    fontSize: "1rem",
                                }}
                            />
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textAlign: "right" }}>
                                {customTopic.trim().length}/{MAX_CUSTOM_TOPIC_LENGTH}
                            </div>
                        </div>
                    )}

                    {choice === "saved" && hasSavedTopics && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {room.savedTopics.map(topic => (
                                <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => setSavedTopicId(topic.id)}
                                    style={{
                                        padding: "0.95rem 1rem",
                                        borderRadius: "var(--radius-md)",
                                        border: `1px solid ${savedTopicId === topic.id ? accentColor : "rgba(255,255,255,0.08)"}`,
                                        background: savedTopicId === topic.id ? `${accentColor}22` : "rgba(255,255,255,0.03)",
                                        color: "white",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>{topic.text}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "var(--danger-color)",
                            padding: "0.85rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            textAlign: "center",
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={submitSelection}
                        disabled={submitting}
                        style={{
                            padding: "1.1rem",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            background: accentColor,
                            color: "white",
                            fontSize: "1.05rem",
                            fontWeight: 800,
                            cursor: submitting ? "not-allowed" : "pointer",
                            opacity: submitting ? 0.75 : 1,
                        }}
                    >
                        {submitting
                            ? "Preparando..."
                            : choice === "random"
                                ? "Usar tema aleatorio"
                                : choice === "custom"
                                    ? "Usar este tema"
                                    : "Usar tema guardado"}
                    </button>
                </div>
            )}
        </div>
    );
}

function OptionButton({
    isActive,
    accentColor,
    title,
    description,
    onClick,
}: {
    isActive: boolean;
    accentColor: string;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isActive ? accentColor : "rgba(255,255,255,0.08)"}`,
                background: isActive ? `${accentColor}22` : "rgba(255,255,255,0.03)",
                color: "white",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                minHeight: "108px",
            }}
        >
            <span style={{ fontWeight: 800, color: isActive ? accentColor : "white" }}>{title}</span>
            <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>{description}</span>
        </button>
    );
}
