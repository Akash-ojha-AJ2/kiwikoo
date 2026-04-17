/**
 * SIMPLIFIED PROMPT MODE
 * 
 * For complex images, use a short, focused prompt instead of
 * massive detailed constraints that may dilute model attention.
 * 
 * Research shows: Shorter, clearer prompts often work better than
 * extremely long, detailed ones.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// SIMPLIFIED CORE PROMPT — SHORT AND FOCUSED
// ═══════════════════════════════════════════════════════════════

export const SIMPLIFIED_CORE_PROMPT = `
TASK: Virtual try-on — put the garment from Image 2 onto the person in Image 1.

RULES (MUST FOLLOW):

1. FACE: Copy the EXACT face from Image 1. Same person, same features, same expression.

2. BACKGROUND: Keep the SAME background from Image 1. Same location, same scene.

3. BODY: Keep the same body proportions and pose from Image 1.

4. GARMENT: Use the garment (color, pattern, style) from Image 2 only.

5. REALISM: Output should look like a real photo, not AI-generated.

OUTPUT: The same person from Image 1, wearing the garment from Image 2, in the same location as Image 1.
`

// ═══════════════════════════════════════════════════════════════
// MEDIUM LENGTH PROMPT — BALANCED
// ═══════════════════════════════════════════════════════════════

export const BALANCED_PROMPT = `
═══════════════════════════════════════════════════════════════════════════════
VIRTUAL TRY-ON TASK
═══════════════════════════════════════════════════════════════════════════════

Create an image where:
• The PERSON is from Image 1 (face, body, pose)
• The GARMENT is from Image 2 (clothing only)
• The SCENE is from Image 1 (background, lighting)

═══════════════════════════════════════════════════════════════════════════════
FACE RULES
═══════════════════════════════════════════════════════════════════════════════

• Face must be the EXACT same person from Image 1
• Same eyes, nose, mouth, jawline, expression
• No beautification, no changes, no new face
• If asked "is this the same person?" the answer must be YES

═══════════════════════════════════════════════════════════════════════════════
BACKGROUND RULES
═══════════════════════════════════════════════════════════════════════════════

• Keep the SAME location type from Image 1
• Temple stays temple, beach stays beach, home stays home
• Do NOT change to a café, studio, or different location
• Match the original lighting and atmosphere

═══════════════════════════════════════════════════════════════════════════════
GARMENT RULES
═══════════════════════════════════════════════════════════════════════════════

• Use the garment from Image 2 ONLY
• Match the exact color, pattern, and style
• Ignore any person/model in Image 2
• Drape the garment naturally on the person's body

═══════════════════════════════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════════════════════════════

Generate a realistic photo of the person from Image 1 wearing the garment from Image 2.
`

// ═══════════════════════════════════════════════════════════════
// DETERMINE PROMPT MODE BASED ON COMPLEXITY
// ═══════════════════════════════════════════════════════════════

export type PromptMode = 'simplified' | 'balanced' | 'full'

export function getPromptForComplexity(
    complexityScore: number,
    useSimplified: boolean = false
): { mode: PromptMode, prompt: string } {
    // If user explicitly wants simplified, use it
    if (useSimplified) {
        return { mode: 'simplified', prompt: SIMPLIFIED_CORE_PROMPT }
    }

    // High complexity = simpler prompt (less distraction for model)
    if (complexityScore >= 70) {
        console.log(`📋 Using SIMPLIFIED prompt for high-complexity image (score: ${complexityScore})`)
        return { mode: 'simplified', prompt: SIMPLIFIED_CORE_PROMPT }
    }

    // Medium complexity = balanced prompt
    if (complexityScore >= 40) {
        console.log(`📋 Using BALANCED prompt for medium-complexity image (score: ${complexityScore})`)
        return { mode: 'balanced', prompt: BALANCED_PROMPT }
    }

    // Low complexity = can use full detailed prompt
    console.log(`📋 Using FULL prompt for low-complexity image (score: ${complexityScore})`)
    return { mode: 'full', prompt: '' } // Empty means use normal flow
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logPromptMode(mode: PromptMode, sessionId: string): void {
    const modeDescriptions = {
        simplified: 'SHORT & FOCUSED (for complex images)',
        balanced: 'BALANCED (medium detail)',
        full: 'FULL DETAIL (simple images)'
    }

    console.log(`\n📋 PROMPT MODE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Mode: ${modeDescriptions[mode]}`)
}
