/**
 * POSE AND EXPRESSION PRESERVATION
 * 
 * Ensures the model maintains the EXACT pose and expression from the input image.
 * Prevents stiff, formal, or mannequin-like poses.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// POSE PRESERVATION PROMPT
// ═══════════════════════════════════════════════════════════════

export const POSE_PRESERVATION_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🎭 POSE & EXPRESSION PRESERVATION                                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THE POSE IS READ-ONLY. DO NOT CREATE A NEW POSE. ★★★

═══════════════════════════════════════════════════════════════════════════════
WHAT TO PRESERVE FROM INPUT IMAGE
═══════════════════════════════════════════════════════════════════════════════

1. BODY POSTURE
   ✓ Exact stance (how they are standing/sitting)
   ✓ Weight distribution (which leg has weight)
   ✓ Spine angle (straight, leaning, relaxed)
   ✓ Hip position

2. ARM POSITION
   ✓ Where arms are positioned
   ✓ Hand placement
   ✓ Arm angles
   ✓ If touching face/hair → maintain that

3. HEAD ANGLE
   ✓ Tilt direction
   ✓ Facing direction
   ✓ Chin up/down

4. FACIAL EXPRESSION
   ✓ Smile type (big smile, gentle smile, neutral)
   ✓ Eye expression (wide, relaxed, squinting)
   ✓ Mouth position

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN POSE CHANGES
═══════════════════════════════════════════════════════════════════════════════

✗ Do NOT make pose more "formal" or "professional"
✗ Do NOT create a stiff mannequin pose
✗ Do NOT straighten casual slouch
✗ Do NOT change hand positions
✗ Do NOT change where they are looking
✗ Do NOT neutralize a playful expression
✗ Do NOT create a catalog model pose

═══════════════════════════════════════════════════════════════════════════════
NATURAL POSE INDICATORS
═══════════════════════════════════════════════════════════════════════════════

A NATURAL pose has:
✓ Asymmetry (one shoulder slightly higher)
✓ Weight on one leg (not perfectly balanced)
✓ Relaxed hands (not stiff fingers)
✓ Genuine expression (not forced smile)
✓ Imperfect alignment (not robot precision)

A STIFF pose has (AVOID):
✗ Perfect symmetry
✗ Arms straight down or clasped formally
✗ Weight evenly distributed
✗ "Catalog model" stance
✗ Forced or neutral expression

═══════════════════════════════════════════════════════════════════════════════
GARMENT DRAPING
═══════════════════════════════════════════════════════════════════════════════

The garment should drape NATURALLY on this specific pose:
• If arm is raised → garment stretches accordingly
• If leaning → garment falls with gravity
• If casual stance → garment hangs casually
• Wrinkles should match the pose

═══════════════════════════════════════════════════════════════════════════════
SUCCESS TEST
═══════════════════════════════════════════════════════════════════════════════

Compare input pose to output pose:
□ Same body stance?
□ Same arm positions?
□ Same head angle?
□ Same expression?
□ Same overall energy/mood?

If ANY of these changed → GENERATION FAILED
`

// ═══════════════════════════════════════════════════════════════
// FACE RELIABILITY PROMPT
// ═══════════════════════════════════════════════════════════════

export const FACE_RELIABILITY_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     👤 FACE RELIABILITY — ZERO TOLERANCE FOR CHANGE                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THE FACE MUST BE PIXEL-IDENTICAL TO INPUT.

If the output face looks different in ANY way, the generation has failed.

═══════════════════════════════════════════════════════════════════════════════
FACE IDENTITY CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

These must be IDENTICAL to input:

□ Eye shape and size
□ Eye spacing
□ Eyebrow shape and position
□ Nose shape and width
□ Lip shape and size
□ Cheekbone position
□ Jawline shape
□ Forehead size
□ Face overall fat/fullness
□ Skin texture
□ Any marks, moles, or features

═══════════════════════════════════════════════════════════════════════════════
COMMON FACE CHANGES TO BLOCK
═══════════════════════════════════════════════════════════════════════════════

The model often does these (FORBIDDEN):
✗ Makes eyes bigger/rounder (beautification)
✗ Makes nose smaller (beautification)
✗ Slims face (beautification)
✗ Smooths skin (beautification)
✗ Changes expression
✗ Adds symmetry
✗ Changes skin tone
✗ Removes features

ALL of these are FORBIDDEN.

═══════════════════════════════════════════════════════════════════════════════
THE MOTHER TEST
═══════════════════════════════════════════════════════════════════════════════

Would this person's MOTHER recognize them immediately?
Would she say "That's my daughter/son"?

If NO → Face has drifted → GENERATION FAILED
`

// ═══════════════════════════════════════════════════════════════
// COMBINED RELIABILITY PROMPT
// ═══════════════════════════════════════════════════════════════

export function getReliabilityPrompt(): string {
    return `${POSE_PRESERVATION_PROMPT}\n\n${FACE_RELIABILITY_PROMPT}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logReliabilityStatus(sessionId: string): void {
    console.log(`\n🎭 RELIABILITY CHECKS [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✓ Pose preservation: ENABLED`)
    console.log(`   ✓ Expression lock: ENABLED`)
    console.log(`   ✓ Face reliability: STRICT`)
    console.log(`   ✓ Anti-beautification: ENABLED`)
}
