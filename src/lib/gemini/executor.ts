import 'server-only'
import Bottleneck from 'bottleneck'
import { GoogleGenAI, type GenerateContentParameters } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'

const GEMINI_MAX_RETRIES = 3
const BASE_BACKOFF_MS = 1500
const BASE_BACKOFF_IMAGE_MS = 3000
const RETRYABLE_STATUS_CODES = new Set([429, 503, 529])
const SINGLE_KEY_429_WAIT_MS = 8_000 // Wait 8s on single-key 429 before retrying

// Rate limit cooldown per key (ms) — if a key hits 429, skip it for this duration
const KEY_COOLDOWN_MS = 60_000

const proImageLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 5000, // Pro image model has strict RPM limits (~2 RPM free tier)
})

const flashLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 500,
})

// ═══════════════════════════════════════════════════════════════════════════════
// API KEY POOL — Supports multiple Gemini keys for production scale
// ═══════════════════════════════════════════════════════════════════════════════

interface KeySlot {
  key: string
  client: GoogleGenAI
  /** Timestamp when this key can be used again (0 = available now) */
  cooldownUntil: number
  /** Number of 429 hits in the current window */
  rateLimitHits: number
}

let keyPool: KeySlot[] | null = null
let roundRobinIndex = 0

/**
 * Initialize the key pool from environment variables.
 * Supports:
 *  - GEMINI_API_KEYS = "key1,key2,key3" (comma-separated, recommended for production)
 *  - GEMINI_API_KEY = "single_key" (backward compatible, fallback)
 */
function initKeyPool(): KeySlot[] {
  if (keyPool) return keyPool

  const multiKeys = process.env.GEMINI_API_KEYS
  let keys: string[] = []

  if (multiKeys) {
    keys = multiKeys
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length >= 10)
  }

  // Fallback to single key
  if (keys.length === 0) {
    keys = [getGeminiKey()]
  }

  keyPool = keys.map(key => ({
    key,
    client: new GoogleGenAI({ apiKey: key }),
    cooldownUntil: 0,
    rateLimitHits: 0,
  }))

  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    console.log(`🔑 Gemini API key pool initialized: ${keyPool.length} key(s)`)
  }

  return keyPool
}

/**
 * Get the next available client using round-robin with cooldown awareness.
 * If a key is in cooldown (hit 429 recently), skip it.
 * If ALL keys are in cooldown, use the one with the shortest remaining cooldown.
 */
function getNextClient(): GoogleGenAI {
  const pool = initKeyPool()

  if (pool.length === 1) {
    return pool[0].client
  }

  const now = Date.now()

  // Try round-robin: find next available key
  for (let i = 0; i < pool.length; i++) {
    const idx = (roundRobinIndex + i) % pool.length
    const slot = pool[idx]

    if (now >= slot.cooldownUntil) {
      roundRobinIndex = (idx + 1) % pool.length
      return slot.client
    }
  }

  // All keys are in cooldown — pick the one that will recover soonest
  let bestIdx = 0
  let bestCooldown = Infinity
  for (let i = 0; i < pool.length; i++) {
    if (pool[i].cooldownUntil < bestCooldown) {
      bestCooldown = pool[i].cooldownUntil
      bestIdx = i
    }
  }

  roundRobinIndex = (bestIdx + 1) % pool.length
  return pool[bestIdx].client
}

/**
 * Mark a key as rate-limited (429 hit).
 * Sets a cooldown so this key is skipped for a while.
 */
function markKeyRateLimited(client: GoogleGenAI, retryAfterMs?: number): void {
  const pool = initKeyPool()
  const slot = pool.find(s => s.client === client)
  if (!slot) return

  const cooldown = retryAfterMs || KEY_COOLDOWN_MS
  slot.cooldownUntil = Date.now() + cooldown
  slot.rateLimitHits++

  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    const keyPreview = slot.key.slice(0, 6) + '...'
    console.log(`🔑 Key ${keyPreview} hit 429 → cooldown ${(cooldown / 1000).toFixed(0)}s (hit #${slot.rateLimitHits})`)
  }
}

function pickLimiter(model: string): Bottleneck {
  if (model.includes('gemini-3-pro-image-preview')) return proImageLimiter
  if (model.includes('gemini-2.5-flash-image') || model.includes('flash')) return flashLimiter
  return flashLimiter
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomJitterMs(maxJitter = 150): number {
  return Math.floor(Math.random() * maxJitter)
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const candidate = error as {
    status?: number
    code?: number
    response?: { status?: number }
  }

  return candidate.status ?? candidate.response?.status ?? candidate.code
}

function parseRetryAfterMs(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined

  const candidate = error as {
    response?: {
      headers?: {
        get?: (name: string) => string | null
      }
    }
  }

  const retryAfterHeader = candidate.response?.headers?.get?.('retry-after')
  if (!retryAfterHeader) return undefined

  const seconds = Number(retryAfterHeader)
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined
  return Math.ceil(seconds * 1000)
}

export class GeminiRateLimitError extends Error {
  public readonly status = 429
  public readonly retryAfterMs: number

  constructor(message: string, retryAfterMs: number) {
    super(message)
    this.name = 'GeminiRateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

async function generateWithBackoff(params: GenerateContentParameters) {
  const pool = initKeyPool()
  const hasMultipleKeys = pool.length > 1
  const isImageModel = params.model.includes('image') || params.model.includes('pro-image')
  const baseBackoff = isImageModel ? BASE_BACKOFF_IMAGE_MS : BASE_BACKOFF_MS
  let attempt = 0
  let lastError: unknown = null

  while (attempt < GEMINI_MAX_RETRIES) {
    // Pick client (round-robin with cooldown awareness)
    const client = getNextClient()

    try {
      return await client.models.generateContent(params)
    } catch (error) {
      lastError = error
      const status = getStatusCode(error)

      // On 429, mark this key as rate-limited and try the next key
      if (status === 429 && hasMultipleKeys) {
        const retryMs = parseRetryAfterMs(error)
        markKeyRateLimited(client, retryMs)

        // If we still have keys available, try immediately with a different key
        const now = Date.now()
        const availableKeys = pool.filter(s => now >= s.cooldownUntil)
        if (availableKeys.length > 0) {
          attempt++ // Count as an attempt but try next key without backoff
          continue
        }
      }

      // On 429 with SINGLE key: wait a mandatory cooldown before retrying
      // This is critical for image generation models which have strict RPM limits
      if (status === 429 && !hasMultipleKeys) {
        const serverRetryMs = parseRetryAfterMs(error)
        const singleKeyWait = serverRetryMs ?? SINGLE_KEY_429_WAIT_MS
        const isDev = process.env.NODE_ENV !== 'production'
        if (isDev) {
          console.log(`⏳ Single-key 429: waiting ${(singleKeyWait / 1000).toFixed(1)}s before retry (attempt ${attempt + 1}/${GEMINI_MAX_RETRIES})`)
        }
        attempt += 1
        if (attempt >= GEMINI_MAX_RETRIES) {
          throw new GeminiRateLimitError(
            `Gemini rate limit persisted after ${GEMINI_MAX_RETRIES} attempts`,
            singleKeyWait
          )
        }
        await sleep(singleKeyWait)
        continue
      }

      if (!RETRYABLE_STATUS_CODES.has(status as number)) throw error

      const backoffMs =
        parseRetryAfterMs(error) ??
        baseBackoff * Math.pow(2, attempt) + randomJitterMs()

      attempt += 1
      if (attempt >= GEMINI_MAX_RETRIES) {
        if (status === 429) {
          throw new GeminiRateLimitError(
            `Gemini rate limit persisted after ${GEMINI_MAX_RETRIES} attempts${hasMultipleKeys ? ` (all ${pool.length} keys exhausted)` : ''}`,
            backoffMs
          )
        }
        throw lastError instanceof Error ? lastError : new Error(`Gemini ${status} persisted after ${GEMINI_MAX_RETRIES} attempts`)
      }

      await sleep(backoffMs)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini generateContent failed')
}

export async function geminiGenerateContent(
  params: GenerateContentParameters
) {
  const limiter = pickLimiter(params.model)
  return limiter.schedule(() => generateWithBackoff(params))
}

async function embedWithBackoff(params: any) {
  const pool = initKeyPool()
  const hasMultipleKeys = pool.length > 1
  let attempt = 0
  let lastError: unknown = null

  while (attempt < GEMINI_MAX_RETRIES) {
    const client = getNextClient()
    try {
      if (Array.isArray(params.contents)) {
        // Batch not natively supported in this SDK version, loop over single
        return await Promise.all(params.contents.map((c: string) => 
          client.models.embedContent({ model: params.model, contents: c })
        ))
      } else {
        return await client.models.embedContent(params)
      }
    } catch (error) {
      lastError = error
      const status = getStatusCode(error)

      if (status === 429 && hasMultipleKeys) {
        const retryMs = parseRetryAfterMs(error)
        markKeyRateLimited(client, retryMs)
        const now = Date.now()
        if (pool.filter(s => now >= s.cooldownUntil).length > 0) {
          attempt++
          continue
        }
      }

      if (!RETRYABLE_STATUS_CODES.has(status as number)) throw error
      const backoffMs = parseRetryAfterMs(error) ?? BASE_BACKOFF_MS * Math.pow(2, attempt) + randomJitterMs()
      attempt += 1
      if (attempt >= GEMINI_MAX_RETRIES) throw lastError
      await sleep(backoffMs)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Gemini embedContent failed')
}

export async function geminiEmbedContent(params: any) {
  // Use flash limiter for embeddings since it's fast
  return flashLimiter.schedule(() => embedWithBackoff(params))
}

/**
 * Get the current key pool stats (for debugging/monitoring).
 */
export function getKeyPoolStats(): { totalKeys: number; availableKeys: number; cooldownKeys: number } {
  const pool = initKeyPool()
  const now = Date.now()
  const available = pool.filter(s => now >= s.cooldownUntil).length
  return {
    totalKeys: pool.length,
    availableKeys: available,
    cooldownKeys: pool.length - available,
  }
}
