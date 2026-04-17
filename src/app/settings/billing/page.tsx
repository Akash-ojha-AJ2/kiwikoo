'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import { safeParseResponse } from '@/lib/api-utils'
import type { BillingPlan, BillingRole, BillingTier } from '@/lib/billing/plans'
import { useUser } from '@/lib/react-query/hooks'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

interface BillingResponse {
  configured: boolean
  keyId: string | null
  role: BillingRole
  plans: BillingPlan[]
  current: {
    provider: string | null
    role: BillingRole
    tier: BillingTier | null
    status: string
    planId: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    subscriptionId: string | null
    hasCustomer: boolean
  }
}

export default function BillingPage() {
  const { data: user } = useUser()
  const [data, setData] = useState<BillingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyTier, setBusyTier] = useState<BillingTier | null>(null)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/plans', { credentials: 'include', cache: 'no-store' })
      const payload = await safeParseResponse<BillingResponse>(res, 'billing')
      setData(payload)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load billing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPlans()
  }, [])

  const handleSubscribe = async (tier: BillingTier) => {
    if (!data) return
    if (!window.Razorpay) {
      toast.error('Razorpay checkout is still loading. Please try again.')
      return
    }

    setBusyTier(tier)
    try {
      const checkoutRes = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: data.role, tier }),
      })
      const checkout = await safeParseResponse<any>(checkoutRes, 'billing checkout')

      const instance = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: 'Kiwikoo',
        description: `${data.role === 'brand' ? 'Brand' : 'Creator'} ${checkout.plan.label} plan`,
        prefill: checkout.prefill,
        notes: {
          role: data.role,
          tier,
        },
        theme: {
          color: '#B4F056',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/billing/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                subscriptionId: response.razorpay_subscription_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })
            await safeParseResponse(verifyRes, 'billing verify')
            toast.success('Subscription confirmed.')
            await fetchPlans()
          } catch (verifyError) {
            toast.error(verifyError instanceof Error ? verifyError.message : 'Subscription verification failed')
          } finally {
            setBusyTier(null)
          }
        },
        modal: {
          ondismiss: () => setBusyTier(null),
        },
      })

      instance.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout')
      setBusyTier(null)
    }
  }

  const backHref = user?.role === 'BRAND' ? '/brand/profile' : '/profile'
  const hasActiveSubscription = Boolean(data?.current.subscriptionId && ['active', 'authenticated', 'pending', 'created'].includes(data.current.status))

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10">
          <Link href={backHref} className="mb-6 inline-flex items-center gap-2 font-bold uppercase tracking-wide text-black hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="h-5 w-5" />
            Back
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black uppercase">Billing</h1>
          <p className="mt-3 max-w-2xl border-l-[4px] border-[#FFD93D] pl-4 text-base font-bold text-black/60 sm:text-lg">
            Choose the right subscription for your {user?.role === 'BRAND' ? 'brand team' : 'creator workflow'}.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : !data ? (
          <div className="border-[3px] border-black bg-white p-6 font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Billing data is unavailable right now.
          </div>
        ) : (
          <>
            <div className="mb-8 border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Current Subscription</p>
                  <p className="mt-2 text-2xl font-black uppercase text-black">
                    {data.current.tier ? `${data.current.tier} (${data.current.status})` : 'No active plan'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-black/70">
                    {data.current.currentPeriodEnd
                      ? `Current period ends on ${new Date(data.current.currentPeriodEnd).toLocaleDateString('en-IN')}`
                      : 'Start a plan to unlock paid billing for this account.'}
                  </p>
                </div>
                <div className="rounded-xl border-[3px] border-black bg-[#FFF7D6] px-4 py-3 text-sm font-bold text-black">
                  Plan changes and cancellations from dashboard will be available soon.
                </div>
              </div>
            </div>

            {!data.configured && (
              <div className="mb-8 border-[3px] border-black bg-[#FFD7D7] p-5 font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                Razorpay keys or plan IDs are missing. Add the env values before trying checkout.
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {data.plans.map((plan) => {
                const isCurrent = data.current.tier === plan.tier && hasActiveSubscription
                const disabled = !data.configured || !plan.planId || busyTier !== null || (hasActiveSubscription && !isCurrent)
                return (
                  <div key={plan.tier} className="flex h-full flex-col border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-black/50">{plan.intervalLabel}</p>
                        <h2 className="mt-2 text-3xl font-black uppercase">{plan.label}</h2>
                      </div>
                      {isCurrent && <CheckCircle2 className="h-7 w-7" />}
                    </div>

                    <p className="text-3xl font-black">{plan.priceLabel}</p>
                    <p className="mt-4 min-h-[56px] text-sm font-medium text-black/70">{plan.description}</p>

                    <div className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="border-[2px] border-black bg-[#F6F6F0] px-3 py-2 text-sm font-bold">
                          {feature}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleSubscribe(plan.tier)}
                      disabled={disabled}
                      className="mt-8 inline-flex items-center justify-center gap-2 border-[3px] border-black bg-[#B4F056] px-4 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyTier === plan.tier ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                      {isCurrent ? 'Current plan' : hasActiveSubscription ? 'Already subscribed' : 'Start plan'}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
