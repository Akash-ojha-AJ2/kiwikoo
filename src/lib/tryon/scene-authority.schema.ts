/**
 * SCENE AUTHORITY SCHEMA
 * 
 * TypeScript interfaces defining who owns the scene and how
 * scene consistency is enforced across try-on variants.
 * 
 * Key principle: "The model must never decide the scene."
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SceneEnvironment = 'indoor' | 'outdoor' | 'unknown'
export type LightingType = 'daylight' | 'indoor_warm' | 'indoor_neutral' | 'mixed'
export type LightingDirection = 'front' | 'side' | 'top' | 'back' | 'mixed'
export type ConsistencyLevel = 'strict' | 'flexible' | 'adaptive'

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE AUTHORITY SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

export interface SceneAuthority {
    /**
     * Who has authority over the scene
     */
    authority_source: {
        mode: 'inherit' | 'override'
        primary_image_index: number  // Usually 1 (the user's photo)
    }

    /**
     * Detected scene characteristics
     */
    detected_scene: {
        environment: SceneEnvironment
        confidence: number  // 0–1
        indicators: string[]  // What was detected
    }

    /**
     * Rules for scene consistency
     */
    scene_rules: {
        background_consistency: ConsistencyLevel
        lighting_consistency: ConsistencyLevel
        allow_scene_change: boolean
    }

    /**
     * Detected lighting profile
     */
    lighting_profile: {
        type: LightingType
        color_temperature_kelvin: number
        direction: LightingDirection
        intensity: 'dim' | 'normal' | 'bright' | 'harsh'
    }

    /**
     * Hard enforcement rules
     */
    enforcement: {
        forbid_scene_switch: boolean
        forbid_indoor_outdoor_mix: boolean
        max_lighting_delta: number  // Percentage (0-100)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RESULT
// ═══════════════════════════════════════════════════════════════════════════════

export type ValidationStatus = 'PASS' | 'SOFT_FAIL' | 'FAIL'

export interface SceneValidationResult {
    status: ValidationStatus
    reason?: 'SCENE_SWITCH' | 'LIGHTING_DRIFT' | 'BACKGROUND_MISMATCH'
    details?: string
    lightingDelta?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SCENE AUTHORITY (STRICT)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_SCENE_AUTHORITY: SceneAuthority = {
    authority_source: {
        mode: 'inherit',
        primary_image_index: 1
    },
    detected_scene: {
        environment: 'unknown',
        confidence: 0,
        indicators: []
    },
    scene_rules: {
        background_consistency: 'strict',
        lighting_consistency: 'strict',
        allow_scene_change: false
    },
    lighting_profile: {
        type: 'daylight',
        color_temperature_kelvin: 5500,
        direction: 'front',
        intensity: 'normal'
    },
    enforcement: {
        forbid_scene_switch: true,
        forbid_indoor_outdoor_mix: true,
        max_lighting_delta: 12
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logSceneAuthority(authority: SceneAuthority): void {
    console.log('\n🎬 SCENE AUTHORITY')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Mode: ${authority.authority_source.mode}`)
    console.log(`   Environment: ${authority.detected_scene.environment} (${(authority.detected_scene.confidence * 100).toFixed(0)}% confidence)`)
    console.log(`   Indicators: ${authority.detected_scene.indicators.join(', ') || 'none'}`)
    console.log(`   Lighting: ${authority.lighting_profile.type} (${authority.lighting_profile.color_temperature_kelvin}K)`)
    console.log(`   Scene switch: ${authority.enforcement.forbid_scene_switch ? 'FORBIDDEN' : 'allowed'}`)
    console.log(`   Indoor/outdoor mix: ${authority.enforcement.forbid_indoor_outdoor_mix ? 'FORBIDDEN' : 'allowed'}`)
    console.log('   ═══════════════════════════════════════════════')
}
