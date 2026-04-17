/**
 * SUCCESS MEMORY — Phase 3B (RAG as Memory)
 * 
 * Learns from successful generations to improve default choices.
 * This is READ-ONLY influence — it never overrides user intent.
 * 
 * ========================================================================
 * WHAT THIS DOES:
 * - Stores metadata from successful generations (not prompts)
 * - Tracks which presets/lighting/camera work best
 * - Provides recommendations for defaults
 * 
 * WHAT THIS DOES NOT:
 * - Generate content
 * - Override user choices
 * - Trigger AI calls
 * - Store failed generations
 * ========================================================================
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// SUCCESS RECORD SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schema for storing successful generations.
 * We store ONLY metadata, never prompts or images.
 */
export interface SuccessRecord {
    // Identifiers
    id: string
    userId: string
    timestamp: number

    // Configuration used
    presetId: string
    lightingId: string
    cameraDistance: 'selfie' | 'portrait' | 'full_body'

    // Garment info
    garmentCategory: 'upper_wear' | 'lower_wear' | 'full_body' | 'accessory' | 'unknown'

    // Quality signals
    faceOverwritten: boolean       // Must be true to store
    userRetried: boolean           // If true, don't store
    generationTimeMs: number
    costEstimateUsd: number

    // Acceptance tracking
    userAccepted: boolean          // Did user download/save?
    timeToAcceptMs?: number        // How long until they accepted?
}

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORE (Production would use database)
// ═══════════════════════════════════════════════════════════════════════════════

const successStore: SuccessRecord[] = []
const MAX_RECORDS = 1000  // Keep last 1000 successes

// Aggregated stats for fast lookup
interface PresetStats {
    presetId: string
    successCount: number
    retryRate: number           // Lower is better
    avgTimeToAccept: number     // Lower is better
    acceptanceRate: number      // Higher is better
}

interface LightingStats {
    lightingId: string
    garmentCategory: string
    successCount: number
    acceptanceRate: number
}

const presetStatsCache = new Map<string, PresetStats>()
const lightingStatsCache = new Map<string, LightingStats>()

// ═══════════════════════════════════════════════════════════════════════════════
// STORING SUCCESS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Store a successful generation for learning.
 * 
 * CRITICAL: Only call this when:
 * - faceOverwritten = true (must have used pixel overwrite)
 * - userRetried = false (user didn't regenerate)
 * - No errors occurred
 */
export function storeSuccess(record: Omit<SuccessRecord, 'id'>): void {
    // Validation: Only store truly successful generations
    if (!record.faceOverwritten) {
        console.warn('⚠️ Cannot store success without face overwrite')
        return
    }

    if (record.userRetried) {
        console.warn('⚠️ Not storing retried generation')
        return
    }

    const id = `success-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const fullRecord: SuccessRecord = { ...record, id }

    // Add to store
    successStore.push(fullRecord)

    // Trim if too large
    if (successStore.length > MAX_RECORDS) {
        successStore.shift()
    }

    // Update caches
    updatePresetStats(fullRecord)
    updateLightingStats(fullRecord)

    console.log(`📊 Stored success: preset=${record.presetId} lighting=${record.lightingId}`)
}

function updatePresetStats(record: SuccessRecord): void {
    const existing = presetStatsCache.get(record.presetId) || {
        presetId: record.presetId,
        successCount: 0,
        retryRate: 0,
        avgTimeToAccept: 0,
        acceptanceRate: 0,
    }

    existing.successCount++
    existing.acceptanceRate = record.userAccepted
        ? (existing.acceptanceRate * (existing.successCount - 1) + 1) / existing.successCount
        : (existing.acceptanceRate * (existing.successCount - 1)) / existing.successCount

    if (record.timeToAcceptMs) {
        existing.avgTimeToAccept = (existing.avgTimeToAccept * (existing.successCount - 1) + record.timeToAcceptMs) / existing.successCount
    }

    presetStatsCache.set(record.presetId, existing)
}

function updateLightingStats(record: SuccessRecord): void {
    const key = `${record.lightingId}:${record.garmentCategory}`
    const existing = lightingStatsCache.get(key) || {
        lightingId: record.lightingId,
        garmentCategory: record.garmentCategory,
        successCount: 0,
        acceptanceRate: 0,
    }

    existing.successCount++
    existing.acceptanceRate = record.userAccepted
        ? (existing.acceptanceRate * (existing.successCount - 1) + 1) / existing.successCount
        : (existing.acceptanceRate * (existing.successCount - 1)) / existing.successCount

    lightingStatsCache.set(key, existing)
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATIONS (READ-ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Recommendation {
    presetId?: string
    lightingId?: string
    cameraDistance?: 'selfie' | 'portrait' | 'full_body'
    confidence: number           // 0-1, higher = more data
    reason: string
}

/**
 * Get recommended defaults based on past success.
 * 
 * IMPORTANT: These are SUGGESTIONS only.
 * They must NEVER override explicit user choices.
 */
export function getRecommendedDefaults(
    garmentCategory: SuccessRecord['garmentCategory']
): Recommendation {
    // Not enough data yet
    if (successStore.length < 10) {
        return {
            confidence: 0,
            reason: 'Insufficient data for recommendations',
        }
    }

    // Find best preset (highest acceptance rate with sufficient data)
    let bestPreset: PresetStats | null = null
    for (const stats of presetStatsCache.values()) {
        if (stats.successCount >= 5) {  // Minimum data threshold
            if (!bestPreset || stats.acceptanceRate > bestPreset.acceptanceRate) {
                bestPreset = stats
            }
        }
    }

    // Find best lighting for this garment category
    let bestLighting: LightingStats | null = null
    for (const stats of lightingStatsCache.values()) {
        if (stats.garmentCategory === garmentCategory && stats.successCount >= 3) {
            if (!bestLighting || stats.acceptanceRate > bestLighting.acceptanceRate) {
                bestLighting = stats
            }
        }
    }

    // Calculate confidence based on data volume
    const confidence = Math.min(1, successStore.length / 100)

    return {
        presetId: bestPreset?.presetId,
        lightingId: bestLighting?.lightingId,
        cameraDistance: 'portrait',  // Default for most garments
        confidence,
        reason: `Based on ${successStore.length} successful generations`,
    }
}

/**
 * Check if user choice differs from recommendation.
 * Used for logging/analytics, NOT for overriding.
 */
export function checkUserOverride(
    userChoice: { presetId?: string; lightingId?: string },
    recommendation: Recommendation
): { isOverride: boolean; details: string } {
    if (!recommendation.presetId && !recommendation.lightingId) {
        return { isOverride: false, details: 'No recommendation available' }
    }

    const overrides: string[] = []

    if (userChoice.presetId && userChoice.presetId !== recommendation.presetId) {
        overrides.push(`preset: ${userChoice.presetId} (recommended: ${recommendation.presetId})`)
    }

    if (userChoice.lightingId && userChoice.lightingId !== recommendation.lightingId) {
        overrides.push(`lighting: ${userChoice.lightingId} (recommended: ${recommendation.lightingId})`)
    }

    return {
        isOverride: overrides.length > 0,
        details: overrides.length > 0 ? overrides.join(', ') : 'Using recommended defaults',
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get presets sorted by performance.
 */
export function getTopPresets(limit: number = 5): PresetStats[] {
    return Array.from(presetStatsCache.values())
        .filter(s => s.successCount >= 5)
        .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
        .slice(0, limit)
}

/**
 * Get best lighting per garment category.
 */
export function getBestLightingByCategory(): Record<string, string> {
    const best: Record<string, string> = {}

    for (const stats of lightingStatsCache.values()) {
        if (stats.successCount >= 3) {
            const current = best[stats.garmentCategory]
            if (!current) {
                best[stats.garmentCategory] = stats.lightingId
            } else {
                const currentStats = Array.from(lightingStatsCache.values())
                    .find(s => s.lightingId === current && s.garmentCategory === stats.garmentCategory)
                if (currentStats && stats.acceptanceRate > currentStats.acceptanceRate) {
                    best[stats.garmentCategory] = stats.lightingId
                }
            }
        }
    }

    return best
}

/**
 * Get aggregate stats for monitoring.
 */
export function getSuccessMemoryStats(): {
    totalRecords: number
    uniquePresets: number
    avgAcceptanceRate: number
} {
    const rates = Array.from(presetStatsCache.values()).map(s => s.acceptanceRate)
    const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0

    return {
        totalRecords: successStore.length,
        uniquePresets: presetStatsCache.size,
        avgAcceptanceRate: avgRate,
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logSuccessMemoryStatus(): void {
    const stats = getSuccessMemoryStats()
    console.log('\n📚 SUCCESS MEMORY (RAG) STATUS')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Records stored: ${stats.totalRecords}`)
    console.log(`   Unique presets tracked: ${stats.uniquePresets}`)
    console.log(`   Avg acceptance rate: ${(stats.avgAcceptanceRate * 100).toFixed(1)}%`)
    console.log('   ═══════════════════════════════════════════════')
    console.log('   Mode: Read-only recommendations')
    console.log('   Override policy: User choice always wins')
}
