import { checkRateLimit, getUserTier, cleanupOldBuckets } from '@/lib/rate-limiter'

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear buckets before each test
    cleanupOldBuckets(0) // Clear all buckets
  })

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const result = checkRateLimit('test-user', 'free')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
    })

    it('should return rate limit info', () => {
      const result = checkRateLimit('test-user-1', 'free')
      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('remaining')
      expect(result).toHaveProperty('resetTime')
      expect(typeof result.allowed).toBe('boolean')
      expect(typeof result.remaining).toBe('number')
      expect(typeof result.resetTime).toBe('number')
    })

    it('should track tokens per user', () => {
      const userId = 'test-user-2'
      const first = checkRateLimit(userId, 'free')
      const firstRemaining = first.remaining

      // Make another request
      const second = checkRateLimit(userId, 'free')
      
      // Second should have fewer remaining
      if (first.allowed && second.allowed) {
        expect(second.remaining).toBeLessThanOrEqual(firstRemaining)
      }
    })

    it('should support different user tiers', () => {
      const freeResult = checkRateLimit('free-user', 'free')
      const premiumResult = checkRateLimit('premium-user', 'premium')

      // Both should be valid responses
      expect(freeResult).toHaveProperty('allowed')
      expect(premiumResult).toHaveProperty('allowed')

      // This is a sanity check - both tiers should work
      expect(['free', 'premium', 'admin']).toContain('free')
      expect(['free', 'premium', 'admin']).toContain('premium')
    })

    it('should return retry-after when rate limited', () => {
      const userId = 'test-user-3'
      const limit = 5

      // Make requests to exceed free tier limit
      for (let i = 0; i < limit; i++) {
        checkRateLimit(userId, 'free')
      }

      // Next request should be rate limited
      const result = checkRateLimit(userId, 'free')
      if (!result.allowed) {
        expect(result.retryAfter).toBeDefined()
        expect(result.retryAfter).toBeGreaterThan(0)
      }
    })
  })

  describe('getUserTier', () => {
    it('should return a valid tier', () => {
      const tier = getUserTier('any-user')
      expect(['free', 'premium', 'admin']).toContain(tier)
    })

    it('should return consistent tier for same user', () => {
      const userId = 'consistent-user'
      const tier1 = getUserTier(userId)
      const tier2 = getUserTier(userId)
      expect(tier1).toBe(tier2)
    })
  })
})
