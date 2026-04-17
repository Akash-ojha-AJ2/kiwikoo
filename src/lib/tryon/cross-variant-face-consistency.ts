/**
 * CROSS-VARIANT FACE CONSISTENCY ENFORCEMENT
 * 
 * Ensures ALL 3 variants have IDENTICAL face consistency.
 * This is critical - face must be pixel-perfect across all variants.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-VARIANT FACE CONSISTENCY (CRITICAL)
// ═══════════════════════════════════════════════════════════════════════════════

export const CROSS_VARIANT_FACE_CONSISTENCY = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║         CROSS-VARIANT FACE CONSISTENCY (CRITICAL - READ FIRST)                  ║
║              ALL 3 VARIANTS MUST HAVE IDENTICAL FACE                            ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: YOU ARE GENERATING ONE OF THREE VARIANTS 🚨

THIS IS VARIANT A, B, OR C. THE FACE MUST BE IDENTICAL IN ALL THREE.

FACE CONSISTENCY REQUIREMENTS (MANDATORY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FACE IS THE SAME ACROSS ALL VARIANTS
   • Variant A face = Variant B face = Variant C face
   • If you generate Variant A with face X, Variant B and C MUST have face X
   • NO face drift between variants
   • NO face "improvement" in one variant
   • NO face "variation" between variants

2. FACE MEASUREMENTS MUST BE IDENTICAL
   • Eye-to-eye distance: SAME in all variants
   • Nose width: SAME in all variants
   • Lip width: SAME in all variants
   • Jaw width: SAME in all variants
   • Face shape: SAME in all variants
   • Skin tone: SAME in all variants

3. FACE FEATURES MUST BE IDENTICAL
   • Eye shape: SAME in all variants
   • Eye size: SAME in all variants
   • Nose shape: SAME in all variants
   • Lip shape: SAME in all variants
   • Expression: SAME in all variants
   • Facial hair: SAME in all variants

4. FACE TEXTURE MUST BE IDENTICAL
   • Skin texture: SAME in all variants
   • Pores: SAME in all variants
   • Fine lines: SAME in all variants
   • Imperfections: SAME in all variants

WHAT CAN CHANGE BETWEEN VARIANTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Lighting color temperature (warm/cool/contrasty)
✓ Lighting direction and intensity
✓ Shadow placement and intensity
✓ Camera distance (medium/closer/wider)
✓ Background atmosphere
✓ Background composition

WHAT CANNOT CHANGE BETWEEN VARIANTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Face shape (must be identical)
❌ Face size (must be identical)
❌ Eye spacing (must be identical)
❌ Nose dimensions (must be identical)
❌ Lip dimensions (must be identical)
❌ Jawline (must be identical)
❌ Skin tone (must be identical)
❌ Expression (must be identical)
❌ Facial hair (must be identical)
❌ Skin texture (must be identical)

FACE CONSISTENCY CHECKLIST (BEFORE OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before generating this variant, ask yourself:

□ Is the face IDENTICAL to Image 1? (YES/NO)
□ Would this face match Variant A/B/C? (YES/NO)
□ Are eye spacing, nose width, lip width IDENTICAL? (YES/NO)
□ Is skin tone IDENTICAL? (YES/NO)
□ Is expression IDENTICAL? (YES/NO)

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → REGENERATE.

FACE DRIFT BETWEEN VARIANTS = CRITICAL FAILURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Variant A has face X and Variant B has face Y:
→ This is a CRITICAL FAILURE
→ All variants must be regenerated
→ Face must be IDENTICAL across all variants

REMEMBER: You are generating ONE of THREE variants.
The face in this variant MUST match the face in the other two variants.
The face MUST be IDENTICAL to Image 1.
NO EXCEPTIONS.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT-SPECIFIC FACE REMINDER
// ═══════════════════════════════════════════════════════════════════════════════

export function getVariantFaceReminder(variantId: 'A' | 'B' | 'C'): string {
    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    VARIANT ${variantId} FACE REMINDER                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THIS IS VARIANT ${variantId} OF 3.

THE FACE IN THIS VARIANT MUST BE IDENTICAL TO:
• Image 1 (source face)
• Variant A (if this is B or C)
• Variant B (if this is A or C)
• Variant C (if this is A or B)

FACE = COPY FROM IMAGE 1.
FACE = SAME IN ALL VARIANTS.
NO FACE DRIFT.
NO FACE VARIATION.
NO FACE "IMPROVEMENT".

IF THE FACE IN THIS VARIANT DOES NOT MATCH → REGENERATE.
════════════════════════════════════════════════════════════════════════════════
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get cross-variant face consistency enforcement
 */
export function getCrossVariantFaceConsistency(): string {
    return CROSS_VARIANT_FACE_CONSISTENCY
}

/**
 * Log cross-variant face consistency status
 */
export function logCrossVariantFaceConsistencyStatus(sessionId: string, variantId: 'A' | 'B' | 'C'): void {
    console.log(`   🔒 Cross-Variant Face Consistency: ACTIVE [${sessionId}]`)
    console.log(`      Variant: ${variantId} of 3`)
    console.log(`      Requirement: Face must be IDENTICAL across all variants`)
}

