import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export type RoomSession = {
    roomId: string;
    playerId: string;
    isHost: boolean;
    issuedAt: number;
    version: 1;
};

const COOKIE_MAX_AGE_SEC = 60 * 60 * 4;
const SESSION_SECRET = (
    process.env.LA_JAULA_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    "la-jaula-dev-secret"
);

const toBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");
const sign = (value: string) => createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");

export const getRoomSessionCookieName = (roomId: string) => `lq_session_${roomId.toUpperCase()}`;

export const createRoomSessionValue = (roomId: string, playerId: string, isHost: boolean) => {
    const payload: RoomSession = {
        roomId: roomId.toUpperCase(),
        playerId,
        isHost,
        issuedAt: Date.now(),
        version: 1
    };

    const encodedPayload = toBase64Url(JSON.stringify(payload));
    return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const readRoomSession = (req: Request, roomId: string): RoomSession | null => {
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookieName = getRoomSessionCookieName(roomId);
    const rawCookie = cookieHeader
        .split(";")
        .map(part => part.trim())
        .find(part => part.startsWith(`${cookieName}=`));

    if (!rawCookie) return null;

    const rawValue = rawCookie.slice(cookieName.length + 1);
    const [encodedPayload, providedSignature] = rawValue.split(".");
    if (!encodedPayload || !providedSignature) return null;

    const expectedSignature = sign(encodedPayload);
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
        providedBuffer.length !== expectedBuffer.length ||
        !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
        return null;
    }

    try {
        const parsed = JSON.parse(fromBase64Url(encodedPayload)) as RoomSession;
        if (parsed.version !== 1 || parsed.roomId !== roomId.toUpperCase()) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

export const setRoomSessionCookie = (response: NextResponse, roomId: string, playerId: string, isHost: boolean) => {
    response.cookies.set({
        name: getRoomSessionCookieName(roomId),
        value: createRoomSessionValue(roomId, playerId, isHost),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE_SEC
    });
};
