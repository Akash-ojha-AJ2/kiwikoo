"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Zap, TrendingUp } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 -z-10">
                {/* Main gradient blobs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-peach/40 to-rose/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-orange-200/40 to-amber-100/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[35%] w-[35%] h-[35%] bg-purple-100/20 rounded-full blur-[100px]"
                />

                {/* Floating decorative shapes */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[15%] w-20 h-20 border-2 border-peach/30 rounded-2xl"
                />
                <motion.div
                    animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[35%] left-[10%] w-16 h-16 bg-gradient-to-br from-peach/20 to-rose/20 rounded-full"
                />
                <motion.div
                    animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-[25%] right-[20%] w-12 h-12 border-2 border-charcoal/10 rounded-full"
                />
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[30%] left-[15%] w-8 h-8 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-lg rotate-45"
                />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 -z-5 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(#1F1D1A 1px, transparent 1px), linear-gradient(90deg, #1F1D1A 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="container mx-auto px-6 text-center z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {/* Badge */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
                        }}
                        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-charcoal/5 backdrop-blur-sm rounded-full border border-charcoal/10"
                    >
                        <Sparkles className="w-4 h-4 text-peach" />
                        <span className="text-sm font-medium text-charcoal/80">Powered by Gemini AI</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
                        }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif text-charcoal tracking-tight leading-[0.95]"
                    >
                        AI-Powered <br />
                        <span className="italic bg-gradient-to-r from-charcoal via-charcoal to-rose/80 bg-clip-text">
                            Fashion Try-On
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                        }}
                        className="mt-8 text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto font-sans leading-relaxed"
                    >
                        Connect creators and brands with virtual try-on capabilities,
                        intelligent ad generation, and seamless collaboration.
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                        }}
                        className="mt-6 flex flex-wrap justify-center gap-3"
                    >
                        {[
                            { icon: Zap, text: "Instant Try-On" },
                            { icon: TrendingUp, text: "Brand Collabs" },
                            { icon: Sparkles, text: "AI Magic" },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.text}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-charcoal/5 shadow-sm"
                            >
                                <feature.icon className="w-4 h-4 text-peach" />
                                <span className="text-sm text-charcoal/70">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
                        }}
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/register"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-charcoal text-cream text-sm font-medium rounded-full overflow-hidden transition-all hover:shadow-xl hover:shadow-charcoal/20"
                            >
                                <span className="relative z-10">Get Started Free</span>
                                <motion.span
                                    className="relative z-10"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    →
                                </motion.span>
                                <div className="absolute inset-0 bg-gradient-to-r from-charcoal to-charcoal/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-charcoal/20 text-charcoal text-sm font-medium rounded-full hover:bg-charcoal/5 hover:border-charcoal/30 transition-all"
                            >
                                Log In
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.5, ease: "easeOut" } },
                        }}
                        className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
                    >
                        {[
                            { value: "10K+", label: "Try-Ons" },
                            { value: "500+", label: "Brands" },
                            { value: "2K+", label: "Creators" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-serif text-charcoal">{stat.value}</div>
                                <div className="text-sm text-charcoal/50 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-6 h-10 border-2 border-charcoal/20 rounded-full flex justify-center pt-2"
                >
                    <motion.div className="w-1.5 h-1.5 bg-charcoal/40 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}
