'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './JoinInput.module.css';

export default function JoinInput() {
    const [code, setCode] = useState('');
    const router = useRouter();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length > 0) {
            router.push(`/join/${code.toUpperCase().trim()}`);
        }
    };

    return (
        <form onSubmit={handleJoin} className={styles.form}>
            <input
                type="text"
                placeholder="Codigo (ej. ABCD)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className={styles.input}
            />
            <button
                type="submit"
                disabled={!code.trim()}
                className={styles.button}
            >
                Entrar
            </button>
        </form>
    );
}
