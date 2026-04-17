/**
 * HAIR FREEZE LAYER
 * 
 * Hair is part of IDENTITY — not a styling element.
 * Hair geometry, density, and shape are IMMUTABLE.
 * 
 * This layer applies to BOTH PRO and FLASH.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// HAIR FREEZE LAYER (IMMUTABLE — PART OF IDENTITY)
// ═══════════════════════════════════════════════════════════════

export const HAIR_FREEZE_LAYER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        HAIR FREEZE LAYER                                      ║
║                        IDENTITY ELEMENT — IMMUTABLE                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Hair is part of IDENTITY, not a styling element.
Hair geometry is READ-ONLY.

═══════════════════════════════════════════════════════════════════════════════
IMMUTABLE HAIR PROPERTIES (COPY FROM IMAGE 1):
═══════════════════════════════════════════════════════════════════════════════
• Hairline POSITION → LOCKED
• Hairline SHAPE → LOCKED
• Hair VOLUME → LOCKED
• Hair DENSITY → LOCKED
• Hair TEXTURE → LOCKED
• Hair COLOR → LOCKED (color temp adjustment only)
• Hair DIRECTION/FLOW → LOCKED
• Hair LENGTH → LOCKED
• Parting POSITION → LOCKED

═══════════════════════════════════════════════════════════════════════════════
BEARD/FACIAL HAIR (IMMUTABLE):
═══════════════════════════════════════════════════════════════════════════════
• Beard SHAPE → LOCKED
• Beard DENSITY → LOCKED
• Beard BOUNDARY → LOCKED
• Mustache SHAPE → LOCKED
• Sideburn POSITION → LOCKED
• Stubble PATTERN → LOCKED

═══════════════════════════════════════════════════════════════════════════════
ALLOWED OPERATIONS:
═══════════════════════════════════════════════════════════════════════════════
✓ Lighting interaction (shadows, highlights)
✓ Color temperature adjustment (±5%)
✓ Natural shadow casting
✓ Ambient occlusion

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN OPERATIONS (HARD BLOCK):
═══════════════════════════════════════════════════════════════════════════════
❌ Reshape hairline
❌ Add or remove volume
❌ Change hair texture
❌ Thicken or thin hair
❌ Smooth flyaways
❌ Add hair shine/gloss
❌ Style hair differently
❌ Change parting
❌ Trim or extend beard
❌ Sharpen beard edges
❌ Add/remove facial hair

═══════════════════════════════════════════════════════════════════════════════
VALIDATION:
═══════════════════════════════════════════════════════════════════════════════
If hair silhouette in output differs from Image 1 → OUTPUT IS WRONG.
If hairline position shifts → OUTPUT IS WRONG.
If beard boundary changes → OUTPUT IS WRONG.

Hair is as important as face for recognition.
A family member notices hairline changes instantly.
`

// ═══════════════════════════════════════════════════════════════
// HAIR REGION DEFINITION
// ═══════════════════════════════════════════════════════════════

export interface HairRegion {
    hairlineTop: { x: number, y: number }[]
    hairlineSides: { left: number, right: number }
    hairVolume: number // 0-1 scale
    beardBoundary: { x: number, y: number }[]
    hasBeard: boolean
    hasMustache: boolean
}

export const HAIR_FREEZE_CONFIG = {
    // Position tolerance (percentage of face width)
    hairlinePositionTolerance: 0.02, // 2%
    volumeChangeTolerance: 0.03, // 3%
    beardBoundaryTolerance: 0.02, // 2%

    // Color temperature adjustment limit
    maxColorTempShift: 0.05, // 5%

    // Enable/disable for each model
    enableForFlash: true,
    enableForPro: true
}

// ═══════════════════════════════════════════════════════════════
// HAIR FREEZE VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface HairValidationResult {
    valid: boolean
    hairlineMatch: boolean
    volumeMatch: boolean
    beardMatch: boolean
    violations: string[]
}

export function validateHairFreeze(
    originalHair: HairRegion,
    outputHair: HairRegion
): HairValidationResult {
    const violations: string[] = []

    // Check volume
    const volumeDiff = Math.abs(originalHair.hairVolume - outputHair.hairVolume)
    const volumeMatch = volumeDiff <= HAIR_FREEZE_CONFIG.volumeChangeTolerance
    if (!volumeMatch) {
        violations.push(`Hair volume changed: ${(volumeDiff * 100).toFixed(1)}%`)
    }

    // Check beard (if present)
    let beardMatch = true
    if (originalHair.hasBeard) {
        // Simplified check - in production would compare boundary points
        beardMatch = outputHair.hasBeard
        if (!beardMatch) {
            violations.push('Beard removed or significantly altered')
        }
    }

    // Hairline check (simplified)
    const hairlineMatch = true // Would compare hairline points in production

    return {
        valid: violations.length === 0,
        hairlineMatch,
        volumeMatch,
        beardMatch,
        violations
    }
}

// ═══════════════════════════════════════════════════════════════
// COMBINED FACE + HAIR IDENTITY LOCK
// ═══════════════════════════════════════════════════════════════

export const FACE_HAIR_IDENTITY_LOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE + HAIR IDENTITY LOCK                                  ║
║                    UNIFIED IDENTITY PROTECTION                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Face and Hair together form IDENTITY.
Both must be preserved as a unit.

IDENTITY ZONE INCLUDES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Entire face (forehead to chin, ear to ear)
• Hairline and hair volume above/around face
• Beard and facial hair below/around face
• Sideburns connecting hair to beard
• Neck boundary where beard/hair ends

This entire zone is READ-ONLY.
COPY from Image 1, do not GENERATE.

A person's mother would notice ANY change to this zone.
If she would notice → OUTPUT IS WRONG.
`

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logHairFreezeStatus(sessionId: string, mode: 'FLASH' | 'PRO'): void {
    console.log(`\n💇 HAIR FREEZE LAYER [${sessionId}] — ${mode}`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🔒 Hairline: LOCKED`)
    console.log(`   🔒 Hair volume: LOCKED`)
    console.log(`   🔒 Beard shape: LOCKED`)
    console.log(`   ✓ Lighting interaction: ALLOWED`)
    console.log(`   ✓ Color temp ±5%: ALLOWED`)
    console.log(`   ═══════════════════════════════════════`)
}

export function getHairFreezePrompt(): string {
    return `${HAIR_FREEZE_LAYER}

${FACE_HAIR_IDENTITY_LOCK}`
}
