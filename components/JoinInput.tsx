'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        <form onSubmit={handleJoin} style={{ display: 'flex', width: '100%', gap: '0.5rem' }}>
            <input
                type="text"
                placeholder="Código (ej. ABCD)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1rem'
                }}
            />
            <button
                type="submit"
                disabled={!code.trim()}
                style={{
                    padding: '0 1.5rem',
                    backgroundColor: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 600,
                    opacity: code.trim() ? 1 : 0.5,
                    cursor: code.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                }}
            >
                Entrar
            </button>
        </form>
    );
}
