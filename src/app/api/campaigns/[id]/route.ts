/**
 * CAMPAIGN BY ID API
 * GET - Single campaign with audience and creative
 * PUT - Update campaign (and optional audience/creative)
 * DELETE - Delete campaign (cascade audience & creatives)
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

interface RouteParams { params: Promise<{ id: string }> }

async function ensureBrandCampaign(service: ReturnType<typeof createServiceClient>, campaignId: string, userId: string) {
  const { data: campaign, error } = await service
    .from('campaigns')
    .select('id, brand_id')
    .eq('id', campaignId)
    .single()
  if (error || !campaign) return { campaign: null, error }
  if (campaign.brand_id !== userId) return { campaign: null, error: new Error('Forbidden') }
  return { campaign, error: null }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
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

    const { campaign, error: authErr } = await ensureBrandCampaign(service, id, user.id)
    if (authErr || !campaign) {
      if (authErr && (authErr as Error).message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const { data: row, error } = await service
      .from('campaigns')
      .select(`
        *,
        campaign_audience(*),
        campaign_creatives(*)
      `)
      .eq('id', id)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const c = row as Record<string, unknown>
    const audience = Array.isArray(c.campaign_audience) ? c.campaign_audience[0] ?? null : c.campaign_audience ?? null
    const creative = Array.isArray(c.campaign_creatives) ? c.campaign_creatives[0] ?? null : c.campaign_creatives ?? null

    return NextResponse.json({
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
      impressions: Number(c.impressions) ?? 0,
      clicks: Number(c.clicks) ?? 0,
      conversions: Number(c.conversions) ?? 0,
      spend: Number(c.spend) ?? 0,
      ctr: c.ctr != null ? Number(c.ctr) : null,
      created_at: c.created_at,
      updated_at: c.updated_at,
      audience,
      creative,
    })
  } catch (error) {
    console.error('Campaign GET [id] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
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

    const { error: authErr } = await ensureBrandCampaign(service, id, user.id)
    if (authErr) {
      if ((authErr as Error).message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const campaignPayload: Record<string, unknown> = {}
    if (body.title !== undefined) campaignPayload.title = body.title
    if (body.brief !== undefined) campaignPayload.brief = body.brief
    if (body.status !== undefined) campaignPayload.status = body.status
    if (body.goal !== undefined) campaignPayload.goal = body.goal
    if (body.budget_type !== undefined) campaignPayload.budget_type = body.budget_type
    if (body.daily_budget !== undefined) campaignPayload.daily_budget = body.daily_budget
    if (body.total_budget !== undefined) campaignPayload.total_budget = body.total_budget
    if (body.start_date !== undefined) campaignPayload.start_date = body.start_date
    if (body.end_date !== undefined) campaignPayload.end_date = body.end_date
    campaignPayload.updated_at = new Date().toISOString()

    if (Object.keys(campaignPayload).length > 1) {
      const { error: upErr } = await service.from('campaigns').update(campaignPayload).eq('id', id).eq('brand_id', user.id)
      if (upErr) return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    if (body.audience && typeof body.audience === 'object') {
      await service.from('campaign_audience').upsert({
        campaign_id: id,
        age_min: body.audience.age_min ?? null,
        age_max: body.audience.age_max ?? null,
        gender: body.audience.gender ?? null,
        location: body.audience.location ?? null,
        interests: body.audience.interests ?? [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'campaign_id' })
    }
    if (body.creative && typeof body.creative === 'object') {
      await service.from('campaign_creatives').upsert({
        campaign_id: id,
        product_id: body.creative.product_id ?? null,
        headline: body.creative.headline ?? null,
        description: body.creative.description ?? null,
        cta_text: body.creative.cta_text ?? null,
        creative_assets: body.creative.creative_assets ?? [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'campaign_id' })
    }

    const { data: updated } = await service.from('campaigns').select('*').eq('id', id).single()
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Campaign PUT error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { error: authErr } = await ensureBrandCampaign(service, id, user.id)
    if (authErr) {
      if ((authErr as Error).message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const { error: delErr } = await service.from('campaigns').delete().eq('id', id).eq('brand_id', user.id)
    if (delErr) return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaign DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
