interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Returns true if the request should be blocked (limit exceeded).
 * @param key      Unique key, e.g. `${userId}:${route}`
 * @param limit    Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count += 1;
  return false;
}
