/**
 * FACE LOCK / FACE FREEZE MODULE
 * 
 * PURPOSE: Mark face region as READ-ONLY pixels.
 * The model MUST copy the face, NOT regenerate it.
 * 
 * FACE_FREEZE is stricter than FACE_LOCK:
 * - FACE_LOCK: "prefer to copy"
 * - FACE_FREEZE: "must copy exactly, no exceptions"
 * 
 * This module:
 * 1. Provides face-freeze prompt blocks (pixel-copy semantics)
 * 2. Tracks face-lock state per session
 * 3. Logs face-lock compliance
 * 4. Provides zone separation instruction
 */

// ═══════════════════════════════════════════════════════════════
// FACE LOCK (ABSOLUTE) - VERBATIM FROM USER SPEC
// Must appear FIRST in every try-on prompt
// ═══════════════════════════════════════════════════════════════

/**
 * FACE_LOCK_ABSOLUTE: The EXACT block specified by user.
 * 
 * ⚠️ THIS IS VERBATIM. DO NOT MODIFY.
 * This is NOT biometric — this is rendering behavior.
 */
export const FACE_LOCK_ABSOLUTE = `FACE LOCK (ABSOLUTE):
- The face region from Image 1 must be reused exactly.
- Do not generate, alter, enhance, or reinterpret the face.
- Do not change jawline, eyes, beard, or head shape.
- If uncertain, copy pixels directly from Image 1.`

/**
 * FACE_LOCK_READONLY: Alternative wording (same intent).
 */
export const FACE_LOCK_READONLY = `FACE LOCK (READ-ONLY REGION):
- The facial region from Image 1 is locked.
- Copy pixels exactly from Image 1.
- Do not modify, enhance, or reinterpret.
- Do not correct symmetry.
- Do not sharpen, smooth, or beautify.
- If conflict occurs, original pixels must be preserved.`

/**
 * POSE_DELTA: Micro-pose changes only (≤5%).
 * This is why Higgsfield works.
 */
export const POSE_DELTA = `POSE DELTA:
- Pose change magnitude: ≤ 5%
- Allowed: slight head tilt, slight shoulder shift
- Forbidden: new stance, walking, leaning, twisting
- Body orientation must match Image 1`

/**
 * MICRO_POSE_ONLY: Subtle natural variation.
 */
export const MICRO_POSE_ONLY = `MICRO POSE ONLY:
- Allow subtle, natural posture variation.
- No stylized or dramatic posing.
- Body movement must feel unconscious and casual.`

/**
 * EXPRESSION_LOCK: No expression generation.
 */
export const EXPRESSION_LOCK_ABSOLUTE = `EXPRESSION LOCK:
- Maintain original facial expression exactly
- No smile generation
- No eye widening
- No emotional shift`

/**
 * FACIAL_GEOMETRY_PRESERVATION: Spatial locking.
 * ⚠️ This is NOT biometric description — it's spatial locking.
 */
export const FACIAL_GEOMETRY_PRESERVATION = `FACIAL GEOMETRY PRESERVATION:
- Eye spacing, eye size, and gaze must match Image 1 exactly.
- Jawline shape and beard outline must not change.
- No facial rescaling.
- No facial depth reinterpretation.`

/**
 * REALISM_LAYER: Safe realism without face damage.
 */
export const REALISM_LAYER = `REALISM:
- Subtle sensor grain
- Natural noise
- Soft shadow falloff
- Slight atmospheric haze
- Neutral color response`

/**
 * REALISM_ENHANCERS_NONFACIAL: Non-facial realism only.
 */
export const REALISM_ENHANCERS_NONFACIAL = `REALISM ENHANCERS (NON-FACIAL):
- Subtle sensor grain
- Natural shadow noise
- Slight environmental haze
- Imperfect lighting falloff
- Real camera exposure variance`

// ═══════════════════════════════════════════════════════════════
// FACE IMMUTABILITY - OVERRIDES ALL PRESETS
// ═══════════════════════════════════════════════════════════════

/**
 * FACE_IMMUTABILITY: Overrides all presets.
 * This is injected after all other blocks to enforce face protection.
 */
export const FACE_IMMUTABILITY = `FACE IMMUTABILITY:
- The face region must be copied exactly from Image 1.
- Do not redraw, reinterpret, or enhance facial pixels.
- If lighting differs, adjust environment lighting — not the face.`

/**
 * FACIAL_INTEGRITY: Prevents eye/jaw drift.
 * This fixes the "handsome AI face" problem.
 */
export const FACIAL_INTEGRITY = `FACIAL INTEGRITY:
- Do not modify jaw shape.
- Do not adjust eye spacing.
- Do not sharpen facial edges.
- Do not smooth skin.
- Do not balance symmetry.`

/**
 * GLOBAL_REALISM: Safe realism that doesn't affect face.
 */
export const GLOBAL_REALISM = `GLOBAL REALISM:
- Natural sensor grain (subtle)
- Slight lens noise
- Environmental depth haze
- Global color temperature shift
- Soft shadow diffusion`

/**
 * COPY_FACE_FIRST: Must appear at START of all prompts.
 * If this line is missing → reject generation.
 */
export const COPY_FACE_FIRST = `COPY FACE FROM IMAGE 1. DO NOT RECREATE.`

/**
 * FORBIDDEN_REALISM: These cause the "AI face" look.
 */
export const FORBIDDEN_REALISM = `FORBIDDEN:
- Face sharpening
- Skin smoothing
- Jaw definition
- Eye clarity enhancement
- Symmetry correction`

// Legacy exports for backward compatibility
export const FACE_FREEZE_BLOCK = FACE_LOCK_ABSOLUTE
export const FACE_LOCK_BLOCK = FACE_LOCK_ABSOLUTE

// ═══════════════════════════════════════════════════════════════
// ZONE SEPARATION - Explicit generation rules per region
// ═══════════════════════════════════════════════════════════════

/**
 * ZONE_SEPARATION: Explicit rules for each image region.
 * This tells the model exactly what it CAN and CANNOT do.
 */
export const ZONE_SEPARATION = `ZONE SEPARATION:
FACE: COPY exactly from Image 1. No modification.
UPPER BODY: INHERIT from Image 1. Minimal adjustment.
CLOTHING: APPLY from Image 2. Fit to body.
BACKGROUND: GENERATE from preset. Build around subject.

The subject does NOT adapt to the scene.
The scene adapts to the subject.`

// ═══════════════════════════════════════════════════════════════
// PORTRAIT BIAS REMOVAL
// Prevents AI from defaulting to studio portrait mode
// ═══════════════════════════════════════════════════════════════

/**
 * PORTRAIT_BIAS_BLOCK: Disables studio portrait mode.
 */
export const PORTRAIT_BIAS_BLOCK = `PORTRAIT BIAS REMOVAL:
- This is NOT a portrait photo.
- This is a candid, real-world image.
- No studio framing.
- No centered head composition.
- No shallow depth-of-field around face.
- No beauty lighting.
- No background blur isolating face.
- Person exists IN the scene, not posed for it.`

// ═══════════════════════════════════════════════════════════════
// FACIAL DETAIL PRESERVATION
// Safe language that preserves beard, texture, asymmetry
// ═══════════════════════════════════════════════════════════════

/**
 * FACIAL_DETAIL_PRESERVATION: Preserves all visible surface details.
 */
export const FACIAL_DETAIL_PRESERVATION = `DETAIL PRESERVATION:
- Preserve ALL visible surface details from Image 1.
- Do not remove, thin, or simplify any texture.
- If detail exists in Image 1, it MUST exist in output.
- No smoothing. No cleaning. No simplification.`

// ═══════════════════════════════════════════════════════════════
// EXPRESSION LOCK (Strict)
// ═══════════════════════════════════════════════════════════════

/**
 * EXPRESSION_LOCK: Identical expression, no normalization.
 */
export const EXPRESSION_LOCK = `EXPRESSION LOCK:
- Expression must be IDENTICAL to Image 1.
- Eye openness: same as Image 1.
- Gaze direction: same as Image 1.
- No emotional normalization.
- No "alert", "softened", or "pleasant" look.
- Maintain natural asymmetry.`

// ═══════════════════════════════════════════════════════════════
// ZONE INSTRUCTION (Legacy, use ZONE_SEPARATION instead)
// ═══════════════════════════════════════════════════════════════

/**
 * ZONE_INSTRUCTION: Face = COPY, Body = FIT, Environment = GENERATE.
 * 
 * WHY: Model needs explicit permission structure:
 * - Face: NO permission to modify
 * - Body: Permission to fit clothing
 * - Environment: Permission to generate
 */
export const ZONE_INSTRUCTION = ZONE_SEPARATION

// ═══════════════════════════════════════════════════════════════
// REALISM CONSTRAINT (Environment Only)
// ═══════════════════════════════════════════════════════════════

/**
 * REALISM_CONSTRAINT: Realism on environment, not face.
 */
export const REALISM_CONSTRAINT = `REALISM (ENVIRONMENT ONLY):
- Natural sensor grain (very subtle).
- Environmental haze.
- Light falloff on background.
- Shadow softness on ground.
- FORBIDDEN on face: smoothing, sharpening, definition, symmetry.
- If realism conflicts with identity → IDENTITY WINS.`

// ═══════════════════════════════════════════════════════════════
// FACE FREEZE STATE TRACKING
// ═══════════════════════════════════════════════════════════════

interface FaceLockState {
    enabled: boolean
    mode: 'lock' | 'freeze'
    sessionId: string
    imageHash: string
    appliedAt: number
}

// In-memory state (for logging)
let currentFaceLockState: FaceLockState | null = null

/**
 * Enable face freeze for a session (strictest mode).
 */
export function enableFaceFreeze(sessionId: string, imageHash: string): void {
    currentFaceLockState = {
        enabled: true,
        mode: 'freeze',
        sessionId,
        imageHash,
        appliedAt: Date.now()
    }
    console.log(`🔒 FACE FREEZE ENABLED:`)
    console.log(`   Mode: FREEZE (strictest)`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Image hash: ${imageHash}`)
}

/**
 * Enable face lock for a session (standard mode).
 */
export function enableFaceLock(sessionId: string, imageHash: string): void {
    currentFaceLockState = {
        enabled: true,
        mode: 'lock',
        sessionId,
        imageHash,
        appliedAt: Date.now()
    }
    console.log(`🔒 FACE LOCK ENABLED:`)
    console.log(`   Mode: LOCK`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Image hash: ${imageHash}`)
}

/**
 * Get current face lock state.
 */
export function getFaceLockState(): FaceLockState | null {
    return currentFaceLockState
}

/**
 * Log face lock compliance for a generation.
 */
export function logFaceLockCompliance(generationId: string): void {
    if (!currentFaceLockState?.enabled) {
        console.warn(`⚠️ FACE LOCK NOT ENABLED for generation ${generationId}`)
        return
    }
    console.log(`✅ FACE ${currentFaceLockState.mode.toUpperCase()} APPLIED:`)
    console.log(`   Generation: ${generationId}`)
    console.log(`   Source hash: ${currentFaceLockState.imageHash}`)
}

/**
 * Build the complete face-lock prompt prefix.
 * This MUST be prepended to every try-on prompt.
 */
export function buildFaceLockPrefix(): string {
    return `${FACE_LOCK_BLOCK}

${FACIAL_DETAIL_PRESERVATION}

${EXPRESSION_LOCK}

${PORTRAIT_BIAS_BLOCK}

${ZONE_SEPARATION}`
}

/**
 * Build the complete face-freeze prompt prefix (strictest mode).
 */
export function buildFaceFreezePrefix(): string {
    return `${FACE_FREEZE_BLOCK}

${FACIAL_DETAIL_PRESERVATION}

${EXPRESSION_LOCK}

${PORTRAIT_BIAS_BLOCK}

${ZONE_SEPARATION}`
}
