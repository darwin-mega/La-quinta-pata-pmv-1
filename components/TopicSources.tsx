import { ExternalLink } from "lucide-react";
import { DebateTopic } from "@/lib/topic-types";

export default function TopicSources({ topic }: { topic: DebateTopic }) {
    if (!topic.editorialNote && !topic.references?.length) return null;

    return (
        <aside style={{ padding: "0.9rem 1rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(147,197,253,0.2)", background: "rgba(59,130,246,0.08)" }}>
            <div style={{ marginBottom: "0.35rem", color: "#bfdbfe", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Contexto editorial
            </div>
            {topic.editorialNote ? (
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    {topic.editorialNote}
                </p>
            ) : null}
            {topic.references?.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.65rem" }}>
                    {topic.references.map(reference => (
                        <a
                            key={reference.url}
                            href={reference.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#93c5fd", fontSize: "0.78rem", fontWeight: 750 }}
                        >
                            {reference.label} <ExternalLink size={13} aria-hidden="true" />
                        </a>
                    ))}
                </div>
            ) : null}
            <p style={{ margin: "0.55rem 0 0", color: "rgba(255,255,255,0.42)", fontSize: "0.7rem" }}>
                La fuente explica el contexto; no determina qué postura gana.
            </p>
        </aside>
    );
}
