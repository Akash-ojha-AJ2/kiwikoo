/**
 * TRAFFIC GUARD — In-flight (concurrent) request limiting
 *
 * Ensures at most one try-on and one ad generation per user at a time.
 * When multiple users click "Generate" at once, only one request per user
 * runs; others get 429 with "A generation is already in progress."
 *
 * At scale this regulates traffic without burning rate-limit count for
 * duplicate clicks and gives a clear "wait for current request" message.
 */
import { getRedisConnection, isRedisConfigured } from '@/lib/queue/redis'

export type GuardType = 'tryon' | 'ads'

interface InFlightEntry {
  type: GuardType
  started: number
}

const STALE_MS = 2 * 60 * 1000 // 2 min — release if request crashed/hung
/** Max time to wait for Redis release so serverless response is never blocked (key expires by TTL anyway). */
const RELEASE_TIMEOUT_MS = 2_000
const store = new Map<string, InFlightEntry>()

function pruneStale() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.started >= STALE_MS) store.delete(key)
  }
}

export interface AcquireResult {
  allowed: boolean
  retryAfterSeconds?: number
  release?: () => Promise<void>
}

/**
 * Try to acquire an in-flight slot for this user and type.
 * Call release() in a finally block when the request finishes.
 */
export async function tryAcquireInFlight(userId: string, type: GuardType): Promise<AcquireResult> {
  if (isRedisConfigured()) {
    try {
      const redis = getRedisConnection()
      const key = `inflight:v1:${type}:${userId}`
      const setResult = await redis.set(key, String(Date.now()), 'PX', STALE_MS, 'NX')

      if (setResult === 'OK') {
        return {
          allowed: true,
          release: async () => {
            await Promise.race([
              redis.del(key).catch(() => {}),
              new Promise<void>((r) => setTimeout(r, RELEASE_TIMEOUT_MS)),
            ])
          },
        }
      }

      const ttlMs = await redis.pttl(key)
      const retryAfterSeconds =
        ttlMs > 0 ? Math.min(15, Math.max(5, Math.ceil(ttlMs / 1000))) : 10

      return {
        allowed: false,
        retryAfterSeconds,
      }
    } catch {
      // Fall back to in-memory guard if Redis is temporarily unavailable.
    }
  }

  pruneStale()
  const key = `${userId}:${type}`
  const existing = store.get(key)
  const now = Date.now()

  if (existing) {
    const ageSec = Math.ceil((now - existing.started) / 1000)
    // If stale, treat as released
    if (ageSec >= STALE_MS / 1000) {
      store.delete(key)
    } else {
      return {
        allowed: false,
        retryAfterSeconds: Math.min(15, Math.max(5, Math.ceil(ageSec / 2))),
      }
    }
  }

  store.set(key, { type, started: now })
  return {
    allowed: true,
    release: async () => {
      store.delete(key)
    },
  }
}
