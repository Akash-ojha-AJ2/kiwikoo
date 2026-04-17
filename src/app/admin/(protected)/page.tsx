import { createServiceClient } from '@/lib/auth'
import AdminDashboardClient from '../AdminDashboardClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeStatus(value: unknown): 'none' | 'pending' | 'approved' | 'rejected' {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'none'
  if (normalized === 'pending' || normalized === 'approved' || normalized === 'rejected') return normalized
  return 'none'
}

function normalizeInfluencerProfile(value: any) {
  if (Array.isArray(value)) return value[0] || {}
  return value || {}
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function getReviewAudit(value: unknown) {
  const data = asObject(value)
  return {
    reviewed_at: typeof data.reviewed_at === 'string' ? data.reviewed_at : null,
    review_note: typeof data.review_note === 'string' ? data.review_note : null,
  }
}

export default async function AdminPage() {
  const service = createServiceClient()

  const { data: profiles, error } = await service
    .from('profiles')
    .select('*, influencer_profiles(*)')
    .or('role.eq.INFLUENCER,role.eq.influencer')
    .order('created_at', { ascending: false })

  if (error || !profiles) {
    console.error('ADMIN PAGE ERROR:', error)
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <p>Failed to load admin dashboard.</p>
        <pre className="text-red-500 mt-4 text-xs font-mono">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  const enrichedApplications = profiles.map((p: any) => {
    const inf = normalizeInfluencerProfile(p.influencer_profiles)
    const displayStatus = normalizeStatus(p.approval_status)
    const hasReviewStatus = displayStatus !== 'none'
    const onboardingCompleted = Boolean(
      p.onboarding_completed ??
      inf.onboarding_completed ??
      inf.onboardingCompleted ??
      hasReviewStatus
    )

    return {
      user_id: p.id,
      email: p.email,
      full_name: p.full_name,
      avatar_url: p.avatar_url || null,
      status: displayStatus,
      created_at: p.created_at,
      updated_at: p.updated_at,
      reviewed_at: getReviewAudit(p.influencer_data).reviewed_at,
      review_note: getReviewAudit(p.influencer_data).review_note,
      onboarding: {
        gender: inf.gender,
        niches: inf.niches,
        audienceType: inf.audience_type,
        preferredCategories: inf.preferred_categories,
        socials: inf.socials,
        bio: inf.bio,
        followers: inf.followers,
        engagementRate: inf.engagement_rate,
        audienceRate: inf.audience_rate,
        retentionRate: inf.retention_rate,
        badgeScore: inf.badge_score,
        badgeTier: inf.badge_tier,
        onboardingCompleted,
      },
      user: {
        id: p.id,
        email: p.email,
        name: p.full_name,
        role: p.role,
        createdAt: p.created_at,
      },
    }
  })

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-2">Admin Dashboard</h1>
            <p className="text-charcoal/60">Review influencer applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/?from=admin" className="px-5 py-2.5 rounded-full border border-charcoal/15 text-charcoal text-sm">Back to site</Link>
          </div>
        </div>
        <AdminDashboardClient initialApplications={enrichedApplications} dataSource="full" />
      </div>
    </div>
  )
}
