import { describe, it, expect, beforeEach, vi } from 'vitest'
import { _resetStore, checkRateLimit, resolveUserTier } from '@/lib/rateLimit'
import * as auth from '@/lib/admin'
import * as subs from '@/db/queries/userProgress'

// Mock user modules
vi.spyOn(auth, 'getIsAdmin').mockImplementation(async () => false)
vi.spyOn(subs, 'getUserSubscription').mockImplementation(async () => null)

beforeEach(() => {
  _resetStore()
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
})
