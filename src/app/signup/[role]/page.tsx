'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from '@/lib/simple-sonner'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User, ShieldCheck } from 'lucide-react'

import { createClient } from '@/lib/auth-client'
import { getPublicSiteUrlClient } from '@/lib/site-url'

export default function SignupPage() {
  const router = useRouter()
  const params = useParams()
  const role = (params.role as string)?.toLowerCase() || 'influencer'
  const isInfluencer = role === 'influencer'

  const accentButtonClass = isInfluencer
    ? 'bg-[#FF8C69] hover:bg-[#ff9f80]'
    : 'bg-[#B4F056] hover:bg-[#c3f570]'
  const accentColor = isInfluencer ? '#FF8C69' : '#B4F056'

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms) {
      toast.error('Please agree to the Terms of Service')
      return
    }
    if (formData.username.trim().length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: isInfluencer ? 'INFLUENCER' : 'BRAND',
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Signup request failed')
      }

      toast.success('Verification code sent to your email!')
      setSignupStep('otp')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          token: otp,
          username: formData.username.trim().toLowerCase(),
          role: isInfluencer ? 'INFLUENCER' : 'BRAND',
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Verification failed')
      }

      toast.success('Account verified!')
      router.replace(isInfluencer ? '/onboarding/influencer' : '/onboarding/brand')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }


  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const siteUrl = getPublicSiteUrlClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback?role=${role}`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) throw new Error(error.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google signup failed')
      setLoading(false)
    }
  }

  const copy = isInfluencer
    ? {
        eyebrow: 'Creator Sign Up',
        title: 'Welcome,',
        subtitle: 'sign up to continue',
        sideTitle: 'Build your creator front row',
        sideAccent: 'try-on access',
        sideBody: 'Create a profile that feels premium from the first click, then move straight into products, try-ons, and collaborations.',
        sideNote: 'Sharper creator setup. Less friction. Faster runway.',
      }
    : {
        eyebrow: 'Brand Sign Up',
        title: 'Welcome,',
        subtitle: 'sign up to continue',
        sideTitle: 'Open your campaign command center',
        sideAccent: 'brand access',
        sideBody: 'Set up products, discover creators, and keep every launch in one place with a bold Kiwikoo workflow.',
        sideNote: 'Products, creators, campaigns, and assets in one clean flow.',
      }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#F4F4F0]">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] [background-size:40px_40px]" />
      
      {/* Background decorative shapes */}
      <div className="absolute -left-14 top-14 h-36 w-36 rounded-full border-[4px] border-black bg-[#FF8C69] opacity-15 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:-left-20 lg:top-20 lg:h-64 lg:w-64 lg:opacity-20" />
      <div className="absolute -right-12 bottom-12 h-44 w-44 rotate-12 rounded-[32px] border-[4px] border-black bg-[#B4F056] opacity-15 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:-right-20 lg:bottom-20 lg:h-80 lg:w-80 lg:rounded-[40px] lg:opacity-20" />

      <div className="relative z-10 lg:hidden">
        <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
          <div className="w-full max-w-[440px]">
            <SignupCard
              eyebrow={copy.eyebrow}
              title={signupStep === 'form' ? copy.title : 'Verify Email'}
              subtitle={signupStep === 'form' ? copy.subtitle : `Enter the code sent to ${formData.email}`}
              signupStep={signupStep}
              setSignupStep={setSignupStep}
              otp={otp}
              setOtp={setOtp}
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              handleSubmit={handleSubmit}
              handleVerifyOtp={handleVerifyOtp}
              handleGoogleSignup={handleGoogleSignup}
              loading={loading}
              accentButtonClass={accentButtonClass}
              isInfluencer={isInfluencer}
              accentColor={accentColor}
            />

          </div>
        </div>
      </div>

      <div className="relative z-10 hidden min-h-[100dvh] lg:flex lg:p-6 xl:p-8">
        <div className="flex w-full flex-row gap-8 xl:gap-10">
          {/* Left Panel - Branding/Info */}
          <motion.div
            layout
            className="relative flex w-full flex-col justify-center overflow-hidden rounded-[40px] border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] xl:p-10 lg:w-[50%] xl:w-[54%]"
            style={{ backgroundColor: isInfluencer ? '#FFF4F0' : '#F7FCEB' }}
          >
            {/* Decorative elements inside the panel */}
            <motion.div
              className="absolute right-8 top-8 h-20 w-20 rounded-full border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xl:right-12 xl:top-12 xl:h-24 xl:w-24"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 m-auto h-8 w-8 rounded-full border-[3px] border-black" style={{ backgroundColor: accentColor }} />
            </motion.div>
            
            <motion.div
              className="absolute bottom-8 right-12 h-24 w-24 rotate-12 rounded-2xl border-[4px] border-black bg-[#FFD93D] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] xl:bottom-12 xl:right-24 xl:h-32 xl:w-32"
              animate={{ rotate: [12, 20, 12] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="absolute bottom-16 left-8 h-12 w-12 -rotate-12 border-[4px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xl:bottom-24 xl:left-12 xl:h-16 xl:w-16"
              animate={{ rotate: [-12, -25, -12] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border-[3px] border-black bg-white px-5 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="h-3.5 w-3.5 rounded-full border-[2px] border-black" style={{ backgroundColor: accentColor }} />
                <span className="text-sm font-black uppercase tracking-[0.15em] text-black">
                  {copy.sideAccent}
                </span>
              </div>
              
              <h1 className="text-[clamp(3rem,5vw,5rem)] font-black uppercase leading-[0.9] text-black">
                {copy.sideTitle}
              </h1>
              
              <div className="mt-8 rounded-2xl border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xl font-bold leading-relaxed text-black/80">
                  {copy.sideBody}
                </p>
                <p className="mt-4 text-sm font-black uppercase tracking-[0.15em] text-black/40">
                  {copy.sideNote}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Signup Form */}
          <div className="flex w-full items-center justify-center p-8 lg:w-[50%] xl:w-[46%]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full max-w-[480px]"
            >
              <SignupCard
                eyebrow={copy.eyebrow}
                title={signupStep === 'form' ? copy.title : 'Verify Email'}
                subtitle={signupStep === 'form' ? copy.subtitle : `Enter the code sent to ${formData.email}`}
                signupStep={signupStep}
                setSignupStep={setSignupStep}
                otp={otp}
                setOtp={setOtp}
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleSubmit={handleSubmit}
                handleVerifyOtp={handleVerifyOtp}
                handleGoogleSignup={handleGoogleSignup}
                loading={loading}
                accentButtonClass={accentButtonClass}
                isInfluencer={isInfluencer}
                accentColor={accentColor}
              />

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


type FormState = {
  username: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}


type SignupCardProps = {
  eyebrow: string
  title: string
  subtitle: string
  signupStep: 'form' | 'otp'
  setSignupStep: React.Dispatch<React.SetStateAction<'form' | 'otp'>>
  otp: string
  setOtp: React.Dispatch<React.SetStateAction<string>>
  formData: FormState
  setFormData: React.Dispatch<React.SetStateAction<FormState>>
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  showConfirmPassword: boolean
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: (e: React.FormEvent) => void
  handleVerifyOtp: (e: React.FormEvent) => void
  handleGoogleSignup: () => void
  loading: boolean
  accentButtonClass: string
  isInfluencer: boolean
  accentColor: string
}


function SignupCard({
  eyebrow,
  title,
  subtitle,
  signupStep,
  setSignupStep,
  otp,
  setOtp,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleSubmit,
  handleVerifyOtp,
  handleGoogleSignup,
  loading,
  accentButtonClass,
  isInfluencer,
  accentColor,
}: SignupCardProps) {

  return (
    <div className="relative z-20 rounded-[30px] border-[4px] border-black bg-white p-6 pt-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      <div className="absolute -top-5 left-8 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD93D] px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-2.5 w-2.5 rounded-full border-[2px] border-black" style={{ backgroundColor: accentColor }} />
        <span className="text-xs font-black uppercase tracking-[0.15em] text-black">{eyebrow}</span>
      </div>

      <div className="mb-6 mt-2">
        <h2 className="text-[2.2rem] font-black leading-none text-black sm:text-[2.5rem]">{title}</h2>
        <p className="mt-2 text-base font-bold text-black/60">{subtitle}</p>
      </div>

      {signupStep === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Username" icon={<User className="h-4 w-4 text-black" strokeWidth={2.5} />} iconBg="#B4F056">
            <input
              type="text"
              placeholder="your username"
              value={formData.username}
              onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              required
              className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-4 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </AuthField>

          <AuthField label="Email" icon={<Mail className="h-4 w-4 text-black" strokeWidth={2.5} />} iconBg="#60A5FA">
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-4 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </AuthField>

          <AuthField label="Password" icon={<Lock className="h-4 w-4 text-black" strokeWidth={2.5} />} iconBg="#FFD93D">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
          </AuthField>

          <AuthField label="Confirm Password" icon={<Lock className="h-4 w-4 text-black" strokeWidth={2.5} />} iconBg="#A78BFA">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="confirm password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
              className="h-14 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-12 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 hover:bg-black/5"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
            </button>
          </AuthField>

          <label className="flex items-start gap-3 rounded-2xl border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="relative mt-0.5">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
                className="h-5 w-5 appearance-none rounded border-[2px] border-black bg-white checked:bg-[#B4F056]"
              />
              {formData.agreeTerms && (
                <svg className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-sm font-semibold leading-snug text-black/70">
              I agree to the <span className="font-black text-black">Terms</span> and <span className="font-black text-black">Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black font-black text-sm uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${accentButtonClass}`}
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending Code</> : <>Verify Email <ArrowRight className="h-5 w-5" strokeWidth={2.5} /></>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <AuthField label="Verification Code" icon={<ShieldCheck className="h-4 w-4 text-black" strokeWidth={2.5} />} iconBg="#B4F056">
            <input
              type="text"
              placeholder="12345678"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={8}
              className="h-14 w-full text-center text-2xl tracking-[0.5em] rounded-2xl border-[3px] border-black bg-white px-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/20 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </AuthField>

          <p className="text-center text-sm font-bold text-black/60">
            A verification code has been sent to <br />
            <span className="text-black">{formData.email}</span>
          </p>


          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black font-black text-sm uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${accentButtonClass}`}
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying</> : <>Submit Code <ArrowRight className="h-5 w-5" strokeWidth={2.5} /></>}
            </button>
            <button
              type="button"
              onClick={() => setSignupStep('form')}
              className="w-full text-center text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
            >
              Change Email
            </button>
          </div>
        </form>
      )}


      <div className="mt-6">
        <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.22em] text-black/45">Continue with</p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Continue with Google"
          >
            <GoogleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mt-5 text-center">
        <p className="text-sm font-bold text-black/60">
          Already have an account?{' '}
          <Link href="/login" className="px-1 text-black underline decoration-2 transition-colors hover:bg-[#FFD93D]">
            Sign In
          </Link>
        </p>
        <p className="mt-2 text-xs font-semibold text-black/50">
          {isInfluencer ? 'Set up your creator profile in minutes.' : 'Get your brand workspace ready fast.'}
        </p>
      </div>
    </div>
  )
}

function AuthField({
  label,
  icon,
  iconBg,
  children,
}: {
  label: string
  icon: React.ReactNode
  iconBg: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-[0.2em] text-black">{label}</label>
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        {children}
      </div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}
