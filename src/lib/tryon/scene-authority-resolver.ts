/**
 * SCENE AUTHORITY RESOLVER
 * 
 * Resolves scene authority from input images.
 * Builds enforcement rules based on detected scene.
 * 
 * COST-EFFECTIVE: Uses local detection, no external APIs
 */

import 'server-only'
import {
    type SceneAuthority,
    DEFAULT_SCENE_AUTHORITY,
    logSceneAuthority
} from './scene-authority.schema'
import { detectSceneType, inferLightingProfile } from './scene-detector'

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE AUTHORITY RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve scene authority from the primary input image
 * 
 * @param primaryImageBuffer - The user's photo (Image 1)
 * @returns SceneAuthority with strict defaults
 */
export async function resolveSceneAuthority(
    primaryImageBuffer: Buffer
): Promise<SceneAuthority> {
    console.log('\n🎬 RESOLVING SCENE AUTHORITY...')

    // Detect scene type (local, no API cost)
    const detectedScene = await detectSceneType(primaryImageBuffer)

    // Infer lighting profile (local, no API cost)
    const lightingProfile = await inferLightingProfile(primaryImageBuffer)

    // Build scene authority with strict defaults
    const authority: SceneAuthority = {
        authority_source: {
            mode: 'inherit',
            primary_image_index: 1
        },

        detected_scene: {
            environment: detectedScene.environment,
            confidence: detectedScene.confidence,
            indicators: detectedScene.indicators
        },

        scene_rules: {
            // Unknown scenes get strict rules
            background_consistency: 'strict',
            lighting_consistency: detectedScene.environment === 'unknown' ? 'strict' : 'adaptive',
            allow_scene_change: false
        },

        lighting_profile: {
            type: lightingProfile.type,
            color_temperature_kelvin: lightingProfile.color_temperature_kelvin,
            direction: lightingProfile.direction,
            intensity: lightingProfile.intensity
        },

        enforcement: {
            forbid_scene_switch: true,
            forbid_indoor_outdoor_mix: true,
            max_lighting_delta: detectedScene.confidence > 0.8 ? 15 : 12
        }
    }

    logSceneAuthority(authority)

    return authority
}

/**
 * Get default scene authority (when detection is skipped)
 */
export function getDefaultSceneAuthority(): SceneAuthority {
    return DEFAULT_SCENE_AUTHORITY
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE AUTHORITY PROMPT INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build scene authority JSON block for prompt injection
 */
export function buildSceneAuthorityPromptBlock(authority: SceneAuthority): object {
    return {
        SCENE_AUTHORITY: {
            rule: "INHERIT SCENE FROM INPUT IMAGE ONLY",
            explanation: "The environment and background must be inherited ONLY from Image 1. Do not switch between indoor and outdoor. Do not introduce a new location. All variants must share the same scene.",

            detected_environment: authority.detected_scene.environment,
            confidence: authority.detected_scene.confidence,

            lighting: {
                type: authority.lighting_profile.type,
                temperature_kelvin: authority.lighting_profile.color_temperature_kelvin,
                must_match: true
            },

            forbidden_actions: [
                "SWITCHING_SCENE",
                "INDOOR_TO_OUTDOOR",
                "OUTDOOR_TO_INDOOR",
                "INTRODUCING_NEW_LOCATION",
                "CHANGING_BACKGROUND",
                "ALTERING_LIGHTING_TYPE"
            ],

            enforcement: {
                scene_switch: authority.enforcement.forbid_scene_switch ? "FORBIDDEN" : "allowed",
                indoor_outdoor_mix: authority.enforcement.forbid_indoor_outdoor_mix ? "FORBIDDEN" : "allowed",
                max_lighting_change: `${authority.enforcement.max_lighting_delta}%`
            }
        }
    }
}

/**
 * Build scene authority text block for prompt injection (fallback)
 */
export function buildSceneAuthorityTextBlock(authority: SceneAuthority): string {
    return `
SCENE AUTHORITY RULE:
The environment and background must be inherited ONLY from Image 1.
Detected environment: ${authority.detected_scene.environment.toUpperCase()} (${(authority.detected_scene.confidence * 100).toFixed(0)}% confidence)
Lighting: ${authority.lighting_profile.type} (${authority.lighting_profile.color_temperature_kelvin}K)

FORBIDDEN:
- Do NOT switch between indoor and outdoor
- Do NOT introduce a new location
- Do NOT change the background
- Do NOT alter the lighting type

Lighting must remain consistent with Image 1.
All variants must share the same scene.
`.trim()
}
