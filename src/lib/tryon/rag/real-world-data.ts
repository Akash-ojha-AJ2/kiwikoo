/**
 * REAL-WORLD DATA FOR RAG SYSTEM
 * 
 * Comprehensive real-world examples covering:
 * - Face copy accuracy
 * - Camera physics
 * - Lighting realism
 * - Physics behavior
 */

import 'server-only'
import type { RAGSeedExample } from './seed-data'

/**
 * FACE COPY ACCURACY EXAMPLES (Real-world data)
 */
export const FACE_COPY_GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Face copied pixel-perfect with exact eye spacing',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face matched 100% - eye-to-eye distance identical (measured 2.3cm in both images), nose width matched, lip shape preserved. No drift detected.',
        tags: ['face_copy_perfect', 'pixel_accurate', 'no_drift', 'eye_spacing_match'],
        lesson_learned: 'Face copy must be pixel-perfect. Measure eye spacing, nose width, lip shape. Any deviation = failure.'
    },
    {
        scenario_description: 'Face preserved with natural skin texture and pores',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face copied with visible pores, natural skin texture, slight imperfections. Not over-smoothed. Looks like real person, not AI.',
        tags: ['face_texture_realistic', 'pores_visible', 'natural_skin', 'no_oversmoothing'],
        lesson_learned: 'Preserve skin texture from Image 1. Visible pores and imperfections are REQUIRED for realism.'
    },
    {
        scenario_description: 'Face expression maintained exactly (same smile intensity)',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Expression matched perfectly - same smile width, same eye squint, same cheek lift. No expression drift.',
        tags: ['expression_match', 'smile_preserved', 'no_expression_drift'],
        lesson_learned: 'Expression is part of face identity. Copy expression exactly - smile intensity, eye squint, cheek position.'
    }
]

export const FACE_COPY_BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Face drift - eyes moved 0.5cm closer together',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'CRITICAL FAILURE: Eye-to-eye distance changed from 2.3cm to 1.8cm. Face looks like different person. Face drift detected.',
        tags: ['face_drift', 'eye_spacing_wrong', 'different_person', 'critical_failure'],
        lesson_learned: 'Eye spacing is biometric. Any change = different person. Must copy exactly. Measure before/after.'
    },
    {
        scenario_description: 'Face over-smoothed - lost all skin texture',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Face looks plastic - no pores, no texture, over-smoothed. Looks AI-generated, not photographic.',
        tags: ['oversmoothed_face', 'plastic_look', 'ai_generated_look', 'no_texture'],
        lesson_learned: 'Skin texture is REQUIRED. Copy pores, fine lines, imperfections from Image 1. Do not smooth.'
    },
    {
        scenario_description: 'Expression changed - smile became neutral',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Original had slight smile, output has neutral expression. Expression drift = face identity failure.',
        tags: ['expression_drift', 'smile_lost', 'face_identity_failure'],
        lesson_learned: 'Expression is part of face. Copy smile intensity, eye squint, cheek position exactly.'
    },
    {
        scenario_description: 'Face whitened - skin tone changed',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Original skin tone was warm olive (RGB 180, 160, 140), output is lighter pink (RGB 220, 190, 170). Skin tone mismatch.',
        tags: ['skin_tone_wrong', 'color_drift', 'face_identity_failure'],
        lesson_learned: 'Skin tone must match exactly. Measure RGB values. Any color change = face identity failure.'
    }
]

/**
 * CAMERA PHYSICS EXAMPLES (Real-world data)
 */
export const CAMERA_PHYSICS_GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'iPhone camera realism - natural noise and focus falloff',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Image has subtle ISO 400 equivalent grain, natural focus falloff (background 20% blur), slight lens distortion. Looks like real phone photo.',
        tags: ['camera_realism', 'phone_camera', 'natural_noise', 'focus_falloff'],
        lesson_learned: 'Phone cameras have grain, focus falloff, lens distortion. These imperfections are REQUIRED for realism.'
    },
    {
        scenario_description: 'Natural exposure with slight overexposure on face',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face slightly overexposed (natural phone behavior), background correctly exposed. Not HDR-perfect. Realistic camera response.',
        tags: ['natural_exposure', 'slight_overexposure', 'phone_camera', 'realistic'],
        lesson_learned: 'Real cameras have imperfect exposure. Slight overexposure on face is natural, not a flaw.'
    },
    {
        scenario_description: 'Natural sharpness - not over-sharpened',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Image has natural sharpness falloff. Face sharp, background soft. Not over-sharpened. Looks like real camera.',
        tags: ['natural_sharpness', 'depth_of_field', 'realistic', 'not_oversharpened'],
        lesson_learned: 'Real cameras have natural sharpness falloff. Over-sharpening = AI look.'
    }
]

export const CAMERA_PHYSICS_BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Zero noise - too perfect, digital look',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Image has zero grain/noise. Too clean, too perfect. Looks AI-generated or heavily processed. Not photographic.',
        tags: ['no_noise', 'too_perfect', 'ai_look', 'digital_look'],
        lesson_learned: 'Real cameras produce grain. ISO 400+ has visible grain. Zero grain = AI look.'
    },
    {
        scenario_description: 'Everything in perfect focus - no depth',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Face, body, background all perfectly sharp. No depth of field. Looks like studio render, not real photo.',
        tags: ['no_depth', 'everything_sharp', 'studio_render', 'unrealistic'],
        lesson_learned: 'Real cameras have depth of field. Background should be slightly blurry. Everything sharp = AI look.'
    },
    {
        scenario_description: 'HDR-perfect exposure - too balanced',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Exposure is perfectly balanced - no overexposure, no underexposure. Looks HDR-processed, not natural camera.',
        tags: ['hdr_look', 'too_balanced', 'unnatural', 'overprocessed'],
        lesson_learned: 'Real cameras have imperfect exposure. Slight over/under exposure is natural. Perfect exposure = HDR/AI look.'
    }
]

/**
 * LIGHTING REALISM EXAMPLES (Real-world data)
 */
export const LIGHTING_REALISM_GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Natural window light with inverse square law falloff',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face bright (closest to window), neck 15% darker, chest 30% darker, background 60% darker. Natural light physics applied correctly.',
        tags: ['inverse_square_law', 'natural_falloff', 'window_light', 'realistic'],
        lesson_learned: 'Light follows inverse square law. Closer = brighter. Face should be brightest, background darkest.'
    },
    {
        scenario_description: 'Unified color temperature - face and body match',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face and body both warm 3,200K. Shadows slightly cooler 4,000K (sky fill). Unified, realistic color temperature.',
        tags: ['unified_color_temp', 'consistent_lighting', 'realistic', 'warm_lighting'],
        lesson_learned: 'Face and body must share same color temperature. They are one person in one light source.'
    },
    {
        scenario_description: 'Natural shadows - under chin, under nose, on garment',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Shadows present under chin, under nose, on garment folds, on background. Natural shadow physics. Realistic depth.',
        tags: ['natural_shadows', 'shadow_physics', 'realistic', 'depth'],
        lesson_learned: 'Shadows are REQUIRED. Under chin, under nose, on garment, on background. No shadows = AI look.'
    }
]

export const LIGHTING_REALISM_BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Flat lighting - no falloff, uniform brightness',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Face, neck, chest, background all same brightness. No light falloff. Violates physics. Looks AI-generated.',
        tags: ['flat_lighting', 'no_falloff', 'physics_violation', 'ai_look'],
        lesson_learned: 'Light MUST fall off with distance. Uniform brightness = AI look. Follow inverse square law.'
    },
    {
        scenario_description: 'Face warm, body cool - color temperature mismatch',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Face warm orange (3,000K), body cool blue (6,500K). Clear composite look. Face and body in different environments.',
        tags: ['color_temp_mismatch', 'composite_look', 'lighting_inconsistency', 'critical_failure'],
        lesson_learned: 'Face and body MUST share same color temperature. Different temps = composite/AI look.'
    },
    {
        scenario_description: 'No shadows anywhere - floating look',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'No shadows under chin, under nose, on garment, on background. Person looks floating. Unrealistic.',
        tags: ['no_shadows', 'floating_look', 'unrealistic', 'ai_look'],
        lesson_learned: 'Shadows are REQUIRED for realism. No shadows = floating/AI look. Add shadows under chin, nose, garment.'
    }
]

/**
 * PHYSICS REALISM EXAMPLES (Real-world data)
 */
export const PHYSICS_REALISM_GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Fabric drapes naturally with gravity - vertical folds',
        garment_type: 'KURTA',
        hemline_position: 'knee_level',
        rating: 'GOOD',
        comment: 'Fabric hangs with natural vertical folds, conforms to body curves, shows gravity. Realistic fabric physics.',
        tags: ['gravity_physics', 'natural_drape', 'realistic', 'fabric_physics'],
        lesson_learned: 'Fabric must obey gravity. Vertical folds, natural drape, conforms to body. No floating fabric.'
    },
    {
        scenario_description: 'Wrinkles at stress points - armpits, elbows, waist',
        garment_type: 'SHIRT',
        hemline_position: 'waist_level',
        rating: 'GOOD',
        comment: 'Wrinkles present at armpits (compression), elbows (bend), waist (tension). Natural stress wrinkles. Realistic.',
        tags: ['stress_wrinkles', 'natural_wrinkles', 'realistic', 'fabric_physics'],
        lesson_learned: 'Wrinkles form at stress points. Armpits, elbows, waist, chest. No wrinkles = unrealistic.'
    },
    {
        scenario_description: 'Fabric weight visible - heavy fabric hangs straight',
        garment_type: 'KURTA',
        hemline_position: 'knee_level',
        rating: 'GOOD',
        comment: 'Heavy fabric (cotton/wool) hangs straight down, minimal flow. Light fabric would flow more. Fabric weight respected.',
        tags: ['fabric_weight', 'gravity_physics', 'realistic', 'natural_drape'],
        lesson_learned: 'Heavy fabrics hang straight. Light fabrics flow. Respect fabric weight in physics.'
    }
]

export const PHYSICS_REALISM_BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Fabric floats - no gravity, unrealistic',
        garment_type: 'KURTA',
        hemline_position: 'knee_level',
        rating: 'BAD',
        comment: 'Fabric floats away from body, no gravity effect, no natural drape. Looks AI-generated, not realistic.',
        tags: ['no_gravity', 'floating_fabric', 'unrealistic', 'ai_look'],
        lesson_learned: 'Fabric MUST obey gravity. No floating. Natural drape, vertical folds, conforms to body.'
    },
    {
        scenario_description: 'No wrinkles anywhere - too perfect',
        garment_type: 'SHIRT',
        hemline_position: 'waist_level',
        rating: 'BAD',
        comment: 'Fabric perfectly smooth, no wrinkles at armpits, elbows, waist. Too perfect. Looks AI-generated.',
        tags: ['no_wrinkles', 'too_perfect', 'ai_look', 'unrealistic'],
        lesson_learned: 'Wrinkles are REQUIRED at stress points. No wrinkles = AI look. Add wrinkles at armpits, elbows, waist.'
    },
    {
        scenario_description: 'Heavy fabric flows like silk - wrong physics',
        garment_type: 'KURTA',
        hemline_position: 'knee_level',
        rating: 'BAD',
        comment: 'Heavy cotton fabric flows like silk chiffon. Wrong fabric weight behavior. Physics violation.',
        tags: ['wrong_fabric_weight', 'physics_violation', 'unrealistic'],
        lesson_learned: 'Respect fabric weight. Heavy = hangs straight. Light = flows. Wrong weight = physics violation.'
    }
]

/**
 * Format all real-world data for RAG
 */
export function formatRealWorldRAGData(): string {
    const faceCopyGood = FACE_COPY_GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ✓ ${ex.scenario_description}
   What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const faceCopyBad = FACE_COPY_BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ✗ ${ex.scenario_description}
   What failed: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const cameraGood = CAMERA_PHYSICS_GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ✓ ${ex.scenario_description}
   What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const cameraBad = CAMERA_PHYSICS_BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ✗ ${ex.scenario_description}
   What failed: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const lightingGood = LIGHTING_REALISM_GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ✓ ${ex.scenario_description}
   What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const lightingBad = LIGHTING_REALISM_BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ✗ ${ex.scenario_description}
   What failed: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const physicsGood = PHYSICS_REALISM_GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ✓ ${ex.scenario_description}
   What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const physicsBad = PHYSICS_REALISM_BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ✗ ${ex.scenario_description}
   What failed: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    RAG KNOWLEDGE: REAL-WORLD DATA                              ║
║              Face Copy • Camera Physics • Lighting • Physics                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE COPY ACCURACY (PIXEL-LEVEL MATCHING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHAT WORKED:
${faceCopyGood}

❌ WHAT FAILED:
${faceCopyBad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMERA PHYSICS (REAL CAMERA BEHAVIOR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHAT WORKED:
${cameraGood}

❌ WHAT FAILED:
${cameraBad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIGHTING REALISM (PHYSICS-BASED LIGHTING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHAT WORKED:
${lightingGood}

❌ WHAT FAILED:
${lightingBad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHYSICS REALISM (GRAVITY, DRAPE, WRINKLES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ WHAT WORKED:
${physicsGood}

❌ WHAT FAILED:
${physicsBad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY TAKEAWAYS (APPLY ALWAYS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FACE COPY: Pixel-perfect matching. Measure eye spacing, nose width, skin tone.
2. CAMERA: Natural noise, focus falloff, imperfect exposure. Not HDR-perfect.
3. LIGHTING: Inverse square law falloff, unified color temp, natural shadows.
4. PHYSICS: Gravity, fabric weight, stress wrinkles. No floating, no perfection.

IF ANY CHECK FAILS → REGENERATE.
`.trim()
}

