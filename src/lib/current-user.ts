import 'server-only'

import { createClient, createServiceClient } from '@/lib/auth'
import { getGenerationTagFromDob, normalizeDateOfBirth } from '@/lib/profile-demographics'

type SubscriptionSummary = {
  provider: string | null
  role: string
  tier: string | null
  status: string
  plan_id: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  has_customer: boolean
  subscription_id: string | null
}

type CurrentUserRecord = {
  id: string
  email: string
  name: string | null
  role: string
  slug: string
  avatarUrl: string | null
  subscription: SubscriptionSummary
}

type CurrentProfileRecord = {
  id: string
  email: string
  role: string
  onboarding_completed: boolean
  approval_status: string
  brand_data: Record<string, unknown> | null
  avatar_url: string | null
  date_of_birth: string | null
  generation_tag: string | null
  subscription: SubscriptionSummary
}

export type CurrentUserPayload = {
  user: CurrentUserRecord | null
  profile: CurrentProfileRecord | null
}

export type CurrentUserQueryData =
  | (CurrentUserRecord & {
      profile: CurrentProfileRecord | null
      onboardingCompleted: boolean
      approvalStatus: string
    })
  | null

export async function getCurrentUserPayload(): Promise<CurrentUserPayload> {
  const supabase = await createClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return { user: null, profile: null }
  }

  let profileClient: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createServiceClient> = supabase
  try {
    profileClient = createServiceClient()
  } catch {
    profileClient = supabase
  }

  const { data: profile } = await profileClient
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle<any>()

  if (!profile) {
    const fallbackRole = String(authUser.user_metadata?.role || 'influencer').toLowerCase() === 'brand'
      ? 'brand'
      : 'influencer'

    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
        name: (authUser.user_metadata?.name as string) || (authUser.user_metadata?.full_name as string) || null,
        role: fallbackRole.toUpperCase(),
        slug: authUser.email?.split('@')[0] || '',
        avatarUrl: (authUser.user_metadata?.avatar_url as string) || null,
        subscription: {
          provider: null,
          role: fallbackRole,
          tier: null,
          status: 'inactive',
          plan_id: null,
          current_period_end: null,
          cancel_at_period_end: false,
          has_customer: false,
          subscription_id: null,
        },
      },
      profile: null,
    }
  }

  const role = String(profile.role || 'influencer').toLowerCase()
  const approvalStatus = String(profile.approval_status || 'none').toLowerCase()
  const dateOfBirth = normalizeDateOfBirth(authUser.user_metadata?.date_of_birth)
  const generationTag = getGenerationTagFromDob(dateOfBirth)
  const subscription: SubscriptionSummary = {
    provider: profile.subscription_provider || null,
    role: profile.subscription_role || role,
    tier: profile.subscription_tier || null,
    status: profile.subscription_status || 'inactive',
    plan_id: profile.subscription_plan_id || null,
    current_period_end: profile.subscription_current_period_end || null,
    cancel_at_period_end: Boolean(profile.subscription_cancel_at_period_end),
    has_customer: Boolean(profile.razorpay_customer_id),
    subscription_id: profile.razorpay_subscription_id || null,
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      name: (profile.brand_data as Record<string, unknown> | null)?.companyName || profile.full_name || null,
      role: role.toUpperCase(),
      slug: profile.email?.split('@')[0] || '',
      avatarUrl: profile.avatar_url || null,
      subscription,
    },
    profile: {
      id: profile.id,
      email: profile.email,
      role,
      onboarding_completed: Boolean(profile.onboarding_completed),
      approval_status: approvalStatus,
      brand_data: profile.brand_data || null,
      avatar_url: profile.avatar_url || null,
      date_of_birth: dateOfBirth,
      generation_tag: generationTag,
      subscription,
    },
  }
}

export function toCurrentUserQueryData(payload: CurrentUserPayload): CurrentUserQueryData {
  if (!payload.user) {
    return null
  }

  return {
    ...payload.user,
    profile: payload.profile ?? null,
    onboardingCompleted:
      payload.profile?.onboarding_completed ?? false,
    approvalStatus:
      payload.profile?.approval_status ?? 'none',
    avatarUrl: payload.user.avatarUrl ?? payload.profile?.avatar_url ?? null,
  }
}
