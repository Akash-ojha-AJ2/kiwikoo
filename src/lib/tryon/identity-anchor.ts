/**
 * IDENTITY ANCHOR MODULE
 * 
 * Multi-image identity anchoring logic.
 * Selects the best identity anchor from multiple input images.
 * 
 * PART 6 of the Identity-Safe Try-On System
 * 
 * Selection criteria:
 * - Highest face sharpness
 * - Frontal orientation
 * - Neutral lighting
 * - Minimal occlusion
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type FaceOrientation = 'frontal' | 'three_quarter' | 'profile' | 'unknown'
export type OcclusionLevel = 'none' | 'minimal' | 'partial' | 'heavy'

export interface IdentityAnchor {
    /** Index of the selected primary image (1-based) */
    primaryImageIndex: number
    /** Face sharpness score (0-100) */
    faceSharpness: number
    /** Detected face orientation */
    orientation: FaceOrientation
    /** Lighting neutrality score (0-100, higher = more neutral) */
    lightingNeutrality: number
    /** Level of face occlusion */
    occlusionLevel: OcclusionLevel
    /** Overall anchor quality score (0-100) */
    qualityScore: number
    /** Reason for selection */
    selectionReason: string
}

export interface ImageAnalysis {
    /** Sharpness score (0-100) */
    sharpness: number
    /** Brightness (0-255) */
    brightness: number
    /** Contrast (0-100) */
    contrast: number
    /** Face region coverage (0-1) */
    faceCoverage: number
    /** Estimated orientation */
    orientation: FaceOrientation
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const WEIGHTS = {
    sharpness: 0.35,
    orientation: 0.25,
    lighting: 0.20,
    coverage: 0.20
}

const ORIENTATION_SCORES: Record<FaceOrientation, number> = {
    frontal: 100,
    three_quarter: 70,
    profile: 30,
    unknown: 50
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze image for identity anchor selection.
 */
async function analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysis | null> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        console.warn('⚠️ Sharp not available for image analysis')
        return null
    }

    try {
        const metadata = await sharp(imageBuffer).metadata()
        const width = metadata.width || 512
        const height = metadata.height || 512

        // Calculate face region (assuming face in upper center)
        const faceRegion = await sharp(imageBuffer)
            .extract({
                left: Math.floor(width * 0.2),
                top: Math.floor(height * 0.05),
                width: Math.floor(width * 0.6),
                height: Math.floor(height * 0.4)
            })
            .resize(64, 64, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Calculate sharpness (Laplacian variance)
        let laplacianSum = 0
        let laplacianSqSum = 0
        for (let i = 1; i < faceRegion.length - 1; i++) {
            if (i % 64 === 0 || i % 64 === 63) continue
            const laplacian = -4 * faceRegion[i] +
                faceRegion[i - 1] + faceRegion[i + 1] +
                faceRegion[i - 64] + faceRegion[i + 64]
            laplacianSum += laplacian
            laplacianSqSum += laplacian * laplacian
        }
        const n = faceRegion.length - 128
        const variance = (laplacianSqSum / n) - Math.pow(laplacianSum / n, 2)
        const sharpness = Math.min(100, Math.sqrt(variance) / 2)

        // Calculate brightness and contrast
        let sum = 0
        let min = 255
        let max = 0
        for (let i = 0; i < faceRegion.length; i++) {
            sum += faceRegion[i]
            min = Math.min(min, faceRegion[i])
            max = Math.max(max, faceRegion[i])
        }
        const brightness = sum / faceRegion.length
        const contrast = ((max - min) / 255) * 100

        // Estimate face coverage (edge density in face region)
        let edgeCount = 0
        const edgeThreshold = 30
        for (let i = 1; i < faceRegion.length - 1; i++) {
            if (Math.abs(faceRegion[i] - faceRegion[i - 1]) > edgeThreshold) {
                edgeCount++
            }
        }
        const faceCoverage = Math.min(1, edgeCount / (faceRegion.length * 0.2))

        // Estimate orientation (compare left/right symmetry)
        const leftHalf = faceRegion.slice(0, 32 * 64)
        const rightHalf = faceRegion.slice(32 * 64)
        let asymmetry = 0
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 32; x++) {
                const leftIdx = y * 32 + x
                const rightIdx = y * 32 + (31 - x)
                if (leftIdx < leftHalf.length && rightIdx < rightHalf.length) {
                    asymmetry += Math.abs(leftHalf[leftIdx] - rightHalf[rightIdx])
                }
            }
        }
        const normalizedAsymmetry = asymmetry / (32 * 64 * 255)

        let orientation: FaceOrientation
        if (normalizedAsymmetry < 0.05) {
            orientation = 'frontal'
        } else if (normalizedAsymmetry < 0.15) {
            orientation = 'three_quarter'
        } else if (normalizedAsymmetry < 0.3) {
            orientation = 'profile'
        } else {
            orientation = 'unknown'
        }

        return {
            sharpness,
            brightness,
            contrast,
            faceCoverage,
            orientation
        }
    } catch (error) {
        console.error('❌ Image analysis failed:', error)
        return null
    }
}

/**
 * Calculate lighting neutrality score.
 * Higher = more neutral lighting (good for identity anchor).
 */
function calculateLightingNeutrality(analysis: ImageAnalysis): number {
    // Ideal brightness is around 128 (middle gray)
    const brightnessPenalty = Math.abs(analysis.brightness - 128) / 128 * 30

    // Good contrast is 30-70%
    let contrastPenalty = 0
    if (analysis.contrast < 30) {
        contrastPenalty = (30 - analysis.contrast) / 2
    } else if (analysis.contrast > 70) {
        contrastPenalty = (analysis.contrast - 70) / 2
    }

    return Math.max(0, 100 - brightnessPenalty - contrastPenalty)
}

/**
 * Estimate occlusion level from face coverage.
 */
function estimateOcclusionLevel(faceCoverage: number): OcclusionLevel {
    if (faceCoverage > 0.8) return 'none'
    if (faceCoverage > 0.6) return 'minimal'
    if (faceCoverage > 0.4) return 'partial'
    return 'heavy'
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select the best identity anchor from multiple input images.
 * 
 * Image roles:
 * - Image 1: Primary identity candidate
 * - Image 2: Secondary identity (same person, different angle/clarity)
 * - Image 3: Garment only (excluded from identity selection)
 * 
 * @param images - Array of image buffers (may include garment image)
 * @param excludeGarmentIndex - Index of garment-only image to exclude (usually 2)
 * @returns Best identity anchor selection
 */
export async function selectBestIdentityAnchor(
    images: Buffer[],
    excludeGarmentIndex: number = 2
): Promise<IdentityAnchor> {
    console.log('\n🎯 SELECTING IDENTITY ANCHOR...')

    // Default to first image if only one provided
    if (images.length <= 1) {
        console.log('   Only 1 image provided, using as primary anchor')
        return {
            primaryImageIndex: 1,
            faceSharpness: 100,
            orientation: 'frontal',
            lightingNeutrality: 100,
            occlusionLevel: 'none',
            qualityScore: 100,
            selectionReason: 'Only image provided'
        }
    }

    // Analyze eligible images (exclude garment-only image)
    const analyses: Array<{ index: number; analysis: ImageAnalysis | null }> = []

    for (let i = 0; i < images.length; i++) {
        if (i === excludeGarmentIndex) {
            console.log(`   Image ${i + 1}: SKIPPED (garment only)`)
            continue
        }

        const analysis = await analyzeImage(images[i])
        analyses.push({ index: i, analysis })

        if (analysis) {
            console.log(`   Image ${i + 1}: sharpness=${analysis.sharpness.toFixed(1)}, orientation=${analysis.orientation}`)
        }
    }

    // Score each image
    let bestScore = -1
    let bestIndex = 0
    let bestAnalysis: ImageAnalysis | null = null

    for (const { index, analysis } of analyses) {
        if (!analysis) continue

        const orientationScore = ORIENTATION_SCORES[analysis.orientation]
        const lightingNeutrality = calculateLightingNeutrality(analysis)
        const coverageScore = analysis.faceCoverage * 100

        const score =
            analysis.sharpness * WEIGHTS.sharpness +
            orientationScore * WEIGHTS.orientation +
            lightingNeutrality * WEIGHTS.lighting +
            coverageScore * WEIGHTS.coverage

        console.log(`   Image ${index + 1} score: ${score.toFixed(1)}`)

        if (score > bestScore) {
            bestScore = score
            bestIndex = index
            bestAnalysis = analysis
        }
    }

    if (!bestAnalysis) {
        console.log('   ⚠️ No valid analysis, defaulting to Image 1')
        return {
            primaryImageIndex: 1,
            faceSharpness: 50,
            orientation: 'unknown',
            lightingNeutrality: 50,
            occlusionLevel: 'minimal',
            qualityScore: 50,
            selectionReason: 'Default (analysis unavailable)'
        }
    }

    const lightingNeutrality = calculateLightingNeutrality(bestAnalysis)
    const occlusionLevel = estimateOcclusionLevel(bestAnalysis.faceCoverage)

    const selectionReasons: string[] = []
    if (bestAnalysis.sharpness > 70) selectionReasons.push('high sharpness')
    if (bestAnalysis.orientation === 'frontal') selectionReasons.push('frontal orientation')
    if (lightingNeutrality > 70) selectionReasons.push('neutral lighting')
    if (occlusionLevel === 'none') selectionReasons.push('no occlusion')

    const anchor: IdentityAnchor = {
        primaryImageIndex: bestIndex + 1, // 1-based index
        faceSharpness: bestAnalysis.sharpness,
        orientation: bestAnalysis.orientation,
        lightingNeutrality,
        occlusionLevel,
        qualityScore: bestScore,
        selectionReason: selectionReasons.join(', ') || 'Best available'
    }

    console.log(`\n   ✅ SELECTED: Image ${anchor.primaryImageIndex}`)
    console.log(`      Quality: ${anchor.qualityScore.toFixed(1)}%`)
    console.log(`      Reason: ${anchor.selectionReason}`)

    return anchor
}

/**
 * Build identity anchor prompt block.
 */
export function buildIdentityAnchorPromptBlock(anchor: IdentityAnchor): string {
    return `
IDENTITY ANCHOR: Image ${anchor.primaryImageIndex}

This image has been selected as the identity authority because:
- Face sharpness: ${anchor.faceSharpness.toFixed(0)}%
- Orientation: ${anchor.orientation}
- Lighting neutrality: ${anchor.lightingNeutrality.toFixed(0)}%
- Occlusion: ${anchor.occlusionLevel}

ALL facial geometry must be copied from Image ${anchor.primaryImageIndex}.
`.trim()
}

/**
 * Log identity anchor selection.
 */
export function logIdentityAnchor(anchor: IdentityAnchor): void {
    console.log('\n🎯 IDENTITY ANCHOR')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Primary Image: ${anchor.primaryImageIndex}`)
    console.log(`   Face Sharpness: ${anchor.faceSharpness.toFixed(1)}%`)
    console.log(`   Orientation: ${anchor.orientation}`)
    console.log(`   Lighting Neutrality: ${anchor.lightingNeutrality.toFixed(1)}%`)
    console.log(`   Occlusion: ${anchor.occlusionLevel}`)
    console.log(`   Quality Score: ${anchor.qualityScore.toFixed(1)}%`)
    console.log(`   Selection Reason: ${anchor.selectionReason}`)
    console.log('   ═══════════════════════════════════════════════')
}
