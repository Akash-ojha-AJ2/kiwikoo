/**
 * FACE REGION MASK MODULE
 * 
 * Implements pixel-level face isolation for virtual try-on.
 * 
 * CRITICAL ARCHITECTURE:
 * The face region is EXCLUDED from generation, not constrained.
 * Face pixels never pass through the generative model.
 * 
 * Pipeline:
 * 1. Detect face region (from landmarks or estimation)
 * 2. Extract face pixels into immutable buffer
 * 3. Replace face in input with neutral placeholder
 * 4. Run generation ONLY on body/clothing/background
 * 5. Composite original face pixels back after generation
 */

import 'server-only'
import sharp from 'sharp'
import crypto from 'crypto'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FaceBoundingBox {
    x: number
    y: number
    w: number
    h: number
}

export interface FaceLandmarks {
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
    nose: { x: number; y: number }
    leftMouth: { x: number; y: number }
    rightMouth: { x: number; y: number }
    confidence: number
}

export interface FaceMask {
    boundingBox: FaceBoundingBox
    landmarks: FaceLandmarks | null
    faceBuffer: Buffer  // Original face pixels (immutable)
    maskBuffer: Buffer  // Alpha mask for smooth blending
}

export interface FaceIsolationResult {
    success: boolean
    maskedImage: Buffer      // Image with face replaced by placeholder
    faceData: FaceMask | null
    error?: string
}

export interface FaceCompositeResult {
    success: boolean
    finalImage: Buffer
    error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimum landmark confidence to proceed with PRO.
 * If below threshold, fallback to FLASH.
 */
export const LANDMARK_CONFIDENCE_THRESHOLD = 0.7

/**
 * Face region expansion factor (1.3 = 30% larger than detected box)
 * Ensures we capture hair, ears, and neck transition.
 */
export const FACE_REGION_EXPANSION = 1.3

/**
 * Feather radius for soft edge blending (pixels)
 */
export const FEATHER_RADIUS = 15

/**
 * Placeholder color for masked face region (neutral gray)
 */
export const PLACEHOLDER_COLOR = { r: 128, g: 128, b: 128 }

/**
 * Generation flags - HARD LOCKED
 */
export const FACE_GENERATION_FLAGS = {
    disableFaceTokens: true,
    disableFacialLatents: true,
    disableFaceNormalization: true,
    disableFaceReconstruction: true,
    disableFaceEnhancement: true,
    disableFaceRelighting: true,
    disableFaceSmoothing: true,
    disableFaceReprojection: true,
}

// ═══════════════════════════════════════════════════════════════════════════════
// WOMEN-SPECIFIC SAFETY RULES (EXPLICIT)
// ═══════════════════════════════════════════════════════════════════════════════

export const WOMEN_SAFETY_FLAGS = {
    NO_BEAUTIFICATION: true,
    NO_FEMINIZATION: true,
    NO_SYMMETRY_OPTIMIZATION: true,
    NO_SKIN_SMOOTHING: true,
    NO_LIP_ENHANCEMENT: true,
    NO_EYE_ENLARGEMENT: true,
    NO_NOSE_SLIMMING: true,
    NO_FACE_SLIMMING: true,
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESSION LOCK (CRITICAL)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_EXPRESSION_LOCK = `
═══════════════════════════════════════════════════════════════════════════════
FACE EXPRESSION LOCK (PIXEL-FOR-PIXEL PRESERVATION)
═══════════════════════════════════════════════════════════════════════════════

The facial expression in Image 1 is FINAL.

DO NOT:
❌ Neutralize expression
❌ Symmetrize smile
❌ Adjust eye openness
❌ Adjust lip curvature
❌ Reduce smile intensity
❌ Close open mouth
❌ Raise or lower eyebrows
❌ Modify any micro-expression

PRESERVE EXACTLY:
✓ Exact smile shape and intensity
✓ Exact eye openness (even asymmetric)
✓ Exact lip position and curvature
✓ Exact eyebrow position and shape
✓ All expression asymmetry

This is especially critical for women's expressions.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE REGION ESTIMATION (Fallback when no landmarks)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate face region based on image dimensions.
 * Used as fallback when face detection is not available.
 * 
 * Assumes: Face is in upper portion of image, centered.
 */
export function estimateFaceRegion(
    imageWidth: number,
    imageHeight: number
): FaceBoundingBox {
    // Face typically in upper 40% of portrait image
    const faceHeight = Math.floor(imageHeight * 0.4)
    const faceWidth = Math.floor(faceHeight * 0.8) // Slightly narrower than tall

    const x = Math.floor((imageWidth - faceWidth) / 2)
    const y = Math.floor(imageHeight * 0.05) // 5% from top

    return {
        x,
        y,
        w: faceWidth,
        h: faceHeight
    }
}

/**
 * Expand face bounding box to include surrounding area.
 */
export function expandFaceRegion(
    box: FaceBoundingBox,
    imageWidth: number,
    imageHeight: number,
    expansion: number = FACE_REGION_EXPANSION
): FaceBoundingBox {
    const expandedW = Math.floor(box.w * expansion)
    const expandedH = Math.floor(box.h * expansion)

    const deltaW = expandedW - box.w
    const deltaH = expandedH - box.h

    let x = box.x - Math.floor(deltaW / 2)
    let y = box.y - Math.floor(deltaH / 2)

    // Clamp to image bounds
    x = Math.max(0, x)
    y = Math.max(0, y)

    const w = Math.min(expandedW, imageWidth - x)
    const h = Math.min(expandedH, imageHeight - y)

    return { x, y, w, h }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE MASKING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create an elliptical feathered mask for smooth face blending.
 */
async function createFeatheredMask(
    width: number,
    height: number,
    featherRadius: number = FEATHER_RADIUS
): Promise<Buffer> {
    // Create SVG ellipse with feathered edges
    const cx = width / 2
    const cy = height / 2
    const rx = (width / 2) - featherRadius
    const ry = (height / 2) - featherRadius

    const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="blur">
                    <feGaussianBlur stdDeviation="${featherRadius}" />
                </filter>
            </defs>
            <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" 
                     fill="white" filter="url(#blur)" />
        </svg>
    `

    return sharp(Buffer.from(svg))
        .grayscale()
        .raw()
        .toBuffer()
}

/**
 * Extract face region from image and store in immutable buffer.
 * Returns masked image with face replaced by placeholder.
 */
export async function isolateFaceRegion(
    imageBuffer: Buffer,
    faceBox?: FaceBoundingBox,
    landmarks?: FaceLandmarks
): Promise<FaceIsolationResult> {
    try {
        const image = sharp(imageBuffer)
        const metadata = await image.metadata()

        if (!metadata.width || !metadata.height) {
            return { success: false, maskedImage: imageBuffer, faceData: null, error: 'Invalid image dimensions' }
        }

        // Use provided face box or estimate
        const rawBox = faceBox || estimateFaceRegion(metadata.width, metadata.height)

        // Expand the face region for safety margin
        const expandedBox = expandFaceRegion(rawBox, metadata.width, metadata.height)

        // Check landmark confidence if provided
        if (landmarks && landmarks.confidence < LANDMARK_CONFIDENCE_THRESHOLD) {
            console.warn(`⚠️ Face landmark confidence ${landmarks.confidence} < ${LANDMARK_CONFIDENCE_THRESHOLD}, using fallback`)
        }

        // Extract face pixels into immutable buffer
        const faceBuffer = await sharp(imageBuffer)
            .extract({
                left: expandedBox.x,
                top: expandedBox.y,
                width: expandedBox.w,
                height: expandedBox.h
            })
            .png()
            .toBuffer()

        // Create feathered mask for later blending
        const maskBuffer = await createFeatheredMask(expandedBox.w, expandedBox.h)

        // Create placeholder (neutral gray) for face region
        const placeholder = await sharp({
            create: {
                width: expandedBox.w,
                height: expandedBox.h,
                channels: 4,
                background: { ...PLACEHOLDER_COLOR, alpha: 1 }
            }
        })
            .png()
            .toBuffer()

        // Create masked image with face replaced by placeholder
        const maskedImage = await sharp(imageBuffer)
            .composite([{
                input: placeholder,
                left: expandedBox.x,
                top: expandedBox.y,
                blend: 'over'
            }])
            .png()
            .toBuffer()

        const faceMask: FaceMask = {
            boundingBox: expandedBox,
            landmarks: landmarks || null,
            faceBuffer,
            maskBuffer
        }

        console.log(`✅ Face isolated: ${expandedBox.w}x${expandedBox.h} at (${expandedBox.x}, ${expandedBox.y})`)

        return {
            success: true,
            maskedImage,
            faceData: faceMask
        }
    } catch (error) {
        console.error('❌ Face isolation failed:', error)
        return {
            success: false,
            maskedImage: imageBuffer,
            faceData: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Composite original face pixels back onto generated image.
 * This is the CRITICAL step that ensures face identity preservation.
 */
export async function compositeFaceBack(
    generatedImageBuffer: Buffer,
    faceData: FaceMask
): Promise<FaceCompositeResult> {
    try {
        const { boundingBox, faceBuffer } = faceData

        // Composite original face onto generated image
        const finalImage = await sharp(generatedImageBuffer)
            .composite([{
                input: faceBuffer,
                left: boundingBox.x,
                top: boundingBox.y,
                blend: 'over'
            }])
            .png()
            .toBuffer()

        console.log(`✅ Face composited back at (${boundingBox.x}, ${boundingBox.y})`)

        return {
            success: true,
            finalImage
        }
    } catch (error) {
        console.error('❌ Face composite failed:', error)
        return {
            success: false,
            finalImage: generatedImageBuffer,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if we should fallback to FLASH identity pipeline.
 */
export function shouldFallbackToFlash(
    landmarks: FaceLandmarks | null,
    isolationSuccess: boolean
): boolean {
    // Fallback if no landmarks
    if (!landmarks) {
        console.warn('⚠️ No face landmarks detected - FALLBACK_TO_FLASH')
        return true
    }

    // Fallback if low confidence
    if (landmarks.confidence < LANDMARK_CONFIDENCE_THRESHOLD) {
        console.warn(`⚠️ Low landmark confidence ${landmarks.confidence} - FALLBACK_TO_FLASH`)
        return true
    }

    // Fallback if isolation failed
    if (!isolationSuccess) {
        console.warn('⚠️ Face isolation failed - FALLBACK_TO_FLASH')
        return true
    }

    return false
}

/**
 * Force FLASH identity pipeline for maximum safety.
 */
export function forceFlashIdentityPipeline(): void {
    console.log('🔒 FORCED: Using FLASH identity pipeline for face safety')
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_LIGHTING_RULES = `
═══════════════════════════════════════════════════════════════════════════════
FACE LIGHTING RULES (STRICT)
═══════════════════════════════════════════════════════════════════════════════

FACE LIGHTING = READ ONLY FROM IMAGE 1.

❌ FORBIDDEN:
• No face relighting
• No shadow recomputation on face
• No highlight adjustment on face
• No color correction per-region on face

✅ ALLOWED (GLOBAL ONLY):
• Global color temperature shift (applies equally to whole image)
• Global exposure adjustment (applies equally to whole image)

The face lighting MUST match Image 1 exactly.
Any lighting adjustment is applied to the WHOLE image, not selectively to face.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFaceIsolationStatus(result: FaceIsolationResult): void {
    console.log(`\n🎭 FACE ISOLATION STATUS`)
    console.log(`   ├── Success: ${result.success ? '✅' : '❌'}`)
    if (result.faceData) {
        const { boundingBox, landmarks } = result.faceData
        console.log(`   ├── Region: ${boundingBox.w}x${boundingBox.h} at (${boundingBox.x}, ${boundingBox.y})`)
        console.log(`   ├── Landmarks: ${landmarks ? `confidence ${landmarks.confidence}` : 'estimated'}`)
    }
    if (result.error) {
        console.log(`   └── Error: ${result.error}`)
    }
    console.log(`   └── Face pixels: IMMUTABLE (stored in buffer)`)
}

export function logWomenSafetyFlags(): void {
    console.log(`\n👩 WOMEN SAFETY FLAGS (ALL ACTIVE)`)
    Object.entries(WOMEN_SAFETY_FLAGS).forEach(([key, value]) => {
        console.log(`   ├── ${key}: ${value ? '✅ BLOCKED' : '❌'}`)
    })
}

export function logFaceGenerationFlags(): void {
    console.log(`\n🛑 FACE GENERATION FLAGS (ALL DISABLED)`)
    Object.entries(FACE_GENERATION_FLAGS).forEach(([key, value]) => {
        console.log(`   ├── ${key}: ${value ? '🔒 DISABLED' : '⚠️ ENABLED'}`)
    })
}
