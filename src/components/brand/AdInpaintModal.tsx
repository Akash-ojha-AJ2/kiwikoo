"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import {
  Brush,
  ImagePlus,
  Move,
  RotateCcw,
  Sparkles,
  Type,
  Trash2,
  ScanSearch,
  SunMedium,
  Hand,
  Wand2,
  X,
  Grip,
} from 'lucide-react'
import { PortalModal } from '@/components/ui/PortalModal'
import { cn } from '@/lib/utils'
import { normalizeImageFileForVisionUpload } from '@/lib/client-image-normalization'
import {
  SMART_EDIT_PRESETS,
  SMART_EDIT_TASK_OPTIONS,
  buildSmartEditPlan,
  computeExpandedRect,
  getTaskLabel,
  toNormalizedExpansionRect,
  type GeminiEditScope,
  type PlannerRegionStats,
  type SmartEditTask,
} from '@/lib/ads/edit-planner'

type SmartEditOptions = {
  referenceImageBase64?: string
  scope?: GeminiEditScope
  task?: SmartEditTask
  expansionOverride?: { left: number; top: number; width: number; height: number }
}

interface AdInpaintModalProps {
  isOpen: boolean
  imageSrc: string
  isSubmitting: boolean
  onClose: () => void
  onApply: (prompt: string, maskBase64: string | undefined, options?: SmartEditOptions) => Promise<void> | void
  embedded?: boolean
}

type HandleType = 'move' | 'nw' | 'ne' | 'sw' | 'se'

const TASK_ICONS: Record<SmartEditTask, typeof Sparkles> = {
  auto: Sparkles,
  hold_product: Hand,
  wear_accessory: ScanSearch,
  pose_change: Move,
  text_edit: Type,
  remove_object: Trash2,
  stylized_effect: Wand2,
  replace_region: Brush,
  add_object: ImagePlus,
  scene_edit: SunMedium,
  general_edit: Sparkles,
}

const SCOPE_OPTIONS: Array<{ value: GeminiEditScope; label: string; hint: string; icon: typeof Sparkles }> = [
  { value: 'auto', label: 'Auto Scope', hint: 'Match scope to the task and prompt.', icon: Sparkles },
  { value: 'local', label: 'Local', hint: 'Strict area edits like cleanup, glitter, or text.', icon: Brush },
  { value: 'subject', label: 'Subject', hint: 'Allow pose, grip, wearing, and body adjustments.', icon: Move },
  { value: 'full_frame', label: 'Full Frame', hint: 'Allow broader scene, lighting, or composition changes.', icon: SunMedium },
]

const PROMPT_IDEAS = [
  { task: 'stylized_effect' as SmartEditTask, text: 'Add premium glitter makeup that follows the skin texture naturally.' },
  { task: 'hold_product' as SmartEditTask, text: 'Place my reference product into this hand with realistic grip, scale, and shadows.' },
  { task: 'remove_object' as SmartEditTask, text: 'Remove the object in this area and reconstruct the background cleanly.' },
  { task: 'text_edit' as SmartEditTask, text: 'Add sharp editorial text only inside this selected area.' },
  { task: 'pose_change' as SmartEditTask, text: 'Make him wear this product and shift to a stronger fashion pose.' },
]

function clampRect(rect: { left: number; top: number; width: number; height: number }, maxWidth: number, maxHeight: number) {
  const width = Math.max(24, Math.min(rect.width, maxWidth))
  const height = Math.max(24, Math.min(rect.height, maxHeight))
  const left = Math.max(0, Math.min(rect.left, maxWidth - width))
  const top = Math.max(0, Math.min(rect.top, maxHeight - height))
  return { left, top, width, height }
}

export default function AdInpaintModal({
  isOpen,
  imageSrc,
  isSubmitting,
  onClose,
  onApply,
  embedded = false,
}: AdInpaintModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastPaintPointRef = useRef<{ x: number; y: number } | null>(null)
  const dragStateRef = useRef<{
    mode: HandleType
    startX: number
    startY: number
    rect: { left: number; top: number; width: number; height: number }
  } | null>(null)

  const [brushSize, setBrushSize] = useState(52)
  const [prompt, setPrompt] = useState('')
  const [hasMask, setHasMask] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [referenceImageBase64, setReferenceImageBase64] = useState('')
  const [scope, setScope] = useState<GeminiEditScope>('auto')
  const [task, setTask] = useState<SmartEditTask>('auto')
  const [brushPoint, setBrushPoint] = useState<{ x: number; y: number } | null>(null)
  const [maskBounds, setMaskBounds] = useState<{ left: number; top: number; right: number; bottom: number } | null>(null)
  const [manualRect, setManualRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  const resetMask = () => {
    const image = imageRef.current
    const overlay = overlayCanvasRef.current
    const exportCanvas = exportCanvasRef.current
    if (!image || !overlay || !exportCanvas || !image.complete || !image.naturalWidth || !image.naturalHeight) {
      return
    }

    const displayWidth = Math.max(1, Math.round(image.clientWidth))
    const displayHeight = Math.max(1, Math.round(image.clientHeight))
    overlay.width = displayWidth
    overlay.height = displayHeight
    overlay.style.width = `${displayWidth}px`
    overlay.style.height = `${displayHeight}px`

    const overlayContext = overlay.getContext('2d')
    if (overlayContext) {
      overlayContext.clearRect(0, 0, overlay.width, overlay.height)
    }

    exportCanvas.width = image.naturalWidth
    exportCanvas.height = image.naturalHeight
    const exportContext = exportCanvas.getContext('2d')
    if (exportContext) {
      exportContext.globalCompositeOperation = 'source-over'
      exportContext.clearRect(0, 0, exportCanvas.width, exportCanvas.height)
      exportContext.fillStyle = '#000000'
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    }

    setHasMask(false)
    setMaskBounds(null)
    setManualRect(null)
    lastPaintPointRef.current = null
  }

  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => resetMask()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setPrompt('')
    setHasMask(false)
    setIsDrawing(false)
    setReferenceImageBase64('')
    setScope('auto')
    setTask('auto')
    setBrushPoint(null)
    setMaskBounds(null)
    setManualRect(null)
  }, [isOpen, imageSrc])

  const paintAtPoint = (clientX: number, clientY: number) => {
    const overlay = overlayCanvasRef.current
    const exportCanvas = exportCanvasRef.current
    if (!overlay || !exportCanvas) return

    const rect = overlay.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const x = clientX - rect.left
    const y = clientY - rect.top
    const radius = brushSize / 2
    const previousPoint = lastPaintPointRef.current

    const overlayContext = overlay.getContext('2d')
    if (overlayContext) {
      overlayContext.save()
      overlayContext.globalCompositeOperation = 'source-over'
      overlayContext.strokeStyle = 'rgba(255, 90, 70, 0.34)'
      overlayContext.fillStyle = 'rgba(255, 90, 70, 0.28)'
      overlayContext.lineWidth = brushSize
      overlayContext.lineCap = 'round'
      overlayContext.lineJoin = 'round'

      if (previousPoint) {
        overlayContext.beginPath()
        overlayContext.moveTo(previousPoint.x, previousPoint.y)
        overlayContext.lineTo(x, y)
        overlayContext.stroke()
      } else {
        overlayContext.beginPath()
        overlayContext.arc(x, y, radius, 0, Math.PI * 2)
        overlayContext.fill()
      }
      overlayContext.restore()
    }

    const exportContext = exportCanvas.getContext('2d')
    if (exportContext) {
      const scaleX = exportCanvas.width / rect.width
      const scaleY = exportCanvas.height / rect.height
      exportContext.globalCompositeOperation = 'source-over'
      exportContext.strokeStyle = '#FFFFFF'
      exportContext.fillStyle = '#FFFFFF'
      exportContext.lineWidth = Math.max(1, brushSize * ((scaleX + scaleY) / 2))
      exportContext.lineCap = 'round'
      exportContext.lineJoin = 'round'

      if (previousPoint) {
        exportContext.beginPath()
        exportContext.moveTo(previousPoint.x * scaleX, previousPoint.y * scaleY)
        exportContext.lineTo(x * scaleX, y * scaleY)
        exportContext.stroke()
      } else {
        exportContext.beginPath()
        exportContext.ellipse(x * scaleX, y * scaleY, radius * scaleX, radius * scaleY, 0, 0, Math.PI * 2)
        exportContext.fill()
      }
    }

    const startX = previousPoint ? Math.min(previousPoint.x, x) : x
    const startY = previousPoint ? Math.min(previousPoint.y, y) : y
    const endX = previousPoint ? Math.max(previousPoint.x, x) : x
    const endY = previousPoint ? Math.max(previousPoint.y, y) : y

    setMaskBounds((prev) => ({
      left: prev ? Math.min(prev.left, startX - radius) : startX - radius,
      top: prev ? Math.min(prev.top, startY - radius) : startY - radius,
      right: prev ? Math.max(prev.right, endX + radius) : endX + radius,
      bottom: prev ? Math.max(prev.bottom, endY + radius) : endY + radius,
    }))
    setHasMask(true)
    lastPaintPointRef.current = { x, y }
  }

  const beginDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSubmitting || dragStateRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    setBrushPoint({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    setIsDrawing(true)
    lastPaintPointRef.current = null
    event.currentTarget.setPointerCapture(event.pointerId)
    paintAtPoint(event.clientX, event.clientY)
  }

  const continueDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setBrushPoint({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    if (!isDrawing || isSubmitting || dragStateRef.current) return
    paintAtPoint(event.clientX, event.clientY)
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(false)
    setBrushPoint(null)
    lastPaintPointRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleReferenceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const normalized = await normalizeImageFileForVisionUpload(file)
      setReferenceImageBase64(normalized)
      if (task === 'auto') setTask('hold_product')
      if (scope === 'local') setScope('subject')
    } catch (error) {
      console.error('Reference upload failed', error)
    }
  }

  const previewStats = useMemo<PlannerRegionStats | null>(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas || !maskBounds) return null
    const width = Math.max(1, maskBounds.right - maskBounds.left)
    const height = Math.max(1, maskBounds.bottom - maskBounds.top)
    return {
      left: Math.max(0, maskBounds.left),
      top: Math.max(0, maskBounds.top),
      width,
      height,
      areaRatio: (width * height) / Math.max(1, canvas.width * canvas.height),
      centerX: maskBounds.left + width / 2,
      centerY: maskBounds.top + height / 2,
    }
  }, [maskBounds])

  const inferredPlan = useMemo(() => {
    const canvas = overlayCanvasRef.current
    const effectiveStats = previewStats || (canvas
      ? {
          left: canvas.width * 0.2,
          top: canvas.height * 0.1,
          width: canvas.width * 0.6,
          height: canvas.height * 0.78,
          areaRatio: 0.468,
          centerX: canvas.width * 0.5,
          centerY: canvas.height * 0.49,
        }
      : null)
    if (!effectiveStats) return null
    return buildSmartEditPlan({
      prompt,
      stats: effectiveStats,
      hasReferenceImage: Boolean(referenceImageBase64),
      requestedScope: scope,
      requestedTask: task,
    })
  }, [previewStats, prompt, referenceImageBase64, scope, task])

  const canApplyWithoutMask = Boolean(inferredPlan && inferredPlan.scope !== 'local')

  const computedPreviewRect = useMemo(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas || !previewStats || !inferredPlan) return null
    return computeExpandedRect(previewStats, canvas.width, canvas.height, inferredPlan)
  }, [previewStats, inferredPlan])

  useEffect(() => {
    if (computedPreviewRect) {
      setManualRect(computedPreviewRect)
    }
  }, [computedPreviewRect])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragStateRef.current
      const canvas = overlayCanvasRef.current
      if (!drag || !canvas) return
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      let next = { ...drag.rect }
      if (drag.mode === 'move') {
        next.left += dx
        next.top += dy
      } else if (drag.mode === 'nw') {
        next.left += dx
        next.top += dy
        next.width -= dx
        next.height -= dy
      } else if (drag.mode === 'ne') {
        next.top += dy
        next.width += dx
        next.height -= dy
      } else if (drag.mode === 'sw') {
        next.left += dx
        next.width -= dx
        next.height += dy
      } else if (drag.mode === 'se') {
        next.width += dx
        next.height += dy
      }
      setManualRect(clampRect(next, canvas.width, canvas.height))
    }
    const onUp = () => {
      dragStateRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const startRectDrag = (mode: HandleType, event: React.PointerEvent<HTMLElement>) => {
    if (!manualRect || isSubmitting) return
    event.preventDefault()
    event.stopPropagation()
    dragStateRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      rect: manualRect,
    }
  }

  const handleApply = async () => {
    const exportCanvas = exportCanvasRef.current
    const overlay = overlayCanvasRef.current
    if (!exportCanvas || !overlay || !prompt.trim() || isSubmitting) return
    if (!hasMask && !canApplyWithoutMask) return
    await onApply(prompt.trim(), hasMask ? exportCanvas.toDataURL('image/png') : undefined, {
      referenceImageBase64: referenceImageBase64 || undefined,
      scope,
      task,
      expansionOverride: manualRect ? toNormalizedExpansionRect(manualRect, overlay.width, overlay.height) : undefined,
    })
  }

  const activeRect = manualRect || computedPreviewRect

  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      <div
        className={cn(
          'fixed inset-0 z-[99999]',
          embedded
            ? 'bg-[#FFF8E6]'
            : 'bg-black/70 px-2 py-2 backdrop-blur-[2px] sm:px-3 sm:py-3'
        )}
        onClick={embedded ? undefined : onClose}
      >
        <div
          className={cn(
            'mx-auto flex w-full flex-col overflow-hidden border-[4px] border-black bg-[#FFF8E6]',
            embedded
              ? 'h-[100dvh] max-w-none rounded-none shadow-none'
              : 'h-[100dvh] max-w-[1700px] rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:h-[calc(100dvh-24px)] sm:rounded-[28px]'
          )}
          onClick={embedded ? undefined : (event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b-[4px] border-black bg-[#FFD93D] px-4 py-3 sm:px-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/70">Inpaint</p>
              <h2 className="text-lg font-black uppercase text-black sm:text-2xl">Inpaint Editor</h2>
            </div>
            <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-black bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" aria-label="Close editor">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="relative min-h-0 bg-[radial-gradient(circle_at_top,#f4ecd2_0%,#e7dcc0_65%,#dacda9_100%)] p-2.5 sm:p-4 lg:p-5">
              <div className="flex h-full min-h-0 w-full items-center justify-center overflow-auto rounded-[24px] border-[3px] border-black/10 bg-[#efe4c3]/40 p-3">
                <div className={cn('relative inline-flex max-h-full max-w-full items-center justify-center rounded-[24px] transition-transform', isDrawing && 'scale-[1.01]')}>
                  <Image ref={imageRef} src={imageSrc} alt="Ad edit target" width={1400} height={1800} unoptimized className="block h-auto max-h-[50dvh] w-auto max-w-full rounded-xl border-[3px] border-black object-contain bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] sm:max-h-[58dvh] lg:max-h-[calc(100dvh-150px)]" onLoad={resetMask} />
                  <canvas ref={overlayCanvasRef} className={cn('absolute inset-0 rounded-xl', isSubmitting ? 'cursor-not-allowed' : 'cursor-crosshair')} onPointerDown={beginDrawing} onPointerMove={continueDrawing} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} />
                {brushPoint && !isSubmitting && <div className="pointer-events-none absolute rounded-full border border-black/45 bg-[#FF4D4D]/5 shadow-[0_0_0_2px_rgba(255,217,61,0.12)]" style={{ width: brushSize, height: brushSize, left: brushPoint.x - brushSize / 2, top: brushPoint.y - brushSize / 2 }} />}
                {hasMask && <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-[#FF4D4D]/16" />}
                {isSubmitting && inferredPlan && (
                  <div className="absolute inset-0 flex items-end rounded-xl bg-black/22 p-4">
                    <div className="w-full rounded-2xl border-[3px] border-black bg-white/95 p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] backdrop-blur">
                      <div className="flex items-center gap-3 text-sm font-black uppercase">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-[#FF4D4D]" />
                        AI inferred: {inferredPlan ? getTaskLabel(inferredPlan.task) : 'Edit'} / {inferredPlan?.scope.replace('_', ' ')} / {inferredPlan?.model}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-black/70">{inferredPlan?.creativeDirection}</p>
                    </div>
                  </div>
                )}
                  <canvas ref={exportCanvasRef} className="hidden" />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-t-[4px] border-black bg-white lg:border-l-[4px] lg:border-t-0">
              <div className="space-y-5 overflow-y-auto p-3 sm:p-5">
                <div className="rounded-2xl border-[3px] border-black bg-[linear-gradient(135deg,#fff3bf_0%,#ffe36b_100%)] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 text-sm font-black uppercase"><Sparkles className="h-4 w-4" />What Do You Want To Do?</div>
                  <p className="mt-2 text-xs font-semibold text-black/70">Pick an action. The AI will adapt scope, expansion, composition, and camera reasoning automatically.</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SMART_EDIT_TASK_OPTIONS.map((option) => {
                    const Icon = TASK_ICONS[option.value]
                    return (
                      <button key={option.value} type="button" onClick={() => setTask(option.value)} className={cn('rounded-2xl border-[2px] border-black px-3 py-3 text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all', task === option.value ? 'bg-black text-white -translate-y-0.5' : 'bg-[#FFFDF5] hover:bg-white')}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase"><Icon className="h-4 w-4" />{option.label}</div>
                        <p className={cn('mt-1 text-[11px] font-semibold leading-5', task === option.value ? 'text-white/80' : 'text-black/65')}>{option.hint}</p>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-2xl border-[3px] border-black bg-[#E6F5FF] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase"><SunMedium className="h-4 w-4" />Smart Presets</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SMART_EDIT_PRESETS.map((preset) => (
                      <button key={preset.label} type="button" onClick={() => { setTask(preset.task); setPrompt(preset.prompt) }} className="rounded-2xl border-[2px] border-black bg-white px-3 py-3 text-left text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border-[3px] border-black bg-[#F5F0FF] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase"><Move className="h-4 w-4" />Scope Control</div>
                  <div className="grid gap-2">
                    {SCOPE_OPTIONS.map((option) => {
                      const Icon = option.icon
                      return (
                        <button key={option.value} type="button" onClick={() => setScope(option.value)} className={cn('rounded-2xl border-[2px] border-black px-3 py-3 text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all', scope === option.value ? 'bg-black text-white -translate-y-0.5' : 'bg-white hover:bg-[#FFFDF5]')}>
                          <div className="flex items-center gap-2 text-xs font-black uppercase"><Icon className="h-4 w-4" />{option.label}</div>
                          <p className={cn('mt-1 text-[11px] font-semibold leading-5', scope === option.value ? 'text-white/80' : 'text-black/65')}>{option.hint}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {inferredPlan && (
                  <div className="rounded-2xl border-[3px] border-black bg-[#ECF8D0] p-4">
                    <div className="flex items-center gap-2 text-sm font-black uppercase"><Sparkles className="h-4 w-4" />AI Inference</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase">
                      <span className="rounded-full border-[2px] border-black bg-white px-3 py-1">{getTaskLabel(inferredPlan.task)}</span>
                      <span className="rounded-full border-[2px] border-black bg-white px-3 py-1">{inferredPlan.scope.replace('_', ' ')}</span>
                      <span className="rounded-full border-[2px] border-black bg-white px-3 py-1">{inferredPlan.target.replace('_', ' ')}</span>
                      <span className="rounded-full border-[2px] border-black bg-[#FFD93D] px-3 py-1">{inferredPlan.model}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-black/75">{inferredPlan.creativeDirection}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-black/55">{inferredPlan.modelReason}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-black/55">AI scope follows your marker strokes and prompt automatically.</p>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-black/70"><span>Brush Size</span><span>{brushSize}px</span></div>
                  <input type="range" min="16" max="180" step="2" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="w-full accent-black" />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-black/70">Reference Image</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed border-black bg-[#FFFDF5] px-4 py-4 text-sm font-black uppercase text-black">
                    <ImagePlus className="h-4 w-4" />
                    {referenceImageBase64 ? 'Replace Reference Image' : 'Upload Product / Reference'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
                  </label>
                  {referenceImageBase64 && <div className="mt-3 overflow-hidden rounded-2xl border-[3px] border-black bg-white"><Image src={referenceImageBase64} alt="Reference" width={640} height={320} unoptimized className="h-40 w-full object-contain bg-[#FFFDF5]" /></div>}
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-black/70">Edit Prompt</label>
                  <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe the creative change naturally. Example: make him hold this product and shift to a stronger camera angle." rows={6} className="w-full rounded-2xl border-[3px] border-black bg-[#FFFDF5] px-4 py-3 text-sm font-semibold text-black outline-none placeholder:text-black/35" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {PROMPT_IDEAS.map((idea) => (
                    <button key={idea.text} type="button" onClick={() => { setPrompt(idea.text); setTask(idea.task) }} className="rounded-full border-[2px] border-black bg-white px-3 py-2 text-[11px] font-black leading-tight text-left shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {idea.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 mt-auto border-t-[4px] border-black bg-[#FFF8E6] p-3 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-black/65">
                  <span>{!hasMask ? (canApplyWithoutMask && inferredPlan ? `Ready without mask: ${getTaskLabel(inferredPlan.task)} / ${inferredPlan.scope.replace('_', ' ')}` : 'Paint an anchor area for local edits, or use pose/scene edits without a mask.') : inferredPlan ? `Ready: ${getTaskLabel(inferredPlan.task)} / ${inferredPlan.scope.replace('_', ' ')}` : 'Selection ready'}</span>
                  <button type="button" onClick={resetMask} disabled={isSubmitting} className="inline-flex items-center gap-1 rounded-lg border-[2px] border-black bg-white px-3 py-1.5 text-[11px] font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"><RotateCcw className="h-3.5 w-3.5" />Clear</button>
                </div>
                <button type="button" onClick={handleApply} disabled={(!hasMask && !canApplyWithoutMask) || !prompt.trim() || isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#B4F056] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/45 disabled:shadow-none">
                  <Wand2 className="h-4 w-4" />
                  {isSubmitting && inferredPlan ? `Applying ${getTaskLabel(inferredPlan.task)}...` : 'Apply Inpaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalModal>
  )
}

