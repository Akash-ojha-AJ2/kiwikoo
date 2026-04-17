/**
 * CAMPAIGNS API
 *
 * GET - List campaigns for authenticated brand (optional ?summary=true for dashboard stats)
 * POST - Create campaign (legacy simple or full multi-step payload)
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'
import type { CampaignCreateInput, CampaignGoal, BudgetType } from '@/lib/campaigns/types'

const legacyCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  goals: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
})

const fullCampaignSchema = z.object({
  goal: z.enum(['sales', 'awareness', 'launch', 'traffic']),
  title: z.string().min(1, 'Title is required'),
  audience: z.object({
    age_min: z.number().min(0).max(100).optional(),
    age_max: z.number().min(0).max(100).optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }),
  creative: z.object({
    product_id: z.string().uuid().optional(),
    headline: z.string().optional(),
    description: z.string().optional(),
    cta_text: z.string().optional(),
    creative_assets: z.array(z.string()).optional(),
  }),
  budget: z.object({
    budget_type: z.enum(['daily', 'lifetime']),
    daily_budget: z.number().min(0).optional(),
    total_budget: z.number().min(0).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }),
})

function ensureBrand(service: ReturnType<typeof createServiceClient>, userId: string) {
  return service.from('profiles').select('role').eq('id', userId).single()
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await ensureBrand(service, user.id)
    if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json([])
    }

    const url = new URL(request.url)
    const summaryOnly = url.searchParams.get('summary') === 'true'

    if (summaryOnly) {
      const { data: rows, error } = await service
        .from('campaigns')
        .select('impressions, clicks, conversions, spend, status')
        .eq('brand_id', user.id)
      if (error) {
        console.error('Campaign summary error:', error)
        return NextResponse.json({
          total_spend: 0,
          active_campaigns: 0,
          total_impressions: 0,
          total_conversions: 0,
        })
      }
      const total_spend = (rows || []).reduce((s, r) => s + (Number(r.spend) || 0), 0)
      const active_campaigns = (rows || []).filter((r) => r.status === 'active').length
      const total_impressions = (rows || []).reduce((s, r) => s + (Number(r.impressions) || 0), 0)
      const total_conversions = (rows || []).reduce((s, r) => s + (Number(r.conversions) || 0), 0)
      return NextResponse.json({
        total_spend,
        active_campaigns,
        total_impressions,
        total_conversions,
      })
    }

    const { data: campaigns, error } = await service
      .from('campaigns')
      .select('*')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Campaign fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    const list = campaigns || []
    const campaignIds = list.map((c: { id: string }) => c.id)

    let audienceByCampaign: Record<string, unknown> = {}
    let creativesByCampaign: Record<string, unknown> = {}

    if (campaignIds.length > 0) {
      const [audienceRes, creativesRes] = await Promise.all([
        service.from('campaign_audience').select('*').in('campaign_id', campaignIds),
        service.from('campaign_creatives').select('*').in('campaign_id', campaignIds),
      ])
      if (!audienceRes.error && audienceRes.data) {
        for (const row of audienceRes.data as { campaign_id: string }[]) {
          audienceByCampaign[row.campaign_id] = row
        }
      }
      if (!creativesRes.error && creativesRes.data) {
        for (const row of creativesRes.data as { campaign_id: string }[]) {
          creativesByCampaign[row.campaign_id] = row
        }
      }
    }

    const transformed = list.map((c: Record<string, unknown>) => ({
      id: c.id,
      brand_id: c.brand_id,
      title: c.title,
      brief: c.brief,
      strategy: c.strategy,
      status: c.status,
      goal: c.goal ?? null,
      budget_type: c.budget_type ?? null,
      budget: c.budget != null ? Number(c.budget) : null,
      daily_budget: c.daily_budget != null ? Number(c.daily_budget) : null,
      total_budget: c.total_budget != null ? Number(c.total_budget) : null,
      start_date: c.start_date ?? null,
      end_date: c.end_date ?? null,
      impressions: Number(c.impressions) || 0,
      clicks: Number(c.clicks) || 0,
      conversions: Number(c.conversions) || 0,
      spend: Number(c.spend) || 0,
      ctr: c.ctr != null ? Number(c.ctr) : null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      audience: audienceByCampaign[c.id as string] ?? null,
      creative: creativesByCampaign[c.id as string] ?? null,
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Campaign GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await ensureBrand(service, user.id)
    if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json({ error: 'Only brands can create campaigns' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const fullParsed = fullCampaignSchema.safeParse(body)
    if (fullParsed.success) {
      const input = fullParsed.data as CampaignCreateInput
      const brief = `Goal: ${input.goal}\nTitle: ${input.title}`
      const fullPayload = {
        brand_id: user.id,
        title: input.title,
        brief,
        strategy: { goal: input.goal },
        status: 'draft',
        goal: input.goal as CampaignGoal,
        budget_type: input.budget.budget_type as BudgetType,
        daily_budget: input.budget.daily_budget ?? null,
        total_budget: input.budget.total_budget ?? null,
        start_date: input.budget.start_date ?? null,
        end_date: input.budget.end_date ?? null,
      }
      const basePayload = {
        brand_id: user.id,
        title: input.title,
        brief,
        strategy: { goal: input.goal },
        status: 'draft',
      }

      let campaign: { id: string; title: string; brief: string; status: string; created_at: string }
      let campError: { code?: string } | null

      const result = await service
        .from('campaigns')
        .insert(fullPayload)
        .select()
        .single()
      campaign = result.data as typeof campaign
      campError = result.error as typeof campError

      if (campError?.code === 'PGRST204') {
        const fallback = await service
          .from('campaigns')
          .insert(basePayload)
          .select()
          .single()
        if (fallback.error) {
          console.error('Campaign insert error (fallback):', fallback.error)
          return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
        }
        campaign = fallback.data as typeof campaign
      } else if (campError) {
        console.error('Campaign insert error:', campError)
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
      }

      const audienceRes = await service.from('campaign_audience').insert({
        campaign_id: campaign.id,
        age_min: input.audience.age_min ?? null,
        age_max: input.audience.age_max ?? null,
        gender: input.audience.gender ?? null,
        location: input.audience.location ?? null,
        interests: input.audience.interests ?? [],
      })
      if (audienceRes.error) {
        console.warn('Campaign audience insert skipped (run brand_campaign_system migration if needed):', audienceRes.error.message)
      }

      const creativesRes = await service.from('campaign_creatives').insert({
        campaign_id: campaign.id,
        product_id: input.creative.product_id ?? null,
        headline: input.creative.headline ?? null,
        description: input.creative.description ?? null,
        cta_text: input.creative.cta_text ?? null,
        creative_assets: input.creative.creative_assets ?? [],
      })
      if (creativesRes.error) {
        console.warn('Campaign creatives insert skipped (run brand_campaign_system migration if needed):', creativesRes.error.message)
      }

      return NextResponse.json({
        id: campaign.id,
        title: campaign.title,
        brief: campaign.brief,
        status: campaign.status,
        created_at: campaign.created_at,
      })
    }

    const legacyParsed = legacyCampaignSchema.safeParse(body)
    if (!legacyParsed.success) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: legacyParsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, goals, targetAudience, budget, timeline } = legacyParsed.data
    const brief = `Campaign: ${title}\n\nGoals: ${goals?.join(', ') || 'Brand awareness'}\nTarget Audience: ${targetAudience || 'General'}\nBudget: ${budget ? `₹${budget}` : 'TBD'}\nTimeline: ${timeline || 'Flexible'}`

    const { data: campaign, error: insertError } = await service
      .from('campaigns')
      .insert({
        brand_id: user.id,
        title,
        brief,
        strategy: { goals, targetAudience, budget, timeline },
        status: 'draft',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Campaign insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json({
      id: campaign.id,
      title: campaign.title,
      brief: campaign.brief,
      status: campaign.status,
      createdAt: campaign.created_at,
    })
  } catch (error) {
    console.error('Campaign creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
