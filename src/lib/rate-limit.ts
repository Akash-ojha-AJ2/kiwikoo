import { getRedisConnection, isRedisConfigured } from '@/lib/queue/redis'

// In-memory fallback rate limiting (used when Redis is unavailable)

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  tryon: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  ads: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  campaigns: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
}

export async function checkRateLimit(
  userId: string,
  endpoint: 'tryon' | 'ads' | 'campaigns'
): Promise<{ allowed: boolean; remaining: number; resetTime: number; retryAfterSeconds?: number }> {
  const config = defaultConfigs[endpoint]
  const key = `${userId}:${endpoint}`
  const now = Date.now()

  if (isRedisConfigured()) {
    try {
      const redis = getRedisConnection()
      const redisKey = `ratelimit:v1:${endpoint}:${userId}`
      const count = await redis.incr(redisKey)

      if (count === 1) {
        await redis.pexpire(redisKey, config.windowMs)
      }

      let ttlMs = await redis.pttl(redisKey)
      if (ttlMs < 0) {
        await redis.pexpire(redisKey, config.windowMs)
        ttlMs = config.windowMs
      }

      const resetTime = now + Math.max(1, ttlMs)
      if (count > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
        }
      }

      return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - count),
        resetTime,
      }
    } catch {
      // Fall back to in-memory limiter if Redis is temporarily unavailable.
    }
  }

  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  const current = store[key]

  if (current.count >= config.maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetTime - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfterSeconds,
    }
  }

  current.count++

  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime,
  }
}

// Cleanup function to run periodically
export function cleanupRateLimitStore() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}

