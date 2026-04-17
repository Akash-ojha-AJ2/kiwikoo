import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/auth'
import { findAuthUserByEmail } from '@/lib/supabase/admin-users'

const setupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(120).optional(),
  setupToken: z.string().min(10).max(256),
})

function timingSafeEqualString(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === 'production'
  const routeEnabled = process.env.ALLOW_ADMIN_SETUP_ROUTE === 'true'
  const allowInProd = process.env.ALLOW_ADMIN_SETUP_IN_PROD === 'true'

  // Hidden by default: do not expose this bootstrap route publicly.
  if (!routeEnabled || (isProd && !allowInProd)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const expectedToken = process.env.ADMIN_SETUP_TOKEN
  if (!expectedToken) {
    return NextResponse.json({ error: 'ADMIN_SETUP_TOKEN is not configured' }, { status: 500 })
  }

  try {
    const body = await request.json().catch(() => null)
    const parsed = setupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { email, password, name, setupToken } = parsed.data

    if (!timingSafeEqualString(setupToken, expectedToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    let userId: string | null = null
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || 'Admin User',
        role: 'admin',
      },
    })

    if (createError) {
      const msg = createError.message?.toLowerCase() || ''
      if (!msg.includes('already') || !msg.includes('register')) {
        return NextResponse.json({ error: createError.message || 'Failed to create auth user' }, { status: 500 })
      }

      const existing = await findAuthUserByEmail(service, email)
      if (!existing?.id) {
        return NextResponse.json({ error: 'Failed to resolve existing auth user' }, { status: 500 })
      }

      userId = existing.id
    } else {
      userId = created.user?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Failed to resolve user id' }, { status: 500 })
    }

    const { error: profileError } = await service
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          role: 'admin',
          approval_status: 'approved',
          onboarding_completed: true,
          full_name: name || 'Admin User',
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      return NextResponse.json({ error: `Profile upsert failed: ${profileError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user provisioned successfully',
      email,
      userId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
