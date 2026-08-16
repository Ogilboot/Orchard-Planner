type Bucket = { count: number; resetAt: number };

// In-memory fixed-window rate limiter. Suitable for a single-instance
// deployment (which SQLite implies). Resets on process restart.
const buckets = new Map<string, Bucket>();

function cleanup() {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

const timer = setInterval(cleanup, 60_000);
if (typeof timer === "object" && timer && typeof (timer as { unref?: () => void }).unref === "function") {
  (timer as { unref: () => void }).unref();
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

export function ipFromHeaders(h: { get(name: string): string | null }): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
