/**
 * FACE STABILITY GUIDANCE
 * 
 * Prompt-level guidance for face micro-stability.
 * This is NOT a hard lock - it's guidance for the model.
 * 
 * PART 4: Face Micro-Stability
 * PART 5: Variant Face Consistency
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// FACE STABILITY GUIDANCE (PART 4)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core face stability guidance - injected after face lock.
 * Focuses on preserving geometry, NOT lighting.
 */
export const FACE_STABILITY_GUIDANCE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        FACE STABILITY GUIDANCE                                 ║
║                    (Geometry Preservation - Not Lighting)                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

CORE REQUIREMENT:
Preserve original facial geometry EXACTLY. This is not optional.

WHAT MUST BE PRESERVED:
• Cheek volume - EXACT same fullness/hollowness
• Jawline shape - EXACT same angularity and width
• Eye spacing - EXACT same distance between eyes
• Nose proportions - EXACT same width, length, bridge shape
• Lip proportions - EXACT same thickness and width
• Forehead shape - EXACT same height and curvature
• Facial asymmetry - If original face is asymmetric, output must match

WHAT IS ACCEPTABLE:
• Minor lighting-related shading variation
• Slight color temperature differences from scene lighting
• Subtle shadow direction changes

WHAT IS NOT ACCEPTABLE:
• Narrowing or widening the face
• Reshaping the jawline
• Changing cheek fullness
• Adjusting eye size or spacing
• Modifying nose proportions
• Altering lip thickness

MENTAL CHECK:
Before output, verify: "If I overlay the original face on this output, 
would the geometric outlines match perfectly?"
If answer is NO → regenerate.
`

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT CONSISTENCY RULE (PART 5)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Variant consistency enforcement - ensures all variants have same face.
 */
export const VARIANT_CONSISTENCY_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      VARIANT CONSISTENCY RULE                                  ║
║              All Variants = Same Face (No Reinterpretation)                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

CORE REQUIREMENT:
All output variants must depict the SAME EXACT facial structure.

WHAT MAY DIFFER BETWEEN VARIANTS:
• Cropping/framing
• Minor pose angle (if specified)
• Background elements
• Clothing fit

WHAT MUST BE IDENTICAL ACROSS ALL VARIANTS:
• Face shape and proportions
• Eye size, shape, and spacing
• Nose dimensions
• Lip dimensions
• Jawline contour
• Cheek volume
• Skin texture and tone
• Facial expression

GENERATION RULE:
Do NOT reinterpret the face separately for each variant.
Each variant should look like the SAME PHOTO with different clothing.

VARIANT CHECK:
If variants A, B, and C were shown side by side, a viewer should 
immediately recognize them as the SAME PERSON, not three similar people.
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED GUIDANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get combined face stability guidance for injection into prompts.
 */
export function getFaceStabilityGuidance(): string {
    return `
${FACE_STABILITY_GUIDANCE}

${VARIANT_CONSISTENCY_RULE}
`.trim()
}

/**
 * Get guidance for a specific variant (A, B, or C).
 */
export function getVariantSpecificGuidance(variantId: 'A' | 'B' | 'C'): string {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VARIANT ${variantId} - FACE REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are generating Variant ${variantId} of 3.

The face in Variant ${variantId} MUST be IDENTICAL to Variants ${variantId === 'A' ? 'B and C' : variantId === 'B' ? 'A and C' : 'A and B'}.

Do not reinterpret the face for this variant.
Copy the face EXACTLY as it appears in the reference image.

Face geometry is LOCKED. Clothing is the ONLY variable.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim()
}

/**
 * Log that face stability guidance was injected.
 */
export function logFaceStabilityInjection(): void {
    console.log('🎯 FACE STABILITY GUIDANCE injected')
    console.log('   - Geometry preservation: ACTIVE')
    console.log('   - Variant consistency: ACTIVE')
}
