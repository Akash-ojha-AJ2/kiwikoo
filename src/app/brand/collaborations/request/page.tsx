'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import RequestModal from '@/components/collaborations/RequestModal'
// import { PageSkeleton } from '@/components/ui/skeleton' // Can't import easily if it's not exported or if I want minimal diff, let's just use null fallback or a simple div for now to be safe, or import it.
// Actually I know I exported PageSkeleton from skeleton.tsx. Let's try to import it.
import { PageSkeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

function CollaborationRequestContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const influencerId = searchParams.get('influencerId')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (influencerId) {
      setIsOpen(true)
    } else {
      router.push('/brand/marketplace')
    }
  }, [influencerId, router])

  const handleClose = () => {
    setIsOpen(false)
    router.push('/brand/marketplace')
  }

  if (!influencerId) {
    return null
  }

  return (
    <RequestModal
      isOpen={isOpen}
      onClose={handleClose}
      influencerId={influencerId}
    />
  )
}

export default function CollaborationRequestPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CollaborationRequestContent />
    </Suspense>
  )
}

