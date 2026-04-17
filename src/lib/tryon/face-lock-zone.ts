/**
 * FACE LOCK ZONE MODULE
 * 
 * CORE PRINCIPLE:
 * Treat the identity image as a SOURCE OF TRUTH, not a reference.
 * 
 * This module implements:
 * - Face texture extraction (face + beard + hairline)
 * - Face texture cache per session
 * - Face pixel projection during render
 * 
 * The face is NEVER generated - only projected.
 */

import 'server-only'
import sharp from 'sharp'
import crypto from 'crypto'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FaceLockZone {
    /** Session ID */
    sessionId: string
    /** Image hash for cache validation */
    imageHash: string
    /** Face zone bounds (normalized 0-1) */
    bounds: {
        top: number      // Top of hairline
        bottom: number   // Below chin/beard
        left: number     // Left ear
        right: number    // Right ear
    }
    /** Face texture as base64 (IMMUTABLE) */
    faceTextureBase64: string
    /** Full upper body for context */
    upperBodyBase64: string
    /** Lighting direction detected */
    lightingDirection: 'left' | 'right' | 'front' | 'back'
    /** Confidence score (0-1) */
    confidence: number
    /** Timestamp */
    createdAt: number
    /** Is zone locked */
    isLocked: boolean
}

// ═══════════════════════════════════════════════════════════════
// FACE TEXTURE CACHE
// ═══════════════════════════════════════════════════════════════

const faceZoneCache = new Map<string, FaceLockZone>()

/**
 * Get cached face zone for session.
 */
export function getFaceLockZone(sessionId: string): FaceLockZone | null {
    return faceZoneCache.get(sessionId) || null
}

/**
 * Clear face zone for session.
 */
export function clearFaceLockZone(sessionId: string): void {
    faceZoneCache.delete(sessionId)
    console.log(`🔓 FACE LOCK ZONE CLEARED: ${sessionId}`)
}

// ═══════════════════════════════════════════════════════════════
// FACE ZONE DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Face zone detection bounds.
 * Tightly crops: face + beard + hairline
 */
const FACE_ZONE_BOUNDS = {
    top: 0.0,       // Start at top (include full hair)
    bottom: 0.40,   // Face zone (40% of image for upper body crop)
    left: 0.15,     // 15% from left
    right: 0.85,    // 85% from left
}

/**
 * Expansion for safety margin.
 */
const FACE_ZONE_EXPANSION = {
    top: 0.05,      // Extra 5% for hair
    bottom: 0.08,   // Extra 8% for beard/chin
    left: 0.05,     // Extra 5% for ears
    right: 0.05,    // Extra 5% for ears
}

// ═══════════════════════════════════════════════════════════════
// FACE ZONE EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract face lock zone from image.
 * 
 * This creates an IMMUTABLE face texture that will NEVER be regenerated.
 */
export async function extractFaceLockZone(
    sessionId: string,
    imageBuffer: Buffer
): Promise<FaceLockZone> {
    // Check cache first
    const imageHash = crypto.createHash('sha256')
        .update(imageBuffer)
        .digest('hex')
        .substring(0, 16)

    const cached = faceZoneCache.get(sessionId)
    if (cached && cached.imageHash === imageHash) {
        console.log(`🔒 FACE LOCK ZONE CACHE HIT: ${sessionId}`)
        return cached
    }

    // Get image dimensions
    const img = sharp(imageBuffer)
    const meta = await img.metadata()

    if (!meta.width || !meta.height) {
        throw new Error('Invalid image: missing dimensions')
    }

    // Calculate face zone dimensions
    const faceTop = Math.floor(meta.height * FACE_ZONE_BOUNDS.top)
    const faceBottom = Math.floor(meta.height * FACE_ZONE_BOUNDS.bottom)
    const faceLeft = Math.floor(meta.width * FACE_ZONE_BOUNDS.left)
    const faceRight = Math.floor(meta.width * FACE_ZONE_BOUNDS.right)

    const faceWidth = faceRight - faceLeft
    const faceHeight = faceBottom - faceTop

    // Extract face texture
    const faceBuffer = await img
        .extract({
            left: faceLeft,
            top: faceTop,
            width: faceWidth,
            height: faceHeight,
        })
        .toBuffer()

    // Extract full upper body (55% for context)
    const upperBodyHeight = Math.floor(meta.height * 0.55)
    const upperBodyBuffer = await img
        .extract({
            left: 0,
            top: 0,
            width: meta.width,
            height: upperBodyHeight,
        })
        .toBuffer()

    // Detect lighting direction (simplified)
    const lightingDirection = await detectLightingDirection(faceBuffer)

    const faceLockZone: FaceLockZone = {
        sessionId,
        imageHash,
        bounds: {
            top: FACE_ZONE_BOUNDS.top,
            bottom: FACE_ZONE_BOUNDS.bottom,
            left: FACE_ZONE_BOUNDS.left,
            right: FACE_ZONE_BOUNDS.right,
        },
        faceTextureBase64: faceBuffer.toString('base64'),
        upperBodyBase64: upperBodyBuffer.toString('base64'),
        lightingDirection,
        confidence: 1.0,
        createdAt: Date.now(),
        isLocked: true,
    }

    faceZoneCache.set(sessionId, faceLockZone)

    console.log(`🔒 FACE LOCK ZONE CREATED:`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Image hash: ${imageHash}`)
    console.log(`   Face zone: ${faceWidth}x${faceHeight}`)
    console.log(`   Lighting: ${lightingDirection}`)
    console.log(`   Status: IMMUTABLE`)

    return faceLockZone
}

/**
 * Detect lighting direction from face region.
 */
async function detectLightingDirection(
    faceBuffer: Buffer
): Promise<'left' | 'right' | 'front' | 'back'> {
    const img = sharp(faceBuffer)
    const meta = await img.metadata()

    if (!meta.width || !meta.height) {
        return 'front'
    }

    // Split image into left and right halves
    const halfWidth = Math.floor(meta.width / 2)

    const leftHalf = await img
        .extract({ left: 0, top: 0, width: halfWidth, height: meta.height })
        .stats()

    const rightHalf = await sharp(faceBuffer)
        .extract({ left: halfWidth, top: 0, width: halfWidth, height: meta.height })
        .stats()

    const leftBrightness = leftHalf.channels[0]?.mean || 128
    const rightBrightness = rightHalf.channels[0]?.mean || 128

    const diff = leftBrightness - rightBrightness

    if (Math.abs(diff) < 10) {
        return 'front'
    } else if (diff > 0) {
        return 'left'
    } else {
        return 'right'
    }
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BLOCKS (REQUIRED STRUCTURE)
// ═══════════════════════════════════════════════════════════════

/**
 * [FACE_LOCK] - Must appear FIRST in all prompts.
 */
export const FACE_LOCK_PROMPT = `[FACE_LOCK]
- Face region is immutable.
- Do not generate or modify facial structure.
- Preserve beard, hairline, eye spacing exactly.
- No beautification, no symmetry correction.
- No jawline changes, no beard normalization.
- No eye reshaping.
- If uncertain → COPY FROM SOURCE.`

/**
 * [IDENTITY_PROJECTION] - Reconstruction rules.
 */
export const IDENTITY_PROJECTION_PROMPT = `[IDENTITY_PROJECTION]
- Reconstruct subject from source pixels.
- If uncertain, copy from source.
- Do not imagine or synthesize identity features.`

/**
 * [POSE_INHERITANCE] - Micro-pose only.
 */
export const POSE_INHERITANCE_PROMPT = `[POSE_INHERITANCE]
- Preserve original pose.
- Allow micro-adjustments only.
- Head rotation: ±5 degrees max.
- Body lean: ±5 degrees max.
- If pose exceeds limits → use original.`

/**
 * [CLOTHING_LAYER] - Clothing replacement rules.
 */
export const CLOTHING_LAYER_PROMPT = `[CLOTHING_LAYER]
- Replace clothing only.
- No body reshaping.
- Respect body volume from original.
- Fabric follows original folds and gravity.`

/**
 * [BACKGROUND_REBUILD] - Background reconstruction.
 */
export const BACKGROUND_REBUILD_PROMPT = `[BACKGROUND_REBUILD]
- Generate realistic environment.
- Match camera and lighting logic.
- Soft contact shadows.
- Ambient bounce light.
- Depth falloff.
- Edge blending at shoulders and arms.
- NO pasted cutout look.`

/**
 * [REALISM] - Realism constraints.
 */
export const REALISM_PROMPT = `[REALISM]
- Natural grain.
- Real shadows.
- No portrait-style lighting.
- Avoid studio symmetry.
- Imperfect real-world exposure.`

// ═══════════════════════════════════════════════════════════════
// FULL PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the complete FACE_LOCK_ZONE prompt.
 * 
 * All prompts follow this structure:
 * 1. FACE_LOCK
 * 2. IDENTITY_PROJECTION
 * 3. POSE_INHERITANCE
 * 4. CLOTHING_LAYER
 * 5. BACKGROUND_REBUILD
 * 6. REALISM
 * 
 * Target: <1800 chars
 */
export function buildFaceLockZonePrompt(preset: {
    scene: string
}): string {
    return `${FACE_LOCK_PROMPT}

${IDENTITY_PROJECTION_PROMPT}

${POSE_INHERITANCE_PROMPT}

${CLOTHING_LAYER_PROMPT}

${BACKGROUND_REBUILD_PROMPT}

Scene: ${preset.scene}

${REALISM_PROMPT}`
}

/**
 * Build compact version for cost reduction.
 * Target: <1500 chars
 */
export function buildCompactFaceLockPrompt(preset: {
    scene: string
}): string {
    return `[FACE_LOCK] Face is immutable. Copy from source. No generation.

[IDENTITY] Reconstruct from pixels. If uncertain, copy.

[POSE] Original pose. Micro-adjustments only (±5°).

[CLOTHING] Replace surface only. No body reshaping.

[BACKGROUND] Scene: ${preset.scene}
- Match lighting to subject.
- Add contact shadows.
- Depth falloff.

[REALISM] Natural grain. Real shadows. No portrait lighting.`
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING APPLICATION ORDER
// ═══════════════════════════════════════════════════════════════

/**
 * LIGHTING_ORDER: Critical for avoiding "pasted" look.
 * 
 * Must be applied in this order:
 * 1) Background
 * 2) Body
 * 3) Clothing
 * 4) Face (ONLY subtle color temperature, NO relighting)
 */
export const LIGHTING_ORDER_PROMPT = `[LIGHTING_ORDER]
Apply lighting in this order:
1) Background - full environmental lighting
2) Body - match background light direction
3) Clothing - fabric responds to light
4) Face - ONLY subtle color temperature match
   - NO relighting of facial texture
   - NO shadow modification on face`

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE AND FAILURE HANDLING
// ═══════════════════════════════════════════════════════════════

/**
 * Confidence thresholds.
 */
export const CONFIDENCE_THRESHOLDS = {
    identity: 0.9,    // Abort if below
    clothing: 0.7,    // Blend instead of replace if below
    face: 0.95,       // Abort if below
}

/**
 * Check if generation should proceed.
 */
export function checkConfidence(
    sessionId: string
): { proceed: boolean; action: 'proceed' | 'abort' | 'blend'; message: string } {
    const faceZone = getFaceLockZone(sessionId)

    if (!faceZone) {
        return {
            proceed: false,
            action: 'abort',
            message: 'No face lock zone found',
        }
    }

    if (!faceZone.isLocked) {
        return {
            proceed: false,
            action: 'abort',
            message: 'Face lock zone is not locked',
        }
    }

    if (faceZone.confidence < CONFIDENCE_THRESHOLDS.face) {
        return {
            proceed: false,
            action: 'abort',
            message: `Face confidence (${faceZone.confidence}) below threshold (${CONFIDENCE_THRESHOLDS.face})`,
        }
    }

    return {
        proceed: true,
        action: 'proceed',
        message: 'Confidence check passed',
    }
}

/**
 * Log face lock zone status.
 */
export function logFaceLockZoneStatus(sessionId: string): void {
    const zone = getFaceLockZone(sessionId)

    console.log(`🔒 FACE LOCK ZONE STATUS:`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Zone: ${zone ? 'ACTIVE' : 'NOT FOUND'}`)

    if (zone) {
        console.log(`   Locked: ${zone.isLocked ? 'YES' : 'NO'}`)
        console.log(`   Confidence: ${zone.confidence}`)
        console.log(`   Lighting: ${zone.lightingDirection}`)
        console.log(`   Age: ${Math.floor((Date.now() - zone.createdAt) / 1000)}s`)
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Get face texture for projection.
 */
export function getFaceTexture(sessionId: string): Buffer | null {
    const zone = getFaceLockZone(sessionId)
    if (!zone) return null
    return Buffer.from(zone.faceTextureBase64, 'base64')
}

/**
 * Get upper body for context.
 */
export function getUpperBodyContext(sessionId: string): Buffer | null {
    const zone = getFaceLockZone(sessionId)
    if (!zone) return null
    return Buffer.from(zone.upperBodyBase64, 'base64')
}
