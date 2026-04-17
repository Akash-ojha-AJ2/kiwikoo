import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isEnvEnabled(value: string | undefined): boolean {
  return (value || '').trim().toLowerCase() === 'true'
}

export async function GET() {
  if (!isEnvEnabled(process.env.ENABLE_DB_HEALTH_ENDPOINT)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = {
    ok: false,
    supabase: { ok: false, error: undefined as string | undefined, profilesCount: 0 },
    env: {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
  }

  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      result.supabase.error = error.message
      result.supabase.ok = false
    } else {
      result.supabase.ok = true
      result.supabase.profilesCount = count ?? 0
    }
  } catch (error) {
    result.supabase.error = error instanceof Error ? error.message : String(error)
    result.supabase.ok = false
  }

  result.ok = result.supabase.ok
  return NextResponse.json(result, { status: result.ok ? 200 : 503 })
}
