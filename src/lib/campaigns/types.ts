/**
 * Brand Campaign System — shared types
 */

export type CampaignGoal = 'sales' | 'awareness' | 'launch' | 'traffic'
export type BudgetType = 'daily' | 'lifetime'

export interface CampaignAudience {
  id: string
  campaign_id: string
  age_min: number | null
  age_max: number | null
  gender: string | null
  location: string | null
  interests: string[]
  created_at: string
  updated_at: string
}

export interface CampaignCreative {
  id: string
  campaign_id: string
  product_id: string | null
  headline: string | null
  description: string | null
  cta_text: string | null
  creative_assets: string[]
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  brand_id: string
  title: string
  brief: string | null
  strategy: Record<string, unknown> | null
  status: string
  goal: CampaignGoal | null
  budget_type: BudgetType | null
  budget: number | null
  daily_budget: number | null
  total_budget: number | null
  start_date: string | null
  end_date: string | null
  impressions: number
  clicks: number
  conversions: number
  spend: number
  ctr: number | null
  created_at: string
  updated_at: string
  audience?: CampaignAudience | null
  creative?: CampaignCreative | null
}

export interface CampaignCreateInput {
  goal: CampaignGoal
  title: string
  audience: {
    age_min?: number
    age_max?: number
    gender?: string
    location?: string
    interests?: string[]
  }
  creative: {
    product_id?: string
    headline?: string
    description?: string
    cta_text?: string
    creative_assets?: string[]
  }
  budget: {
    budget_type: BudgetType
    daily_budget?: number
    total_budget?: number
    start_date?: string
    end_date?: string
  }
}

export interface CampaignSummary {
  total_spend: number
  active_campaigns: number
  total_impressions: number
  total_conversions: number
}
