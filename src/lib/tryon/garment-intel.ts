/**
 * GARMENT INTELLIGENCE MODULE
 *
 * Makes ONE Gemini 2.5 Flash call to analyze a product/garment image,
 * returning structured intelligence that drives specialized prompt construction.
 *
 * KEY FIX: When the product photo shows a top being worn WITH visible pants/skirt,
 * the module now detects this and instructs the model to replicate BOTH the garment
 * AND the visible complementary clothing. This solves the "random bottom" problem.
 *
 * Results are cached in-memory to avoid redundant calls.
 * API Budget: 1 call per unique product (cached after first analysis)
 */

import 'server-only'
import { geminiGenerateContent } from '@/lib/gemini/executor'

const isDev = process.env.NODE_ENV !== 'production'

// ── TYPES ────────────────────────────────────────────────────────────────────

export type GarmentType =
  | 'top'        // shirt, blouse, t-shirt, crop top, tank top
  | 'dress'      // any dress (A-line, maxi, mini, bodycon, etc.)
  | 'jumpsuit'   // one-piece covering top + bottom
  | 'suit'       // formal suit / blazer + pants
  | 'skirt'      // standalone skirt
  | 'pants'      // standalone pants/jeans/trousers
  | 'outerwear'  // jacket, coat, cardigan
  | 'saree'      // traditional saree/drape
  | 'lehenga'    // traditional lehenga set
  | 'co_ord_set' // matching top + bottom set
  | 'full_outfit'// any complete outfit covering full body

export type GarmentCoverage = 'upper_only' | 'lower_only' | 'full_body' | 'layered'

export interface GarmentIntelligence {
  garmentType: GarmentType
  coverage: GarmentCoverage
  primaryColor: string
  secondaryColor?: string
  pattern: string
  material: string
  neckline: string
  sleeves: string
  fit: string
  length: string
  keyFeatures: string[]
  /** What bottom wear is visible in the product photo (if any). e.g. "khaki cargo pants", "blue denim jeans" */
  visibleBottomInPhoto: string
  /** What top wear is visible in the product photo when the product is bottoms. e.g. "white t-shirt" */
  visibleTopInPhoto: string
  /** Suggested bottom if nothing visible in photo */
  bottomWearSuggestion: string
  description: string
  promptModifiers: string[]
}

// ── IN-MEMORY CACHE ──────────────────────────────────────────────────────────

const garmentCache = new Map<string, { intel: GarmentIntelligence; timestamp: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

function getCacheKey(imageBase64: string): string {
  const clean = imageBase64.replace(/^data:image\/[a-z+]+;base64,/, '')
  return clean.slice(0, 120)
}

function getCached(key: string): GarmentIntelligence | null {
  const entry = garmentCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    garmentCache.delete(key)
    return null
  }
  return entry.intel
}

function setCache(key: string, intel: GarmentIntelligence): void {
  garmentCache.set(key, { intel, timestamp: Date.now() })
}

// ── DEFAULT FALLBACK ─────────────────────────────────────────────────────────

const FALLBACK_INTEL: GarmentIntelligence = {
  garmentType: 'top',
  coverage: 'upper_only',
  primaryColor: 'neutral',
  pattern: 'solid',
  material: 'cotton',
  neckline: 'round',
  sleeves: 'short',
  fit: 'regular',
  length: 'hip',
  keyFeatures: [],
  visibleBottomInPhoto: '',
  visibleTopInPhoto: '',
  bottomWearSuggestion: 'dark fitted jeans',
  description: 'A casual top',
  promptModifiers: [],
}

// ── COMPACT ANALYSIS PROMPT ──────────────────────────────────────────────────
// CRITICAL: asks about visible bottom/top wear in the product image so we can
// replicate the COMPLETE look shown in the product photo.
const ANALYSIS_PROMPT = `Analyze this clothing product image. The product is the MAIN garment being sold/showcased. Reply with ONLY valid JSON:
{"garmentType":"top|dress|jumpsuit|suit|skirt|pants|outerwear|saree|lehenga|co_ord_set|full_outfit","coverage":"upper_only|lower_only|full_body|layered","primaryColor":"dominant color","secondaryColor":"or null","pattern":"solid|striped|plaid|floral|printed|checkered|abstract|other","material":"cotton|silk|denim|polyester|linen|chiffon|satin|velvet|knit|other","neckline":"round|v-neck|collar|boat|turtleneck|halter|off-shoulder|mandarin|other","sleeves":"sleeveless|cap|short|three-quarter|long|puff|bell|other","fit":"slim|regular|loose|oversized|bodycon|flared","length":"crop|waist|hip|knee|midi|maxi|floor","keyFeatures":["buttons","zip","belt"],"visibleBottomInPhoto":"If a model is wearing this top/outerwear and their BOTTOM WEAR (pants, skirt, jeans, shorts) is visible in the photo, describe it precisely e.g. 'khaki cargo pants' or 'blue denim mini skirt'. Write 'none' if no bottom wear is visible or if the product IS the bottom wear.","visibleTopInPhoto":"If the product is pants/skirt/bottom-wear and the model is wearing a TOP in the photo, describe it e.g. 'white crew-neck t-shirt'. Write 'none' if not applicable.","bottomWearSuggestion":"If no bottom is visible, suggest a complementary bottom. If bottom IS visible, copy it here too. If product covers full body, write 'included'.","description":"1 sentence description of the product garment only","promptModifiers":["instruction 1","instruction 2"]}`

// ── JSON REPAIR ──────────────────────────────────────────────────────────────
function extractJson(text: string): string {
  const trimmed = text.trim()
  try { JSON.parse(trimmed); return trimmed } catch { /* continue */ }

  const start = trimmed.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in response')

  for (let end = trimmed.length; end > start; end--) {
    if (trimmed[end - 1] === '}') {
      try {
        const candidate = trimmed.slice(start, end)
        JSON.parse(candidate)
        return candidate
      } catch { /* try shorter */ }
    }
  }

  throw new Error('Could not extract valid JSON from response')
}

// ── GARMENT ANALYSIS ─────────────────────────────────────────────────────────

export async function analyzeGarment(garmentImageBase64: string): Promise<GarmentIntelligence> {
  const cleanBase64 = garmentImageBase64.replace(/^data:image\/[a-z+]+;base64,/, '')

  const cacheKey = getCacheKey(cleanBase64)
  const cached = getCached(cacheKey)
  if (cached) {
    if (isDev) console.log('🧠 Garment intel: cache hit')
    return cached
  }

  try {
    if (isDev) console.log('🧠 Garment intel: analyzing product image...')

    const response = await geminiGenerateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json',
      },
    })

    let text = ''
    if (response.candidates?.length) {
      for (const part of response.candidates[0].content?.parts || []) {
        if (part.text) text += part.text
      }
    }

    if (!text) throw new Error('Empty response from garment analysis')

    const jsonText = extractJson(text)
    const parsed = JSON.parse(jsonText) as Partial<GarmentIntelligence>

    if (!parsed.garmentType) throw new Error('Missing garmentType in analysis response')

    // Normalize visibleBottomInPhoto / visibleTopInPhoto
    const rawBottom = (parsed.visibleBottomInPhoto ?? '').trim().toLowerCase()
    const rawTop = (parsed.visibleTopInPhoto ?? '').trim().toLowerCase()
    const visibleBottom = (rawBottom && rawBottom !== 'none' && rawBottom !== 'null' && rawBottom !== 'n/a')
      ? parsed.visibleBottomInPhoto!.trim()
      : ''
    const visibleTop = (rawTop && rawTop !== 'none' && rawTop !== 'null' && rawTop !== 'n/a')
      ? parsed.visibleTopInPhoto!.trim()
      : ''

    const intel: GarmentIntelligence = {
      garmentType: parsed.garmentType || 'top',
      coverage: parsed.coverage || 'upper_only',
      primaryColor: parsed.primaryColor || 'neutral',
      secondaryColor: parsed.secondaryColor || undefined,
      pattern: parsed.pattern || 'solid',
      material: parsed.material || 'cotton',
      neckline: parsed.neckline || 'round',
      sleeves: parsed.sleeves || 'short',
      fit: parsed.fit || 'regular',
      length: parsed.length || 'hip',
      keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures : [],
      visibleBottomInPhoto: visibleBottom,
      visibleTopInPhoto: visibleTop,
      bottomWearSuggestion: parsed.bottomWearSuggestion || 'dark fitted jeans',
      description: parsed.description || `A ${parsed.garmentType || 'garment'}`,
      promptModifiers: Array.isArray(parsed.promptModifiers) ? parsed.promptModifiers : [],
    }

    setCache(cacheKey, intel)

    if (isDev) {
      console.log(`🧠 Garment intel: ${intel.garmentType} (${intel.coverage})`)
      console.log(`   ${intel.description}`)
      console.log(`   Color: ${intel.primaryColor} | Pattern: ${intel.pattern} | Material: ${intel.material}`)
      if (intel.visibleBottomInPhoto) console.log(`   👖 Visible bottom in photo: "${intel.visibleBottomInPhoto}"`)
      if (intel.visibleTopInPhoto) console.log(`   👕 Visible top in photo: "${intel.visibleTopInPhoto}"`)
      if (intel.coverage === 'upper_only' && !intel.visibleBottomInPhoto) console.log(`   Bottom suggestion: ${intel.bottomWearSuggestion}`)
      if (intel.promptModifiers.length) console.log(`   Modifiers: ${intel.promptModifiers.join('; ')}`)
    }

    return intel
  } catch (error) {
    console.warn('⚠️ Garment analysis failed, using fallback:', error instanceof Error ? error.message : error)
    return FALLBACK_INTEL
  }
}

// ── SMART PROMPT COMPOSER ────────────────────────────────────────────────────

export function composeSmartPrompt(
  intel: GarmentIntelligence,
  options: { aspectRatio?: string; polishNotes?: string }
): string {
  const { polishNotes } = options

  const polishSection = polishNotes?.trim() ? `\nAdditional styling notes: ${polishNotes.trim()}` : ''

  return `Replace all the clothing on the person in the first image with the clothing shown in the second image.

The clothing to apply: ${intel.description} (${intel.primaryColor}, ${intel.pattern}, ${intel.material})

CRITICAL RULES:
1. REMOVE all of the person's current clothes first, then dress them in the second image's garment.
2. The person's face, hair, body, pose, and background must stay exactly the same — do not change the person at all.
3. The final garment must exactly match the second image — same color, pattern, texture, fit, and details.
4. Output a photorealistic photo, not an AI-looking image.
${polishSection}`
}
