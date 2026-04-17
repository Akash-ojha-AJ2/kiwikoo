'use client'

import { useState } from 'react'
import RequestModal from './RequestModal'

interface RequestCollaborationButtonProps {
  productId?: string
  productName?: string
  brandName?: string
  influencerId?: string
}

export default function RequestCollaborationButton({
  productId,
  productName,
  brandName,
  influencerId,
}: RequestCollaborationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button"
        className="w-full py-3 sm:py-3.5 bg-white text-black font-bold text-base sm:text-lg uppercase tracking-wider border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        onClick={() => setIsOpen(true)}
      >
        Request Collaboration
      </button>
      <RequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        productName={productName}
        brandName={brandName}
        influencerId={influencerId}
      />
    </>
  )
}

