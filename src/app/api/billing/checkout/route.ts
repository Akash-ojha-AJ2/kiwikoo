import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { getBillingPlan, normalizeBillingRole, normalizeBillingTier } from '@/lib/billing/plans'
import { getPublicRazorpayKeyId, isRazorpayConfigured, razorpayRequest } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: 'Razorpay is not configured yet.' }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const service = createServiceClient()
    const { data: profile, error } = await service
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<any>()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const role = normalizeBillingRole(body.role || profile.role)
    const tier = normalizeBillingTier(body.tier)
    if (!tier) {
      return NextResponse.json({ error: 'Invalid billing tier.' }, { status: 400 })
    }

    const plan = getBillingPlan(role, tier)
    if (!plan?.planId) {
      return NextResponse.json({ error: 'This plan is not configured in Razorpay yet.' }, { status: 400 })
    }

    const currentStatus = String(profile.subscription_status || '').toLowerCase()
    if (profile.razorpay_subscription_id && ['active', 'authenticated', 'pending', 'created'].includes(currentStatus)) {
      return NextResponse.json({ error: 'You already have an active subscription. Contact support to change plans.' }, { status: 409 })
    }

    const subscription = await razorpayRequest<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: plan.planId,
        total_count: 120,
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          role,
          tier,
          email: user.email || '',
        },
      }),
    })

    await service
      .from('profiles')
      .update({
        subscription_provider: 'razorpay',
        subscription_role: role,
        subscription_tier: tier,
        subscription_status: String(subscription.status || 'created').toLowerCase(),
        subscription_plan_id: subscription.plan_id,
        razorpay_subscription_id: subscription.id,
        subscription_data: subscription,
      })
      .eq('id', user.id)

    return NextResponse.json({
      keyId: getPublicRazorpayKeyId(),
      subscriptionId: subscription.id,
      plan,
      prefill: {
        name: profile.full_name || (profile.brand_data && profile.brand_data.companyName) || 'Kiwikoo user',
        email: profile.email || user.email || '',
        contact: profile.phone || profile.contact_phone || profile.brand_data?.contactPhone || '',
      },
    })
  } catch (error) {
    console.error('Billing checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
