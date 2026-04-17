export const PRESET_ANCHOR_MAP: Record<string, string[]> = {
    // Living Room / Indoor
    minimal_living_room: ['sofa_behind', 'wall_lean', 'floor_stand', 'sofa_edge', 'floor_sit'],
    modern_bedroom: ['bed_edge', 'floor_stand', 'mirror_reflection'],
    luxury_lobby: ['pillar_lean', 'center_stand', 'chair_sit'],

    // Urban / City
    city_street: ['sidewalk_edge', 'footpath_bench', 'wall_lean', 'sidewalk_center', 'crosswalk'],
    coffee_shop: ['table_seat', 'counter_stool', 'window_lean'],
    rooftop_bar: ['railing_lean', 'bar_stool', 'lounge_chair'],

    // Nature
    beach_sunset: ['sand_stand', 'rock_sit', 'water_edge'],
    garden_path: ['path_center', 'bench_sit', 'tree_lean'],

    // Studio / Abstract (Universal)
    studio_gradient: ['center_stand', 'center_sit', 'stool_sit'],
    studio_solid: ['center_stand', 'center_sit'],
    abstract_neon: ['center_stand']
}

export type PoseType =
    | 'standing_straight'
    | 'standing_casual'
    | 'hands_on_hips'
    | 'arms_crossed'
    | 'arms_raised'
    | 'sitting'
    | 'walking'
    | 'other'
    | 'standing' // Generic for backward compatibility
    | 'leaning'  // Generic

export interface AnchorZoneResolution {
    valid: boolean
    resolvedAnchorZone: string
    fallbackUsed: boolean
    fallbackPreset?: string
    reason?: string
}

export function resolveAnchorZone(
    preset: string,
    suggestedAnchorZone: string,
    inputPose: string
): AnchorZoneResolution {
    // Normalize pose string to broader categories if needed
    const isSitting = inputPose.includes('sitting')
    const isStanding = inputPose.includes('standing') || inputPose.includes('walking')

    // 1. Check if preset exists in map
    const allowedZones = PRESET_ANCHOR_MAP[preset]

    if (!allowedZones) {
        // If unknown preset, assume valid (or strict fallback?)
        // Let's be safe and fallback if it's completely unknown
        return {
            valid: false,
            resolvedAnchorZone: isSitting ? 'center_sit' : 'center_stand',
            fallbackUsed: true,
            fallbackPreset: 'studio_gradient',
            reason: `Unknown preset: ${preset}`
        }
    }

    // 2. Validate suggested zone against preset
    if (allowedZones.includes(suggestedAnchorZone)) {
        // 3. Double check pose compatibility with zone name
        // (Simple heuristic: if zone says 'sit' but pose is 'stand', that's a mismatch)

        if (suggestedAnchorZone.includes('sit') && !isSitting) {
            return {
                valid: false,
                resolvedAnchorZone: 'center_stand',
                fallbackUsed: true,
                fallbackPreset: 'studio_gradient',
                reason: `Pose mismatch: Standing person cannot use ${suggestedAnchorZone}`
            }
        }

        if (suggestedAnchorZone.includes('stand') && isSitting) {
            return {
                valid: false,
                resolvedAnchorZone: 'center_sit',
                fallbackUsed: true,
                fallbackPreset: 'studio_gradient',
                reason: `Pose mismatch: Sitting person cannot use ${suggestedAnchorZone}`
            }
        }

        return {
            valid: true,
            resolvedAnchorZone: suggestedAnchorZone,
            fallbackUsed: false
        }
    }

    // 4. Fallback if suggested zone is invalid for this preset
    return {
        valid: false,
        resolvedAnchorZone: isSitting ? 'center_sit' : 'center_stand',
        fallbackUsed: true,
        fallbackPreset: 'studio_gradient',
        reason: `Invalid anchor zone '${suggestedAnchorZone}' for preset '${preset}'`
    }
}
