import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Check if an influencer is approved
 * Returns the application status or null if not found
 */
export async function getInfluencerApprovalStatus(userId: string): Promise<'pending' | 'approved' | 'rejected' | null> {
  const supabase = await createClient()
  const { data: application } = await supabase
    .from('influencer_applications')
    .select('status')
    .eq('user_id', userId)
    .single()

  return (application?.status as 'pending' | 'approved' | 'rejected') || null
}

/**
 * Require influencer approval - redirects to onboarding if not approved
 * Use this in influencer pages that require approval
 */
export async function requireInfluencerApproval(userId: string) {
  const status = await getInfluencerApprovalStatus(userId)
  
  if (status !== 'approved') {
    redirect('/influencer/pending')
  }
}
