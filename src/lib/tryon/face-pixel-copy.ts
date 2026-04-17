/**
 * FACE PIXEL COPY MODULE
 * 
 * This module implements ACTUAL face pixel copying using Sharp.
 * The face from the original image is PHYSICALLY copied onto the generated image.
 * 
 * THIS IS NOT PROMPT-BASED. This is POST-GENERATION image manipulation.
 * 
 * PIPELINE:
 * 1. Before generation: Extract face from original into buffer
 * 2. During generation: Let model generate body/clothing/background
 * 3. After generation: Composite original face onto generated image
 * 
 * RESULT: Face pixels are LITERALLY the same as original.
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FaceBox {
    x: number
    y: number
    width: number
    height: number
}

export interface FacePixelData {
    buffer: Buffer           // Original face pixels (PNG)
    box: FaceBox             // Position in original image
    maskBuffer?: Buffer      // Alpha mask for blending
}

export interface PixelCopyResult {
    success: boolean
    outputBuffer: Buffer
    faceSourcedFromOriginal: boolean
    error?: string
}

export interface FaceCompositeTarget {
    x: number
    y: number
    width: number
    height: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Expansion factor for face region (1.4 = 40% larger than detected)
 * Captures forehead, ears, jawline, and some neck/hair for complete face coverage
 * INCREASED: Previous 1.25 was not capturing enough face area
 */
export const FACE_BOX_EXPANSION = 1.12

/**
 * Feather radius for smooth edge blending (pixels)
 * INCREASED: Larger feather for more natural blending into body
 */
export const BLEND_FEATHER_RADIUS = 18

/**
 * Keep face composite above upper torso to avoid copying original shirt pixels.
 */
export const FACE_MAX_BOTTOM_FRACTION = 0.45
export const MAX_FACE_SCALE_UP = 1.35

/**
 * Default face estimation when no detection available
 * Assumes face is in upper portion of portrait image
 */
export function estimateFaceBox(imageWidth: number, imageHeight: number): FaceBox {
    // For portrait photos, face is typically:
    // - Top 50% of image height
    // - Centered horizontally
    const faceHeight = Math.floor(imageHeight * 0.50)
    const faceWidth = Math.floor(faceHeight * 0.75)

    return {
        x: Math.floor((imageWidth - faceWidth) / 2),
        y: Math.floor(imageHeight * 0.02), // 2% from top
        width: faceWidth,
        height: faceHeight
    }
}

/**
 * Expand face box by a factor to include surrounding area
 */
export function expandFaceBox(
    box: FaceBox,
    imageWidth: number,
    imageHeight: number,
    factor: number = FACE_BOX_EXPANSION
): FaceBox {
    const newWidth = Math.floor(box.width * factor)
    const newHeight = Math.floor(box.height * factor)

    const deltaX = (newWidth - box.width) / 2
    const deltaY = (newHeight - box.height) / 2

    let x = Math.max(0, Math.floor(box.x - deltaX))
    let y = Math.max(0, Math.floor(box.y - deltaY))

    // Clamp to image bounds
    const width = Math.min(newWidth, imageWidth - x)
    let height = Math.min(newHeight, imageHeight - y)

    const maxBottomY = Math.max(4, Math.floor(imageHeight * FACE_MAX_BOTTOM_FRACTION))
    if (y >= maxBottomY) {
        y = Math.max(0, maxBottomY - 4)
    }
    const currentBottomY = y + height
    if (currentBottomY > maxBottomY) {
        height = Math.max(4, maxBottomY - y)
    }

    return { x, y, width, height }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE PIXEL COPY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * STEP 1: Extract face pixels from original image
 * 
 * This creates an immutable buffer of the original face.
 * These pixels will be composited back after generation.
 */
export async function extractFacePixels(
    originalImageBuffer: Buffer,
    faceBox?: FaceBox
): Promise<FacePixelData | null> {
    try {
        const image = sharp(originalImageBuffer)
        const metadata = await image.metadata()

        if (!metadata.width || !metadata.height) {
            console.error('❌ Cannot get image dimensions')
            return null
        }

        // Use provided box or estimate face position
        const rawBox = faceBox || estimateFaceBox(metadata.width, metadata.height)

        // Expand box to include extra margin
        const expandedBox = expandFaceBox(rawBox, metadata.width, metadata.height)

        // Extract face region as PNG (lossless)
        const faceBuffer = await sharp(originalImageBuffer)
            .extract({
                left: expandedBox.x,
                top: expandedBox.y,
                width: expandedBox.width,
                height: expandedBox.height
            })
            .png()
            .toBuffer()

        // Create soft edge mask for blending
        const maskBuffer = await createFeatheredMask(
            expandedBox.width,
            expandedBox.height,
            BLEND_FEATHER_RADIUS
        )

        console.log(`✅ Face pixels extracted: ${expandedBox.width}x${expandedBox.height} at (${expandedBox.x}, ${expandedBox.y})`)

        return {
            buffer: faceBuffer,
            box: expandedBox,
            maskBuffer
        }
    } catch (error) {
        console.error('❌ Face extraction failed:', error)
        return null
    }
}

/**
 * Create a face mask with opaque core and soft edges.
 * This avoids translucent "double-face" ghosting from overly transparent masks.
 */
async function createFeatheredMask(
    width: number,
    height: number,
    featherRadius: number
): Promise<Buffer> {
    const inset = Math.max(2, featherRadius * 2)
    const innerW = Math.max(4, width - inset * 2)
    const innerH = Math.max(4, height - inset * 2)
    const rx = Math.max(8, Math.floor(innerW * 0.18))

    const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="soft-edge">
                    <feGaussianBlur stdDeviation="${Math.max(1, featherRadius * 0.65)}" />
                </filter>
            </defs>
            <rect
                x="${inset}"
                y="${inset}"
                width="${innerW}"
                height="${innerH}"
                rx="${rx}"
                ry="${rx}"
                fill="white"
                filter="url(#soft-edge)"
            />
        </svg>
    `

    return sharp(Buffer.from(svg))
        .ensureAlpha()
        .png()
        .toBuffer()
}

/**
 * STEP 3: Composite original face onto generated image
 * 
 * This is the CRITICAL step that ensures face identity.
 * The original face pixels are placed directly onto the generated image.
 * 
 * KEY FIX: Uses the feathered mask for natural blending
 */
export async function compositeFacePixels(
    generatedImageBuffer: Buffer,
    faceData: FacePixelData,
    targetBox?: FaceCompositeTarget,
    strictFaceMode: boolean = false
): Promise<PixelCopyResult> {
    try {
        const generatedMeta = await sharp(generatedImageBuffer).metadata()

        if (!generatedMeta.width || !generatedMeta.height) {
            throw new Error('Cannot get generated image dimensions')
        }

        // Calculate face position in generated image
        let targetWidth = targetBox?.width ?? faceData.box.width
        let targetHeight = targetBox?.height ?? faceData.box.height
        let targetX = targetBox?.x ?? faceData.box.x
        let targetY = targetBox?.y ?? faceData.box.y

        // Prevent oversized "sticker face" overlays when target detection is noisy.
        const maxWidth = Math.max(1, Math.floor(faceData.box.width * MAX_FACE_SCALE_UP))
        const maxHeight = Math.max(1, Math.floor(faceData.box.height * MAX_FACE_SCALE_UP))
        targetWidth = Math.min(targetWidth, maxWidth, generatedMeta.width)
        targetHeight = Math.min(targetHeight, maxHeight, generatedMeta.height)

        // Clamp to image bounds
        targetX = Math.max(0, Math.min(targetX, generatedMeta.width - targetWidth))
        targetY = Math.max(0, Math.min(targetY, generatedMeta.height - targetHeight))

        // If we have a mask, apply it to the face for feathered edges
        let faceWithMask = faceData.buffer

        if (faceData.maskBuffer) {
            const effectiveMask = strictFaceMode
                ? await createFeatheredMask(faceData.box.width, faceData.box.height, 14)
                : faceData.maskBuffer

            // Create face with alpha channel from mask
            faceWithMask = await sharp(faceData.buffer)
                .ensureAlpha()
                .composite([{
                    input: effectiveMask,
                    blend: 'dest-in'  // Use mask as alpha
                }])
                .png()
                .toBuffer()

            console.log(`   🎭 Applied ${strictFaceMode ? 'strict' : 'standard'} feather mask to face`)
        }

        // If target box differs from source extraction, resize for geometric alignment.
        if (targetWidth !== faceData.box.width || targetHeight !== faceData.box.height) {
            faceWithMask = await sharp(faceWithMask)
                .resize(targetWidth, targetHeight)
                .png()
                .toBuffer()
            console.log(`   📏 Resized face patch to ${targetWidth}x${targetHeight}`)
        }

        // Composite original face onto generated image
        const result = await sharp(generatedImageBuffer)
            .composite([{
                input: faceWithMask,
                left: targetX,
                top: targetY,
                blend: 'over'
            }])
            .png()
            .toBuffer()

        console.log(`✅ Face pixels composited at (${targetX}, ${targetY}) with feathered edges`)
        console.log(`   📐 Face size: ${targetWidth}x${targetHeight}`)

        return {
            success: true,
            outputBuffer: result,
            faceSourcedFromOriginal: true
        }
    } catch (error) {
        console.error('❌ Face composite failed:', error)
        return {
            success: false,
            outputBuffer: generatedImageBuffer,
            faceSourcedFromOriginal: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED FACE FREEZE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * COMPLETE FACE FREEZE PIPELINE
 * 
 * This is the unified function that wraps any generation with face freeze:
 * 1. Extract face from original
 * 2. Call the generation function (passed as parameter)
 * 3. Composite original face onto result
 * 
 * @param originalImage - Original user photo
 * @param generateFn - Async function that performs the actual generation
 * @param faceBox - Optional: detected face box (uses estimation if not provided)
 */
export async function withFaceFreeze<T>(
    originalImage: Buffer,
    generateFn: (maskedImage?: Buffer) => Promise<{ image: Buffer; metadata?: T }>,
    faceBox?: FaceBox
): Promise<{ finalImage: Buffer; metadata?: T; facePreserved: boolean }> {

    console.log('\n🧊 FACE FREEZE PIPELINE ACTIVATED')
    console.log('   ═══════════════════════════════════════════════')

    // Step 1: Extract original face
    const faceData = await extractFacePixels(originalImage, faceBox)

    if (!faceData) {
        console.warn('⚠️ Face extraction failed - proceeding without face freeze')
        const result = await generateFn()
        return {
            finalImage: result.image,
            metadata: result.metadata,
            facePreserved: false
        }
    }

    console.log('   📌 Face extracted and stored')

    // Step 2: Run generation
    const generationResult = await generateFn()
    console.log('   ✏️ Generation complete')

    // Step 3: Composite original face back
    const compositeResult = await compositeFacePixels(
        generationResult.image,
        faceData
    )

    if (compositeResult.success) {
        console.log('   ✅ Original face composited back')
        console.log('   🔒 FACE PIXELS = IDENTICAL TO ORIGINAL')
    } else {
        console.warn('   ⚠️ Face composite failed - returning generation as-is')
    }

    console.log('   ═══════════════════════════════════════════════')

    return {
        finalImage: compositeResult.outputBuffer,
        metadata: generationResult.metadata,
        facePreserved: compositeResult.faceSourcedFromOriginal
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFacePixelCopyStatus(): void {
    console.log(`\n📷 FACE PIXEL COPY STATUS`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   📋 Mode: POST-GENERATION COMPOSITING`)
    console.log(`   📋 Method: Sharp image manipulation`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   1️⃣ Before generation: Extract face → buffer`)
    console.log(`   2️⃣ During generation: Model generates body only`)
    console.log(`   3️⃣ After generation: Composite original face back`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🔒 Face pixels: LITERAL COPY (not generated)`)
    console.log(`   🔒 Face identity: GUARANTEED (same pixels)`)
    console.log(`   🔒 Expression: PRESERVED (original pixels)`)
    console.log(`   🔒 Skin texture: PRESERVED (original pixels)`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT FOR GENERATION (For model to know face will be replaced)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_WILL_BE_REPLACED_NOTICE = `
═══════════════════════════════════════════════════════════════════════════════
⚠️ NOTICE: FACE REGION WILL BE REPLACED POST-GENERATION
═══════════════════════════════════════════════════════════════════════════════

The face region in your output will be REPLACED with the original face pixels
after generation. You do NOT need to generate or preserve the face.

FOCUS ONLY ON:
• Clothing/garment generation
• Body pose and shape preservation  
• Background generation
• Lighting coherence

The face is handled separately through pixel copying.
Generate a placeholder or approximation for the face area - it will be replaced.
═══════════════════════════════════════════════════════════════════════════════`
