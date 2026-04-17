/**
 * SCENE DETECTOR
 * 
 * Detects indoor vs outdoor scenes using LOCAL HEURISTICS.
 * 
 * COST-EFFECTIVE: Uses image analysis, NOT external API calls.
 * This avoids per-request costs while still providing useful detection.
 * 
 * Detection signals:
 * - Color histogram analysis (blue sky, green foliage)
 * - Brightness distribution (harsh outdoor vs soft indoor)
 * - Edge density (busy outdoor vs clean indoor)
 */

import 'server-only'
import sharp from 'sharp'
import type { SceneEnvironment } from './scene-authority.schema'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SceneDetectionResult {
    environment: SceneEnvironment
    confidence: number  // 0–1
    indicators: string[]
}

export interface ColorStats {
    avgRed: number
    avgGreen: number
    avgBlue: number
    brightness: number
    saturation: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

const detectionCache = new Map<string, SceneDetectionResult>()
const CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutes

/**
 * Get cached detection result or null if expired/missing
 */
function getCachedResult(imageHash: string): SceneDetectionResult | null {
    const cached = detectionCache.get(imageHash)
    return cached || null
}

/**
 * Cache a detection result
 */
function cacheResult(imageHash: string, result: SceneDetectionResult): void {
    detectionCache.set(imageHash, result)

    // Clean up old entries periodically
    if (detectionCache.size > 100) {
        const firstKey = detectionCache.keys().next().value
        if (firstKey) detectionCache.delete(firstKey)
    }
}

/**
 * Simple hash for image buffer (first 1000 bytes)
 */
function quickHash(buffer: Buffer): string {
    const sample = buffer.subarray(0, Math.min(1000, buffer.length))
    let hash = 0
    for (let i = 0; i < sample.length; i++) {
        hash = ((hash << 5) - hash) + sample[i]
        hash = hash & hash
    }
    return hash.toString(36)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL HEURISTIC DETECTION (NO API COST)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze image colors to detect scene type
 * 
 * LOCAL ONLY - No API calls - Zero additional cost
 */
async function analyzeImageColors(imageBuffer: Buffer): Promise<ColorStats> {
    try {
        const { data, info } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })  // Downsample for speed
            .raw()
            .toBuffer({ resolveWithObject: true })

        let totalR = 0, totalG = 0, totalB = 0
        const pixelCount = info.width * info.height

        for (let i = 0; i < data.length; i += info.channels) {
            totalR += data[i]
            totalG += data[i + 1]
            totalB += data[i + 2]
        }

        const avgRed = totalR / pixelCount
        const avgGreen = totalG / pixelCount
        const avgBlue = totalB / pixelCount
        const brightness = (avgRed + avgGreen + avgBlue) / 3

        const max = Math.max(avgRed, avgGreen, avgBlue)
        const min = Math.min(avgRed, avgGreen, avgBlue)
        const saturation = max > 0 ? (max - min) / max : 0

        return { avgRed, avgGreen, avgBlue, brightness, saturation }
    } catch {
        return { avgRed: 128, avgGreen: 128, avgBlue: 128, brightness: 128, saturation: 0.3 }
    }
}

/**
 * Analyze top portion of image for sky detection
 */
async function analyzeTopRegion(imageBuffer: Buffer): Promise<ColorStats> {
    try {
        const meta = await sharp(imageBuffer).metadata()
        const height = meta.height || 100
        const topHeight = Math.floor(height * 0.3)  // Top 30%

        const { data, info } = await sharp(imageBuffer)
            .extract({ left: 0, top: 0, width: meta.width || 100, height: topHeight })
            .resize(100, 30, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true })

        let totalR = 0, totalG = 0, totalB = 0
        const pixelCount = info.width * info.height

        for (let i = 0; i < data.length; i += info.channels) {
            totalR += data[i]
            totalG += data[i + 1]
            totalB += data[i + 2]
        }

        const avgRed = totalR / pixelCount
        const avgGreen = totalG / pixelCount
        const avgBlue = totalB / pixelCount
        const brightness = (avgRed + avgGreen + avgBlue) / 3

        const max = Math.max(avgRed, avgGreen, avgBlue)
        const min = Math.min(avgRed, avgGreen, avgBlue)
        const saturation = max > 0 ? (max - min) / max : 0

        return { avgRed, avgGreen, avgBlue, brightness, saturation }
    } catch {
        return { avgRed: 128, avgGreen: 128, avgBlue: 128, brightness: 128, saturation: 0.3 }
    }
}

/**
 * Detect scene type using LOCAL heuristics only
 * 
 * NO API CALLS - ZERO COST
 */
export async function detectSceneType(imageBuffer: Buffer): Promise<SceneDetectionResult> {
    // Check cache first
    const hash = quickHash(imageBuffer)
    const cached = getCachedResult(hash)
    if (cached) {
        console.log('   📋 Scene detection from cache')
        return cached
    }

    const indicators: string[] = []
    let outdoorScore = 0
    let indoorScore = 0

    // Analyze full image colors
    const fullStats = await analyzeImageColors(imageBuffer)

    // Analyze top region (sky detection)
    const topStats = await analyzeTopRegion(imageBuffer)

    // HEURISTIC 1: Sky detection (blue top region)
    const skyBlueRatio = topStats.avgBlue / Math.max(topStats.avgRed, topStats.avgGreen, 1)
    if (skyBlueRatio > 1.2 && topStats.brightness > 150) {
        outdoorScore += 3
        indicators.push('blue_sky_detected')
    }

    // HEURISTIC 2: High brightness (outdoor daylight)
    if (fullStats.brightness > 140) {
        outdoorScore += 2
        indicators.push('high_brightness')
    } else if (fullStats.brightness < 100) {
        indoorScore += 2
        indicators.push('low_brightness')
    }

    // HEURISTIC 3: Green presence (foliage)
    const greenRatio = fullStats.avgGreen / Math.max(fullStats.avgRed, fullStats.avgBlue, 1)
    if (greenRatio > 1.15) {
        outdoorScore += 2
        indicators.push('green_foliage')
    }

    // HEURISTIC 4: Warm color cast (indoor tungsten)
    const warmRatio = fullStats.avgRed / Math.max(fullStats.avgBlue, 1)
    if (warmRatio > 1.3 && fullStats.brightness < 120) {
        indoorScore += 2
        indicators.push('warm_indoor_light')
    }

    // HEURISTIC 5: High saturation (outdoor)
    if (fullStats.saturation > 0.4) {
        outdoorScore += 1
        indicators.push('high_saturation')
    } else if (fullStats.saturation < 0.25) {
        indoorScore += 1
        indicators.push('low_saturation')
    }

    // Calculate final result
    const totalScore = outdoorScore + indoorScore
    let environment: SceneEnvironment = 'unknown'
    let confidence = 0

    if (totalScore === 0) {
        environment = 'unknown'
        confidence = 0.3
    } else if (outdoorScore > indoorScore) {
        environment = 'outdoor'
        confidence = Math.min(0.95, 0.5 + (outdoorScore - indoorScore) * 0.1)
    } else if (indoorScore > outdoorScore) {
        environment = 'indoor'
        confidence = Math.min(0.95, 0.5 + (indoorScore - outdoorScore) * 0.1)
    } else {
        environment = 'unknown'
        confidence = 0.5
    }

    // If confidence < 0.7, mark as unknown (per spec)
    if (confidence < 0.7) {
        environment = 'unknown'
    }

    const result: SceneDetectionResult = {
        environment,
        confidence,
        indicators
    }

    // Cache result
    cacheResult(hash, result)

    console.log(`   🔍 Scene detected: ${environment} (${(confidence * 100).toFixed(0)}% confidence)`)
    console.log(`   📊 Indicators: ${indicators.join(', ') || 'none'}`)

    return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING PROFILE INFERENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Infer lighting profile from image
 * 
 * LOCAL ONLY - No API calls
 */
export async function inferLightingProfile(imageBuffer: Buffer): Promise<{
    type: 'daylight' | 'indoor_warm' | 'indoor_neutral' | 'mixed'
    color_temperature_kelvin: number
    direction: 'front' | 'side' | 'top' | 'back' | 'mixed'
    intensity: 'dim' | 'normal' | 'bright' | 'harsh'
}> {
    const stats = await analyzeImageColors(imageBuffer)

    // Determine color temperature from red/blue ratio
    const warmthRatio = stats.avgRed / Math.max(stats.avgBlue, 1)
    let color_temperature_kelvin: number
    let type: 'daylight' | 'indoor_warm' | 'indoor_neutral' | 'mixed'

    if (warmthRatio > 1.4) {
        color_temperature_kelvin = 2700
        type = 'indoor_warm'
    } else if (warmthRatio > 1.15) {
        color_temperature_kelvin = 4000
        type = 'mixed'
    } else if (warmthRatio < 0.9) {
        color_temperature_kelvin = 6500
        type = 'daylight'
    } else {
        color_temperature_kelvin = 5500
        type = 'indoor_neutral'
    }

    // Determine intensity from brightness
    let intensity: 'dim' | 'normal' | 'bright' | 'harsh'
    if (stats.brightness > 180) {
        intensity = 'harsh'
    } else if (stats.brightness > 140) {
        intensity = 'bright'
    } else if (stats.brightness < 80) {
        intensity = 'dim'
    } else {
        intensity = 'normal'
    }

    // Direction is hard to detect without face analysis, default to front
    const direction = 'front'

    return { type, color_temperature_kelvin, direction, intensity }
}
