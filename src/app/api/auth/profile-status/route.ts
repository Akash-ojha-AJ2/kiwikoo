import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

/**
 * GET /api/auth/profile-status
 * 
 * Returns the current user's profile status for client-side checks.
 * Uses standard createClient which respects RLS.
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch profile - RLS ensures user can only read their own profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, role, onboarding_completed, approval_status, full_name, avatar_url')
            .eq('id', authUser.id)
            .single()

        if (error || !profile) {
            console.error('Profile status fetch error:', error)
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const role = (profile.role || 'influencer').toLowerCase()
        const onboardingCompleted = profile.onboarding_completed || false
        const approvalStatus = (profile.approval_status || 'none').toLowerCase()

        let journeyState = 'draft'
        if (role === 'brand') {
            journeyState = onboardingCompleted ? 'brand_active' : 'brand_draft'
        } else if (!onboardingCompleted) {
            journeyState = 'influencer_draft'
        } else if (approvalStatus === 'approved') {
            journeyState = 'influencer_approved'
        } else if (approvalStatus === 'rejected') {
            journeyState = 'influencer_rejected'
        } else {
            journeyState = 'influencer_pending'
        }

        return NextResponse.json({
            id: profile.id,
            role,
            onboarding_completed: onboardingCompleted,
            approval_status: approvalStatus,
            journey_state: journeyState,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
        })
    } catch (error) {
        console.error('Profile status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
