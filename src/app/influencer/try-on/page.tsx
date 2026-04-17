'use client'

import './studio.css'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  AlertTriangle,
  Check,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useProduct, useUser } from '@/lib/react-query/hooks'
import { safeParseResponse } from '@/lib/api-utils'
import { showErrorToast, showInfoToast, showSuccessToast, showWarningToast } from '@/lib/kiwikoo-toast'
import { BrutalLoader } from '@/components/ui/BrutalLoader'
import { MonaLisaGenerationLoader } from '@/components/ui/MonaLisaGenerationLoader'

const MIN_TRYON_SOURCES = 3
const ASPECT_RATIOS = ['1:1', '4:5', '9:16'] as const
const RESOLUTIONS = ['1K', '2K'] as const
const POLISH_LIMIT = 240

function resolveStoredImageUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('/api/images/proxy')) return url
  try {
    const parsed = new URL(url)
    const isSupabase = (parsed.hostname.endsWith('.supabase.co') || parsed.hostname.endsWith('.supabase.in')) && parsed.pathname.includes('/storage/')
    return isSupabase ? `/api/images/proxy?url=${encodeURIComponent(parsed.toString())}` : url
  } catch {
    return url
  }
}

function toImageSrc(image?: string | null) {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) return image
  return `data:image/jpeg;base64,${image}`
}

function normalizePhoto(raw: any) {
  const id = String(raw?.id ?? '')
  const imageUrl = String(raw?.imageUrl ?? raw?.image_url ?? '')
  if (!id || !imageUrl) return null
  return {
    id,
    imageUrl,
    source: String(raw?.source ?? 'app_upload'),
    status: String(raw?.status ?? 'pending'),
    qualityScore: raw?.qualityScore ?? raw?.quality_score ?? null,
    selectionScore: raw?.selectionScore ?? null,
    analysis: raw?.analysis ?? null,
    approvedForTryOn: Boolean(raw?.approvedForTryOn ?? raw?.approved_for_tryon ?? false),
    rejectionReasons: Array.isArray(raw?.rejectionReasons) ? raw.rejectionReasons : Array.isArray(raw?.rejection_reasons) ? raw.rejection_reasons : [],
    createdAt: String(raw?.createdAt ?? raw?.created_at ?? ''),
    updatedAt: String(raw?.updatedAt ?? raw?.updated_at ?? ''),
    isActive: raw?.isActive ?? raw?.is_active,
  }
}

function dedupeById(items: any[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getApprovedPhotos(photos: any[]) {
  return photos.filter((photo) => photo.status === 'approved' && photo.isActive !== false)
}

function deriveRecommendations(photos: any[]) {
  const approved = getApprovedPhotos(photos)
    .sort((a, b) => (b.selectionScore ?? b.qualityScore ?? 0) - (a.selectionScore ?? a.qualityScore ?? 0))
  return {
    selected: approved.slice(0, 3),
    alternates: approved.slice(3, 8),
    totalApproved: approved.length,
    isReadyForTryOn: approved.length >= MIN_TRYON_SOURCES,
    minRequired: MIN_TRYON_SOURCES,
    photosNeeded: Math.max(0, MIN_TRYON_SOURCES - approved.length),
  }
}

function normalizeRecommendation(raw: any, photos: any[]) {
  const fallback = deriveRecommendations(photos)
  const selected = dedupeById((Array.isArray(raw?.selected) ? raw.selected : []).map(normalizePhoto).filter(Boolean))
  const alternates = dedupeById((Array.isArray(raw?.alternates) ? raw.alternates : []).map(normalizePhoto).filter(Boolean))
  if (!selected.length && !alternates.length) return fallback
  return {
    selected: selected.length ? selected : fallback.selected,
    alternates: alternates.length ? alternates : fallback.alternates,
    totalApproved: fallback.totalApproved,
    isReadyForTryOn: fallback.isReadyForTryOn,
    minRequired: fallback.minRequired,
    photosNeeded: fallback.photosNeeded,
  }
}

function normalizeResult(raw: any) {
  if (!raw) return { outputs: [] }
  const outputs = Array.isArray(raw.outputs)
    ? raw.outputs
        .map((output: any, index: number) => ({
          referenceImageId: String(output?.referenceImageId ?? output?.reference_image_id ?? ''),
          status: String(output?.status ?? 'completed'),
          imageUrl: String(output?.imageUrl ?? output?.image_url ?? ''),
          base64Image: output?.base64Image ?? output?.base64_image ?? '',
          error: output?.error ? String(output.error) : '',
          label: String(output?.label ?? `Variant ${index + 1}`),
        }))
        .filter((output: any) => output.imageUrl || output.base64Image || output.error)
    : []
  return {
    jobId: raw.jobId ?? raw.job_id ?? '',
    status: raw.status ?? '',
    imageUrl: raw.imageUrl ?? raw.image_url ?? '',
    base64Image: raw.base64Image ?? raw.base64_image ?? '',
    outputs,
    error: raw.error ? String(raw.error) : '',
    output_image_path: raw.output_image_path ?? '',
  }
}

function pickProductImage(product: any, selected: string) {
  if (selected) return selected
  if (product?.tryOnImage) return product.tryOnImage
  const first = product?.images?.[0]
  if (!first) return ''
  if (typeof first === 'string') return first
  return first.imagePath ?? first.imageUrl ?? first.image_url ?? first.path ?? ''
}

export default function TryOnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] pt-24 flex items-center justify-center"><BrutalLoader size="lg" tone="influencer" label="Loading try-on studio" /></div>}>
      <TryOnPageContent />
    </Suspense>
  )
}

function TryOnPageContent() {
  const { data: user } = useUser()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const { data: productData, isLoading: productLoading } = useProduct(productId)

  const [photos, setPhotos] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any | null>(null)
  const [loadingLibrary, setLoadingLibrary] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [archivingId, setArchivingId] = useState('')
  const [selectedReferenceIds, setSelectedReferenceIds] = useState<string[]>([])
  const [activeSlot, setActiveSlot] = useState(0)
  const [selectedGarmentImage, setSelectedGarmentImage] = useState('')
  const [polishNotes, setPolishNotes] = useState('')
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16'>('4:5')
  const [resolution, setResolution] = useState<'1K' | '2K'>('2K')
  const [submitting, setSubmitting] = useState(false)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)
  const [activeJobId, setActiveJobId] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [result, setResult] = useState<any | null>(null)
  const [selectedOutputIndex, setSelectedOutputIndex] = useState(0)
  const [garmentIntel, setGarmentIntel] = useState<any | null>(null)
  const [loadingRecommend, setLoadingRecommend] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto')
  const [libraryModalOpen, setLibraryModalOpen] = useState(false)
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)
  const photosRef = useRef<any[]>([])
  const generateInFlightRef = useRef(false)
  const pollAttemptRef = useRef(0)
  const pollCooldownUntilRef = useRef(0)

  const photoMap = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos])
  const approvedPhotos = useMemo(() => getApprovedPhotos(photos), [photos])
  const recommendationPhotoKey = useMemo(
    () => photos.map((photo) => `${photo.id}:${photo.status}:${photo.isActive !== false}`).join('|'),
    [photos]
  )
  const derivedRecommendations = useMemo(() => deriveRecommendations(photos), [photos])
  const currentRecommendations = recommendations ?? derivedRecommendations
  const candidatePhotos = useMemo(
    () => dedupeById([...currentRecommendations.selected, ...currentRecommendations.alternates, ...approvedPhotos]),
    [approvedPhotos, currentRecommendations.alternates, currentRecommendations.selected]
  )
  const defaultSelectedReferenceIds = useMemo(
    () =>
      (currentRecommendations.selected.length ? currentRecommendations.selected : approvedPhotos)
        .slice(0, 3)
        .map((photo: any) => photo.id)
        .filter(Boolean),
    [approvedPhotos, currentRecommendations.selected]
  )
  const selectedPhotos = selectedReferenceIds.map((id) => photoMap.get(id)).filter(Boolean)
  const selectedProductImage = pickProductImage(productData, selectedGarmentImage)
  const outputs = useMemo(() => {
    if (!result) return []
    if (Array.isArray(result.outputs) && result.outputs.length) return result.outputs
    if (result.imageUrl || result.base64Image || result.output_image_path) {
      return [
        {
          referenceImageId: selectedReferenceIds[0] ?? '',
          status: result.status ?? 'completed',
          imageUrl: result.imageUrl || result.output_image_path || '',
          base64Image: result.base64Image,
          error: result.error || '',
          label: 'Result',
        },
      ]
    }
    return []
  }, [result, selectedReferenceIds])
  const selectedOutput = outputs[selectedOutputIndex] ?? outputs[0] ?? null
  const hasCompleteSelection = selectedReferenceIds.filter(Boolean).length === 3 && selectedPhotos.length === 3
  const hasManualSelection = selectionMode === 'manual' && hasCompleteSelection
  const readyForTryOn = currentRecommendations.totalApproved >= currentRecommendations.minRequired
  const isGenerating = submitting || Boolean(activeJobId)
  const visibleCandidatePhotos = candidatePhotos.slice(0, 8)
  const generationLabel = hasManualSelection ? 'Generate with chosen sources' : 'Generate with AI-picked sources'
  const generationHint = hasManualSelection
    ? 'You are locking the three visible source slots for this run.'
    : 'AI will keep re-ranking approved photos for this garment before each run.'

  const loadLibrary = useCallback(async () => {
    setLoadingLibrary(true)
    try {
      const libRes = await fetch('/api/reference-photos', { cache: 'no-store', credentials: 'include' })
      const libData = await safeParseResponse<any>(libRes, 'reference photos')
      const nextPhotos = Array.isArray(libData?.photos) ? libData.photos.map(normalizePhoto).filter(Boolean) : []
      setPhotos(nextPhotos)
      try {
        const recRes = await fetch('/api/reference-photos/recommendations', { cache: 'no-store', credentials: 'include' })
        if (recRes.ok) {
          const recData = await safeParseResponse<any>(recRes, 'reference photo recommendations')
          setRecommendations(normalizeRecommendation(recData, nextPhotos))
        } else {
          setRecommendations(deriveRecommendations(nextPhotos))
        }
      } catch {
        setRecommendations(deriveRecommendations(nextPhotos))
      }
    } catch (error) {
      console.error('[try-on] library load failed:', error)
      showErrorToast('Library unavailable', 'We could not load your reference photo library.')
      setPhotos([])
      setRecommendations(deriveRecommendations([]))
    } finally {
      setLoadingLibrary(false)
    }
  }, [])

  useEffect(() => {
    void loadLibrary()
  }, [loadLibrary])

  /* useEffect(() => {
    if (true) return
    return
    if (!ids.length) return // Don't set empty array â€” would loop
    setSelectedReferenceIds(ids)
  }, [approvedPhotos, currentRecommendations.selected, selectedReferenceIds.length]) */

  useEffect(() => {
    if (!defaultSelectedReferenceIds.length) return

    setSelectedReferenceIds((previousIds) => {
      if (previousIds.length > 0) return previousIds
      if (
        previousIds.length === defaultSelectedReferenceIds.length &&
        previousIds.every((id, index) => id === defaultSelectedReferenceIds[index])
      ) {
        return previousIds
      }
      return defaultSelectedReferenceIds
    })
  }, [defaultSelectedReferenceIds])

  useEffect(() => {
    if (!activeJobId) return
    setElapsedSeconds(0)
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [activeJobId])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    if (retryAfterSeconds <= 0) return
    const timer = setInterval(() => setRetryAfterSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [retryAfterSeconds])

  // Garment-aware recommendation: when product image changes, re-rank photos
  useEffect(() => {
    const currentPhotos = photosRef.current
    if (!selectedProductImage || !currentPhotos.length) return
    let cancelled = false
    const fetchRecommendations = async () => {
      setLoadingRecommend(true)
      try {
        const isBase64 = selectedProductImage.startsWith('data:image/')
        const body: Record<string, string> = {}
        if (isBase64) {
          body.garmentBase64 = selectedProductImage
        } else {
          body.garmentImageUrl = selectedProductImage
        }
        const res = await fetch('/api/tryon/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Recommend API failed')
        const data = await res.json()
        if (cancelled) return

        setGarmentIntel(data.garmentIntel ?? null)

        // Update photo selection scores from garment recommendations
        let nextPhotos = currentPhotos
        if (Array.isArray(data.recommendations) && data.recommendations.length) {
          const scoreMap = new Map(data.recommendations.map((r: any) => [r.id, r]))
          nextPhotos = currentPhotos.map((photo) => {
            const rec = scoreMap.get(photo.id) as any
            if (rec) {
              return { ...photo, selectionScore: rec.score / 100, garmentSuitability: rec.suitability, garmentReasoning: rec.reasoning }
            }
            return photo
          })
          setPhotos(nextPhotos)
        }

        const nextPhotoMap = new Map(nextPhotos.map((photo) => [photo.id, photo]))
        const approvedRankablePhotos = getApprovedPhotos(nextPhotos)
        const rankedCandidatePhotos = Array.isArray(data.recommendations)
          ? dedupeById(
              data.recommendations
                .map((recommendation: any) => nextPhotoMap.get(String(recommendation?.id ?? '')))
                .filter(Boolean)
            )
          : []
        const rankedPhotos = rankedCandidatePhotos.length
          ? rankedCandidatePhotos
          : approvedRankablePhotos
              .slice()
              .sort((left, right) => (right.selectionScore ?? right.qualityScore ?? 0) - (left.selectionScore ?? left.qualityScore ?? 0))

        setRecommendations({
          selected: rankedPhotos.slice(0, 3),
          alternates: rankedPhotos.slice(3, 8),
          totalApproved: approvedRankablePhotos.length,
          isReadyForTryOn: approvedRankablePhotos.length >= MIN_TRYON_SOURCES,
          minRequired: MIN_TRYON_SOURCES,
          photosNeeded: Math.max(0, MIN_TRYON_SOURCES - approvedRankablePhotos.length),
        })

        if (Array.isArray(data.top3) && data.top3.length >= 3) {
          setSelectedReferenceIds(data.top3.slice(0, 3))
          setSelectionMode('auto')
        } else if (rankedPhotos.length >= 3) {
          setSelectedReferenceIds(rankedPhotos.slice(0, 3).map((photo: any) => photo.id))
          setSelectionMode('auto')
        }
      } catch (err) {
        console.warn('[try-on] garment recommendation failed:', err)
      } finally {
        if (!cancelled) setLoadingRecommend(false)
      }
    }
    void fetchRecommendations()
    return () => { cancelled = true }
  }, [recommendationPhotoKey, selectedProductImage])

  const refreshAll = useCallback(async () => {
    await loadLibrary()
  }, [loadLibrary])

  const pollTryOnJob = useCallback(async (jobId: string) => {
    const startedAt = Date.now()
    const timeoutMs = 10 * 60 * 1000
    while (Date.now() - startedAt < timeoutMs) {
      const now = Date.now()
      if (pollCooldownUntilRef.current > now) {
        await new Promise((resolve) => setTimeout(resolve, pollCooldownUntilRef.current - now))
      }
      try {
        const res = await fetch(`/api/tryon/jobs/${jobId}`, { cache: 'no-store', credentials: 'include' })
        const data = normalizeResult(await safeParseResponse<any>(res, 'try-on job polling'))
        pollAttemptRef.current += 1
        if (data.status === 'pending' || data.status === 'processing') {
          await new Promise((resolve) => setTimeout(resolve, Math.min(12000, 2500 + Math.floor(pollAttemptRef.current / 3) * 1000)))
          continue
        }
        return data
      } catch (error) {
        const structured = error as Error & { status?: number; retryAfterSeconds?: number }
        if (structured.status !== 429 && structured.status !== 503) throw error
        const retrySeconds = Math.max(1, Number(structured.retryAfterSeconds ?? (structured.status === 503 ? 12 : 8)))
        pollCooldownUntilRef.current = Date.now() + retrySeconds * 1000
        setRetryAfterSeconds((s) => Math.max(s, retrySeconds))
        await new Promise((resolve) => setTimeout(resolve, Math.min(retrySeconds * 1000, timeoutMs - (Date.now() - startedAt))))
      }
    }
    throw new Error('Generation is taking longer than expected. Please check your generation history.')
  }, [])

  const updateSelectedSlot = useCallback((slot: number, photoId: string) => {
    setSelectedReferenceIds((prev) => {
      const next = [...prev]
      while (next.length < 3) next.push('')
      const otherIndex = next.findIndex((id, index) => index !== slot && id === photoId)
      const previous = next[slot]
      next[slot] = photoId
      if (otherIndex >= 0) next[otherIndex] = previous || ''
      return next
    })
    setSelectionMode('manual')
    setActiveSlot(slot)
  }, [])

  const uploadReferencePhoto = useCallback(async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/reference-photos', { method: 'POST', body: form, credentials: 'include' })
      const data = await safeParseResponse<any>(res, 'reference photo upload')
      showSuccessToast('Photo uploaded', data?.message || 'Your reference photo is being analyzed.')
      await refreshAll()
    } catch (error) {
      showErrorToast('Upload failed', error instanceof Error ? error.message : 'Failed to upload photo.')
    } finally {
      setUploading(false)
    }
  }, [refreshAll])

  const archivePhoto = useCallback(async (photoId: string) => {
    if (!window.confirm('Archive this reference photo?')) return
    setArchivingId(photoId)
    try {
      const res = await fetch(`/api/reference-photos?id=${encodeURIComponent(photoId)}`, { method: 'DELETE', credentials: 'include' })
      await safeParseResponse(res, 'reference photo archive')
      showInfoToast('Photo archived', 'The photo was removed from your active library.')
      setSelectedReferenceIds((prev) => prev.map((id) => (id === photoId ? '' : id)))
      await refreshAll()
    } catch (error) {
      showErrorToast('Archive failed', error instanceof Error ? error.message : 'Failed to archive photo.')
    } finally {
      setArchivingId('')
    }
  }, [refreshAll])

  const submitTryOn = useCallback(async () => {
    if (!currentRecommendations.isReadyForTryOn) {
      showWarningToast('More library photos needed', `${currentRecommendations.photosNeeded} more approved photo${currentRecommendations.photosNeeded === 1 ? '' : 's'} are required before try-on is enabled.`)
      return
    }
    if (!productId && !selectedProductImage) {
      showWarningToast('Choose a garment', 'Open the page from a product or choose a product image first.')
      return
    }

    const sourceIds = selectedReferenceIds.filter(Boolean)
    const useAutoSelect = selectionMode === 'auto' || sourceIds.length !== 3
    const isGarmentBase64 = Boolean(selectedProductImage?.startsWith('data:image/'))

    const payload: Record<string, unknown> = {
      productId: productId || undefined,
      clothingImage: isGarmentBase64 ? selectedProductImage : undefined,
      garmentImageUrl: !isGarmentBase64 ? (selectedProductImage || undefined) : undefined,
      polishNotes: polishNotes.trim() || undefined,
      aspectRatio,
      resolution,
      model: 'production',
    }

    if (useAutoSelect) {
      payload.autoSelect = true
    } else {
      payload.selectedReferenceImageIds = sourceIds
    }

    generateInFlightRef.current = true
    setSubmitting(true)
    setRetryAfterSeconds(0)
    setResult(null)

    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = normalizeResult(await safeParseResponse<any>(res, 'try-on generation'))

      // If the API returned which photos were auto-selected, update our state
      if (useAutoSelect && Array.isArray((data as any).selectedPhotoIds)) {
        setSelectedReferenceIds((data as any).selectedPhotoIds.slice(0, 3))
        setSelectionMode('auto')
      }

      if (data.jobId && (data.status === 'pending' || data.status === 'processing')) {
        setActiveJobId(String(data.jobId))
        const finalJob = await pollTryOnJob(String(data.jobId))
        setResult(finalJob)
        setSelectedOutputIndex(0)
        showSuccessToast('Try-on ready', 'Your new try-on is finished.')
      } else if (data.jobId && !data.outputs?.length && !data.imageUrl && !data.base64Image) {
        setActiveJobId(String(data.jobId))
        const finalJob = await pollTryOnJob(String(data.jobId))
        setResult(finalJob)
        setSelectedOutputIndex(0)
        showSuccessToast('Try-on ready', 'Your new try-on is finished.')
      } else {
        setResult(data)
        setSelectedOutputIndex(0)
        showSuccessToast('Try-on ready', 'We generated your three try-on images.')
      }
    } catch (error) {
      const structured = error as Error & { retryAfterSeconds?: number }
      if (structured.retryAfterSeconds) setRetryAfterSeconds(structured.retryAfterSeconds)
      showErrorToast('Try-on failed', error instanceof Error ? error.message : 'Generation failed.')
    } finally {
      setSubmitting(false)
      setActiveJobId('')
      generateInFlightRef.current = false
    }
  }, [aspectRatio, currentRecommendations.isReadyForTryOn, currentRecommendations.photosNeeded, pollTryOnJob, polishNotes, productId, resolution, selectedProductImage, selectedReferenceIds, selectionMode])

  const downloadCurrent = useCallback(() => {
    if (!selectedOutput?.imageUrl && !selectedOutput?.base64Image) return
    const a = document.createElement('a')
    a.href = selectedOutput.imageUrl ? resolveStoredImageUrl(selectedOutput.imageUrl) : toImageSrc(selectedOutput.base64Image)
    a.download = 'try-on.png'
    a.click()
  }, [selectedOutput])

  return (
    <div className="relative min-h-screen bg-[#F6F1E8] text-black pt-20 lg:pt-0">
      <div className="flex flex-col lg:flex-row lg:h-screen lg:pt-20">
        <div className={`fixed inset-x-0 bottom-0 top-[10vh] z-50 overflow-y-auto rounded-t-[32px] border-t-[4px] border-black bg-white p-6 shadow-[0_-12px_0_0_rgba(0,0,0,0.1)] transition-transform duration-300 lg:static lg:block lg:h-full lg:w-[420px] lg:flex-shrink-0 lg:rounded-none lg:border-r-[4px] lg:border-t-0 lg:shadow-none xl:w-[460px] ${mobileSettingsOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-2xl font-black uppercase">Try-On Settings</h2>
            <button type="button" onClick={() => setMobileSettingsOpen(false)} className="rounded-full border-[3px] border-black bg-[#F9F8F4] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_0_#000]">Close</button>
          </div>
          <div className="space-y-6">
            <div className="rounded-[24px] border-[3px] border-black bg-[#F9F8F4] p-5 shadow-[5px_5px_0_0_#000]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Selected Target</div>
              <h3 className="mt-1 text-lg font-black uppercase">{productLoading ? 'Loading product...' : (productData?.name || 'No product selected')}</h3>
              {garmentIntel && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#E8F5E9] px-3 py-1 text-[10px] font-black uppercase">
                  <Check className="h-3 w-3" /> AI optimized for {garmentIntel.coverage.replace('_', ' ')}
                </div>
              )}
              {productId && (productData?.images?.length > 0) && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {(productData.images).map((image: any, index: number) => {
                    const imageUrl = typeof image === 'string' ? image : (image.imagePath ?? image.imageUrl ?? image.image_url ?? image.path ?? '');
                    if (!imageUrl) return null;
                    const active = selectedProductImage === imageUrl;
                    return (
                      <button key={`${imageUrl}-${index}`} type="button" onClick={() => setSelectedGarmentImage(imageUrl)} className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 ${active ? 'border-[#FF8C69]' : 'border-black'} bg-white`}>
                        <Image src={resolveStoredImageUrl(imageUrl)} alt="Product" fill unoptimized className="object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="rounded-[24px] border-[3px] border-black bg-white p-5 shadow-[5px_5px_0_0_#000]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Photos ({selectedPhotos.length}/3)</div>
                <button type="button" onClick={() => setLibraryModalOpen(true)} className="rounded-full border-[2px] border-black bg-[#FFD93D] px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_#000]">Edit Sources</button>
              </div>
              <p className="mt-2 text-xs font-semibold text-black/60">{selectionMode === 'manual' ? 'Using your manual selection.' : 'AI automatically picked the best photos.'}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((slot) => {
                  const photo = photoMap.get(selectedReferenceIds[slot] ?? '');
                  return (
                    <div key={slot} className="relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-black bg-[#F9F8F4]">
                      {photo ? <Image src={resolveStoredImageUrl(photo.imageUrl)} alt={`Slot ${slot + 1}`} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-black/20" /></div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Details / Polish</label>
                <textarea value={polishNotes} onChange={(e) => setPolishNotes(e.target.value.slice(0, POLISH_LIMIT))} placeholder="Any specific adjustments?" className="mt-1 h-20 w-full rounded-xl border-2 border-black bg-[#F9F8F4] p-3 text-xs font-semibold outline-none focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Ratio</label>
                  <div className="mt-1 flex flex-col gap-1">
                    {ASPECT_RATIOS.map((ratio) => <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} className={`rounded-xl border-2 py-1.5 text-xs font-black uppercase ${aspectRatio === ratio ? 'border-black bg-[#FFD93D]' : 'border-black bg-white'}`}>{ratio}</button>)}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Quality</label>
                  <div className="mt-1 flex flex-col gap-1">
                    {RESOLUTIONS.map((item) => <button key={item} type="button" onClick={() => setResolution(item)} className={`rounded-xl border-2 py-1.5 text-xs font-black uppercase ${resolution === item ? 'border-black bg-[#9CFF6B]' : 'border-black bg-white'}`}>{item}</button>)}
                  </div>
                </div>
              </div>
            </div>
            <button type="button" onClick={() => { setMobileSettingsOpen(false); void submitTryOn() }} disabled={submitting || !readyForTryOn} className={`flex w-full items-center justify-center gap-3 rounded-[20px] border-[4px] border-black p-4 text-sm font-black uppercase shadow-[4px_4px_0_0_#000] ${submitting || !readyForTryOn ? 'cursor-not-allowed bg-[#E5E5E5] text-black/50' : 'bg-[#FFD93D]'}`}>
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {submitting ? 'Generating...' : generationLabel}
            </button>
            {retryAfterSeconds > 0 && <div className="text-center text-xs font-bold text-red-500">Rate limit: retry in {retryAfterSeconds}s</div>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-col gap-2">
              <h1 className="text-3xl font-black uppercase tracking-tight lg:text-5xl">Studio Workspace</h1>
              <p className="font-semibold text-black/60">Generate ultra-realistic try-on photos. Wait times apply to ensure maximum quality per source.</p>
            </div>
            <div className="rounded-[32px] border-[4px] border-black bg-white p-4 shadow-[8px_8px_0_0_#000] lg:p-6">
              {isGenerating ? (
                <div className="py-10">
                  <MonaLisaGenerationLoader elapsedSeconds={elapsedSeconds} title="Painting your try-on" description="The model is working through one source image at a time." />
                </div>
              ) : outputs.length > 0 ? (
                <div className="space-y-6">
                  <div className="relative aspect-[4/5] w-full max-w-[600px] mx-auto overflow-hidden rounded-[24px] border-[4px] border-black bg-[#F9F8F4] shadow-[6px_6px_0_0_#000]">
                    {selectedOutput?.imageUrl || selectedOutput?.base64Image ? (
                      <Image src={selectedOutput.imageUrl ? resolveStoredImageUrl(selectedOutput.imageUrl) : toImageSrc(selectedOutput.base64Image)} alt="Result" fill unoptimized className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><AlertTriangle className="h-10 w-10 text-red-500" /></div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-w-[600px] mx-auto">
                    {outputs.map((output: any, index: number) => (
                      <button key={index} type="button" onClick={() => setSelectedOutputIndex(index)} className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-[3px] shadow-[4px_4px_0_0_#000] ${selectedOutputIndex === index ? 'border-[#FF8C69]' : 'border-black'}`}>
                        {output.imageUrl || output.base64Image ? <Image src={output.imageUrl ? resolveStoredImageUrl(output.imageUrl) : toImageSrc(output.base64Image)} alt={`Variant ${index}`} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center bg-gray-100"><AlertTriangle className="h-5 w-5 text-black/30" /></div>}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[10px] font-bold text-white truncate">{output.label || `Photo ${index+1}`}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button type="button" onClick={downloadCurrent} className="rounded-full border-[3px] border-black bg-[#FF8C69] px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0_0_#000]">Download Image</button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[40vh] items-center justify-center rounded-[24px] border-2 border-dashed border-black/20 bg-[#F9F8F4] p-6 text-center lg:min-h-[60vh]">
                  <div className="max-w-md">
                    <ImageIcon className="mx-auto h-12 w-12 text-black/20 mb-4" />
                    <h3 className="text-lg font-black uppercase">Canvas is empty</h3>
                    <p className="mt-2 text-sm font-semibold text-black/60">Configure your settings in the sidebar and hit run to generate three unique try-on variants here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {!mobileSettingsOpen && (
        <div className="fixed bottom-6 left-1/2 z-40 w-[90%] max-w-[340px] -translate-x-1/2 lg:hidden">
          <button type="button" onClick={() => setMobileSettingsOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-black bg-[#FFD93D] px-6 py-4 text-base font-black uppercase shadow-[6px_6px_0_0_#000]">
            <Sparkles className="h-5 w-5" /> Customize & Run
          </button>
        </div>
      )}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border-[4px] border-black bg-[#F6F1E8] shadow-[12px_12px_0_0_#000]">
            <div className="flex items-center justify-between border-b-[4px] border-black bg-white p-5">
              <div>
                <h2 className="text-2xl font-black uppercase">Reference Library</h2>
                <p className="text-xs font-semibold text-black/60">Pick exactly 3 photos to override the AI</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void refreshAll()} className="rounded-full border-2 border-black bg-[#F9F8F4] p-2 hover:bg-[#FFD93D] transition"><RefreshCw className={`h-5 w-5 ${loadingRecommend ? 'animate-spin' : ''}`} /></button>
                <button type="button" onClick={() => setLibraryModalOpen(false)} className="rounded-full border-2 border-black bg-[#FF8C69] px-4 py-2 font-black uppercase text-white hover:bg-[#FF7A50] transition">Done</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-6 flex items-center justify-end">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-black bg-[#FFD93D] px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0_0_#000]">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload New
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; e.currentTarget.value = ''; if (file) void uploadReferencePhoto(file) }} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {!photos.length && !loadingLibrary && <p className="col-span-full py-10 text-center font-bold">No photos. Please upload.</p>}
                {photos.map(photo => {
                  const isActive = selectedReferenceIds.includes(photo.id);
                  const toggle = () => {
                    setSelectionMode('manual');
                    if (isActive) {
                      setSelectedReferenceIds(prev => prev.filter(id => id !== photo.id));
                    } else {
                      if (selectedReferenceIds.filter(Boolean).length >= 3) {
                        const next = [...selectedReferenceIds]; next[2] = photo.id; setSelectedReferenceIds(next);
                      } else {
                        setSelectedReferenceIds(prev => { const next = [...prev]; const empty = next.findIndex(p => !p); if(empty>=0) next[empty]=photo.id; else next.push(photo.id); return next; });
                      }
                    }
                  };
                  return (
                    <div key={photo.id} className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border-[3px] shadow-[4px_4px_0_0_#000] cursor-pointer transition-transform hover:-translate-y-1 ${isActive ? 'border-[#FFD93D]' : 'border-black hover:border-black/50'}`} onClick={toggle}>
                      <Image src={resolveStoredImageUrl(photo.imageUrl)} alt="Library" fill unoptimized className="object-cover" />
                      <div className="absolute left-2 top-2 rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase">{photo.status}</div>
                      {isActive && <div className="absolute right-2 top-2 rounded-full border-2 border-black bg-[#FFD93D] px-2 py-0.5 text-[10px] font-black uppercase"><Check className="h-3 w-3" /></div>}
                      {photo?.garmentSuitability && (
                        <div className="absolute bottom-2 left-2 truncate right-2 rounded-full border-2 border-black bg-white/90 px-2 text-[9px] font-bold uppercase backdrop-blur">
                          AI Score: {Math.round((photo.selectionScore || 0) * 100)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

