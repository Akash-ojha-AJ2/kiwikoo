import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/analytics/influencer
 * 
 * Returns analytics data for the current influencer user.
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch profile to verify role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || profile.role?.toLowerCase() !== 'influencer') {
            return NextResponse.json({ error: 'Not an influencer' }, { status: 403 })
        }

        // Fetch generation stats
        const { data: generations, error: genError } = await supabase
            .from('generations')
            .select('id, created_at, credits_used')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(100)

        if (genError) {
            console.error('Analytics generations error:', genError)
        }

        // Fetch collaboration stats
        const { data: collaborations, error: collabError } = await supabase
            .from('collaboration_requests')
            .select('id, status, created_at')
            .eq('influencer_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (collabError) {
            console.error('Analytics collaborations error:', collabError)
        }

        // Calculate summary stats
        const totalGenerations = generations?.length || 0
        const totalCreditsUsed = generations?.reduce((sum, g) => sum + (g.credits_used || 0), 0) || 0
        const totalCollaborations = collaborations?.length || 0
        const activeCollaborations = collaborations?.filter(c => c.status === 'active' || c.status === 'accepted').length || 0

        return NextResponse.json({
            summary: {
                totalGenerations,
                totalCreditsUsed,
                totalCollaborations,
                activeCollaborations,
            },
            recentGenerations: generations?.slice(0, 10) || [],
            recentCollaborations: collaborations?.slice(0, 10) || [],
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
