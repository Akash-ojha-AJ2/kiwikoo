"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-24 md:py-32 bg-black border-b-[4px] border-black text-center overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none bg-[length:24px_24px] [background-image:radial-gradient(#fff_1px,transparent_1px)]" />
            <div className="mx-auto max-w-3xl px-6 md:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight mb-6 leading-[0.95]">
                        Ready to Transform{" "}
                        <span className="italic text-[var(--brutal-coral)]">Fashion?</span>
                    </h2>

                    <p className="text-lg md:text-xl text-white/80 mb-10 font-bold max-w-xl mx-auto">
                        Join the future of fashion marketing. Whether you&apos;re a creator or a brand,
                        Gen-Z fashion is your gateway to success.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
                        <Link href="/register">
                            <span className="inline-flex w-full items-center justify-center gap-2 px-6 py-4 text-center bg-[var(--brutal-lime)] text-black font-black text-sm uppercase tracking-wide border-[4px] border-black shadow-[6px_6px_0_0_var(--brutal-lime)] transition-all hover:shadow-[3px_3px_0_0_var(--brutal-lime)] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none sm:w-auto sm:min-w-[200px] sm:px-8">
                                Create Account
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </Link>
                        <Link href="/about">
                            <span className="inline-flex w-full items-center justify-center px-6 py-4 text-center bg-white text-black font-black text-sm uppercase tracking-wide border-[4px] border-white shadow-[6px_6px_0_0_rgba(255,255,255,0.3)] transition-all hover:bg-[var(--brutal-cream)] hover:border-[var(--brutal-cream)] sm:w-auto sm:min-w-[200px] sm:px-8">
                                Learn More
                            </span>
                        </Link>
                    </div>

                    <p className="mt-10 text-sm text-white/50 font-bold">
                        No credit card required for creators. 14-day free trial for brands.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

