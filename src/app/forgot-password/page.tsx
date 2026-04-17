'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from '@/lib/simple-sonner'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Mail, Loader2, KeyRound, Sparkles, Shield } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send reset email')
      }

      setSent(true)
      toast.success('If the account exists, a password reset email is on the way.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative flex overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/login-influencer-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.25)_100%)]" />

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full flex">

        {/* LEFT SIDE - Branding & Info */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 py-12">
          {/* Logo - Neo-brutal style */}
          <motion.div
            initial={{ opacity: 0, y: -20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-10"
          >
            <Link href="/">
                <span className="kiwikoo-wordmark inline-block px-4 py-2 bg-[#F9F8F4] text-2xl font-black text-black border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                Kiwikoo
              </span>
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6"
          >
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)]">
              Forgot your<br />
              <span className="text-[#FFD93D] italic font-serif">password?</span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-white/90 max-w-md mb-10 leading-relaxed font-medium drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]"
          >
            No worries! Enter your email and we&apos;ll send you a secure link to reset it.
          </motion.p>

          {/* Features - Neo-brutal pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-3"
          >
            {[
              { icon: KeyRound, text: 'Secure Reset Link', color: '#FF8C69' },
              { icon: Shield, text: 'Keep Your Account Safe', color: '#B4F056' },
              { icon: Sparkles, text: 'Quick & Easy', color: '#FFD93D' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                whileHover={{ x: 5, rotate: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#F9F8F4] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mr-2 cursor-default"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-4 h-4 text-black" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-black">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT SIDE - Form Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:pr-12 xl:pr-20">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-full max-w-[400px]"
          >
            {/* Neo-Brutal Card */}
            <div className="bg-[#F9F8F4] rounded-2xl p-8 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {/* Logo - Mobile only */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-center mb-2 lg:hidden"
              >
                <Link href="/">
                  <span className="kiwikoo-wordmark inline-block px-3 py-1 bg-[#FFD93D] text-lg font-black text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Kiwikoo
                  </span>
                </Link>
              </motion.div>

              {sent ? (
                // Success state
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-20 h-20 bg-[#B4F056] rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-6"
                  >
                    <Mail className="w-10 h-10 text-black" strokeWidth={2} />
                  </motion.div>
                  <h2 className="text-2xl font-black text-black mb-2">Check your email!</h2>
                  <p className="text-black/60 font-medium mb-6">
                    We&apos;ve sent a password reset link to<br />
                    <span className="font-bold text-black">{email}</span>
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8C69] text-black rounded-xl font-bold border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to login
                  </Link>
                </div>
              ) : (
                <>
                  {/* Headline */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-black leading-tight">
                      Reset your<br />
                      <span className="text-[#FFD93D] italic font-serif text-3xl">password</span>
                    </h1>
                    <p className="text-sm text-black/60 mt-2 font-medium">
                      Enter your email to receive a reset link
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FFD93D] rounded-lg border-2 border-black flex items-center justify-center">
                          <Mail className="w-4 h-4 text-black" strokeWidth={2.5} />
                        </div>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-14 pr-4 py-3 rounded-xl bg-white border-[2px] border-black text-black placeholder:text-black/40 font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all"
                        />
                      </div>
                    </div>

                    {/* CTA Button - Neo-brutal */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02, x: -2, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-[#FF8C69] text-black rounded-xl font-black text-base flex items-center justify-center gap-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send reset link
                          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-sm text-black/60 font-medium hover:text-black transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

