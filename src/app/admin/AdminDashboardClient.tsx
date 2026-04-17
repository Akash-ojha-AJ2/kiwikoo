'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, X, Clock, User, Mail, Calendar, RefreshCw, Search } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import BadgeDisplay, { type BadgeTier } from '@/components/influencer/BadgeDisplay'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'
import { createClient } from '@/lib/auth-client'

interface OnboardingData {
  gender?: string | null
  niches?: string[] | null
  audienceType?: string[] | null
  preferredCategories?: string[] | null
  socials?: Record<string, string> | null
  bio?: string | null
  followers?: number | null
  engagementRate?: number | null
  audienceRate?: number | null
  retentionRate?: number | null
  badgeScore?: number | null
  badgeTier?: string | null
  onboardingCompleted?: boolean
}

interface InfluencerApplication {
  user_id: string
  email: string
  full_name: string | null
  avatar_url?: string | null
  status: 'none' | 'pending' | 'approved' | 'rejected' // Use 'none' instead of 'draft'
  created_at: string
  updated_at: string
  reviewed_at: string | null
  review_note: string | null
  onboarding?: OnboardingData | null
  user?: {
    id: string
    email: string
    name: string | null
    createdAt: Date | string
  } | null
}

interface MetricsDraft {
  followers: string
  engagementRatePercent: string
  audienceRate: string
  retentionRate: string
  badgeTier: '' | 'platinum' | 'gold' | 'silver' | 'bronze'
}

interface AdminDashboardClientProps {
  initialApplications: InfluencerApplication[]
  /** Optional legacy fallback mode; full mode is the default data path */
  dataSource?: 'full' | 'supabase-only'
}

function getSocialVerifyUrl(platform: string, username: string) {
  if (!username) return undefined
  const cleanUsername = username.replace(/^@/, '')
  switch (platform.toLowerCase()) {
    case 'instagram': return `https://instagram.com/${cleanUsername}`
    case 'youtube': return `https://youtube.com/@${cleanUsername}`
    case 'facebook': return `https://facebook.com/${cleanUsername}`
    case 'snapchat': return `https://www.snapchat.com/add/${cleanUsername}`
    default: return undefined
  }
}
export default function AdminDashboardClient({ initialApplications, dataSource = 'full' }: AdminDashboardClientProps) {
  const [applications, setApplications] = useState<InfluencerApplication[]>(initialApplications)
  const [loading, setLoading] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'none'>('pending')
  const [sortBy, setSortBy] = useState<'created_at' | 'badgeScore' | 'followers' | 'engagementRate'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterNiche, setFilterNiche] = useState<string>('')
  const [filterGender, setFilterGender] = useState<string>('')
  const [filterPlatform, setFilterPlatform] = useState<string>('')
  const [metricsDrafts, setMetricsDrafts] = useState<Record<string, MetricsDraft>>({})

  const refreshRef = useRef<() => Promise<void>>(() => Promise.resolve())
  useEffect(() => {
    refreshRef.current = refresh
  })

  useEffect(() => {
    setMetricsDrafts((prev) => {
      const next: Record<string, MetricsDraft> = { ...prev }
      for (const app of applications) {
        if (!next[app.user_id]) {
          next[app.user_id] = {
            followers: app.onboarding?.followers != null ? String(app.onboarding.followers) : '',
            engagementRatePercent:
              app.onboarding?.engagementRate != null ? String((Number(app.onboarding.engagementRate) * 100).toFixed(2)) : '',
            audienceRate: app.onboarding?.audienceRate != null ? String(app.onboarding.audienceRate) : '',
            retentionRate: app.onboarding?.retentionRate != null ? String(app.onboarding.retentionRate) : '',
            badgeTier: ((app.onboarding?.badgeTier || '') as MetricsDraft['badgeTier']),
          }
        }
      }
      return next
    })
  }, [applications])

  // Realtime: refetch when profiles change. Enable in Supabase: Database → Replication → add table "profiles".
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          refreshRef.current()
          toast.info('Applications updated')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const visibleApplications = useMemo(() => {
    const q = query.trim().toLowerCase()

    // DEFENSIVE: Filter out invalid states first
    const validApps = applications.filter((app) => {
      // Keep legacy rows that already have a review status, even if onboarding flag is missing/false.
      if (app.onboarding && !app.onboarding.onboardingCompleted && app.status === 'none') {
        return false
      }
      return true
    })

    let filtered = validApps.filter((app) => {
      // Status filter
      const matchesFilter = activeFilter === 'all' ? true : app.status === activeFilter
      if (!matchesFilter) return false

      // Search query
      if (q) {
        const hay = `${app.email} ${app.full_name || ''} ${app.onboarding?.bio || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      // Niche filter
      if (filterNiche && app.onboarding?.niches) {
        const niches = Array.isArray(app.onboarding.niches) ? app.onboarding.niches : []
        if (!niches.includes(filterNiche)) return false
      }

      // Gender filter
      if (filterGender && app.onboarding?.gender !== filterGender) return false

      // Platform filter (check socials)
      if (filterPlatform && app.onboarding?.socials) {
        const socials = app.onboarding.socials as Record<string, string>
        if (!socials[filterPlatform.toLowerCase()]) return false
      }

      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = 0
      let bVal: any = 0

      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (sortBy === 'badgeScore') {
        aVal = a.onboarding?.badgeScore ?? 0
        bVal = b.onboarding?.badgeScore ?? 0
      } else if (sortBy === 'followers') {
        aVal = a.onboarding?.followers ?? 0
        bVal = b.onboarding?.followers ?? 0
      } else if (sortBy === 'engagementRate') {
        aVal = a.onboarding?.engagementRate ?? 0
        bVal = b.onboarding?.engagementRate ?? 0
      }

      const aNum = typeof aVal === 'object' && aVal !== null ? Number(aVal) : Number(aVal) || 0
      const bNum = typeof bVal === 'object' && bVal !== null ? Number(bVal) : Number(bVal) || 0

      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
    })

    return filtered
  }, [applications, activeFilter, query, sortBy, sortOrder, filterNiche, filterGender, filterPlatform])

  const refresh = async () => {
    try {
      const params = new URLSearchParams()
      if (activeFilter !== 'all') params.set('status', activeFilter)
      params.set('sortBy', sortBy)
      params.set('order', sortOrder)

      const res = await fetch(`/api/admin/influencers?${params.toString()}`, { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to refresh')
      setApplications(Array.isArray(data) ? data : data?.applications || [])
      toast.success('Refreshed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to refresh')
    }
  }

  const handleStatusUpdate = async (userId: string, newStatus: 'approved' | 'rejected', reviewNote?: string) => {
    setLoading(userId)
    try {
      const response = await fetch('/api/admin/influencers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          status: newStatus,
          review_note: reviewNote || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      const updated = await response.json()

      // Update local state IMMEDIATELY (Optimistic UI)
      // Use newStatus directly because API returns raw DB row (approval_status) not mapped entity
      setApplications((prev) =>
        prev.map((app) =>
          app.user_id === userId
            ? {
              ...app,
              status: newStatus,
              reviewed_at: new Date().toISOString(),
              review_note: reviewNote || null,
            }
            : app
        )
      )

      toast.success(`Influencer ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`)

      // Sync with server in background to ensure View consistency
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  const handleMetricsDraftChange = (userId: string, field: keyof MetricsDraft, value: string) => {
    setMetricsDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {
          followers: '',
          engagementRatePercent: '',
          audienceRate: '',
          retentionRate: '',
          badgeTier: '',
        }),
        [field]: value,
      },
    }))
  }

  const handleMetricsSave = async (app: InfluencerApplication) => {
    const draft = metricsDrafts[app.user_id]
    if (!draft) return

    const followers =
      draft.followers.trim() === '' ? undefined : Math.max(0, Math.floor(Number(draft.followers)))
    const engagementRate =
      draft.engagementRatePercent.trim() === '' ? undefined : Number(draft.engagementRatePercent) / 100
    const audienceRate =
      draft.audienceRate.trim() === '' ? undefined : Number(draft.audienceRate)
    const retentionRate =
      draft.retentionRate.trim() === '' ? undefined : Number(draft.retentionRate)

    if (
      (followers !== undefined && !Number.isFinite(followers)) ||
      (engagementRate !== undefined && !Number.isFinite(engagementRate)) ||
      (audienceRate !== undefined && !Number.isFinite(audienceRate)) ||
      (retentionRate !== undefined && !Number.isFinite(retentionRate))
    ) {
      toast.error('Please enter valid numbers before saving.')
      return
    }

    setLoading(app.user_id)
    try {
      const response = await fetch('/api/admin/influencers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: app.user_id,
          followers,
          engagementRate,
          audienceRate,
          retentionRate,
          badgeTier: draft.badgeTier || null,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'Failed to update metrics')
      const saved = data?.influencerProfile || {}
      const savedFollowers = saved.followers != null ? Number(saved.followers).toLocaleString() : '-'
      const savedEngagement =
        saved.engagement_rate != null ? `${(Number(saved.engagement_rate) * 100).toFixed(2)}%` : '-'
      const savedAudience = saved.audience_rate != null ? String(saved.audience_rate) : '-'
      const savedRetention = saved.retention_rate != null ? `${saved.retention_rate}%` : '-'
      const savedTier = saved.badge_tier || '-'
      const savedScore = saved.badge_score != null ? Number(saved.badge_score).toFixed(1) : '-'
      toast.success('Influencer metrics updated in Supabase.', {
        description: `Followers: ${savedFollowers} | ER: ${savedEngagement} | Audience: ${savedAudience} | Retention: ${savedRetention} | Tier: ${savedTier} | Score: ${savedScore}`,
      })
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update metrics')
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />
      case 'rejected':
        return <X className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'none':
        return <Clock className="w-4 h-4" /> // Draft status
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // CRITICAL: Stats must be computed from real data, ensuring:
  // - Only influencers with onboardingCompleted === true are counted
  // - Only valid approvalStatus values are counted
  // - Same dataset powers counters, table list, and filters
  const validApplications = applications.filter((app) => {
    // DEFENSIVE: Assert valid state - skip invalid entries
    if (app.onboarding && !app.onboarding.onboardingCompleted && app.status === 'none') {
      console.warn(`INVALID STATE: Application ${app.user_id} has approvalStatus but onboardingCompleted = false`)
      return false
    }
    return true
  })

  // CRITICAL: Count using exact status values from profiles table
  // Status values: 'none' | 'pending' | 'approved' | 'rejected'
  const pendingCount = validApplications.filter((app) => app.status === 'pending').length
  const approvedCount = validApplications.filter((app) => app.status === 'approved').length
  const rejectedCount = validApplications.filter((app) => app.status === 'rejected').length
  const draftCount = validApplications.filter((app) => app.status === 'none').length

  return (
    <div className="min-h-screen bg-[#FDF6EC] font-sans relative overflow-hidden">
      <DecorativeShapes />

      <div className="relative z-20 mx-auto max-w-6xl p-6 sm:p-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-black/60 font-medium">Review applications and manage platform access.</p>
          </div>
          <button type="button"
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} strokeWidth={2.5} />
            Refresh Data
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending */}
          <div className="bg-[#FFFDF8] rounded-xl p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24 text-black" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD93D] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Clock className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
                <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-md">ACTION REQUIRED</span>
              </div>
              <p className="text-4xl font-black text-black mb-1">{pendingCount}</p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-wide">Pending Reviews</p>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-[#FFFDF8] rounded-xl p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Check className="w-24 h-24 text-black" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-[#B4F056] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Check className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-4xl font-black text-black mb-1">{approvedCount}</p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-wide">Approved Influencers</p>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-[#FFFDF8] rounded-xl p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <X className="w-24 h-24 text-black" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FF8C69] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <X className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-4xl font-black text-black mb-1">{rejectedCount}</p>
              <p className="text-sm font-bold text-black/60 uppercase tracking-wide">Rejected Applications</p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-[#FFFDF8] rounded-xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {dataSource === 'supabase-only' && (
            <div className="px-6 py-4 bg-amber-100 border-b-2 border-amber-400 text-amber-900 text-sm font-medium">
              <strong>Limited data mode:</strong> Some enrichment fields may be unavailable in this environment.
            </div>
          )}
          {/* Toolbar */}
          <div className="p-6 border-b-[3px] border-black flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/50">
            <div>
              <h2 className="text-2xl font-black text-black">Applications</h2>
              <p className="text-sm text-black/60 font-medium mt-1">Manage influencer onboarding requests</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative group">
                <Search className="w-5 h-5 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full sm:w-64 pl-12 pr-4 py-3 rounded-xl border-2 border-black bg-white text-black placeholder:text-black/40 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all font-medium"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'pending', label: 'Pending' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'rejected', label: 'Rejected' },
                  { key: 'all', label: 'All' },
                ].map((f) => (
                  <button type="button"
                    key={f.key}
                    onClick={() => setActiveFilter(f.key as any)}
                    className={`
                        px-4 py-2 rounded-lg font-bold border-2 transition-all
                        ${activeFilter === f.key
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]'
                        : 'bg-white text-black border-black/10 hover:border-black hover:bg-[#FFD93D]/20'
                      }
                      `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="divide-y-[2px] divide-black/5 min-h-[400px]">
            {loading && typeof loading === 'string' ? (
              // Optimistic loading state handled in buttons, 
              // but if full refresh, shown here usually
              null
            ) : null}

            {visibleApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-4 border-2 border-black/10">
                  <Search className="w-10 h-10 text-black/20" />
                </div>
                <p className="text-xl font-bold text-black">No applications found</p>
                <p className="text-black/50 mt-2 max-w-sm">
                  Try adjusting your filters or search query. Only users who completed onboarding appear here.
                </p>
              </div>
            ) : (
              visibleApplications.map((app) => (
                <div key={app.user_id} className="p-6 hover:bg-[#FFD93D]/5 transition-colors group">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border-2 border-black bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                          {app.avatar_url ? (
                            <Image
                              src={app.avatar_url}
                              alt={app.full_name || app.email}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <User className="w-7 h-7 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-black leading-tight">
                            {app.full_name || 'No Name'}
                          </h3>
                          <div className="flex items-center gap-2 text-black/60 font-medium text-sm mt-1">
                            <Mail className="w-4 h-4" />
                            {app.email}
                          </div>

                          {/* Badges/Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`
                                inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border-2 uppercase tracking-wide
                                ${getStatusBadge(app.status)}
                             `}>
                              {getStatusIcon(app.status)}
                              {app.status}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border-2 border-black/10 bg-white text-black/70">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Onboarding Details Grid */}
                      {app.onboarding && (
                        <div className="bg-white/50 rounded-xl border-2 border-black/5 p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-black/50 font-medium">Followers</span>
                            <div className="text-right">
                              <span className="font-bold text-black">{app.onboarding.followers != null ? Number(app.onboarding.followers).toLocaleString() : '-'}</span>
                              <div className="text-[10px] font-medium uppercase tracking-wide text-black/40">From influencer profile</div>
                            </div>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-black/50 font-medium">Engagement</span>
                            <span className="font-bold text-black">
                              {app.onboarding.engagementRate != null
                                ? `${(Number(app.onboarding.engagementRate) * 100).toFixed(2)}%`
                                : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-black/50 font-medium">Badge Score</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black">
                                {app.onboarding.badgeScore != null ? Number(app.onboarding.badgeScore).toFixed(1) : '-'}
                              </span>
                              {app.onboarding.badgeTier && <BadgeDisplay tier={app.onboarding.badgeTier as BadgeTier} />}
                            </div>
                          </div>
                          <div className="flex justify-between border-b border-black/5 pb-2">
                            <span className="text-black/50 font-medium">Gender</span>
                            <span className="font-bold text-black">{app.onboarding.gender ?? '-'}</span>
                          </div>

                          {/* Full width items */}
                          <div className="md:col-span-2 pt-2">
                            <span className="text-black/50 font-medium text-xs uppercase tracking-wider block mb-1">Socials</span>
                            <div className="flex gap-2 flex-wrap">
                              {app.onboarding.socials && Object.entries(app.onboarding.socials as Record<string, string>)
                                .filter(([, url]) => url)
                                .map(([platform, handle]) => (
                                  <a
                                    key={platform}
                                    href={getSocialVerifyUrl(platform, String(handle)) || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 bg-black/5 rounded text-xs font-bold text-black/70 underline-offset-2 hover:bg-black/10 hover:underline"
                                  >
                                    <span className="uppercase">{platform}:</span> {String(handle)}
                                  </a>
                                ))
                              }
                            </div>
                          </div>

                          {app.onboarding.bio && (
                            <div className="md:col-span-2 pt-2">
                              <span className="text-black/50 font-medium text-xs uppercase tracking-wider block mb-1">Bio</span>
                              <p className="text-black/80 italic">{`"${app.onboarding.bio}"`}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:w-64 flex flex-col gap-3 justify-center border-t-2 border-dashed border-black/10 lg:border-t-0 lg:border-l-2 lg:pl-6 pt-4 lg:pt-0">
                      {app.status === 'pending' ? (
                        <>
                          <button type="button"
                            onClick={() => handleStatusUpdate(app.user_id, 'approved')}
                            disabled={loading === app.user_id}
                            className="w-full py-3 bg-[#B4F056] text-black font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Check className="w-5 h-5" strokeWidth={3} />
                            APPROVE
                          </button>
                          <button type="button"
                            onClick={() => {
                              const note = prompt('Rejection reason (optional):')
                              if (note !== null) handleStatusUpdate(app.user_id, 'rejected', note)
                            }}
                            disabled={loading === app.user_id}
                            className="w-full py-3 bg-[#FF8C69] text-black font-black border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <X className="w-5 h-5" strokeWidth={3} />
                            REJECT
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4 bg-black/5 rounded-xl border-2 border-black/5">
                          <span className="text-sm font-bold text-black/40">Action completed</span>
                          <div className="text-xs text-black/30 mt-1">Status: {app.status}</div>
                        </div>
                      )}

                      <div className="rounded-xl border-2 border-black/10 bg-white p-3 space-y-2">
                        <p className="text-xs font-black uppercase text-black/60">Admin Metrics</p>
                        <input
                          type="number"
                          min={0}
                          placeholder="Followers"
                          value={metricsDrafts[app.user_id]?.followers ?? ''}
                          onChange={(e) => handleMetricsDraftChange(app.user_id, 'followers', e.target.value)}
                          className="w-full rounded-lg border-2 border-black/20 px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          placeholder="Engagement %"
                          value={metricsDrafts[app.user_id]?.engagementRatePercent ?? ''}
                          onChange={(e) => handleMetricsDraftChange(app.user_id, 'engagementRatePercent', e.target.value)}
                          className="w-full rounded-lg border-2 border-black/20 px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Audience Rate"
                          value={metricsDrafts[app.user_id]?.audienceRate ?? ''}
                          onChange={(e) => handleMetricsDraftChange(app.user_id, 'audienceRate', e.target.value)}
                          className="w-full rounded-lg border-2 border-black/20 px-2 py-1 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          placeholder="Retention %"
                          value={metricsDrafts[app.user_id]?.retentionRate ?? ''}
                          onChange={(e) => handleMetricsDraftChange(app.user_id, 'retentionRate', e.target.value)}
                          className="w-full rounded-lg border-2 border-black/20 px-2 py-1 text-sm"
                        />
                        <select
                          value={metricsDrafts[app.user_id]?.badgeTier ?? ''}
                          onChange={(e) => handleMetricsDraftChange(app.user_id, 'badgeTier', e.target.value)}
                          className="w-full rounded-lg border-2 border-black/20 px-2 py-1 text-sm bg-white"
                        >
                          <option value="">Badge Tier</option>
                          <option value="platinum">Platinum</option>
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="bronze">Bronze</option>
                        </select>
                        <button type="button"
                          onClick={() => handleMetricsSave(app)}
                          disabled={loading === app.user_id}
                          className="w-full py-2 bg-[#FFD93D] text-black font-black border-2 border-black rounded-lg"
                        >
                          SAVE METRICS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

