import { useEffect, useState } from "react";
import { playTickSound } from "@/lib/sounds";

export default function Timer({ durationSec, onComplete, isPaused = false }: { durationSec: number, onComplete?: () => void, isPaused?: boolean }) {
    const [timeLeft, setTimeLeft] = useState(durationSec);

    useEffect(() => {
        setTimeLeft(durationSec);
    }, [durationSec]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (onComplete) onComplete();
            return;
        }
        if (isPaused) return;

        const int = setInterval(() => {
            setTimeLeft(prev => {
                const n = prev - 1;
                if (n <= 5 && n > 0) {
                    playTickSound();
                }
                return n;
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
