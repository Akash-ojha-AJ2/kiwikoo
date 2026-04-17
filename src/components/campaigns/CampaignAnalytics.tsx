'use client'

import { useMemo } from 'react'
import {
    DollarSign,
    Target,
    BarChart3,
    MousePointer,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react'
import type { Campaign } from '@/lib/campaigns/types'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface AnalyticsData {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    activeCampaigns: number
    totalCampaigns: number
    avgCTR: number
    avgCPC: number
    statusBreakdown: Record<string, number>
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPUTE ANALYTICS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function computeAnalytics(campaigns: Campaign[]): AnalyticsData {
    const totalSpend = campaigns.reduce((s, c) => s + (c.spend ?? 0), 0)
    const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions ?? 0), 0)
    const totalClicks = campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0)
    const totalConversions = campaigns.reduce((s, c) => s + (c.conversions ?? 0), 0)
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0

    const statusBreakdown: Record<string, number> = {}
    for (const c of campaigns) {
        const status = c.status || 'draft'
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
    }

    return {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        activeCampaigns,
        totalCampaigns: campaigns.length,
        avgCTR,
        avgCPC,
        statusBreakdown,
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MINI SPARKLINE (SVG)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MiniSparkline({ data, color = '#B4F056', width = 72, height = 24 }: {
    data: number[]
    color?: string
    width?: number
    height?: number
}) {
    if (data.length < 2) return null

    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const padding = 2

    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = padding + (1 - (val - min) / range) * (height - padding * 2)
        return `${x},${y}`
    }).join(' ')

    const trend = data[data.length - 1] >= data[0] ? 'up' : 'down'
    const gradientId = `spark-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={trend === 'up' ? color : '#FF6B6B'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={trend === 'up' ? color : '#FF6B6B'} stopOpacity={0} />
                </linearGradient>
            </defs>
            {/* Area fill */}
            <polygon
                points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                fill={`url(#${gradientId})`}
            />
            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={trend === 'up' ? color : '#FF6B6B'}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            {(() => {
                const lastPoint = points.split(' ').pop()?.split(',')
                if (!lastPoint) return null
                return (
                    <circle
                        cx={Number(lastPoint[0])}
                        cy={Number(lastPoint[1])}
                        r={2}
                        fill={trend === 'up' ? color : '#FF6B6B'}
                    />
                )
            })()}
        </svg>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATUS RING CHART (SVG)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const STATUS_COLORS: Record<string, string> = {
    active: '#B4F056',
    draft: '#FFD93D',
    paused: '#94A3B8',
    completed: '#1a1a1a',
}

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    draft: 'Draft',
    paused: 'Paused',
    completed: 'Completed',
}

function StatusRingChart({ breakdown, total }: { breakdown: Record<string, number>; total: number }) {
    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xs font-medium text-black/30">No campaigns</p>
            </div>
        )
    }

    const size = 100
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    let currentOffset = 0

    const segments = Object.entries(breakdown).map(([status, count]) => {
        const percentage = count / total
        const dashLength = percentage * circumference
        const segment = {
            status,
            count,
            percentage,
            dashArray: `${dashLength} ${circumference - dashLength}`,
            dashOffset: -currentOffset,
            color: STATUS_COLORS[status] || '#E5E7EB',
        }
        currentOffset += dashLength
        return segment
    })

    return (
        <div className="flex items-center gap-4">
            <div className="relative shrink-0">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {segments.map((seg) => (
                        <circle
                            key={seg.status}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={seg.dashArray}
                            strokeDashoffset={seg.dashOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            className="transition-all duration-700"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-black leading-none">{total}</p>
                        <p className="text-[8px] font-bold uppercase tracking-wider text-black/40">Total</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                {segments.map((seg) => (
                    <div key={seg.status} className="flex items-center gap-2">
                        <span
                            className="w-2.5 h-2.5 rounded-[3px] border border-black/10 shrink-0"
                            style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-[11px] font-semibold text-black/60">
                            {STATUS_LABELS[seg.status] || seg.status}
                        </span>
                        <span className="text-[11px] font-black tabular-nums">{seg.count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATED NUMBER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function formatNumber(value: number, prefix = '', suffix = '', decimals = 0): string {
    if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M${suffix}`
    if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(1)}K${suffix}`
    return `${prefix}${value.toFixed(decimals)}${suffix}`
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KPI CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function KPICard({ icon: Icon, label, value, trend, sparkData, color, delay = 0 }: {
    icon: React.ElementType
    label: string
    value: string
    trend?: 'up' | 'down' | 'flat'
    sparkData?: number[]
    color: string
    delay?: number
}) {
    return (
        <div
            className="bg-white border border-black/8 rounded-2xl p-4 hover:border-black/15 transition-all animate-slideUp group"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${color}25` }}
                >
                    <Icon className="w-4 h-4" style={{ color }} strokeWidth={2.5} />
                </div>
                {sparkData && sparkData.length > 1 && (
                    <MiniSparkline data={sparkData} color={color} />
                )}
            </div>
            <p className="text-xl font-black text-black tracking-tight leading-none mb-1">{value}</p>
            <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">{label}</p>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-black ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-black/30'
                        }`}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend === 'flat' && <Minus className="w-3 h-3" />}
                    </span>
                )}
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GENERATE MOCK SPARKLINE DATA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function generateSparkData(baseLine: number, variance = 0.3, points = 7): number[] {
    const data: number[] = []
    let current = baseLine * (1 - variance * 0.5)
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.4) * baseLine * variance
        current = Math.max(0, current + change)
        data.push(current)
    }
    // Make last point close to the actual value
    data[data.length - 1] = baseLine
    return data
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function CampaignAnalytics({ campaigns }: { campaigns: Campaign[] }) {
    const analytics = useMemo(() => computeAnalytics(campaigns), [campaigns])

    // Generate sparkline data based on real values (cosmetic trend lines)
    const sparklines = useMemo(() => ({
        spend: generateSparkData(analytics.totalSpend),
        impressions: generateSparkData(analytics.totalImpressions),
        ctr: generateSparkData(analytics.avgCTR, 0.2),
        conversions: generateSparkData(analytics.totalConversions),
    }), [analytics])

    if (campaigns.length === 0) return null

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KPICard
                    icon={DollarSign}
                    label="Total Spend"
                    value={formatNumber(analytics.totalSpend, '₹')}
                    trend={analytics.totalSpend > 0 ? 'up' : 'flat'}
                    sparkData={sparklines.spend}
                    color="#FF8C69"
                    delay={0}
                />
                <KPICard
                    icon={BarChart3}
                    label="Impressions"
                    value={formatNumber(analytics.totalImpressions)}
                    trend={analytics.totalImpressions > 0 ? 'up' : 'flat'}
                    sparkData={sparklines.impressions}
                    color="#A78BFA"
                    delay={50}
                />
                <KPICard
                    icon={MousePointer}
                    label="Avg CTR"
                    value={`${analytics.avgCTR.toFixed(2)}%`}
                    trend={analytics.avgCTR > 2 ? 'up' : analytics.avgCTR > 0 ? 'flat' : 'flat'}
                    sparkData={sparklines.ctr}
                    color="#34D399"
                    delay={100}
                />
                <KPICard
                    icon={Target}
                    label="Conversions"
                    value={formatNumber(analytics.totalConversions)}
                    trend={analytics.totalConversions > 0 ? 'up' : 'flat'}
                    sparkData={sparklines.conversions}
                    color="#B4F056"
                    delay={150}
                />
            </div>

            {/* Status Distribution + Top Performer */}
            <div className="grid md:grid-cols-2 gap-3">
                {/* Status Ring */}
                <div className="bg-white border border-black/8 rounded-2xl p-5 animate-slideUp" style={{ animationDelay: '200ms' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-3">
                        Campaign Status
                    </p>
                    <StatusRingChart
                        breakdown={analytics.statusBreakdown}
                        total={analytics.totalCampaigns}
                    />
                </div>

                {/* Quick Stats */}
                <div className="bg-white border border-black/8 rounded-2xl p-5 animate-slideUp" style={{ animationDelay: '250ms' }}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-3">
                        Performance Snapshot
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-black/60">Active Campaigns</span>
                            <span className="text-sm font-black text-black">{analytics.activeCampaigns}</span>
                        </div>
                        <div className="h-px bg-black/5" />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-black/60">Avg Cost/Click</span>
                            <span className="text-sm font-black text-black">
                                {analytics.avgCPC > 0 ? `₹${analytics.avgCPC.toFixed(2)}` : '—'}
                            </span>
                        </div>
                        <div className="h-px bg-black/5" />
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-black/60">Total Clicks</span>
                            <span className="text-sm font-black text-black">{analytics.totalClicks.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-black/5" />
                        {(() => {
                            const best = campaigns.reduce((top, c) =>
                                (c.impressions ?? 0) > (top?.impressions ?? 0) ? c : top, campaigns[0])
                            if (!best || (best.impressions ?? 0) === 0) return null
                            return (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-black/60 shrink-0">Top Campaign</span>
                                    <span className="text-xs font-black text-black truncate max-w-[160px]">{best.title}</span>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}
