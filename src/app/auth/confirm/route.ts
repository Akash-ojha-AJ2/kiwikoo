/**
 * Email Confirmation Handler
 */
import { NextRequest, NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/auth'

function sanitizeNext(next: string | null, requestUrl: URL): string {
  const fallback = '/login?confirmed=true'
  if (!next) return fallback

  if (next.startsWith('/')) return next

  try {
    const nextUrl = new URL(next)
    if (nextUrl.origin === requestUrl.origin) {
      return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    }
  } catch {
    // ignore
  }

  return fallback
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams

  const token_hash = searchParams.get('token_hash') ?? searchParams.get('token')
  const type = (searchParams.get('type') as EmailOtpType | null) ?? null
  const next = sanitizeNext(searchParams.get('next'), requestUrl)

  if (token_hash && type) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error && data.user) {
      if (type === 'signup' || type === 'invite' || type === 'magiclink') {
        await supabase.auth.signOut()
      }

      if (type === 'recovery') {
        const resetUrl = new URL('/reset-password', requestUrl.origin)
        resetUrl.searchParams.set('token_hash', token_hash)
        resetUrl.searchParams.set('type', type)
        return NextResponse.redirect(resetUrl)
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirmation_failed', requestUrl.origin))
}
