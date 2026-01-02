/**
 * Token-Bucket Rate Limiter Implementation
 * Supports different rate limits per user tier
 * 
 * Example usage:
 * ```typescript
 * const result = checkRateLimit(userId, userTier);
 * if (!result.allowed) {
 *   return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { 'Retry-After': String(result.retryAfter) } });
 * }
 * ```
 */

export type UserTier = 'free' | 'premium' | 'admin';

interface RateLimitConfig {
  requestsPerMinute: number;
  burstSize?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefillTime: number;
  limit: number;
  refillRate: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Rate limit configuration by user tier
const TIER_CONFIGS: Record<UserTier, RateLimitConfig> = {
  free: {
    requestsPerMinute: 5,
    burstSize: 10,
  },
  premium: {
    requestsPerMinute: 30,
    burstSize: 50,
  },
  admin: {
    requestsPerMinute: 1000,
    burstSize: 2000,
  },
};

// In-memory store for rate limit buckets (in production, use Redis)
const buckets = new Map<string, TokenBucket>();

// Cleanup interval in milliseconds
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let cleanupTimerId: NodeJS.Timeout | null = null;

/**
 * Initialize cleanup interval
 */
function initializeCleanup() {
  if (cleanupTimerId === null && typeof global !== 'undefined') {
    cleanupTimerId = setInterval(() => {
      cleanupOldBuckets();
    }, CLEANUP_INTERVAL);
    
    // Prevent Node process from hanging
    if (cleanupTimerId.unref) {
      cleanupTimerId.unref();
    }
  }
}

/**
 * Get the user tier from Auth0 metadata or default to 'free'
 * In production, this would fetch from the database/cache
 */
export function getUserTier(userId: string): UserTier {
  // TODO: Fetch actual user tier from database/Auth0 metadata
  // For now, default to 'free'
  // You can override this by passing the tier explicitly in checkRateLimit()
  return 'free';
}

/**
 * Check if a request should be allowed under rate limit
 * Uses token-bucket algorithm with configurable per-tier limits
 */
export function checkRateLimit(
  userId: string,
  userTier: UserTier = 'free'
): RateLimitResult {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    console.warn('checkRateLimit called with invalid userId');
    return {
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 60000,
    };
  }

  const config = TIER_CONFIGS[userTier];
  if (!config) {
    console.warn(`checkRateLimit called with unknown tier: ${userTier}`);
    return {
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 60000,
    };
  }

  const limit = config.requestsPerMinute;
  const burstSize = config.burstSize || limit * 2;
  const refillRate = limit / 60; // tokens per second

  const now = Date.now();
  let bucket = buckets.get(userId);

  // Initialize bucket if it doesn't exist
  if (!bucket) {
    bucket = {
      tokens: burstSize,
      lastRefillTime: now,
      limit: burstSize,
      refillRate,
    };
    buckets.set(userId, bucket);
    initializeCleanup();
  }

  // Refill tokens based on time elapsed
  const timeElapsed = (now - bucket.lastRefillTime) / 1000; // convert to seconds
  const tokensToAdd = timeElapsed * bucket.refillRate;
  bucket.tokens = Math.min(bucket.limit, bucket.tokens + tokensToAdd);
  bucket.lastRefillTime = now;

  // Check if request is allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    const remaining = Math.floor(bucket.tokens);

    return {
      allowed: true,
      remaining,
      resetTime: now + 60 * 1000, // Reset in 60 seconds
    };
  }

  // Calculate when the next token will be available
  const tokensNeeded = 1 - bucket.tokens;
  const secondsUntilToken = tokensNeeded / bucket.refillRate;
  const retryAfter = Math.ceil(secondsUntilToken);

  return {
    allowed: false,
    remaining: 0,
    resetTime: now + retryAfter * 1000,
    retryAfter,
  };
}

/**
 * Cleanup old buckets to prevent memory leaks
 * Removes buckets that haven't been used for maxAge milliseconds
 */
export function cleanupOldBuckets(maxAge = 3600000) {
  // 1 hour in milliseconds by default
  const now = Date.now();
  let removed = 0;

  for (const [userId, bucket] of buckets.entries()) {
    if (now - bucket.lastRefillTime > maxAge) {
      buckets.delete(userId);
      removed++;
    }
  }

  if (removed > 0) {
    console.debug(`[RATE_LIMITER] Cleaned up ${removed} old buckets`);
  }
}

/**
 * Get current bucket stats (for debugging)
 */
export function getBucketStats(userId: string) {
  return buckets.get(userId);
} {
  const config = TIER_CONFIGS[userTier];
  const limit = config.requestsPerMinute;
  const burstSize = config.burstSize || limit * 2;
  const refillRate = limit / 60; // tokens per second

  const now = Date.now();
  let bucket = buckets.get(userId);

  // Initialize bucket if it doesn't exist
  if (!bucket) {
    bucket = {
      tokens: burstSize,
      lastRefillTime: now,
      limit: burstSize,
      refillRate,
    };
    buckets.set(userId, bucket);
  }

  // Refill tokens based on time elapsed
  const timeElapsed = (now - bucket.lastRefillTime) / 1000; // convert to seconds
  const tokensToAdd = timeElapsed * bucket.refillRate;
  bucket.tokens = Math.min(bucket.limit, bucket.tokens + tokensToAdd);
  bucket.lastRefillTime = now;

  // Check if request is allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    const remaining = Math.floor(bucket.tokens);

    return {
      allowed: true,
      remaining,
      resetTime: now + (60 * 1000), // Reset in 60 seconds
    };
  }

  // Calculate when the next token will be available
  const tokensNeeded = 1 - bucket.tokens;
  const secondsUntilToken = tokensNeeded / bucket.refillRate;
  const retryAfter = Math.ceil(secondsUntilToken);

  return {
    allowed: false,
    remaining: 0,
    resetTime: now + (retryAfter * 1000),
    retryAfter,
  };
}

/**
 * Cleanup old buckets to prevent memory leaks
 * Should be called periodically (e.g., every 5 minutes)
 */
export function cleanupOldBuckets(maxAge = 3600000) {
  // 1 hour in milliseconds
  const now = Date.now();
  for (const [userId, bucket] of buckets.entries()) {
    if (now - bucket.lastRefillTime > maxAge) {
      buckets.delete(userId);
    }
  }
}

// Cleanup old buckets every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    cleanupOldBuckets();
  }, 5 * 60 * 1000);
}
