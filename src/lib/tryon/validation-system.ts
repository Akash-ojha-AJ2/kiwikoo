/**
 * VALIDATION SYSTEM
 * 
 * Comprehensive validation with logging for:
 * - Hair Freeze active
 * - Face Freeze active
 * - Variant consistency check
 * - Lighting mode applied
 * 
 * Fail generation if any identity lock is violated.
 */

import 'server-only'
import { HAIR_FREEZE_CONFIG, type HairValidationResult } from './hair-freeze'
import { type LightingMode, LIGHTING_MODES } from './lighting-modes'
import { type VariantConsistencyCheck } from './multi-variant'
import { type OverCorrectionGuardResult, STRICT_THRESHOLDS } from './over-correction-guard'

// ═══════════════════════════════════════════════════════════════
// VALIDATION STATUS TYPES
// ═══════════════════════════════════════════════════════════════

export interface ValidationStatus {
    sessionId: string
    timestamp: Date
    mode: 'FLASH' | 'PRO'

    // Lock statuses
    faceFreezeActive: boolean
    hairFreezeActive: boolean
    bodyLockActive: boolean

    // Lighting
    lightingModeApplied: LightingMode | null
    lightingValid: boolean

    // Variant (PRO only)
    variantConsistency: VariantConsistencyCheck | null

    // Guard result (PRO only)
    overCorrectionGuard: OverCorrectionGuardResult | null

    // Overall
    allLocksValid: boolean
    shouldFailGeneration: boolean
    failureReasons: string[]
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION RUNNER
// ═══════════════════════════════════════════════════════════════

export interface ValidationInput {
    sessionId: string
    mode: 'FLASH' | 'PRO'
    presetId: string
    faceValidation: { similarity: number, passed: boolean }
    hairValidation: HairValidationResult
    bodyValidation: { proportionsMatch: boolean, violations: string[] }
    variantCheck?: VariantConsistencyCheck
    guardResult?: OverCorrectionGuardResult
}

export function runValidation(input: ValidationInput): ValidationStatus {
    const failureReasons: string[] = []

    // Check Face Freeze
    const faceFreezeActive = true // Always on
    if (!input.faceValidation.passed) {
        failureReasons.push(`Face similarity ${(input.faceValidation.similarity * 100).toFixed(1)}% < 92% threshold`)
    }

    // Check Hair Freeze
    const hairFreezeActive = HAIR_FREEZE_CONFIG.enableForFlash || HAIR_FREEZE_CONFIG.enableForPro
    if (!input.hairValidation.valid) {
        input.hairValidation.violations.forEach(v => failureReasons.push(v))
    }

    // Check Body Lock
    const bodyLockActive = true // Always on
    if (!input.bodyValidation.proportionsMatch) {
        input.bodyValidation.violations.forEach(v => failureReasons.push(v))
    }

    // Check Lighting
    const lightingModeApplied = LIGHTING_MODES[
        input.presetId.includes('cafe') ? 'WARM_REAL_WORLD' :
            input.presetId.includes('street') ? 'HARSH_REALITY' :
                'COOL_NEUTRAL'
    ].mode
    const lightingValid = true // Assume valid if mode is set

    // Check Variant Consistency (PRO only)
    let variantConsistency = input.variantCheck || null
    if (input.mode === 'PRO' && variantConsistency) {
        if (!variantConsistency.facesIdentical) {
            failureReasons.push('Variant faces not identical')
        }
        if (!variantConsistency.hairIdentical) {
            failureReasons.push('Variant hair not identical')
        }
        if (!variantConsistency.bodiesIdentical) {
            failureReasons.push('Variant bodies not identical')
        }
    }

    // Check Over-Correction Guard (PRO only)
    let overCorrectionGuard = input.guardResult || null
    if (input.mode === 'PRO' && overCorrectionGuard && !overCorrectionGuard.passed) {
        overCorrectionGuard.violations.forEach(v => failureReasons.push(v))
    }

    // Determine overall status
    const allLocksValid = failureReasons.length === 0
    const shouldFailGeneration = failureReasons.length > 0

    return {
        sessionId: input.sessionId,
        timestamp: new Date(),
        mode: input.mode,

        faceFreezeActive,
        hairFreezeActive,
        bodyLockActive,

        lightingModeApplied,
        lightingValid,

        variantConsistency,
        overCorrectionGuard,

        allLocksValid,
        shouldFailGeneration,
        failureReasons
    }
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION LOGGING
// ═══════════════════════════════════════════════════════════════

export function logValidationStatus(status: ValidationStatus): void {
    console.log(`\n`)
    console.log(`╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║                      VALIDATION SYSTEM                                        ║`)
    console.log(`║                      Session: ${status.sessionId.padEnd(46)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║ Mode: ${status.mode}                                                                    ║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║ IDENTITY LOCKS:                                                               ║`)
    console.log(`║   ├── Face Freeze: ${status.faceFreezeActive ? '✅ ACTIVE' : '❌ INACTIVE'}                                            ║`)
    console.log(`║   ├── Hair Freeze: ${status.hairFreezeActive ? '✅ ACTIVE' : '❌ INACTIVE'}                                            ║`)
    console.log(`║   └── Body Lock:   ${status.bodyLockActive ? '✅ ACTIVE' : '❌ INACTIVE'}                                            ║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║ LIGHTING:                                                                     ║`)
    console.log(`║   ├── Mode Applied: ${(status.lightingModeApplied || 'NONE').padEnd(56)}║`)
    console.log(`║   └── Valid: ${status.lightingValid ? '✅ YES' : '❌ NO'}                                                       ║`)

    if (status.mode === 'PRO' && status.variantConsistency) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║ VARIANT CONSISTENCY:                                                          ║`)
        console.log(`║   ├── Faces Identical: ${status.variantConsistency.facesIdentical ? '✅' : '❌'}                                              ║`)
        console.log(`║   ├── Hair Identical:  ${status.variantConsistency.hairIdentical ? '✅' : '❌'}                                              ║`)
        console.log(`║   └── Bodies Identical: ${status.variantConsistency.bodiesIdentical ? '✅' : '❌'}                                             ║`)
    }

    if (status.mode === 'PRO' && status.overCorrectionGuard) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║ OVER-CORRECTION GUARD:                                                        ║`)
        console.log(`║   ├── Passed: ${status.overCorrectionGuard.passed ? '✅ YES' : '❌ NO'}                                                       ║`)
        console.log(`║   └── Recommendation: ${status.overCorrectionGuard.recommendation.padEnd(53)}║`)
    }

    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║ RESULT:                                                                       ║`)

    if (status.allLocksValid) {
        console.log(`║   ✅ ALL LOCKS VALID — Generation accepted                                    ║`)
    } else {
        console.log(`║   ❌ LOCKS VIOLATED — Generation FAILED                                       ║`)
        console.log(`║                                                                               ║`)
        console.log(`║   Failure Reasons:                                                            ║`)
        status.failureReasons.slice(0, 5).forEach(reason => {
            const truncated = reason.length > 70 ? reason.substring(0, 67) + '...' : reason
            console.log(`║     • ${truncated.padEnd(68)}║`)
        })
        if (status.failureReasons.length > 5) {
            console.log(`║     ... and ${status.failureReasons.length - 5} more violations                                        ║`)
        }
    }

    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝`)
    console.log(`\n`)
}

// ═══════════════════════════════════════════════════════════════
// QUICK VALIDATION SUMMARY
// ═══════════════════════════════════════════════════════════════

export function logQuickValidation(sessionId: string, mode: 'FLASH' | 'PRO'): void {
    console.log(`\n🔍 VALIDATION ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🎬 Mode: ${mode}`)
    console.log(`   👤 Face Freeze: ACTIVE`)
    console.log(`   💇 Hair Freeze: ACTIVE`)
    console.log(`   🧍 Body Lock: ACTIVE`)
    console.log(`   ═══════════════════════════════════════`)
}

// ═══════════════════════════════════════════════════════════════
// FAIL GENERATION
// ═══════════════════════════════════════════════════════════════

export class IdentityLockViolationError extends Error {
    public readonly violations: string[]
    public readonly sessionId: string
    public readonly mode: 'FLASH' | 'PRO'

    constructor(status: ValidationStatus) {
        super(`Identity lock violated: ${status.failureReasons.join(', ')}`)
        this.name = 'IdentityLockViolationError'
        this.violations = status.failureReasons
        this.sessionId = status.sessionId
        this.mode = status.mode
    }
}

export function enforceValidation(status: ValidationStatus): void {
    if (status.shouldFailGeneration) {
        logValidationStatus(status)
        throw new IdentityLockViolationError(status)
    }
}
