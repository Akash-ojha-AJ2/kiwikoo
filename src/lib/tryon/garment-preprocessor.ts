/**
 * GARMENT PREPROCESSOR
 * 
 * Central orchestrator for the automatic garment extraction pipeline.
 * 
 * DECISION LOGIC:
 * IF clothing_reference_image CONTAINS a human body:
 *     → detect body type and confidence
 *     → extract garment using Gemini
 *     → return garment-only image
 * ELSE:
 *     → pass through original image (no extraction needed)
 * 
 * This preprocessing layer ensures the try-on system only receives
 * clean garment-only images, eliminating body/pose bleed from
 * clothing reference images.
 */

import 'server-only'
import { detectHumanInClothingImage, logBodyDetectionStatus, type BodyDetectionResult } from './human-body-detector'
import { extractGarmentWithFidelity, logGarmentExtractionStatus, type GarmentExtractionResult } from './garment-extractor'
import { analyzeGarmentForensic, type GarmentAnalysis } from './face-analyzer'
import { extractStrictGarmentProfile, logStrictGarmentStatus, type StrictGarmentProfile } from './garment-strict-schema'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PreprocessResult {
    /** Base64 image (garment-only if extracted, original if passthrough) */
    processedImage: string
    /** True if extraction was performed */
    wasExtracted: boolean
    /** True if human body was detected in original */
    bodyDetected: boolean
    /** Detection confidence 0-1 */
    confidence: number
    /** Method used */
    extractionMethod: 'passthrough' | 'gemini-flash' | 'gemini-pro'
    /** Full body detection result for debugging */
    detectionResult?: BodyDetectionResult
    /** Full extraction result for debugging */
    extractionResult?: GarmentExtractionResult
    /** Garment analysis if performed */
    garmentAnalysis?: GarmentAnalysis
    /** Strict garment profile for pattern/color accuracy */
    strictGarmentProfile?: StrictGarmentProfile
    /** Total processing time in ms */
    totalTimeMs: number
}

export interface PreprocessOptions {
    /** Force extraction even if no body detected */
    forceExtraction?: boolean
    /** Skip detection and always pass through */
    skipPreprocessing?: boolean
    /** Model to use for extraction */
    model?: 'flash' | 'pro'
    /** Pre-analyzed garment (skips garment analysis) */
    garmentAnalysis?: GarmentAnalysis
    /** Session ID for logging */
    sessionId?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimum confidence to trigger extraction */
const DETECTION_THRESHOLD = 0.6

/** Cache for recent preprocessing results (simple in-memory) */
const preprocessCache = new Map<string, { result: PreprocessResult; timestamp: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PREPROCESSING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Preprocess a clothing image before passing to try-on pipeline.
 * 
 * Automatically detects if the image contains a human body and extracts
 * the garment only if needed.
 * 
 * @param clothingImageBase64 - The clothing reference image (may contain person)
 * @param options - Preprocessing options
 * @returns PreprocessResult with processed image and metadata
 */
export async function preprocessGarmentImage(
    clothingImageBase64: string,
    options: PreprocessOptions = {}
): Promise<PreprocessResult> {
    const startTime = Date.now()
    const sessionId = options.sessionId || `preprocess-${Date.now()}`

    console.log(`\n🔄 GARMENT PREPROCESSING [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)

    // Option: Skip preprocessing entirely
    if (options.skipPreprocessing) {
        console.log(`   ⏭️ Preprocessing SKIPPED (flag set)`)
        return {
            processedImage: clothingImageBase64,
            wasExtracted: false,
            bodyDetected: false,
            confidence: 0,
            extractionMethod: 'passthrough',
            totalTimeMs: Date.now() - startTime
        }
    }

    // Check cache
    const cacheKey = generateCacheKey(clothingImageBase64)
    const cached = preprocessCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log(`   📦 Using CACHED result`)
        return {
            ...cached.result,
            totalTimeMs: Date.now() - startTime
        }
    }

    try {
        // ═══════════════════════════════════════════════════════════════
        // STEP 1: BODY DETECTION
        // ═══════════════════════════════════════════════════════════════
        let detectionResult: BodyDetectionResult

        if (options.forceExtraction) {
            console.log(`   ⚡ Force extraction enabled — skipping detection`)
            detectionResult = {
                containsHuman: true,
                containsFace: true,
                confidence: 1.0,
                bodyType: 'full',
                detectedParts: ['forced'],
                recommendation: 'extract',
                reason: 'Force extraction enabled'
            }
        } else {
            console.log(`   🔍 Detecting human body...`)
            detectionResult = await detectHumanInClothingImage(clothingImageBase64)
            logBodyDetectionStatus(sessionId, detectionResult)
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 2: DECISION LOGIC
        // ═══════════════════════════════════════════════════════════════
        const shouldExtract =
            detectionResult.recommendation === 'extract' &&
            detectionResult.confidence >= DETECTION_THRESHOLD

        if (!shouldExtract) {
            console.log(`   ✅ No extraction needed — PASSTHROUGH`)
            const result: PreprocessResult = {
                processedImage: clothingImageBase64,
                wasExtracted: false,
                bodyDetected: detectionResult.containsHuman,
                confidence: detectionResult.confidence,
                extractionMethod: 'passthrough',
                detectionResult,
                totalTimeMs: Date.now() - startTime
            }

            // Cache result
            preprocessCache.set(cacheKey, { result, timestamp: Date.now() })

            return result
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 3: GARMENT ANALYSIS (optional, for better extraction)
        // ═══════════════════════════════════════════════════════════════
        let garmentAnalysis = options.garmentAnalysis

        if (!garmentAnalysis) {
            try {
                console.log(`   👔 Analyzing garment characteristics...`)
                garmentAnalysis = await analyzeGarmentForensic(clothingImageBase64)
            } catch (e) {
                console.warn(`   ⚠️ Garment analysis failed, continuing without it`)
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 3.5: STRICT GARMENT PROFILE EXTRACTION (for pattern/color accuracy)
        // ═══════════════════════════════════════════════════════════════
        let strictGarmentProfile: StrictGarmentProfile | undefined
        try {
            strictGarmentProfile = await extractStrictGarmentProfile(clothingImageBase64)
            logStrictGarmentStatus(sessionId, strictGarmentProfile)
        } catch (e) {
            console.warn(`   ⚠️ Strict garment profile extraction failed, continuing without it`)
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 4: GARMENT EXTRACTION
        // ═══════════════════════════════════════════════════════════════
        const extractionModel = options.model === 'pro'
            ? 'gemini-3-pro-image-preview'
            : 'gemini-2.5-flash-image'

        console.log(`   ✂️ Extracting garment (model: ${options.model || 'flash'})...`)

        const extractionResult = await extractGarmentWithFidelity({
            clothingImageBase64,
            garmentAnalysis,
            model: extractionModel
        })

        logGarmentExtractionStatus(sessionId, extractionResult)

        // ═══════════════════════════════════════════════════════════════
        // STEP 5: RETURN RESULT
        // ═══════════════════════════════════════════════════════════════
        const result: PreprocessResult = {
            processedImage: extractionResult.image,
            wasExtracted: true,
            bodyDetected: detectionResult.containsHuman,
            confidence: detectionResult.confidence,
            extractionMethod: options.model === 'pro' ? 'gemini-pro' : 'gemini-flash',
            detectionResult,
            extractionResult,
            garmentAnalysis,
            strictGarmentProfile,
            totalTimeMs: Date.now() - startTime
        }

        // Cache result
        preprocessCache.set(cacheKey, { result, timestamp: Date.now() })

        console.log(`   ✅ PREPROCESSING COMPLETE`)
        console.log(`   ═══════════════════════════════════════════════`)
        console.log(`   Total time: ${result.totalTimeMs}ms`)

        return result

    } catch (error) {
        console.error(`   ❌ PREPROCESSING FAILED:`, error)

        // On failure, pass through original to avoid blocking the pipeline
        console.log(`   ⚠️ Falling back to PASSTHROUGH`)

        return {
            processedImage: clothingImageBase64,
            wasExtracted: false,
            bodyDetected: false,
            confidence: 0,
            extractionMethod: 'passthrough',
            totalTimeMs: Date.now() - startTime
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a cache key from image content
 */
function generateCacheKey(imageBase64: string): string {
    // Use first and last 100 chars + length as a simple hash
    const clean = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    const start = clean.substring(0, 100)
    const end = clean.substring(clean.length - 100)
    return `${start}${end}${clean.length}`
}

/**
 * Clear the preprocessing cache
 */
export function clearPreprocessCache(): void {
    preprocessCache.clear()
    console.log('🗑️ Preprocessing cache cleared')
}

/**
 * Get cache statistics
 */
export function getPreprocessCacheStats(): { size: number; oldestMs: number } {
    let oldestTimestamp = Date.now()

    preprocessCache.forEach((entry) => {
        if (entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp
        }
    })

    return {
        size: preprocessCache.size,
        oldestMs: Date.now() - oldestTimestamp
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logPreprocessStatus(sessionId: string, result: PreprocessResult): void {
    console.log(`\n🔄 GARMENT PREPROCESSING RESULT [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   ✓ Body detected: ${result.bodyDetected ? 'YES' : 'NO'}`)
    console.log(`   ✓ Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    console.log(`   ✓ Extracted: ${result.wasExtracted ? 'YES' : 'NO (passthrough)'}`)
    console.log(`   ✓ Method: ${result.extractionMethod}`)
    console.log(`   ✓ Total time: ${result.totalTimeMs}ms`)
    console.log(`   ═══════════════════════════════════════════════`)
}
