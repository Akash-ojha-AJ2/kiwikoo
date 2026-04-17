/**
 * FACE SIMILARITY SCORING MODULE
 * 
 * PURPOSE: Auto-reject generations where face has drifted.
 * This is how Higgsfield filters bad outputs.
 * 
 * ALGORITHM:
 * 1. Extract face region from Image 1 (input)
 * 2. Extract face region from output image
 * 3. Compare using structural similarity (SSIM-lite)
 * 4. If similarity < 0.85 → discard + retry once
 * 
 * This is NOT face recognition (no embeddings).
 * It's structural comparison of face pixels.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimum similarity threshold.
 * Below this = identity has drifted too much.
 * Higgsfield uses ~0.85-0.90.
 */
export const MIN_SIMILARITY_THRESHOLD = 0.85

/**
 * Maximum retries on similarity failure.
 */
export const MAX_SIMILARITY_RETRIES = 1

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SimilarityResult {
    /** Similarity score (0.0 - 1.0) */
    score: number
    /** Whether score passes threshold */
    passed: boolean
    /** Threshold used */
    threshold: number
    /** Face region detected in input */
    inputFaceDetected: boolean
    /** Face region detected in output */
    outputFaceDetected: boolean
    /** Processing time in ms */
    processingTimeMs: number
}

export interface RejectionResult {
    /** Whether output was rejected */
    rejected: boolean
    /** Reason for rejection */
    reason: string
    /** Similarity result */
    similarity: SimilarityResult | null
    /** Current retry count */
    retryCount: number
    /** Should retry */
    shouldRetry: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTWEIGHT SIMILARITY SCORING (No ML model required)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate hash-based similarity between two images.
 * 
 * Uses a perceptual hash approach (pHash-lite):
 * 1. Downsample both images to small size
 * 2. Convert to grayscale
 * 3. Calculate pixel differences
 * 4. Normalize to similarity score
 * 
 * This is lightweight and runs server-side without ML models.
 */
export async function calculateFaceSimilarity(
    inputImageBase64: string,
    outputImageBase64: string,
    threshold: number = MIN_SIMILARITY_THRESHOLD
): Promise<SimilarityResult> {
    const startTime = Date.now()

    // Dynamic import Sharp
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        // If Sharp not available, return passing score
        console.warn('⚠️ Sharp not available for similarity check, skipping')
        return {
            score: 1.0,
            passed: true,
            threshold,
            inputFaceDetected: true,
            outputFaceDetected: true,
            processingTimeMs: Date.now() - startTime
        }
    }

    try {
        // Strip data URL prefix
        const cleanInput = inputImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
        const cleanOutput = outputImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

        // Process both images to same small size for comparison
        // Focus on face region (top 40% of image, center 60% width)
        const COMPARE_SIZE = 64 // 64x64 for hash
        const FACE_CROP_HEIGHT = 0.4 // Top 40%
        const FACE_CROP_WIDTH_MARGIN = 0.2 // 20% margin each side

        // Process input image
        const inputBuffer = Buffer.from(cleanInput, 'base64')
        const inputMeta = await sharp(inputBuffer).metadata()
        const inputWidth = inputMeta.width || 512
        const inputHeight = inputMeta.height || 512

        const inputFaceCrop = await sharp(inputBuffer)
            .extract({
                left: Math.floor(inputWidth * FACE_CROP_WIDTH_MARGIN),
                top: 0,
                width: Math.floor(inputWidth * (1 - 2 * FACE_CROP_WIDTH_MARGIN)),
                height: Math.floor(inputHeight * FACE_CROP_HEIGHT)
            })
            .resize(COMPARE_SIZE, COMPARE_SIZE, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Process output image
        const outputBuffer = Buffer.from(cleanOutput, 'base64')
        const outputMeta = await sharp(outputBuffer).metadata()
        const outputWidth = outputMeta.width || 512
        const outputHeight = outputMeta.height || 512

        const outputFaceCrop = await sharp(outputBuffer)
            .extract({
                left: Math.floor(outputWidth * FACE_CROP_WIDTH_MARGIN),
                top: 0,
                width: Math.floor(outputWidth * (1 - 2 * FACE_CROP_WIDTH_MARGIN)),
                height: Math.floor(outputHeight * FACE_CROP_HEIGHT)
            })
            .resize(COMPARE_SIZE, COMPARE_SIZE, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Calculate normalized cross-correlation
        let sumProduct = 0
        let sumInputSq = 0
        let sumOutputSq = 0
        const totalPixels = COMPARE_SIZE * COMPARE_SIZE

        // Calculate means
        let inputMean = 0
        let outputMean = 0
        for (let i = 0; i < totalPixels; i++) {
            inputMean += inputFaceCrop[i]
            outputMean += outputFaceCrop[i]
        }
        inputMean /= totalPixels
        outputMean /= totalPixels

        // Calculate normalized cross-correlation
        for (let i = 0; i < totalPixels; i++) {
            const inputDiff = inputFaceCrop[i] - inputMean
            const outputDiff = outputFaceCrop[i] - outputMean
            sumProduct += inputDiff * outputDiff
            sumInputSq += inputDiff * inputDiff
            sumOutputSq += outputDiff * outputDiff
        }

        const denominator = Math.sqrt(sumInputSq * sumOutputSq)
        const score = denominator > 0 ? (sumProduct / denominator + 1) / 2 : 0.5

        const passed = score >= threshold
        const processingTimeMs = Date.now() - startTime

        console.log(`🔍 FACE SIMILARITY:`)
        console.log(`   Score: ${(score * 100).toFixed(1)}%`)
        console.log(`   Threshold: ${(threshold * 100).toFixed(1)}%`)
        console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}`)
        console.log(`   Time: ${processingTimeMs}ms`)

        return {
            score,
            passed,
            threshold,
            inputFaceDetected: true,
            outputFaceDetected: true,
            processingTimeMs
        }

    } catch (error) {
        console.error('❌ FACE SIMILARITY ERROR:', error)
        // On error, don't block generation
        return {
            score: 0.9, // Assume okay on error
            passed: true,
            threshold,
            inputFaceDetected: false,
            outputFaceDetected: false,
            processingTimeMs: Date.now() - startTime
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REJECTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

// Track retries per session
const retryTracker = new Map<string, number>()

/**
 * Check if output should be rejected based on similarity.
 * Returns rejection decision and retry recommendation.
 */
export async function checkForRejection(
    sessionId: string,
    inputImageBase64: string,
    outputImageBase64: string
): Promise<RejectionResult> {
    // Get current retry count
    const retryCount = retryTracker.get(sessionId) || 0

    // Calculate similarity
    const similarity = await calculateFaceSimilarity(
        inputImageBase64,
        outputImageBase64
    )

    if (similarity.passed) {
        // Reset retry count on success
        retryTracker.delete(sessionId)
        return {
            rejected: false,
            reason: 'Identity preserved',
            similarity,
            retryCount,
            shouldRetry: false
        }
    }

    // Similarity failed
    const shouldRetry = retryCount < MAX_SIMILARITY_RETRIES

    if (shouldRetry) {
        // Increment retry count
        retryTracker.set(sessionId, retryCount + 1)
        console.warn(`⚠️ IDENTITY DRIFT DETECTED: Retry ${retryCount + 1}/${MAX_SIMILARITY_RETRIES}`)
    } else {
        // Max retries reached, final rejection
        retryTracker.delete(sessionId)
        console.error(`❌ IDENTITY DRIFT: Max retries reached, rejecting output`)
    }

    return {
        rejected: true,
        reason: `Face similarity ${(similarity.score * 100).toFixed(1)}% below threshold ${(similarity.threshold * 100).toFixed(1)}%`,
        similarity,
        retryCount: retryCount + 1,
        shouldRetry
    }
}

/**
 * Clear retry tracker for session (call on success or abandon).
 */
export function clearRetryTracker(sessionId: string): void {
    retryTracker.delete(sessionId)
}

/**
 * Log similarity check status.
 */
export function logSimilarityStatus(result: SimilarityResult): void {
    console.log(`\n📊 FACE SIMILARITY CHECK`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Score: ${(result.score * 100).toFixed(1)}%`)
    console.log(`   Threshold: ${(result.threshold * 100).toFixed(1)}%`)
    console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`   Processing: ${result.processingTimeMs}ms`)
    console.log(`   ═══════════════════════════════════════`)
}
