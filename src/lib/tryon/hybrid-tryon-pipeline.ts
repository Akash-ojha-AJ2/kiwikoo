/**
 * HYBRID TRY-ON PIPELINE (Nano Banana Pro Architecture)
 *
 * MAIN ORCHESTRATOR
 *
 * Coordinates:
 * 1. Pre-Analysis (User & Garment Data)
 * 2. Scene Intelligence (GPT-4o mini)
 * 3. Anchor Zone Validation (Deterministic)
 * 4. Nano Banana Pro Rendering (Gemini 3 Pro)
 */

import 'server-only'
import { saveUpload } from '@/lib/storage'
import {
  createGarmentIfNotExists,
  getGarmentByHash,
  hashImageForGarment,
} from '@/lib/garments'
import sharp from 'sharp'
import { analyzeGarmentForensic, type GarmentAnalysis } from './face-analyzer'
import { extractGarmentWithFidelity } from './garment-extractor'
import { detectFaceCoordinates, type FaceCoordinates } from './face-coordinates'
import { compositeFacePixels, extractFacePixels, type FaceBox } from './face-pixel-copy'
import { runIntelligentPreAnalysis } from './intelligence/intelligent-pipeline'
import { runIntelligentRAG } from './intelligent-rag-system'
import { getWebResearchContext } from './web-research'
import { assessIdentityAndComposition } from './identity-composition-check'

import { generateWithNanoBananaPro } from './nano-banana-pro-renderer'

const GARMENT_EXTRACT_MODEL = 'gemini-2.5-flash-image' as const
const ENABLE_DETERMINISTIC_FACE_LOCK = process.env.TRYON_ENABLE_DETERMINISTIC_FACE_LOCK === 'true'
const ENABLE_INTELLIGENT_PREANALYSIS =
  process.env.TRYON_ENABLE_INTELLIGENT_PREANALYSIS === 'true' ||
  process.env.NODE_ENV !== 'production'
const FACE_LOCK_DRIFT_THRESHOLD = 22
const FACE_COMPOSITE_BLOCKED_PRESETS = new Set([
  'studio_crimson_noir',
  'golden_hour_bedroom',
  'urban_gas_station_night',
  'street_mcdonalds_bmw_night',
  'outdoor_kerala_theyyam_gtr',
  'editorial_night_garden_flash',
  'editorial_newspaper_set',
  'editorial_court_geometric_sun',
  'editorial_dark_study_set',
  'studio_green_red_gel_editorial',
  'studio_red_seamless_profile',
  'street_subway_fisheye',
  'street_elevator_mirror_chic',
  'studio_window_blind_portrait',
])

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface HybridTryOnInput {
  userId?: string
  personImageBase64: string
  clothingImageBase64: string
  aspectRatio?: '1:1' | '4:5' | '3:4' | '9:16'
  preset?: {
    id?: string
    background_name?: string
    lighting_name?: string
  }
  userRequest?: string
  productId?: string | null
  inputPose?: 'standing' | 'sitting' | 'leaning'
  inputFraming?: 'close' | 'mid' | 'full'
  strictSwap?: boolean
  polishNotes?: string
  characterReferenceBase64s?: { base64: string; label: string }[]
}

export interface HybridTryOnResult {
  success: boolean
  image: string
  status: string
  warnings: string[]
  debug: {
    stages: any[]
    totalTimeMs: number
    faceOverwritten: boolean
    intelligence?: {
      preAnalysisEnabled: boolean
      ragContextChars?: number
      webResearchChars?: number
      webResearchMode?: string
      webResearchQuery?: string
      webResearchCacheHit?: boolean
      webResearchSourceCount?: number
    }
    sceneIntelligence?: any
    promptUsed?: string
    rendererDebug?: any
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Garment Resolution (Legacy kept for compatibility)
// ═══════════════════════════════════════════════════════════════

function stripDataUrl(base64: string): string {
  return (base64 || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
}

function isWeakColorLabel(label: string): boolean {
  const v = (label || '').trim().toLowerCase()
  return !v || v === 'unknown' || v === 'neutral' || v === 'mixed' || v === 'multicolor'
}

function rgbToColorName(r: number, g: number, b: number): string {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const lightness = (max + min) / 2

  let hue = 0
  if (delta > 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6
    else if (max === gn) hue = (bn - rn) / delta + 2
    else hue = (rn - gn) / delta + 4
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
  }

  const saturation = max === 0 ? 0 : delta / max
  if (lightness < 0.12) return 'black'
  if (lightness > 0.9 && saturation < 0.14) return 'white'
  if (saturation < 0.14) return lightness < 0.5 ? 'charcoal gray' : 'light gray'

  if (hue >= 20 && hue < 45) return 'mustard yellow'
  if (hue >= 45 && hue < 68) return 'yellow'
  if (hue >= 68 && hue < 95) return 'olive green'
  if (hue >= 95 && hue < 160) return 'green'
  if (hue >= 160 && hue < 195) return 'teal'
  if (hue >= 195 && hue < 255) return 'blue'
  if (hue >= 255 && hue < 290) return 'purple'
  if (hue >= 290 && hue < 335) return 'magenta'
  return 'red'
}

async function estimateDominantGarmentColor(garmentImageBase64: string): Promise<string | null> {
  try {
    const clean = stripDataUrl(garmentImageBase64)
    const buffer = Buffer.from(clean, 'base64')
    const { data, info } = await sharp(buffer)
      .resize(48, 48, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    let rSum = 0
    let gSum = 0
    let bSum = 0
    let wSum = 0
    for (let i = 0; i < data.length; i += info.channels) {
      const a = data[i + 3] / 255
      if (a < 0.05) continue
      const weight = a
      rSum += data[i] * weight
      gSum += data[i + 1] * weight
      bSum += data[i + 2] * weight
      wSum += weight
    }

    if (wSum < 1) return null
    const r = Math.round(rSum / wSum)
    const g = Math.round(gSum / wSum)
    const b = Math.round(bSum / wSum)
    return rgbToColorName(r, g, b)
  } catch {
    return null
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:image/png;base64,${buffer.toString('base64')}`
}

function normalizedFaceToBox(face: FaceCoordinates, width: number, height: number): FaceBox {
  const x = Math.max(0, Math.floor((face.xmin / 1000) * width))
  const y = Math.max(0, Math.floor((face.ymin / 1000) * height))
  const right = Math.min(width, Math.ceil((face.xmax / 1000) * width))
  const bottom = Math.min(height, Math.ceil((face.ymax / 1000) * height))

  return {
    x,
    y,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
  }
}

function mapSourceBoxToTarget(source: FaceBox, sourceW: number, sourceH: number, targetW: number, targetH: number): FaceBox {
  const x = Math.max(0, Math.floor((source.x / Math.max(1, sourceW)) * targetW))
  const y = Math.max(0, Math.floor((source.y / Math.max(1, sourceH)) * targetH))
  const width = Math.max(1, Math.floor((source.width / Math.max(1, sourceW)) * targetW))
  const height = Math.max(1, Math.floor((source.height / Math.max(1, sourceH)) * targetH))
  return { x, y, width, height }
}

function isPlausibleTargetFace(
  sourceBox: FaceBox,
  targetBox: FaceBox,
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number
): boolean {
  const sourceAreaRatio = (sourceBox.width * sourceBox.height) / Math.max(1, sourceW * sourceH)
  const targetAreaRatio = (targetBox.width * targetBox.height) / Math.max(1, targetW * targetH)
  const sourceWidthRatio = sourceBox.width / Math.max(1, sourceW)
  const targetWidthRatio = targetBox.width / Math.max(1, targetW)
  const sourceHeightRatio = sourceBox.height / Math.max(1, sourceH)
  const targetHeightRatio = targetBox.height / Math.max(1, targetH)

  // Reject tiny detections (common when model invents a small face thumbnail in corner).
  if (targetAreaRatio < 0.015 || targetWidthRatio < 0.08 || targetHeightRatio < 0.08) {
    return false
  }

  // Reject extreme scale mismatch between source and target face size.
  const widthScale = targetWidthRatio / Math.max(0.0001, sourceWidthRatio)
  const heightScale = targetHeightRatio / Math.max(0.0001, sourceHeightRatio)
  const areaScale = targetAreaRatio / Math.max(0.0001, sourceAreaRatio)
  if (widthScale < 0.35 || widthScale > 2.8) return false
  if (heightScale < 0.35 || heightScale > 2.8) return false
  if (areaScale < 0.15 || areaScale > 6.5) return false

  return true
}

async function applyDeterministicFaceLock(
  personImageBase64: string,
  generatedBase64: string,
  detectedFaces?: {
    sourceFace?: FaceCoordinates | null
    targetFace?: FaceCoordinates | null
  }
): Promise<{
  image: string
  applied: boolean
  reason?: string
}> {
  try {
    const originalBuffer = Buffer.from(stripDataUrl(personImageBase64), 'base64')
    const generatedBuffer = Buffer.from(stripDataUrl(generatedBase64), 'base64')

    const [origMeta, genMeta] = await Promise.all([
      sharp(originalBuffer).metadata(),
      sharp(generatedBuffer).metadata(),
    ])

    if (!origMeta.width || !origMeta.height || !genMeta.width || !genMeta.height) {
      return { image: generatedBase64, applied: false, reason: 'metadata_unavailable' }
    }

    const sourceFace =
      detectedFaces?.sourceFace !== undefined
        ? detectedFaces.sourceFace
        : await detectFaceCoordinates(personImageBase64, { allowHeuristicFallback: true })

    // Distinguish "never attempted" (undefined) from "attempted and failed" (null).
    // When the renderer already detected null, do NOT re-detect: a second blind attempt
    // on a low-confidence generated image is exactly what causes the ghost-face stamp
    // at wrong coordinates (e.g. top-left). Only re-detect when no attempt was made yet.
    const targetFaceWasProvided = detectedFaces !== undefined && 'targetFace' in detectedFaces
    const targetFace = targetFaceWasProvided
      ? detectedFaces!.targetFace ?? null
      : await detectFaceCoordinates(generatedBase64)

    // Never paste when we don't know where the face is in the generated image.
    if (!targetFace) {
      return { image: generatedBase64, applied: false, reason: 'target_face_not_detected' }
    }

    if (!sourceFace) {
      return { image: generatedBase64, applied: false, reason: 'source_face_not_detected' }
    }

    // Reject low-confidence target detections — these are the source of ghost-face stamps.
    // Heuristic fallbacks have confidence=0.25; partial-parse results often land below 0.5.
    if (targetFace.confidence < 0.5) {
      return { image: generatedBase64, applied: false, reason: `target_face_low_confidence:${targetFace.confidence.toFixed(2)}` }
    }

    const sourceBox = normalizedFaceToBox(sourceFace, origMeta.width, origMeta.height)

    const targetBox = normalizedFaceToBox(targetFace, genMeta.width, genMeta.height)
    if (!isPlausibleTargetFace(sourceBox, targetBox, origMeta.width, origMeta.height, genMeta.width, genMeta.height)) {
      return { image: generatedBase64, applied: false, reason: 'target_face_implausible' }
    }

    const faceData = await extractFacePixels(originalBuffer, sourceBox)
    if (!faceData) {
      return { image: generatedBase64, applied: false, reason: 'source_face_extract_failed' }
    }

    const composite = await compositeFacePixels(generatedBuffer, faceData, targetBox, true)
    if (!composite.success) {
      return { image: generatedBase64, applied: false, reason: composite.error || 'face_composite_failed' }
    }

    return {
      image: `data:image/png;base64,${composite.outputBuffer.toString('base64')}`,
      applied: composite.faceSourcedFromOriginal,
    }
  } catch (error) {
    return {
      image: generatedBase64,
      applied: false,
      reason: error instanceof Error ? error.message : 'face_lock_exception',
    }
  }
}

async function extractGarmentWithFlashGuard(
  clothingImageBase64: string,
  garmentAnalysis?: GarmentAnalysis
): Promise<string> {
  // Hard-locked: garment extraction always uses Gemini 2.5 Flash Image.
  const extraction = await extractGarmentWithFidelity({
    clothingImageBase64,
    garmentAnalysis,
    model: GARMENT_EXTRACT_MODEL,
  })
  return extraction.image
}

async function resolveGarmentAssetLocal(params: {
  clothingImageBase64: string
  productId?: string | null
}): Promise<{
  cleanGarmentBase64: string
  garmentDescription: string
  garmentIdentityLock: string
}> {
  const rawBase64 = stripDataUrl(params.clothingImageBase64)
  const garmentHash = hashImageForGarment(rawBase64)

  // Always run garment analysis (needed for description even if image is cached)
  if (isDev) console.log('👕 Analyzing garment reference image...')
  let garmentAnalysis: GarmentAnalysis | null = null
  let garmentDescription = ''
  let garmentIdentityLock = ''
  try {
    garmentAnalysis = await analyzeGarmentForensic(params.clothingImageBase64)
    const dominantColor = await estimateDominantGarmentColor(params.clothingImageBase64)
    // Trust sampled dominant color from the actual garment image for color fidelity.
    // GPT color labels can be semantically useful but are less reliable for exact hue.
    const sampledColor = (dominantColor || '').trim()
    const analyzedColor = (garmentAnalysis.primaryColor || '').trim()
    const primaryColor = sampledColor || analyzedColor
    // Build a concise description from the analysis
    const parts: string[] = []
    if (primaryColor) parts.push(primaryColor)
    if (garmentAnalysis.garmentType) parts.push(garmentAnalysis.garmentType)
    if (garmentAnalysis.necklineType) parts.push(`with ${garmentAnalysis.necklineType} neckline`)
    if (garmentAnalysis.patternType && garmentAnalysis.patternType !== 'solid') parts.push(`${garmentAnalysis.patternType} pattern`)
    if (garmentAnalysis.fabricType) parts.push(`in ${garmentAnalysis.fabricType}`)
    garmentDescription = parts.join(' ') || 'garment from reference image'
    if (sampledColor && analyzedColor && sampledColor.toLowerCase() !== analyzedColor.toLowerCase()) {
      if (isDev) console.log(`   Color fidelity: sampled="${sampledColor}", analyzed="${analyzedColor}" (using sampled)`)
    }
    garmentIdentityLock = buildGarmentIdentityLock({
      ...garmentAnalysis,
      primaryColor,
    })
    if (isDev) console.log(`   Description: "${garmentDescription}"`)
    if (isDev && garmentIdentityLock) console.log(`   Garment lock: "${garmentIdentityLock}"`)
  } catch (analysisErr) {
    console.warn('⚠️ Garment analysis failed, using generic description:', analysisErr)
    garmentDescription = 'garment from reference image'
    garmentIdentityLock = ''
  }

  // Check if we already have a clean extracted garment cached
  const existing = await getGarmentByHash(garmentHash)
  if (existing) {
    if (isDev) console.log('👕 Using cached clean garment from DB')
    return {
      cleanGarmentBase64: await fetchImageAsBase64(existing.clean_garment_image_url),
      garmentDescription,
      garmentIdentityLock,
    }
  }

  // Extract clean garment using Gemini 2.5 Flash Image (removes person, keeps garment)
  if (isDev) console.log('👕 Extracting clean garment with Gemini 2.5 Flash Image...')
  const extractedGarmentBase64 = await extractGarmentWithFlashGuard(
    params.clothingImageBase64,
    garmentAnalysis ?? undefined
  )
  if (isDev) console.log('👕 Clean garment extracted successfully')

  // Save to storage and DB (for future cache hits)
  const cleanPath = `garments/${garmentHash}.png`
  const sourcePath = `garments/source/${garmentHash}.jpg`
  const [cleanUrl, sourceUrl] = await Promise.all([
    saveUpload(extractedGarmentBase64, cleanPath, 'garments', 'image/png'),
    saveUpload(params.clothingImageBase64, sourcePath, 'garments', 'image/jpeg'),
  ])

  await createGarmentIfNotExists({
    product_id: params.productId ?? null,
    image_hash: garmentHash,
    clean_garment_image_url: cleanUrl,
    source_image_url: sourceUrl,
    garment_metadata: garmentAnalysis as unknown as Record<string, unknown>,
    verified: false,
  })

  return { cleanGarmentBase64: extractedGarmentBase64, garmentDescription, garmentIdentityLock }
}

function buildGarmentIdentityLock(analysis: GarmentAnalysis): string {
  const parts: string[] = []

  if (analysis.garmentType) parts.push(`same ${analysis.garmentType}`)
  if (analysis.primaryColor) parts.push(`same ${analysis.primaryColor} color`)
  if (analysis.colorDetails && analysis.colorDetails !== 'solid throughout') parts.push(analysis.colorDetails)
  if (analysis.necklineType) parts.push(`${analysis.necklineType} neckline`)
  if (analysis.sleeveType) parts.push(`${analysis.sleeveType} sleeves`)
  if (analysis.fitType) parts.push(`${analysis.fitType} fit`)
  if (analysis.lengthStyle) parts.push(`${analysis.lengthStyle} length`)
  if (analysis.fabricType || analysis.fabricTexture) {
    parts.push([analysis.fabricTexture, analysis.fabricType].filter(Boolean).join(' '))
  }
  if (analysis.patternType && analysis.patternType !== 'solid') {
    parts.push(`${analysis.patternType} pattern`)
  }
  if (analysis.patternDescription && analysis.patternDescription !== 'no pattern') {
    parts.push(analysis.patternDescription)
  }
  if (analysis.designElements?.length) {
    parts.push(`details: ${analysis.designElements.slice(0, 4).join(', ')}`)
  }

  return parts.join('; ')
}

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE EXECUTION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// MAIN PIPELINE EXECUTION (SIMPLIFIED FOR STRICT FACE AUTHORITY)
// ═══════════════════════════════════════════════════════════════

const isDev = process.env.NODE_ENV !== 'production'

export async function runHybridTryOnPipeline(
  input: HybridTryOnInput
): Promise<HybridTryOnResult> {
  if (isDev) console.log('🚀 STARTED: Hybrid Try-On Pipeline (Strict Face Authority)')
  const startTime = Date.now()

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Garment Resolution (Gemini 2.5 Flash Image)
  //
  // - Analyzes clothing reference (GPT-4o mini → description)
  // - If person detected in reference → Flash extracts clean garment
  // - Returns: clean garment image + text description
  // ═══════════════════════════════════════════════════════════════
  const { cleanGarmentBase64, garmentDescription, garmentIdentityLock } = await resolveGarmentAssetLocal({
    clothingImageBase64: input.clothingImageBase64,
    productId: input.productId,
  })

  if (isDev) console.log(`👕 Garment ready: "${garmentDescription}"`)

  let intelligenceContext: string | undefined
  let webResearchContext: string | undefined
  let webResearchMode: string | undefined
  let webResearchQuery: string | undefined
  let webResearchCacheHit: boolean | undefined
  let webResearchSourceCount: number | undefined
  let preAnalysisEnabled = false
  if (!input.strictSwap && ENABLE_INTELLIGENT_PREANALYSIS) {
    try {
    const preAnalysis = await runIntelligentPreAnalysis(
      input.personImageBase64,
      cleanGarmentBase64
    )
    preAnalysisEnabled = true
    const [ragResult, webResearchResult] = await Promise.all([
      runIntelligentRAG({
        userAnalysis: preAnalysis.userAnalysis,
        garmentClassification: preAnalysis.garmentClassification,
      }),
      getWebResearchContext({
        userId: input.userId,
        userRequest: input.userRequest,
        presetId: input.preset?.id,
        garmentDescription,
      }),
    ])
    intelligenceContext = ragResult.combinedContext || undefined
    webResearchContext = webResearchResult.context || undefined
    webResearchMode = webResearchResult.profile.mode
    webResearchQuery = webResearchResult.query
    webResearchCacheHit = webResearchResult.cacheHit
    webResearchSourceCount = webResearchResult.sourceCount
  } catch (intelligenceError) {
    console.warn('⚠️ Intelligent pre-analysis/RAG unavailable, continuing with base pipeline:', intelligenceError)
  }
  }

  // STEP 2: Nano Banana Pro Rendering
  // - Final image model is hard-locked to gemini-3-pro-image-preview

  const renderResult = await generateWithNanoBananaPro({
    personImageBase64: input.personImageBase64,
    garmentImageBase64: cleanGarmentBase64,
    garmentDescription,
    garmentIdentityLock,
    aspectRatio: input.aspectRatio,
    presetId: input.preset?.id,
    // Pass the FULL scene description (not just the internal ID)
    userRequest: input.userRequest,
    presetDescription: input.preset?.background_name || input.preset?.id,
    lightingDescription: input.preset?.lighting_name,
    researchContext: intelligenceContext,
    webResearchContext,
    userId: input.userId,  // For character reference resolution
    strictSwap: input.strictSwap,
    polishNotes: input.polishNotes,
    characterReferenceBase64s: input.characterReferenceBase64s,
  })

  if (!renderResult.success) {
    throw new Error('Nano Banana Pro rendering failed: ' + (renderResult.debug?.error || 'Unknown error'))
  }

  let finalImage = renderResult.image
  let faceOverwritten = false
  let faceLockReason: string | null = 'disabled'
  const warnings: string[] = []
  const faceConsistencyGateFailed = Boolean(renderResult.debug?.faceConsistencyGate?.failed)

  const microDriftPercent = Number(renderResult.debug?.microDrift?.driftPercent)
  const shouldFaceLockForDrift =
    Number.isFinite(microDriftPercent) && microDriftPercent >= FACE_LOCK_DRIFT_THRESHOLD
  const shouldFaceLockForUnknownFace =
    renderResult.debug?.driftAssessment?.reason === 'generated_face_unknown'
  const shouldApplyDeterministicFaceLock = shouldFaceLockForDrift || shouldFaceLockForUnknownFace
  const presetId = (input.preset?.id || '').trim().toLowerCase()
  const isFaceCompositeBlockedPreset = FACE_COMPOSITE_BLOCKED_PRESETS.has(presetId)
  const debugSourceFace = renderResult.debug?.personFace as FaceCoordinates | null | undefined
  const debugTargetFace = renderResult.debug?.finalDetectedFace as FaceCoordinates | null | undefined

  // Face pixel compositing (deterministic face lock) is disabled by default because
  // it causes ghost-face artifacts: pasting source-lit face pixels onto a scene-lit
  // generated image creates a visible double-face / sticker effect.
  // The Gemini model handles identity through the face crop reference + forensic prompt.
  // Only enable via TRYON_ENABLE_DETERMINISTIC_FACE_LOCK=true if you need it.
  if (!ENABLE_DETERMINISTIC_FACE_LOCK) {
    faceLockReason = 'deterministic_face_lock_disabled'
    if (faceConsistencyGateFailed) {
      warnings.push('Face consistency gate flagged drift but deterministic face lock is disabled. Returning AI-generated image as-is.')
    }
  } else if (isFaceCompositeBlockedPreset) {
    faceLockReason = `blocked_for_preset:${presetId}`
    if (faceConsistencyGateFailed) {
      warnings.push(`Face consistency gate failed but face composite is blocked for preset "${presetId}". Returning AI-generated image as-is.`)
    }
  } else if (faceConsistencyGateFailed) {
    const faceLock = await applyDeterministicFaceLock(
      input.personImageBase64,
      renderResult.image,
      { sourceFace: debugSourceFace, targetFace: debugTargetFace }
    )
    finalImage = faceLock.image
    faceOverwritten = faceLock.applied
    faceLockReason = `emergency_gate:${faceLock.reason || 'applied'}`
    if (!faceLock.applied) {
      warnings.push(
        `Face consistency gate failed and emergency face lock could not be applied: ${faceLock.reason || 'unknown'}`
      )
      faceLockReason = `emergency_gate_unresolved:${faceLock.reason || 'unknown'}`
    }
    if (faceLock.applied) {
      warnings.push('Emergency identity lock applied after strict face consistency gate failure.')
    }
  } else if (shouldApplyDeterministicFaceLock) {
    const faceLock = await applyDeterministicFaceLock(
      input.personImageBase64,
      renderResult.image,
      { sourceFace: debugSourceFace, targetFace: debugTargetFace }
    )
    finalImage = faceLock.image
    faceOverwritten = faceLock.applied
    faceLockReason = faceLock.reason || null
    if (!faceLock.applied) {
      warnings.push(`Face lock fallback: ${faceLock.reason || 'not applied'}`)
    }
  } else {
    faceLockReason = 'not_needed_low_drift'
  }

  if (faceConsistencyGateFailed && !faceOverwritten) {
    const gateReason = String(renderResult.debug?.faceConsistencyGate?.reason || 'unknown')
    warnings.push(`Strict face consistency gate flagged output (${gateReason}). Running output QA before final decision.`)
  }

  let outputQualityAssessment: Awaited<ReturnType<typeof assessIdentityAndComposition>> | null = null
  try {
    outputQualityAssessment = await assessIdentityAndComposition({
      sourceImageBase64: input.personImageBase64,
      generatedImageBase64: finalImage,
      garmentImageBase64: cleanGarmentBase64,
      presetId: input.preset?.id,
      anchorZone: input.preset?.background_name,
    })

    if (outputQualityAssessment.shouldRetry) {
      const { faceIdentity, bodyConsistency, garmentFidelity, compositionQuality, backgroundIntegrity } = outputQualityAssessment.scores
      warnings.push(
        `Output quality gate flagged mismatch (face=${faceIdentity}, body=${bodyConsistency}, garment=${garmentFidelity}, composition=${compositionQuality}, background=${backgroundIntegrity}).`
      )
      throw new Error(
        `Try-on output rejected by quality gate: face=${faceIdentity}, garment=${garmentFidelity}, body=${bodyConsistency}, composition=${compositionQuality}, background=${backgroundIntegrity}`
      )
    }
  } catch (qualityError) {
    if (outputQualityAssessment?.shouldRetry) {
      throw qualityError
    }
    console.warn('⚠️ Output quality assessment unavailable, continuing with rendered image:', qualityError)
  }

  // 3. Return Result
  return {
    success: true,
    image: finalImage,
    status: 'PASS',
    warnings,
    debug: {
      stages: ['garment_extraction', 'intelligence_pre_analysis', 'strict_renderer'],
      totalTimeMs: Date.now() - startTime,
      faceOverwritten,
      intelligence: {
        preAnalysisEnabled,
        ragContextChars: intelligenceContext?.length || 0,
        webResearchChars: webResearchContext?.length || 0,
        webResearchMode,
        webResearchQuery,
        webResearchCacheHit,
        webResearchSourceCount,
      },
      promptUsed: renderResult.promptUsed,
      rendererDebug: {
        ...renderResult.debug,
        deterministicFaceLock: {
          applied: faceOverwritten,
          reason: faceLockReason,
        },
        outputQualityAssessment,
      }
    }
  }
}
