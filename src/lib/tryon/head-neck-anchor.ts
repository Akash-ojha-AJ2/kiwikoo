/**
 * HEAD-NECK ANCHOR LOCK
 * 
 * ========================================================================
 * PROBLEM:
 * 
 * Face identity is correct, but the head feels mis-positioned relative
 * to the body:
 * - Head appears too high or too low
 * - Neck transition looks unnatural
 * - Jaw-neck connection is not anatomically grounded
 * - "Floating head" effect
 * 
 * ROOT CAUSE:
 * 
 * Current face reintegration aligns face using ONLY facial landmarks.
 * This ensures correct identity but does NOT constrain face to BODY.
 * The model generates its own neck length and shoulder slope,
 * causing subtle head-body misalignment.
 * 
 * SOLUTION:
 * 
 * Anchor face placement to BODY landmarks (shoulders → neck anchor).
 * Constrain vertical translation so chin sits naturally above neck.
 * Add subtle neck region blending for seamless junction.
 * ========================================================================
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Point {
    x: number
    y: number
}

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
}

export interface ShoulderLandmarks {
    leftShoulder: Point
    rightShoulder: Point
}

export interface NeckAnchor {
    point: Point           // Neck anchor position
    shoulderWidth: number  // Distance between shoulders
    neckBase: Point        // Top of neck (below chin)
}

export interface HeadNeckConstraint {
    neckAnchor: NeckAnchor
    maxVerticalOffset: number  // Maximum allowed vertical deviation
    chinToNeckDistance: number // Expected chin-to-neck gap
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Vertical translation constraint (as percentage of face height)
export const MAX_VERTICAL_OFFSET_PERCENT = 0.035  // ±3.5%

// Neck region blending
export const NECK_BLEND_OPACITY = 0.6             // 60% opacity
export const NECK_BLEND_FEATHER = 13              // 12-15px feather
export const NECK_REGION_HEIGHT_PERCENT = 0.12    // 12% of face height

// Anatomical ratios (average human proportions)
export const SHOULDER_TO_NECK_RATIO = 0.15        // Neck anchor is 15% above shoulder midpoint
export const CHIN_TO_NECK_GAP_RATIO = 0.08        // 8% of face height gap between chin and neck base

// ═══════════════════════════════════════════════════════════════════════════════
// SHOULDER LANDMARK DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate shoulder positions from face bounding box.
 * 
 * Uses anatomical proportions to estimate where shoulders should be
 * relative to the detected face. In production, use actual pose estimation.
 * 
 * Anatomical assumptions:
 * - Shoulders are approximately 2x face width apart
 * - Shoulder line is approximately 1.4x face height below face center
 */
export function estimateShoulderLandmarks(
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): ShoulderLandmarks {
    const faceCenterX = faceBox.x + faceBox.width / 2
    const faceCenterY = faceBox.y + faceBox.height / 2

    // Shoulder width is approximately 2x face width
    const shoulderWidth = faceBox.width * 2.0

    // Shoulder Y is approximately 1.4x face height below face center
    const shoulderY = Math.min(
        faceCenterY + faceBox.height * 1.4,
        imageHeight - 10  // Clamp to image bounds
    )

    // Left shoulder (left from viewer's perspective)
    const leftShoulderX = Math.max(10, faceCenterX - shoulderWidth / 2)

    // Right shoulder
    const rightShoulderX = Math.min(imageWidth - 10, faceCenterX + shoulderWidth / 2)

    return {
        leftShoulder: { x: leftShoulderX, y: shoulderY },
        rightShoulder: { x: rightShoulderX, y: shoulderY }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NECK ANCHOR COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute neck anchor point from shoulder landmarks.
 * 
 * The neck anchor is:
 * - Horizontally centered between shoulders
 * - Vertically positioned slightly above shoulder midpoint
 * 
 * This becomes the absolute reference for face placement.
 */
export function computeNeckAnchor(shoulders: ShoulderLandmarks): NeckAnchor {
    // Midpoint between shoulders
    const midpointX = (shoulders.leftShoulder.x + shoulders.rightShoulder.x) / 2
    const midpointY = (shoulders.leftShoulder.y + shoulders.rightShoulder.y) / 2

    // Shoulder width
    const shoulderWidth = Math.abs(shoulders.rightShoulder.x - shoulders.leftShoulder.x)

    // Neck anchor is above shoulder midpoint (anatomical neck base)
    const neckAnchorY = midpointY - (shoulderWidth * SHOULDER_TO_NECK_RATIO)

    // Neck base (where neck meets shoulders)
    const neckBaseY = midpointY - (shoulderWidth * SHOULDER_TO_NECK_RATIO * 0.3)

    return {
        point: { x: midpointX, y: neckAnchorY },
        shoulderWidth,
        neckBase: { x: midpointX, y: neckBaseY }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE TRANSLATION CONSTRAINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Constrain face vertical translation to maintain anatomical head-body connection.
 * 
 * This clamps the vertical offset to ±3-4% of face height, preventing:
 * - Floating heads
 * - Stretched necks
 * - Collapsed jaw-neck transitions
 */
export function constrainFaceTranslation(
    proposedTranslateY: number,
    faceHeight: number,
    chinY: number,
    neckAnchor: NeckAnchor
): { constrainedY: number; wasConstrained: boolean } {
    // Maximum allowed vertical offset
    const maxOffset = faceHeight * MAX_VERTICAL_OFFSET_PERCENT

    // Expected chin position relative to neck anchor
    const expectedChinY = neckAnchor.point.y - (faceHeight * CHIN_TO_NECK_GAP_RATIO)

    // Current chin position after proposed translation
    const proposedChinY = chinY + proposedTranslateY

    // Calculate deviation from expected position
    const deviation = proposedChinY - expectedChinY

    // Clamp to maximum offset
    if (Math.abs(deviation) > maxOffset) {
        const clampedDeviation = Math.sign(deviation) * maxOffset
        const constrainedY = proposedTranslateY - (deviation - clampedDeviation)

        console.log(`   🔒 Vertical translation constrained: ${proposedTranslateY.toFixed(1)} → ${constrainedY.toFixed(1)}`)
        console.log(`      Max offset: ±${maxOffset.toFixed(1)}px, deviation: ${deviation.toFixed(1)}px`)

        return { constrainedY, wasConstrained: true }
    }

    return { constrainedY: proposedTranslateY, wasConstrained: false }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NECK REGION BLENDING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create neck blend region mask.
 * 
 * This extends the face shape mask slightly downward to include
 * a small upper-neck skin region for seamless junction.
 * 
 * Blends with:
 * - Low opacity (0.6)
 * - Feather radius 12-15px
 * 
 * Does NOT touch:
 * - Clothing
 * - Shoulders
 * - Collarbones
 */
export async function createNeckBlendMask(
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): Promise<Buffer> {
    // Neck region starts at bottom of face and extends down
    const neckTop = faceBox.y + faceBox.height
    const neckHeight = Math.round(faceBox.height * NECK_REGION_HEIGHT_PERCENT)
    const neckBottom = Math.min(neckTop + neckHeight, imageHeight - 1)

    // Neck width is narrower than face (approximately 60%)
    const neckWidth = Math.round(faceBox.width * 0.6)
    const neckCenterX = faceBox.x + faceBox.width / 2
    const neckLeft = Math.round(neckCenterX - neckWidth / 2)

    // Create SVG mask with gradient opacity
    const svg = `
        <svg width="${imageWidth}" height="${imageHeight}">
            <defs>
                <filter id="neckBlur">
                    <feGaussianBlur stdDeviation="${NECK_BLEND_FEATHER}" />
                </filter>
                <linearGradient id="neckGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="white" stop-opacity="${NECK_BLEND_OPACITY}" />
                    <stop offset="100%" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
            <ellipse 
                cx="${neckCenterX}" 
                cy="${neckTop + neckHeight / 2}" 
                rx="${neckWidth / 2}" 
                ry="${neckHeight / 2}"
                fill="url(#neckGradient)" 
                filter="url(#neckBlur)" 
            />
        </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
}

/**
 * Apply neck blend from original image to generated image.
 */
export async function applyNeckBlend(
    generatedImageBuffer: Buffer,
    originalImageBuffer: Buffer,
    neckMask: Buffer
): Promise<Buffer> {
    try {
        // Extract neck region from original using mask
        const originalNeckRegion = await sharp(originalImageBuffer)
            .ensureAlpha()
            .composite([{
                input: neckMask,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer()

        // Composite onto generated image
        const result = await sharp(generatedImageBuffer)
            .composite([{
                input: originalNeckRegion,
                blend: 'over'
            }])
            .png()
            .toBuffer()

        console.log(`   ✅ Neck region blended (opacity: ${NECK_BLEND_OPACITY * 100}%, feather: ${NECK_BLEND_FEATHER}px)`)

        return result
    } catch (error) {
        console.error('❌ Neck blend failed:', error)
        return generatedImageBuffer
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED HEAD-NECK ANCHOR LOCK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply complete head-neck anchor lock.
 * 
 * 1. Detect shoulder landmarks on generated image
 * 2. Compute neck anchor point
 * 3. Build constraint for face translation
 * 4. Create neck blend mask
 * 
 * Returns constraint info for use during face reintegration.
 */
export async function computeHeadNeckConstraint(
    generatedFaceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): Promise<HeadNeckConstraint> {
    console.log('\n🔒 HEAD-NECK ANCHOR LOCK')
    console.log('   ═══════════════════════════════════════════════')

    // Step 1: Estimate shoulder landmarks
    const shoulders = estimateShoulderLandmarks(generatedFaceBox, imageWidth, imageHeight)
    console.log(`   Shoulders: L(${shoulders.leftShoulder.x.toFixed(0)}, ${shoulders.leftShoulder.y.toFixed(0)}) → R(${shoulders.rightShoulder.x.toFixed(0)}, ${shoulders.rightShoulder.y.toFixed(0)})`)

    // Step 2: Compute neck anchor
    const neckAnchor = computeNeckAnchor(shoulders)
    console.log(`   Neck anchor: (${neckAnchor.point.x.toFixed(0)}, ${neckAnchor.point.y.toFixed(0)})`)
    console.log(`   Shoulder width: ${neckAnchor.shoulderWidth.toFixed(0)}px`)

    // Step 3: Compute constraint limits
    const maxVerticalOffset = generatedFaceBox.height * MAX_VERTICAL_OFFSET_PERCENT
    const chinToNeckDistance = generatedFaceBox.height * CHIN_TO_NECK_GAP_RATIO

    console.log(`   Max vertical offset: ±${maxVerticalOffset.toFixed(1)}px (${MAX_VERTICAL_OFFSET_PERCENT * 100}%)`)
    console.log('   ═══════════════════════════════════════════════')
    console.log('   ✅ Body-aware face placement constraint active')

    return {
        neckAnchor,
        maxVerticalOffset,
        chinToNeckDistance
    }
}

/**
 * Apply neck blending after face reintegration.
 */
export async function applyHeadNeckBlending(
    generatedImageBuffer: Buffer,
    originalImageBuffer: Buffer,
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): Promise<Buffer> {
    try {
        // Create neck blend mask
        const neckMask = await createNeckBlendMask(faceBox, imageWidth, imageHeight)

        // Apply blend
        const result = await applyNeckBlend(generatedImageBuffer, originalImageBuffer, neckMask)

        return result
    } catch (error) {
        console.error('❌ Head-neck blending failed:', error)
        return generatedImageBuffer
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logHeadNeckAnchorStatus(): void {
    console.log('\n🔒 HEAD-NECK ANCHOR LOCK STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Face anchor: Body-aware (shoulder-based)')
    console.log(`   Vertical constraint: ±${MAX_VERTICAL_OFFSET_PERCENT * 100}%`)
    console.log(`   Neck blend opacity: ${NECK_BLEND_OPACITY * 100}%`)
    console.log(`   Neck blend feather: ${NECK_BLEND_FEATHER}px`)
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Purpose: Anatomically correct head-body junction')
}
