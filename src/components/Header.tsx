'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/simple-sonner'
import {
    Menu,
    X,
    Sparkles,
    Camera,
    ShoppingBag,
    LayoutDashboard,
    Mail,
    User,
    Box,
    Megaphone,
    BarChart3,
} from 'lucide-react'
import { setAuthToast } from '@/components/auth-toast-bridge'
import LogoutButton from '@/components/LogoutButton'
import { useUser } from '@/lib/react-query/hooks'
import { useQueryClient } from '@tanstack/react-query'

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: user, isLoading } = useUser()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Hide on auth/utility pages and admin routes (admin uses its own UI)
    const isAuthPage =
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/register') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/reset-password') ||
        pathname?.startsWith('/auth/confirm') ||
        pathname?.startsWith('/complete-profile') ||
        pathname?.startsWith('/signup') ||
        pathname?.startsWith('/admin')

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 20)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return
        setIsLoggingOut(true)
        try {
            queryClient.setQueryData(['user'], null)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            queryClient.removeQueries({ queryKey: ['user'] })
            queryClient.clear()

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            if (typeof window !== 'undefined') {
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('sb-') || key.startsWith('supabase')) {
                        localStorage.removeItem(key);
                    }
                });
                sessionStorage.clear()
                setAuthToast('logged_out')
            }

            setMobileMenuOpen(false)
            router.replace('/')
            router.refresh()
            return
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout cleanly')
            setMobileMenuOpen(false)
            router.replace('/')
            router.refresh()
            return
        }
    }, [isLoggingOut, queryClient, router])

    const isHomePage = pathname === '/'

    // Header style logic
    // Using simple derived state instead of useCallback for rendering logic to simplify deps
    const headerStyle = (() => {
        if (isHomePage) {
            return scrolled
                ? 'bg-cream/95 backdrop-blur-md border-b border-charcoal/5 shadow-sm text-charcoal'
                : 'bg-transparent text-white border-b border-white/10'
        }
        return 'bg-cream/95 backdrop-blur-md border-b border-charcoal/5 shadow-sm text-charcoal'
    })()

    // Derived styles
    const logoColor = (isHomePage && !scrolled) ? 'text-white' : 'text-charcoal'
    const linkColor = (isHomePage && !scrolled) ? 'text-white/80 hover:text-white' : 'text-charcoal/70 hover:text-charcoal'
    const buttonVariant = (isHomePage && !scrolled)
        ? 'bg-white text-charcoal hover:bg-white/90'
        : 'bg-charcoal text-white hover:bg-charcoal/90'

    const isActive = (path: string) => pathname === path
    const authResolving = isLoading && typeof user === 'undefined'
    const isLoggedIn = !authResolving && user !== null && user !== undefined

    // Auth page check - return early if true
    if (isAuthPage) {
        return null
    }

    // Navigation links based on auth state and role
    const influencerLinks = [
        { href: '/inbox', label: 'Inbox', icon: Mail },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
        { href: '/influencer/try-on', label: 'Try-On Studio', icon: Camera },
        { href: '/influencer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/influencer/analytics', label: 'Analytics', icon: BarChart3 },
    ]

    const brandLinks = [
        { href: '/brand/campaigns', label: 'Campaigns', icon: Megaphone },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/brand/marketplace', label: 'Creators', icon: ShoppingBag },
        { href: '/brand/ads', label: 'Ads', icon: Sparkles },
        { href: '/brand/products', label: 'Products', icon: Box },
        { href: '/inbox', label: 'Inbox', icon: Mail },
    ]

    const publicLinks = [
        { href: '/#features', label: 'Features' },
        { href: '/influencer/try-on', label: 'Virtual Try-On' },
        { href: '/signup/brand', label: 'For Brands' },
        { href: '/signup/influencer', label: 'For Creators' },
    ]

    let links: typeof influencerLinks | typeof brandLinks = []
    if (isLoggedIn && user) {
        if (user.role === 'BRAND') {
            links = brandLinks
        } else if (user.role === 'INFLUENCER') {
            links = influencerLinks
        }
    }

    const userInitial = isLoggedIn && user
        ? ((user as any).full_name?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U')
        : 'U'

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerStyle}`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        prefetch={true}
                        className={`kiwikoo-wordmark text-2xl transition-colors ${logoColor}`}
                        data-cursor="Home"
                    >
                        Kiwikoo
                    </Link>

                    {/* Desktop Navigation */}
                    {authResolving ? (
                        <div className="hidden lg:flex items-center gap-1" />
                    ) : isLoggedIn ? (
                        <nav className="hidden lg:flex items-center gap-1">
                            {links.map((link) => {
                                const Icon = link.icon
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        prefetch={true}
                                        data-cursor={active ? '' : link.label}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${active
                                            ? 'bg-peach text-charcoal shadow-sm'
                                            : `${linkColor} hover:bg-white/10`
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    ) : (
                        <nav className={`hidden lg:flex items-center gap-8 text-sm font-medium ${isHomePage && !scrolled ? 'text-white/90' : 'text-charcoal/70'}`}>
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`transition-colors duration-200 ${linkColor}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {authResolving ? (
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="h-10 w-28 rounded-full border border-subtle bg-white/60" />
                            </div>
                        ) : isLoggedIn ? (
                            <div className="hidden lg:flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-peach to-orange-300 flex items-center justify-center text-charcoal font-semibold"
                                    data-cursor={user?.name || 'Profile'}
                                >
                                    {userInitial}
                                </div>
                                <LogoutButton
                                    onClick={handleLogout}
                                    dataCursor="Logout"
                                    disabled={isLoggingOut}
                                    className="border-charcoal bg-[#FF6B57] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:bg-[#FF5A45]"
                                />
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-4">
                                <Link
                                    href="/login"
                                    prefetch={true}
                                    data-cursor="Login"
                                    className={`text-sm font-medium transition-colors duration-200 ${linkColor}`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    prefetch={true}
                                    data-cursor="Start"
                                    className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 shadow-sm ${buttonVariant}`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button type="button"
                            className={`lg:hidden p-2 rounded-lg transition-colors ${isHomePage && !scrolled ? 'hover:bg-white/10 text-white' : 'hover:bg-charcoal/5 text-charcoal'}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-cream/95 backdrop-blur-md border-t border-subtle"
                    >
                        <div className="container mx-auto px-6 py-6 space-y-3">
                            {authResolving ? null : isLoggedIn ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pb-4 border-b border-subtle">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peach to-orange-300 flex items-center justify-center text-charcoal font-semibold text-lg">
                                            {userInitial}
                                        </div>
                                        <div>
                                            <p className="font-medium text-charcoal">{user?.name || user?.email}</p>
                                            <p className="text-sm text-charcoal/60">{user?.role}</p>
                                        </div>
                                    </div>

                                    {/* Nav Links */}
                                    {links.map((link) => {
                                        const Icon = link.icon
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                prefetch={true}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(link.href)
                                                    ? 'bg-charcoal text-cream'
                                                    : 'text-charcoal/70 hover:bg-charcoal/5'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {link.label}
                                            </Link>
                                        )
                                    })}

                                    <LogoutButton
                                        onClick={() => {
                                            void handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        disabled={isLoggingOut}
                                        fullWidth
                                        dataCursor="Logout"
                                        className="mt-2 border-[3px] border-charcoal shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
                                    />
                                </>
                            ) : (
                                <>
                                    {publicLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-charcoal/70 hover:text-charcoal transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="pt-4 border-t border-subtle space-y-3">
                                        <Link
                                            href="/login"
                                            prefetch={true}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center text-charcoal font-medium rounded-full border border-subtle hover:bg-charcoal/5 transition-colors"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/register"
                                            prefetch={true}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center bg-charcoal text-cream font-medium rounded-full hover:bg-charcoal/90 transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}





