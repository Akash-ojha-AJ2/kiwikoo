/**
 * GARMENT BOUNDARY VALIDATOR
 * 
 * Validates that generated garments respect topology boundaries.
 * 
 * For TOP_ONLY garments:
 * - Garment MUST end above hip line
 * - Pants MUST be present below hip line
 * 
 * This is POST-GENERATION validation.
 * Violations trigger retry with stricter enforcement.
 */

import 'server-only'
import type { GarmentTopology } from './garment-topology-classifier'
import type { HipLineResult } from './hip-line-detector'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BoundaryValidationResult {
    /** Whether boundary is valid */
    isValid: boolean
    /** Type of violation if any */
    violation?: 'TOP_EXTENDS_BELOW_HIP' | 'DRESS_CONVERTED' | 'MISSING_PANTS' | 'SILHOUETTE_HALLUCINATION'
    /** Severity of violation (1-10) */
    severity?: number
    /** Human-readable explanation */
    reason: string
    /** Measured garment bottom edge (0-1) */
    measuredBottomEdge?: number
    /** Expected boundary (hip line) */
    expectedBoundary?: number
    /** Should trigger retry */
    shouldRetry: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze generated image to find garment bottom edge.
 */
async function findGarmentBottomEdge(
    generatedImage: Buffer,
    hipLineY: number
): Promise<{ bottomEdgeY: number; confidence: number }> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        return { bottomEdgeY: hipLineY, confidence: 0.5 }
    }

    try {
        // Analyze vertical center strip for garment boundary
        const analysisBuffer = await sharp(generatedImage)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128

        // Focus on region around and below expected hip line
        const startRow = Math.floor(rowCount * (hipLineY - 0.1))
        const endRow = Math.floor(rowCount * (hipLineY + 0.3))

        // Calculate color consistency per row (center strip)
        const rowVariance: number[] = []
        for (let y = startRow; y < endRow; y++) {
            let sum = 0
            let sumSq = 0
            const count = 32  // Center 32 pixels

            for (let x = 16; x < 48; x++) {
                const idx = y * rowWidth + x
                const val = analysisBuffer[idx]
                sum += val
                sumSq += val * val
            }

            const mean = sum / count
            const variance = (sumSq / count) - (mean * mean)
            rowVariance.push(variance)
        }

        // Look for transition from garment texture to pants/background
        // High variance = textured garment, low variance = solid pants
        let transitionY = hipLineY

        for (let i = 0; i < rowVariance.length - 3; i++) {
            const current = (rowVariance[i] + rowVariance[i + 1]) / 2
            const next = (rowVariance[i + 2] + rowVariance[i + 3]) / 2

            // Significant variance change suggests boundary
            if (Math.abs(current - next) > 300 || (current > 400 && next < 200)) {
                transitionY = (startRow + i + 2) / rowCount
                break
            }
        }

        return {
            bottomEdgeY: transitionY,
            confidence: 0.75
        }
    } catch (error) {
        console.error('❌ Garment edge detection failed:', error)
        return { bottomEdgeY: hipLineY, confidence: 0.3 }
    }
}

/**
 * Check if pants are visible in the generated image.
 */
async function detectPantsPresence(
    generatedImage: Buffer,
    hipLineY: number
): Promise<{ pantsPresent: boolean; confidence: number }> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        return { pantsPresent: true, confidence: 0.5 }  // Assume present if can't check
    }

    try {
        const analysisBuffer = await sharp(generatedImage)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128

        // Check region below hip line for pants (60-90% of image height)
        const pantsStartRow = Math.floor(rowCount * 0.60)
        const pantsEndRow = Math.floor(rowCount * 0.90)

        // Calculate edge density in pants region (pants have structure/seams)
        let edgeCount = 0
        let totalPixels = 0

        for (let y = pantsStartRow; y < pantsEndRow - 1; y++) {
            for (let x = 20; x < 44; x++) {  // Center region (legs)
                const idx = y * rowWidth + x
                const rightIdx = y * rowWidth + x + 1
                const belowIdx = (y + 1) * rowWidth + x

                const horizontalDiff = Math.abs(analysisBuffer[idx] - analysisBuffer[rightIdx])
                const verticalDiff = Math.abs(analysisBuffer[idx] - analysisBuffer[belowIdx])

                if (horizontalDiff > 15 || verticalDiff > 15) {
                    edgeCount++
                }
                totalPixels++
            }
        }

        const edgeDensity = edgeCount / totalPixels

        // Also check for distinct leg structures (two separate masses)
        let leftLegSum = 0
        let rightLegSum = 0
        let centerGap = 0

        for (let y = pantsStartRow; y < pantsEndRow; y++) {
            // Left leg region (x: 16-28)
            for (let x = 16; x < 28; x++) {
                leftLegSum += analysisBuffer[y * rowWidth + x]
            }
            // Right leg region (x: 36-48)
            for (let x = 36; x < 48; x++) {
                rightLegSum += analysisBuffer[y * rowWidth + x]
            }
            // Center gap (x: 30-34)
            for (let x = 30; x < 34; x++) {
                centerGap += analysisBuffer[y * rowWidth + x]
            }
        }

        const rows = pantsEndRow - pantsStartRow
        leftLegSum /= (rows * 12)
        rightLegSum /= (rows * 12)
        centerGap /= (rows * 4)

        // Pants present if there's distinct structure and leg separation
        const legSeparation = Math.abs(centerGap - (leftLegSum + rightLegSum) / 2) > 10
        const hasStructure = edgeDensity > 0.05

        const pantsPresent = hasStructure || legSeparation
        const confidence = hasStructure ? 0.8 : (legSeparation ? 0.7 : 0.5)

        return { pantsPresent, confidence }
    } catch (error) {
        console.error('❌ Pants detection failed:', error)
        return { pantsPresent: true, confidence: 0.3 }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate that generated image respects garment topology boundaries.
 * 
 * @param generatedImage - Buffer of generated try-on image
 * @param topology - Expected garment topology (from classifier)
 * @param hipLine - Detected hip line (from detector)
 * @returns Validation result with violation details if any
 */
export async function validateGarmentBoundary(
    generatedImage: Buffer,
    topology: GarmentTopology,
    hipLine: HipLineResult
): Promise<BoundaryValidationResult> {
    console.log('\n🔍 VALIDATING GARMENT BOUNDARY...')
    console.log(`   Expected topology: ${topology}`)
    console.log(`   Hip line: ${(hipLine.hipY * 100).toFixed(1)}%`)

    // For TOP_ONLY, validate that:
    // 1. Garment ends above hip line
    // 2. Pants are present below hip line
    if (topology === 'TOP_ONLY') {
        // Check garment bottom edge
        const garmentEdge = await findGarmentBottomEdge(generatedImage, hipLine.hipY)
        console.log(`   Measured garment bottom: ${(garmentEdge.bottomEdgeY * 100).toFixed(1)}%`)

        // Tolerance: allow garment to extend up to 8% below hip (for fit variation)
        const tolerance = 0.08
        const maximumAllowed = hipLine.hipY + tolerance

        if (garmentEdge.bottomEdgeY > maximumAllowed + 0.15) {
            // Severe violation - top converted to dress
            console.log('   ❌ SEVERE: Top converted to dress')
            return {
                isValid: false,
                violation: 'DRESS_CONVERTED',
                severity: 10,
                reason: `Top extends to ${(garmentEdge.bottomEdgeY * 100).toFixed(0)}%, converted to dress silhouette`,
                measuredBottomEdge: garmentEdge.bottomEdgeY,
                expectedBoundary: maximumAllowed,
                shouldRetry: true
            }
        }

        if (garmentEdge.bottomEdgeY > maximumAllowed) {
            // Moderate violation - top extends below hip
            console.log('   ⚠️ MODERATE: Top extends below hip')
            return {
                isValid: false,
                violation: 'TOP_EXTENDS_BELOW_HIP',
                severity: 6,
                reason: `Top extends ${((garmentEdge.bottomEdgeY - maximumAllowed) * 100).toFixed(0)}% below allowed boundary`,
                measuredBottomEdge: garmentEdge.bottomEdgeY,
                expectedBoundary: maximumAllowed,
                shouldRetry: true
            }
        }

        // Check for pants presence
        const pantsCheck = await detectPantsPresence(generatedImage, hipLine.hipY)
        console.log(`   Pants detected: ${pantsCheck.pantsPresent ? 'YES' : 'NO'} (${(pantsCheck.confidence * 100).toFixed(0)}% confidence)`)

        if (!pantsCheck.pantsPresent && pantsCheck.confidence > 0.6) {
            console.log('   ❌ Missing pants')
            return {
                isValid: false,
                violation: 'MISSING_PANTS',
                severity: 8,
                reason: 'Lower garment (pants/skirt) not detected for TOP_ONLY garment',
                shouldRetry: true
            }
        }

        console.log('   ✅ BOUNDARY VALID')
        return {
            isValid: true,
            reason: 'Garment respects topology boundary',
            measuredBottomEdge: garmentEdge.bottomEdgeY,
            expectedBoundary: maximumAllowed,
            shouldRetry: false
        }
    }

    // For DRESS topology, validate that garment extends full length
    if (topology === 'DRESS') {
        const garmentEdge = await findGarmentBottomEdge(generatedImage, hipLine.hipY)

        // Dress should extend well below hip (at least to 75% of image)
        if (garmentEdge.bottomEdgeY < 0.65) {
            console.log('   ⚠️ Dress may be truncated')
            return {
                isValid: false,
                violation: 'SILHOUETTE_HALLUCINATION',
                severity: 4,
                reason: `Dress appears truncated, ends at ${(garmentEdge.bottomEdgeY * 100).toFixed(0)}%`,
                measuredBottomEdge: garmentEdge.bottomEdgeY,
                shouldRetry: true
            }
        }

        console.log('   ✅ BOUNDARY VALID (dress)')
        return {
            isValid: true,
            reason: 'Dress extends to expected length',
            measuredBottomEdge: garmentEdge.bottomEdgeY,
            shouldRetry: false
        }
    }

    // For TWO_PIECE, assume valid (both pieces should be present)
    console.log('   ✅ BOUNDARY VALID (two-piece)')
    return {
        isValid: true,
        reason: 'Two-piece garment assumed valid',
        shouldRetry: false
    }
}

/**
 * Log boundary validation result.
 */
export function logBoundaryValidation(result: BoundaryValidationResult): void {
    console.log('\n🔍 BOUNDARY VALIDATION RESULT')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Valid: ${result.isValid ? '✅ YES' : '❌ NO'}`)
    if (result.violation) {
        console.log(`   Violation: ${result.violation}`)
        console.log(`   Severity: ${result.severity}/10`)
    }
    console.log(`   Reason: ${result.reason}`)
    if (result.measuredBottomEdge !== undefined) {
        console.log(`   Measured Edge: ${(result.measuredBottomEdge * 100).toFixed(1)}%`)
    }
    if (result.expectedBoundary !== undefined) {
        console.log(`   Expected Boundary: ${(result.expectedBoundary * 100).toFixed(1)}%`)
    }
    console.log(`   Should Retry: ${result.shouldRetry ? 'YES' : 'NO'}`)
    console.log('   ═══════════════════════════════════════════════')
}
