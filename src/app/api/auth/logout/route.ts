import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase signOut error:', error)
    }

    const cookieStore = await cookies()
    const response = NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )

    // Supabase cookies can be chunked (e.g. .0, .1), so clear all auth-like names.
    const cookieNamesToClear = new Set<string>([
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token',
    ])

    cookieStore.getAll().forEach((cookie) => {
      if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
        cookieNamesToClear.add(cookie.name)
      }
    })

    cookieNamesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
