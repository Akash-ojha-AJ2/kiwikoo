/**
 * CAMPAIGN AI REFINEMENT API
 * POST /api/campaigns/[id]/refine
 *
 * Takes a user request + current strategy data → sends to AI → returns updated strategy
 * sections → saves to database immediately.
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { getOpenAI } from '@/lib/openai'

interface RouteParams { params: Promise<{ id: string }> }

const REFINE_SYSTEM_PROMPT = `You are an elite campaign strategist AI. You ONLY return valid JSON.

The user has a campaign strategy and wants to REFINE specific parts.

You will receive:
1. The current campaign strategy data (JSON)
2. The user's refinement request

Your job:
- Understand what the user wants to change
- Return ONLY updated fields as JSON wrapped in \`\`\`strategy_update fences
- Be strategic — actually IMPROVE the content, don't just rephrase
- Use real marketing frameworks and niche-specific language

## Available Fields (only include what changed)
- "positioning": string
- "content_angles": array of { "angle": string, "score": 1-10, "example": string, "format": string, "funnel_stage": "TOFU"|"MOFU"|"BOFU", "why_it_works": string }
- "hooks": array of { "text": string, "category": "curiosity"|"transformation"|"controversy"|"social_proof"|"urgency", "platform": string }
- "scripts": array of { "title": string, "body": string, "platform": string, "duration": string, "framework": "PAS"|"AIDA"|"BAB"|"Narrative Reframe", "score": 1-10 }
- "ab_variants": array of { "label": string, "description": string, "what_it_tests": string }
- "funnel": { "awareness": string, "consideration": string, "conversion": string }
- "headline": string, "description": string, "cta_text": string, "brief": string
- "summary": string (brief explanation shown to user)

## STRICT FORMAT — You MUST respond like this:
\`\`\`strategy_update
{ ...only changed fields... }
\`\`\`

Do NOT add markdown text, commentary, or explanations outside the JSON fence. ONLY the code fence block.`

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const openai = getOpenAI()
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const service = createServiceClient()
        const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
        if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Verify ownership
        const { data: campaign } = await service
            .from('campaigns')
            .select('id, brand_id, strategy, brief, title')
            .eq('id', id)
            .single()
        if (!campaign || campaign.brand_id !== user.id) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
        }

        // Get creative data
        const { data: creativeRow } = await service
            .from('campaign_creatives')
            .select('*')
            .eq('campaign_id', id)
            .maybeSingle()

        let body: { message?: unknown }
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }
        const userMessage: string =
            typeof body?.message === 'string' ? body.message.trim() : ''
        if (!userMessage) {
            return NextResponse.json({ error: 'Missing message' }, { status: 400 })
        }

        // Build current strategy context
        const strategy = (campaign.strategy ?? {}) as Record<string, unknown>
        const currentStrategy = {
            title: campaign.title,
            brief: campaign.brief,
            positioning: strategy.positioning,
            content_angles: strategy.content_angles,
            hooks: creativeRow?.hooks ?? strategy.hooks,
            scripts: creativeRow?.scripts ?? strategy.scripts,
            funnel: strategy.funnel,
            ab_variants: strategy.ab_variants,
            headline: creativeRow?.headline,
            description: creativeRow?.description,
            cta_text: creativeRow?.cta_text,
        }

        // Call AI
        const response = await openai.chat.completions.create({
            model: process.env.STRATEGIST_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: REFINE_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Campaign: "${campaign.title}"\n\n## Current Strategy\n\`\`\`json\n${JSON.stringify(currentStrategy, null, 2)}\n\`\`\`\n\n## What I Want Changed\n${userMessage}`,
                },
            ],
            temperature: 0.5,
            max_tokens: 4000,
        })

        const aiContent = response.choices[0]?.message?.content || ''

        // Parse the strategy_update block (with fallback)
        let rawJson: string | null = null
        const updateMatch = aiContent.match(/```strategy_update\s*([\s\S]*?)```/)
        if (updateMatch?.[1]) {
            rawJson = updateMatch[1].trim()
        } else {
            // Fallback: try to find any JSON object in the response
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
            if (jsonMatch) rawJson = jsonMatch[0].trim()
        }

        if (!rawJson) {
            return NextResponse.json({
                error: 'AI did not return a valid update. Please try rephrasing.',
                raw: aiContent,
            }, { status: 422 })
        }

        let updates: Record<string, unknown>
        try {
            updates = JSON.parse(rawJson)
        } catch {
            return NextResponse.json({
                error: 'AI returned invalid JSON. Please try again.',
                raw: rawJson,
            }, { status: 422 })
        }

        // Extract summary if present
        const summary = typeof updates.summary === 'string' ? updates.summary : 'Strategy updated by AI'
        delete updates.summary

        // Split updates into campaign strategy vs creative fields
        const strategyFields = ['positioning', 'content_angles', 'funnel', 'ab_variants']
        const creativeFields = ['hooks', 'scripts', 'headline', 'description', 'cta_text']
        const campaignFields = ['title', 'brief']

        const strategyUpdate: Record<string, unknown> = { ...strategy }
        const creativeUpdate: Record<string, unknown> = {}
        const campaignUpdate: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(updates)) {
            if (strategyFields.includes(key)) {
                strategyUpdate[key] = value
            } else if (creativeFields.includes(key)) {
                creativeUpdate[key] = value
            } else if (campaignFields.includes(key)) {
                campaignUpdate[key] = value
            }
        }

        // Update strategy in campaigns table
        const campaignPatch: Record<string, unknown> = {
            strategy: strategyUpdate,
            updated_at: new Date().toISOString(),
            ...campaignUpdate,
        }

        const { error: campaignErr } = await service.from('campaigns').update(campaignPatch).eq('id', id)
        if (campaignErr) {
            console.error('Campaign update failed:', campaignErr.message)
            return NextResponse.json({ error: 'Failed to save strategy updates' }, { status: 500 })
        }

        if (Object.keys(creativeUpdate).length > 0) {
            if (creativeRow) {
                const { error: creativeErr } = await service
                    .from('campaign_creatives')
                    .update(creativeUpdate)
                    .eq('campaign_id', id)
                if (creativeErr) {
                    console.error('Creative update failed:', creativeErr.message)
                }
            } else {
                const { error: insertErr } = await service
                    .from('campaign_creatives')
                    .insert({
                        campaign_id: id,
                        headline: null,
                        description: null,
                        cta_text: null,
                        creative_assets: [],
                        ...creativeUpdate,
                    })
                if (insertErr) {
                    console.error('Creative insert failed:', insertErr.message)
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary,
            updates,
        })
    } catch (error) {
        console.error('Campaign refine error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 },
        )
    }
}
