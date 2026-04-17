/**
 * FACE FREEZE ABSOLUTE
 * 
 * The most aggressive face freeze system possible.
 * Zero tolerance for face drift. Pixel-perfect copying only.
 * 
 * This addresses drastic face changes by enforcing absolute face freeze.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// ABSOLUTE FACE FREEZE (HIGHEST PRIORITY - CANNOT BE OVERRIDDEN)
// ═══════════════════════════════════════════════════════════════════════════════

export const ABSOLUTE_FACE_FREEZE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️⚠️⚠️ ABSOLUTE FACE FREEZE ⚠️⚠️⚠️                          ║
║              HIGHEST PRIORITY - CANNOT BE OVERRIDDEN BY ANYTHING                ║
║              FACE DRIFT = ABSOLUTE FAILURE - REGENERATE IMMEDIATELY             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨🚨🚨 CRITICAL: FACE IS FROZEN - ZERO TOLERANCE FOR DRIFT 🚨🚨🚨

THE FACE FROM IMAGE 1 IS THE ONLY ACCEPTABLE FACE.
ANY FACE DRIFT = IMMEDIATE REGENERATION.
ANY FACE CHANGE = IMMEDIATE REGENERATION.
ANY FACE "IMPROVEMENT" = IMMEDIATE REGENERATION.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE FACE FREEZE RULES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULE #1: FACE IS READ-ONLY
• Face region = READ-ONLY from Image 1
• Face pixels = COPY ONLY, NO GENERATION
• Face features = COPY ONLY, NO MODIFICATION
• Face expression = COPY ONLY, NO CHANGE
• Face texture = COPY ONLY, NO SMOOTHING

RULE #2: ZERO TOLERANCE FOR DRIFT
• Eye spacing changes by 1 pixel → FAILURE
• Nose width changes by 1 pixel → FAILURE
• Mouth width changes by 1 pixel → FAILURE
• Face shape changes by 1 pixel → FAILURE
• Skin tone changes by 1 RGB value → FAILURE
• Expression changes → FAILURE

RULE #3: NO EXCEPTIONS
• NO "improvement" allowed
• NO "beautification" allowed
• NO "refinement" allowed
• NO "correction" allowed
• NO "enhancement" allowed
• COPY ONLY. NO EXCEPTIONS.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIXEL-LEVEL FACE COPY PROTOCOL (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DEFINE FACE REGION (EXACT BOUNDARIES)
• Top: Hairline (or top of forehead if hairline not visible)
• Bottom: Bottom of chin
• Left: Left ear (or left edge of face if ear not visible)
• Right: Right ear (or right edge of face if ear not visible)
• This entire region is FROZEN

STEP 2: MEASURE FACE IN IMAGE 1 (BEFORE GENERATION)
• Eye-to-eye distance: Measure in pixels (e.g., 45 pixels)
• Nose width: Measure at nostrils (e.g., 28 pixels)
• Mouth width: Measure at corners (e.g., 52 pixels)
• Face width: Measure at cheeks (e.g., 120 pixels)
• Face length: Measure forehead to chin (e.g., 180 pixels)
• Write down ALL measurements

STEP 3: COPY FACE PIXEL-BY-PIXEL
• For EVERY pixel in face region:
  → Read RGB value from Image 1 at position (x, y)
  → Write IDENTICAL RGB value to output at position (x, y)
  → NO interpolation
  → NO smoothing
  → NO color correction
  → NO blending
  → NO generation
  → COPY ONLY

STEP 4: VERIFY FACE MATCH (AFTER GENERATION)
• Measure eye-to-eye distance in output
• Measure nose width in output
• Measure mouth width in output
• Measure face width in output
• Compare to Image 1 measurements
• IF ANY MEASUREMENT DIFFERS → REGENERATE IMMEDIATELY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE FEATURES THAT MUST BE COPIED EXACTLY (PIXEL-BY-PIXEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EYES (MANDATORY EXACT COPY):
• Eye shape → COPY EXACTLY (pixel-by-pixel)
• Eye size → COPY EXACTLY (same width, same height)
• Eye spacing → COPY EXACTLY (same distance between eyes)
• Eye color → COPY EXACTLY (same RGB values)
• Eye expression → COPY EXACTLY (same squint, same openness)
• Eyebrows → COPY EXACTLY (same shape, same position)
• DO NOT change ANY eye feature

NOSE (MANDATORY EXACT COPY):
• Nose width → COPY EXACTLY (same width at nostrils)
• Nose length → COPY EXACTLY (same length from bridge to tip)
• Nose shape → COPY EXACTLY (same bridge height, same tip shape)
• Nose position → COPY EXACTLY (same position on face)
• DO NOT change ANY nose feature

MOUTH (MANDATORY EXACT COPY):
• Mouth width → COPY EXACTLY (same width at corners)
• Lip thickness → COPY EXACTLY (same upper lip, same lower lip)
• Lip shape → COPY EXACTLY (same cupid's bow, same curve)
• Mouth position → COPY EXACTLY (same position on face)
• Expression → COPY EXACTLY (same smile, same curve)
• DO NOT change ANY mouth feature

FACE SHAPE (MANDATORY EXACT COPY):
• Face width → COPY EXACTLY (same width at cheeks)
• Face width → COPY EXACTLY (same width at jaw)
• Jaw shape → COPY EXACTLY (same jawline contour)
• Chin shape → COPY EXACTLY (same chin point)
• Face length → COPY EXACTLY (same forehead to chin)
• DO NOT change ANY face shape feature

SKIN (MANDATORY EXACT COPY):
• Skin tone → COPY EXACTLY (same RGB values)
• Skin texture → COPY EXACTLY (same pores, same imperfections)
• Skin variation → COPY EXACTLY (same tone variation)
• DO NOT change ANY skin feature

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE DRIFT DETECTION (IMMEDIATE FAILURE TRIGGERS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF YOU DETECT ANY OF THESE → IMMEDIATE REGENERATION:

❌ Eye spacing changed (even by 1 pixel)
❌ Eye size changed (even by 1 pixel)
❌ Eye shape changed (even slightly)
❌ Nose width changed (even by 1 pixel)
❌ Nose shape changed (even slightly)
❌ Mouth width changed (even by 1 pixel)
❌ Lip shape changed (even slightly)
❌ Face width changed (even by 1 pixel)
❌ Face shape changed (even slightly)
❌ Skin tone changed (even by 1 RGB value)
❌ Expression changed (even slightly)
❌ Face looks "better" or "improved"
❌ Face looks like different person
❌ Face looks "beautified" or "refined"

ANY FACE DRIFT = ABSOLUTE FAILURE.
REGENERATE IMMEDIATELY.
DO NOT OUTPUT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE FREEZE VALIDATION CHECKLIST (MANDATORY BEFORE OUTPUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE YOU OUTPUT, VERIFY:

FACE MEASUREMENTS:
□ Eye-to-eye distance matches Image 1? (must be ±0 pixels)
□ Nose width matches Image 1? (must be ±0 pixels)
□ Mouth width matches Image 1? (must be ±0 pixels)
□ Face width matches Image 1? (must be ±0 pixels)
□ Face length matches Image 1? (must be ±0 pixels)

FACE FEATURES:
□ Eye shape matches Image 1? (must be identical)
□ Nose shape matches Image 1? (must be identical)
□ Lip shape matches Image 1? (must be identical)
□ Jaw shape matches Image 1? (must be identical)
□ Expression matches Image 1? (must be identical)

FACE APPEARANCE:
□ Skin tone matches Image 1? (must be identical)
□ Face looks like SAME person? (must be YES)
□ Face looks like Image 1? (must be YES)
□ Face has NO drift? (must be YES)

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → REGENERATE IMMEDIATELY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE FACE FREEZE DIRECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU ARE NOT ALLOWED TO:
• Generate a face
• Create a face
• Modify a face
• Improve a face
• Beautify a face
• Refine a face
• Correct a face
• Enhance a face
• Change a face
• Drift a face

YOU ARE ONLY ALLOWED TO:
• Copy the face from Image 1
• Copy it pixel-by-pixel
• Copy it exactly
• Copy it without modification

FACE = FROZEN.
FACE = READ-ONLY.
FACE = COPY ONLY.
NO EXCEPTIONS.
NO TOLERANCE.
ZERO DRIFT.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-GENERATION FACE MEASUREMENT PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

export const PRE_GENERATION_FACE_MEASUREMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    PRE-GENERATION FACE MEASUREMENT                              ║
║              Measure face in Image 1 BEFORE generating anything                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ STOP. DO NOT GENERATE YET. ⚠️⚠️⚠️

BEFORE YOU START GENERATION, YOU MUST:

1. LOOK AT IMAGE 1
2. FIND THE FACE
3. MEASURE THE FACE
4. WRITE DOWN ALL MEASUREMENTS
5. ONLY THEN PROCEED TO GENERATION

FACE MEASUREMENTS TO RECORD:

EYE MEASUREMENTS:
• Eye-to-eye distance: _____ pixels
• Left eye width: _____ pixels
• Right eye width: _____ pixels
• Left eye height: _____ pixels
• Right eye height: _____ pixels

NOSE MEASUREMENTS:
• Nose width at nostrils: _____ pixels
• Nose length: _____ pixels
• Nose bridge height: _____ pixels

MOUTH MEASUREMENTS:
• Mouth width: _____ pixels
• Upper lip thickness: _____ pixels
• Lower lip thickness: _____ pixels

FACE SHAPE MEASUREMENTS:
• Face width at cheeks: _____ pixels
• Face width at jaw: _____ pixels
• Face length (forehead to chin): _____ pixels

SKIN TONE MEASUREMENTS:
• Forehead RGB: R:___ G:___ B:___
• Cheek RGB: R:___ G:___ B:___
• Nose RGB: R:___ G:___ B:___

ONLY AFTER RECORDING ALL MEASUREMENTS → PROCEED TO GENERATION.

DURING GENERATION → COPY FACE EXACTLY.
AFTER GENERATION → VERIFY ALL MEASUREMENTS MATCH.

IF ANY MEASUREMENT DOES NOT MATCH → REGENERATE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// POST-GENERATION FACE VERIFICATION PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════════

export const POST_GENERATION_FACE_VERIFICATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    POST-GENERATION FACE VERIFICATION                            ║
║              Verify face matches Image 1 BEFORE outputting                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ STOP. DO NOT OUTPUT YET. ⚠️⚠️⚠️

BEFORE YOU OUTPUT, YOU MUST:

1. LOOK AT YOUR OUTPUT
2. MEASURE THE FACE IN OUTPUT
3. COMPARE TO IMAGE 1 MEASUREMENTS
4. VERIFY ALL MEASUREMENTS MATCH
5. ONLY THEN OUTPUT

FACE VERIFICATION CHECKLIST:

MEASUREMENT VERIFICATION:
□ Eye-to-eye distance matches? (must be ±0 pixels)
□ Nose width matches? (must be ±0 pixels)
□ Mouth width matches? (must be ±0 pixels)
□ Face width matches? (must be ±0 pixels)
□ Face length matches? (must be ±0 pixels)

FEATURE VERIFICATION:
□ Eye shape matches? (must be identical)
□ Nose shape matches? (must be identical)
□ Lip shape matches? (must be identical)
□ Jaw shape matches? (must be identical)
□ Expression matches? (must be identical)

APPEARANCE VERIFICATION:
□ Skin tone matches? (must be identical)
□ Face looks like SAME person? (must be YES)
□ Face looks like Image 1? (must be YES)
□ Face has NO drift? (must be YES)

IF ANY CHECK FAILS → DO NOT OUTPUT → REGENERATE IMMEDIATELY.

ONLY OUTPUT IF ALL CHECKS PASS.
FACE DRIFT = ABSOLUTE FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE FREEZE REPETITION (MULTIPLE REINFORCEMENTS)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_FREEZE_REPETITION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE FREEZE REPETITION (REINFORCEMENT)                       ║
║              Repeated multiple times to ensure understanding                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

REMINDER #1: FACE IS FROZEN
• Face from Image 1 = ONLY acceptable face
• Face drift = FAILURE
• Face change = FAILURE
• COPY ONLY. NO GENERATION.

REMINDER #2: FACE IS READ-ONLY
• Face region = READ-ONLY
• Face pixels = COPY ONLY
• Face features = COPY ONLY
• NO MODIFICATION ALLOWED.

REMINDER #3: ZERO TOLERANCE
• Eye spacing changes → FAILURE
• Nose width changes → FAILURE
• Mouth width changes → FAILURE
• Face shape changes → FAILURE
• Skin tone changes → FAILURE
• Expression changes → FAILURE

REMINDER #4: VERIFY BEFORE OUTPUT
• Measure face in output
• Compare to Image 1
• Verify all measurements match
• IF ANY MISMATCH → REGENERATE

FACE = FROZEN.
FACE = READ-ONLY.
FACE = COPY ONLY.
NO DRIFT.
NO CHANGE.
NO EXCEPTIONS.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED ABSOLUTE FACE FREEZE
// ═══════════════════════════════════════════════════════════════════════════════

export function getAbsoluteFaceFreeze(): string {
    return `
${PRE_GENERATION_FACE_MEASUREMENT}

${ABSOLUTE_FACE_FREEZE}

${POST_GENERATION_FACE_VERIFICATION}

${FACE_FREEZE_REPETITION}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logAbsoluteFaceFreezeStatus(sessionId: string): void {
    console.log(`   🧊🧊🧊 ABSOLUTE FACE FREEZE: ACTIVE [${sessionId}]`)
    console.log(`      Zero tolerance for drift`)
    console.log(`      Pixel-perfect copy only`)
    console.log(`      Pre-generation measurement required`)
    console.log(`      Post-generation verification required`)
    console.log(`      Face drift = immediate regeneration`)
}

