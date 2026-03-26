import { useState } from "react";
import { Room } from "@/lib/store";

export default function MesaVotingView({ room, onSubmitVotes }: { room: Room, onSubmitVotes: (votes: Record<string, "A" | "B" | "empate">) => void }) {
    const round = room.rounds[room.currentRoundIndex];
    const [votes, setVotes] = useState<Record<string, "A" | "B" | "empate">>({});
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!round) return null;

    const pA = room.players.find(p => p.id === round.debatienteA_Id);
    const pB = room.players.find(p => p.id === round.debatienteB_Id);

    const currentPlayer = room.players[currentIndex];

    const handleVote = (voteValue: "A" | "B" | "empate") => {
        const updatedVotes = { ...votes, [currentPlayer.id]: voteValue };
        setVotes(updatedVotes);

        if (currentIndex < room.players.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Todos votaron
            onSubmitVotes(updatedVotes);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease', textAlign: 'center' }}>
            <div style={{ background: 'var(--accent-color)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', fontWeight: 900 }}>FIN DEL DEBATE</h1>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', fontSize: '1.2rem' }}>Es hora de que la mesa decida.</p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    Paso {currentIndex + 1} de {room.players.length}
                </div>
                
                <h2 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>
                    Turno de votar de: <br/>
                    <span style={{ color: 'var(--warning-color)', fontSize: '4rem', display: 'block', marginTop: '1rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                        {currentPlayer?.name}
                    </span>
                </h2>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>¿Quién argumentó mejor según {currentPlayer?.name}?</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                    <button 
                        onClick={() => handleVote("A")}
                        style={{ padding: '2rem', backgroundColor: 'var(--success-color)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.1s' }}
                    >
                        Punto para<br/><span style={{fontSize: '2rem', display: 'inline-block', marginTop: '0.5rem'}}>{pA?.name}</span>
                    </button>
                    
                    <button 
                        onClick={() => handleVote("B")}
                        style={{ padding: '2rem', backgroundColor: 'var(--danger-color)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.1s' }}
                    >
                        Punto para<br/><span style={{fontSize: '2rem', display: 'inline-block', marginTop: '0.5rem'}}>{pB?.name}</span>
                    </button>
                    
                    <button 
                        onClick={() => handleVote("empate")}
                        style={{ gridColumn: 'span 2', padding: '1.5rem', backgroundColor: 'transparent', border: '2px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Declarar Empate
                    </button>
                </div>
            </div>
        </div>
    );
}
