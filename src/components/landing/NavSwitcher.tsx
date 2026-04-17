'use client'

import { usePathname } from 'next/navigation'
import BrutalNavbar from '@/components/brutal/BrutalNavbar'
import LandingNav from './LandingNav'
import { useUser } from '@/lib/react-query/hooks'

export default function NavSwitcher() {
  const pathname = usePathname()
  const { data: user, isLoading } = useUser()
  const isLandingPage = pathname === '/'
  const isContactPage = pathname === '/contact'

  if (isContactPage) return <LandingNav />

  if (isLandingPage) {
    if (isLoading && typeof user === 'undefined') {
      return <div aria-hidden className="h-[76px] sm:h-[84px] lg:h-[92px]" />
    }

    return user ? <BrutalNavbar /> : <LandingNav />
  }

  return <BrutalNavbar />
}
