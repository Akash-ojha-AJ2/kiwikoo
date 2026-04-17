'use client'

import { useMemo, useState, useCallback } from 'react'
import { X, Lightbulb, TrendingUp, AlertTriangle, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Campaign } from '@/lib/campaigns/types'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RECOMMENDATION ENGINE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Recommendation {
    id: string
    type: 'insight' | 'warning' | 'opportunity' | 'success'
    icon: React.ElementType
    emoji: string
    message: string
    action?: string
}

function generateRecommendations(campaigns: Campaign[]): Recommendation[] {
    const recs: Recommendation[] = []

    if (campaigns.length === 0) return recs

    const activeCampaigns = campaigns.filter(c => c.status === 'active')
    const draftCampaigns = campaigns.filter(c => c.status === 'draft')

    // ── Stale drafts ──
    const staleDrafts = draftCampaigns.filter(c => {
        const created = new Date(c.created_at)
        const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > 7
    })

    if (staleDrafts.length > 0) {
        recs.push({
            id: 'stale-drafts',
            type: 'warning',
            icon: AlertTriangle,
            emoji: '⚠️',
            message: `${staleDrafts.length} campaign${staleDrafts.length > 1 ? 's have' : ' has'} been in draft for 7+ days — launch or archive them to keep your dashboard clean.`,
            action: 'Review Drafts',
        })
    }

    // ── Top performer ──
    if (activeCampaigns.length > 1) {
        const withMetrics = activeCampaigns.filter(c => (c.impressions ?? 0) > 0)
        if (withMetrics.length > 1) {
            const avgCTR = withMetrics.reduce((s, c) => {
                const ctr = (c.impressions ?? 0) > 0 ? ((c.clicks ?? 0) / (c.impressions ?? 1)) * 100 : 0
                return s + ctr
            }, 0) / withMetrics.length

            const topCampaign = withMetrics.reduce((best, c) => {
                const ctr = ((c.clicks ?? 0) / (c.impressions ?? 1)) * 100
                const bestCtr = ((best.clicks ?? 0) / (best.impressions ?? 1)) * 100
                return ctr > bestCtr ? c : best
            })

            const topCTR = ((topCampaign.clicks ?? 0) / (topCampaign.impressions ?? 1)) * 100
            const outperformRatio = avgCTR > 0 ? topCTR / avgCTR : 0

            if (outperformRatio > 1.5) {
                recs.push({
                    id: 'top-performer',
                    type: 'success',
                    icon: TrendingUp,
                    emoji: '📈',
                    message: `"${topCampaign.title}" has ${outperformRatio.toFixed(1)}x higher CTR than your average — consider increasing its budget for maximum impact.`,
                    action: 'View Campaign',
                })
            }
        }
    }

    // ── No active campaigns ──
    if (activeCampaigns.length === 0 && campaigns.length > 0) {
        recs.push({
            id: 'no-active',
            type: 'opportunity',
            icon: Target,
            emoji: '🎯',
            message: 'You have no active campaigns right now. Activate a draft or create a new campaign to start driving results.',
            action: 'Create Campaign',
        })
    }

    // ── Strategy completeness check ──
    const incompleteStrategies = campaigns.filter(c => {
        const strategy = c.strategy as Record<string, unknown> | null
        if (!strategy) return true
        const hasAngles = Array.isArray(strategy.content_angles) && (strategy.content_angles as unknown[]).length > 0
        const hasHooks = Array.isArray(strategy.hooks) && (strategy.hooks as unknown[]).length > 0
        return !hasAngles && !hasHooks
    })

    if (incompleteStrategies.length > 0 && incompleteStrategies.length < campaigns.length) {
        recs.push({
            id: 'incomplete-strategy',
            type: 'insight',
            icon: Lightbulb,
            emoji: '💡',
            message: `${incompleteStrategies.length} campaign${incompleteStrategies.length > 1 ? 's are' : ' is'} missing content angles or hooks. Use the AI Strategist to fill the gaps and boost performance.`,
            action: 'Improve Strategy',
        })
    }

    // ── Spend concentration ──
    if (activeCampaigns.length > 2) {
        const totalSpend = activeCampaigns.reduce((s, c) => s + (c.spend ?? 0), 0)
        if (totalSpend > 0) {
            const topSpender = activeCampaigns.reduce((top, c) => (c.spend ?? 0) > (top.spend ?? 0) ? c : top)
            const topSpendPct = ((topSpender.spend ?? 0) / totalSpend) * 100
            if (topSpendPct > 60) {
                recs.push({
                    id: 'spend-concentration',
                    type: 'warning',
                    icon: AlertTriangle,
                    emoji: '💰',
                    message: `"${topSpender.title}" accounts for ${topSpendPct.toFixed(0)}% of total spend. Consider diversifying budget across campaigns to reduce risk.`,
                })
            }
        }
    }

    // ── Goal diversity ──
    const goals = new Set(campaigns.map(c => c.goal).filter(Boolean))
    if (goals.size === 1 && campaigns.length > 3) {
        const goalName = campaigns[0].goal || 'the same type'
        recs.push({
            id: 'goal-diversity',
            type: 'insight',
            icon: Lightbulb,
            emoji: '🎨',
            message: `All your campaigns target "${goalName}". Diversify with awareness or traffic campaigns to build a full-funnel strategy.`,
        })
    }

    // ── Campaigns with zero impressions ──
    const zeroImpressions = activeCampaigns.filter(c => (c.impressions ?? 0) === 0)
    if (zeroImpressions.length > 0) {
        recs.push({
            id: 'zero-impressions',
            type: 'warning',
            icon: AlertTriangle,
            emoji: '🔇',
            message: `${zeroImpressions.length} active campaign${zeroImpressions.length > 1 ? 's have' : ' has'} zero impressions. Check targeting and creative assets to ensure they're reaching your audience.`,
        })
    }

    // ── Visual generation suggestion ──
    const campaignsWithoutVisuals = campaigns.filter(c => {
        const creative = c.creative as Record<string, unknown> | null
        const assets = creative?.creative_assets
        return !assets || (Array.isArray(assets) && assets.length === 0)
    })

    if (campaignsWithoutVisuals.length > 0) {
        recs.push({
            id: 'no-visuals',
            type: 'opportunity',
            icon: Target,
            emoji: '🖼️',
            message: `${campaignsWithoutVisuals.length} campaign${campaignsWithoutVisuals.length > 1 ? 's don\'t' : ' doesn\'t'} have AI-generated visuals. Use Campaign Visual Generator to create stunning ad creatives instantly.`,
            action: 'Generate Visuals',
        })
    }

    return recs
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPE COLORS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const TYPE_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
    insight: {
        bg: 'bg-[#B4F056]/8',
        border: 'border-[#B4F056]/30',
        iconBg: 'bg-[#B4F056]/20',
    },
    warning: {
        bg: 'bg-[#FFD93D]/10',
        border: 'border-[#FFD93D]/40',
        iconBg: 'bg-[#FFD93D]/25',
    },
    opportunity: {
        bg: 'bg-[#A78BFA]/8',
        border: 'border-[#A78BFA]/30',
        iconBg: 'bg-[#A78BFA]/20',
    },
    success: {
        bg: 'bg-[#34D399]/8',
        border: 'border-[#34D399]/30',
        iconBg: 'bg-[#34D399]/20',
    },
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function CampaignRecommendations({ campaigns }: { campaigns: Campaign[] }) {
    const allRecs = useMemo(() => generateRecommendations(campaigns), [campaigns])
    const [dismissed, setDismissed] = useState<Set<string>>(new Set())
    const [currentIndex, setCurrentIndex] = useState(0)

    const recs = useMemo(
        () => allRecs.filter(r => !dismissed.has(r.id)),
        [allRecs, dismissed]
    )

    const handleDismiss = useCallback((id: string) => {
        setDismissed(prev => new Set([...prev, id]))
        if (currentIndex >= recs.length - 1) {
            setCurrentIndex(Math.max(0, recs.length - 2))
        }
    }, [currentIndex, recs.length])

    const handlePrev = useCallback(() => {
        setCurrentIndex(i => Math.max(0, i - 1))
    }, [])

    const handleNext = useCallback(() => {
        setCurrentIndex(i => Math.min(recs.length - 1, i + 1))
    }, [recs.length])

    if (recs.length === 0) return null

    const current = recs[Math.min(currentIndex, recs.length - 1)]
    if (!current) return null

    const style = TYPE_STYLES[current.type] || TYPE_STYLES.insight
    const IconComp = current.icon

    return (
        <div className={`${style.bg} border ${style.border} rounded-2xl p-4 animate-slideUp relative overflow-hidden`}>
            {/* Decorative gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/30 blur-2xl" />
            </div>

            <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div className={`${style.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                    <IconComp className="w-4 h-4 text-black/70" strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-black/40">
                            AI Insight {currentIndex + 1}/{recs.length}
                        </span>
                    </div>
                    <p className="text-[13px] font-medium text-black/75 leading-relaxed">
                        {current.emoji} {current.message}
                    </p>
                    {current.action && (
                        <button
                            type="button"
                            className="mt-2 text-[11px] font-black uppercase tracking-wider text-black/50 hover:text-black transition-colors underline underline-offset-2"
                        >
                            {current.action} →
                        </button>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                    {recs.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-20"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={currentIndex >= recs.length - 1}
                                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-20"
                            >
                                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => handleDismiss(current.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors ml-1"
                        title="Dismiss"
                    >
                        <X className="w-3.5 h-3.5 text-black/30" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Progress dots */}
            {recs.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {recs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-black/40 w-4' : 'bg-black/15'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
