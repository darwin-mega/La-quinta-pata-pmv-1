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

export default function SoundIdentity() {
    const [enabled, setEnabled] = useState(true);
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
            style={{
                position: "fixed",
                right: "1rem",
                bottom: "1rem",
                zIndex: 120,
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.75rem 0.95rem",
                borderRadius: "999px",
                border: `1px solid ${enabled ? "rgba(16,185,129,0.45)" : "rgba(156,163,175,0.35)"}`,
                background: enabled ? "rgba(10, 18, 14, 0.88)" : "rgba(18, 19, 25, 0.88)",
                color: "white",
                boxShadow: enabled ? "0 10px 30px rgba(16,185,129,0.18)" : "0 10px 30px rgba(0,0,0,0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            {enabled ? <Volume2 size={18} color="var(--success-color)" /> : <VolumeX size={18} color="var(--text-secondary)" />}
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.05 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {enabled ? "Audio ON" : "Audio OFF"}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                    {ready ? "Identidad sonora activa" : "Tocá para activarla"}
                </span>
            </span>
            <Music4 size={16} color="var(--accent-color)" />
        </button>
    );
}
