/**
 * GARMENT TOPOLOGY CLASSIFIER
 * 
 * Deterministic garment type classification based on image analysis.
 * The model NEVER decides topology - the system does.
 * 
 * This is the single source of truth for garment structure.
 * 
 * Classification Rules:
 * - TOP_ONLY: garment ends above hip line (needs pants)
 * - DRESS: garment extends full length (no pants needed)
 * - TWO_PIECE: garment set has separate top and bottom
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Authoritative garment topology types.
 * This value is FINAL and cannot be overridden by the image model.
 */
export type GarmentTopology = 'TOP_ONLY' | 'DRESS' | 'TWO_PIECE'

export interface GarmentTopologyResult {
    /** Classified topology type */
    topology: GarmentTopology
    /** Confidence score (0-1) */
    confidence: number
    /** Human-readable classification reason */
    reason: string
    /** Raw coverage ratio for debugging */
    coverageRatio?: number
    /** Detected bottom edge position (0-1, from top) */
    bottomEdgeY?: number
    /** Whether pants are required in generation */
    requiresPants: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Coverage thresholds for topology classification.
 * These are HARD BOUNDARIES, not suggestions.
 */
const TOPOLOGY_THRESHOLDS = {
    /** Below this = definitely TOP_ONLY */
    TOP_ONLY_MAX_COVERAGE: 0.55,
    /** Above this = definitely DRESS */
    DRESS_MIN_COVERAGE: 0.80,
    /** Hip line position (relative, 0-1 from top) */
    ESTIMATED_HIP_LINE: 0.45,
    /** Minimum confidence to trust classification */
    MIN_CONFIDENCE: 0.7
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze garment image to detect vertical coverage.
 * Returns the ratio of image height that contains garment pixels.
 */
async function analyzeGarmentCoverage(imageBuffer: Buffer): Promise<{
    coverageRatio: number
    bottomEdgeY: number
    topEdgeY: number
    isFullLength: boolean
}> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        console.warn('⚠️ Sharp not available, using fallback coverage estimation')
        return {
            coverageRatio: 0.5,
            bottomEdgeY: 0.5,
            topEdgeY: 0.1,
            isFullLength: false
        }
    }

    try {
        const metadata = await sharp(imageBuffer).metadata()
        const width = metadata.width || 512
        const height = metadata.height || 512

        // Resize to smaller size for faster analysis
        const analysisBuffer = await sharp(imageBuffer)
            .resize(128, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // Analyze each row for garment presence
        const rowWidth = 128
        const rowCount = 128
        const rowBrightness: number[] = []

        // Calculate average brightness per row (center 60% of width)
        const leftMargin = Math.floor(rowWidth * 0.2)
        const rightMargin = Math.floor(rowWidth * 0.8)
        const centerWidth = rightMargin - leftMargin

        for (let y = 0; y < rowCount; y++) {
            let rowSum = 0
            for (let x = leftMargin; x < rightMargin; x++) {
                const idx = y * rowWidth + x
                rowSum += analysisBuffer[idx]
            }
            rowBrightness.push(rowSum / centerWidth)
        }

        // Find background brightness (use top 5% and bottom 5%)
        const topBg = rowBrightness.slice(0, 6).reduce((a, b) => a + b, 0) / 6
        const bottomBg = rowBrightness.slice(-6).reduce((a, b) => a + b, 0) / 6
        const bgBrightness = Math.max(topBg, bottomBg)

        // Detect garment rows (significantly different from background)
        const threshold = Math.abs(bgBrightness - 128) > 50
            ? bgBrightness * 0.7
            : bgBrightness - 30

        let topEdge = 0
        let bottomEdge = rowCount - 1

        // Find top edge of garment
        for (let y = 0; y < rowCount; y++) {
            if (Math.abs(rowBrightness[y] - bgBrightness) > 20) {
                topEdge = y
                break
            }
        }

        // Find bottom edge of garment
        for (let y = rowCount - 1; y >= 0; y--) {
            if (Math.abs(rowBrightness[y] - bgBrightness) > 20) {
                bottomEdge = y
                break
            }
        }

        // Calculate coverage
        const garmentHeight = bottomEdge - topEdge
        const coverageRatio = garmentHeight / rowCount
        const bottomEdgeY = bottomEdge / rowCount
        const topEdgeY = topEdge / rowCount

        // Check if it's full length (extends to bottom 15% of image)
        const isFullLength = bottomEdgeY > 0.85

        return {
            coverageRatio,
            bottomEdgeY,
            topEdgeY,
            isFullLength
        }
    } catch (error) {
        console.error('❌ Garment coverage analysis failed:', error)
        return {
            coverageRatio: 0.5,
            bottomEdgeY: 0.5,
            topEdgeY: 0.1,
            isFullLength: false
        }
    }
}

/**
 * Detect if garment image shows a two-piece set.
 * Looks for clear separation gap between top and bottom.
 */
async function detectTwoPiece(imageBuffer: Buffer): Promise<{
    isTwoPiece: boolean
    confidence: number
}> {
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        return { isTwoPiece: false, confidence: 0.5 }
    }

    try {
        // Analyze vertical middle strip for gaps
        const analysisBuffer = await sharp(imageBuffer)
            .resize(64, 128, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        const rowWidth = 64
        const rowCount = 128
        const centerWidth = 20  // Center strip

        // Calculate center-strip brightness per row
        const centerBrightness: number[] = []
        for (let y = 0; y < rowCount; y++) {
            let sum = 0
            for (let x = 22; x < 42; x++) {
                sum += analysisBuffer[y * rowWidth + x]
            }
            centerBrightness.push(sum / centerWidth)
        }

        // Look for gap in middle portion (40-60% of height)
        const midStart = Math.floor(rowCount * 0.4)
        const midEnd = Math.floor(rowCount * 0.6)
        const midRegion = centerBrightness.slice(midStart, midEnd)

        // Calculate variance in mid region - high variance suggests separation
        const midMean = midRegion.reduce((a, b) => a + b, 0) / midRegion.length
        let variance = 0
        for (const val of midRegion) {
            variance += Math.pow(val - midMean, 2)
        }
        variance /= midRegion.length

        // Look for clear brightness jump (gap between pieces)
        let maxJump = 0
        for (let i = 1; i < midRegion.length; i++) {
            const jump = Math.abs(midRegion[i] - midRegion[i - 1])
            maxJump = Math.max(maxJump, jump)
        }

        // Two-piece if there's significant gap
        const isTwoPiece = maxJump > 40 || variance > 400
        const confidence = Math.min(1, maxJump / 60)

        return { isTwoPiece, confidence }
    } catch {
        return { isTwoPiece: false, confidence: 0.5 }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CLASSIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Classify garment topology from image.
 * 
 * THIS IS DETERMINISTIC. The result is FINAL.
 * The image generation model MUST NOT override this classification.
 * 
 * @param garmentImage - Image buffer of the garment
 * @returns Classification result with topology and confidence
 */
export async function classifyGarmentTopology(
    garmentImage: Buffer
): Promise<GarmentTopologyResult> {
    console.log('\n👗 GARMENT TOPOLOGY CLASSIFICATION...')

    // Analyze coverage
    const coverage = await analyzeGarmentCoverage(garmentImage)
    console.log(`   Coverage ratio: ${(coverage.coverageRatio * 100).toFixed(1)}%`)
    console.log(`   Bottom edge: ${(coverage.bottomEdgeY * 100).toFixed(1)}% from top`)

    // Check for two-piece
    const twoPieceCheck = await detectTwoPiece(garmentImage)

    // Apply classification rules (DETERMINISTIC)
    let topology: GarmentTopology
    let reason: string
    let confidence: number

    // Rule 1: Explicit two-piece detection
    if (twoPieceCheck.isTwoPiece && twoPieceCheck.confidence > 0.6) {
        topology = 'TWO_PIECE'
        reason = 'Clear separation detected between top and bottom garments'
        confidence = twoPieceCheck.confidence
    }
    // Rule 2: Short coverage = TOP_ONLY
    else if (coverage.coverageRatio < TOPOLOGY_THRESHOLDS.TOP_ONLY_MAX_COVERAGE) {
        topology = 'TOP_ONLY'
        reason = `Garment coverage ${(coverage.coverageRatio * 100).toFixed(0)}% < ${TOPOLOGY_THRESHOLDS.TOP_ONLY_MAX_COVERAGE * 100}% threshold (top only)`
        confidence = Math.min(1, (TOPOLOGY_THRESHOLDS.TOP_ONLY_MAX_COVERAGE - coverage.coverageRatio) / 0.2 + 0.7)
    }
    // Rule 3: High coverage = DRESS
    else if (coverage.coverageRatio > TOPOLOGY_THRESHOLDS.DRESS_MIN_COVERAGE) {
        topology = 'DRESS'
        reason = `Garment coverage ${(coverage.coverageRatio * 100).toFixed(0)}% > ${TOPOLOGY_THRESHOLDS.DRESS_MIN_COVERAGE * 100}% threshold (full length)`
        confidence = Math.min(1, (coverage.coverageRatio - TOPOLOGY_THRESHOLDS.DRESS_MIN_COVERAGE) / 0.15 + 0.7)
    }
    // Rule 4: Bottom edge above hip line = TOP_ONLY
    else if (coverage.bottomEdgeY < TOPOLOGY_THRESHOLDS.ESTIMATED_HIP_LINE + 0.1) {
        topology = 'TOP_ONLY'
        reason = `Bottom edge ${(coverage.bottomEdgeY * 100).toFixed(0)}% above hip line (${TOPOLOGY_THRESHOLDS.ESTIMATED_HIP_LINE * 100}%)`
        confidence = 0.75
    }
    // Rule 5: Ambiguous middle range - assume TOP_ONLY to be safe (pants can be added)
    else {
        topology = 'TOP_ONLY'
        reason = 'Ambiguous coverage - defaulting to TOP_ONLY for safety (pants will be generated)'
        confidence = 0.6
    }

    // Determine if pants are required
    const requiresPants = topology === 'TOP_ONLY'

    const result: GarmentTopologyResult = {
        topology,
        confidence,
        reason,
        coverageRatio: coverage.coverageRatio,
        bottomEdgeY: coverage.bottomEdgeY,
        requiresPants
    }

    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📐 TOPOLOGY: ${topology}`)
    console.log(`   📐 CONFIDENCE: ${(confidence * 100).toFixed(0)}%`)
    console.log(`   📐 REASON: ${reason}`)
    console.log(`   👖 PANTS REQUIRED: ${requiresPants ? 'YES' : 'NO'}`)
    console.log(`   ═══════════════════════════════════════`)

    return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Quick check if garment is a top that needs pants.
 */
export async function isTopOnly(garmentImage: Buffer): Promise<boolean> {
    const result = await classifyGarmentTopology(garmentImage)
    return result.topology === 'TOP_ONLY'
}

/**
 * Log topology classification result.
 */
export function logTopologyClassification(result: GarmentTopologyResult): void {
    console.log('\n👗 GARMENT TOPOLOGY RESULT')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Topology: ${result.topology}`)
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`)
    console.log(`   Reason: ${result.reason}`)
    console.log(`   Requires Pants: ${result.requiresPants ? 'YES' : 'NO'}`)
    console.log('   ═══════════════════════════════════════════════')
}
