/**
 * IDENTITY FACE LOCK MODULE
 * 
 * PURPOSE: Detect and lock the face region as READ-ONLY pixels.
 * The model is NOT allowed to generate inside this region.
 * 
 * THIS IS HOW HIGGSFIELD WORKS:
 * - Face pixels are reused, not regenerated
 * - The model copies pixels instead of imagining them
 * 
 * BEHAVIOR:
 * 1. Take identity image
 * 2. Detect face bounding box (heuristic)
 * 3. Expand box (forehead + jaw + ears)
 * 4. Freeze this region
 * 5. Mark as read-only pixels
 */

import 'server-only'
import sharp from 'sharp'
import crypto from 'crypto'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Face bounding box (normalized 0-1)
 */
export interface FaceBoundingBox {
    /** Left edge (0-1) */
    left: number
    /** Top edge (0-1) */
    top: number
    /** Right edge (0-1) */
    right: number
    /** Bottom edge (0-1) */
    bottom: number
}

/**
 * Face lock state for a session
 */
export interface FaceLockState {
    /** Session ID */
    sessionId: string
    /** Hash of the identity image */
    imageHash: string
    /** Face bounding box (normalized) */
    boundingBox: FaceBoundingBox
    /** Cropped face region as base64 */
    faceRegionBase64: string
    /** Full upper body crop as base64 */
    upperBodyBase64: string
    /** Timestamp when locked */
    lockedAt: number
    /** Is the lock active */
    isActive: boolean
}

// ═══════════════════════════════════════════════════════════════
// FACE BOUNDING BOX HEURISTICS
// ═══════════════════════════════════════════════════════════════

/**
 * Default face bounding box (when detection fails)
 * 
 * Based on typical portrait composition:
 * - Face is centered horizontally
 * - Face starts ~10% from top
 * - Face ends ~55% from top
 */
const DEFAULT_FACE_BOUNDS: FaceBoundingBox = {
    left: 0.25,     // 25% from left
    top: 0.05,      // 5% from top (include forehead/hair)
    right: 0.75,    // 75% from left
    bottom: 0.50,   // 50% from top (include jaw)
}

/**
 * Expansion factors for face bounding box
 * This ensures we capture:
 * - Full forehead and hairline
 * - Ears
 * - Jawline and beard
 */
const FACE_BOX_EXPANSION = {
    top: 0.15,      // Expand up 15% for hair/forehead
    bottom: 0.10,   // Expand down 10% for jaw/beard
    left: 0.10,     // Expand left 10% for ears
    right: 0.10,    // Expand right 10% for ears
}

// ═══════════════════════════════════════════════════════════════
// FACE DETECTION (HEURISTIC-BASED)
// ═══════════════════════════════════════════════════════════════

/**
 * Detect face bounding box from image.
 * 
 * NOTE: This uses heuristics, not ML face detection.
 * For identity-preserving try-on, heuristics are sufficient
 * because we control the input (user selfies/portraits).
 * 
 * The key insight is: we don't need perfect detection.
 * We need a LOCKED REGION that includes the face.
 */
export function detectFaceBounds(
    imageWidth: number,
    imageHeight: number,
    aspectRatio: number
): FaceBoundingBox {
    // For portrait orientation, face is typically in upper 50%
    // For landscape, face might be more centered

    if (aspectRatio > 1) {
        // Landscape - face more centered
        return {
            left: 0.30,
            top: 0.10,
            right: 0.70,
            bottom: 0.85,
        }
    } else if (aspectRatio < 0.7) {
        // Tall portrait - face in upper portion
        return {
            left: 0.15,
            top: 0.05,
            right: 0.85,
            bottom: 0.45,
        }
    } else {
        // Square-ish - use defaults
        return DEFAULT_FACE_BOUNDS
    }
}

/**
 * Expand face bounding box to include forehead, ears, jaw.
 */
export function expandFaceBounds(bounds: FaceBoundingBox): FaceBoundingBox {
    const height = bounds.bottom - bounds.top
    const width = bounds.right - bounds.left

    return {
        left: Math.max(0, bounds.left - width * FACE_BOX_EXPANSION.left),
        top: Math.max(0, bounds.top - height * FACE_BOX_EXPANSION.top),
        right: Math.min(1, bounds.right + width * FACE_BOX_EXPANSION.right),
        bottom: Math.min(1, bounds.bottom + height * FACE_BOX_EXPANSION.bottom),
    }
}

// ═══════════════════════════════════════════════════════════════
// FACE REGION EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract face region from identity image.
 * 
 * This creates the "locked" face pixels that will be
 * composited back after body/scene generation.
 */
export async function extractFaceRegion(
    imageBuffer: Buffer,
    bounds?: FaceBoundingBox
): Promise<{
    faceBuffer: Buffer
    usedBounds: FaceBoundingBox
    width: number
    height: number
}> {
    const img = sharp(imageBuffer)
    const meta = await img.metadata()

    if (!meta.width || !meta.height) {
        throw new Error('Invalid image: missing dimensions')
    }

    const aspectRatio = meta.width / meta.height
    const detectedBounds = bounds || detectFaceBounds(meta.width, meta.height, aspectRatio)
    const expandedBounds = expandFaceBounds(detectedBounds)

    // Convert normalized bounds to pixel coordinates
    const left = Math.floor(expandedBounds.left * meta.width)
    const top = Math.floor(expandedBounds.top * meta.height)
    const right = Math.floor(expandedBounds.right * meta.width)
    const bottom = Math.floor(expandedBounds.bottom * meta.height)
    const width = right - left
    const height = bottom - top

    const faceBuffer = await img
        .extract({
            left,
            top,
            width,
            height,
        })
        .toBuffer()

    console.log(`👤 FACE REGION EXTRACTED:`)
    console.log(`   Bounds: [${left}, ${top}] → [${right}, ${bottom}]`)
    console.log(`   Size: ${width}x${height}`)

    return {
        faceBuffer,
        usedBounds: expandedBounds,
        width,
        height,
    }
}

// ═══════════════════════════════════════════════════════════════
// FACE LOCK STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// In-memory cache for face lock states
const faceLockCache = new Map<string, FaceLockState>()

/**
 * Create a face lock for a session.
 */
export async function createFaceLock(
    sessionId: string,
    identityImageBuffer: Buffer
): Promise<FaceLockState> {
    // Check cache first
    const imageHash = crypto.createHash('sha256')
        .update(identityImageBuffer)
        .digest('hex')
        .substring(0, 16)

    const cached = faceLockCache.get(sessionId)
    if (cached && cached.imageHash === imageHash) {
        console.log(`🔒 FACE LOCK CACHE HIT: ${sessionId}`)
        return cached
    }

    // Extract face region
    const { faceBuffer, usedBounds, width, height } = await extractFaceRegion(identityImageBuffer)

    // Create upper body crop (head → mid-torso, 55%)
    const img = sharp(identityImageBuffer)
    const meta = await img.metadata()
    const upperBodyHeight = Math.floor((meta.height || 0) * 0.55)
    const upperBodyBuffer = await img
        .extract({
            left: 0,
            top: 0,
            width: meta.width || 0,
            height: upperBodyHeight,
        })
        .toBuffer()

    const state: FaceLockState = {
        sessionId,
        imageHash,
        boundingBox: usedBounds,
        faceRegionBase64: faceBuffer.toString('base64'),
        upperBodyBase64: upperBodyBuffer.toString('base64'),
        lockedAt: Date.now(),
        isActive: true,
    }

    faceLockCache.set(sessionId, state)

    console.log(`🔒 FACE LOCK CREATED:`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Image hash: ${imageHash}`)
    console.log(`   Face bounds: [${usedBounds.left.toFixed(2)}, ${usedBounds.top.toFixed(2)}] → [${usedBounds.right.toFixed(2)}, ${usedBounds.bottom.toFixed(2)}]`)

    return state
}

/**
 * Get face lock for a session.
 */
export function getFaceLock(sessionId: string): FaceLockState | null {
    return faceLockCache.get(sessionId) || null
}

/**
 * Clear face lock for a session.
 */
export function clearFaceLock(sessionId: string): void {
    faceLockCache.delete(sessionId)
    console.log(`🔓 FACE LOCK CLEARED: ${sessionId}`)
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BLOCKS (VERBATIM FROM USER SPEC)
// ═══════════════════════════════════════════════════════════════

/**
 * FACE LOCK BLOCK: READ-ONLY region instruction.
 * 
 * ⚠️ THIS IS VERBATIM. DO NOT MODIFY.
 */
export const FACE_LOCK_READONLY = `FACE LOCK (READ-ONLY REGION):
- The facial region from Image 1 is locked.
- Copy pixels exactly from Image 1.
- Do not modify, enhance, or reinterpret.
- Do not correct symmetry.
- Do not sharpen, smooth, or beautify.
- If conflict occurs, original pixels must be preserved.`

/**
 * MICRO POSE ONLY: Subtle natural variation.
 */
export const MICRO_POSE_ONLY = `MICRO POSE ONLY:
- Allow subtle, natural posture variation.
- No stylized or dramatic posing.
- Body movement must feel unconscious and casual.`

/**
 * FACIAL GEOMETRY PRESERVATION: Spatial locking.
 * 
 * ⚠️ This is not biometric description — it's spatial locking.
 */
export const FACIAL_GEOMETRY_PRESERVATION = `FACIAL GEOMETRY PRESERVATION:
- Eye spacing, eye size, and gaze must match Image 1 exactly.
- Jawline shape and beard outline must not change.
- No facial rescaling.
- No facial depth reinterpretation.`

/**
 * REALISM ENHANCERS: Non-facial only.
 */
export const REALISM_ENHANCERS_NONFACIAL = `REALISM ENHANCERS (NON-FACIAL):
- Subtle sensor grain
- Natural shadow noise
- Slight environmental haze
- Imperfect lighting falloff
- Real camera exposure variance`

/**
 * FORBIDDEN REALISM: These cause AI face look.
 */
export const FORBIDDEN_ENHANCEMENTS = `FORBIDDEN:
- Beauty filters
- Skin smoothing
- Face sharpening
- Portrait lighting
- Symmetry correction`

// ═══════════════════════════════════════════════════════════════
// TWO-STAGE PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════════

/**
 * Build Stage A prompt: FACE RECONSTRUCTION (NO GENERATION)
 * 
 * Purpose: Copy face pixels exactly. Do not modify.
 */
export function buildStageAPrompt(): string {
    return `STAGE A — FACE RECONSTRUCTION (READ-ONLY):

${FACE_LOCK_READONLY}

${FACIAL_GEOMETRY_PRESERVATION}

INSTRUCTION:
- This is Image 1: a cropped face/head region.
- Copy these pixels exactly.
- Do not modify. Do not enhance.
- Output must be pixel-identical to input in face region.`
}

/**
 * Build Stage B prompt: BODY/SCENE SYNTHESIS
 * 
 * Purpose: Generate body, clothing, background around locked face.
 */
export function buildStageBPrompt(
    preset: { scene: string; lighting: string },
    garmentDescription?: string
): string {
    return `STAGE B — BODY/SCENE SYNTHESIS:

${FACE_LOCK_READONLY}

${MICRO_POSE_ONLY}

BODY & GARMENT:
- Apply garment from Image 2 only.
- Body proportions unchanged.
${garmentDescription ? `- Garment: ${garmentDescription}` : ''}

ENVIRONMENT:
- Scene: ${preset.scene}
- Lighting: ${preset.lighting}

${REALISM_ENHANCERS_NONFACIAL}

${FORBIDDEN_ENHANCEMENTS}

COMPOSITE RULE:
- Face pixels from Image 1 MUST be preserved.
- Generate body and scene around the face.
- Any conflict → face pixels win.`
}

// ═══════════════════════════════════════════════════════════════
// COMBINED PROMPT FOR SINGLE-PASS (OPTIMIZED)
// ═══════════════════════════════════════════════════════════════

/**
 * Build combined prompt for single-pass generation.
 * 
 * This uses the same blocks but in a single prompt,
 * for when two-stage is not needed.
 */
export function buildCombinedFaceLockPrompt(
    preset: { scene: string; lighting: string }
): string {
    return `RECONSTRUCT — DO NOT REIMAGINE.

${FACE_LOCK_READONLY}

${FACIAL_GEOMETRY_PRESERVATION}

${MICRO_POSE_ONLY}

BODY & GARMENT:
- Apply garment from Image 2 only.
- Body proportions unchanged.

ENVIRONMENT:
- Scene: ${preset.scene}
- Lighting: ${preset.lighting}

${REALISM_ENHANCERS_NONFACIAL}

${FORBIDDEN_ENHANCEMENTS}`
}
