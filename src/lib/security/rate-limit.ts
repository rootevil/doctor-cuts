import "server-only";
import { headers } from "next/headers";

// In-memory token bucket. Adequate for a single Node.js instance (Vercel
// serverless, a single VPS, docker container). For horizontally-scaled
// deployments swap this backend for Upstash Redis or Supabase-backed
// storage; the callable surface (`consume`) stays the same.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Trim the map periodically so it doesn't grow unbounded.
const MAX_ENTRIES = 5_000;
function gc(now: number) {
  if (buckets.size < MAX_ENTRIES) return;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Consume one token from a windowed rate limit bucket. Returns
 * `{ ok: false }` when the caller is over the limit.
 *
 * @param key   Stable identifier for the caller + action. IP + action name
 *              is the recommended shape; the helpers below build it for you.
 * @param limit Maximum requests allowed inside the window.
 * @param windowMs Duration of the sliding window in milliseconds.
 */
export function consume(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  gc(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

async function callerIp(): Promise<string> {
  const h = await headers();
  // Reverse proxies typically set one of these. First hop wins.
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function limitByIp(
  action: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const ip = await callerIp();
  return consume(`${action}:${ip}`, limit, windowMs);
}

export async function limitByKey(
  action: string,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return consume(`${action}:${key}`, limit, windowMs);
}
