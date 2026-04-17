/**
 * PHOTOGRAPHY KNOWLEDGE RAG SEED DATA
 * 
 * Store all researched photography principles for model learning
 */

import 'server-only'
import type { RAGSeedExample } from './seed-data'

/**
 * Photography Physics Examples (GOOD practices)
 */
export const PHOTOGRAPHY_GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Portrait with natural inverse square law light fall-off',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face bright (closest to window), neck 15% darker, chest 35% darker, background 70% darker. Natural light physics applied correctly.',
        tags: ['lighting_physics', 'inverse_square_law', 'natural_falloff'],
        lesson_learned: 'Light intensity follows inverse square law. Closer areas are brighter. This creates natural depth.'
    },
    {
        scenario_description: '3-point lighting with 2:1 key:fill ratio',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Key light from left at 100%, fill light from right at 50%. Creates gentle shadows with visible but soft definition. Professional cinematic look.',
        tags: ['three_point_lighting', '2:1_ratio', 'cinematic'],
        lesson_learned: '2:1 ratio is standard for natural, professional portraits. Not flat, not over-dramatic.'
    },
    {
        scenario_description: 'Warm indoor lighting at 3,200K with consistent color temperature',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Face, neck, body all share same warm 3,200K color temperature. Shadows slightly cooler at 4,000K (natural blue sky fill). Cohesive and realistic.',
        tags: ['color_temperature', 'warm_lighting', 'unified'],
        lesson_learned: 'Unified color temperature across entire person creates natural look. Shadows can behave slightly cooler due to sky fill.'
    },
    {
        scenario_description: 'ISO 400 equivalent grain with organic texture',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Subtle, fine grain visible in shadows and midtones. Skin pores visible. Natural sensor noise pattern. Looks like real Canon/Nikon photo.',
        tags: ['grain', 'texture', 'ISO_400', 'realistic'],
        lesson_learned: 'Subtle grain and visible skin texture make images look photographic, not AI-generated.'
    },
    {
        scenario_description: 'Cinematic S-curve with lifted blacks and rolled highlights',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'GOOD',
        comment: 'Blacks lifted to dark gray (not crushed). Highlights gently rolled off (not blown). Increased midtone contrast. Film-like tonal response.',
        tags: ['cinematic_grading', 's_curve', 'film_look'],
        lesson_learned: 'S-curve tone mapping creates film look. Avoid pure blacks and pure whites for cinematic feel.'
    }
]

/**
 * Photography Failures (BAD examples to learn from)
 */
export const PHOTOGRAPHY_BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'Flat lighting with no fall-off',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'FAILURE: Face, neck, chest, and background all same brightness. Violates inverse square law. Looks artificial and flat. No depth.',
        tags: ['flat_lighting', 'no_falloff', 'ai_look', 'physics_violation'],
        lesson_learned: 'Real light follows inverse square law Light at 2ft is 4x brighter than light at 4ft. Must show natural fall-off.'
    },
    {
        scenario_description: 'Face and body different color temperatures',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'CRITICAL FAILURE: Face warm orange (3,000K), body cool blue (6,500K). Clear composite look. Face and body in different lighting environments.',
        tags: ['color_temperature_mismatch', 'composite_look', 'lighting_inconsistency'],
        lesson_learned: 'Face and body MUST share same color temperature. They are ONE person in ONE light source, not two separate images.'
    },
    {
        scenario_description: 'Perfectly smooth AI skin with no pores',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Skin is artificially smooth like plastic. No visible pores, no texture. Looks AI-generated, not photographic.',
        tags: ['ai_smooth_skin', 'no_texture', 'plastic_look'],
        lesson_learned: 'Real skin has pores, fine hair, subtle imperfections. Visible texture is sign of photographic authenticity.'
    },
    {
        scenario_description: 'No grain, digital-perfect image',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Image has zero grain/noise. Too clean and digital. Real cameras produce subtle sensor grain, especially at ISO 400+.',
        tags: ['no_grain', 'too_perfect', 'digital_look'],
        lesson_learned: 'Subtle grain is natural and expected. Zero grain signals AI generation or heavy processing.'
    },
    {
        scenario_description: 'Pure black shadows and pure white highlights',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Shadows crushed to pure black RGB(0,0,0), highlights blown to pure white RGB(255,255,255). Looks video/digital, not film.',
        tags: ['crushed_blacks', 'blown_highlights', 'digital_look'],
        lesson_learned: 'Film/cinematic look has lifted blacks (dark gray) and rolled highlights. Avoid pure black and pure white.'
    },
    {
        scenario_description: 'Oversaturated skin tones',
        garment_type: 'ANY',
        hemline_position: 'any',
        rating: 'BAD',
        comment: 'Skin is too saturated, looks orange/pink. Natural skin has subtle, gentle saturation with yellow undertones.',
        tags: ['oversaturated_skin', 'unnatural_color', 'poor_grading'],
        lesson_learned: 'Skin tones should be gentle, not oversaturated. Professional color science keeps skin natural.'
    }
]

/**
 * Format all photography knowledge for RAG prompts
 */
export function formatPhotographyRAGKnowledge(): string {
    const goodExamplesText = PHOTOGRAPHY_GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ✓ ${ex.scenario_description}
   What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const badExamplesText = PHOTOGRAPHY_BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ✗ ${ex.scenario_description}
   What failed: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    return `
═══════════════════════════════════════════════════════════════
RAG KNOWLEDGE: PROFESSIONAL PHOTOGRAPHY PRINCIPLES
═══════════════════════════════════════════════════════════════

Learn from these researched photography principles to create photographic realism.

✅ EXAMPLES THAT WORKED (GOOD PRACTICE):
${goodExamplesText}

❌ EXAMPLES THAT FAILED (AVOID THESE):
${badExamplesText}

═══════════════════════════════════════════════════════════════
KEY TAKEAWAYS (APPLY ALWAYS):
═══════════════════════════════════════════════════════════════

1. **LIGHTING PHYSICS (Inverse Square Law)**
   → Light falls off with distance²
   → Closer areas are brighter, creates natural depth

2. **THREE-POINT LIGHTING RATIOS**
   → 2:1 key:fill for natural portraits
   → 4:1 for dramatic look
   → Never flat 1:1 (AI look)

3. **COLOR TEMPERATURE UNITY**
   → Face and body share SAME Kelvin value
   → Shadows can be slightly cooler (sky fill)

4. **TEXTURE & GRAIN**
   → Add subtle ISO 400 equivalent grain
   → Show skin pores and natural texture
   → Avoid AI-smooth appearance

5. **CINEMATIC GRADING**
   → Lift blacks (not pure black)
   → Roll highlights (not pure white)
   → S-curve for film look

6. **SKIN TONE SCIENCE**
   → Subtle saturation, not oversaturated
   → Yellow/orange undertones
   → Blue tint in shadows (natural)
`.trim()
}
