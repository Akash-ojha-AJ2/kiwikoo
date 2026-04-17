/**
 * HUMAN LOCK MODULE
 * 
 * CORE RULE (NON-NEGOTIABLE):
 * The human subject must NEVER be generated.
 * The human subject must ONLY be reconstructed from Image 1 pixels.
 * 
 * If the model is unsure about any human region:
 * → it must COPY pixels from Image 1, not invent.
 * 
 * No exceptions.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// GLOBAL MODE
// ═══════════════════════════════════════════════════════════════

/**
 * HUMAN_LOCK_MODE: Global flag for strict human reconstruction.
 * 
 * When enabled:
 * - Face generation is forbidden
 * - Head generation is forbidden
 * - Eye generation is forbidden
 * - Beard generation is forbidden
 * - Jaw generation is forbidden
 * - Hand regeneration is forbidden
 * - Body re-sculpting is forbidden
 * 
 * Only pixel reconstruction is allowed for human regions.
 */
export const HUMAN_LOCK_MODE = true

// ═══════════════════════════════════════════════════════════════
// REGION AUTHORITY MAP
// ═══════════════════════════════════════════════════════════════

/**
 * HUMAN GEOMETRY (LOCKED) - MUST be reconstructed from Image 1.
 * These define the body shape, NOT clothing.
 */
export const HUMAN_GEOMETRY_LOCKED = [
    'face',
    'head',
    'hair',
    'eyes',
    'beard',
    'jaw',
    'neck',
    'shoulders',
    'arms',
    'hands',
    'torso_shape',
    'body_proportions',
] as const

/**
 * CLOTHING SURFACE (REPLACEABLE) - MAY be regenerated.
 * Only the fabric surface, NOT the body underneath.
 */
export const CLOTHING_REPLACEABLE = [
    'shirt',
    't_shirt',
    'top',
    'collar',
    'buttons',
    'fabric_texture',
    'fabric_folds',
    'fabric_color',
    'sleeve_fabric',
] as const

/**
 * Regions that belong to the human subject (legacy).
 * These MUST be reconstructed from Image 1, NEVER generated.
 */
export const HUMAN_REGIONS = [
    'face',
    'head',
    'hair',
    'eyes',
    'beard',
    'neck',
    'shoulders',
    'arms',
    'hands',
    'torso',
    'body_proportions',
] as const

/**
 * Regions that can be generated (non-human).
 */
export const GENERATE_ALLOWED_REGIONS = [
    'background',
    'furniture',
    'environment',
    'lighting_interaction',
    'shadows',
    'clothing_fabric_surface',
] as const

export type HumanRegion = typeof HUMAN_REGIONS[number]
export type GenerateRegion = typeof GENERATE_ALLOWED_REGIONS[number]
export type ClothingRegion = typeof CLOTHING_REPLACEABLE[number]

// ═══════════════════════════════════════════════════════════════
// CLOTHING SURFACE OVERRIDE (CRITICAL)
// ═══════════════════════════════════════════════════════════════

/**
 * CLOTHING_SURFACE_OVERRIDE: Allows clothing replacement.
 * 
 * CLOTHING MAY be regenerated, but ONLY by:
 * - Projecting Image 2 clothing onto existing body geometry
 * - Following original folds, gravity, and pose
 * - No change to body shape underneath
 */
export const CLOTHING_SURFACE_OVERRIDE = `CLOTHING OVERRIDE:
- Replace clothing surface only.
- Preserve body geometry underneath.
- Project garment from Image 2 onto Image 1 body.
- Fabric follows original folds and gravity.
- Do not alter body shape to fit garment.

CLOTHING RULES:
- Clothing must wrap the original body.
- No resizing torso or shoulders.
- No slimming or broadening.
- No changing arm thickness.
- Buttons and seams must align with body orientation.

FAILURE MODE:
- If clothing cannot be projected safely → keep original clothing.
- Do NOT reimagine body.`

// ═══════════════════════════════════════════════════════════════
// POSE CHANGE LIMITS
// ═══════════════════════════════════════════════════════════════

/**
 * Maximum allowed pose changes.
 * If requested pose exceeds these limits, keep original pose.
 */
export const POSE_LIMITS = {
    head_angle_degrees: 5,    // ≤ 5°
    shoulder_shift_percent: 3, // ≤ 3%
    arm_movement_percent: 5,   // ≤ 5%
    no_limb_repositioning: true,
} as const

// ═══════════════════════════════════════════════════════════════
// PROMPT CORE (THE EXACT PROMPT TO USE)
// ═══════════════════════════════════════════════════════════════

/**
 * RECONSTRUCT_HUMAN_CORE: The complete prompt core for human reconstruction.
 * 
 * This REPLACES all existing human-related language.
 */
export const RECONSTRUCT_HUMAN_CORE = `RECONSTRUCT HUMAN FROM IMAGE 1.
DO NOT GENERATE A PERSON.

HUMAN LOCK:
- The person must be reconstructed from Image 1 pixels.
- Do not re-imagine the face, body, or features.
- Do not beautify, enhance, smooth, or stylize.
- If uncertain, copy pixels exactly.

FACE:
- Copy face exactly from Image 1.
- No reshaping.
- No symmetry correction.
- No eye adjustment.
- No jaw changes.
- No beard changes.

BODY:
- Copy body proportions from Image 1.
- No posture invention.
- No fashion poses.
- No stance changes beyond micro tolerance.

CLOTHING OVERRIDE:
- Replace clothing surface only.
- Preserve body geometry underneath.
- Project garment from Image 2 onto Image 1 body.
- Fabric follows original folds and gravity.
- Do not alter body shape to fit garment.
- Clothing must wrap the original body.
- No resizing torso or shoulders.
- No slimming or broadening.
- Buttons and seams must align with body orientation.

LIGHTING:
- Apply lighting to EXISTING geometry.
- Lighting must not reshape face or body.
- Shadows must align with background light direction.

BACKGROUND:
- Generate background only outside human silhouette.
- Respect depth, perspective, and occlusion.
- Add contact shadows under feet/chair.

FORBIDDEN:
- Generating a face
- Improving attractiveness
- Fixing symmetry
- Sharpening facial edges
- Portrait-style rendering
- Resizing body to fit clothing`

/**
 * HUMAN_LOCK_BLOCK: Short version for injection.
 */
export const HUMAN_LOCK_BLOCK = `HUMAN LOCK:
- Reconstruct person from Image 1 pixels only.
- Do not generate face, head, eyes, beard, jaw, hands.
- If uncertain, copy pixels exactly.`

/**
 * FACE_RECONSTRUCT_BLOCK: Face-specific reconstruction.
 */
export const FACE_RECONSTRUCT_BLOCK = `FACE RECONSTRUCTION:
- Copy face exactly from Image 1.
- No reshaping, no symmetry, no eye adjustment.
- No jaw changes, no beard changes.
- If uncertain, use original pixels.`

/**
 * BODY_RECONSTRUCT_BLOCK: Body reconstruction rules.
 */
export const BODY_RECONSTRUCT_BLOCK = `BODY RECONSTRUCTION:
- Copy body proportions from Image 1.
- No posture invention, no fashion poses.
- Stance changes: ≤5° head, ≤3% shoulder, ≤5% arm.
- If pose exceeds limits, keep original.`

/**
 * CLOTHING_SURFACE_BLOCK: Clothing behavior.
 */
export const CLOTHING_SURFACE_BLOCK = `CLOTHING SURFACE:
- Replace clothing surface only.
- Follow original body folds and gravity.
- Fabric must wrap existing body shape.
- No body reshaping under clothing.`

/**
 * LIGHTING_HARMONIZATION_BLOCK: Anti-paste lighting.
 */
export const LIGHTING_HARMONIZATION_BLOCK = `LIGHTING HARMONIZATION:
- Sample background light direction.
- Apply same light falloff to subject.
- Add soft contact shadows.
- Slight ambient occlusion near shoulders.
- Lighting must NOT reshape face or body.`

/**
 * GENERATION_AUTHORITY_BLOCK: What can and cannot be generated.
 */
export const GENERATION_AUTHORITY_BLOCK = `GENERATION AUTHORITY:

RECONSTRUCT ONLY (human regions):
- Face, head, hair, eyes, beard
- Neck, shoulders, arms, hands
- Torso, body proportions

GENERATE ALLOWED (non-human):
- Background, furniture, environment
- Lighting interaction, shadows
- Clothing fabric surface ONLY

If a pixel belongs to a human region → copy from Image 1.`

/**
 * HAND_SAFETY_BLOCK: Hand generation rules.
 */
export const HAND_SAFETY_BLOCK = `HAND SAFETY:
- If hands visible in Image 1 → copy exactly.
- If hands NOT visible → do NOT generate hands.
- Keep arms cropped or resting naturally.
- Never invent fingers.`

/**
 * FORBIDDEN_ACTIONS_BLOCK: What is strictly forbidden.
 */
export const FORBIDDEN_ACTIONS_BLOCK = `FORBIDDEN ACTIONS:
- Generating a face
- Generating eyes
- Generating a jawline
- Generating a beard
- Improving attractiveness
- Fixing symmetry
- Sharpening facial edges
- Portrait-style rendering
- Beauty lighting on face
- Fashion poses
- Limb repositioning`

// ═══════════════════════════════════════════════════════════════
// FULL HUMAN LOCK PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the complete HUMAN_LOCK prompt.
 * This is the ONLY prompt structure to use for try-on.
 * 
 * Target length: <1800 chars
 */
export function buildHumanLockPrompt(preset: {
    scene: string
    lighting: string
}): string {
    return `${RECONSTRUCT_HUMAN_CORE}

ENVIRONMENT:
- Scene: ${preset.scene}
- Light direction: Match to subject.
- Add contact shadows and ambient occlusion.`
}

/**
 * Build a compact version for API cost reduction.
 * Target: <1500 chars
 */
export function buildCompactHumanLockPrompt(preset: {
    scene: string
}): string {
    return `RECONSTRUCT HUMAN FROM IMAGE 1. DO NOT GENERATE.

${HUMAN_LOCK_BLOCK}

${FACE_RECONSTRUCT_BLOCK}

${BODY_RECONSTRUCT_BLOCK}

CLOTHING:
- Replace surface only. Wrap existing body.

BACKGROUND:
- Scene: ${preset.scene}
- Generate outside human silhouette only.
- Match lighting to subject. Add contact shadows.

FORBIDDEN:
- Face generation
- Eye generation
- Jaw changes
- Beard changes
- Symmetry fixes
- Sharpening
- Beauty rendering`
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if human lock mode is active.
 */
export function isHumanLockActive(): boolean {
    return HUMAN_LOCK_MODE
}

/**
 * Check if a region requires reconstruction (not generation).
 */
export function isReconstructOnly(region: string): boolean {
    return HUMAN_REGIONS.includes(region as HumanRegion)
}

/**
 * Check if a region can be generated.
 */
export function canGenerate(region: string): boolean {
    return GENERATE_ALLOWED_REGIONS.includes(region as GenerateRegion)
}

/**
 * Validate pose change is within limits.
 */
export function validatePoseChange(change: {
    headAngle?: number
    shoulderShift?: number
    armMovement?: number
}): { valid: boolean; message: string } {
    if (change.headAngle && change.headAngle > POSE_LIMITS.head_angle_degrees) {
        return {
            valid: false,
            message: `Head angle ${change.headAngle}° exceeds limit of ${POSE_LIMITS.head_angle_degrees}°`,
        }
    }

    if (change.shoulderShift && change.shoulderShift > POSE_LIMITS.shoulder_shift_percent) {
        return {
            valid: false,
            message: `Shoulder shift ${change.shoulderShift}% exceeds limit of ${POSE_LIMITS.shoulder_shift_percent}%`,
        }
    }

    if (change.armMovement && change.armMovement > POSE_LIMITS.arm_movement_percent) {
        return {
            valid: false,
            message: `Arm movement ${change.armMovement}% exceeds limit of ${POSE_LIMITS.arm_movement_percent}%`,
        }
    }

    return { valid: true, message: 'Pose change within limits' }
}

/**
 * Log human lock status.
 */
export function logHumanLockStatus(sessionId: string): void {
    console.log(`🔒 HUMAN LOCK STATUS:`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   Mode: ${HUMAN_LOCK_MODE ? 'ACTIVE' : 'INACTIVE'}`)
    console.log(`   Face generation: FORBIDDEN`)
    console.log(`   Body generation: FORBIDDEN`)
    console.log(`   Reconstruction: REQUIRED`)
    console.log(`   Pose limits: head≤${POSE_LIMITS.head_angle_degrees}°, shoulder≤${POSE_LIMITS.shoulder_shift_percent}%, arm≤${POSE_LIMITS.arm_movement_percent}%`)
}
