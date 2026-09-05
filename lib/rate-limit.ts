import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

type RateLimitEntry = {
    count: number;
    expiresAt: number;
};

export type RateLimitResult = {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfterSec: number;
};

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const globalRateLimit = global as unknown as {
    lqpRateLimits?: Map<string, RateLimitEntry>;
};

const memoryLimits = globalRateLimit.lqpRateLimits || new Map<string, RateLimitEntry>();
globalRateLimit.lqpRateLimits = memoryLimits;

const normalizeKeyPart = (value: string) => value.toLowerCase().replace(/[^a-z0-9:_-]/g, "-").slice(0, 96);

export const getRequestFingerprint = (req: Request) => {
    const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const address = forwardedFor || req.headers.get("x-real-ip") || "unknown";
    return createHash("sha256").update(address).digest("hex").slice(0, 24);
};

export const checkRateLimit = async (
    scope: string,
    identity: string,
    limit: number,
    windowSec: number,
): Promise<RateLimitResult> => {
    const now = Date.now();
    const windowMs = windowSec * 1000;
    const windowNumber = Math.floor(now / windowMs);
    const retryAfterSec = Math.max(1, Math.ceil((((windowNumber + 1) * windowMs) - now) / 1000));
    const key = `lqp:rate:${normalizeKeyPart(scope)}:${normalizeKeyPart(identity)}:${windowNumber}`;

    if (redis) {
        try {
            const count = await redis.incr(key);
            // Refreshing the expiry also repairs a counter if a previous invocation
            // completed INCR but was interrupted before setting its TTL.
            await redis.expire(key, windowSec + 5);
            return {
                allowed: count <= limit,
                limit,
                remaining: Math.max(0, limit - count),
                retryAfterSec,
            };
        } catch (error) {
            console.error("[RateLimit] Redis unavailable, using local fallback:", error);
        }
    }

    const existing = memoryLimits.get(key);
    const entry = existing && existing.expiresAt > now
        ? existing
        : { count: 0, expiresAt: now + windowMs };
    entry.count += 1;
    memoryLimits.set(key, entry);

    if (memoryLimits.size > 500) {
        for (const [storedKey, storedEntry] of memoryLimits) {
            if (storedEntry.expiresAt <= now) memoryLimits.delete(storedKey);
        }
    }

    return {
        allowed: entry.count <= limit,
        limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSec: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
    };
};

export const rateLimitResponse = (result: RateLimitResult, message: string) => Response.json(
    { error: message, retryAfter: result.retryAfterSec },
    {
        status: 429,
        headers: {
            "Retry-After": String(result.retryAfterSec),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": String(result.remaining),
        },
    },
);
