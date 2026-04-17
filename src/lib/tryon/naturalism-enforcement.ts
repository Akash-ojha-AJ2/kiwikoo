/**
 * NATURALISM ENFORCEMENT
 * 
 * Addresses three critical issues:
 * 1. Face drift - Strengthens pixel-level face matching
 * 2. Stiff poses - Enforces natural, relaxed human poses
 * 3. Unrealism - Forces real-world photographic imperfections
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// FACE DRIFT PREVENTION (PIXEL-LEVEL MATCHING)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_DRIFT_PREVENTION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE DRIFT PREVENTION (PIXEL-LEVEL)                        ║
║              Face must be IDENTICAL - No drift, no changes                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: FACE DRIFT = GENERATION FAILURE 🚨

THE FACE IN YOUR OUTPUT MUST BE PIXEL-IDENTICAL TO IMAGE 1.

FACE MATCHING PROTOCOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ANALYZE FACE IN IMAGE 1
• Measure eye-to-eye distance
• Measure nose width at nostrils
• Measure mouth width
• Measure jaw width
• Note exact skin tone (RGB values)
• Note exact expression (smile intensity, eye squint)

STEP 2: COPY FACE PIXEL-BY-PIXEL
• For every pixel in the face region (forehead to chin, ear to ear):
  → Read RGB value from Image 1
  → Write IDENTICAL RGB value to output
  → NO interpolation
  → NO smoothing
  → NO color correction

STEP 3: VERIFY BEFORE OUTPUT
• Compare output face to Image 1:
  □ Eye spacing matches? (must be identical)
  □ Nose width matches? (must be identical)
  □ Lip shape matches? (must be identical)
  □ Skin tone matches? (must be identical)
  □ Expression matches? (must be identical)

IF ANY CHECK FAILS → DO NOT OUTPUT → REGENERATE.

FACE DRIFT INDICATORS (WILL CAUSE REJECTION):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Eyes look different (size, shape, spacing)
❌ Nose looks different (width, length, shape)
❌ Lips look different (thickness, width, shape)
❌ Jawline looks different (width, contour)
❌ Skin tone looks different (lighter, darker, different undertone)
❌ Expression looks different (smile changed, eyes changed)
❌ Face looks "better" or "cleaner" than Image 1
❌ Face looks like a different person

IF YOU SEE ANY OF THESE → YOUR OUTPUT IS INVALID.

FACE REGION DEFINITION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Face region = forehead hairline to chin bottom, left ear to right ear.
Extend 5% margin beyond visible face for safety.
This entire region is READ-ONLY from Image 1.

DO NOT GENERATE ANY PIXELS IN THIS REGION.
COPY ONLY.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL POSE ENFORCEMENT (NO STIFFNESS)
// ═══════════════════════════════════════════════════════════════════════════════

export const NATURAL_POSE_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    NATURAL POSE ENFORCEMENT                                    ║
║              Human-casual poses • No stiffness • No mannequin                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: STIFF POSES = UNREALISTIC = GENERATION FAILURE 🚨

POSES MUST BE NATURAL, RELAXED, AND HUMAN-LIKE.

NATURAL POSE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PRESERVE ORIGINAL POSE FROM IMAGE 1
   • If person is sitting → keep sitting
   • If person is standing → keep standing
   • If person is leaning → keep leaning
   • If arms are crossed → keep crossed
   • If hands are at sides → keep at sides
   • DO NOT change the pose structure

2. ADD NATURAL RELAXATION (IF NEEDED)
   • Slight weight shift to one leg (not perfectly centered)
   • One shoulder slightly lower than the other (natural asymmetry)
   • Arms slightly bent, not straight (unless Image 1 shows straight)
   • Hands relaxed, fingers not perfectly straight
   • Head slightly tilted (not perfectly straight)

3. BAN STIFF POSES
   ❌ Perfectly straight arms
   ❌ Perfectly centered stance
   ❌ Perfect symmetry
   ❌ Mannequin-like posture
   ❌ Fashion runway stance
   ❌ "T-pose" or "A-pose" stiffness
   ❌ Hands in perfect positions
   ❌ Perfectly aligned body

4. ENFORCE HUMAN IMPERFECTIONS
   ✓ Slight asymmetry in shoulders
   ✓ One hip slightly higher
   ✓ Natural weight distribution
   ✓ Relaxed muscle tone
   ✓ Casual, unposed feeling

POSE EXAMPLES (GOOD):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Standing with weight on one leg, other leg slightly bent
✓ One hand in pocket, other at side
✓ Arms slightly bent, relaxed
✓ Head slightly tilted or turned
✓ Shoulders not perfectly level
✓ Casual, candid feeling

POSE EXAMPLES (BAD - DO NOT USE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Perfectly straight arms at sides
❌ Perfectly centered, symmetrical stance
❌ Hands in identical positions
❌ Perfectly level shoulders
❌ Mannequin-like stiffness
❌ Fashion model pose

IF POSE LOOKS STIFF → YOUR OUTPUT IS INVALID.

REFERENCE: Think of casual phone photos, not fashion shoots.
Think of how real people stand in everyday photos.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// REALISM ENFORCEMENT (NO AI PERFECTION)
// ═══════════════════════════════════════════════════════════════════════════════

export const REALISM_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    REALISM ENFORCEMENT                                        ║
║              Real-world imperfections • Phone camera • Human photography       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: AI PERFECTION = UNREALISTIC = GENERATION FAILURE 🚨

THE OUTPUT MUST LOOK LIKE A REAL PHONE PHOTO, NOT AN AI RENDER.

REALISM REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CAMERA IMPERFECTIONS (REQUIRED)
   ✓ Slight motion blur (if person is moving)
   ✓ Natural noise/grain (not over-processed)
   ✓ Slight focus falloff (background slightly blurry)
   ✓ Imperfect exposure (not HDR-perfect)
   ✓ Natural sharpness (not over-sharpened)
   ✓ Slight lens distortion (phone camera feel)

2. SKIN TEXTURE (REQUIRED)
   ✓ Visible pores (not plastic-smooth)
   ✓ Natural skin variations (not uniform)
   ✓ Slight blemishes or marks (if present in Image 1)
   ✓ Natural skin tone variation
   ✓ NO over-smoothing
   ✓ NO plastic look

3. FABRIC REALISM (REQUIRED)
   ✓ Wrinkles and folds (natural gravity)
   ✓ Fabric weight visible (draping)
   ✓ Stitch lines visible (not perfect)
   ✓ Natural fabric texture (not flat)
   ✓ Slight imperfections (real clothing)

4. BACKGROUND REALISM (REQUIRED)
   ✓ Imperfect alignment (not perfectly straight)
   ✓ Natural clutter (not empty)
   ✓ Real objects (not generic)
   ✓ Natural depth (not flat)
   ✓ Slight imperfections (cracks, wear, etc.)

5. LIGHTING REALISM (REQUIRED)
   ✓ Uneven highlights (not uniform)
   ✓ Natural shadows (not perfect)
   ✓ One light source (not multiple)
   ✓ Natural color temperature (not graded)
   ✓ NO studio lighting
   ✓ NO beauty lighting

UNREALISM INDICATORS (WILL CAUSE REJECTION):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Perfectly smooth skin (plastic look)
❌ Perfectly clean background
❌ Perfectly even lighting
❌ Over-sharpened details
❌ HDR-like perfection
❌ Studio lighting quality
❌ Cinematic grading
❌ Perfect symmetry everywhere
❌ No imperfections anywhere

IF OUTPUT LOOKS "TOO PERFECT" → YOUR OUTPUT IS INVALID.

REALISM CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before output, verify:
□ Does it look like a phone photo? (YES/NO)
□ Are there natural imperfections? (YES/NO)
□ Is skin texture realistic? (YES/NO)
□ Is lighting natural? (YES/NO)
□ Does it feel "lived-in"? (YES/NO)

IF ANY ANSWER IS "NO" → ADD MORE REALISM → REGENERATE.

REFERENCE: Compare to random WhatsApp photos, not AI art.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED NATURALISM ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function getNaturalismEnforcement(): string {
  return `
${FACE_DRIFT_PREVENTION}

${NATURAL_POSE_ENFORCEMENT}

${REALISM_ENFORCEMENT}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logNaturalismEnforcementStatus(sessionId: string): void {
  console.log(`   🎭 Naturalism Enforcement: ACTIVE [${sessionId}]`)
  console.log(`      Face Drift Prevention: Pixel-level matching`)
  console.log(`      Natural Poses: Human-casual, no stiffness`)
  console.log(`      Realism: Phone camera, imperfections required`)
}

