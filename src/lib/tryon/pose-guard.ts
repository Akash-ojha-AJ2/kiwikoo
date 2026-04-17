/**
 * POSE GUARD MODULE
 * 
 * PURPOSE: Clamp pose requests to safe limits that preserve identity.
 * 
 * PRINCIPLE: If pose cannot be done safely → keep original pose.
 * This is the Higgsfield secret: degrade gracefully to preserve identity.
 * 
 * SAFE DELTAS:
 * - Head tilt: ≤5°
 * - Head rotation: ≤7°
 * - Shoulder rotation: ≤10°
 * - Torso rotation: ≤10°
 * - Arm movement: resting positions only
 * 
 * FORBIDDEN:
 * - Fashion/editorial poses
 * - Dramatic stances
 * - Limb invention
 * - Body re-orientation beyond limits
 */

// ═══════════════════════════════════════════════════════════════
// SAFE POSE PRESETS
// ═══════════════════════════════════════════════════════════════

/**
 * Safe pose presets that preserve identity.
 * Each pose has been validated to NOT trigger face regeneration.
 */
export const SAFE_POSE = {
    /** Default standing position, weight even, arms relaxed */
    standing_neutral: 'standing_neutral',
    /** Seated position, back straight, hands in lap or on surface */
    sitting_neutral: 'sitting_neutral',
    /** Very slight head tilt (≤5°), natural and unintentional */
    slight_head_tilt: 'slight_head_tilt',
    /** Shoulders dropped naturally, not squared to camera */
    relaxed_shoulders: 'relaxed_shoulders',
    /** Slight lean, weight on one leg, casual stance */
    casual_lean: 'casual_lean',
} as const

export type SafePose = keyof typeof SAFE_POSE

// ═══════════════════════════════════════════════════════════════
// POSE DELTA LIMITS
// ═══════════════════════════════════════════════════════════════

/**
 * Maximum allowed pose deltas before clamping.
 * Beyond these limits → keep original pose.
 */
export const POSE_DELTA_LIMITS = {
    /** Max head tilt in degrees */
    headTilt: 5,
    /** Max head rotation in degrees */
    headRotation: 7,
    /** Max shoulder rotation in degrees */
    shoulderRotation: 10,
    /** Max torso rotation in degrees */
    torsoRotation: 10,
    /** Max arm raise angle from resting */
    armRaise: 15,
} as const

// ═══════════════════════════════════════════════════════════════
// POSE REQUEST VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Words/phrases that indicate unsafe pose requests.
 * If detected → revert to standing_neutral.
 */
const UNSAFE_POSE_PATTERNS = [
    /fashion\s*pose/i,
    /editorial\s*pose/i,
    /model\s*pose/i,
    /dramatic\s*pose/i,
    /power\s*pose/i,
    /hands?\s*on\s*hip/i,
    /hands?\s*on\s*face/i,
    /hands?\s*on\s*head/i,
    /leaning\s*forward/i,
    /arms?\s*crossed/i,
    /arms?\s*raised/i,
    /jumping/i,
    /running/i,
    /dancing/i,
    /action\s*pose/i,
    /dynamic\s*pose/i,
]

/**
 * Check if a pose request contains unsafe patterns.
 */
export function isUnsafePose(poseRequest: string): boolean {
    return UNSAFE_POSE_PATTERNS.some(pattern => pattern.test(poseRequest))
}

/**
 * Sanitize a pose request to safe defaults.
 * Returns the original if safe, or 'standing_neutral' if unsafe.
 */
export function sanitizePoseRequest(poseRequest: string): SafePose {
    if (isUnsafePose(poseRequest)) {
        console.warn(`⚠️ POSE GUARD: Unsafe pose "${poseRequest}" → standing_neutral`)
        return 'standing_neutral'
    }

    // Map common safe requests
    const lower = poseRequest.toLowerCase()
    if (lower.includes('sit')) return 'sitting_neutral'
    if (lower.includes('tilt')) return 'slight_head_tilt'
    if (lower.includes('relax')) return 'relaxed_shoulders'
    if (lower.includes('lean') || lower.includes('casual')) return 'casual_lean'

    return 'standing_neutral'
}

// ═══════════════════════════════════════════════════════════════
// MICRO POSE PROMPT BLOCK
// ═══════════════════════════════════════════════════════════════

/**
 * MICRO_POSE_CONSTRAINT: Limits pose changes to safe deltas.
 */
export const MICRO_POSE_CONSTRAINT = `MICRO POSE CONSTRAINT:
- Only small, natural pose adjustments allowed.
- Head tilt: max 5°. Head rotation: max 7°.
- Shoulder/torso rotation: max 10°.
- No exaggerated or expressive poses.
- No fashion, editorial, or dramatic stance.
- If pose cannot be done safely → keep original pose.`

// ═══════════════════════════════════════════════════════════════
// FACE REGION PRIORITY
// ═══════════════════════════════════════════════════════════════

/**
 * FACE_REGION_LOCK: Marks face as copy-only region.
 * This is not inpainting - it's priority reuse instruction.
 */
export const FACE_REGION_LOCK = `FACE REGION LOCK:
- The facial region from Image 1 is immutable.
- Copy face pixels exactly as they appear.
- Do not redraw, refine, enhance, or reinterpret.
- If uncertain, copy without modification.
- Background and body may change. Face may NOT.`

// ═══════════════════════════════════════════════════════════════
// BACKGROUND-ONLY SYNTHESIS
// ═══════════════════════════════════════════════════════════════

/**
 * ENVIRONMENT_CONSTRUCTION: Build scene around person, not vice versa.
 */
export const ENVIRONMENT_CONSTRUCTION = `ENVIRONMENT CONSTRUCTION:
- Construct scene BEHIND the subject.
- Subject position and scale remain fixed.
- Depth created via background only.
- No subject scaling to fit environment.
- Subject does NOT adapt to scene.`

// ═══════════════════════════════════════════════════════════════
// LIGHTING RULES (SAFE)
// ═══════════════════════════════════════════════════════════════

/**
 * LIGHTING_RULES: Light must not sculpt the face.
 */
export const LIGHTING_RULES = `LIGHTING RULES:
- Soft, real-world light sources only.
- No rim lighting.
- No contour lighting.
- No beauty or studio lighting.
- Shadows: gentle and diffuse.
- Light direction: consistent with environment.
- Light must NOT sculpt or define facial features.`

// ═══════════════════════════════════════════════════════════════
// SAFE POSE PROMPT BLOCK
// ═══════════════════════════════════════════════════════════════

/**
 * Get the prompt block for a safe pose.
 */
export function getSafePoseBlock(pose: SafePose): string {
    const poseDescriptions: Record<SafePose, string> = {
        standing_neutral: 'Standing naturally, weight evenly distributed, arms relaxed at sides.',
        sitting_neutral: 'Seated naturally, back supported, hands resting.',
        slight_head_tilt: 'Very slight, natural head tilt (≤5°), unintentional.',
        relaxed_shoulders: 'Shoulders dropped naturally, not squared to camera.',
        casual_lean: 'Slight casual lean, weight on one leg, relaxed stance.',
    }

    return `POSE: ${poseDescriptions[pose]}`
}

// ═══════════════════════════════════════════════════════════════
// POSE GUARD LOGGING
// ═══════════════════════════════════════════════════════════════

/**
 * Log pose guard decision for debugging.
 */
export function logPoseGuard(
    requestedPose: string,
    resolvedPose: SafePose,
    wasModified: boolean
): void {
    console.log(`🧍 POSE GUARD:`)
    console.log(`   Requested: "${requestedPose}"`)
    console.log(`   Resolved: ${resolvedPose}`)
    console.log(`   Modified: ${wasModified ? '⚠️ YES (unsafe request clamped)' : '✓ NO'}`)
}
