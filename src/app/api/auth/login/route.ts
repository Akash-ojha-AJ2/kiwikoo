/**
 * LOGIN API - SUPABASE ONLY
 *
 * Handles user login with Supabase Auth.
 * NO Prisma dependency - uses Supabase profiles table only.
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import {
  emailLocalPart,
  isEmailIdentifier,
  normalizeIdentifier,
  usernameToSyntheticEmail,
} from '@/lib/auth-username'

type SupabaseSessionClient = Awaited<ReturnType<typeof createClient>>
type SupabasePrivilegedClient = SupabaseSessionClient | ReturnType<typeof createServiceClient>

interface ProfileRow {
  id: string
  email: string | null
  role: string | null
  onboarding_completed: boolean | null
  approval_status: string | null
  full_name: string | null
  avatar_url: string | null
}

function getPrivilegedClient(supabase: SupabaseSessionClient): SupabasePrivilegedClient {
  try {
    return createServiceClient()
  } catch (serviceError) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set; falling back to session client for login profile fetch:', serviceError)
    return supabase
  }
}

function normalizeRole(rawRole: unknown): 'influencer' | 'brand' {
  const value = String(rawRole || '').trim().toLowerCase()
  return value === 'brand' ? 'brand' : 'influencer'
}

function buildFallbackProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): ProfileRow {
  const role = normalizeRole(user.user_metadata?.role)
  return {
    id: user.id,
    email: user.email || null,
    role,
    onboarding_completed: false,
    approval_status: role === 'brand' ? 'approved' : 'pending',
    full_name: (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || (user.email ? emailLocalPart(user.email) : null),
    avatar_url: null,
  }
}

async function signInByCandidates(
  supabase: SupabaseSessionClient,
  candidateEmails: string[],
  password: string
) {
  let lastError: { message?: string; status?: number } | null = null

  for (const email of candidateEmails) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      return { data, emailUsed: email, error: null }
    }
    lastError = error
  }

  return { data: null, emailUsed: null, error: lastError }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    const { identifier: rawIdentifier, password, rememberMe = true, portalRole } = loginSchema.parse(body)
    const identifier = normalizeIdentifier(rawIdentifier)

    const supabase = await createClient()
    let candidateEmails = isEmailIdentifier(identifier)
      ? [identifier]
      : []

    console.log('--- Login Candidate Lookup ---')
    console.log('Identifier:', identifier)

    // If it's a username, lookup the real email
    if (!isEmailIdentifier(identifier)) {
      try {
        const lookupClient = getPrivilegedClient(supabase)
        
        // A. First try the Profiles table (Application Database)
        const { data: profileMatch } = await lookupClient
          .from('profiles')
          .select('email, name')
          .ilike('name', identifier) 
          .maybeSingle()

        if (profileMatch?.email) {
          console.log('Found Email in profiles table:', profileMatch.email)
          candidateEmails.push(profileMatch.email)
        } else {
          // B. FALLBACK: Check Supabase Auth Metadata directly using Admin API
          console.log('Profile not found, checking Auth Metadata...')
          const { data: authUsers } = await lookupClient.auth.admin.listUsers()
          const matchedUser = authUsers.users.find(u => {
            const metadata = u.user_metadata || {}
            return (
              String(metadata.username || '').toLowerCase() === identifier.toLowerCase() ||
              String(metadata.name || '').toLowerCase() === identifier.toLowerCase() ||
              String(metadata.full_name || '').toLowerCase() === identifier.toLowerCase()
            )
          })
          
          if (matchedUser?.email) {
            console.log('Found Email in Auth Metadata:', matchedUser.email)
            candidateEmails.push(matchedUser.email)
          }
        }
        
        // Always try the synthetic fallback
        candidateEmails.push(usernameToSyntheticEmail(identifier))
      } catch (candidateLookupError) {
        console.warn('Username lookup failed:', candidateLookupError)
      }
    }


    console.log('Candidate Emails to try:', candidateEmails)

    const signInResult = await signInByCandidates(supabase, candidateEmails, password)



    void rememberMe

    if (!signInResult.data || !signInResult.data.user) {
      const error = signInResult.error
      const lowerMessage = (error?.message || '').toLowerCase()

      let errorMessage = 'Invalid username/email or password.'
      let statusCode = 401
      let errorCode:
        | 'USER_NOT_FOUND'
        | 'INVALID_PASSWORD'
        | 'INVALID_CREDENTIALS'
        | 'EMAIL_NOT_CONFIRMED'
        | 'RATE_LIMITED'
        | null = null

      if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('email_not_confirmed')) {
        errorMessage = 'Please verify your email address before signing in. Check your inbox for the confirmation link.'
        statusCode = 403
        errorCode = 'EMAIL_NOT_CONFIRMED'
      } else if (lowerMessage.includes('too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later.'
        statusCode = 429
        errorCode = 'RATE_LIMITED'
      } else if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
        errorMessage = 'Invalid username/email or password.'
        statusCode = 401
        errorCode = 'INVALID_CREDENTIALS'
      }

      return NextResponse.json(
        {
          error: errorMessage,
          errorCode,
          noUserFound: false,
        },
        { status: statusCode }
      )
    }

    const data = signInResult.data
    const email = signInResult.emailUsed || data.user.email || identifier

    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'Please verify your email address before signing in. Check your inbox for the confirmation link.',
          emailConfirmed: false,
          requiresEmailVerification: true,
        },
        { status: 403 }
      )
    }

    let isAdmin = false
    try {
      const { data: adminRow, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (!adminError && adminRow) {
        isAdmin = true
      }
    } catch (adminLookupError) {
      console.warn('Admin lookup skipped:', adminLookupError)
    }

    if (isAdmin) {
      return NextResponse.json(
        {
          user: {
            id: data.user.id,
            email,
            name: null,
            role: 'ADMIN',
            slug: 'admin',
          },
        },
        { status: 200 }
      )
    }

    // 1. Fetch Profile
    const profileClient = getPrivilegedClient(supabase)
    let profile: any = null

    try {
      const { data: fetchedProfile, error: fetchError } = await profileClient
        .from('profiles')
        .select('id, email, role, approval_status, name, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!fetchError && fetchedProfile) {
        profile = fetchedProfile
      }
    } catch (fetchError) {
      console.warn('Profile fetch failed during login:', fetchError)
    }

    // 2. Fallback if profile missing
    if (!profile) {
      const fallback = buildFallbackProfile(data.user)
      profile = fallback
    }

    const normalizedRole = (profile.role || 'influencer').toLowerCase()

    // 3. Fetch Onboarding Status from sub-profile
    let onboardingCompleted = false
    try {
      const table = normalizedRole === 'brand' ? 'BrandProfile' : 'InfluencerProfile'
      const { data: subProfile } = await profileClient
        .from(table)
        .select('onboardingCompleted')
        .eq(normalizedRole === 'brand' ? 'userId' : 'userId', data.user.id)
        .maybeSingle()
      
      onboardingCompleted = !!subProfile?.onboardingCompleted
    } catch (err) {
      console.warn('Sub-profile onboarding fetch failed:', err)
    }

    // 4. Update memory profile object for response
    profile.onboardingCompleted = onboardingCompleted



    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.full_name,
        role: normalizedRole.toUpperCase(),
        avatarUrl: profile.avatar_url,
        onboardingCompleted: Boolean(profile.onboardingCompleted),
        approvalStatus: profile.approval_status || 'none',
        influencerProfile: normalizedRole === 'influencer' ? {
          onboardingCompleted: Boolean(profile.onboardingCompleted),
        } : null,
        brandProfile: normalizedRole === 'brand' ? {
          onboardingCompleted: Boolean(profile.onboardingCompleted),
        } : null,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)


    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Please provide a valid username/email and password' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

