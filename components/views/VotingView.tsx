import { useState } from "react";
import { Room } from "@/lib/store";

export default function VotingView({
    room,
    playerId,
    isHost,
    onVote,
    onCloseVoting
}: {
    room: Room;
    playerId: string;
    isHost: boolean;
    onVote: (votedForId: string, reason: string) => void;
    onCloseVoting: () => void;
}) {
    const round = room.rounds[room.currentRoundIndex];
    const pA = room.players.find(player => player.id === round.debatienteA_Id);
    const pB = room.players.find(player => player.id === round.debatienteB_Id);
    const isDirectResolution = room.players.length === 2;
    const existingVote = isDirectResolution ? round.resolutionVotes?.[playerId] : round.votes[playerId];

    const [mainVote, setMainVote] = useState<string | null>(null);
    const [reasonVote, setReasonVote] = useState<string>("claro");
    const [hasVoted, setHasVoted] = useState(false);

    const isDebater = playerId === round.debatienteA_Id || playerId === round.debatienteB_Id;
    const hasSubmittedVote = hasVoted || !!existingVote;
    const votesMap = isDirectResolution ? (round.resolutionVotes || {}) : round.votes;
    const votesReceived = Object.keys(votesMap).length;
    const totalVoters = isDirectResolution
        ? 2
        : room.players.filter(player => player.id !== round.debatienteA_Id && player.id !== round.debatienteB_Id).length;

    const handleVoteSubmit = () => {
        if (!mainVote) return;
        onVote(mainVote, reasonVote);
        setHasVoted(true);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1.5rem", padding: "1rem" }}>
            <div style={{ textAlign: "center" }}>
                <span
                    style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-color)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.2em"
                    }}
                >
                    Veredicto Final
                </span>
                <h2 className="title-serif" style={{ fontSize: "2.4rem", color: "white", marginTop: "0.2rem", marginBottom: "1rem" }}>
                    Sentencia
                </h2>

                <div
                    style={{
                        backgroundColor: "rgba(255, 94, 58, 0.15)",
                        border: "1px solid var(--accent-color)",
                        padding: "1rem",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "1.5rem"
                    }}
                >
                    <p style={{ color: "var(--accent-color)", fontWeight: 700, fontSize: "0.95rem", margin: 0, textTransform: "uppercase" }}>
                        Criterio de Votación
                    </p>
                    <p style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, margin: "0.5rem 0 0 0" }}>
                        No votes quién tiene razón.
                        <br />
                        Votá quién argumentó mejor.
                    </p>
                </div>
            </div>

            {isDirectResolution ? (
                hasSubmittedVote ? (
                    <div className="glass-panel animate-fade-in" style={{ padding: "2.5rem", textAlign: "center", marginTop: "2rem" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>⚖️</div>
                        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "white" }}>Voto emitido</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                            Esperando a que el otro jugador decida el destino de la ronda...
                        </p>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-in" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                        <h3 style={{ fontSize: "1.2rem", color: "white", textAlign: "center", fontWeight: 700 }}>
                            ¿De quién fue el mejor desempeño?
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <button
                                onClick={() => {
                                    onVote("A", "");
                                    setHasVoted(true);
                                }}
                                style={{
                                    padding: "1.5rem",
                                    borderRadius: "var(--radius-md)",
                                    border: "2px solid rgba(239, 68, 68, 0.3)",
                                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                                    color: "white",
                                    fontWeight: 800,
                                    fontSize: "1.2rem",
                                    cursor: "pointer"
                                }}
                            >
                                <span style={{ color: "#ef4444", marginRight: "0.5rem" }}>●</span> {pA?.name}
                            </button>
                            <button
                                onClick={() => {
                                    onVote("B", "");
                                    setHasVoted(true);
                                }}
                                style={{
                                    padding: "1.5rem",
                                    borderRadius: "var(--radius-md)",
                                    border: "2px solid rgba(59, 130, 246, 0.3)",
                                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                                    color: "white",
                                    fontWeight: 800,
                                    fontSize: "1.2rem",
                                    cursor: "pointer"
                                }}
                            >
                                <span style={{ color: "#3b82f6", marginRight: "0.5rem" }}>●</span> {pB?.name}
                            </button>

                            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", margin: "0.5rem 0" }} />

                            <button
                                onClick={() => {
                                    onVote("empate", "");
                                    setHasVoted(true);
                                }}
                                style={{
                                    padding: "1.2rem",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    backgroundColor: "transparent",
                                    color: "var(--text-secondary)",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: "pointer"
                                }}
                            >
                                Empate Técnico
                            </button>
                        </div>
                    </div>
                )
            ) : !isDebater ? (
                hasSubmittedVote ? (
                    <div className="glass-panel animate-fade-in" style={{ padding: "3rem", textAlign: "center", marginTop: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: "5rem", marginBottom: "1.5rem", opacity: 0.8 }}>🗳️</div>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "white", fontWeight: 800 }}>Voto Registrado</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                            Tu juicio ha sido emitido.
                            <br />
                            Esperando al resto de los jueces...
                        </p>

                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                            {[...Array(totalVoters)].map((_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: "50%",
                                        backgroundColor: index < votesReceived ? "var(--accent-color)" : "rgba(255,255,255,0.1)",
                                        transition: "all 0.5s ease"
                                    }}
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
                            {votesReceived} de {totalVoters} votos
                        </p>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-in" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "1.2rem", textAlign: "center", fontWeight: 600 }}>
                                ¿Quién dominó el debate?
                            </h3>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    onClick={() => setMainVote(round.debatienteA_Id)}
                                    style={{
                                        flex: 1,
                                        padding: "1.8rem 1rem",
                                        borderRadius: "var(--radius-md)",
                                        border: `2px solid ${mainVote === round.debatienteA_Id ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
                                        backgroundColor: mainVote === round.debatienteA_Id ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)",
                                        color: mainVote === round.debatienteA_Id ? "white" : "var(--text-secondary)",
                                        transition: "all 0.3s",
                                        fontWeight: 800,
                                        fontSize: "1.2rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    <div style={{ fontSize: "0.7rem", opacity: 0.6, marginBottom: "0.4rem", textTransform: "uppercase" }}>
                                        Debatiente A
                                    </div>
                                    {pA?.name}
                                </button>
                                <button
                                    onClick={() => setMainVote(round.debatienteB_Id)}
                                    style={{
                                        flex: 1,
                                        padding: "1.8rem 1rem",
                                        borderRadius: "var(--radius-md)",
                                        border: `2px solid ${mainVote === round.debatienteB_Id ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
                                        backgroundColor: mainVote === round.debatienteB_Id ? "rgba(59, 130, 246, 0.15)" : "rgba(255,255,255,0.03)",
                                        color: mainVote === round.debatienteB_Id ? "white" : "var(--text-secondary)",
                                        transition: "all 0.3s",
                                        fontWeight: 800,
                                        fontSize: "1.2rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    <div style={{ fontSize: "0.7rem", opacity: 0.6, marginBottom: "0.4rem", textTransform: "uppercase" }}>
                                        Debatiente B
                                    </div>
                                    {pB?.name}
                                </button>
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", textAlign: "center", letterSpacing: "0.1em", fontWeight: 700 }}>
                                Argumento Razón
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                {[
                                    { id: "claro", label: "Más claro" },
                                    { id: "solido", label: "Más sólido" },
                                    { id: "respuesta", label: "Mejor respuesta" },
                                    { id: "estilo", label: "Mejor estilo" }
                                ].map(reason => (
                                    <button
                                        key={reason.id}
                                        onClick={() => setReasonVote(reason.id)}
                                        style={{
                                            padding: "0.8rem",
                                            borderRadius: "var(--radius-sm)",
                                            border: `1px solid ${reasonVote === reason.id ? "var(--accent-color)" : "rgba(255,255,255,0.1)"}`,
                                            backgroundColor: reasonVote === reason.id ? "rgba(255, 94, 58, 0.1)" : "transparent",
                                            color: reasonVote === reason.id ? "white" : "var(--text-secondary)",
                                            fontSize: "0.85rem",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {reason.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleVoteSubmit}
                            disabled={!mainVote}
                            style={{
                                padding: "1.2rem",
                                backgroundColor: "var(--accent-color)",
                                color: "white",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                fontSize: "1.2rem",
                                fontWeight: 800,
                                opacity: mainVote ? 1 : 0.3,
                                marginTop: "1rem",
                                cursor: mainVote ? "pointer" : "not-allowed",
                                boxShadow: mainVote ? "0 8px 25px rgba(255, 94, 58, 0.4)" : "none"
                            }}
                        >
                            Enviar Sentencia
                        </button>
                    </div>
                )
            ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: "3rem", textAlign: "center", marginTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1.5rem", filter: "grayscale(1)" }}>🤐</div>
                    <p style={{ color: "white", fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>Silencio en la sala</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "80%" }}>
                        Como debatiente, tu suerte está en manos del jurado. Esperá el veredicto final.
                    </p>
                </div>
            )}

            {isHost && (
                <div style={{ marginTop: "auto", padding: "1rem 0", textAlign: "center" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                        Cierre automático: {votesReceived}/{totalVoters} votos
                    </p>
                    <button
                        onClick={onCloseVoting}
                        style={{
                            background: "transparent",
                            border: "1px dashed rgba(255,255,255,0.2)",
                            color: "var(--text-secondary)",
                            padding: "0.5rem 1rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                            cursor: "pointer"
                        }}
                    >
                        Forzar Cierre (Excepción)
                    </button>
                </div>
            )}
        </div>
    );
}
