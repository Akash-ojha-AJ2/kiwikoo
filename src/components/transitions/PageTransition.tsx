'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants, staggerContainer } from '@/lib/animations'

interface PageTransitionProps {
    children: React.ReactNode
    className?: string
}

/**
 * Wrapper component for smooth page transitions
 * Wrap page content with this component for fade + slide animations
 */
export function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Container for staggered list animations
 * Children will animate in sequence with a slight delay
 */
export function StaggerContainer({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={className}
            style={{ willChange: 'transform' }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Wrapper for stagger children items
 */
export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <motion.div
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Fade in wrapper - simple opacity transition
 */
export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.4,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Slide up animation wrapper
 */
export function SlideUp({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Scale fade animation wrapper
 */
export function ScaleFade({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.3,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
