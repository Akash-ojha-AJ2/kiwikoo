'use client'

import { type ReactNode, type ChangeEvent, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/simple-sonner'
import Link from 'next/link'
import {
  Camera,
  ShoppingBag,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  Check,
  Smartphone,
  Zap,
  MessageCircle,
  Shirt,
  Heart,
  MapPin,
  Star,
  Wand2,
  Film,
  Type,
  Palette,
  Box,
  CloudLightning,
  PartyPopper,
  Crown,
  Cat,
  User,
  Ban,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Instagram,
  Facebook,
  Globe,
  Users,
  Images,
} from 'lucide-react'
import {
  AD_PRESET_CATEGORIES,
  CHARACTER_OPTIONS,
  CHARACTER_IDENTITY_OPTIONS,
  ANIMAL_OPTIONS,
  CHARACTER_STYLE_OPTIONS,

  PLATFORM_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  getPresetsByCategory,
  getAdPresetList,
  resolveStylePackForPreset,
  validateAdInput,
  type AdPresetId,
  type AdPresetCategory,
  type Platform,
  type CtaType,
  type CharacterType,
  type CharacterIdentity,

  type AspectRatio,
  type CameraAngle,
} from '@/lib/ads/ad-styles'
import { cn } from '@/lib/utils'
import {
  staggerContainer,
  staggerItem,
  pageVariants,
  imageRevealVariants,
} from '@/lib/animations'
import BrutalCard from '@/components/brutal/BrutalCard'
import { BrutalLoader } from '@/components/ui/BrutalLoader'
import { normalizeImageFileForVisionUpload } from '@/lib/client-image-normalization'

// ═══════════════════════════════════════════════════════════════

interface GenerationResult {
  id: string
  imageUrl: string
  imageBase64?: string
  copy: any[]
  rating: any
  qualityScore: number
  preset: string
  promptUsed: string
}

const ICON_MAP: Record<string, ReactNode> = {
  Camera: <Camera className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Image: <ImageIcon className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Smartphone: <Smartphone className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Shirt: <Shirt className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  MapPin: <MapPin className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  Wand2: <Wand2 className="h-4 w-4" />,
  Film: <Film className="h-4 w-4" />,
  Type: <Type className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Box: <Box className="h-4 w-4" />,
  CloudLightning: <CloudLightning className="h-4 w-4" />,
  PartyPopper: <PartyPopper className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Cat: <Cat className="h-4 w-4" />,
  Ban: <Ban className="h-4 w-4" />,
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

export default function AdsPage() {
  const router = useRouter()
  // Form
  const [selectedPreset, setSelectedPreset] = useState<AdPresetId | null>(null)
  const [activeCategory, setActiveCategory] = useState<AdPresetCategory | 'all'>('all')
  const [productImage, setProductImage] = useState('')
  const [influencerImage, setInfluencerImage] = useState('')
  const [imageModel, setImageModel] = useState<'gpt' | 'gemini'>('gemini')
  const [characterType, setCharacterType] = useState<CharacterType>('none')
  const [characterIdentity, setCharacterIdentity] = useState<CharacterIdentity>('global_modern')
  const [animalType, setAnimalType] = useState('')
  const [characterStyle, setCharacterStyle] = useState('')
  const [characterAge, setCharacterAge] = useState('')
  const [subjectPose, setSubjectPose] = useState('auto')
  const [subjectExpression, setSubjectExpression] = useState('auto')
  const [textHeadline, setTextHeadline] = useState('')
  const [textSubline, setTextSubline] = useState('')
  const [textTagline, setTextTagline] = useState('')

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram'])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1')
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('auto')
  const strictRealism = true
  const [textOpen, setTextOpen] = useState(true)
  const [optionsOpen, setOptionsOpen] = useState(true)
  const [showAllPresets, setShowAllPresets] = useState(false)
  const [stylePickerOpen, setStylePickerOpen] = useState(false)

  // UI
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'submitting' | 'rate_limited' | 'busy' | 'error' | 'success'>('idle')
  const [generationStatusText, setGenerationStatusText] = useState('')
  const [generationAttempt, setGenerationAttempt] = useState(0)

  const hasText = !!(textHeadline || textSubline || textTagline)
  const canSubmit = selectedPreset && selectedPlatforms.length > 0 && !loading && retryAfterSeconds <= 0
  const visibleIdentityOptions =
    characterType === 'human_female' || characterType === 'human_male'
      ? CHARACTER_IDENTITY_OPTIONS.filter((opt) =>
        !opt.forCharacter || opt.forCharacter.includes(characterType)
      )
      : CHARACTER_IDENTITY_OPTIONS

  // Countdown for rate limit / in-flight wait
  useEffect(() => {
    if (retryAfterSeconds <= 0) return
    const t = setInterval(() => setRetryAfterSeconds((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(t)
  }, [retryAfterSeconds])

  useEffect(() => {
    if (characterType !== 'human_female' && characterType !== 'human_male') return
    const isAllowed = visibleIdentityOptions.some((opt) => opt.value === characterIdentity)
    if (!isAllowed) {
      setCharacterIdentity('global_modern')
    }
  }, [characterType, characterIdentity, visibleIdentityOptions])

  useEffect(() => {
    setShowAllPresets(false)
  }, [activeCategory])

  useEffect(() => {
    if (!stylePickerOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [stylePickerOpen])

  const handleImageUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, type: 'product' | 'influencer') => {
      const file = e.target.files?.[0]
      if (!file) return
      e.target.value = ''
      if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return }

      try {
        const normalizedImage = await normalizeImageFileForVisionUpload(file)
        if (type === 'product') setProductImage(normalizedImage)
        else {
          setInfluencerImage(normalizedImage)
          // Face lock is auto-derived from influencerImage presence
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'This image format is not supported. Use PNG, JPG, GIF, or WebP.'
        )
        if (type === 'influencer') {
          // Face lock is auto-derived from influencerImage presence
        }
      }
    }, []
  )

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )

  const handleGenerate = async () => {
    if (!selectedPreset) { toast.error('Select an ad style'); return }
    const nextAttempt = generationAttempt + 1
    setGenerationAttempt(nextAttempt)

    const isHuman = characterType === 'human_female' || characterType === 'human_male'
    const input: any = {
      preset: selectedPreset,
      variationIndex: nextAttempt,
      stylePack: resolveStylePackForPreset(selectedPreset),
      productImage: productImage || undefined,
      influencerImage: influencerImage || undefined,
      lockFaceIdentity: Boolean(influencerImage),
      strictRealism,
      imageModel,
      characterType,
      characterIdentity: isHuman ? characterIdentity : undefined,
      animalType: characterType === 'animal' ? (animalType || 'Fox') : undefined,
      characterStyle: isHuman ? (characterStyle || undefined) : undefined,
      characterAge: isHuman ? (characterAge || undefined) : undefined,
      subject: isHuman
        ? {
          pose: subjectPose && subjectPose !== 'auto' ? subjectPose : undefined,
          expression: subjectExpression && subjectExpression !== 'auto' ? subjectExpression : undefined,
        }
        : undefined,
      aspectRatio,
      cameraAngle,
      textOverlay: hasText ? {
        headline: textHeadline || undefined,
        subline: textSubline || undefined,
        tagline: textTagline || undefined,

      } : undefined,
      ctaType: 'shop_now' as CtaType,
      platforms: selectedPlatforms,
    }

    const v = validateAdInput(input)
    if (!v.valid) { toast.error(v.error); return }

    setLoading(true)
    setResult(null)
    setGenerationStatus('submitting')
    setGenerationStatusText('Submitting request...')

    try {
      const res = await fetch('/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      const data = await res.json().catch(() => ({ error: 'Request failed' }))
      if (!res.ok) {
        if (res.status === 429) {
          const retry = Math.max(1, Number(data.retryAfterSeconds ?? 60))
          setRetryAfterSeconds(retry)
          const isBusy = /already being generated|in progress|server busy/i.test(String(data.error || ''))
          setGenerationStatus(isBusy ? 'busy' : 'rate_limited')
          setGenerationStatusText(
            isBusy
              ? `Another generation is already running. Try again in ${retry}s.`
              : `Rate limit active. Try again in ${retry}s.`
          )
          toast.error(data.error || `Rate limit. Try again in ${retry}s.`)
        } else if (res.status === 504) {
          setGenerationStatus('error')
          setGenerationStatusText('Generation timed out. Please retry; this can happen under production load.')
          toast.error('Generation timed out in production. Please retry once; we optimized the pipeline to reduce this.')
        } else {
          setGenerationStatus('error')
          setGenerationStatusText(data.error || 'Generation failed.')
          toast.error(data.error || 'Generation failed')
        }
        return
      }
      setResult(data as GenerationResult)
      setGenerationStatus('success')
      setGenerationStatusText('Creative generated successfully.')
      toast.success('Ad generated!')
    } catch {
      setGenerationStatus('error')
      setGenerationStatusText('Unexpected error while generating creative.')
      toast.error('Something went wrong.')
    }
    finally { setLoading(false) }
  }

  const handleDownload = () => {
    if (!result?.imageUrl) return
    const a = document.createElement('a')
    a.href = result.imageBase64 || result.imageUrl
    a.download = `ad-${result.id}.png`
    a.click()
  }

  const handleOpenInpaint = () => {
    if (!result?.imageBase64 && !result?.imageUrl) {
      toast.error('Generate a creative first to open inpaint.')
      return
    }

    const params = new URLSearchParams({ id: result.id })
    if (result.preset) {
      params.set('preset', result.preset)
    }

    router.push(`/brand/ads/inpaint?${params.toString()}`)
  }

  const allPresets = getAdPresetList()
  const visiblePresets =
    activeCategory === 'all' ? allPresets : getPresetsByCategory(activeCategory)
  const collapsedPresetCount = 6
  const displayedPresets = showAllPresets
    ? visiblePresets
    : (() => {
      const base = visiblePresets.slice(0, collapsedPresetCount)
      if (!selectedPreset || base.some((preset) => preset.id === selectedPreset)) return base
      const selected = visiblePresets.find((preset) => preset.id === selectedPreset)
      return selected ? [selected, ...base.slice(0, collapsedPresetCount - 1)] : base
    })()
  const selectedPresetMeta = selectedPreset ? allPresets.find((preset) => preset.id === selectedPreset) ?? null : null

  return (
    <>
      <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="relative min-h-screen overflow-hidden bg-[#FFF8E6] pt-20 pb-14 md:pt-24 md:pb-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[#FFD93D]/35 blur-3xl" />
        <div className="absolute top-44 -right-20 h-80 w-80 rounded-full bg-[#FF8C69]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#B4F056]/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl space-y-6 px-3 sm:px-4 md:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <motion.p
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD93D] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="h-3 w-3" />
              Brand Studio
            </motion.p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl md:text-5xl">
              Build Ads Fast
            </h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-black/70 md:text-base">
              Choose a preset, upload assets, generate brutal creative.
            </p>
          </div>
          <Link
            href="/brand/ads/creatives"
            className="inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 py-2.5 text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFFDF5] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:px-5 md:py-3"
          >
            <Images className="h-4 w-4" />
            View Creatives
          </Link>
        </motion.div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_420px] lg:gap-6">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35 }}>
              <BrutalCard className="rounded-2xl p-4 md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-xs font-black text-white">1</span>
                  <h2 className="text-lg md:text-xl font-black uppercase">Choose Style</h2>
                </div>
                <div className="grid gap-4 rounded-xl border-[3px] border-black bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">Selected preset</p>
                    {selectedPresetMeta ? (
                      <div className="mt-2 flex items-start gap-3">
                        <span className={cn(
                          'inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black',
                          selectedPresetMeta.category === 'cinematic' ? 'bg-[#D8B4FE] text-black' : 'bg-[#B4F056] text-black'
                        )}>
                          {ICON_MAP[selectedPresetMeta.icon] ?? <Sparkles className="h-5 w-5" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase text-black sm:text-base">{selectedPresetMeta.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs font-medium text-black/65 sm:text-sm">{selectedPresetMeta.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className={cn('rounded-md border border-black px-2 py-1 text-[9px] font-black uppercase', selectedPresetMeta.tier === 'safe' ? 'bg-[#B4F056]' : selectedPresetMeta.tier === 'bold' ? 'bg-[#FFD93D]' : 'bg-[#FF8C69]')}>{selectedPresetMeta.tier}</span>
                            <span className="rounded-md border border-black bg-[#FFF8E6] px-2 py-1 text-[9px] font-black uppercase">{selectedPresetMeta.pack}</span>
                            {selectedPresetMeta.category === 'cinematic' && <span className='rounded-md border border-purple-800 bg-purple-100 px-2 py-1 text-[9px] font-black uppercase text-purple-800'>Cinematic</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-black/65">No style selected yet. Open the picker and choose one.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStylePickerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#FFD93D] px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {selectedPresetMeta ? 'Change Style' : 'Choose Style'}
                  </button>
                </div>
              </BrutalCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: 0.04 }}>
              <BrutalCard className="rounded-2xl p-4 md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-xs font-black text-white">2</span>
                  <h2 className="text-lg md:text-xl font-black uppercase">Assets & Model</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-xl border-[3px] border-black bg-[#FFF3BF] p-3">
                    <p className="text-[11px] font-black uppercase tracking-wider">Product Image</p>
                    {productImage ? (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-black">
                        <Image unoptimized width={1200} height={1200} src={productImage} alt="Product" className="h-full w-full object-cover" />
                        <button type="button"
                          onClick={() => setProductImage('')}
                          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-black bg-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[3px] border-dashed border-black bg-white p-4 text-center transition-colors hover:bg-[#FFD93D]/80">
                        <Upload className="h-6 w-6" />
                        <span className="text-xs font-black uppercase">Upload Product</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} />
                      </label>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border-[3px] border-black bg-[#FFE1D6] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-black uppercase tracking-wider">Model / Character</p>
                      <div className="inline-flex overflow-hidden rounded-md border-2 border-black">
                        <button type="button"
                          onClick={() => setImageModel('gpt')}
                          className={cn(
                            'px-2 py-1 text-[10px] font-black uppercase transition-colors',
                            imageModel === 'gpt' ? 'bg-[#FFD93D] text-black' : 'bg-white text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          GPT
                        </button>
                        <button type="button"
                          onClick={() => setImageModel('gemini')}
                          className={cn(
                            'border-l-2 border-black px-2 py-1 text-[10px] font-black uppercase transition-colors',
                            imageModel === 'gemini' ? 'bg-[#FFD93D] text-black' : 'bg-white text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          Gemini
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {CHARACTER_OPTIONS.map((opt) => (
                        <button type="button"
                          key={opt.value}
                          onClick={() => {
                            setCharacterType(opt.value as CharacterType)
                            if (opt.value !== 'animal') setAnimalType('')
                            if (opt.value !== 'human_female' && opt.value !== 'human_male') {
                              setCharacterIdentity('global_modern')
                              setCharacterStyle('')
                              setSubjectPose('auto')
                              setSubjectExpression('auto')
                            }
                          }}
                          className={cn(
                            'rounded-md border-2 border-black px-2 py-1.5 text-[10px] font-black uppercase transition-transform hover:-translate-y-0.5',
                            characterType === opt.value ? 'bg-black text-white' : 'bg-white text-black'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {characterType === 'animal' && (
                      <div className="flex flex-wrap gap-1">
                        {ANIMAL_OPTIONS.slice(0, 6).map((a) => (
                          <button type="button"
                            key={a}
                            onClick={() => setAnimalType(a)}
                            className={cn(
                              'rounded-md border-2 border-black px-2 py-1 text-[10px] font-black uppercase',
                              animalType === a ? 'bg-black text-white' : 'bg-white'
                            )}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    )}

                    {(characterType === 'human_female' || characterType === 'human_male') && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {CHARACTER_STYLE_OPTIONS.slice(0, 6).map((s) => (
                            <button type="button"
                              key={s}
                              onClick={() => setCharacterStyle(characterStyle === s ? '' : s)}
                              className={cn(
                                'rounded-md border-2 border-black px-2 py-1 text-[10px] font-black uppercase',
                                characterStyle === s ? 'bg-black text-white' : 'bg-white'
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="rounded-md border-2 border-black bg-white p-2">
                          <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-black/60">People Type</p>
                          <div className="relative">
                            <select
                              value={characterIdentity}
                              onChange={(e) => setCharacterIdentity(e.target.value as CharacterIdentity)}
                              className="h-9 w-full cursor-pointer appearance-none rounded-md border-2 border-black bg-[#FFFDF5] pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-wide outline-none focus:ring-2 focus:ring-black/20"
                            >
                              {visibleIdentityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <div className="rounded-md border-2 border-black bg-white p-2">
                            <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-black/60">Pose Direction</p>
                            <div className="relative">
                              <select
                                value={subjectPose}
                                onChange={(e) => setSubjectPose(e.target.value)}
                                className="h-9 w-full cursor-pointer appearance-none rounded-md border-2 border-black bg-[#FFFDF5] pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-wide outline-none focus:ring-2 focus:ring-black/20"
                              >
                                <option value="auto">Auto (Intelligent)</option>
                                <option value="dynamic, editorial">Dynamic Editorial</option>
                                <option value="low-angle crouch, sneaker-forward">Low-Angle Crouch</option>
                                <option value="strong forward step, one foot toward lens">Forward Step Hero</option>
                                <option value="relaxed seated, lifestyle candid">Relaxed Seated</option>
                                <option value="three-quarter standing, fashion posture">Three-Quarter Standing</option>
                                <option value="side profile with clean silhouette">Side Profile</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                            </div>
                          </div>
                          <div className="rounded-md border-2 border-black bg-white p-2">
                            <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-black/60">Expression</p>
                            <div className="relative">
                              <select
                                value={subjectExpression}
                                onChange={(e) => setSubjectExpression(e.target.value)}
                                className="h-9 w-full cursor-pointer appearance-none rounded-md border-2 border-black bg-[#FFFDF5] pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-wide outline-none focus:ring-2 focus:ring-black/20"
                              >
                                <option value="auto">Auto (Intelligent)</option>
                                <option value="confident, direct gaze">Confident Direct Gaze</option>
                                <option value="calm, serious expression">Calm Serious</option>
                                <option value="cool, detached attitude">Cool Detached</option>
                                <option value="subtle smirk, rebellious">Subtle Smirk</option>
                                <option value="energetic, playful confidence">Energetic Playful</option>
                                <option value="introspective, thoughtful">Introspective</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {influencerImage ? (
                      <div className="relative mt-auto aspect-[4/3] overflow-hidden rounded-lg border-2 border-black">
                        <Image unoptimized width={1200} height={1200} src={influencerImage} alt="Model" className="h-full w-full object-cover" />
                        <button type="button"
                          onClick={() => {
                            setInfluencerImage('')
                          }}
                          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md border-2 border-black bg-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-auto flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[3px] border-dashed border-black bg-white p-4 text-center transition-colors hover:bg-[#FF8C69]/75">
                        <User className="h-6 w-6" />
                        <span className="text-xs font-black uppercase">Reference Face</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'influencer')} />
                      </label>
                    )}
                  </div>
                </div>
              </BrutalCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: 0.06 }}>
              <BrutalCard className="overflow-hidden rounded-2xl">
                <button type="button"
                  onClick={() => setTextOpen(!textOpen)}
                  className="flex w-full items-center justify-between border-b-[3px] border-black bg-[#B4F056] px-4 py-4 md:px-5"
                >
                  <span className="text-sm font-black uppercase flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                    {hasText && <span className="border-2 border-black bg-white px-2 py-0.5 text-[10px]">Active</span>}
                  </span>
                  {textOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {textOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 bg-white p-4 md:p-5">
                        <Input
                          placeholder="Headline (e.g. JUST DO IT)"
                          value={textHeadline}
                          onChange={(e) => setTextHeadline(e.target.value)}
                          className="h-11 rounded-lg border-[2px] border-black text-sm font-bold placeholder:text-black/40"
                        />
                        <Input
                          placeholder="Subline (optional)"
                          value={textSubline}
                          onChange={(e) => setTextSubline(e.target.value)}
                          className="h-11 rounded-lg border-[2px] border-black text-sm font-semibold placeholder:text-black/40"
                        />
                        <Input
                          placeholder="Tagline / CTA"
                          value={textTagline}
                          onChange={(e) => setTextTagline(e.target.value)}
                          className="h-11 rounded-lg border-[2px] border-black text-sm font-semibold placeholder:text-black/40"
                        />


                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </BrutalCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: 0.08 }}>
              <BrutalCard className="overflow-hidden rounded-2xl">
                <button type="button"
                  onClick={() => setOptionsOpen(!optionsOpen)}
                  className="flex w-full items-center justify-between border-b-[3px] border-black bg-[#FFD93D] px-4 py-4 md:px-5"
                >
                  <span className="text-sm font-black uppercase flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Configuration
                  </span>
                  {optionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {optionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5 bg-white p-4 md:p-5">
                        <div>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-wider">Aspect Ratio</p>
                          <div className="flex flex-wrap gap-2">
                            {ASPECT_RATIO_OPTIONS.map((opt) => (
                              <button type="button"
                                key={opt.value}
                                onClick={() => setAspectRatio(opt.value)}
                                className={cn(
                                  'rounded-md border-2 border-black px-3 py-2 text-xs font-black uppercase',
                                  aspectRatio === opt.value ? 'bg-black text-white' : 'bg-white'
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider">Platforms</p>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_OPTIONS.map((opt) => (
                                <button type="button"
                                  key={opt.value}
                                  onClick={() => togglePlatform(opt.value)}
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-md border-2 border-black px-2 py-1.5 text-[10px] font-black uppercase',
                                    selectedPlatforms.includes(opt.value) ? 'bg-[#B4F056]' : 'bg-white'
                                  )}
                                >
                                  {opt.value === 'instagram' && <Instagram className="h-3 w-3" />}
                                  {opt.value === 'facebook' && <Facebook className="h-3 w-3" />}
                                  {opt.value !== 'instagram' && opt.value !== 'facebook' && <Globe className="h-3 w-3" />}
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-wider">Camera Angle</p>
                            <div className="flex flex-wrap gap-2">
                              {CAMERA_ANGLE_OPTIONS.map((opt) => (
                                <button type="button"
                                  key={opt.value}
                                  onClick={() => setCameraAngle(opt.value)}
                                  className={cn(
                                    'rounded-md border-2 border-black px-2 py-1.5 text-[10px] font-black uppercase',
                                    cameraAngle === opt.value ? 'bg-black text-white' : 'bg-white'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border-[3px] border-black bg-[#FFF8E6] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider">Strict Realism (Anti-AI)</p>
                              <p className="mt-1 text-[10px] font-semibold text-black/70">
                                Locked ON for cinematic production quality across all presets.
                              </p>
                            </div>
                            <button
                              type="button"
                              className={cn(
                                'inline-flex items-center gap-1 rounded-md border-2 border-black px-2 py-1 text-[10px] font-black uppercase',
                                'bg-[#B4F056]'
                              )}
                              disabled
                            >
                              ON
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </BrutalCard>
            </motion.div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={handleGenerate}
              disabled={!canSubmit || retryAfterSeconds > 0}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black px-4 py-3.5 text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all sm:text-base md:px-5 md:py-4',
                canSubmit
                  ? 'bg-[#FF8C69] text-black hover:bg-[#ff7953]'
                  : 'bg-black/10 text-black/50 cursor-not-allowed shadow-none'
              )}
            >
              {retryAfterSeconds > 0 ? (
                <span>Wait {retryAfterSeconds}s</span>
              ) : loading ? (
                <>
                  <BrutalLoader size="sm" tone="brand" />
                  <span>Generating</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Ad
                </>
              )}
            </motion.button>
            {generationStatus !== 'idle' && (
              <div
                className={cn(
                  'mt-3 rounded-lg border-2 px-3 py-2 text-[11px] font-black uppercase tracking-wide',
                  generationStatus === 'success' ? 'border-black bg-[#B4F056] text-black'
                    : generationStatus === 'error' ? 'border-black bg-[#FFE1D6] text-black'
                      : 'border-black bg-[#FFF3BF] text-black'
                )}
              >
                {generationStatusText}
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: 0.08 }} className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <BrutalCard className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-[#FFF3BF] p-6 sm:min-h-[560px] sm:p-8">
                    <BrutalLoader size="lg" showLabel={false} tone="brand" />
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-black/70">Generating your creative</p>
                    <p className="mt-2 text-[11px] font-semibold text-black/55">Balancing lighting, composition, and product focus.</p>
                  </BrutalCard>
                </motion.div>
              ) : result ? (
                <motion.div key="result" variants={imageRevealVariants} initial="initial" animate="animate">
                  <BrutalCard className="overflow-hidden rounded-2xl">
                    <div className="relative border-b-[3px] border-black bg-black/5">
                      {(result.imageBase64 || result.imageUrl) && (
                        <Image unoptimized width={1400} height={1400} src={result.imageBase64 || result.imageUrl} alt="Generated Ad" className="w-full object-cover" />
                      )}
                      <div className="absolute left-3 top-3 rounded-md border-2 border-black bg-[#FFD93D] px-2 py-1 text-[10px] font-black uppercase">
                        {result.qualityScore}/100 Quality
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button type="button"
                          onClick={handleDownload}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#B4F056] px-4 py-3 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button type="button"
                          onClick={handleOpenInpaint}
                          disabled={!result.imageBase64 && !result.imageUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#FFD93D] px-4 py-3 text-xs font-black uppercase transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/45"
                        >
                          <Wand2 className="h-4 w-4" />
                          Inpaint
                        </button>
                        <button type="button"
                          onClick={handleGenerate}
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-white px-4 py-3 text-xs font-black uppercase transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/45"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate
                        </button>
                      </div>
                      {result.copy?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider">Suggested Copy</p>
                          {result.copy.slice(0, 2).map((c: any, i: number) => (
                            <div key={i} className="rounded-lg border-2 border-black bg-[#FFF8E6] p-3 text-xs font-semibold">
                              {typeof c === 'string' ? c : c?.text || JSON.stringify(c)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </BrutalCard>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BrutalCard className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-white p-6 text-center sm:min-h-[560px] sm:p-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-[3px] border-black bg-[#FFD93D]">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                    <p className="mt-5 text-base font-black uppercase">Your ad appears here</p>
                    <p className="mt-2 text-xs font-semibold text-black/60 max-w-xs">
                      Pick a style and hit generate. We will render the creative in this panel.
                    </p>
                  </BrutalCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>


      <AnimatePresence>
        {stylePickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/65 p-3 backdrop-blur-sm sm:p-6"
            onClick={() => setStylePickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[28px] border-[4px] border-black bg-[#FFF8E6] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b-[3px] border-black bg-white px-4 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Style Picker</p>
                  <h2 className="mt-1 text-xl font-black uppercase text-black sm:text-2xl">Choose Style</h2>
                  <p className="mt-1 text-xs font-semibold text-black/65 sm:text-sm">Pick a preset without stretching the whole page.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStylePickerOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-black bg-[#FFD93D] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <BrutalCard className="rounded-2xl p-4 md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-xs font-black text-white">1</span>
                  <h2 className="text-lg md:text-xl font-black uppercase">Choose Style</h2>
                </div>
                <div className="flex flex-wrap gap-2 border-b-2 border-black pb-4">
                  <button type="button"
                    onClick={() => setActiveCategory('all')}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg border-2 border-black px-3 py-2 text-xs font-black uppercase transition-all duration-200',
                      activeCategory === 'all'
                        ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-[#FFF8E6] text-black hover:-translate-y-0.5 hover:bg-[#FFD93D]'
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    All Cinematic
                  </button>
                  {AD_PRESET_CATEGORIES.map((cat) => (
                    <button type="button"
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border-2 border-black px-3 py-2 text-xs font-black uppercase transition-all duration-200',
                        activeCategory === cat.id
                          ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-[#FFF8E6] text-black hover:-translate-y-0.5 hover:bg-[#FFD93D]'
                      )}
                    >
                      {ICON_MAP[cat.icon]}
                      {cat.label}
                    </button>
                  ))}
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  key={activeCategory}
                  className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {displayedPresets.map((preset) => {
                    const isCinematic = preset.category === 'cinematic'
                    return (
                      <motion.button
                        key={preset.id}
                        variants={staggerItem}
                        whileHover={{ y: -3, scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => { setSelectedPreset(preset.id); setStylePickerOpen(false) }}
                        className={cn(
                          'relative rounded-xl border-[3px] border-black p-4 text-left transition-all',
                          selectedPreset === preset.id
                            ? isCinematic
                              ? 'bg-gradient-to-br from-[#E8D5F5] to-[#FFD93D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-[#FFD93D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : isCinematic
                              ? 'bg-gradient-to-br from-[#FAF5FF] to-white hover:from-[#F3E8FF] hover:to-[#FFF3BF] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white hover:bg-[#FFF3BF] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn(
                            'inline-flex h-9 w-9 items-center justify-center border-2 border-black',
                            selectedPreset === preset.id
                              ? 'bg-black text-white'
                              : isCinematic
                                ? 'bg-[#D8B4FE] text-black'
                                : 'bg-[#B4F056] text-black'
                          )}>
                            {ICON_MAP[preset.icon] ?? <Sparkles className="h-4 w-4" />}
                          </span>
                          <div>
                            <p className="text-sm font-black uppercase leading-tight">{preset.name}</p>
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-black/70">{preset.description}</p>
                            {isCinematic && (
                              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-purple-700">
                                Cinematic Production Quality
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {isCinematic && (
                                <span className="rounded-md border border-purple-800 bg-purple-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-purple-800">
                                  Cinematic
                                </span>
                              )}
                              <span
                                className={cn(
                                  'rounded-md border border-black px-1.5 py-0.5 text-[9px] font-black uppercase',
                                  preset.tier === 'safe'
                                    ? 'bg-[#B4F056]'
                                    : preset.tier === 'bold'
                                      ? 'bg-[#FFD93D]'
                                      : 'bg-[#FF8C69]'
                                )}
                              >
                                {preset.tier}
                              </span>
                              {(selectedPreset === preset.id || showAllPresets) && (
                                <span className="rounded-md border border-black bg-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                                  {preset.stability}
                                </span>
                              )}
                              {(selectedPreset === preset.id || showAllPresets) && (
                                <span className="rounded-md border border-black bg-[#FFF8E6] px-1.5 py-0.5 text-[9px] font-black uppercase">
                                  {preset.pack}
                                </span>
                              )}
                            </div>
                            {(selectedPreset === preset.id || showAllPresets) && (
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-black/55">
                                Best for: {preset.platforms.map((p) => (p === 'google' ? 'Google' : p)).join(' / ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedPreset === preset.id && (
                          <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-md border-2 border-black bg-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
                {visiblePresets.length > collapsedPresetCount && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllPresets((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#FFD93D]"
                    >
                      {showAllPresets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {showAllPresets ? 'Show fewer styles' : `Show all ${visiblePresets.length} styles`}
                    </button>
                  </div>
                )}
              </BrutalCard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

