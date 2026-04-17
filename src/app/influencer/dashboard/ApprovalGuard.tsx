'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth-client'

interface ApprovalGuardProps {
  userId: string
  children: React.ReactNode
}

export default function ApprovalGuard({ userId, children }: ApprovalGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    async function checkApproval() {
      try {
        const supabase = createClient()

        const { data: application } = await supabase
          .from('influencer_applications')
          .select('status')
          .eq('user_id', userId)
          .single()

        if (application?.status === 'approved') {
          setIsApproved(true)
        } else if (application?.status === 'rejected') {
          router.push('/onboarding/influencer?mode=resubmit')
        } else {
          // Redirect to pending screen if not approved
          router.push('/influencer/pending')
        }
      } catch (error) {
        console.error('Error checking approval:', error)
        // On error, allow access (fail open) - server-side checks are primary
      } finally {
        setIsChecking(false)
      }
    }

    if (userId) {
      checkApproval()
    }
  }, [userId, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-peach border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal/60">Checking approval status...</p>
        </div>
      </div>
    )
  }

  if (!isApproved) {
    return null // Redirecting
  }

  return <>{children}</>
}
