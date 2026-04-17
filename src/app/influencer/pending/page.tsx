/**
 * INFLUENCER PENDING PAGE - NEO-BRUTALIST DESIGN
 * 
 * Shows approval status for influencers.
 * Uses consistent neo-brutalist styling with thick borders and offset shadows.
 */
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from '@/lib/simple-sonner'
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Store,
  MessageCircle,
  FileCheck,
  Users,
  Zap
} from 'lucide-react'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'
import { createClient } from '@/lib/auth-client'

type Status = 'draft' | 'pending' | 'approved' | 'rejected'

export default function InfluencerPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('pending')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const approvedToastShownRef = useRef(false)

  const fetchStatus = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)

      const res = await fetch('/api/auth/profile-status', { credentials: 'include' })

      if (res.status === 401) {
        router.replace('/login')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = (body?.error ?? res.statusText ?? 'Failed to load status') as string
        console.error('Error fetching profile:', msg, res.status)
        toast.error(msg)
        setStatus('draft')
        setLoading(false)
        if (showToast) setRefreshing(false)
        return
      }

      const data = await res.json()
      const onboardingCompleted = Boolean(data?.onboarding_completed)
      const approvalStatus = (data?.approval_status as Status) ?? 'pending'
      setProfileId(typeof data?.id === 'string' ? data.id : null)

      setStatus(approvalStatus)

      if (!onboardingCompleted) {
        router.replace('/onboarding/influencer')
        return
      }

      if (approvalStatus === 'approved') {
        if (!approvedToastShownRef.current) {
          approvedToastShownRef.current = true
          toast.success("You're approved! Redirecting to marketplace...", {
            style: { background: '#B4F056', border: '3px solid black', fontWeight: 'bold' }
          })
        }
        setTimeout(() => {
          router.replace('/marketplace')
        }, 1500)
        return
      }

      setLoading(false)
      if (showToast) {
        setRefreshing(false)
        toast.info('Status updated', {
          style: { background: 'white', border: '3px solid black' }
        })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('Error fetching status:', msg)
      toast.error(msg || 'Something went wrong')
      setStatus('draft')
      setLoading(false)
      if (showToast) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchParams.get('resubmitted') === '1') {
      toast.success('Your creator profile has been resubmitted for review.', {
        style: { background: '#FFD93D', border: '3px solid black', fontWeight: 'bold' }
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (!profileId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`influencer-pending-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`,
        },
        (payload: any) => {
          const nextStatus = (payload?.new?.approval_status || '').toLowerCase() as Status | ''
          if (!nextStatus) return

          setStatus(nextStatus as Status)

          if (nextStatus === 'approved' && !approvedToastShownRef.current) {
            approvedToastShownRef.current = true
            toast.success("You're approved! Redirecting to marketplace...")
            setTimeout(() => {
              router.replace('/marketplace')
            }, 1200)
            return
          }

          if (nextStatus === 'rejected') {
            toast.error('Your application has been reviewed. Please check your status details.')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, router])

  useEffect(() => {
    const timer = setInterval(() => {
      fetchStatus(false)
    }, 30000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
        <div className="text-center">
          <div className="w-16 h-16 border-[4px] border-[#FF8C69] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-black/60 font-bold">Loading your status...</p>
        </div>
      </div>
    )
  }

  const isRejected = status === 'rejected'

  const steps = [
    {
      icon: FileCheck,
      title: 'Submit Profile',
      desc: 'Complete your onboarding and upload identity photos.',
      done: true
    },
    {
      icon: Users,
      title: 'Admin Review',
      desc: 'Our team reviews your profile for authenticity.',
      done: false,
      active: !isRejected
    },
    {
      icon: Zap,
      title: 'Get Approved',
      desc: 'Unlock AI try-ons, collaborations, and analytics.',
      done: false
    },
  ]

  return (
    <div className="min-h-screen bg-[#FDF6EC] overflow-hidden">
      {/* Background decorative shapes */}
      <DecorativeShapes />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 py-8 lg:py-12 flex flex-col items-center min-h-screen">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-black mb-6 lg:mb-10"
        >
          Kiwikoo
        </motion.div>

        {/* Main Card Container */}
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Status Badge - Floating Top Center */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                px-6 py-3 border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                flex items-center gap-3
                ${isRejected
                  ? 'bg-red-100'
                  : 'bg-gradient-to-r from-[#FFE066] to-[#FFD93D]'
                }
              `}
            >
              {isRejected ? (
                <ShieldAlert className="w-6 h-6 text-red-600" strokeWidth={2.5} />
              ) : (
                <Clock className="w-6 h-6 text-[#FF8C69]" strokeWidth={2.5} />
              )}
              <span className="font-black text-black text-sm">
                {isRejected ? 'Application Rejected' : 'Pending Approval'}
              </span>
            </motion.div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 bg-[#FFFDF8] border-[4px] border-black rounded-3xl p-6 lg:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* Title */}
            <div className="text-center mt-8 mb-8">
              <h1
                className="text-3xl lg:text-4xl font-black text-black mb-3 tracking-tight"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                {isRejected ? 'Application Not Approved' : 'Profile Under Review'}
              </h1>
              <p className="text-black/60 font-medium max-w-md mx-auto">
                {isRejected
                  ? "Your application needs a few updates before approval. Reopen onboarding, improve your details, and send it back for review."
                  : "We're reviewing your creator profile, and dashboard access will unlock once approval is complete."
                }
              </p>
            </div>

            <div className={`mb-6 rounded-2xl border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isRejected ? 'bg-[#FFF1D7]' : 'bg-[#EEF8D8]'}`}>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-black">
                {isRejected ? 'Next step: update and resubmit' : 'Current step: under review'}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-black/70">
                {isRejected
                  ? 'Reopen onboarding, improve the profile details that need attention, and resubmit to return to the approval queue.'
                  : 'Your creator profile is currently with the review team. You can browse the marketplace now, and we will unlock dashboard access once approval is complete.'}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="bg-white/60 border-2 border-black/10 rounded-2xl p-5 mb-6">
              <div className="grid gap-4 md:grid-cols-3">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all
                      ${step.done
                        ? 'bg-[#B4F056]/20 border-[#B4F056]'
                        : step.active
                          ? 'bg-[#FFD93D]/20 border-[#FFD93D] animate-pulse'
                          : 'bg-white border-black/10'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center mb-3
                      ${step.done
                        ? 'bg-[#B4F056]'
                        : step.active
                          ? 'bg-[#FFD93D]'
                          : 'bg-gray-100'
                      }
                    `}>
                      {step.done ? (
                        <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                      ) : (
                        <step.icon className="w-5 h-5 text-black" strokeWidth={2} />
                      )}
                    </div>
                    <h3 className="font-bold text-black text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-black/50">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {!isRejected && (
                <button type="button"
                  onClick={() => fetchStatus(true)}
                  disabled={refreshing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                  Refresh Status
                </button>
              )}

              {isRejected && (
                <button
                  type="button"
                  onClick={() => router.push('/onboarding/influencer?mode=resubmit')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF8C69] text-black font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                >
                  <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
                  Edit & Resubmit
                </button>
              )}

              <Link
                href="/marketplace"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
              >
                <Store className="w-5 h-5" strokeWidth={2.5} />
                Browse Marketplace
              </Link>
            </div>

            {/* Contact Support Link */}
            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-black/60 font-bold hover:text-black hover:bg-black/5 transition-all border-2 border-dashed border-black/20"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </Link>

            {/* What You Can Do Now */}
            <div className="mt-6 p-5 rounded-2xl bg-[#B4F056]/10 border-2 border-[#B4F056]/30">
              <div className="flex items-center gap-2 text-black font-bold mb-3">
                <Sparkles className="w-5 h-5 text-[#FF8C69]" />
                What you can do now
              </div>
              <ul className="grid gap-2 text-sm text-black/70">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C69]" />
                  Browse the marketplace and explore products
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C69]" />
                  Keep your profile details updated
                </li>
                {!isRejected && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8C69]" />
                    Check this page for approval status
                  </li>
                )}
              </ul>
            </div>
          </motion.div>

          {/* Decorative Orange Side Strip */}
          <div
            className="absolute top-10 -right-5 lg:-right-8 w-20 lg:w-24 h-[80%] bg-gradient-to-b from-[#FF8C69] to-[#E76B4A] border-[4px] border-black rounded-r-3xl z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hidden lg:block overflow-hidden"
          >
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
              backgroundSize: '10px 10px'
            }} />
          </div>

          {/* Bottom accent line */}
          <div className="absolute -bottom-4 left-8 right-8 h-3 bg-[#FFD93D] border-[3px] border-black rounded-full z-0 hidden lg:block" />
        </div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-black/40 text-sm mt-10"
        >
          Reviews typically complete within 24-48 hours
        </motion.p>
      </div>
    </div>
  )
}
