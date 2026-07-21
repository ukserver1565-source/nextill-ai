/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window counter per key (IP + route).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Check if a request should be rate-limited.
 * @param key - Unique identifier (e.g., IP + route)
 * @param maxRequests - Max allowed requests in the window
 * @param windowMs - Time window in milliseconds
 * @returns { limited: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: maxRequests - 1, resetIn: windowMs }
  }

  entry.count++
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetIn = entry.resetAt - now

  return {
    limited: entry.count > maxRequests,
    remaining,
    resetIn,
  }
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}
