/**
 * INPUT COVERAGE DETECTOR
 * 
 * Detects what portion of the body is visible in the input image.
 * This determines what the model is ALLOWED to generate.
 * 
 * CORE PRINCIPLE:
 * If the camera didn't see it, the model must not invent it.
 * 
 * Coverage Types:
 * - FACE_ONLY: Only face visible → upper-body preview only
 * - UPPER_BODY: Face + shoulders → upper-body with fade
 * - FULL_BODY: Face + shoulders + hips → full try-on allowed
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Input coverage classification.
 * This value determines what the model is ALLOWED to generate.
 */
export type InputCoverage = 'FACE_ONLY' | 'UPPER_BODY' | 'FULL_BODY'

/**
 * Generation mode based on input coverage.
 */
export type GenerationMode =
    | 'UPPER_BODY_PREVIEW_ONLY'  // Face-only input
    | 'UPPER_BODY_WITH_FADE'     // Upper-body input
    | 'FULL_TRY_ON'              // Full-body input

export interface InputCoverageResult {
    /** Detected coverage type */
    coverage: InputCoverage
    /** Allowed generation mode */
    allowedMode: GenerationMode
    /** Visible body ratio (0-1) */
    visibleRatio: number
    /** Detected body landmarks */
    detectedLandmarks: string[]
    /** Confidence score (0-1) */
    confidence: number
    /** Whether full garments are allowed */
    allowsFullGarment: boolean
    /** Whether dress/full-length is allowed */
    allowsDress: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Body region detection thresholds.
 */
const BODY_REGIONS = {
    /** Face region: top 25% of image */
    FACE_END: 0.25,
    /** Shoulder region: 15-35% of image */
    SHOULDER_START: 0.15,
    SHOULDER_END: 0.35,
    /** Hip region: 40-55% of image */
    HIP_START: 0.40,
    HIP_END: 0.55,
    /** Knee region: 65-80% of image */
    KNEE_START: 0.65,
    KNEE_END: 0.80
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze image to detect body region coverage.
 */
async function analyzeBodyCoverage(imageBuffer: Buffer): Promise<{
    faceDetected: boolean
    shouldersDetected: boolean
    hipsDetected: boolean
    kneesDetected: boolean
    bottomEdgeY: number
    bodyHeight: number
}> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        console.warn('⚠️ Sharp not available, using fallback detection')
        return {
            faceDetected: true,
            shouldersDetected: true,
            hipsDetected: true,
            kneesDetected: false,
            bottomEdgeY: 0.6,
            bodyHeight: 0.5
        }
    }

    try {
        const metadata = await sharp(imageBuffer).metadata()
        const width = metadata.width || 512
        const height = metadata.height || 512

        // Resize for analysis
        const analysisBuffer = await sharp(imageBuffer)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128

        // Calculate center-weighted brightness per row
        const rowActivity: number[] = []
        for (let y = 0; y < rowCount; y++) {
            let edgeSum = 0
            for (let x = 16; x < 48; x++) {
                const idx = y * rowWidth + x
                const rightIdx = y * rowWidth + x + 1
                if (x < 47) {
                    edgeSum += Math.abs(analysisBuffer[idx] - analysisBuffer[rightIdx])
                }
            }
            rowActivity.push(edgeSum / 31)
        }

        // Find top and bottom of body content
        const bgThreshold = 5
        let topBody = 0
        let bottomBody = rowCount - 1

        // Find face (expect high activity near top)
        let faceDetected = false
        const faceRegion = rowActivity.slice(0, Math.floor(rowCount * BODY_REGIONS.FACE_END))
        const maxFaceActivity = Math.max(...faceRegion)
        if (maxFaceActivity > 10) {
            faceDetected = true
            for (let y = 0; y < faceRegion.length; y++) {
                if (faceRegion[y] > bgThreshold) {
                    topBody = y
                    break
                }
            }
        }

        // Find bottom of body
        for (let y = rowCount - 1; y >= 0; y--) {
            if (rowActivity[y] > bgThreshold) {
                bottomBody = y
                break
            }
        }

        const bodyHeight = (bottomBody - topBody) / rowCount
        const bottomEdgeY = bottomBody / rowCount

        // Detect shoulder region (activity in 15-35% range)
        const shoulderRegion = rowActivity.slice(
            Math.floor(rowCount * BODY_REGIONS.SHOULDER_START),
            Math.floor(rowCount * BODY_REGIONS.SHOULDER_END)
        )
        const shouldersDetected = Math.max(...shoulderRegion) > 8

        // Detect hip region (activity in 40-55% range)
        const hipRegion = rowActivity.slice(
            Math.floor(rowCount * BODY_REGIONS.HIP_START),
            Math.floor(rowCount * BODY_REGIONS.HIP_END)
        )
        const hipsDetected = Math.max(...hipRegion) > 6

        // Detect knee region (activity in 65-80% range)
        const kneeRegion = rowActivity.slice(
            Math.floor(rowCount * BODY_REGIONS.KNEE_START),
            Math.floor(rowCount * BODY_REGIONS.KNEE_END)
        )
        const kneesDetected = Math.max(...kneeRegion) > 5

        return {
            faceDetected,
            shouldersDetected,
            hipsDetected,
            kneesDetected,
            bottomEdgeY,
            bodyHeight
        }
    } catch (error) {
        console.error('❌ Body coverage analysis failed:', error)
        return {
            faceDetected: true,
            shouldersDetected: true,
            hipsDetected: false,
            kneesDetected: false,
            bottomEdgeY: 0.5,
            bodyHeight: 0.4
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect input image coverage.
 * 
 * This classification determines what the model is ALLOWED to generate.
 * The model MUST NOT override this classification.
 * 
 * @param personImage - Buffer of the input person image
 * @returns Coverage result with allowed generation mode
 */
export async function detectInputCoverage(
    personImage: Buffer
): Promise<InputCoverageResult> {
    console.log('\n📷 DETECTING INPUT COVERAGE...')

    const analysis = await analyzeBodyCoverage(personImage)

    // Build detected landmarks list
    const detectedLandmarks: string[] = []
    if (analysis.faceDetected) detectedLandmarks.push('face')
    if (analysis.shouldersDetected) detectedLandmarks.push('shoulders')
    if (analysis.hipsDetected) detectedLandmarks.push('hips')
    if (analysis.kneesDetected) detectedLandmarks.push('knees')

    // Apply classification rules (DETERMINISTIC)
    let coverage: InputCoverage
    let allowedMode: GenerationMode
    let confidence: number

    // Rule 1: Full body - all major landmarks visible
    if (analysis.faceDetected && analysis.shouldersDetected &&
        analysis.hipsDetected && analysis.bodyHeight > 0.6) {
        coverage = 'FULL_BODY'
        allowedMode = 'FULL_TRY_ON'
        confidence = Math.min(1, analysis.bodyHeight + 0.3)
        console.log('   ✅ FULL_BODY detected - full try-on allowed')
    }
    // Rule 2: Upper body - face + shoulders, but no/limited hips
    else if (analysis.faceDetected && analysis.shouldersDetected) {
        if (analysis.hipsDetected && analysis.bodyHeight > 0.45) {
            coverage = 'FULL_BODY'
            allowedMode = 'FULL_TRY_ON'
            confidence = 0.7
            console.log('   ✅ FULL_BODY detected (with visible hips)')
        } else {
            coverage = 'UPPER_BODY'
            allowedMode = 'UPPER_BODY_WITH_FADE'
            confidence = 0.8
            console.log('   ⚠️ UPPER_BODY detected - lower fade required')
        }
    }
    // Rule 3: Face only - only face visible
    else if (analysis.faceDetected) {
        coverage = 'FACE_ONLY'
        allowedMode = 'UPPER_BODY_PREVIEW_ONLY'
        confidence = 0.9
        console.log('   ⚠️ FACE_ONLY detected - preview mode only')
    }
    // Rule 4: Unknown - default to safest option
    else {
        coverage = 'FACE_ONLY'
        allowedMode = 'UPPER_BODY_PREVIEW_ONLY'
        confidence = 0.5
        console.log('   ⚠️ Unknown coverage - defaulting to preview mode')
    }

    const result: InputCoverageResult = {
        coverage,
        allowedMode,
        visibleRatio: analysis.bodyHeight,
        detectedLandmarks,
        confidence,
        allowsFullGarment: coverage === 'FULL_BODY',
        allowsDress: coverage === 'FULL_BODY'
    }

    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📷 COVERAGE: ${coverage}`)
    console.log(`   📷 ALLOWED MODE: ${allowedMode}`)
    console.log(`   📷 VISIBLE RATIO: ${(result.visibleRatio * 100).toFixed(0)}%`)
    console.log(`   📷 LANDMARKS: ${detectedLandmarks.join(', ')}`)
    console.log(`   👗 ALLOWS DRESS: ${result.allowsDress ? 'YES' : 'NO'}`)
    console.log(`   ═══════════════════════════════════════`)

    return result
}

/**
 * Check if input allows full garment generation.
 */
export async function allowsFullGarment(personImage: Buffer): Promise<boolean> {
    const result = await detectInputCoverage(personImage)
    return result.allowsFullGarment
}

/**
 * Get generation mode from coverage.
 */
export function getGenerationMode(coverage: InputCoverage): GenerationMode {
    switch (coverage) {
        case 'FACE_ONLY':
            return 'UPPER_BODY_PREVIEW_ONLY'
        case 'UPPER_BODY':
            return 'UPPER_BODY_WITH_FADE'
        case 'FULL_BODY':
            return 'FULL_TRY_ON'
    }
}

/**
 * Log coverage detection result.
 */
export function logCoverageDetection(result: InputCoverageResult): void {
    console.log('\n📷 INPUT COVERAGE RESULT')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Coverage: ${result.coverage}`)
    console.log(`   Allowed Mode: ${result.allowedMode}`)
    console.log(`   Visible Ratio: ${(result.visibleRatio * 100).toFixed(0)}%`)
    console.log(`   Landmarks: ${result.detectedLandmarks.join(', ')}`)
    console.log(`   Allows Full Garment: ${result.allowsFullGarment ? 'YES' : 'NO'}`)
    console.log(`   Allows Dress: ${result.allowsDress ? 'YES' : 'NO'}`)
    console.log('   ═══════════════════════════════════════════════')
}
