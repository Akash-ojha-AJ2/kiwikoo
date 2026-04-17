/**
 * CENTRAL DASHBOARD ROUTE
 *
 * This is the SINGLE ENTRY POINT for all authenticated users.
 * Routes users to their role-specific dashboard based on profiles table.
 */
import { createClient, createServiceClient } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function normalizeRole(rawRole: unknown): 'admin' | 'brand' | 'influencer' {
  const value = String(rawRole || '').trim().toLowerCase()
  if (value === 'admin') return 'admin'
  if (value === 'brand') return 'brand'
  return 'influencer'
}

export default async function Dashboard() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  let profileClient: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient> = supabase
  try {
    profileClient = createServiceClient()
  } catch (serviceError) {
    console.warn('Service role unavailable in dashboard routing; falling back to session client:', serviceError)
    profileClient = supabase
  }

  let profile: {
    role: string | null
    onboarding_completed: boolean | null
    approval_status: string | null
  } | null = null

  try {
    const { data, error } = await profileClient
      .from('profiles')
      .select('role, onboarding_completed, approval_status')
      .eq('id', authUser.id)
      .maybeSingle()

    if (!error && data) {
      profile = data
    }
  } catch (error) {
    console.warn('Dashboard profile fetch failed:', error)
  }

  if (!profile) {
    const fallbackRole = normalizeRole(authUser.user_metadata?.role)

    try {
      const { data: created } = await profileClient
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          role: fallbackRole,
          full_name: (authUser.user_metadata?.name as string) || (authUser.user_metadata?.full_name as string) || null,
          onboarding_completed: false,
          approval_status: fallbackRole === 'brand' ? 'approved' : 'none',
        })
        .select('role, onboarding_completed, approval_status')
        .maybeSingle()

      if (created) {
        profile = created
      }
    } catch (error) {
      console.warn('Dashboard profile auto-create failed:', error)
    }
  }

  if (!profile) {
    redirect('/complete-profile')
  }

  const role = normalizeRole(profile.role)
  const onboardingComplete = Boolean(profile.onboarding_completed)
  const approvalStatus = ((profile.approval_status || 'none') as string).trim().toLowerCase()

  if (role === 'admin') {
    redirect('/admin')
  }

  if (role === 'brand') {
    if (!onboardingComplete) {
      redirect('/onboarding/brand')
    }
    redirect('/brand/dashboard')
  }

  if (!onboardingComplete) {
    redirect('/onboarding/influencer')
  }
  if (approvalStatus === 'rejected') {
    redirect('/onboarding/influencer?mode=resubmit')
  }
  if (approvalStatus !== 'approved') {
    redirect('/influencer/pending')
  }
  redirect('/influencer/dashboard')
}
