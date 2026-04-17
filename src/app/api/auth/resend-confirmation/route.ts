import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'
import { getPublicSiteUrlFromRequest } from '@/lib/site-url'
import { sendEmail } from '@/lib/email/supabase-email'
import { buildEmailConfirmationEmail, buildVerifyOtpUrl } from '@/lib/email/auth-email'

const resendSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
})

export async function POST(request: Request) {
  const genericOk = {
    message: 'If an account exists and is pending confirmation, a confirmation email has been sent.',
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Request body required' }, { status: 400 })
    }

    const { email } = resendSchema.parse(body)
    const service = createServiceClient()

    const perPage = 1000
    let page = 1
    let user: any = null

    while (!user) {
      const { data: usersPage, error: listError } = await service.auth.admin.listUsers({ page, perPage })
      if (listError) {
        console.error('Resend confirmation listUsers error:', listError)
        break
      }

      const users = usersPage?.users || []
      user = users.find((u: any) => u.email?.toLowerCase().trim() === email) || null

      if (user || users.length < perPage) {
        break
      }

      page += 1
    }

    if (!user || user.email_confirmed_at) {
      return NextResponse.json(genericOk)
    }

    const siteUrl = getPublicSiteUrlFromRequest(request)
    const tempPassword = `${crypto.randomBytes(12).toString('base64url')}Aa1!`

    const { data, error } = await service.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,
      options: {
        redirectTo: `${siteUrl}/login?confirmed=true`,
      },
    })

    if (error || !data?.properties?.hashed_token) {
      if (error) {
        console.error('Resend confirmation generateLink error:', error)
      }
      return NextResponse.json(genericOk)
    }

    const confirmUrl = buildVerifyOtpUrl(siteUrl, {
      tokenHash: data.properties.hashed_token,
      type: data.properties.verification_type,
      nextPath: '/login?confirmed=true',
    })

    const template = buildEmailConfirmationEmail({ confirmUrl })
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (!result.ok) {
      const fallbackClient = await createClient()
      const { error: fallbackError } = await fallbackClient.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${siteUrl}/login?confirmed=true`,
        },
      })

      if (fallbackError) {
        console.error('Resend confirmation fallback failed:', fallbackError)
      }
    }

    return NextResponse.json(genericOk)
  } catch (error) {
    console.error('Resend confirmation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
