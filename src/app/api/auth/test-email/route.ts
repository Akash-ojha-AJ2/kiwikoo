import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createServiceClient } from '@/lib/auth'

/**
 * Test endpoint to check email configuration.
 * PRODUCTION SAFETY:
 * - Disabled by default (ENABLE_DEBUG_AUTH_ENDPOINTS=true to enable)
 * - Requires authenticated admin user
 */
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

    const config = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    }

    const tempPassword = `${crypto.randomBytes(12).toString('base64url')}Aa1!`

    const { error } = await service.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,
      options: {
        redirectTo: `${config.siteUrl}/auth/confirm?next=/login?confirmed=true`,
      },
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        config,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email generation request submitted',
      config,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
