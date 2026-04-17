/**
 * HIP-LINE DETECTOR
 * 
 * Detects the hip line position in a person image.
 * This becomes a HARD GEOMETRIC BOUNDARY for garment validation.
 * 
 * For TOP_ONLY garments, the garment MUST end above this line.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface HipLineResult {
    /** Hip line Y position (0-1, from top of image) */
    hipY: number
    /** Confidence score (0-1) */
    confidence: number
    /** Detection method used */
    method: 'pose_estimation' | 'torso_ratio' | 'fallback'
    /** Additional landmarks if available */
    landmarks?: {
        shoulderY?: number
        waistY?: number
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Body proportion constants (based on human anatomy).
 * Hip line is approximately 50-55% from top for a standing person.
 */
const BODY_PROPORTIONS = {
    /** Head takes ~12% of body height */
    HEAD_RATIO: 0.12,
    /** Torso (shoulder to hip) takes ~30% of body height */
    TORSO_RATIO: 0.30,
    /** Hip line default position */
    DEFAULT_HIP_Y: 0.50,
    /** Shoulder line default position */
    DEFAULT_SHOULDER_Y: 0.18,
    /** Waist line default position */
    DEFAULT_WAIST_Y: 0.40
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect hip line using edge analysis (no ML required).
 * Looks for horizontal edges in the torso region.
 */
async function detectHipLineFromEdges(imageBuffer: Buffer): Promise<HipLineResult | null> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        return null
    }

    try {
        const metadata = await sharp(imageBuffer).metadata()
        const height = metadata.height || 512

        // Resize and convert to grayscale for edge detection
        const analysisBuffer = await sharp(imageBuffer)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128

        // Focus on torso region (20% to 70% of image height)
        const torsoStart = Math.floor(rowCount * 0.20)
        const torsoEnd = Math.floor(rowCount * 0.70)

        // Calculate horizontal edge strength per row (center strip)
        const edgeStrength: number[] = []
        for (let y = torsoStart; y < torsoEnd - 1; y++) {
            let strength = 0
            // Sample center 60% of width
            for (let x = 12; x < 52; x++) {
                const idx = y * rowWidth + x
                const below = (y + 1) * rowWidth + x
                strength += Math.abs(analysisBuffer[idx] - analysisBuffer[below])
            }
            edgeStrength.push(strength / 40)
        }

        // Find the strongest horizontal edge in hip region (40-60% of torso region)
        const hipRegionStart = Math.floor(edgeStrength.length * 0.35)
        const hipRegionEnd = Math.floor(edgeStrength.length * 0.65)

        let maxEdge = 0
        let maxEdgeY = hipRegionStart + Math.floor((hipRegionEnd - hipRegionStart) / 2)

        for (let i = hipRegionStart; i < hipRegionEnd; i++) {
            if (edgeStrength[i] > maxEdge) {
                maxEdge = edgeStrength[i]
                maxEdgeY = i
            }
        }

        // Convert back to normalized position
        const absoluteY = torsoStart + maxEdgeY
        const hipY = absoluteY / rowCount

        // Confidence based on edge strength
        const confidence = Math.min(1, maxEdge / 30)

        if (confidence > 0.3) {
            return {
                hipY,
                confidence,
                method: 'pose_estimation',
                landmarks: {
                    shoulderY: BODY_PROPORTIONS.DEFAULT_SHOULDER_Y,
                    waistY: hipY - 0.08
                }
            }
        }

        return null
    } catch (error) {
        console.error('❌ Edge-based hip detection failed:', error)
        return null
    }
}

/**
 * Detect body region and estimate hip line from proportions.
 */
async function estimateHipLineFromBody(imageBuffer: Buffer): Promise<HipLineResult> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        // Fallback to default proportions
        return {
            hipY: BODY_PROPORTIONS.DEFAULT_HIP_Y,
            confidence: 0.5,
            method: 'fallback'
        }
    }

    try {
        // Analyze vertical brightness distribution to find body bounds
        const analysisBuffer = await sharp(imageBuffer)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128

        // Find top of body (first row with significant non-background content)
        let topY = 0
        let bottomY = rowCount - 1

        // Calculate center-weighted average per row
        const rowAverages: number[] = []
        for (let y = 0; y < rowCount; y++) {
            let sum = 0
            let weight = 0
            for (let x = 16; x < 48; x++) {  // Center strip
                const idx = y * rowWidth + x
                const centerWeight = 1 - Math.abs(x - 32) / 32
                sum += analysisBuffer[idx] * centerWeight
                weight += centerWeight
            }
            rowAverages.push(sum / weight)
        }

        // Find background brightness (use corners)
        const bgBrightness = (rowAverages[0] + rowAverages[rowCount - 1]) / 2

        // Find body bounds
        const threshold = 20
        for (let y = 0; y < rowCount; y++) {
            if (Math.abs(rowAverages[y] - bgBrightness) > threshold) {
                topY = y
                break
            }
        }

        for (let y = rowCount - 1; y >= 0; y--) {
            if (Math.abs(rowAverages[y] - bgBrightness) > threshold) {
                bottomY = y
                break
            }
        }

        // Calculate body height and estimate hip line
        const bodyHeight = bottomY - topY

        // Hip is approximately 55% of body height from top
        // Adjust: if face is visible (topY is small), use different ratio
        let hipRatio = 0.55
        if (topY < rowCount * 0.15) {
            // Head visible, use anatomical proportions
            hipRatio = 0.48  // Hip relative to visible body
        }

        const hipY = (topY + bodyHeight * hipRatio) / rowCount

        return {
            hipY: Math.max(0.35, Math.min(0.65, hipY)),  // Clamp to reasonable range
            confidence: 0.7,
            method: 'torso_ratio',
            landmarks: {
                shoulderY: (topY + bodyHeight * 0.15) / rowCount,
                waistY: (topY + bodyHeight * 0.35) / rowCount
            }
        }
    } catch (error) {
        console.error('❌ Body proportion estimation failed:', error)
        return {
            hipY: BODY_PROPORTIONS.DEFAULT_HIP_Y,
            confidence: 0.5,
            method: 'fallback'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect hip line in a person image.
 * 
 * This position becomes a HARD BOUNDARY for garment validation.
 * For TOP_ONLY garments, the garment MUST NOT extend below this line.
 * 
 * @param personImage - Image buffer of the person
 * @returns Hip line detection result
 */
export async function detectHipLine(personImage: Buffer): Promise<HipLineResult> {
    console.log('\n📐 DETECTING HIP LINE...')

    // Try edge-based detection first
    const edgeResult = await detectHipLineFromEdges(personImage)

    if (edgeResult && edgeResult.confidence > 0.5) {
        console.log(`   Method: Edge detection`)
        console.log(`   Hip Y: ${(edgeResult.hipY * 100).toFixed(1)}% from top`)
        console.log(`   Confidence: ${(edgeResult.confidence * 100).toFixed(0)}%`)
        return edgeResult
    }

    // Fall back to proportion-based estimation
    const proportionResult = await estimateHipLineFromBody(personImage)

    console.log(`   Method: ${proportionResult.method}`)
    console.log(`   Hip Y: ${(proportionResult.hipY * 100).toFixed(1)}% from top`)
    console.log(`   Confidence: ${(proportionResult.confidence * 100).toFixed(0)}%`)

    return proportionResult
}

/**
 * Get a conservative hip line estimate (for strict enforcement).
 * Uses a slightly higher position to ensure tops don't extend too far.
 */
export async function getConservativeHipLine(personImage: Buffer): Promise<number> {
    const result = await detectHipLine(personImage)
    // Return a position 5% higher for conservative boundary
    return Math.max(0.35, result.hipY - 0.05)
}

/**
 * Log hip line detection result.
 */
export function logHipLineDetection(result: HipLineResult): void {
    console.log('\n📐 HIP LINE DETECTION RESULT')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Position: ${(result.hipY * 100).toFixed(1)}% from top`)
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    console.log(`   Method: ${result.method}`)
    if (result.landmarks) {
        if (result.landmarks.shoulderY !== undefined) {
            console.log(`   Shoulder Y: ${(result.landmarks.shoulderY * 100).toFixed(1)}%`)
        }
        if (result.landmarks.waistY !== undefined) {
            console.log(`   Waist Y: ${(result.landmarks.waistY * 100).toFixed(1)}%`)
        }
    }
    console.log('   ═══════════════════════════════════════════════')
}
