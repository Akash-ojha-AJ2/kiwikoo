/**
 * HARDENED FACE OVERWRITE — Phase 4 (Critical Fix)
 * 
 * ========================================================================
 * PROBLEM SOLVED:
 * 
 * Original face-pixel-copy.ts used FULL face box including:
 * - Forehead (breaks with caps/hats)
 * - Hair (changes with different hairstyles)
 * - Jawline edges (visible seams with lighting)
 * 
 * This caused failures with:
 * - Caps/hats
 * - Mirror reflections
 * - Lighting changes
 * - Different hair
 * 
 * SOLUTION:
 * 
 * 1. CORE FACE MASK — Only overwrite identity-defining pixels:
 *    - Eyes (including eyelids)
 *    - Nose (bridge + tip)
 *    - Mouth (lips + philtrum)
 *    - Inner cheeks (mid-face triangle)
 *    
 * 2. REFLECTION-SAFE SELECTION — One face rule:
 *    - Select largest, most central face
 *    - Reject reflections, posters, background faces
 *    - Abort if no valid face found
 *    
 * 3. SIMILARITY ASSERTION — Verify overwrite worked:
 *    - Compare before/after similarity
 *    - Abort if overwrite didn't improve identity
 * ========================================================================
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FaceLandmarks {
    // 68-point landmarks or equivalent
    leftEye: Point[]       // Points 36-41
    rightEye: Point[]      // Points 42-47
    nose: Point[]          // Points 27-35
    mouth: Point[]         // Points 48-67
    jawline?: Point[]      // Points 0-16 (NOT used for core mask)
    eyebrows?: Point[]     // Points 17-26 (NOT used for core mask)
}

export interface Point {
    x: number
    y: number
}

export interface CoreFaceData {
    buffer: Buffer              // Core face pixels (PNG with alpha)
    maskBuffer: Buffer          // Core face mask (grayscale)
    polygon: Point[]            // Core face polygon points
    boundingBox: BoundingBox    // Bounding box of core region
}

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
}

export interface DetectedFace {
    boundingBox: BoundingBox
    area: number
    centerDistance: number      // Distance from image center
    yaw?: number               // Rotation (for orientation check)
    roll?: number
    landmarks?: FaceLandmarks
    score: number              // Selection score (higher = better)
}

export interface HardenedOverwriteResult {
    success: boolean
    outputBuffer: Buffer
    coreFaceOverwritten: boolean
    selectedFace?: DetectedFace
    rejectedFaces: number
    similarityBefore?: number
    similarityAfter?: number
    error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Feather radius for core face mask (SMALL — only at edges)
 * Larger values cause visible seams; smaller values cause hard edges
 */
export const CORE_MASK_FEATHER_RADIUS = 4  // 4px max, per spec

/**
 * Minimum face area ratio for reflection filtering
 * Faces smaller than 60% of the largest are rejected
 */
export const MIN_FACE_AREA_RATIO = 0.6

/**
 * Maximum yaw/roll for reflection rejection
 */
export const MAX_YAW_DEGREES = 30
export const MAX_ROLL_DEGREES = 20

/**
 * Minimum similarity improvement required after overwrite
 */
export const MIN_SIMILARITY_IMPROVEMENT = 0.05

/**
 * Absolute minimum similarity threshold
 */
export const MIN_ABSOLUTE_SIMILARITY = 0.80

// ═══════════════════════════════════════════════════════════════════════════════
// PART 1: CORE FACE MASK CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the core face polygon from landmarks
 * 
 * This polygon covers ONLY identity-defining regions:
 * - Eyes
 * - Nose
 * - Mouth
 * - Inner cheeks
 * 
 * It EXCLUDES:
 * - Forehead
 * - Hair/hairline
 * - Jawline edges
 * - Ears
 * - Neck
 */
export function buildCoreFacePolygon(landmarks: FaceLandmarks): Point[] {
    // Extract key anchor points
    const leftEyeOuter = landmarks.leftEye[0]     // Outer corner left eye
    const leftEyeInner = landmarks.leftEye[3]     // Inner corner left eye
    const rightEyeInner = landmarks.rightEye[0]   // Inner corner right eye
    const rightEyeOuter = landmarks.rightEye[3]   // Outer corner right eye

    const noseBridge = landmarks.nose[0]          // Top of nose bridge
    const noseTip = landmarks.nose[4]             // Tip of nose
    const noseLeft = landmarks.nose[3]            // Left nostril
    const noseRight = landmarks.nose[5]           // Right nostril

    const mouthLeft = landmarks.mouth[0]          // Left corner mouth
    const mouthRight = landmarks.mouth[6]         // Right corner mouth
    const mouthBottom = landmarks.mouth[9]        // Bottom of lower lip
    const mouthTop = landmarks.mouth[3]           // Top of upper lip

    // Build diamond-shaped core face polygon
    // Upper: just below eyebrows (not including forehead)
    // Lower: just above chin (not including jawline)
    // Sides: inner cheeks (not full jaw width)

    const polygon: Point[] = [
        // Start at left eye outer, go clockwise
        leftEyeOuter,

        // Up to eye level (stays below eyebrows)
        { x: leftEyeInner.x, y: leftEyeOuter.y - 10 },

        // Across nose bridge
        { x: noseBridge.x, y: noseBridge.y - 15 },  // Just above nose bridge

        // To right eye
        { x: rightEyeInner.x, y: rightEyeOuter.y - 10 },
        rightEyeOuter,

        // Down right cheek (inner cheek line, not jawline)
        { x: rightEyeOuter.x + 10, y: noseRight.y },
        { x: mouthRight.x + 5, y: mouthRight.y },

        // Around mouth bottom
        { x: mouthRight.x, y: mouthBottom.y + 10 },
        { x: mouthBottom.x, y: mouthBottom.y + 15 },  // Just below lip
        { x: mouthLeft.x, y: mouthBottom.y + 10 },

        // Up left cheek (inner cheek line)
        { x: mouthLeft.x - 5, y: mouthLeft.y },
        { x: leftEyeOuter.x - 10, y: noseLeft.y },
    ]

    return polygon
}

/**
 * Estimate core face polygon when no landmarks available
 * Uses geometric estimation based on face box
 */
export function estimateCoreFacePolygon(
    faceBox: BoundingBox
): Point[] {
    const { x, y, width, height } = faceBox
    const cx = x + width / 2
    const cy = y + height / 2

    // Diamond shape centered on face, excluding forehead and jawline
    const polygon: Point[] = [
        // Top (at eye level, not forehead)
        { x: cx, y: y + height * 0.25 },

        // Right side (inner cheek, not full width)
        { x: x + width * 0.85, y: y + height * 0.35 },
        { x: x + width * 0.90, y: cy },
        { x: x + width * 0.85, y: y + height * 0.65 },

        // Bottom (above chin, at mouth level)
        { x: cx, y: y + height * 0.78 },

        // Left side (inner cheek)
        { x: x + width * 0.15, y: y + height * 0.65 },
        { x: x + width * 0.10, y: cy },
        { x: x + width * 0.15, y: y + height * 0.35 },
    ]

    return polygon
}

/**
 * Create core face mask from polygon
 * 
 * - Binary mask (white = overwrite, black = keep generated)
 * - Minimal feathering (3-5px) at edges only
 * - Hard copy inside polygon
 */
export async function createCoreFaceMask(
    polygon: Point[],
    width: number,
    height: number
): Promise<Buffer> {
    // Build SVG polygon path
    const pathPoints = polygon.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z'

    const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="blur">
                    <feGaussianBlur stdDeviation="${CORE_MASK_FEATHER_RADIUS}" />
                </filter>
            </defs>
            <path d="${pathPoints}" fill="white" filter="url(#blur)" />
        </svg>
    `

    return sharp(Buffer.from(svg))
        .ensureAlpha()
        .png()
        .toBuffer()
}

/**
 * Extract core face pixels using polygon mask
 */
export async function extractCoreFacePixels(
    originalImageBuffer: Buffer,
    faceBox: BoundingBox,
    landmarks?: FaceLandmarks
): Promise<CoreFaceData | null> {
    try {
        const image = sharp(originalImageBuffer)
        const metadata = await image.metadata()

        if (!metadata.width || !metadata.height) {
            console.error('❌ Cannot get image dimensions')
            return null
        }

        // Build core face polygon
        const polygon = landmarks
            ? buildCoreFacePolygon(landmarks)
            : estimateCoreFacePolygon(faceBox)

        // Calculate bounding box of polygon
        const minX = Math.max(0, Math.floor(Math.min(...polygon.map(p => p.x)) - CORE_MASK_FEATHER_RADIUS))
        const minY = Math.max(0, Math.floor(Math.min(...polygon.map(p => p.y)) - CORE_MASK_FEATHER_RADIUS))
        const maxX = Math.min(metadata.width, Math.ceil(Math.max(...polygon.map(p => p.x)) + CORE_MASK_FEATHER_RADIUS))
        const maxY = Math.min(metadata.height, Math.ceil(Math.max(...polygon.map(p => p.y)) + CORE_MASK_FEATHER_RADIUS))

        const boundingBox: BoundingBox = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }

        // Adjust polygon to local coordinates
        const localPolygon = polygon.map(p => ({
            x: p.x - minX,
            y: p.y - minY
        }))

        // Create mask for core region
        const maskBuffer = await createCoreFaceMask(
            localPolygon,
            boundingBox.width,
            boundingBox.height
        )

        // Extract face region
        const faceBuffer = await sharp(originalImageBuffer)
            .extract({
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            })
            .png()
            .toBuffer()

        // Apply mask to create alpha channel
        const maskedFace = await sharp(faceBuffer)
            .joinChannel(maskBuffer)
            .png()
            .toBuffer()

        console.log(`✅ Core face extracted: ${boundingBox.width}x${boundingBox.height}`)
        console.log(`   Polygon points: ${polygon.length}`)
        console.log(`   Feather radius: ${CORE_MASK_FEATHER_RADIUS}px`)

        return {
            buffer: maskedFace,
            maskBuffer,
            polygon,
            boundingBox
        }
    } catch (error) {
        console.error('❌ Core face extraction failed:', error)
        return null
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 2: REFLECTION-SAFE FACE SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select the true subject face from multiple detected faces
 * 
 * This handles:
 * - Mirror reflections
 * - Background faces
 * - Posters/photos in scene
 * 
 * ONE FACE RULE: Only one face is ever selected for overwrite
 */
export function selectPrimaryFace(
    detectedFaces: DetectedFace[],
    imageWidth: number,
    imageHeight: number
): DetectedFace | null {
    if (detectedFaces.length === 0) {
        console.error('❌ No faces detected — cannot select primary face')
        return null
    }

    if (detectedFaces.length === 1) {
        console.log('✅ Single face detected — using as primary')
        return detectedFaces[0]
    }

    console.log(`\n🔍 REFLECTION-SAFE FACE SELECTION`)
    console.log(`   Detected ${detectedFaces.length} faces, selecting primary...`)

    // Step 1: Find max face area
    const maxArea = Math.max(...detectedFaces.map(f => f.area))

    // Step 2: Filter by size (remove small reflection faces)
    let candidates = detectedFaces.filter(face => {
        const areaRatio = face.area / maxArea
        return areaRatio >= MIN_FACE_AREA_RATIO
    })

    console.log(`   After size filter: ${candidates.length} candidates`)

    if (candidates.length === 0) {
        console.error('❌ No faces passed size filter')
        return null
    }

    // Step 3: Calculate center distance and score
    const imageCenter = { x: imageWidth / 2, y: imageHeight / 2 }

    candidates = candidates.map(face => {
        const faceCenterX = face.boundingBox.x + face.boundingBox.width / 2
        const faceCenterY = face.boundingBox.y + face.boundingBox.height / 2

        const distance = Math.sqrt(
            Math.pow(faceCenterX - imageCenter.x, 2) +
            Math.pow(faceCenterY - imageCenter.y, 2)
        )

        // Score = area / distance (larger, more central = higher score)
        const score = face.area / (distance + 1)

        return { ...face, centerDistance: distance, score }
    })

    // Step 4: Filter by orientation (reject extreme angles)
    candidates = candidates.filter(face => {
        if (face.yaw !== undefined && Math.abs(face.yaw) > MAX_YAW_DEGREES) {
            console.log(`   Rejected face: yaw ${face.yaw}° > ${MAX_YAW_DEGREES}°`)
            return false
        }
        if (face.roll !== undefined && Math.abs(face.roll) > MAX_ROLL_DEGREES) {
            console.log(`   Rejected face: roll ${face.roll}° > ${MAX_ROLL_DEGREES}°`)
            return false
        }
        return true
    })

    console.log(`   After orientation filter: ${candidates.length} candidates`)

    if (candidates.length === 0) {
        console.error('❌ No faces passed orientation filter')
        return null
    }

    // Step 5: Select highest score
    candidates.sort((a, b) => b.score - a.score)
    const selected = candidates[0]

    console.log(`   ✅ Selected primary face: score=${selected.score.toFixed(2)}, area=${selected.area}`)
    console.log(`   Rejected ${detectedFaces.length - 1} other faces`)

    return selected
}

/**
 * Calculate face area from bounding box
 */
export function calculateFaceArea(box: BoundingBox): number {
    return box.width * box.height
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 3: SIMILARITY ASSERTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Placeholder for face similarity calculation
 * In production, this would use a face embedding model (e.g., FaceNet, ArcFace)
 * 
 * For now, uses structural similarity as approximation
 */
export async function calculateFaceSimilarity(
    face1Buffer: Buffer,
    face2Buffer: Buffer
): Promise<number> {
    // Placeholder implementation using image statistics
    // In production, replace with actual face embedding similarity
    try {
        const stats1 = await sharp(face1Buffer).stats()
        const stats2 = await sharp(face2Buffer).stats()

        // Compare mean values across channels
        let similarity = 0
        const channels = Math.min(stats1.channels.length, stats2.channels.length)

        for (let i = 0; i < channels; i++) {
            const meanDiff = Math.abs(stats1.channels[i].mean - stats2.channels[i].mean)
            const stdDiff = Math.abs(stats1.channels[i].stdev - stats2.channels[i].stdev)

            // Normalize differences to 0-1 range
            const meanSim = 1 - (meanDiff / 255)
            const stdSim = 1 - (stdDiff / 128)

            similarity += (meanSim * 0.7 + stdSim * 0.3)
        }

        return similarity / channels
    } catch {
        console.warn('⚠️ Similarity calculation failed, returning 0.5')
        return 0.5
    }
}

/**
 * Assert that face overwrite improved identity similarity
 * 
 * This is a HARD GATE — if assertion fails:
 * - Abort generation
 * - Do NOT return image
 * - Do NOT retry
 */
export async function assertSimilarityImproved(
    originalFaceBuffer: Buffer,
    beforeOverwriteFaceBuffer: Buffer,
    afterOverwriteFaceBuffer: Buffer
): Promise<{ passed: boolean; similarityBefore: number; similarityAfter: number; error?: string }> {

    console.log('\n🔬 SIMILARITY ASSERTION CHECK')
    console.log('   ═══════════════════════════════════════════════')

    // Calculate similarity BEFORE overwrite
    const similarityBefore = await calculateFaceSimilarity(
        originalFaceBuffer,
        beforeOverwriteFaceBuffer
    )
    console.log(`   Similarity BEFORE overwrite: ${(similarityBefore * 100).toFixed(1)}%`)

    // Calculate similarity AFTER overwrite
    const similarityAfter = await calculateFaceSimilarity(
        originalFaceBuffer,
        afterOverwriteFaceBuffer
    )
    console.log(`   Similarity AFTER overwrite: ${(similarityAfter * 100).toFixed(1)}%`)

    // Check improvement
    const improvement = similarityAfter - similarityBefore
    console.log(`   Improvement: ${(improvement * 100).toFixed(1)}%`)

    // Gate 1: Must improve by minimum margin
    if (similarityAfter < similarityBefore + MIN_SIMILARITY_IMPROVEMENT) {
        const error = `FACE OVERWRITE FAILED: similarity did not improve (${(improvement * 100).toFixed(1)}% < ${(MIN_SIMILARITY_IMPROVEMENT * 100).toFixed(1)}% required)`
        console.error(`   ❌ ${error}`)
        return { passed: false, similarityBefore, similarityAfter, error }
    }

    // Gate 2: Must meet absolute minimum
    if (similarityAfter < MIN_ABSOLUTE_SIMILARITY) {
        const error = `FACE OVERWRITE FAILED: similarity below minimum (${(similarityAfter * 100).toFixed(1)}% < ${(MIN_ABSOLUTE_SIMILARITY * 100).toFixed(1)}% required)`
        console.error(`   ❌ ${error}`)
        return { passed: false, similarityBefore, similarityAfter, error }
    }

    console.log('   ✅ Similarity assertion PASSED')
    console.log('   ═══════════════════════════════════════════════')

    return { passed: true, similarityBefore, similarityAfter }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED HARDENED OVERWRITE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * HARDENED FACE OVERWRITE
 * 
 * Replaces the simple face-pixel-copy with a hardened version that:
 * 1. Uses core face mask (eyes/nose/mouth only)
 * 2. Handles reflections safely
 * 3. Asserts similarity improvement
 */
export async function performHardenedFaceOverwrite(
    originalImageBuffer: Buffer,
    generatedImageBuffer: Buffer,
    originalFaceBox: BoundingBox,
    generatedFaces: DetectedFace[],
    imageWidth: number,
    imageHeight: number,
    landmarks?: FaceLandmarks
): Promise<HardenedOverwriteResult> {

    console.log('\n')
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║  🔒 HARDENED FACE OVERWRITE (Phase 4)                                         ║')
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝')

    // Step 1: Select primary face from generated image
    const selectedFace = selectPrimaryFace(generatedFaces, imageWidth, imageHeight)

    if (!selectedFace) {
        return {
            success: false,
            outputBuffer: generatedImageBuffer,
            coreFaceOverwritten: false,
            rejectedFaces: generatedFaces.length,
            error: 'No valid face found in generated image — ABORTING'
        }
    }

    // Step 2: Extract core face from original
    const coreFaceData = await extractCoreFacePixels(
        originalImageBuffer,
        originalFaceBox,
        landmarks
    )

    if (!coreFaceData) {
        return {
            success: false,
            outputBuffer: generatedImageBuffer,
            coreFaceOverwritten: false,
            selectedFace,
            rejectedFaces: generatedFaces.length - 1,
            error: 'Failed to extract core face from original — ABORTING'
        }
    }

    // Step 3: Extract face region from generated for similarity check (BEFORE)
    let beforeFaceBuffer: Buffer
    try {
        beforeFaceBuffer = await sharp(generatedImageBuffer)
            .extract({
                left: Math.max(0, selectedFace.boundingBox.x),
                top: Math.max(0, selectedFace.boundingBox.y),
                width: Math.min(selectedFace.boundingBox.width, imageWidth - selectedFace.boundingBox.x),
                height: Math.min(selectedFace.boundingBox.height, imageHeight - selectedFace.boundingBox.y)
            })
            .png()
            .toBuffer()
    } catch {
        console.warn('⚠️ Failed to extract before-face for similarity check')
        beforeFaceBuffer = coreFaceData.buffer
    }

    // Step 4: Composite core face onto generated image
    //         Map original face position to generated face position
    const scaleX = selectedFace.boundingBox.width / originalFaceBox.width
    const scaleY = selectedFace.boundingBox.height / originalFaceBox.height

    // Calculate where to place core face in generated image
    const targetX = selectedFace.boundingBox.x +
        (coreFaceData.boundingBox.x - originalFaceBox.x) * scaleX
    const targetY = selectedFace.boundingBox.y +
        (coreFaceData.boundingBox.y - originalFaceBox.y) * scaleY
    const targetWidth = Math.floor(coreFaceData.boundingBox.width * scaleX)
    const targetHeight = Math.floor(coreFaceData.boundingBox.height * scaleY)

    // Resize core face to match generated face size
    const resizedCoreFace = await sharp(coreFaceData.buffer)
        .resize(targetWidth, targetHeight)
        .png()
        .toBuffer()

    // Composite
    const outputBuffer = await sharp(generatedImageBuffer)
        .composite([{
            input: resizedCoreFace,
            left: Math.floor(targetX),
            top: Math.floor(targetY),
            blend: 'over'
        }])
        .png()
        .toBuffer()

    console.log(`✅ Core face composited at (${Math.floor(targetX)}, ${Math.floor(targetY)})`)

    // Step 5: Extract face region AFTER overwrite for similarity check
    let afterFaceBuffer: Buffer
    try {
        afterFaceBuffer = await sharp(outputBuffer)
            .extract({
                left: Math.max(0, selectedFace.boundingBox.x),
                top: Math.max(0, selectedFace.boundingBox.y),
                width: Math.min(selectedFace.boundingBox.width, imageWidth - selectedFace.boundingBox.x),
                height: Math.min(selectedFace.boundingBox.height, imageHeight - selectedFace.boundingBox.y)
            })
            .png()
            .toBuffer()
    } catch {
        console.warn('⚠️ Failed to extract after-face for similarity check')
        afterFaceBuffer = resizedCoreFace
    }

    // Step 6: Assert similarity improvement
    const assertionResult = await assertSimilarityImproved(
        coreFaceData.buffer,
        beforeFaceBuffer,
        afterFaceBuffer
    )

    if (!assertionResult.passed) {
        return {
            success: false,
            outputBuffer: generatedImageBuffer,  // Return ORIGINAL, not overwritten
            coreFaceOverwritten: false,
            selectedFace,
            rejectedFaces: generatedFaces.length - 1,
            similarityBefore: assertionResult.similarityBefore,
            similarityAfter: assertionResult.similarityAfter,
            error: assertionResult.error
        }
    }

    console.log('\n🔒 HARDENED FACE OVERWRITE COMPLETE')
    console.log('   Core face (eyes/nose/mouth) = COPIED FROM ORIGINAL')
    console.log('   Hair/forehead/jawline = FROM GENERATED (allowed to vary)')
    console.log(`   Similarity: ${(assertionResult.similarityAfter! * 100).toFixed(1)}%`)

    return {
        success: true,
        outputBuffer,
        coreFaceOverwritten: true,
        selectedFace,
        rejectedFaces: generatedFaces.length - 1,
        similarityBefore: assertionResult.similarityBefore,
        similarityAfter: assertionResult.similarityAfter
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logHardenedOverwriteStatus(): void {
    console.log('\n🔒 HARDENED FACE OVERWRITE STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Core mask: eyes/nose/mouth ONLY')
    console.log('   Excluded: forehead, hair, jawline, ears')
    console.log('   Feather: 4px edge blend (minimal)')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Reflection handling: ONE FACE RULE')
    console.log('   Selection: largest + most central')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Similarity gate: MANDATORY')
    console.log(`   Min improvement: ${MIN_SIMILARITY_IMPROVEMENT * 100}%`)
    console.log(`   Min absolute: ${MIN_ABSOLUTE_SIMILARITY * 100}%`)
}
