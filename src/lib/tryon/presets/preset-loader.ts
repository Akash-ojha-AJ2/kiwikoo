/**
 * SCENE PRESET LOADER
 * 
 * Loads JSON presets and converts them to prompt-ready format.
 * Maintains backward compatibility with existing ScenePreset interface.
 */

import scenePresetsData from './scene_presets.json'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CameraConfig {
    type: 'smartphone' | 'mirrorless' | 'handheld' | 'phone'
    focal_length_mm?: number
    sensor_noise?: 'light' | 'medium' | 'heavy'
    depth_of_field?: 'shallow' | 'medium' | 'deep'
    lens_distortion?: 'none' | 'subtle_edge_warp' | 'barrel'
    motion_blur?: 'none' | 'micro' | 'visible'
    shutter?: string
    tripod?: boolean
    eye_level?: boolean
    post_processing?: 'none' | 'minimal' | 'moderate'
    grain?: 'none' | 'subtle' | 'visible'
}

export interface LightingConfig {
    source?: 'window' | 'sun' | 'artificial' | 'mixed'
    quality?: 'directional' | 'diffused' | 'harsh'
    temperature_kelvin?: number
    falloff?: 'realistic' | 'soft' | 'sharp'
    sun_position?: 'overhead' | 'angled' | 'low'
    bounce?: 'none' | 'ground_reflection' | 'wall_fill'
    harshness?: 'soft' | 'moderate' | 'harsh'
    mix?: string[]
    contrast?: 'low' | 'medium' | 'high'
    time?: 'morning' | 'midday' | 'golden_hour' | 'blue_hour'
    direction?: 'front' | 'side' | 'back'
    softness?: 'low' | 'medium' | 'high'
}

export interface BackgroundDensity {
    objects: string[]
    people?: 'none' | 'distant_only' | 'background_blur_optional' | 'soft_blur_only' | 'out_of_focus_background'
    imperfections?: string[]
}

export interface Constraints {
    face_identity: 'LOCK'
    body_proportions: 'LOCK'
    garment_geometry: 'LOCK'
    pose_change?: 'allowed' | 'forbidden'
    face_change?: 'allowed' | 'forbidden'
}

export interface ScenePresetJSON {
    id: string
    name: string
    description: string
    camera?: CameraConfig
    lighting?: LightingConfig
    constraints: Constraints
    background_density: BackgroundDensity
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET DATA
// ═══════════════════════════════════════════════════════════════════════════════

const SCENE_PRESETS: Record<string, ScenePresetJSON> = scenePresetsData as Record<string, ScenePresetJSON>

// ═══════════════════════════════════════════════════════════════════════════════
// LOADER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get a scene preset by ID
 */
export function getScenePreset(id: string): ScenePresetJSON | undefined {
    return SCENE_PRESETS[id]
}

/**
 * Get all scene preset IDs
 */
export function getScenePresetIds(): string[] {
    return Object.keys(SCENE_PRESETS)
}

/**
 * Get all scene presets
 */
export function getAllScenePresets(): ScenePresetJSON[] {
    return Object.values(SCENE_PRESETS)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a JSON-structured prompt section from a scene preset
 * Uses structured JSON for stricter constraint parsing and face fidelity.
 */
export function buildScenePresetPrompt(presetId: string): string {
    const preset = getScenePreset(presetId)
    if (!preset) return ''

    const prompt = {
        // CRITICAL PRIORITY - THIS IS THE MOST IMPORTANT RULE FOR ALL PRESETS
        CRITICAL_PRIORITY: {
            rule: "FACE MUST BE EXACTLY THE SAME AS INPUT IMAGE",
            explanation: "The person in the output MUST be recognizable as the EXACT same person from the input image. NOT similar. NOT a lookalike. THE SAME PERSON.",
            warning: "If friend looks at output and says 'that doesn't look like you', YOU HAVE FAILED.",
            enforcement: "Face will be pixel-overwritten after generation. Your face output is TEMPORARY and will be DISCARDED.",
            applies_to: "ALL PRESETS - NO EXCEPTIONS"
        },

        scene_preset: {
            id: preset.id,
            name: preset.name,
            description: preset.description
        },

        camera: preset.camera ? {
            type: preset.camera.type,
            focal_length_mm: preset.camera.focal_length_mm,
            sensor_noise: preset.camera.sensor_noise,
            depth_of_field: preset.camera.depth_of_field,
            lens_distortion: preset.camera.lens_distortion,
            motion_blur: preset.camera.motion_blur,
            shutter: preset.camera.shutter,
            tripod: preset.camera.tripod,
            eye_level: preset.camera.eye_level,
            grain: preset.camera.grain
        } : null,

        lighting: preset.lighting ? {
            source: preset.lighting.source,
            quality: preset.lighting.quality,
            temperature_kelvin: preset.lighting.temperature_kelvin,
            falloff: preset.lighting.falloff,
            sun_position: preset.lighting.sun_position,
            bounce: preset.lighting.bounce,
            harshness: preset.lighting.harshness,
            mix: preset.lighting.mix,
            contrast: preset.lighting.contrast,
            time: preset.lighting.time,
            direction: preset.lighting.direction,
            softness: preset.lighting.softness
        } : null,

        background: {
            objects: preset.background_density.objects,
            people: preset.background_density.people,
            imperfections: preset.background_density.imperfections
        },

        face_rules: {
            status: "IMMUTABLE",
            reconstruction_allowed: false,
            same_person_rule: {
                enabled: true,
                description: "This is the SAME PERSON as the input image. NOT a model. NOT a lookalike. The EXACT same individual."
            },

            preserve_exactly: [
                "eye_shape_spacing_size",
                "nose_shape_bridge_nostrils",
                "mouth_width_lip_shape",
                "jawline_contour_chin_shape",
                "cheek_volume_cheekbone_position",
                "skin_tone_texture_blemishes",
                "all_facial_asymmetries"
            ],

            forbidden_operations: [
                "generate_new_facial_features",
                "smooth_or_beautify_skin",
                "correct_facial_asymmetries",
                "round_sharp_jawlines",
                "slim_or_reshape_cheeks",
                "change_eye_spacing_or_shape",
                "alter_nose_proportions",
                "modify_mouth_or_lip_shape",
                "reconstruct_facial_geometry"
            ],

            jawline: {
                sharp_input: "SHARP_OUTPUT",
                angular_input: "ANGULAR_OUTPUT",
                defined_cheekbones: "DEFINED_CHEEKBONES",
                rounding: "FORBIDDEN",
                softening: "FORBIDDEN",
                improvement: "FORBIDDEN"
            },

            skull_geometry: {
                face_shape: "IMMUTABLE",
                jawline_angle: "PRESERVE_EXACTLY",
                forehead_height_width: "PRESERVE_EXACTLY",
                invent_proportions: "FORBIDDEN"
            },

            pixel_copy_notice: "The face region will be REPLACED by pixel copy. Your generated face will be DISCARDED."
        },

        body_rules: {
            proportions: "LOCKED",
            slimming: "FORBIDDEN",
            reshaping: "FORBIDDEN",
            beautification: "FORBIDDEN",
            message: "Garment adapts to body, NOT body to garment"
        },

        identity_check: {
            if_face_looks_better: "WRONG",
            if_face_looks_cleaner: "WRONG",
            if_jawline_rounder: "WRONG",
            if_cheeks_fuller: "WRONG",
            if_friend_cannot_recognize: "FAILED"
        },

        pose_change: preset.constraints.pose_change === 'allowed' ? "ALLOWED_WITH_LOCKED_PROPORTIONS" : "FORBIDDEN",
        face_change: preset.constraints.face_change === 'forbidden' ? "ABSOLUTELY_FORBIDDEN" : "FORBIDDEN"
    }

    return JSON.stringify(prompt, null, 2)
}

/**
 * Validate that a preset ID exists
 */
export function isValidScenePreset(id: string): boolean {
    return id in SCENE_PRESETS
}

console.log(`🎬 Loaded ${Object.keys(SCENE_PRESETS).length} scene presets`)
