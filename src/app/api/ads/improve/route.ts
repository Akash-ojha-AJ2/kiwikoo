import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { z } from 'zod'
import { getOpenAI } from '@/lib/openai'

const improveSchema = z
  .object({
    adImage: z.string().min(1).max(15_000_000),
    productType: z.string().trim().max(80).optional(),
    niche: z.string().trim().max(80).optional(),
    audience: z.string().trim().max(80).optional(),
  })
  .strict()

interface ImproveSuggestion {
  category: 'lighting' | 'composition' | 'product_clarity' | 'background'
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  promptModifier: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const { adImage, productType, niche, audience } = improveSchema.parse(body)

    // Generate structured improvement suggestions using GPT-4 Vision
    const suggestions = await generateStructuredSuggestions(adImage, {
      productType,
      niche,
      audience,
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Ad improvement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateStructuredSuggestions(
  adImage: string,
  context: { productType?: string; niche?: string; audience?: string }
): Promise<ImproveSuggestion[]> {
  const openai = getOpenAI()

  const systemPrompt = `You are an expert advertising creative director analyzing ad images.
Your job is to identify specific, actionable improvements that can be made to enhance ad performance.

Return a JSON array of suggestions. Each suggestion must have:
- category: one of "lighting", "composition", "product_clarity", "background"
- suggestion: a clear, specific improvement (2-3 sentences max)
- priority: "high", "medium", or "low" based on impact
- promptModifier: a short phrase that can be added to an image generation prompt to implement this fix

Focus on:
1. LIGHTING - shadows, highlights, color temperature, contrast
2. COMPOSITION - framing, rule of thirds, visual hierarchy, focal point
3. PRODUCT_CLARITY - product visibility, color accuracy, detail, focus
4. BACKGROUND - distractions, simplicity, context appropriateness

Return 3-6 suggestions, prioritizing high-impact improvements.
Return ONLY valid JSON array, no markdown, no explanation.`

  const userPrompt = `Analyze this ad image and provide improvement suggestions.
${context.productType ? `Product type: ${context.productType}` : ''}
${context.niche ? `Brand niche: ${context.niche}` : ''}
${context.audience ? `Target audience: ${context.audience}` : ''}`

  try {
    // Handle both URL and base64 image formats
    const imageUrl = adImage.startsWith('http')
      ? adImage
      : adImage.startsWith('data:')
        ? adImage
        : `data:image/jpeg;base64,${adImage}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || '[]'

    // Parse JSON response
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
    const suggestions = JSON.parse(cleanContent) as ImproveSuggestion[]

    // Validate and filter suggestions
    return suggestions
      .filter(s =>
        ['lighting', 'composition', 'product_clarity', 'background'].includes(s.category) &&
        ['high', 'medium', 'low'].includes(s.priority) &&
        s.suggestion &&
        s.promptModifier
      )
      .slice(0, 6)
  } catch (error) {
    console.error('Failed to generate suggestions:', error)

    // Return default suggestions if AI fails
    return [
      {
        category: 'lighting',
        suggestion: 'Consider adding softer ambient lighting to reduce harsh shadows and create a more inviting atmosphere.',
        priority: 'medium',
        promptModifier: 'with soft diffused lighting and gentle shadows',
      },
      {
        category: 'composition',
        suggestion: 'Adjust framing to follow the rule of thirds for better visual balance.',
        priority: 'medium',
        promptModifier: 'with rule of thirds composition and balanced framing',
      },
      {
        category: 'product_clarity',
        suggestion: 'Ensure the product is the clear focal point with accurate colors and sharp details.',
        priority: 'high',
        promptModifier: 'with product as clear focal point and accurate color reproduction',
      },
    ]
  }
}
