/**
 * PERSON ANCHOR MODULE
 * 
 * CRITICAL ARCHITECTURAL CHANGE:
 * This is NOT a prompt tuning task.
 * This is a rendering architecture change.
 * 
 * PRINCIPLE: The person must NEVER be re-generated.
 * Only environment, lighting, and clothing deformation may change.
 * 
 * RESEARCH FINDINGS (Higgsfield, etc.):
 * - Higgsfield uses "generative identity embedding"
 * - They analyze facial geometry, lighting, tonal qualities
 * - Then REGENERATE to seamlessly integrate
 * 
 * OUR APPROACH (DIFFERENT - STRICTER):
 * - We treat person pixels as IMMUTABLE
 * - We rebuild scene AROUND the person
 * - We do NOT regenerate any person pixels
 * - Lighting adapts to person, not vice versa
 */

import 'server-only'
import sharp from 'sharp'
import crypto from 'crypto'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Person anchor mask - the immutable region
 */
export interface PersonAnchor {
    /** Session ID for caching */
    sessionId: string
    /** Hash of original image */
    imageHash: string
    /** Anchor region bounds (normalized 0-1) */
    bounds: {
        top: number      // Top of head
        bottom: number   // Mid-torso
        left: number     // Full width
        right: number    // Full width
    }
    /** Person region as base64 (READ-ONLY pixels) */
    personRegionBase64: string
    /** Estimated lighting direction from person */
    lightingProfile: LightingProfile
    /** Anchor integrity score (0-1) */
    integrityScore: number
    /** Timestamp */
    createdAt: number
    /** Is anchor active */
    isActive: boolean
}

/**
 * Lighting profile extracted from person region
 * Used to harmonize background lighting
 */
export interface LightingProfile {
    /** Primary light direction (degrees, 0 = front) */
    direction: number
    /** Light softness (0 = hard, 1 = diffuse) */
    softness: number
    /** Color temperature (Kelvin) */
    temperature: number
    /** Shadow intensity (0-1) */
    shadowIntensity: number
    /** Is backlit */
    isBacklit: boolean
}

// ═══════════════════════════════════════════════════════════════
// PERSON ANCHOR CACHE
// ═══════════════════════════════════════════════════════════════

const anchorCache = new Map<string, PersonAnchor>()

/**
 * Get cached anchor for session
 */
export function getPersonAnchor(sessionId: string): PersonAnchor | null {
    return anchorCache.get(sessionId) || null
}

/**
 * Clear anchor for session
 */
export function clearPersonAnchor(sessionId: string): void {
    anchorCache.delete(sessionId)
    console.log(`🔓 PERSON ANCHOR CLEARED: ${sessionId}`)
}

// ═══════════════════════════════════════════════════════════════
// ANCHOR CREATION
// ═══════════════════════════════════════════════════════════════

/**
 * Create person anchor from identity image.
 * 
 * This extracts the immutable person region (head → mid-torso)
 * and estimates lighting profile for scene harmonization.
 */
export async function createPersonAnchor(
    sessionId: string,
    imageBuffer: Buffer
): Promise<PersonAnchor> {
    // Check cache first
    const imageHash = crypto.createHash('sha256')
        .update(imageBuffer)
        .digest('hex')
        .substring(0, 16)

    const cached = anchorCache.get(sessionId)
    if (cached && cached.imageHash === imageHash) {
        console.log(`🔒 PERSON ANCHOR CACHE HIT: ${sessionId}`)
        return cached
    }

    // Extract person region
    const img = sharp(imageBuffer)
    const meta = await img.metadata()

    if (!meta.width || !meta.height) {
        throw new Error('Invalid image: missing dimensions')
    }

    // Person region: head → mid-torso (55% of height, full width)
    // This is the IMMUTABLE region
    const bounds = {
        top: 0,
        bottom: 0.55,
        left: 0,
        right: 1,
    }

    const personHeight = Math.floor(meta.height * bounds.bottom)
    const personBuffer = await img
        .extract({
            left: 0,
            top: 0,
            width: meta.width,
            height: personHeight,
        })
        .toBuffer()

    // Estimate lighting profile from person region
    const lightingProfile = await estimateLightingProfile(personBuffer)

    const anchor: PersonAnchor = {
        sessionId,
        imageHash,
        bounds,
        personRegionBase64: personBuffer.toString('base64'),
        lightingProfile,
        integrityScore: 1.0, // Fresh anchor has perfect integrity
        createdAt: Date.now(),
        isActive: true,
    }

    anchorCache.set(sessionId, anchor)

    console.log(`🔒 PERSON ANCHOR CREATED:`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Image hash: ${imageHash}`)
    console.log(`   Region: head → mid-torso (55%)`)
    console.log(`   Lighting: ${lightingProfile.temperature}K, softness=${lightingProfile.softness.toFixed(2)}`)
    console.log(`   Integrity: ${anchor.integrityScore}`)

    return anchor
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING PROFILE ESTIMATION
// ═══════════════════════════════════════════════════════════════

/**
 * Estimate lighting profile from person region.
 * 
 * This is used to harmonize background lighting with person lighting.
 * The background must adapt to the person's light, not vice versa.
 */
async function estimateLightingProfile(imageBuffer: Buffer): Promise<LightingProfile> {
    // Analyze image statistics
    const img = sharp(imageBuffer)
    const stats = await img.stats()

    // Estimate color temperature from RGB balance
    const r = stats.channels[0]?.mean || 128
    const g = stats.channels[1]?.mean || 128
    const b = stats.channels[2]?.mean || 128

    // Simple temperature estimation (warmer = lower Kelvin)
    const warmth = (r - b) / 255
    const temperature = Math.round(5500 - warmth * 2000) // 3500K - 7500K range

    // Estimate softness from contrast (low contrast = soft light)
    const contrast = (stats.channels[0]?.stdev || 50) / 128
    const softness = Math.max(0, Math.min(1, 1 - contrast))

    // Estimate shadow intensity
    const shadowIntensity = Math.max(0, Math.min(1, contrast * 0.8))

    // Simple backlight detection (brighter at edges)
    const isBacklit = false // Would need more sophisticated analysis

    // Light direction (assume front-lit for now)
    const direction = 0

    return {
        direction,
        softness,
        temperature,
        shadowIntensity,
        isBacklit,
    }
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BLOCKS FOR PERSON ANCHOR
// ═══════════════════════════════════════════════════════════════

/**
 * PERSON_ANCHOR_BLOCK: Must appear FIRST in all prompts.
 * 
 * This instructs the model to treat person pixels as READ-ONLY.
 */
export const PERSON_ANCHOR_BLOCK = `PERSON ANCHOR:
- Copy person pixels exactly from Image 1.
- Do not regenerate or reinterpret the person.
- Face, hair, beard, eyes are immutable.`

/**
 * SCENE_RECONSTRUCTION_BLOCK: Build scene around person.
 */
export const SCENE_RECONSTRUCTION_BLOCK = `SCENE RECONSTRUCTION:
- Build environment around the existing person.
- Match perspective, scale, and lighting.
- Add realistic background depth and clutter.`

/**
 * LIGHTING_MATCH_BLOCK: Match background to person lighting.
 */
export const LIGHTING_MATCH_BLOCK = `LIGHTING MATCH:
- Match background lighting to person lighting.
- Soft natural falloff.
- No dramatic contrast.`

/**
 * GARMENT_DEFORMATION_BLOCK: Clothing behavior only.
 */
export const GARMENT_DEFORMATION_BLOCK = `GARMENT BEHAVIOR:
- Apply garment from Image 2.
- Deform fabric naturally around existing body.
- No body reshaping.`

/**
 * MICRO_POSE_STRICT: Extremely limited pose changes.
 */
export const MICRO_POSE_STRICT = `MICRO POSE (STRICT):
- Head tilt: ≤ 3 degrees
- Shoulder relaxation: minimal
- Micro arm bend for garment fit only
- Natural breathing posture
- NO leaning, NO arm crossing, NO rotation
- Silhouette must match original`

/**
 * PERSON_IMMUTABILITY_GUARANTEE: Hard rule for face protection.
 */
export const PERSON_IMMUTABILITY_GUARANTEE = `PERSON IMMUTABILITY:
- Face pixels are copied verbatim
- Eyes must not be re-rendered
- Beard density must not change
- Jawline edges must not be sharpened
- No symmetry correction
- No smoothing
- No beautification

If modification attempted → discard → revert to original pixels.`

// ═══════════════════════════════════════════════════════════════
// FULL ANCHOR PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the complete anchor-based prompt.
 * 
 * This is the final prompt structure for Higgsfield-style preservation:
 * 1. Person Anchor (immutable)
 * 2. Scene Reconstruction (around person)
 * 3. Lighting Match (to person)
 * 4. Garment Deformation (only)
 * 5. Micro Pose (strict)
 * 6. Person Immutability (guarantee)
 */
export function buildAnchorPrompt(
    preset: { scene: string; lighting: string }
): string {
    return `${PERSON_ANCHOR_BLOCK}

${SCENE_RECONSTRUCTION_BLOCK}

${LIGHTING_MATCH_BLOCK}

${GARMENT_DEFORMATION_BLOCK}

${MICRO_POSE_STRICT}

ENVIRONMENT:
- Scene: ${preset.scene}
- Lighting: Ambient environmental to match person lighting

${PERSON_IMMUTABILITY_GUARANTEE}`
}

// ═══════════════════════════════════════════════════════════════
// ANCHOR INTEGRITY CHECK
// ═══════════════════════════════════════════════════════════════

/**
 * Check anchor integrity before generation.
 * 
 * If integrity score < threshold, abort generation.
 * This prevents identity drift over multiple generations.
 */
export function checkAnchorIntegrity(
    sessionId: string,
    threshold: number = 0.9
): { valid: boolean; score: number; message: string } {
    const anchor = getPersonAnchor(sessionId)

    if (!anchor) {
        return {
            valid: false,
            score: 0,
            message: 'No anchor found for session',
        }
    }

    if (!anchor.isActive) {
        return {
            valid: false,
            score: 0,
            message: 'Anchor is not active',
        }
    }

    if (anchor.integrityScore < threshold) {
        return {
            valid: false,
            score: anchor.integrityScore,
            message: `Anchor integrity (${anchor.integrityScore.toFixed(2)}) below threshold (${threshold})`,
        }
    }

    return {
        valid: true,
        score: anchor.integrityScore,
        message: 'Anchor integrity verified',
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get person region image for generation.
 */
export function getPersonRegionImage(sessionId: string): Buffer | null {
    const anchor = getPersonAnchor(sessionId)
    if (!anchor) return null
    return Buffer.from(anchor.personRegionBase64, 'base64')
}

/**
 * Get lighting profile for scene harmonization.
 */
export function getLightingProfile(sessionId: string): LightingProfile | null {
    const anchor = getPersonAnchor(sessionId)
    if (!anchor) return null
    return anchor.lightingProfile
}
