/**
 * AD GENERATION API — Production Grade
 *
 * Generates AI-powered ad creatives using:
 *  - GPT-4o intelligent prompt crafting
 *  - Gemini 3 Pro Image (Nano Banana Pro) for generation
 *  - Forensic face-lock when influencer image is provided
 *  - Returns image inline for immediate display
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { tryAcquireInFlight } from '@/lib/traffic-guard'
import { rateAdCreative, generateAdCopy } from '@/lib/openai'
import OpenAI, { toFile } from 'openai'
import { getOpenAIKey } from '@/lib/config/api-keys'
import { generateIntelligentAdComposition } from '@/lib/gemini'
import { GeminiRateLimitError } from '@/lib/gemini/executor'
import { saveUpload } from '@/lib/storage'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { buildForensicFaceAnchor } from '@/lib/tryon/face-forensics'
import { extractFaceCrop } from '@/lib/tryon/face-crop'
import { detectFaceCoordinates } from '@/lib/tryon/face-coordinates'
import { restoreFaceIdentity } from '@/lib/tryon/face-restore'
import {
  AD_PRESET_IDS,
  AD_PRESETS,
  type AdPreset,
  type AdGenerationInput,
  type AdPresetId,
  type Platform,
  type CtaType,
  type CaptionTone,
  type CharacterType,
  type FontStyle,
  type TextPlacement,
  type AspectRatio,
  validateAdInput,
  resolveStylePackForPreset,
} from '@/lib/ads/ad-styles'
import { buildAdPrompt } from '@/lib/ads/ad-prompt-builder'
import { z } from 'zod'

// Increase serverless timeout for Vercel (ad pipeline: GPT + Gemini + image gen can exceed 60s under load)
export const maxDuration = 180

// Schema for the expanded preset-based generation
const adGenerationSchema = z
  .object({
    preset: z.enum(AD_PRESET_IDS as unknown as [string, ...string[]]),
    campaignId: z.string().max(100).optional(),
    variationIndex: z.number().int().min(0).max(999).optional().default(0),
    stylePack: z.enum(['luxury', 'high_street', 'sports']).optional(),

    // Image inputs
    productImage: z.string().min(1).max(15_000_000).optional(),
    influencerImage: z.string().min(1).max(15_000_000).optional(),
    lockFaceIdentity: z.boolean().optional(), // Auto-derived: true when influencerImage is present
    strictRealism: z.boolean().optional().default(true),

    // Model selection: GPT Image 1.5 or Gemini
    imageModel: z.enum(['gpt', 'gemini']).optional().default('gemini'),

    // Character config
    characterType: z
      .enum(['human_female', 'human_male', 'animal', 'none'])
      .optional()
      .default('none'),
    characterIdentity: z
      .enum([
        'global_modern',
        'indian_woman_modern',
        'indian_man_modern',
        'south_asian_modern',
        'south_east_asian_modern',
        'east_asian_modern',
        'central_asian_modern',
        'middle_eastern_modern',
        'mediterranean_modern',
        'african_modern',
        'latina_modern',
        'latin_american_modern',
        'north_american_modern',
        'european_modern',
        'pacific_islander_modern',
        'mixed_heritage_modern',
      ])
      .optional()
      .default('global_modern'),
    animalType: z.string().trim().max(50).optional(),
    characterStyle: z.string().trim().max(100).optional(),
    characterAge: z.string().trim().max(20).optional(),

    // Aspect ratio
    aspectRatio: z.enum(['1:1', '9:16', '16:9', '4:5']).optional().default('1:1'),

    // Camera angle (down, side, low, high, three-quarter, eye-level, dutch, auto)
    cameraAngle: z
      .enum(['auto', 'eye-level', 'low', 'high', 'down', 'side', 'three-quarter', 'dutch'])
      .optional()
      .default('auto'),

    // Text overlay
    textOverlay: z
      .object({
        headline: z.string().trim().max(100).optional(),
        subline: z.string().trim().max(150).optional(),
        tagline: z.string().trim().max(100).optional(),
        placement: z
          .enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'])
          .optional(),
        fontStyle: z.enum(['serif', 'sans-serif', 'handwritten', 'bold-display']).optional(),
      })
      .optional(),

    // Legacy text controls
    headline: z.string().trim().max(60).optional(),
    ctaType: z
      .enum(['shop_now', 'learn_more', 'explore', 'buy_now'])
      .default('shop_now'),
    captionTone: z.enum(['casual', 'premium', 'confident']).optional(),

    // Platform
    platforms: z
      .array(z.enum(['instagram', 'facebook', 'google', 'influencer']))
      .min(1),

    // Legacy subject overrides
    subject: z
      .object({
        gender: z.enum(['male', 'female', 'unisex']).optional(),
        ageRange: z.string().trim().max(40).optional(),
        pose: z.string().trim().max(120).optional(),
        expression: z.string().trim().max(120).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()

function stripDataUri(value: string): string {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
}

/** Shared quality preamble — composition, text, product, and photographic fidelity rules */
function buildQualityPreamble(hasTextOverlay: boolean): string {
  const textRule = hasTextOverlay
    ? `\nTEXT RENDERING: All text must be crisp, legible, and properly kerned. Use clean sans-serif or serif fonts with high contrast against background. No warped, melted, blurred, or misspelled text. Text should integrate naturally into the composition — printed on signage, embossed on surfaces, or cleanly overlaid with proper drop shadow or contrast panel.`
    : `\nCRITICAL: Do NOT include any text, letters, numbers, words, brand names, slogans, watermarks, or typography in the image. ZERO written content.`
  return `PHOTOGRAPHIC FIDELITY & COMPOSITION (MANDATORY):
OUTPUT STYLE: This MUST look like a REAL PHOTOGRAPH taken by a professional photographer with a REAL CAMERA. NOT an illustration, NOT digital art, NOT a painting, NOT a render, NOT stylized, NOT cartoon, NOT anime, NOT CGI. RAW EDITORIAL PHOTOGRAPHY ONLY.
SKIN: Natural pore-level texture, sharp wet-look corneal reflections, realistic subsurface scattering, visible pores and fine lines. No plastic/waxy/CGI/airbrushed skin. No beauty filter smoothing. Do not invent pimples, moles, freckles, or blemishes that are not clearly present in the reference image.
HANDS: Correct anatomy — five fingers per hand, natural bone structure, realistic nail beds. No extra or fused fingers.
COMPOSITION: Strong focal hierarchy with clear subject separation from background. Use depth layering (foreground interest, mid-ground subject, background context). Balanced negative space.
PRODUCT: The uploaded product garment/item must be the visual hero — accurate color, fabric texture, pattern, cut, and design details preserved exactly. Product must be clearly visible and well-lit.
FABRIC: Realistic drape, wrinkles, material sheen matching the actual textile (matte cotton, glossy silk, textured denim, etc.).
CAMERA REALISM: Subtle natural sensor grain, mild lens imperfection, natural vignetting. These are signs of REAL cameras — include them.${textRule}
Return exactly one final ad image.\n`
}

function resolveOpenAIImageSize(aspectRatio?: AspectRatio): '1024x1024' | '1024x1536' | '1536x1024' | '1024x1280' {
  if (aspectRatio === '9:16') return '1024x1536'
  if (aspectRatio === '16:9') return '1536x1024'
  if (aspectRatio === '4:5') return '1024x1280'
  return '1024x1024'
}

function isOpenAIAvailabilityError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /organization must be verified|must be verified to use the model|model access|insufficient_quota|rate limit|temporarily unavailable|overloaded|timeout|timed out/i.test(
    message
  )
}

function buildGeminiFaceLockFallbackPrompt(params: {
  preset: AdPreset
  cameraAngle?: string
  subject?: { pose?: string; expression?: string }
  textOverlay?: { headline?: string; subline?: string; tagline?: string }
  faceAnchor?: string
  eyesAnchor?: string
  antiDriftDirectives?: string
  bodyAnchor?: string
  appearanceSummary?: string
  characterSummary?: string
  perceivedGender?: 'masculine' | 'feminine' | 'neutral'
}): string {
  const hasText = Boolean(
    params.textOverlay?.headline || params.textOverlay?.subline || params.textOverlay?.tagline
  )

  const prompt =
    buildQualityPreamble(hasText) +
    buildFaceLockedAdEditPrompt({
      faceAnchor:
        params.faceAnchor ||
        'Preserve the exact same person from the influencer reference image: same face shape, eyes, nose, lips, skin tone, hair, and overall facial asymmetry.',
      preset: params.preset,
      cameraAngle: params.cameraAngle,
      subject: params.subject,
      textOverlay: params.textOverlay,
    })

  const extras: string[] = []
  if (params.eyesAnchor?.trim()) {
    extras.push(`EYE LOCK: ${params.eyesAnchor}.`)
  }
  if (params.appearanceSummary?.trim()) {
    extras.push(`APPEARANCE LOCK: ${params.appearanceSummary}.`)
  }
  if (params.characterSummary?.trim()) {
    extras.push(`CHARACTER LOCK: ${params.characterSummary}.`)
  }
  if (params.bodyAnchor?.trim()) {
    extras.push(`BODY LOCK: ${params.bodyAnchor}.`)
  }
  if (params.antiDriftDirectives?.trim()) {
    extras.push(`ANTI-DRIFT: ${params.antiDriftDirectives}.`)
  }
  if (params.perceivedGender === 'masculine') {
    extras.push('Preserve masculine facial proportions, brow weight, jaw fullness, and facial hair exactly as photographed.')
  } else if (params.perceivedGender === 'feminine') {
    extras.push('Preserve feminine facial proportions, eye size, nose width, hairline, and natural asymmetry exactly as photographed.')
  }

  return extras.length > 0 ? `${prompt}\n\n${extras.join('\n')}` : prompt
}

/**
 * Use GPT-4o vision to extract a structured face anchor description from a photo.
 * This creates a stable identity string that locks facial geometry across generations.
 */
async function extractFaceAnchorDescription(
  openaiClient: OpenAI,
  faceImageBase64: string,
): Promise<string> {
  const imageUrl = faceImageBase64.startsWith('data:')
    ? faceImageBase64
    : `data:image/jpeg;base64,${faceImageBase64}`

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 300,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: [
          'You are a facial identity analyst for AI image generation consistency.',
          'Output a precise physical description that locks this person\'s identity.',
          'REQUIRED: Include ALL of these in order:',
          '1. Face shape and width (oval, round, square, heart, wide, narrow)',
          '2. Eye details (shape, color, spacing, crease type)',
          '3. Nose structure (bridge width, tip shape)',
          '4. Lip description (fullness, shape)',
          '5. Jawline and chin (angular, soft, rounded, pointed)',
          '6. Skin tone and texture (include pores and natural texture, but ignore tiny blemishes or uncertain marks)',
          '7. Overall asymmetry and clearly visible structural traits only',
          '8. Hair description',
          'Use geometric terms. Do NOT use beauty adjectives.',
          'Keep under 120 words. Output ONLY the description.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url' as const,
            image_url: { url: imageUrl, detail: 'low' as const },
          },
          {
            type: 'text' as const,
            text: 'Describe this person\'s face with precise geometric detail. Focus on shape, proportions, asymmetry, and skin tone. Ignore tiny blemishes, uncertain dark spots, or possible compression noise.',
          },
        ],
      },
    ],
  })

  const description = response.choices[0]?.message?.content?.trim()
  if (!description) {
    throw new Error('GPT-4o failed to extract face description')
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[FaceAnchor] Extracted face description:', description.substring(0, 120) + '...')
  }

  return description
}

/**
 * Score face similarity between original and generated image using GPT-4o vision.
 * Returns a 0-100 score where 100 = identical face, 90+ = very similar.
 */
async function scoreFaceSimilarity(
  originalImage: string,
  generatedImage: string
): Promise<number> {
  try {
    const gemini = getGeminiChat()
    const originalUri = originalImage.startsWith('data:')
      ? originalImage
      : `data:image/png;base64,${originalImage}`
    const generatedUri = generatedImage.startsWith('data:')
      ? generatedImage
      : `data:image/png;base64,${generatedImage}`

    const response = await gemini.chat.completions.create({
      model: 'gemini-2.5-flash',
      max_tokens: 20,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: originalUri, detail: 'low' },
            },
            {
              type: 'image_url',
              image_url: { url: generatedUri, detail: 'low' },
            },
            {
              type: 'text',
              text: `Compare faces in Image 1 (original) and Image 2 (generated). Score face IDENTITY similarity 0-100. Focus only on face shape, facial fullness, eye geometry, nose, lips, jawline, and skin tone. Ignore outfit, background, and pose. Reply with ONLY a number.`,
            },
          ],
        },
      ],
    })

    const scoreText = response.choices[0]?.message?.content?.trim() || '50'
    const score = parseInt(scoreText.replace(/[^0-9]/g, ''), 10)
    return isNaN(score) ? 50 : Math.min(100, Math.max(0, score))
  } catch (err) {
    console.error('[FaceScore] Error scoring face similarity:', err)
    return 50
  }
}

/**
 * Build the face-locked ad edit prompt using the face anchor description.
 * Follows production-grade patterns:
 * [FACE DESCRIPTION] + [PRODUCT] + [STYLE] + [SCENE] + [CONSISTENCY RULES]
 */
function buildFaceLockedAdEditPrompt(opts: {
  faceAnchor: string
  preset: AdPreset
  cameraAngle?: string
  subject?: { pose?: string; expression?: string }
  textOverlay?: { headline?: string; subline?: string; tagline?: string }
}): string {
  const { faceAnchor, preset, cameraAngle, subject, textOverlay } = opts

  const parts: string[] = []

  // IDENTITY FIRST — AI pays most attention to the first 10-15 words
  parts.push(`Same person, identical facial structure. Edit this photo — keep the same face, change only outfit and background.`)
  parts.push(``)
  parts.push(``)

  // Identity anchor from GPT-4o analysis
  parts.push(`IDENTITY:`)
  parts.push(faceAnchor)
  parts.push(``)

  // Face preservation (positive framing)
  parts.push(`FACE PRESERVATION: Preserve natural skin pores, facial asymmetry, and original proportions exactly as photographed. Keep the skin clean and do not invent moles, pimples, freckles, or blemishes.`)
  parts.push(``)

  // Editing instructions
  parts.push(`EDIT INSTRUCTIONS:`)
  parts.push(`1. Keep this exact person's face, head, and hair completely unchanged — same face shape, same eyes, same nose, same lips, same skin tone and texture, same hair, same asymmetry.`)
  parts.push(`2. Change ONLY their outfit to match the garment in Image 2 — same color, fabric, cut, pattern, design details.`)

  // Scene from preset
  parts.push(`3. SCENE: ${preset.sceneGuide}`)
  parts.push(``)

  // Lighting from preset
  parts.push(`LIGHTING: ${preset.lightingGuide}`)

  // Camera from preset + user override
  const cameraDesc = cameraAngle && cameraAngle !== 'auto'
    ? `${preset.cameraGuide}. Camera angle: ${cameraAngle}.`
    : preset.cameraGuide
  parts.push(`CAMERA: ${cameraDesc}`)
  parts.push(``)

  // Pose/expression from user input
  if (subject?.pose) {
    parts.push(`POSE: ${subject.pose}`)
  }
  if (subject?.expression) {
    parts.push(`EXPRESSION: ${subject.expression}`)
  }

  // Style anchors (stabilize output — anti-cartoon)
  parts.push(`Real editorial photograph shot on Canon EOS R5 85mm f/1.8. NOT an illustration, NOT digital art, NOT cartoon, NOT CGI. Raw photojournalistic quality with natural skin pores, film grain, and lens imperfections. Photorealistic skin texture, high detail facial features, sharp focus.`)
  parts.push(``)

  // Handle text overlay vs no-text
  const hasText = textOverlay?.headline || textOverlay?.subline || textOverlay?.tagline
  if (hasText) {
    if (textOverlay?.headline) parts.push(`Include headline text: "${textOverlay.headline}"`)
    if (textOverlay?.subline) parts.push(`Include subline text: "${textOverlay.subline}"`)
    if (textOverlay?.tagline) parts.push(`Include tagline text: "${textOverlay.tagline}"`)
  } else {
    parts.push(`Do NOT add any text, logos, watermarks, or typography.`)
  }
  parts.push(``)

  // Consistency reminder
  parts.push(`Same person, same face, same overall facial structure. Edit only outfit and background.`)
  if (preset.avoid.length > 0) {
    parts.push(`AVOID: ${preset.avoid.join(', ')}, beautification, skin smoothing`)
  }

  return parts.join('\n')
}

async function generateFaceLockedAdWithOpenAI(params: {
  influencerImage: string
  productImage?: string
  preset: AdPreset
  aspectRatio?: AspectRatio
  cameraAngle?: string
  subject?: { pose?: string; expression?: string }
  textOverlay?: { headline?: string; subline?: string; tagline?: string }
}): Promise<{ image: string; prompt: string }> {
  const openaiClient = new OpenAI({ apiKey: getOpenAIKey() })

  // Step 1: Extract face anchor description using GPT-4o vision
  if (process.env.NODE_ENV !== 'production') {
    console.log('[FaceAnchor] Extracting face identity description...')
  }
  const faceAnchor = await extractFaceAnchorDescription(openaiClient, params.influencerImage)

  // Step 2: Build prompt with face anchor + full preset data + user options
  const rawEditPrompt = buildFaceLockedAdEditPrompt({
    faceAnchor,
    preset: params.preset,
    cameraAngle: params.cameraAngle,
    subject: params.subject,
    textOverlay: params.textOverlay,
  })

  // Prepend anti-cartoon realism mandate
  const editPrompt = `CRITICAL: Output a RAW PHOTOGRAPH — NOT illustration, NOT digital art, NOT cartoon, NOT CGI, NOT stylized. Must be INDISTINGUISHABLE from a real DSLR photo with natural film grain, real skin pores, and authentic lighting.\n\n` + rawEditPrompt

  if (process.env.NODE_ENV !== 'production') {
    console.log('[FaceAnchor] Full prompt length:', editPrompt.length, 'chars')
  }

  // Step 3: Build image array using toFile() — official SDK approach
  const images: any[] = []

  const cleanPerson = stripDataUri(params.influencerImage)
  const personFile = await toFile(Buffer.from(cleanPerson, 'base64'), 'person.png', { type: 'image/png' })
  images.push(personFile)

  if (params.productImage) {
    const cleanProduct = stripDataUri(params.productImage)
    const productFile = await toFile(Buffer.from(cleanProduct, 'base64'), 'product.png', { type: 'image/png' })
    images.push(productFile)
  }

  // Step 4: Call GPT Image 1.5 via SDK images.edit()
  const gptResponse = await openaiClient.images.edit({
    model: 'gpt-image-1.5',
    image: images,
    prompt: editPrompt,
    size: resolveOpenAIImageSize(params.aspectRatio) as any,
    n: 1,
    input_fidelity: 'high',
  } as any)

  const imgData = gptResponse?.data?.[0]
  if (!imgData?.b64_json) {
    throw new Error('GPT Image returned no image data')
  }

  return {
    image: `data:image/png;base64,${imgData.b64_json}`,
    prompt: editPrompt,
  }
}

export async function POST(request: Request) {
  let inFlight: { allowed: boolean; retryAfterSeconds?: number; release?: () => Promise<void> } | null = null
  try {
    const startedAt = Date.now()
    const SOFT_DEADLINE_MS = 50_000
    const timeRemaining = () => SOFT_DEADLINE_MS - (Date.now() - startedAt)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // Verify brand role
    const { data: profile } = await service
      .from('profiles')
      .select('role, brand_data, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'brand') {
      return NextResponse.json(
        { error: 'Unauthorized - Brand access required' },
        { status: 403 }
      )
    }

    // In-flight guard: one ad generation per user at a time (regulates traffic at scale)
    inFlight = await tryAcquireInFlight(user.id, 'ads')
    if (!inFlight.allowed) {
      const retry = inFlight.retryAfterSeconds ?? 15
      return NextResponse.json(
        {
          error: 'An ad is already being generated. Please wait for it to finish.',
          retryAfterSeconds: retry,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' },
        }
      )
    }

    // Check rate limit (per-minute; middleware also enforces for /api/ads/generate)
    const rateLimit = await checkRateLimit(user.id, 'ads')
    if (!rateLimit.allowed) {
      const retry = rateLimit.retryAfterSeconds ?? 60
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          retryAfterSeconds: retry,
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' },
        }
      )
    }

    const body = await request.json().catch(() => null)
    const input = adGenerationSchema.parse(body)

    // Validate campaign if provided
    let campaignData = null
    if (input.campaignId) {
      const { data: campaign } = await service
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .single()

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }

      if (campaign.brand_id !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized - Campaign access denied' },
          { status: 403 }
        )
      }

      if (campaign.status === 'completed') {
        return NextResponse.json(
          { error: 'Cannot generate ads for completed campaigns' },
          { status: 400 }
        )
      }

      campaignData = { id: campaign.id, title: campaign.title }
    }

    // Build the generation input
    const generationInput: AdGenerationInput = {
      preset: input.preset as AdPresetId,
      campaignId: input.campaignId,
      variationIndex: input.variationIndex,
      stylePack: input.stylePack ?? resolveStylePackForPreset(input.preset as AdPresetId),
      productImage: input.productImage,
      influencerImage: input.influencerImage,
      lockFaceIdentity: input.lockFaceIdentity,
      strictRealism: input.strictRealism,
      characterType: input.characterType as CharacterType,
      characterIdentity: input.characterIdentity,
      animalType: input.animalType,
      characterStyle: input.characterStyle,
      characterAge: input.characterAge,
      aspectRatio: input.aspectRatio as AspectRatio | undefined,
      textOverlay: input.textOverlay
        ? {
            headline: input.textOverlay.headline,
            subline: input.textOverlay.subline,
            tagline: input.textOverlay.tagline,
            placement: input.textOverlay.placement as TextPlacement | undefined,
            fontStyle: input.textOverlay.fontStyle as FontStyle | undefined,
          }
        : undefined,
      headline: input.headline,
      ctaType: input.ctaType as CtaType,
      captionTone: input.captionTone as CaptionTone,
      platforms: input.platforms as Platform[],
      subject: input.subject,
    }

    // Validate with business rules
    const validation = validateAdInput(generationInput)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }    

    // ═══════════════════════════════════════════════════════
    // IMAGE GENERATION: GPT Image 1.5 or Gemini (user choice)
    // ═══════════════════════════════════════════════════════
    let generatedImage = ''
    let compositionPrompt = ''
    let promptUsed: string = input.imageModel || 'gemini'
    let faceLockScore: number | null = null
    let influencerFaceCropBase64: string | undefined
    let influencerPerceivedGender: 'masculine' | 'feminine' | 'neutral' | undefined

    // Auto face-lock: always lock when influencer image is present
    const shouldLockFace = Boolean(input.influencerImage)

    if (shouldLockFace && input.influencerImage) {
      // ── FACE-LOCKED: Gemini (always when a reference face is provided) ──
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AdsAPI] FACE-LOCKED mode with Gemini')
      }

      const presetObj = AD_PRESETS.find(p => p.id === input.preset) ?? AD_PRESETS[0]
      const forensicAnchor = await buildForensicFaceAnchor({
        personImageBase64: input.influencerImage,
        garmentDescription: 'product from Image 2',
      }).catch(() => null)
      influencerPerceivedGender = forensicAnchor?.perceivedGender
      const faceCropResult = await extractFaceCrop(input.influencerImage).catch(() => ({
        success: false,
        faceCropBase64: '',
      }))
      influencerFaceCropBase64 = faceCropResult.success ? faceCropResult.faceCropBase64 : undefined
      compositionPrompt = buildGeminiFaceLockFallbackPrompt({
        preset: presetObj,
        cameraAngle: input.cameraAngle,
        subject: input.subject,
        textOverlay: input.textOverlay,
        faceAnchor: forensicAnchor?.faceAnchor,
        eyesAnchor: forensicAnchor?.eyesAnchor,
        antiDriftDirectives: forensicAnchor?.antiDriftDirectives,
        bodyAnchor: forensicAnchor?.bodyAnchor,
        appearanceSummary: forensicAnchor?.appearanceSummary,
        characterSummary: forensicAnchor?.characterSummary,
        perceivedGender: forensicAnchor?.perceivedGender,
      })
      const MAX_FACE_ATTEMPTS = 2
      const FACE_THRESHOLD = 84
      let bestImage = ''
      let bestScore = 0

      for (let attempt = 1; attempt <= MAX_FACE_ATTEMPTS; attempt++) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AdsAPI] Gemini face-lock attempt ${attempt}/${MAX_FACE_ATTEMPTS}...`)
        }

        const retryPrompt = attempt === 1
          ? compositionPrompt
          : `${compositionPrompt}\n\nRETRY PRIORITY:\nPrevious attempt changed the face too much. Keep the exact same person from the reference image and tight face crop this time, especially face width, cheek fullness, eye geometry, jawline, and overall facial asymmetry.`

        const candidateImage = await generateIntelligentAdComposition(
          input.productImage,
          input.influencerImage,
          retryPrompt,
          {
            lockFaceIdentity: true,
            faceCropBase64: faceCropResult.success ? faceCropResult.faceCropBase64 : undefined,
            aspectRatio: input.aspectRatio as AspectRatio | undefined,
            temperature: attempt === 1 ? 0.18 : 0.12,
          }
        )

        const faceScore = await scoreFaceSimilarity(input.influencerImage, candidateImage)
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AdsAPI] Gemini face-lock attempt ${attempt} score: ${faceScore}%`)
        }

        if (faceScore > bestScore) {
          bestScore = faceScore
          bestImage = candidateImage
        }

        if (faceScore >= FACE_THRESHOLD) {
          break
        }

        if (attempt < MAX_FACE_ATTEMPTS && timeRemaining() < 25_000) {
          break
        }
      }

      generatedImage = bestImage
      faceLockScore = bestScore
      promptUsed = 'gemini-face-lock'
    } else if (input.imageModel === 'gpt') {
      // ── NORMAL GPT: GPT Image 1.5 without face lock ──
      try {
        if (process.env.NODE_ENV !== 'production') console.log('[AdsAPI] Building prompt with Gemini vision...')
        const { prompt: rawCompositionPrompt, fallback } = await buildAdPrompt(
        generationInput,
        input.productImage
      )

      const hasText = Boolean(input.textOverlay?.headline || input.textOverlay?.subline || input.textOverlay?.tagline)
      const gptRealismPrefix = `CRITICAL STYLE MANDATE: Generate a RAW PHOTOGRAPH — NOT an illustration, NOT digital art, NOT a stylized rendering, NOT cartoon, NOT anime, NOT CGI. This must be indistinguishable from a real photo shot on a professional DSLR camera. Include natural film grain, real skin texture with visible pores, lens imperfections, and authentic lighting. If the result looks even slightly illustrated or digitally painted, it is a FAILURE.\n\n`
      compositionPrompt = gptRealismPrefix + buildQualityPreamble(hasText) + rawCompositionPrompt
      promptUsed = fallback ? 'fallback' : 'gpt-image-1.5'

      if (process.env.NODE_ENV !== 'production') {
        console.log('[AdsAPI] Prompt built (' + promptUsed + '): ' + compositionPrompt.length + ' chars')
        console.log('[AdsAPI] Generating ad with GPT Image 1.5...')
      }

      // Use GPT Image 1.5 via SDK images.edit()
      const gptClient = new OpenAI({ apiKey: getOpenAIKey() })
      const gptImages: any[] = []

      if (input.productImage) {
        const cleanProduct = stripDataUri(input.productImage)
        const productFile = await toFile(Buffer.from(cleanProduct, 'base64'), 'product.png', { type: 'image/png' })
        gptImages.push(productFile)
      }

      const gptResp = await gptClient.images.edit({
        model: 'gpt-image-1.5',
        image: gptImages.length > 0 ? gptImages : undefined as any,
        prompt: compositionPrompt,
        size: resolveOpenAIImageSize(input.aspectRatio as AspectRatio | undefined) as any,
        n: 1,
        input_fidelity: 'high',
      } as any)

      const imgData = gptResp?.data?.[0]
      if (!imgData?.b64_json) {
        throw new Error('GPT Image returned no image data')
      }
        generatedImage = `data:image/png;base64,${imgData.b64_json}`
      } catch (error) {
        if (!isOpenAIAvailabilityError(error)) throw error

        const { prompt: rawCompositionPrompt, fallback } = await buildAdPrompt(
          generationInput,
          input.productImage
        )
        const hasText = Boolean(input.textOverlay?.headline || input.textOverlay?.subline || input.textOverlay?.tagline)
        compositionPrompt = buildQualityPreamble(hasText) + rawCompositionPrompt
        promptUsed = fallback ? 'fallback-gemini' : 'gemini-provider-fallback'
        generatedImage = await generateIntelligentAdComposition(
          input.productImage,
          undefined,
          compositionPrompt,
          {
            lockFaceIdentity: false,
            aspectRatio: input.aspectRatio as AspectRatio | undefined,
          }
        )
      }
    } else {
      // ── NORMAL GEMINI: Gemini-based generation ──
      if (process.env.NODE_ENV !== 'production') console.log('[AdsAPI] Building prompt with Gemini vision...')
      const { prompt: rawCompositionPrompt, fallback } = await buildAdPrompt(
        generationInput,
        input.productImage
      )

      const hasText = Boolean(input.textOverlay?.headline || input.textOverlay?.subline || input.textOverlay?.tagline)
      compositionPrompt = buildQualityPreamble(hasText) + rawCompositionPrompt
      promptUsed = fallback ? 'fallback' : 'gemini'

      if (process.env.NODE_ENV !== 'production') {
        console.log('[AdsAPI] Prompt built (' + promptUsed + '): ' + compositionPrompt.length + ' chars')
        console.log('[AdsAPI] Generating ad with Gemini...')
      }

      generatedImage = await generateIntelligentAdComposition(
        input.productImage,
        undefined,
        compositionPrompt,
        {
          lockFaceIdentity: false,
          aspectRatio: input.aspectRatio as AspectRatio | undefined,
        }
      )
    }

    if (input.influencerImage && timeRemaining() > 18_000) {
      const currentFaceScore = faceLockScore ?? await scoreFaceSimilarity(input.influencerImage, generatedImage)
      if (currentFaceScore < 84) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AdsAPI] Face score ${currentFaceScore}% below target. Running face restore...`)
        }

        try {
          const [personFace, generatedFace] = await Promise.all([
            detectFaceCoordinates(input.influencerImage, { allowHeuristicFallback: true }),
            detectFaceCoordinates(generatedImage),
          ])

          if (personFace && generatedFace) {
            const restored = await restoreFaceIdentity({
              generatedImageBase64: generatedImage,
              personImageBase64: input.influencerImage,
              faceCropBase64: influencerFaceCropBase64,
              generatedFace,
              personFace,
              aspectRatio: input.aspectRatio,
              perceivedGender: influencerPerceivedGender,
            })

            if (restored.success && restored.restoredImageBase64) {
              const restoredScore = await scoreFaceSimilarity(input.influencerImage, restored.restoredImageBase64)
              if (process.env.NODE_ENV !== 'production') {
                console.log(`[AdsAPI] Face restore score: ${restoredScore}% (was ${currentFaceScore}%)`)
              }

              if (restoredScore >= currentFaceScore + 4 || restoredScore >= 84) {
                generatedImage = restored.restoredImageBase64
                faceLockScore = restoredScore
                promptUsed = `${promptUsed}+face-restore`
              }
            }
          }
        } catch (err) {
          console.warn('[AdsAPI] Face restore skipped after generation:', err)
        }
      }
    }


    // Score first pass and optionally run a quality recovery pass.
    // In production, we default to one pass to avoid 504 timeouts.
    const enableRecoveryPass = process.env.AD_ENABLE_RECOVERY_PASS === 'true'

    let rating = await rateAdCreative(generatedImage, input.productImage, input.influencerImage).catch(
      () => ({ score: 75 })
    )
    let qualityScore = Number((rating as any)?.score || 75)

    if (enableRecoveryPass && input.imageModel === 'gemini' && qualityScore < 82 && timeRemaining() > 18_000) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AdsAPI] Low quality score (${qualityScore}). Running recovery pass...`)
      }

      const recoveryPrompt = `${compositionPrompt}

QUALITY RECOVERY PASS:
- Increase realism and premium finish while preserving the same concept.
- Clean edges, natural skin/fabric texture, balanced dynamic range.
- Keep a single strong focal point with ad-ready composition.
- No warped hands, no malformed anatomy, no synthetic/plastic/clay skin.
- Face correction priority: realistic pores, subtle facial asymmetry, accurate skin micro-contrast, natural eye detail, no beauty-filter smoothing.
- Text correction priority: crisp and legible typography, realistic print/paint/signage treatment, never chunky toy-like 3D letters.`

      const candidateImage = await generateIntelligentAdComposition(
        input.productImage,
        input.influencerImage,
        recoveryPrompt,
        {
          lockFaceIdentity: input.lockFaceIdentity,
          aspectRatio: input.aspectRatio as AspectRatio | undefined,
        }
      )

      const candidateRating = await rateAdCreative(candidateImage, input.productImage, input.influencerImage).catch(
        () => ({ score: 75 })
      )
      const candidateScore = Number((candidateRating as any)?.score || 75)

      if (candidateScore > qualityScore) {
        generatedImage = candidateImage
        rating = candidateRating
        qualityScore = candidateScore
      }
    }

    // Post-generation: copy. If we are close to timeout, skip heavy extras and return image first.
    if (process.env.NODE_ENV !== 'production') console.log('[AdsAPI] Generating ad copy...')

    const brandData = (profile.brand_data as any) || {}
    const brandName =
      brandData.companyName || profile.full_name || undefined

    const copyVariants = timeRemaining() > 8_000
      ? await generateAdCopy(generatedImage, {
          productName: input.textOverlay?.headline || input.headline || 'fashion product',
          brandName,
          niche: input.preset,
        }).catch(() => [])
      : []

    let imageUrl: string | null = null
    try {
      let contentType = 'image/jpeg'
      let fileExtension = 'jpg'
      const mimeMatch = generatedImage.match(/^data:(image\/\w+);base64,/)
      if (mimeMatch) {
        contentType = mimeMatch[1]
        if (contentType === 'image/png') fileExtension = 'png'
        else if (contentType === 'image/webp') fileExtension = 'webp'
        else if (contentType === 'image/gif') fileExtension = 'gif'
      }

      const imagePath = `${user.id}/${Date.now()}.${fileExtension}`
      imageUrl = await saveUpload(
        generatedImage,
        imagePath,
        'ads',
        contentType
      )
    } catch (uploadErr) {
      // Upload failed but we still have the image — log and continue
      console.warn('[AdsAPI] Storage upload failed (non-fatal, returning inline image):', uploadErr)
    }

    // ── Save to DB (only if we have a URL) ──
    let adCreativeId: string | null = null
    if (imageUrl) {
      const { data: adCreative, error: insertError } = await service
        .from('ad_creatives')
        .insert({
          brand_id: user.id,
          image_url: imageUrl,
          title:
            input.textOverlay?.headline ||
            input.headline ||
            `${input.preset} Ad`,
          prompt: compositionPrompt,
          campaign_id: campaignData?.id || null,
          platform: input.platforms[0] || 'instagram',
          status: 'generated',
          rating: qualityScore,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Ad creative insert error:', insertError)
      }
      adCreativeId = adCreative?.id || null
    }

    // Return image data inline for immediate display — works even if upload failed
    return NextResponse.json({
      id: adCreativeId || crypto.randomUUID(),
      imageUrl: imageUrl || null,
      imageBase64: generatedImage, // inline for immediate rendering — ALWAYS available
      copy: copyVariants,
      rating,
      qualityScore,
      preset: input.preset,
      promptUsed,
    })
  } catch (error) {
    console.error('Ad generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof GeminiRateLimitError) {
      const retryAfterSeconds = Math.min(
        60,
        Math.ceil((error.retryAfterMs ?? 30_000) / 1000)
      ) || 30
      return NextResponse.json(
        {
          error: error.message || 'Rate limit reached. Please retry shortly.',
          code: 'RATE_LIMIT',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  } finally {
    void inFlight?.release?.()
  }
}

