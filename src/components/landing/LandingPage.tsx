'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeDollarSign,
  Camera,
  ChartColumn,
  CircleDot,
  Facebook,
  Instagram,
  Linkedin,
  Megaphone,
  Rocket,
  Sparkles,
  Star,
  Store,
  Youtube,
  UserRoundX,
  Zap,
} from 'lucide-react'

const PF = 'var(--font-plus-jakarta-sans), sans-serif'

export default function LandingPage() {
  return (
    <div className="bg-[#f7eee4] px-3 pb-8 pt-[88px] text-[#111111] sm:px-4 lg:px-6 lg:pt-[104px]" style={{ fontFamily: PF }}>
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[34px] border-[3px] border-black bg-[#fbfaf6] shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
        <section className="relative overflow-hidden px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-[radial-gradient(circle_at_22%_62%,rgba(255,140,120,0.18),transparent_52%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_35%_40%,rgba(203,255,46,0.16),transparent_46%)]" />
          <div className="pointer-events-none absolute -left-4 top-[92px] h-[88px] w-[88px] rounded-full border-[3px] border-[#ff5aa9] bg-[#ff5aa9] shadow-[6px_6px_0_0_rgba(0,0,0,1)]" />
          <div className="pointer-events-none absolute -right-8 bottom-20 h-[92px] w-[92px] rounded-full border-[3px] border-black bg-[#ffd243] shadow-[6px_6px_0_0_rgba(0,0,0,1)]" />
          <div className="pointer-events-none absolute inset-x-0 top-3 text-center kiwikoo-wordmark text-[clamp(5rem,17vw,14rem)] leading-none tracking-[0.02em] text-black/[0.04]">
            KIWIKOO
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-[620px] pt-1 text-center lg:pt-3 lg:text-left">
              <h1 className="mt-3 text-[clamp(3.3rem,7vw,6.2rem)] font-black uppercase leading-[0.9] tracking-[-0.07em] text-black">
                Where Fashion
                <br />
                Meets <span className="text-[#ff8c78]">AI.</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-[18px] leading-8 text-black/68 max-lg:mx-auto">
                The easiest way for creators and brands to create, launch, and convert with AI-powered fashion tools.
              </p>
              <div className="mt-8 flex flex-nowrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href="/signup/influencer"
                  className="group relative inline-flex h-[72px] min-w-[210px] items-center justify-center overflow-hidden rounded-[16px] border-[3px] border-black bg-[#FF8C69] px-5 py-3 text-[16px] font-black text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.4),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative block h-[1.6em] overflow-hidden">
                    <span className="block transition-all duration-300 group-hover:-translate-y-[1.6em] group-hover:opacity-0">
                      Start Creating
                    </span>
                    <span className="absolute inset-x-0 top-[1.6em] block text-center text-[0.9em] uppercase tracking-[0.08em] opacity-0 transition-all duration-300 group-hover:top-0 group-hover:opacity-100">
                      Creator
                    </span>
                  </span>
                </Link>
                <Link
                  href="/signup/brand"
                  className="group relative inline-flex h-[72px] min-w-[210px] items-center justify-center overflow-hidden rounded-[16px] border-[3px] border-black bg-[#cbff2e] px-5 py-3 text-[16px] font-black text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.35),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative block h-[1.6em] overflow-hidden">
                    <span className="block transition-all duration-300 group-hover:-translate-y-[1.6em] group-hover:opacity-0">
                      Start Scaling
                    </span>
                    <span className="absolute inset-x-0 top-[1.6em] block text-center text-[0.9em] uppercase tracking-[0.08em] opacity-0 transition-all duration-300 group-hover:top-0 group-hover:opacity-100">
                      Brand
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="group relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-2 top-12 z-20 rounded-[22px] border-[3px] border-black bg-[#FFD93D] px-4 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-[-8deg] sm:-left-5">
                <Zap className="h-8 w-8 text-black" strokeWidth={2.4} />
              </div>
              <div className="absolute right-0 top-2 z-20 rounded-[22px] border-[3px] border-black bg-[#89a6ff] px-4 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-2 group-hover:rotate-[8deg]">
                <Sparkles className="h-8 w-8 text-black" strokeWidth={2.4} />
              </div>
              <div className="absolute right-6 top-28 z-20 rounded-[22px] border-[3px] border-black bg-[#cbff2e] px-4 py-4 shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:translate-y-1 group-hover:rotate-[6deg]">
                <Star className="h-7 w-7 text-black" strokeWidth={2.4} />
              </div>

              <div className="relative min-h-[430px] sm:min-h-[500px]">
                <div className="absolute inset-x-[16%] inset-y-[12%] rounded-[30px] border-[3px] border-black bg-[linear-gradient(180deg,#fff7ec_0%,#f6ffd9_100%)] shadow-[7px_7px_0_0_rgba(0,0,0,1)] transition-transform duration-500 group-hover:scale-[1.01]" />
                <div className="pointer-events-none absolute inset-x-[20%] inset-y-[18%] rounded-[26px] bg-[radial-gradient(circle_at_25%_30%,rgba(255,140,120,0.2),transparent_38%),radial-gradient(circle_at_78%_28%,rgba(203,255,46,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,247,232,0.45))]" />
                <div className="absolute bottom-5 right-0 z-10 w-[220px] rotate-[7deg] rounded-[26px] border-[3px] border-black bg-white p-3 shadow-[7px_7px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:translate-y-1 group-hover:rotate-[10deg] sm:w-[250px]">
                  <div className="relative h-[170px] overflow-hidden rounded-[18px] bg-[#fff6f2] sm:h-[190px]">
                    <Image
                      src="/landing/hero-brand.png"
                      alt="Brand setup"
                      fill
                      sizes="(min-width: 1024px) 250px, 220px"
                      className="object-contain object-center"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute inset-x-[8%] bottom-[12px] top-[8%] z-20 flex items-end justify-center">
                  <div className="relative h-full w-full">
                    <Image
                      src="/landing/hero-influencer.png"
                      alt="Creator"
                      fill
                      sizes="(min-width: 1024px) 420px, 70vw"
                      className="object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-[1.03]"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 z-10 flex w-max -translate-x-1/2 items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 py-2 text-[12px] font-black uppercase tracking-[0.08em] text-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:-translate-y-1 sm:bottom-5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#cbff2e]" />
                  Fashion AI studio
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="what-you-get" className="border-t-[3px] border-black bg-[#fbfaf6] px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
          <div className="text-center">
            <h2 className="text-[clamp(2.4rem,5vw,4rem)] font-black leading-[0.95] tracking-[-0.05em] text-black">
              What Kiwikoo can do for you
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <ServiceCard
              icon={<Camera className="h-6 w-6" strokeWidth={2.2} />}
              tone="blue"
              title="AI Try-On Studio"
              body="Create fashion looks without physical shoots or back-and-forth production."
            />
            <ServiceCard
              icon={<Rocket className="h-6 w-6" strokeWidth={2.2} />}
              tone="teal"
              title="Campaign Workflows"
              body="Help brands launch creator-ready campaigns with cleaner approvals and assets."
            />
            <ServiceCard
              icon={<BadgeDollarSign className="h-6 w-6" strokeWidth={2.2} />}
              tone="pink"
              title="Affiliate Engine"
              body="Turn creator output into measurable earning potential and real marketplace action."
            />
          </div>

          <div className="mt-6 rounded-[28px] border-[3px] border-black bg-[#111111] p-6 text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
              <div>
                <MiniPill label="For Creators and Brands" dark />
                <div className="mt-7 space-y-6">
                  <FeatureLine
                    icon={<ChartColumn className="h-5 w-5" strokeWidth={2.2} />}
                    title="Real-Time Analytics"
                    description="No guessing. Just clear numbers."
                    dark
                  />
                  <FeatureLine
                    icon={<Store className="h-5 w-5" strokeWidth={2.2} />}
                    title="Marketplace"
                    description="Find products, creators, and outcomes in one place."
                    dark
                  />
                </div>
              </div>

              <AnalyticsPanel />
            </div>
          </div>
        </section>

        <section id="creator-brand-paths" className="border-t-[3px] border-black bg-white px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
          <div className="text-center">
            <h2 className="text-[clamp(2.35rem,5vw,3.8rem)] font-black leading-[0.95] tracking-[-0.05em] text-black">
              Built for Creators and Brands
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <PathPanel
              label="For Creators"
              tone="coral"
              title={`You've got the style?\nStart earning now.`}
              body="Create AI looks, post faster, and earn from every conversion without shoots, delays, or chasing brands."
              href="/signup/influencer"
              cta="Start creating"
            />
            <PathPanel
              label="For Brands"
              tone="lime"
              title="Spending on marketing without clear results? There's a smarter way."
              body="Find the right creators, generate strong campaign visuals, and launch with more confidence."
              href="/signup/brand"
              cta="Start scaling"
            />
          </div>
        </section>

        <section id="why-kiwikoo" className="border-t-[3px] border-black bg-[#fbfaf6] px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
          <div className="text-center">
            <h2 className="text-[clamp(2.35rem,5vw,3.8rem)] font-black leading-[0.95] tracking-[-0.05em] text-black">
              Why Kiwikoo
            </h2>
            <p className="mx-auto mt-4 max-w-[680px] text-[18px] leading-8 text-black/60">
              We remove the friction from creator-brand production so the work feels faster, sharper, and easier to trust.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <WhyCard
              icon={<UserRoundX className="h-5 w-5" strokeWidth={2.2} />}
              tone="coral"
              title="No Shoots"
              body="Skip the expensive first step and move straight into polished visual output."
            />
            <WhyCard
              icon={<CircleDot className="h-5 w-5" strokeWidth={2.2} />}
              tone="lime"
              title="No Chasing Creators / Brands"
              body="Better communication and faster campaign progress."
            />
            <WhyCard
              icon={<Megaphone className="h-5 w-5" strokeWidth={2.2} />}
              tone="coral"
              title="No Guesswork"
              body="Use stronger performance signals before you spend time or money at scale."
            />
          </div>
        </section>

        <section className="relative overflow-hidden border-t-[3px] border-black bg-[#ff8c78] px-5 py-6 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(255,255,255,0.22),transparent_16%),radial-gradient(circle_at_90%_50%,rgba(255,255,255,0.18),transparent_18%)]" />
          <div className="relative flex flex-wrap items-center justify-center gap-3 text-center text-black sm:gap-5">
            <BandWord label="Create" />
            <BandArrow />
            <BandWord label="Share" />
            <BandArrow />
            <BandWord label="Earn" />
          </div>
        </section>

        <footer className="border-t-[3px] border-black bg-[#fbfaf6] px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                {[
                  { icon: <Facebook className="h-4 w-4" strokeWidth={2.2} />, label: 'Facebook' },
                  { icon: <Instagram className="h-4 w-4" strokeWidth={2.2} />, label: 'Instagram' },
                  { icon: <Youtube className="h-4 w-4" strokeWidth={2.2} />, label: 'YouTube' },
                  { icon: <Linkedin className="h-4 w-4" strokeWidth={2.2} />, label: 'LinkedIn' },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border-[2px] border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                    aria-label={item.label}
                  >
                    {item.icon}
                  </span>
                ))}
              </div>

              <div className="grid gap-6 text-[12px] font-bold uppercase tracking-[0.08em] text-black/65 sm:grid-cols-3 sm:gap-10">
                <div>
                  <div className="mb-2 text-black/35">Company</div>
                  <div className="space-y-2 text-black">
                    <Link href="/about" className="block hover:underline">About Us</Link>
                    <Link href="/signup/influencer" className="block hover:underline">Join Us</Link>
                    <Link href="/marketplace" className="block hover:underline">Marketplace</Link>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-black/35">Legal</div>
                  <div className="space-y-2 text-black">
                    <Link href="/privacy" className="block hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="block hover:underline">Terms of Use</Link>
                  </div>
                </div>
                <div className="space-y-2 text-right max-sm:text-left">
                  <div>(C) 2026 DRIDHATECHNOLOGIES. ALL RIGHTS RESERVED.</div>
                  <div>ENGLISH (US)</div>
                </div>
              </div>
            </div>

            <div className="kiwikoo-wordmark text-[clamp(4.8rem,18vw,10rem)] leading-none text-black/[0.05]">
              KIWIKOO
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function MiniPill({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-[2px] px-4 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
        dark ? 'border-white/15 bg-[#111111] text-white/90' : 'border-black/35 bg-white text-black/75'
      }`}
    >
      {label}
    </span>
  )
}

function ServiceCard({
  icon,
  tone,
  title,
  body,
}: {
  icon: ReactNode
  tone: 'blue' | 'teal' | 'pink'
  title: string
  body: string
}) {
  const accent =
    tone === 'blue'
      ? 'bg-[#a8b9ff]'
      : tone === 'teal'
        ? 'bg-[#2bb7aa]'
        : 'bg-[#ff62b8]'
  const accentSoft =
    tone === 'blue'
      ? 'bg-[#a8b9ff]/18'
      : tone === 'teal'
        ? 'bg-[#2bb7aa]/18'
        : 'bg-[#ff62b8]/18'
  const footerLabel =
    tone === 'blue'
      ? 'Virtual looks'
      : tone === 'teal'
        ? 'Campaign-ready'
        : 'Creator revenue'

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-transform duration-300 hover:-translate-y-1">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${accentSoft} blur-[2px] transition-transform duration-300 group-hover:scale-125`} />
      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-[18px] border-[3px] border-black ${accent} shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:rotate-[-8deg]`}>
        {icon}
      </div>
      <h3 className="mt-6 min-h-[2.15em] text-[28px] font-black leading-[1.02] tracking-[-0.04em] text-black">{title}</h3>
      <p className="mt-3 flex-1 text-[17px] leading-8 text-black/60">{body}</p>
      <div className="mt-5 border-t-[2px] border-black/10 pt-4">
        <span className="rounded-full border-[2px] border-black bg-[#fbfaf6] px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-black">
          {footerLabel}
        </span>
      </div>
    </div>
  )
}

function FeatureLine({
  icon,
  title,
  description,
  dark = false,
}: {
  icon: ReactNode
  title: string
  description: string
  dark?: boolean
}) {
  return (
    <div className="flex items-start gap-4">
      <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2px] ${dark ? 'border-white/35 bg-black text-white' : 'border-black bg-white text-black'}`}>
        {icon}
      </span>
      <div>
        <div className={`text-[22px] font-bold leading-tight ${dark ? 'text-white' : 'text-black'}`}>{title}</div>
        <div className={`mt-1 text-[16px] leading-6 ${dark ? 'text-white/65' : 'text-black/65'}`}>{description}</div>
      </div>
    </div>
  )
}

function AnalyticsPanel() {
  const steps = [
    { label: 'Upload Photo', icon: <Camera className="h-5 w-5" strokeWidth={2.4} />, done: true },
    { label: 'Pick Outfit', icon: <Store className="h-5 w-5" strokeWidth={2.4} />, done: true },
    { label: 'AI Try-On', icon: <Sparkles className="h-5 w-5" strokeWidth={2.4} />, done: false },
  ]

  return (
    <div className="relative rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_84%_18%,rgba(203,255,46,0.12),transparent_30%),linear-gradient(180deg,#151515_0%,#191919_100%)] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="absolute -right-3 -top-3 rounded-[16px] border border-white/12 bg-[#2e2e2e] px-5 py-4 text-right shadow-[0_5px_0_0_rgba(0,0,0,0.4)]">
        <div className="text-[26px] font-black leading-none text-[#ff9d85]">AI</div>
        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">Powered</div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-[#1c1c1c] px-6 py-6">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#cbff2e]" strokeWidth={2.2} />
            <span>Try-On Studio</span>
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-[#cbff2e]" />
            <span className="h-2 w-2 rounded-full bg-[#ff8c78]" />
            <span className="h-2 w-2 rounded-full bg-white/35" />
          </div>
        </div>

        {/* Orbital step flow */}
        <div className="relative mt-8 flex items-center justify-center py-4">
          {/* Connecting arc */}
          <div className="absolute inset-x-[15%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-[#cbff2e]/0 via-[#cbff2e]/30 to-[#ff8c78]/30" />
          <div className="absolute inset-x-[15%] top-1/2 h-px -translate-y-1/2 blur-[3px] bg-gradient-to-r from-[#cbff2e]/0 via-[#cbff2e]/20 to-[#ff8c78]/20" />

          <div className="relative z-10 flex w-full items-center justify-between px-2">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-3">
                <div className="relative">
                  {/* Glow ring */}
                  <div className={`absolute -inset-1.5 rounded-full blur-[6px] ${step.done ? 'bg-[#cbff2e]/20' : 'bg-[#ff8c78]/25 animate-pulse'}`} />
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] ${step.done ? 'border-[#cbff2e] bg-[#cbff2e]/10 text-[#cbff2e]' : 'border-[#ff8c78] bg-[#ff8c78]/10 text-[#ff8c78]'}`}>
                    {step.icon}
                  </div>
                  {step.done && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#cbff2e] text-black">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom cards */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {['Person', 'Outfit', 'Result'].map((label, i) => {
            const colors = ['#89a6ff', '#ff8c78', '#cbff2e']
            const icons = [
              <Camera key="c" className="h-7 w-7" strokeWidth={1.8} style={{ color: colors[i] }} />,
              <Store key="s" className="h-7 w-7" strokeWidth={1.8} style={{ color: colors[i] }} />,
              <Sparkles key="sp" className="h-7 w-7" strokeWidth={1.8} style={{ color: colors[i] }} />,
            ]
            return (
              <div key={label} className="group relative overflow-hidden rounded-[16px] border border-white/8 bg-white/[0.02] py-5 text-center transition-colors hover:bg-white/[0.05]">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 80%, ${colors[i]}15, transparent 70%)` }} />
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10" style={{ background: `${colors[i]}10` }}>
                  {icons[i]}
                </div>
                <div className="relative mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PathPanel({
  label,
  tone,
  title,
  body,
  href,
  cta,
}: {
  label: string
  tone: 'coral' | 'lime'
  title: string
  body: string
  href: string
  cta: string
}) {
  const isCoral = tone === 'coral'
  const accent = isCoral ? '#ff8c78' : '#cbff2e'

  return (
    <div
      className="group relative h-full"
      style={{ perspective: '900px' }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden border-[3px] border-black p-7 transition-transform duration-500 ease-out sm:p-8 group-hover:[transform:rotateY(-2deg)_rotateX(2deg)_scale(1.02)]"
        style={{
          borderRadius: '48px 48px 12px 48px',
          background: isCoral
            ? 'linear-gradient(145deg, #ff8c78 0%, #ffb89e 40%, #ffe8de 100%)'
            : 'linear-gradient(145deg, #cbff2e 0%, #e2ff80 40%, #f4ffe0 100%)',
          boxShadow: `8px 8px 0 0 rgba(0,0,0,1), inset 0 -60px 80px -40px rgba(0,0,0,0.08)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Large faded accent circle */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-[2px]"
          style={{ border: `3px solid ${isCoral ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)'}` }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full opacity-20 blur-[1px]"
          style={{ border: `3px solid ${isCoral ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.08)'}` }}
        />

        {/* Label */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full border-[2.5px] border-black bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <CircleDot className="h-3 w-3" strokeWidth={3} />
          {label}
        </div>

        <div className="mt-7 flex flex-1 flex-col">
          <h3 className="min-h-[3.15em] whitespace-pre-line text-[clamp(2rem,3vw,3rem)] font-black leading-[1.03] tracking-[-0.05em] text-black">
            {title}
          </h3>
          <p className="mt-4 max-w-[520px] text-[17px] leading-8 text-black/60">{body}</p>
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="mt-8 inline-flex items-center justify-center gap-2.5 self-start rounded-full border-[3px] border-black bg-black px-7 py-3.5 text-[14px] font-black uppercase tracking-[0.06em] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          {cta}
          <ArrowRight className="h-4 w-4" strokeWidth={2.7} />
        </Link>

        {/* Bottom-right decorative dot cluster */}
        <div className="pointer-events-none absolute bottom-5 right-6 flex items-end gap-1.5 opacity-25">
          <div className="h-2 w-2 rounded-full bg-black" />
          <div className="h-3 w-3 rounded-full bg-black" />
          <div className="h-1.5 w-1.5 rounded-full bg-black" />
        </div>
      </div>
    </div>
  )
}

function WhyCard({
  icon,
  tone,
  title,
  body,
}: {
  icon: ReactNode
  tone: 'coral' | 'lime'
  title: string
  body: string
}) {
  return (
    <div className="group rounded-[24px] border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-5">
        <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border-[3px] border-black ${tone === 'coral' ? 'bg-[#ff8c78]' : 'bg-[#cbff2e]'} shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform duration-300 group-hover:rotate-[-8deg]`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-[24px] font-black leading-[1.02] tracking-[-0.04em] text-black">{title}</div>
          <p className="mt-3 text-[17px] leading-8 text-black/60">{body}</p>
        </div>
      </div>
    </div>
  )
}

function BandWord({ label }: { label: string }) {
  return (
    <span className="text-[clamp(2.2rem,6vw,4.8rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">
      {label}
    </span>
  )
}

function BandArrow() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[2px] border-black/15 bg-white/25 text-[clamp(1.8rem,3vw,2.5rem)] font-black leading-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]">
      →
    </span>
  )
}

function ContactItem({
  icon,
  label,
  content,
}: {
  icon: ReactNode
  label: string
  content: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-[2px] border-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
        {icon}
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/45">{label}</div>
        <div className="text-[18px] font-semibold text-black/80">{content}</div>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-black/65">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-[12px] border-[2px] border-black bg-white px-4 text-[14px] font-medium text-black outline-none"
        required
      />
    </div>
  )
}
