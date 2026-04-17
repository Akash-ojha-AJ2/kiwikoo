'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from '@/lib/simple-sonner'
import { createClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Building2, Camera, Sparkles, ArrowLeft } from 'lucide-react'

type Role = 'INFLUENCER' | 'BRAND'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = useMemo(() => {
    return createClient()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) {
      toast.error('Please choose a role')
      return
    }
    if (!name.trim()) {
      toast.error(role === 'BRAND' ? 'Please enter your company name' : 'Please enter your full name')
      return
    }

    setSaving(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user?.email) {
        toast.error('Please sign in again')
        router.replace('/login')
        return
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, name: name.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to complete profile')

      toast.success('Profile completed! Redirecting...')
      router.replace(role === 'BRAND' ? '/onboarding/brand' : '/onboarding/influencer')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-peach/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-orange-200/40 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="kiwikoo-wordmark mb-8 text-4xl text-charcoal">
            Kiwikoo
          </Link>
          <h1 className="text-5xl font-serif text-charcoal leading-tight mb-6">
            One-time <br />
            <span className="italic">setup</span>
          </h1>
          <p className="text-lg text-charcoal/70 max-w-md">
            We found your account, but you need to choose how you&apos;ll use Kiwikoo before continuing.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12"
      >
        <div className="w-full max-w-md">
          <Link href="/" className="kiwikoo-wordmark mb-8 block text-3xl text-charcoal lg:hidden">
            Kiwikoo
          </Link>

          <div className="mb-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-charcoal"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>

          <h2 className="text-3xl font-serif text-charcoal mb-2">Complete your profile</h2>
          <p className="text-charcoal/60 mb-8">Choose a role and we&apos;ll finish setting up your account.</p>

          <div className="grid gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('INFLUENCER')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                role === 'INFLUENCER' ? 'border-charcoal bg-charcoal/5' : 'border-subtle bg-white/50 hover:border-charcoal/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'INFLUENCER' ? 'bg-charcoal text-cream' : 'bg-cream text-charcoal'}`}>
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-charcoal">Creator</div>
                  <div className="text-sm text-charcoal/60">Create try-ons and collaborate with brands</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('BRAND')}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                role === 'BRAND' ? 'border-charcoal bg-charcoal/5' : 'border-subtle bg-white/50 hover:border-charcoal/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'BRAND' ? 'bg-charcoal text-cream' : 'bg-cream text-charcoal'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-charcoal">Brand</div>
                  <div className="text-sm text-charcoal/60">Run campaigns and work with creators</div>
                </div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal">
                {role === 'BRAND' ? 'Company name' : 'Full name'}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'BRAND' ? 'Your brand name' : 'Your name'}
                className="w-full px-4 py-3 rounded-xl border border-subtle bg-white/50 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-peach/50 focus:border-peach transition-all"
              />
            </div>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-charcoal text-cream font-medium rounded-full flex items-center justify-center gap-2 hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Saving...
                </span>
              ) : (
                <>
                  Finish setup
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
