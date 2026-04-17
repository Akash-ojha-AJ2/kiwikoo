"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Heart, Shield, Zap } from "lucide-react";

const values = [
    {
        id: "identity",
        title: "Creator Identity",
        icon: Heart,
        description: "Your Style Is Not Data. Your Creativity Is Not A Variable.",
        detail:
            "We believe every creator has a unique identity. Our AI supports and amplifies your individuality — we help you present your style more clearly and consistently.",
        accent: "var(--brutal-coral)",
    },
    {
        id: "privacy",
        title: "Privacy & Ownership",
        icon: Shield,
        description: "Trust Is Non-Negotiable.",
        detail:
            "Your data is secure, private, and fully owned by you. We don't sell it or use it without consent.",
        accent: "var(--brutal-lime)",
    },
    {
        id: "speed",
        title: "Speed & Simplicity",
        icon: Zap,
        description: "Great Tools Should Disappear Into The Workflow.",
        detail:
            "Fast, intuitive, and effortless. No cluttered dashboards. Whether discovering products or tracking performance — smooth and friction-free.",
        accent: "var(--brutal-coral)",
    },
    {
        id: "monetization",
        title: "Fair Monetization",
        icon: DollarSign,
        description: "Creators Deserve Clarity And Fairness.",
        detail:
            "Transparent, trackable, and honest. Every click and collaboration clearly visible — no hidden logic or confusing payouts.",
        accent: "var(--brutal-lime)",
    },
];

export default function ValuesSection() {
    const [activeValue, setActiveValue] = useState(values[0]);

    return (
        <section className="py-20 md:py-28 bg-[var(--brutal-cream)] border-b-[4px] border-black">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-12"
                >
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[var(--brutal-coral)]">
                        Our Values
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mt-2 tracking-tight">
                        What We Stand For
                    </h2>
                    <p className="text-base text-black/70 mt-3 max-w-xl font-bold">
                        The principles that guide how we build fashion technology.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-72 lg:flex-col lg:overflow-visible">
                        {values.map((value) => (
                            <motion.button
                                key={value.id}
                                onClick={() => setActiveValue(value)}
                                className={`flex min-h-[88px] items-center gap-3 text-left p-4 border-[4px] border-black font-black text-sm uppercase tracking-wide transition-all ${
                                    activeValue.id === value.id
                                        ? "bg-black text-white shadow-[6px_6px_0_0_var(--brutal-coral)]"
                                        : "bg-white text-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                                }`}
                            >
                                <div
                                    className="w-10 h-10 border-[3px] border-black flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: value.accent }}
                                >
                                    <value.icon className="w-5 h-5 text-black" />
                                </div>
                                {value.title}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex-1 min-h-[320px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeValue.id}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.25 }}
                                className="h-full border-[4px] border-black bg-white p-8 md:p-10 shadow-[8px_8px_0_0_#000] flex flex-col justify-center"
                            >
                                <div
                                    className="w-14 h-14 border-[4px] border-black flex items-center justify-center mb-6"
                                    style={{ backgroundColor: activeValue.accent }}
                                >
                                    <activeValue.icon className="w-7 h-7 text-black" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight mb-3">
                                    {activeValue.title}
                                </h3>
                                <p className="text-lg font-black text-black/90 mb-4 italic">
                                    {activeValue.description}
                                </p>
                                <p className="text-black/75 leading-relaxed font-bold">
                                    {activeValue.detail}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

