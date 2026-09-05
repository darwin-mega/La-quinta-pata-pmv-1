import { describe, expect, it } from "vitest";
import { buildRoomView, sessionBelongsToRoom } from "@/lib/room-view";
import { RoomSession } from "@/lib/session";
import { buildTestRoom } from "./fixtures";

const playerSession: RoomSession = {
    roomId: "TEST",
    playerId: "player-3",
    isHost: false,
    issuedAt: Date.now(),
    version: 1,
};

describe("vista segura de una sala", () => {
    it("oculta votos ajenos y temas guardados durante la votacion", () => {
        const view = buildRoomView(buildTestRoom("voting"), playerSession);
        const round = view.rounds[0];

        expect(round.votes["player-3"]).toBe("host-1");
        expect(round.votes["player-4"]).toBe("");
        expect(round.secondaryVotes["player-4"]).toBe("");
        expect(view.savedTopics).toEqual([]);
    });

    it("revela los votos cuando la ronda ya tiene resultado", () => {
        const view = buildRoomView(buildTestRoom("results"), playerSession);
        expect(view.rounds[0].votes["player-4"]).toBe("player-2");
    });

    it("rechaza sesiones que no pertenecen a la sala", () => {
        const room = buildTestRoom();
        expect(sessionBelongsToRoom(room, playerSession)).toBe(true);
        expect(sessionBelongsToRoom(room, { ...playerSession, playerId: "intruso" })).toBe(false);
        expect(sessionBelongsToRoom(room, null)).toBe(false);
    });
});
