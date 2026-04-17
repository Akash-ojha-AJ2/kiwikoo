import Link from 'next/link'
import { getCostMonitorData } from '@/lib/generation-limiter'

// Force dynamic rendering - this page uses server state
export const dynamic = 'force-dynamic'

export default async function CostMonitorPage() {
  const data = getCostMonitorData()

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal">Cost Monitor</h1>
            <p className="text-charcoal/60">Track daily spend and generation limits.</p>
          </div>
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-full border border-charcoal/15 text-charcoal text-sm font-medium hover:bg-charcoal/5 transition-colors"
          >
            Back to admin
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm border border-charcoal/10">
            <div className="text-xs uppercase tracking-wider text-charcoal/50">Daily spend</div>
            <div className="text-2xl font-semibold text-charcoal mt-2">
              ${data.dailySpend.toFixed(2)}
            </div>
            <div className="text-sm text-charcoal/50 mt-1">
              Limit: ${data.dailyLimit.toFixed(2)}
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm border border-charcoal/10">
            <div className="text-xs uppercase tracking-wider text-charcoal/50">Generations today</div>
            <div className="text-2xl font-semibold text-charcoal mt-2">
              {data.totalGenerationsToday}
            </div>
            <div className="text-sm text-charcoal/50 mt-1">
              Limit: {data.limits.MAX_GENERATIONS_PER_DAY}
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm border border-charcoal/10">
            <div className="text-xs uppercase tracking-wider text-charcoal/50">Kill switch</div>
            <div className={`text-2xl font-semibold mt-2 ${data.killSwitchActive ? 'text-red-600' : 'text-emerald-700'}`}>
              {data.killSwitchActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-charcoal/50 mt-1">
              Threshold: ${data.killSwitchThreshold.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white/70 p-6 shadow-sm border border-charcoal/10">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Recent activity</h2>
          <div className="space-y-3 text-sm text-charcoal/70">
            {data.recentRecords.length === 0 && (
              <div className="text-charcoal/50">No recent records.</div>
            )}
            {data.recentRecords.map((record, idx) => (
              <div key={`${record.timestamp}-${idx}`} className="flex flex-col gap-1 border-b border-charcoal/5 pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-charcoal">{record.result.toUpperCase()}</span>
                  <span className="text-xs text-charcoal/40">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-charcoal/50">
                  Cost: ${record.estimatedCostUsd.toFixed(3)} · Gemini calls: {record.geminiCalls} · Model: {record.modelUsed}
                </div>
                {record.blockReason && (
                  <div className="text-xs text-red-600">Block reason: {record.blockReason}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
