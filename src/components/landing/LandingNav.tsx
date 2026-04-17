'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

const navLinkClass =
  'flex w-full items-center justify-center rounded-[14px] border border-black/10 bg-white/75 px-4 py-3 text-[15px] font-bold text-gray-800 backdrop-blur-sm transition-all duration-300 hover:border-black/20 hover:bg-white/90 hover:text-black active:scale-[0.98]'

const desktopNavItemClass =
  'relative inline-flex items-center justify-center rounded-full px-4 py-2 text-[15px] font-black transition-colors duration-300 z-10'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#what-you-get', label: 'What You Get' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/contact', label: 'Contact us' }
]

export default function LandingNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const activeIndex = pathname === '/' ? 0 : pathname === '/marketplace' ? 2 : 0

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6 lg:pt-4"
        style={{ fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}
      >
        <div className="mx-auto max-w-[1320px] rounded-[26px] border-[2px] border-black/85 bg-[rgba(255,255,255,0.68)] px-4 py-2.5 shadow-[5px_6px_0_0_rgba(0,0,0,0.92)] backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="kiwikoo-wordmark text-[21px] font-black leading-none text-black transition-transform duration-300 hover:scale-[1.03] sm:text-[24px]"
              onClick={() => setOpen(false)}
            >
              Kiwikoo
            </Link>

            <div
              className="hidden items-center gap-2 lg:flex"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {LINKS.map((link, idx) => {
                const isActive = activeIndex === idx
                const isHovered = hoveredIndex === idx
                const isTarget = isHovered || (isActive && hoveredIndex === null)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className={`${desktopNavItemClass} ${isTarget ? 'text-black' : 'text-black/65 hover:text-black'}`}
                  >
                  {isTarget && (
                    <motion.span
                      layoutId="landing-nav-pill"
                      className="absolute inset-0 -z-10 rounded-full border-[2px] border-black bg-white/95 shadow-[2px_3px_0_0_rgba(0,0,0,0.95)]"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                    )}
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <div className="flex items-center gap-1.5 rounded-full border-[2px] border-black bg-white/88 p-1 shadow-[3px_4px_0_0_rgba(0,0,0,0.95)] backdrop-blur-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-black uppercase tracking-[0.08em] text-black/85 transition-colors duration-300 hover:text-black"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border-[1.5px] border-black bg-[#ff8c78] px-5 py-2.5 text-[13px] font-black uppercase tracking-[0.08em] text-black transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border-[2px] border-black bg-white/88 shadow-[3px_4px_0_0_rgba(0,0,0,0.95)] backdrop-blur-sm transition-all duration-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_3px_0_0_rgba(0,0,0,0.95)] active:translate-x-[2px] active:translate-y-[2px] lg:hidden"
            >
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`absolute h-[2px] w-5 bg-black transition-all duration-300 ${open ? 'rotate-45' : '-translate-y-1.5'}`}
                />
                <span
                  className={`absolute h-[2px] w-5 bg-black transition-all duration-300 ${open ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`absolute h-[2px] w-5 bg-black transition-all duration-300 ${open ? '-rotate-45' : 'translate-y-1.5'}`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-[#f7eee4]/90 backdrop-blur-xl transition-all duration-400 lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div
          className={`mx-4 mt-[88px] rounded-[24px] border-[2px] border-black bg-[rgba(251,250,246,0.9)] p-5 shadow-[5px_6px_0_0_rgba(0,0,0,0.92)] backdrop-blur-xl transition-all duration-400 ${open ? 'translate-y-0 scale-100' : 'translate-y-5 scale-95'}`}
          style={{ fontFamily: 'var(--font-plus-jakarta-sans), sans-serif' }}
        >
          <div className="flex flex-col gap-3 text-center">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full border-[2px] border-black bg-white/92 px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.08em] text-black shadow-[3px_4px_0_0_rgba(0,0,0,0.95)]"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-full border-[2px] border-black bg-[#ff8c78] px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.08em] text-black shadow-[3px_4px_0_0_rgba(0,0,0,0.95)]"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
