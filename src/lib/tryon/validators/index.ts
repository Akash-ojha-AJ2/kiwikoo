/**
 * COMPREHENSIVE VALIDATORS
 * 
 * Post-generation validation suite with auto-retry logic.
 * Validates: face, body, pose, lighting, garment, variants.
 */

import 'server-only'
import type { FaceValidationResult } from '../intelligence/face-guardrail'
import type { GarmentValidationResult } from '../intelligence/garment-guardrail'
import type { BodyInferenceResult } from '../body-inference'
import { validatePoseAsymmetry } from '../pose-naturalism'
import { validateLightingDirectionality } from '../lighting-realism'
import { validateAllVariants, type VariantName } from '../variant-intelligence'

export interface ValidationFailure {
    type: 'FACE_MISMATCH' | 'BODY_MISMATCH' | 'POSE_SYMMETRY' | 'LIGHTING_FLAT' | 'VARIANTS_SIMILAR' | 'GARMENT_WRONG'
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    message: string
    suggestedFix: string
    score?: number
}

export interface ComprehensiveValidationResult {
    passed: boolean
    failures: ValidationFailure[]
    scores: {
        face_similarity?: number
        pose_asymmetry?: number
        lighting_falloff?: number
        variant_difference?: number
    }
    should_retry: boolean
    retry_emphasis?: string
}

/**
 * Validate single output against all criteria
 */
export async function validateSingleOutput(params: {
    generatedImageBase64: string
    originalUserImageBase64: string
    originalGarmentImageBase64: string
    faceValidation: FaceValidationResult
    garmentValidation: GarmentValidationResult
    bodyInference: BodyInferenceResult
    faceSimilarityThreshold: number
}): Promise<ComprehensiveValidationResult> {
    console.log('\n' + '═'.repeat(80))
    console.log('POST-GENERATION VALIDATION')
    console.log('═'.repeat(80))

    const failures: ValidationFailure[] = []
    const scores: any = {}

    // ═══ 1. FACE VALIDATION ═══
    console.log('\n1/4 Validating face match...')
    scores.face_similarity = params.faceValidation.similarity_score

    if (params.faceValidation.similarity_score < params.faceSimilarityThreshold) {
        failures.push({
            type: 'FACE_MISMATCH',
            severity: 'CRITICAL',
            message: `Face similarity ${params.faceValidation.similarity_score}% < threshold ${params.faceSimilarityThreshold}%`,
            suggestedFix: 'Strengthen face freeze constraint. Retry with Pass 2 only (PRO) or stronger pixel-copy emphasis (FLASH).',
            score: params.faceValidation.similarity_score
        })
    }

    // ═══ 2. POSE ASYMMETRY ═══
    console.log('\n2/4 Validating pose naturalism...')
    const poseResult = await validatePoseAsymmetry(params.generatedImageBase64)
    scores.pose_asymmetry = 100 - poseResult.symmetry_score

    if (!poseResult.is_asymmetrical || poseResult.symmetry_score >= 40) {
        failures.push({
            type: 'POSE_SYMMETRY',
            severity: 'HIGH',
            message: `Pose too symmetrical (${poseResult.symmetry_score}% symmetry). Issues: ${poseResult.issues.join(', ')}`,
            suggestedFix: 'Add stronger asymmetry constraints: shoulder tilt 5-10°, weight shift, arm asymmetry.',
            score: poseResult.symmetry_score
        })
    }

    // ═══ 3. LIGHTING DIRECTIONALITY ═══
    console.log('\n3/4 Validating lighting realism...')
    const lightingResult = await validateLightingDirectionality(params.generatedImageBase64)
    scores.lighting_falloff = lightingResult.falloff_percentage

    if (!lightingResult.is_directional || lightingResult.falloff_percentage < 5) {
        failures.push({
            type: 'LIGHTING_FLAT',
            severity: 'MEDIUM',
            message: `Lighting too flat (${lightingResult.falloff_percentage}% falloff, shadows: ${lightingResult.has_shadows})`,
            suggestedFix: 'Increase directional light emphasis. Require one primary light source with 10-15% falloff.',
            score: lightingResult.falloff_percentage
        })
    }

    // ═══ 4. GARMENT MATCH ═══
    console.log('\n4/4 Validating garment match...')
    if (!params.garmentValidation.is_valid) {
        failures.push({
            type: 'GARMENT_WRONG',
            severity: 'CRITICAL',
            message: `Garment mismatch: ${params.garmentValidation.issues.join(', ')}`,
            suggestedFix: 'Re-extract garment if needed. Strengthen type/length constraints from classification.'
        })
    }

    // ═══ DETERMINE RESULT ═══
    const criticalFailures = failures.filter(f => f.severity === 'CRITICAL')
    const passed = criticalFailures.length === 0

    console.log('\n' + '═'.repeat(80))
    console.log(`VALIDATION ${passed ? 'PASSED ✅' : 'FAILED ❌'}`)
    console.log('═'.repeat(80))

    if (!passed) {
        console.log('\nFailures:')
        failures.forEach(f => {
            console.log(`   [${f.severity}] ${f.type}: ${f.message}`)
        })
    }

    // Build retry emphasis
    let retryEmphasis = ''
    if (!passed) {
        retryEmphasis = buildComprehensiveRetryEmphasis(failures)
    }

    return {
        passed,
        failures,
        scores,
        should_retry: !passed && criticalFailures.length > 0,
        retry_emphasis: retryEmphasis
    }
}

/**
 * Validate 3 variants are sufficiently different
 */
export async function validateVariants(
    variants: { name: VariantName; imageBase64: string }[]
): Promise<{ all_different: boolean; pairs: { a: string; b: string; score: number }[] }> {
    console.log('\n' + '═'.repeat(80))
    console.log('VARIANT DIFFERENCE VALIDATION')
    console.log('═'.repeat(80))

    return await validateAllVariants(variants)
}

/**
 * Build comprehensive retry emphasis from all failures
 */
function buildComprehensiveRetryEmphasis(failures: ValidationFailure[]): string {
    const emphasisParts: string[] = []

    emphasisParts.push(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  PREVIOUS GENERATION FAILED VALIDATION               ║
╚════════════════════════════════════════════════════════════╝
`)

    failures.forEach(failure => {
        emphasisParts.push(`
[${failure.severity}] ${failure.type}:
${failure.message}

→ FIX: ${failure.suggestedFix}
`)
    })

    emphasisParts.push(`
═══════════════════════════════════════════════════════════════
RETRY WITH INCREASED CONSTRAINTS
═══════════════════════════════════════════════════════════════

All failed aspects will now have STRONGER constraints.
This is your LAST CHANCE to get it right.
`)

    return emphasisParts.join('\n')
}

/**
 * Export validation thresholds
 */
export const VALIDATION_THRESHOLDS = {
    FACE_SIMILARITY_MIN: 85,      // 85% minimum for face match
    FACE_SIMILARITY_WARN: 90,     // 90% is good, <90 worth noting
    POSE_SYMMETRY_MAX: 40,        // <40% symmetry = natural
    LIGHTING_FALLOFF_MIN: 5,      // 5% minimum directional falloff
    VARIANT_DIFFERENCE_MIN: 30,   // 30% minimum difference between variants
    GARMENT_TYPE_MUST_MATCH: true,
    GARMENT_LENGTH_MUST_MATCH: true
}
