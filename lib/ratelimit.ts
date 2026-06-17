import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Degrade gracefully when Upstash is not configured (local dev without Redis).
// Log a warning once so it is visible in dev logs but does not crash the server.
let redis: Redis | null = null;
let warnedOnce = false;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (!warnedOnce) {
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled.",
      );
      warnedOnce = true;
    }
    return null;
  }
  redis = Redis.fromEnv();
  return redis;
}

// Sliding window: 10 requests per minute per identifier (IP).
// Used for all public form endpoints.
let _formRatelimit: Ratelimit | null = null;

export function getFormRatelimit(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  if (!_formRatelimit) {
    _formRatelimit = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "qs:form",
    });
  }
  return _formRatelimit;
}

/**
 * Check rate limit for a given identifier. Returns true when the request
 * should proceed (within limit or Redis unavailable). Returns false when the
 * request should be rejected (limit exceeded).
 */
export async function checkFormRateLimit(identifier: string): Promise<boolean> {
  const limiter = getFormRatelimit();
  if (!limiter) return true; // no Redis — allow through
  const { success } = await limiter.limit(identifier);
  return success;
}
