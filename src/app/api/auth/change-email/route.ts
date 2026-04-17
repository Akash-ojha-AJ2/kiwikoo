import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/auth'
import { getPublicSiteUrlFromRequest } from '@/lib/site-url'
import { sendEmail } from '@/lib/email/supabase-email'
import {
  buildEmailChangeCurrentEmail,
  buildEmailChangeNewEmail,
  buildVerifyOtpUrl,
} from '@/lib/email/auth-email'

const schema = z
  .object({
    newEmail: z.string().trim().toLowerCase().email().max(320),
    password: z.string().min(1).max(128),
  })
  .strict()

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const { newEmail, password } = schema.parse(body)

    if (newEmail === authUser.email.toLowerCase()) {
      return NextResponse.json({ error: 'Please choose a different email address' }, { status: 400 })
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }

    const service = createServiceClient()
    const siteUrl = getPublicSiteUrlFromRequest(request)
    const nextPath = '/settings/profile?email_changed=true'
    const redirectTo = `${siteUrl}${nextPath}`

    const [currentLinkResult, newLinkResult] = await Promise.all([
      service.auth.admin.generateLink({
        type: 'email_change_current',
        email: authUser.email,
        newEmail,
        options: { redirectTo },
      }),
      service.auth.admin.generateLink({
        type: 'email_change_new',
        email: authUser.email,
        newEmail,
        options: { redirectTo },
      }),
    ])

    if (currentLinkResult.error) {
      return NextResponse.json({ error: currentLinkResult.error.message }, { status: 400 })
    }

    if (newLinkResult.error) {
      return NextResponse.json({ error: newLinkResult.error.message }, { status: 400 })
    }

    if (!currentLinkResult.data?.properties?.hashed_token || !newLinkResult.data?.properties?.hashed_token) {
      return NextResponse.json({ error: 'Failed to create email confirmation links' }, { status: 500 })
    }

    const currentConfirmUrl = buildVerifyOtpUrl(siteUrl, {
      tokenHash: currentLinkResult.data.properties.hashed_token,
      type: currentLinkResult.data.properties.verification_type,
      nextPath,
    })

    const newConfirmUrl = buildVerifyOtpUrl(siteUrl, {
      tokenHash: newLinkResult.data.properties.hashed_token,
      type: newLinkResult.data.properties.verification_type,
      nextPath,
    })

    const currentTemplate = buildEmailChangeCurrentEmail({
      confirmUrl: currentConfirmUrl,
      newEmail,
    })
    const newTemplate = buildEmailChangeNewEmail({
      confirmUrl: newConfirmUrl,
      newEmail,
    })

    const [currentEmailResult, newEmailResult] = await Promise.all([
      sendEmail({
        to: authUser.email,
        subject: currentTemplate.subject,
        html: currentTemplate.html,
        text: currentTemplate.text,
      }),
      sendEmail({
        to: newEmail,
        subject: newTemplate.subject,
        html: newTemplate.html,
        text: newTemplate.text,
      }),
    ])

    if (!currentEmailResult.ok || !newEmailResult.ok) {
      const errorMessage = currentEmailResult.error || newEmailResult.error || 'Failed to send confirmation emails'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
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
