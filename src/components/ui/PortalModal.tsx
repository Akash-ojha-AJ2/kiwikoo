'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PortalModalProps {
    children: React.ReactNode
    isOpen: boolean
    onClose: () => void
}

export const PortalModal = ({ children, isOpen, onClose }: PortalModalProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (!isOpen) return

        let originalOverflow: string | null = null
        let originalPaddingRight: string | null = null

        if (document.body.style.overflow !== 'hidden') {
            originalOverflow = document.body.style.overflow
            originalPaddingRight = document.body.style.paddingRight
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        window.addEventListener('keydown', onKeyDown)
        return () => {
            if (originalOverflow !== null) {
                document.body.style.overflow = originalOverflow
                if (originalPaddingRight !== null) {
                    document.body.style.paddingRight = originalPaddingRight
                } else {
                    document.body.style.paddingRight = ''
                }
            }
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isOpen, onClose])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="relative z-[99999]">
                    {children}
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
