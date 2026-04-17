import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

function isEnvEnabled(value: string | undefined): boolean {
  return (value || '').trim().toLowerCase() === 'true'
}

export async function POST(request: Request) {
  try {
    if (!isEnvEnabled(process.env.ENABLE_CLEAR_AUTH_ENDPOINT)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (process.env.NODE_ENV === 'production' && !isEnvEnabled(process.env.ENABLE_CLEAR_AUTH_ENDPOINT_IN_PROD)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle()

    if ((profile?.role || '').toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body || body.confirm !== true) {
      return NextResponse.json({ error: 'Confirm required' }, { status: 400 })
    }

    const admin = createServiceClient()

    let page = 1
    let totalDeleted = 0

    while (true) {
      const { data: users, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
      if (error || !users?.users?.length) break

      for (const user of users.users) {
        await admin.auth.admin.deleteUser(user.id)
        totalDeleted += 1
      }

      if (users.users.length < 100) break
      page += 1
    }

    return NextResponse.json({
      success: true,
      deleted: { authUsers: totalDeleted, prismaUsers: 0 },
      message: 'Auth cleared (Prisma skipped)',
    })
  } catch (error) {
    console.error('clear-auth endpoint failed:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
