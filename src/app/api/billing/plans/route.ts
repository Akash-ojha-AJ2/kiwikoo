import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import {
  getBillingPlanById,
  getBillingPlans,
  normalizeBillingRole,
  normalizeBillingStatus,
  normalizeBillingTier,
} from '@/lib/billing/plans'
import { isRazorpayConfigured, razorpayRequest, buildSubscriptionProfileUpdate } from '@/lib/razorpay'

interface ProfileRow {
  id: string
  role?: string | null
  subscription_role?: string | null
  subscription_tier?: string | null
  subscription_status?: string | null
  subscription_plan_id?: string | null
  subscription_current_period_end?: string | null
  subscription_cancel_at_period_end?: boolean | null
  razorpay_customer_id?: string | null
  razorpay_subscription_id?: string | null
  subscription_provider?: string | null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile, error } = await service
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<ProfileRow>()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const role = normalizeBillingRole(profile.subscription_role || profile.role)

    if (isRazorpayConfigured() && profile.razorpay_subscription_id) {
      try {
        const remoteSubscription = await razorpayRequest<any>(`/subscriptions/${profile.razorpay_subscription_id}`)
        await service
          .from('profiles')
          .update(buildSubscriptionProfileUpdate(remoteSubscription, role))
          .eq('id', user.id)

        profile.subscription_status = remoteSubscription.status
        profile.subscription_plan_id = remoteSubscription.plan_id
        profile.subscription_current_period_end = remoteSubscription.current_end
          ? new Date(remoteSubscription.current_end * 1000).toISOString()
          : profile.subscription_current_period_end
        profile.subscription_tier = remoteSubscription.notes?.tier || profile.subscription_tier
      } catch (refreshError) {
        console.warn('Unable to refresh Razorpay subscription before returning plans:', refreshError)
      }
    }

    const currentPlan = getBillingPlanById(profile.subscription_plan_id || null)
    const tier = normalizeBillingTier(profile.subscription_tier || currentPlan?.tier || null)

    return NextResponse.json({
      configured: isRazorpayConfigured(),
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null,
      role,
      plans: getBillingPlans(role),
      current: {
        provider: profile.subscription_provider || null,
        role,
        tier,
        status: normalizeBillingStatus(profile.subscription_status),
        planId: profile.subscription_plan_id || null,
        currentPeriodEnd: profile.subscription_current_period_end || null,
        cancelAtPeriodEnd: Boolean(profile.subscription_cancel_at_period_end),
        subscriptionId: profile.razorpay_subscription_id || null,
        hasCustomer: Boolean(profile.razorpay_customer_id),
      },
    })
  } catch (error) {
    console.error('Billing plans error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
