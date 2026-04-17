"use client";

import { useState } from "react";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BarChart2, CheckCircle, ShoppingBag, Users } from "lucide-react";

export default function PlatformSection() {
    const [activeTab, setActiveTab] = useState<"brands" | "influencers">("influencers");

    return (
        <section className="py-20 md:py-28 bg-white border-b-[4px] border-black">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="text-center mb-12">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brutal-coral)]">
                        Our Platform
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mt-2 mb-8 tracking-tight">
                        Everything We Give You
                    </h2>

                    <div className="inline-flex p-1.5 bg-[var(--brutal-cream)] border-[4px] border-black shadow-[4px_4px_0_0_#000]">
                        <button type="button"
                            onClick={() => setActiveTab("brands")}
                            className={`px-6 py-3 text-sm font-black uppercase tracking-wide transition-all ${
                                activeTab === "brands"
                                    ? "bg-black text-white shadow-[3px_3px_0_0_var(--brutal-lime)]"
                                    : "text-black hover:bg-black/10"
                            }`}
                        >
                            For Brands
                        </button>
                        <button type="button"
                            onClick={() => setActiveTab("influencers")}
                            className={`px-6 py-3 text-sm font-black uppercase tracking-wide transition-all ${
                                activeTab === "influencers"
                                    ? "bg-black text-white shadow-[3px_3px_0_0_var(--brutal-lime)]"
                                    : "text-black hover:bg-black/10"
                            }`}
                        >
                            For Creators
                        </button>
                    </div>
                </div>

                <div className="border-[4px] border-black bg-[var(--brutal-cream)] shadow-[8px_8px_0_0_#000] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="grid md:grid-cols-2 gap-0"
                        >
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-[3px] border-black font-black text-xs uppercase tracking-wider w-fit mb-6">
                                    {activeTab === "brands" ? <ShoppingBag className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                    {activeTab === "brands" ? "For Brands" : "For Creators"}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight leading-tight mb-4">
                                    {activeTab === "brands"
                                        ? "Reach Gen-Z Authentically"
                                        : "Turn Your Influence Into Income"}
                                </h3>

                                <p className="text-base text-black/80 font-bold leading-relaxed mb-8">
                                    {activeTab === "brands"
                                        ? "Connect with verified creators, launch campaigns, and track performance with our analytics suite."
                                        : "Join creators earning through AI Try-Ons, branded collaborations, and high-commission affiliate links."}
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {(activeTab === "brands"
                                        ? [
                                            "Access Thousands Of Verified Gen-Z Creators",
                                            "AI-Powered Content Moderation And Brand Protection",
                                            "Real-Time Insights And Performance Tracking",
                                        ]
                                        : [
                                            "AI Virtual Try-On Without Ordering Physical Items",
                                            "Earn Up To 10% – 30% Per Sale",
                                            "Share Directly To Your Social Feeds",
                                        ]
                                    ).map((item, i) => (
                                        <motion.li
                                            key={item}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * i }}
                                            className="flex items-center gap-3 p-4 bg-white border-[3px] border-black font-bold text-black"
                                        >
                                            <div className="w-8 h-8 border-[2px] border-black bg-[var(--brutal-coral)] flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-black" />
                                            </div>
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>

                                <Link
                                    href={activeTab === "brands" ? "/signup/brand" : "/signup/influencer"}
                                    className="inline-flex items-center gap-2 w-fit px-6 py-4 bg-[var(--brutal-lime)] text-black font-black text-sm uppercase tracking-wide border-[4px] border-black shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all"
                                >
                                    {activeTab === "brands" ? "Join as Brand" : "Join as Creator"}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="relative h-[320px] md:h-[480px] md:min-h-full border-t-[4px] md:border-t-0 md:border-l-[4px] border-black bg-black overflow-hidden">
                                <AppImage
                                    src={
                                        activeTab === "brands"
                                            ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
                                            : "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop"
                                    }
                                    alt="Platform"
                                    className="object-cover opacity-90"
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                />
                                <div className="absolute bottom-4 left-4 right-4 p-4 bg-white border-[4px] border-black shadow-[4px_4px_0_0_#000]">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black uppercase tracking-wider text-black/60">Performance</span>
                                        <BarChart2 className="w-5 h-5 text-[var(--brutal-coral)]" />
                                    </div>
                                    <div className="h-14 w-full flex items-end gap-1">
                                        {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-[var(--brutal-coral)] border-2 border-black"
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
