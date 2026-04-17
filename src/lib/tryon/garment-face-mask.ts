/**
 * GARMENT FACE MASK (Sharp-based)
 * 
 * Masks out faces from garment reference images using Sharp.
 * Prevents Gemini from seeing human faces in garment images,
 * which causes it to hallucinate those features onto the output.
 * 
 * CRITICAL: Gemini cannot "ignore" faces. If it sees a face in the garment
 * image, it WILL blend those features into the output. The only solution
 * is to physically remove the face before sending to Gemini.
 * 
 * PIPELINE:
 * 1. Estimate face region in garment image
 * 2. Create black mask over face/neck/hair
 * 3. Return garment image with face masked
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GarmentMaskResult {
    maskedImage: Buffer           // Garment image with face blacked out
    maskedBase64: string          // Base64 version for API
    faceWasDetected: boolean      // Whether a face region was found
    maskApplied: boolean          // Whether mask was applied
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACE REGION ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate where a face might be in a typical garment photo (person wearing clothes)
 * 
 * Typical layouts:
 * - Full body: face at top ~10-30% of image
 * - Upper body: face at top ~20-40% of image
 * - Flat lay: no face expected
 */
function estimatePossibleFaceRegion(
    width: number,
    height: number
): { x: number; y: number; w: number; h: number } | null {
    // For portrait orientation (height > width), likely a person photo
    // For landscape, less likely to have a face
    const isPortrait = height > width

    if (!isPortrait) {
        // Landscape image - likely flat lay, no face
        return null
    }

    // Portrait image - assume face is in upper portion
    // Cover extra area to catch hair and prevent any leakage
    const faceW = Math.floor(width * 0.7)      // 70% of width
    const faceH = Math.floor(height * 0.35)    // 35% of height from top
    const faceX = Math.floor((width - faceW) / 2)  // Centered
    const faceY = 0                            // Start from top

    return { x: faceX, y: faceY, w: faceW, h: faceH }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MASKING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mask out potential face region from garment image
 * 
 * This is a PROACTIVE mask - it doesn't detect faces, it assumes
 * any portrait garment image has a face in the upper region.
 * 
 * Better to mask nothing than leak a face.
 */
export async function maskGarmentFace(
    garmentImageBuffer: Buffer
): Promise<GarmentMaskResult> {
    try {
        const image = sharp(garmentImageBuffer)
        const metadata = await image.metadata()

        if (!metadata.width || !metadata.height) {
            console.warn('⚠️ Cannot get garment image dimensions')
            return {
                maskedImage: garmentImageBuffer,
                maskedBase64: `data:image/png;base64,${garmentImageBuffer.toString('base64')}`,
                faceWasDetected: false,
                maskApplied: false
            }
        }

        const faceRegion = estimatePossibleFaceRegion(metadata.width, metadata.height)

        if (!faceRegion) {
            // No face region expected (landscape/flat lay)
            console.log('   📷 Garment image is landscape/flat lay — no face mask needed')
            const pngBuffer = await sharp(garmentImageBuffer).png().toBuffer()
            return {
                maskedImage: pngBuffer,
                maskedBase64: `data:image/png;base64,${pngBuffer.toString('base64')}`,
                faceWasDetected: false,
                maskApplied: false
            }
        }

        console.log(`   🎭 Masking face region: ${faceRegion.w}x${faceRegion.h} at (${faceRegion.x}, ${faceRegion.y})`)

        // Create black rectangle SVG for mask
        const maskSvg = `
            <svg width="${metadata.width}" height="${metadata.height}">
                <rect x="${faceRegion.x}" y="${faceRegion.y}" 
                      width="${faceRegion.w}" height="${faceRegion.h}"
                      fill="black" />
            </svg>
        `

        // Composite black mask over face region
        const maskedImage = await sharp(garmentImageBuffer)
            .composite([{
                input: Buffer.from(maskSvg),
                blend: 'over'
            }])
            .png()
            .toBuffer()

        console.log('   ✅ Face region masked with black rectangle')

        return {
            maskedImage,
            maskedBase64: `data:image/png;base64,${maskedImage.toString('base64')}`,
            faceWasDetected: true,
            maskApplied: true
        }
    } catch (error) {
        console.error('❌ Garment face masking failed:', error)
        // Return original on error - better than crashing
        const pngBuffer = await sharp(garmentImageBuffer).png().toBuffer()
        return {
            maskedImage: pngBuffer,
            maskedBase64: `data:image/png;base64,${pngBuffer.toString('base64')}`,
            faceWasDetected: false,
            maskApplied: false
        }
    }
}

/**
 * Mask garment face from base64 input
 */
export async function maskGarmentFaceBase64(
    garmentImageBase64: string
): Promise<GarmentMaskResult> {
    // Remove data URI prefix if present
    const base64Data = garmentImageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    return maskGarmentFace(buffer)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logGarmentMaskStatus(result: GarmentMaskResult): void {
    console.log('\n📦 GARMENT FACE MASK STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Face detected: ${result.faceWasDetected ? 'YES' : 'NO'}`)
    console.log(`   Mask applied: ${result.maskApplied ? 'YES' : 'NO'}`)
    console.log('   ═══════════════════════════════════════════════')
}
