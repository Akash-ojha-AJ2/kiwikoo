"use client";

import { useState } from "react";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, Camera, Search, Users, Globe } from "lucide-react";

const features = [
    {
        title: "Automated Content Creation",
        subtitle: "Create Faster. Stay Consistent.",
        icon: Camera,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
        gridClass: "md:col-span-1 md:row-span-2",
        backTitle: "AUTOMATED CONTENT CREATION",
        backBullets: ["AI Captions & Hashtags", "Auto Product Tagging", "Content Suggestions"],
        cta: "Explore Tools",
        ctaHref: "/influencer/dashboard",
        accent: "var(--brutal-coral)",
    },
    {
        title: "Creator x Brand",
        subtitle: "Earn From Every Look You Share",
        icon: Users,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop",
        gridClass: "md:col-span-2 md:row-span-1",
        backTitle: "CREATOR X BRAND AFFILIATION",
        backBullets: ["Brand Collaborations", "Smart Affiliate Links", "Auto-Tracking & Payouts"],
        cta: "Learn More",
        ctaHref: "/about",
        accent: "var(--brutal-lime)",
    },
    {
        title: "Product Discovery",
        subtitle: "Find The Right Products Instantly",
        icon: Search,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop",
        gridClass: "md:col-span-1 md:row-span-1",
        backTitle: "EASY PRODUCT DISCOVERY",
        backBullets: ["AI-Curated Collections", "Trending Products", "Brand-Approved Catalogs"],
        cta: "Discover",
        ctaHref: "/marketplace",
        accent: "var(--brutal-coral)",
    },
    {
        title: "Deep Analytics",
        subtitle: "Know What Truly Performs",
        icon: BarChart2,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
        gridClass: "md:col-span-2 md:row-span-1",
        backTitle: "DEEP ANALYTICS",
        backBullets: ["Clicks & Conversions", "Revenue Insights", "Audience Behavior"],
        cta: "View Insights",
        ctaHref: "/influencer/dashboard",
        accent: "var(--brutal-lime)",
    },
    {
        title: "Social Integration",
        subtitle: "One Platform. All Channels.",
        icon: Globe,
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop",
        gridClass: "md:col-span-1 md:row-span-1",
        backTitle: "SOCIAL MEDIA INTEGRATION",
        backBullets: ["Instagram, YouTube & More", "Auto Link Insertion", "Unified Performance"],
        cta: "Connect",
        ctaHref: "/settings/profile",
        accent: "var(--brutal-coral)",
    },
];

function FlipCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div
            className={`${feature.gridClass} min-h-[260px] ${index === 0 ? "md:min-h-[540px]" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            style={{ perspective: 1000 }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <div className="relative w-full h-full group">
                {/* Back */}
                <motion.div
                    className="absolute inset-0 w-full h-full border-[4px] border-black bg-[var(--brutal-cream)] p-5 flex flex-col justify-between shadow-[6px_6px_0_0_#000]"
                    initial={false}
                    animate={{ opacity: isFlipped ? 1 : 0, zIndex: isFlipped ? 20 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ pointerEvents: isFlipped ? "auto" : "none" }}
                >
                    <div>
                        <div className="w-10 h-1 mb-3" style={{ backgroundColor: feature.accent }} />
                        <h3 className="text-xs font-black uppercase text-black tracking-wider mb-3">
                            {feature.backTitle}
                        </h3>
                        <ul className="space-y-2">
                            {feature.backBullets.map((b, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-bold text-black/80">
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-black" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Link
                        href={feature.ctaHref}
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-black border-b-[3px] border-black pb-1 w-fit hover:bg-black hover:text-white px-2 -mx-2 py-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {feature.cta}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Front */}
                <motion.div
                    className="relative w-full h-full border-[4px] border-black overflow-hidden shadow-[6px_6px_0_0_#000]"
                    initial={false}
                    animate={{ opacity: isFlipped ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ zIndex: isFlipped ? 0 : 10 }}
                >
                    <AppImage
                        src={feature.image}
                        alt={feature.title}
                        className="object-cover"
                        sizes="(min-width: 768px) 25vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <div className="absolute top-0 left-0 w-full h-1.5 z-20" style={{ backgroundColor: feature.accent }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 bg-black/90">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                            {feature.title}
                        </h3>
                        <p className="text-white/80 text-sm font-bold mt-1 uppercase tracking-wide">Hover to explore</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-20 md:py-28 bg-white border-b-[4px] border-black">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-12"
                >
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brutal-coral)]">
                        Our Features
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mt-2 tracking-tight">
                        What we are building
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[260px]">
                    {features.map((feature, index) => (
                        <FlipCard key={feature.title} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
