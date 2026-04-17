import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Supabase count queries
    const [
      { count: generations },
      { count: sentCollabs },
      { count: receivedCollabs },
      { count: portfolioItems }
    ] = await Promise.all([
      supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id),
      supabase.from('collaboration_requests').select('*', { count: 'exact', head: true }).eq('brand_id', authUser.id).eq('status', 'accepted'),
      supabase.from('collaboration_requests').select('*', { count: 'exact', head: true }).eq('influencer_id', authUser.id).eq('status', 'accepted'),
      supabase.from('portfolio').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id)
    ])

    const totalCollaborations = (sentCollabs || 0) + (receivedCollabs || 0)
    const genCount = generations || 0
    const portCount = portfolioItems || 0

    // Gamification
    const totalXp = genCount * 10 + totalCollaborations * 50 + portCount * 5
    const level = Math.floor(totalXp / 100) + 1
    const xp = totalXp % 100
    const nextLevelXp = 100

    return NextResponse.json(
      {
        generations: genCount,
        collaborations: totalCollaborations,
        portfolioItems: portCount,
        level,
        xp,
        nextLevelXp,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=120, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
