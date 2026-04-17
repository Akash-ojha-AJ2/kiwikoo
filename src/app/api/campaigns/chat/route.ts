/**
 * CAMPAIGNS CHAT API — AI Campaign Strategist (Multimodal)
 *
 * Transforms the chat into a multimodal strategist with:
 *  - OpenAI GPT-4o Vision for understanding user-uploaded images
 *  - Gemini (Nano Banana Pro) for generating campaign visuals
 *  - 4-role activation with auto-progression
 *  - Auto-campaign creation from strategy output
 *
 * Uses Supabase only — NO Prisma
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { getOpenAI } from '@/lib/openai'
import { z } from 'zod'
import { buildStrategistSystemPrompt } from '@/lib/campaigns/campaign-strategist-prompt'
import type {
  StrategistPhase,
  BrandContext,
  CampaignStrategyOutput,
  GeneratedCampaignImage,
} from '@/lib/campaigns/campaign-strategist-types'
import type { CampaignGoal, BudgetType } from '@/lib/campaigns/types'

// Increase timeout for multimodal operations (Vision + Image Generation)
export const maxDuration = 120

const chatSchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
    phase: z.enum(['intake', 'researcher', 'ideator', 'scripter', 'analyst', 'complete']).default('intake'),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string().max(12000),
        })
      )
      .max(80)
      .optional(),
    // User-uploaded product images as base64 data URLs (up to 10)
    images: z
      .array(z.string().max(5_000_000)) // ~3.5MB base64 limit per image
      .max(10)
      .optional(),
  })
  .strict()

/**
 * Parse a campaign_create JSON block from the AI's response.
 */
function parseCampaignPayload(content: string): CampaignStrategyOutput | null {
  const match = content.match(/```campaign_create\s*([\s\S]*?)```/)
  if (!match?.[1]) return null

  try {
    const parsed = JSON.parse(match[1].trim())
    if (!parsed.title || !parsed.goal || !parsed.brief) return null
    return parsed as CampaignStrategyOutput
  } catch {
    return null
  }
}

/**
 * Parse [IMAGE_GEN:description] markers from the AI response.
 * The AI strategist will include these when it wants to generate a campaign visual.
 */
function parseImageGenMarkers(content: string): { description: string; preset?: string }[] {
  const markers: { description: string; preset?: string }[] = []
  const regex = /\[IMAGE_GEN(?::([^\]]*))?\]([\s\S]*?)(?=\[IMAGE_GEN|\[PHASE:|```campaign_create|$)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const inlineDesc = match[1]?.trim()
    const blockDesc = match[2]?.trim()
    const description = inlineDesc || blockDesc

    if (description) {
      // Check if a preset is mentioned
      const presetMatch = description.match(/preset:\s*(\w+)/i)
      markers.push({
        description: description.replace(/preset:\s*\w+/i, '').trim(),
        preset: presetMatch?.[1],
      })
    }
  }

  // Also check for simpler format: [IMAGE_GEN:description here]
  const simpleRegex = /\[IMAGE_GEN:([^\]]+)\]/g
  let simpleMatch
  while ((simpleMatch = simpleRegex.exec(content)) !== null) {
    const desc = simpleMatch[1].trim()
    // Avoid duplicates
    if (!markers.some(m => m.description === desc)) {
      const presetMatch = desc.match(/preset:\s*(\w+)/i)
      markers.push({
        description: desc.replace(/preset:\s*\w+/i, '').trim(),
        preset: presetMatch?.[1],
      })
    }
  }

  return markers
}

/**
 * Generate a campaign visual using Gemini with product reference images.
 * When product images are provided, Gemini generates visuals that incorporate
 * the actual product — the user just describes what kind of shot they want.
 */
async function generateCampaignVisual(
  description: string,
  productImages: string[],
  preset?: string,
): Promise<GeneratedCampaignImage | null> {
  try {
    // Use OpenAI to craft a detailed generation prompt from the user's simple description
    const openai = getOpenAI()

    const hasProductImages = productImages.length > 0
    const systemContent = hasProductImages
      ? `You are an ad creative director. The user has provided product images. 
Given their simple description of what kind of campaign image they want, generate a detailed, 
cinematic prompt for AI image generation that FEATURES THE PRODUCT from the reference images.

The prompt should describe:
- How to showcase the product (held, worn, displayed, in-use, flat lay, etc.)
- Scene/setting around the product
- Model/subject details if a person is involved
- Lighting, mood, and color palette
- Camera angle and composition
- The product should be the STAR of the image

Keep the prompt under 200 words. Be vivid and specific.
Return ONLY the prompt text, nothing else.`
      : `You are an ad creative director. Given a description of a campaign visual, generate a detailed, 
cinematic prompt for image generation. The prompt should describe:
- Scene/setting
- Subject/character details
- Lighting and mood
- Product placement if relevant
- Camera angle and composition

Keep the prompt under 200 words. Be vivid and specific.
Return ONLY the prompt text, nothing else.`

    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        {
          role: 'user',
          content: `Generate a cinematic ad image prompt for: ${description}`
        }
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const imagePrompt = promptResponse.choices[0]?.message?.content?.trim()
    if (!imagePrompt) return null

    // Use Gemini for image generation with product reference images
    const { GoogleGenAI } = await import('@google/genai')
    const { getGeminiKey } = await import('@/lib/config/api-keys')

    const client = new GoogleGenAI({ apiKey: getGeminiKey() })

    // Build the parts array — include product images + text prompt
    const parts: any[] = []

    // Add product reference images first (up to 4 for Gemini context)
    if (hasProductImages) {
      const imagesToInclude = productImages.slice(0, 4)
      for (const img of imagesToInclude) {
        // Extract base64 data and mime type from data URL
        const dataMatch = img.match(/^data:(image\/\w+);base64,(.+)$/)
        if (dataMatch) {
          parts.push({
            inlineData: {
              mimeType: dataMatch[1],
              data: dataMatch[2],
            }
          })
        }
      }
      parts.push({ text: `Using the product shown in the reference images above, generate a high-quality campaign visual. ${imagePrompt}` })
    } else {
      parts.push({ text: `Generate a high-quality, cinematic campaign visual image. ${imagePrompt}` })
    }

    // Use gemini-2.5-flash-image — confirmed working for image generation
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'] as unknown as undefined,
      }
    })

    // Extract image from response
    const responseParts = response.candidates?.[0]?.content?.parts
    if (!responseParts) return null

    for (const part of responseParts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png'
        const imageBase64 = `data:${mimeType};base64,${part.inlineData.data}`
        return {
          imageBase64,
          description,
          preset: preset || undefined,
        }
      }
    }

    return null
  } catch (error) {
    console.error('Campaign visual generation failed:', error)
    return null
  }
}

/**
 * Detect phase transition markers in the AI's response.
 */
function detectPhaseTransition(content: string, currentPhase: StrategistPhase): StrategistPhase | null {
  // Primary: explicit marker
  const match = content.match(/\[PHASE:(\w+)\]/)
  if (match?.[1]) {
    const validPhases: StrategistPhase[] = ['intake', 'researcher', 'ideator', 'scripter', 'analyst', 'complete']
    const phase = match[1] as StrategistPhase
    if (validPhases.includes(phase)) return phase
  }

  // Fallback: content-based detection when AI forgets the marker
  const lower = content.toLowerCase()

  if (currentPhase === 'intake') {
    const researchSignals = ['competitor', 'audience psychology', 'insight brief', 'objection', 'content gap', 'market intelligence']
    const signalCount = researchSignals.filter(s => lower.includes(s)).length
    if (signalCount >= 3) return 'researcher'
  }

  if (currentPhase === 'researcher') {
    const ideatorSignals = ['hook bank', 'content angles', 'campaign theme', 'big idea', 'content system', 'posting cadence']
    const signalCount = ideatorSignals.filter(s => lower.includes(s)).length
    if (signalCount >= 2) return 'ideator'
  }

  if (currentPhase === 'ideator') {
    const scripterSignals = ['[hook]', '[body]', '[cta]', 'ad script', 'ugc brief', 'influencer script', 'organic content script']
    const signalCount = scripterSignals.filter(s => lower.includes(s)).length
    if (signalCount >= 2) return 'scripter'
  }

  if (currentPhase === 'scripter') {
    const analystSignals = ['a/b test', 'variant a', 'variant b', 'clarity audit', 'differentiation check', 'conversion lift', 'campaign summary']
    const signalCount = analystSignals.filter(s => lower.includes(s)).length
    if (signalCount >= 2) return 'analyst'
  }

  if (currentPhase === 'analyst') {
    if (content.includes('```campaign_create')) return 'complete'
  }

  return null
}

/**
 * Build campaign summaries string for context injection
 */
function buildCampaignsSummary(
  campaigns: Record<string, unknown>[],
  audienceMap: Record<string, Record<string, unknown>>,
  creativesMap: Record<string, Record<string, unknown>>,
): string {
  if (campaigns.length === 0) return ''

  return campaigns.map((c) => {
    const id = c.id as string
    const audience = audienceMap[id]
    const creative = creativesMap[id]
    const ageRange =
      audience && (audience.age_min != null || audience.age_max != null)
        ? `Age ${audience.age_min ?? '?'}-${audience.age_max ?? '?'}`
        : ''
    const location = audience?.location ? `, Location: ${audience.location}` : ''
    const interests =
      audience?.interests && Array.isArray(audience.interests)
        ? `, Interests: ${(audience.interests as string[]).join(', ')}`
        : ''
    const headline = creative?.headline ? ` | Headline: "${creative.headline}"` : ''
    const cta = creative?.cta_text ? ` | CTA: ${creative.cta_text}` : ''
    return `- "${c.title}" (Status: ${c.status})
  Goal: ${c.goal ?? '—'} | Budget: daily=₹${c.daily_budget ?? '—'} total=₹${c.total_budget ?? '—'}
  Audience: ${ageRange}${location}${interests || ' —'}
  Creative:${headline || ' —'}${cta}
  Metrics: spend=₹${Number(c.spend) || 0} | impressions=${Number(c.impressions) || 0} | clicks=${Number(c.clicks) || 0} | conversions=${Number(c.conversions) || 0}`
  }).join('\n\n')
}

export async function POST(request: Request) {
  try {
    // ─── AUTH ──────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // ─── BRAND PROFILE ────────────────────────────────
    const { data: profile } = await service
      .from('profiles')
      .select('role, brand_data')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized — Brand access required' }, { status: 403 })
    }

    // ─── PARSE REQUEST ────────────────────────────────
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }

    const { message, phase: currentPhase, conversationHistory = [], images = [] } = parsed.data

    // ─── BUILD BRAND CONTEXT ──────────────────────────
    const brandData = (profile.brand_data as Record<string, unknown>) || {}
    const brandContext: BrandContext = {
      companyName: (brandData.companyName as string) || 'Brand',
      brandType: (brandData.brandType as string) || 'Not specified',
      targetAudience: (brandData.targetAudience as string) || 'Not specified',
      vertical: (brandData.vertical as string) || 'Not specified',
      existingCampaignCount: 0,
      products: [],
    }

    // Fetch products for context (including images for visual generation)
    const { data: products } = await service
      .from('products')
      .select('id, name, description, price, category, image_url')
      .eq('brand_id', user.id)
      .limit(20)

    if (products) {
      brandContext.products = products.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        description: (p.description as string) || undefined,
        price: p.price != null ? Number(p.price) : undefined,
        category: (p.category as string) || undefined,
        imageUrl: (p.image_url as string) || undefined,
      }))
    }

    // Fetch existing campaigns for context
    const { data: campaignsList } = await service
      .from('campaigns')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })

    const campaigns = campaignsList || []
    brandContext.existingCampaignCount = campaigns.length
    const campaignIds = campaigns.map((c: { id: string }) => c.id)

    let audienceByCampaign: Record<string, Record<string, unknown>> = {}
    let creativesByCampaign: Record<string, Record<string, unknown>> = {}

    if (campaignIds.length > 0) {
      const [audienceRes, creativesRes] = await Promise.all([
        service.from('campaign_audience').select('*').in('campaign_id', campaignIds),
        service.from('campaign_creatives').select('*').in('campaign_id', campaignIds),
      ])
      if (!audienceRes.error && audienceRes.data) {
        for (const row of audienceRes.data as { campaign_id: string }[]) {
          audienceByCampaign[row.campaign_id] = row as Record<string, unknown>
        }
      }
      if (!creativesRes.error && creativesRes.data) {
        for (const row of creativesRes.data as { campaign_id: string }[]) {
          creativesByCampaign[row.campaign_id] = row as Record<string, unknown>
        }
      }
    }

    const campaignsSummary = buildCampaignsSummary(
      campaigns as Record<string, unknown>[],
      audienceByCampaign,
      creativesByCampaign,
    )

    // ─── BUILD SYSTEM PROMPT ──────────────────────────
    const systemPrompt = buildStrategistSystemPrompt(
      brandContext,
      currentPhase as StrategistPhase,
      campaignsSummary,
    )

    // ─── BUILD MESSAGES (with Vision support) ─────────
    const openai = getOpenAI()

    // Determine if we should use Vision model (GPT-4o) vs mini
    const hasImages = images.length > 0
    const modelToUse = hasImages ? 'gpt-4o' : 'gpt-4o-mini'

    // Build the user message with optional image content parts
    let userContent: any

    if (hasImages) {
      // Multimodal message: text + images
      const contentParts: any[] = [
        { type: 'text', text: message },
      ]

      for (const img of images) {
        // Clean base64 — ensure proper data URL format
        const imageUrl = img.startsWith('data:')
          ? img
          : `data:image/jpeg;base64,${img}`

        contentParts.push({
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail: 'high',
          },
        })
      }

      userContent = contentParts
    } else {
      userContent = message
    }

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: any }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ]

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages,
      temperature: 0.7,
      max_tokens: 3000,
    })

    const responseContent =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response. Please try again.'

    // ─── DETECT PHASE TRANSITION ──────────────────────
    const newPhase = detectPhaseTransition(responseContent, currentPhase as StrategistPhase)

    // ─── DETECT CAMPAIGN PAYLOAD ──────────────────────
    const campaignPayload = parseCampaignPayload(responseContent)

    // ─── DETECT & EXECUTE IMAGE GENERATION ────────────
    const imageGenMarkers = parseImageGenMarkers(responseContent)
    let generatedImages: GeneratedCampaignImage[] = []

    if (imageGenMarkers.length > 0) {
      // Collect all product images uploaded during this conversation
      // These are stored in the current request's images array
      const productImages = images || []

      // Generate images in parallel (max 2 to avoid rate limits)
      const toGenerate = imageGenMarkers.slice(0, 2)
      const results = await Promise.allSettled(
        toGenerate.map(marker =>
          generateCampaignVisual(marker.description, productImages, marker.preset)
        )
      )

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          generatedImages.push(result.value)
        }
      }
    }

    // ─── AUTO-CREATE CAMPAIGN IF PAYLOAD EXISTS ───────
    let createdCampaignId: string | null = null

    if (campaignPayload) {
      try {
        const goalMap: Record<string, CampaignGoal> = {
          sales: 'sales',
          awareness: 'awareness',
          launch: 'launch',
          traffic: 'traffic',
        }
        const goal = goalMap[campaignPayload.goal] || 'awareness'
        const budgetType = (campaignPayload.budget?.budget_type || 'daily') as BudgetType

        const strategyJson = {
          positioning: campaignPayload.positioning,
          funnel: campaignPayload.funnel,
          content_angles: campaignPayload.content_angles,
          ab_variants: campaignPayload.ab_variants,
          hooks: campaignPayload.creative?.hooks,
          scripts: campaignPayload.creative?.scripts,
          recommended_platforms: campaignPayload.budget?.recommended_platforms,
        }

        const { data: newCampaign, error: insertError } = await service
          .from('campaigns')
          .insert({
            brand_id: user.id,
            title: campaignPayload.title,
            brief: campaignPayload.brief,
            strategy: strategyJson,
            status: 'draft',
            goal,
            budget_type: budgetType,
            daily_budget: campaignPayload.budget?.daily_budget ?? null,
            total_budget: campaignPayload.budget?.total_budget ?? null,
          })
          .select('id')
          .single()

        if (!insertError && newCampaign) {
          createdCampaignId = newCampaign.id

          // Insert audience
          await service.from('campaign_audience').insert({
            campaign_id: newCampaign.id,
            age_min: campaignPayload.audience?.age_min ?? null,
            age_max: campaignPayload.audience?.age_max ?? null,
            gender: campaignPayload.audience?.gender ?? null,
            location: campaignPayload.audience?.location ?? null,
            interests: campaignPayload.audience?.interests ?? [],
          }).then(res => {
            if (res.error) console.warn('Audience insert skipped:', res.error.message)
          })

          // Insert creative
          await service.from('campaign_creatives').insert({
            campaign_id: newCampaign.id,
            headline: campaignPayload.creative?.headline ?? null,
            description: campaignPayload.creative?.description ?? null,
            cta_text: campaignPayload.creative?.cta_text ?? null,
            creative_assets: [],
          }).then(res => {
            if (res.error) console.warn('Creatives insert skipped:', res.error.message)
          })

          console.log(`✅ Campaign auto-created: ${newCampaign.id} — "${campaignPayload.title}"`)
        } else if (insertError) {
          console.error('Campaign auto-create failed:', insertError)
        }
      } catch (err) {
        console.error('Campaign auto-create error:', err)
      }
    }

    // ─── CLEAN RESPONSE (remove markers) ──────────────
    const cleanedResponse = responseContent
      .replace(/\[PHASE:\w+\]/g, '')
      .replace(/\[IMAGE_GEN:[^\]]*\]/g, '')
      .trim()

    // ─── RETURN ───────────────────────────────────────
    return NextResponse.json({
      response: cleanedResponse,
      phase: newPhase || currentPhase,
      campaignPayload: campaignPayload || null,
      createdCampaignId,
      generatedImages: generatedImages.length > 0 ? generatedImages : undefined,
      hasVisionSupport: hasImages,
    })
  } catch (error) {
    console.error('Campaign strategist error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
