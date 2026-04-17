'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Expand, ImageOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageViewerProps {
  src: string
  alt: string
  className?: string
}

export function ImageViewer({ src, alt, className = '' }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setHasError(false)
      setIsLoading(true)
    }
  }, [src])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!src) return null

  if (hasError) {
    return (
      <div className={`${className} bg-cream flex flex-col items-center justify-center gap-2`}>
        <ImageOff className="w-8 h-8 text-charcoal/20" />
        <span className="text-charcoal/40 text-xs text-center px-2">Image unavailable</span>
        {src.includes('supabase.co') && (
          <span className="text-charcoal/30 text-xs text-center px-2">
            Storage bucket may need to be public
          </span>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`${className} relative`}>
        {isLoading && (
          <div className="absolute inset-0 bg-cream flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-charcoal/20 border-t-charcoal/60 rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          unoptimized
          className={`${className} cursor-pointer hover:opacity-90 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onClick={() => setIsOpen(true)}
          onLoad={() => {
            setIsLoading(false)
          }}
          onError={(e) => {
            console.error('Image failed to load:', src)
            console.error('Error details:', e)
            setHasError(true)
            setIsLoading(false)
          }}
        />
        {!isLoading && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border-[2px] border-black bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
            aria-label="Open image preview"
          >
            <Expand className="h-3.5 w-3.5" />
            View
          </button>
        )}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#050505]/82 p-3 backdrop-blur-lg sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[min(94vw,1220px)] flex-col overflow-hidden rounded-[30px] border-[3px] border-black bg-[#fff9ef] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.9)] sm:max-h-[calc(100dvh-3rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b-[3px] border-black bg-[#fff0d6] px-4 py-3 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/45">Image Preview</p>
                <p className="truncate pr-3 text-sm font-black text-black sm:text-base">
                  {alt || 'Image Preview'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-2xl border-[2px] border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD93D]"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ea_0%,#ffeccd_42%,#f4dcc0_100%)] p-3 sm:p-5">
              <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-[#FFD93D]/18 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-40 w-40 rounded-full bg-[#FF8C69]/12 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
              </div>
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1600}
                unoptimized
                className="relative z-10 max-h-full max-w-full rounded-[24px] border-[3px] border-black bg-white object-contain shadow-[0_28px_80px_rgba(0,0,0,0.24)]"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t-[3px] border-black bg-[#fff0d6] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-black/55 sm:px-5">
              <span>Click outside or press Esc to close</span>
              <span className="hidden sm:inline">Full image fit</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
