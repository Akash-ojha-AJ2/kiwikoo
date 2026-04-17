/**
 * GENERATION LIMITER — Phase 2 Cost Control
 * 
 * Three-layer protection against abuse and runaway costs:
 * 1. User-level limits (daily cap, cooldown)
 * 2. Session-level lock (one concurrent generation)
 * 3. IP-level backstop (abuse prevention)
 * 
 * CRITICAL RULES:
 * - All checks happen BEFORE any AI call
 * - If blocked → return immediately, NO AI calls
 * - All blocks are logged for monitoring
 * 
 * This module is the ONLY gateway to AI generation.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION (Override via environment variables)
// ═══════════════════════════════════════════════════════════════════════════════

export const LIMITS = {
    // User-level limits
    MAX_GENERATIONS_PER_DAY: parseInt(
        process.env.MAX_TRYON_PER_DAY ||
        process.env.MAX_GENERATIONS_PER_DAY ||
        '10'
    ),
    COOLDOWN_SECONDS: parseInt(
        process.env.TRYON_COOLDOWN_SECONDS ||
        process.env.GENERATION_COOLDOWN_SECONDS ||
        '15'
    ),

    // Session-level
    MAX_CONCURRENT_GENERATIONS: 1,  // ALWAYS 1 — no parallel generations

    // IP-level backstop
    MAX_REQUESTS_PER_HOUR_PER_IP: parseInt(
        process.env.MAX_TRYON_PER_HOUR ||
        process.env.MAX_IP_REQUESTS_PER_HOUR ||
        '15'
    ),

    // Cost controls
    DAILY_GEMINI_SPEND_LIMIT_USD: parseFloat(
        process.env.DAILY_TRYON_COST_LIMIT_USD ||
        process.env.DAILY_GEMINI_LIMIT_USD ||
        '20.0'
    ),
    GEMINI_COST_PER_GENERATION_USD: 0.025,  // Approximate cost per Gemini call

    // Kill switch thresholds
    KILL_SWITCH_THRESHOLD_USD: parseFloat(
        process.env.TRYON_KILL_SWITCH_THRESHOLD_USD ||
        process.env.KILL_SWITCH_THRESHOLD_USD ||
        '15.0'
    ),
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// STORES (In-memory for development, use Redis for production)
// ═══════════════════════════════════════════════════════════════════════════════

interface UserUsage {
    generationsToday: number
    lastGenerationTime: number
    dailyResetTime: number
    estimatedCostToday: number
}

interface SessionLock {
    userId: string
    startTime: number
    requestId: string
}

interface IpUsage {
    requestCount: number
    hourResetTime: number
}

interface CostRecord {
    userId: string
    timestamp: number
    modelUsed: string
    geminiCalls: number
    estimatedCostUsd: number
    result: 'success' | 'blocked' | 'aborted' | 'failed'
    blockReason?: string
}

// Stores
const userUsageStore = new Map<string, UserUsage>()
const sessionLockStore = new Map<string, SessionLock>()
const ipUsageStore = new Map<string, IpUsage>()
const costLog: CostRecord[] = []

// Daily aggregates
let dailyGeminiSpend = 0
let dailySpendResetTime = getEndOfDay()
let killSwitchActive = false

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getEndOfDay(): number {
    const now = new Date()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return endOfDay.getTime()
}

function getEndOfHour(): number {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    return now.getTime()
}

function resetDailyCountersIfNeeded(): void {
    const now = Date.now()
    if (now >= dailySpendResetTime) {
        dailyGeminiSpend = 0
        dailySpendResetTime = getEndOfDay()
        killSwitchActive = false
        console.log('🔄 Daily counters reset')

        // Clear user daily counters
        for (const [userId, usage] of userUsageStore) {
            if (now >= usage.dailyResetTime) {
                usage.generationsToday = 0
                usage.estimatedCostToday = 0
                usage.dailyResetTime = getEndOfDay()
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1: USER-LEVEL LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UserLimitResult {
    allowed: boolean
    reason?: string
    remainingToday: number
    cooldownRemaining: number
    estimatedCostToday: number
}

function checkUserLimits(userId: string): UserLimitResult {
    resetDailyCountersIfNeeded()

    const now = Date.now()
    let usage = userUsageStore.get(userId)

    if (!usage || now >= usage.dailyResetTime) {
        usage = {
            generationsToday: 0,
            lastGenerationTime: 0,
            dailyResetTime: getEndOfDay(),
            estimatedCostToday: 0
        }
        userUsageStore.set(userId, usage)
    }

    // Check daily limit
    if (usage.generationsToday >= LIMITS.MAX_GENERATIONS_PER_DAY) {
        return {
            allowed: false,
            reason: `Daily limit reached (${LIMITS.MAX_GENERATIONS_PER_DAY} generations/day)`,
            remainingToday: 0,
            cooldownRemaining: 0,
            estimatedCostToday: usage.estimatedCostToday
        }
    }

    // Check cooldown
    const timeSinceLastGen = (now - usage.lastGenerationTime) / 1000
    if (timeSinceLastGen < LIMITS.COOLDOWN_SECONDS) {
        const cooldownRemaining = Math.ceil(LIMITS.COOLDOWN_SECONDS - timeSinceLastGen)
        return {
            allowed: false,
            reason: `Cooldown active (${cooldownRemaining}s remaining)`,
            remainingToday: LIMITS.MAX_GENERATIONS_PER_DAY - usage.generationsToday,
            cooldownRemaining,
            estimatedCostToday: usage.estimatedCostToday
        }
    }

    return {
        allowed: true,
        remainingToday: LIMITS.MAX_GENERATIONS_PER_DAY - usage.generationsToday,
        cooldownRemaining: 0,
        estimatedCostToday: usage.estimatedCostToday
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2: SESSION-LEVEL LOCKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface SessionLockResult {
    acquired: boolean
    reason?: string
    existingRequestId?: string
}

function acquireSessionLock(userId: string, requestId: string): SessionLockResult {
    const existingLock = sessionLockStore.get(userId)
    const now = Date.now()

    // Check for existing lock
    if (existingLock) {
        // Auto-expire locks older than 2 minutes (safety net for crashes)
        const lockAge = (now - existingLock.startTime) / 1000
        if (lockAge < 120) {
            return {
                acquired: false,
                reason: 'Another generation is in progress',
                existingRequestId: existingLock.requestId
            }
        }
        console.warn(`⚠️ Stale lock cleared for user ${userId}`)
    }

    // Acquire lock
    sessionLockStore.set(userId, {
        userId,
        startTime: now,
        requestId
    })

    return { acquired: true }
}

function releaseSessionLock(userId: string, requestId: string): void {
    const lock = sessionLockStore.get(userId)
    if (lock && lock.requestId === requestId) {
        sessionLockStore.delete(userId)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3: IP-LEVEL BACKSTOP
// ═══════════════════════════════════════════════════════════════════════════════

export interface IpLimitResult {
    allowed: boolean
    reason?: string
    remainingThisHour: number
}

function checkIpLimits(ip: string): IpLimitResult {
    const now = Date.now()
    let usage = ipUsageStore.get(ip)

    if (!usage || now >= usage.hourResetTime) {
        usage = {
            requestCount: 0,
            hourResetTime: getEndOfHour()
        }
        ipUsageStore.set(ip, usage)
    }

    if (usage.requestCount >= LIMITS.MAX_REQUESTS_PER_HOUR_PER_IP) {
        return {
            allowed: false,
            reason: `IP rate limit exceeded (${LIMITS.MAX_REQUESTS_PER_HOUR_PER_IP}/hour)`,
            remainingThisHour: 0
        }
    }

    // Increment (we only increment on successful pass)
    usage.requestCount++

    return {
        allowed: true,
        remainingThisHour: LIMITS.MAX_REQUESTS_PER_HOUR_PER_IP - usage.requestCount
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// KILL SWITCH
// ═══════════════════════════════════════════════════════════════════════════════

export interface KillSwitchStatus {
    active: boolean
    dailySpend: number
    threshold: number
    optionalFeaturesDisabled: boolean
}

function checkKillSwitch(): KillSwitchStatus {
    resetDailyCountersIfNeeded()

    if (dailyGeminiSpend >= LIMITS.KILL_SWITCH_THRESHOLD_USD) {
        killSwitchActive = true
    }

    return {
        active: killSwitchActive,
        dailySpend: dailyGeminiSpend,
        threshold: LIMITS.KILL_SWITCH_THRESHOLD_USD,
        optionalFeaturesDisabled: killSwitchActive
    }
}

export function isKillSwitchActive(): boolean {
    return checkKillSwitch().active
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

function recordCost(record: CostRecord): void {
    costLog.push(record)

    if (record.result === 'success') {
        dailyGeminiSpend += record.estimatedCostUsd

        const usage = userUsageStore.get(record.userId)
        if (usage) {
            usage.generationsToday++
            usage.lastGenerationTime = Date.now()
            usage.estimatedCostToday += record.estimatedCostUsd
        }
    }

    console.log(`📊 COST RECORD: user=${record.userId} result=${record.result} cost=$${record.estimatedCostUsd.toFixed(3)}`)

    // Check kill switch after each cost record
    checkKillSwitch()
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GATE: UNIFIED CHECK
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerationGateResult {
    allowed: boolean
    requestId: string
    blockReason?: string
    killSwitchActive: boolean
    disableOptionalFeatures: boolean
    remainingToday: number
}

/**
 * Main gate function - MUST be called before any AI generation
 * 
 * @param userId - Authenticated user ID
 * @param ip - Request IP address
 * @returns Gate result - if allowed=false, do NOT proceed with AI calls
 */
export function checkGenerationGate(userId: string, ip: string): GenerationGateResult {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // ═══════════════════════════════════════════════════════════════════════════════
    // RATE LIMITING DISABLED - Users can generate unlimited images
    // ═══════════════════════════════════════════════════════════════════════════════
    console.log(`✅ GENERATION GATE: Always allowed (rate limiting disabled)`)
    console.log(`   User: ${userId}`)
    console.log(`   Request: ${requestId}`)

    return {
        allowed: true,
        requestId,
        killSwitchActive: false,
        disableOptionalFeatures: false,
        remainingToday: 999999
    }
}

/**
 * Complete a generation - MUST be called after generation finishes
 */
export function completeGeneration(
    userId: string,
    requestId: string,
    result: 'success' | 'aborted' | 'failed',
    geminiCalls: number = 1
): void {
    // Release session lock
    releaseSessionLock(userId, requestId)

    // Record cost
    const cost = geminiCalls * LIMITS.GEMINI_COST_PER_GENERATION_USD
    recordCost({
        userId,
        timestamp: Date.now(),
        modelUsed: 'gemini-2.0-flash-exp',
        geminiCalls,
        estimatedCostUsd: result === 'success' ? cost : 0,
        result
    })

    console.log(`\n📋 Generation complete: ${result} (${geminiCalls} Gemini calls, $${cost.toFixed(3)})`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONITORING ENDPOINT DATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface CostMonitorData {
    dailySpend: number
    dailyLimit: number
    killSwitchActive: boolean
    killSwitchThreshold: number
    totalGenerationsToday: number
    recentRecords: CostRecord[]
    limits: typeof LIMITS
}

export function getCostMonitorData(): CostMonitorData {
    resetDailyCountersIfNeeded()

    let totalGenerationsToday = 0
    for (const usage of userUsageStore.values()) {
        totalGenerationsToday += usage.generationsToday
    }

    return {
        dailySpend: dailyGeminiSpend,
        dailyLimit: LIMITS.DAILY_GEMINI_SPEND_LIMIT_USD,
        killSwitchActive,
        killSwitchThreshold: LIMITS.KILL_SWITCH_THRESHOLD_USD,
        totalGenerationsToday,
        recentRecords: costLog.slice(-50),  // Last 50 records
        limits: LIMITS
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════════

export function cleanupStaleData(): void {
    const now = Date.now()

    // Clean stale session locks (older than 5 minutes)
    for (const [userId, lock] of sessionLockStore) {
        if (now - lock.startTime > 5 * 60 * 1000) {
            sessionLockStore.delete(userId)
            console.log(`🧹 Cleaned stale lock for user ${userId}`)
        }
    }

    // Clean old IP usage data
    for (const [ip, usage] of ipUsageStore) {
        if (now >= usage.hourResetTime) {
            ipUsageStore.delete(ip)
        }
    }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupStaleData, 60 * 1000)
}
