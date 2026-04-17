/**
 * INFLUENCER LAYOUT GUARD
 * 
 * Route-level authorization for /influencer/* routes.
 * Uses getIdentity() which reads from profiles (SOURCE OF TRUTH).
 * 
 * Authorization Rules:
 * - Must be authenticated
 * - Must have role = 'influencer'
 * - Must have completed onboarding
 * - Pending users: allowed to access /influencer/pending only (handled below)
 * - Approved users: full access
 */
import { getIdentity } from '@/lib/auth-state'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function InfluencerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getIdentity()

  // Must be authenticated
  if (!auth.authenticated) {
    redirect('/login')
  }

  if (!auth.identity) {
    redirect('/complete-profile')
  }

  const { identity } = auth

  // Must be influencer
  if (identity.role !== 'influencer') {
    redirect('/dashboard')
  }

  // Must complete onboarding
  if (!identity.onboarding_completed) {
    redirect('/onboarding/influencer')
  }

  // Pending influencers: allow /influencer/pending only
  // Note: /marketplace is handled at root level (public path in middleware)
  if (identity.approval_status !== 'approved') {
    if (identity.approval_status === 'rejected') {
      redirect('/onboarding/influencer?mode=resubmit')
    }

    // Get current path to check if we're on /influencer/pending
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    const onPendingPage = pathname === '/influencer/pending' || pathname.startsWith('/influencer/pending/')

    // If not on pending page and not approved, redirect to pending
    if (!onPendingPage) {
      redirect('/influencer/pending')
    }
  }

  return <>{children}</>
}
