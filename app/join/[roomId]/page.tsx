"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../create-room/page.module.css'; // Reusing form styles

export default function JoinRoom() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId as string;

    const [playerName, setPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/room/${roomId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al unirse a la sala');
            }

            // Save identity locally
            localStorage.setItem(`laJaula_playerId_${roomId}`, data.playerId);
            localStorage.setItem(`laJaula_isHost_${roomId}`, 'false');

            router.push(`/room/${roomId}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="page-container" style={{ justifyContent: 'center' }}>
            <div className={styles.header}>
                <h1 className="title-serif">Unirse a Sala</h1>
                <p className={styles.subtitle}>CÓDIGO: {roomId}</p>
            </div>

            <form className={`glass-panel ${styles.form}`} onSubmit={handleSubmit}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label htmlFor="playerName">Tu apodo o nombre</label>
                    <input
                        id="playerName"
                        type="text"
                        required
                        maxLength={15}
                        placeholder="Ej: Martín"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} className={styles.primaryButton}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <Link href="/" className={styles.cancelButton}>
                    Volver al inicio
                </Link>
            </form>
        </main>
    );
}
