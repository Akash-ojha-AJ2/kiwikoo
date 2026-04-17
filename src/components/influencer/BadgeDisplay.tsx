import { Award } from 'lucide-react'

export type BadgeTier = 'platinum' | 'gold' | 'silver' | null

const styles: Record<Exclude<BadgeTier, null>, { label: string; className: string }> = {
  platinum: {
    label: 'Platinum',
    className: 'bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200 text-slate-700 border-slate-300',
  },
  gold: {
    label: 'Gold',
    className: 'bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 text-amber-700 border-amber-300',
  },
  silver: {
    label: 'Silver',
    className: 'bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 text-zinc-700 border-zinc-300',
  },
}

function normalizeTier(tier: unknown): Exclude<BadgeTier, null> | null {
  if (typeof tier !== 'string') return null
  const normalized = tier.toLowerCase().trim()
  return normalized in styles ? (normalized as Exclude<BadgeTier, null>) : null
}

export default function BadgeDisplay({ tier }: { tier: BadgeTier | string | undefined }) {
  const normalizedTier = normalizeTier(tier)
  if (!normalizedTier) return null

  const style = styles[normalizedTier]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.className}`}
      title={`${style.label} influencer`}
    >
      <Award className="w-3.5 h-3.5" />
      {style.label}
    </span>
  )
}
