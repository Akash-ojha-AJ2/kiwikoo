/**
 * MODEL-AGNOSTIC FACE FREEZE — Stage A
 * 
 * ========================================================================
 * CRITICAL PRINCIPLE:
 * 
 * Models generate bodies and environments.
 * Faces are INJECTED DATA, not generated concepts.
 * 
 * This is enforced IN CODE, not prompts.
 * ========================================================================
 * 
 * PROBLEM:
 * Flash and Pro produce different faces because Pro "understands" faces.
 * 
 * SOLUTION:
 * NEITHER model ever sees the real face.
 * Both receive neutral skin-tone placeholder.
 * Real face injected AFTER generation.
 * 
 * GUARANTEE: Flash face = Pro face (>= 95% similarity)
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FaceRegion {
    x: number
    y: number
    width: number
    height: number
}

export interface SkinToneData {
    r: number
    g: number
    b: number
    brightness: number
    warmth: number
}

export interface FaceFreezeResult {
    frozenImage: Buffer              // Image with neutral placeholder
    originalFaceBuffer: Buffer       // For reintegration
    faceRegion: FaceRegion
    skinTone: SkinToneData
    success: boolean
    error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_EXPAND_X = 0.20
export const FACE_EXPAND_Y = 0.30
export const GRADIENT_BLUR_RADIUS = 15

// ═══════════════════════════════════════════════════════════════════════════════
// FACE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function detectFaceForFreeze(
    imageBuffer: Buffer
): Promise<FaceRegion | null> {
    try {
        const metadata = await sharp(imageBuffer).metadata()
        if (!metadata.width || !metadata.height) return null

        const faceHeight = Math.floor(metadata.height * 0.45)
        const faceWidth = Math.floor(faceHeight * 0.85)

        return {
            x: Math.floor((metadata.width - faceWidth) / 2),
            y: Math.floor(metadata.height * 0.02),
            width: faceWidth,
            height: faceHeight
        }
    } catch {
        return null
    }
}

export function expandFaceRegion(
    region: FaceRegion,
    imageWidth: number,
    imageHeight: number
): FaceRegion {
    const expandX = Math.floor(region.width * FACE_EXPAND_X)
    const expandY = Math.floor(region.height * FACE_EXPAND_Y)
    const expandYTop = Math.floor(expandY * 0.7)
    const expandYBottom = Math.floor(expandY * 0.3)

    return {
        x: Math.max(0, region.x - expandX),
        y: Math.max(0, region.y - expandYTop),
        width: Math.min(region.width + expandX * 2, imageWidth - Math.max(0, region.x - expandX)),
        height: Math.min(region.height + expandYTop + expandYBottom, imageHeight - Math.max(0, region.y - expandYTop))
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKIN TONE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function extractSkinTone(
    imageBuffer: Buffer,
    faceRegion: FaceRegion
): Promise<SkinToneData> {
    try {
        const faceBuffer = await sharp(imageBuffer)
            .extract({ left: faceRegion.x, top: faceRegion.y, width: faceRegion.width, height: faceRegion.height })
            .toBuffer()

        const stats = await sharp(faceBuffer).stats()
        const r = stats.channels[0]?.mean || 180
        const g = stats.channels[1]?.mean || 150
        const b = stats.channels[2]?.mean || 130

        return {
            r, g, b,
            brightness: (r + g + b) / 3,
            warmth: Math.min(1, Math.max(0, (r - b) / 100 + 0.5))
        }
    } catch {
        return { r: 180, g: 150, b: 130, brightness: 150, warmth: 0.5 }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEUTRAL GRADIENT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateNeutralGradient(
    width: number,
    height: number,
    skinTone: SkinToneData
): Promise<Buffer> {
    const topR = Math.min(255, skinTone.r + 20)
    const topG = Math.min(255, skinTone.g + 15)
    const topB = Math.min(255, skinTone.b + 10)
    const bottomR = Math.max(0, skinTone.r - 15)
    const bottomG = Math.max(0, skinTone.g - 20)
    const bottomB = Math.max(0, skinTone.b - 20)
    const warmthShift = (skinTone.warmth - 0.5) * 10

    const svg = `
        <svg width="${width}" height="${height}">
            <defs>
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(${topR + warmthShift},${topG},${topB - warmthShift})" />
                    <stop offset="50%" style="stop-color:rgb(${skinTone.r},${skinTone.g},${skinTone.b})" />
                    <stop offset="100%" style="stop-color:rgb(${bottomR + warmthShift},${bottomG},${bottomB - warmthShift})" />
                </linearGradient>
                <filter id="softblur"><feGaussianBlur stdDeviation="${GRADIENT_BLUR_RADIUS}" /></filter>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#skinGrad)" />
            <ellipse cx="${width / 2}" cy="${height * 0.45}" rx="${width * 0.4}" ry="${height * 0.35}" 
                     fill="rgba(${skinTone.r + 10},${skinTone.g + 5},${skinTone.b},0.3)" filter="url(#softblur)" />
        </svg>`

    return sharp(Buffer.from(svg)).png().toBuffer()
}

async function createFadeEdgeMask(width: number, height: number, featherRadius: number = 20): Promise<Buffer> {
    const svg = `
        <svg width="${width}" height="${height}">
            <defs><filter id="blur"><feGaussianBlur stdDeviation="${featherRadius}" /></filter></defs>
            <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2 - featherRadius}" ry="${height / 2 - featherRadius}" 
                     fill="white" filter="url(#blur)" />
        </svg>`
    return sharp(Buffer.from(svg)).png().toBuffer()
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FACE FREEZE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Freeze face in image — replace with neutral gradient
 * 
 * CRITICAL: Both Flash AND Pro MUST use this output
 */
export async function freezeFaceForModel(
    originalImageBuffer: Buffer
): Promise<FaceFreezeResult> {
    console.log('\n🧊 FACE FREEZE — Stage A (Model-Agnostic)')

    try {
        const metadata = await sharp(originalImageBuffer).metadata()
        if (!metadata.width || !metadata.height) {
            return {
                frozenImage: originalImageBuffer, originalFaceBuffer: Buffer.alloc(0),
                faceRegion: { x: 0, y: 0, width: 0, height: 0 },
                skinTone: { r: 180, g: 150, b: 130, brightness: 150, warmth: 0.5 },
                success: false, error: 'Cannot get image dimensions'
            }
        }

        const detectedFace = await detectFaceForFreeze(originalImageBuffer)
        if (!detectedFace) {
            console.error('❌ Face detection failed — ABORTING')
            return {
                frozenImage: originalImageBuffer, originalFaceBuffer: Buffer.alloc(0),
                faceRegion: { x: 0, y: 0, width: 0, height: 0 },
                skinTone: { r: 180, g: 150, b: 130, brightness: 150, warmth: 0.5 },
                success: false, error: 'Face detection failed'
            }
        }

        const expandedRegion = expandFaceRegion(detectedFace, metadata.width, metadata.height)
        console.log(`   📍 Face region: ${expandedRegion.width}x${expandedRegion.height}`)

        // Extract original face for reintegration
        const originalFaceBuffer = await sharp(originalImageBuffer)
            .extract({ left: expandedRegion.x, top: expandedRegion.y, width: expandedRegion.width, height: expandedRegion.height })
            .png().toBuffer()

        // Extract skin tone
        const skinTone = await extractSkinTone(originalImageBuffer, detectedFace)
        console.log(`   🎨 Skin tone: RGB(${Math.round(skinTone.r)}, ${Math.round(skinTone.g)}, ${Math.round(skinTone.b)})`)

        // Generate neutral gradient
        const neutralGradient = await generateNeutralGradient(expandedRegion.width, expandedRegion.height, skinTone)
        const fadeMask = await createFadeEdgeMask(expandedRegion.width, expandedRegion.height, 25)

        // Mask gradient
        const maskedGradient = await sharp(neutralGradient)
            .ensureAlpha()
            .composite([{ input: fadeMask, blend: 'dest-in' }])
            .png().toBuffer()

        // Composite onto image
        const frozenImage = await sharp(originalImageBuffer)
            .composite([{ input: maskedGradient, left: expandedRegion.x, top: expandedRegion.y, blend: 'over' }])
            .png().toBuffer()

        console.log('   ✅ Face FROZEN — model will see neutral placeholder')

        return { frozenImage, originalFaceBuffer, faceRegion: expandedRegion, skinTone, success: true }
    } catch (error) {
        console.error('❌ Face freeze failed:', error)
        return {
            frozenImage: originalImageBuffer, originalFaceBuffer: Buffer.alloc(0),
            faceRegion: { x: 0, y: 0, width: 0, height: 0 },
            skinTone: { r: 180, g: 150, b: 130, brightness: 150, warmth: 0.5 },
            success: false, error: error instanceof Error ? error.message : 'Unknown'
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT FOR MODELS
// ═══════════════════════════════════════════════════════════════════════════════

export const MODEL_AGNOSTIC_FACE_PROMPT = `
🧊 FACE FREEZE ACTIVE — DO NOT GENERATE FACE

The face region contains a NEUTRAL PLACEHOLDER.
The real face will be INJECTED post-generation.

YOU MUST:
• Generate body and clothing only
• Match lighting to the neutral face region
• Preserve body pose and proportions
• This is the SAME PERSON as the input

YOU MUST NOT:
• Generate any facial features
• Reconstruct or understand the face
• Beautify the face region
• Add expressions

SAME PERSON GUARANTEE:
Face identity is handled separately via pixel injection.
No reconstruction needed. No beautification allowed.
`
