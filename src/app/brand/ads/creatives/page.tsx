'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    staggerContainer,
    staggerItem,
    pageVariants,
    overlayVariants,
    scaleFade,
} from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { Platform } from '@/lib/ads/ad-styles'
import {
    Plus,
    RefreshCw,
    Sparkles,
    Download,
    Wand2,
    X,
    Instagram,
    Facebook,
    Globe,
    Users,
    ImageIcon,
    ZoomIn,
    AlertCircle,
    Clock3,
    GitBranch,
    ArrowRight,
    ArrowLeft,
} from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import BrutalCard from '@/components/brutal/BrutalCard'
import { BrutalLoader } from '@/components/ui/BrutalLoader'

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface AdCreative {
    id: string
    title: string
    prompt?: string | null
    editPrompt?: string | null
    sourceAdId?: string | null
    isEdited?: boolean
    editTask?: string | null
    editScope?: string | null
    editModel?: string | null
    imageUrl: string
    qualityScore: number
    campaign?: { id: string; title: string }
    platforms: Platform[]
    copyVariants: string[]
    createdAt: string
    regenerationCount: number
    maxRegenerations: number
    stylePreset?: string | null
}

interface Campaign {
    id: string
    title: string
    status: string
}

type QualityTier = 'all' | 'high' | 'medium' | 'low'

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONSTANTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
    instagram: <Instagram className="h-4 w-4" />,
    facebook: <Facebook className="h-4 w-4" />,
    google: <Globe className="h-4 w-4" />,
    influencer: <Users className="h-4 w-4" />,
}

const QUALITY_CONFIG: Record<QualityTier, { min: number; max: number; label: string }> = {
    all: { min: 0, max: 100, label: 'All' },
    high: { min: 80, max: 100, label: 'High (80+)' },
    medium: { min: 60, max: 79, label: 'Medium' },
    low: { min: 0, max: 59, label: 'Low' },
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// QUALITY BADGE â€” NEO-BRUTALIST
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function QualityBadge({ score }: { score: number }) {
    let bg = 'bg-[#FF8C69]' // coral low
    let label = 'Needs work'
    if (score >= 80) {
        bg = 'bg-[#B4F056]'
        label = 'High'
    } else if (score >= 60) {
        bg = 'bg-[#FFD93D]'
        label = 'Medium'
    }
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-1 border-[2px] border-black text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                bg
            )}
        >
            <span>{score}</span>
            <span className="hidden sm:inline">- {label}</span>
        </span>
    )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CREATIVE CARD â€” NEO-BRUTALIST
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function CreativeCard({
    creative,
    onRegenerate,
    onDownload,
    onImageClick,
    onInpaint,
    onViewHistory,
    historyCount,
    regenerating,
    inpainting,
}: {
    creative: AdCreative
    onRegenerate: () => void
    onDownload: () => void
    onImageClick: () => void
    onInpaint: () => void
    onViewHistory: () => void
    historyCount: number
    regenerating: boolean
    inpainting: boolean
}) {
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const relativeDate = getRelativeDate(creative.createdAt)

    const getImageSrc = (url: string) => {
        if (!url) return ''
        if (url.includes('supabase.co/storage')) {
            return `/api/images/proxy?url=${encodeURIComponent(url)}`
        }
        return url
    }

    return (
        <motion.div variants={staggerItem}>
            <BrutalCard
                className={cn(
                    'overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
                    'p-0'
                )}
            >
                <div
                    className="group relative aspect-[4/5] cursor-pointer overflow-hidden bg-[#FFFDF5] border-b-[3px] border-black"
                    onClick={onImageClick}
                >
                    {imageLoading && !imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 border-b-[3px] border-black">
                            <BrutalLoader size="sm" tone="brand" />
                        </div>
                    )}
                    {imageError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#FFFDF5] border-b-[3px] border-black">
                            <AlertCircle className="h-10 w-10 text-black mb-2" />
                            <p className="text-xs font-bold text-black">Image failed to load</p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setImageError(false)
                                    setImageLoading(true)
                                }}
                                className="mt-3 px-3 py-1.5 border-[2px] border-black bg-[#FFD93D] text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <Image
                            src={getImageSrc(creative.imageUrl)}
                            alt={creative.title || 'Ad creative'}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className={cn(
                                'object-cover transition-all duration-300',
                                imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100 hover:scale-105'
                            )}
                            onError={() => {
                                setImageError(true)
                                setImageLoading(false)
                            }}
                            onLoad={() => setImageLoading(false)}
                        />
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {creative.isEdited && (
                            <span className="inline-flex items-center gap-1 rounded-md border-[2px] border-black bg-[#FFD93D] px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Wand2 className="h-3 w-3" />
                                Edited
                            </span>
                        )}
                        {historyCount > 1 && (
                            <span className="inline-flex items-center gap-1 rounded-md border-[2px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <GitBranch className="h-3 w-3" />
                                {historyCount} Versions
                            </span>
                        )}
                    </div>
                    <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 to-transparent">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-white border-[2px] border-black text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <ZoomIn className="h-3.5 w-3.5" /> Click to zoom
                        </span>
                    </div>
                </div>

                <div className="space-y-2 bg-white p-2.5 sm:p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-xs sm:text-[13px] font-black text-black">{creative.title || 'Ad Creative'}</p>
                            <p className="truncate text-[10px] sm:text-[11px] font-bold text-black/65">
                                {creative.campaign?.title || 'Unassigned'}
                            </p>
                        </div>
                        <span className="shrink-0 text-[9px] sm:text-[10px] text-black/50">{relativeDate}</span>
                    </div>
                    {creative.editPrompt && (
                        <div className="rounded-md border-[2px] border-black bg-[#FFF8E6] px-2.5 py-2 text-[11px] font-semibold text-black/75">
                            {creative.editPrompt}
                        </div>
                    )}
                    <div className="flex items-center gap-1 flex-wrap">
                        {creative.platforms.map((p) => (
                            <span
                                key={p}
                                className="p-1 border-[1.5px] border-black bg-[#FFFDF5]"
                                title={p}
                            >
                                {PLATFORM_ICONS[p]}
                            </span>
                        ))}
                        {creative.sourceAdId && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border-[1.5px] border-black bg-[#F5F0FF] px-2 py-1 text-[10px] font-black uppercase text-black/80">
                                <ArrowRight className="h-3 w-3" />
                                Edited from previous
                            </span>
                        )}
                        {creative.editTask && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border-[1.5px] border-black bg-[#ECF8D0] px-2 py-1 text-[10px] font-black uppercase text-black/80">
                                {creative.editTask.replace(/_/g, ' ')}
                            </span>
                        )}
                        {creative.editScope && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border-[1.5px] border-black bg-[#E6F5FF] px-2 py-1 text-[10px] font-black uppercase text-black/80">
                                {creative.editScope.replace(/_/g, ' ')}
                            </span>
                        )}
                        {creative.editModel && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border-[1.5px] border-black bg-[#FFD93D] px-2 py-1 text-[10px] font-black uppercase text-black/80">
                                {creative.editModel}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <QualityBadge score={creative.qualityScore} />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewHistory()
                            }}
                            disabled={historyCount <= 1}
                            className="hidden sm:inline-flex items-center gap-1.5 border-[2px] border-black bg-white px-2.5 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/45 disabled:shadow-none"
                        >
                            <Clock3 className="h-3.5 w-3.5" />
                            History
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRegenerate()
                            }}
                            disabled={regenerating || inpainting}
                            className={cn(
                                'flex min-h-[40px] items-center justify-center gap-1.5 rounded-[18px] px-2.5 py-2 text-center border-[2px] border-black text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all',
                                regenerating
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#FF8C69] hover:bg-[#ff9d7d] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            )}
                        >
                            {regenerating ? <BrutalLoader size="sm" tone="brand" className="!min-h-0" /> : <RefreshCw className="h-3.5 w-3.5 shrink-0" />}
                            <span className="hidden sm:inline">Redo</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onInpaint()
                            }}
                            disabled={regenerating || inpainting}
                            className={cn(
                                'flex min-h-[40px] items-center justify-center gap-1.5 rounded-[18px] px-2.5 py-2 text-center border-[2px] border-black text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all',
                                inpainting
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#FFD93D] hover:bg-[#ffe37a] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                            )}
                        >
                            {inpainting ? <BrutalLoader size="sm" className="!min-h-0" /> : <Wand2 className="h-3.5 w-3.5 shrink-0" />}
                            <span className="hidden sm:inline">{creative.isEdited ? 'Re-edit' : 'Edit'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewHistory()
                            }}
                            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-[18px] px-2.5 py-2 text-center border-[2px] border-black bg-[#C3B1E1] text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <GitBranch className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">History</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDownload()
                            }}
                            className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-[18px] px-2.5 py-2 text-center bg-black text-white border-[2px] border-black font-black text-[10px] sm:text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black/90 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <Download className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Save</span>
                        </button>
                    </div>
                </div>
            </BrutalCard>
        </motion.div>
    )
}

function HistoryModal({
    open,
    onClose,
    focusCreativeId,
    items,
    onPreview,
    onInpaint,
    onDownload,
}: {
    open: boolean
    onClose: () => void
    focusCreativeId: string | null
    items: AdCreative[]
    onPreview: (creative: AdCreative) => void
    onInpaint: (creative: AdCreative) => void
    onDownload: (creative: AdCreative) => void
}) {
    useEffect(() => {
        if (!open) return
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [open, onClose])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="history-modal"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-3 pt-[max(0.75rem,3vh)] backdrop-blur-[2px] sm:p-4 sm:pt-[max(1rem,4vh)]"
                    onClick={onClose}
                >
                    <motion.div
                        variants={scaleFade}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex max-h-[min(88dvh,860px)] w-full max-w-[min(92vw,940px)] flex-col overflow-hidden rounded-[24px] border-[3px] border-black bg-[#FFFDF5] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b-[3px] border-black bg-[#C3B1E1] px-4 py-3">
                            <div>
                                <p className="text-sm font-black uppercase text-black">Creative History</p>
                                <p className="text-[11px] font-bold text-black/65">
                                    {items.length} version{items.length === 1 ? '' : 's'} in this chain
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center border-[2px] border-black bg-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="min-h-0 space-y-3 overflow-y-auto p-4">
                            {items.map((item, index) => {
                                const active = item.id === focusCreativeId
                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'grid gap-3 border-[3px] border-black bg-white p-3 md:grid-cols-[120px_1fr] md:items-start',
                                            active && 'bg-[#FFF3BF]'
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onPreview(item)}
                                            className="relative overflow-hidden border-[2px] border-black bg-[#FFF8E6]"
                                        >
                                            <div className="relative aspect-[4/5] h-full w-full">
                                                <Image
                                                    src={item.imageUrl.includes('supabase.co/storage')
                                                        ? `/api/images/proxy?url=${encodeURIComponent(item.imageUrl)}`
                                                        : item.imageUrl}
                                                    alt={item.title}
                                                    fill
                                                    unoptimized
                                                    sizes="120px"
                                                    className="object-cover"
                                                />
                                            </div>
                                        </button>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center justify-center border-[2px] border-black bg-black px-2 py-1 text-[10px] font-black uppercase text-white">
                                                    V{index + 1}
                                                </span>
                                                {active && (
                                                    <span className="inline-flex items-center gap-1 border-[2px] border-black bg-[#B4F056] px-2 py-1 text-[10px] font-black uppercase">
                                                        Current
                                                    </span>
                                                )}
                                                {item.isEdited && (
                                                    <span className="inline-flex items-center gap-1 border-[2px] border-black bg-[#FFD93D] px-2 py-1 text-[10px] font-black uppercase">
                                                        <Wand2 className="h-3 w-3" /> Edited
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold uppercase text-black/55">
                                                    {getRelativeDate(item.createdAt)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-black">{item.title}</p>
                                                <p className="text-[11px] font-bold text-black/65">
                                                    {item.campaign?.title || 'Unassigned'}
                                                </p>
                                            </div>
                                            {item.editPrompt && (
                                                <div className="rounded-md border-[2px] border-black bg-[#FFF8E6] px-3 py-2 text-[11px] font-semibold text-black/75">
                                                    {item.editPrompt}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <QualityBadge score={item.qualityScore} />
                                                <button
                                                    type="button"
                                                    onClick={() => onInpaint(item)}
                                                    className="inline-flex items-center gap-1.5 border-[2px] border-black bg-[#FFD93D] px-3 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <Wand2 className="h-3.5 w-3.5" />
                                                    Edit Again
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDownload(item)}
                                                    className="inline-flex items-center gap-1.5 border-[2px] border-black bg-black px-3 py-2 text-[11px] font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// LIGHTBOX ? NEO-BRUTALIST

function Lightbox({
    open,
    onClose,
    imageUrl,
}: {
    open: boolean
    onClose: () => void
    imageUrl: string
}) {
    const src = imageUrl.includes('supabase.co/storage')
        ? `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`
        : imageUrl

    useEffect(() => {
        if (!open) return
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.body.style.overflow = originalOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [open, onClose])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="lightbox"
                    variants={overlayVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-3 pt-[max(0.75rem,3vh)] backdrop-blur-[2px] sm:p-4 sm:pt-[max(1rem,4vh)]"
                    onClick={onClose}
                >
                    <motion.div
                        variants={scaleFade}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="relative flex max-h-[min(88dvh,920px)] w-full max-w-[min(88vw,980px)] flex-col rounded-2xl border-[4px] border-black bg-[#FFFDF8] p-3 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center gap-2 rounded-[18px] border-[3px] border-black bg-white px-3 py-2 text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                aria-label="Back"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </button>
                            <button
                                type="button"
                                className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FF8C69] border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-[#ff9d7d] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <X className="h-5 w-5 text-black" />
                            </button>
                        </div>

                        <div className="min-h-0 overflow-hidden rounded-xl border-[2px] border-black bg-white/60 p-2 sm:p-3">
                            <div className="relative mx-auto aspect-[4/5] max-h-[calc(88dvh-8.5rem)] w-full max-w-full">
                                <Image
                                    src={src}
                                    alt="Creative preview"
                                    fill
                                    unoptimized
                                    sizes="100vw"
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
function getRelativeDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function CreativesPage() {
    const router = useRouter()
    const [creatives, setCreatives] = useState<AdCreative[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [campaignFilter, setCampaignFilter] = useState<string>('all')
    const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all')
    const [qualityFilter, setQualityFilter] = useState<QualityTier>('all')
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [regenerating, setRegenerating] = useState<string | null>(null)
    const [inpaintingId, setInpaintingId] = useState<string | null>(null)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)
    const [historyOpenId, setHistoryOpenId] = useState<string | null>(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/ads/creatives').then((r) => r.json()),
            fetch('/api/campaigns').then((r) => r.json()),
        ])
            .then(([creativesData, campaignsData]) => {
                setCreatives(creativesData.creatives || [])
                setCampaigns(campaignsData || [])
            })
            .catch((err) => {
                console.error(err)
                toast.error('Failed to load creatives')
            })
            .finally(() => setLoading(false))
    }, [])

    const creativeMap = new Map(creatives.map((creative) => [creative.id, creative]))

    const getHistoryRootId = (creative: AdCreative) => {
        let current: AdCreative | undefined = creative
        const seen = new Set<string>()

        while (current?.sourceAdId && !seen.has(current.id)) {
            seen.add(current.id)
            const parent = creativeMap.get(current.sourceAdId)
            if (!parent) break
            current = parent
        }

        return current?.id || creative.id
    }

    const historyGroups = new Map<string, AdCreative[]>()
    for (const creative of creatives) {
        const rootId = getHistoryRootId(creative)
        const group = historyGroups.get(rootId) || []
        group.push(creative)
        historyGroups.set(rootId, group)
    }
    for (const group of historyGroups.values()) {
        group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }

    const filteredCreatives = creatives
        .filter((c) => {
            if (campaignFilter !== 'all') {
                if (campaignFilter === 'unassigned') return !c.campaign
                return c.campaign?.id === campaignFilter
            }
            return true
        })
        .filter((c) => (platformFilter === 'all' ? true : c.platforms.includes(platformFilter)))
        .filter((c) => {
            if (qualityFilter === 'all') return true
            const { min, max } = QUALITY_CONFIG[qualityFilter]
            return c.qualityScore >= min && c.qualityScore <= max
        })
        .filter((c) => {
            if (!searchQuery.trim()) return true
            const haystack = [c.title, c.editPrompt, c.editTask, c.editScope, c.prompt, c.campaign?.title]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            return haystack.includes(searchQuery.trim().toLowerCase())
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
        })

    const activeHistoryCreative = historyOpenId ? creativeMap.get(historyOpenId) || null : null
    const activeHistory = activeHistoryCreative
        ? historyGroups.get(getHistoryRootId(activeHistoryCreative)) || []
        : []

    const handleRegenerate = async (creative: AdCreative) => {
        setRegenerating(creative.id)
        try {
            const res = await fetch(`/api/ads/${creative.id}/regenerate`, { method: 'POST' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Regeneration failed')
            }
            toast.success('Creative regenerated!')
            const refreshRes = await fetch('/api/ads/creatives')
            const refreshData = await refreshRes.json()
            setCreatives(refreshData.creatives || [])
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Regeneration failed')
        } finally {
            setRegenerating(null)
        }
    }

    const handleDownload = async (creative: AdCreative) => {
        try {
            const url = creative.imageUrl.includes('supabase.co/storage')
                ? `/api/images/proxy?url=${encodeURIComponent(creative.imageUrl)}`
                : creative.imageUrl
            const res = await fetch(url)
            const blob = await res.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `creative-${creative.id}.jpg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
            toast.success('Download started')
        } catch {
            toast.error('Download failed')
        }
    }

    const openCreativeViewer = (creative: AdCreative) => {
        if (window.matchMedia('(max-width: 767px)').matches) {
            const params = new URLSearchParams({
                image: creative.imageUrl,
                title: creative.campaign?.title ? `${creative.campaign.title} Creative` : 'Ad Creative',
                back: '/brand/ads/creatives',
                download: `creative-${creative.id}.jpg`,
            })
            router.push(`/gallery/view?${params.toString()}`)
            return
        }

        setLightboxImage(creative.imageUrl)
    }


    const handleOpenInpaint = (creative: AdCreative) => {
        setInpaintingId(creative.id)
        const params = new URLSearchParams({ id: creative.id })
        if (creative.stylePreset) {
            params.set('preset', creative.stylePreset)
        }

        router.push(`/brand/ads/inpaint?${params.toString()}`)
    }

    const hasActiveFilters =
        campaignFilter !== 'all' || platformFilter !== 'all' || qualityFilter !== 'all' || !!searchQuery.trim()

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="min-h-screen bg-[#FFFDF5] pt-6 md:pt-24 pb-10 md:pb-16"
        >
            <div className="container mx-auto px-4 max-w-6xl">                {/* Header */}
                <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="min-w-0">
                        <h1
                            className="text-[clamp(2.6rem,7vw,4.6rem)] font-black leading-[0.92] text-black"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Ad Creatives
                        </h1>
                        <p className="mt-2 max-w-2xl text-base text-black/55 sm:text-lg">
                            All generated ad creatives across your campaigns
                        </p>
                    </div>
                    <motion.button
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/brand/ads')}
                        className="flex w-full items-center justify-center gap-2 border-[3px] border-black bg-[#FFD93D] px-4 py-3 text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:w-auto sm:px-6 sm:text-base"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Generate New Ad</span>
                    </motion.button>
                </div>

                <BrutalCard className="mb-8 p-4 sm:p-5 lg:p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/50">Filters</p>
                            <p className="mt-1 text-sm font-medium text-black/55">Refine your library without cramped controls.</p>
                        </div>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setCampaignFilter('all')
                                    setPlatformFilter('all')
                                    setQualityFilter('all')
                                    setSearchQuery('')
                                }}
                                className="inline-flex items-center justify-center self-start border-[2px] border-black bg-white px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFF8E6] sm:self-auto"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                    <div className="mb-5">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by prompt, task, scope, or title"
                            className="w-full border-[2px] border-black bg-white px-4 py-3 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                        />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]">
                        <div className="space-y-2">
                            <span className="text-sm font-bold uppercase tracking-wide text-black/65">Campaign</span>
                            <select
                                value={campaignFilter}
                                onChange={(e) => setCampaignFilter(e.target.value)}
                                className="w-full border-[2px] border-black bg-white px-4 py-3 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                            >
                                <option value="all">All campaigns</option>
                                <option value="unassigned">Unassigned</option>
                                {campaigns.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)]">
                            <div className="space-y-2">
                                <span className="text-sm font-bold uppercase tracking-wide text-black/65">Platform</span>
                                <div className="grid grid-cols-3 gap-2 min-[460px]:grid-cols-5 sm:grid-cols-3 xl:grid-cols-5">
                                    {(['all', 'instagram', 'facebook', 'google', 'influencer'] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlatformFilter(p === 'all' ? 'all' : p)}
                                            className={cn(
                                                'flex min-h-[52px] items-center justify-center gap-2 rounded-none border-[2px] border-black px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all',
                                                platformFilter === p
                                                    ? 'bg-[#FFD93D] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white hover:bg-[#FFFDF5]'
                                            )}
                                            aria-label={p}
                                        >
                                            {p === 'all' ? (
                                                'All'
                                            ) : (
                                                <>
                                                    {PLATFORM_ICONS[p]}
                                                    <span className="sr-only">{p}</span>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-bold uppercase tracking-wide text-black/65">Quality</span>
                                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                    {(['all', 'high', 'medium', 'low'] as const).map((q) => (
                                        <button
                                            key={q}
                                            type="button"
                                            onClick={() => setQualityFilter(q)}
                                            className={cn(
                                                'flex min-h-[52px] items-center justify-center rounded-none border-[2px] border-black px-3 py-2 text-center text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all',
                                                qualityFilter === q
                                                    ? 'bg-[#C3B1E1] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white hover:bg-[#FFFDF5]'
                                            )}
                                        >
                                            {QUALITY_CONFIG[q].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2 xl:col-span-2">
                                <span className="text-sm font-bold uppercase tracking-wide text-black/65">Sort</span>
                                <div className="grid grid-cols-2 gap-2 sm:max-w-[18rem]">
                                    {(['newest', 'oldest'] as const).map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSortOrder(s)}
                                            className={cn(
                                                'flex min-h-[48px] items-center justify-center rounded-none border-[2px] border-black px-3 py-2 text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all',
                                                sortOrder === s
                                                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-white hover:bg-[#FFFDF5]'
                                            )}
                                        >
                                            {s === 'newest' ? 'Newest' : 'Oldest'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </BrutalCard>

                {/* Content */}
                {loading ? (
                    <BrutalCard className="flex flex-col items-center justify-center py-24">
                        <BrutalLoader size="lg" tone="brand" />
                        <p className="mt-6 text-xs font-black uppercase text-black/50">
                            Loading creatives
                        </p>
                    </BrutalCard>
                ) : filteredCreatives.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24"
                    >
                        <BrutalCard className="flex flex-col items-center justify-center p-12 max-w-md text-center">
                            <div className="w-16 h-16 border-[3px] border-black bg-[#FFD93D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4">
                                <ImageIcon className="h-8 w-8 text-black" />
                            </div>
                            <h2 className="text-xl font-black text-black mb-2">
                                {creatives.length === 0
                                    ? 'No ad creatives yet'
                                    : 'No creatives match filters'}
                            </h2>
                            <p className="text-sm text-black/60 mb-6">
                                {creatives.length === 0
                                    ? 'Generate your first AI-powered ad to get started.'
                                    : 'Try adjusting your filters.'}
                            </p>
                            {creatives.length === 0 && (
                                <motion.button
                                    type="button"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push('/brand/ads')}
                                    className="flex items-center gap-2 px-5 py-2.5 border-[3px] border-black bg-[#B4F056] font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Generate Your First Ad
                                </motion.button>
                            )}
                        </BrutalCard>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
                    >
                        {filteredCreatives.map((creative) => (
                            <CreativeCard
                                key={creative.id}
                                creative={creative}
                                onRegenerate={() => handleRegenerate(creative)}
                                onDownload={() => handleDownload(creative)}
                                onImageClick={() => openCreativeViewer(creative)}
                                onInpaint={() => handleOpenInpaint(creative)}
                                onViewHistory={() => setHistoryOpenId(creative.id)}
                                historyCount={historyGroups.get(getHistoryRootId(creative))?.length || 1}
                                regenerating={regenerating === creative.id}
                                inpainting={inpaintingId === creative.id}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            <Lightbox
                open={lightboxImage !== null}
                onClose={() => setLightboxImage(null)}
                imageUrl={lightboxImage || ''}
            />
            <HistoryModal
                open={historyOpenId !== null}
                onClose={() => setHistoryOpenId(null)}
                focusCreativeId={historyOpenId}
                items={activeHistory}
                onPreview={(creative) => openCreativeViewer(creative)}
                onInpaint={(creative) => {
                    setHistoryOpenId(null)
                    handleOpenInpaint(creative)
                }}
                onDownload={(creative) => void handleDownload(creative)}
            />
        </motion.div>
    )
}






