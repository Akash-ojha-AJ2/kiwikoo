'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/lib/react-query/hooks'

const SKIP_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/confirm',
  '/complete-profile',
  '/onboarding/influencer',
  '/onboarding/brand',
  '/influencer/pending',
  '/admin/login',
  '/admin/register',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/help',
  '/marketplace',
]

// Also skip the landing page exactly
const SKIP_EXACT = ['/']

export default function ProfileCompletionGate() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (!pathname) return
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return
    if (SKIP_EXACT.includes(pathname)) return
    if (isLoading || !user) return

    const role = String(user.role || 'INFLUENCER').toUpperCase()
    const onboardingCompleted = Boolean(user.onboardingCompleted)
    const approvalStatus = String(user.approvalStatus || 'none').toLowerCase()

    let nextTarget: string | null = null

    if (role === 'BRAND') {
      if (!onboardingCompleted) {
        nextTarget = '/onboarding/brand'
      }
    } else if (!onboardingCompleted) {
      nextTarget = '/onboarding/influencer'
    } else if (approvalStatus === 'rejected') {
      nextTarget = '/onboarding/influencer?mode=resubmit'
    } else if (approvalStatus !== 'approved') {
      nextTarget = '/influencer/pending'
    }

    if (!nextTarget) return

    const nextPathname = nextTarget.split('?')[0]
    if (pathname === nextPathname || pathname.startsWith(`${nextPathname}/`)) return

    router.replace(nextTarget)
  }, [isLoading, pathname, router, user])

  return null
}
