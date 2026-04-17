'use client'

import { ReactNode } from 'react'

interface OnboardingCardProps {
    children: ReactNode
    title: string
    step: number
    totalSteps: number
    stepTitle: string
}

export function OnboardingCard({ children, title, step, totalSteps, stepTitle }: OnboardingCardProps) {
    return (
        <div className="relative w-full max-w-2xl mx-auto px-1 sm:px-0">
            <div className="absolute -top-12 sm:-top-16 left-1 sm:left-0 z-30">
                <span className="text-lg sm:text-2xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    Kiwikoo
                </span>
            </div>

            <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-gradient-to-r from-[#FFE066] to-[#FFD93D] border-[3px] border-black rounded-full px-3 sm:px-6 py-2 sm:py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 sm:gap-4">
                    <span className="font-black text-black text-xs sm:text-sm whitespace-nowrap">
                        Step {step} of {totalSteps}
                    </span>
                    <div className="h-4 w-px bg-black/20 hidden sm:block" />
                    <div className="flex gap-1 sm:gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-black transition-colors duration-200 ${i + 1 <= step ? 'bg-[#FF8C69]' : 'bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-20 bg-[#FFFDF8] border-[4px] border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="mt-4">
                    <h1
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-black mb-2 sm:mb-3 tracking-tight"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                    >
                        {title}
                    </h1>

                    <p className="text-sm sm:text-lg text-black/50 font-bold mb-5 sm:mb-8">
                        Step {step} of {totalSteps} - <span className="text-black/70">{stepTitle}</span>
                    </p>

                    <div className="relative z-10 bg-white/50 border-2 border-black/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </div>

            <div
                className="absolute top-8 -right-5 lg:-right-8 w-24 h-[85%] bg-gradient-to-b from-[#FF8C69] to-[#E76B4A] border-[4px] border-black rounded-r-3xl z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hidden lg:block overflow-hidden"
            >
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
                    backgroundSize: '10px 10px'
                }} />
            </div>

            <div className="absolute -bottom-4 left-8 right-8 h-3 bg-[#FFD93D] border-[3px] border-black rounded-full z-0 hidden lg:block" />
        </div>
    )
}
