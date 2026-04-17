/**
 * GARMENT DIFFERENTIATION RULES
 * 
 * CRITICAL: The model frequently confuses SHORT_KURTA with LONG_KURTA.
 * This module provides EXACT visual rules to differentiate garment types.
 */

import 'server-only'

/**
 * HEMLINE POSITION CHART (BINDING)
 * 
 * This is the ABSOLUTE TRUTH for where garments must end.
 */

interface HemlinePositionData {
    hemline: string
    visualRule: string
    maxLength: string
    minLength: string
    reference: string
    CRITICAL?: string
}

export const HEMLINE_POSITION_CHART: Record<string, HemlinePositionData> = {
    // SHIRTS & TOPS
    SHIRT: {
        hemline: 'WAIST to upper HIP',
        visualRule: 'Ends at belt line or 2-3 inches below',
        maxLength: 'MUST NOT go past upper hip',
        minLength: 'MUST cover waist',
        reference: 'Think: typical button-down shirt'
    },

    T_SHIRT: {
        hemline: 'WAIST to mid HIP',
        visualRule: 'Covers waist, may touch hip bone',
        maxLength: 'MUST NOT go past mid-hip',
        minLength: 'MUST cover waist',
        reference: 'Think: casual t-shirt'
    },

    // KURTAS - CRITICAL DIFFERENTIATION
    SHORT_KURTA: {
        hemline: 'HIP to upper MID-THIGH',
        visualRule: 'Ends at hip bone OR 4-6 inches below waist',
        maxLength: 'MUST NOT reach knee',
        minLength: 'MUST cover hip',
        reference: 'Think: tunic length, NOT a dress',
        CRITICAL: 'If it reaches the KNEE → it is NOT a SHORT_KURTA, it is a LONG_KURTA'
    },

    LONG_KURTA: {
        hemline: 'KNEE to mid CALF',
        visualRule: 'Reaches knee or goes past knee',
        maxLength: 'Can go to mid-calf',
        minLength: 'MUST reach knee',
        reference: 'Think: traditional long kurta',
        CRITICAL: 'If it does NOT reach KNEE → it is NOT a LONG_KURTA, it is a SHORT_KURTA'
    },

    // DRESSES
    SHORT_DRESS: {
        hemline: 'mid THIGH to KNEE',
        visualRule: 'Above knee or at knee',
        maxLength: 'MUST NOT go past knee',
        minLength: 'MUST be below hip',
        reference: 'Think: mini/knee-length dress'
    },

    LONG_DRESS: {
        hemline: 'below KNEE to ANKLE',
        visualRule: 'Past knee, often to mid-calf or ankle',
        maxLength: 'Can reach ankle',
        minLength: 'MUST go past knee',
        reference: 'Think: maxi dress'
    }
}

/**
 * VISUAL DETECTION RULES
 * 
 * How to VISUALLY determine garment type from image
 */
export const VISUAL_DETECTION_RULES = `
═══════════════════════════════════════════════════════════════
VISUAL GARMENT TYPE DETECTION
═══════════════════════════════════════════════════════════════

To determine if a garment is SHORT_KURTA or LONG_KURTA, use these VISUAL cues:

1️⃣ LOCATE THE HIP BONE:
   The hip bone is the widest part of the hips, typically visible as a bulge.

2️⃣ LOCATE THE KNEE:
   The knee is the joint in the middle of the leg.

3️⃣ MEASURE HEMLINE POSITION:
   
   IF hemline is between HIP and KNEE:
   ├─ Closer to hip (within 4-6 inches below hip)
   │  → SHORT_KURTA
   │
   └─ Closer to knee (within 4-6 inches from knee)
      → LONG_KURTA

   IF hemline is AT or BELOW KNEE:
   → LONG_KURTA (100% certain)
   
   IF hemline is AT or ABOVE HIP:
   → SHIRT or SHORT_KURTA (check length - if < 6 inches below waist → SHIRT)

═══════════════════════════════════════════════════════════════
CRITICAL: THE KNEE TEST
═══════════════════════════════════════════════════════════════

🔴 ABSOLUTE RULE:
   If hemline reaches the KNEE → It is a LONG_KURTA
   If hemline does NOT reach the KNEE → It is a SHORT_KURTA

NO EXCEPTIONS TO THIS RULE.

═══════════════════════════════════════════════════════════════
COMMON MISTAKES TO AVOID
═══════════════════════════════════════════════════════════════

❌ WRONG: "The kurta looks long, so it's a LONG_KURTA"
✅ RIGHT: "Check the HEMLINE. Does it reach the KNEE? If NO → SHORT_KURTA"

❌ WRONG: "The fabric is flowing, so it must be a LONG_KURTA"
✅ RIGHT: "Ignore the flow. WHERE does the hemline END? Above knee → SHORT_KURTA"

❌ WRONG: "It covers the thighs, so it's long"
✅ RIGHT: "Covering thighs ≠ long. Does it reach KNEE? If NO → SHORT_KURTA"
`

/**
 * GENERATION CONSTRAINTS
 * 
 * Rules for generating garments with correct length
 */
export function buildGarmentLengthConstraints(garmentType: string, hemlinePosition: string): string {
    const positionData = HEMLINE_POSITION_CHART[garmentType as keyof typeof HEMLINE_POSITION_CHART]

    if (!positionData) {
        return `Apply garment of type: ${garmentType}`
    }

    return `
═══════════════════════════════════════════════════════════════
GARMENT LENGTH ENFORCEMENT: ${garmentType}
═══════════════════════════════════════════════════════════════

DETECTED FROM IMAGE 2:
• Garment type: ${garmentType}
• Hemline position: ${hemlinePosition}

MANDATORY RULES FOR ${garmentType}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Hemline MUST end at: ${positionData.hemline}
• Visual rule: ${positionData.visualRule}
• Maximum length: ${positionData.maxLength}
• Minimum length: ${positionData.minLength}
• Reference: ${positionData.reference}

${positionData.CRITICAL ? `
🔴 CRITICAL WARNING:
${positionData.CRITICAL}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION (BEFORE OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check the hemline in your output:
${garmentType === 'SHORT_KURTA' ? `
□ Does the hemline reach the KNEE? → If YES, you FAILED (it's too long)
□ Does the hemline end above mid-thigh? → If YES, you FAILED (it's too short)
□ Does the hemline end at HIP to upper MID-THIGH? → If YES, CORRECT ✓
` : ''}

${garmentType === 'LONG_KURTA' ? `
□ Does the hemline reach the KNEE or go past it? → If YES, CORRECT ✓
□ Does the hemline end above the knee? → If YES, you FAILED (it's too short)
` : ''}

If validation fails → REGENERATE with correct hemline position.
`.trim()
}

/**
 * Anti-hallucination constraints for kurtas specifically
 */
export const KURTA_ANTI_HALLUCINATION = `
═══════════════════════════════════════════════════════════════
KURTA ANTI-HALLUCINATION RULES
═══════════════════════════════════════════════════════════════

🚫 DO NOT EXTEND THE GARMENT BEYOND WHAT YOU SEE

If Image 2 shows a SHORT_KURTA (ends at hip/upper thigh):
✗ DO NOT extend it to the knee
✗ DO NOT make it flow down
✗ DO NOT add extra length
✓ Keep it at the EXACT length shown in Image 2

If Image 2 shows a LONG_KURTA (reaches knee or past):
✓ Keep it at the EXACT length shown in Image 2
✗ DO NOT shorten it

═══════════════════════════════════════════════════════════════
THE MODEL'S COMMON MISTAKE
═══════════════════════════════════════════════════════════════

⚠️  YOU (THE MODEL) TEND TO:
• See a SHORT_KURTA and extend it to knee-length
• Assume all kurtas are "traditional long kurtas"
• Make kurtas longer than they actually are in the reference

🛑 STOP DOING THIS.

The kurta in Image 2 has a SPECIFIC length.
Copy that EXACT length. Do not change it.

If the reference shows hemline at HIP → Output hemline at HIP
If the reference shows hemline at KNEE → Output hemline at KNEE

EXACT COPY. NO LENGTH CHANGES.
`
