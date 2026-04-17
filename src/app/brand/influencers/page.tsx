'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppImage } from '@/components/ui/AppImage'
import { toast } from '@/lib/simple-sonner'
import {
    Users,
    Search,
    Filter,
    Loader2,
    MessageCircle,
    Instagram,
    ExternalLink,
    Star,
    TrendingUp,
    ChevronDown
} from 'lucide-react'

interface Influencer {
    id: string
    email: string
    name: string
    bio?: string
    followers: number
    engagement_rate: string
    niches: string[]
    profile_image?: string
}

const NICHES = ['Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Food', 'Travel', 'Tech', 'Gaming']
const FOLLOWER_RANGES = [
    { label: 'All', min: 0, max: 999999999 },
    { label: 'Nano (1K-10K)', min: 1000, max: 10000 },
    { label: 'Micro (10K-100K)', min: 10000, max: 100000 },
    { label: 'Macro (100K-1M)', min: 100000, max: 1000000 },
    { label: 'Mega (1M+)', min: 1000000, max: 999999999 },
]

export default function BrandInfluencersPage() {
    const router = useRouter()
    const [influencers, setInfluencers] = useState<Influencer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedNiche, setSelectedNiche] = useState('')
    const [followerRange, setFollowerRange] = useState(FOLLOWER_RANGES[0])
    const [sortBy, setSortBy] = useState<'followers' | 'engagement'>('followers')
    const [showFilters, setShowFilters] = useState(false)

    const fetchInfluencers = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (selectedNiche) params.set('niche', selectedNiche)
            params.set('minFollowers', followerRange.min.toString())
            params.set('maxFollowers', followerRange.max.toString())
            params.set('sortBy', sortBy)
            params.set('order', 'desc')

            const res = await fetch(`/api/brand/influencers?${params.toString()}`)
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setInfluencers(data.influencers || [])
        } catch (error) {
            console.error('Failed to fetch influencers:', error)
            toast.error('Failed to load influencers')
        } finally {
            setLoading(false)
        }
    }, [search, selectedNiche, followerRange, sortBy])

    useEffect(() => {
        void fetchInfluencers()
    }, [fetchInfluencers])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        fetchInfluencers()
    }

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    const handleMessage = (influencerId: string) => {
        router.push(`/brand/inbox?to=${influencerId}`)
    }

    const handleViewProfile = (influencerId: string) => {
        router.push(`/brand/influencers/${influencerId}`)
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-black mb-1">
                    <Users className="inline-block w-8 h-8 mr-2 -mt-1" />
                    Discover Creators
                </h1>
                <p className="text-black/60 font-medium">
                    Find the perfect creators for your brand collaborations
                </p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-8 animate-fade-in transition-all duration-200 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or niche..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-[#B4F056] border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-full sm:w-auto px-4 py-3 border-2 border-black font-black uppercase flex items-center justify-center gap-2 ${showFilters ? 'bg-black text-white' : 'bg-white'}`}
                    >
                        <Filter className="w-5 h-5" />
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </form>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-black">
                        {/* Niche Filter */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                Niche
                            </label>
                            <select
                                value={selectedNiche}
                                onChange={(e) => setSelectedNiche(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black font-bold bg-white"
                            >
                                <option value="">All Niches</option>
                                {NICHES.map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>

                        {/* Follower Range */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                Follower Count
                            </label>
                            <select
                                value={followerRange.label}
                                onChange={(e) => {
                                    const range = FOLLOWER_RANGES.find(r => r.label === e.target.value)
                                    if (range) setFollowerRange(range)
                                }}
                                className="w-full px-4 py-3 border-2 border-black font-bold bg-white"
                            >
                                {FOLLOWER_RANGES.map(range => (
                                    <option key={range.label} value={range.label}>{range.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'followers' | 'engagement')}
                                className="w-full px-4 py-3 border-2 border-black font-bold bg-white"
                            >
                                <option value="followers">Followers</option>
                                <option value="engagement">Engagement Rate</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
            ) : influencers.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-black/20">
                    <Users className="w-16 h-16 mx-auto mb-4 text-black/30" />
                    <h3 className="text-xl font-black text-black/60 mb-2">No Creators Found</h3>
                    <p className="text-black/40 font-medium">
                        Try adjusting your filters or search terms
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {influencers.map((influencer) => (
                        <div
                            key={influencer.id}
                            className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all animate-fade-in"
                        >
                            {/* Profile Header */}
                            <div className="p-4 border-b-2 border-black">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="relative w-16 h-16 bg-gradient-to-br from-[#B4F056] to-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0">
                                        {influencer.profile_image ? (
                                            <AppImage
                                                src={influencer.profile_image}
                                                alt={influencer.name}
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <span className="text-2xl font-black">
                                                {influencer.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-lg truncate">{influencer.name}</h3>
                                        <p className="text-sm text-black/60 font-medium truncate">
                                            {influencer.bio || 'Content Creator'}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {influencer.niches?.slice(0, 2).map(niche => (
                                                <span
                                                    key={niche}
                                                    className="px-2 py-0.5 text-xs font-bold bg-gray-100 border border-black"
                                                >
                                                    {niche}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
                                <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-black/60 text-xs font-bold uppercase mb-1">
                                        <Instagram className="w-3.5 h-3.5" />
                                        Followers
                                    </div>
                                    <div className="text-xl font-black">
                                        {formatFollowers(influencer.followers)}
                                    </div>
                                </div>
                                <div className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-black/60 text-xs font-bold uppercase mb-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Engagement
                                    </div>
                                    <div className="text-xl font-black">
                                        {influencer.engagement_rate}%
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 flex flex-col sm:flex-row gap-2">
                                <button type="button"
                                    onClick={() => handleViewProfile(influencer.id)}
                                    className="flex-1 py-2 border-2 border-black font-bold text-sm uppercase hover:bg-gray-100 active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Profile
                                </button>
                                <button type="button"
                                    onClick={() => handleMessage(influencer.id)}
                                    className="flex-1 py-2 bg-[#B4F056] border-2 border-black font-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
