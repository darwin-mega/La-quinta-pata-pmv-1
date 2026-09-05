"use client";

import { useEffect, useState } from "react";
import { Music4, Volume2, VolumeX } from "lucide-react";
import {
    isSoundEnabled,
    playButtonSound,
    playPhaseChangeSound,
    setSoundEnabled,
    startBackgroundMusic,
    stopBackgroundMusic,
    unlockAudio,
} from "@/lib/sounds";
import styles from "./SoundIdentity.module.css";

export default function SoundIdentity() {
    const [enabled, setEnabled] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedPreference = isSoundEnabled();
        setEnabled(storedPreference);
        setSoundEnabled(storedPreference);
    }, []);

    useEffect(() => {
        const handleUnlock = () => {
            unlockAudio();
            if (enabled) {
                startBackgroundMusic();
            }
            setReady(true);
        };

        window.addEventListener("pointerdown", handleUnlock, { once: true });
        window.addEventListener("keydown", handleUnlock, { once: true });

        return () => {
            window.removeEventListener("pointerdown", handleUnlock);
            window.removeEventListener("keydown", handleUnlock);
        };
    }, [enabled]);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target || target.closest("[data-sound-ignore='true']")) {
                return;
            }

            const interactiveElement = target.closest("button, a, [role='button'], summary");
            if (interactiveElement) {
                unlockAudio();
                playButtonSound();
            }
        };

        document.addEventListener("click", handleDocumentClick, true);
        return () => document.removeEventListener("click", handleDocumentClick, true);
    }, []);

    const handleToggle = () => {
        const nextValue = !enabled;
        setEnabled(nextValue);
        setSoundEnabled(nextValue);

        if (nextValue) {
            unlockAudio();
            startBackgroundMusic();
            playPhaseChangeSound();
            playButtonSound();
            setReady(true);
        } else {
            stopBackgroundMusic();
        }
    };

    return (
        <button
            type="button"
            data-sound-ignore="true"
            onClick={handleToggle}
            title={enabled ? "Silenciar experiencia sonora" : "Activar experiencia sonora"}
            aria-label={enabled ? "Silenciar experiencia sonora" : "Activar experiencia sonora"}
            className={`${styles.toggle} ${enabled ? styles.enabled : ""}`}
        >
            {enabled ? <Volume2 size={18} color="var(--success-color)" /> : <VolumeX size={18} color="var(--text-secondary)" />}
            <span className={styles.copy}>
                <span className={styles.status}>
                    {enabled ? "Audio ON" : "Audio OFF"}
                </span>
                <span className={styles.hint}>
                    {enabled ? (ready ? "Sonido activo" : "Tocá para habilitar") : "Sin sonido"}
                </span>
            </span>
            <Music4 className={styles.musicIcon} size={16} color="var(--accent-color)" />
        </button>
    );
}
