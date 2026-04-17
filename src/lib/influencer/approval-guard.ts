import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null

export async function checkInfluencerApproval(userId: string): Promise<ApprovalStatus> {
  const supabase = await createClient()
  const { data: application } = await supabase
    .from('influencer_applications')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()

  return (application?.status as ApprovalStatus) ?? null
}

export async function requireApproval(userId: string) {
  const status = await checkInfluencerApproval(userId)
  if (status !== 'approved') {
    redirect('/influencer/pending')
  }
}

export function isApprovedRoute(pathname: string) {
  const allowedExact = new Set([
    '/',
    '/help',
    '/contact',
    '/about',
    '/privacy',
    '/terms',
    '/influencer/pending',
  ])
  const allowedPrefixes = ['/marketplace', '/auth', '/api']
  return allowedExact.has(pathname) || allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
}
