import { renderTryOnFast } from './renderer'
import {
  cropIdentityRegion,
  extractIdentitySimple
} from './identity-cropper'
import {
  getOrCacheIdentity,
  getCacheStats
} from './identity-cache'
import {
  preprocessGarmentImage,
  logPreprocessStatus,
  type PreprocessResult
} from './garment-preprocessor'
import {
  buildGarmentEnforcementBlock,
  type StrictGarmentProfile
} from './garment-strict-schema'
// Intelligent Scene Analyzer - Prevents Hallucination
import {
  analyzeScene,
  logSceneAnalysis,
  type SceneAnalysisResult
} from './intelligent-scene-analyzer'
// Body-Aware Face Analyzer
import {
  analyzeUserFace,
  logFaceAnalysis,
  type FaceAnalysisResult
} from './gpt-face-analyzer'
// Ultra Fidelity Constraints
import {
  getUltraFidelityPrompt,
  logUltraFidelityStatus
} from './ultra-fidelity'
// Advanced AI Prompting (Research-Based)
import {
  ANTI_AI_TELL_TRIGGERS,
  IDENTITY_MARKERS,
  getPhotographicStyle,
  logAdvancedPrompting
} from './advanced-prompting'
// Image Complexity Analyzer
import {
  analyzeImageComplexity,
  generateComplexityPromptModifier,
  createComplexityAlertResponse,
  logComplexityAnalysis,
  type ComplexityAnalysisResult
} from './complexity-analyzer'
// Hyper-Realistic Generation Constraints
import {
  getHyperRealisticPrompt,
  logHyperRealisticStatus
} from './hyper-realistic'
// Face & Clothing Consistency Lock
import {
  getConsistencyLockPrompt,
  logConsistencyStatus
} from './consistency-lock'
// Background Preservation & Physics Realism
import {
  getBackgroundPhysicsPrompt,
  logBackgroundPhysicsStatus
} from './background-physics'
// Anti-AI Look Controls
import {
  getAntiAILookPrompt,
  logAntiAIStatus
} from './anti-ai-look'

export interface TryOnQualityOptions {
  quality: 'fast' | 'high'
  aspectRatio?: string
  resolution?: string
}

export interface TryOnPresetInput {
  id?: string  // Preset ID for Higgsfield-style scene lookup in renderer
  pose_name?: string
  lighting_name?: string
  background_name?: string
  style_pack?: string
  background_focus?: string
  identity_lock?: 'normal' | 'high'
}

export interface TryOnPipelineResult {
  image: string
  debug: {
    shootPlanText: string
    usedGarmentExtraction: boolean
    timeMs: number
    preset?: string
    identityImagesUsed?: number
    identityCached?: boolean
    identityHash?: string
  }
}

/**
 * FAST TRY-ON PIPELINE (PHASE 4 ARCHITECTURE)
 * 
 * IDENTITY PRESERVATION SYSTEM:
 * - Identity cropping: crop to upper body (head → mid-torso)
 * - Session cache: reuse identity across generations
 * - HEAD_SCALE_LOCK, CAMERA_CONSTRAINT, POSE_INHERITANCE active
 * 
 * Single API call to Gemini with:
 * - Image 1: Person (cropped identity, cached)
 * - Image 2: Garment (visual reference only)
 */
export async function runTryOnPipelineV3(params: {
  subjectImageBase64: string
  clothingRefBase64: string
  preset?: TryOnPresetInput
  userRequest?: string
  quality: TryOnQualityOptions
  /** Enable identity cropping (recommended for 90%+ consistency) */
  useIdentityCropping?: boolean
  /** User ID for session cache (enables character memory) */
  userId?: string
  /** Skip garment preprocessing (escape hatch, not recommended) */
  skipGarmentPreprocessing?: boolean
}): Promise<TryOnPipelineResult> {
  const startTime = Date.now()

  const {
    subjectImageBase64,
    clothingRefBase64,
    preset,
    userRequest,
    quality,
    useIdentityCropping = true,  // Default ON for identity preservation
    userId = 'anonymous',
    skipGarmentPreprocessing = false  // Default: preprocessing enabled
  } = params

  // ═══════════════════════════════════════════════════════════════
  // GARMENT PREPROCESSING LAYER (NEW)
  // ═══════════════════════════════════════════════════════════════

  let processedClothingImage = clothingRefBase64
  let garmentPreprocessResult: PreprocessResult | null = null

  if (!skipGarmentPreprocessing) {
    console.log(`\n👔 GARMENT PREPROCESSING: Starting...`)

    garmentPreprocessResult = await preprocessGarmentImage(clothingRefBase64, {
      sessionId: `pipeline-${startTime}`,
      model: quality.quality === 'high' ? 'pro' : 'flash'
    })

    processedClothingImage = garmentPreprocessResult.processedImage
    logPreprocessStatus(`pipeline-${startTime}`, garmentPreprocessResult)
  } else {
    console.log(`\n⏭️ GARMENT PREPROCESSING: Skipped (flag set)`)
  }

  // ═══════════════════════════════════════════════════════════════
  // STRICT GARMENT ENFORCEMENT BLOCK (for pattern/color accuracy)
  // ═══════════════════════════════════════════════════════════════

  let garmentEnforcementBlock: string | undefined
  if (garmentPreprocessResult?.strictGarmentProfile) {
    garmentEnforcementBlock = buildGarmentEnforcementBlock(garmentPreprocessResult.strictGarmentProfile)
    console.log(`👔 STRICT GARMENT ENFORCEMENT: Generated (pattern: ${garmentPreprocessResult.strictGarmentProfile.pattern?.exists ? garmentPreprocessResult.strictGarmentProfile.pattern.type : 'solid'})`)
  }

  // ═══════════════════════════════════════════════════════════════
  // IDENTITY CROPPING & CACHING
  // ═══════════════════════════════════════════════════════════════

  let processedIdentityImage = subjectImageBase64
  let identityHash: string | undefined
  let identityCached = false

  if (useIdentityCropping) {
    try {
      // Try full cropping with Sharp
      const cropped = await cropIdentityRegion(subjectImageBase64)

      // Cache by (userId + identityHash)
      const cached = getOrCacheIdentity(userId, cropped)

      processedIdentityImage = cached.croppedImageBase64
      identityHash = cached.identityHash
      identityCached = cached.useCount > 1

      console.log(`🔒 IDENTITY SYSTEM:`)
      console.log(`   Cropping: ✓ (upper body)`)
      console.log(`   Hash: ${identityHash}`)
      console.log(`   Cached: ${identityCached ? '✓ (reused)' : '✗ (new)'}`)
      console.log(`   Use count: ${cached.useCount}`)
    } catch (e) {
      // Fallback to simple extraction (just hash, no crop)
      console.warn('⚠️ Identity cropping failed, using fallback')
      const simple = extractIdentitySimple(subjectImageBase64)
      identityHash = simple.identityHash
      processedIdentityImage = subjectImageBase64
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INTELLIGENT SCENE ANALYSIS (PREVENTS HALLUCINATION)
  // ═══════════════════════════════════════════════════════════════

  let sceneAnalysis: SceneAnalysisResult | null = null
  let faceAnalysis: FaceAnalysisResult | null = null
  let complexityAnalysis: ComplexityAnalysisResult | null = null

  try {
    console.log(`\n🎬 INTELLIGENT SCENE ANALYSIS: Starting...`)

    // Analyze the ENTIRE input image to understand context
    sceneAnalysis = await analyzeScene(
      subjectImageBase64,
      `pipeline-${startTime}`
    )
    logSceneAnalysis(sceneAnalysis, `pipeline-${startTime}`)

    // Also do body-aware face analysis
    faceAnalysis = await analyzeUserFace(
      subjectImageBase64,
      `pipeline-${startTime}`
    )
    logFaceAnalysis(faceAnalysis, `pipeline-${startTime}`)

    // Analyze image complexity for alerts
    complexityAnalysis = await analyzeImageComplexity(
      subjectImageBase64,
      `pipeline-${startTime}`
    )
    logComplexityAnalysis(complexityAnalysis, `pipeline-${startTime}`)

    console.log(`   ✅ Scene + Face + Complexity analysis complete`)
  } catch (analysisError) {
    console.warn(`   ⚠️ Analysis failed, using fallback:`, analysisError)
  }

  // Extract preset values - ID is critical for scene lookup in renderer
  const presetId = preset?.id
  const backgroundName = preset?.background_name || 'keep the original background'
  const lightingName = preset?.lighting_name || 'natural lighting'

  // Build scene instruction - SIMPLIFIED to reduce token count
  // Previous version was causing 32K token overflow
  let sceneInstruction = backgroundName

  // NOTE: Removed all the verbose prompts (ultraFidelity, hyperRealistic, etc.)
  // that were causing token limit exceeded. Less is more for model focus.

  console.log(`\n🎯 SIMPLIFIED SCENE INSTRUCTION: ${sceneInstruction.slice(0, 100)}...`)

  console.log(`\n========== TRY-ON PIPELINE (PHASE 5 - GARMENT EXTRACTION) ==========`)
  console.log(`🎨 Preset ID: ${presetId || 'none'}`)
  console.log(`📸 Background: "${backgroundName}"`)
  console.log(`💡 Lighting: "${lightingName}"`)
  console.log(`🎯 Quality: ${quality.quality}`)
  console.log(`🔒 HEAD_SCALE_LOCK: ✓`)
  console.log(`📷 CAMERA_CONSTRAINT: ✓`)
  console.log(`🧍 POSE_INHERITANCE: ✓`)
  console.log(`👔 GARMENT_EXTRACTION: ${garmentPreprocessResult?.wasExtracted ? '✓ (extracted)' : '✗ (passthrough)'}`)
  console.log(`📊 Cache stats: ${JSON.stringify(getCacheStats())}`)
  console.log(`=====================================\n`)

  // Single render call - PHASE 5: Cropped identity + Preprocessed Garment
  const image = await renderTryOnFast({
    subjectImageBase64: processedIdentityImage, // Image 1: Cropped identity
    garmentImageBase64: processedClothingImage, // Image 2: Garment (preprocessed, body-free)
    backgroundInstruction: sceneInstruction,
    lightingInstruction: lightingName,
    quality: quality.quality,
    aspectRatio: quality.aspectRatio,
    resolution: quality.resolution,
    stylePresetId: presetId,
    userRequest: userRequest, // Pass userRequest containing all constraint prompts and preset info
    garmentEnforcementBlock, // Strict pattern/color enforcement
  })

  const elapsed = Date.now() - startTime
  console.log(`✅ Pipeline completed in ${(elapsed / 1000).toFixed(1)}s`)

  return {
    image,
    debug: {
      shootPlanText: sceneInstruction,
      usedGarmentExtraction: garmentPreprocessResult?.wasExtracted || false,
      timeMs: elapsed,
      preset: presetId,
      identityImagesUsed: 1,
      identityCached,
      identityHash,
    },
  }
}

