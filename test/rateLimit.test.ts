import { describe, it, expect, beforeEach, vi } from 'vitest'
import { _resetStore, checkRateLimit, resolveUserTier } from '@/lib/rateLimit'
import * as auth from '@/lib/admin'
import * as subs from '@/db/queries/userProgress'

// Default mocks - tests will override when needed
const adminSpy = vi.spyOn(auth, 'getIsAdmin').mockImplementation(async () => false)
const subSpy = vi.spyOn(subs, 'getUserSubscription').mockImplementation(async () => null)

beforeEach(() => {
  _resetStore()
  // reset mocks to defaults
  adminSpy.mockImplementation(async () => false)
  subSpy.mockImplementation(async () => null)
})

describe('rate limiter', () => {
  it('allows up to standard limit and then blocks', async () => {
    const userId = 'user-1'
    const { tier, limit } = await resolveUserTier(userId as any)
    expect(tier).toBe('standard')

    for (let i = 0; i < limit; i++) {
      const r = await checkRateLimit(userId, limit)
      expect(r.allowed).toBe(true)
    }

    const r = await checkRateLimit(userId, limit)
    expect(r.allowed).toBe(false)
    expect(r.remaining).toBe(0)
  })


  it('applies premium limits when subscription is active', async () => {
    subSpy.mockImplementation(async (_userId?: string | null) => ({ isActive: true } as any))
    const userId = 'premium-user'
    const { tier, limit } = await resolveUserTier({ id: userId } as any)
    expect(tier).toBe('premium')
    expect(limit).toBeGreaterThan(5)

    for (let i = 0; i < limit; i++) {
      const r = await checkRateLimit(userId, limit)
      expect(r.allowed).toBe(true)
    }

    const r = await checkRateLimit(userId, limit)
    expect(r.allowed).toBe(false)
  })

  it('treats admins with high limits', async () => {
    adminSpy.mockImplementation(async () => true)
    const userId = 'admin-user'
    const { tier, limit } = await resolveUserTier({ id: userId, email: 'admin@example.com' } as any)
    expect(tier).toBe('admin')
    expect(limit).toBeGreaterThan(100)

    const r1 = await checkRateLimit(userId, limit)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(limit - 1)
  })

  it('resets window after WINDOW_MS passes', async () => {
    // Instead of relying on fake timers (which may not affect Date.now in all environments),
    // mock Date.now so we can advance time deterministically.
    const originalNow = Date.now
    let fakeNow = originalNow()
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => fakeNow)

    try {
      const userId = 'window-user'
      const limit = 2

      const r1 = await checkRateLimit(userId, limit)
      expect(r1.allowed).toBe(true)
      const r2 = await checkRateLimit(userId, limit)
      expect(r2.allowed).toBe(true)
      const r3 = await checkRateLimit(userId, limit)
      expect(r3.allowed).toBe(false)

      // Advance time past the window (1 minute)
      fakeNow += 60_001

      const r4 = await checkRateLimit(userId, limit)
      expect(r4.allowed).toBe(true)
    } finally {
      nowSpy.mockRestore()
    }
  })
})
