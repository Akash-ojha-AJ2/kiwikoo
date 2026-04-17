import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { tryAcquireInFlight } from '@/lib/traffic-guard'
import { generateIntelligentAdComposition } from '@/lib/gemini'
import { GeminiRateLimitError } from '@/lib/gemini/executor'
import { saveUpload } from '@/lib/storage'
import { getOpenAI } from '@/lib/openai'

export const maxDuration = 180

// ═══════════════════════════════════════════════════════════════
// PRODUCT-SPECIFIC VISUAL VARIANTS
// Each variant has a distinct purpose and composition direction.
// Unlike the ad pipeline, these are concise & product-focused.
// ═══════════════════════════════════════════════════════════════

interface ProductVariant {
  id: string
  label: string
  buildPrompt: (analysis: ProductAnalysis, meta: ProductMeta) => string
}

interface ProductAnalysis {
  garmentType: string
  fabric: string
  color: string
  pattern: string
  silhouette: string
  keyDetails: string[]
  category: string
}

interface ProductMeta {
  name?: string
  category?: string
  description?: string
  audience?: string
  tags?: string[]
  price?: number
}

const ANTI_HALLUCINATION = `CRITICAL: Do NOT add any text, letters, numbers, logos, watermarks, or typography. Do NOT invent brand marks, extra accessories, or additional products not in the source image. Preserve the EXACT product: same color, material, trim, pattern, and shape.`

const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'studio_packshot',
    label: 'Studio Packshot',
    buildPrompt: (analysis, meta) => {
      const positioning = meta.price && meta.price > 2000 ? 'luxury' : 'premium'
      return `Create a clean, ${positioning} ecommerce product photograph of this ${analysis.garmentType}.

COMPOSITION: Product displayed on a ghost mannequin, invisible support, or flat-lay arrangement on a seamless off-white/light gray background. No human model. The product floats or stands naturally as if photographed in a professional product studio.

PRODUCT DETAILS TO PRESERVE: ${analysis.color} ${analysis.fabric} ${analysis.garmentType}. ${analysis.pattern !== 'solid' ? `Pattern: ${analysis.pattern}.` : ''} Silhouette: ${analysis.silhouette}. ${analysis.keyDetails.length > 0 ? `Key details: ${analysis.keyDetails.join(', ')}.` : ''}

LIGHTING: Soft studio lighting from 45° front-left with fill. Premium product shadows — natural contact shadow on the surface, soft ambient occlusion. Fabric texture and material sheen fully visible. No harsh highlights.

CAMERA: Straight-on or slight 15° angle. Product fills 70–80% of frame. Tack-sharp focus across entire product. Clean, distraction-free composition.${meta.name ? `\nThis is "${meta.name}".` : ''}

${ANTI_HALLUCINATION}`
    },
  },
  {
    id: 'lifestyle_context',
    label: 'Lifestyle Scene',
    buildPrompt: (analysis, meta) => {
      const audienceContext = meta.audience
        ? `Target audience: ${meta.audience}. `
        : ''
      const seasonTags = meta.tags?.filter(t =>
        /summer|winter|spring|autumn|fall|monsoon|rain|festive|casual|formal|party|office|beach|outdoor/i.test(t)
      )
      const seasonHint = seasonTags && seasonTags.length > 0
        ? `Setting should feel ${seasonTags.join(', ')}.`
        : ''

      return `Create a lifestyle product photograph showing this ${analysis.garmentType} being worn by a model in a natural, aspirational real-world setting.

SCENE: Place a single model wearing this exact product in a curated but believable environment — a sunlit café, boutique interior, city sidewalk, or styled room. The setting should tell a story about the lifestyle this product belongs to. ${audienceContext}${seasonHint}

PRODUCT TO PRESERVE: ${analysis.color} ${analysis.fabric} ${analysis.garmentType}. ${analysis.pattern !== 'solid' ? `Pattern: ${analysis.pattern}.` : ''} Silhouette: ${analysis.silhouette}. ${analysis.keyDetails.length > 0 ? `Details: ${analysis.keyDetails.join(', ')}.` : ''}

MODEL: One model, natural relaxed pose, genuine expression. Hands doing something natural (holding coffee, adjusting sleeve, light walk). Product is the hero — model is secondary. Keep styling minimal so the product dominates.

LIGHTING: Natural daylight or warm interior light. Soft directional key, realistic shadows. Skin and fabric textures fully visible. No artificial beauty-filter smoothing.

CAMERA: 50mm, f/2.8–4. Three-quarter or full body. Product and key details tack-sharp. Background readable but secondary.${meta.name ? `\nThis is "${meta.name}".` : ''}

${ANTI_HALLUCINATION}`
    },
  },
  {
    id: 'editorial_spotlight',
    label: 'Editorial Spotlight',
    buildPrompt: (analysis, meta) => {
      return `Create a dramatic editorial fashion photograph showcasing this ${analysis.garmentType} as the hero subject.

COMPOSITION: Product worn by a model with a distinctly different angle and mood than a standard catalog shot. Choose ONE: overhead flat angle looking down, dramatic side-profile silhouette, tight crop focusing on fabric texture and construction details, or three-quarter turn with strong directional light creating sculptural shadows. The image should feel like it belongs in a fashion magazine spread.

PRODUCT TO PRESERVE: ${analysis.color} ${analysis.fabric} ${analysis.garmentType}. ${analysis.pattern !== 'solid' ? `Pattern: ${analysis.pattern}.` : ''} Silhouette: ${analysis.silhouette}. ${analysis.keyDetails.length > 0 ? `Details: ${analysis.keyDetails.join(', ')}.` : ''}

LIGHTING: Dramatic, sculpted studio lighting. Strong key light with deep shadows for dimensionality. Rim light for edge separation. The lighting should reveal material quality — fabric texture, stitching, hardware, sheen. High contrast, fashion-campaign mood.

MODEL: Confident editorial pose with attitude. Strong body language. Expression: editorial intensity — not a catalog smile. The model serves the garment, not the other way around.

CAMERA: 85mm, f/2–2.8. Tight or three-quarter framing. Cinematic composition with strong visual hierarchy. 8K detail on product.${meta.name ? `\nThis is "${meta.name}".` : ''}

${ANTI_HALLUCINATION}`
    },
  },
]

// ═══════════════════════════════════════════════════════════════
// GPT-4o VISION: Adaptive Product Analysis
// Extracts product attributes to feed into prompt construction.
// ═══════════════════════════════════════════════════════════════

async function analyzeProductImage(
  imageBase64: string,
  meta: ProductMeta
): Promise<ProductAnalysis> {
  const openai = getOpenAI()

  const metaHints = [meta.name, meta.category, meta.description]
    .filter(Boolean)
    .join(' | ')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a fashion product analyst. Analyze the product image with precision. Return JSON only.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this product image for ecommerce visual generation.${metaHints ? ` Context: ${metaHints}` : ''}

Return JSON:
{
  "garmentType": "specific type (e.g. oversized linen shirt, cropped denim jacket, pleated midi skirt)",
  "fabric": "material and texture (e.g. soft brushed cotton, smooth silk charmeuse, raw selvedge denim)",
  "color": "exact color description (e.g. dusty rose pink, washed indigo blue, charcoal heather gray)",
  "pattern": "solid or describe pattern (e.g. micro houndstooth, ditsy floral, color-block navy/white)",
  "silhouette": "shape when worn (e.g. relaxed oversized fit, tailored slim fit, A-line flared)",
  "keyDetails": ["array of visible construction/design details like buttons, zippers, embroidery, pockets, collar style, cuffs, stitching"],
  "category": "broad category (tops, bottoms, dresses, outerwear, footwear, accessories, bags)"
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.15,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('Empty analysis response')

    const parsed = JSON.parse(content)
    return {
      garmentType: parsed.garmentType || 'fashion product',
      fabric: parsed.fabric || 'standard fabric',
      color: parsed.color || 'as shown',
      pattern: parsed.pattern || 'solid',
      silhouette: parsed.silhouette || 'standard fit',
      keyDetails: Array.isArray(parsed.keyDetails) ? parsed.keyDetails : [],
      category: parsed.category || meta.category || 'clothing',
    }
  } catch (error) {
    console.warn('[ProductVisuals] GPT-4o analysis failed, using defaults:', error)
    return {
      garmentType: meta.category || 'fashion product',
      fabric: 'standard fabric',
      color: 'as shown in image',
      pattern: 'as shown',
      silhouette: 'standard fit',
      keyDetails: [],
      category: meta.category || 'clothing',
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// REQUEST SCHEMA & HANDLER
// ═══════════════════════════════════════════════════════════════

const requestSchema = z.object({
  productImage: z.string().min(1).max(15_000_000),
  productName: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  description: z.string().trim().max(600).optional(),
  audience: z.string().trim().max(80).optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().optional(),
})

export async function POST(request: Request) {
  let inFlight: { allowed: boolean; retryAfterSeconds?: number; release?: () => Promise<void> } | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    inFlight = await tryAcquireInFlight(user.id, 'ads')
    if (!inFlight.allowed) {
      const retry = inFlight.retryAfterSeconds ?? 20
      return NextResponse.json(
        { error: 'Another product visual generation is already running.', retryAfterSeconds: retry },
        { status: 429, headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' } }
      )
    }

    const rateLimit = await checkRateLimit(user.id, 'ads')
    if (!rateLimit.allowed) {
      const retry = rateLimit.retryAfterSeconds ?? 60
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.', retryAfterSeconds: retry },
        { status: 429, headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' } }
      )
    }

    const body = await request.json().catch(() => null)
    const input = requestSchema.parse(body)

    const meta: ProductMeta = {
      name: input.productName,
      category: input.category,
      description: input.description,
      audience: input.audience,
      tags: input.tags,
      price: input.price,
    }

    // ─── Step 1: Adaptive product analysis via GPT-4o vision ───
    console.log('[ProductVisuals] Analyzing product with GPT-4o vision...')
    const analysis = await analyzeProductImage(input.productImage, meta)
    console.log('[ProductVisuals] Analysis:', JSON.stringify(analysis, null, 2))

    // ─── Step 2: Generate all 3 variants in PARALLEL ───
    console.log('[ProductVisuals] Generating 3 variants in parallel...')

    const results = await Promise.allSettled(
      PRODUCT_VARIANTS.map(async (variant) => {
        const prompt = variant.buildPrompt(analysis, meta)
        console.log(`[ProductVisuals] ${variant.label} prompt length: ${prompt.length} chars`)

        const generatedImage = await generateIntelligentAdComposition(
          input.productImage,
          undefined,
          prompt,
          {
            lockFaceIdentity: false,
            aspectRatio: '1:1',
          }
        )

        const imagePath = `${user.id}/product-visuals/${Date.now()}-${variant.id}.jpg`
        const imageUrl = await saveUpload(generatedImage, imagePath, 'products', 'image/jpeg')

        return {
          id: variant.id,
          label: variant.label,
          preset: variant.id,
          imageUrl,
          imageBase64: generatedImage,
        }
      })
    )

    // ─── Step 3: Collect results ───
    const visuals: Array<{
      id: string
      label: string
      preset: string
      imageUrl: string
      imageBase64: string
    }> = []

    const failures: string[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === 'fulfilled') {
        visuals.push(result.value)
      } else {
        console.error(`[ProductVisuals] Failed for ${PRODUCT_VARIANTS[i].label}:`, result.reason)
        failures.push(PRODUCT_VARIANTS[i].label)
      }
    }

    if (visuals.length === 0) {
      return NextResponse.json(
        { error: 'We could not generate product visuals right now. Please try again in a moment.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      visuals,
      partial: failures.length > 0,
      failedLabels: failures,
    })
  } catch (error) {
    console.error('Product visuals generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    if (error instanceof GeminiRateLimitError) {
      const retryAfterSeconds = Math.min(60, Math.ceil((error.retryAfterMs ?? 30_000) / 1000)) || 30
      return NextResponse.json(
        {
          error: error.message || 'Rate limit reached. Please retry shortly.',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' },
        }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  } finally {
    void inFlight?.release?.()
  }
}
