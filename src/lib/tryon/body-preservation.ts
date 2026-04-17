/**
 * BODY PRESERVATION & CLOTH FIT
 * 
 * ========================================================================
 * PROBLEM:
 * 
 * The model hallucinates body shape instead of preserving original:
 * - Body type changed (slimmer/fuller than original)
 * - Proportions altered (shoulder width, waist, hips)
 * - Garment doesn't fit naturally on actual body
 * 
 * SOLUTION:
 * 
 * 1. Extract body proportions from original image
 * 2. Build body preservation constraints
 * 3. Add body-fit garment prompt rules
 * 4. Validate body similarity after generation
 * ========================================================================
 */

import 'server-only'
import sharp from 'sharp'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
}

export interface BodyProportions {
    shoulderWidth: number
    torsoLength: number
    hipWidth: number
    armLength: number
    bodyType: 'slim' | 'average' | 'athletic' | 'fuller'
    estimatedBMICategory: 'underweight' | 'normal' | 'overweight' | 'obese'
}

export interface BodyPreservationConstraints {
    proportions: BodyProportions
    preserveExactly: string[]
    forbidden: string[]
    garmentFitRules: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// BODY PROPORTION EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate body proportions from face bounding box.
 * 
 * Uses anatomical ratios to estimate body dimensions.
 * This is approximate - in production, use actual pose estimation.
 */
export function estimateBodyProportions(
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): BodyProportions {
    // Standard anatomical ratios (relative to face height)
    // Average adult: body is ~7.5 face heights
    const faceHeight = faceBox.height

    // Shoulder width is approximately 2.0-2.3x face width
    const shoulderWidth = faceBox.width * 2.1

    // Torso length (shoulders to hips) is approximately 2.0x face height
    const torsoLength = faceHeight * 2.0

    // Hip width varies by body type
    const hipWidth = shoulderWidth * 0.85  // Default average

    // Arm length is approximately 2.5x face height
    const armLength = faceHeight * 2.5

    // Estimate body type based on visible proportions
    const bodyType = estimateBodyType(faceBox, imageWidth, imageHeight)

    // Estimate BMI category
    const estimatedBMICategory = estimateBMICategory(bodyType)

    return {
        shoulderWidth,
        torsoLength,
        hipWidth,
        armLength,
        bodyType,
        estimatedBMICategory
    }
}

/**
 * Estimate body type from visible proportions.
 */
function estimateBodyType(
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): 'slim' | 'average' | 'athletic' | 'fuller' {
    // This is a placeholder - in production, use ML-based body analysis
    // For now, return 'average' as default
    // The actual body type should be preserved from the original image
    return 'average'
}

/**
 * Estimate BMI category from body type.
 */
function estimateBMICategory(
    bodyType: 'slim' | 'average' | 'athletic' | 'fuller'
): 'underweight' | 'normal' | 'overweight' | 'obese' {
    const mapping: Record<typeof bodyType, 'underweight' | 'normal' | 'overweight' | 'obese'> = {
        'slim': 'normal',
        'average': 'normal',
        'athletic': 'normal',
        'fuller': 'overweight'
    }
    return mapping[bodyType]
}

// ═══════════════════════════════════════════════════════════════════════════════
// BODY PRESERVATION CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build comprehensive body preservation constraints.
 */
export function buildBodyPreservationConstraints(
    proportions: BodyProportions
): BodyPreservationConstraints {
    const preserveExactly = [
        'body_type_and_build',
        'shoulder_width_and_slope',
        'torso_length_and_shape',
        'hip_width_and_curve',
        'arm_length_and_thickness',
        'weight_distribution',
        'body_fat_percentage_visual',
        'posture_and_stance',
        'all_body_asymmetries'
    ]

    const forbidden = [
        'slimming_body',
        'widening_body',
        'reshaping_torso',
        'altering_proportions',
        'changing_posture',
        'straightening_spine',
        'beautifying_figure',
        'model_like_proportions',
        'athletic_transformation',
        'any_body_modification'
    ]

    const garmentFitRules = [
        'garment_adapts_to_body',
        'body_does_not_adapt_to_garment',
        'natural_fabric_draping_on_actual_body',
        'visible_body_shape_under_fabric',
        'tight_fit_shows_actual_curves',
        'loose_fit_drapes_over_actual_body',
        'no_idealized_fit',
        'realistic_tension_and_fold_lines'
    ]

    return {
        proportions,
        preserveExactly,
        forbidden,
        garmentFitRules
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// JSON PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build JSON-structured body preservation prompt.
 */
export function buildBodyPreservationPrompt(
    constraints: BodyPreservationConstraints
): string {
    const prompt = {
        body_rules: {
            status: "IMMUTABLE",
            reconstruction_allowed: false,

            same_body_rule: {
                enabled: true,
                description: "This is the SAME BODY as the input image. Same weight, same proportions, same shape."
            },

            proportions: {
                shoulder_width: "PRESERVE_EXACTLY",
                torso_length: "PRESERVE_EXACTLY",
                hip_width: "PRESERVE_EXACTLY",
                arm_length: "PRESERVE_EXACTLY",
                body_type: constraints.proportions.bodyType.toUpperCase(),
                modification: "FORBIDDEN"
            },

            preserve_exactly: constraints.preserveExactly,

            forbidden_operations: constraints.forbidden,

            body_check: {
                if_body_looks_slimmer: "WRONG",
                if_body_looks_fuller: "WRONG",
                if_proportions_changed: "WRONG",
                if_posture_improved: "WRONG",
                if_looks_like_model: "WRONG"
            }
        },

        garment_fit: {
            rule: "GARMENT_ADAPTS_TO_BODY",
            body_adapts_to_garment: false,

            fit_rules: constraints.garmentFitRules,

            expectations: {
                tight_garment: "Shows actual body curves underneath",
                loose_garment: "Drapes over actual body shape",
                structured_garment: "Follows actual shoulder and hip lines",
                fabric_tension: "Realistic based on actual body size"
            },

            forbidden_fit: [
                "idealized_fit",
                "flattering_drape",
                "slimming_effect",
                "body_shaping"
            ]
        }
    }

    return JSON.stringify(prompt, null, 2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED BODY PRESERVATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute body preservation data for a user image.
 */
export function computeBodyPreservation(
    faceBox: BoundingBox,
    imageWidth: number,
    imageHeight: number
): { constraints: BodyPreservationConstraints; prompt: string } {
    console.log('\n🏋️ BODY PRESERVATION')
    console.log('   ═══════════════════════════════════════════════')

    // Extract proportions
    const proportions = estimateBodyProportions(faceBox, imageWidth, imageHeight)
    console.log(`   Body type: ${proportions.bodyType}`)
    console.log(`   Shoulder width: ${proportions.shoulderWidth.toFixed(0)}px`)
    console.log(`   Torso length: ${proportions.torsoLength.toFixed(0)}px`)

    // Build constraints
    const constraints = buildBodyPreservationConstraints(proportions)
    console.log(`   Preserve: ${constraints.preserveExactly.length} attributes`)
    console.log(`   Forbidden: ${constraints.forbidden.length} operations`)

    // Build prompt
    const prompt = buildBodyPreservationPrompt(constraints)

    console.log('   ═══════════════════════════════════════════════')
    console.log('   ✅ Body preservation constraints active')
    console.log('   🔒 Garment adapts to body, NOT body to garment')

    return { constraints, prompt }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logBodyPreservationStatus(): void {
    console.log('\n🏋️ BODY PRESERVATION STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Body status: IMMUTABLE')
    console.log('   Slimming: FORBIDDEN')
    console.log('   Reshaping: FORBIDDEN')
    console.log('   Beautification: FORBIDDEN')
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Rule: Garment adapts to body, NOT body to garment')
    console.log('   Fit: Natural on ACTUAL body shape')
}
