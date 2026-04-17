/**
 * Server-side route guard for /influencer/pending
 * 
 * This page MUST require:
 * - onboarding_completed === true in profiles table
 * - approval_status === 'pending' (or 'PENDING')
 * 
 * Uses Supabase only - NO Prisma
 */
import { createClient, createServiceClient } from '@/lib/auth'

export async function checkPendingPageAccess(userId: string): Promise<{ allowed: boolean; redirectTo?: string }> {
  try {
    const service = createServiceClient()

    // Check profile in Supabase profiles table (SOURCE OF TRUTH)
    const { data: profile, error } = await service
      .from('profiles')
      .select('role, onboarding_completed, approval_status')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.error('Profile fetch error:', error)
      return { allowed: false, redirectTo: '/dashboard' }
    }

    // Must be influencer
    const role = (profile.role || '').toLowerCase()
    if (role !== 'influencer') {
      return { allowed: false, redirectTo: '/dashboard' }
    }

    // CRITICAL: Pending page requires onboarding to be completed
    if (!profile.onboarding_completed) {
      // User hasn't completed onboarding - redirect to onboarding
      return { allowed: false, redirectTo: '/onboarding/influencer' }
    }

    // Check approval status (normalize to lowercase for comparison)
    const status = (profile.approval_status || 'pending').toLowerCase()

    // If approved, redirect straight to marketplace
    if (status === 'approved') {
      return { allowed: false, redirectTo: '/marketplace' }
    }

    // Allow access if onboarding completed and status is pending/none
    return { allowed: true }
  } catch (error) {
    console.error('Error checking pending page access:', error)
    // On error, redirect to dashboard for safety
    return { allowed: false, redirectTo: '/dashboard' }
  }
}
