import { Room } from "@/lib/store";
import { getGameDurationLabel, getGameIntensityLabel } from "@/lib/game";

export default function RoomSetupSummaryCard({
    room,
    accentColor = "var(--accent-color)",
    title = "Configuracion de la partida",
}: {
    room: Room;
    accentColor?: string;
    title?: string;
}) {
    return (
        <div className="glass-panel" style={{ padding: "1rem", width: "100%", borderLeft: `4px solid ${accentColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                    <div style={{ color: accentColor, fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {title}
                    </div>
                    <div style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                        {room.mode === "mesa" ? "Modo mesa" : "Modo individual"}
                    </div>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    {room.topicSelectionMode === "automatic" ? "Temas automaticos" : "Temas manuales"}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginTop: "0.9rem" }}>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Intensidad</div>
                    <div style={{ color: "white", fontSize: "0.95rem", lineHeight: 1.45, marginTop: "0.2rem" }}>
                        {getGameIntensityLabel(room.intensity)}
                    </div>
                </div>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Largo</div>
                    <div style={{ color: "white", fontSize: "0.95rem", lineHeight: 1.45, marginTop: "0.2rem" }}>
                        {getGameDurationLabel(room.duration)}
                    </div>
                </div>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Temas guardados</div>
                    <div style={{ color: "white", fontSize: "0.95rem", lineHeight: 1.45, marginTop: "0.2rem" }}>
                        {room.savedTopics.length}
                    </div>
                </div>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Modo de tema</div>
                    <div style={{ color: "white", fontSize: "0.95rem", lineHeight: 1.45, marginTop: "0.2rem" }}>
                        {room.topicSelectionMode === "automatic" ? "Automatico" : "Manual"}
                    </div>
                </div>
            </div>
        </div>
    );
}
