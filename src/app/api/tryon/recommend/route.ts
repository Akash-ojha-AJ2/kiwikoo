/**
 * GARMENT-AWARE PHOTO RECOMMENDER API
 *
 * Scores each approved reference photo against the current garment and returns
 * the 3 most suitable AND diverse photos for try-on.
 *
 * Key fixes:
 * - Correct DB field values: bodyVisibility = "upper"|"full"|"half"|"face"
 * - Correct DB field values: framing = "half"|"full"|"close_up"|"portrait"
 * - Diversity selection: even when scores are equal, select photos by
 *   pose/framing variety so all 3 slots look different
 *
 * API Budget: 1 Gemini call (garment analysis, cached) + 0 for scoring
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/auth'
import { getReferencePhotoLibrary } from '@/lib/reference-photos/service'
import { analyzeGarment, type GarmentIntelligence } from '@/lib/tryon/garment-intel'

const isDev = process.env.NODE_ENV !== 'production'

interface RankedPhoto {
  id: string
  score: number
  reasoning: string
  suitability: 'excellent' | 'good' | 'fair' | 'poor'
  // Internal diversity fingerprint
  _diversity?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const garmentImageUrl = body.garmentImageUrl as string | undefined
    const garmentBase64 = body.garmentBase64 as string | undefined

    if (!garmentImageUrl && !garmentBase64) {
      return NextResponse.json({ error: 'garmentImageUrl or garmentBase64 required' }, { status: 400 })
    }

    // ── STEP 1: Get garment base64 ──────────────────────────────────────
    let normalizedGarment: string
    if (garmentBase64) {
      normalizedGarment = garmentBase64.replace(/^data:image\/[a-z+]+;base64,/, '')
    } else {
      const res = await fetch(garmentImageUrl!, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return NextResponse.json({ error: 'Failed to fetch garment image' }, { status: 400 })
      const buf = await res.arrayBuffer()
      normalizedGarment = Buffer.from(buf).toString('base64')
    }

    // ── STEP 2: Analyze garment (cached) ────────────────────────────────
    const garmentIntel = await analyzeGarment(normalizedGarment)
    if (isDev) console.log(`🧠 Recommend: garment is ${garmentIntel.garmentType} (${garmentIntel.coverage})`)

    // ── STEP 3: Get user's approved photos ──────────────────────────────
    const libraryResult = await getReferencePhotoLibrary(supabase as any, user.id)
    const allPhotos: any[] = Array.isArray(libraryResult)
      ? (libraryResult as any[])
      : Array.isArray((libraryResult as any)?.photos)
        ? (libraryResult as any).photos
        : []

    const approvedPhotos = allPhotos.filter(
      (p: any) => p.status === 'approved' && p.is_active !== false
    )

    if (!approvedPhotos.length) {
      return NextResponse.json({
        recommendations: [], garmentIntel: { type: garmentIntel.garmentType, coverage: garmentIntel.coverage }, top3: [],
        reasoning: 'No approved photos available.',
      })
    }

    // ── STEP 4: Score photos ─────────────────────────────────────────────
    const ranked = scorePhotosForGarment(approvedPhotos, garmentIntel)

    // ── STEP 5: Diversity-aware selection of top 3 ──────────────────────
    const top3 = selectDiverseTop3(ranked)

    if (isDev) {
      console.log(`📊 Ranked ${ranked.length} photos for ${garmentIntel.garmentType}:`)
      ranked.slice(0, 6).forEach((rp, i) =>
        console.log(`   ${i + 1}. ${rp.id.slice(0, 8)} → ${rp.score}/100 (${rp.suitability}) | ${rp._diversity} | ${rp.reasoning}`)
      )
      console.log(`✅ Top 3 selected: ${top3.map(id => id.slice(0, 8)).join(', ')}`)
    }

    return NextResponse.json({
      recommendations: ranked.map(({ _diversity: _d, ...r }) => r), // strip internal field
      garmentIntel: {
        type: garmentIntel.garmentType,
        coverage: garmentIntel.coverage,
        description: garmentIntel.description,
        primaryColor: garmentIntel.primaryColor,
        visibleBottomInPhoto: garmentIntel.visibleBottomInPhoto || '',
        visibleTopInPhoto: garmentIntel.visibleTopInPhoto || '',
        bottomWearSuggestion: garmentIntel.bottomWearSuggestion,
      },
      top3,
    })
  } catch (error) {
    console.error('[recommend] error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

// ── SCORING ───────────────────────────────────────────────────────────────────

function scorePhotosForGarment(photos: any[], garmentIntel: GarmentIntelligence): RankedPhoto[] {
  return photos.map((photo) => scoreOnePhoto(photo, garmentIntel)).sort((a, b) => b.score - a.score)
}

function scoreOnePhoto(photo: any, garmentIntel: GarmentIntelligence): RankedPhoto {
  let score = 50
  const reasons: string[] = []

  const qualityScore = Number(photo.quality_score ?? photo.qualityScore ?? 0)
  const analysis = (typeof photo.analysis === 'object' && photo.analysis !== null) ? photo.analysis : {}

  // DB stores: "upper" | "full" | "half" | "face" | "close_up" (NOT "upper_body")
  const bodyVis = String(analysis?.bodyVisibility ?? analysis?.body_visibility ?? 'unknown').toLowerCase()
  // DB stores: "half" | "full" | "portrait" | "close_up" (NOT "full_length")
  const framing = String(analysis?.framing ?? 'unknown').toLowerCase()
  const source = String(photo.source ?? 'app_upload')
  const swapSuitability = Number(analysis?.garmentSwapSuitability ?? 0)

  // ── Quality + swap suitability ──
  if (qualityScore > 0.8) { score += 12; reasons.push('High quality') }
  else if (qualityScore > 0.6) { score += 6 }
  else if (qualityScore < 0.4) { score -= 8; reasons.push('Low quality') }

  if (swapSuitability > 0.8) { score += 8; reasons.push('High swap suitability') }
  else if (swapSuitability > 0.6) { score += 4 }

  // ── Source preference ──
  if (source === 'app_upload') { score += 5 }
  else if (source === 'migrated_identity') { score -= 8; reasons.push('Legacy migrated') }

  // ── GARMENT-SPECIFIC BODY VISIBILITY SCORING ──
  // Note: DB values are "upper", "full", "half", "face" — not "upper_body" etc.
  const coverage = garmentIntel.coverage

  switch (coverage) {
    case 'upper_only': {
      // Tops/shirts/jackets — need upper or full body
      if (bodyVis === 'full') { score += 18; reasons.push('Full body — great for top + bottom pairing') }
      else if (bodyVis === 'upper') { score += 22; reasons.push('Upper body — ideal for top swap') }
      else if (bodyVis === 'half') { score += 14; reasons.push('Half body — upper half visible') }
      else if (bodyVis === 'face' || bodyVis === 'close_up') { score -= 20; reasons.push('Face only — body not visible') }

      if (framing === 'full') { score += 8; reasons.push('Full frame') }
      else if (framing === 'half') { score += 5 }
      break
    }

    case 'full_body': {
      // Dresses, jumpsuits — MUST see full body
      if (bodyVis === 'full') { score += 30; reasons.push('Full body — perfect for full outfit') }
      else if (bodyVis === 'half') { score += 2; reasons.push('Half body — outfit partially visible') }
      else if (bodyVis === 'upper') { score -= 15; reasons.push('Upper only — full outfit cut off') }
      else if (bodyVis === 'face' || bodyVis === 'close_up') { score -= 30; reasons.push('Face only — cannot show full outfit') }

      if (framing === 'full') { score += 12; reasons.push('Full-length frame') }
      break
    }

    case 'lower_only': {
      // Skirts/pants — need to see lower body
      if (bodyVis === 'full') { score += 22; reasons.push('Full body — lower body visible') }
      else if (bodyVis === 'half') { score += 10 }
      else if (bodyVis === 'upper' || bodyVis === 'face') { score -= 25; reasons.push('Lower body not visible') }
      break
    }

    case 'layered': {
      // Outerwear/jackets — upper or full body
      if (bodyVis === 'full' || bodyVis === 'upper') { score += 18; reasons.push('Body visible for layering') }
      else if (bodyVis === 'half') { score += 10 }
      else if (bodyVis === 'face') { score -= 10 }
      break
    }
  }

  score = Math.max(0, Math.min(100, score))

  const suitability: 'excellent' | 'good' | 'fair' | 'poor' =
    score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'

  if (!reasons.length) reasons.push('Standard candidate')

  // Diversity fingerprint: distinguish photos by their body visibility + framing
  const diversity = `${bodyVis}:${framing}`

  return { id: photo.id, score, reasoning: reasons.join('. '), suitability, _diversity: diversity }
}

// ── DIVERSITY SELECTION ───────────────────────────────────────────────────────

/**
 * Select 3 photos that are:
 * 1. Highest scoring (primary criterion)
 * 2. Diverse in pose/framing (avoid picking 3 identical-looking photos)
 *
 * Strategy: greedy selection. Pick the best-scored photo, then prefer photos
 * with different diversity fingerprints for the remaining 2 slots.
 */
function selectDiverseTop3(ranked: RankedPhoto[]): string[] {
  if (ranked.length <= 3) return ranked.map((r) => r.id)

  const candidatePool = ranked.slice(0, Math.min(8, ranked.length))
  const selected: RankedPhoto[] = []
  const usedDiversity = new Set<string>()

  // Pass 1: pick best-scored photo with unique diversity fingerprints
  for (const photo of shuffleRankedPhotos(candidatePool)) {
    if (selected.length >= 3) break
    if (!usedDiversity.has(photo._diversity ?? '')) {
      selected.push(photo)
      usedDiversity.add(photo._diversity ?? '')
    }
  }

  // Pass 2: fill remaining slots with next best (even if diversity overlaps)
  if (selected.length < 3) {
    const selectedIds = new Set(selected.map((p) => p.id))
    for (const photo of shuffleRankedPhotos(candidatePool)) {
      if (selected.length >= 3) break
      if (!selectedIds.has(photo.id)) {
        selected.push(photo)
        selectedIds.add(photo.id)
      }
    }
  }

  return selected.map((p) => p.id)
}

function shuffleRankedPhotos(ranked: RankedPhoto[]): RankedPhoto[] {
  // Strong randomization: 25-point noise ensures real variety across calls
  // Without this, scores clustered at 80-95 always produce the same top-3
  const decorated = ranked.map((photo) => ({
    photo,
    weightedScore: photo.score + Math.random() * 25,
  }))

  decorated.sort((left, right) => right.weightedScore - left.weightedScore)
  return decorated.map((entry) => entry.photo)
}
