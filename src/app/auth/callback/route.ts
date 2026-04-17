import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

type SupportedRole = 'brand' | 'influencer'

function normalizeRole(value: unknown): SupportedRole | null {
  if (typeof value !== 'string') return null
  const role = value.trim().toLowerCase()
  if (role === 'brand' || role === 'influencer') return role
  return null
}

function sanitizeNextPath(next: string | null): string {
  if (!next) return '/marketplace'
  const value = next.trim()

  // Allow only app-internal absolute paths.
  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/marketplace'
  }

  if (value.includes('\r') || value.includes('\n')) {
    return '/marketplace'
  }

  return value
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNextPath(searchParams.get('next'))
  const roleFromQuery = normalizeRole(searchParams.get('role'))

  if (!code) {
    const missingCodeUrl = new URL('/login', request.nextUrl)
    missingCodeUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(missingCodeUrl)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data?.user) {
    console.error('OAuth Callback Error:', error)
    const errorUrl = new URL('/login', request.nextUrl)
    errorUrl.searchParams.set('error', 'oauth_failed')
    return NextResponse.redirect(errorUrl)
  }

  const fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''
  const roleFromMetadata = normalizeRole(data.user.user_metadata?.role)
  const roleHint: SupportedRole = roleFromQuery || roleFromMetadata || 'influencer'

  const service = createServiceClient()
  const { data: existingProfile, error: existingProfileError } = await service
    .from('profiles')
    .select('id, role, onboarding_completed, approval_status, full_name')
    .eq('id', data.user.id)
    .maybeSingle()

  if (existingProfileError) {
    console.error('[AUTH CALLBACK] Failed to fetch existing profile:', existingProfileError)
  }

  const existingRole = normalizeRole(existingProfile?.role)

  if (existingRole && roleFromQuery && existingRole !== roleFromQuery) {
    await supabase.auth.signOut()

    const mismatchUrl = new URL('/login', request.nextUrl)
    mismatchUrl.searchParams.set('from', roleFromQuery)
    mismatchUrl.searchParams.set('error', 'role_mismatch')
    mismatchUrl.searchParams.set('requested', roleFromQuery)
    mismatchUrl.searchParams.set('actual', existingRole)
    return NextResponse.redirect(mismatchUrl)
  }

  const profilePayload: Record<string, unknown> = {
    id: data.user.id,
    email: data.user.email,
  }

  let shouldPersistProfile = !existingProfile

  if (fullName && (!existingProfile?.full_name || `${existingProfile.full_name}`.trim().length === 0)) {
    profilePayload.full_name = fullName
    shouldPersistProfile = true
  }

  // Only assign role when profile is new or currently missing/invalid.
  // Never overwrite an already valid role on login.
  if (!existingRole) {
    profilePayload.role = roleHint
    profilePayload.approval_status = roleHint === 'influencer' ? 'pending' : 'approved'
    if (!existingProfile) {
      profilePayload.onboarding_completed = false
    }
    shouldPersistProfile = true
  }

  if (shouldPersistProfile) {
    const { error: profileError } = await service.from('profiles').upsert(profilePayload, {
      onConflict: 'id',
    })

    if (profileError) {
      console.error('[AUTH CALLBACK] Profile upsert error:', profileError)
    }
  }

  if ((existingRole || roleHint) === 'influencer') {
    const { error: influencerProfileError } = await service
      .from('influencer_profiles')
      .upsert(
        {
          user_id: data.user.id,
          niches: [],
          socials: {},
        },
        { onConflict: 'user_id' }
      )

    if (influencerProfileError) {
      console.error('[AUTH CALLBACK] Influencer profile scaffold error:', influencerProfileError)
    }
  }

  const redirectUrl = new URL(next, request.nextUrl)
  return NextResponse.redirect(redirectUrl)
}
