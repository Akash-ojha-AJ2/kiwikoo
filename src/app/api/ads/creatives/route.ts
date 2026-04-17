/**
 * AD CREATIVES LIST API
 * 
 * GET - List all ad creatives for the authenticated brand
 * Uses Supabase only - NO Prisma
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export async function GET(request: Request) {
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

        // Verify brand role
        const { data: profile } = await service
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'brand') {
            return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
        }

        // Parse query params
        const url = new URL(request.url)
        const campaignId = url.searchParams.get('campaignId')
        const platform = url.searchParams.get('platform')
        const qualityMin = url.searchParams.get('qualityMin')
        const qualityMax = url.searchParams.get('qualityMax')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        // Build query
        let query = service
            .from('ad_creatives')
            .select('*')
            .eq('brand_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (campaignId) {
            if (campaignId === 'unassigned') {
                query = query.is('campaign_id', null)
            } else {
                query = query.eq('campaign_id', campaignId)
            }
        }

        if (platform) {
            query = query.eq('platform', platform)
        }

        const { data: creatives, error } = await query

        if (error) {
            console.error('Fetch creatives error:', error)
            return NextResponse.json({ error: 'Failed to fetch creatives' }, { status: 500 })
        }

        // Transform for frontend
        const transformedCreatives = (creatives || []).map(creative => {
            const prompt = typeof creative.prompt === 'string' ? creative.prompt : ''
            const sourceMatch = prompt.match(/\[source:([^\]]+)\]/i)
            const taskMatch = prompt.match(/\[task:([^\]]+)\]/i)
            const scopeMatch = prompt.match(/\[scope:([^\]]+)\]/i)
            const modelMatch = prompt.match(/\[model:([^\]]+)\]/i)
            const sourceAdId = sourceMatch?.[1] || null
            const editPrompt = /^INPAINT EDIT/i.test(prompt)
                ? prompt.replace(/^INPAINT EDIT(?:\s*\[[^\]]+\])*:\s*/i, '')
                : null

            return {
                id: creative.id,
                title: creative.title || 'Ad Creative',
                prompt,
                editPrompt,
                sourceAdId,
                editTask: taskMatch?.[1] || null,
                editScope: scopeMatch?.[1] || null,
                editModel: modelMatch?.[1] || null,
                isEdited: /^INPAINT EDIT/i.test(prompt),
                imageUrl: creative.image_url,
                qualityScore: creative.rating || 75,
                campaign: creative.campaign_id ? {
                    id: creative.campaign_id,
                    title: creative.title || 'Campaign',
                } : null,
                platforms: [creative.platform || 'instagram'],
                copyVariants: [],
                createdAt: creative.created_at,
                regenerationCount: 0,
                maxRegenerations: 5,
                stylePreset: null,
            }
        })

        // Filter by quality score if specified
        let filteredCreatives = transformedCreatives
        if (qualityMin || qualityMax) {
            const min = qualityMin ? parseInt(qualityMin) : 0
            const max = qualityMax ? parseInt(qualityMax) : 100
            filteredCreatives = transformedCreatives.filter(
                c => c.qualityScore >= min && c.qualityScore <= max
            )
        }

        return NextResponse.json({
            creatives: filteredCreatives,
            total: filteredCreatives.length,
            hasMore: (creatives || []).length === limit,
        })
    } catch (error) {
        console.error('Fetch creatives error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
