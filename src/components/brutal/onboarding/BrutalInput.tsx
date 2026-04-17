'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { ExternalLink, Check, X, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    icon?: React.ReactNode
    prefix?: string
    suffix?: string
    showVerify?: boolean
    onVerify?: () => void
    verifyUrl?: string
}

export function BrutalInput({
    label,
    className,
    icon,
    prefix,
    suffix,
    showVerify,
    onVerify,
    verifyUrl,
    ...props
}: BrutalInputProps) {
    const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const openSafeVerifyUrl = (rawUrl: string) => {
        try {
            const parsed = new URL(rawUrl, window.location.origin)
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                setVerifyState('error')
                setTimeout(() => setVerifyState('idle'), 3000)
                return
            }
            window.open(parsed.toString(), '_blank', 'noopener')
            setVerifyState('success')
            setTimeout(() => setVerifyState('idle'), 3000)
        } catch {
            setVerifyState('error')
            setTimeout(() => setVerifyState('idle'), 3000)
        }
    }

    const handleVerify = () => {
        if (verifyUrl) {
            openSafeVerifyUrl(verifyUrl)
        }
        onVerify?.()
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-black font-bold text-sm tracking-wide ml-1 flex items-center gap-2">
                {icon}
                {label}
            </Label>
            <div className="relative flex items-center">
                {prefix && (
                    <span className="absolute left-4 text-black/40 font-bold text-sm">{prefix}</span>
                )}
                <Input
                    className={`
            border-[2px] border-black rounded-xl px-3 sm:px-4 py-3 sm:py-6 text-sm sm:text-base font-medium 
            bg-white placeholder:text-black/30
            focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            transition-all duration-200
            ${prefix ? 'pl-8' : ''}
            ${suffix || showVerify ? 'pr-24' : ''}
            ${className}
          `}
                    {...props}
                />
                {suffix && (
                    <span className="absolute right-4 text-black/40 font-bold text-sm">{suffix}</span>
                )}
                {showVerify && props.value && (
                    <motion.button
                        type="button"
                        onClick={handleVerify}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
              absolute right-2 px-3 py-1.5 rounded-lg font-bold text-xs border-2 border-black
              flex items-center gap-1.5 transition-all
              ${verifyState === 'success'
                                ? 'bg-[#B4F056] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : verifyState === 'error'
                                    ? 'bg-red-400'
                                    : 'bg-[#FFD93D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            }
            `}
                    >
                        {verifyState === 'loading' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : verifyState === 'success' ? (
                            <>
                                <Check className="w-3 h-3" strokeWidth={3} />
                                Verified
                            </>
                        ) : verifyState === 'error' ? (
                            <>
                                <X className="w-3 h-3" strokeWidth={3} />
                                Error
                            </>
                        ) : (
                            <>
                                <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
                                Verify
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </div>
    )
}

interface BrutalNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label: string
    icon?: React.ReactNode
    unit?: string
    formatDisplay?: boolean
    max?: number
    min?: number
    error?: string
    onValueChange?: (value: string, numericValue: number | null) => void
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    allowKMNotation?: boolean
}

/**
 * Parse K/M notation input (e.g., "1.5M" → 1500000, "500K" → 500000)
 */
function parseKMNotation(input: string): number | null {
    if (!input) return null
    const cleaned = input.trim().toUpperCase()
    const match = cleaned.match(/^([\d.]+)\s*([KMB])?$/)
    if (!match) return null

    const num = parseFloat(match[1])
    if (isNaN(num)) return null

    const suffix = match[2]
    if (suffix === 'K') return num * 1000
    if (suffix === 'M') return num * 1000000
    if (suffix === 'B') return num * 1000000000
    return num
}

/**
 * Format number with K/M/B suffix for display
 */
function formatWithSuffix(num: number): string {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return num.toString()
}

export function BrutalNumberInput({
    label,
    className,
    icon,
    unit,
    formatDisplay,
    value,
    onChange,
    onValueChange,
    max,
    min = 0,
    error,
    allowKMNotation = false,
    ...props
}: BrutalNumberInputProps) {
    const [localError, setLocalError] = useState<string | null>(null)
    const displayError = error || localError

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        setLocalError(null)

        // Try K/M notation parsing if enabled
        if (allowKMNotation && /[KMBkmb]/.test(rawValue)) {
            const parsed = parseKMNotation(rawValue)
            if (parsed !== null) {
                if (max !== undefined && parsed > max) {
                    setLocalError(`Max: ${formatWithSuffix(max)}`)
                    return
                }
                if (min !== undefined && parsed < min) {
                    setLocalError(`Min: ${formatWithSuffix(min)}`)
                    return
                }
                onValueChange?.(parsed.toString(), parsed)
                return
            }
        }

        // Standard numeric handling
        const numValue = rawValue === '' ? null : Number(rawValue)

        if (numValue !== null) {
            if (max !== undefined && numValue > max) {
                setLocalError(`Max: ${formatWithSuffix(max)}`)
                return
            }
            if (min !== undefined && numValue < min) {
                setLocalError(`Min: ${formatWithSuffix(min)}`)
                return
            }
        }

        onChange?.(e)
        onValueChange?.(rawValue, numValue)
    }

    const hasError = Boolean(displayError)

    return (
        <div className="space-y-1.5">
            <Label className="text-black font-bold text-sm tracking-wide ml-1 flex items-center gap-2">
                {icon}
                {label}
                {max !== undefined && (
                    <span className="text-black/40 font-medium text-xs ml-auto">
                        max {formatWithSuffix(max)}
                    </span>
                )}
            </Label>
            <div className="relative">
                <Input
                    type={allowKMNotation ? "text" : "number"}
                    inputMode="decimal"
                    value={value}
                    onChange={handleChange}
                    className={`
            border-[2px] rounded-xl px-3 sm:px-4 py-3 sm:py-6 text-base sm:text-lg font-black
            bg-white placeholder:text-black/30 placeholder:font-medium
            focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            transition-all duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${unit ? 'pr-14' : ''}
            ${hasError
                            ? 'border-red-500 focus-visible:border-red-500 bg-red-50'
                            : 'border-black focus-visible:border-black'
                        }
            ${className}
          `}
                    {...props}
                />
                {unit && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg border-2 border-black text-xs font-black ${hasError ? 'bg-red-400' : 'bg-[#FF8C69]'}`}>
                        {unit}
                    </div>
                )}
            </div>
            {displayError && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-bold ml-1"
                >
                    ⚠️ {displayError}
                </motion.p>
            )}
        </div>
    )
}

interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string
}

export function BrutalTextarea({ label, className, ...props }: BrutalTextareaProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-black font-bold text-sm tracking-wide ml-1">{label}</Label>
            <textarea
                className={`
          w-full border-[2px] border-black rounded-xl px-4 py-4 text-base font-medium 
          bg-white placeholder:text-black/30 min-h-[120px] resize-none
          focus:outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          transition-all duration-200
          ${className}
        `}
                {...props}
            />
        </div>
    )
}
