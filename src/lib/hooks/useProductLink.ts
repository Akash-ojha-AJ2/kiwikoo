'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from '@/lib/simple-sonner'

interface ProductLinkData {
  maskedUrl: string | null
  linkCode: string | null
  originalUrl: string | null
  productId: string
  productName: string | null
}

export function useProductLink(productId: string | null) {
  const [copied, setCopied] = useState(false)

  // Fetch or create masked link
  const { data, isLoading, error } = useQuery<ProductLinkData>({
    queryKey: ['product-link', productId],
    queryFn: async () => {
      if (!productId) return null
      const res = await fetch(`/api/links/product/${productId}`, {
        credentials: 'include',
      })
      if (res.status === 404) {
        return {
          maskedUrl: null,
          linkCode: null,
          originalUrl: null,
          productId,
          productName: null,
        }
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch product link')
      }
      return res.json()
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes - links don't change
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const copyLink = useCallback(async () => {
    if (!data?.maskedUrl) {
      toast.error('Link not available')
      return
    }

    try {
      await navigator.clipboard.writeText(data.maskedUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link')
    }
  }, [data?.maskedUrl])

  // Helper function to shorten URL for display
  const shortenUrl = (url: string | null, maxLength: number = 35): string => {
    if (!url) return ''
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace('www.', '')
      const path = urlObj.pathname
      const full = `${domain}${path}`
      if (full.length <= maxLength) return full
      return `${full.substring(0, maxLength - 3)}...`
    } catch {
      // If URL parsing fails, just truncate the string
      return url.length > maxLength ? `${url.substring(0, maxLength - 3)}...` : url
    }
  }

  return {
    maskedLink: data?.maskedUrl || null,
    originalUrl: data?.originalUrl || null,
    displayUrl: shortenUrl(data?.originalUrl || null),
    linkCode: data?.linkCode || null,
    productName: data?.productName || null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    copied,
    copyLink,
  }
}

