'use client'

import { Heart } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import { useFavorites, useToggleFavorite } from '@/lib/react-query/hooks'

interface FavoriteButtonProps {
  productId: string
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { data: favorites = [], isLoading } = useFavorites()
  const toggleMutation = useToggleFavorite()

  // Check if product is favorited (favorites is an array of products)
  const isFavorited = favorites.some((product: any) => product?.id === productId || product?.product_id === productId)

  const handleToggle = () => {
    // Immediate optimistic update - UI updates instantly
    toggleMutation.mutate(
      { productId, isFavorited },
      {
        onSuccess: () => {
          toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites', {
            duration: 2000,
          })
        },
        onError: () => {
          toast.error('Failed to update favorites')
        },
      }
    )
  }

  const buttonLabel = toggleMutation.isPending
    ? 'Saving...'
    : isLoading
      ? 'Checking...'
      : isFavorited
        ? 'Saved'
        : 'Save'

  const buttonTone = isFavorited
    ? 'bg-red-500 text-white'
    : isLoading
      ? 'bg-[#FFF4D9] text-black/60'
      : 'bg-white text-black'

  return (
    <button type="button"
      className={`w-full min-h-[60px] px-3 py-2.5 border-[3px] border-black font-bold uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 ${buttonTone} ${isLoading ? 'cursor-wait' : 'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}`}
      onClick={handleToggle}
      disabled={toggleMutation.isPending || isLoading}
      aria-busy={toggleMutation.isPending || isLoading}
    >
      <Heart
        className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''
          }`}
      />
      {buttonLabel}
    </button>
  )
}
