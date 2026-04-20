"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { GameDuration, GameIntensity } from "@/lib/store";
import { getGameDurationLabel, getGameIntensityLabel } from "@/lib/game";
import { MAX_PLAYER_NAME_LENGTH } from "@/lib/topic-types";

type PlayMode = "individual" | "mesa";
type FlowStep = 1 | 2 | 3;

const PLAYER_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const INTENSITY_OPTIONS: GameIntensity[] = ["liviano", "medio", "filoso"];
const DURATION_OPTIONS: GameDuration[] = ["corta", "larga", "leyenda"];
const TOPIC_SELECTION_OPTIONS = [
    { id: "automatic", title: "Automatico", description: "El juego elige los temas" },
    { id: "manual", title: "Manual", description: "Ustedes eligen los temas" },
] as const;

const MODE_OPTIONS: Array<{
    id: PlayMode;
    title: string;
    description: string;
}> = [
    {
        id: "individual",
        title: "Individual",
        description: "Cada jugador usa su propio dispositivo",
    },
    {
        id: "mesa",
        title: "Mesa",
        description: "Comparten dispositivos",
    },
];

export default function CreateRoom() {
    const router = useRouter();
    const [step, setStep] = useState<FlowStep>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [playMode, setPlayMode] = useState<PlayMode | null>(null);
    const [playerCount, setPlayerCount] = useState<number | undefined>(undefined);
    const [playerNames, setPlayerNames] = useState<string[]>([]);
    const [intensity, setIntensity] = useState<GameIntensity>("medio");
    const [duration, setDuration] = useState<GameDuration>("corta");
    const [topicSelectionMode, setTopicSelectionMode] = useState<"automatic" | "manual">("automatic");

    const getMesaPlayerNames = (count = playerCount) => {
        if (!count) return [];

        return Array.from({ length: count }, (_, index) => {
            return playerNames[index]?.trim() || `Jugador ${index + 1}`;
        });
    };

    const hasDuplicateNames = (names: string[]) => {
        return new Set(names.map(name => name.toLowerCase())).size !== names.length;
    };

    const validateMesaNames = () => {
        const names = getMesaPlayerNames();

        if (names.some(name => name.length > MAX_PLAYER_NAME_LENGTH)) {
            setError(`Cada jugador puede tener hasta ${MAX_PLAYER_NAME_LENGTH} caracteres.`);
            return false;
        }

        if (hasDuplicateNames(names)) {
            setError("No puede haber nombres repetidos en la mesa.");
            return false;
        }

        return true;
    };

    const handleModeSelect = (nextMode: PlayMode) => {
        setError("");
        setPlayMode(nextMode);

        if (nextMode === "individual") {
            setPlayerCount(undefined);
            setPlayerNames([]);
            setStep(3);
            return;
        }

        setPlayerCount(undefined);
        setPlayerNames([]);
        setStep(2);
    };

    const handlePlayerCountSelect = (count: number) => {
        setError("");
        setPlayerCount(count);
        setPlayerNames(currentNames =>
            Array.from({ length: count }, (_, index) => currentNames[index] || "")
        );
    };

    const handlePlayerNameChange = (index: number, value: string) => {
        setError("");
        setPlayerNames(currentNames => {
            const nextNames = [...currentNames];
            nextNames[index] = value;
            return nextNames;
        });
    };

    const handlePlayersContinue = () => {
        if (!playerCount) {
            setError("Elegi cuantos jugadores son.");
            return;
        }

        if (!validateMesaNames()) {
            return;
        }

        setStep(3);
    };

    const handleBack = () => {
        setError("");

        if (step === 3) {
            setStep(playMode === "mesa" ? 2 : 1);
            return;
        }

        if (step === 2) {
            setStep(1);
        }
    };

    const handleSubmit = async () => {
        if (!playMode) {
            setError("Elegi como van a jugar.");
            return;
        }

        if (playMode === "mesa" && !playerCount) {
            setError("Elegi cuantos jugadores son.");
            return;
        }

        if (playMode === "mesa" && !validateMesaNames()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const payload = {
                mode: playMode,
                playerCount: playMode === "mesa" ? playerCount : undefined,
                playerNames: playMode === "mesa" ? getMesaPlayerNames() : undefined,
                intensity,
                duration,
                topicSelectionMode,
            };

            const response = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al crear la sala");
            }

            localStorage.setItem(`laJaula_playerId_${data.room.id}`, data.playerId);
            localStorage.setItem(`laJaula_isHost_${data.room.id}`, "true");

            if (playMode === "mesa") {
                router.push(`/mesa/${data.room.id}`);
                return;
            }

            router.push(`/room/${data.room.id}`);
        } catch (err: any) {
            setError(err.message || "No se pudo crear la sala");
            setLoading(false);
        }
    };

    return (
        <main className="page-container">
            <div className={styles.wizardShell}>
                {step > 1 && (
                    <button type="button" onClick={handleBack} className={styles.backButton}>
                        Atras
                    </button>
                )}

                {error && <div className={styles.errorMessage}>{error}</div>}

                {step === 1 && (
                    <section className={`glass-panel ${styles.stepPanel}`}>
                        <h1 className={`title-serif ${styles.stepTitle}`}>Como van a jugar?</h1>

                        <div className={styles.modeGrid}>
                            {MODE_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleModeSelect(option.id)}
                                    className={styles.modeCard}
                                >
                                    <span className={styles.modeTitle}>{option.title}</span>
                                    <span className={styles.modeDescription}>{option.description}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section className={`glass-panel ${styles.stepPanel}`}>
                        <h1 className={`title-serif ${styles.stepTitle}`}>Cuantos jugadores son?</h1>

                        <div className={styles.countGrid}>
                            {PLAYER_COUNT_OPTIONS.map(count => (
                                <button
                                    key={count}
                                    type="button"
                                    onClick={() => handlePlayerCountSelect(count)}
                                    className={`${styles.countButton} ${playerCount === count ? styles.countButtonActive : ""}`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>

                        {playerCount && (
                            <div className={styles.playerNamesBlock}>
                                <div className={styles.playerNamesHeader}>
                                    <span className={styles.groupLabel}>Participantes</span>
                                    <span className={styles.namesHint}>Podes dejar campos vacios para usar nombres automaticos.</span>
                                </div>

                                <div className={styles.playerNamesGrid}>
                                    {Array.from({ length: playerCount }, (_, index) => (
                                        <label key={index} className={styles.playerNameField}>
                                            <span>Jugador {index + 1}</span>
                                            <input
                                                type="text"
                                                value={playerNames[index] || ""}
                                                maxLength={MAX_PLAYER_NAME_LENGTH}
                                                placeholder={`Jugador ${index + 1}`}
                                                onChange={(event) => handlePlayerNameChange(index, event.target.value)}
                                                className={styles.input}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handlePlayersContinue}
                                    className={styles.primaryButton}
                                >
                                    Continuar
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {step === 3 && (
                    <section className={`glass-panel ${styles.stepPanel}`}>
                        <div className={styles.configBlock}>
                            <div className={styles.optionGroup}>
                                <span className={styles.groupLabel}>Intensidad</span>
                                <div className={styles.optionGrid}>
                                    {INTENSITY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setIntensity(option)}
                                            className={`${styles.optionButton} ${intensity === option ? styles.optionButtonActive : ""}`}
                                        >
                                            {getGameIntensityLabel(option)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.optionGroup}>
                                <span className={styles.groupLabel}>Largo</span>
                                <div className={styles.optionGrid}>
                                    {DURATION_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setDuration(option)}
                                            className={`${styles.optionButton} ${duration === option ? styles.optionButtonActive : ""}`}
                                        >
                                            {getGameDurationLabel(option)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.optionGroup}>
                                <span className={styles.groupLabel}>Temas</span>
                                <div className={styles.optionGrid}>
                                    {TOPIC_SELECTION_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setTopicSelectionMode(option.id)}
                                            className={`${styles.optionButton} ${topicSelectionMode === option.id ? styles.optionButtonActive : ""}`}
                                        >
                                            <span className={styles.optionTitle}>{option.title}</span>
                                            <span className={styles.optionDescription}>{option.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={styles.primaryButton}
                        >
                            {loading ? "Creando..." : "Crear sala"}
                        </button>
                    </section>
                )}
            </div>
        </main>
    );
}
