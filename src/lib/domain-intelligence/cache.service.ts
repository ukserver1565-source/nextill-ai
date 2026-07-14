// In-memory cache for Domain Intelligence provider results
// Prevents wasting API units on duplicate requests
// TTL-based: defaults to 1 hour for Semrush, 24 hours for PageSpeed

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL_MS = 60 * 60 * 1000        // 1 hour
const PAGESPEED_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data
}

export function cacheSet<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function cacheClear(pattern?: string): void {
  if (!pattern) {
    store.clear()
    return
  }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key)
  }
}

export const TTL = {
  SEMRUSH: DEFAULT_TTL_MS,
  PAGESPEED: PAGESPEED_TTL_MS,
  LOCAL: 5 * 60 * 1000, // 5 minutes for local analysis
} as const
