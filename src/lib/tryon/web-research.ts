import 'server-only'
import { resolveResearchProfile, type PresetResearchProfile } from './research-profile-store'

interface WebResearchInput {
  userRequest?: string
  presetId?: string
  garmentDescription?: string
  userId?: string
}

export interface WebResearchResult {
  context: string
  profile: PresetResearchProfile
  query: string
  cacheHit: boolean
  sourceCount: number
}

const WEB_RESEARCH_CACHE_TTL_MS = 12 * 60 * 1000
const webResearchCache = new Map<string, { value: WebResearchResult; expiresAt: number }>()
const IDENTITY_BLOCKLIST = [
  'replace face',
  'swap face',
  'beautify face',
  'skin whitening',
  'face reshape',
]

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

function compact(text: string, maxLen: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLen) return cleaned
  return `${cleaned.slice(0, maxLen - 3)}...`
}

function pickQueryBudget(mode: PresetResearchProfile['mode']): number {
  if (mode === 'low') return 1
  if (mode === 'deep') return 3
  if (mode === 'off') return 0
  return 2
}

function sanitizeSnippet(text: string): string {
  const singleLine = text.replace(/\s+/g, ' ').trim()
  const lower = singleLine.toLowerCase()
  if (IDENTITY_BLOCKLIST.some(token => lower.includes(token))) return ''
  return singleLine
}

function extractTopicTexts(
  topics: Array<{ Text?: string; Topics?: Array<{ Text?: string }> }> | undefined
): string[] {
  if (!topics?.length) return []
  const out: string[] = []
  for (const topic of topics) {
    if (topic.Text) out.push(topic.Text)
    if (topic.Topics?.length) {
      for (const nested of topic.Topics) {
        if (nested.Text) out.push(nested.Text)
      }
    }
  }
  return out
}

function buildResearchQueries(input: WebResearchInput, profile: PresetResearchProfile): string[] {
  const requested = (input.userRequest || '').trim()
  const garment = (input.garmentDescription || '').trim()
  const preset = (input.presetId || '').trim()
  const modeTag = profile.mode === 'deep' ? 'advanced' : 'practical'
  const focus = profile.focusTerms.join(' ')

  const queries = [
    [requested, preset ? `preset ${preset}` : '', garment ? `outfit ${garment}` : '', focus].filter(Boolean).join(' '),
    [preset ? `scene ${preset}` : '', 'portrait environment realism', focus, modeTag].filter(Boolean).join(' '),
    [requested, 'camera lighting and depth cues', focus].filter(Boolean).join(' '),
  ].filter(Boolean)

  const budget = pickQueryBudget(profile.mode)
  return queries.slice(0, budget)
}

async function fetchQuerySnippets(query: string, profile: PresetResearchProfile): Promise<string[]> {
  if (!query.trim()) return []
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
  const snippets = await withTimeout(
    fetch(url, { method: 'GET', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return [] as string[]
        const data = (await res.json()) as {
          AbstractText?: string
          Heading?: string
          RelatedTopics?: Array<{ Text?: string; Topics?: Array<{ Text?: string }> }>
        }
        const raw: string[] = []
        if (data.Heading && data.AbstractText) {
          raw.push(`${data.Heading}: ${data.AbstractText}`)
        } else if (data.AbstractText) {
          raw.push(data.AbstractText)
        }
        raw.push(...extractTopicTexts(data.RelatedTopics))
        return raw
          .map(sanitizeSnippet)
          .filter(Boolean)
          .slice(0, profile.maxSnippets)
      })
      .catch(() => [] as string[]),
    profile.timeoutMs,
    [] as string[]
  )
  return snippets
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

export async function getWebResearchContext(input: WebResearchInput): Promise<WebResearchResult> {
  const profile = await resolveResearchProfile({
    presetId: input.presetId,
    userId: input.userId,
  })
  if (process.env.TRYON_ENABLE_WEB_RESEARCH === 'false' || profile.mode === 'off') {
    return { context: '', profile, query: '', cacheHit: false, sourceCount: 0 }
  }

  const queries = buildResearchQueries(input, profile)
  const query = queries.join(' || ')
  if (!query) return { context: '', profile, query: '', cacheHit: false, sourceCount: 0 }

  const cacheKey = JSON.stringify({
    mode: profile.mode,
    q: query,
    preset: (input.presetId || '').toLowerCase(),
  })
  const cached = webResearchCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.value, cacheHit: true }
  }

  const snippetsByQuery = await Promise.all(queries.map((q) => fetchQuerySnippets(q, profile)))
  const mergedSnippets = uniqueStrings(snippetsByQuery.flat())
  const selectedSnippets = mergedSnippets.slice(0, profile.maxSnippets)
  const contextBody = compact(selectedSnippets.join(' | '), profile.maxContextChars)
  const context = contextBody
    ? `WEB_RESEARCH_HINTS(${profile.mode.toUpperCase()}): ${contextBody}. Apply these hints to scene/lighting/camera realism only. Never alter face or body identity.`
    : ''

  const result: WebResearchResult = {
    context,
    profile,
    query,
    cacheHit: false,
    sourceCount: selectedSnippets.length,
  }
  webResearchCache.set(cacheKey, {
    value: result,
    expiresAt: Date.now() + WEB_RESEARCH_CACHE_TTL_MS,
  })
  return result
}
