import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/auth'
import { buildSubscriptionProfileUpdate, verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim()

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing webhook signature or secret.' }, { status: 400 })
    }

    const payload = await request.text()
    if (!verifyRazorpaySignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 })
    }

    const event = JSON.parse(payload)
    const subscription = event?.payload?.subscription?.entity

    if (!subscription?.id) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const service = createServiceClient()
    const targetUserId = String(subscription.notes?.user_id || '')
    const fallbackRole = String(subscription.notes?.role || 'influencer').toLowerCase()
    const update = buildSubscriptionProfileUpdate(subscription, fallbackRole)

    let query = service.from('profiles').update(update)
    if (targetUserId) {
      query = query.eq('id', targetUserId)
    } else {
      query = query.eq('razorpay_subscription_id', subscription.id)
    }

    const { error } = await query
    if (error) {
      throw error
    }

    return NextResponse.json({ ok: true, event: event.event || null })
  } catch (error) {
    console.error('Billing webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
