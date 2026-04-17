/**
 * CONVERSATIONS API
 * 
 * GET - List conversations for authenticated user
 * POST - Create/get conversation between brand and influencer
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const service = createServiceClient()

        // Get user's role
        const { data: profile } = await service
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const role = (profile.role || '').toLowerCase()
        const isInfluencer = role === 'influencer'

        // Fetch conversations where user is either brand or influencer
        const { data: conversations, error } = await service
            .from('conversations')
            .select(`
        id,
        brand_id,
        influencer_id,
        last_message,
        last_message_at,
        unread_brand,
        unread_influencer,
        created_at
      `)
            .or(`brand_id.eq.${user.id},influencer_id.eq.${user.id}`)
            .order('last_message_at', { ascending: false })

        if (error) {
            console.error('Conversations fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
        }

        // Fetch profiles for the other party in each conversation
        const otherUserIds = (conversations || []).map(c =>
            c.brand_id === user.id ? c.influencer_id : c.brand_id
        )

        const { data: profiles } = await service
            .from('profiles')
            .select('id, email, brand_data')
            .in('id', otherUserIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        // Enrich conversations with other party info
        const enriched = (conversations || []).map(conv => {
            const otherId = conv.brand_id === user.id ? conv.influencer_id : conv.brand_id
            const otherProfile = profileMap.get(otherId)
            const unreadCount = isInfluencer ? conv.unread_influencer : conv.unread_brand

            return {
                ...conv,
                other_party: {
                    id: otherId,
                    email: otherProfile?.email || 'Unknown',
                    name: (otherProfile?.brand_data as any)?.companyName ||
                        otherProfile?.email?.split('@')[0] || 'Unknown',
                },
                unread_count: unreadCount || 0,
            }
        })

        return NextResponse.json({ conversations: enriched })
    } catch (error) {
        console.error('Conversations API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { recipient_id } = body

        if (!recipient_id) {
            return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 })
        }

        const service = createServiceClient()

        // Determine who is brand and who is influencer
        const { data: userProfile } = await service
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const { data: recipientProfile } = await service
            .from('profiles')
            .select('role')
            .eq('id', recipient_id)
            .single()

        if (!userProfile || !recipientProfile) {
            return NextResponse.json({ error: 'Invalid user or recipient' }, { status: 400 })
        }

        const userRole = (userProfile.role || '').toLowerCase()
        const recipientRole = (recipientProfile.role || '').toLowerCase()

        // Determine brand_id and influencer_id
        let brand_id: string, influencer_id: string

        if (userRole === 'brand' && recipientRole === 'influencer') {
            brand_id = user.id
            influencer_id = recipient_id
        } else if (userRole === 'influencer' && recipientRole === 'brand') {
            brand_id = recipient_id
            influencer_id = user.id
        } else {
            return NextResponse.json({ error: 'Invalid conversation participants' }, { status: 400 })
        }

        // Check if conversation exists
        const { data: existing } = await service
            .from('conversations')
            .select('*')
            .eq('brand_id', brand_id)
            .eq('influencer_id', influencer_id)
            .single()

        if (existing) {
            return NextResponse.json({ conversation: existing })
        }

        // Create new conversation
        const { data: conversation, error } = await service
            .from('conversations')
            .insert({ brand_id, influencer_id })
            .select()
            .single()

        if (error) {
            console.error('Create conversation error:', error)
            return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
        }

        return NextResponse.json({ conversation }, { status: 201 })
    } catch (error) {
        console.error('Conversations API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
