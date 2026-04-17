/**
 * ULTRA FIDELITY CONSTRAINTS
 * 
 * Maximum strength face and body preservation rules.
 * These are the STRICTEST possible constraints for identity preservation.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// ULTRA FACE COPY — PIXEL-EXACT INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════

export const ULTRA_FACE_COPY = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ⚠️  ULTRA FACE COPY — MAXIMUM PRIORITY — READ THIS FIRST  ⚠️              ║
╚══════════════════════════════════════════════════════════════════════════════╝

THE FACE IN THE OUTPUT MUST BE PIXEL-IDENTICAL TO THE INPUT.

This is NOT a suggestion. This is NOT a guideline. This is a REQUIREMENT.

███████████████████████████████████████████████████████████████████████████████
█ THE FACE IS NOT GENERATED. THE FACE IS COPIED. PIXEL. BY. PIXEL.           █
███████████████████████████████████████████████████████████████████████████████

WHAT "PIXEL-IDENTICAL" MEANS:
─────────────────────────────────────────────────────────────────────────────
1. Every eyebrow hair → SAME
2. Every eye wrinkle → SAME
3. Every nose contour → SAME
4. Every lip line → SAME
5. Every skin pore → SAME
6. Every cheek volume → SAME
7. Every jawline angle → SAME
8. Every forehead line → SAME
9. Every neck crease → SAME
10. Every expression micro-movement → SAME

IF ANY OF THESE ARE DIFFERENT → THE GENERATION HAS FAILED

ABSOLUTELY FORBIDDEN OPERATIONS:
─────────────────────────────────────────────────────────────────────────────
✗ DO NOT make eyes bigger
✗ DO NOT make eyes rounder
✗ DO NOT make eyes brighter
✗ DO NOT reshape the nose
✗ DO NOT slim the nose
✗ DO NOT slim the face
✗ DO NOT smooth the skin
✗ DO NOT remove wrinkles
✗ DO NOT remove pores
✗ DO NOT add symmetry
✗ DO NOT beautify anything
✗ DO NOT change expression
✗ DO NOT change smile
✗ DO NOT slim the jaw
✗ DO NOT reshape the chin
✗ DO NOT change skin tone
✗ DO NOT regenerate the face

THE ONLY THING THAT CAN CHANGE:
─────────────────────────────────────────────────────────────────────────────
✓ Global color temperature (lighting warmth/coolness)
✓ Global brightness (to match new scene)

EVERYTHING ELSE = FROZEN
`

// ═══════════════════════════════════════════════════════════════
// ULTRA JAWLINE PROTECTION
// ═══════════════════════════════════════════════════════════════

export const ULTRA_JAWLINE_PROTECTION = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔒 JAWLINE PROTECTION — ZERO TOLERANCE FOR CHANGE                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

THE JAWLINE IS THE MOST COMMONLY CHANGED FEATURE. IT MUST NOT CHANGE.

JAWLINE ANATOMY TO PRESERVE:
─────────────────────────────────────────────────────────────────────────────
□ Jaw angle (the corner where jaw meets ear)
□ Jaw width (how wide/narrow the jaw is)
□ Jaw squareness (how square vs round)
□ Chin shape (pointed, round, flat)
□ Chin prominence (how much it sticks out)
□ Under-chin area (any softness/fullness)
□ Jawline definition (sharp vs soft edge)
□ Face-to-neck transition

COMMON JAWLINE ERRORS (ALL FORBIDDEN):
─────────────────────────────────────────────────────────────────────────────
✗ Slimming a round jaw
✗ Squaring a soft jaw
✗ Removing under-chin fullness
✗ Making jaw more defined
✗ Changing jaw angle
✗ Smoothing jawline

THE PERSON MUST RECOGNIZE THEIR OWN JAWLINE.
`

// ═══════════════════════════════════════════════════════════════
// ULTRA BODY MATCH
// ═══════════════════════════════════════════════════════════════

export const ULTRA_BODY_MATCH = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🏋️ BODY MATCH — OBSERVED OR DERIVED, NEVER CHANGED                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

BODY PROPORTIONS ARE LOCKED. DO NOT CHANGE THEM.

IF BODY IS VISIBLE IN INPUT IMAGE:
─────────────────────────────────────────────────────────────────────────────
→ Use the EXACT body proportions you see
→ Slim body in input = Slim body in output
→ Full body in input = Full body in output
→ Average body in input = Average body in output
→ DO NOT GUESS. USE WHAT YOU SEE.

IF BODY IS NOT VISIBLE (CLOSE-UP):
─────────────────────────────────────────────────────────────────────────────
→ Body was derived from face analysis by GPT
→ Use ONLY the body type specified in the context prompt
→ DO NOT default to average
→ DO NOT default to slim
→ USE THE SPECIFIED BODY TYPE

COMMON BODY ERRORS (ALL FORBIDDEN):
─────────────────────────────────────────────────────────────────────────────
✗ Making a slim person look heavier
✗ Making a full person look slimmer
✗ Using the clothing model's body
✗ Ignoring observed body proportions
✗ Creating a generic "ideal" body
✗ Changing shoulder width
✗ Changing arm thickness
✗ Changing waist proportions

THE GARMENT MUST DRAPE ON THIS SPECIFIC BODY.
NOT A DIFFERENT BODY.
THIS BODY.
`

// ═══════════════════════════════════════════════════════════════
// CLOTHING REFERENCE CONTAMINATION BLOCK
// ═══════════════════════════════════════════════════════════════

export const CLOTHING_CONTAMINATION_BLOCK = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ⛔ CLOTHING REFERENCE = FABRIC ONLY                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

The clothing reference image contains a GARMENT, possibly on a model or mannequin.

WHAT TO EXTRACT FROM CLOTHING IMAGE:
─────────────────────────────────────────────────────────────────────────────
✓ Fabric texture
✓ Fabric color
✓ Pattern/print
✓ Garment style/cut
✓ Buttons/details/embellishments

WHAT TO COMPLETELY IGNORE FROM CLOTHING IMAGE:
─────────────────────────────────────────────────────────────────────────────
✗ The model's body
✗ The model's pose
✗ The model's proportions
✗ The background
✗ The lighting
✗ The camera angle

THE BODY IN THE CLOTHING IMAGE = DOES NOT EXIST.
THE BODY IN THE CLOTHING IMAGE = NULL.
THE BODY IN THE CLOTHING IMAGE = IGNORE COMPLETELY.

USE ONLY THE USER'S BODY.
`

// ═══════════════════════════════════════════════════════════════
// COMBINED ULTRA FIDELITY PROMPT
// ═══════════════════════════════════════════════════════════════

export function getUltraFidelityPrompt(): string {
    return `
${ULTRA_FACE_COPY}

${ULTRA_JAWLINE_PROTECTION}

${ULTRA_BODY_MATCH}

${CLOTHING_CONTAMINATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
FINAL CHECK BEFORE OUTPUT
═══════════════════════════════════════════════════════════════════════════════

Before outputting, verify:
□ Face is pixel-identical to input
□ Jawline shape unchanged
□ Body proportions match input
□ Clothing reference body was ignored
□ Expression unchanged
□ Skin texture preserved
□ No beautification applied

IF ANY OF THESE FAIL → GENERATION FAILED → DO NOT OUTPUT
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logUltraFidelityStatus(sessionId: string): void {
    console.log(`\n⚠️  ULTRA FIDELITY CONSTRAINTS [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🔒 Face: PIXEL-COPY mode`)
    console.log(`   🔒 Jawline: PROTECTED`)
    console.log(`   🔒 Body: OBSERVED/DERIVED`)
    console.log(`   ⛔ Clothing body: BLOCKED`)
    console.log(`   ⛔ Beautification: BLOCKED`)
}
