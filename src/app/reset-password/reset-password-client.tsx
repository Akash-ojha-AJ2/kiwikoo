'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { showErrorToast, showSuccessToast } from '@/lib/kiwikoo-toast'

export default function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      showErrorToast('Password too short', 'Use at least 8 characters for your new password.')
      return
    }

    if (password !== confirmPassword) {
      showErrorToast('Passwords do not match', 'Please make sure both password fields are the same.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          token_hash,
          type,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update password')
      }

      showSuccessToast('Password updated', 'Your password has been changed. You can sign in now.')
      router.push('/login')
      router.refresh()
    } catch (err) {
      showErrorToast('Reset failed', err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F4F4F0]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,0,0,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute -left-12 top-12 h-36 w-36 rounded-full border-[4px] border-black bg-[#FF8C69] opacity-15 blur-[2px] sm:h-44 sm:w-44 lg:h-56 lg:w-56" />
      <div className="absolute -right-16 bottom-10 h-44 w-44 rounded-[36px] border-[4px] border-black bg-[#B4F056] opacity-15 rotate-12 sm:h-56 sm:w-56 lg:h-72 lg:w-72" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden rounded-[36px] border-[4px] border-black bg-[#FFF4F0] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:block xl:p-10"
          >
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border-[3px] border-black bg-white px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border-[2px] border-black bg-[#FFD93D]">
                <KeyRound className="h-4 w-4 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.16em] text-black">Secure reset</span>
            </div>

            <h1 className="max-w-xl text-[clamp(3rem,5vw,4.8rem)] font-black uppercase leading-[0.92] text-black">
              Set a fresh password and get back in
            </h1>

            <div className="mt-8 rounded-[28px] border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-lg font-bold leading-relaxed text-black/75">
                Choose a strong password you have not used before. Once it is updated, you can sign straight back into Kiwikoo.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Minimum 8 characters', color: '#FF8C69' },
                { label: 'Works right away at login', color: '#B4F056' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div
                    className="h-4 w-4 rounded-full border-[2px] border-black"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-black uppercase tracking-[0.08em] text-black">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[520px]"
          >
            <div className="relative rounded-[32px] border-[4px] border-black bg-white p-6 pt-9 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-8">
              <div className="absolute -top-5 left-6 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD93D] px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck className="h-4 w-4 text-black" strokeWidth={2.6} />
                <span className="text-xs font-black uppercase tracking-[0.16em] text-black">Reset password</span>
              </div>

              <div className="mb-8 mt-2">
                <h2 className="text-[2.1rem] font-black leading-none text-black sm:text-[2.5rem]">Choose a new password</h2>
                <p className="mt-2 text-base font-bold text-black/60">Update your password to unlock your account again.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-black uppercase tracking-[0.2em] text-black">
                    New password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
                      <Lock className="h-4 w-4 text-black" strokeWidth={2.5} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-12 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 hover:bg-black/5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-black/50">Use at least 8 characters.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-xs font-black uppercase tracking-[0.2em] text-black">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
                      <Lock className="h-4 w-4 text-black" strokeWidth={2.5} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-12 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 hover:bg-black/5"
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-[#FF8C69] font-black text-sm uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-5 w-5" strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-black/60 transition-colors hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
