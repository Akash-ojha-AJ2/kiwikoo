/**
 * RETRY ORCHESTRATOR - Intelligent Retry System
 * 
 * Manages retries with progressively stronger constraints.
 * Tracks which aspects failed and adjusts accordingly.
 * 
 * Enhanced with PART 9 - Scene & Face-Drift Retry Logic
 */

import 'server-only'
import { GarmentClassification } from './garment-classifier'
import { UserAnalysis } from './user-analyzer'
import { FaceValidationResult } from './face-guardrail'
import { GarmentValidationResult } from './garment-guardrail'
import type { MicroFaceDriftResult } from '../micro-face-drift'
import type { SceneValidationResult } from '../scene-authority.schema'

export interface RetryContext {
    attempt: number
    maxAttempts: number
    previousFailures: FailureType[]
    constraintMultipliers: {
        face: number
        body: number
        garment: number
        pose: number
        scene: number
        topology: number  // NEW: Topology constraint multiplier
    }
    /** Retry adjustments based on failure type */
    retryAdjustments: {
        temperatureAdjust: number
        realismBias: number
        lightingMode: 'inherit-only' | 'normal'
        topologyEnforcement: 'normal' | 'strict' | 'absolute'  // NEW
    }
}

export type FailureType =
    | 'FACE_MISMATCH'
    | 'BODY_MISMATCH'
    | 'GARMENT_TYPE_WRONG'
    | 'GARMENT_LENGTH_WRONG'
    | 'PATTERN_WRONG'
    | 'COLOR_WRONG'
    | 'POSE_WRONG'
    | 'ACCESSORIES_MISSING'
    | 'VALIDATION_ERROR'
    // Scene & Face-Drift failures (PART 9)
    | 'SCENE_SWITCH'
    | 'LIGHTING_DRIFT'
    | 'MICRO_FACE_DRIFT'
    // Topology failures (PART 10)
    | 'GARMENT_TOPOLOGY_VIOLATION'
    | 'TOP_CONVERTED_TO_DRESS'
    | 'MISSING_PANTS'
    // Input coverage failures (selfie-safe)
    | 'INVALID_INPUT_COVERAGE'
    | 'COVERAGE_GARMENT_MISMATCH'

export interface OrchestratorResult {
    success: boolean
    finalImage: string | null
    attempts: number
    validationResults: {
        face: FaceValidationResult | null
        garment: GarmentValidationResult | null
    }[]
    failures: FailureType[]
    finalMessage: string
}

export function initRetryContext(maxAttempts: number = 2): RetryContext {
    return {
        attempt: 0,
        maxAttempts,  // PART 9: maxRetries = 2
        previousFailures: [],
        constraintMultipliers: {
            face: 1.0,
            body: 1.0,
            garment: 1.0,
            pose: 1.0,
            scene: 1.0,
            topology: 1.0
        },
        retryAdjustments: {
            temperatureAdjust: 0,
            realismBias: 0,
            lightingMode: 'normal',
            topologyEnforcement: 'normal'
        }
    }
}

export function updateContextAfterFailure(
    context: RetryContext,
    failures: FailureType[]
): RetryContext {
    const newContext = {
        ...context,
        constraintMultipliers: { ...context.constraintMultipliers },
        retryAdjustments: { ...context.retryAdjustments }
    }
    newContext.attempt++
    newContext.previousFailures.push(...failures)

    // Increase constraint weight for failed aspects
    for (const failure of failures) {
        switch (failure) {
            case 'FACE_MISMATCH':
                newContext.constraintMultipliers.face *= 1.5
                break
            case 'BODY_MISMATCH':
                newContext.constraintMultipliers.body *= 1.5
                break
            case 'GARMENT_TYPE_WRONG':
            case 'GARMENT_LENGTH_WRONG':
            case 'PATTERN_WRONG':
            case 'COLOR_WRONG':
                newContext.constraintMultipliers.garment *= 1.5
                break
            case 'POSE_WRONG':
                newContext.constraintMultipliers.pose *= 1.5
                break
            // NEW: Scene & Face-Drift handling (PART 9)
            case 'SCENE_SWITCH':
            case 'LIGHTING_DRIFT':
                newContext.constraintMultipliers.scene *= 1.5
                newContext.retryAdjustments.lightingMode = 'inherit-only'
                console.log('   🎬 Scene failure detected → switching to inherit-only lighting')
                break
            case 'MICRO_FACE_DRIFT':
                newContext.constraintMultipliers.face *= 1.5
                newContext.retryAdjustments.temperatureAdjust = -0.15
                newContext.retryAdjustments.realismBias = -1
                console.log('   🔬 Face drift >8% → lowering temperature, reducing realism bias')
                break
            // PART 10: Topology violation handling
            case 'GARMENT_TOPOLOGY_VIOLATION':
            case 'TOP_CONVERTED_TO_DRESS':
            case 'MISSING_PANTS':
                newContext.constraintMultipliers.topology *= 2.0
                newContext.retryAdjustments.temperatureAdjust = -0.2
                // Escalate enforcement level
                if (newContext.retryAdjustments.topologyEnforcement === 'normal') {
                    newContext.retryAdjustments.topologyEnforcement = 'strict'
                } else {
                    newContext.retryAdjustments.topologyEnforcement = 'absolute'
                }
                console.log(`   👗 Topology violation → enforcement: ${newContext.retryAdjustments.topologyEnforcement}, temp: -0.2`)
                break
        }
    }

    console.log(`\n🔄 RETRY: Attempt ${newContext.attempt + 1}/${newContext.maxAttempts}`)
    console.log(`   Constraint multipliers: face=${newContext.constraintMultipliers.face.toFixed(1)}, garment=${newContext.constraintMultipliers.garment.toFixed(1)}, scene=${newContext.constraintMultipliers.scene.toFixed(1)}`)
    console.log(`   Adjustments: temp=${newContext.retryAdjustments.temperatureAdjust}, realism=${newContext.retryAdjustments.realismBias}, lighting=${newContext.retryAdjustments.lightingMode}`)

    return newContext
}

export function generateRetryEmphasis(context: RetryContext): string {
    if (context.attempt === 0) {
        return '' // No emphasis on first attempt
    }

    const emphasisBlocks: string[] = []

    if (context.constraintMultipliers.face > 1.0) {
        emphasisBlocks.push(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ⚠️  FACE FAILED IN PREVIOUS ATTEMPT - EXTRA EMPHASIS                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ The face in the previous output did NOT match the original.                   ║
║ THIS TIME: Copy the face EXACTLY. Same person. Same features.                 ║
║ REJECTION REASON: Face mismatch detected by validation system.                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`)
    }

    if (context.constraintMultipliers.garment > 1.0) {
        emphasisBlocks.push(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ⚠️  GARMENT FAILED IN PREVIOUS ATTEMPT - EXTRA EMPHASIS                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ The garment type or length was WRONG in the previous output.                  ║
║ THIS TIME: Match the garment EXACTLY as shown in Image 2.                     ║
║ Check the hemline position carefully.                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`)
    }

    if (context.constraintMultipliers.body > 1.0) {
        emphasisBlocks.push(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ⚠️  BODY FAILED IN PREVIOUS ATTEMPT - EXTRA EMPHASIS                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ The body proportions were WRONG in the previous output.                       ║
║ THIS TIME: Use ONLY body proportions from Image 1.                            ║
║ Do NOT use the model's body from Image 2.                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`)
    }

    // NEW: Scene emphasis block (PART 9)
    if (context.constraintMultipliers.scene > 1.0) {
        emphasisBlocks.push(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ⚠️  SCENE FAILED IN PREVIOUS ATTEMPT - EXTRA EMPHASIS                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ The scene SWITCHED or lighting DRIFTED in the previous output.                ║
║ THIS TIME: INHERIT environment ONLY from Image 1.                             ║
║ No indoor/outdoor switching. No background changes. No lighting type changes. ║
║ REDUCE realism. Only inherit lighting.                                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`)
    }

    return emphasisBlocks.join('\n')
}

export function detectFailures(
    faceResult: FaceValidationResult | null,
    garmentResult: GarmentValidationResult | null,
    sceneResult?: SceneValidationResult | null,
    faceDriftResult?: MicroFaceDriftResult | null
): FailureType[] {
    const failures: FailureType[] = []

    if (faceResult) {
        if (!faceResult.analysis.same_person) {
            failures.push('FACE_MISMATCH')
        }
    }

    if (garmentResult) {
        if (!garmentResult.type_match) {
            failures.push('GARMENT_TYPE_WRONG')
        }
        if (!garmentResult.length_match) {
            failures.push('GARMENT_LENGTH_WRONG')
        }
        if (!garmentResult.pattern_match) {
            failures.push('PATTERN_WRONG')
        }
        if (!garmentResult.color_match) {
            failures.push('COLOR_WRONG')
        }
    }

    // NEW: Scene validation failures (PART 9)
    if (sceneResult) {
        if (sceneResult.status === 'FAIL' && sceneResult.reason === 'SCENE_SWITCH') {
            failures.push('SCENE_SWITCH')
        }
        if (sceneResult.status === 'FAIL' && sceneResult.reason === 'LIGHTING_DRIFT') {
            failures.push('LIGHTING_DRIFT')
        }
        if (sceneResult.status === 'SOFT_FAIL' && sceneResult.reason === 'LIGHTING_DRIFT') {
            failures.push('LIGHTING_DRIFT')
        }
    }

    // NEW: Micro face drift (PART 8)
    if (faceDriftResult && faceDriftResult.status === 'RETRY') {
        failures.push('MICRO_FACE_DRIFT')
    }

    return failures
}

export function shouldRetry(
    context: RetryContext,
    faceResult: FaceValidationResult | null,
    garmentResult: GarmentValidationResult | null
): boolean {
    // Check if we've exhausted retries
    if (context.attempt >= context.maxAttempts) {
        console.log('   ❌ Max retries reached, accepting best result')
        return false
    }

    // Check face
    if (faceResult && !faceResult.is_valid) {
        console.log('   🔄 Face validation failed, will retry')
        return true
    }

    // Check garment
    if (garmentResult && !garmentResult.is_valid) {
        console.log('   🔄 Garment validation failed, will retry')
        return true
    }

    console.log('   ✅ All validations passed')
    return false
}

export function logOrchestratorStatus(context: RetryContext): void {
    console.log(`\n📊 ORCHESTRATOR STATUS:`)
    console.log(`   Attempt: ${context.attempt + 1}/${context.maxAttempts}`)
    console.log(`   Previous failures: ${context.previousFailures.join(', ') || 'none'}`)
    console.log(`   Face emphasis: ${context.constraintMultipliers.face.toFixed(1)}x`)
    console.log(`   Garment emphasis: ${context.constraintMultipliers.garment.toFixed(1)}x`)
    console.log(`   Body emphasis: ${context.constraintMultipliers.body.toFixed(1)}x`)
}
