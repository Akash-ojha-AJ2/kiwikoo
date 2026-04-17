/**
 * MESSAGES API
 * 
 * GET - Get messages for a conversation
 * POST - Send a message
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'

interface Params {
    params: Promise<{ conversationId: string }>
}

export async function GET(request: Request, { params }: Params) {
    try {
        const { conversationId } = await params
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const service = createServiceClient()

        // Verify user is part of this conversation
        const { data: conversation } = await service
            .from('conversations')
            .select('brand_id, influencer_id, unread_brand, unread_influencer')
            .eq('id', conversationId)
            .single()

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        if (conversation.brand_id !== user.id && conversation.influencer_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Fetch messages
        const { data: messages, error } = await service
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Messages fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
        }

        // Mark messages as read
        const isBrand = conversation.brand_id === user.id
        await service
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id)

        // Reset unread count
        await service
            .from('conversations')
            .update(isBrand ? { unread_brand: 0 } : { unread_influencer: 0 })
            .eq('id', conversationId)

        return NextResponse.json({ messages: messages || [] })
    } catch (error) {
        console.error('Messages API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request, { params }: Params) {
    try {
        const { conversationId } = await params
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content } = body

        if (!content || typeof content !== 'string' || !content.trim()) {
            return NextResponse.json({ error: 'Message content required' }, { status: 400 })
        }

        const service = createServiceClient()

        // Verify user is part of this conversation
        const { data: conversation } = await service
            .from('conversations')
            .select('brand_id, influencer_id, unread_brand, unread_influencer')
            .eq('id', conversationId)
            .single()

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        if (conversation.brand_id !== user.id && conversation.influencer_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Insert message
        const { data: message, error } = await service
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: content.trim(),
            })
            .select()
            .single()

        if (error) {
            console.error('Message insert error:', error)
            return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
        }

        // Update conversation
        const isBrand = conversation.brand_id === user.id
        const updateData = {
            last_message: content.trim().substring(0, 100),
            last_message_at: new Date().toISOString(),
            unread_influencer: isBrand
                ? Number(conversation.unread_influencer || 0) + 1
                : Number(conversation.unread_influencer || 0),
            unread_brand: isBrand
                ? Number(conversation.unread_brand || 0)
                : Number(conversation.unread_brand || 0) + 1,
        }

        await service
            .from('conversations')
            .update(updateData)
            .eq('id', conversationId)

        return NextResponse.json({ message }, { status: 201 })
    } catch (error) {
        console.error('Messages API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
