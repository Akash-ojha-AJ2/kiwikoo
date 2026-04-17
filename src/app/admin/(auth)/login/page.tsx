'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Shield } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { setAuthToast } from '@/components/auth-toast-bridge'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'
import { showErrorToast, showSuccessToast } from '@/lib/kiwikoo-toast'

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FDF6EC]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#FF8C69] border-t-transparent" />
            <p className="font-bold text-black/60">Loading...</p>
          </div>
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  )
}

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    const confirmed = searchParams.get('confirmed')
    if (error === 'not_admin') {
      showErrorToast('Not an admin account', 'Use the regular login for creator or brand accounts.')
    }
    if (confirmed === 'true') {
      showSuccessToast('Email confirmed', 'You can now sign in as admin.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      showErrorToast('Missing details', 'Please enter your admin email and password.')
      return
    }

    if (!normalizedEmail.includes('@')) {
      showErrorToast('Invalid email', 'Please enter a valid admin email address.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: normalizedEmail, password, rememberMe: true }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data?.errorCode === 'INVALID_PASSWORD' || data?.errorCode === 'INVALID_CREDENTIALS') {
          throw new Error('Incorrect password. Please try again.')
        }
        throw new Error(data?.error || 'Login failed')
      }

      if (data?.user?.role !== 'ADMIN') {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        showErrorToast('Wrong portal for this account', 'Use the regular login for your creator or brand workspace.')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['user'] })
      setAuthToast('admin_logged_in')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      showErrorToast('Admin sign-in failed', err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FDF6EC]">
      <DecorativeShapes />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="kiwikoo-wordmark mb-6 text-3xl text-black lg:mb-10"
        >
          Kiwikoo
        </motion.div>

        <div className="relative w-full max-w-5xl">
          <div className="absolute -top-6 left-1/2 z-30 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-full border-[3px] border-black bg-gradient-to-r from-[#B4F056] to-[#FFD93D] px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Shield className="h-5 w-5 text-black" strokeWidth={2.5} />
              <span className="text-sm font-black uppercase tracking-[0.18em] text-black">Admin Access</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 overflow-hidden rounded-[32px] border-[4px] border-black bg-[#FFFDF8] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b-[4px] border-black bg-[linear-gradient(145deg,#fff4bf_0%,#ffd93d_38%,#ffb07e_100%)] p-6 lg:border-b-0 lg:border-r-[4px] lg:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Shield className="h-4 w-4" />
                  Command Center
                </div>
                <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] text-black lg:text-6xl">
                  Manage the
                  <br />
                  platform
                </h1>
                <p className="mt-3 text-2xl font-black italic text-[#FF8C69]">with the same bold energy</p>
                <p className="mt-5 max-w-lg text-base font-semibold leading-relaxed text-black/70 lg:text-lg">
                  Review approvals, monitor creators, and keep Kiwikoo operations moving from one focused admin portal.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    'Review influencer approvals in one queue',
                    'Track pending and approved creator profiles',
                    'Keep platform operations inside a single dashboard',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="h-3 w-3 rounded-full border border-black bg-[#B4F056]" />
                      <span className="font-bold text-black">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 lg:p-10">
                <div className="mb-6 inline-flex rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Sign in
                </div>
                <h2 className="text-[2.2rem] font-black leading-none text-black">Welcome,</h2>
                <p className="mt-1 text-base font-semibold text-black/65">admin login to continue</p>

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-black">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
                        <Mail className="h-4 w-4 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        id="email"
                        type="text"
                        inputMode="email"
                        autoComplete="username"
                        placeholder="admin@kiwikoo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-4 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-black">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
                        <Lock className="h-4 w-4 text-black" strokeWidth={2.5} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-12 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 hover:bg-black/5"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-[#B4F056] font-black text-sm uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying
                      </>
                    ) : (
                      <>
                        Enter Dashboard
                        <ArrowRight className="h-5 w-5" strokeWidth={3} />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 border-t-[3px] border-black/10 pt-6 text-center">
                  <p className="text-sm font-bold text-black/60">
                    Need access?{' '}
                    <Link href="/admin/register" className="px-1 text-black underline decoration-2 transition-colors hover:bg-[#FFD93D]">
                      Create Account
                    </Link>
                  </p>
                  <Link href="/login" className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black">
                    Back to regular sign in
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute top-10 -right-5 z-10 hidden h-[80%] w-20 overflow-hidden rounded-r-3xl border-[4px] border-black bg-gradient-to-b from-[#B4F056] to-[#FFD93D] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:block">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
          <div className="absolute -bottom-4 left-8 right-8 z-0 hidden h-3 rounded-full border-[3px] border-black bg-[#FFD93D] lg:block" />
        </div>
      </div>
    </div>
  )
}
