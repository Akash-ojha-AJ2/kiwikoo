import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/supabase-email'
import { getPublicSiteUrlFromRequest, joinPublicUrl } from '@/lib/site-url'
import { buildInfluencerRejectionEmail } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const updateSchema = z
  .object({
    user_id: z.string().uuid(),
    status: z.enum(['approved', 'rejected']),
    review_note: z.string().trim().max(2000).nullable().optional(),
  })
  .strict()

const metricsUpdateSchema = z
  .object({
    user_id: z.string().uuid(),
    followers: z.number().int().min(0).max(500000000).optional(),
    engagementRate: z.number().min(0).max(1).nullable().optional(),
    audienceRate: z.number().min(0).max(1000).nullable().optional(),
    retentionRate: z.number().min(0).max(100).nullable().optional(),
    badgeTier: z.enum(['platinum', 'gold', 'silver', 'bronze']).nullable().optional(),
    badgeScore: z.number().min(0).max(100).nullable().optional(),
  })
  .strict()

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
    reviewedAt: typeof data.reviewed_at === 'string' ? data.reviewed_at : null,
    reviewNote: typeof data.review_note === 'string' ? data.review_note : null,
  }
}

function buildApprovalEmail(baseUrl: string, recipientName?: string | null) {
  const dashboardUrl = joinPublicUrl(baseUrl, '/dashboard')
  const safeName = recipientName?.trim() || 'Creator'

  return {
    subject: 'Your Kiwikoo account is now approved',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
        <div style="display:inline-block;padding:8px 14px;border:3px solid #111;border-radius:999px;background:#B4F056;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">
          Kiwikoo Approval
        </div>
        <h1 style="font-size:32px;line-height:1.05;margin:24px 0 12px;">You are approved, ${safeName}.</h1>
        <p style="font-size:16px;line-height:1.7;color:#444;margin:0 0 18px;">
          Your influencer account has been reviewed and approved. You can now access your dashboard, create try-ons, and start collaborating on Kiwikoo.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;padding:14px 20px;border:3px solid #111;border-radius:16px;background:#FF8C69;color:#111;text-decoration:none;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">
          Open Dashboard
        </a>
        <p style="font-size:13px;line-height:1.6;color:#666;margin-top:24px;">
          If the button does not work, use this link:<br />
          <a href="${dashboardUrl}" style="color:#111;">${dashboardUrl}</a>
        </p>
      </div>
    `,
    text: `Your Kiwikoo influencer account is approved. Open your dashboard here: ${dashboardUrl}`,
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', authUser.id).single()
    if ((profile?.role || '').toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

    const { data: profiles, error } = await service
      .from('profiles')
      .select('*, influencer_profiles(*)')
      .or('role.eq.INFLUENCER,role.eq.influencer')
      .order('created_at', { ascending: order === 'asc' })

    if (error) throw error

    const enriched = (profiles || []).map((p: any) => {
      const inf = normalizeInfluencerProfile(p.influencer_profiles)
      const displayStatus = normalizeStatus(p.approval_status)
      const hasReviewStatus = displayStatus !== 'none'
      const onboardingCompleted = Boolean(
        p.onboarding_completed ??
        inf.onboarding_completed ??
        inf.onboardingCompleted ??
        hasReviewStatus
      )

      if (statusFilter && statusFilter !== 'none' && statusFilter !== displayStatus) {
        return null
      }

      return {
        user_id: p.id,
        email: p.email,
        full_name: p.full_name,
        avatar_url: p.avatar_url || null,
        status: displayStatus,
        created_at: p.created_at,
        updated_at: p.updated_at,
        reviewed_at: getReviewAudit(p.influencer_data).reviewedAt,
        review_note: getReviewAudit(p.influencer_data).reviewNote,
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
          portfolioVisibility: inf.portfolio_visibility,
        },
        user: {
          id: p.id,
          email: p.email,
          name: p.full_name,
          role: p.role,
          createdAt: p.created_at,
        },
      }
    }).filter(Boolean)

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Admin influencer list error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: admin } = await service.from('profiles').select('role').eq('id', authUser.id).single()
    if ((admin?.role || '').toLowerCase() !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()

    if (typeof body?.status === 'string') {
      const { user_id, status, review_note } = updateSchema.parse(body)
      const approvalStatus = status === 'approved' ? 'approved' : 'rejected'

      const { data: targetProfile, error: targetProfileError } = await service
        .from('profiles')
        .select('email, full_name, influencer_data')
        .eq('id', user_id)
        .maybeSingle()

      if (targetProfileError) {
        console.warn('Failed to fetch influencer profile for approval email:', targetProfileError)
      }

      const reviewedAt = new Date().toISOString()
      const nextInfluencerData = {
        ...asObject(targetProfile?.influencer_data),
        reviewed_at: reviewedAt,
        review_note: review_note?.trim() || null,
        last_review_status: approvalStatus,
      }

      const { data, error } = await service
        .from('profiles')
        .update({
          approval_status: approvalStatus,
          ...(approvalStatus === 'approved' ? { onboarding_completed: true } : {}),
          influencer_data: nextInfluencerData,
        })
        .eq('id', user_id)
        .select()
        .single()

      if (error) throw error

      if (targetProfile?.email) {
        try {
          const baseUrl = getPublicSiteUrlFromRequest(request)
          const template =
            approvalStatus === 'approved'
              ? buildApprovalEmail(baseUrl, targetProfile.full_name)
              : buildInfluencerRejectionEmail({
                name: targetProfile.full_name,
                baseUrl,
                reviewNote: review_note,
              })

          await sendEmail({
            to: targetProfile.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        } catch (emailError) {
          console.warn(`Failed to send influencer ${approvalStatus} email:`, emailError)
        }
      }

      return NextResponse.json(data)
    }

    const parsed = metricsUpdateSchema.parse(body)
    const profileUpdate: Record<string, unknown> = {}
    if (parsed.followers !== undefined) profileUpdate.followers = parsed.followers
    if (parsed.engagementRate !== undefined) profileUpdate.engagement_rate = parsed.engagementRate
    if (parsed.audienceRate !== undefined) profileUpdate.audience_rate = parsed.audienceRate
    if (parsed.retentionRate !== undefined) profileUpdate.retention_rate = parsed.retentionRate
    if (parsed.badgeTier !== undefined) profileUpdate.badge_tier = parsed.badgeTier
    if (parsed.badgeScore !== undefined) profileUpdate.badge_score = parsed.badgeScore

    if (Object.keys(profileUpdate).length === 0) {
      return NextResponse.json({ error: 'No metric fields provided' }, { status: 400 })
    }

    const { data, error } = await service
      .from('influencer_profiles')
      .update(profileUpdate)
      .eq('user_id', parsed.user_id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, influencerProfile: data })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    console.error('Admin influencer PATCH error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
