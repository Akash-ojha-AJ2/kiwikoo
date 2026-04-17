import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', authUser.id)
      .eq('read', false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
