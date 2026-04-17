/**
 * RAG SEED DATA - Garment Differentiation Examples
 * 
 * Pre-populate RAG database with examples showing the difference
 * between SHORT_KURTA and LONG_KURTA.
 * 
 * This teaches the system to recognize and preserve garment lengths.
 */

import 'server-only'

export interface RAGSeedExample {
    scenario_description: string
    garment_type: string
    hemline_position: string
    rating: 'GOOD' | 'BAD'
    comment: string
    tags: string[]
    lesson_learned: string
}

/**
 * GOOD examples - What worked
 */
export const GOOD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'User with average build wearing SHORT_KURTA',
        garment_type: 'SHORT_KURTA',
        hemline_position: 'hip_level',
        rating: 'GOOD',
        comment: 'Hemline correctly ended at hip bone, did not extend to knee',
        tags: ['SHORT_KURTA', 'correct_length', 'hip_level'],
        lesson_learned: 'SHORT_KURTA hemline at hip bone is correct. Do not extend it.'
    },
    {
        scenario_description: 'User with curvy body wearing SHORT_KURTA',
        garment_type: 'SHORT_KURTA',
        hemline_position: 'upper_mid_thigh',
        rating: 'GOOD',
        comment: 'Hemline at upper mid-thigh, appropriately short, did not become a dress',
        tags: ['SHORT_KURTA', 'correct_length', 'mid_thigh'],
        lesson_learned: 'SHORT_KURTA can end at upper mid-thigh. This is correct length.'
    },
    {
        scenario_description: 'User wearing LONG_KURTA',
        garment_type: 'LONG_KURTA',
        hemline_position: 'knee_level',
        rating: 'GOOD',
        comment: 'Hemline correctly reached knee, proper long kurta length',
        tags: ['LONG_KURTA', 'correct_length', 'knee_level'],
        lesson_learned: 'LONG_KURTA must reach knee. This was correct.'
    },
    {
        scenario_description: 'User wearing T_SHIRT',
        garment_type: 'T_SHIRT',
        hemline_position: 'waist_level',
        rating: 'GOOD',
        comment: 'Hemline at waist, typical t-shirt length, did not extend',
        tags: ['T_SHIRT', 'correct_length', 'waist_level'],
        lesson_learned: 'T-shirt ends at waist. Do not extend it to hip.'
    }
]

/**
 * BAD examples - What failed (CRITICAL LEARNING)
 */
export const BAD_EXAMPLES: RAGSeedExample[] = [
    {
        scenario_description: 'SHORT_KURTA extended to knee',
        garment_type: 'SHORT_KURTA',
        hemline_position: 'hip_level',
        rating: 'BAD',
        comment: 'CRITICAL FAILURE: Reference showed SHORT_KURTA ending at hip, but model extended it to knee. This made it a LONG_KURTA when it should be SHORT.',
        tags: ['wrong_length', 'SHORT_KURTA', 'extended_too_long', 'knee_level'],
        lesson_learned: 'SHORT_KURTA MUST NOT reach knee. If reference shows hip-level hemline, keep it at hip level. Do NOT extend.'
    },
    {
        scenario_description: 'SHORT_KURTA became dress-length',
        garment_type: 'SHORT_KURTA',
        hemline_position: 'hip_level',
        rating: 'BAD',
        comment: 'Model saw SHORT_KURTA and made it flow down to mid-thigh/knee like a dress. Reference clearly showed it ending at hip.',
        tags: ['wrong_length', 'SHORT_KURTA', 'became_dress', 'hallucination'],
        lesson_learned: 'Do NOT add extra fabric or flow. If reference shows SHORT hemline, output should have SHORT hemline.'
    },
    {
        scenario_description: 'LONG_KURTA was shortened',
        garment_type: 'LONG_KURTA',
        hemline_position: 'knee_level',
        rating: 'BAD',
        comment: 'Reference showed LONG_KURTA reaching knee, but output showed it ending at mid-thigh. Too short.',
        tags: ['wrong_length', 'LONG_KURTA', 'shortened', 'mid_thigh'],
        lesson_learned: 'LONG_KURTA must reach knee. Do not shorten it.'
    },
    {
        scenario_description: 'T-shirt extended to kurta length',
        garment_type: 'T_SHIRT',
        hemline_position: 'waist_level',
        rating: 'BAD',
        comment: 'Model extended a regular t-shirt to hip/thigh length, making it look like a kurta',
        tags: ['wrong_length', 'T_SHIRT', 'extended', 'became_kurta'],
        lesson_learned: 'T-shirt should end at waist. Do not extend it.'
    },
    {
        scenario_description: 'Kurta length ignored reference image',
        garment_type: 'SHORT_KURTA',
        hemline_position: 'hip_level',
        rating: 'BAD',
        comment: 'Model did not look at WHERE the hemline ended in reference image. It assumed "kurta = long" and made it knee-length.',
        tags: ['wrong_length', 'ignored_reference', 'SHORT_KURTA', 'assumption'],
        lesson_learned: 'Look at the VISUAL hemline position in Image 2. Do not assume based on garment name. SHORT_KURTA ≠ LONG_KURTA.'
    }
]

/**
 * Generate scenario text for RAG embedding
 */
export function buildRAGScenarioText(example: RAGSeedExample): string {
    return `
Garment Type: ${example.garment_type}
Hemline Position: ${example.hemline_position}
Scenario: ${example.scenario_description}

${example.rating === 'GOOD' ? '✓ What worked:' : '✗ What failed:'}
${example.comment}

Lesson: ${example.lesson_learned}
Tags: ${example.tags.join(', ')}
`.trim()
}

/**
 * Format as RAG context for prompt
 */
export function formatGarmentDifferentiationRAG(): string {
    const goodExamplesText = GOOD_EXAMPLES.map((ex, i) => `
${i + 1}. ${ex.scenario_description}
   Garment: ${ex.garment_type} (hemline: ${ex.hemline_position})
   ✓ What worked: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    const badExamplesText = BAD_EXAMPLES.map((ex, i) => `
${i + 1}. ${ex.scenario_description}
   Garment: ${ex.garment_type} (hemline: ${ex.hemline_position})
   ✗ What went wrong: ${ex.comment}
   → Lesson: ${ex.lesson_learned}
`).join('\n')

    return `
═══════════════════════════════════════════════════════════════
RAG KNOWLEDGE: GARMENT DIFFERENTIATION
═══════════════════════════════════════════════════════════════

Learn from these past scenarios to avoid repeating mistakes.

✅ SCENARIOS THAT WORKED WELL:
${goodExamplesText}

❌ SCENARIOS THAT FAILED:
${badExamplesText}

═══════════════════════════════════════════════════════════════
KEY LESSONS (APPLY ALWAYS):
═══════════════════════════════════════════════════════════════

1. SHORT_KURTA ends at HIP or upper MID-THIGH
   → DO NOT extend it to knee

2. LONG_KURTA reaches KNEE or goes past it
   → DO NOT shorten it

3. Look at the VISUAL hemline in Image 2
   → Do not assume based on garment name

4. Copy the EXACT length from reference
   → Do not add or remove fabric

5. The knee is the dividing line:
   → Above knee = SHORT_KURTA
   → At/below knee = LONG_KURTA
`.trim()
}
