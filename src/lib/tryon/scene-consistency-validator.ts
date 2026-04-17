/**
 * SCENE CONSISTENCY VALIDATOR
 * 
 * Validates that generated images maintain scene consistency
 * with the reference (input) image.
 * 
 * POST-GENERATION check - Nano Banana cannot self-judge.
 * 
 * COST-EFFECTIVE: Uses local detection, no external APIs
 */

import 'server-only'
import {
    type SceneAuthority,
    type SceneValidationResult
} from './scene-authority.schema'
import { detectSceneType, inferLightingProfile } from './scene-detector'

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING DELTA COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute lighting delta between two images as a percentage
 * 
 * LOCAL - No API cost
 */
export async function computeLightingDelta(
    referenceBuffer: Buffer,
    generatedBuffer: Buffer
): Promise<number> {
    const refLighting = await inferLightingProfile(referenceBuffer)
    const genLighting = await inferLightingProfile(generatedBuffer)

    // Calculate temperature delta as percentage of range (2000K to 8000K = 6000K range)
    const tempDelta = Math.abs(refLighting.color_temperature_kelvin - genLighting.color_temperature_kelvin)
    const tempDeltaPercent = (tempDelta / 6000) * 100

    // Add penalty for type mismatch
    let typePenalty = 0
    if (refLighting.type !== genLighting.type) {
        typePenalty = 15  // 15% penalty for type mismatch
    }

    // Add penalty for intensity mismatch
    let intensityPenalty = 0
    const intensityMap = { 'dim': 0, 'normal': 1, 'bright': 2, 'harsh': 3 }
    const refIntensity = intensityMap[refLighting.intensity]
    const genIntensity = intensityMap[genLighting.intensity]
    intensityPenalty = Math.abs(refIntensity - genIntensity) * 5  // 5% per level

    return Math.min(100, tempDeltaPercent + typePenalty + intensityPenalty)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE CONSISTENCY VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate scene consistency between reference and generated image
 * 
 * @param referenceImageBuffer - Original user image
 * @param generatedImageBuffer - Generated try-on image
 * @param sceneAuthority - Resolved scene authority rules
 * @returns Validation result (PASS, SOFT_FAIL, FAIL)
 */
export async function validateSceneConsistency(
    referenceImageBuffer: Buffer,
    generatedImageBuffer: Buffer,
    sceneAuthority: SceneAuthority
): Promise<SceneValidationResult> {
    console.log('\n🔍 VALIDATING SCENE CONSISTENCY...')

    // Detect scene type of generated image
    const genScene = await detectSceneType(generatedImageBuffer)
    const refScene = sceneAuthority.detected_scene

    // Check 1: Indoor/outdoor mismatch
    if (sceneAuthority.enforcement.forbid_indoor_outdoor_mix) {
        // Only fail if both have high confidence and differ
        if (
            refScene.environment !== 'unknown' &&
            genScene.environment !== 'unknown' &&
            refScene.environment !== genScene.environment &&
            refScene.confidence > 0.7 &&
            genScene.confidence > 0.7
        ) {
            console.log(`   ❌ SCENE SWITCH: ${refScene.environment} → ${genScene.environment}`)
            return {
                status: 'FAIL',
                reason: 'SCENE_SWITCH',
                details: `Scene switched from ${refScene.environment} to ${genScene.environment}`
            }
        }
    }

    // Check 2: Lighting delta
    const lightingDelta = await computeLightingDelta(referenceImageBuffer, generatedImageBuffer)
    console.log(`   📊 Lighting delta: ${lightingDelta.toFixed(1)}% (max allowed: ${sceneAuthority.enforcement.max_lighting_delta}%)`)

    if (lightingDelta > sceneAuthority.enforcement.max_lighting_delta) {
        // Soft fail for lighting issues - can be retried
        if (lightingDelta > sceneAuthority.enforcement.max_lighting_delta * 2) {
            console.log(`   ⚠️ SEVERE LIGHTING DRIFT: ${lightingDelta.toFixed(1)}%`)
            return {
                status: 'FAIL',
                reason: 'LIGHTING_DRIFT',
                details: `Lighting delta ${lightingDelta.toFixed(1)}% exceeds max ${sceneAuthority.enforcement.max_lighting_delta}%`,
                lightingDelta
            }
        }

        console.log(`   ⚠️ SOFT LIGHTING DRIFT: ${lightingDelta.toFixed(1)}%`)
        return {
            status: 'SOFT_FAIL',
            reason: 'LIGHTING_DRIFT',
            details: `Lighting delta ${lightingDelta.toFixed(1)}% exceeds max ${sceneAuthority.enforcement.max_lighting_delta}%`,
            lightingDelta
        }
    }

    console.log(`   ✅ SCENE CONSISTENCY: PASS`)
    return {
        status: 'PASS',
        lightingDelta
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate multiple generated variants
 * Returns results for each variant
 */
export async function validateVariantConsistency(
    referenceImageBuffer: Buffer,
    variantBuffers: Buffer[],
    sceneAuthority: SceneAuthority
): Promise<SceneValidationResult[]> {
    const results: SceneValidationResult[] = []

    for (let i = 0; i < variantBuffers.length; i++) {
        console.log(`\n   Validating variant ${i + 1}/${variantBuffers.length}...`)
        const result = await validateSceneConsistency(
            referenceImageBuffer,
            variantBuffers[i],
            sceneAuthority
        )
        results.push(result)
    }

    return results
}

/**
 * Summary of batch validation results
 */
export function summarizeValidationResults(results: SceneValidationResult[]): {
    passed: number
    softFailed: number
    failed: number
    allPassed: boolean
    shouldRetry: boolean
} {
    const passed = results.filter(r => r.status === 'PASS').length
    const softFailed = results.filter(r => r.status === 'SOFT_FAIL').length
    const failed = results.filter(r => r.status === 'FAIL').length

    return {
        passed,
        softFailed,
        failed,
        allPassed: failed === 0 && softFailed === 0,
        shouldRetry: failed > 0 || softFailed > passed
    }
}
