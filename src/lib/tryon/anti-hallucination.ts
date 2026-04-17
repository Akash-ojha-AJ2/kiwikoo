/**
 * ANTI-HALLUCINATION CONSTRAINTS
 * 
 * CRITICAL: Model tends to hallucinate faces - PREVENT THIS
 */

import 'server-only'

export const FACE_IDENTITY_LOCK = `
═══════════════════════════════════════════════════════════════
🔒 FACE IDENTITY LOCK (ANTI-HALLUCINATION)
═══════════════════════════════════════════════════════════════

⚠️  CRITICAL: Do NOT hallucinate or change the face from Image 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE GEOMETRY MUST MATCH EXACTLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From Image 1, these are HARD CONSTRAINTS (DO NOT ALTER):

**FACE SHAPE:**
- Face outline/contour → EXACT SAME SHAPE
- Jaw shape → EXACT MATCH
- Chin shape → EXACT MATCH  
- Forehead shape → EXACT MATCH
- Cheek structure → EXACT MATCH

**EYE CHARACTERISTICS:**
- Eye shape → EXACT SAME SHAPE (almond, round, hooded, etc.)
- Eye size → EXACT SAME SIZE
- Eye spacing (distance between eyes) → EXACT SAME DISTANCE
- Eye tilt/angle → EXACT SAME ANGLE
- Upper/lower eyelid shape → EXACT MATCH
- Eyebrow shape → EXACT MATCH
- Eyebrow position → EXACT MATCH

**NOSE CHARACTERISTICS:**
- Nose width → EXACT SAME WIDTH
- Nose length → EXACT SAME LENGTH
- Nose bridge shape → EXACT MATCH
- Nostril shape → EXACT MATCH
- Nose tip shape → EXACT MATCH

**MOUTH CHARACTERISTICS:**
- Mouth width → EXACT SAME WIDTH
- Lip thickness (upper/lower) → EXACT MATCH
- Lip shape → EXACT MATCH
- Cupid's bow shape → EXACT MATCH

**EARS:**
- Ear shape → EXACT MATCH
- Ear size → EXACT MATCH
- Ear position → EXACT MATCH

**FACIAL HAIR:**
- Beard/mustache pattern → EXACT MATCH
- Hair thickness → EXACT MATCH
- Facial hair distribution → EXACT MATCH

**SKIN FEATURES:**
- Moles/birthmarks → SAME POSITIONS
- Scars → PRESERVE
- Skin texture → SAME QUALITY
- Wrinkles/lines → PRESERVE PATTERN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEASUREMENT RATIOS (MUST BE PRESERVED):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These proportions CANNOT change:
- Eye-to-eye distance : Face width ratio
- Nose width : Mouth width ratio
- Eye height : Nose height ratio
- Forehead height : Face length ratio

If Image 1 has:
- Eyes spaced 2.5 eye-widths apart → Output MUST be 2.5 eye-widths
- Nose width = 70% of mouth width → Output MUST be 70%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN CHANGE (LIGHTING ONLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Shadow placement (based on new scene light)
✓ Highlight positions (based on new scene light)
✓ Skin brightness/exposure (new lighting)
✓ Color temperature cast (warm/cool from scene)

✗ Face shape
✗ Feature sizes
✗ Feature positions
✗ Proportions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION CHECKLIST (BEFORE OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compare output face with Image 1:

□ Face shape matches? (outline comparison)
□ Eye shape matches? (shape, not just position)
□ Eye spacing matches? (measure distance)
□ Nose shape/width matches?
□ Mouth shape/width matches?
□ Jawline matches?
□ Facial hair matches? (if present)

If ANY answer is NO → REGENERATE with correct geometry

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON HALLUCINATION MISTAKES (AVOID):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ WRONG: "I'll make the face slightly more symmetrical"
✅ RIGHT: "Preserve exact asymmetry from Image 1"

❌ WRONG: "I'll adjust eye spacing to look better"
✅ RIGHT: "Keep exact eye spacing from Image 1"

❌ WRONG: "I'll make the nose more proportional"
✅ RIGHT: "Keep exact nose shape from Image 1"

❌ WRONG: "Face looks different due to lighting"
✅ RIGHT: "Lighting changes, face geometry NEVER changes"

═══════════════════════════════════════════════════════════════
IDENTITY = GEOMETRY, NOT LIGHTING
═══════════════════════════════════════════════════════════════

The same person can be photographed in:
- Bright light vs dim light
- Warm light vs cool light
- Hard shadows vs soft shadows

But their FACE GEOMETRY never changes.

Lock the geometry. Vary only the lighting.
`

export const VARIANT_CONSISTENCY = `
═══════════════════════════════════════════════════════════════
VARIANT CONSISTENCY (PREVENT FACE DRIFT)
═══════════════════════════════════════════════════════════════

When generating multiple variants (Option 1, 2, 3):

**THE FACE MUST BE IDENTICAL IN ALL VARIANTS**

Each variant shows:
- SAME PERSON (same face geometry)
- Different pose
- Different lighting/scene
- Same garment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORBIDDEN (COMMON VARIANT MISTAKE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ Variant 1: Round face
✗ Variant 2: Oval face (DIFFERENT PERSON!)
✗ Variant 3: Square face (DIFFERENT PERSON!)

✓ Variant 1: Same face, neutral pose
✓ Variant 2: Same face, dynamic pose
✓ Variant 3: Same face, relaxed pose

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITY ANCHOR (USE THIS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before generating each variant, remind yourself:

"I am photographing the SAME PERSON from Image 1.
Their face shape is: [describe from Image 1]
Their eye shape is: [describe from Image 1]
Their nose shape is: [describe from Image 1]

ALL variants must have these EXACT features."

This anchor prevents face drift across variants.
`
