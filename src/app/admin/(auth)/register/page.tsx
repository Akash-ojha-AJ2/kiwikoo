'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from '@/lib/simple-sonner'
import { ArrowRight, Shield, Sparkles, KeyRound } from 'lucide-react'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Please enter email and password')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!code.trim()) {
      toast.error('Admin signup code is required')
      return
    }

    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const res = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          code: code.trim(),
        }),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(out?.error || out?.hint || 'Failed to create admin account')
      }

      toast.success('Admin account created. You can sign in now.')
      router.replace('/admin/login')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FDF6EC] font-sans overflow-hidden relative">
      <div className="lg:hidden absolute inset-0 z-0">
        <DecorativeShapes />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-1/2 relative border-r-[3px] border-black bg-[#FF8C69]/10 items-center justify-center p-12 overflow-hidden"
      >
        <DecorativeShapes />
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="kiwikoo-wordmark mb-8 block text-5xl text-black">
            Kiwikoo
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] w-fit mb-8">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider uppercase">Setup Access</span>
          </div>
          <h1 className="text-6xl font-black text-black leading-none mb-6 font-serif">
            Join the <br />
            <span className="italic text-[#B4F056] text-shadow-sm">Team</span>
          </h1>
          <p className="text-xl text-black/80 font-medium border-l-4 border-black pl-6 py-2">
            Create your admin credentials securely. Requires a valid invitation code.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 relative z-10"
      >
        <div className="w-full max-w-md bg-white p-8 rounded-xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link href="/" className="kiwikoo-wordmark mb-8 block text-4xl text-black lg:hidden">
            Kiwikoo
          </Link>

          <h2 className="text-3xl font-black text-black mb-2 font-serif">Create Account</h2>
          <p className="text-black/60 mb-8 font-medium">Set up your admin profile.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-[#FDF6EC] text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all font-medium placeholder:text-black/30"
                placeholder="admin@kiwikoo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-[#FDF6EC] text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all font-medium placeholder:text-black/30"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wide">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-[#FDF6EC] text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all font-medium placeholder:text-black/30"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-black uppercase tracking-wide">Admin signup code</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-black bg-[#FDF6EC] text-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all font-medium placeholder:text-black/30"
                  placeholder="Enter code"
                />
              </div>
              <p className="text-xs text-black/50 font-medium">Required for security purposes.</p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#FFD93D] text-black font-black text-lg rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Creating...
                </span>
              ) : (
                <>
                  CREATE ADMIN
                  <ArrowRight className="w-6 h-6" strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black/10 flex flex-col gap-3 text-center">
            <p className="text-sm text-black/60 font-medium">
              Already have an account?{' '}
              <Link href="/admin/login" className="text-black font-bold underline decoration-2 underline-offset-2 hover:text-[#B4F056] transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
