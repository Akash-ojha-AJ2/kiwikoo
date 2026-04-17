"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Heart, Shield, Zap, Sparkles } from "lucide-react";

const values = [
    {
        title: "Identity",
        icon: Heart,
        description:
            "Your face, your style, your identity. Our AI preserves every unique detail that makes you, you. We never alter or modify your appearance beyond clothing visualization.",
        color: "from-peach to-rose",
    },
    {
        title: "Privacy",
        icon: Shield,
        description:
            "Your photos are processed securely and never stored. We believe in privacy-first AI that respects your data and gives you complete control over your content.",
        color: "from-cyan-400 to-blue-500",
    },
    {
        title: "Speed",
        icon: Zap,
        description:
            "Instant results powered by cutting-edge AI. Our Flash model delivers try-on results in seconds, while Pro model provides studio-quality outputs when you need the best.",
        color: "from-amber-400 to-orange-500",
    },
    {
        title: "Magic",
        icon: Sparkles,
        description:
            "Powered by Gemini AI, we create photorealistic visualizations that feel like real photography. See exactly how clothes will look on you before you buy.",
        color: "from-purple-400 to-pink-500",
    },
];

export default function ValuesScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeValue, setActiveValue] = useState(0);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

    useEffect(() => {
        let rafId: number | null = null
        let lastIndex = activeValue
        
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (rafId !== null) return // Throttle with RAF
            
            rafId = requestAnimationFrame(() => {
                const index = Math.min(
                    Math.floor(latest * values.length),
                    values.length - 1
                );
                // Only update if index actually changed
                if (index !== lastIndex) {
                    setActiveValue(index);
                    lastIndex = index
                }
                rafId = null
            });
        });
        return () => {
            unsubscribe();
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [scrollYProgress, activeValue]);

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-cream">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <motion.div
                        className={`absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-30 bg-gradient-to-br ${values[activeValue].color}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                </div>

                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full h-full items-center">
                    {/* Left Column: Values List */}
                    <div className="relative flex flex-col justify-center h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <span className="text-sm font-medium text-peach uppercase tracking-wider">Our Values</span>
                            <h2 className="text-3xl md:text-4xl font-serif mt-2 text-charcoal">
                                What We <span className="italic">Stand For</span>
                            </h2>
                        </motion.div>

                        <div className="space-y-6 relative z-10">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        animate={{
                                            opacity: activeValue === index ? 1 : 0.4,
                                            x: activeValue === index ? 12 : 0,
                                            scale: activeValue === index ? 1 : 0.98,
                                        }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="cursor-pointer flex items-center gap-4"
                                    >
                                        <motion.div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${activeValue === index
                                                    ? `bg-gradient-to-br ${value.color} text-white shadow-lg`
                                                    : "bg-charcoal/5 text-charcoal/40"
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </motion.div>
                                        <h3 className="text-3xl md:text-5xl font-serif text-charcoal">
                                            {value.title}
                                        </h3>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress indicator */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-48 bg-charcoal/10 rounded-full hidden lg:block">
                            <motion.div
                                className="w-full bg-gradient-to-b from-peach to-rose rounded-full"
                                style={{ height: `${((activeValue + 1) / values.length) * 100}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>

                    {/* Right Column: Description Card */}
                    <div className="relative h-full flex items-center">
                        <div className="w-full">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                        animate={{
                                            opacity: activeValue === index ? 1 : 0,
                                            y: activeValue === index ? 0 : 40,
                                            scale: activeValue === index ? 1 : 0.95,
                                            pointerEvents: activeValue === index ? "auto" : "none",
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0 flex items-center"
                                    >
                                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-charcoal/5">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h4 className="text-2xl md:text-3xl font-serif text-charcoal mb-4">
                                                {value.title}
                                            </h4>
                                            <p className="text-lg md:text-xl text-charcoal/70 leading-relaxed">
                                                {value.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
