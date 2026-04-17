'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AppImage } from '@/components/ui/AppImage'
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Package,
  MousePointerClick,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import { useQuery } from '@tanstack/react-query'
import { BrutalLoader } from '@/components/ui/BrutalLoader'

// Neo-Brutalist Components
function BrutalCard({ children, className = '', title }: { children: React.ReactNode, className?: string, title?: string }) {
  return (
    <div className={`bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {title && (
        <div className="absolute -top-4 left-6 bg-[#FFD93D] px-3 py-1 border-[3px] border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

function BrutalMetric({ label, value, icon: Icon, color = 'bg-[#90E8FF]' }: { label: string, value: string | number, icon: any, color?: string }) {
  return (
    <BrutalCard className="flex flex-col h-full bg-white">
      <div className={`w-14 h-14 border-[3px] border-black ${color} flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
        <Icon className="w-8 h-8 text-black" />
      </div>
      <div className="text-4xl font-black text-black mb-1 leading-none">
        {value}
      </div>
      <div className="text-sm font-bold uppercase tracking-widest text-black/60">
        {label}
      </div>
    </BrutalCard>
  )
}

interface AnalyticsData {
  totalClicks: number
  totalProducts: number
  averageClicks: number
  products: Array<{
    productId: string
    productName: string
    productImage?: string
    maskedUrl: string
    originalUrl: string
    linkCode: string
    clickCount: number
    uniqueClicks: number
    lastClickedAt: string | null
    createdAt: string
  }>
}

// Helper function to shorten URL for display
const shortenUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    const path = urlObj.pathname
    const full = `${domain}${path}`
    if (full.length <= 40) return full
    return `${full.substring(0, 37)}...`
  } catch {
    return url.length > 40 ? `${url.substring(0, 37)}...` : url
  }
}

export default function InfluencerAnalyticsPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['link-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/links/analytics', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch analytics')
      return res.json()
    },
    staleTime: 30 * 1000, // 30 seconds
  })

  const handleCopyLink = async (maskedUrl: string) => {
    try {
      await navigator.clipboard.writeText(maskedUrl)
      setCopiedLink(maskedUrl)
      toast.success('Link copied!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex items-center justify-center">
        <BrutalLoader size="lg" tone="influencer" label="Loading analytics" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 flex items-center justify-center">
        <div className="text-center bg-white border-[3px] border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-red-600 font-black uppercase text-xl mb-6">Failed to load analytics</p>
          <button type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white font-bold uppercase tracking-wider border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-white hover:text-black transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            href="/influencer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black mb-6 hover:-translate-x-1 transition-transform"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
            <span>Back to Dashboard</span>
          </Link>

          <h1 className="text-6xl font-black text-black uppercase leading-none mb-4">
            Link Analytics
          </h1>
          <p className="text-xl font-bold text-black/60 border-l-[4px] border-[#FF90E8] pl-4 max-w-2xl">
            Track performance, optimize range, and dominate clicks.
          </p>
        </motion.div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BrutalMetric
                label="Total Clicks"
                value={analytics.totalClicks.toLocaleString()}
                icon={MousePointerClick}
                color="bg-[#FFD93D]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BrutalMetric
                label="Products Shared"
                value={analytics.totalProducts}
                icon={Package}
                color="bg-[#FF90E8]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BrutalMetric
                label="Avg Clicks/Product"
                value={analytics.averageClicks.toFixed(1)}
                icon={TrendingUp}
                color="bg-[#90E8FF]"
              />
            </motion.div>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-6">
          <div className="flex items-end justify-between border-b-[3px] border-black pb-4 mb-8">
            <h2 className="text-3xl font-black uppercase text-black">
              Performance Breakdown
            </h2>
            <div className="hidden sm:block text-xs font-bold uppercase bg-black text-white px-3 py-1">
              Live Data
            </div>
          </div>

          {analytics && analytics.products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-16 text-center"
            >
              <div className="w-20 h-20 bg-[#FDFBF7] border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3">
                <BarChart3 className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">
                No Data Yet
              </h3>
              <p className="font-bold text-black/60 uppercase tracking-widest mb-8">
                Start sharing products to see the magic happen.
              </p>
              <Link
                href="/influencer/try-on"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-black uppercase tracking-wider border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-white hover:text-black transition-all"
              >
                Create Try-On <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {analytics?.products.map((product, index) => (
                  <motion.div
                    key={product.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <BrutalCard className="group">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Product Image */}
                        <div className="w-24 h-24 border-[3px] border-black bg-gray-100 flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                          {product.productImage ? (
                            <AppImage
                              src={product.productImage}
                              alt={product.productName}
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-black/20" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-black uppercase text-black mb-2 truncate leading-tight">
                            {product.productName}
                          </h3>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="px-3 py-1 bg-[#BAFCA2] border-[2px] border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {product.clickCount} Clicks
                            </div>
                            <div className="px-3 py-1 bg-white border-[2px] border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {product.uniqueClicks} Unique
                            </div>
                            {product.lastClickedAt && (
                              <div className="px-3 py-1 bg-white border-[2px] border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black/50">
                                Last: {new Date(product.lastClickedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 px-3 py-1 border-[2px] border-black text-xs font-mono font-bold truncate max-w-[200px] sm:max-w-xs">
                              {product.originalUrl ? shortenUrl(product.originalUrl) : product.maskedUrl}
                            </div>
                            <button type="button"
                              onClick={() => handleCopyLink(product.maskedUrl)}
                              className="p-1.5 bg-white border-[2px] border-black hover:bg-[#FFD93D] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                              title="Copy tracked link"
                            >
                              {copiedLink === product.maskedUrl ? (
                                <Check className="w-4 h-4 text-black" />
                              ) : (
                                <Copy className="w-4 h-4 text-black" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <a
                            href={product.maskedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none px-6 py-3 bg-white text-black font-bold uppercase text-sm border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                          >
                            Visit Link <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </BrutalCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
