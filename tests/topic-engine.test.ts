import { describe, expect, it } from "vitest";
import { topics } from "@/data/topics";
import { buildTopicPool, getNextTopicFromPool } from "@/lib/topic-engine";

const everydayConfig = {
    mode: "system" as const,
    selectedCategories: ["vida_cotidiana"],
    selectedIntensities: ["baja" as const],
    customTopics: [],
    mixStrategy: "balanced" as const,
};

describe("motor editorial", () => {
    it("mantiene identificadores y textos unicos", () => {
        expect(new Set(topics.map(topic => topic.id)).size).toBe(topics.length);
        expect(new Set(topics.map(topic => topic.text.toLowerCase())).size).toBe(topics.length);
        expect(topics).toHaveLength(125);
    });

    it("filtra el mazo cotidiano y tranqui", () => {
        const pool = buildTopicPool(everydayConfig);
        expect(pool).toHaveLength(18);
        expect(pool.every(topic => topic.category === "vida_cotidiana" && topic.intensity === "baja")).toBe(true);
    });

    it("recicla el mazo sin bloquear la partida cuando se agota", () => {
        const pool = buildTopicPool(everydayConfig);
        const result = getNextTopicFromPool(everydayConfig, pool.map(topic => topic.id));
        expect(result.recycled).toBe(true);
        expect(result.topic).not.toBeNull();
        expect(result.totalPoolSize).toBe(18);
    });
});
