import { getUserSubscription } from '@/db/queries/userProgress'
import { getIsAdmin } from '@/lib/admin'

// Simple fixed-window in-memory rate limiter for demo/testing.
// Production: replace with Redis-based implementation for distributed safety.

type Tier = 'admin' | 'premium' | 'standard'

const DEFAULT_LIMITS: Record<Tier, number> = {
  standard: 5, // 5 requests per minute
  premium: 60, // 60 requests per minute
  admin: 1000, // effectively unlimited for admins
}

const WINDOW_MS = 60_000 // 1 minute

const store = new Map<string, { count: number; windowStart: number }>()

export async function resolveUserTier(user: any): Promise<{ tier: Tier; limit: number }> {
  // Admin check
  const isAdmin = await getIsAdmin()
  if (isAdmin) return { tier: 'admin', limit: DEFAULT_LIMITS.admin }

  // Premium subscription
  const sub = await getUserSubscription()
  if (sub && sub.isActive) return { tier: 'premium', limit: DEFAULT_LIMITS.premium }

  return { tier: 'standard', limit: DEFAULT_LIMITS.standard }
}

export async function checkRateLimit(userId: string, limit: number) {
  const key = `rl:${userId}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, reset: now + WINDOW_MS }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.windowStart + WINDOW_MS }
  }

  entry.count += 1
  store.set(key, entry)
  return { allowed: true, remaining: Math.max(0, limit - entry.count), reset: entry.windowStart + WINDOW_MS }
}

// Used by tests to reset state
export function _resetStore() {
  store.clear()
}
