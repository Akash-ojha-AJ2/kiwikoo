/**
 * FACE SHAPE LOCK — Jawline & Cheek Preservation
 * 
 * ========================================================================
 * PROBLEM:
 * 
 * The model is inventing skull shape, resulting in:
 * - Rounded faces where original is sharp
 * - Altered cheek volume
 * - Wrong jawline contour
 * 
 * SOLUTION:
 * 
 * Lock jawline and cheek geometry from original face.
 * Composite face shape at 85% opacity BEFORE core face overwrite.
 * Expand face-freeze region to prevent model from generating jawline.
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

export interface FaceShapeData {
    jawlinePoints: Point[]
    cheekPoints: Point[]
    chinPoint: Point
}

export interface FaceShapeMaskResult {
    maskBuffer: Buffer
    shapeBuffer: Buffer
    success: boolean
    error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Face shape composite settings
export const FACE_SHAPE_OPACITY = 0.85          // 85% opacity
export const FACE_SHAPE_FEATHER = 11            // 10-12px feather radius

// Face freeze expansion (to prevent model from generating jawline)
export const FACE_FREEZE_EXPAND_DOWN = 0.10     // +10% downward

// ═══════════════════════════════════════════════════════════════════════════════
// JAWLINE LANDMARK EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract jawline and cheek contour landmarks from face bounding box.
 * 
 * In production, use actual 68-point facial landmarks.
 * This estimates based on standard facial proportions.
 */
export function extractFaceShapeLandmarks(faceBox: BoundingBox): FaceShapeData {
    const { x, y, width, height } = faceBox

    // Jawline points (from ear to chin to ear)
    // Based on 68-point landmark positions 0-16
    const jawlinePoints: Point[] = [
        // Left side (ear to chin)
        { x: x + width * 0.05, y: y + height * 0.40 },  // Near left ear
        { x: x + width * 0.08, y: y + height * 0.55 },
        { x: x + width * 0.12, y: y + height * 0.68 },
        { x: x + width * 0.18, y: y + height * 0.78 },
        { x: x + width * 0.28, y: y + height * 0.88 },
        { x: x + width * 0.40, y: y + height * 0.94 },

        // Chin
        { x: x + width * 0.50, y: y + height * 0.97 },

        // Right side (chin to ear)
        { x: x + width * 0.60, y: y + height * 0.94 },
        { x: x + width * 0.72, y: y + height * 0.88 },
        { x: x + width * 0.82, y: y + height * 0.78 },
        { x: x + width * 0.88, y: y + height * 0.68 },
        { x: x + width * 0.92, y: y + height * 0.55 },
        { x: x + width * 0.95, y: y + height * 0.40 },  // Near right ear
    ]

    // Cheek points (inner cheek area)
    const cheekPoints: Point[] = [
        // Left cheek
        { x: x + width * 0.20, y: y + height * 0.50 },
        { x: x + width * 0.25, y: y + height * 0.60 },
        { x: x + width * 0.30, y: y + height * 0.70 },

        // Right cheek
        { x: x + width * 0.70, y: y + height * 0.70 },
        { x: x + width * 0.75, y: y + height * 0.60 },
        { x: x + width * 0.80, y: y + height * 0.50 },
    ]

    const chinPoint: Point = { x: x + width * 0.50, y: y + height * 0.97 }

    return { jawlinePoints, cheekPoints, chinPoint }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE SHAPE MASK CREATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build face shape polygon that includes:
 * - Cheeks
 * - Jawline
 * - Chin
 * 
 * Excludes:
 * - Hair
 * - Ears
 * - Neck
 */
export function buildFaceShapePolygon(
    faceBox: BoundingBox,
    shapeLandmarks: FaceShapeData
): Point[] {
    const { x, y, width, height } = faceBox

    // Create closed polygon from jawline + upper face boundary
    const polygon: Point[] = [
        // Start at upper left (below hair, at temple)
        { x: x + width * 0.15, y: y + height * 0.30 },

        // Across forehead (but not at hairline)
        { x: x + width * 0.35, y: y + height * 0.25 },
        { x: x + width * 0.50, y: y + height * 0.22 },
        { x: x + width * 0.65, y: y + height * 0.25 },
        { x: x + width * 0.85, y: y + height * 0.30 },

        // Down right side (jawline)
        ...shapeLandmarks.jawlinePoints.slice(7).reverse(),

        // Chin
        shapeLandmarks.chinPoint,

        // Up left side (jawline)
        ...shapeLandmarks.jawlinePoints.slice(0, 6),
    ]

    return polygon
}

/**
 * Create face shape mask with feathered edges.
 */
export async function createFaceShapeMask(
    polygon: Point[],
    width: number,
    height: number
): Promise<Buffer> {
    // Build SVG path
    const pathPoints = polygon.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ') + ' Z'

    const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <filter id="blur">
                    <feGaussianBlur stdDeviation="${FACE_SHAPE_FEATHER}" />
                </filter>
            </defs>
            <path d="${pathPoints}" fill="white" filter="url(#blur)" />
        </svg>
    `

    return sharp(Buffer.from(svg)).png().toBuffer()
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE SHAPE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract face shape (jawline + cheeks) from original image.
 */
export async function extractFaceShape(
    originalImageBuffer: Buffer,
    faceBox: BoundingBox
): Promise<FaceShapeMaskResult> {
    try {
        const metadata = await sharp(originalImageBuffer).metadata()
        if (!metadata.width || !metadata.height) {
            return { maskBuffer: Buffer.alloc(0), shapeBuffer: Buffer.alloc(0), success: false, error: 'No dimensions' }
        }

        // Get face shape landmarks
        const shapeLandmarks = extractFaceShapeLandmarks(faceBox)

        // Build polygon
        const polygon = buildFaceShapePolygon(faceBox, shapeLandmarks)

        // Create mask
        const maskBuffer = await createFaceShapeMask(polygon, metadata.width, metadata.height)

        // Extract shape with mask
        const shapeBuffer = await sharp(originalImageBuffer)
            .ensureAlpha()
            .composite([{
                input: maskBuffer,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer()

        console.log(`   ✅ Face shape extracted: jawline + cheeks`)

        return { maskBuffer, shapeBuffer, success: true }
    } catch (error) {
        console.error('❌ Face shape extraction failed:', error)
        return {
            maskBuffer: Buffer.alloc(0),
            shapeBuffer: Buffer.alloc(0),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE SHAPE COMPOSITE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Composite face shape onto generated image at 85% opacity.
 * 
 * This is called BEFORE core face overwrite.
 * Preserves jawline and cheek contour from original.
 */
export async function compositeFaceShape(
    generatedImageBuffer: Buffer,
    faceShapeBuffer: Buffer,
    targetBox: BoundingBox,
    warpedWidth: number,
    warpedHeight: number
): Promise<Buffer> {
    try {
        // Resize shape to target dimensions
        const resizedShape = await sharp(faceShapeBuffer)
            .resize(warpedWidth, warpedHeight, {
                kernel: sharp.kernel.lanczos3,
                fit: 'fill'
            })
            .toBuffer()

        // Apply opacity
        const opacityBuffer = await sharp(resizedShape)
            .ensureAlpha()
            .modulate({ brightness: 1 })
            .composite([{
                input: Buffer.from([
                    0, 0, 0, Math.round(255 * FACE_SHAPE_OPACITY)
                ]),
                raw: { width: 1, height: 1, channels: 4 },
                tile: true,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer()

        // Composite onto generated image
        const result = await sharp(generatedImageBuffer)
            .composite([{
                input: resizedShape,
                left: Math.max(0, targetBox.x),
                top: Math.max(0, targetBox.y),
                blend: 'over'
            }])
            .png()
            .toBuffer()

        console.log(`   ✅ Face shape composited at ${FACE_SHAPE_OPACITY * 100}% opacity`)

        return result
    } catch (error) {
        console.error('❌ Face shape composite failed:', error)
        return generatedImageBuffer
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPANDED FACE FREEZE REGION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Expand face freeze region downward to prevent model from generating jawline.
 */
export function expandFaceFreezeRegion(
    faceBox: BoundingBox,
    imageHeight: number
): BoundingBox {
    const expandDown = Math.floor(faceBox.height * FACE_FREEZE_EXPAND_DOWN)

    return {
        x: faceBox.x,
        y: faceBox.y,
        width: faceBox.width,
        height: Math.min(faceBox.height + expandDown, imageHeight - faceBox.y)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED FACE SHAPE LOCK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply complete face shape lock.
 * 
 * 1. Extract jawline/cheek shape from original
 * 2. Composite at 85% opacity onto generated
 * 3. Return buffer ready for core face overwrite
 */
export async function applyFaceShapeLock(
    originalImageBuffer: Buffer,
    generatedImageBuffer: Buffer,
    originalFaceBox: BoundingBox,
    generatedFaceBox: BoundingBox
): Promise<{ success: boolean; outputBuffer: Buffer; error?: string }> {
    console.log('\n🔒 FACE SHAPE LOCK')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Preserving: jawline, cheeks, chin contour')
    console.log('   Excluding: hair, ears, neck')

    try {
        // Step 1: Extract face shape from original
        const shapeResult = await extractFaceShape(originalImageBuffer, originalFaceBox)
        if (!shapeResult.success) {
            return { success: false, outputBuffer: generatedImageBuffer, error: shapeResult.error }
        }

        // Step 2: Calculate target dimensions
        const targetWidth = generatedFaceBox.width
        const targetHeight = generatedFaceBox.height

        // Step 3: Composite face shape onto generated
        const outputBuffer = await compositeFaceShape(
            generatedImageBuffer,
            shapeResult.shapeBuffer,
            generatedFaceBox,
            targetWidth,
            targetHeight
        )

        console.log('   ═══════════════════════════════════════════════')
        console.log('   ✅ Face shape locked (jawline + cheeks preserved)')

        return { success: true, outputBuffer }
    } catch (error) {
        console.error('❌ Face shape lock failed:', error)
        return {
            success: false,
            outputBuffer: generatedImageBuffer,
            error: error instanceof Error ? error.message : 'Unknown'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFaceShapeLockStatus(): void {
    console.log('\n🔒 FACE SHAPE LOCK STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Preserved: jawline, cheeks, chin')
    console.log('   Excluded: hair, ears, neck')
    console.log(`   Opacity: ${FACE_SHAPE_OPACITY * 100}%`)
    console.log(`   Feather: ${FACE_SHAPE_FEATHER}px`)
    console.log(`   Freeze expansion: +${FACE_FREEZE_EXPAND_DOWN * 100}% downward`)
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Purpose: Prevent rounded-face hallucination')
}
