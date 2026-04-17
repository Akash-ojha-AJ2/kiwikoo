import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { calculateBadge } from '@/lib/influencer/badge-calculator'
import { z } from 'zod'

const schema = z.object({
  audienceRate: z.number().min(0).max(100),
  retentionRate: z.number().min(0).max(100),
}).strict()

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencer_profiles(*)')
      .eq('id', authUser.id)
      .single()

    const role = (profile?.role || '').toLowerCase()
    if (!profile || role !== 'influencer') {
      return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = schema.parse(body)

    const infProfile = profile.influencer_profiles || {}

    const badge = calculateBadge({
      followers: infProfile.followers ?? 0,
      engagementRate: Number(infProfile.engagement_rate ?? 0),
      audienceRate: data.audienceRate,
      retentionRate: data.retentionRate,
    })

    const { data: updated, error } = await supabase
      .from('influencer_profiles')
      .update({
        audience_rate: data.audienceRate,
        retention_rate: data.retentionRate,
        badge_score: badge.score,
        badge_tier: badge.tier,
      })
      .eq('id', authUser.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile: updated })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencer_profiles(*)')
      .eq('id', authUser.id)
      .single()

    // Note: It's okay if not influencer, we just check data
    const infProfile = profile?.influencer_profiles

    if (!infProfile) {
      return NextResponse.json({ error: 'Influencer profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        audienceRate: infProfile.audience_rate,
        retentionRate: infProfile.retention_rate,
        badgeScore: infProfile.badge_score,
        badgeTier: infProfile.badge_tier,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
