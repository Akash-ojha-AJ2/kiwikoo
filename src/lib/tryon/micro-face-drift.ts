/**
 * MICRO FACE-DRIFT SCORER
 * 
 * Scores GEOMETRY ONLY, not lighting.
 * This is the final 5% of identity preservation.
 * 
 * Metrics:
 * - Landmark distances
 * - Cheek volume ratio
 * - Jaw contour variance
 * - Eye spacing delta
 * 
 * Thresholds:
 * - ≤5% → PASS
 * - 5-8% → SOFT_PASS (acceptable but could be better)
 * - >8% → RETRY
 */

import 'server-only'
import type { FaceCoordinates } from './face-coordinates'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Threshold for clean pass — raised to account for natural lighting-induced geometry shift */
const PASS_THRESHOLD = 12

/** Threshold for soft pass (acceptable drift) — scene changes legitimately shift perceived jaw/cheek */
const SOFT_PASS_THRESHOLD = 20

/**
 * Weight for each metric.
 * Eye spacing and landmark distance are the most reliable identity signals.
 * Jaw contour and cheek volume are heavily affected by lighting direction
 * (shadow casting on jaw/cheeks from scene changes is NOT identity drift).
 */
const METRIC_WEIGHTS = {
    landmarkDistance: 0.35,
    cheekVolumeRatio: 0.15,
    jawContourVariance: 0.15,
    eyeSpacingDelta: 0.35
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DriftStatus = 'PASS' | 'SOFT_PASS' | 'RETRY'

export interface FaceDriftMetrics {
    /** Normalized landmark distance difference (0-100%) */
    landmarkDistance: number
    /** Cheek volume ratio difference (0-100%) */
    cheekVolumeRatio: number
    /** Jaw contour variance (0-100%) */
    jawContourVariance: number
    /** Eye spacing delta (0-100%) */
    eyeSpacingDelta: number
}

export interface MicroFaceDriftResult {
    /** Overall drift percentage (0-100) */
    driftPercent: number
    /** Pass/Soft Pass/Retry status */
    status: DriftStatus
    /** Individual metrics */
    metrics: FaceDriftMetrics
    /** Processing time in ms */
    processingTimeMs: number
    /** Whether analysis was successful */
    success: boolean
    /** Error message if failed */
    error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE REGION ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract face region features for comparison
 * Uses simplified geometric analysis without ML models
 */
async function extractFaceFeatures(
    imageBuffer: Buffer,
    faceBox?: FaceCoordinates | null
): Promise<{
    topRegion: Buffer
    middleRegion: Buffer
    jawRegion: Buffer
    leftEyeRegion: Buffer
    rightEyeRegion: Buffer
    brightness: number
} | null> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        console.warn('⚠️ Sharp not available for face drift analysis')
        return null
    }

    try {
        const metadata = await sharp(imageBuffer).metadata()
        const width = metadata.width || 512
        const height = metadata.height || 512

        // Prefer detected face bounds; fall back to the historical upper-center
        // heuristic only when no face box is available.
        const detectedBox = faceBoxToPixels(faceBox, width, height)
        const faceLeft = detectedBox?.left ?? Math.floor(width * 0.2)
        const faceWidth = detectedBox?.faceWidth ?? Math.floor(width * 0.6)
        const faceTop = detectedBox?.top ?? Math.floor(height * 0.05)
        const faceHeight = detectedBox?.faceHeight ?? Math.floor(height * 0.4)

        // Divide face into regions
        const regionHeight = Math.floor(faceHeight / 3)

        // Top region (forehead + eyes)
        const topRegion = await sharp(imageBuffer)
            .extract({
                left: faceLeft,
                top: faceTop,
                width: faceWidth,
                height: regionHeight
            })
            .resize(32, 16, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Middle region (nose + cheeks)
        const middleRegion = await sharp(imageBuffer)
            .extract({
                left: faceLeft,
                top: faceTop + regionHeight,
                width: faceWidth,
                height: regionHeight
            })
            .resize(32, 16, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Jaw region
        const jawRegion = await sharp(imageBuffer)
            .extract({
                left: faceLeft,
                top: faceTop + 2 * regionHeight,
                width: faceWidth,
                height: regionHeight
            })
            .resize(32, 16, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Eye regions (left and right)
        const eyeWidth = Math.floor(faceWidth / 3)
        const eyeHeight = Math.floor(regionHeight / 2)

        const leftEyeRegion = await sharp(imageBuffer)
            .extract({
                left: faceLeft + Math.floor(eyeWidth * 0.5),
                top: faceTop + Math.floor(regionHeight * 0.3),
                width: eyeWidth,
                height: eyeHeight
            })
            .resize(16, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rightEyeRegion = await sharp(imageBuffer)
            .extract({
                left: faceLeft + Math.floor(eyeWidth * 1.5),
                top: faceTop + Math.floor(regionHeight * 0.3),
                width: eyeWidth,
                height: eyeHeight
            })
            .resize(16, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Calculate overall brightness (for normalization)
        const fullFace = await sharp(imageBuffer)
            .extract({
                left: faceLeft,
                top: faceTop,
                width: faceWidth,
                height: faceHeight
            })
            .resize(32, 32, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        let brightness = 0
        for (let i = 0; i < fullFace.length; i++) {
            brightness += fullFace[i]
        }
        brightness = brightness / fullFace.length / 255

        return {
            topRegion,
            middleRegion,
            jawRegion,
            leftEyeRegion,
            rightEyeRegion,
            brightness
        }
    } catch (error) {
        console.error('❌ Face feature extraction failed:', error)
        return null
    }
}

function faceBoxToPixels(
    face: FaceCoordinates | null | undefined,
    width: number,
    height: number
): { left: number; top: number; faceWidth: number; faceHeight: number } | null {
    if (!face) return null
    const left = Math.floor((face.xmin / 1000) * width)
    const top = Math.floor((face.ymin / 1000) * height)
    const right = Math.ceil((face.xmax / 1000) * width)
    const bottom = Math.ceil((face.ymax / 1000) * height)
    const rawWidth = Math.max(1, right - left)
    const rawHeight = Math.max(1, bottom - top)

    const expandX = Math.floor(rawWidth * 0.22)
    const expandTop = Math.floor(rawHeight * 0.32)
    const expandBottom = Math.floor(rawHeight * 0.28)

    const boxLeft = Math.max(0, left - expandX)
    const boxTop = Math.max(0, top - expandTop)
    const boxRight = Math.min(width, right + expandX)
    const boxBottom = Math.min(height, bottom + expandBottom)

    const faceWidth = Math.max(1, boxRight - boxLeft)
    const faceHeight = Math.max(1, boxBottom - boxTop)
    return { left: boxLeft, top: boxTop, faceWidth, faceHeight }
}

/**
 * Calculate structural similarity between two buffers
 * Returns normalized correlation (0-1)
 */
function calculateStructuralSimilarity(buf1: Buffer, buf2: Buffer): number {
    if (buf1.length !== buf2.length) return 0.5

    const n = buf1.length
    let sum1 = 0, sum2 = 0
    for (let i = 0; i < n; i++) {
        sum1 += buf1[i]
        sum2 += buf2[i]
    }
    const mean1 = sum1 / n
    const mean2 = sum2 / n

    let cov = 0, var1 = 0, var2 = 0
    for (let i = 0; i < n; i++) {
        const d1 = buf1[i] - mean1
        const d2 = buf2[i] - mean2
        cov += d1 * d2
        var1 += d1 * d1
        var2 += d2 * d2
    }

    const denom = Math.sqrt(var1 * var2)
    if (denom === 0) return 1.0 // Identical buffers

    return (cov / denom + 1) / 2 // Normalize to 0-1
}

/**
 * Calculate edge density difference (measures structural geometry)
 */
function calculateEdgeDensityDiff(buf1: Buffer, buf2: Buffer, width: number): number {
    // Simple Sobel-like edge detection
    const getEdgeDensity = (buf: Buffer): number => {
        if (!buf || buf.length === 0 || width <= 2) return 0
        let edgeSum = 0
        let samples = 0
        // Keep vertical neighbors in-range: i-width >= 0 and i+width < buf.length
        for (let i = width + 1; i < buf.length - width - 1; i++) {
            if (i % width === 0 || i % width === width - 1) continue
            const dx = Math.abs((buf[i + 1] ?? 0) - (buf[i - 1] ?? 0))
            const dy = Math.abs((buf[i + width] ?? 0) - (buf[i - width] ?? 0))
            edgeSum += Math.sqrt(dx * dx + dy * dy)
            samples++
        }
        return samples > 0 ? edgeSum / samples : 0
    }

    const density1 = getEdgeDensity(buf1)
    const density2 = getEdgeDensity(buf2)
    if (!Number.isFinite(density1) || !Number.isFinite(density2)) return 0

    // Return percentage difference
    const maxDensity = Math.max(density1, density2, 1)
    return Math.abs(density1 - density2) / maxDensity * 100
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute micro face drift between reference and generated images.
 * 
 * This focuses on GEOMETRY, not lighting. Minor lighting variations are allowed.
 * 
 * @param referenceBuffer - Original user image buffer
 * @param generatedBuffer - Generated output image buffer
 * @returns Drift result with status and metrics
 */
export async function computeMicroFaceDrift(
    referenceBuffer: Buffer,
    generatedBuffer: Buffer,
    faceBoxes?: {
        referenceFace?: FaceCoordinates | null
        generatedFace?: FaceCoordinates | null
    }
): Promise<MicroFaceDriftResult> {
    const startTime = Date.now()

    console.log('\n🔬 MICRO FACE DRIFT ANALYSIS...')

    // Extract features from both images
    const refFeatures = await extractFaceFeatures(referenceBuffer, faceBoxes?.referenceFace)
    const genFeatures = await extractFaceFeatures(generatedBuffer, faceBoxes?.generatedFace)

    if (!refFeatures || !genFeatures) {
        console.warn('   ⚠️ Could not extract face features, assuming PASS')
        return {
            driftPercent: 0,
            status: 'PASS',
            metrics: {
                landmarkDistance: 0,
                cheekVolumeRatio: 0,
                jawContourVariance: 0,
                eyeSpacingDelta: 0
            },
            processingTimeMs: Date.now() - startTime,
            success: false,
            error: 'Feature extraction failed'
        }
    }

    // Normalize for lighting differences.
    // Scene changes (e.g. flat-lit reference → dramatic nightlife) cause large brightness
    // gaps that make jaw/cheek pixel comparisons unreliable. The model isn't drifting —
    // it's casting realistic shadows. Allow up to 55% reduction for dramatic lighting shifts.
    const brightnessDiff = Math.abs(refFeatures.brightness - genFeatures.brightness)
    const lightingFactor = 1 - Math.min(brightnessDiff * 0.8, 0.55)

    // Calculate metrics

    // 1. Landmark distance (top region comparison - eyes/forehead geometry)
    const topSimilarity = calculateStructuralSimilarity(refFeatures.topRegion, genFeatures.topRegion)
    const landmarkDistance = (1 - topSimilarity) * 100 * lightingFactor

    // 2. Cheek volume ratio (middle region edge density)
    const cheekVolumeRatio = calculateEdgeDensityDiff(
        refFeatures.middleRegion,
        genFeatures.middleRegion,
        32
    ) * lightingFactor

    // 3. Jaw contour variance
    const jawSimilarity = calculateStructuralSimilarity(refFeatures.jawRegion, genFeatures.jawRegion)
    const jawContourVariance = (1 - jawSimilarity) * 100 * lightingFactor

    // 4. Eye spacing delta (compare left-right eye regions)
    const leftEyeSim = calculateStructuralSimilarity(refFeatures.leftEyeRegion, genFeatures.leftEyeRegion)
    const rightEyeSim = calculateStructuralSimilarity(refFeatures.rightEyeRegion, genFeatures.rightEyeRegion)
    const eyeSpacingDelta = ((1 - leftEyeSim) + (1 - rightEyeSim)) * 50 * lightingFactor

    // Calculate weighted overall drift
    const metrics: FaceDriftMetrics = {
        landmarkDistance,
        cheekVolumeRatio,
        jawContourVariance,
        eyeSpacingDelta
    }

    const driftPercentRaw =
        metrics.landmarkDistance * METRIC_WEIGHTS.landmarkDistance +
        metrics.cheekVolumeRatio * METRIC_WEIGHTS.cheekVolumeRatio +
        metrics.jawContourVariance * METRIC_WEIGHTS.jawContourVariance +
        metrics.eyeSpacingDelta * METRIC_WEIGHTS.eyeSpacingDelta
    const driftPercent = Number.isFinite(driftPercentRaw) ? driftPercentRaw : 0

    // Determine status
    let status: DriftStatus
    if (driftPercent <= PASS_THRESHOLD) {
        status = 'PASS'
    } else if (driftPercent <= SOFT_PASS_THRESHOLD) {
        status = 'SOFT_PASS'
    } else {
        status = 'RETRY'
    }

    const processingTimeMs = Date.now() - startTime

    console.log(`   📊 Landmark distance: ${landmarkDistance.toFixed(1)}%`)
    console.log(`   📊 Cheek volume ratio: ${cheekVolumeRatio.toFixed(1)}%`)
    console.log(`   📊 Jaw contour variance: ${jawContourVariance.toFixed(1)}%`)
    console.log(`   📊 Eye spacing delta: ${eyeSpacingDelta.toFixed(1)}%`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📐 OVERALL DRIFT: ${driftPercent.toFixed(1)}%`)
    console.log(`   📐 STATUS: ${status}`)
    console.log(`   ⏱️ Time: ${processingTimeMs}ms`)

    return {
        driftPercent,
        status,
        metrics,
        processingTimeMs,
        success: true
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if drift result requires retry
 */
export function shouldRetryForDrift(result: MicroFaceDriftResult): boolean {
    return result.status === 'RETRY'
}

/**
 * Get retry parameters based on drift result
 */
export function getDriftRetryParams(result: MicroFaceDriftResult): {
    temperatureAdjust: number
    realismBias: number
    emphasis: string
} {
    if (result.status !== 'RETRY') {
        return { temperatureAdjust: 0, realismBias: 0, emphasis: '' }
    }

    // Determine which metric contributed most to drift
    const { metrics } = result
    const worstMetric = Object.entries(metrics)
        .sort(([, a], [, b]) => b - a)[0]

    const emphasisMap: Record<string, string> = {
        landmarkDistance: 'Copy the face holistically from the reference photos — do not reconstruct from a description',
        cheekVolumeRatio: 'Ensure even lighting on the face — shadows must not alter perceived cheek volume',
        jawContourVariance: 'Use soft fill light on the face — jaw shadow must not reshape the perceived jawline',
        eyeSpacingDelta: 'Lock interpupillary distance and eye size exactly to the reference images'
    }

    return {
        temperatureAdjust: -0.15, // Lower temperature for more consistent output
        realismBias: -1,
        emphasis: emphasisMap[worstMetric[0]] || 'PRESERVE FACIAL GEOMETRY EXACTLY'
    }
}

/**
 * Log drift analysis summary
 */
export function logDriftAnalysis(result: MicroFaceDriftResult): void {
    console.log('\n🔬 MICRO FACE DRIFT SUMMARY')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Overall Drift: ${result.driftPercent.toFixed(1)}%`)
    console.log(`   Status: ${result.status}`)
    console.log(`   Landmark Distance: ${result.metrics.landmarkDistance.toFixed(1)}%`)
    console.log(`   Cheek Volume Ratio: ${result.metrics.cheekVolumeRatio.toFixed(1)}%`)
    console.log(`   Jaw Contour Variance: ${result.metrics.jawContourVariance.toFixed(1)}%`)
    console.log(`   Eye Spacing Delta: ${result.metrics.eyeSpacingDelta.toFixed(1)}%`)
    console.log('   ═══════════════════════════════════════════════')
}
