/**
 * INTELLIGENT SCENE CONTROLLER
 * 
 * Adaptive retry logic for scene consistency failures.
 * Makes the system intelligent, not brittle.
 * 
 * Features:
 * - Retry with stricter scene rules on FAIL
 * - Downgrade realism on repeat failures
 * - Rate limiting to prevent excessive retries
 */

import 'server-only'
import type { SceneAuthority, SceneValidationResult } from './scene-authority.schema'

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

interface RateLimitEntry {
    count: number
    firstAttempt: number
    lastAttempt: number
}

const retryTracker = new Map<string, RateLimitEntry>()

// Rate limit: max 3 retries per user per 5 minutes
const MAX_RETRIES_PER_SESSION = 3
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000  // 5 minutes

/**
 * Check if user has exceeded retry limit
 */
export function isRateLimited(userId: string): boolean {
    const entry = retryTracker.get(userId)
    if (!entry) return false

    const now = Date.now()

    // Reset if outside window
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        retryTracker.delete(userId)
        return false
    }

    return entry.count >= MAX_RETRIES_PER_SESSION
}

/**
 * Record a retry attempt
 */
export function recordRetryAttempt(userId: string): void {
    const now = Date.now()
    const entry = retryTracker.get(userId)

    if (entry && now - entry.firstAttempt < RATE_LIMIT_WINDOW_MS) {
        entry.count++
        entry.lastAttempt = now
    } else {
        retryTracker.set(userId, {
            count: 1,
            firstAttempt: now,
            lastAttempt: now
        })
    }
}

/**
 * Get remaining retries for user
 */
export function getRemainingRetries(userId: string): number {
    const entry = retryTracker.get(userId)
    if (!entry) return MAX_RETRIES_PER_SESSION

    const now = Date.now()
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        return MAX_RETRIES_PER_SESSION
    }

    return Math.max(0, MAX_RETRIES_PER_SESSION - entry.count)
}

// ═══════════════════════════════════════════════════════════════════════════════
// RETRY STRATEGIES
// ═══════════════════════════════════════════════════════════════════════════════

export type RetryStrategy = 'STRICT_SCENE' | 'ADAPTIVE_LIGHTING' | 'DOWNGRADE_REALISM' | 'ABORT'

export interface RetryDecision {
    shouldRetry: boolean
    strategy: RetryStrategy
    modifiedAuthority?: SceneAuthority
    message?: string
}

/**
 * Decide whether to retry and how
 */
export function decideRetryStrategy(
    validationResult: SceneValidationResult,
    sceneAuthority: SceneAuthority,
    attemptNumber: number,
    userId: string
): RetryDecision {
    // Check rate limit
    if (isRateLimited(userId)) {
        console.log(`   ⚠️ Rate limited: ${userId}`)
        return {
            shouldRetry: false,
            strategy: 'ABORT',
            message: 'Maximum retry attempts reached. Please try again later.'
        }
    }

    // PASS - no retry needed
    if (validationResult.status === 'PASS') {
        return {
            shouldRetry: false,
            strategy: 'STRICT_SCENE'
        }
    }

    // First attempt failure - retry with stricter rules
    if (attemptNumber === 1) {
        recordRetryAttempt(userId)

        if (validationResult.reason === 'SCENE_SWITCH') {
            return {
                shouldRetry: true,
                strategy: 'STRICT_SCENE',
                modifiedAuthority: {
                    ...sceneAuthority,
                    scene_rules: {
                        ...sceneAuthority.scene_rules,
                        background_consistency: 'strict',
                        lighting_consistency: 'strict'
                    }
                },
                message: 'Retrying with strict scene rules...'
            }
        }

        if (validationResult.reason === 'LIGHTING_DRIFT') {
            return {
                shouldRetry: true,
                strategy: 'ADAPTIVE_LIGHTING',
                modifiedAuthority: {
                    ...sceneAuthority,
                    enforcement: {
                        ...sceneAuthority.enforcement,
                        max_lighting_delta: sceneAuthority.enforcement.max_lighting_delta + 5
                    }
                },
                message: 'Retrying with adaptive lighting tolerance...'
            }
        }
    }

    // Second attempt failure - downgrade realism
    if (attemptNumber === 2) {
        recordRetryAttempt(userId)

        return {
            shouldRetry: true,
            strategy: 'DOWNGRADE_REALISM',
            modifiedAuthority: {
                ...sceneAuthority,
                scene_rules: {
                    ...sceneAuthority.scene_rules,
                    lighting_consistency: 'flexible'
                },
                enforcement: {
                    ...sceneAuthority.enforcement,
                    max_lighting_delta: 25  // Allow more variation
                }
            },
            message: 'Retrying with reduced realism constraints...'
        }
    }

    // Third+ attempt - abort
    return {
        shouldRetry: false,
        strategy: 'ABORT',
        message: 'Maximum retry attempts reached for this generation.'
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE CONTROL ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface SceneControlResult {
    success: boolean
    finalAuthority: SceneAuthority
    attemptsMade: number
    strategy: RetryStrategy
}

/**
 * Log scene control decision
 */
export function logRetryDecision(decision: RetryDecision, attemptNumber: number): void {
    console.log('\n🔄 SCENE CONTROL DECISION')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Attempt: ${attemptNumber}`)
    console.log(`   Strategy: ${decision.strategy}`)
    console.log(`   Should retry: ${decision.shouldRetry}`)
    if (decision.message) {
        console.log(`   Message: ${decision.message}`)
    }
    console.log('   ═══════════════════════════════════════════════')
}
