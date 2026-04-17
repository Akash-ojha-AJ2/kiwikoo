import { createClient, createServiceClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = (profile?.role || '').toUpperCase() // Normalize to matches DB Enum or comparison
    // Valid roles: ADMIN (caps) or admin (lowercase logic elsewhere).
    // DB has 'ADMIN' from my seed script.
    // Profile fetch might return lowercase if I didn't verify strictly.
    // Safest: .toUpperCase() === 'ADMIN'

    if (role === 'ADMIN') return user
    return null
}

export async function GET() {
    console.log('[AdminAPI] GET /pending-users started')
    const admin = await checkAdmin()
    if (!admin) {
        console.log('[AdminAPI] Unauthorized access attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[AdminAPI] Admin authorized:', admin.email)

    try {
        const service = createServiceClient()
        console.log('[AdminAPI] Service client created')

        // Fetch pending influencers/brands
        const { data, error } = await service
            .from('profiles')
            .select('*')
            .in('approval_status', ['PENDING', 'pending'])
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[AdminAPI] Database error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log('[AdminAPI] Query successful. Count:', data?.length)
        if (data?.length === 0) {
            // Debug: check if ANY users exist
            const { count } = await service.from('profiles').select('*', { count: 'exact', head: true })
            console.log('[AdminAPI] Total profiles in DB:', count)
        }

        return NextResponse.json({ users: data })
    } catch (e) {
        console.error('[AdminAPI] Internal error:', e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const admin = await checkAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { userId, action } = await request.json()

        if (!userId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
        const service = createServiceClient()

        const { error } = await service
            .from('profiles')
            .update({ approval_status: newStatus })
            .eq('id', userId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: newStatus })

    } catch (e) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
