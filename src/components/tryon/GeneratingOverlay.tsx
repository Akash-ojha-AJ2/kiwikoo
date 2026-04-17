'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Camera, Brain, Shirt, Wand2, Check, Sparkles, ScanFace, Layers, Sun, AlertCircle } from 'lucide-react'

interface GeneratingOverlayProps {
    isVisible: boolean
    modelType: 'flash' | 'pro' | 'production'
    isComplete?: boolean
}

const steps = [
    { id: 0, icon: Camera, label: 'Analyzing input' },
    { id: 1, icon: Brain, label: 'Processing' },
    { id: 2, icon: Shirt, label: 'Generating try-on' },
    { id: 3, icon: Wand2, label: 'Finalizing' },
]

const productionSteps = [
    { id: 0, icon: Camera, label: 'Quality check' },
    { id: 1, icon: ScanFace, label: 'Face lock' },
    { id: 2, icon: Brain, label: 'Prompt build' },
    { id: 3, icon: Layers, label: 'Generation' },
    { id: 4, icon: Wand2, label: 'Integration' },
    { id: 5, icon: Sun, label: 'Refinement' },
]

// Accurate timing based on actual render performance
const RENDER_TIMES = {
    flash: { min: 12, max: 18, display: '~15 seconds' },
    pro: { min: 65, max: 80, display: '~70 seconds' },
    production: { min: 40, max: 55, display: '~45 seconds' },
}

export function GeneratingOverlay({ isVisible, modelType, isComplete = false }: GeneratingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [progress, setProgress] = useState(0)

    const activeSteps = modelType === 'production' ? productionSteps : steps
    const timing = RENDER_TIMES[modelType]

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0)
            setProgress(0)
            setElapsedTime(0)
            return
        }

        // Timer for elapsed time
        const timerInterval = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000)

        // Progress - based on estimated time
        const avgTime = (timing.min + timing.max) / 2
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev
                const increment = 95 / (avgTime * 5) // Complete 95% in avg time
                return Math.min(prev + increment, 95)
            })
        }, 200)

        // Step progression
        const stepDuration = (avgTime * 1000) / activeSteps.length
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => (prev < activeSteps.length - 1 ? prev + 1 : prev))
        }, stepDuration)

        return () => {
            clearInterval(timerInterval)
            clearInterval(progressInterval)
            clearInterval(stepInterval)
        }
    }, [isVisible, modelType, timing, activeSteps.length])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm"
                >
                    {/* Main content card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md mx-4 bg-cream rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Animated spinner */}
                                    <div className="relative w-12 h-12">
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-4 border-charcoal/10"
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-peach"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-peach" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-serif font-semibold text-charcoal">
                                            {isComplete ? 'Complete!' : 'Generating...'}
                                        </h3>
                                        <p className="text-sm text-charcoal/60">
                                            {isComplete ? 'Your try-on is ready' : activeSteps[currentStep]?.label}
                                        </p>
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="text-right">
                                    <div className="text-2xl font-mono font-bold text-charcoal">
                                        {formatTime(elapsedTime)}
                                    </div>
                                    <p className="text-xs text-charcoal/50">
                                        Est: {timing.display}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="px-6 pb-4">
                            <div className="h-2 bg-charcoal/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-peach to-rose rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: isComplete ? '100%' : `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs text-charcoal/50">
                                    {isComplete ? '100%' : `${Math.round(progress)}%`}
                                </span>
                                <span className="text-xs text-charcoal/50">
                                    Step {currentStep + 1} of {activeSteps.length}
                                </span>
                            </div>
                        </div>

                        {/* Step indicators */}
                        <div className="px-6 pb-6">
                            <div className="flex items-center justify-between">
                                {activeSteps.map((step, index) => {
                                    const isActive = index === currentStep && !isComplete
                                    const isCompleted = index < currentStep || isComplete
                                    const StepIcon = step.icon

                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-1">
                                            <motion.div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : isActive
                                                            ? 'bg-peach text-white'
                                                            : 'bg-charcoal/5 text-charcoal/30'
                                                    }`}
                                                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                {isCompleted ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <StepIcon className="w-5 h-5" />
                                                )}
                                            </motion.div>
                                            {index < activeSteps.length - 1 && (
                                                <div className="absolute" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Model badge */}
                        <div className="px-6 pb-6">
                            <div className={`w-full py-3 rounded-xl text-center text-sm font-semibold ${modelType === 'production'
                                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                    : modelType === 'pro'
                                        ? 'bg-purple-500/10 text-purple-700 border border-purple-500/20'
                                        : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                                }`}>
                                {modelType === 'production' && '🔒 Production Mode'}
                                {modelType === 'pro' && '⚡ Pro Mode (3 Variants)'}
                                {modelType === 'flash' && '🚀 Flash Mode'}
                            </div>
                        </div>

                        {/* Warning for long renders */}
                        {elapsedTime > timing.max && !isComplete && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="px-6 pb-6"
                            >
                                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Taking longer than expected. Please wait...</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
