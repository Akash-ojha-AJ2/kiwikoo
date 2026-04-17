/**
 * INFLUENCER PENDING LAYOUT GUARD
 * 
 * Enforces:
 * - Must have completed onboarding
 * - Must NOT be approved
 */
import { getAuthState } from '@/lib/auth-state'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function InfluencerPendingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const state = await getAuthState()

  // Must be authenticated
  if (state.type === 'unauthenticated') {
    redirect('/login')
  }

  // Must be influencer_pending (onboarding completed, not approved)
  if (state.type !== 'influencer_pending') {
    // If draft → redirect to onboarding
    if (state.type === 'influencer_draft') {
      redirect('/onboarding/influencer')
    }
    // If approved → redirect to marketplace
    if (state.type === 'influencer_approved') {
      redirect('/marketplace')
    }
    // Other states → dashboard
    redirect('/dashboard')
  }

  return <>{children}</>
}
