'use client'

import { Share2 } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'

interface ProductShareButtonProps {
  productName: string
}

export default function ProductShareButton({ productName }: ProductShareButtonProps) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: productName,
          text: `Check out this product: ${productName}`,
          url,
        })
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success('Product link copied')
        return
      }

      toast.error('Sharing is not supported on this browser')
    } catch {
      toast.error('Could not share this product')
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full min-h-[60px] px-3 py-2.5 bg-white border-[3px] border-black text-charcoal font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  )
}
