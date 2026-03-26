import { Room } from "@/lib/store";
import { fallacies } from "@/data/fallacies";
import Timer from "../Timer";
import { useEffect } from "react";

export default function FallacyReviewView({ room, playerId, isHost, onVote }: {
    room: Room, playerId: string, isHost: boolean, onVote: (v: "yes" | "no" | "resolve_force") => void
}) {
    const round = room.rounds[room.currentRoundIndex];
    const challenge = round.activeChallenge;

    if (!challenge) return <div>No hay falacia activa...</div>;

    const fallacyDef = fallacies.find(f => f.id === challenge.fallacyId);
    const accuser = room.players.find(p => p.id === challenge.accuserId);
    
    // Support chess clock activeSpeaker
    const speakerId = round.activeSpeaker === "debatiente_a" ? round.debatienteA_Id : round.debatienteB_Id;
    const speaker = room.players.find(p => p.id === speakerId);

    const isSpeaker = playerId === speaker?.id;
    const hasVoted = challenge.yesVotes.includes(playerId) || challenge.noVotes.includes(playerId);

    const totalVoters = room.players.length - 1;
    const votesCount = challenge.yesVotes.length + challenge.noVotes.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ textAlign: 'center', background: 'var(--danger-color)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>🚨 ¡FALACIA DENUNCIADA!</h1>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold' }}>El debate ha sido pausado.</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-light)' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'white', marginBottom: '0.5rem' }}>{accuser?.name} denunció:</h2>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--danger-color)', margin: '0.5rem 0' }}>{fallacyDef?.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"{fallacyDef?.definition}"</p>

                <p style={{ marginTop: '1rem', color: 'white', fontWeight: 600 }}>¿Cometió {speaker?.name} esta falacia?</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {!isSpeaker ? (
                    !hasVoted ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => onVote("no")}
                                style={{ flex: 1, padding: '1.25rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--text-secondary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 700 }}
                            >
                                ❌ Rechazar
                            </button>
                            <button
                                onClick={() => onVote("yes")}
                                style={{ flex: 1, padding: '1.25rem', backgroundColor: 'var(--success-color)', border: '1px solid var(--success-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 700, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                            >
                                ✅ Es Falacia
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ color: 'var(--accent-color)', fontSize: '1.2rem', fontWeight: 600 }}>Voto registrado.</p>
                            <p style={{ color: 'var(--text-secondary)' }}>Esperando al resto... ({votesCount}/{totalVoters})</p>
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>Eres el acusado, no puedes votar.</p>
                        <p style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>Espera el veredicto del grupo.</p>
                    </div>
                )}

                {isHost && (
                    <button
                        onClick={() => onVote("resolve_force")}
                        style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}
                    >
                        Forzar Resolución (Host)
                    </button>
                )}
            </div>
        </div>
    );
}
