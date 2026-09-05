import { describe, expect, it } from "vitest";
import { POST as createRoom } from "@/app/api/room/route";
import { POST as joinRoom } from "@/app/api/room/[roomId]/join/route";
import { GET as getRoomState } from "@/app/api/room/[roomId]/state/route";
import { POST as dispatchRoomAction } from "@/app/api/room/[roomId]/action/route";

const jsonRequest = (url: string, body?: unknown, cookie?: string) => new Request(url, {
    method: body === undefined ? "GET" : "POST",
    headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(cookie ? { cookie } : {}),
        "user-agent": `vitest-${crypto.randomUUID()}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
});

const cookieFrom = (response: Response) => response.headers.get("set-cookie")?.split(";")[0] || "";

describe("flujo protegido de sala", () => {
    it("crea, protege, permite unirse y avanza con la sesion del host", async () => {
        const createdResponse = await createRoom(jsonRequest("http://local/api/room", {
            duration: "corta",
            hostName: "Ana",
            intensity: "liviano",
            topicSelectionMode: "automatic",
            mode: "multiplayer",
        }));
        expect(createdResponse.status).toBe(200);
        const created = await createdResponse.json();
        const roomId = created.room.id as string;
        const hostCookie = cookieFrom(createdResponse);
        const params = { params: Promise.resolve({ roomId }) };

        const anonymousState = await getRoomState(jsonRequest(`http://local/api/room/${roomId}/state`), params);
        expect(anonymousState.status).toBe(401);

        const joinedResponse = await joinRoom(jsonRequest(`http://local/api/room/${roomId}/join`, {
            playerName: "Beto",
        }), params);
        expect(joinedResponse.status).toBe(200);
        const playerCookie = cookieFrom(joinedResponse);

        const playerState = await getRoomState(jsonRequest(`http://local/api/room/${roomId}/state`, undefined, playerCookie), params);
        expect(playerState.status).toBe(200);

        const startedResponse = await dispatchRoomAction(jsonRequest(`http://local/api/room/${roomId}/action`, {
            action: "START_GAME",
            payload: {},
        }, hostCookie), params);
        expect(startedResponse.status).toBe(200);

        const startedState = await getRoomState(jsonRequest(`http://local/api/room/${roomId}/state`, undefined, playerCookie), params);
        const started = await startedState.json();
        expect(started.room.state).toBe("preparation");
        expect(started.room.rounds).toHaveLength(1);
    });
});
