/**
 * UNIFIED GENERATION ARCHITECTURE
 * 
 * CRITICAL SHIFT: Face and body are ONE person in ONE lighting environment
 * 
 * OLD (WRONG) APPROACH:
 * - Copy face pixels from Image 1 (with old lighting)
 * - Generate body with new lighting
 * - Result: Composite look
 * 
 * NEW (CORRECT) APPROACH:
 * - Lock face GEOMETRY from Image 1
 * - Generate ENTIRE person in unified new lighting
 * - Result: Natural, cohesive image
 */

import 'server-only'

/**
 * IDENTITY-PRESERVING RELIGHT
 * 
 * The face is not COPIED - it is REGENERATED with locked geometry
 */
export const IDENTITY_PRESERVING_RELIGHT = `
═══════════════════════════════════════════════════════════════
UNIFIED GENERATION ARCHITECTURE (CRITICAL)
═══════════════════════════════════════════════════════════════

⚠️  YOU ARE GENERATING ONE PERSON, NOT COMPOSITING IMAGES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST DO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **ANALYZE Image 1** for identity constraints:
   - Face shape, features, proportions (LOCK THESE)
   - Body shape, proportions, build (LOCK THESE)
   - Skin tone (REFERENCE, but relight in new scene)

2. **GENERATE ENTIRE PERSON** in the new scene:
   - Same face geometry as Image 1
   - Same body proportions as Image 1
   - BUT with lighting from the NEW scene
   - With garment from Image 2

3. **UNIFIED LIGHTING** across face + body:
   - ONE light source
   - Face and body receive SAME light
   - Consistent shadow direction
   - Consistent color temperature
   - Natural transition from face → neck → body

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEOMETRY LOCK (NOT PIXEL COPY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From Image 1, extract and LOCK:

**FACE GEOMETRY:**
- Exact face shape (round, oval, square, etc.)
- Exact feature positions:
  • Eye spacing (distance between eyes)
  • Eye size and shape
  • Nose width and length
  • Mouth width and shape
  • Jawline contour
  • Cheekbone position
  • Forehead height
  • Chin shape

**FACE TEXTURE (NOT LIGHTING):**
- Skin texture detail (pores, marks) → PRESERVE
- Facial hair pattern → PRESERVE
- Wrinkles, scars → PRESERVE

**BUT RELIGHT:**
- Shadow placement → NEW SCENE LIGHTING
- Highlight positions → NEW SCENE LIGHTING
- Skin brightness → NEW SCENE LIGHTING
- Color cast → NEW SCENE LIGHTING

**BODY GEOMETRY:**
- Shoulder width → EXACT
- Torso proportions → EXACT
- Arm thickness → EXACT
- Neck width → EXACT
- Body weight/build → EXACT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE RELIGHTING CONCEPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Think of this like a photo shoot:

**SAME PERSON** (from Image 1):
- Exact same face
- Exact same body
- Exact same identity

**DIFFERENT PHOTO** (new scene):
- New lighting setup
- New garment
- New background
- New pose (subtle)

RESULT: The SAME person photographed in a NEW environment.

NOT: A face from one photo pasted onto a body from another photo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNIFIED LIGHT SOURCE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Imagine ONE WINDOW or ONE LIGHT in the scene.

This light hits:
✓ The person's face (creates shadows/highlights)
✓ The person's neck (same light angle)
✓ The person's chest (same light angle)
✓ The person's arms (same light angle)
✓ The garment they're wearing (same light)

ALL receive light from the SAME SOURCE at the SAME ANGLE.

Example:
If light comes from TOP-LEFT:
- Face: Highlight on left cheek, shadow on right cheek
- Neck: Highlight on left side, shadow on right side
- Chest: Highlight on left shoulder, shadow on right shoulder
- The lighting is COHERENT and NATURAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE-NECK-BODY TRANSITION (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The face, neck, and body are ONE continuous surface.

Light gradient should be SMOOTH:
1. Face (lit by scene light)
2. → Jaw (slight shadow if light is from side/top)
3. → Neck (continues the lighting from face)
4. → Collarbone area (smooth transition)
5. → Chest (same lighting continues)

NO VISIBLE SEAMS.
NO COLOR BREAKS.
NO LIGHTING DISCONTINUITIES.

The transition should be as natural as looking at a real person.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITY VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After generation, the face MUST be recognizable as Image 1.

CHECK:
□ Face shape matches Image 1?
□ Eye spacing matches Image 1?
□ Nose shape matches Image 1?
□ Jawline matches Image 1?
□ Facial features in same positions?

BUT ALSO CHECK:
□ Face lighting matches body lighting?
□ Shadow direction consistent face → body?
□ No visible composite seam?
□ Natural transition face → neck → body?

If identity doesn't match → FAILED
If lighting is composite → FAILED

BOTH must pass.

═══════════════════════════════════════════════════════════════
KEY PRINCIPLE: GEOMETRY LOCK + LIGHTING UNIFY
═══════════════════════════════════════════════════════════════

LOCK: Face geometry, body proportions, identity
UNIFY: Lighting, shadows, color temperature, scene integration

Generate ONE person in ONE environment.
Not two images merged together.
`.trim()

/**
 * SCENE-AWARE IDENTITY CONSTRAINTS
 * 
 * How to preserve identity while relighting
 */
export const SCENE_AWARE_IDENTITY = `
═══════════════════════════════════════════════════════════════
SCENE-AWARE IDENTITY PRESERVATION
═══════════════════════════════════════════════════════════════

You are placing the SAME PERSON from Image 1 into a NEW SCENE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: EXTRACT IDENTITY INVARIANTS (from Image 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These NEVER change regardless of lighting:

**GEOMETRIC INVARIANTS:**
- Face shape structure (skull shape)
- Feature ratios (eye-to-nose distance, nose-to-mouth ratio)
- Bone structure (cheekbones, jawline, forehead)
- Body proportions (shoulder-to-waist ratio, limb lengths)

**TEXTURAL INVARIANTS:**
- Skin pores and texture detail
- Facial hair growth pattern
- Moles, scars, birthmarks
- Wrinkles and lines (depth and location)

**COLOR INVARIANTS (base, before lighting):**
- Intrinsic skin tone (before lighting modifies it)
- Hair color
- Lip color (natural, not lip gloss)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: APPLY NEW SCENE LIGHTING (to entire person)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The same person, but now photographed in the new scene:

**LIGHTING TRANSFORMS (applied uniformly):**
- Light direction → Creates shadows on face + body
- Light intensity → Brightens or dims face + body equally
- Color temperature → Shifts skin tone warm/cool on face + body
- Ambient occlusion → Darkens recessed areas (under chin, in clothing folds)

**EXAMPLE:**
Person from Image 1:
- Natural skin tone: Medium brown
- Face shape: Round
- Nose: Medium width

Same person in NEW SCENE (warm window light from left):
- Skin tone: Medium brown with WARM CAST (from scene light)
- Face shape: Round (UNCHANGED)
- Nose: Medium width (UNCHANGED)
- Left side of face: HIGHLIGHT (from window)
- Right side of face: SHADOW (opposite to window)
- Neck: SAME lighting pattern (highlight left, shadow right)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: VALIDATE COHERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identity preserved? → Face structure matches Image 1
Lighting unified? → Face and body share same light source
Natural transition? → No composite seams

ALL THREE must be true.

═══════════════════════════════════════════════════════════════
ANALOGY: ACTOR IN DIFFERENT SCENES
═══════════════════════════════════════════════════════════════

Think of the person in Image 1 as an actor.

Scene 1 (Image 1): Actor in their home, natural daylight
Scene 2 (Output): SAME ACTOR in a café, warm indoor light

The actor looks the same (face, body proportions).
But the lighting is different (new scene).

You would NEVER cut out the actor's face from Scene 1 and paste it into Scene 2.
You would photograph the SAME ACTOR in Scene 2 with Scene 2's lighting.

That's what you're doing here.
`.trim()
