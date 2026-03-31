"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import TopicConfigSection from "@/components/TopicConfigSection";
import { DEFAULT_ROOM_TOPIC_CONFIG } from "@/lib/topic-types";
import { validateTopicConfig } from "@/lib/topic-engine";

export default function CreateRoom() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [mode, setMode] = useState<"multiplayer" | "mesa">("multiplayer");
    const [playerNames, setPlayerNames] = useState<string[]>(["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"]);
    const [topicConfig, setTopicConfig] = useState(DEFAULT_ROOM_TOPIC_CONFIG);

    const [formData, setFormData] = useState({
        name: "",
        hostName: "",
        duration: "corta"
    });

    const topicValidation = useMemo(() => validateTopicConfig(topicConfig), [topicConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlayerNameChange = (index: number, value: string) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    const addPlayer = () => {
        if (playerNames.length < 10) {
            setPlayerNames([...playerNames, `Jugador ${playerNames.length + 1}`]);
        }
    };

    const removePlayer = (index: number) => {
        if (playerNames.length > 4) {
            const newNames = playerNames.filter((_, currentIndex) => currentIndex !== index);
            setPlayerNames(newNames);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!topicValidation.isValid) {
            setError(topicValidation.errors[0]);
            setLoading(false);
            return;
        }

        if (mode === "mesa") {
            const emptyNames = playerNames.filter(name => !name.trim());
            if (emptyNames.length > 0) {
                setError("Todos los jugadores deben tener un nombre.");
                setLoading(false);
                return;
            }
        }

        try {
            const payload = {
                ...formData,
                mode,
                topicConfig,
                playerNames: mode === "mesa" ? playerNames.map(name => name.trim()) : undefined
            };

            const res = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al crear la sala");
            }

            localStorage.setItem(`laJaula_playerId_${data.room.id}`, data.playerId);
            localStorage.setItem(`laJaula_isHost_${data.room.id}`, "true");

            if (mode === "mesa") {
                router.push(`/mesa/${data.room.id}`);
            } else {
                router.push(`/room/${data.room.id}`);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="page-container">
            <div className={styles.header}>
                <h1 className="title-serif">Crear Nueva Sala</h1>
                <p className={styles.subtitle}>Configura reglas, jugadores y contenido para el debate</p>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", maxWidth: "500px", width: "100%" }}>
                <button
                    type="button"
                    onClick={() => setMode("multiplayer")}
                    style={{
                        flex: 1,
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${mode === "multiplayer" ? "var(--accent-color)" : "transparent"}`,
                        background: mode === "multiplayer" ? "rgba(255, 94, 58, 0.1)" : "rgba(255,255,255,0.05)",
                        color: mode === "multiplayer" ? "white" : "var(--text-secondary)",
                        transition: "all 0.2s",
                        textAlign: "left"
                    }}
                >
                    <div style={{ fontWeight: "bold", marginBottom: "0.25rem", color: mode === "multiplayer" ? "var(--accent-color)" : "white" }}>
                        Varios dispositivos
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Cada jugador entra desde su propio celular con QR o código.
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setMode("mesa")}
                    style={{
                        flex: 1,
                        padding: "1rem",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${mode === "mesa" ? "#3b82f6" : "transparent"}`,
                        background: mode === "mesa" ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.05)",
                        color: mode === "mesa" ? "white" : "var(--text-secondary)",
                        transition: "all 0.2s",
                        textAlign: "left"
                    }}
                >
                    <div style={{ fontWeight: "bold", marginBottom: "0.25rem", color: mode === "mesa" ? "#3b82f6" : "white" }}>
                        Modo mesa
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        Ideal para jugar con un solo dispositivo en el centro de la mesa.
                    </div>
                </button>
            </div>

            <form className={`glass-panel ${styles.form}`} onSubmit={handleSubmit}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                {mode === "multiplayer" && (
                    <div className={styles.formGroup}>
                        <label htmlFor="hostName">Tu apodo (Host)</label>
                        <input
                            id="hostName"
                            type="text"
                            name="hostName"
                            required={mode === "multiplayer"}
                            maxLength={15}
                            placeholder="Ej: Sofía"
                            value={formData.hostName}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="name">Nombre de la sala</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        maxLength={20}
                        placeholder="Ej: Debate con amigxs"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="duration">Modo de Partida</label>
                    <select id="duration" name="duration" value={formData.duration} onChange={handleChange} className={styles.select}>
                        <option value="corta">☕ Modo Corto (1 debate por persona)</option>
                        <option value="larga">⚔️ Modo Largo (3 debates por persona)</option>
                        <option value="leyenda">🔥 Modo Leyenda (Todos contra todos)</option>
                    </select>
                </div>

                <TopicConfigSection value={topicConfig} onChange={setTopicConfig} validation={topicValidation} />

                {mode === "mesa" && (
                    <div className={styles.formGroup} style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <label>Jugadores Locales (Mínimo 4)</label>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                            Agrega los nombres de quienes van a jugar presencialmente en este dispositivo.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {playerNames.map((name, index) => (
                                <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        type="text"
                                        required={mode === "mesa"}
                                        maxLength={15}
                                        placeholder={`Jugador ${index + 1}`}
                                        value={name}
                                        onChange={(event) => handlePlayerNameChange(index, event.target.value)}
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                    />
                                    {playerNames.length > 4 && (
                                        <button
                                            type="button"
                                            onClick={() => removePlayer(index)}
                                            style={{
                                                background: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                                borderRadius: "var(--radius-sm)",
                                                width: "40px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer"
                                            }}
                                            title="Eliminar jugador"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {playerNames.length < 10 && (
                            <button
                                type="button"
                                onClick={addPlayer}
                                style={{
                                    marginTop: "0.75rem",
                                    background: "transparent",
                                    color: "var(--text-secondary)",
                                    border: "1px dashed rgba(255,255,255,0.2)",
                                    padding: "0.5rem",
                                    borderRadius: "var(--radius-sm)",
                                    cursor: "pointer",
                                    width: "100%",
                                    transition: "all 0.2s",
                                    fontSize: "0.9rem"
                                }}
                                onMouseOver={(event) => { event.currentTarget.style.color = "white"; }}
                                onMouseOut={(event) => { event.currentTarget.style.color = "var(--text-secondary)"; }}
                            >
                                + Agregar otro jugador
                            </button>
                        )}
                    </div>
                )}

                <button type="submit" disabled={loading} className={styles.primaryButton} style={{ marginTop: "1rem" }}>
                    {loading ? "Creando..." : "Crear Sala"}
                </button>

                <Link href="/" className={styles.cancelButton}>
                    Cancelar
                </Link>
            </form>
        </main>
    );
}
