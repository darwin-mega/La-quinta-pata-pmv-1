import { useEffect, useRef, useState } from "react";
import { playTickSound, playTimeoutSound } from "@/lib/sounds";

export default function Timer({
    durationSec,
    onComplete,
    isPaused = false,
    accentColor = "var(--accent-color)",
}: {
    durationSec: number;
    onComplete?: () => void;
    isPaused?: boolean;
    accentColor?: string;
}) {
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const hasCompletedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        setTimeLeft(durationSec);
        hasCompletedRef.current = false;
    }, [durationSec]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                playTimeoutSound();
                onCompleteRef.current?.();
            }
            return;
        }
        if (isPaused) return;

        const int = setInterval(() => {
            setTimeLeft(prev => {
                const nextValue = prev - 1;
                if (nextValue <= 5 && nextValue > 0) {
                    playTickSound();
                }
                return nextValue;
            });
        }, 1000);

        return () => clearInterval(int);
    }, [timeLeft, isPaused]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    const isUrgent = timeLeft <= 10;
    const isCritical = timeLeft <= 5;

    return (
        <div style={{
            fontSize: isCritical ? 'clamp(2rem, 10vw, 3rem)' : 'clamp(1.7rem, 8vw, 2.5rem)',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isUrgent ? 'var(--danger-color)' : accentColor,
            textAlign: 'center',
            width: '100%',
            minWidth: 0,
            padding: '0.8rem 0.45rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isUrgent ? 'var(--danger-color)' : accentColor}`,
            boxShadow: isCritical ? '0 0 20px rgba(244, 63, 94, 0.5)' : 'none',
            transform: isCritical && secs % 2 === 0 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s',
            textShadow: isCritical ? '0 0 10px rgba(244, 63, 94, 0.8)' : 'none'
        }}>
            {mins}:{secs < 10 ? '0' : ''}{secs}
        </div>
    );
}
