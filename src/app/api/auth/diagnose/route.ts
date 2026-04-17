import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { findAuthUserByEmail } from '@/lib/supabase/admin-users'

function getMailDiagnostics() {
  const smtpHost = process.env.SMTP_HOST?.trim() || ''
  const smtpPort = process.env.SMTP_PORT?.trim() || ''
  const smtpUser = process.env.SMTP_USER?.trim() || ''
  const smtpPass = process.env.SMTP_PASS || ''
  const resendKey = process.env.RESEND_API_KEY?.trim() || ''
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || null

  return {
    smtp: {
      configured: Boolean(smtpHost && smtpPort && smtpUser && smtpPass),
      host: smtpHost || null,
      port: smtpPort || null,
      userConfigured: Boolean(smtpUser),
      secure: process.env.SMTP_SECURE === 'true' || smtpPort === '465',
    },
    resend: {
      configured: Boolean(resendKey),
    },
    fallback: {
      supabaseAuthEmailsAvailable: true,
    },
    fromEmail,
  }
}

export async function GET() {
  if (process.env.ENABLE_DEBUG_AUTH_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if ((actorProfile?.role || '').toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const requestUrl = new URL(authUser.email || 'https://example.com')
    void requestUrl

    const service = createServiceClient()
    const email = authUser.email?.trim().toLowerCase() || null

    let subjectUser = null
    let subjectProfile = null

    if (email) {
      subjectUser = await findAuthUserByEmail(service, email)
      const { data: profile } = await service
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      subjectProfile = profile || null
    }

    return NextResponse.json({
      actor: {
        email,
        role: actorProfile?.role || null,
      },
      mail: getMailDiagnostics(),
      authUser: subjectUser
        ? {
            exists: true,
            id: subjectUser.id,
            emailConfirmed: Boolean(subjectUser.email_confirmed_at),
            lastSignIn: subjectUser.last_sign_in_at || null,
          }
        : {
            exists: false,
          },
      profile: subjectProfile
        ? {
            exists: true,
            id: subjectProfile.id,
            role: subjectProfile.role || null,
            onboardingCompleted: Boolean(subjectProfile.onboarding_completed),
            approvalStatus: subjectProfile.approval_status || null,
          }
        : {
            exists: false,
          },
    })
  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (process.env.ENABLE_DEBUG_AUTH_ENDPOINTS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if ((actorProfile?.role || '').toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body || !body.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const email = String(body.email).trim().toLowerCase()
    const service = createServiceClient()

    const supabaseUser = await findAuthUserByEmail(service, email)

    const { data: profile } = await service
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    let influencerProfile = null
    if (profile && (profile.role || '').toLowerCase() === 'influencer') {
      const { data: ip } = await service
        .from('influencer_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle()
      influencerProfile = ip
    }

    return NextResponse.json({
      email,
      mail: getMailDiagnostics(),
      supabaseAuth: {
        exists: !!supabaseUser,
        userId: supabaseUser?.id || null,
        emailConfirmed: !!supabaseUser?.email_confirmed_at,
        createdAt: supabaseUser?.created_at || null,
        lastSignIn: supabaseUser?.last_sign_in_at || null,
      },
      profile: {
        exists: !!profile,
        userId: profile?.id || null,
        role: profile?.role || null,
        onboardingCompleted: profile?.onboarding_completed || false,
        approvalStatus: profile?.approval_status || null,
      },
      influencerProfile,
      status: {
        inAuth: !!supabaseUser,
        inProfile: !!profile,
        emailConfirmed: !!supabaseUser?.email_confirmed_at,
        needsProfile: !!supabaseUser && !profile,
        canLogin: !!supabaseUser && !!profile,
      },
    })
  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
