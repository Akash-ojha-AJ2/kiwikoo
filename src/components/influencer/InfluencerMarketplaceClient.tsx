'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import BadgeDisplay, { type BadgeTier } from '@/components/influencer/BadgeDisplay'

interface Influencer {
  id: string
  userId: string
  bio?: string
  niches?: any
  followers?: number
  pricePerPost?: number
  engagementRate?: number
  badgeTier?: BadgeTier
  badgeScore?: number
  portfolioPreview?: string[]
  collaborationCount?: number
  user?: {
    id: string
    name?: string
    slug?: string
    email?: string
  }
}

interface InfluencerMarketplaceClientProps {
  influencers: Influencer[]
}

export default function InfluencerMarketplaceClient({
  influencers,
}: InfluencerMarketplaceClientProps) {
  return (
    <>
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {influencers.length} {influencers.length === 1 ? 'influencer' : 'influencers'} found
        </p>
      </div>

      {influencers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No influencers found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {influencers.map((influencer, index) => (
            <motion.div
              key={influencer.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                      {influencer.user?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <CardTitle className="text-lg break-words">{influencer.user?.name || 'Creator'}</CardTitle>
                        <BadgeDisplay tier={influencer.badgeTier ?? null} />
                      </div>
                      <CardDescription className="line-clamp-2 text-xs">
                        {influencer.bio || 'No bio available'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {/* Niches */}
                  {influencer.niches && Array.isArray(influencer.niches) && influencer.niches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(influencer.niches as string[]).slice(0, 3).map((niche: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-700 dark:text-zinc-300 font-medium"
                        >
                          {niche}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Followers</p>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {influencer.followers
                          ? `${(influencer.followers / 1000).toFixed(1)}k`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Price/Post</p>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {influencer.pricePerPost
                          ? `₹${influencer.pricePerPost.toLocaleString()}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Collabs</p>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{influencer.collaborationCount || 0}</p>
                    </div>
                  </div>

                  {/* Portfolio Preview */}
                  {influencer.portfolioPreview && influencer.portfolioPreview.length > 0 && (
                    <div className="flex gap-2">
                      {influencer.portfolioPreview.slice(0, 2).map((image: string, index: number) => (
                        <div
                          key={index}
                          className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0"
                        >
                          <Image
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button asChild className="w-full mt-2">
                      <Link href={`/brand/influencers/${influencer.userId}`}>
                        View Profile
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}

