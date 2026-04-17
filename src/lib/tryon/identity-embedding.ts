/**
 * IDENTITY EMBEDDING (Soul ID)
 * 
 * Creates a persistent face "fingerprint" per influencer by analyzing
 * ALL their uploaded face images TOGETHER — not just one.
 * 
 * Inspired by Higgsfield Soul ID:
 * - Multiple angles give more accurate geometry
 * - Cross-referenced features (seen from 2+ angles) are more reliable
 * - Produces a frozen "Identity DNA" prompt used in every generation
 * 
 * This runs ONCE per image set change (not on every generation).
 * Result is stored in influencer_profiles.identity_embedding.
 */

import 'server-only'
import { createServiceClient } from '@/lib/auth'
import { listReferencePhotosForUser } from '@/lib/reference-photos/service'
import type { ReferencePhoto } from '@/lib/reference-photos/types'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { getGeminiKey } from '@/lib/config/api-keys'

const FORENSIC_MODEL = process.env.TRYON_FORENSIC_PROMPT_MODEL?.trim() || 'gpt-4o'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface IdentityEmbedding {
  // ─── Face Geometry (immutable) ─────────────────────────────────────
  faceShape: string          // "oval with soft jaw, moderate width"
  eyeGeometry: string        // "almond, dark brown, 32mm spacing"
  noseProfile: string        // "straight bridge, rounded tip"
  lipContour: string         // "full, defined cupid's bow"
  jawline: string            // "soft round jaw, slight chin point"
  skinTone: string           // "warm medium brown, golden undertone"
  skinTexture: string        // "smooth with light forehead texture"
  distinguishingMarks: string // "mole below left eye" or "none"

  // ─── Variable but Consistent ───────────────────────────────────────
  hairDescription: string    // "long black wavy, center-parted"
  bodyBuild: string          // "medium build, proportionate shoulders"
  eyewear: string            // "rectangular wire-frame glasses" or "none"

  // ─── Identity DNA (frozen prompt paragraph) ────────────────────────
  // Used DIRECTLY in every generation prompt as the IDENTITY section.
  // This is the money line — the single paragraph that anchors the face.
  identityDNA: string

  // ─── Composed Anchors (for prompt sections) ────────────────────────
  faceAnchor: string         // Short face description for prompts
  eyesAnchor: string         // Short eyes description for prompts
  bodyAnchor: string         // Short body description for prompts

  // ─── Source Metadata ───────────────────────────────────────────────
  imageCount: number         // How many images were analyzed
  imageTypes: string[]       // Which image types were used
  extractedAt: string        // ISO timestamp
  modelUsed: string          // GPT-4o version used
  version: number            // Schema version for future upgrades
}

interface IdentitySourceImage {
  type: string
  image_url: string
}

function getReferenceIdentityPriority(photo: ReferencePhoto): number {
  const quality = typeof photo.quality_score === 'number' ? photo.quality_score : 0
  const bodyVisibility = photo.analysis?.bodyVisibility
  const bodyScore =
    bodyVisibility === 'full' ? 0.18 :
      bodyVisibility === 'upper' ? 0.12 :
        bodyVisibility === 'face_only' ? 0.06 : 0

  return quality + bodyScore
}

async function loadPreferredIdentitySourceImages(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  influencerProfileId: string
): Promise<IdentitySourceImage[]> {
  const referencePhotos = await listReferencePhotosForUser(service, userId)
  const approvedReferencePhotos = referencePhotos
    .filter((photo) => photo.is_active && photo.status === 'approved')
    .sort((a, b) => getReferenceIdentityPriority(b) - getReferenceIdentityPriority(a))
    .slice(0, 7)
    .map((photo) => ({
      type: `reference_photo:${photo.source}`,
      image_url: photo.image_url,
    }))

  if (approvedReferencePhotos.length > 0) {
    return approvedReferencePhotos
  }

  const { data: images } = await service
    .from('identity_images')
    .select('image_type, image_url')
    .eq('influencer_profile_id', influencerProfileId)
    .eq('is_active', true)
    .order('image_type')

  return ((images || []) as Array<{ image_type: string; image_url: string }>)
    .map((image) => ({
      type: image.image_type,
      image_url: image.image_url,
    }))
    .slice(0, 7)
}

async function getPreferredIdentitySourceCount(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  influencerProfileId: string
): Promise<number> {
  const referencePhotos = await listReferencePhotosForUser(service, userId)
  const approvedReferenceCount = referencePhotos.filter(
    (photo) => photo.is_active && photo.status === 'approved'
  ).length

  if (approvedReferenceCount > 0) {
    return approvedReferenceCount
  }

  const { count } = await service
    .from('identity_images')
    .select('id', { count: 'exact', head: true })
    .eq('influencer_profile_id', influencerProfileId)
    .eq('is_active', true)

  return count || 0
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract identity embedding from ALL of a user's face images.
 * This is the "Soul ID" — a comprehensive face fingerprint.
 * 
 * Key difference from old character-metadata: analyzes MULTIPLE images
 * together for cross-referenced, more accurate descriptions.
 */
export async function extractIdentityEmbedding(
  userId: string
): Promise<IdentityEmbedding | null> {
  const isDev = process.env.NODE_ENV !== 'production'

  try {
    const service = createServiceClient()

    // Find the influencer profile
    const { data: profile } = await service
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!profile) {
      if (isDev) console.log('🧬 No influencer profile found for identity extraction')
      return null
    }

    // Prefer approved canonical library photos, with legacy identity slots as a bridge fallback.
    const images = await loadPreferredIdentitySourceImages(service, userId, profile.id)

    if (!images || images.length === 0) {
      if (isDev) console.log('🧬 No identity images available')
      return null
    }

    if (isDev) console.log(`🧬 Extracting identity embedding from ${images.length} images...`)

    // Download all images as base64 (in parallel, already capped to 7 inputs).
    const imageDataArray = await Promise.all(
      images.map(async (img) => {
        try {
          const resp = await fetch(img.image_url)
          if (!resp.ok) return null
          const buffer = await resp.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          return {
            type: img.type,
            dataUrl: `data:image/jpeg;base64,${base64}`,
          }
        } catch {
          return null
        }
      })
    )

    const validImages = imageDataArray.filter(Boolean) as { type: string; dataUrl: string }[]
    if (validImages.length === 0) {
      if (isDev) console.log('🧬 Failed to download any identity images')
      return null
    }

    if (isDev) console.log(`🧬 Analyzing ${validImages.length} images...`)

    // Try GPT-4o first, fall back to Gemini on any extraction failure.
    // This path should be resilient: Soul ID is a cacheable enhancement, not a
    // reason to fail the whole try-on pipeline.
    let embedding: IdentityEmbedding | null = null
    try {
      embedding = await analyzeMultipleImages(validImages)
    } catch (err: any) {
      if (isDev) console.warn('🧬 GPT-based Soul ID extraction failed — falling back to Gemini:', err)
      embedding = await analyzeWithGemini(validImages)
    }
    if (!embedding) {
      if (isDev) console.warn('🧬 All Soul ID analyzers failed — using conservative fallback DNA')
      embedding = buildFallbackEmbedding(validImages, 'fallback-conservative')
    }

    // Store in DB
    const { error: updateError } = await service
      .from('influencer_profiles')
      .update({
        identity_embedding: embedding,
        character_metadata: embedding, // Also update old field for backward compat
        character_metadata_updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Failed to store identity embedding:', updateError)
    } else if (isDev) {
      console.log(`🧬 Identity embedding stored (${validImages.length} images, v${embedding.version})`)
    }

    return embedding
  } catch (err) {
    console.error('Identity embedding extraction error:', err)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-IMAGE GPT-4o ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

async function analyzeMultipleImages(
  images: { type: string; dataUrl: string }[]
): Promise<IdentityEmbedding | null> {
  const openai = getGeminiChat()

  // Build content array with ALL images
  const content: any[] = [
    {
      type: 'text',
      text: `You are analyzing ${images.length} photos of the SAME person from different angles.
Your job: Create a PERMANENT identity profile focusing on MACRO identifiers (age bracket, apparent ethnicity/background, hair length/color/style, general vibe).

CRITICAL: DO NOT describe micro-anatomical features like nose bridge, eye spacing, or jaw contour in the identityDNA. When generative models are given a checklist of face parts, they assemble a "Frankenstein" face instead of copying the provided visual references.

The identityDNA MUST be a single, short paragraph that gives the model the "Vibe" and physical anchor, ending with a strict command to copy the reference images.

Example of what we WANT:
"Photograph of a 20-something South Asian woman with long wavy dark brown hair. Preserve the exact facial identity, bone structure, and eye spacing from the provided reference images."

Example of what we DO NOT WANT:
"This person has an oval face with almond eyes, 32mm spacing, a straight nose..."

Return JSON only:
{
  "faceShape": "<short description>",
  "eyeGeometry": "<short description>",
  "noseProfile": "<short description>",
  "lipContour": "<short description>",
  "jawline": "<short description>",
  "skinTone": "<short description>",
  "skinTexture": "<short description>",
  "distinguishingMarks": "<only obvious, unambiguous large scars or dimples — otherwise 'none'>",
  "hairDescription": "<length + color + texture>",
  "bodyBuild": "<overall frame>",
  "eyewear": "<frame description or 'none'>",
  "identityDNA": "<MACRO IDENTIFIERS ONLY + command to use references for geometry>"
}

Rules:
- The identityDNA paragraph MUST NOT contain anatomical measurements or shapes.
- The identityDNA is the most important output — it will be used as the root prompt for this person.`,
    },
  ]

  // Add each image with its type label
  for (let i = 0; i < images.length; i++) {
    content.push(
      {
        type: 'text',
        text: `Photo ${i + 1} (${images[i].type}):`,
      },
      {
        type: 'image_url',
        image_url: {
          url: images[i].dataUrl,
          detail: 'low', // Save tokens — we're analyzing geometry, not pixel details
        },
      }
    )
  }

  const response = await openai.chat.completions.create({
    model: FORENSIC_MODEL,
    messages: [{ role: 'user', content }],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 800,
  })

  const raw = response.choices[0]?.message?.content || '{}'
  const parsed = await parseEmbeddingResponse(raw)

  if (!parsed.identityDNA) {
    console.error('🧬 GPT-4o did not return identityDNA — extraction failed')
    return null
  }

  // Compose prompt anchors
  const faceAnchor = [
    parsed.faceShape || null,
    parsed.jawline || null,
    parsed.skinTone ? `${parsed.skinTone} skin` : null,
    parsed.skinTexture || null,
    parsed.noseProfile || null,
    parsed.lipContour || null,
  ].filter(Boolean).join(', ')

  const eyesAnchor = parsed.eyeGeometry || 'preserve exact eye geometry and color'

  const bodyAnchor = parsed.bodyBuild
    ? `preserve ${parsed.bodyBuild} — do not slim, reshape, or idealize the body`
    : 'preserve original body build, weight, shoulder width, and proportions exactly'

  const embedding: IdentityEmbedding = {
    faceShape: parsed.faceShape || 'unknown',
    eyeGeometry: parsed.eyeGeometry || 'unknown',
    noseProfile: parsed.noseProfile || 'unknown',
    lipContour: parsed.lipContour || 'unknown',
    jawline: parsed.jawline || 'unknown',
    skinTone: parsed.skinTone || 'unknown',
    skinTexture: parsed.skinTexture || 'unknown',
    distinguishingMarks: parsed.distinguishingMarks || 'none',
    hairDescription: parsed.hairDescription || 'unknown',
    bodyBuild: parsed.bodyBuild || 'unknown',
    eyewear: parsed.eyewear || 'none',
    identityDNA: parsed.identityDNA,
    faceAnchor,
    eyesAnchor,
    bodyAnchor,
    imageCount: images.length,
    imageTypes: images.map(i => i.type),
    extractedAt: new Date().toISOString(),
    modelUsed: FORENSIC_MODEL,
    version: 1,
  }

  return embedding
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEMINI FALLBACK ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

async function analyzeWithGemini(
  images: { type: string; dataUrl: string }[]
): Promise<IdentityEmbedding | null> {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey: getGeminiKey() })

  const analysisPrompt = buildAnalysisPrompt(images.length)

  // Build parts: text prompt + all images
  const parts: any[] = [{ text: analysisPrompt }]
  for (let i = 0; i < images.length; i++) {
    const cleanBase64 = images[i].dataUrl.replace(/^data:image\/[a-z]+;base64,/, '')
    parts.push({ text: `Photo ${i + 1} (${images[i].type}):` })
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      },
    })
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config: {
      temperature: 0.1,
      maxOutputTokens: 800,
      responseMimeType: 'application/json',
    },
  })

  const responseText = (response as { text?: string }).text
  const text = typeof responseText === 'string' ? responseText : ''
  let parsed: Record<string, string>
  try {
    parsed = await parseEmbeddingResponse(text)
  } catch {
    console.error('🧬 Gemini did not return valid JSON for Soul ID extraction')
    return null
  }

  if (!parsed.identityDNA) {
    console.error('🧬 Gemini did not return identityDNA')
    return null
  }

  return buildEmbeddingFromParsed(parsed, images, 'gemini-2.5-flash')
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function buildAnalysisPrompt(imageCount: number): string {
  return `You are analyzing ${imageCount} photos of the SAME person from different angles.
Your job: Create a PERMANENT identity profile focusing on MACRO identifiers (age bracket, apparent ethnicity/background, hair length/color/style, general vibe).

CRITICAL: DO NOT describe micro-anatomical features like nose bridge, eye spacing, or jaw contour in the identityDNA. When generative models are given a checklist of face parts, they assemble a "Frankenstein" face instead of copying the provided visual references.

The identityDNA MUST be a single, short paragraph that gives the model the "Vibe" and physical anchor, ending with a strict command to copy the reference images.

Example of what we WANT:
"Photograph of a 20-something South Asian woman with long wavy dark brown hair. Preserve the exact facial identity, bone structure, and eye spacing from the provided reference images."

Example of what we DO NOT WANT:
"This person has an oval face with almond eyes, 32mm spacing, a straight nose..."

Return JSON only:
{
  "faceShape": "<short description>",
  "eyeGeometry": "<short description>",
  "noseProfile": "<short description>",
  "lipContour": "<short description>",
  "jawline": "<short description>",
  "skinTone": "<short description>",
  "skinTexture": "<short description>",
  "distinguishingMarks": "<only obvious, unambiguous large scars or dimples — otherwise 'none'>",
  "hairDescription": "<length + color + texture>",
  "bodyBuild": "<overall frame>",
  "eyewear": "<frame description or 'none'>",
  "identityDNA": "<MACRO IDENTIFIERS ONLY + command to use references for geometry>"
}
Rules:
- The identityDNA paragraph MUST NOT contain anatomical measurements or shapes.
- The identityDNA is the most important output — it will be used as the root prompt for this person.
- Cross-reference across all ${imageCount} images.
- Do NOT mention name, age, ethnicity.`
}

async function parseEmbeddingResponse(raw: string): Promise<Record<string, string>> {
  const { extractJson } = await import('@/lib/tryon/json-repair')

  try {
    return extractJson<Record<string, string>>(raw)
  } catch {
    const loose = extractLooseStringFields(raw, [
      'faceShape',
      'eyeGeometry',
      'noseProfile',
      'lipContour',
      'jawline',
      'skinTone',
      'skinTexture',
      'distinguishingMarks',
      'hairDescription',
      'bodyBuild',
      'eyewear',
      'identityDNA',
    ])
    if (loose.identityDNA) return loose
    throw new Error('Could not recover identityDNA from response')
  }
}

function extractLooseStringFields(raw: string, keys: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  const compact = raw.replace(/\r/g, '')

  for (const key of keys) {
    const patterns = [
      new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"\\w+"\\s*:|\\s*}\\s*$)`, 'i'),
      new RegExp(`"${key}"\\s*:\\s*([^,}\\n]+)`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = compact.match(pattern)
      if (!match) continue
      const value = match[1]
        .replace(/\\"/g, '"')
        .replace(/\s+/g, ' ')
        .trim()
      if (value) {
        result[key] = value
        break
      }
    }
  }

  return result
}

function buildFallbackEmbedding(
  images: { type: string; dataUrl: string }[],
  modelUsed: string
): IdentityEmbedding {
  return buildEmbeddingFromParsed(
    {
      faceShape: 'preserve exact face shape from the reference photos',
      eyeGeometry: 'preserve exact eye geometry and spacing from the reference photos',
      noseProfile: 'preserve exact nose profile from the reference photos',
      lipContour: 'preserve exact lip contour from the reference photos',
      jawline: 'preserve exact jawline from the reference photos',
      skinTone: 'preserve exact skin tone from the reference photos',
      skinTexture: 'preserve exact natural skin texture from the reference photos',
      distinguishingMarks: 'preserve all asymmetry and distinctive features from the reference photos',
      hairDescription: 'preserve the same hairstyle and hair color seen in the reference photos',
      bodyBuild: 'original body proportions',
      eyewear: 'preserve any eyewear from the reference photos',
      identityDNA:
        'Photograph the exact same person from the provided reference photos. Copy the face holistically from the photos and preserve skin tone, hairline, asymmetry, and facial identity exactly as seen in the references.',
    },
    images,
    modelUsed
  )
}

function buildEmbeddingFromParsed(
  parsed: Record<string, string>,
  images: { type: string; dataUrl: string }[],
  modelUsed: string
): IdentityEmbedding {
  const faceAnchor = [
    parsed.faceShape || null,
    parsed.jawline || null,
    parsed.skinTone ? `${parsed.skinTone} skin` : null,
    parsed.skinTexture || null,
    parsed.noseProfile || null,
    parsed.lipContour || null,
    parsed.distinguishingMarks && parsed.distinguishingMarks !== 'none'
      ? parsed.distinguishingMarks : null,
  ].filter(Boolean).join(', ')

  const eyesAnchor = parsed.eyeGeometry || 'preserve exact eye geometry and color'
  const bodyAnchor = parsed.bodyBuild
    ? `preserve ${parsed.bodyBuild} — do not slim, reshape, or idealize the body`
    : 'preserve original body build, weight, shoulder width, and proportions exactly'

  return {
    faceShape: parsed.faceShape || 'unknown',
    eyeGeometry: parsed.eyeGeometry || 'unknown',
    noseProfile: parsed.noseProfile || 'unknown',
    lipContour: parsed.lipContour || 'unknown',
    jawline: parsed.jawline || 'unknown',
    skinTone: parsed.skinTone || 'unknown',
    skinTexture: parsed.skinTexture || 'unknown',
    distinguishingMarks: parsed.distinguishingMarks || 'none',
    hairDescription: parsed.hairDescription || 'unknown',
    bodyBuild: parsed.bodyBuild || 'unknown',
    eyewear: parsed.eyewear || 'none',
    identityDNA: parsed.identityDNA,
    faceAnchor,
    eyesAnchor,
    bodyAnchor,
    imageCount: images.length,
    imageTypes: images.map(i => i.type),
    extractedAt: new Date().toISOString(),
    modelUsed,
    version: 1,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load stored identity embedding for a user.
 * Returns null if no embedding exists yet.
 */
export async function loadIdentityEmbedding(
  userId: string
): Promise<IdentityEmbedding | null> {
  try {
    const service = createServiceClient()

    const { data: profile } = await service
      .from('influencer_profiles')
      .select('identity_embedding')
      .eq('user_id', userId)
      .maybeSingle()

    if (!profile?.identity_embedding) return null

    return profile.identity_embedding as IdentityEmbedding
  } catch (err) {
    console.error('Failed to load identity embedding:', err)
    return null
  }
}

/**
 * Detect stale anatomical-style identityDNA that was extracted with the old prompt.
 * Old DNA contains detailed feature descriptions that cause Frankenstein face assembly.
 * New DNA should be macro-identifiers only (age, ethnicity, hair, vibe + reference command).
 */
function hasStaleAnatomicalDNA(dna: string): boolean {
  if (!dna) return true
  const anatomicalMarkers = [
    'oval face',
    'almond-shaped',
    'almond shaped',
    'cupid\'s bow',
    'medium bridge',
    'rounded tip',
    'slightly visible nostrils',
    'balanced proportions',
    'subtle crease',
    'defined cupid',
    'softly rounded jaw',
    'golden undertone',
    'eye spacing',
    '32mm spacing',
    'straight bridge',
    'full lips with',
    'soft jaw',
    'nose bridge',
    'tip shape',
    'lip contour',
  ]
  const lower = dna.toLowerCase()
  const matchCount = anatomicalMarkers.filter(m => lower.includes(m)).length
  return matchCount >= 2
}

/**
 * Check if identity embedding needs re-extraction.
 * Returns true if no embedding exists, image count has changed,
 * or the identityDNA is in the old anatomical format.
 */
export async function needsReExtraction(
  userId: string
): Promise<boolean> {
  try {
    const service = createServiceClient()

    const { data: profile } = await service
      .from('influencer_profiles')
      .select('id, identity_embedding')
      .eq('user_id', userId)
      .maybeSingle()

    if (!profile) return false
    if (!profile.identity_embedding) return true

    const embedding = profile.identity_embedding as IdentityEmbedding

    // Force re-extraction if DNA uses old anatomical format
    if (hasStaleAnatomicalDNA(embedding.identityDNA)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🧬 Stale anatomical DNA detected — forcing re-extraction')
      }
      return true
    }

    // Check if the preferred source image count has changed.
    const count = await getPreferredIdentitySourceCount(service, userId, profile.id)

    if (count !== null && count !== embedding.imageCount) return true

    return false
  } catch {
    return false
  }
}
