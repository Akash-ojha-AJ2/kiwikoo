'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Camera,
  Sparkles,
} from 'lucide-react'

type Role = 'INFLUENCER' | 'BRAND'

const ROLE_CONTENT: Record<
  Role,
  {
    title: string
    description: string
    accent: string
    bg: string
    iconBg: string
    buttonBg: string
    shadow: string
    bullets: string[]
    Icon: typeof Camera
  }
> = {
  INFLUENCER: {
    title: 'Creator runway',
    description: 'Create try-ons, pitch faster, and keep your content pipeline moving without the usual production drag.',
    accent: '#FF8C69',
    bg: 'bg-[linear-gradient(145deg,#fff6ef_0%,#fffdf8_42%,#ffe1d6_100%)]',
    iconBg: 'bg-[#FF8C69]',
    buttonBg: 'bg-[#FF8C69] hover:bg-[#ff9f80]',
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    bullets: [
      'Generate virtual try-ons in minutes',
      'Build a sharper content portfolio',
      'Access campaign requests and brand deals',
    ],
    Icon: Camera,
  },
  BRAND: {
    title: 'Campaign control',
    description: 'Launch products, find creators, and turn scattered workflows into one clear performance engine.',
    accent: '#B4F056',
    bg: 'bg-[linear-gradient(145deg,#f6ffe8_0%,#fffdf8_42%,#edf8cb_100%)]',
    iconBg: 'bg-[#B4F056]',
    buttonBg: 'bg-[#B4F056] hover:bg-[#c3f570]',
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    bullets: [
      'Discover and brief the right creators faster',
      'Generate ad creatives and product visuals',
      'Keep campaigns, products, and inbox in one flow',
    ],
    Icon: Building2,
  },
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F9F8F4]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#FF8C69] border-t-transparent" />
            <p className="font-medium text-black/60">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()

  const handleJoin = (role: Role) => {
    router.push(`/signup/${role.toLowerCase()}`)
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F9F8F4]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffaf3_0%,#f6efe1_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute left-[-8%] top-[-4%] h-[30rem] w-[30rem] rounded-full bg-[#FF8C69]/28 blur-3xl" />
      <div className="absolute right-[-6%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[#B4F056]/24 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[12%] h-[24rem] w-[24rem] rounded-full bg-[#FFD93D]/22 blur-3xl" />
      <div className="absolute bottom-[0%] right-[16%] h-[20rem] w-[20rem] rounded-full bg-[#FF8C69]/18 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-4 w-4" />
              Start with a side
            </div>
            <h1 className="text-[clamp(2.6rem,6vw,5rem)] font-black uppercase leading-[0.92] text-black">
              Join the
              <br />
              Kiwikoo flow
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-black/65 sm:text-lg">
              Pick the mode that fits you best. Creators get a faster content engine. Brands get a sharper campaign workspace.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
            <RoleCard
              role="INFLUENCER"
              onContinue={() => handleJoin('INFLUENCER')}
            />
            <RoleCard
              role="BRAND"
              onContinue={() => handleJoin('BRAND')}
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 py-2 text-sm font-black uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Already have an account
              <span className="underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleCard({
  role,
  onContinue,
}: {
  role: Role
  onContinue: () => void
}) {
  const content = ROLE_CONTENT[role]
  const Icon = content.Icon

  return (
    <div
      className={`relative overflow-hidden rounded-[30px] border-[4px] border-black p-5 text-left sm:p-6 ${content.bg} ${content.shadow}`}
    >
      <div className="absolute right-4 top-4 h-10 w-10 rounded-full border-[4px] border-black/75 bg-white/40 sm:right-5 sm:top-5 sm:h-14 sm:w-14" />
      <div
        className="absolute right-[1.35rem] top-[1.35rem] h-5 w-5 rounded-full border-[3px] border-black sm:right-9 sm:top-9 sm:h-6 sm:w-6"
        style={{ backgroundColor: content.accent }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black ${content.iconBg}`}>
          <Icon className="h-8 w-8 text-black" strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="pr-12 text-2xl font-black uppercase text-black sm:pr-16 sm:text-3xl">
              {role === 'INFLUENCER' ? 'Creator' : 'Brand'}
            </h3>
            <p
              className="mt-2 text-lg font-black italic leading-none sm:text-xl"
              style={{ color: content.accent }}
            >
              {content.title}
            </p>

            <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-black/68 sm:text-base">
              {content.description}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {content.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm font-bold text-black/82 sm:text-base">
              <span
                className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[2px] border-black"
                style={{ backgroundColor: content.accent }}
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onContinue}
          className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 self-start rounded-2xl border-[3px] border-black px-5 font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:w-auto ${content.buttonBg}`}
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
