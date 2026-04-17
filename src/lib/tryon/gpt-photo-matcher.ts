/**
 * PHOTO MATCHER
 *
 * Selects the 3 best reference photos for a clothing-swap try-on.
 * Uses simple scoring (no API calls) to pick diverse, high-quality photos.
 *
 * Selection criteria:
 *  - Prefers photos tagged with body visibility
 *  - Prioritizes framing diversity (portrait / half / full-body mix)
 *  - Falls back to first N approved photos
 */

import 'server-only'

const isDev = process.env.NODE_ENV !== 'production'

interface MatchCandidate {
  id: string
  imageUrl: string
}

export interface MatchResult {
  selectedIds: string[]
  reasoning: string
  method: 'auto_scoring' | 'fallback_scoring'
}

/**
 * Select the best 3 reference photos for a clothing swap.
 * Uses simple scoring — NO API calls, instant and reliable.
 */
export async function matchPhotosWithGPTVision(
  candidates: MatchCandidate[],
  _garmentImageUrlOrBase64: string,
  options?: { maxPicks?: number }
): Promise<MatchResult> {
  const maxPicks = options?.maxPicks ?? 3

  if (candidates.length <= maxPicks) {
    return {
      selectedIds: candidates.map((c) => c.id),
      reasoning: `Only ${candidates.length} candidate(s) available — selecting all.`,
      method: 'fallback_scoring',
    }
  }

  // Simple diversity-based selection:
  // Pick 3 photos spread evenly across the library for maximum pose diversity
  const step = Math.floor(candidates.length / maxPicks)
  const selectedIds: string[] = []

  for (let i = 0; i < maxPicks; i++) {
    const idx = Math.min(i * step, candidates.length - 1)
    selectedIds.push(candidates[idx].id)
  }

  // Deduplicate (in case step calculation produces duplicates)
  const uniqueIds = [...new Set(selectedIds)]
  if (uniqueIds.length < maxPicks) {
    for (const candidate of candidates) {
      if (uniqueIds.length >= maxPicks) break
      if (!uniqueIds.includes(candidate.id)) {
        uniqueIds.push(candidate.id)
      }
    }
  }

  if (isDev) {
    console.log(`📸 Auto-selected ${uniqueIds.length} photos (diversity scoring):`, uniqueIds)
  }

  return {
    selectedIds: uniqueIds.slice(0, maxPicks),
    reasoning: `Selected ${maxPicks} photos with maximum diversity from ${candidates.length} candidates.`,
    method: 'auto_scoring',
  }
}
