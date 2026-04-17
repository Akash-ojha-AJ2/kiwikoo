/**
 * PERCEPTUAL LOCKS — Phase 3A
 * 
 * Reduces "uncanny" perception by eliminating unnecessary variability.
 * These are HARD CONSTRAINTS that cannot be overridden.
 * 
 * ========================================================================
 * WHY THESE LOCKS EXIST:
 * 
 * 1. FACE LIGHTING: Dramatic shadows on faces trigger "uncanny valley."
 *    Face lighting is locked to soft/frontal/even. Environment can vary.
 * 
 * 2. CAMERA GEOMETRY: Free-form camera descriptions cause pose drift.
 *    Camera is locked to phone-camera specs for consistency.
 * 
 * 3. EXPRESSION/GAZE: "Pleasant" or "confident" expressions drift faces.
 *    Expression is locked to neutral. Gaze is locked to forward.
 * 
 * These locks work WITH face pixel overwrite, not instead of it.
 * Face overwrite guarantees structure; these locks reduce perception issues.
 * ========================================================================
 * 
 * CRITICAL: Do NOT add new lighting/camera/expression options.
 *           Reducing variability is the goal.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3A.1 — FACE-SAFE LIGHTING LOCK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Face lighting is ALWAYS soft, frontal, and even.
 * This is non-negotiable because:
 * - Dramatic shadows distort facial perception
 * - High contrast makes face overwrite edges visible
 * - Cinematic lighting on faces triggers uncanny valley
 */
export const FACE_LIGHTING_LOCK = {
    type: 'soft_frontal' as const,
    direction: 'front',
    intensity: 'even',
    contrast: 'low',
    shadows: 'minimal',

    // Explicit prohibitions
    forbidden: [
        'dramatic',
        'harsh',
        'side_lit',
        'rim_light',
        'high_contrast',
        'moody',
        'chiaroscuro',
        'silhouette',
        'backlighting_on_face',
    ],
} as const

/**
 * Environment lighting CAN be expressive (body, background only).
 * This separation allows visual interest without face distortion.
 */
export const ENVIRONMENT_LIGHTING_OPTIONS = {
    natural_daylight: 'Soft natural daylight, even distribution',
    golden_hour: 'Warm golden hour glow on background and body',
    overcast: 'Diffused overcast light, soft shadows',
    indoor_ambient: 'Indoor ambient lighting, realistic',
    street_lighting: 'Urban street lighting, natural',
} as const

export type EnvironmentLightingType = keyof typeof ENVIRONMENT_LIGHTING_OPTIONS

/**
 * Build the lighting constraint prompt.
 * Face lighting is LOCKED. Environment can vary.
 */
export function buildLightingConstraint(
    environmentType: EnvironmentLightingType = 'natural_daylight'
): string {
    return `
═══════════════════════════════════════════════════════════════════════════════
LIGHTING LOCK — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════════════════════

FACE LIGHTING (LOCKED — DO NOT MODIFY):
• Type: Soft, frontal, even
• Shadows on face: MINIMAL to NONE
• Contrast on face: LOW
• Direction: From front, slightly above eye level
• NO dramatic shadows on face
• NO side lighting on face
• NO high contrast on face

WHY: Face pixels will be overwritten. Matching soft lighting prevents visible edges.

ENVIRONMENT/BODY LIGHTING (VARIABLE):
• ${ENVIRONMENT_LIGHTING_OPTIONS[environmentType]}
• Natural depth and atmosphere allowed
• Background can have mood lighting
• Body can have natural shadows

═══════════════════════════════════════════════════════════════════════════════
`.trim()
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3A.2 — CANONICAL CAMERA GEOMETRY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Camera is LOCKED to phone-camera specs.
 * This eliminates free-form camera descriptions that cause pose inconsistency.
 * 
 * WHY: "DSLR 85mm portrait lens" vs "phone camera" changes everything:
 * - Perspective distortion differs
 * - Depth of field differs
 * - Expected subject distance differs
 * 
 * By locking to phone camera, we get:
 * - Consistent perspective
 * - Predictable framing
 * - Matching user expectations (most photos are phone photos)
 */
export const CANONICAL_CAMERA = {
    // Focal length: 28mm equivalent (standard phone wide camera)
    focalLength: '28mm',

    // Camera height: Eye level (most natural)
    height: 'eye_level',

    // Distance buckets (not free-form)
    distanceOptions: {
        selfie: 'arm_length',      // ~0.5m
        portrait: 'conversational', // ~1.5m
        full_body: 'full_frame',   // ~2.5m
    },

    // Angle: Straight-on (no Dutch angles, no looking up/down)
    angle: 'straight_on',

    // Forbidden descriptions
    forbidden: [
        'DSLR',
        'professional camera',
        'studio camera',
        'cinematic',
        'wide angle distortion',
        'fish eye',
        'telephoto compression',
        'drone shot',
        'low angle hero shot',
        'Dutch angle',
    ],
} as const

export type CameraDistance = keyof typeof CANONICAL_CAMERA.distanceOptions

/**
 * Build the camera constraint prompt.
 */
export function buildCameraConstraint(
    distance: CameraDistance = 'portrait'
): string {
    return `
═══════════════════════════════════════════════════════════════════════════════
CAMERA LOCK — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════════════════════

CAMERA TYPE (LOCKED):
• Device: Phone camera (not DSLR, not professional)
• Focal length: ${CANONICAL_CAMERA.focalLength} equivalent
• Perspective: Natural phone camera perspective

CAMERA POSITION (LOCKED):
• Height: Eye level
• Angle: Straight-on (no tilts, no Dutch angles)
• Distance: ${CANONICAL_CAMERA.distanceOptions[distance]}

FORBIDDEN CAMERA DESCRIPTIONS:
• NO "professional photography"
• NO "DSLR" or "studio camera"
• NO "cinematic" camera work
• NO extreme angles or perspectives

WHY: Phone camera perspective is universally familiar and reduces uncanny effects.

═══════════════════════════════════════════════════════════════════════════════
`.trim()
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3A.3 — EXPRESSION & GAZE LOCK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Expression and gaze are LOCKED to neutral.
 * 
 * WHY: Most perceived "face drift" is actually expression drift.
 * Even with perfect facial structure, a different expression reads as a different person.
 * 
 * "Pleasant" or "confident" expressions are subjective and drift-prone.
 * Neutral is stable, predictable, and matches most input photos.
 */
export const EXPRESSION_GAZE_LOCK = {
    expression: {
        primary: 'neutral',
        secondary: 'relaxed',

        // Explicit prohibitions
        forbidden: [
            'smiling',
            'happy',
            'pleasant',
            'confident',
            'model-like',
            'professional',
            'attractive',
            'engaging',
            'warm',
            'inviting',
            'sultry',
            'serious',
            'intense',
        ],
    },

    gaze: {
        direction: 'forward',
        target: 'camera',

        // Explicit prohibitions
        forbidden: [
            'looking away',
            'candid glance',
            'looking off camera',
            'dreamy gaze',
            'introspective',
        ],
    },
} as const

/**
 * Build the expression constraint prompt.
 */
export function buildExpressionConstraint(): string {
    return `
═══════════════════════════════════════════════════════════════════════════════
EXPRESSION & GAZE LOCK — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════════════════════

EXPRESSION (LOCKED):
• Primary: Neutral
• Secondary: Relaxed (if slight expression needed)
• NO smiling, happy, pleasant, confident, model-like expressions
• NO "professional" or "attractive" descriptors

GAZE (LOCKED):
• Direction: Forward, looking at camera
• NO looking away, candid glances, or dreamy gazes

WHY: Expression drift is the #1 cause of perceived face changes.
Even with identical facial structure, different expressions read as different people.
Locking to neutral eliminates this perception issue.

NOTE: The actual face pixels will be overwritten post-generation.
This lock ensures the generated face position/angle matches for seamless compositing.

═══════════════════════════════════════════════════════════════════════════════
`.trim()
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED PERCEPTUAL LOCK PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export interface PerceptualLockConfig {
    environmentLighting?: EnvironmentLightingType
    cameraDistance?: CameraDistance
}

/**
 * Build the complete perceptual lock prompt.
 * This should be prepended to all generation prompts.
 */
export function buildPerceptualLockPrompt(
    config: PerceptualLockConfig = {}
): string {
    const {
        environmentLighting = 'natural_daylight',
        cameraDistance = 'portrait',
    } = config

    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║  PERCEPTUAL LOCKS — PHASE 3A (ENTROPY REDUCTION)                              ║
║  These constraints CANNOT be overridden by presets or user input.             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

${buildExpressionConstraint()}

${buildLightingConstraint(environmentLighting)}

${buildCameraConstraint(cameraDistance)}

`.trim()
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate that a preset doesn't violate perceptual locks.
 * Returns warnings for any violations (for logging, not blocking).
 */
export function validatePresetAgainstLocks(preset: {
    lighting_name?: string
    pose_name?: string
    camera_spec?: string
}): { valid: boolean; warnings: string[] } {
    const warnings: string[] = []

    // Check lighting
    if (preset.lighting_name) {
        const lower = preset.lighting_name.toLowerCase()
        for (const forbidden of FACE_LIGHTING_LOCK.forbidden) {
            if (lower.includes(forbidden.toLowerCase())) {
                warnings.push(`Preset lighting "${preset.lighting_name}" contains forbidden term "${forbidden}"`)
            }
        }
    }

    // Check camera
    if (preset.camera_spec) {
        const lower = preset.camera_spec.toLowerCase()
        for (const forbidden of CANONICAL_CAMERA.forbidden) {
            if (lower.includes(forbidden.toLowerCase())) {
                warnings.push(`Preset camera "${preset.camera_spec}" contains forbidden term "${forbidden}"`)
            }
        }
    }

    return {
        valid: warnings.length === 0,
        warnings,
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logPerceptualLockStatus(): void {
    console.log('\n🔒 PERCEPTUAL LOCKS ACTIVE')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Face Lighting: soft/frontal/even (LOCKED)')
    console.log('   Camera: 28mm phone camera, eye-level (LOCKED)')
    console.log('   Expression: neutral (LOCKED)')
    console.log('   Gaze: forward (LOCKED)')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Purpose: Reduce uncanny perception, not correctness')
    console.log('   Note: Face pixels are still overwritten post-generation')
}
