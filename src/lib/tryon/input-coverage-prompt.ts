/**
 * INPUT COVERAGE PROMPT INJECTION
 * 
 * Injects coverage-aware constraints into Nano Banana prompts.
 * Prevents hallucination of body parts not visible in input.
 * 
 * CORE PRINCIPLE:
 * If the camera didn't see it, the model must not invent it.
 */

import 'server-only'
import type { InputCoverage, InputCoverageResult, GenerationMode } from './input-coverage-detector'
import type { GarmentTopology } from './garment-topology-classifier'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRAINT ERROR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Error thrown when garment requires more coverage than input provides.
 */
export class GenerationConstraintError extends Error {
    constructor(
        message: string,
        public readonly inputCoverage: InputCoverage,
        public readonly requiredCoverage: InputCoverage,
        public readonly garmentTopology?: GarmentTopology
    ) {
        super(message)
        this.name = 'GenerationConstraintError'
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COVERAGE CONSTRAINT PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prompt injection for FACE_ONLY coverage.
 */
export const FACE_ONLY_CONSTRAINT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   INPUT COVERAGE CONSTRAINT — ABSOLUTE                         ║
║                         Coverage: FACE_ONLY                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

The input image shows ONLY the face. Body is NOT visible.

ABSOLUTE RULES:
• Do NOT hallucinate body parts not visible in the input
• Do NOT generate legs, hips, or full silhouettes
• Do NOT generate dresses, skirts, or pants
• ONLY render upper-body garment preview
• Crop or softly fade output below chest level
• Maintain realism over completeness

ALLOWED:
• Face (preserved exactly)
• Shoulders (inferred naturally)
• Upper chest area
• Garment neckline and collar visible

FORBIDDEN:
✗ NO mannequin bodies
✗ NO floating faces on generated bodies
✗ NO full-length silhouettes
✗ NO dress generation
✗ NO pant generation

IF THE CAMERA DIDN'T SEE IT, DO NOT INVENT IT.
`

/**
 * Prompt injection for UPPER_BODY coverage.
 */
export const UPPER_BODY_CONSTRAINT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   INPUT COVERAGE CONSTRAINT — ABSOLUTE                         ║
║                        Coverage: UPPER_BODY                                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

The input image shows face and upper body. Hips/legs NOT visible.

ABSOLUTE RULES:
• Do NOT hallucinate lower body parts
• Do NOT generate full-length silhouettes
• Render upper garment clearly
• Lower body may be softly faded or cropped
• Do NOT generate full-length outfits

ALLOWED:
• Face (preserved exactly)
• Shoulders and arms
• Torso down to waist/hip level
• Upper garment in full detail

FORBIDDEN:
✗ NO generating legs or knees
✗ NO full dress/gown rendering
✗ NO full-length pants/skirts
✗ NO mannequin lower body

Output should fade or crop below the visible body boundary.
`

/**
 * No constraint for FULL_BODY coverage (full try-on allowed).
 */
export const FULL_BODY_CONSTRAINT = ``  // No constraint for full body

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTRAINT RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if garment topology is compatible with input coverage.
 * Throws GenerationConstraintError if incompatible.
 */
export function validateCoverageCompatibility(
    inputCoverage: InputCoverageResult,
    garmentTopology: GarmentTopology
): void {
    // Dress requires full body
    if (garmentTopology === 'DRESS' && inputCoverage.coverage !== 'FULL_BODY') {
        throw new GenerationConstraintError(
            `Dress requires full-body input. Current input: ${inputCoverage.coverage}`,
            inputCoverage.coverage,
            'FULL_BODY',
            garmentTopology
        )
    }

    // Two-piece ideally requires full body (but can work with upper body)
    if (garmentTopology === 'TWO_PIECE' && inputCoverage.coverage === 'FACE_ONLY') {
        throw new GenerationConstraintError(
            `Two-piece outfit requires at least upper-body input. Current input: ${inputCoverage.coverage}`,
            inputCoverage.coverage,
            'UPPER_BODY',
            garmentTopology
        )
    }
}

/**
 * Get downgraded generation mode when full try-on isn't possible.
 */
export function getDowngradedMode(
    inputCoverage: InputCoverage,
    garmentTopology: GarmentTopology
): { mode: GenerationMode; message: string } {
    if (garmentTopology === 'DRESS' && inputCoverage !== 'FULL_BODY') {
        return {
            mode: inputCoverage === 'FACE_ONLY'
                ? 'UPPER_BODY_PREVIEW_ONLY'
                : 'UPPER_BODY_WITH_FADE',
            message: 'Dress preview only - full-body image required for complete try-on'
        }
    }

    if (inputCoverage === 'FACE_ONLY') {
        return {
            mode: 'UPPER_BODY_PREVIEW_ONLY',
            message: 'Upper-body preview only - submit full-body image for complete try-on'
        }
    }

    if (inputCoverage === 'UPPER_BODY') {
        return {
            mode: 'UPPER_BODY_WITH_FADE',
            message: 'Upper-body try-on with fade - lower body not visible in input'
        }
    }

    return {
        mode: 'FULL_TRY_ON',
        message: 'Full try-on enabled'
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build coverage-aware prompt injection.
 */
export function buildCoveragePromptInjection(
    coverageResult: InputCoverageResult
): string {
    switch (coverageResult.coverage) {
        case 'FACE_ONLY':
            return FACE_ONLY_CONSTRAINT
        case 'UPPER_BODY':
            return UPPER_BODY_CONSTRAINT
        case 'FULL_BODY':
            return FULL_BODY_CONSTRAINT  // Empty - no constraint
        default:
            return FACE_ONLY_CONSTRAINT  // Default to safest
    }
}

/**
 * Get concise coverage reminder for token-constrained contexts.
 */
export function getCoverageReminder(coverage: InputCoverage): string {
    switch (coverage) {
        case 'FACE_ONLY':
            return `
COVERAGE: FACE_ONLY
- Upper body preview only
- NO legs, hips, or full silhouettes
- Fade/crop below chest
`.trim()
        case 'UPPER_BODY':
            return `
COVERAGE: UPPER_BODY
- Upper garment in full detail
- Fade/crop below waist
- NO full-length outfits
`.trim()
        case 'FULL_BODY':
            return ''  // No reminder needed
        default:
            return ''
    }
}

/**
 * Log coverage constraint injection.
 */
export function logCoverageInjection(coverageResult: InputCoverageResult): void {
    if (coverageResult.coverage === 'FULL_BODY') {
        console.log('\n📷 COVERAGE CONSTRAINT: None (full body detected)')
        return
    }

    console.log('\n📷 COVERAGE CONSTRAINT INJECTED')
    console.log('   ═══════════════════════════════════════')
    console.log(`   ✓ Coverage: ${coverageResult.coverage}`)
    console.log(`   ✓ Mode: ${coverageResult.allowedMode}`)
    console.log(`   ⚠️ Limited generation - body not fully visible`)
    console.log('   ═══════════════════════════════════════')
}
