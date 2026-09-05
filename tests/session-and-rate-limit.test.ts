import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRoomSessionValue, readRoomSession } from "@/lib/session";

afterEach(() => {
    vi.useRealTimers();
});

describe("protecciones de etapa 4", () => {
    it("rechaza una sesion firmada despues de cuatro horas", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-05T12:00:00Z"));
        const value = createRoomSessionValue("ABCD", "player-1", false);
        const request = () => new Request("http://local", { headers: { cookie: `lq_session_ABCD=${value}` } });

        expect(readRoomSession(request(), "ABCD")?.playerId).toBe("player-1");
        vi.setSystemTime(new Date("2026-09-05T16:00:01Z"));
        expect(readRoomSession(request(), "ABCD")).toBeNull();
    });

    it("bloquea solicitudes que superan el limite configurado", async () => {
        const identity = `test-${crypto.randomUUID()}`;
        expect((await checkRateLimit("unit", identity, 2, 60)).allowed).toBe(true);
        expect((await checkRateLimit("unit", identity, 2, 60)).allowed).toBe(true);
        const blocked = await checkRateLimit("unit", identity, 2, 60);
        expect(blocked.allowed).toBe(false);
        expect(blocked.remaining).toBe(0);
        expect(blocked.retryAfterSec).toBeGreaterThan(0);
    });
});
