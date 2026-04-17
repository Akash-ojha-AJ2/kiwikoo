'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useCampaigns } from '@/lib/hooks/useCampaigns'
import {
  Loader2, Sparkles, Search, SlidersHorizontal, ArrowUpDown,
  ChevronDown, TrendingUp,
} from 'lucide-react'
import { BrutalLoader } from '@/components/ui/BrutalLoader'
import CampaignAnalytics from '@/components/campaigns/CampaignAnalytics'
import CampaignRecommendations from '@/components/campaigns/CampaignRecommendations'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FILTER / SORT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type StatusFilter = 'all' | 'active' | 'draft' | 'paused' | 'completed'
type SortOption = 'newest' | 'oldest' | 'ctr' | 'spend' | 'impressions'

const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-black' },
  { value: 'active', label: 'Active', color: 'bg-[#B4F056]' },
  { value: 'draft', label: 'Draft', color: 'bg-[#FFD93D]' },
  { value: 'paused', label: 'Paused', color: 'bg-gray-300' },
  { value: 'completed', label: 'Completed', color: 'bg-black' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'spend', label: 'Highest Spend' },
  { value: 'impressions', label: 'Most Impressions' },
  { value: 'ctr', label: 'Best CTR' },
]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MINI METRIC BAR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MiniMetricBar({ value, max, color = '#B4F056' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-1 bg-black/[0.05] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CAMPAIGN CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const STATUS_BADGE_COLORS: Record<string, string> = {
  active: 'bg-[#B4F056] text-black',
  draft: 'bg-[#FFD93D] text-black',
  paused: 'bg-gray-200 text-black/60',
  completed: 'bg-black text-white',
}

const GOAL_LABELS: Record<string, string> = {
  sales: 'Sales',
  awareness: 'Awareness',
  launch: 'Launch',
  traffic: 'Traffic',
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading, error } = useCampaigns()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOpen, setSortOpen] = useState(false)

  // ── Computed derived data ──
  const maxImpressions = useMemo(
    () => Math.max(...campaigns.map(c => c.impressions ?? 0), 1),
    [campaigns]
  )

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.brief && c.brief.toLowerCase().includes(q)) ||
        (c.goal && c.goal.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (sortOption) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'spend':
        filtered.sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0))
        break
      case 'impressions':
        filtered.sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
        break
      case 'ctr':
        filtered.sort((a, b) => {
          const aCtr = (a.impressions ?? 0) > 0 ? (a.clicks ?? 0) / (a.impressions ?? 1) : 0
          const bCtr = (b.impressions ?? 0) > 0 ? (b.clicks ?? 0) / (b.impressions ?? 1) : 0
          return bCtr - aCtr
        })
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return filtered
  }, [campaigns, statusFilter, sortOption, searchQuery])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-6 md:pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-5 md:pt-6 pb-10 md:pb-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-black mb-1">Campaigns</h1>
            <p className="text-black/50 text-sm font-medium">
              AI-powered campaign strategy, analytics & visual generation
            </p>
          </div>
          <Link
            href="/brand/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#B4F056] border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            Launch AI Strategist
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 font-medium text-sm">
            Failed to load campaigns. Please refresh the page.
          </div>
        )}

        {campaigns.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-black/8 rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-black text-black mb-2">No campaigns yet</h3>
            <p className="text-black/50 text-center max-w-md mb-8 font-medium">
              Launch the AI Strategist to create your first campaign. It&apos;ll ask strategic
              questions, research your market, generate content ideas, write scripts, and
              auto-create your campaign.
            </p>
            <Link
              href="/brand/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B4F056] border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              Launch AI Strategist
            </Link>
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── ANALYTICS DASHBOARD ── */}
            <CampaignAnalytics campaigns={campaigns} />

            {/* ── AI RECOMMENDATIONS ── */}
            <CampaignRecommendations campaigns={campaigns} />

            {/* ── FILTERS & SEARCH BAR ── */}
            <div className="bg-white border border-black/8 rounded-2xl p-4 animate-slideUp" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" strokeWidth={2} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full pl-9 pr-4 py-2.5 bg-black/[0.03] border border-black/8 rounded-xl text-sm font-medium placeholder:text-black/30 focus:border-[#B4F056] focus:ring-2 focus:ring-[#B4F056]/20 outline-none transition-all"
                  />
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  <SlidersHorizontal className="w-4 h-4 text-black/30 shrink-0" strokeWidth={2} />
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 ${statusFilter === f.value
                          ? 'bg-black text-white'
                          : 'bg-black/[0.04] text-black/50 hover:bg-black/[0.08]'
                        }`}
                    >
                      {f.value !== 'all' && (
                        <span className={`w-2 h-2 rounded-full ${f.color}`} />
                      )}
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-black/[0.03] border border-black/8 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-black/[0.06] transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-black/40" strokeWidth={2} />
                    {SORT_OPTIONS.find(o => o.value === sortOption)?.label || 'Sort'}
                    <ChevronDown className={`w-3 h-3 text-black/30 transition-transform ${sortOpen ? 'rotate-180' : '--'}`} />
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 bg-white border border-black/10 rounded-xl shadow-lg z-20 py-1 min-w-[180px] animate-fadeIn">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortOption(opt.value); setSortOpen(false) }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${sortOption === opt.value
                                ? 'bg-[#B4F056]/15 text-black font-bold'
                                : 'text-black/60 hover:bg-black/[0.03]'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── RESULTS COUNT ── */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && ` - ${statusFilter}`}
              </p>
            </div>

            {/* ── CAMPAIGN GRID ── */}
            {filteredCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 bg-white border border-black/8 rounded-2xl">
                <p className="text-black/40 font-medium text-sm">No campaigns match your filters</p>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setSearchQuery('') }}
                  className="mt-3 text-xs font-bold text-black/50 underline hover:text-black transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCampaigns.map((campaign, idx) => {
                  const created = campaign.created_at
                  const strategy = campaign.strategy as Record<string, unknown> | null
                  const ctr = (campaign.impressions ?? 0) > 0
                    ? ((campaign.clicks ?? 0) / (campaign.impressions ?? 1)) * 100
                    : 0

                  return (
                    <Link
                      key={campaign.id}
                      href={`/brand/campaigns/${campaign.id}`}
                      className="group bg-white border border-black/8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-black/15 transition-all block overflow-hidden animate-slideUp"
                      style={{ animationDelay: `${350 + idx * 40}ms` }}
                    >
                      {/* Card Header */}
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-black text-black leading-tight group-hover:text-black/80 transition-colors">
                            {campaign.title}
                          </h3>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE_COLORS[campaign.status] || 'bg-gray-100 text-black/50'
                              }`}
                          >
                            {campaign.status}
                          </span>
                        </div>

                        {campaign.goal && (
                          <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider mb-2">
                            {GOAL_LABELS[campaign.goal] || campaign.goal}
                          </p>
                        )}

                        {campaign.brief && (
                          <p className="text-xs text-black/50 font-medium mb-3 line-clamp-2 leading-relaxed">
                            {campaign.brief}
                          </p>
                        )}

                        {/* Strategy tags */}
                        {(() => {
                          const angles = strategy?.content_angles
                          if (!angles || !Array.isArray(angles)) return null
                          return (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(angles as (string | { angle?: string })[]).slice(0, 3).map((angle, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-bold bg-[#FFD93D]/30 border border-[#FFD93D]/40 px-1.5 py-0.5 rounded-full"
                                >
                                  {typeof angle === 'string' ? angle : angle?.angle ?? ''}
                                </span>
                              ))}
                              {(angles as unknown[]).length > 3 && (
                                <span className="text-[9px] font-bold text-black/30 px-1 py-0.5">
                                  +{(angles as unknown[]).length - 3}
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      {/* Metrics Bar */}
                      {((campaign.impressions ?? 0) > 0 || (campaign.spend ?? 0) > 0) && (
                        <div className="px-5 pb-3">
                          <div className="grid grid-cols-3 gap-3 py-3 border-t border-black/5">
                            <div>
                              <p className="text-[9px] font-bold text-black/35 uppercase">Impressions</p>
                              <p className="text-sm font-black tabular-nums">{(campaign.impressions ?? 0).toLocaleString()}</p>
                              <div className="mt-1">
                                <MiniMetricBar value={campaign.impressions ?? 0} max={maxImpressions} color="#A78BFA" />
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-black/35 uppercase">CTR</p>
                              <p className="text-sm font-black tabular-nums flex items-center gap-1">
                                {ctr.toFixed(2)}%
                                {ctr > 3 && <TrendingUp className="w-3 h-3 text-green-500" />}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-black/35 uppercase">Spend</p>
                              <p className="text-sm font-black tabular-nums">Rs. {(campaign.spend ?? 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-5 py-3 bg-black/[0.02] border-t border-black/5">
                        <p className="text-[10px] text-black/30 font-bold uppercase">
                          {created
                            ? new Date(created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                            : '--'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CSS */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out both;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out both;
        }
      `}</style>
    </div>
  )
}
