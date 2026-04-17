'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
    glow?: boolean
}

const variants = {
    primary: 'bg-charcoal text-cream hover:bg-charcoal/90',
    secondary: 'bg-peach text-charcoal hover:bg-peach/90',
    outline: 'border-2 border-charcoal/20 text-charcoal hover:bg-charcoal/5',
    ghost: 'text-charcoal hover:bg-charcoal/5',
}

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        loading = false,
        icon,
        iconPosition = 'left',
        glow = false,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const isDisabled = disabled || loading

        return (
            <motion.button
                ref={ref}
                disabled={isDisabled}
                className={`
          relative overflow-hidden rounded-full font-medium
          transition-colors duration-200
          flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${glow ? 'shadow-lg shadow-peach/30' : ''}
          ${className}
        `}
                whileHover={!isDisabled ? {
                    scale: 1.02,
                    transition: { duration: 0.15 }
                } : undefined}
                whileTap={!isDisabled ? {
                    scale: 0.98,
                    transition: { duration: 0.1 }
                } : undefined}
                {...props}
            >
                {/* Glow effect for primary buttons */}
                {glow && variant === 'secondary' && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-peach/50 to-rose/50 blur-xl"
                        animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                )}

                {/* Ripple effect container */}
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <>
                            {icon && iconPosition === 'left' && (
                                <motion.span
                                    initial={{ x: 0 }}
                                    whileHover={{ x: -2 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {icon}
                                </motion.span>
                            )}
                            {children}
                            {icon && iconPosition === 'right' && (
                                <motion.span
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {icon}
                                </motion.span>
                            )}
                        </>
                    )}
                </span>

                {/* Hover shine effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                />
            </motion.button>
        )
    }
)

AnimatedButton.displayName = 'AnimatedButton'

// Success celebration button variant
export function CelebrationButton({
    children,
    onSuccess,
    ...props
}: AnimatedButtonProps & { onSuccess?: () => void }) {
    return (
        <motion.div className="relative">
            <AnimatedButton {...props}>
                {children}
            </AnimatedButton>
        </motion.div>
    )
}
