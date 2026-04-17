import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type NormalizedInfluencerProfile = {
  bio?: string | null
  followers?: number | null
  engagement_rate?: number | null
  niches?: string[] | null
}

function normalizeInfluencerProfile(value: any): NormalizedInfluencerProfile {
  if (Array.isArray(value)) return (value[0] || {}) as NormalizedInfluencerProfile
  return (value || {}) as NormalizedInfluencerProfile
}

function normalizeRole(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function normalizeStatus(value: unknown) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function normalizeEngagementRate(value: unknown) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric) || numeric <= 0) return '0.00'

  // Stored values are typically fractions like 0.0401; convert to percent for this UI.
  const percent = numeric <= 1 ? numeric * 100 : numeric
  return percent.toFixed(2)
}

function resolveDisplayName(profile: any) {
  if (typeof profile?.full_name === 'string' && profile.full_name.trim()) return profile.full_name.trim()
  if (typeof profile?.email === 'string' && profile.email.includes('@')) return profile.email.split('@')[0]
  if (typeof profile?.email === 'string' && profile.email.trim()) return profile.email.trim()
  return 'Influencer'
}

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

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if ((requesterProfile?.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const niche = searchParams.get('niche')?.trim() || ''
    const minFollowers = parseInt(searchParams.get('minFollowers') || '0', 10)
    const maxFollowers = parseInt(searchParams.get('maxFollowers') || '999999999', 10)
    const sortBy = searchParams.get('sortBy') || 'followers'
    const order = searchParams.get('order') || 'desc'

    const service = createServiceClient()

    const { data: profiles, error: profilesError } = await service
      .from('profiles')
      .select('id, email, full_name, role, onboarding_completed, approval_status, created_at, avatar_url, influencer_profiles(*)')
      .or('role.eq.INFLUENCER,role.eq.influencer')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 })
    }

    const influencers = (profiles || [])
      .map((profile: any) => {
        const influencerProfile = normalizeInfluencerProfile(profile.influencer_profiles)
        const role = normalizeRole(profile.role)
        const approvalStatus = normalizeStatus(profile.approval_status)
        const onboardingCompleted = Boolean(
          profile.onboarding_completed ??
          (influencerProfile as any)?.onboarding_completed ??
          (influencerProfile as any)?.onboardingCompleted ??
          false
        )

        if (role !== 'influencer' || approvalStatus !== 'approved' || !onboardingCompleted) {
          return null
        }

        const niches = Array.isArray(influencerProfile.niches)
          ? influencerProfile.niches.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : []

        const followers = Math.max(0, Number(influencerProfile.followers ?? 0) || 0)

        return {
          id: profile.id,
          email: profile.email || '',
          name: resolveDisplayName(profile),
          bio: influencerProfile.bio?.trim() || 'Content Creator',
          followers,
          engagement_rate: normalizeEngagementRate(influencerProfile.engagement_rate),
          niches,
          profile_image: profile.avatar_url || null,
          approved_at: profile.created_at,
        }
      })
      .filter(Boolean) as Array<{
        id: string
        email: string
        name: string
        bio: string
        followers: number
        engagement_rate: string
        niches: string[]
        profile_image: string | null
        approved_at: string
      }>

    let filtered = influencers

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((influencer) => {
        return (
          influencer.name.toLowerCase().includes(searchLower) ||
          influencer.email.toLowerCase().includes(searchLower) ||
          influencer.bio.toLowerCase().includes(searchLower) ||
          influencer.niches.some((entry) => entry.toLowerCase().includes(searchLower))
        )
      })
    }

    if (niche) {
      const nicheLower = niche.toLowerCase()
      filtered = filtered.filter((influencer) =>
        influencer.niches.some((entry) => entry.toLowerCase() === nicheLower)
      )
    }

    if (minFollowers > 0) {
      filtered = filtered.filter((influencer) => influencer.followers >= minFollowers)
    }

    if (maxFollowers < 999999999) {
      filtered = filtered.filter((influencer) => influencer.followers <= maxFollowers)
    }

    filtered.sort((a, b) => {
      if (sortBy === 'engagement') {
        const aRate = Number(a.engagement_rate)
        const bRate = Number(b.engagement_rate)
        return order === 'desc' ? bRate - aRate : aRate - bRate
      }

      if (sortBy === 'followers') {
        return order === 'desc' ? b.followers - a.followers : a.followers - b.followers
      }

      return 0
    })

    return NextResponse.json({ influencers: filtered })
  } catch (error) {
    console.error('Influencers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
