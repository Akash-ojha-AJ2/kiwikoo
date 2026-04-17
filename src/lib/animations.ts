'use client'

import { Variants } from 'framer-motion'

// ============================================
// ANIMATION VARIANTS
// Centralized animation configurations for consistent UX
// ============================================

// Page Transitions
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Stagger container for lists
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
}

// Individual list items
export const staggerItem: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Card hover effects
export const cardHover: Variants = {
    initial: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
}

// Button interactions
export const buttonVariants: Variants = {
    initial: {
        scale: 1,
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.15,
            ease: 'easeOut',
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1,
        },
    },
}

// Modal/Dialog animations
export const modalVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.95,
        y: 10,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: {
            duration: 0.15,
        },
    },
}

// Overlay/backdrop fade
export const overlayVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 },
    },
}

// Fade in animation
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 },
    },
}

// Slide up animation
export const slideUp: Variants = {
    initial: {
        opacity: 0,
        y: 30,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
}

// Scale fade animation
export const scaleFade: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
    },
}

// Image loading animation
export const imageLoad: Variants = {
    initial: {
        opacity: 0,
        filter: 'blur(10px)',
    },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
}

// Toast notification animation
export const toastVariants: Variants = {
    initial: {
        opacity: 0,
        y: 50,
        scale: 0.9,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.9,
        transition: { duration: 0.2 },
    },
}

// ============================================
// ANIMATION HELPERS
// ============================================

// Transition presets
export const transitions = {
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
    },
    smooth: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
    },
    fast: {
        duration: 0.15,
        ease: 'easeOut',
    },
    slow: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
    },
} as const

// Hover/tap props for motion components
export const interactiveProps = {
    whileHover: 'hover',
    whileTap: 'tap',
    initial: 'initial',
    animate: 'initial',
}

// Card interaction props
export const cardInteraction = {
    variants: cardHover,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
}

// Button interaction props
export const buttonInteraction = {
    variants: buttonVariants,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
}

// ============================================
// GAMIFIED ANIMATIONS
// New variants for enhanced UX
// ============================================

// Sparkle/shine animation
export const sparkleVariants: Variants = {
    initial: {
        scale: 1,
        rotate: 0,
    },
    animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
}

// Pulse glow animation
export const pulseGlowVariants: Variants = {
    initial: {
        boxShadow: '0 0 0 0 rgba(232, 121, 109, 0)',
    },
    animate: {
        boxShadow: [
            '0 0 0 0 rgba(232, 121, 109, 0.4)',
            '0 0 20px 10px rgba(232, 121, 109, 0.2)',
            '0 0 0 0 rgba(232, 121, 109, 0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
}

// Success celebration
export const celebrationVariants: Variants = {
    initial: {
        scale: 0,
        opacity: 0,
    },
    animate: {
        scale: [0, 1.2, 1],
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Confetti burst (for success states)
export const confettiBurst: Variants = {
    initial: {
        opacity: 0,
        scale: 0,
    },
    animate: {
        opacity: [0, 1, 0],
        scale: [0, 1.5, 2],
        transition: {
            duration: 0.8,
            ease: 'easeOut',
        },
    },
}

// Float animation (gentle hovering effect)
export const floatVariants: Variants = {
    initial: {
        y: 0,
    },
    animate: {
        y: [-5, 5, -5],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
}

// Shimmer effect
export const shimmerVariants: Variants = {
    initial: {
        backgroundPosition: '-200% 0',
    },
    animate: {
        backgroundPosition: '200% 0',
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
        },
    },
}

// Progress step animation
export const stepVariants: Variants = {
    inactive: {
        scale: 1,
        opacity: 0.5,
    },
    active: {
        scale: 1.05,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    complete: {
        scale: 1,
        opacity: 1,
        backgroundColor: 'rgb(34, 197, 94)', // green-500
    },
}

// Button click ripple
export const rippleVariants: Variants = {
    initial: {
        scale: 0,
        opacity: 0.5,
    },
    animate: {
        scale: 4,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut',
        },
    },
}

// Image reveal animation
export const imageRevealVariants: Variants = {
    initial: {
        clipPath: 'inset(100% 0 0 0)',
        opacity: 0,
    },
    animate: {
        clipPath: 'inset(0% 0 0 0)',
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Bounce in animation
export const bounceInVariants: Variants = {
    initial: {
        scale: 0,
        opacity: 0,
    },
    animate: {
        scale: [0, 1.1, 0.95, 1],
        opacity: 1,
        transition: {
            duration: 0.5,
            times: [0, 0.6, 0.8, 1],
        },
    },
}

