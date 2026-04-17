/**
 * HYPER-REALISM ENGINE
 * 
 * PURPOSE: Fix face drift by sending face crop as separate image.
 * The model MUST match face pixels against this reference.
 * 
 * ARCHITECTURE:
 * - Image 1 = Full person (body context)
 * - Image 2 = Garment (clothing reference)
 * - Image 3 = Face crop (IMMUTABLE face reference)
 * 
 * COST OPTIMIZATION:
 * - Face crop is same resolution as input (no upscaling)
 * - Extracted once and cached per session
 */

import 'server-only'
import { extractFaceRegion, type FaceBoundingBox } from './identity-face-lock'

// ═══════════════════════════════════════════════════════════════
// HYPER-REALISM FACE BLOCK
// ═══════════════════════════════════════════════════════════════

export const HYPER_REALISM_FACE_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HYPER-REALISM FACE LOCK (Image 3 = Face Reference)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Image 3 contains the EXACT face pixels that MUST appear in output.
This is NOT a description - it is a PIXEL REFERENCE.

EXECUTION:
1. Compare output face against Image 3 pixel-by-pixel
2. Eyebrows: MUST match Image 3 exactly (shape, density, arch)
3. Skin texture: MUST match Image 3 exactly (pores, marks, imperfections)
4. Eye shape: MUST match Image 3 exactly (not rounder, not narrower)
5. Lips: MUST match Image 3 exactly (shape, color, texture)
6. Face shape: MUST match Image 3 exactly (jawline, cheekbones)

IF ANY FEATURE DIFFERS FROM Image 3:
→ GENERATION FAILED
→ This person's family would notice the difference

FORBIDDEN:
✗ Smoother skin than Image 3
✗ Different eyebrow shape than Image 3
✗ Cleaner/neater appearance than Image 3
✗ Any beautification not in Image 3
✗ Any symmetry correction

The face in output must be INDISTINGUISHABLE from Image 3.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

// ═══════════════════════════════════════════════════════════════
// HYPER-REALISM PHYSICS BLOCK
// ═══════════════════════════════════════════════════════════════

export const HYPER_REALISM_PHYSICS_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FABRIC PHYSICS (HYPER-REALISM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GRAVITY:
- Heavy fabrics PULL DOWN (not float)
- Light fabrics FLOW with air movement
- All fabric responds to body weight distribution

DRAPING:
- Fabric follows body contour naturally
- Loose fabric gathers at waist/hips
- Tight fabric shows body shape without wrinkles
- Straps sit naturally on shoulders (not perfectly centered)

WRINKLES (REQUIRED):
- At joints: elbows, knees, waist
- Where fabric bunches: armpits, waistband
- Dynamic wrinkles from recent movement
- NOT stiff, NOT pressed, NOT ironed-looking

INTERACTION:
- Fabric touches skin where appropriate
- Air gaps where fabric drapes
- Natural shadows under fabric folds

FORBIDDEN:
✗ Mannequin/plastic fabric appearance
✗ Perfectly smooth fabric with no wrinkles
✗ Fabric floating or defying gravity
✗ Catalog/fashion photography stiffness
✗ Symmetrical fabric draping
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

// ═══════════════════════════════════════════════════════════════
// COMBINED HYPER-REALISM BLOCK
// ═══════════════════════════════════════════════════════════════

export const HYPER_REALISM_FULL_BLOCK = `${HYPER_REALISM_FACE_BLOCK}

${HYPER_REALISM_PHYSICS_BLOCK}`

// ═══════════════════════════════════════════════════════════════
// FACE CROP EXTRACTION (COST-OPTIMIZED)
// ═══════════════════════════════════════════════════════════════

export interface FaceCropResult {
    faceCropBase64: string
    bounds: FaceBoundingBox
    width: number
    height: number
}

// Cache for face crops to avoid re-extraction
const faceCropCache = new Map<string, FaceCropResult>()

/**
 * Extract face crop from person image for Image 3.
 * 
 * COST OPTIMIZATION:
 * - Same resolution as input (no upscaling)
 * - Cached per image hash
 * - Minimal processing
 */
export async function extractFaceCropForImage3(
    imageBase64: string,
    imageHash: string
): Promise<FaceCropResult> {
    // Check cache first
    const cached = faceCropCache.get(imageHash)
    if (cached) {
        console.log(`🔒 FACE CROP CACHE HIT: ${imageHash}`)
        return cached
    }

    // Import sharp dynamically
    let sharp: any
    try {
        sharp = (await import('sharp')).default
    } catch {
        throw new Error('Sharp not available for face extraction')
    }

    // Convert base64 to buffer
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(cleanBase64, 'base64')

    // Extract face region
    const { faceBuffer, usedBounds, width, height } = await extractFaceRegion(imageBuffer)

    const result: FaceCropResult = {
        faceCropBase64: faceBuffer.toString('base64'),
        bounds: usedBounds,
        width,
        height,
    }

    // Cache it
    faceCropCache.set(imageHash, result)

    console.log(`👤 FACE CROP EXTRACTED FOR IMAGE 3:`)
    console.log(`   Hash: ${imageHash}`)
    console.log(`   Size: ${width}x${height}`)
    console.log(`   Bounds: [${usedBounds.left.toFixed(2)}, ${usedBounds.top.toFixed(2)}] → [${usedBounds.right.toFixed(2)}, ${usedBounds.bottom.toFixed(2)}]`)

    return result
}

/**
 * Clear face crop cache for a hash.
 */
export function clearFaceCropCache(imageHash: string): void {
    faceCropCache.delete(imageHash)
}

/**
 * Log hyper-realism status.
 */
export function logHyperRealismStatus(hasFaceCrop: boolean): void {
    console.log(`\n🔬 HYPER-REALISM ENGINE:`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📸 Image 1: Person (body context)`)
    console.log(`   👗 Image 2: Garment (clothing reference)`)
    console.log(`   👤 Image 3: ${hasFaceCrop ? 'Face crop (ACTIVE)' : 'Not available'}`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🧊 Face matching: ${hasFaceCrop ? 'PIXEL-LEVEL' : 'PROMPT-ONLY'}`)
    console.log(`   ⚛️ Fabric physics: ENABLED`)
}
