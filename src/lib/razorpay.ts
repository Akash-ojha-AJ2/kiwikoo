import crypto from 'crypto'

interface RazorpaySubscription {
  id: string
  plan_id: string
  customer_id?: string | null
  status?: string | null
  current_start?: number | null
  current_end?: number | null
  charge_at?: number | null
  notes?: Record<string, string>
  [key: string]: unknown
}

function getKeyId() {
  return (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim()
}

function getKeySecret() {
  return (process.env.RAZORPAY_KEY_SECRET || '').trim()
}

export function getPublicRazorpayKeyId() {
  return (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim()
}

export function isRazorpayConfigured() {
  return Boolean(getKeyId() && getKeySecret())
}

export function verifyRazorpaySignature(payload: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== signatureBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

export async function razorpayRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured.')
  }

  const auth = Buffer.from(`${getKeyId()}:${getKeySecret()}`).toString('base64')
  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Basic ${auth}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) {
    const message = data?.error?.description || data?.error?.reason || data?.error?.code || 'Razorpay request failed'
    throw new Error(message)
  }

  return data as T
}

export function unixToIso(value: number | null | undefined) {
  return typeof value === 'number' && value > 0 ? new Date(value * 1000).toISOString() : null
}

export function buildSubscriptionProfileUpdate(subscription: RazorpaySubscription, fallbackRole: string) {
  const notes = subscription.notes || {}
  const role = String(notes.role || fallbackRole || 'influencer').toLowerCase()
  const tier = String(notes.tier || '').toLowerCase() || null

  return {
    razorpay_customer_id: subscription.customer_id || null,
    razorpay_subscription_id: subscription.id,
    subscription_provider: 'razorpay',
    subscription_role: role,
    subscription_tier: tier,
    subscription_status: String(subscription.status || 'inactive').toLowerCase(),
    subscription_plan_id: subscription.plan_id || null,
    subscription_current_period_end: unixToIso(subscription.current_end ?? subscription.charge_at ?? null),
    subscription_cancel_at_period_end: false,
    subscription_data: subscription,
  }
}
