import { useEffect, useRef, useState } from "react";
import { playTickSound, playTimeoutSound } from "@/lib/sounds";

export default function Timer({ durationSec, onComplete, isPaused = false }: { durationSec: number, onComplete?: () => void, isPaused?: boolean }) {
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const hasCompletedRef = useRef(false);

    useEffect(() => {
        setTimeLeft(durationSec);
        hasCompletedRef.current = false;
    }, [durationSec]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (!hasCompletedRef.current) {
                hasCompletedRef.current = true;
                playTimeoutSound();
                onComplete?.();
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
    }, [timeLeft, onComplete, isPaused]);

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    const isUrgent = timeLeft <= 10;
    const isCritical = timeLeft <= 5;

    return (
        <div style={{
            fontSize: isCritical ? '3rem' : '2.5rem',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: isUrgent ? 'var(--danger-color)' : 'var(--accent-color)',
            textAlign: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isUrgent ? 'var(--danger-color)' : 'var(--border-color)'}`,
            boxShadow: isCritical ? '0 0 20px rgba(244, 63, 94, 0.5)' : 'none',
            transform: isCritical && secs % 2 === 0 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s',
            textShadow: isCritical ? '0 0 10px rgba(244, 63, 94, 0.8)' : 'none'
        }}>
            {mins}:{secs < 10 ? '0' : ''}{secs}
        </div>
    );
}
