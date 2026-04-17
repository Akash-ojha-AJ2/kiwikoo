/**
 * PRO-NATIVE SEMANTIC CONTROLS
 * 
 * CRITICAL: PRO ≠ FLASH
 * 
 * FLASH = deterministic, literal, pixel-copy
 * PRO = thinking, inferential, editorial
 * 
 * PRO must be GUIDED semantically, not FROZEN pixel-wise.
 * Pixel-lock language causes PRO to hallucinate and compensate.
 * 
 * 3-LAYER PRO EDITOR PIPELINE:
 * - LAYER 1: Identity Anchor (semantic invariants)
 * - LAYER 2: Scene Construction (structural constraints)
 * - LAYER 3: Editorial Refinement (local-only)
 */

import 'server-only'
import { getProLayerStack, logProLayerStatus } from './pro-layers'

// ═══════════════════════════════════════════════════════════════
// PRO PIXEL COPY FACE (HIGHEST PRIORITY — SAME AS FLASH)
// ═══════════════════════════════════════════════════════════════

export const PRO_PIXEL_COPY_FACE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    PRO PIXEL COPY FACE PROTOCOL                               ║
║                    IDENTICAL TO FLASH — NO EXCEPTIONS                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

RULE 0 (ABSOLUTE): The face in Image 1 is IMMUTABLE.
Do NOT generate face pixels. COPY them directly from Image 1.

This is NOT a suggestion. This is a HARD REQUIREMENT.

═══════════════════════════════════════════════════════════════════════════════
PIXEL-LEVEL RGB COPY REQUIREMENTS (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════
For EVERY pixel in the face region:
1. READ the RGB value from Image 1
2. WRITE the IDENTICAL RGB value to output
3. Do NOT interpolate between pixels
4. Do NOT smooth or anti-alias
5. Do NOT apply tone mapping
6. Do NOT apply color correction
7. Do NOT denoise or sharpen
8. Preserve noise grain EXACTLY

═══════════════════════════════════════════════════════════════════════════════
FACE REGION DEFINITION
═══════════════════════════════════════════════════════════════════════════════
The face region includes:
• Forehead (from hairline)
• Eyes (including eyebrows and under-eye area)
• Nose (entire structure)
• Cheeks (both sides)
• Mouth (lips and surrounding area)
• Chin (to bottom of jaw)
• Ears (if visible)
• Beard/facial hair (if present)

Extend 15% margin beyond face landmarks for safety.

═══════════════════════════════════════════════════════════════════════════════
TEXTURE COPY (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════
Copy WITHOUT modification:
• Skin pores (size, density, distribution)
• Beard stubble (direction, length, density)
• Wrinkles and lines (depth, position, length)
• Moles, freckles, birthmarks (exact position and size)
• Under-eye bags and shadows
• Acne, scars, blemishes
• Hair on face (peach fuzz)

═══════════════════════════════════════════════════════════════════════════════
GEOMETRY LOCK
═══════════════════════════════════════════════════════════════════════════════
The following measurements must be IDENTICAL between Image 1 and output:
• Face width in pixels
• Face height in pixels
• Eye-to-eye distance
• Nose length
• Mouth width
• Jaw width
• Forehead height

If ANY of these differ → OUTPUT IS WRONG.

═══════════════════════════════════════════════════════════════════════════════
VERIFICATION
═══════════════════════════════════════════════════════════════════════════════
If you overlay Image 1 face onto output face:
• All facial landmarks must PERFECTLY ALIGN
• RGB values in face region must be IDENTICAL
• There should be NO visible difference

A family member looking at the output MUST immediately recognize the person.
If they hesitate even for a moment → OUTPUT IS WRONG.

DO NOT GENERATE. COPY.
`

// ═══════════════════════════════════════════════════════════════
// NO-CORRECTION MODE (CRITICAL — DRAMATICALLY REDUCES DRIFT)
// ═══════════════════════════════════════════════════════════════

export const NO_CORRECTION_MODE = `[NO-CORRECTION MODE — CRITICAL]

This image ALREADY represents a REAL HUMAN accurately.
Your task is NOT to improve, stylize, beautify, or normalize.

DO NOT:
- Fix facial symmetry
- Adjust eye size or eyelids
- Refine nose shape
- Slim face or jaw
- Reduce body mass
- Improve posture
- Beautify skin
- Correct perceived imperfections

ASSUME:
- The subject's appearance is already CORRECT
- Any asymmetry, fullness, or imperfection is INTENTIONAL and REAL
- There is NOTHING to fix

This is a real person, not a concept to be optimized.`

// ═══════════════════════════════════════════════════════════════
// EYE SAFETY OVERRIDE (STOPS EYE SHRINKING)
// ═══════════════════════════════════════════════════════════════

export const EYE_SAFETY_OVERRIDE = `[EYE SAFETY CONSTRAINT — CRITICAL]

Eyes must remain VISUALLY IDENTICAL in size and openness.

EYE SAFETY RULES:
- Do not tighten eyelids
- Do not reduce sclera (white) visibility
- Do not editorially "focus" the eyes
- Do not make eyes more symmetrical
- Do not change eye size at all

PRO aggressively edits eyes unless explicitly forbidden.
This is explicitly forbidden.`

// ═══════════════════════════════════════════════════════════════
// EYE ABSOLUTE LOCK (PIXEL-LEVEL — CRITICAL FIX)
// ═══════════════════════════════════════════════════════════════

export const EYE_ABSOLUTE_LOCK = `
╔═══════════════════════════════════════════════════════════════════╗
║                    EYE ABSOLUTE LOCK                              ║
║                    PIXEL-LEVEL CRITICAL                           ║
╚═══════════════════════════════════════════════════════════════════╝

THE EYES IN IMAGE 1 ARE PERFECT. DO NOT TOUCH THEM.

COPY EXACTLY FROM IMAGE 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Eye WIDTH in pixels → IDENTICAL
• Eye HEIGHT in pixels → IDENTICAL
• Eyelid POSITION → IDENTICAL
• Sclera (white) VISIBILITY → IDENTICAL
• Pupil SIZE → IDENTICAL
• Eye CORNERS position → IDENTICAL
• Under-eye BAGS/SHADOWS → IDENTICAL
• Eye SPACING → IDENTICAL
• Eye TILT angle → IDENTICAL

FORBIDDEN (HARD BLOCK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Making eyes SMALLER
❌ Making eyes LARGER
❌ Tightening EYELIDS
❌ Reducing SCLERA visibility
❌ Changing eye SHAPE
❌ Changing eye COLOR
❌ Adding CATCHLIGHTS
❌ Removing UNDER-EYE features
❌ "Improving" eye SYMMETRY
❌ "Focusing" or "sharpening" eyes
❌ ANY eye beautification

IMPORTANT:
If the eyes in Image 1 are:
• Slightly uneven → KEEP UNEVEN
• Have bags underneath → KEEP BAGS
• Are small → KEEP SMALL
• Are large → KEEP LARGE
• Are asymmetric → KEEP ASYMMETRIC

EYES ARE THE PRIMARY IDENTITY ANCHOR.
If eyes change AT ALL, the person is no longer recognizable.
COPY EYE PIXELS DIRECTLY FROM IMAGE 1.
`

// ═══════════════════════════════════════════════════════════════
// FACE PRESERVATION (SEMANTIC, NOT PIXEL)
// ═══════════════════════════════════════════════════════════════

export const FACE_PRESERVATION_RULES = `[FACE PRESERVATION — SEMANTIC]

FACE PRESERVATION RULES:
- Maintain facial proportions exactly as given
- Maintain eye size, spacing, and aperture
- Maintain nose length, width, and angle
- Maintain cheek and jaw fullness
- Maintain beard density and boundary
- Maintain expression intensity

Do NOT refine or optimize facial structure.
Do NOT apply any beautification.`

// ═══════════════════════════════════════════════════════════════
// FACE GEOMETRY LOCK (PREVENTS STRETCHING)
// ═══════════════════════════════════════════════════════════════

export const FACE_GEOMETRY_LOCK = `
╔═══════════════════════════════════════════════════════════════════╗
║                    FACE GEOMETRY LOCK                             ║
║                    ANTI-STRETCHING                                ║
╚═══════════════════════════════════════════════════════════════════╝

THE FACE MUST NOT BE STRETCHED, COMPRESSED, OR RESHAPED.

PRESERVE EXACTLY FROM IMAGE 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Face WIDTH → IDENTICAL
• Face HEIGHT → IDENTICAL
• Face ASPECT RATIO → IDENTICAL
• Forehead to chin DISTANCE → IDENTICAL
• Cheek to cheek DISTANCE → IDENTICAL
• Eye line to mouth DISTANCE → IDENTICAL
• Nose length → IDENTICAL
• Jaw WIDTH → IDENTICAL
• Jaw ANGLE → IDENTICAL

BEARD GEOMETRY (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Beard DENSITY → IDENTICAL
• Beard SHAPE → IDENTICAL
• Beard BOUNDARY → IDENTICAL
• Mustache shape → IDENTICAL
• Sideburn position → IDENTICAL

FORBIDDEN TRANSFORMATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Stretching face VERTICALLY
❌ Stretching face HORIZONTALLY
❌ Compressing face
❌ Changing face ASPECT RATIO
❌ Slimming face
❌ Widening face
❌ Changing jaw shape
❌ Reducing cheek fullness
❌ Altering forehead size
❌ Changing face TILT angle

RULE:
If you overlay Image 1 face on the output face,
they MUST ALIGN PERFECTLY in:
- Eye positions
- Nose position
- Mouth position
- Jaw outline
- Beard boundary

If faces don't align → OUTPUT IS WRONG.
`

// ═══════════════════════════════════════════════════════════════
// BODY MASS LOCK (ANTI-SLIMMING)
// ═══════════════════════════════════════════════════════════════

export const BODY_MASS_LOCK = `[BODY REALISM LOCK]

BODY PRESERVATION:
- Preserve body mass and volume
- Preserve shoulder width
- Preserve arm thickness
- Preserve torso depth

Clothing must adapt to the body.
The body must NOT adapt to clothing.

This stops slimming and posture correction.`

// ═══════════════════════════════════════════════════════════════
// ARCHITECTURE ENFORCEMENT (LITERAL, NOT AESTHETIC)
// ═══════════════════════════════════════════════════════════════

export const ARCHITECTURE_ENFORCEMENT = `[ARCHITECTURE ENFORCEMENT — LITERAL]

Background must contain REAL-WORLD STRUCTURAL elements:
- Walls, columns, railings, roads, ceilings
- Perspective lines must converge naturally
- Environment must look inhabitable and functional

Do NOT create abstract, stylized, or studio-like spaces.
Build REAL architecture, not "vibes".`

// ═══════════════════════════════════════════════════════════════
// FACE LIGHTING RESTRICTION
// ═══════════════════════════════════════════════════════════════

export const FACE_LIGHTING_RESTRICTION = `[LIGHTING RESTRICTION — FACE]

Do NOT relight the face.
Only match color temperature to scene.
Do NOT add cinematic, rim, or beauty lighting to face.

Face lighting is INHERITED from the original image.`

// ═══════════════════════════════════════════════════════════════
// PRO NON-CORRECTION DIRECTIVE (CRITICAL — USER SPECIFIED)
// ═══════════════════════════════════════════════════════════════

export const PRO_NON_CORRECTION_LAYER = `
═══════════════════════════════════════
PRO NON-CORRECTION DIRECTIVE
═══════════════════════════════════════
This image represents a REAL HUMAN.

DO NOT:
- Normalize face symmetry
- Reduce facial fullness
- Slim jaw, cheeks, or neck
- Enlarge or shrink eyes
- Straighten head tilt
- Adjust ethnic facial proportions
- Correct body shape or posture
- Replace natural expressions

IMPORTANT:
Asymmetry, tilt, facial fullness, eye size, and body proportions
are IDENTITY FEATURES, not errors.

Treat them as INTENTIONAL DATA.

You are NOT beautifying.
You are NOT correcting.
You are ONLY preserving.
═══════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════
// BODY GEOMETRY LOCK (MISSING — NOW ADDED)
// ═══════════════════════════════════════════════════════════════

export const BODY_GEOMETRY_LOCK = `
═══════════════════════════════════════
BODY GEOMETRY LOCK
═══════════════════════════════════════
Preserve EXACT:
- Shoulder width
- Arm thickness
- Chest volume
- Torso length
- Neck thickness

DO NOT:
- Slim body
- Widen shoulders
- Adjust posture for aesthetics
- Change limb proportions

Body shape must match Image 1 exactly.
═══════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════
// EYE PROPORTION LOCK (PREVENTS PRO BEAUTIFICATION)
// ═══════════════════════════════════════════════════════════════

export const EYE_PROPORTION_LOCK = `
═══════════════════════════════════════
EYE PROPORTION LOCK
═══════════════════════════════════════
Eyes must remain EXACTLY the same size, openness, and spacing
as Image 1. 

Do NOT normalize gaze or eye geometry.
Do NOT enlarge or shrink eyes.
Do NOT tighten eyelids.

This prevents PRO's "beautification instinct".
═══════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════
// BACKGROUND REALISM MODE (FIXES OVERCORRECTION)
// ═══════════════════════════════════════════════════════════════

export const BACKGROUND_REALISM_MODE = `
═══════════════════════════════════════
BACKGROUND REALISM MODE
═══════════════════════════════════════
BACKGROUND HANDLING RULE:
- Preserve architectural imperfection
- Keep real-world clutter
- Maintain uneven lighting
- Do NOT replace with idealized buildings
- Extend background logically from visible context only

If unsure, BLUR or EXTEND — never redesign.

Presets are REFERENTIAL, not AUTHORITATIVE.
Adapt scene to resemble preset while preserving original spatial logic.
═══════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════
// PRO LAYER 1: IDENTITY ANCHOR (SEMANTIC, NOT PIXEL)
// ═══════════════════════════════════════════════════════════════

export const PRO_IDENTITY_INVARIANTS = `[PRO IDENTITY ANCHOR — SEMANTIC INVARIANTS]

These are FIXED CHARACTERISTICS of this person.
They must NOT be optimized, enhanced, or corrected.

IDENTITY INVARIANTS (MUST HOLD):
- Eye-to-eye distance: unchanged
- Eye aperture: unchanged
- Nose bridge length: unchanged
- Nose width at nostrils: unchanged
- Jaw width: unchanged
- Cheek fullness: unchanged
- Facial fat distribution: unchanged
- Beard density & boundary: unchanged
- Hairline position: unchanged
- Skin texture appearance: unchanged

These are not flaws to fix.
These are identifying features to preserve.

If you "improve" any of these, you have changed the person.`

// ═══════════════════════════════════════════════════════════════
// PRO EYE FIX (CRITICAL — STOPS 60% OF DRIFT)
// ═══════════════════════════════════════════════════════════════

export const PRO_EYE_RULES = `[PRO EYE RULES — ANTI-SHRINK]

Eyes are the PRIMARY identity anchor.
The eyes already represent the subject accurately.
Do not improve them.

EYE PRESERVATION RULES:
- Eyes must remain exactly the same apparent size
- Do not tighten eyelids
- Do not reduce sclera (white) visibility
- Do not sharpen or stylize eyes
- Do not apply editorial gaze correction
- Do not make eyes more symmetrical
- Do not enlarge or reduce pupil size
- Do not add catchlights or reflections

Eye shrinking is caused by beauty compression.
This is NOT a beauty edit — preserve eye size exactly.`

// ═══════════════════════════════════════════════════════════════
// PRO BODY INVARIANTS (ANTI-SLIMMING)
// ═══════════════════════════════════════════════════════════════

export const PRO_BODY_INVARIANTS = `[PRO BODY INVARIANTS — NO RESHAPING]

The body shape is NOT adjustable.
Clothing must adapt to the body, NOT the body to clothing.

BODY PRESERVATION:
- Preserve body mass exactly
- Preserve shoulder width exactly
- Preserve arm thickness exactly
- Preserve torso volume exactly
- Preserve posture weight distribution
- Preserve waist-to-hip ratio
- Preserve neck thickness

FORBIDDEN BODY EDITS:
- Slimming
- Widening shoulders
- Thinning arms
- Reducing belly
- "Improving" posture
- Squaring shoulders
- Lengthening torso

If garment fit is imperfect → THAT IS CORRECT.
Fat bodies, thin bodies, asymmetric bodies are valid.
Do not normalize body shape.`

// ═══════════════════════════════════════════════════════════════
// PRO LAYER 2: SCENE CONSTRUCTION (STRUCTURAL, NOT VIBES)
// ═══════════════════════════════════════════════════════════════

export const PRO_SCENE_CONSTRUCTION = `[PRO SCENE CONSTRUCTION — STRUCTURAL]

Build scenes ARCHITECTURALLY, not aesthetically.
This is NOT about "vibes" — it's about physical elements.

SCENE MUST INCLUDE:
- Specific architectural elements (not generic)
- Physical furniture and objects
- Ground surface material
- Background activity (people, vehicles)
- Depth layers (foreground, midground, background)

If these elements are missing, the scene is INCORRECT.

SCENE BUILD ORDER:
1. Background architecture (buildings, walls, sky)
2. Midground objects (furniture, street elements)
3. Foreground subject placement
4. Lighting pass
5. Fabric realism pass

Do not improvise scene elements.
Do not add "cinematic" atmosphere.
Build what is specified, nothing more.`

// ═══════════════════════════════════════════════════════════════
// PRO LIGHTING (PHYSICAL, NOT EDITORIAL)
// ═══════════════════════════════════════════════════════════════

export const PRO_LIGHTING_RULES = `[PRO LIGHTING — MATCH, DON'T DRAMATIZE]

Lighting must look like it belongs to the SAME PHOTO SESSION.

LIGHTING RULES:
- Match original face light direction
- Match original softness level
- Only adjust color temperature to match scene
- Do NOT reshape shadows on face
- Do NOT add rim lights to face
- Do NOT add dramatic contrast
- Do NOT add cinematic color grading

FACE LIGHTING = INHERITED
- Face already has correct lighting from Image 1
- Do not re-light the face
- Only adjust body/garment lighting to match scene

FORBIDDEN LIGHTING:
- Beauty dish lighting
- Fashion editorial lighting
- Dramatic side lighting on face
- Backlit halo effects on face`

// ═══════════════════════════════════════════════════════════════
// PRO LAYER 3: EDITORIAL REFINEMENT (LIMITED PERMISSIONS)
// ═══════════════════════════════════════════════════════════════

export const PRO_EDITORIAL_REFINEMENT = `[PRO EDITORIAL REFINEMENT — LOCAL ONLY]

PRO may refine CLOTHING and BACKGROUND only.
PRO may NOT refine FACE or BODY SHAPE.

ALLOWED:
- Fabric realism (wrinkles, folds, drape)
- Garment shadow logic
- Shadow blending on clothes
- Background depth polish
- Seam and stitching detail
- Cloth physics on body

NOT ALLOWED:
- Face retouching of any kind
- Body reshaping of any kind
- Pose exaggeration
- Fashion-model posture correction
- Skin smoothing
- Eye enhancement
- Nose refinement
- Jaw correction`

// ═══════════════════════════════════════════════════════════════
// PRO PROHIBITED ACTIONS (EXPLICIT LIST)
// ═══════════════════════════════════════════════════════════════

export const PRO_PROHIBITED_ACTIONS = `[PRO PROHIBITED — HARD BLOCKS]

This is NOT a fashion editorial shoot.
This is a REALISTIC TRY-ON.

PROHIBITED ACTIONS:
- Face beautification
- Body slimming
- Eye enlargement or reduction
- Nose refinement
- Jaw correction
- Ethnicity normalization
- Age normalization
- BMI normalization
- Posture "improvement"
- Expression intensification
- Gaze correction
- Skin smoothing
- Wrinkle removal
- Blemish removal

The person is NOT being improved.
The person is being shown in new clothing.
That is the ONLY change allowed.`

// ═══════════════════════════════════════════════════════════════
// PRO COMPLETE SEMANTIC PROMPT
// ═══════════════════════════════════════════════════════════════

export function getProSemanticPrompt(): string {
    // LAYER STACK must be ABSOLUTE FIRST — establishes multi-layer locking
    // Then PRO_PIXEL_COPY_FACE for face-specific pixel copying
    // Then all other semantic controls
    const layerStack = getProLayerStack()

    return `${layerStack}

${PRO_PIXEL_COPY_FACE}

${NO_CORRECTION_MODE}

${PRO_NON_CORRECTION_LAYER}

${EYE_ABSOLUTE_LOCK}

${EYE_SAFETY_OVERRIDE}

${EYE_PROPORTION_LOCK}

${FACE_PRESERVATION_RULES}

${FACE_GEOMETRY_LOCK}

${BODY_MASS_LOCK}

${BODY_GEOMETRY_LOCK}

${ARCHITECTURE_ENFORCEMENT}

${BACKGROUND_REALISM_MODE}

${FACE_LIGHTING_RESTRICTION}

${PRO_IDENTITY_INVARIANTS}

${PRO_EYE_RULES}

${PRO_BODY_INVARIANTS}

${PRO_LIGHTING_RULES}

${PRO_EDITORIAL_REFINEMENT}

${PRO_PROHIBITED_ACTIONS}`
}

// ═══════════════════════════════════════════════════════════════
// PRO SCENE PROMPT (STRUCTURAL)
// ═══════════════════════════════════════════════════════════════

export interface ProSceneConstraints {
    architecture: string
    seating?: string
    tables?: string
    ground: string
    backgroundActivity: string
    depth: string
    lighting: string
}

export function buildProScenePrompt(constraints: ProSceneConstraints): string {
    return `${PRO_SCENE_CONSTRUCTION}

SCENE CONSTRAINTS (MANDATORY):
- Architecture: ${constraints.architecture}
${constraints.seating ? `- Seating: ${constraints.seating}` : ''}
${constraints.tables ? `- Tables: ${constraints.tables}` : ''}
- Ground: ${constraints.ground}
- Background activity: ${constraints.backgroundActivity}
- Depth: ${constraints.depth}

${PRO_LIGHTING_RULES}
Scene lighting: ${constraints.lighting}

If these elements are missing, the scene is INCORRECT.`
}

// ═══════════════════════════════════════════════════════════════
// PRO LOGGING
// ═══════════════════════════════════════════════════════════════

export function logProSemanticStatus(sessionId: string): void {
    console.log(`\n🎨 PRO SEMANTIC CONTROLS [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📌 Identity: SEMANTIC INVARIANTS (not pixel lock)`)
    console.log(`   📌 Eyes: ANTI-SHRINK rules active`)
    console.log(`   📌 Body: ANTI-SLIMMING rules active`)
    console.log(`   📌 Scene: STRUCTURAL (not vibes)`)
    console.log(`   📌 Lighting: PHYSICAL (not editorial)`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✏️ Allowed: fabric, shadows, depth`)
    console.log(`   🚫 Forbidden: face/body edit, beautification`)
}
