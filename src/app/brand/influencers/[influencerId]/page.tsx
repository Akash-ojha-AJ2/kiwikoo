/**
 * INFLUENCER DETAIL PAGE
 * 
 * View detailed influencer profile from brand perspective
 * Uses Supabase only - NO Prisma
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Instagram, MessageCircle } from 'lucide-react'
import { BrutalLoader } from '@/components/ui/BrutalLoader'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/simple-sonner'

interface InfluencerData {
  id: string
  fullName: string
  email: string
  bio?: string
  niche?: string
  followers?: number
  engagementRate?: number
  profileImage?: string
  socials?: {
    instagram?: string
    youtube?: string
    tiktok?: string
  }
}

type InfluencerApiRecord = {
  id: string
  email: string
  name: string
  bio?: string
  followers?: number
  engagement_rate?: string
  niches?: string[]
  profile_image?: string | null
}

export default function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ influencerId: string }>
}) {
  const router = useRouter()
  const [influencer, setInfluencer] = useState<InfluencerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { influencerId } = await params

      try {
        // Fetch influencer from our API
        const res = await fetch(`/api/brand/influencers?id=${influencerId}`)
        if (!res.ok) {
          throw new Error('Failed to load influencer')
        }
        const data = await res.json()

        // Find the specific influencer
        const found = data.influencers?.find((i: InfluencerApiRecord) => i.id === influencerId)
        if (found) {
          setInfluencer({
            id: found.id,
            fullName: found.name || 'Creator',
            email: found.email || '',
            bio: found.bio || '',
            niche: found.niches?.[0],
            followers: found.followers || 0,
            engagementRate: Number(found.engagement_rate || 0),
            profileImage: found.profile_image || undefined,
          })
        }
      } catch (error) {
        console.error('Failed to load influencer:', error)
        toast.error('Failed to load influencer details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const handleMessage = () => {
    if (influencer) {
      router.push(`/brand/inbox?to=${influencer.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFCF5] flex items-center justify-center">
        <BrutalLoader size="lg" tone="brand" label="Loading profile" />
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-[#FFFCF5] pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-black mb-4">Creator Not Found</h1>
          <p className="text-black/60 mb-6">This creator profile doesn&apos;t exist or has been removed.</p>
          <Link
            href="/brand/influencers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#B4F056] border-[3px] border-black font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creators
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFCF5] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/brand/influencers"
          className="inline-flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Creators
        </Link>

        {/* Profile Card */}
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-[#B4F056] to-[#FFD93D] border-[3px] border-black flex items-center justify-center text-4xl font-black">
                {influencer.fullName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{influencer.fullName}</h1>
              {influencer.niche && (
                <span className="inline-block px-3 py-1 bg-[#B4F056] border-2 border-black text-sm font-bold mb-4">
                  {influencer.niche}
                </span>
              )}

              {influencer.bio && (
                <p className="text-black/70 mb-6">{influencer.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 border-2 border-black p-4">
                  <div className="text-2xl font-black">
                    {influencer.followers
                      ? influencer.followers >= 1000000
                        ? `${(influencer.followers / 1000000).toFixed(1)}M`
                        : influencer.followers >= 1000
                          ? `${(influencer.followers / 1000).toFixed(1)}K`
                          : influencer.followers
                      : 'N/A'}
                  </div>
                  <div className="text-xs font-bold text-black/60 uppercase">Followers</div>
                </div>
                <div className="bg-gray-50 border-2 border-black p-4">
                  <div className="text-2xl font-black">
                    {influencer.engagementRate
                      ? `${influencer.engagementRate.toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-xs font-bold text-black/60 uppercase">Engagement</div>
                </div>
              </div>

              {/* Social Links */}
              {influencer.socials?.instagram && (
                <a
                  href={`https://instagram.com/${influencer.socials.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black mb-4"
                >
                  <Instagram className="w-4 h-4" />
                  {influencer.socials.instagram}
                </a>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleMessage}
                  className="px-6 py-3 bg-[#B4F056] border-[3px] border-black font-bold hover:bg-[#a3e04a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                {influencer.email && (
                  <a
                    href={`mailto:${influencer.email}`}
                    className="px-6 py-3 bg-white border-[3px] border-black font-bold hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
