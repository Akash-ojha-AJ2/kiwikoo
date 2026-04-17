export type BillingRole = 'brand' | 'influencer'
export type BillingTier = 'starter' | 'pro' | 'scale'

export interface BillingPlan {
  role: BillingRole
  tier: BillingTier
  label: string
  priceLabel: string
  amount: number
  currency: 'INR'
  intervalLabel: string
  description: string
  features: string[]
  planId: string | null
}

const PLAN_CONFIG: Record<BillingRole, BillingPlan[]> = {
  influencer: [
    {
      role: 'influencer',
      tier: 'starter',
      label: 'Starter',
      priceLabel: 'INR 499/mo',
      amount: 49900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For creators getting their profile and inbound collabs moving.',
      features: ['1 active brand pitch lane', 'Basic analytics', 'Creator profile boosts'],
      planId: process.env.RAZORPAY_PLAN_INFLUENCER_STARTER_MONTHLY || null,
    },
    {
      role: 'influencer',
      tier: 'pro',
      label: 'Pro',
      priceLabel: 'INR 1499/mo',
      amount: 149900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For active influencers managing regular campaign work.',
      features: ['Unlimited pitches', 'Advanced analytics', 'Priority support'],
      planId: process.env.RAZORPAY_PLAN_INFLUENCER_PRO_MONTHLY || null,
    },
    {
      role: 'influencer',
      tier: 'scale',
      label: 'Scale',
      priceLabel: 'INR 3499/mo',
      amount: 349900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For high-volume creators and teams scaling partnerships.',
      features: ['Team-ready workflows', 'White-glove onboarding', 'Fast-track support'],
      planId: process.env.RAZORPAY_PLAN_INFLUENCER_SCALE_MONTHLY || null,
    },
  ],
  brand: [
    {
      role: 'brand',
      tier: 'starter',
      label: 'Starter',
      priceLabel: 'INR 2499/mo',
      amount: 249900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For early-stage brands launching creator collaborations.',
      features: ['Small campaign pipeline', 'Influencer shortlist tools', 'Email support'],
      planId: process.env.RAZORPAY_PLAN_BRAND_STARTER_MONTHLY || null,
    },
    {
      role: 'brand',
      tier: 'pro',
      label: 'Pro',
      priceLabel: 'INR 6999/mo',
      amount: 699900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For growing teams running recurring creator campaigns.',
      features: ['Multi-campaign workspace', 'Team collaboration', 'Priority support'],
      planId: process.env.RAZORPAY_PLAN_BRAND_PRO_MONTHLY || null,
    },
    {
      role: 'brand',
      tier: 'scale',
      label: 'Scale',
      priceLabel: 'INR 14999/mo',
      amount: 1499900,
      currency: 'INR',
      intervalLabel: 'Monthly',
      description: 'For larger brands and agencies coordinating volume at scale.',
      features: ['Enterprise-ready rollout', 'Dedicated onboarding', 'Priority escalation'],
      planId: process.env.RAZORPAY_PLAN_BRAND_SCALE_MONTHLY || null,
    },
  ],
}

export function normalizeBillingRole(value: unknown): BillingRole {
  return String(value || '').toLowerCase() === 'brand' ? 'brand' : 'influencer'
}

export function normalizeBillingTier(value: unknown): BillingTier | null {
  const tier = String(value || '').toLowerCase()
  if (tier === 'starter' || tier === 'pro' || tier === 'scale') return tier
  return null
}

export function getBillingPlans(role: BillingRole): BillingPlan[] {
  return PLAN_CONFIG[role]
}

export function getBillingPlan(role: BillingRole, tier: BillingTier): BillingPlan | null {
  return PLAN_CONFIG[role].find((plan) => plan.tier === tier) || null
}

export function getBillingPlanById(planId: string | null | undefined): BillingPlan | null {
  if (!planId) return null
  for (const plans of Object.values(PLAN_CONFIG)) {
    const match = plans.find((plan) => plan.planId === planId)
    if (match) return match
  }
  return null
}

export function normalizeBillingStatus(value: unknown): string {
  const status = String(value || '').toLowerCase()
  return status || 'inactive'
}
