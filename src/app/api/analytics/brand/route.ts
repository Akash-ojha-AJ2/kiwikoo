import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/analytics/brand
 * 
 * Returns analytics data for the current brand user.
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

        if (!profile || profile.role?.toLowerCase() !== 'brand') {
            return NextResponse.json({ error: 'Not a brand' }, { status: 403 })
        }

        // Fetch products stats
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name, active, created_at')
            .eq('brand_id', authUser.id)
            .order('created_at', { ascending: false })

        if (prodError) {
            console.error('Analytics products error:', prodError)
        }

        // Fetch collaboration stats
        const { data: collaborations, error: collabError } = await supabase
            .from('collaboration_requests')
            .select('id, status, created_at, influencer_id')
            .eq('brand_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (collabError) {
            console.error('Analytics collaborations error:', collabError)
        }

        // Calculate summary stats
        const totalProducts = products?.length || 0
        const activeProducts = products?.filter(p => p.active).length || 0
        const totalCollaborations = collaborations?.length || 0
        const pendingCollaborations = collaborations?.filter(c => c.status === 'pending').length || 0
        const activeCollaborations = collaborations?.filter(c => c.status === 'active' || c.status === 'accepted').length || 0

        return NextResponse.json({
            summary: {
                totalProducts,
                activeProducts,
                totalCollaborations,
                pendingCollaborations,
                activeCollaborations,
            },
            recentProducts: products?.slice(0, 10) || [],
            recentCollaborations: collaborations?.slice(0, 10) || [],
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
