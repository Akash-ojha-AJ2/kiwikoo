/**
 * PROFILE API - SUPABASE ONLY
 * 
 * GET - Fetch user profile
 * PATCH - Update user name
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'
import { getGenerationTagFromDob, normalizeDateOfBirth } from '@/lib/profile-demographics'

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    dateOfBirth: z.string().trim().max(40).optional(),
  })
  .strict()

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { name, dateOfBirth } = updateProfileSchema.parse(body)
    const trimmedName = name?.trim()
    const normalizedDateOfBirth = normalizeDateOfBirth(dateOfBirth)

    if (!trimmedName && typeof dateOfBirth === 'undefined') {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    if (trimmedName) {
      console.log('[PROFILE PATCH] Updating name for user:', authUser.id, 'to:', trimmedName)
    }

    let updatedProfile: any = null

    if (trimmedName) {
      const { data: updated, error } = await service
        .from('profiles')
        .update({ full_name: trimmedName })
        .eq('id', authUser.id)
        .select()
        .single()

      if (error) {
        console.error('[PROFILE PATCH] Update error:', error)
        return NextResponse.json({ error: `Failed to update profile: ${error.message}` }, { status: 500 })
      }

      if (!updated) {
        console.error('[PROFILE PATCH] No profile found for user:', authUser.id)
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      updatedProfile = updated
    } else {
      const { data: existingProfile, error: existingProfileError } = await service
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single()

      if (existingProfileError || !existingProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      updatedProfile = existingProfile
    }

    if (typeof dateOfBirth !== 'undefined') {
      const { data: authLookup, error: authLookupError } = await service.auth.admin.getUserById(authUser.id)
      if (authLookupError) {
        console.error('[PROFILE PATCH] Failed to fetch auth metadata:', authLookupError)
        return NextResponse.json({ error: 'Failed to load profile metadata' }, { status: 500 })
      }

      const currentMetadata = (authLookup.user?.user_metadata || authUser.user_metadata || {}) as Record<string, unknown>
      const nextMetadata: Record<string, unknown> = {
        ...currentMetadata,
        date_of_birth: normalizedDateOfBirth,
        generation_tag: getGenerationTagFromDob(normalizedDateOfBirth),
      }

      const { error: metadataError } = await service.auth.admin.updateUserById(authUser.id, {
        user_metadata: nextMetadata,
      })

      if (metadataError) {
        console.error('[PROFILE PATCH] Failed to update demographics metadata:', metadataError)
        return NextResponse.json({ error: 'Failed to update date of birth' }, { status: 500 })
      }
    }

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.full_name,
        role: updatedProfile.role,
      }
    })
  } catch (error) {
    console.error('[PROFILE PATCH] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: authLookup } = await service.auth.admin.getUserById(authUser.id)
    const authMetadata = (authLookup.user?.user_metadata || authUser.user_metadata || {}) as Record<string, unknown>
    const dateOfBirth = normalizeDateOfBirth(authMetadata.date_of_birth)
    const generationTag = getGenerationTagFromDob(dateOfBirth)

    const { data: profile, error } = await service
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single<any>()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let influencerData = null
    if ((profile.role || '').toLowerCase() === 'influencer') {
      const { data: infProfile } = await service
        .from('influencer_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (infProfile) {
        influencerData = {
          id: infProfile.id,
          bio: infProfile.bio,
          niches: infProfile.niches || [],
          socials: infProfile.socials || {},
          audienceType: infProfile.audience_type || [],
          preferredCategories: infProfile.preferred_categories || [],
          followers: infProfile.followers,
          engagementRate: infProfile.engagement_rate,
          audienceRate: infProfile.audience_rate,
          retentionRate: infProfile.retention_rate,
          badgeTier: infProfile.badge_tier,
          badgeScore: infProfile.badge_score,
          gender: infProfile.gender,
          dateOfBirth,
          generationTag,
        }
      }
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.full_name,
        email: profile.email,
        role: (profile.role || 'influencer').toUpperCase(),
        createdAt: profile.created_at,
        influencerProfile: influencerData,
        subscription: {
          provider: profile.subscription_provider || null,
          role: profile.subscription_role || (profile.role || 'influencer').toLowerCase(),
          tier: profile.subscription_tier || null,
          status: profile.subscription_status || 'inactive',
          planId: profile.subscription_plan_id || null,
          currentPeriodEnd: profile.subscription_current_period_end || null,
          cancelAtPeriodEnd: Boolean(profile.subscription_cancel_at_period_end),
          hasCustomer: Boolean(profile.razorpay_customer_id),
          subscriptionId: profile.razorpay_subscription_id || null,
        },
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
