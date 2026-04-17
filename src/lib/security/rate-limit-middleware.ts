import { NextResponse, type NextRequest } from 'next/server'

type WindowState = { count: number; resetAt: number }

const READ_METHODS = new Set(['GET', 'HEAD'])

// Edge-safe in-memory store (best-effort). For strict production guarantees, back this with Redis.
const store = new Map<string, WindowState>()

function getUpstashRestConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return { url, token }
}

async function runUpstashCommand(args: Array<string | number>) {
  const config = getUpstashRestConfig()
  if (!config) return null

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Upstash command failed with status ${response.status}`)
  }

  const payload = await response.json()
  return payload?.result
}

function getClientIp(request: NextRequest): string {
  const directIp =
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-vercel-forwarded-for')
  if (directIp) return directIp.trim()

  const xf = request.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]?.trim() || 'unknown'
  // NextRequest.ip is not available in all Next.js versions/runtimes; rely on forwarded headers.
  return 'unknown'
}

function pickBucket(pathname: string): 'auth' | 'tryon' | 'ads' | 'ai' | 'write' | 'read' {
  if (pathname.startsWith('/api/auth/')) {
    if (pathname.includes('/me') || pathname.includes('/profile-status')) {
      return 'read'
    }
    return 'auth'
  }
  if (pathname.startsWith('/api/tryon/jobs/')) return 'read'
  if (pathname.startsWith('/api/tryon')) return 'tryon'
  // Ads generate/regenerate — same traffic regulation as try-on
  if (pathname.startsWith('/api/ads/') && (pathname.includes('generate') || pathname.includes('regenerate'))) {
    return 'ads'
  }
  if (
    pathname.startsWith('/api/ads/') ||
    pathname.startsWith('/api/campaigns/chat') ||
    pathname.startsWith('/api/fashion-buddy/')
  ) {
    return 'ai'
  }
  return 'read'
}

function getLimits(
  bucket: ReturnType<typeof pickBucket>,
  method: string
): { windowMs: number; maxIp: number; maxUser: number } {
  const windowMs = 60_000 // 1 minute

  // Default by method: read endpoints are higher than writes.
  const isWrite = method !== 'GET' && method !== 'HEAD'
  if (bucket === 'auth') {
    // Throttle credential stuffing / enumeration
    return { windowMs, maxIp: 10, maxUser: 20 }
  }
  if (bucket === 'tryon') {
    // Per-minute: allow bursts (e.g. 6/min) so quick retries don't hit limit; hourly cap still applies.
    const maxPerMinute = parseInt(process.env.MAX_TRYON_PER_MINUTE || '6')
    return { windowMs, maxIp: maxPerMinute, maxUser: maxPerMinute }
  }
  if (bucket === 'ads') {
    // Align with route-level check: 10/min per user so ads and try-on scale similarly.
    const maxPerMinute = parseInt(process.env.MAX_ADS_PER_MINUTE || '10')
    return { windowMs, maxIp: maxPerMinute, maxUser: maxPerMinute }
  }
  if (bucket === 'ai') {
    return { windowMs, maxIp: 20, maxUser: 30 }
  }
  if (isWrite) {
    return { windowMs, maxIp: 60, maxUser: 120 }
  }
  return { windowMs, maxIp: 120, maxUser: 240 }
}

async function consumeRemote(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const countResult = await runUpstashCommand(['INCR', key])
  if (countResult === null) return null

  const count = Number(countResult)
  if (!Number.isFinite(count)) {
    throw new Error('Invalid Upstash counter result')
  }

  if (count === 1) {
    await runUpstashCommand(['PEXPIRE', key, windowMs])
  }

  let ttlMs = Number(await runUpstashCommand(['PTTL', key]))
  if (!Number.isFinite(ttlMs) || ttlMs < 0) {
    await runUpstashCommand(['PEXPIRE', key, windowMs])
    ttlMs = windowMs
  }

  const resetAt = now + Math.max(1, ttlMs)
  if (count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - count),
    resetAt,
  }
}

function consumeLocal(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    const next: WindowState = { count: 1, resetAt: now + windowMs }
    store.set(key, next)
    return { allowed: true, remaining: maxRequests - 1, resetAt: next.resetAt }
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  store.set(key, existing)
  return { allowed: true, remaining: Math.max(0, maxRequests - existing.count), resetAt: existing.resetAt }
}

async function consume(key: string, maxRequests: number, windowMs: number) {
  const config = getUpstashRestConfig()
  if (config) {
    try {
      const remoteResult = await consumeRemote(key, maxRequests, windowMs)
      if (remoteResult) return remoteResult
    } catch {
      // Fall back to in-memory tracking if the remote limiter is unavailable.
    }
  }

  return consumeLocal(key, maxRequests, windowMs)
}

function maybeCleanup() {
  // Best-effort cleanup to keep memory bounded in long-lived edge isolates.
  if (store.size < 5000) return
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(k)
    if (store.size < 3000) break
  }
}

export async function applyApiRateLimit(
  request: NextRequest,
  userId: string | null
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/api/')) return null

  // Try-on studio should allow unlimited generation attempts.
  // Keep the route-level duplicate-job guard, but skip shared API throttling here.
  if (pathname.startsWith('/api/tryon')) return null

  maybeCleanup()

  const ip = getClientIp(request)
  const bucket = pickBucket(pathname)
  const { windowMs, maxIp, maxUser } = getLimits(bucket, request.method)

  const ipKey = `ip:${ip}:${bucket}:${request.method}`
  const ipResult = await consume(ipKey, maxIp, windowMs)

  // If userId exists, enforce a separate user-based limit.
  const userKey = userId ? `uid:${userId}:${bucket}:${request.method}` : null
  const userResult = userKey ? await consume(userKey, maxUser, windowMs) : null

  const allowed = ipResult.allowed && (userResult?.allowed ?? true)

  // Extra hourly limits for try-on (protects against steady abuse)
  if (allowed && bucket === 'tryon' && !READ_METHODS.has(request.method)) {
    const hourWindowMs = 60 * 60 * 1000
    const maxPerHourUser = parseInt(process.env.MAX_TRYON_PER_HOUR || '18')
    const maxPerHourIp = parseInt(process.env.MAX_TRYON_PER_HOUR_PER_IP || '24')

    const ipHourKey = `ip:${ip}:${bucket}:hour`
    const ipHourResult = await consume(ipHourKey, maxPerHourIp, hourWindowMs)
    const userHourKey = userId ? `uid:${userId}:${bucket}:hour` : null
    const userHourResult = userHourKey ? await consume(userHourKey, maxPerHourUser, hourWindowMs) : null

    if (!ipHourResult.allowed || !(userHourResult?.allowed ?? true)) {
      const resetAt = Math.max(ipHourResult.resetAt, userHourResult?.resetAt ?? 0)
      const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
      const res = NextResponse.json(
        {
          error: 'Rate limit exceeded. Please slow down and try again.',
          retryAfterSeconds,
        },
        { status: 429 }
      )

      res.headers.set('Retry-After', String(retryAfterSeconds))
      res.headers.set('X-RateLimit-Bucket', `${bucket}-hour`)
      res.headers.set('X-RateLimit-Reset', String(resetAt))
      res.headers.set('Cache-Control', 'no-store')
      return res
    }
  }

  if (allowed) return null

  const resetAt = Math.max(ipResult.resetAt, userResult?.resetAt ?? 0)
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))

  const res = NextResponse.json(
    {
      error: 'Rate limit exceeded. Please slow down and try again.',
      retryAfterSeconds,
    },
    { status: 429 }
  )

  res.headers.set('Retry-After', String(retryAfterSeconds))
  res.headers.set('X-RateLimit-Bucket', bucket)
  res.headers.set('X-RateLimit-Reset', String(resetAt))
  res.headers.set('Cache-Control', 'no-store')
  return res
}

