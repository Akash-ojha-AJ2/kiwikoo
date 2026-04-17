import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { buildSubscriptionProfileUpdate, razorpayRequest, verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body?.subscriptionId || !body?.paymentId || !body?.signature) {
      return NextResponse.json({ error: 'Missing Razorpay verification payload.' }, { status: 400 })
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay is not configured yet.' }, { status: 503 })
    }

    const signedPayload = `${body.paymentId}|${body.subscriptionId}`
    if (!verifyRazorpaySignature(signedPayload, body.signature, secret)) {
      return NextResponse.json({ error: 'Invalid Razorpay signature.' }, { status: 400 })
    }

    const subscription = await razorpayRequest<any>(`/subscriptions/${body.subscriptionId}`)
    const subscriptionUserId = String(subscription.notes?.user_id || '')
    if (subscriptionUserId && subscriptionUserId !== user.id) {
      return NextResponse.json({ error: 'Subscription does not belong to this user.' }, { status: 403 })
    }

    const service = createServiceClient()
    const { data: profile, error } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<any>()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    await service
      .from('profiles')
      .update(buildSubscriptionProfileUpdate(subscription, profile.role || 'influencer'))
      .eq('id', user.id)

    return NextResponse.json({ ok: true, status: subscription.status || 'authenticated' })
  } catch (error) {
    console.error('Billing verify error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
