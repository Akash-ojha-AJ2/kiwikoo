/**
 * NANO BANANA PRO RENDERER (Simplified Pipeline)
 *
 * This is the ONLY renderer in the production pipeline.
 * It orchestrates a minimal 3-stage flow:
 *
 *  STAGE 1 — Scene Intelligence
 *  STAGE 2 — Compact Prompt Builder
 *  STAGE 3 — Nano Banana Pro Rendering (Gemini 3 Pro Image)
 *
 * Intentionally avoids heavy post-processing guardrails.
 */

import 'server-only'
import { generateTryOnDirect, generateTryOnGPT } from '@/lib/nanobanana'
import { resolveCharacterReferences, fetchImageAsBase64 } from '@/lib/tryon/character-resolver'
import { loadIdentityEmbedding, type IdentityEmbedding } from '@/lib/tryon/identity-embedding'
import { buildForensicPrompt } from './forensic-prompt'
import { detectFaceCoordinates, type FaceCoordinates } from './face-coordinates'
import { buildForensicFaceAnchor } from './face-forensics'
import { getStrictSceneConfig } from './scene-intel-adapter'
import { assessSceneRealism, type SceneQualityAssessment } from './scene-quality-check'
import { getAllPresetIds, getPresetById } from './presets/index'
import { extractFaceCrop } from './face-crop'
import { computeMicroFaceDrift, getDriftRetryParams } from './micro-face-drift'
import { getPresetExampleGuidance, getRequestExampleGuidance } from './presets/example-prompts-reference'
import { getPresetStrengthProfile } from './preset-strength-profile'

export type TryOnRenderModel = 'gpt-image-1.5' | 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview' | 'gemini-2.5-flash-image'
export type DirectGeminiRenderModel = Exclude<TryOnRenderModel, 'gpt-image-1.5'>

// Google positions Nano Banana Pro for higher-fidelity, context-heavy image editing,
// which matches clothing-swap try-on better than the speed-first Flash image model.
const DEFAULT_RENDER_MODEL: DirectGeminiRenderModel = 'gemini-3-pro-image-preview'
const ENABLE_QUALITY_RETRY =
  process.env.TRYON_ENABLE_QUALITY_RETRY !== 'false'
const MICRO_DRIFT_RETRY_THRESHOLD = 22
const FINAL_MICRO_DRIFT_MAX_DEFAULT = 30
const FINAL_MICRO_DRIFT_MAX_COMPLEX = 26
const FINAL_MICRO_DRIFT_MAX_ULTRA = 16
const ULTRA_FACE_LOCK_IOU_MIN = 0.68
const ULTRA_FACE_LOCK_CENTER_MAX = 55
const ULTRA_FACE_LOCK_SIZE_DELTA_MAX = 0.14
const ULTRA_FACE_LOCK_PRESETS = new Set([
  'urban_gas_station_night',
  'street_mcdonalds_bmw_night',
  'studio_crimson_noir',
  'golden_hour_bedroom',
  'lifestyle_european_bench',
  'airport_travel_candid',
])
const COMPLEX_BACKGROUND_PRESETS = new Set([
  'urban_gas_station_night',
  'street_mcdonalds_bmw_night',
  'studio_crimson_noir',
  'golden_hour_bedroom',
  'outdoor_kerala_theyyam_gtr',
  'editorial_night_garden_flash',
  'editorial_newspaper_set',
  'editorial_court_geometric_sun',
  'editorial_dark_study_set',
  'studio_green_red_gel_editorial',
  'studio_red_seamless_profile',
])
const NO_SYNTHETIC_BLUR_PRESETS = new Set([
  'urban_gas_station_night',
  'street_mcdonalds_bmw_night',
  'studio_crimson_noir',
  'golden_hour_bedroom',
  'outdoor_kerala_theyyam_gtr',
  'studio_bw_minimalist_portrait',
  'home_cozy_teddy_selfie',
  'travel_scene_lock_realism',
  'street_elevator_mirror_chic',
  'editorial_sky_negative_space',
  'editorial_night_garden_flash',
  'studio_white_brick_bench',
  'editorial_newspaper_set',
  'editorial_court_geometric_sun',
  'studio_window_blind_portrait',
  'editorial_dark_study_set',
  'studio_orange_director_chair',
  'studio_green_red_gel_editorial',
  'studio_red_seamless_profile',
])

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface NanoBananaProInput {
  personImageBase64: string
  garmentImageBase64: string
  aspectRatio?: '1:1' | '4:5' | '3:4' | '9:16'
  garmentDescription?: string
  userRequest?: string
  presetId?: string
  presetDescription?: string
  lightingDescription?: string
  researchContext?: string
  webResearchContext?: string
  userId?: string  // Needed for character reference resolution
  strictSwap?: boolean
  polishNotes?: string
  characterReferenceBase64s?: { base64: string; label: string }[]
  garmentIdentityLock?: string
}

export interface NanoBananaProResult {
  success: boolean
  image: string
  generationTimeMs: number
  promptUsed: string
  debug: any
}

export function getTryOnRenderModel(): TryOnRenderModel {
  const configured = process.env.TRYON_RENDER_MODEL?.trim()
  if (configured === 'gpt-image-1.5' || configured === 'gemini-3-pro-image-preview' || configured === 'gemini-3.1-flash-image-preview' || configured === 'gemini-2.5-flash-image') {
    return configured
  }
  return DEFAULT_RENDER_MODEL
}

export function resolveDirectGeminiRenderModel(preferredModel: TryOnRenderModel): DirectGeminiRenderModel {
  return preferredModel === 'gpt-image-1.5' ? DEFAULT_RENDER_MODEL : preferredModel
}

function shouldFallbackToGemini(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  // Catch GPT Image availability/permission issues — fall back to Gemini gracefully
  return /organization must be verified|must be verified to use the model|verification|403|forbidden|model_not_found|insufficient_quota|billing|rate.?limit|overloaded|capacity/i.test(message)
}

// Cache GPT billing failures so we skip GPT entirely for subsequent variants in the same process
let gptImageDisabledUntil = 0

function isGPTImageTemporarilyDisabled(): boolean {
  return Date.now() < gptImageDisabledUntil
}

function disableGPTImageTemporarily(durationMs = 10 * 60 * 1000): void {
  gptImageDisabledUntil = Date.now() + durationMs
  console.log(`🚫 GPT Image disabled for ${(durationMs / 1000 / 60).toFixed(0)} minutes (billing/quota issue)`)
}

async function renderTryOnImage(
  preferredModel: TryOnRenderModel,
  options: {
    personImageBase64: string
    garmentImageBase64: string
    faceCropBase64?: string
    characterReferenceBase64s?: { base64: string; label: string }[]
    prompt: string
    aspectRatio: string
  }
): Promise<{
  image: string
  model: TryOnRenderModel
  fallbackReason?: string
}> {
  if (preferredModel === 'gpt-image-1.5' && !isGPTImageTemporarilyDisabled()) { // GPT Image path
    try {
      const image = await generateTryOnGPT(options)
      return { image, model: preferredModel }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.warn(`⚠️ GPT Image failed, falling back to Gemini: ${errMsg}`)
      if (/billing|insufficient_quota|hard limit/i.test(errMsg)) {
        disableGPTImageTemporarily()
      }
      if (!shouldFallbackToGemini(error)) throw error
      const fallbackModel = DEFAULT_RENDER_MODEL
      const image = await generateTryOnDirect({
        ...options,
        model: fallbackModel,
      })
      return {
        image,
        model: fallbackModel,
        fallbackReason: errMsg,
      }
    }
  }

  // Direct Gemini path (or GPT temporarily disabled)
  const effectiveModel = resolveDirectGeminiRenderModel(preferredModel)
  const image = await generateTryOnDirect({
    ...options,
    model: effectiveModel,
  })
  return {
    image,
    model: effectiveModel,
    fallbackReason: isGPTImageTemporarilyDisabled() ? 'GPT Image temporarily disabled (billing limit)' : undefined,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateWithNanoBananaPro(
  input: NanoBananaProInput
): Promise<NanoBananaProResult> {
  const startTime = Date.now()
  const isDev = process.env.NODE_ENV !== 'production'
  const preferredRenderModel = getTryOnRenderModel()

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // STAGE 1: Scene Intelligence
    // ═════════════════════════════════════════════════════════════════════════
    if (isDev) console.log('\n━━━ STAGE 1: Scene Intelligence ━━━')

    const presetNames = getAllPresetIds()

    // ── IDENTITY EMBEDDING (Soul ID) ──────────────────────────────────────
    // Load the frozen identity fingerprint if available.
    // Auto-extract if missing, stale (anatomical format), or image count changed.
    let identityEmbedding: IdentityEmbedding | null = null
    if (input.userId) {
      try {
        const { needsReExtraction, extractIdentityEmbedding } = await import('./identity-embedding')

        identityEmbedding = await loadIdentityEmbedding(input.userId)

        // Always check if re-extraction is needed (stale DNA, image count change, or missing)
        if (await needsReExtraction(input.userId)) {
          if (isDev) console.log(identityEmbedding
            ? '   🧬 Soul ID is stale — re-extracting with macro-identifier format...'
            : '   🧬 Soul ID not found — auto-extracting from existing images...')
          identityEmbedding = await extractIdentityEmbedding(input.userId)
          if (identityEmbedding && isDev) {
            console.log(`   🧬 Soul ID extracted! (${identityEmbedding.imageCount} images)`)
          }
        } else if (identityEmbedding && isDev) {
          console.log(`   🧬 Soul ID loaded (${identityEmbedding.imageCount} images, v${identityEmbedding.version})`)
        }
      } catch (err) {
        if (isDev) console.warn('⚠️ Soul ID load/extract failed:', err)
      }
    }

    const forensicFallback = {
      faceAnchor:
        'preserve exact face shape width and fullness, eye geometry, nose bridge and tip, lip contour, jawline, skin texture with visible pores, and eyewear geometry',
      eyesAnchor:
        'almond eye shape, medium inter-eye spacing, dark brown iris color, forward gaze direction, stable eyelid crease and brow geometry',
      characterSummary: 'single subject from Image 1',
      poseSummary: 'inherit pose and head angle from Image 1',
      appearanceSummary: 'preserve stable hairstyle and accessories from Image 1',
      bodyAnchor:
        'preserve original body build, weight, shoulder width, torso mass, and limb proportions exactly as visible in Image 1',
      garmentOnPersonGuidance:
        'garment follows original shoulder slope and torso drape from Image 1 — do not slim or reshape body.',
      perceivedGender: 'neutral' as const,
      antiDriftDirectives: '',
    }

    const [sceneConfig, personFace, forensicAnchor] = await Promise.all([
      withTimeout(
        getStrictSceneConfig({
          userRequest: input.userRequest,
          presetId: input.presetId,
          presetDescription: input.presetDescription,
          personImageBase64: input.personImageBase64,
          availablePresets: presetNames,
        }),
        7000,
        buildSceneFallback(input)
      ),
      detectFaceCoordinates(input.personImageBase64, { allowHeuristicFallback: true }),
      // Always use per-request GPT-4o for forensic anchor (best face quality).
      // Identity DNA is injected separately in the prompt for consistency.
      withTimeout(
        buildForensicFaceAnchor({
          personImageBase64: input.personImageBase64,
          garmentDescription: input.garmentDescription,
        }),
        10000,
        forensicFallback
      ),
    ])

    // ── CHARACTER REFERENCES (face-only, max 2) ──────────────────────────
    // Send face-only reference images for better face consistency.
    // Body shots excluded (they show competing outfits). Garment is Image 2.
    let characterReferenceBase64s: { base64: string; label: string }[] | undefined
    if (input.userId) {
      try {
        const charResult = await resolveCharacterReferences(input.userId, input.presetId)
        if (charResult.available && charResult.references.length > 0) {
          if (isDev) console.log(`   🪞 Character: ${charResult.references.length} references found (complete=${charResult.complete})`)
          const downloaded = await Promise.all(
            charResult.references.map(async (ref) => {
              const base64 = await fetchImageAsBase64(ref.imageUrl)
              return base64 ? { base64, label: ref.label } : null
            })
          )
          characterReferenceBase64s = downloaded.filter(Boolean) as { base64: string; label: string }[]
          if (isDev && characterReferenceBase64s.length > 0) {
            console.log(`   🪞 Sending ${characterReferenceBase64s.length} character refs to Gemini`)
          }
        } else if (isDev) {
          console.log('   🪞 No character references available')
        }
      } catch (charErr) {
        console.warn('⚠️ Character resolver failed, continuing without references:', charErr)
      }
    }

    // Extract face crop AFTER detection so we can use the detected face box for a tight crop.
    // This adds ~50-100ms (sharp only) but produces a much better identity signal.
    const faceCropResult = await withTimeout(
      extractFaceCrop(input.personImageBase64, personFace),
      3000,
      { success: false, faceCropBase64: '' }
    )

    if (isDev) {
      console.log(`   preset=${sceneConfig.preset}`)
      console.log(`   anchorZone="${sceneConfig.anchorZone.substring(0, 80)}"`)
      if (sceneConfig.lightingBlueprint) console.log(`   lightingBlueprint="${sceneConfig.lightingBlueprint.substring(0, 90)}"`)
      if (sceneConfig.presetAvoid) console.log(`   presetAvoid="${sceneConfig.presetAvoid.substring(0, 90)}"`)
      console.log(`   facePolicy=${sceneConfig.facePolicy}`)
    }

    // ═════════════════════════════════════════════════════════════════════════
    // STAGE 2: Compact Prompt
    // ═════════════════════════════════════════════════════════════════════════
    if (isDev) console.log('\n━━━ STAGE 2: Compact Prompt ━━━')

    const resolvedPresetId = sceneConfig.preset || input.presetId
    const isUltraFaceLockPreset = ULTRA_FACE_LOCK_PRESETS.has((resolvedPresetId || '').toLowerCase())
    const isComplexBackgroundPreset = COMPLEX_BACKGROUND_PRESETS.has((resolvedPresetId || '').toLowerCase())


    // Look up the preset's camera/pose guidance
    const resolvedPreset = getPresetById(resolvedPresetId || '')
    const presetCamera = resolvedPreset?.camera

    // Generate a consistent name anchor from user ID for latent space locking
    const nameAnchor = input.userId
      ? `person-${input.userId.substring(0, 8)}`
      : undefined

    const promptInput = {
      garmentDescription: input.garmentDescription,
      preset: sceneConfig.anchorZone,
      lighting: sceneConfig.lightingMode,
      lightingBlueprint: sceneConfig.lightingBlueprint,
      realismGuidance: sceneConfig.realismGuidance, // Scene Intelligence harmonization cues
      garmentOnPersonGuidance: forensicAnchor.garmentOnPersonGuidance,
      faceForensicAnchor: forensicAnchor.faceAnchor,
      eyesAnchor: forensicAnchor.eyesAnchor,
      characterSummary: forensicAnchor.characterSummary,
      poseSummary: forensicAnchor.poseSummary,
      appearanceSummary: forensicAnchor.appearanceSummary,
      bodyAnchor: forensicAnchor.bodyAnchor,
      hasFaceReference: Boolean(faceCropResult.success && faceCropResult.faceCropBase64),
      aspectRatio: input.aspectRatio || '1:1',
      retryMode: false, // Only set true during actual retries, not first pass
      cameraGuidance: presetCamera, // Pass preset camera/pose to the prompt
      identityDNA: identityEmbedding?.identityDNA, // Soul ID — frozen identity paragraph
      useGPTImageFormat: false, // Always use "Image 1/2/3" format — Gemini is the primary engine and GPT fallback understands numbered refs too
      nameAnchor,
      perceivedGender: forensicAnchor.perceivedGender,
      antiDriftDirectives: forensicAnchor.antiDriftDirectives,
    }
    const prompt = buildForensicPrompt(promptInput)

    if (isDev) {
      console.log(`   prompt (${prompt.length} chars):`)
      console.log(`   "${prompt}"`)
    }

    // ═════════════════════════════════════════════════════════════════════════
    // STAGE 3: Nano Banana Pro Rendering
    // ═════════════════════════════════════════════════════════════════════════
    if (isDev) console.log('\n━━━ STAGE 3: Nano Banana Pro ━━━')
    const aspectRatio = input.aspectRatio || '1:1'
    if (isDev) console.log(`   aspectRatio=${aspectRatio}`)

    let activeRenderModel = preferredRenderModel
    let renderFallbackReason: string | null = null
    const renderOptions = {
      personImageBase64: input.personImageBase64,
      garmentImageBase64: input.garmentImageBase64,
      prompt,
      aspectRatio,
      // Secondary identity reference improves eye geometry and face fidelity.
      faceCropBase64: faceCropResult.success ? faceCropResult.faceCropBase64 : undefined,
      characterReferenceBase64s,
    }

    const firstRender = await renderTryOnImage(preferredRenderModel, renderOptions)
    let generatedImage = firstRender.image
    activeRenderModel = firstRender.model
    renderFallbackReason = firstRender.fallbackReason ?? null

    // One-shot retry strategy for face drift: keep base pipeline simple,
    // only escalate when geometry drift is likely.
    let retried = false
    let driftAssessment: ReturnType<typeof assessFaceDrift> = {
      shouldRetry: false,
      reason: 'not_checked',
    }
    let microDrift: Awaited<ReturnType<typeof computeMicroFaceDrift>> | null = null
    let driftRetryParams = { temperatureAdjust: 0, realismBias: 0, emphasis: '' }
    let sceneAssessment: SceneQualityAssessment = buildSceneAssessmentFallback()

    const [generatedFace, generatedSceneAssessment] = await Promise.all([
      detectFaceCoordinates(generatedImage),
      withTimeout(
        assessSceneRealism({
          generatedImageBase64: generatedImage,
          anchorZone: sceneConfig.anchorZone,
          realismGuidance: sceneConfig.realismGuidance,
          expectedLightingBlueprint: sceneConfig.lightingBlueprint,
          expectedPresetAvoid: sceneConfig.presetAvoid,
        }),
        5000,
        buildSceneAssessmentFallback()
      ),
    ])
    driftAssessment = assessFaceDrift(personFace, generatedFace)
    driftAssessment = tightenDriftAssessmentForUltraFaceLock(
      driftAssessment,
      isUltraFaceLockPreset
    )
    sceneAssessment = generatedSceneAssessment
    const firstPassImage = generatedImage
    const firstPassFace = generatedFace
    let finalDetectedFace: FaceCoordinates | null = generatedFace
    const firstPassDriftAssessment = driftAssessment
    const firstPassSceneAssessment = sceneAssessment
    // If a face was detected at all, we should still allow retry logic.
    // Spatial lock quality only controls bbox lock strictness, not whether we retry.
    const hasTrustedSourceFace = Boolean(personFace)
    const microDriftRetryThreshold = isUltraFaceLockPreset
      ? 8
      : isComplexBackgroundPreset
        ? 14
        : MICRO_DRIFT_RETRY_THRESHOLD
    try {
      const refBuffer = base64ToBuffer(input.personImageBase64)
      const genBuffer = base64ToBuffer(generatedImage)
      microDrift = await computeMicroFaceDrift(refBuffer, genBuffer, {
        referenceFace: personFace,
        generatedFace,
      })
      if (
        hasTrustedSourceFace &&
        generatedFace &&
        microDrift.success &&
        microDrift.driftPercent >= microDriftRetryThreshold
      ) {
        driftRetryParams = getDriftRetryParams(microDrift)
      }
    } catch (microErr) {
      console.warn('⚠️ Micro face drift check failed:', microErr)
      microDrift = null
      driftRetryParams = { temperatureAdjust: 0, realismBias: 0, emphasis: '' }
    }
    const firstPassMicroDrift = microDrift

    const firstPassMicroDriftSevere = Boolean(
      firstPassMicroDrift?.success &&
      firstPassMicroDrift.driftPercent >= microDriftRetryThreshold
    )
    const hardFaceFailure = hasTrustedSourceFace && firstPassDriftAssessment.reason === 'generated_face_unknown'
    const geometryRetrySignal = Boolean(
      hasTrustedSourceFace &&
      firstPassFace &&
      firstPassDriftAssessment.shouldRetry &&
      firstPassMicroDriftSevere
    )
    const microOnlyRetrySignal = Boolean(
      hasTrustedSourceFace &&
      firstPassMicroDrift?.success &&
      firstPassMicroDrift.driftPercent >= microDriftRetryThreshold
    )
    const hasRetrySignal = hardFaceFailure || geometryRetrySignal || microOnlyRetrySignal
    const elapsedBeforeRetryMs = Date.now() - startTime
    // Keep production reliable: avoid second full model pass when we're already near timeout.
    const retryBudgetMs = process.env.NODE_ENV === 'production' ? 45_000 : 120_000
    const canRetryInTime = elapsedBeforeRetryMs < retryBudgetMs
    // Only skip the quality retry when InsightFace is actually reachable.
    // Without InsightFace, the retry is the only correction path before Stage 4 Gemini restore.
    // Retries waste 40-60s but are still worthwhile if no face-swap service exists.
    const FACE_SWAP_AVAILABLE = Boolean(process.env.FACE_SWAP_SERVICE_URL?.trim())
    const FACE_RESTORE_ENABLED = process.env.TRYON_DISABLE_FACE_RESTORE !== 'true'
    const skipRetryForFaceRestore = FACE_SWAP_AVAILABLE && !hardFaceFailure

    if (skipRetryForFaceRestore && hasRetrySignal && isDev) {
      console.log('   ⏭️ Skipping Stage 3 retry — face restore (Stage 4) will handle identity correction')
    }

    if (ENABLE_QUALITY_RETRY && hasRetrySignal && canRetryInTime && !skipRetryForFaceRestore) {
      retried = true
      const retryReasons = [
        driftAssessment.shouldRetry ? `face:${driftAssessment.reason}` : null,
        sceneAssessment.shouldRetry ? `scene:${sceneAssessment.reason}` : null,
        driftRetryParams.emphasis ? `micro-face:${driftRetryParams.emphasis}` : null,
      ]
        .filter(Boolean)
        .join(', ')
      console.warn(`   ⚠️ Quality retry triggered (${retryReasons}), retrying with retryMode=true`)
      // SIMPLE RETRY: use the exact same prompt with only retryMode=true.
      // Adding more text on retry was causing WORSE drift (30% → 40%).
      const retryPrompt = buildForensicPrompt({
        ...promptInput,
        retryMode: true,
      })

      const retryRender = await renderTryOnImage(activeRenderModel, {
        ...renderOptions,
        prompt: retryPrompt,
      })
      generatedImage = retryRender.image
      activeRenderModel = retryRender.model
      renderFallbackReason = renderFallbackReason ?? retryRender.fallbackReason ?? null

      const [retryFace, retrySceneAssessment] = await Promise.all([
        detectFaceCoordinates(generatedImage),
        withTimeout(
          assessSceneRealism({
            generatedImageBase64: generatedImage,
            anchorZone: sceneConfig.anchorZone,
            realismGuidance: sceneConfig.realismGuidance,
            expectedLightingBlueprint: sceneConfig.lightingBlueprint,
            expectedPresetAvoid: sceneConfig.presetAvoid,
          }),
          5000,
          buildSceneAssessmentFallback()
        ),
      ])
      driftAssessment = assessFaceDrift(personFace, retryFace)
      driftAssessment = tightenDriftAssessmentForUltraFaceLock(
        driftAssessment,
        isUltraFaceLockPreset
      )
      sceneAssessment = retrySceneAssessment
      let retryMicroDrift: Awaited<ReturnType<typeof computeMicroFaceDrift>> | null = null
      try {
        const refBuffer = base64ToBuffer(input.personImageBase64)
        const retryBuffer = base64ToBuffer(generatedImage)
        retryMicroDrift = await computeMicroFaceDrift(refBuffer, retryBuffer, {
          referenceFace: personFace,
          generatedFace: retryFace,
        })
      } catch (microErr) {
        console.warn('⚠️ Micro face drift re-check failed:', microErr)
        retryMicroDrift = null
      }
      const useRetry = shouldUseRetryCandidate({
        firstFace: firstPassFace,
        firstDriftAssessment: firstPassDriftAssessment,
        firstMicroDrift: firstPassMicroDrift,
        firstSceneAssessment: firstPassSceneAssessment,
        retryFace,
        retryDriftAssessment: driftAssessment,
        retryMicroDrift,
        retrySceneAssessment: sceneAssessment,
      })

      if (!useRetry) {
        generatedImage = firstPassImage
        driftAssessment = firstPassDriftAssessment
        sceneAssessment = firstPassSceneAssessment
        microDrift = firstPassMicroDrift
        finalDetectedFace = firstPassFace
        console.warn('   ↩️ Keeping first pass output (retry did not improve identity).')
      } else {
        microDrift = retryMicroDrift
        finalDetectedFace = retryFace
      }
    } else if (ENABLE_QUALITY_RETRY && hasRetrySignal && !canRetryInTime) {
      console.warn(
        `   ⚠️ Skipping retry to avoid timeout (elapsed=${elapsedBeforeRetryMs}ms, budget=${retryBudgetMs}ms)`
      )
    }

    // ═════════════════════════════════════════════════════════════════════════
    // STAGE 4: Face Identity Restoration
    // Uses a redesigned two-pass approach: sends generated image + original
    // person photo to Gemini with a holistic "fix the face" edit instruction.
    // No mask, no anatomy checklist — just reference-based face correction.
    const ENABLE_FACE_RESTORE =
      process.env.TRYON_DISABLE_FACE_RESTORE !== 'true' // opt-OUT (enabled by default)
    let faceRestoreResult: {
      success: boolean
      accepted?: boolean
      processingTimeMs: number
      error?: string
      method?: 'insightface' | 'gemini'
      identitySimilarityBefore?: number
      identitySimilarityAfter?: number
      skinToneDeltaBefore?: number
      skinToneDeltaAfter?: number
      darkSpotArtifactScoreAfter?: number
    } | null = null

    // Trigger face restore more aggressively — most identity drift lands in the
    // 20-45% range. At threshold=25, Stage 4 catches faces that are recognizably
    // wrong. InsightFace is only used as fallback; Gemini edit pass is primary.
    const faceRestoreDriftThreshold = 25
    const elapsedBeforeRestore = Date.now() - startTime
    const hasTimeBudgetForGemini = elapsedBeforeRestore < 120_000
    const hasTimeBudget = hasTimeBudgetForGemini

    const shouldRestoreFace = Boolean(
      ENABLE_FACE_RESTORE &&
      personFace &&
      finalDetectedFace &&
      microDrift?.success &&
      microDrift.driftPercent >= faceRestoreDriftThreshold &&
      hasTimeBudget &&
      faceCropResult.success &&
      faceCropResult.faceCropBase64
    )

    if (shouldRestoreFace) {
      if (isDev) console.log(`\n   🔧 Face drift ${microDrift!.driftPercent.toFixed(1)}% >= ${faceRestoreDriftThreshold}% → triggering face restoration`)

      try {
        const { restoreFaceIdentity } = await import('./face-restore')
        const restoreResult = await restoreFaceIdentity({
          generatedImageBase64: generatedImage,
          personImageBase64: input.personImageBase64,
          faceCropBase64: faceCropResult.faceCropBase64,
          generatedFace: finalDetectedFace!,
          personFace: personFace!,
          aspectRatio: input.aspectRatio,
          perceivedGender: forensicAnchor.perceivedGender,
        })

        faceRestoreResult = {
          success: restoreResult.success,
          accepted: false,
          processingTimeMs: restoreResult.processingTimeMs,
          method: restoreResult.method,
          identitySimilarityBefore: restoreResult.identitySimilarityBefore,
          identitySimilarityAfter: restoreResult.identitySimilarityAfter,
          skinToneDeltaBefore: restoreResult.skinToneDeltaBefore,
          skinToneDeltaAfter: restoreResult.skinToneDeltaAfter,
          darkSpotArtifactScoreAfter: restoreResult.darkSpotArtifactScoreAfter,
          error: restoreResult.error,
        }

        if (restoreResult.success && restoreResult.restoredImageBase64) {
          // Verify the restored image actually improved identity.
          // Important: micro-face drift is GEOMETRY ONLY, while InsightFace
          // intentionally preserves target geometry and updates identity.
          // So InsightFace must be accepted using identity similarity, not
          // geometry drift reduction.
          const restoredBuffer = base64ToBuffer(restoreResult.restoredImageBase64)
          const refBuffer = base64ToBuffer(input.personImageBase64)
          let restoredMicroDrift: Awaited<ReturnType<typeof computeMicroFaceDrift>> | null = null
          let restoredDetectedFace: FaceCoordinates | null = null
          try {
            restoredDetectedFace = await detectFaceCoordinates(restoreResult.restoredImageBase64)
            restoredMicroDrift = await computeMicroFaceDrift(refBuffer, restoredBuffer, {
              referenceFace: personFace,
              generatedFace: restoredDetectedFace,
            })
          } catch (e) {
            console.warn('   ⚠️ Could not verify restored face drift:', e)
          }

          const restoredDriftImproved = Boolean(
            restoredMicroDrift?.success &&
            microDrift?.success &&
            restoredMicroDrift.driftPercent < microDrift.driftPercent - 3
          )

          const identitySimilarityBefore = restoreResult.identitySimilarityBefore
          const identitySimilarityAfter = restoreResult.identitySimilarityAfter
          const skinToneDeltaBefore = restoreResult.skinToneDeltaBefore
          const skinToneDeltaAfter = restoreResult.skinToneDeltaAfter
          const darkSpotArtifactScoreAfter = restoreResult.darkSpotArtifactScoreAfter
          const skinToneRejected = Boolean(
            typeof skinToneDeltaBefore === 'number' &&
            typeof skinToneDeltaAfter === 'number' &&
            skinToneDeltaAfter > skinToneDeltaBefore + 3
          )
          const darkSpotArtifactsRejected = Boolean(
            restoreResult.method === 'insightface' &&
            typeof darkSpotArtifactScoreAfter === 'number' &&
            darkSpotArtifactScoreAfter > 0.003
          )

          // Strict gate: only accept if drift actually improved AND skin wasn't harmed.
          // For InsightFace: also require meaningful identity improvement.
          const insightfaceAccepted = Boolean(
            restoreResult.method === 'insightface' &&
            restoredDriftImproved &&
            !skinToneRejected &&
            !darkSpotArtifactsRejected &&
            typeof identitySimilarityBefore === 'number' &&
            typeof identitySimilarityAfter === 'number' &&
            identitySimilarityAfter > identitySimilarityBefore + 0.03
          )
          const geminiAccepted = Boolean(
            restoreResult.method === 'gemini' &&
            restoredDriftImproved &&
            !skinToneRejected
          )
          const shouldAcceptRestore = insightfaceAccepted || geminiAccepted

          if (shouldAcceptRestore) {
            if (faceRestoreResult) faceRestoreResult.accepted = true
            const oldDrift = microDrift!.driftPercent
            generatedImage = restoreResult.restoredImageBase64
            if (restoredMicroDrift?.success) {
              microDrift = restoredMicroDrift
            }
            finalDetectedFace = restoredDetectedFace
            driftAssessment = assessFaceDrift(personFace, restoredDetectedFace)
            driftAssessment = tightenDriftAssessmentForUltraFaceLock(
              driftAssessment,
              isUltraFaceLockPreset
            )
            if (isDev) {
              if (restoreResult.method === 'insightface' && typeof identitySimilarityBefore === 'number' && typeof identitySimilarityAfter === 'number') {
                console.log(
                  `   ✅ Face restored via insightface! Identity similarity: ${identitySimilarityAfter.toFixed(3)} (was ${identitySimilarityBefore.toFixed(3)}). Skin delta: ${skinToneDeltaAfter?.toFixed(1) ?? '?'} (was ${skinToneDeltaBefore?.toFixed(1) ?? '?'}). Dark spot score: ${darkSpotArtifactScoreAfter?.toFixed(4) ?? '?'}. Geometry drift: ${restoredMicroDrift?.driftPercent?.toFixed(1) ?? '?'}% (was ${oldDrift.toFixed(1)}%)`
                )
              } else {
                console.log(`   ✅ Face restored via ${restoreResult.method || 'unknown'}! Drift: ${restoredMicroDrift?.driftPercent?.toFixed(1) ?? '?'}% (was ${oldDrift.toFixed(1)}%)`)
              }
            }
          } else {
            if (isDev) {
              if (restoreResult.method === 'insightface' && typeof identitySimilarityBefore === 'number' && typeof identitySimilarityAfter === 'number') {
                console.log(
                  `   ↩️ Restored face (insightface) rejected. Identity similarity: ${identitySimilarityAfter.toFixed(3)} vs ${identitySimilarityBefore.toFixed(3)}. Skin delta: ${skinToneDeltaAfter?.toFixed(1) ?? '?'} vs ${skinToneDeltaBefore?.toFixed(1) ?? '?'}. Dark spot score: ${darkSpotArtifactScoreAfter?.toFixed(4) ?? '?'}`
                )
              } else {
                console.log(`   ↩️ Restored face (${restoreResult.method || 'unknown'}) did not improve drift (${restoredMicroDrift?.driftPercent?.toFixed(1) ?? '?'}% vs ${microDrift?.driftPercent?.toFixed(1) ?? '?'}%), keeping original`)
              }
            }
          }
        } else {
          if (isDev) console.log(`   ⚠️ Face restoration failed: ${restoreResult.error}`)
        }
      } catch (restoreError) {
        console.error('   ❌ Face restoration error:', restoreError)
        faceRestoreResult = {
          success: false,
          processingTimeMs: 0,
          error: restoreError instanceof Error ? restoreError.message : String(restoreError),
        }
      }
    } else if (isDev && ENABLE_FACE_RESTORE && microDrift?.success) {
      if (!hasTimeBudget) {
        console.log(`   ⏱️ Face restore skipped — time budget exhausted (${(elapsedBeforeRestore / 1000).toFixed(1)}s >= 120s) and no InsightFace service`)
      } else {
        console.log(`   ✓ Face drift ${microDrift.driftPercent.toFixed(1)}% < ${faceRestoreDriftThreshold}% → skipping face restoration`)
      }
    }

    const restoreSatisfiedIdentityGate = Boolean(
      faceRestoreResult?.success &&
      faceRestoreResult?.accepted &&
      faceRestoreResult?.method === 'insightface' &&
      typeof faceRestoreResult.identitySimilarityBefore === 'number' &&
      typeof faceRestoreResult.identitySimilarityAfter === 'number' &&
      typeof faceRestoreResult.skinToneDeltaBefore === 'number' &&
      typeof faceRestoreResult.skinToneDeltaAfter === 'number' &&
      (typeof faceRestoreResult.darkSpotArtifactScoreAfter !== 'number' || faceRestoreResult.darkSpotArtifactScoreAfter <= 0.003) &&
      faceRestoreResult.identitySimilarityAfter >= faceRestoreResult.identitySimilarityBefore - 0.005 &&
      faceRestoreResult.skinToneDeltaAfter <= faceRestoreResult.skinToneDeltaBefore + 1.5
    )

    const genTime = Date.now() - startTime
    const finalMicroDrift = microDrift?.success ? microDrift.driftPercent : null
    const finalDriftMax = isUltraFaceLockPreset
      ? FINAL_MICRO_DRIFT_MAX_ULTRA
      : isComplexBackgroundPreset
        ? FINAL_MICRO_DRIFT_MAX_COMPLEX
        : FINAL_MICRO_DRIFT_MAX_DEFAULT
    const finalFaceFailure = Boolean(
      hasTrustedSourceFace &&
      !restoreSatisfiedIdentityGate &&
      (
        driftAssessment.reason === 'generated_face_unknown' ||
        driftAssessment.shouldRetry ||
        (typeof finalMicroDrift === 'number' && finalMicroDrift >= finalDriftMax)
      )
    )
    const faceConsistencyGate = finalFaceFailure
      ? {
        failed: true,
        reason: restoreSatisfiedIdentityGate ? 'restored_identity_pass' : (driftAssessment.reason || 'unknown'),
        microDriftPercent: finalMicroDrift,
        threshold: finalDriftMax,
      }
      : {
        failed: false,
        reason: restoreSatisfiedIdentityGate ? 'restored_identity_pass' : 'passed',
        microDriftPercent: finalMicroDrift,
        threshold: finalDriftMax,
      }

    if (isDev) {
      console.log(`   Generated in ${(genTime / 1000).toFixed(1)}s`)
      console.log('\n━━━ PIPELINE COMPLETE ━━━')
      console.log(`   Total: ${((Date.now() - startTime) / 1000).toFixed(1)}s`)
    }

    return {
      success: true,
      image: generatedImage,
      generationTimeMs: Date.now() - startTime,
      promptUsed: prompt,
      debug: {
        model: activeRenderModel,
        preferredModel: preferredRenderModel,
        renderFallbackReason,
        sceneConfig,
        resolvedPresetId,
        personFace,
        finalDetectedFace,
        retried,
        driftAssessment,
        microDrift,
        driftRetryParams,
        sceneAssessment,
        faceConsistencyGate,
        faceRestoreResult,
        faceCropUsed: Boolean(faceCropResult.success && faceCropResult.faceCropBase64),
        promptLength: prompt.length,
      },
    }
  } catch (error) {
    console.error('🍌 Nano Banana Pro FAILED:', error)
    return {
      success: false,
      image: '',
      generationTimeMs: Date.now() - startTime,
      promptUsed: '',
      debug: { error: error instanceof Error ? error.message : String(error) },
    }
  }
}

function isFaceBoxSafeForSpatialLock(face: FaceCoordinates): boolean {
  const w = Math.max(1, face.xmax - face.xmin)
  const h = Math.max(1, face.ymax - face.ymin)
  const area = (w * h) / 1_000_000
  const aspect = h / w
  const edgeMargin = Math.min(face.xmin, face.ymin, 1000 - face.xmax, 1000 - face.ymax)
  if (face.confidence < 0.75) return false
  // Allow large close-up faces (common in portrait/cropped influencer photos).
  if (area < 0.02 || area > 0.7) return false
  if (aspect < 0.58 || aspect > 1.8) return false
  if (edgeMargin < 15) return false
  return true
}

function isFaceBoxUsableForSpatialLock(face: FaceCoordinates): boolean {
  const w = Math.max(1, face.xmax - face.xmin)
  const h = Math.max(1, face.ymax - face.ymin)
  const area = (w * h) / 1_000_000
  const aspect = h / w
  const edgeMargin = Math.min(face.xmin, face.ymin, 1000 - face.xmax, 1000 - face.ymax)
  if (face.confidence < 0.62) return false
  if (area < 0.01 || area > 0.78) return false
  if (aspect < 0.5 || aspect > 2.0) return false
  if (edgeMargin < 6) return false
  return true
}

function getFaceSpatialLock(face: FaceCoordinates | null): {
  quality: 'strict' | 'relaxed'
  box: { ymin: number; xmin: number; ymax: number; xmax: number }
} | null {
  if (!face) return null
  if (isFaceBoxSafeForSpatialLock(face)) {
    return {
      quality: 'strict',
      box: { ymin: face.ymin, xmin: face.xmin, ymax: face.ymax, xmax: face.xmax },
    }
  }
  if (isFaceBoxUsableForSpatialLock(face)) {
    return {
      quality: 'relaxed',
      box: { ymin: face.ymin, xmin: face.xmin, ymax: face.ymax, xmax: face.xmax },
    }
  }
  return null
}

function base64ToBuffer(dataUrlOrBase64: string): Buffer {
  const cleaned = (dataUrlOrBase64 || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
  return Buffer.from(cleaned, 'base64')
}

function assessFaceDrift(
  personFace: FaceCoordinates | null,
  generatedFace: FaceCoordinates | null
): {
  shouldRetry: boolean
  reason: string
  metrics?: {
    iou: number
    centerDistance: number
    sizeDelta: number
  }
} {
  if (!personFace) {
    return { shouldRetry: false, reason: 'person_face_missing' }
  }
  // Retry once when output face detection fails (e.g. parser hiccup / weak detection),
  // because this commonly correlates with identity drift.
  if (!generatedFace) {
    return { shouldRetry: true, reason: 'generated_face_unknown' }
  }

  const iou = faceIoU(personFace, generatedFace)
  const centerDistance = faceCenterDistance(personFace, generatedFace)
  const sizeDelta = faceSizeDelta(personFace, generatedFace)

  const drift = iou < 0.58 || centerDistance > 70 || sizeDelta > 0.18
  return {
    shouldRetry: drift,
    reason: drift ? 'geometry_drift' : 'stable',
    metrics: { iou, centerDistance, sizeDelta },
  }
}

function shouldUseRetryCandidate(args: {
  firstFace: FaceCoordinates | null
  firstDriftAssessment: ReturnType<typeof assessFaceDrift>
  firstMicroDrift: Awaited<ReturnType<typeof computeMicroFaceDrift>> | null
  firstSceneAssessment: SceneQualityAssessment
  retryFace: FaceCoordinates | null
  retryDriftAssessment: ReturnType<typeof assessFaceDrift>
  retryMicroDrift: Awaited<ReturnType<typeof computeMicroFaceDrift>> | null
  retrySceneAssessment: SceneQualityAssessment
}): boolean {
  const {
    firstFace,
    firstDriftAssessment,
    firstMicroDrift,
    firstSceneAssessment,
    retryFace,
    retryDriftAssessment,
    retryMicroDrift,
    retrySceneAssessment,
  } = args

  // Never replace a valid detected face with an undetected one.
  if (firstFace && !retryFace) return false
  if (!firstFace && retryFace) return true

  const firstDrift = firstMicroDrift?.driftPercent
  const retryDrift = retryMicroDrift?.driftPercent
  if (typeof firstDrift === 'number' && typeof retryDrift === 'number') {
    // Require meaningful improvement to avoid flip-flopping between similar outputs.
    if (retryDrift <= firstDrift - 2.5) return true
    if (retryDrift >= firstDrift - 1.0) return false
  }

  // If first pass face is stable and retry still drifts, keep first.
  if (!firstDriftAssessment.shouldRetry && retryDriftAssessment.shouldRetry) return false

  // Scene-only improvement can win, but only when retry is not worse on face geometry.
  if (firstSceneAssessment.shouldRetry && !retrySceneAssessment.shouldRetry) {
    return !retryDriftAssessment.shouldRetry
  }

  // Default to preserving first pass identity.
  return false
}

function buildRetryIdentityCorrectionGuidance(args: {
  baseIdentityCorrectionGuidance?: string
  microDriftEmphasis?: string
  hasHardFaceFailure: boolean
  isComplexBackgroundPreset: boolean
}): string {
  return [
    args.baseIdentityCorrectionGuidance,
    args.microDriftEmphasis,
    args.hasHardFaceFailure
      ? 'Hard identity correction: lock face age, skin luminance, and facial geometry to source exactly; no beautification or complexion shift.'
      : undefined,
    args.isComplexBackgroundPreset
      ? 'Complex scene rule: preserve source face first; if needed reduce background stylistic intensity before any face-region change.'
      : undefined,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

function faceIoU(a: FaceCoordinates, b: FaceCoordinates): number {
  const x1 = Math.max(a.xmin, b.xmin)
  const y1 = Math.max(a.ymin, b.ymin)
  const x2 = Math.min(a.xmax, b.xmax)
  const y2 = Math.min(a.ymax, b.ymax)
  const w = Math.max(0, x2 - x1)
  const h = Math.max(0, y2 - y1)
  const inter = w * h
  const areaA = Math.max(1, (a.xmax - a.xmin) * (a.ymax - a.ymin))
  const areaB = Math.max(1, (b.xmax - b.xmin) * (b.ymax - b.ymin))
  const union = areaA + areaB - inter
  return union > 0 ? inter / union : 0
}

function faceCenterDistance(a: FaceCoordinates, b: FaceCoordinates): number {
  const ax = (a.xmin + a.xmax) / 2
  const ay = (a.ymin + a.ymax) / 2
  const bx = (b.xmin + b.xmax) / 2
  const by = (b.ymin + b.ymax) / 2
  return Math.hypot(ax - bx, ay - by)
}

function faceSizeDelta(a: FaceCoordinates, b: FaceCoordinates): number {
  const aw = Math.max(1, a.xmax - a.xmin)
  const ah = Math.max(1, a.ymax - a.ymin)
  const bw = Math.max(1, b.xmax - b.xmin)
  const bh = Math.max(1, b.ymax - b.ymin)
  const wr = aw / bw
  const hr = ah / bh
  return Math.max(Math.abs(1 - wr), Math.abs(1 - hr))
}

function buildSceneAssessmentFallback(): SceneQualityAssessment {
  return {
    shouldRetry: false,
    reason: 'scene_check_timeout',
    scores: {
      poseNaturalness: 85,
      lightingCoherence: 85,
      backgroundQuality: 85,
      compositionBalance: 85,
    },
  }
}

function tightenDriftAssessmentForUltraFaceLock(
  assessment: ReturnType<typeof assessFaceDrift>,
  enabled: boolean
): ReturnType<typeof assessFaceDrift> {
  if (!enabled || !assessment.metrics) return assessment
  const { iou, centerDistance, sizeDelta } = assessment.metrics
  const ultraDrift =
    iou < ULTRA_FACE_LOCK_IOU_MIN ||
    centerDistance > ULTRA_FACE_LOCK_CENTER_MAX ||
    sizeDelta > ULTRA_FACE_LOCK_SIZE_DELTA_MAX
  if (!ultraDrift) return assessment
  return {
    shouldRetry: true,
    reason: 'ultra_lock_geometry_drift',
    metrics: assessment.metrics,
  }
}

function sanitizeEnvironmentGuidance(value?: string): string | undefined {
  if (!value?.trim()) return undefined
  const normalized = value
    .replace(/\s+/g, ' ')
    .trim()

  // Phase 1: Block sentences that contain face/identity manipulation phrases
  const blockedPhrases = [
    'change face', 'replace face', 'swap face', 'face from image',
    'do not change face', 'keep face', 'face 100%', 'identical to reference',
    'beautify', 'skin smoothing', 'face preserved', 'identity from reference',
    'use person from', 'use the girl', 'use the boy', 'use the man', 'use the woman',
    'use uploaded photo', 'use attached portrait', 'use provided reference',
    'subject from reference', 'face and identity', 'face unchanged',
  ]

  // Phase 2: Block sentences that describe a specific person/subject
  // These override the actual input person's identity when injected into prompts
  const subjectDescriptors = [
    // Ethnicity/nationality
    'caucasian', 'african', 'asian', 'japanese', 'korean', 'chinese', 'indian',
    'beninese', 'moroccan', 'yakutian', 'european descent',
    // Age/gender combos that describe a different person
    'young woman', 'young man', 'young guy', 'young adult male', 'young adult female',
    'young traveler', 'male model', 'female model', 'alternative model',
    // Hair descriptions (override actual person's hair)
    'chestnut hair', 'blonde hair', 'pink hair', 'brown hair', 'black hair',
    'red hair', 'shoulder-length', 'short hair', 'long hair', 'wet-look hair',
    'slicked', 'ponytail', 'cornrows', 'braids', 'braid',
    // Skin/appearance
    'medium brown skin', 'warm undertones', 'smooth skin', 'sharp jawline',
    'sharp bone structure', 'oval face', 'strong jawline',
    // Body descriptions
    'tall athletic', 'slim female', 'average build',
    // Specific outfit from examples (override actual garment)
    'oversized black suit', 'fur coat', 'track jacket', 'windbreaker',
    'olive-green', 'heather gray hoodie', 'navy joggers',
    // Specific identity phrases
    'ai influencer', 'content creator', 'main character',
  ]

  const sentences = normalized.split(/[.!?]\s+/)
  const safe = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase()
    // Block if sentence contains any blocked phrase
    if (blockedPhrases.some(token => lower.includes(token))) return false
    // Block if sentence describes a specific person/subject
    if (subjectDescriptors.some(token => lower.includes(token))) return false
    return true
  })
  return safe.join('. ').trim() || undefined
}

function sanitizeIdentityRules(rules: string[]): string[] {
  const forbidden = [
    // Face swap/replace phrases
    'replace face', 'swap face', 'face from image 3', 'change identity',
    // Subject-specific identity descriptions that override input person
    'black beninese', 'japanese', 'caucasian', 'korean', 'chinese',
    'african', 'moroccan', 'yakutian', 'indian',
    'young woman', 'young man', 'male model', 'female model',
    'pink hair', 'chestnut hair', 'cornrows', 'braids',
    'tattoos', 'nose ring', 'facial tattoos',
    'tall athletic', 'slim female', 'average build',
    'identity:',
  ]
  return rules
    .map(rule => rule.trim())
    .filter(Boolean)
    .filter((rule) => {
      const lower = rule.toLowerCase()
      return !forbidden.some(token => lower.includes(token))
    })
}

function getPresetFaceGuard(presetId?: string): {
  identityPriorityRules: string[]
  additionalAvoidTerms: string[]
  identityCorrectionGuidance?: string
} {
  const id = (presetId || '').trim().toLowerCase()
  if (!ULTRA_FACE_LOCK_PRESETS.has(id)) {
    return {
      identityPriorityRules: [],
      additionalAvoidTerms: [],
    }
  }

  const sharedRules = [
    'Ultra face-lock preset: preserve face geometry exactly at source proportions and pixel-level texture fidelity.',
    'Do not apply mood grade or stylization to eyes, nose, lips, cheeks, jawline, or brow shape.',
    'Keep natural pore detail and facial micro-contrast from source; do not smooth, contour, or beautify.',
  ]
  const sharedAvoid = [
    'face reshape',
    'jawline edit',
    'eye restyle',
    'beauty retouch',
    'skin denoise face',
    'face tone remap',
  ]

  if (id === 'golden_hour_bedroom') {
    return {
      identityPriorityRules: [
        ...sharedRules,
        'For striped blind shadows, keep face planes unchanged and avoid shadow-driven face warping.',
      ],
      additionalAvoidTerms: [...sharedAvoid, 'striped shadow warping on face'],
      identityCorrectionGuidance:
        'Golden-hour blind lighting may affect scene mood, but face geometry and pore texture must remain source-identical.',
    }
  }

  if (id === 'studio_crimson_noir') {
    return {
      identityPriorityRules: [
        ...sharedRules,
        'Crimson low-key grading must remain background-dominant and must not recolor facial anatomy unnaturally.',
      ],
      additionalAvoidTerms: [...sharedAvoid, 'crimson face cast clipping'],
      identityCorrectionGuidance:
        'Neo-noir treatment should deepen background and clothing contrast while keeping face topology and tonal identity stable.',
    }
  }

  return {
    identityPriorityRules: sharedRules,
    additionalAvoidTerms: sharedAvoid,
    identityCorrectionGuidance:
      'Night preset: preserve exact face topology and avoid any beauty or cinematic grading on the face region.',
  }
}

function getPresetOpticalGuard(presetId?: string): {
  cameraGuidance?: string
  additionalAvoidTerms: string[]
} {
  const id = (presetId || '').trim().toLowerCase()
  if (!NO_SYNTHETIC_BLUR_PRESETS.has(id)) {
    return {
      additionalAvoidTerms: [],
    }
  }

  return {
    cameraGuidance:
      'Optical behavior: maintain medium-to-deep focus with legible background materials and edges; avoid synthetic portrait-mode blur.',
    additionalAvoidTerms: [
      'gaussian background blur',
      'fake bokeh circles',
      'portrait mode cutout blur',
      'blur wall background',
      'depth blur artifacts',
      'smudged background textures',
    ],
  }
}

function buildSceneFallback(input: NanoBananaProInput) {
  const anchor = input.presetDescription || 'Clean gradient studio backdrop with soft even ambient lighting.'
  return {
    preset: input.presetId || 'studio_gradient',
    scenarioVariant: 'timeout_fallback',
    anchorZone: anchor,
    lightingMode: 'environment_coherent' as const,
    posePolicy: 'inherit' as const,
    facePolicy: 'immutable' as const,
    cameraPolicy: 'inherit' as const,
    realismGuidance:
      'Single coherent photograph: subject lit by and grounded in the same environment; shadows and highlights on the subject consistent with the scene; consistent perspective and depth; no pasted-on or cut-out look.',
    lightingBlueprint:
      'Match scene lighting on subject: natural key and fill from visible environment sources, coherent shadow direction and softness, and consistent color temperature between subject and background.',
    presetAvoid: 'No hard flash, no exaggerated color cast, no cut-out edges, no pasted subject appearance.',
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
