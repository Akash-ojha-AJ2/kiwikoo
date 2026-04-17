"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sparkles, ShoppingBag, Users, Camera } from "lucide-react";

const features = [
    {
        id: "tryon",
        label: "Virtual Try-On",
        icon: Camera,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop",
        title: "Try Before You Buy",
        description: "Experience clothes virtually with AI-powered try-on. See exactly how outfits look on you before purchasing.",
        gradient: "from-peach/20 to-rose/20",
    },
    {
        id: "brands",
        label: "For Brands",
        icon: ShoppingBag,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
        title: "Scale Your Brand",
        description: "Connect with creators, showcase products with virtual try-ons, and boost conversions with AI-powered marketing.",
        gradient: "from-amber-100/30 to-orange-200/30",
    },
    {
        id: "influencers",
        label: "For Creators",
        icon: Users,
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000&auto=format&fit=crop",
        title: "Monetize Your Influence",
        description: "Partner with top brands, create stunning content with virtual try-ons, and earn from every collaboration.",
        gradient: "from-purple-100/30 to-pink-100/30",
    },
    {
        id: "ai",
        label: "AI Studio",
        icon: Sparkles,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
        title: "Powered by Gemini",
        description: "Our AI creates photorealistic try-on images while preserving your identity. Fast, accurate, and stunning results.",
        gradient: "from-cyan-100/30 to-blue-100/30",
    },
];

export default function ProductSwitcher() {
    const [activeTab, setActiveTab] = useState(features[0].id);
    const activeFeature = features.find((f) => f.id === activeTab) || features[0];

    return (
        <section className="py-24 container mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
            >
                <span className="text-sm font-medium text-peach uppercase tracking-wider">Platform</span>
                <h2 className="text-4xl md:text-5xl font-serif mt-2 text-charcoal">
                    Everything You <span className="italic">Need</span>
                </h2>
            </motion.div>

            <div className="flex flex-col items-center">
                {/* Tab buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-charcoal/5 mb-12 shadow-lg"
                >
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <button type="button"
                                key={feature.id}
                                onClick={() => setActiveTab(feature.id)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                                    activeTab === feature.id
                                        ? "bg-charcoal text-cream shadow-md"
                                        : "text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {feature.label}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Content display */}
                <div className="relative w-full max-w-5xl aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFeature.id}
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={activeFeature.image}
                                alt={activeFeature.label}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, 80vw"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        {(() => {
                                            const Icon = activeFeature.icon;
                                            return <Icon className="w-5 h-5 text-peach" />;
                                        })()}
                                        <span className="text-sm text-white/70 uppercase tracking-wider">
                                            {activeFeature.label}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-serif text-white mb-3">
                                        {activeFeature.title}
                                    </h3>
                                    <p className="text-white/80 max-w-lg text-base md:text-lg leading-relaxed">
                                        {activeFeature.description}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-6 px-6 py-3 bg-white text-charcoal rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                                    >
                                        Learn More →
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
