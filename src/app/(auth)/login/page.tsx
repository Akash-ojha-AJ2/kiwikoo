'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, LayoutGroup } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { setAuthToast } from '@/components/auth-toast-bridge'
import { createClient } from '@/lib/auth-client'
import { getPublicSiteUrlClient } from '@/lib/site-url'
import { isSyntheticEmail } from '@/lib/auth-username'
import { showErrorToast, showInfoToast, showSuccessToast, showWarningToast } from '@/lib/kiwikoo-toast'

type LoginQueryState = {
  redirect: string | null
  from: string | null
  confirmed: string | null
  error: string | null
  details: string | null
  requested: string | null
  actual: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [queryState, setQueryState] = useState<LoginQueryState>({
    redirect: null,
    from: null,
    confirmed: null,
    error: null,
    details: null,
    requested: null,
    actual: null,
  })
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [showRecoveryEmailInput, setShowRecoveryEmailInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<'influencer' | 'brand'>('influencer')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQueryState({
      redirect: params.get('redirect'),
      from: params.get('from'),
      confirmed: params.get('confirmed'),
      error: params.get('error'),
      details: params.get('details'),
      requested: params.get('requested'),
      actual: params.get('actual'),
    })
  }, [])

  const getSafeRedirectTarget = () => {
    const redirectTarget = queryState.redirect
    if (!redirectTarget) return '/marketplace'

    const value = redirectTarget.trim()
    if (!value.startsWith('/') || value.startsWith('//')) return '/marketplace'
    if (value.includes('\r') || value.includes('\n')) return '/marketplace'
    if (value.startsWith('/admin')) return '/marketplace'

    return value
  }

  const getPostLoginDestination = (
    user: {
      role?: string
      onboardingCompleted?: boolean
      approvalStatus?: string
    } | null | undefined,
    fallbackTarget: string
  ) => {
    const role = String(user?.role || 'INFLUENCER').toUpperCase()
    const onboardingCompleted = Boolean(user?.onboardingCompleted)
    const approvalStatus = String(user?.approvalStatus || 'none').toLowerCase()

    if (role === 'BRAND') {
      if (!onboardingCompleted) return '/onboarding/brand'
      return fallbackTarget
    }

    if (!onboardingCompleted) return '/onboarding/influencer'
    if (approvalStatus === 'rejected') return '/onboarding/influencer?mode=resubmit'
    if (approvalStatus !== 'approved') return '/influencer/pending'

    return fallbackTarget
  }

  useEffect(() => {
    const from = queryState.from
    if (from === 'brand') {
      setUserType('brand')
    }
  }, [queryState.from])

  useEffect(() => {
    const confirmed = queryState.confirmed
    const error = queryState.error
    const details = queryState.details
    const requestedRole = queryState.requested
    const actualRole = queryState.actual

    if (confirmed === 'true') {
      showSuccessToast('Email confirmed', 'You can now sign in to continue.')
    } else if (error === 'role_mismatch') {
      const requestedLabel = requestedRole === 'brand' ? 'brand' : 'influencer'
      const actualLabel = actualRole === 'brand' ? 'brand' : 'influencer'
      if (actualRole === 'brand' || actualRole === 'influencer') {
        setUserType(actualRole)
      }
      showErrorToast(
        'Wrong portal for this Google account',
        `This Google account is already linked to a ${actualLabel} account. Use the ${actualLabel} login or a different Google account for ${requestedLabel}.`
      )
    } else if (error === 'oauth_failed') {
      showErrorToast('Google sign-in did not finish', details || 'Please try again.')
    } else if (error === 'missing_code') {
      showErrorToast('Authentication interrupted', 'Please try again.')
    } else if (error) {
      showErrorToast('Authentication error', details || 'Please try again.')
    }
  }, [queryState.actual, queryState.confirmed, queryState.details, queryState.error, queryState.requested])

  const accentColor = userType === 'influencer' ? '#FF8C69' : '#B4F056'
  const accentButtonClass = userType === 'influencer'
    ? 'bg-[#FF8C69] hover:bg-[#ff9f80]'
    : 'bg-[#B4F056] hover:bg-[#c3f570]'
  const panelCopy = userType === 'influencer'
    ? {
        title: 'Welcome,',
        subtitle: 'sign in to continue',
    sideTitle: 'Comeback to the studio',
        sideAccent: 'creator mode',
        sideBody: 'Access try-ons, campaign requests, and your creator dashboard without losing the playful Kiwikoo energy.',
      }
    : {
        title: 'Welcome,',
        subtitle: 'sign in to continue',
        sideTitle: 'Step back into the brand suite',
        sideAccent: 'campaign mode',
        sideBody: 'Launch products, manage collaborations, and review generated assets from one bold control room.',
      }
  const floatingLabel = userType === 'influencer' ? 'Creator Login' : 'Brand Login'

  const isLayoutFlipped = userType === 'brand'
  const isUsernameEntry = Boolean(identifier.trim()) && !identifier.includes('@')

  const fetchAuthoritativeUser = async () => {
    const meRes = await fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    })

    if (!meRes.ok) {
      throw new Error('Could not verify signed-in account state')
    }

    const meData = await meRes.json().catch(() => ({}))
    if (!meData?.user) {
      throw new Error('Signed in, but account data could not be loaded')
    }

    return {
      ...meData.user,
      onboardingCompleted:
        meData.user.onboardingCompleted ?? Boolean(meData.profile?.onboarding_completed),
      approvalStatus:
        meData.user.approvalStatus ?? meData.profile?.approval_status ?? 'none',
      avatarUrl: meData.user.avatarUrl ?? meData.profile?.avatar_url ?? null,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedIdentifier = identifier.trim().toLowerCase()
    if (!normalizedIdentifier || !password) {
      showErrorToast('Missing details', 'Please enter your username/email and password.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: normalizedIdentifier,
          password,
          rememberMe: true,
          portalRole: userType,
        }),
      })

      const data = await res.json().catch(() => ({ error: 'Request failed' }))

      if (!res.ok) {
        if (data?.errorCode === 'INVALID_CREDENTIALS') {
          showErrorToast('Sign-in failed', 'Invalid username/email or password.')
          return
        }

        if (data?.errorCode === 'EMAIL_NOT_CONFIRMED') {
          showErrorToast('Email not confirmed', 'Please confirm your email before signing in.')
          return
        }

        if (data?.errorCode === 'RATE_LIMITED') {
          showWarningToast('Too many attempts', 'Please wait a bit before trying again.')
          return
        }

        if (data?.errorCode === 'ROLE_MISMATCH') {
          const requestedLabel = data?.requestedRole === 'brand' ? 'brand' : 'influencer'
          const actualLabel = data?.actualRole === 'brand' ? 'brand' : 'influencer'
          if (data?.actualRole === 'brand' || data?.actualRole === 'influencer') {
            setUserType(data.actualRole)
          }
          showErrorToast(
            'Wrong portal for this account',
            `This account belongs to the ${actualLabel} portal. Use the ${actualLabel} login instead of ${requestedLabel}.`
          )
          return
        }

        showErrorToast('Sign-in failed', data.error ?? 'Please try again.')
        return
      }

      const sessionUser = data?.user ?? null
      const redirectTarget = getSafeRedirectTarget()
      let resolvedUser = sessionUser
      const normalizedRecoveryEmail = recoveryEmail.trim().toLowerCase()

      if (sessionUser) {
        queryClient.removeQueries({ queryKey: ['user'] })
        resolvedUser = await fetchAuthoritativeUser()
        queryClient.setQueryData(['user'], resolvedUser)
      }

      const nextTarget = getPostLoginDestination(resolvedUser, redirectTarget)

      if (resolvedUser && isSyntheticEmail(resolvedUser.email) && normalizedRecoveryEmail) {
        const recoveryRes = await fetch('/api/auth/change-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail: normalizedRecoveryEmail, password }),
        })

        const recoveryData = await recoveryRes.json().catch(() => ({}))
        if (recoveryRes.ok) {
          setAuthToast('logged_in')
          showSuccessToast('Recovery email started', 'Check both inboxes to confirm your recovery email.')
        } else {
          showErrorToast('Recovery email failed', recoveryData?.error || 'Signed in, but we could not start recovery email setup.')
        }
      } else {
        setAuthToast('logged_in')
      }

      if (nextTarget === '/onboarding/brand') {
        showInfoToast('Finish brand setup', 'Complete onboarding to unlock your workspace.')
      } else if (nextTarget === '/onboarding/influencer') {
        showInfoToast('Finish creator onboarding', 'Complete your setup to continue.')
      } else if (nextTarget === '/onboarding/influencer?mode=resubmit') {
        showInfoToast('Updates needed', 'Review your profile and resubmit it for approval.')
      } else if (nextTarget === '/influencer/pending') {
        showInfoToast('Profile under review', 'Your creator account is still pending approval.')
      }

      router.replace(nextTarget)
      router.refresh()
    } catch (error: unknown) {
      console.error('Login error:', error)
      showErrorToast('Sign-in failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient()
      const siteUrl = getPublicSiteUrlClient()
      const redirectTarget = getSafeRedirectTarget()
      const callbackUrl = new URL('/auth/callback', siteUrl)
      callbackUrl.searchParams.set('next', redirectTarget)
      callbackUrl.searchParams.set('role', userType)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        showErrorToast('Google sign-in failed', 'Failed to initialize Google Sign In.')
      }
    } catch (error) {
      console.error('Google login error:', error)
      showErrorToast('Google sign-in failed', 'An error occurred during Google Sign In.')
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#F4F4F0]">
      {/* Clip decoration only — page-level overflow-hidden breaks visibility of fixed UI (e.g. toasts) inside some roots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute -left-14 top-14 h-36 w-36 rounded-full border-[4px] border-black bg-[#FF8C69] opacity-15 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:-left-20 lg:top-20 lg:h-64 lg:w-64 lg:opacity-20" />
        <div className="absolute -right-12 bottom-12 h-44 w-44 rotate-12 rounded-[32px] border-[4px] border-black bg-[#B4F056] opacity-15 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:-right-20 lg:bottom-20 lg:h-80 lg:w-80 lg:rounded-[40px] lg:opacity-20" />
      </div>

      <div className="relative z-10 lg:hidden">
        <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8">
          <div className="w-full max-w-[430px]">
            <AuthCard
              title={panelCopy.title}
              subtitle={panelCopy.subtitle}
              userType={userType}
              onUserTypeChange={setUserType}
              identifier={identifier}
              onIdentifierChange={setIdentifier}
              password={password}
              onPasswordChange={setPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              loading={loading}
              handleSubmit={handleSubmit}
              isUsernameEntry={isUsernameEntry}
              showRecoveryEmailInput={showRecoveryEmailInput}
              onToggleRecoveryEmail={() => setShowRecoveryEmailInput((prev) => !prev)}
              recoveryEmail={recoveryEmail}
              onRecoveryEmailChange={setRecoveryEmail}
              handleGoogleLogin={handleGoogleLogin}
              accentButtonClass={accentButtonClass}
              floatingLabel={floatingLabel}
              accentColor={accentColor}
            />
          </div>
        </div>
      </div>

      <LayoutGroup>
        <motion.div
          layout
          className={`relative z-10 hidden w-full lg:flex lg:min-h-[100dvh] lg:p-6 xl:p-8 ${isLayoutFlipped ? 'flex-row-reverse' : 'flex-row'}`}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Left Panel - Branding/Info */}
          <motion.div
            layout
            className="relative flex w-full flex-col justify-center overflow-hidden rounded-[40px] border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] xl:p-10 lg:w-[50%] xl:w-[54%]"
            style={{ backgroundColor: userType === 'influencer' ? '#FFF4F0' : '#F7FCEB' }}
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
                  {userType === 'influencer' ? 'Creator Mode' : 'Brand Mode'}
                </span>
              </div>
              
              <h1 className="text-[clamp(3rem,5vw,5rem)] font-black uppercase leading-[0.9] text-black">
                {panelCopy.sideTitle}
              </h1>
              
              <div className="mt-8 rounded-2xl border-[4px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xl font-bold leading-relaxed text-black/80">
                  {panelCopy.sideBody}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Login Form */}
          <motion.div
            layout
            className="flex w-full items-center justify-center p-8 lg:w-[50%] xl:w-[46%]"
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full max-w-[440px]"
            >
              <AuthCard
                title={panelCopy.title}
                subtitle={panelCopy.subtitle}
                userType={userType}
                onUserTypeChange={setUserType}
                identifier={identifier}
                onIdentifierChange={setIdentifier}
                password={password}
                onPasswordChange={setPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
                loading={loading}
                handleSubmit={handleSubmit}
                isUsernameEntry={isUsernameEntry}
                showRecoveryEmailInput={showRecoveryEmailInput}
                onToggleRecoveryEmail={() => setShowRecoveryEmailInput((prev) => !prev)}
                recoveryEmail={recoveryEmail}
                onRecoveryEmailChange={setRecoveryEmail}
                handleGoogleLogin={handleGoogleLogin}
                accentButtonClass={accentButtonClass}
                floatingLabel={floatingLabel}
                accentColor={accentColor}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

type AuthCardProps = {
  title: string
  subtitle: string
  userType: 'influencer' | 'brand'
  onUserTypeChange: (type: 'influencer' | 'brand') => void
  identifier: string
  onIdentifierChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  loading: boolean
  handleSubmit: (e: React.FormEvent) => void
  isUsernameEntry: boolean
  showRecoveryEmailInput: boolean
  onToggleRecoveryEmail: () => void
  recoveryEmail: string
  onRecoveryEmailChange: (value: string) => void
  handleGoogleLogin: () => void
  accentButtonClass: string
  floatingLabel: string
  accentColor: string
}

function AuthCard({
  title,
  subtitle,
  userType,
  onUserTypeChange,
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  loading,
  handleSubmit,
  isUsernameEntry,
  showRecoveryEmailInput,
  onToggleRecoveryEmail,
  recoveryEmail,
  onRecoveryEmailChange,
  handleGoogleLogin,
  accentButtonClass,
  floatingLabel,
  accentColor,
}: AuthCardProps) {
  return (
    <div className="relative z-20 rounded-[30px] border-[4px] border-black bg-white p-6 pt-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      <div className="absolute -top-5 left-8 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD93D] px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-2.5 w-2.5 rounded-full border-[2px] border-black" style={{ backgroundColor: accentColor }} />
        <span className="text-xs font-black uppercase tracking-[0.15em] text-black">{floatingLabel}</span>
      </div>

      <div className="mb-6 mt-2">
        <h2 className="text-[2.2rem] font-black leading-none text-black sm:text-[2.5rem]">{title}</h2>
        <p className="mt-2 text-base font-bold text-black/60">{subtitle}</p>
      </div>
      <div className="mb-6 flex rounded-2xl border-[3px] border-black bg-[#F4F4F0] p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <button
          type="button"
          onClick={() => onUserTypeChange('influencer')}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-[0.2em] transition-all ${userType === 'influencer' ? 'border-[2px] border-black bg-[#FF8C69] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black/50 hover:text-black'}`}
        >
          Creator
        </button>
        <button
          type="button"
          onClick={() => onUserTypeChange('brand')}
          className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-[0.2em] transition-all ${userType === 'brand' ? 'border-[2px] border-black bg-[#B4F056] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black/50 hover:text-black'}`}
        >
          Brand
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-black">Username / Email</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
              <Mail className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => onIdentifierChange(e.target.value)}
              className="h-13 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-4 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:h-14"
              placeholder="username or email"
              required
            />
          </div>
        </div>

        {isUsernameEntry && (
          <div className="space-y-2 rounded-2xl border-[3px] border-black bg-[#FFF4CC] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-black">Recovery Email</label>
                <p className="mt-1 text-[11px] font-bold text-black/60">Optional for username-only accounts.</p>
              </div>
              <button
                type="button"
                onClick={onToggleRecoveryEmail}
                className="rounded-xl border-[2px] border-black bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {showRecoveryEmailInput ? 'Hide' : 'Add'}
              </button>
            </div>

            {showRecoveryEmailInput && (
              <>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => onRecoveryEmailChange(e.target.value)}
                  className="h-13 w-full rounded-2xl border-[3px] border-black bg-white px-4 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:h-14"
                  placeholder="Add email for forgot password"
                />
                <p className="text-[11px] font-bold text-black/60">
                  Only needed if this username-based account still uses an internal recovery email.
                </p>
              </>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-black">Password</label>
            <Link href="/forgot-password" className="text-xs font-bold underline decoration-2 hover:text-[#FF8C69]">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border-[2px] border-black bg-white">
              <Lock className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="h-13 w-full rounded-2xl border-[3px] border-black bg-white pl-16 pr-12 text-base font-semibold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-black/35 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:h-14"
              placeholder="password"
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 hover:bg-black/5"
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-black" /> : <Eye className="h-4 w-4 text-black" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex h-13 w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black font-black text-sm uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:h-14 ${accentButtonClass}`}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <>Let&apos;s go <ArrowRight className="h-5 w-5 text-black" strokeWidth={3} /></>}
        </button>
      </form>

      <div className="mt-4">
        <p className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.22em] text-black/45 sm:text-xs">Continue with</p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:h-14 sm:w-14"
            aria-label="Continue with Google"
          >
            <GoogleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-[13px] font-bold text-black/60 sm:text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="px-1 text-black underline decoration-2 transition-colors hover:bg-[#FFD93D]">
            Join Now
          </Link>
        </p>
      </div>
    </div>
  )
}


function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}
