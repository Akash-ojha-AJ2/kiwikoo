/**
 * ANCHOR ZONE RESOLVER
 *
 * Static map of preset → allowed anchor zones.
 * Used to validate GPT Scene Intelligence output in code.
 *
 * DO NOT TOUCH: This is an identity-critical safety layer.
 */

import { getPresetById } from './presets/index'

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET → ANCHOR ZONE MAP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Each preset has a list of anchor zones that are geometrically compatible.
 * Anchor zones describe WHERE the subject can be placed without pose conflicts.
 *
 * Example: 'city_street' allows 'sidewalk_edge' (standing) or 'footpath_bench' (sitting).
 */
export const PRESET_ANCHOR_MAP: Record<string, string[]> = {
    // HOME
    minimal_living_room: ['sofa_behind', 'floor_stand', 'wall_lean', 'armchair_sit'],
    sunny_bedroom: ['bed_sit', 'floor_stand', 'window_lean'],
    modern_kitchen: ['counter_stand', 'island_lean', 'stool_sit'],
    cozy_loft: ['sofa_sit', 'floor_stand', 'wall_lean', 'rug_sit'],

    // LIFESTYLE
    coffee_shop: ['table_sit', 'counter_stool', 'wall_lean', 'booth_sit'],
    art_gallery: ['floor_stand', 'wall_lean', 'bench_sit'],
    hotel_lobby: ['armchair_sit', 'floor_stand', 'wall_lean', 'sofa_sit'],
    rooftop_terrace: ['railing_lean', 'lounge_sit', 'floor_stand'],

    // OUTDOOR
    city_street: ['sidewalk_edge', 'footpath_bench', 'wall_lean'],
    garden_path: ['path_stand', 'bench_sit', 'grass_sit'],
    beach_sunset: ['sand_stand', 'rock_sit', 'towel_sit'],
    park_bench: ['bench_sit', 'grass_sit', 'path_stand'],

    // STUDIO (Universal Fallback)
    abstract_gradient: ['center_stand', 'center_sit'],
    concrete_wall: ['center_stand', 'center_sit', 'wall_lean'],
    white_cyclorama: ['center_stand', 'center_sit'],
    warm_plaster: ['center_stand', 'center_sit', 'wall_lean'],

    // FALLBACK (Always works)
    studio_gradient: ['center_stand', 'center_sit'],

    // LIGHTING-ONLY (New presets)
    window_daylight: ['center_stand', 'center_sit', 'wall_lean'],
    soft_shadow: ['center_stand', 'center_sit'],
    golden_hour: ['center_stand', 'center_sit'],
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET AUTHORITY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PresetAuthority determines how much creative freedom Nano Banana Pro has.
 *
 * - 'lighting_only': Change lighting, keep background neutral
 * - 'environment_soft': Soft background hint + lighting changes
 * - 'environment_strong': Full background rewrite + lighting changes
 *
 * WHY: Over-constraining the model mutes presets. By explicitly declaring
 * authority levels, we give the model room to apply preset-specific effects.
 */
export type PresetAuthority = 'lighting_only' | 'environment_soft' | 'environment_strong'

/**
 * Static map of preset → authority level.
 * This determines whether background/lighting can be rewritten.
 * 
 * IMPORTANT: Keys MUST match actual preset IDs from presets/photoshoot.ts
 */
export const PRESET_AUTHORITY_MAP: Record<string, PresetAuthority> = {
    // ═══════════════════════════════════════════════════════════════════════════════
    // STUDIO PRESETS (lighting_only - no environment change, just lighting mood)
    // ═══════════════════════════════════════════════════════════════════════════════
    studio_seamless_white: 'lighting_only',
    studio_grey_cyc: 'lighting_only',
    studio_black_matte: 'lighting_only',
    studio_fashion_editorial: 'lighting_only',
    studio_hardlight_editorial: 'lighting_only',
    studio_catalog: 'lighting_only',
    studio_cream_backdrop: 'lighting_only',
    studio_pastel_mint: 'lighting_only',
    studio_terracotta: 'lighting_only',
    studio_textured_wall: 'lighting_only',

    // Legacy studio keys (fallback)
    studio_gradient: 'lighting_only',
    abstract_gradient: 'lighting_only',
    white_cyclorama: 'lighting_only',
    warm_plaster: 'lighting_only',
    concrete_wall: 'lighting_only',

    // ═══════════════════════════════════════════════════════════════════════════════
    // HOME PRESETS (environment_soft - subtle background hint)
    // ═══════════════════════════════════════════════════════════════════════════════
    lifestyle_minimal_living: 'environment_soft',
    lifestyle_window_daylight: 'environment_soft',
    lifestyle_balcony_golden: 'environment_soft',
    celebration_diwali_home: 'environment_soft',
    balcony_reading_moment: 'environment_soft',
    mirror_casual_selfie: 'environment_soft',
    bathroom_mirror_selfie: 'environment_soft',

    // Legacy home keys
    minimal_living_room: 'environment_soft',
    sunny_bedroom: 'environment_soft',
    modern_kitchen: 'environment_soft',
    cozy_loft: 'environment_soft',

    // ═══════════════════════════════════════════════════════════════════════════════
    // LIFESTYLE PRESETS (environment_strong - full background rewrite)
    // ═══════════════════════════════════════════════════════════════════════════════
    lifestyle_cafe_modern: 'environment_strong',
    lifestyle_hotel_corridor: 'environment_strong',
    lifestyle_restaurant_evening: 'environment_strong',
    lifestyle_lobby_modern: 'environment_strong',
    lifestyle_bookstore: 'environment_strong',
    lifestyle_rooftop_day: 'environment_strong',
    lifestyle_art_gallery: 'environment_strong',
    cafe_window_lifestyle: 'environment_strong',
    street_relaxed_standing: 'environment_strong',
    casual_walk_moment: 'environment_strong',

    // Legacy lifestyle keys
    coffee_shop: 'environment_strong',
    art_gallery: 'environment_strong',
    hotel_lobby: 'environment_strong',
    rooftop_terrace: 'environment_strong',

    // ═══════════════════════════════════════════════════════════════════════════════
    // CELEBRATION PRESETS (environment_strong)
    // ═══════════════════════════════════════════════════════════════════════════════
    celebration_festive_lights: 'environment_strong',
    celebration_wedding_guest: 'environment_strong',
    celebration_birthday_dinner: 'environment_strong',
    celebration_rooftop_night: 'environment_strong',
    celebration_sangeet: 'environment_strong',
    celebration_haldi: 'environment_strong',
    celebration_cocktail_party: 'environment_strong',
    celebration_mehendi: 'environment_strong',
    celebration_new_year: 'environment_strong',

    // ═══════════════════════════════════════════════════════════════════════════════
    // OUTDOOR PRESETS (environment_strong)
    // ═══════════════════════════════════════════════════════════════════════════════
    outdoor_heritage_wall: 'environment_strong',
    outdoor_courtyard: 'environment_strong',
    outdoor_park_morning: 'environment_strong',
    outdoor_sunset_walk: 'environment_strong',
    outdoor_beach_golden: 'environment_strong',
    outdoor_garden_flowers: 'environment_strong',
    outdoor_lake_peaceful: 'environment_strong',
    outdoor_mountain_vista: 'environment_strong',
    outdoor_forest_path: 'environment_strong',

    // Legacy outdoor keys
    city_street: 'environment_strong',
    garden_path: 'environment_strong',
    beach_sunset: 'environment_strong',
    park_bench: 'environment_strong',

    // ═══════════════════════════════════════════════════════════════════════════════
    // URBAN CINEMATIC PRESETS (environment_strong)
    // ═══════════════════════════════════════════════════════════════════════════════
    urban_quiet_dusk: 'environment_strong',
    urban_concrete_brutalist: 'environment_strong',
    urban_staircase_geometry: 'environment_strong',
    urban_parking_shadow: 'environment_strong',
    urban_metro_platform: 'environment_strong',
    urban_bridge_evening: 'environment_strong',
    urban_museum_exterior: 'environment_strong',
    urban_glass_reflection: 'environment_strong',
    urban_underpass_tunnel: 'environment_strong',
}

/**
 * Get the authority level for a preset.
 * Defaults to 'environment_strong' for unknown presets — presets are MEANT to change scenes.
 * (Changed from 'lighting_only' which was blocking scene changes for unmapped presets)
 */
export function getPresetAuthority(presetKey: string): PresetAuthority {
    const normalized = presetKey.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
    return PRESET_AUTHORITY_MAP[normalized] || 'environment_strong'
}

/**
 * Compute rewrite permissions based on authority level.
 */
export function computeRewritePermissions(authority: PresetAuthority): {
    allowBackgroundRewrite: boolean
    allowLightingRewrite: boolean
    backgroundStrength: 'none' | 'soft' | 'full'
} {
    switch (authority) {
        case 'lighting_only':
            return {
                allowBackgroundRewrite: false,
                allowLightingRewrite: true,
                backgroundStrength: 'none',
            }
        case 'environment_soft':
            return {
                allowBackgroundRewrite: true,
                allowLightingRewrite: true,
                backgroundStrength: 'soft',
            }
        case 'environment_strong':
            return {
                allowBackgroundRewrite: true,
                allowLightingRewrite: true,
                backgroundStrength: 'full',
            }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POSE → ANCHOR COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps a pose type to which anchor zone suffixes are compatible.
 */
const POSE_ANCHOR_COMPATIBILITY: Record<string, string[]> = {
    standing: ['stand', 'lean', 'edge'],
    sitting: ['sit', 'stool', 'bench'],
    leaning: ['lean', 'railing', 'wall'],
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESOLVER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnchorZoneResolution {
    isValid: boolean
    resolvedAnchorZone: string
    fallbackUsed: boolean
    fallbackPreset: string | null
    reason: string | null
}

/**
 * Validates that the GPT-suggested anchor zone is compatible with:
 * 1. The selected preset (must be in PRESET_ANCHOR_MAP)
 * 2. The input pose (anchor zone suffix must match pose type)
 *
 * If invalid, returns a fallback to 'studio_gradient'.
 */
export function resolveAnchorZone(
    preset: string,
    suggestedAnchorZone: string,
    inputPose: 'standing' | 'sitting' | 'leaning'
): AnchorZoneResolution {
    // Normalize preset name (lowercase, underscores)
    const normalizedPreset = preset.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')

    // Get allowed anchor zones for this preset
    const allowedZones = PRESET_ANCHOR_MAP[normalizedPreset] || []

    if (allowedZones.length === 0) {
        // Preset not found in map → fallback
        console.warn(`ANCHOR ZONE RESOLVER: Unknown preset '${preset}', falling back to studio_gradient`)
        return {
            isValid: false,
            resolvedAnchorZone: inputPose === 'sitting' ? 'center_sit' : 'center_stand',
            fallbackUsed: true,
            fallbackPreset: 'studio_gradient',
            reason: `Unknown preset '${preset}'`,
        }
    }

    // Check if suggested anchor zone is in allowed list
    const normalizedAnchor = suggestedAnchorZone.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
    const isInPresetList = allowedZones.includes(normalizedAnchor)

    // Check if anchor zone is compatible with pose
    const poseCompatibleSuffixes = POSE_ANCHOR_COMPATIBILITY[inputPose] || []
    const isPoseCompatible = poseCompatibleSuffixes.some((suffix) =>
        normalizedAnchor.includes(suffix)
    )

    if (isInPresetList && isPoseCompatible) {
        // Valid anchor zone
        return {
            isValid: true,
            resolvedAnchorZone: normalizedAnchor,
            fallbackUsed: false,
            fallbackPreset: null,
            reason: null,
        }
    }

    // Try to find a compatible anchor zone within the preset
    const compatibleZone = allowedZones.find((zone) =>
        poseCompatibleSuffixes.some((suffix) => zone.includes(suffix))
    )

    if (compatibleZone) {
        // Found a compatible zone in the preset
        console.log(`ANCHOR ZONE RESOLVER: Resolved '${suggestedAnchorZone}' → '${compatibleZone}'`)
        return {
            isValid: true,
            resolvedAnchorZone: compatibleZone,
            fallbackUsed: false,
            fallbackPreset: null,
            reason: `Auto-resolved from '${suggestedAnchorZone}' to '${compatibleZone}'`,
        }
    }

    // No compatible zone in preset → fallback to studio
    console.warn(
        `ANCHOR ZONE RESOLVER: No compatible zone for preset '${preset}' with pose '${inputPose}', falling back`
    )
    return {
        isValid: false,
        resolvedAnchorZone: inputPose === 'sitting' ? 'center_sit' : 'center_stand',
        fallbackUsed: true,
        fallbackPreset: 'studio_gradient',
        reason: `No compatible anchor zone for '${inputPose}' in preset '${preset}'`,
    }
}

/**
 * Get a safe preset prompt text for a given preset key.
 * 
 * Uses the ACTUAL scene description from the preset registry.
 * Falls back to neutral studio if preset not found.
 */
export function getPresetPromptText(presetKey: string): string {
    // Normalize the key
    const normalizedKey = presetKey.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')

    // Try to get from the preset registry first
    const preset = getPresetById(normalizedKey)
    if (preset?.scene) {
        // Use the ACTUAL scene description from the preset
        console.log(`PRESET PROMPT: Using scene from registry for '${normalizedKey}'`)
        return preset.scene
    }

    // Legacy fallback map for presets not in registry
    const LEGACY_PROMPT_MAP: Record<string, string> = {
        minimal_living_room:
            'Modern living room, beige sofa, white walls, warm wood floor, soft diffused daylight.',
        sunny_bedroom:
            'Bright bedroom interior, white linens, large window, soft morning sunlight, airy atmosphere.',
        modern_kitchen:
            'Contemporary kitchen island, marble countertops, sleek cabinets, bright interior lighting.',
        cozy_loft:
            'Industrial loft interior, exposed brick wall, large windows, warm wooden floor, ambient light.',
        coffee_shop:
            'Cozy cafe interior, warm lighting, wooden textures, blurred background shelves, coffee shop atmosphere.',
        art_gallery:
            'Modern art gallery space, white walls, concrete floor, soft track lighting, spacious interior.',
        hotel_lobby:
            'Upscale hotel lounge, textured walls, warm ambient lighting, plush seating area in background.',
        rooftop_terrace:
            'Outdoor rooftop terrace, evening city skyline in background, string lights, urban atmosphere.',
        city_street:
            'Blurred urban street background, modern city architecture, daylight, sidewalk texture.',
        garden_path: 'Lush green garden, stone pathway, trees in background, dappled sunlight, nature scene.',
        beach_sunset:
            'Sandy beach at golden hour, ocean horizon in background, warm sunset light, soft clouds.',
        park_bench: 'Green public park, trees in background, soft grass, open shade, natural daylight.',
        abstract_gradient:
            'Soft abstract color gradient background, smooth transition, neutral tones, studio lighting.',
        concrete_wall:
            'Textured grey concrete wall background, industrial minimalist style, soft shadows.',
        white_cyclorama: 'Pure white infinite studio background, clean high-key lighting, no shadows.',
        warm_plaster: 'Textured beige plaster wall, warm neutral tones, soft ambient lighting.',
        studio_gradient:
            'Soft abstract color gradient background, smooth transition, neutral tones, studio lighting.',
    }

    if (LEGACY_PROMPT_MAP[normalizedKey]) {
        console.log(`PRESET PROMPT: Using legacy map for '${normalizedKey}'`)
        return LEGACY_PROMPT_MAP[normalizedKey]
    }

    // Ultimate fallback
    console.warn(`PRESET PROMPT: No scene found for '${normalizedKey}', using neutral studio`)
    return 'Soft abstract color gradient background, smooth transition, neutral tones, studio lighting.'
}

