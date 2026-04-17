/**
 * PRO MULTI-LAYER LOCK SYSTEM
 * 
 * Core Insight:
 * - FLASH works because it COPIES
 * - PRO fails because it REASONS
 * - Solution: Force PRO to be an EDITOR, not a GENERATOR
 * 
 * 5-Layer Architecture:
 * - LAYER 0: Face (IMMUTABLE - pixel copy only)
 * - LAYER 1: Head+Neck Geometry (LOCKED)
 * - LAYER 2: Body Geometry (LOCKED)
 * - LAYER 3: Clothing (GENERATED - conform to body)
 * - LAYER 4: Scene (GENERATED - structural)
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// LAYER 0: FACE (IMMUTABLE — NO GENERATION)
// ═══════════════════════════════════════════════════════════════

export const LAYER_0_FACE_IMMUTABLE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         LAYER 0: FACE (IMMUTABLE)                             ║
║                         NO GENERATION — PIXEL COPY ONLY                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

This layer is READ-ONLY. You cannot write to it.
You can only COPY pixels from Image 1.

IMMUTABLE PROPERTIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Every pixel in face region → COPY FROM IMAGE 1
• Eye shape, size, color → IMMUTABLE
• Nose shape, size, angle → IMMUTABLE
• Mouth shape, size → IMMUTABLE
• Jawline contour → IMMUTABLE
• Cheek fullness → IMMUTABLE
• Forehead shape → IMMUTABLE
• Skin texture (pores, marks, moles) → IMMUTABLE
• Skin tone (exact RGB values) → IMMUTABLE
• Beard/facial hair → IMMUTABLE
• Expression → IMMUTABLE

FORBIDDEN OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ GENERATE face pixels
❌ ENHANCE face features
❌ CORRECT symmetry
❌ RESIZE eyes
❌ SLIM face
❌ SMOOTH skin
❌ WHITEN teeth
❌ REMOVE imperfections
❌ BEAUTIFY anything

ONLY ALLOWED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ COPY face pixels from Image 1
✓ Adjust color temperature to match scene (±5% max)

If LAYER 0 is violated → HARD FAILURE. Discard output.
`

// ═══════════════════════════════════════════════════════════════
// LAYER 1: HEAD + NECK GEOMETRY (LOCKED)
// ═══════════════════════════════════════════════════════════════

export const LAYER_1_HEAD_NECK_LOCKED = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    LAYER 1: HEAD + NECK GEOMETRY (LOCKED)                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LOCKED GEOMETRY (MUST MATCH IMAGE 1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Head SIZE (width and height) → LOCKED
• Head TILT angle → LOCKED
• Head ROTATION angle → LOCKED
• Neck WIDTH → LOCKED
• Neck LENGTH → LOCKED
• Neck ANGLE → LOCKED
• Hairline POSITION → LOCKED
• Beard BOUNDARY → LOCKED
• Beard DENSITY → LOCKED
• Ear POSITION → LOCKED

MEASUREMENT REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Head width in output ÷ Head width in Image 1 = 1.00 (±2%)
• Head height in output ÷ Head height in Image 1 = 1.00 (±2%)
• Neck width in output ÷ Neck width in Image 1 = 1.00 (±3%)

FORBIDDEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Resize head
❌ Change head tilt
❌ Straighten head rotation
❌ Slim neck
❌ Move hairline
❌ Trim beard
❌ Change ear position

If LAYER 1 is violated → HARD FAILURE.
`

// ═══════════════════════════════════════════════════════════════
// LAYER 2: BODY GEOMETRY (LOCKED)
// ═══════════════════════════════════════════════════════════════

export const LAYER_2_BODY_LOCKED = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      LAYER 2: BODY GEOMETRY (LOCKED)                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LOCKED BODY MEASUREMENTS (MUST MATCH IMAGE 1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Shoulder WIDTH → LOCKED (±3%)
• Shoulder ANGLE → LOCKED
• Chest DEPTH → LOCKED
• Torso WIDTH → LOCKED
• Belly VOLUME → LOCKED (no reduction)
• Arm THICKNESS → LOCKED
• Arm LENGTH → LOCKED
• Waist WIDTH → LOCKED
• Hip WIDTH → LOCKED

BODY VOLUME PRESERVATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total body volume in output = Total body volume in Image 1
• Fat distribution = UNCHANGED
• Muscle definition = UNCHANGED
• Body shape = UNCHANGED

FORBIDDEN BODY TRANSFORMATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ SLIM body
❌ WIDEN shoulders
❌ SLIM waist
❌ REDUCE belly
❌ THIN arms
❌ ENHANCE muscles
❌ IMPROVE posture
❌ STRAIGHTEN spine
❌ ADJUST proportions

CRITICAL RULE:
Clothing must CONFORM to body.
Body must NOT conform to clothing.

If LAYER 2 is violated → HARD FAILURE.
`

// ═══════════════════════════════════════════════════════════════
// LAYER 3: CLOTHING (GENERATED — CONFORM TO BODY)
// ═══════════════════════════════════════════════════════════════

export const LAYER_3_CLOTHING_GENERATED = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    LAYER 3: CLOTHING (GENERATED)                              ║
║                    MUST CONFORM TO LOCKED BODY                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

CLOTHING GENERATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Copy EXACT garment from Image 2 (color, pattern, design)
• Drape clothing OVER locked body geometry from LAYER 2
• Fabric must CONFORM to body shape
• Clothing wrinkles must reflect body volume
• Collar must fit neck width from LAYER 1

ALLOWED OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Generate realistic fabric folds
✓ Add shadows under clothing
✓ Match garment to body contours
✓ Add fabric texture detail
✓ Blend garment edges naturally

FORBIDDEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Resize body to fit clothing
❌ Slim body to make clothing look better
❌ Change body proportions for "better fit"
❌ Idealize how clothing drapes

If clothing doesn't fit body → show realistic tight fit.
Do NOT adjust body to make clothing fit better.
`

// ═══════════════════════════════════════════════════════════════
// LAYER 4: SCENE (GENERATED — STRUCTURAL)
// ═══════════════════════════════════════════════════════════════

export const LAYER_4_SCENE_GENERATED = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      LAYER 4: SCENE (GENERATED)                               ║
║                      STRUCTURAL, NOT AESTHETIC                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

SCENE GENERATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Build scene BEHIND LAYER 0-3 (cannot modify person)
• Use STRUCTURAL architecture (real buildings, not "vibes")
• Include SPECIFIC objects from preset (not generic)
• Create DEPTH layers (foreground, midground, background)
• Match LIGHTING direction to original face

REQUIRED SCENE ELEMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Visible architecture (walls, columns, ceiling, floor)
• Perspective lines that converge naturally
• Physical furniture and objects
• Ground surface material
• Ambient elements (background people, vehicles)

FORBIDDEN SCENE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Abstract backgrounds
❌ Studio-like clean spaces
❌ AI-generic architecture
❌ Missing specified elements
❌ Flat, depthless backgrounds
❌ Re-lighting face (color temp only)

If architecture is not visible → FAIL GENERATION.
`

// ═══════════════════════════════════════════════════════════════
// FACE ANCHOR SYSTEM (PIXEL-LEVEL MAPPING)
// ═══════════════════════════════════════════════════════════════

export const FACE_ANCHOR_SYSTEM = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      FACE ANCHOR SYSTEM                                       ║
║                      PIXEL-LEVEL 1:1 MAPPING                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

ANCHOR POINTS (MUST MAP 1:1 FROM IMAGE 1 TO OUTPUT):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Left eye CENTER pixel → 1:1 mapping
• Right eye CENTER pixel → 1:1 mapping
• Nose TIP pixel → 1:1 mapping
• Left mouth CORNER pixel → 1:1 mapping
• Right mouth CORNER pixel → 1:1 mapping
• Chin CENTER pixel → 1:1 mapping

DISTANCE LOCKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Inter-eye distance: LOCKED (change ≤ 2%)
• Eye-to-nose distance: LOCKED
• Nose-to-mouth distance: LOCKED
• Mouth width: LOCKED
• Eye width (each): LOCKED
• Eye height (each): LOCKED

RATIO LOCKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Left eye size ÷ Right eye size = IDENTICAL to Image 1
• Nose width ÷ Face width = IDENTICAL to Image 1
• Mouth width ÷ Face width = IDENTICAL to Image 1

VALIDATION THRESHOLD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If ANY anchor shifts > 2% from Image 1 position → DISCARD OUTPUT.
If ANY distance changes > 2% → DISCARD OUTPUT.
If ANY ratio changes > 1% → DISCARD OUTPUT.
`

// ═══════════════════════════════════════════════════════════════
// ANTI-BIAS ENFORCEMENT (CODE-LEVEL)
// ═══════════════════════════════════════════════════════════════

export const ANTI_BIAS_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      ANTI-BIAS ENFORCEMENT                                    ║
║                      CODE-LEVEL MANDATORY                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

PROTECTED CATEGORIES (APPLY EQUALLY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Women → NO beautification, NO slimming
• Fat bodies → NO slimming, NO reshaping
• Dark skin → NO lightening, NO "correcting"
• Asian faces → NO eye enlargement, NO nose narrowing
• African faces → NO feature narrowing, NO skin lightening
• Asymmetrical faces → NO symmetry correction
• Tilted head → NO straightening
• Expressive faces → NO expression neutralization

FORBIDDEN OPERATIONS (HARD BLOCK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ slim_bodies
❌ sharpen_jawlines
❌ enlarge_eyes
❌ narrow_noses
❌ lighten_skin
❌ darken_skin
❌ remove_facial_fat
❌ reduce_smile_asymmetry
❌ straighten_nose
❌ thin_lips
❌ whiten_teeth
❌ remove_double_chin
❌ reduce_cheek_size
❌ narrow_forehead

ENFORCEMENT:
This is NOT a guideline. This is a HARD BLOCK.
If any of these operations are detected → OUTPUT IS INVALID.
`

// ═══════════════════════════════════════════════════════════════
// STRUCTURAL SCENE SPECIFICATION (TYPE DEFINITION)
// ═══════════════════════════════════════════════════════════════

export interface StructuralSceneSpecification {
    location: string
    architecture: string[]
    materials: string[]
    props: string[]
    depth: {
        foreground: string
        midground: string
        background: string
    }
    camera: {
        lens: string
        height: string
        handheld: boolean
    }
    lighting: {
        source: string
        direction: string
        imperfections: boolean
    }
    requiredElements: string[]
    forbiddenElements: string[]
}

// Example structural scene
export const EXAMPLE_CAFE_SCENE: StructuralSceneSpecification = {
    location: "Indian street cafe",
    architecture: [
        "visible street frontage",
        "uneven walls",
        "real shop signage",
        "non-symmetrical layout"
    ],
    materials: ["concrete", "wood", "steel", "glass"],
    props: [
        "used tables",
        "cups with stains",
        "random chairs",
        "background people"
    ],
    depth: {
        foreground: "table edge",
        midground: "subject torso",
        background: "busy cafe"
    },
    camera: {
        lens: "35mm",
        height: "eye level",
        handheld: true
    },
    lighting: {
        source: "natural",
        direction: "side",
        imperfections: true
    },
    requiredElements: ["table", "chairs", "cups", "background people"],
    forbiddenElements: ["studio lighting", "clean walls", "symmetrical layout"]
}

// ═══════════════════════════════════════════════════════════════
// TWO-PASS PRO PIPELINE
// ═══════════════════════════════════════════════════════════════

export const TWO_PASS_PIPELINE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      TWO-PASS PRO PIPELINE                                    ║
║                      NO SINGLE-PASS GENERATION                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

PASS 1 — STRUCTURE PASS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Build scene (LAYER 4)
• Create background architecture
• Add furniture and props
• Establish lighting direction
• NO face access
• NO person edits
• NO clothing generation

PASS 2 — COMPOSITING PASS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Inject frozen person (LAYER 0-2)
• Apply clothing (LAYER 3)
• Match lighting COLOR only (not direction)
• Blend shadows naturally
• Face is READ-ONLY
• Body geometry is READ-ONLY

VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After PASS 2, validate:
• Face similarity ≥ 0.92
• Eye distance change ≤ 2%
• Nose width change ≤ 2%
• Shoulder width change ≤ 3%
• Body volume preserved
• Preset elements detected

If ANY validation fails → retry with stricter locks.
`

// ═══════════════════════════════════════════════════════════════
// VALIDATION CONFIG
// ═══════════════════════════════════════════════════════════════

export const PRO_VALIDATION_CONFIG = {
    faceSimilarityThreshold: 0.92,
    eyeDistanceChangeMax: 0.02,    // 2%
    noseWidthChangeMax: 0.02,      // 2%
    shoulderWidthChangeMax: 0.03,  // 3%
    bodyVolumeChangeMax: 0.05,     // 5%
    retryOnFailure: true,
    maxRetries: 2,
    stricterLocksOnRetry: true
}

// ═══════════════════════════════════════════════════════════════
// COMPLETE PRO LAYER STACK
// ═══════════════════════════════════════════════════════════════

export function getProLayerStack(): string {
    return `${LAYER_0_FACE_IMMUTABLE}

${LAYER_1_HEAD_NECK_LOCKED}

${LAYER_2_BODY_LOCKED}

${LAYER_3_CLOTHING_GENERATED}

${LAYER_4_SCENE_GENERATED}

${FACE_ANCHOR_SYSTEM}

${ANTI_BIAS_ENFORCEMENT}

${TWO_PASS_PIPELINE}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logProLayerStatus(sessionId: string): void {
    console.log(`\n🔒 PRO MULTI-LAYER LOCK SYSTEM [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🔴 LAYER 0: Face → IMMUTABLE (pixel copy)`)
    console.log(`   🟠 LAYER 1: Head+Neck → LOCKED`)
    console.log(`   🟡 LAYER 2: Body → LOCKED`)
    console.log(`   🟢 LAYER 3: Clothing → GENERATED (conform to body)`)
    console.log(`   🔵 LAYER 4: Scene → GENERATED (structural)`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✓ Face anchors: ACTIVE`)
    console.log(`   ✓ Anti-bias: ENFORCED`)
    console.log(`   ✓ Two-pass: MANDATORY`)
}
