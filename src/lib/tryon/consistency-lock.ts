/**
 * FACE & CLOTHING CONSISTENCY LOCK
 * 
 * Maximum strength consistency constraints for:
 * 1. Face - Exact pixel match with verification
 * 2. Clothing - Faithful garment reproduction
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// FACE CONSISTENCY LOCK — ZERO TOLERANCE FOR DEVIATION
// ═══════════════════════════════════════════════════════════════

export const FACE_CONSISTENCY_LOCK = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  👤 FACE CONSISTENCY LOCK — ZERO TOLERANCE                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ FACIAL RECOGNITION MUST PASS — THIS IS NOT OPTIONAL ★★★

The generated face must pass a facial recognition comparison with Image 1.
If a computer vision system would say "different person" → GENERATION FAILED.

═══════════════════════════════════════════════════════════════════════════════
BIOMETRIC LANDMARKS (MUST BE IDENTICAL)
═══════════════════════════════════════════════════════════════════════════════

These measurements define a person's identity. They CANNOT change:

1. INTER-PUPILLARY DISTANCE
   Distance between eye centers → EXACT from Image 1
   
2. EYE-TO-NOSE RATIO
   Distance from eye line to nose tip → EXACT from Image 1
   
3. NOSE-TO-MOUTH RATIO
   Distance from nose tip to mouth center → EXACT from Image 1
   
4. MOUTH-TO-CHIN RATIO
   Distance from mouth to chin tip → EXACT from Image 1
   
5. FACE WIDTH-TO-HEIGHT RATIO
   Overall face proportions → EXACT from Image 1
   
6. JAW ANGLE
   Angle of jawline from ear to chin → EXACT from Image 1
   
7. CHEEKBONE PROMINENCE
   How far cheekbones protrude → EXACT from Image 1
   
8. NOSE BRIDGE ANGLE
   Angle of nose from forehead → EXACT from Image 1
   
9. LIP RATIO
   Upper lip to lower lip ratio → EXACT from Image 1
   
10. BROW BONE PROMINENCE
    Forehead ridge visibility → EXACT from Image 1

═══════════════════════════════════════════════════════════════════════════════
IDENTITY VERIFICATION QUESTIONS
═══════════════════════════════════════════════════════════════════════════════

Before outputting, the model MUST answer YES to ALL:

□ Would this person's mother recognize them immediately?
□ Would Face ID unlock their phone?
□ Would their passport photo match?
□ Would their friends say "that's definitely you"?
□ Are the eyes the SAME eyes (not similar, SAME)?
□ Is the nose the SAME nose?
□ Is the jawline the SAME jawline?
□ Are the lips the SAME lips?
□ Is the smile the SAME smile (if smiling)?
□ Is the skin texture the SAME (not smoothed)?

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → TRY AGAIN

═══════════════════════════════════════════════════════════════════════════════
COMMON FACE CHANGES TO BLOCK
═══════════════════════════════════════════════════════════════════════════════

These are AUTOMATIC FAILS:

✗ Eyes slightly larger or rounder → BLOCKED
✗ Nose slightly slimmer → BLOCKED
✗ Face slightly slimmer → BLOCKED
✗ Jawline more defined → BLOCKED
✗ Skin smoother/airbrushed → BLOCKED
✗ Expression changed → BLOCKED
✗ Teeth different → BLOCKED
✗ Eye color different → BLOCKED
✗ Eyebrow shape different → BLOCKED
✗ Forehead height different → BLOCKED
✗ Cheek volume different → BLOCKED
✗ Double chin removed → BLOCKED
✗ Wrinkles removed → BLOCKED
✗ Pores removed → BLOCKED
✗ Moles/freckles removed → BLOCKED

THE FACE IN IMAGE 1 IS PERFECT AS-IS. DO NOT "IMPROVE" IT.
`

// ═══════════════════════════════════════════════════════════════
// CLOTHING CONSISTENCY — FAITHFUL GARMENT REPRODUCTION
// ═══════════════════════════════════════════════════════════════

export const CLOTHING_CONSISTENCY = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  👗 CLOTHING CONSISTENCY — FAITHFUL REPRODUCTION                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ THE GARMENT MUST MATCH IMAGE 2 EXACTLY ★★★

═══════════════════════════════════════════════════════════════════════════════
GARMENT ATTRIBUTES TO PRESERVE
═══════════════════════════════════════════════════════════════════════════════

1. COLOR
   □ Exact color (not "similar" — EXACT)
   □ Match the HUE precisely
   □ Match the SATURATION precisely
   □ Match the BRIGHTNESS precisely
   □ If mustard yellow → MUSTARD YELLOW (not golden, not orange-yellow)
   
2. PATTERN
   □ Pattern type (solid, polka dots, stripes, floral, etc.)
   □ Pattern scale (size of dots, width of stripes)
   □ Pattern spacing (distance between elements)
   □ Pattern color (contrast colors in pattern)
   □ Pattern orientation (vertical, horizontal, diagonal)
   
3. FABRIC TEXTURE
   □ Fabric type (cotton, silk, denim, etc.)
   □ Fabric sheen (matte, satin, glossy)
   □ Fabric weight (how it drapes)
   □ Fabric thickness
   □ Visible weave or texture
   
4. CONSTRUCTION DETAILS
   □ Neckline shape (round, V, square, etc.)
   □ Sleeve type (short, long, 3/4, sleeveless)
   □ Sleeve length (exact position on arm)
   □ Hemline (where it ends)
   □ Fit type (fitted, loose, A-line)
   
5. EMBELLISHMENTS
   □ Button style and placement
   □ Embroidery details
   □ Sequins or beading if present
   □ Lace or trim
   □ Pockets
   □ Zippers or closures

═══════════════════════════════════════════════════════════════════════════════
GARMENT ON BODY PHYSICS
═══════════════════════════════════════════════════════════════════════════════

The garment must drape REALISTICALLY on the user's body:

• Fabric wrinkles where body bends (elbows, waist if sitting)
• Fabric stretches slightly over curves
• Fabric hangs naturally with gravity
• Shadows appear under fabric folds
• Fabric moves with pose (not stiff)

═══════════════════════════════════════════════════════════════════════════════
GARMENT VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

Before outputting, verify:

□ Is this the SAME garment from Image 2?
□ Is the color an EXACT match?
□ Is the pattern EXACTLY the same?
□ Are all construction details correct?
□ Does it drape naturally on the body?
□ Would the garment's seller recognize their product?

═══════════════════════════════════════════════════════════════════════════════
COMMON GARMENT MISTAKES TO AVOID
═══════════════════════════════════════════════════════════════════════════════

✗ Color slightly off (too orange, too brown, etc.) → BLOCKED
✗ Pattern scale wrong (dots too big/small) → BLOCKED
✗ Pattern missing or simplified → BLOCKED
✗ Wrong neckline shape → BLOCKED
✗ Wrong sleeve length → BLOCKED
✗ Missing buttons or details → BLOCKED
✗ Fabric looks different (too shiny/matte) → BLOCKED
✗ Garment appears stiff/plastic → BLOCKED
✗ Garment floating or not fitting body → BLOCKED

THE USER IS TRYING TO SEE HOW THIS EXACT GARMENT LOOKS ON THEM.
A SIMILAR GARMENT IS NOT ACCEPTABLE.
`

// ═══════════════════════════════════════════════════════════════
// COMBINED CONSISTENCY PROMPT
// ═══════════════════════════════════════════════════════════════

export function getConsistencyLockPrompt(): string {
    return `
${FACE_CONSISTENCY_LOCK}

${CLOTHING_CONSISTENCY}

════════════════════════════════════════════════════════════════════════════════
DUAL CONSISTENCY MANDATE
════════════════════════════════════════════════════════════════════════════════

THIS GENERATION MUST SATISFY BOTH:

1. FACE CONSISTENCY
   • Person in output = SAME person from Image 1
   • Facial recognition would match
   • Friends/family would recognize immediately
   
2. CLOTHING CONSISTENCY
   • Garment in output = SAME garment from Image 2
   • Color, pattern, details EXACT match
   • Seller would recognize their product

BOTH MUST BE TRUE OR THE GENERATION FAILS.

GENERATE NOW.
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logConsistencyStatus(sessionId: string): void {
    console.log(`\n🔐 CONSISTENCY LOCK [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   👤 Face: BIOMETRIC LOCK`)
    console.log(`   👗 Clothing: FAITHFUL REPRODUCTION`)
    console.log(`   ✓ Both must pass verification`)
}
