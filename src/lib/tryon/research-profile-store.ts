import 'server-only'
import { createServiceClient } from '@/lib/auth'
import { getAllPresetIds, getPresetById } from './presets/index'

export type ResearchMode = 'off' | 'low' | 'balanced' | 'deep'

export interface PresetResearchProfile {
  mode: ResearchMode
  timeoutMs: number
  maxSnippets: number
  maxContextChars: number
  focusTerms: string[]
}

export interface PresetResearchProfileOverride {
  mode?: ResearchMode
  timeoutMs?: number
  maxSnippets?: number
  maxContextChars?: number
  focusTerms?: string[]
  enabled?: boolean
}

const OVERRIDE_CACHE_TTL_MS = 5 * 60 * 1000
let overrideCache: { expiresAt: number; map: Record<string, PresetResearchProfileOverride> } | null = null
const userOverrideCache = new Map<string, { expiresAt: number; map: Record<string, PresetResearchProfileOverride> }>()

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function sanitizeFocusTerms(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((term) => (typeof term === 'string' ? term.trim() : ''))
    .filter(Boolean)
    .slice(0, 10)
}

function normalizeOverride(input: PresetResearchProfileOverride): PresetResearchProfileOverride {
  return {
    mode: input.mode,
    timeoutMs:
      typeof input.timeoutMs === 'number'
        ? clampInt(input.timeoutMs, 600, 8000)
        : undefined,
    maxSnippets:
      typeof input.maxSnippets === 'number'
        ? clampInt(input.maxSnippets, 1, 8)
        : undefined,
    maxContextChars:
      typeof input.maxContextChars === 'number'
        ? clampInt(input.maxContextChars, 180, 2000)
        : undefined,
    focusTerms: sanitizeFocusTerms(input.focusTerms),
    enabled: input.enabled,
  }
}

function mergeProfile(
  base: PresetResearchProfile,
  override?: PresetResearchProfileOverride
): PresetResearchProfile {
  if (!override) return base
  const normalized = normalizeOverride(override)
  return {
    mode: normalized.mode || base.mode,
    timeoutMs: normalized.timeoutMs ?? base.timeoutMs,
    maxSnippets: normalized.maxSnippets ?? base.maxSnippets,
    maxContextChars: normalized.maxContextChars ?? base.maxContextChars,
    focusTerms: normalized.focusTerms && normalized.focusTerms.length
      ? normalized.focusTerms
      : base.focusTerms,
  }
}

function buildHeuristicProfile(presetId?: string): PresetResearchProfile {
  const preset = getPresetById((presetId || '').trim())
  const id = (preset?.id || presetId || '').toLowerCase()
  const category = (preset?.category || '').toLowerCase()
  const scene = (preset?.scene || '').toLowerCase()
  const lighting = (preset?.lighting || '').toLowerCase()

  const isStudio = id.startsWith('studio_') || category === 'editorial'
  const isNight = id.includes('night') || lighting.includes('night') || scene.includes('night')
  const isStreet = id.startsWith('street_') || category === 'street'
  const isTravelOutdoor = category === 'travel' || category === 'outdoor'

  if (isStudio) {
    return {
      mode: 'low',
      timeoutMs: 1200,
      maxSnippets: 2,
      maxContextChars: 420,
      focusTerms: ['studio portrait lighting', 'skin texture realism', 'camera color science'],
    }
  }

  if (isNight || isStreet) {
    return {
      mode: 'deep',
      timeoutMs: 2600,
      maxSnippets: 5,
      maxContextChars: 1100,
      focusTerms: ['night street photography', 'mixed light color temperature', 'ambient practical lighting'],
    }
  }

  if (isTravelOutdoor) {
    return {
      mode: 'balanced',
      timeoutMs: 2000,
      maxSnippets: 4,
      maxContextChars: 850,
      focusTerms: ['golden hour portrait', 'outdoor light falloff', 'natural skin tone rendering'],
    }
  }

  return {
    mode: 'balanced',
    timeoutMs: 1800,
    maxSnippets: 3,
    maxContextChars: 760,
    focusTerms: ['fashion photography lighting realism', 'camera depth and grain'],
  }
}

export const BUILTIN_PRESET_RESEARCH_OVERRIDES: Record<string, PresetResearchProfileOverride> = {
  urban_gas_station_night: {
    mode: 'deep',
    timeoutMs: 3200,
    maxSnippets: 6,
    maxContextChars: 1200,
    focusTerms: [
      'night gas station portrait lighting',
      'sodium vapor and LED mixed lighting',
      'automotive reflective surfaces portrait',
    ],
  },
  street_mcdonalds_bmw_night: {
    mode: 'deep',
    timeoutMs: 3200,
    maxSnippets: 6,
    maxContextChars: 1200,
    focusTerms: [
      'night street mixed practical lights',
      'fast food signage color cast',
      'car body reflection portrait realism',
    ],
  },
  studio_crimson_noir: {
    mode: 'balanced',
    timeoutMs: 2200,
    maxSnippets: 4,
    maxContextChars: 760,
    focusTerms: [
      'low key portrait lighting',
      'red gel lighting skin tone control',
      'studio noir light ratios',
    ],
  },
  golden_hour_bedroom: {
    mode: 'balanced',
    timeoutMs: 2200,
    maxSnippets: 4,
    maxContextChars: 760,
    focusTerms: [
      'golden hour window light portrait',
      'window blind shadow portrait',
      'indoor warm daylight color temperature',
    ],
  },
  street_subway_fisheye: {
    mode: 'deep',
    timeoutMs: 3000,
    maxSnippets: 5,
    maxContextChars: 1000,
    focusTerms: [
      'fisheye portrait distortion control',
      'subway practical lighting portrait',
      'wide lens perspective realism',
    ],
  },
  travel_scene_lock_realism: {
    mode: 'balanced',
    timeoutMs: 2200,
    maxSnippets: 4,
    maxContextChars: 880,
    focusTerms: [
      'travel portrait candid realism',
      'natural destination ambient lighting',
      'smartphone travel photo rendering',
    ],
  },
  editorial_night_garden_flash: {
    mode: 'deep',
    timeoutMs: 3000,
    maxSnippets: 5,
    maxContextChars: 980,
    focusTerms: [
      'night garden flash portrait',
      'on-camera flash ambient balance',
      'flash falloff and background exposure',
    ],
  },
  street_elevator_mirror_chic: {
    mode: 'deep',
    timeoutMs: 2800,
    maxSnippets: 5,
    maxContextChars: 980,
    focusTerms: [
      'mirror portrait reflection control',
      'elevator practical lighting portrait',
      'specular highlight management portrait',
    ],
  },
  studio_window_blind_portrait: {
    mode: 'balanced',
    timeoutMs: 2200,
    maxSnippets: 4,
    maxContextChars: 760,
    focusTerms: [
      'window blind shadow portrait lighting',
      'high contrast portrait edge transitions',
      'face-safe shadow pattern portrait',
    ],
  },
  editorial_newspaper_set: {
    mode: 'balanced',
    timeoutMs: 2200,
    maxSnippets: 4,
    maxContextChars: 760,
    focusTerms: [
      'editorial paper texture photography',
      'set design texture realism',
      'print material lighting behavior',
    ],
  },
  outdoor_kerala_theyyam_gtr: {
    mode: 'deep',
    timeoutMs: 3000,
    maxSnippets: 5,
    maxContextChars: 980,
    focusTerms: [
      'festival outdoor portrait lighting',
      'vibrant costume color management',
      'night event ambient and practical light',
    ],
  },
}

export async function getDynamicResearchOverrides(): Promise<Record<string, PresetResearchProfileOverride>> {
  if (overrideCache && overrideCache.expiresAt > Date.now()) {
    return overrideCache.map
  }

  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('tryon_research_profiles')
      .select('preset_id, mode, timeout_ms, max_snippets, max_context_chars, focus_terms, enabled')
      .eq('enabled', true)

    if (error) {
      // Fail open when table is missing or unavailable.
      return {}
    }

    const map: Record<string, PresetResearchProfileOverride> = {}
    for (const row of data || []) {
      const presetId = typeof row.preset_id === 'string' ? row.preset_id.trim().toLowerCase() : ''
      if (!presetId) continue
      map[presetId] = normalizeOverride({
        mode: row.mode as ResearchMode,
        timeoutMs: row.timeout_ms as number,
        maxSnippets: row.max_snippets as number,
        maxContextChars: row.max_context_chars as number,
        focusTerms: row.focus_terms as string[],
        enabled: row.enabled as boolean,
      })
    }
    overrideCache = { map, expiresAt: Date.now() + OVERRIDE_CACHE_TTL_MS }
    return map
  } catch {
    return {}
  }
}

export function clearResearchOverrideCache(): void {
  overrideCache = null
  userOverrideCache.clear()
}

export async function getUserResearchOverrides(userId: string): Promise<Record<string, PresetResearchProfileOverride>> {
  const normalizedUserId = (userId || '').trim()
  if (!normalizedUserId) return {}

  const cached = userOverrideCache.get(normalizedUserId)
  if (cached && cached.expiresAt > Date.now()) return cached.map

  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('tryon_user_research_profiles')
      .select('preset_id, mode, timeout_ms, max_snippets, max_context_chars, focus_terms, enabled')
      .eq('user_id', normalizedUserId)
      .eq('enabled', true)

    if (error) return {}

    const map: Record<string, PresetResearchProfileOverride> = {}
    for (const row of data || []) {
      const presetId = typeof row.preset_id === 'string' ? row.preset_id.trim().toLowerCase() : ''
      if (!presetId) continue
      map[presetId] = normalizeOverride({
        mode: row.mode as ResearchMode,
        timeoutMs: row.timeout_ms as number,
        maxSnippets: row.max_snippets as number,
        maxContextChars: row.max_context_chars as number,
        focusTerms: row.focus_terms as string[],
        enabled: row.enabled as boolean,
      })
    }
    userOverrideCache.set(normalizedUserId, {
      map,
      expiresAt: Date.now() + OVERRIDE_CACHE_TTL_MS,
    })
    return map
  } catch {
    return {}
  }
}

export async function resolveResearchProfile(params: { presetId?: string; userId?: string }): Promise<PresetResearchProfile> {
  const presetId = params.presetId
  const normalizedId = (presetId || '').trim().toLowerCase()
  const base = buildHeuristicProfile(normalizedId)
  const builtin = BUILTIN_PRESET_RESEARCH_OVERRIDES[normalizedId]
  const dynamic = (await getDynamicResearchOverrides())[normalizedId]
  const userOverride = params.userId
    ? (await getUserResearchOverrides(params.userId))[normalizedId]
    : undefined
  return mergeProfile(mergeProfile(mergeProfile(base, builtin), dynamic), userOverride)
}

export async function listEffectiveResearchProfiles(): Promise<Record<string, PresetResearchProfile>> {
  const ids = getAllPresetIds()
  const output: Record<string, PresetResearchProfile> = {}
  for (const id of ids) {
    output[id] = await resolveResearchProfile({ presetId: id })
  }
  return output
}
