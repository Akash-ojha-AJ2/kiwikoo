import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/auth'
import crypto from 'crypto'
import { findAuthUserByEmail, findAuthUserById } from '@/lib/supabase/admin-users'

const schema = z
  .object({
    code: z.string().min(6).max(128),
    user_id: z.string().uuid().optional(),
    email: z.string().trim().toLowerCase().email().max(320).optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .strict()
  .refine(
    (data) => data.user_id || (data.email && data.password),
    { message: 'Provide user_id or email + password' }
  )

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function getProjectRefFromUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname // e.g. abcdefg.supabase.co
    const ref = host.split('.')[0]
    return ref || null
  } catch {
    return null
  }
}

function isRouteEnabled(): boolean {
  const isProd = process.env.NODE_ENV === 'production'
  const routeEnabled = process.env.ALLOW_ADMIN_SETUP_ROUTE === 'true'
  const allowInProd = process.env.ALLOW_ADMIN_SETUP_IN_PROD === 'true'
  return routeEnabled && (!isProd || allowInProd)
}

function isSameOriginRequest(request: Request): boolean {
  const requestUrl = new URL(request.url)
  const allowedOrigin = requestUrl.origin
  const candidate = request.headers.get('origin') || request.headers.get('referer')
  if (!candidate) return false

  try {
    return new URL(candidate).origin === allowedOrigin
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    if (!isRouteEnabled()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const signupCode = process.env.ADMIN_SIGNUP_CODE
    if (!signupCode) {
      return NextResponse.json(
        { error: 'Admin bootstrap is not configured' },
        { status: 500 }
      )
    }

    // These must all point to the SAME Supabase project for admin provisioning to work.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase public env vars are not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null)
    const { user_id, email, password, code } = schema.parse(body)

    if (!safeEqual(code, signupCode)) {
      return NextResponse.json({ error: 'Invalid admin signup code' }, { status: 403 })
    }

    // Verify service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Admin bootstrap is not configured' },
        { status: 500 }
      )
    }

    const service = createServiceClient()

    // Verify environment variables are from the same project
    const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const publicRef = getProjectRefFromUrl(publicUrl)

    // Test service role connection by trying to list users (limited to 1)
    let serviceRoleWorks = false
    try {
      const { data: testData, error: testError } = await service.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      })
      serviceRoleWorks = !testError && testData !== null
    } catch (testErr) {
      console.warn('Service role connection test failed:', testErr)
    }

    let resolvedUserId = user_id || null
    const normalizedEmail = email?.trim().toLowerCase()

    // If no user_id provided, create the admin user via service role
    if (!resolvedUserId && normalizedEmail && password) {
      const { data: created, error: createError } = await service.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      })

      if (createError) {
        // If user already exists, try to find them by email
        if (
          createError.message?.toLowerCase().includes('already registered') ||
          createError.message?.toLowerCase().includes('already exists')
        ) {
          try {
            const existing = normalizedEmail
              ? await findAuthUserByEmail(service, normalizedEmail)
              : null
            if (existing?.id) {
              resolvedUserId = existing.id
            }
          } catch (listErr) {
            console.warn('Failed to find existing admin user by email:', listErr)
          }
        }

        if (!resolvedUserId) {
          return NextResponse.json(
            { error: createError.message || 'Failed to create admin user' },
            { status: 400 }
          )
        }
      } else if (created?.user?.id) {
        resolvedUserId = created.user.id
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json(
        { error: 'Admin user could not be created or found.' },
        { status: 500 }
      )
    }

    // Try multiple approaches to verify user exists and get user data
    // Approach 1: Try getUserById (most direct)
    // Approach 2: Try listing users and finding by email (if we have email from frontend)
    // Approach 3: Just try to insert and handle foreign key errors

    let authUserExists = false
    let authUser: any = null
    let lastAuthError: string | null = null
    let lastErrorCode: string | null = null

    // First, try to get user by ID with retries
    for (let i = 0; i < 5; i++) {
      const { data, error } = await service.auth.admin.getUserById(resolvedUserId)
      if (data?.user) {
        authUserExists = true
        authUser = data.user
        break
      }
      lastAuthError = error?.message || null
      lastErrorCode = error?.status?.toString() || null

      // Short delay between retries
      if (i < 4) await sleep(300)
    }

    // If getUserById failed, try listing users (this sometimes works when getUserById doesn't)
    if (!authUserExists) {
      try {
        const foundUser = await findAuthUserById(service, resolvedUserId)
        if (foundUser) {
          authUserExists = true
          authUser = foundUser
          console.log('Found user via paginated listUsers instead of getUserById')
        }
      } catch (listErr) {
        console.warn('listUsers fallback failed:', listErr)
      }
    }

    // If user exists, auto-confirm them
    if (authUserExists && authUser) {
      if (authUser.email_confirmed_at === null) {
        try {
          await service.auth.admin.updateUserById(resolvedUserId, {
            email_confirm: true,
            user_metadata: { ...authUser.user_metadata, role: 'ADMIN' } // Sync metadata too
          })
          console.log('Auto-confirmed admin user email')
        } catch (confirmError) {
          console.warn('Failed to auto-confirm admin user:', confirmError)
        }
      }
    }

    // CRITICAL FIX: Use 'profiles' table as Single Source of Truth
    // Do NOT use admin_users table.

    const { error } = await service
      .from('profiles')
      .upsert({
        id: resolvedUserId,
        email: normalizedEmail,
        role: 'admin',
        approval_status: 'approved',
        onboarding_completed: true,
        name: authUser?.user_metadata?.name || 'Admin User'
      }, { onConflict: 'id' })

    if (error) {
      console.error('Admin grant error (profiles):', error)
      return NextResponse.json(
        { error: error.message || 'Failed to grant admin access' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
