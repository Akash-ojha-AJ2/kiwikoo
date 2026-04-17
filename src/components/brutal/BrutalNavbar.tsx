"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    ChevronRight,
} from "lucide-react";
import { setAuthToast } from "@/components/auth-toast-bridge";
import { useUser } from "@/lib/react-query/hooks";
import { useQueryClient } from "@tanstack/react-query";
import LogoutButton from "@/components/LogoutButton";

export default function BrutalNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: user, isLoading, isFetching } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);

    // Hide on auth/utility pages, admin routes, onboarding, pending approval, and brand pages (BrandNavbar handles those)
    const isAuthPage =
        pathname?.startsWith("/login") ||
        pathname?.startsWith("/register") ||
        pathname?.startsWith("/signup") ||
        pathname?.startsWith("/forgot-password") ||
        pathname?.startsWith("/reset-password") ||
        pathname?.startsWith("/auth/confirm") ||
        pathname?.startsWith("/complete-profile") ||
        pathname?.startsWith("/onboarding") ||
        pathname?.startsWith("/influencer/pending") ||
        pathname?.startsWith("/admin") ||
        pathname?.startsWith("/brand");

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            queryClient.setQueryData(["user"], null);
            queryClient.invalidateQueries({ queryKey: ["user"] });
            queryClient.removeQueries({ queryKey: ["user"] });
            queryClient.clear();

            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (typeof window !== "undefined") {
                // Remove only auth-related keys, preserve user preferences
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('sb-') || key.startsWith('supabase')) {
                        localStorage.removeItem(key);
                    }
                });
                sessionStorage.clear();
                setAuthToast("logged_out");
            }

            setMobileMenuOpen(false);
            router.replace("/");
            router.refresh();
            return;
        } catch (error) {
            console.error("Logout error:", error);
            setMobileMenuOpen(false);
            router.replace("/");
            router.refresh();
            return;
        }
    }, [isLoggingOut, queryClient, router]);

    const isActive = (path: string) =>
        pathname === path || pathname?.startsWith(path + "/");
    const isLoggedIn = user !== null && user !== undefined;
    const authResolving = isLoading || (isFetching && !isLoggedIn);

    if (isAuthPage) {
        return null;
    }

    // Navigation links based on auth state and role
    const influencerLinks = [
        { href: "/inbox", label: "Inbox", icon: Mail },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
        { href: "/influencer/try-on", label: "Try-On Studio", icon: Camera },
        { href: "/influencer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/influencer/analytics", label: "Analytics", icon: BarChart3 },
    ];

    const brandLinks = [
        { href: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/brand/marketplace", label: "Creators", icon: ShoppingBag },
        { href: "/brand/ads", label: "Ads", icon: Sparkles },
        { href: "/brand/products", label: "Products", icon: Box },
        { href: "/inbox", label: "Inbox", icon: Mail },
    ];

    // Public links for logged-out users (matching user request)
    const publicLinks = [
        { href: "/influencer/try-on", label: "Try-On" },
        { href: "/signup/influencer", label: "For Creators" },
        { href: "/signup/brand", label: "For Brands" },
    ];

    let links: typeof influencerLinks | typeof brandLinks = [];
    if (isLoggedIn && user) {
        if (user.role === "BRAND") {
            links = brandLinks;
        } else if (user.role === "INFLUENCER") {
            links = influencerLinks;
        }
    }

    const userInitial =
        isLoggedIn && user
            ? user.name?.charAt(0).toUpperCase() ||
            user.email?.charAt(0).toUpperCase() ||
            "U"
            : "U";
    const avatarUrl =
        isLoggedIn && user
            ? ((user as any).avatarUrl as string | null) || ((user as any).avatar_url as string | null) || null
            : null;
    const showAvatarImage = Boolean(avatarUrl) && !avatarFailed;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#F9F8F4] border-b-[3px] border-black">
            <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        prefetch={true}
                        className="kiwikoo-wordmark text-2xl md:text-3xl font-black text-black hover:text-[#FF8C69] transition-colors shrink-0"
                    >
                        Kiwikoo
                    </Link>

                    {/* Desktop Navigation - Center */}
                    {authResolving ? null : isLoggedIn ? (
                        <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 lg:gap-3 px-4">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        prefetch={true}
                                        className={`px-3 xl:px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center whitespace-nowrap gap-1.5 xl:gap-2 border-2 border-black ${active
                                            ? "bg-[#FF8C69] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                            : "bg-white text-black hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    ) : (
                        <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 text-base font-bold text-black px-4">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="hover:text-[#FF8C69] transition-colors inline-flex items-center whitespace-nowrap gap-1"
                                >
                                    {link.label}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                        {authResolving ? null : isLoggedIn ? (
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-[#B4F056] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black font-black">
                                    {showAvatarImage ? (
                                        <AppImage
                                            src={avatarUrl!}
                                            alt={user?.name || "Profile"}
                                            className="object-cover"
                                            sizes="40px"
                                            onError={() => setAvatarFailed(true)}
                                        />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <LogoutButton
                                    onClick={() => void handleLogout()}
                                    disabled={isLoggingOut}
                                />
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-3">
                                {/* Log In - Outlined */}
                                <Link
                                    href="/login"
                                    prefetch={true}
                                    className="px-6 py-3 text-base font-bold text-black bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1"
                                >
                                    Log In
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                                {/* Get Started - Filled */}
                                <Link
                                    href="/register"
                                    prefetch={true}
                                    className="px-6 py-3 text-base font-bold text-black bg-[#FF8C69] border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1"
                                >
                                    Get Started
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button type="button"
                            className="lg:hidden p-2 rounded-xl border-2 border-black bg-white hover:bg-[#F9F8F4] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-black" />
                            ) : (
                                <Menu className="w-6 h-6 text-black" />
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
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden bg-[#F9F8F4] border-t-2 border-black"
                    >
                        <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3 max-h-[calc(100dvh-4rem)] overflow-y-auto">
                            {authResolving ? null : isLoggedIn ? (
                                <>
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
                                        <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-[#B4F056] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black font-black text-lg">
                                            {showAvatarImage ? (
                                                <AppImage
                                                    src={avatarUrl!}
                                                    alt={user?.name || "Profile"}
                                                    className="object-cover"
                                                    sizes="48px"
                                                    onError={() => setAvatarFailed(true)}
                                                />
                                            ) : (
                                                userInitial
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-black">
                                                {user?.name || user?.email}
                                            </p>
                                            <p className="text-sm text-black/60">{user?.role}</p>
                                        </div>
                                    </div>

                                    {/* Nav Links */}
                                    {links.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                prefetch={true}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black transition-all ${isActive(link.href)
                                                    ? "bg-[#FF8C69] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                                    : "bg-white text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {link.label}
                                            </Link>
                                        );
                                    })}

                                    <LogoutButton
                                        onClick={() => {
                                            void handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        disabled={isLoggingOut}
                                        fullWidth
                                    />
                                </>
                            ) : (
                                <>
                                    {publicLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-black font-bold hover:text-[#FF8C69] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="pt-4 border-t-2 border-black space-y-3">
                                        <Link
                                            href="/login"
                                            prefetch={true}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center text-black font-bold rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href="/register"
                                            prefetch={true}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full py-3 text-center bg-[#FF8C69] text-black font-bold rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all"
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
    );
}


