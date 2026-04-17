import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch notifications directly from Supabase
    // RLS ensures users only see their own
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Count unread
    // Note: This matches "isRead: false" in Prisma -> "read: false" in SQL
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    if (countError) throw countError

    return NextResponse.json(
      {
        notifications: notifications.map(n => ({
          ...n,
          isRead: n.read // Map back to isRead if frontend expects it
        })),
        unreadCount: count
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
