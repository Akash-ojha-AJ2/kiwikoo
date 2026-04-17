"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShoppingBag, TrendingUp, Zap } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col md:flex-row md:min-h-0 md:aspect-[16/10] border-b-[4px] border-black bg-[var(--brutal-cream)] overflow-hidden">
            {/* Left: content block - asymmetric */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-16 md:py-24">
                <div
                    className="absolute inset-0 opacity-[0.5]"
                    style={{
                        backgroundImage: `radial-gradient(#000 1.5px, transparent 1.5px)`,
                        backgroundSize: "20px 20px",
                    }}
                />
                <div className="relative">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-block mb-6 px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-[0.2em] border-[4px] border-black shadow-[6px_6px_0_0_var(--brutal-coral)]"
                    >
                        Kiwikoo · Production
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] text-black leading-[0.92] max-w-3xl uppercase"
                    >
                        Where Fashion MEETS{" "}
                        <span className="relative inline-flex items-center text-[var(--brutal-coral)] border-[4px] md:border-[5px] lg:border-[6px] border-[var(--brutal-coral)] px-4 py-1 lg:px-5 lg:py-2 rounded-[14px] lg:rounded-[20px] ml-1 lg:ml-2 mt-2 md:mt-0">
                            AI
                            {/* Stars Overlay to mask out top-right corner border */}
                            <span className="absolute -top-[0.5em] -right-[0.5em] lg:-top-[0.6em] lg:-right-[0.6em] bg-[var(--brutal-cream)] w-[1em] h-[1em] flex items-center justify-center z-10 pointer-events-none">
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="var(--brutal-coral)" xmlns="http://www.w3.org/2000/svg" className="absolute -top-[10%] -right-[10%] w-[1em] h-[1em]">
                                    <path d="M12 0C12.5 6.5 17.5 11.5 24 12C17.5 12.5 12.5 17.5 12 24C11.5 17.5 6.5 12.5 0 12C6.5 11.5 11.5 6.5 12 0Z" />
                                </svg>
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="var(--brutal-coral)" xmlns="http://www.w3.org/2000/svg" className="absolute top-[80%] -right-[20%] w-[0.45em] h-[0.45em]">
                                    <path d="M12 0C12.5 6.5 17.5 11.5 24 12C17.5 12.5 12.5 17.5 12 24C11.5 17.5 6.5 12.5 0 12C6.5 11.5 11.5 6.5 12 0Z" />
                                </svg>
                                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="var(--brutal-coral)" xmlns="http://www.w3.org/2000/svg" className="absolute -top-[20%] right-[80%] w-[0.3em] h-[0.3em]">
                                    <path d="M12 0C12.5 6.5 17.5 11.5 24 12C17.5 12.5 12.5 17.5 12 24C11.5 17.5 6.5 12.5 0 12C6.5 11.5 11.5 6.5 12 0Z" />
                                </svg>
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mt-6 text-base md:text-lg text-black/80 max-w-xl font-medium leading-relaxed"
                    >
                        The ultimate fashion marketplace connecting influencers with the hottest brands.
                        Try, Share, and Earn with vertically integrated AI.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
                    >
                        <Link href="/register">
                            <span className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-center bg-[var(--brutal-lime)] text-black font-black text-sm uppercase tracking-wide border-[4px] border-black shadow-[6px_6px_0_0_#000] transition-all hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] sm:w-auto sm:px-8">
                                Get Started For Free
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </Link>
                        <Link href="/login">
                            <span className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-center bg-white text-black font-black text-sm uppercase tracking-wide border-[4px] border-black shadow-[6px_6px_0_0_#000] transition-all hover:shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none sm:w-auto sm:px-8">
                                Log In
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Right: brutal block with stats - overlaps on md+ */}
            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative flex-shrink-0 w-full md:w-[42%] lg:w-[38%] min-h-[280px] md:min-h-0 md:flex md:items-center md:justify-end md:pr-0"
            >
                <div className="absolute inset-0 md:left-[-5%] md:top-0 md:bottom-0 md:w-[110%] bg-white border-l-[4px] md:border-l-0 border-t-[4px] md:border-t-0 border-black [box-shadow:-8px_8px_0_0_#000] md:[box-shadow:-12px_12px_0_0_#000]" />
                <div className="relative z-10 grid grid-cols-1 gap-4 px-6 py-12 sm:grid-cols-2 md:flex md:flex-col md:gap-6 md:items-end md:py-16 md:pr-12 md:pb-24 lg:pr-20">
                    {[
                        { icon: Zap, label: "Instant", sub: "Virtual Try-On" },
                        { icon: ShoppingBag, label: "Marketplace", sub: "Brand Connect" },
                        { icon: TrendingUp, label: "Analytics", sub: "Real-time Data" },
                    ].map((item) => (
                        <div
                            key={item.sub}
                            className="bg-[var(--brutal-cream)] border-[4px] border-black p-4 md:p-5 shadow-[4px_4px_0_0_#000]"
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 border-[3px] border-black flex items-center justify-center mb-2 bg-white">
                                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--brutal-coral)]" />
                            </div>
                            <span className="block text-sm md:text-base font-black text-black uppercase tracking-tight">{item.label}</span>
                            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">{item.sub}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

