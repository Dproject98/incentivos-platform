import { NextRequest } from "next/server"

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Per-key in-memory store. Suitable for single-instance home server.
// Replace with Redis (ioredis + @upstash/ratelimit) for multi-instance.
const store = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Key should uniquely identify the client+action (e.g. ip+route).
 */
export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** Extract the real client IP, respecting nginx X-Real-IP / X-Forwarded-For headers. */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  )
}

// Clean up expired entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 10 * 60 * 1000)
}
