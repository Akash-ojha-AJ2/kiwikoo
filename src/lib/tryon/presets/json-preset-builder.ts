/**
 * UNIFIED PRESET PROMPT BUILDER (JSON-STRUCTURED)
 * 
 * Converts all preset types into JSON-formatted prompts with
 * strict anti-hallucination constraints for face, body, and scene.
 * 
 * ALL PROMPTS MUST:
 * 1. Use JSON structure for machine parsing
 * 2. Include face_rules with IMMUTABLE status
 * 3. Include body_rules with IMMUTABLE status
 * 4. Include garment_fit rules
 * 5. Include identity_check rules
 */

import 'server-only'

// Import preset types
import { type ComprehensivePreset, DIVERSE_PRESETS } from './diverse-presets'
import { ALL_REAL_WORLD_PRESETS, type RealWorldPreset } from '../real-world-presets'

// ═══════════════════════════════════════════════════════════════════════════════
// CORE JSON PROMPT STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export interface JsonPrompt {
    task: {
        type: string
        mode: string
        action: string
    }

    scene: {
        preset_id: string
        preset_name: string
        location: string
        background: string
        lighting: string
    }

    face_rules: {
        status: string
        reconstruction_allowed: boolean
        same_person_rule: {
            enabled: boolean
            description: string
        }
        preserve_exactly: string[]
        forbidden_operations: string[]
        jawline: {
            sharp_input: string
            angular_input: string
            rounding: string
            softening: string
        }
        pixel_copy_notice: string
    }

    body_rules: {
        status: string
        same_body_rule: {
            enabled: boolean
            description: string
        }
        proportions: {
            shoulder_width: string
            torso_shape: string
            hip_width: string
            body_type: string
            weight: string
        }
        forbidden_operations: string[]
        body_check: {
            if_body_looks_slimmer: string
            if_body_looks_fuller: string
            if_proportions_changed: string
            if_looks_like_model: string
        }
    }

    garment_fit: {
        rule: string
        body_adapts_to_garment: boolean
        expectations: {
            tight_garment: string
            loose_garment: string
            structured_garment: string
        }
        forbidden_fit: string[]
    }

    camera?: {
        type: string
        style: string
        lighting: string
    }

    identity_verification: {
        if_face_looks_better: string
        if_jawline_rounder: string
        if_cheeks_fuller: string
        if_skin_smoother: string
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-HALLUCINATION RULES (SHARED ACROSS ALL PRESETS)
// ═══════════════════════════════════════════════════════════════════════════════

const FACE_RULES = {
    status: "IMMUTABLE",
    reconstruction_allowed: false,

    same_person_rule: {
        enabled: true,
        description: "This is the SAME PERSON as Image 1. NOT a model. NOT a lookalike. The EXACT same individual."
    },

    preserve_exactly: [
        "eye_shape_spacing_size",
        "nose_shape_bridge_nostrils",
        "mouth_width_lip_shape",
        "jawline_contour_chin_shape",
        "cheek_volume_cheekbone_position",
        "skin_tone_texture_blemishes",
        "all_facial_asymmetries",
        "glasses_if_present"
    ],

    forbidden_operations: [
        "face_reconstruction",
        "face_generation",
        "jawline_rounding",
        "face_shape_alteration",
        "facial_enhancement",
        "skin_smoothing",
        "symmetry_correction",
        "beautification",
        "expression_change",
        "eye_enlargement",
        "nose_reshaping",
        "lip_modification"
    ],

    jawline: {
        sharp_input: "SHARP_OUTPUT",
        angular_input: "ANGULAR_OUTPUT",
        rounding: "FORBIDDEN",
        softening: "FORBIDDEN"
    },

    pixel_copy_notice: "The face region will be REPLACED by pixel copy. Your generated face will be DISCARDED. Generate a placeholder only."
}

const BODY_RULES = {
    status: "IMMUTABLE",

    same_body_rule: {
        enabled: true,
        description: "This is the SAME BODY as Image 1. Same weight, same proportions, same shape."
    },

    proportions: {
        shoulder_width: "PRESERVE_EXACTLY",
        torso_shape: "PRESERVE_EXACTLY",
        hip_width: "PRESERVE_EXACTLY",
        body_type: "PRESERVE_EXACTLY",
        weight: "PRESERVE_EXACTLY"
    },

    forbidden_operations: [
        "slimming_body",
        "widening_body",
        "reshaping_torso",
        "altering_proportions",
        "changing_posture",
        "beautifying_figure",
        "model_like_transformation",
        "height_change",
        "limb_lengthening"
    ],

    body_check: {
        if_body_looks_slimmer: "WRONG",
        if_body_looks_fuller: "WRONG",
        if_proportions_changed: "WRONG",
        if_looks_like_model: "WRONG"
    }
}

const GARMENT_FIT_RULES = {
    rule: "GARMENT_ADAPTS_TO_BODY",
    body_adapts_to_garment: false,

    expectations: {
        tight_garment: "Shows actual body curves underneath",
        loose_garment: "Drapes over actual body shape",
        structured_garment: "Follows actual shoulder and hip lines"
    },

    forbidden_fit: [
        "idealized_fit",
        "flattering_drape",
        "slimming_effect",
        "body_shaping",
        "model_fit"
    ]
}

const IDENTITY_VERIFICATION = {
    if_face_looks_better: "WRONG",
    if_jawline_rounder: "WRONG",
    if_cheeks_fuller: "WRONG",
    if_skin_smoother: "WRONG"
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE PRESET TO JSON PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert a ComprehensivePreset to JSON-structured prompt
 */
export function comprehensivePresetToJson(preset: ComprehensivePreset): string {
    const prompt: JsonPrompt = {
        task: {
            type: "VIRTUAL_TRY_ON",
            mode: "IDENTITY_LOCKED",
            action: "Apply clothing from Image 2 onto person in Image 1"
        },

        scene: {
            preset_id: preset.id,
            preset_name: preset.label,
            location: preset.scene.location,
            background: preset.scene.background,
            lighting: `${preset.lighting.source}, ${preset.lighting.quality} quality, ${preset.lighting.temperatureLabel} (${preset.lighting.temperature}K)`
        },

        face_rules: FACE_RULES,
        body_rules: BODY_RULES,
        garment_fit: GARMENT_FIT_RULES,

        camera: {
            type: "match_input_style",
            style: "candid_photo",
            lighting: preset.lighting.quality
        },

        identity_verification: IDENTITY_VERIFICATION
    }

    return JSON.stringify(prompt, null, 2)
}

/**
 * Convert a RealWorldPreset to JSON-structured prompt
 */
export function realWorldPresetToJson(preset: RealWorldPreset): string {
    const prompt = {
        task: {
            type: "VIRTUAL_TRY_ON",
            mode: "IDENTITY_LOCKED",
            action: "Apply clothing from Image 2 onto person in Image 1"
        },

        scene: {
            preset_id: preset.preset_id,
            preset_name: preset.category,
            location: preset.environment.location,
            background: preset.environment.background_elements.join(', '),
            lighting: `${preset.lighting.type}, ${preset.lighting.direction}, ${preset.lighting.quality}, ${preset.lighting.color_temp}`
        },

        face_rules: FACE_RULES,
        body_rules: BODY_RULES,
        garment_fit: GARMENT_FIT_RULES,

        camera: {
            type: preset.camera.sensor_style,
            lens: `${preset.camera.lens_mm}mm ${preset.camera.aperture}`,
            angle: preset.camera.angle,
            distance: preset.camera.distance
        },

        pose: {
            body_motion: preset.pose_intent.body_motion,
            head_position: preset.pose_intent.head_position,
            expression: preset.pose_intent.expression_bias
        },

        identity_verification: IDENTITY_VERIFICATION
    }

    return JSON.stringify(prompt, null, 2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED PRESET LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get JSON prompt for any preset ID
 */
export function getJsonPromptForPreset(presetId: string): string | null {
    // Check comprehensive presets
    const comprehensivePreset = DIVERSE_PRESETS.find(p => p.id === presetId)
    if (comprehensivePreset) {
        return comprehensivePresetToJson(comprehensivePreset)
    }

    // Check real-world presets
    const realWorldPreset = ALL_REAL_WORLD_PRESETS.find(p => p.preset_id === presetId)
    if (realWorldPreset) {
        return realWorldPresetToJson(realWorldPreset)
    }

    // Return default anti-hallucination prompt if preset not found
    console.warn(`⚠️ Preset "${presetId}" not found, using default constraints`)
    return getDefaultAntiHallucinationPrompt()
}

/**
 * Get default anti-hallucination prompt (no scene styling)
 */
export function getDefaultAntiHallucinationPrompt(): string {
    const prompt = {
        task: {
            type: "VIRTUAL_TRY_ON",
            mode: "IDENTITY_LOCKED",
            action: "Apply clothing from Image 2 onto person in Image 1"
        },

        scene: {
            preset_id: "default",
            preset_name: "Default Try-On",
            location: "PRESERVE_FROM_INPUT",
            background: "PRESERVE_FROM_INPUT",
            lighting: "PRESERVE_FROM_INPUT"
        },

        face_rules: FACE_RULES,
        body_rules: BODY_RULES,
        garment_fit: GARMENT_FIT_RULES,
        identity_verification: IDENTITY_VERIFICATION,

        critical_note: "PRESERVE input image background, lighting, and scene. Only change the garment."
    }

    return JSON.stringify(prompt, null, 2)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logJsonPresetStatus(presetId: string): void {
    console.log('\n📋 JSON PRESET PROMPT')
    console.log('   ═══════════════════════════════════════════════')
    console.log(`   Preset ID: ${presetId}`)
    console.log('   Format: JSON-structured')
    console.log('   Face status: IMMUTABLE')
    console.log('   Body status: IMMUTABLE')
    console.log('   Garment fit: ADAPTS_TO_BODY')
    console.log('   ═══════════════════════════════════════════════')
}

// Export all preset lists
console.log(`📸 JSON Preset Builder loaded:`)
console.log(`   - ${DIVERSE_PRESETS.length} comprehensive presets`)
console.log(`   - ${ALL_REAL_WORLD_PRESETS.length} real-world presets`)

