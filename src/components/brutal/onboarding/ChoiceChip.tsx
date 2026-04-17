'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ChoiceChipProps {
    label: string
    selected: boolean
    onClick: () => void
    icon?: React.ReactNode
}

export function ChoiceChip({ label, selected, onClick, icon }: ChoiceChipProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className={`
        relative px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-[3px] font-bold text-sm sm:text-base transition-all duration-200
        ${selected
                    ? 'bg-[#FFFDF8] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-0.5'
                    : 'bg-white/80 border-black/20 text-black/50 hover:border-black hover:text-black hover:bg-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]'
                }
      `}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-lg">{icon}</span>}
                    <span className="text-left">{label}</span>
                </div>
                {selected && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="bg-[#B4F056] rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    </motion.div>
                )}
            </div>

            {/* Selected accent line */}
            {selected && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-2 right-2 h-1 bg-[#FF8C69] rounded-full origin-left"
                />
            )}
        </motion.button>
    )
}
