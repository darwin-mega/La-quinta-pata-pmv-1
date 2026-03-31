import { Room } from "@/lib/store";
import { summarizeTopicConfig } from "@/lib/topic-engine";

export default function TopicSummaryCard({
    room,
    accentColor = "var(--accent-color)",
    title = "Contenido configurado"
}: {
    room: Room;
    accentColor?: string;
    title?: string;
}) {
    const summary = summarizeTopicConfig(room.topicConfig);

    return (
        <div className="glass-panel" style={{ padding: "1rem", width: "100%", borderLeft: `4px solid ${accentColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                    <div style={{ color: accentColor, fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {title}
                    </div>
                    <div style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                        {summary.modeLabel}
                    </div>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    {summary.totalCount} tema(s) en la sesión
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginTop: "0.9rem" }}>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pool</div>
                    <div style={{ color: "white", fontSize: "0.9rem", lineHeight: 1.45, marginTop: "0.2rem" }}>
                        Sistema {summary.systemCount} · Personalizados {summary.customCount}
                    </div>
                </div>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Categorías</div>
                    <div style={{ color: "white", fontSize: "0.9rem", lineHeight: 1.45, marginTop: "0.2rem" }}>{summary.categoriesLabel}</div>
                </div>
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Intensidades</div>
                    <div style={{ color: "white", fontSize: "0.9rem", lineHeight: 1.45, marginTop: "0.2rem" }}>{summary.intensitiesLabel}</div>
                </div>
            </div>
        </div>
    );
}
