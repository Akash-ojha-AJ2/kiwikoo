'use client'

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppImage } from '@/components/ui/AppImage'
import {
    Send,
    Bot,
    User,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Loader2,
    Rocket,
    ChevronRight,
    ImagePlus,
    X,
    Download,
    Wand2,
    RefreshCw,
} from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import type {
    StrategistPhase,
    StrategistMessage,
    CampaignStrategyOutput,
    GeneratedCampaignImage,
} from '@/lib/campaigns/campaign-strategist-types'
import { STRATEGIST_PHASES } from '@/lib/campaigns/campaign-strategist-types'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUTO-CONTINUATION MESSAGES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const AUTO_CONTINUE_MESSAGES: Partial<Record<StrategistPhase, string>> = {
    researcher: '[SYSTEM: Auto-triggered Research Phase. Deliver the full research brief now. Do not ask the user to wait.]',
    ideator: '[SYSTEM: Auto-triggered Ideation Phase. Based on the research, deliver content ideas, hooks, angles, AND generate 1-2 campaign concept visuals by including [IMAGE_GEN:detailed description] markers in your response. Visual generation is MANDATORY in this phase.]',
    // scripter & analyst are NOT auto-triggered — user reviews ideation first
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PHASE PROGRESS BAR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PhaseProgressBar({ currentPhase }: { currentPhase: StrategistPhase }) {
    const currentIndex = STRATEGIST_PHASES.findIndex((p) => p.id === currentPhase)

    return (
        <div className="flex items-center gap-0.5 overflow-x-auto hide-scrollbar">
            {STRATEGIST_PHASES.map((phase, i) => {
                const isActive = i === currentIndex
                const isDone = i < currentIndex
                const isFuture = i > currentIndex

                return (
                    <div key={phase.id} className="flex items-center gap-0.5 shrink-0">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all duration-500 ${isActive
                                ? 'bg-[#B4F056] text-black scale-105'
                                : isDone
                                    ? 'bg-black/8 text-black/70'
                                    : 'text-black/25'
                                }`}
                        >
                            <span className={`text-sm transition-transform duration-300 ${isActive ? 'animate-pulse' : ''}`}>
                                {isDone ? '✓' : phase.emoji}
                            </span>
                            <span className={`hidden sm:inline ${isFuture ? 'text-black/25' : ''}`}>
                                {phase.label}
                            </span>
                        </div>
                        {i < STRATEGIST_PHASES.length - 1 && (
                            <ChevronRight
                                className={`w-3 h-3 shrink-0 transition-colors duration-300 ${isDone ? 'text-black/30' : 'text-black/10'}`}
                                strokeWidth={3}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CAMPAIGN STRATEGY CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CampaignStrategyCard({
    payload,
    createdId,
    isCreating,
    onApprove,
}: {
    payload: CampaignStrategyOutput
    createdId: string | null
    isCreating: boolean
    onApprove: () => void
}) {
    return (
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-lg animate-slideUp">
            <div className="bg-gradient-to-r from-[#B4F056] to-[#d4ff8a] px-5 py-3 flex items-center gap-2">
                <Rocket className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="text-xs font-black uppercase tracking-wider">Campaign Strategy Ready</h3>
                <span className="ml-auto text-[9px] font-black uppercase bg-black/10 px-2 py-0.5 rounded-full tracking-wider">Draft</span>
            </div>

            <div className="p-5 space-y-3">
                <div>
                    <h4 className="text-base font-black text-black">{payload.title}</h4>
                    <p className="text-sm text-black/50 mt-1 leading-relaxed">{payload.brief}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/[0.03] rounded-lg p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Goal</p>
                        <p className="text-sm font-bold capitalize">{payload.goal}</p>
                    </div>
                    <div className="bg-black/[0.03] rounded-lg p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Budget</p>
                        <p className="text-sm font-bold">
                            {payload.budget?.budget_type === 'daily'
                                ? `₹${payload.budget?.daily_budget?.toLocaleString() ?? '—'}/day`
                                : `₹${payload.budget?.total_budget?.toLocaleString() ?? '—'} total`}
                        </p>
                    </div>
                </div>

                {payload.audience && (
                    <div className="bg-black/[0.03] rounded-lg p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Target Audience</p>
                        <p className="text-sm font-medium text-black/70">
                            {payload.audience.gender && payload.audience.gender !== 'Any' ? `${payload.audience.gender}, ` : ''}
                            {payload.audience.age_min && payload.audience.age_max ? `${payload.audience.age_min}-${payload.audience.age_max}y` : ''}
                            {payload.audience.location ? ` in ${payload.audience.location}` : ''}
                            {payload.audience.interests?.length ? ` · ${payload.audience.interests.slice(0, 4).join(', ')}` : ''}
                        </p>
                    </div>
                )}

                {payload.content_angles && payload.content_angles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {payload.content_angles.slice(0, 5).map((angle, i) => (
                            <span key={i} className="text-[11px] font-bold bg-[#FFD93D]/50 px-2.5 py-1 rounded-full">
                                {typeof angle === 'string' ? angle : (angle as { angle?: string }).angle ?? ''}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-5 pb-5">
                {createdId ? (
                    <Link
                        href="/brand/campaigns"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B4F056] border-2 border-black rounded-xl font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Draft Campaign Saved — View All
                    </Link>
                ) : (
                    <button type="button"
                        onClick={onApprove}
                        disabled={isCreating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B4F056] border-2 border-black rounded-xl font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating Campaign...</>
                        ) : (
                            <><Rocket className="w-4 h-4" /> Approve & Create Campaign</>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GENERATED IMAGE GALLERY
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function GeneratedImageGallery({ images, onRegenerate }: { images: GeneratedCampaignImage[]; onRegenerate?: (description: string) => void }) {
    const handleDownload = (image: GeneratedCampaignImage, index: number) => {
        const a = document.createElement('a')
        a.href = image.imageBase64
        a.download = `campaign-visual-${index + 1}.png`
        a.click()
    }

    return (
        <div className="space-y-3 mt-3">
            <div className="flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-[#A78BFA]" strokeWidth={2.5} />
                <p className="text-[10px] font-black uppercase tracking-wider text-[#A78BFA]">
                    AI Generated Campaign Visuals
                </p>
            </div>
            <div className={`grid gap-3 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square group overflow-hidden rounded-xl border border-black/10 shadow-sm">
                        <AppImage
                            src={img.imageBase64}
                            alt={img.description}
                            className="object-cover transition-transform group-hover:scale-[1.02]"
                            sizes="(min-width: 768px) 33vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-[11px] font-medium text-white/90 line-clamp-2 mb-2">{img.description}</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(img, idx)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-[10px] font-black uppercase text-black hover:bg-white transition-colors"
                                >
                                    <Download className="w-3 h-3" />
                                    Save
                                </button>
                                {onRegenerate && (
                                    <button
                                        type="button"
                                        onClick={() => onRegenerate(img.description)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A78BFA]/90 rounded-lg text-[10px] font-black uppercase text-white hover:bg-[#A78BFA] transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                        </div>
                        {img.preset && (
                            <span className="absolute top-2 left-2 text-[9px] font-black uppercase bg-black/60 text-white px-2 py-0.5 rounded-full">
                                {img.preset}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   IMAGE UPLOAD PREVIEW
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ImageUploadPreview({ images, onRemove }: { images: string[]; onRemove: (index: number) => void }) {
    if (images.length === 0) return null

    return (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {images.map((img, i) => (
                <div key={i} className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-black/15 group">
                    <AppImage src={img} alt={`Upload ${i + 1}`} className="object-cover" sizes="64px" />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                        <X className="w-3 h-3" strokeWidth={3} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent h-4" />
                </div>
            ))}
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPING INDICATOR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function TypingIndicator({ phase, isGeneratingImage }: { phase: StrategistPhase; isGeneratingImage?: boolean }) {
    const phaseInfo = STRATEGIST_PHASES.find((p) => p.id === phase)
    const label = isGeneratingImage
        ? '🎨 Generating campaign visual...'
        : phaseInfo
            ? `${phaseInfo.emoji} ${phaseInfo.description}`
            : 'Thinking'

    return (
        <div className="flex gap-3 items-end animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-[#B4F056] flex items-center justify-center flex-shrink-0 mb-0.5">
                <Bot className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <div className="bg-white border border-black/8 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#B4F056] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[#B4F056] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[#B4F056] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-[12px] font-semibold text-black/40">{label}</p>
                </div>
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUGGESTION CHIPS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PHASE_SUGGESTIONS: Partial<Record<StrategistPhase, string[]>> = {
    intake: [
        'We sell fashion accessories for Gen Z',
        'Our budget is ₹50,000/month',
        'We want to grow on Instagram & TikTok',
        'Show me what a campaign visual would look like',
    ],
    ideator: [
        '✅ Looks great — write the scripts now',
        '🎨 Generate more campaign visuals',
        'I want lifestyle images with models',
        'Try a different visual style',
        'Tweak the content angles',
    ],
    scripter: [
        '✅ Scripts look good — optimize & finalize',
        'More script variants',
        'Make the hooks punchier',
        'Add a TikTok-specific version',
    ],
    analyst: [
        'Finalize the campaign',
        'More A/B test ideas',
    ],
    complete: [
        'Refine targeting',
        'More ad variants',
        'Generate a campaign visual for this strategy',
        'Adjust budget strategy',
    ],
}

function SuggestionChips({
    phase,
    onSelect,
    disabled,
}: {
    phase: StrategistPhase
    onSelect: (text: string) => void
    disabled: boolean
}) {
    const suggestions = PHASE_SUGGESTIONS[phase]
    if (!suggestions || suggestions.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {suggestions.map((text, i) => (
                <button type="button"
                    key={i}
                    onClick={() => onSelect(text)}
                    disabled={disabled}
                    className="text-[12px] font-semibold border border-black/12 px-4 py-2 bg-white hover:bg-[#B4F056]/20 hover:border-[#B4F056] transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-full text-black/50 hover:text-black"
                >
                    {text}
                </button>
            ))}
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PHASE TRANSITION BANNER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PhaseTransitionBanner({ phase }: { phase: StrategistPhase }) {
    const phaseInfo = STRATEGIST_PHASES.find((p) => p.id === phase)
    if (!phaseInfo) return null

    return (
        <div className="flex items-center gap-3 animate-fadeIn">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B4F056] to-transparent" />
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B4F056]/15 rounded-full">
                <span className="text-sm">{phaseInfo.emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-black/60">{phaseInfo.label}</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-[#B4F056] via-[#B4F056] to-transparent" />
        </div>
    )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MESSAGE RENDERER (Markdown-lite)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function renderMarkdown(content: string) {
    const cleaned = content.replace(/```campaign_create[\s\S]*?```/g, '').trim()
    const lines = cleaned.split('\n')
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]

        if (line.startsWith('### ')) {
            elements.push(
                <h4 key={i} className="text-xs font-black uppercase tracking-widest text-black/45 mt-5 mb-2">
                    {line.slice(4)}
                </h4>,
            )
        } else if (line.startsWith('## ')) {
            elements.push(
                <h3 key={i} className="text-[15px] font-black text-black mt-5 mb-2 pb-1.5 border-b border-black/6">
                    {line.slice(3)}
                </h3>,
            )
        } else if (line.startsWith('# ')) {
            elements.push(
                <h2 key={i} className="text-lg font-black text-black mt-4 mb-3">
                    {line.slice(2)}
                </h2>,
            )
        }
        else if (/^\d+\.\s/.test(line)) {
            elements.push(
                <p key={i} className="text-[13px] font-medium ml-1 mb-1.5 leading-relaxed">
                    {formatInlineMarkdown(line)}
                </p>,
            )
        }
        else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
            elements.push(
                <p key={i} className="text-[13px] font-medium ml-3 mb-1 leading-relaxed flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-[#B4F056] rounded-full mt-[7px] shrink-0" />
                    <span>{formatInlineMarkdown(line.replace(/^[-•*]\s/, ''))}</span>
                </p>,
            )
        }
        else if (line.match(/^\s+[-•*]\s/)) {
            elements.push(
                <p key={i} className="text-[13px] font-medium ml-7 mb-1 leading-relaxed text-black/65 flex items-start gap-2">
                    <span className="inline-block w-1 h-1 bg-black/20 rounded-full mt-[8px] shrink-0" />
                    <span>{formatInlineMarkdown(line.trim().replace(/^[-•*]\s/, ''))}</span>
                </p>,
            )
        }
        else if (line.match(/^-{3,}$/) || line.match(/^_{3,}$/)) {
            elements.push(<hr key={i} className="border-t border-black/6 my-4" />)
        }
        else if (line.trim()) {
            elements.push(
                <p key={i} className="text-[13px] font-medium leading-[1.75] mb-1.5 text-black/75">
                    {formatInlineMarkdown(line)}
                </p>,
            )
        }
        else {
            elements.push(<div key={i} className="h-2" />)
        }

        i++
    }

    return <div>{elements}</div>
}

function formatInlineMarkdown(text: string): React.ReactNode {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
        const codeMatch = remaining.match(/`(.+?)`/)
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/)

        const matches = [
            boldMatch ? { idx: remaining.indexOf(boldMatch[0]), match: boldMatch, type: 'bold' } : null,
            codeMatch ? { idx: remaining.indexOf(codeMatch[0]), match: codeMatch, type: 'code' } : null,
            italicMatch ? { idx: remaining.indexOf(italicMatch[0]), match: italicMatch, type: 'italic' } : null,
        ].filter(Boolean) as Array<{ idx: number; match: RegExpMatchArray; type: string }>

        if (matches.length === 0) { parts.push(remaining); break }

        matches.sort((a, b) => a.idx - b.idx)
        const earliest = matches[0]

        if (earliest.idx > 0) parts.push(remaining.slice(0, earliest.idx))

        if (earliest.type === 'bold') {
            parts.push(<strong key={key++} className="font-bold text-black">{earliest.match[1]}</strong>)
        } else if (earliest.type === 'code') {
            parts.push(<code key={key++} className="bg-black/5 px-1.5 py-0.5 text-[12px] font-mono rounded">{earliest.match[1]}</code>)
        } else if (earliest.type === 'italic') {
            parts.push(<em key={key++} className="italic">{earliest.match[1]}</em>)
        }

        remaining = remaining.slice(earliest.idx + earliest.match[0].length)
    }

    return <>{parts}</>
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const INITIAL_MESSAGE: StrategistMessage = {
    role: 'assistant',
    content: `# 🎯 Welcome to your AI Campaign Strategist

I'm your **elite growth partner** — a full agency team in one conversation.

Here's how I work:

1. **Strategy Intake** — I ask strategic questions to understand your brand
2. **🧠 Research** — Competitor analysis, audience psychology, market gaps
3. **💡 Content Ideas** — High-converting angles and hook banks
4. **✍️ Scripts & Copy** — Ad scripts, organic content, UGC briefs
5. **📊 Optimization** — A/B variants, conversion improvements

### 🖼️ Visual Intelligence (NEW!)
- **Upload images** — I can analyze your product photos, competitor creatives, mood boards, and more using AI Vision
- **Generate visuals** — I'll create stunning campaign visuals during our conversation to preview your ad concepts

I'll flow through each phase **automatically** — no need to prompt me. At the end, your campaign will be **auto-generated** and ready to launch.

**Tell me about your brand and what you're looking to achieve with this campaign.** You can also upload a product image to get started!`,
    phase: 'intake',
}

export default function CampaignStrategist() {
    const router = useRouter()
    const [messages, setMessages] = useState<StrategistMessage[]>([INITIAL_MESSAGE])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [phase, setPhase] = useState<StrategistPhase>('intake')
    const [campaignPayload, setCampaignPayload] = useState<CampaignStrategyOutput | null>(null)
    const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null)
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
    const [phaseTransitions, setPhaseTransitions] = useState<Set<number>>(new Set())
    const [pendingImages, setPendingImages] = useState<string[]>([])
    const [storedProductImages, setStoredProductImages] = useState<string[]>([])
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const autoProgressRef = useRef(false)

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading, scrollToBottom])

    useEffect(() => {
        if (!loading) textareaRef.current?.focus()
    }, [loading])

    // Auto-resize textarea
    const autoResize = useCallback(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }, [])

    useEffect(() => {
        autoResize()
    }, [input, autoResize])

    // Handle image upload
    const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const maxImages = 10 - pendingImages.length
        const filesToProcess = Array.from(files).slice(0, maxImages)

        for (const file of filesToProcess) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 10MB)`)
                continue
            }

            const reader = new FileReader()
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string
                if (base64) {
                    setPendingImages(prev => [...prev, base64])
                }
            }
            reader.readAsDataURL(file)
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [pendingImages.length])

    const removeImage = useCallback((index: number) => {
        setPendingImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    /**
     * Core send function — handles both user messages and auto-continuation
     */
    const sendMessage = useCallback(async (
        text?: string,
        opts?: { isAutoContinue?: boolean; targetPhase?: StrategistPhase }
    ) => {
        const isAutoContinue = opts?.isAutoContinue ?? false
        const targetPhase = opts?.targetPhase ?? phase
        const userMessage = (text || input).trim()
        if (!userMessage || loading) return

        // Capture pending images for this message
        const messageImages = isAutoContinue ? [] : [...pendingImages]

        if (!isAutoContinue) {
            setInput('')
            // Store product images persistently for future generation
            if (messageImages.length > 0) {
                setStoredProductImages(prev => {
                    const combined = [...prev, ...messageImages]
                    return combined.slice(0, 10) // Keep max 10
                })
            }
            setPendingImages([])
        }

        // Only add visible user messages (not auto-continue triggers)
        if (!isAutoContinue) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'user',
                    content: userMessage,
                    phase: targetPhase,
                    images: messageImages.length > 0 ? messageImages : undefined,
                },
            ])
        }

        setLoading(true)
        if (messageImages.length > 0) {
            setIsGeneratingImage(false)
        }

        try {
            const currentMessages = isAutoContinue
                ? messages
                : [...messages, { role: 'user' as const, content: userMessage, phase: targetPhase, images: messageImages.length > 0 ? messageImages : undefined }]

            const response = await fetch('/api/campaigns/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    phase: targetPhase,
                    conversationHistory: currentMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    // Always send stored product images for Gemini generation reference
                    images: messageImages.length > 0
                        ? messageImages
                        : storedProductImages.length > 0
                            ? storedProductImages
                            : undefined,
                }),
            })

            if (!response.ok) throw new Error('Failed to get response')

            const data = await response.json()

            const newPhase = data.phase as StrategistPhase | undefined
            const didTransition = newPhase && newPhase !== targetPhase

            if (didTransition) {
                setPhase(newPhase)
            }

            if (data.campaignPayload) {
                setCampaignPayload(data.campaignPayload)
                // Campaign created = flow is DONE, force complete and stop auto-progression
                setPhase('complete')
                autoProgressRef.current = false
            }

            if (data.createdCampaignId) {
                setCreatedCampaignId(data.createdCampaignId)
            }

            // Handle generated images
            const generatedImages: GeneratedCampaignImage[] = data.generatedImages || []

            setMessages((prev) => {
                const newMessages = [
                    ...prev,
                    {
                        role: 'assistant' as const,
                        content: data.response,
                        phase: data.campaignPayload ? 'complete' as StrategistPhase : (newPhase || targetPhase),
                        campaignPayload: data.campaignPayload || null,
                        generatedImages: generatedImages.length > 0 ? generatedImages : undefined,
                    },
                ]

                if (didTransition) {
                    setPhaseTransitions((prev) => new Set([...prev, newMessages.length - 1]))
                }

                return newMessages
            })

            // AUTO-PROGRESSION — only if no campaign payload (flow not done)
            if (!data.campaignPayload && didTransition && newPhase && newPhase !== 'complete' && AUTO_CONTINUE_MESSAGES[newPhase]) {
                autoProgressRef.current = true
            }
        } catch {
            toast.error('Failed to get AI response. Please try again.')
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I couldn't complete that request. Please check your connection and try again.",
                    phase: targetPhase,
                },
            ])
        } finally {
            setLoading(false)
            setIsGeneratingImage(false)
        }
    }, [input, loading, messages, phase, pendingImages, storedProductImages])

    // Effect for auto-progression
    useEffect(() => {
        if (autoProgressRef.current && !loading) {
            autoProgressRef.current = false
            const autoContinueMsg = AUTO_CONTINUE_MESSAGES[phase]
            if (autoContinueMsg) {
                const timer = setTimeout(() => {
                    sendMessage(autoContinueMsg, { isAutoContinue: true, targetPhase: phase })
                }, 1500)
                return () => clearTimeout(timer)
            }
        }
    }, [loading, phase, sendMessage])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleApprove = async () => {
        if (createdCampaignId) {
            router.push('/brand/campaigns')
            return
        }

        if (!campaignPayload) return

        setIsCreatingCampaign(true)
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    goal: campaignPayload.goal,
                    title: campaignPayload.title,
                    audience: {
                        age_min: campaignPayload.audience?.age_min,
                        age_max: campaignPayload.audience?.age_max,
                        gender: campaignPayload.audience?.gender,
                        location: campaignPayload.audience?.location,
                        interests: campaignPayload.audience?.interests,
                    },
                    creative: {
                        headline: campaignPayload.creative?.headline,
                        description: campaignPayload.creative?.description,
                        cta_text: campaignPayload.creative?.cta_text,
                    },
                    budget: {
                        budget_type: campaignPayload.budget?.budget_type || 'daily',
                        daily_budget: campaignPayload.budget?.daily_budget,
                        total_budget: campaignPayload.budget?.total_budget,
                    },
                }),
            })

            if (!res.ok) throw new Error('Failed to create campaign')

            const data = await res.json()
            setCreatedCampaignId(data.id)
            toast.success('🚀 Campaign created successfully!')
        } catch {
            toast.error('Failed to create campaign. Please try again.')
        } finally {
            setIsCreatingCampaign(false)
        }
    }

    const isAutoProgressing = loading && phase !== 'intake' && phase !== 'complete'

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#FAFAF8]">

            {/* ── STICKY HEADER ────────────────────────────────── */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-black/8 z-10">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="flex items-center gap-3 py-3">
                        <Link
                            href="/brand/campaigns"
                            className="w-8 h-8 rounded-full border border-black/12 flex items-center justify-center hover:bg-black/5 transition-colors"
                            title="Back to campaigns"
                        >
                            <ArrowLeft className="w-4 h-4 text-black/50" strokeWidth={2} />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles className="w-4 h-4 text-[#B4F056]" strokeWidth={2.5} />
                                <h1 className="text-sm font-black uppercase tracking-wider text-black/70">
                                    AI Campaign Strategist
                                </h1>
                                <span className="text-[9px] font-black uppercase bg-[#A78BFA]/15 text-[#A78BFA] px-2 py-0.5 rounded-full">
                                    Vision + Visual Gen
                                </span>
                            </div>
                            <PhaseProgressBar currentPhase={phase} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE CHAT AREA ─────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            {/* Phase transition banner */}
                            {phaseTransitions.has(index) && msg.phase && (
                                <div className="mb-4">
                                    <PhaseTransitionBanner phase={msg.phase} />
                                </div>
                            )}

                            <div
                                className={`flex gap-3 items-end animate-slideUp ${msg.role === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-[#B4F056] flex items-center justify-center flex-shrink-0 mb-0.5">
                                        <Bot className="w-4 h-4 text-black" strokeWidth={2.5} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] px-5 py-4 ${msg.role === 'user'
                                        ? 'bg-black text-white rounded-2xl rounded-br-md'
                                        : 'bg-white border border-black/8 shadow-sm text-black rounded-2xl rounded-bl-md'
                                        }`}
                                >
                                    {/* User-uploaded images in message */}
                                    {msg.images && msg.images.length > 0 && (
                                        <div className={`flex gap-2 mb-3 ${msg.images.length > 1 ? 'flex-wrap' : ''}`}>
                                            {msg.images.map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative rounded-lg overflow-hidden border border-white/20">
                                                    <AppImage
                                                        src={img}
                                                        alt={`Uploaded ${imgIdx + 1}`}
                                                        fill={false}
                                                        width={200}
                                                        height={200}
                                                        sizes="200px"
                                                        className="max-w-[200px] max-h-[200px] object-cover rounded-lg"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.role === 'assistant' ? (
                                        renderMarkdown(msg.content)
                                    ) : (
                                        <p className="text-[13px] font-medium whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </p>
                                    )}

                                    {/* Generated images */}
                                    {msg.generatedImages && msg.generatedImages.length > 0 && (
                                        <GeneratedImageGallery
                                            images={msg.generatedImages}
                                            onRegenerate={(desc) => sendMessage(`Regenerate this campaign visual with a different creative approach: ${desc}`)}
                                        />
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-black/8 flex items-center justify-center flex-shrink-0 mb-0.5">
                                        <User className="w-4 h-4 text-black/50" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>

                            {msg.campaignPayload && (
                                <div className="mt-4 ml-11">
                                    <CampaignStrategyCard
                                        payload={msg.campaignPayload}
                                        createdId={createdCampaignId}
                                        isCreating={isCreatingCampaign}
                                        onApprove={handleApprove}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && <TypingIndicator phase={phase} isGeneratingImage={isGeneratingImage} />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* ── STICKY INPUT AREA ────────────────────────────── */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-black/8 z-10">
                <div className="mx-auto max-w-3xl px-4 py-3 space-y-3">
                    {/* Suggestion chips */}
                    <SuggestionChips phase={phase} onSelect={(t) => sendMessage(t)} disabled={loading} />

                    {/* Image upload previews */}
                    <ImageUploadPreview images={pendingImages} onRemove={removeImage} />

                    {/* Auto-progress indicator */}
                    {isAutoProgressing && (
                        <div className="flex items-center gap-2 px-1 animate-fadeIn">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B4F056]" />
                            <p className="text-[12px] font-semibold text-black/40">
                                Auto-progressing through phases... sit back and watch the magic ✨
                            </p>
                        </div>
                    )}

                    {/* Textarea form */}
                    <form onSubmit={handleSubmit} className="flex items-end gap-2">
                        {/* Image upload button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || pendingImages.length >= 10}
                            className="h-[46px] w-[46px] flex items-center justify-center border-2 border-black/15 rounded-xl hover:bg-[#A78BFA]/10 hover:border-[#A78BFA] transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 group"
                            title="Upload image for AI analysis"
                        >
                            <ImagePlus className="w-5 h-5 text-black/40 group-hover:text-[#A78BFA] transition-colors" strokeWidth={2} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    isAutoProgressing
                                        ? 'AI is working autonomously...'
                                        : pendingImages.length > 0
                                            ? 'Describe what you want me to analyze in these images...'
                                            : phase === 'intake'
                                                ? 'Tell me about your brand... Upload product images for better strategy!'
                                                : phase === 'complete'
                                                    ? 'Ask me to refine anything, or approve the campaign above...'
                                                    : 'Continue the conversation...'
                                }
                                disabled={loading}
                                rows={1}
                                className="w-full resize-none px-4 py-3 bg-black/[0.03] border border-black/12 rounded-xl text-[13px] font-medium focus:border-[#B4F056] focus:ring-2 focus:ring-[#B4F056]/30 outline-none placeholder:text-black/30 transition-all leading-relaxed disabled:opacity-50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || (!input.trim() && pendingImages.length === 0)}
                            className="h-[46px] w-[46px] flex items-center justify-center bg-[#B4F056] border-2 border-black rounded-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 shrink-0"
                            aria-label="Send message"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" strokeWidth={2.5} />
                            )}
                        </button>
                    </form>

                    {/* Image upload hint */}
                    {pendingImages.length === 0 && !loading && (
                        <p className="text-[10px] font-medium text-black/25 text-center">
                            {storedProductImages.length > 0
                                ? `📷 ${storedProductImages.length} product image${storedProductImages.length > 1 ? 's' : ''} stored — AI will use them to generate campaign visuals`
                                : '📷 Upload product photos (up to 10) — AI Vision will analyze them & use them for campaign visual generation'
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* Animations & scrollbar hide */}
            <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.35s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
        </div>
    )
}
