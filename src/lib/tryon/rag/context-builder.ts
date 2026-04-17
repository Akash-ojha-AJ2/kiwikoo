/**
 * RAG CONTEXT BUILDER - Build Prompt Context from Retrieved Examples
 * 
 * Converts retrieved GOOD/BAD examples into prompt context
 * that teaches the model what to do and what to avoid.
 */

import type { RetrievedExample } from './retrieval'
import { MASTER_SPEC, GARMENT_DO_NOT_RULES } from '../master-spec'

export interface RAGContextInput {
    goodExamples: RetrievedExample[]
    badExamples: RetrievedExample[]
    currentGarmentType: string
}

/**
 * Build RAG context section for prompt
 */
export function buildRAGContext(input: RAGContextInput): string {
    const { goodExamples, badExamples, currentGarmentType } = input

    if (goodExamples.length === 0 && badExamples.length === 0) {
        // No examples available yet
        return `
════════════════════════════════════════════════════════════════════════════════
RAG SYSTEM (Learning from Past Examples)
════════════════════════════════════════════════════════════════════════════════

No similar scenarios found in database yet.
This is a new scenario - follow HARD RULES strictly.
`.trim()
    }

    const sections: string[] = []

    sections.push('════════════════════════════════════════════════════════════════════════════════')
    sections.push('RAG SYSTEM (Learning from Past Examples)')
    sections.push('════════════════════════════════════════════════════════════════════════════════')
    sections.push('')

    // GOOD EXAMPLES
    if (goodExamples.length > 0) {
        sections.push('✅ SIMILAR SCENARIOS THAT WORKED WELL:')
        sections.push('')

        goodExamples.forEach((example, index) => {
            const userFace = example.userAnalysis.face.shape
            const bodyType = example.userAnalysis.body.type
            const garmentType = example.garmentClassification.category
            const hemline = example.garmentClassification.hemline_position
            const pattern = example.garmentClassification.pattern_type

            sections.push(`${index + 1}. User: ${userFace} face, ${bodyType} body | Garment: ${garmentType} at ${hemline}`)
            sections.push(`   Similarity: ${(example.similarity * 100).toFixed(0)}%`)

            if (example.comment) {
                sections.push(`   ✓ What worked: ${example.comment}`)
            } else {
                sections.push(`   ✓ What worked: Face copied perfectly, garment type and length correct, pattern preserved`)
            }

            if (example.tags.length > 0) {
                sections.push(`   Tags: ${example.tags.join(', ')}`)
            }

            sections.push('')
        })

        sections.push('═══ LESSONS FROM GOOD EXAMPLES ═══')
        sections.push('Apply the same level of precision:')
        sections.push('• Exact face copy (face is READ-ONLY)')
        sections.push('• Correct garment type and length')
        sections.push('• Pattern and color fidelity')
        sections.push('')
    }

    // BAD EXAMPLES
    if (badExamples.length > 0) {
        sections.push('❌ SIMILAR SCENARIOS THAT FAILED (AVOID THESE MISTAKES):')
        sections.push('')

        badExamples.forEach((example, index) => {
            const userFace = example.userAnalysis.face.shape
            const bodyType = example.userAnalysis.body.type
            const garmentType = example.garmentClassification.category
            const hemline = example.garmentClassification.hemline_position

            sections.push(`${index + 1}. User: ${userFace} face, ${bodyType} body | Garment: ${garmentType} at ${hemline}`)
            sections.push(`   Similarity: ${(example.similarity * 100).toFixed(0)}%`)

            if (example.comment) {
                sections.push(`   ✗ What went wrong: "${example.comment}"`)
            }

            if (example.tags.length > 0) {
                const tagDescriptions: string[] = []
                if (example.tags.includes('wrong_face')) tagDescriptions.push('Face mismatch')
                if (example.tags.includes('wrong_length')) tagDescriptions.push('Garment length wrong')
                if (example.tags.includes('wrong_type')) tagDescriptions.push('Garment type changed')
                if (example.tags.includes('pattern_wrong')) tagDescriptions.push('Pattern changed')
                if (example.tags.includes('color_wrong')) tagDescriptions.push('Color changed')
                if (example.tags.includes('body_different')) tagDescriptions.push('Body proportions wrong')
                if (example.tags.includes('wrong_pose')) tagDescriptions.push('Pose changed')

                sections.push(`   ✗ Issues: ${tagDescriptions.join(', ')}`)
            }

            // Add specific lesson
            if (example.tags.includes('wrong_length')) {
                sections.push(`   → LESSON: For ${garmentType}, maintain hemline at ${hemline}. DO NOT change length.`)
            }
            if (example.tags.includes('wrong_type')) {
                sections.push(`   → LESSON: Garment type MUST stay ${garmentType}. DO NOT convert to different type.`)
            }
            if (example.tags.includes('wrong_face')) {
                sections.push(`   → LESSON: Face is READ-ONLY. Copy pixels exactly, no regeneration.`)
            }
            if (example.tags.includes('pattern_wrong')) {
                sections.push(`   → LESSON: Pattern MUST match exactly. Copy colors and scale precisely.`)
            }

            sections.push('')
        })

        sections.push('═══ CRITICAL LESSONS FROM FAILURES ═══')
        sections.push('DO NOT REPEAT THESE MISTAKES:')

        const allFailureTags = badExamples.flatMap(e => e.tags)
        if (allFailureTags.includes('wrong_length')) {
            sections.push('• NEVER change garment length from extracted value')
        }
        if (allFailureTags.includes('wrong_type')) {
            sections.push('• NEVER change garment type (shirt stays shirt, kurta stays kurta)')
        }
        if (allFailureTags.includes('wrong_face')) {
            sections.push('• NEVER regenerate or modify the face - it is READ-ONLY')
        }
        if (allFailureTags.includes('pattern_wrong')) {
            sections.push('• NEVER simplify or change pattern - copy exactly')
        }
        if (allFailureTags.includes('body_different')) {
            sections.push('• NEVER use body from garment image - infer from user face only')
        }

        sections.push('')
    }

    // Add garment-specific DO-NOT rules
    const doNotRules = GARMENT_DO_NOT_RULES[currentGarmentType]
    if (doNotRules) {
        sections.push('═══ HARD RULES FOR THIS GARMENT TYPE ═══')
        sections.push(`Garment Type: ${currentGarmentType}`)
        sections.push('')
        doNotRules.forEach(rule => {
            sections.push(`• ${rule}`)
        })
        sections.push('')
        sections.push('⚠️  These rules are ABSOLUTE. Violating them marks the output as INVALID.')
        sections.push('')
    }

    sections.push('════════════════════════════════════════════════════════════════════════════════')
    sections.push('APPLY ALL LESSONS STRICTLY. HARD RULES OVERRIDE RAG EXAMPLES.')
    sections.push('════════════════════════════════════════════════════════════════════════════════')

    return sections.join('\n')
}

/**
 * Build a concise summary of RAG learnings
 */
export function buildRAGSummary(input: RAGContextInput): string {
    const { goodExamples, badExamples } = input

    if (goodExamples.length === 0 && badExamples.length === 0) {
        return 'No similar scenarios in database'
    }

    const parts: string[] = []

    if (goodExamples.length > 0) {
        parts.push(`${goodExamples.length} similar success cases`)
    }

    if (badExamples.length > 0) {
        const topFailures = badExamples
            .flatMap(e => e.tags)
            .filter((tag, index, self) => self.indexOf(tag) === index)
            .slice(0, 3)

        parts.push(`${badExamples.length} failures (common issues: ${topFailures.join(', ')})`)
    }

    return parts.join(' | ')
}
