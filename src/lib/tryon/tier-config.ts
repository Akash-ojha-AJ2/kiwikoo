/**
 * TIER CONFIGURATION — Phase 3C
 * 
 * Tier-aware defaults for monetization readiness.
 * 
 * ========================================================================
 * CRITICAL PRINCIPLE: Correctness is IDENTICAL across tiers.
 * 
 * - Face overwrite: Same for all tiers
 * - Base quality: Same for all tiers
 * - Face drift prevention: Same for all tiers
 * 
 * Tiers differ ONLY in:
 * - Limits (daily generation count)
 * - Options (preset variety, refinement availability)
 * - Speed (priority queue, if implemented)
 * ========================================================================
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type UserTier = 'free' | 'basic' | 'pro' | 'enterprise'

export interface TierConfig {
    tier: UserTier
    displayName: string

    // Limits
    maxGenerationsPerDay: number
    cooldownSeconds: number

    // Features
    refinementEnabled: boolean       // Phase-2 environment refinement
    allPresetsUnlocked: boolean      // Full preset library
    priorityQueue: boolean           // Faster processing

    // Presets available (free tier has limited selection)
    availablePresetCategories: string[]

    // Lighting options
    availableLightingOptions: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
    free: {
        tier: 'free',
        displayName: 'Free',

        // Conservative limits
        maxGenerationsPerDay: 10,
        cooldownSeconds: 10,

        // Limited features
        refinementEnabled: false,
        allPresetsUnlocked: false,
        priorityQueue: false,

        // Limited presets (most reliable ones)
        availablePresetCategories: [
            'casual',
            'indoor',
        ],

        // Limited lighting (safest options)
        availableLightingOptions: [
            'natural_daylight',
            'indoor_ambient',
        ],
    },

    basic: {
        tier: 'basic',
        displayName: 'Basic',

        maxGenerationsPerDay: 50,
        cooldownSeconds: 5,

        refinementEnabled: false,
        allPresetsUnlocked: false,
        priorityQueue: false,

        availablePresetCategories: [
            'casual',
            'indoor',
            'outdoor',
            'street',
        ],

        availableLightingOptions: [
            'natural_daylight',
            'indoor_ambient',
            'overcast',
            'street_lighting',
        ],
    },

    pro: {
        tier: 'pro',
        displayName: 'Pro',

        maxGenerationsPerDay: 200,
        cooldownSeconds: 3,

        refinementEnabled: true,       // Phase-2 refinement available
        allPresetsUnlocked: true,      // All presets
        priorityQueue: false,

        availablePresetCategories: ['*'],  // All categories
        availableLightingOptions: ['*'],   // All options
    },

    enterprise: {
        tier: 'enterprise',
        displayName: 'Enterprise',

        maxGenerationsPerDay: 1000,
        cooldownSeconds: 1,

        refinementEnabled: true,
        allPresetsUnlocked: true,
        priorityQueue: true,           // Priority processing

        availablePresetCategories: ['*'],
        availableLightingOptions: ['*'],
    },
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get user's tier config.
 * 
 * In production, this would query database/subscription service.
 * Currently returns free tier as default.
 */
export function getUserTierConfig(userId: string): TierConfig {
    // TODO: Query actual subscription status from database
    // For now, return free tier

    // Example of how this would work:
    // const subscription = await prisma.subscription.findUnique({ where: { userId } })
    // return TIER_CONFIGS[subscription?.tier || 'free']

    return TIER_CONFIGS.free
}

/**
 * Check if a preset is available for user's tier.
 */
export function isPresetAvailable(
    presetCategory: string,
    tierConfig: TierConfig
): boolean {
    if (tierConfig.availablePresetCategories.includes('*')) {
        return true
    }
    return tierConfig.availablePresetCategories.includes(presetCategory)
}

/**
 * Check if a lighting option is available for user's tier.
 */
export function isLightingAvailable(
    lightingId: string,
    tierConfig: TierConfig
): boolean {
    if (tierConfig.availableLightingOptions.includes('*')) {
        return true
    }
    return tierConfig.availableLightingOptions.includes(lightingId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER-AWARE DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierAwareDefaults {
    presetId: string
    lightingId: string
    cameraDistance: 'selfie' | 'portrait' | 'full_body'
    refinementEnabled: boolean
}

/**
 * Get default configuration for a user's tier.
 * These defaults are used when user doesn't specify preferences.
 */
export function getTierAwareDefaults(tierConfig: TierConfig): TierAwareDefaults {
    // Safe defaults that work well across all tiers
    const defaults: TierAwareDefaults = {
        presetId: 'casual_indoor',          // Most reliable preset
        lightingId: 'natural_daylight',     // Safest lighting
        cameraDistance: 'portrait',         // Standard framing
        refinementEnabled: tierConfig.refinementEnabled,
    }

    // Free tier gets most conservative preset
    if (tierConfig.tier === 'free') {
        defaults.presetId = 'simple_indoor'
    }

    return defaults
}

/**
 * Apply tier restrictions to user's requested config.
 * Falls back to tier defaults if requested option unavailable.
 */
export function applyTierRestrictions(
    requested: Partial<TierAwareDefaults>,
    tierConfig: TierConfig
): TierAwareDefaults {
    const defaults = getTierAwareDefaults(tierConfig)

    return {
        presetId: requested.presetId || defaults.presetId,
        lightingId: requested.lightingId
            ? (isLightingAvailable(requested.lightingId, tierConfig)
                ? requested.lightingId
                : defaults.lightingId)
            : defaults.lightingId,
        cameraDistance: requested.cameraDistance || defaults.cameraDistance,
        refinementEnabled: tierConfig.refinementEnabled && (requested.refinementEnabled ?? false),
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPGRADE PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get upgrade prompt if user is hitting tier limits.
 */
export function getUpgradePrompt(
    tierConfig: TierConfig,
    remainingToday: number
): string | null {
    if (tierConfig.tier === 'enterprise') {
        return null  // Already at max tier
    }

    if (remainingToday <= 2) {
        const nextTier = tierConfig.tier === 'free' ? 'basic'
            : tierConfig.tier === 'basic' ? 'pro'
                : 'enterprise'

        return `You have ${remainingToday} generations left today. Upgrade to ${nextTier} for more.`
    }

    if (!tierConfig.refinementEnabled) {
        return 'Upgrade to Pro for enhanced lighting refinement.'
    }

    return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logTierStatus(tierConfig: TierConfig): void {
    console.log(`\n💎 TIER STATUS: ${tierConfig.displayName}`)
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Daily limit: ${tierConfig.maxGenerationsPerDay}`)
    console.log(`   Cooldown: ${tierConfig.cooldownSeconds}s`)
    console.log(`   Refinement: ${tierConfig.refinementEnabled ? 'enabled' : 'disabled'}`)
    console.log(`   All presets: ${tierConfig.allPresetsUnlocked ? 'yes' : 'limited'}`)
    console.log('   ═══════════════════════════════════════════════')
}
