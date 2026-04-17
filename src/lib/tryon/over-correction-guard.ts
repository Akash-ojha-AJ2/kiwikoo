/**
 * PRO OVER-CORRECTION GUARD
 * 
 * PRO model hyper-corrects identity.
 * This guard detects identity drift and triggers fallback to FLASH.
 * 
 * Features:
 * - Identity delta threshold for face, hair, body
 * - FLASH fallback when thresholds exceeded
 * - Dynamic temperature reduction on drift detection
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// IDENTITY DELTA THRESHOLDS
// ═══════════════════════════════════════════════════════════════

export interface IdentityDeltaThresholds {
    // Face thresholds
    faceOverallSimilarity: number      // Minimum similarity (0-1)
    eyeDistanceChange: number          // Max percentage change
    noseWidthChange: number            // Max percentage change
    jawlineChange: number              // Max percentage change

    // Hair thresholds
    hairlinePositionChange: number     // Max percentage change
    hairVolumeChange: number           // Max percentage change
    beardBoundaryChange: number        // Max percentage change

    // Body thresholds
    shoulderWidthChange: number        // Max percentage change
    bodyVolumeChange: number           // Max percentage change
    postureChange: number              // Max percentage change
}

export const STRICT_THRESHOLDS: IdentityDeltaThresholds = {
    faceOverallSimilarity: 0.92,
    eyeDistanceChange: 0.02,    // 2%
    noseWidthChange: 0.02,      // 2%
    jawlineChange: 0.03,        // 3%

    hairlinePositionChange: 0.02, // 2%
    hairVolumeChange: 0.03,       // 3%
    beardBoundaryChange: 0.02,    // 2%

    shoulderWidthChange: 0.03,  // 3%
    bodyVolumeChange: 0.05,     // 5%
    postureChange: 0.02         // 2%
}

export const RELAXED_THRESHOLDS: IdentityDeltaThresholds = {
    faceOverallSimilarity: 0.88,
    eyeDistanceChange: 0.05,
    noseWidthChange: 0.05,
    jawlineChange: 0.05,

    hairlinePositionChange: 0.05,
    hairVolumeChange: 0.07,
    beardBoundaryChange: 0.05,

    shoulderWidthChange: 0.07,
    bodyVolumeChange: 0.10,
    postureChange: 0.05
}

// ═══════════════════════════════════════════════════════════════
// IDENTITY DELTA MEASUREMENT
// ═══════════════════════════════════════════════════════════════

export interface IdentityDelta {
    // Face deltas
    faceOverallSimilarity: number
    eyeDistanceDelta: number
    noseWidthDelta: number
    jawlineDelta: number

    // Hair deltas
    hairlinePositionDelta: number
    hairVolumeDelta: number
    beardBoundaryDelta: number

    // Body deltas
    shoulderWidthDelta: number
    bodyVolumeDelta: number
    postureDelta: number

    // Computed
    worstViolation: string | null
    overallDriftScore: number // 0-1, higher = more drift
}

export interface OverCorrectionGuardResult {
    passed: boolean
    delta: IdentityDelta
    violations: string[]
    recommendation: 'ACCEPT' | 'RETRY_STRICTER' | 'FALLBACK_TO_FLASH'
    newTemperature?: number
}

// ═══════════════════════════════════════════════════════════════
// OVER-CORRECTION DETECTION
// ═══════════════════════════════════════════════════════════════

export function checkOverCorrection(
    delta: IdentityDelta,
    thresholds: IdentityDeltaThresholds = STRICT_THRESHOLDS
): OverCorrectionGuardResult {
    const violations: string[] = []

    // Face checks
    if (delta.faceOverallSimilarity < thresholds.faceOverallSimilarity) {
        violations.push(`Face similarity ${(delta.faceOverallSimilarity * 100).toFixed(1)}% < ${(thresholds.faceOverallSimilarity * 100).toFixed(1)}% threshold`)
    }
    if (delta.eyeDistanceDelta > thresholds.eyeDistanceChange) {
        violations.push(`Eye distance changed ${(delta.eyeDistanceDelta * 100).toFixed(1)}% > ${(thresholds.eyeDistanceChange * 100).toFixed(1)}% threshold`)
    }
    if (delta.noseWidthDelta > thresholds.noseWidthChange) {
        violations.push(`Nose width changed ${(delta.noseWidthDelta * 100).toFixed(1)}% > ${(thresholds.noseWidthChange * 100).toFixed(1)}% threshold`)
    }
    if (delta.jawlineDelta > thresholds.jawlineChange) {
        violations.push(`Jawline changed ${(delta.jawlineDelta * 100).toFixed(1)}% > ${(thresholds.jawlineChange * 100).toFixed(1)}% threshold`)
    }

    // Hair checks
    if (delta.hairlinePositionDelta > thresholds.hairlinePositionChange) {
        violations.push(`Hairline shifted ${(delta.hairlinePositionDelta * 100).toFixed(1)}% > ${(thresholds.hairlinePositionChange * 100).toFixed(1)}% threshold`)
    }
    if (delta.hairVolumeDelta > thresholds.hairVolumeChange) {
        violations.push(`Hair volume changed ${(delta.hairVolumeDelta * 100).toFixed(1)}% > ${(thresholds.hairVolumeChange * 100).toFixed(1)}% threshold`)
    }
    if (delta.beardBoundaryDelta > thresholds.beardBoundaryChange) {
        violations.push(`Beard boundary changed ${(delta.beardBoundaryDelta * 100).toFixed(1)}% > ${(thresholds.beardBoundaryChange * 100).toFixed(1)}% threshold`)
    }

    // Body checks
    if (delta.shoulderWidthDelta > thresholds.shoulderWidthChange) {
        violations.push(`Shoulder width changed ${(delta.shoulderWidthDelta * 100).toFixed(1)}% > ${(thresholds.shoulderWidthChange * 100).toFixed(1)}% threshold`)
    }
    if (delta.bodyVolumeDelta > thresholds.bodyVolumeChange) {
        violations.push(`Body volume changed ${(delta.bodyVolumeDelta * 100).toFixed(1)}% > ${(thresholds.bodyVolumeChange * 100).toFixed(1)}% threshold`)
    }

    // Determine recommendation
    let recommendation: 'ACCEPT' | 'RETRY_STRICTER' | 'FALLBACK_TO_FLASH'
    let newTemperature: number | undefined

    if (violations.length === 0) {
        recommendation = 'ACCEPT'
    } else if (violations.length <= 2 && delta.overallDriftScore < 0.15) {
        recommendation = 'RETRY_STRICTER'
        newTemperature = 0.01 // Minimum temperature
    } else {
        recommendation = 'FALLBACK_TO_FLASH'
    }

    return {
        passed: violations.length === 0,
        delta,
        violations,
        recommendation,
        newTemperature
    }
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC TEMPERATURE REDUCTION
// ═══════════════════════════════════════════════════════════════

export interface TemperatureConfig {
    initial: number
    minimum: number
    reductionStep: number
    maxReductions: number
}

export const PRO_TEMPERATURE_CONFIG: TemperatureConfig = {
    initial: 0.04,    // Start at 0.04
    minimum: 0.01,    // Never go below 0.01
    reductionStep: 0.01,
    maxReductions: 3
}

export function calculateReducedTemperature(
    currentTemp: number,
    driftScore: number,
    config: TemperatureConfig = PRO_TEMPERATURE_CONFIG
): number {
    // More drift = more temperature reduction
    const reductionFactor = Math.min(driftScore * 2, 1) // Cap at 1
    const reduction = config.reductionStep * (1 + reductionFactor)
    const newTemp = Math.max(currentTemp - reduction, config.minimum)

    return newTemp
}

// ═══════════════════════════════════════════════════════════════
// FLASH FALLBACK LOGIC
// ═══════════════════════════════════════════════════════════════

export interface FallbackDecision {
    shouldFallback: boolean
    reason: string
    flashFacePixels: boolean
    flashBodyPixels: boolean
    preserveProScene: boolean
}

export function decideFallback(
    guardResult: OverCorrectionGuardResult
): FallbackDecision {
    if (guardResult.recommendation !== 'FALLBACK_TO_FLASH') {
        return {
            shouldFallback: false,
            reason: 'PRO output acceptable',
            flashFacePixels: false,
            flashBodyPixels: false,
            preserveProScene: true
        }
    }

    // Determine what to fallback
    const faceViolation = guardResult.violations.some(v =>
        v.includes('Face') || v.includes('Eye') || v.includes('Nose') || v.includes('Jawline')
    )
    const hairViolation = guardResult.violations.some(v =>
        v.includes('Hair') || v.includes('Beard')
    )
    const bodyViolation = guardResult.violations.some(v =>
        v.includes('Shoulder') || v.includes('Body') || v.includes('Posture')
    )

    return {
        shouldFallback: true,
        reason: `Identity violations detected: ${guardResult.violations.join(', ')}`,
        flashFacePixels: faceViolation || hairViolation,
        flashBodyPixels: bodyViolation,
        preserveProScene: true // Keep PRO's scene, use FLASH identity
    }
}

// ═══════════════════════════════════════════════════════════════
// GUARD PROMPT LAYER
// ═══════════════════════════════════════════════════════════════

export const OVER_CORRECTION_GUARD_LAYER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    PRO OVER-CORRECTION GUARD                                  ║
║                    IDENTITY DRIFT PREVENTION                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

PRO has a tendency to "improve" identity.
This is FORBIDDEN.

MONITORED METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Face similarity: must be ≥92%
• Eye distance: must not change >2%
• Nose width: must not change >2%
• Hairline position: must not change >2%
• Shoulder width: must not change >3%
• Body volume: must not change >5%

CONSEQUENCES OF VIOLATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1-2 violations → Retry with lower temperature (0.01)
3+ violations → Fallback to FLASH face pixels

PRO is being watched.
Any beautification, slimming, or "improvement" will be detected and rejected.
`

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logOverCorrectionCheck(
    sessionId: string,
    result: OverCorrectionGuardResult
): void {
    console.log(`\n🛡️ OVER-CORRECTION GUARD [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📊 Passed: ${result.passed ? '✓' : '❌'}`)
    console.log(`   📈 Drift score: ${(result.delta.overallDriftScore * 100).toFixed(1)}%`)
    console.log(`   📋 Violations: ${result.violations.length}`)

    if (result.violations.length > 0) {
        result.violations.forEach(v => {
            console.log(`      ⚠️ ${v}`)
        })
    }

    console.log(`   🎯 Recommendation: ${result.recommendation}`)
    if (result.newTemperature) {
        console.log(`   🌡️ New temperature: ${result.newTemperature}`)
    }
    console.log(`   ═══════════════════════════════════════`)
}

export function logFallbackDecision(
    sessionId: string,
    decision: FallbackDecision
): void {
    if (!decision.shouldFallback) {
        console.log(`\n✅ NO FALLBACK NEEDED [${sessionId}]`)
        return
    }

    console.log(`\n⚠️ FLASH FALLBACK TRIGGERED [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📝 Reason: ${decision.reason}`)
    console.log(`   👤 Flash face pixels: ${decision.flashFacePixels ? 'YES' : 'NO'}`)
    console.log(`   🧍 Flash body pixels: ${decision.flashBodyPixels ? 'YES' : 'NO'}`)
    console.log(`   🏞️ Preserve PRO scene: ${decision.preserveProScene ? 'YES' : 'NO'}`)
    console.log(`   ═══════════════════════════════════════`)
}
