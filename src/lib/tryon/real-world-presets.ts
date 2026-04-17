/**
 * REAL-WORLD PRESETS - PHOTOGRAPHIC BELIEVABILITY
 * 
 * CRITICAL: Goal is believability, NOT beauty or stylization
 * These presets enforce natural, candid, phone-camera aesthetics
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// PRESET TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type PresetCategory = 'SELFIE' | 'STANDING' | 'WALK' | 'INDOOR' | 'OUTDOOR' | 'CAFE' | 'BALCONY' | 'SOCIAL'
export type LightingType = 'natural' | 'mixed' | 'indoor'
export type LightingDirection = 'front' | 'side' | 'back'
export type LightingQuality = 'soft' | 'diffused' | 'contrast' | 'soft contrast'
export type ColorTemp = 'warm' | 'neutral' | 'cool'
export type SensorStyle = 'phone' | 'mirrorless' | 'DSLR'

export interface RealWorldPreset {
    preset_id: string
    category: PresetCategory
    environment: {
        location: string
        background_elements: string[]
        depth_layers: {
            foreground: string
            midground: string
            background: string
        }
    }
    camera: {
        lens_mm: number
        aperture: string
        angle: string
        distance: string
        sensor_style: SensorStyle
    }
    lighting: {
        type: LightingType
        direction: LightingDirection
        quality: LightingQuality
        color_temp: ColorTemp
    }
    pose_intent: {
        body_motion: string
        head_position: string
        expression_bias: string
    }
    constraints: {
        face_editing: 'FORBIDDEN'
        body_shape_change: 'FORBIDDEN'
        garment_geometry_change: 'FORBIDDEN'
        ai_polish: 'DISALLOWED'
    }
}

// ═══════════════════════════════════════════════════════════════
// ABSOLUTE IMMUTABLE CONSTRAINTS (APPLIES TO ALL PRESETS)
// ═══════════════════════════════════════════════════════════════

export const ABSOLUTE_CONSTRAINTS = `
════════════════════════════════════════════════════════════════
⚠️  ABSOLUTE IMMUTABLE CONSTRAINTS (READ-ONLY IDENTITY)
════════════════════════════════════════════════════════════════

FACE (READ-ONLY):
✗ DO NOT regenerate facial structure
✗ DO NOT slim, widen, beautify, feminize, masculinize, or stylize
✗ DO NOT change face-to-body proportion
✓ Eye size, nose width, jawline, cheek fullness MUST MATCH EXACTLY

BODY (INFERRED FROM USER PHOTO ONLY):
✗ IGNORE body proportions in garment reference
✗ DO NOT slim, stretch, or resize body to fit clothing
✓ Clothing MUST adapt to body, NOT body to clothing

GARMENT (EXACT VISUAL COPY):
✓ Color, pattern, fabric texture copied EXACTLY
✓ LENGTH visually inferred (not text inferred)
✓ SHORT kurta → ends at HIP
✓ LONG kurta → ends at KNEE or BELOW

════════════════════════════════════════════════════════════════
GARMENT EXTRACTION (MANDATORY):
════════════════════════════════════════════════════════════════

If garment reference contains human body:
1. FIRST extract clothing ONLY (no human anatomy)
2. Produce clean garment-only image
3. Use extracted garment for try-on
4. NEVER use original garment-with-body image directly

════════════════════════════════════════════════════════════════
PHOTOGRAPHY REALISM:
════════════════════════════════════════════════════════════════

✓ Lighting follows real-world physics
✓ Shadows align with light direction
✗ NO unnatural skin glow
✗ AVOID pastel, creamy, AI-smooth tones
✓ Texture shows fabric grain, wrinkles, weight, gravity
✗ AVOID symmetrical, mannequin-like poses

════════════════════════════════════════════════════════════════
FINAL GOAL:
════════════════════════════════════════════════════════════════

Output should look like:
✓ "A real person took this photo casually on their phone or camera"

NOT:
✗ "A perfect AI-generated fashion image"
`.trim()

// ═══════════════════════════════════════════════════════════════
// SELFIE PRESETS (PHONE CAMERA AESTHETICS)
// ═══════════════════════════════════════════════════════════════

export const SELFIE_PRESETS: RealWorldPreset[] = [
    {
        preset_id: 'mirror_casual_selfie',
        category: 'SELFIE',
        environment: {
            location: 'Wardrobe mirror corner',
            background_elements: ['open wardrobe', 'hanging clothes', 'soft wall'],
            depth_layers: {
                foreground: 'phone partially visible',
                midground: 'subject reflection',
                background: 'wardrobe blur'
            }
        },
        camera: {
            lens_mm: 26,
            aperture: 'f/1.8',
            angle: 'slightly tilted',
            distance: 'arm length',
            sensor_style: 'phone'
        },
        lighting: {
            type: 'indoor',
            direction: 'side',
            quality: 'soft',
            color_temp: 'warm'
        },
        pose_intent: {
            body_motion: 'relaxed',
            head_position: 'slight tilt',
            expression_bias: 'natural smile'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    },
    {
        preset_id: 'bathroom_mirror_selfie',
        category: 'SELFIE',
        environment: {
            location: 'Bathroom mirror',
            background_elements: ['mirror edge', 'bathroom tiles', 'soft lighting'],
            depth_layers: {
                foreground: 'phone in hand',
                midground: 'full body reflection',
                background: 'bathroom blur'
            }
        },
        camera: {
            lens_mm: 26,
            aperture: 'f/2.0',
            angle: 'straight on',
            distance: '1.2 meters',
            sensor_style: 'phone'
        },
        lighting: {
            type: 'indoor',
            direction: 'front',
            quality: 'diffused',
            color_temp: 'neutral'
        },
        pose_intent: {
            body_motion: 'standing casual',
            head_position: 'looking at phone',
            expression_bias: 'checking outfit'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    }
]

// ═══════════════════════════════════════════════════════════════
// STANDING / WALK PRESETS (CANDID OUTDOOR)
// ═══════════════════════════════════════════════════════════════

export const STANDING_WALK_PRESETS: RealWorldPreset[] = [
    {
        preset_id: 'street_relaxed_standing',
        category: 'STANDING',
        environment: {
            location: 'Sidewalk wall',
            background_elements: ['building texture', 'soft city blur'],
            depth_layers: {
                foreground: 'empty pavement',
                midground: 'subject full body',
                background: 'urban blur'
            }
        },
        camera: {
            lens_mm: 35,
            aperture: 'f/2.8',
            angle: 'eye level',
            distance: '2.5 meters',
            sensor_style: 'mirrorless'
        },
        lighting: {
            type: 'natural',
            direction: 'side',
            quality: 'diffused',
            color_temp: 'neutral'
        },
        pose_intent: {
            body_motion: 'one-leg lean',
            head_position: 'looking away',
            expression_bias: 'neutral candid'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    },
    {
        preset_id: 'casual_walk_moment',
        category: 'WALK',
        environment: {
            location: 'Park pathway',
            background_elements: ['trees', 'pathway', 'natural bokeh'],
            depth_layers: {
                foreground: 'path texture',
                midground: 'subject mid-stride',
                background: 'greenery blur'
            }
        },
        camera: {
            lens_mm: 50,
            aperture: 'f/2.0',
            angle: 'slightly below eye',
            distance: '3 meters',
            sensor_style: 'mirrorless'
        },
        lighting: {
            type: 'natural',
            direction: 'side',
            quality: 'soft',
            color_temp: 'warm'
        },
        pose_intent: {
            body_motion: 'natural walk stride',
            head_position: 'looking ahead',
            expression_bias: 'off-guard natural'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    }
]

// ═══════════════════════════════════════════════════════════════
// CAFE / LIFESTYLE PRESETS (EVERYDAY CANDID)
// ═══════════════════════════════════════════════════════════════

export const CAFE_LIFESTYLE_PRESETS: RealWorldPreset[] = [
    {
        preset_id: 'cafe_window_lifestyle',
        category: 'CAFE',
        environment: {
            location: 'Cafe window seating',
            background_elements: ['wood table', 'coffee cup', 'people blur'],
            depth_layers: {
                foreground: 'table edge',
                midground: 'subject seated',
                background: 'window light + cafe interior'
            }
        },
        camera: {
            lens_mm: 50,
            aperture: 'f/2.0',
            angle: 'slightly below eye',
            distance: '1.8 meters',
            sensor_style: 'DSLR'
        },
        lighting: {
            type: 'mixed',
            direction: 'side',
            quality: 'soft contrast',
            color_temp: 'warm'
        },
        pose_intent: {
            body_motion: 'seated casual',
            head_position: 'half profile',
            expression_bias: 'off-guard candid'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    },
    {
        preset_id: 'balcony_reading_moment',
        category: 'BALCONY',
        environment: {
            location: 'Home balcony',
            background_elements: ['railing', 'plants', 'skyline'],
            depth_layers: {
                foreground: 'balcony floor',
                midground: 'subject on chair',
                background: 'city/nature view'
            }
        },
        camera: {
            lens_mm: 35,
            aperture: 'f/2.8',
            angle: 'eye level',
            distance: '2 meters',
            sensor_style: 'mirrorless'
        },
        lighting: {
            type: 'natural',
            direction: 'front',
            quality: 'soft',
            color_temp: 'neutral'
        },
        pose_intent: {
            body_motion: 'relaxed seated',
            head_position: 'looking at book/phone',
            expression_bias: 'absorbed casual'
        },
        constraints: {
            face_editing: 'FORBIDDEN',
            body_shape_change: 'FORBIDDEN',
            garment_geometry_change: 'FORBIDDEN',
            ai_polish: 'DISALLOWED'
        }
    }
]

// ═══════════════════════════════════════════════════════════════
// ALL PRESETS COMBINED
// ═══════════════════════════════════════════════════════════════

export const ALL_REAL_WORLD_PRESETS: RealWorldPreset[] = [
    ...SELFIE_PRESETS,
    ...STANDING_WALK_PRESETS,
    ...CAFE_LIFESTYLE_PRESETS
]

// ═══════════════════════════════════════════════════════════════
// PRESET LOOKUP
// ═══════════════════════════════════════════════════════════════

export function getRealWorldPreset(presetId: string): RealWorldPreset | null {
    return ALL_REAL_WORLD_PRESETS.find(p => p.preset_id === presetId) || null
}

// ═══════════════════════════════════════════════════════════════
// PRESET TO PROMPT CONVERTER
// ═══════════════════════════════════════════════════════════════

export function buildPresetPrompt(preset: RealWorldPreset): string {
    return `
════════════════════════════════════════════════════════════════
📸 SCENE PRESET: ${preset.preset_id.toUpperCase()}
════════════════════════════════════════════════════════════════

Category: ${preset.category}

ENVIRONMENT:
Location: ${preset.environment.location}
Background Elements: ${preset.environment.background_elements.join(', ')}

Depth Composition:
- Foreground: ${preset.environment.depth_layers.foreground}
- Midground: ${preset.environment.depth_layers.midground}
- Background: ${preset.environment.depth_layers.background}

CAMERA SETUP:
Lens: ${preset.camera.lens_mm}mm (${preset.camera.sensor_style} sensor)
Aperture: ${preset.camera.aperture}
Angle: ${preset.camera.angle}
Distance: ${preset.camera.distance}

LIGHTING:
Type: ${preset.lighting.type}
Direction: ${preset.lighting.direction}
Quality: ${preset.lighting.quality}
Color Temperature: ${preset.lighting.color_temp}

POSE & EXPRESSION:
Body Motion: ${preset.pose_intent.body_motion}
Head Position: ${preset.pose_intent.head_position}
Expression: ${preset.pose_intent.expression_bias}

════════════════════════════════════════════════════════════════
REALISM REQUIREMENTS:
════════════════════════════════════════════════════════════════

✓ This should look like a REAL CASUAL PHOTO
✓ Small imperfections are GOOD (slightly tilted, off-center, candid)
✗ NO perfect AI polish
✗ NO fashion model perfection
✗ NO studio symmetry

Background must be ALIVE with real objects and depth.
Pose must feel CANDID and natural, not posed.
Lighting must follow REAL PHYSICS (shadows, fall-off, direction).
`.trim()
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND BELIEVABILITY RULES
// ═══════════════════════════════════════════════════════════════

export const BACKGROUND_BELIEVABILITY = `
════════════════════════════════════════════════════════════════
🏠 BACKGROUND BELIEVABILITY (MANDATORY)
════════════════════════════════════════════════════════════════

Background MUST have REAL objects:
✓ Tables, chairs, walls, windows, plants, books, decor
✓ Foreground / midground / background SEPARATION
✓ Lived-in, imperfect, human feel

✗ FORBIDDEN:
- Empty, flat, AI studio backgrounds
- Solid color walls with no texture
- Perfect blur with no recognizable objects
- Symmetric, sterile spaces

✓ REQUIRED:
- At least 3-5 identifiable objects in background
- Natural imperfections (slight mess, realistic clutter)
- Depth layers (things in front, middle, back)
- Realistic perspective and scale
`.trim()

// ═══════════════════════════════════════════════════════════════
// POSE NATURALISM RULES
// ═══════════════════════════════════════════════════════════════

export const POSE_NATURALISM = `
════════════════════════════════════════════════════════════════
🤸 POSE NATURALISM (ANTI-MANNEQUIN)
════════════════════════════════════════════════════════════════

PREFER candid, imperfect, off-guard poses:
✓ Weight shifted to one leg
✓ Arms in natural positions (not symmetrical)
✓ Head slightly tilted or turned
✓ Mid-motion captures (walking, adjusting clothes)

✗ AVOID:
- Stiff, fashion-model symmetry
- Perfect T-pose or A-pose
- Unnatural body angles
- Overly posed expressions

✓ GOOD POSE QUALITIES:
- Looks like someone caught them mid-moment
- Small posture imperfections
- Natural weight distribution
- Asymmetrical arm/leg positions
`.trim()
