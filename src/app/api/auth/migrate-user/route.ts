import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

/**
 * Migration endpoint to sync existing Supabase Auth users to Supabase Profiles
 * This helps users who were created in Supabase Auth but missing a Profile
 * 
 * Usage: POST /api/auth/migrate-user
 * Body: { name?: string }
 */
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
    if (!body) {
      return NextResponse.json({ error: 'Request body required' }, { status: 400 })
    }

    const { name } = body

    const metadataRole = String(authUser.user_metadata?.role || '').trim().toUpperCase()
    if (!['INFLUENCER', 'BRAND'].includes(metadataRole)) {
      return NextResponse.json({ error: 'Unable to determine account role' }, { status: 400 })
    }

    const email = authUser.email!.toLowerCase().trim()
    const service = createServiceClient()

    // Check if profile already exists
    const { data: existing } = await service
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        user: existing,
        message: 'Profile already exists'
      })
    }

    // Create profile
    const { data: profile, error: createError } = await service
      .from('profiles')
      .insert({
        id: authUser.id,
        email,
        role: metadataRole.toLowerCase(),
        full_name: name?.trim() || null,
        onboarding_completed: false,
        approval_status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Create role-specific profile
    if (metadataRole === 'INFLUENCER') {
      try {
        await service.from('influencer_profiles').upsert({
          user_id: authUser.id,
          niches: [],
          socials: {},
        })
      } catch (e) {
        console.error('Failed to create influencer profile:', e)
      }
    } else if (metadataRole === 'BRAND') {
      // Assuming brand_profiles or similar logic (currently handled in profiles.brand_data)
      // Checks implementation if brand_profiles table exists - for now assuming JSONB in profiles logic from other files
    }

    return NextResponse.json({
      user: profile,
      message: 'User migrated successfully to Supabase Profiles'
    })
  } catch (error) {
    console.error('User migration error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
