/**
 * GET /api/auth/me
 *
 * READ-ONLY ENDPOINT:
 * - Fetches authenticated user from Supabase Auth
 * - Fetches profile from profiles table
 * - Returns { user, profile }
 */
import { NextResponse } from 'next/server'
import { getCurrentUserPayload } from '@/lib/current-user'

export async function GET() {
  try {
    return NextResponse.json(await getCurrentUserPayload())
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
