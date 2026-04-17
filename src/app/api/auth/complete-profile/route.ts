import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Ensure they have a valid session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { role, name } = await request.json()

        if (!role || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const roleLowercase = role.toLowerCase()
        if (roleLowercase !== 'influencer' && roleLowercase !== 'brand') {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        const approvalStatus = roleLowercase === 'influencer' ? 'none' : 'approved'

        // Upsert the profile into the DB
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            role: roleLowercase,
            full_name: name.trim(),
            onboarding_completed: false, // They still need to do the questionnaires 
            approval_status: approvalStatus,
        }, { onConflict: 'id' })

        if (profileError) {
            console.error('Failed to complete profile:', profileError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('complete-profile error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
