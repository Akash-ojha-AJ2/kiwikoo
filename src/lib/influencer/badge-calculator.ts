export type BadgeTier = 'platinum' | 'gold' | 'silver' | null

export interface BadgeInputs {
  followers?: number | null
  engagementRate?: number | null
  audienceRate?: number | null
  retentionRate?: number | null
}

export interface BadgeResult {
  score: number
  tier: BadgeTier
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeToScore(value: number, maxValue: number, maxScore: number) {
  if (!Number.isFinite(value) || value <= 0) return 0
  return (clamp(value, 0, maxValue) / maxValue) * maxScore
}

export function calculateBadge(inputs: BadgeInputs): BadgeResult {
  const followers = inputs.followers ?? 0
  const engagementRate = inputs.engagementRate ?? 0
  const audienceRate = inputs.audienceRate ?? 0
  const retentionRate = inputs.retentionRate ?? 0

  const followerScore = normalizeToScore(followers, 100_000, 30)
  const engagementScore = normalizeToScore(engagementRate, 10, 30)
  const audienceScore = normalizeToScore(audienceRate, 20, 20)
  const retentionScore = normalizeToScore(retentionRate, 100, 20)

  const score = Math.round((followerScore + engagementScore + audienceScore + retentionScore) * 100) / 100

  let tier: BadgeTier = null
  if (score >= 80) tier = 'platinum'
  else if (score >= 60) tier = 'gold'
  else if (score >= 40) tier = 'silver'

  return { score, tier }
}
