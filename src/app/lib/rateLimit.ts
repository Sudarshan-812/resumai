import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Stricter than the global per-route limiter in middleware.ts (20/10s) -
// a LiveKit token request spins up a Python agent + LLM/STT pipeline, making
// this the most expensive endpoint in the app to leave under-protected.
export const tokenRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      analytics: true,
      prefix: "ratelimit:interview-token",
    })
  : null;

// Guest ("/try") analysis runs a full LLM pass with no auth. The client-side
// counter (localStorage) is only a nudge - this is the real backstop so
// clearing storage / incognito can't mint unlimited free AI calls from one IP.
export const guestAnalyzeRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, "1 d"),
      analytics: true,
      prefix: "ratelimit:guest-analyze",
    })
  : null;

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1"
  );
}
