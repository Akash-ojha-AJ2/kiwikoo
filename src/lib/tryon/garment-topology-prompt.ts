/**
 * GARMENT TOPOLOGY PROMPT INJECTION
 * 
 * Injects topology-aware constraints into Nano Banana prompts.
 * 
 * These are NON-NEGOTIABLE rules that the image model MUST follow.
 * The topology is SYSTEM-DEFINED and cannot be overridden.
 */

import 'server-only'
import type { GarmentTopology, GarmentTopologyResult } from './garment-topology-classifier'

// ═══════════════════════════════════════════════════════════════════════════════
// TOPOLOGY LOCK PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the absolute topology lock prompt for TOP_ONLY garments.
 */
export const TOP_ONLY_LOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    GARMENT TOPOLOGY LOCK — ABSOLUTE                            ║
║                        Topology: TOP_ONLY                                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THIS IS SYSTEM-DEFINED AND FINAL. DO NOT OVERRIDE.

TOPOLOGY RULES:
• The top MUST end ABOVE the hip line
• The top MUST NOT form a continuous full-length silhouette
• Under NO circumstances convert the top into a dress
• Under NO circumstances extend the top below hip level

MANDATORY REQUIREMENTS:
• Generate a SEPARATE lower garment (pants or skirt)
• Lower garment MUST be:
  - Plain (no patterns)
  - Neutral color (black, navy, charcoal, beige)
  - Fitted and practical
  - Clearly separate from the top

TOP AND BOTTOM MUST REMAIN STRUCTURALLY SEPARATE.

VIOLATION CHECK:
If the garment extends below hip line → STOP and regenerate
If pants/skirt are missing → STOP and regenerate
If top flows into a dress silhouette → STOP and regenerate

THE MODEL RENDERS PIXELS. THE SYSTEM DECIDES STRUCTURE.
`

/**
 * Get the absolute topology lock prompt for DRESS garments.
 */
export const DRESS_LOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    GARMENT TOPOLOGY LOCK — ABSOLUTE                            ║
║                         Topology: DRESS                                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THIS IS SYSTEM-DEFINED AND FINAL. DO NOT OVERRIDE.

TOPOLOGY RULES:
• The dress MUST extend to its natural length as shown in reference
• The dress MUST NOT be truncated or converted to a top
• Maintain the continuous full-length silhouette

FORBIDDEN:
• Do NOT add separate pants or skirt
• Do NOT shorten the dress
• Do NOT treat this as a top

THE MODEL RENDERS PIXELS. THE SYSTEM DECIDES STRUCTURE.
`

/**
 * Get the absolute topology lock prompt for TWO_PIECE garments.
 */
export const TWO_PIECE_LOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    GARMENT TOPOLOGY LOCK — ABSOLUTE                            ║
║                       Topology: TWO_PIECE                                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THIS IS SYSTEM-DEFINED AND FINAL. DO NOT OVERRIDE.

TOPOLOGY RULES:
• Both top AND bottom pieces from the reference MUST be included
• Maintain the set as a coordinated outfit
• Both pieces must match the reference exactly

THE MODEL RENDERS PIXELS. THE SYSTEM DECIDES STRUCTURE.
`

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build topology-aware prompt injection based on classification result.
 */
export function buildTopologyPromptInjection(
    topologyResult: GarmentTopologyResult
): string {
    let topologyBlock: string

    switch (topologyResult.topology) {
        case 'TOP_ONLY':
            topologyBlock = TOP_ONLY_LOCK
            break
        case 'DRESS':
            topologyBlock = DRESS_LOCK
            break
        case 'TWO_PIECE':
            topologyBlock = TWO_PIECE_LOCK
            break
        default:
            topologyBlock = TOP_ONLY_LOCK  // Default to safest option
    }

    // Add classification context
    const context = `
[GARMENT ANALYSIS RESULT]
Detected Topology: ${topologyResult.topology}
Classification Confidence: ${(topologyResult.confidence * 100).toFixed(0)}%
Reason: ${topologyResult.reason}
Pants Required: ${topologyResult.requiresPants ? 'YES - MANDATORY' : 'NO'}
`

    return `
${context}
${topologyBlock}
`.trim()
}

/**
 * Get a concise topology reminder for token-constrained contexts.
 */
export function getTopologyReminder(topology: GarmentTopology): string {
    switch (topology) {
        case 'TOP_ONLY':
            return `
TOPOLOGY: TOP_ONLY
- Top ends ABOVE hip
- MUST include pants/skirt
- NEVER extend to dress
- Top and bottom are SEPARATE
`.trim()
        case 'DRESS':
            return `
TOPOLOGY: DRESS
- Full-length garment
- NO separate pants
- Maintain dress silhouette
`.trim()
        case 'TWO_PIECE':
            return `
TOPOLOGY: TWO_PIECE
- Include BOTH pieces
- Maintain set coordination
`.trim()
        default:
            return ''
    }
}

/**
 * Get pants generation instruction for TOP_ONLY topologies.
 */
export function getPantsInstruction(): string {
    return `
PANTS GENERATION (MANDATORY):
Since the reference shows a TOP ONLY, you MUST generate lower garment:

1. PANTS ARE REQUIRED - not optional
2. Style: Fitted, practical, appropriate to outfit
3. Color: Neutral (black, navy, charcoal, or beige)
4. Pattern: NONE - solid color only
5. Length: Full length or appropriate to style
6. Priority: Pants are secondary to top, do not distract

The person CANNOT appear without lower body covering.
If unsure, default to slim-fit black pants.
`.trim()
}

/**
 * Log that topology injection was applied.
 */
export function logTopologyInjection(topologyResult: GarmentTopologyResult): void {
    console.log('\n👗 TOPOLOGY PROMPT INJECTION APPLIED')
    console.log('   ═══════════════════════════════════════')
    console.log(`   ✓ Topology: ${topologyResult.topology}`)
    console.log(`   ✓ Confidence: ${(topologyResult.confidence * 100).toFixed(0)}%`)
    console.log(`   ✓ Pants Required: ${topologyResult.requiresPants ? 'YES' : 'NO'}`)
    console.log('   ═══════════════════════════════════════')
}
