import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Room } from "@/lib/store";
import Logo from "@/components/Logo";
import RoomSetupSummaryCard from "@/components/RoomSetupSummaryCard";

export default function LobbyView({
    room,
    isHost,
    onStart,
}: {
    room: Room;
    isHost: boolean;
    onStart: () => void;
    persistenceMode?: "redis" | "memory";
}) {
    const [localIp, setLocalIp] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
            fetch("/api/lan-ip")
                .then(res => res.json())
                .then(data => {
                    if (data.ip && data.ip !== "127.0.0.1") {
                        setLocalIp(data.ip);
                    }
                })
                .catch(console.error);
        }
    }, []);

    useEffect(() => {
        if (room.state !== "lobby") {
            setIsStarting(false);
        }
    }, [room.state]);

    let baseUrl = typeof window !== "undefined" ? window.location.origin : "https://lajaula.app";
    if (typeof window !== "undefined" && window.location.hostname === "localhost" && localIp) {
        baseUrl = `http://${localIp}:${window.location.port || 3000}`;
    }

    const joinUrl = `${baseUrl}/join/${room.id}`;

    const handleCopy = () => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStart = async () => {
        try {
            setIsStarting(true);
            import("@/lib/sounds").then(module => module.playButtonSound());

            setTimeout(() => {
                if (room.state === "lobby") setIsStarting(false);
            }, 4000);

            onStart();
        } catch (err) {
            console.error("Error al iniciar la partida:", err);
            setIsStarting(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", textAlign: "center", paddingBottom: "3rem" }}>
            <div style={{ marginBottom: "1rem" }}>
                <Logo width={160} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "350px" }}>
                <div style={{ padding: "0.75rem 1rem", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>Sala</span>
                    <span className="title-serif" style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "2px", color: "var(--accent-color)" }}>{room.id}</span>
                </div>
            </div>

            <div style={{ width: "100%", maxWidth: "350px" }}>
                <RoomSetupSummaryCard room={room} />
            </div>

            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%", maxWidth: "350px", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ width: "100%", textAlign: "center", marginBottom: "0.5rem" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.8rem 0" }}>Invita al resto escaneando el QR:</p>

                    <div style={{ padding: "15px", background: "white", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", display: "inline-block" }}>
                        <QRCodeCanvas value={joinUrl} size={160} />
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.6rem", gap: "0.5rem", width: "100%", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--font-mono)" }}>
                        {joinUrl}
                    </span>
                    <button
                        onClick={handleCopy}
                        style={{ background: "transparent", border: "none", color: copied ? "var(--success-color)" : "var(--accent-color)", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        {copied ? <Check size={18} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            <div style={{ width: "100%", maxWidth: "350px", textAlign: "left" }}>
                <h3 style={{ color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "1rem", display: "flex", justifyContent: "space-between", letterSpacing: "0.1em", fontWeight: 800 }}>
                    <span>Jugadores en espera</span>
                    <span style={{ color: "white", fontWeight: 900 }}>{room.players.length}</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {room.players.map(player => (
                        <div key={player.id} className="animate-fade-in" style={{ padding: "0.6rem 0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</span>
                            {player.id === room.hostId && <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>Host</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: "1rem", width: "100%", maxWidth: "350px" }}>
                {isHost ? (
                    <button
                        onClick={handleStart}
                        className={(room.players.length >= 2 && !isStarting) ? "animate-pulse-glow" : ""}
                        style={{
                            width: "100%",
                            padding: "1.25rem",
                            background: (room.players.length < 2 || isStarting) ? "rgba(255,255,255,0.05)" : "var(--accent-color)",
                            border: "none",
                            color: (room.players.length < 2 || isStarting) ? "rgba(255,255,255,0.2)" : "white",
                            borderRadius: "var(--radius-md)",
                            fontSize: "1.15rem",
                            fontWeight: 900,
                            boxShadow: (room.players.length < 2 || isStarting) ? "none" : "0 8px 30px rgba(255, 94, 58, 0.4)",
                            transition: "all 0.3s",
                            cursor: (room.players.length < 2 || isStarting) ? "not-allowed" : "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                        disabled={room.players.length < 2 || isStarting}
                    >
                        {isStarting ? "ABRIENDO..." : room.players.length < 2 ? "Esperando rivales" : "Elegir tema y empezar"}
                    </button>
                ) : (
                    <div style={{ padding: "1.25rem", background: "rgba(255, 94, 58, 0.05)", border: "1px dashed var(--accent-color)", borderRadius: "var(--radius-md)", color: "var(--accent-color)", fontWeight: 700 }}>
                        El host va a elegir el tema y arrancar.
                    </div>
                )}
            </div>
        </div>
    );
}
