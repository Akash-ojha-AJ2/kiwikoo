'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
  images: string[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
        <span className="text-zinc-400">No images available</span>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={currentIndex === 0}
        />
        {images.length > 1 && (
          <>
            <button type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] z-10"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6 stroke-[3]" />
            </button>
            <button type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] z-10"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6 stroke-[3]" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button type="button"
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-colors relative ${index === currentIndex
                ? 'border-primary'
                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

