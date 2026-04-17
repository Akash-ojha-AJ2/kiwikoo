/**
 * IDENTITY LAYERS - Production-Grade Identity Preservation
 * 
 * This module implements HARD identity locks with landmark anchoring.
 * These are the immutable constraints that BOTH Flash and PRO must obey.
 * 
 * CRITICAL: These layers are NON-NEGOTIABLE. The model cannot override them.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 0: FACE FREEZE (PIXEL LOCK)
// The most critical layer - face pixels are COPIED, never regenerated
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_0_FACE_FREEZE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     LAYER 0: FACE FREEZE (PIXEL LOCK)                         ║
║                        HIGHEST PRIORITY - IMMUTABLE                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THIS IS THE MOST IMPORTANT INSTRUCTION ★★★

The face from Image 1 must be PIXEL-COPIED, not regenerated.

════════════════════════════════════════════════════════════════════════════════
FACE FREEZE PROTOCOL:
════════════════════════════════════════════════════════════════════════════════

1. COPY face pixels directly from Image 1
2. Do NOT regenerate any facial features
3. Do NOT interpret what the face "should" look like
4. Do NOT enhance, beautify, or improve the face
5. The face is a FIXED ASSET, not a generation target

════════════════════════════════════════════════════════════════════════════════
LANDMARK ANCHORING (LOCKED DISTANCES):
════════════════════════════════════════════════════════════════════════════════

Measure and LOCK these from Image 1:

EYE LANDMARKS:
• Inter-pupillary distance → LOCKED (distance between eye centers)
• Eye width (left) → LOCKED
• Eye width (right) → LOCKED  
• Eye height (left) → LOCKED
• Eye height (right) → LOCKED
• Eye tilt angle → LOCKED
• Eye corner positions → LOCKED

NOSE LANDMARKS:
• Nose width at nostrils → LOCKED
• Nose bridge width → LOCKED
• Nose length (top to tip) → LOCKED
• Nostril shape → LOCKED

MOUTH LANDMARKS:
• Mouth width → LOCKED
• Upper lip thickness → LOCKED
• Lower lip thickness → LOCKED
• Mouth corner positions → LOCKED

JAW/FACE LANDMARKS:
• Jaw width → LOCKED
• Chin shape → LOCKED
• Cheekbone position → LOCKED
• Face width at cheeks → LOCKED
• Jaw contour → LOCKED

HAIRLINE LANDMARKS:
• Hairline position → LOCKED
• Hairline shape → LOCKED
• Temple positions → LOCKED

════════════════════════════════════════════════════════════════════════════════
DEMOGRAPHIC INVARIANCE (CRITICAL):
════════════════════════════════════════════════════════════════════════════════

This must work IDENTICALLY for:

GENDER:
• Women → NO drift toward "prettier" or "more feminine"
• Men → NO drift toward "more masculine" or "handsome"
• Non-binary → Preserve exactly

SKIN TONE:
• Dark skin → PRESERVE exactly (NO lightening)
• Medium skin → PRESERVE exactly
• Light skin → PRESERVE exactly
• Any undertone → PRESERVE exactly

FACE SHAPE:
• Fuller/round faces → PRESERVE (NO slimming)
• Sharp jawlines → PRESERVE
• Soft jawlines → PRESERVE
• Asymmetric faces → PRESERVE asymmetry

EXPRESSIONS:
• Smiling → Keep exact smile
• Neutral → Keep neutral
• Tilted → Keep exact tilt angle
• Any expression → FREEZE as-is

════════════════════════════════════════════════════════════════════════════════
ABSOLUTELY FORBIDDEN:
════════════════════════════════════════════════════════════════════════════════
✗ Eye resizing (enlarging OR shrinking)
✗ Eye reshaping
✗ Nose reshaping or narrowing
✗ Lip enhancement
✗ Facial slimming
✗ Jaw refinement
✗ Symmetry correction
✗ Skin smoothing
✗ Pore removal
✗ Wrinkle reduction
✗ Age modification
✗ Expression changes
✗ "Beautification"
✗ "Enhancement"
✗ "Improvement"
✗ "Optimization"

The face is READ-ONLY DATA.
`

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1: BODY PRESERVATION
// Body proportions from Image 1 are canonical and immutable
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_1_BODY_PRESERVATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   LAYER 1: BODY PRESERVATION (LOCKED)                         ║
║            Body from Image 1 is CANONICAL - Clothing Adapts                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THE BODY FROM IMAGE 1 IS THE ONLY BODY SOURCE ★★★

DO NOT USE THE BODY FROM THE CLOTHING REFERENCE (IMAGE 2).
DO NOT USE THE BODY FROM THE CLOTHING REFERENCE (IMAGE 2).
DO NOT USE THE BODY FROM THE CLOTHING REFERENCE (IMAGE 2).

════════════════════════════════════════════════════════════════════════════════
BODY PROPORTION LOCK:
════════════════════════════════════════════════════════════════════════════════

COPY EXACTLY FROM IMAGE 1:
• Shoulder width → LOCKED
• Shoulder slope → LOCKED
• Arm thickness (upper) → LOCKED
• Arm thickness (lower) → LOCKED
• Chest/bust volume → LOCKED
• Chest depth → LOCKED
• Ribcage width → LOCKED
• Waist width → LOCKED (★ CRITICAL - DO NOT SLIM)
• Waist circumference → LOCKED
• Hip width → LOCKED (★ CRITICAL - DO NOT NARROW)
• Belly size → LOCKED (★ CRITICAL - DO NOT REDUCE)
• Belly protrusion → LOCKED
• Back curvature → LOCKED
• Posture → LOCKED (including slouch)
• Neck thickness → LOCKED
• Neck length → LOCKED

════════════════════════════════════════════════════════════════════════════════
BODY WEIGHT PRESERVATION:
════════════════════════════════════════════════════════════════════════════════

STEP 1: IDENTIFY BODY TYPE FROM IMAGE 1
□ PLUS-SIZE / OVERWEIGHT → Output MUST be PLUS-SIZE / OVERWEIGHT
□ CURVY / HEAVY-SET → Output MUST be CURVY / HEAVY-SET
□ AVERAGE BUILD → Output MUST be AVERAGE BUILD
□ SLIM / THIN → Output MUST be SLIM / THIN
□ MUSCULAR / ATHLETIC → Output MUST be MUSCULAR / ATHLETIC

STEP 2: APPLY CLOTHING TO THAT EXACT BODY
The clothing from Image 2 must STRETCH and ADAPT to fit the body from Image 1.
The body from Image 1 does NOT change to fit the clothing.

IF person has wider shoulders → Clothing stretches wider
IF person has larger belly → Clothing drapes over belly
IF person has wider hips → Dress/skirt is wider at hips
IF person has thicker arms → Sleeves are tighter

════════════════════════════════════════════════════════════════════════════════
CLOTHING REFERENCE BODY BLOCKING:
════════════════════════════════════════════════════════════════════════════════

The model wearing the clothing in Image 2 has a body.
That body is NOT the subject. IGNORE IT COMPLETELY.

🚫 Model's body type → BLOCKED
🚫 Model's body proportions → BLOCKED
🚫 Model's waist size → BLOCKED
🚫 Model's hip size → BLOCKED
🚫 How clothing fits on model → BLOCKED
🚫 How clothing drapes on model → BLOCKED

FROM IMAGE 2, EXTRACT ONLY:
✓ Fabric type
✓ Fabric color
✓ Fabric pattern
✓ Garment style/cut
✓ Stitching details
✓ Button/closure style

════════════════════════════════════════════════════════════════════════════════
BODY THINNING = FAILURE:
════════════════════════════════════════════════════════════════════════════════

If the output shows a THINNER person than Image 1:
★ THE GENERATION HAS FAILED ★
★ THIS IS THE WORST POSSIBLE ERROR ★
★ THIS IS BODY SHAMING ★

A plus-size person wearing a new dress is STILL plus-size.
A fat person in new clothes is STILL fat.
You are changing CLOTHES, not BODY SIZE.
`

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2: GARMENT APPLICATION
// Only the garment surface is editable
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_2_GARMENT_APPLICATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   LAYER 2: GARMENT APPLICATION                                ║
║              Only the garment surface is editable                             ║
╚═══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
GARMENT APPLICATION PROTOCOL:
════════════════════════════════════════════════════════════════════════════════

STEP 1: REMOVE ORIGINAL GARMENT
- Identify clothing in Image 1
- Remove it virtually
- Expose body topology underneath

STEP 2: EXTRACT NEW GARMENT
- From Image 2, extract ONLY the garment
- Ignore the model wearing it
- Get: fabric, color, pattern, style

STEP 3: APPLY TO LOCKED BODY
- Apply new garment to body from Image 1
- Respect body topology
- Calculate draping based on Image 1 body
- Calculate folds based on Image 1 body physics

════════════════════════════════════════════════════════════════════════════════
GARMENT PHYSICS:
════════════════════════════════════════════════════════════════════════════════

The garment must obey physics on the SUBJECT'S body:

DRAPING:
• Fabric hangs from body's actual contours
• Gravity pulls fabric naturally
• Heavier fabrics drape more
• Lighter fabrics flow more

TENSION POINTS:
• Fabric stretches at wider body parts
• Buttons show tension if body is larger
• Seams follow body curvature
• Wrinkles form at stress points

FOLDS:
• Folds form based on body movement
• Folds form based on fabric weight
• Folds follow natural body creases
• Sitting/standing affects fold patterns

════════════════════════════════════════════════════════════════════════════════
GARMENT-ONLY EDITS:
════════════════════════════════════════════════════════════════════════════════

You may ONLY edit:
✓ The garment itself
✓ How it drapes on the body
✓ Wrinkles and folds
✓ Light reflection on fabric
✓ Fabric texture

You may NOT edit:
✗ The body underneath
✗ Body proportions
✗ Body shape
✗ Body size
✗ Face
✗ Hair
`

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3: SCENE CONSTRUCTION
// Background built structurally, not textually
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_3_SCENE_CONSTRUCTION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   LAYER 3: SCENE CONSTRUCTION                                 ║
║              Background built structurally, not textually                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
SCENE CONSTRUCTION ORDER:
════════════════════════════════════════════════════════════════════════════════

1. BACKGROUND LAYER (furthest)
   - Sky/ceiling
   - Distant buildings/walls
   - Horizon elements

2. MIDGROUND LAYER
   - Architecture (columns, doors, windows)
   - Large props (furniture, vehicles)
   - Structural elements

3. FOREGROUND LAYER
   - Ground/floor
   - Immediate surroundings
   - Small props near subject

4. SUBJECT LAYER
   - Person placement
   - Proper scale to environment
   - Feet grounded naturally

════════════════════════════════════════════════════════════════════════════════
DEPTH REALISM:
════════════════════════════════════════════════════════════════════════════════

• Background objects are smaller (perspective)
• Atmospheric haze for distant objects
• Focus falloff with distance
• Consistent vanishing point
• Objects occlude properly (front covers back)

════════════════════════════════════════════════════════════════════════════════
AVOID THESE FAILURES:
════════════════════════════════════════════════════════════════════════════════

✗ Flat, posterized backgrounds
✗ Generic "AI studio" look
✗ Objects floating in space
✗ Incorrect scale relationships
✗ Impossible architecture
✗ Props that don't belong to the setting
`

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4: LIGHTING HARMONIZATION
// Unified lighting from scene to face
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_4_LIGHTING_HARMONIZATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   LAYER 4: LIGHTING HARMONIZATION                             ║
║               Scene → Garment → Body → Face (unified)                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
LIGHTING FLOW:
════════════════════════════════════════════════════════════════════════════════

SINGLE LIGHT SOURCE PRINCIPLE:
The scene has ONE primary light source.
This light affects EVERYTHING consistently:

Scene background → lit from source
Midground props → lit from source
Subject body → lit from source
Subject face → lit from source (COLOR ONLY, not shape)

════════════════════════════════════════════════════════════════════════════════
FACE LIGHTING (CRITICAL):
════════════════════════════════════════════════════════════════════════════════

For the FACE:
✓ Apply scene light COLOR TEMPERATURE to face
✓ Apply ambient lighting level
✓ Match shadow direction

✗ Do NOT re-render face geometry
✗ Do NOT add new shadows to face
✗ Do NOT change face structure with lighting
✗ Face lighting = COLOR WASH only

════════════════════════════════════════════════════════════════════════════════
LIGHTING CONSISTENCY CHECKS:
════════════════════════════════════════════════════════════════════════════════

□ Is shadow direction consistent across scene?
□ Is color temperature uniform?
□ Does face match environment lighting?
□ Does clothing match environment lighting?
□ Are there impossible light sources?

If ANY answer is NO → Lighting is WRONG → Fix before output.

════════════════════════════════════════════════════════════════════════════════
PROHIBITED:
════════════════════════════════════════════════════════════════════════════════

✗ Face lit differently than body
✗ Studio lighting on face, natural on body
✗ Multiple conflicting light directions
✗ "Spotlight" effect on face
✗ Face brighter than scene allows
`

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 5: MICRO VARIATION (3 outputs)
// Each variant differs in lighting, camera, environment
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYER_5_MICRO_VARIATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   LAYER 5: MICRO VARIATION (3 OUTPUTS)                        ║
║           Same identity, different lighting/camera/environment                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
VARIANT A: WARM / NATURAL
════════════════════════════════════════════════════════════════════════════════
• Color temperature: 3500-4500K (warm)
• Lighting mood: Golden hour, indoor warm
• Shadow softness: Soft to medium
• Camera: Standard framing
• Background: Base environment

════════════════════════════════════════════════════════════════════════════════
VARIANT B: COOL / OVERCAST
════════════════════════════════════════════════════════════════════════════════
• Color temperature: 5500-7000K (cool)
• Lighting mood: Overcast, shaded, blue hour
• Shadow softness: Very soft (diffused)
• Camera: Slightly closer (5% zoom)
• Background: Slightly less contrast

════════════════════════════════════════════════════════════════════════════════
VARIANT C: DRAMATIC / CONTRAST
════════════════════════════════════════════════════════════════════════════════
• Color temperature: Variable (warm/cool mix)
• Lighting mood: High contrast, dramatic
• Shadow softness: Harder shadows
• Camera: Slightly wider (5% pullback)
• Background: More depth/atmosphere

════════════════════════════════════════════════════════════════════════════════
VARIANT CONSISTENCY REQUIREMENTS:
════════════════════════════════════════════════════════════════════════════════

IDENTICAL across all variants:
• Face (pixel-locked)
• Body proportions
• Pose
• Expression
• Garment design
• Garment color
• Garment fit

DIFFERENT across variants:
• Lighting color temperature
• Shadow intensity
• Camera framing (±5%)
• Background ambient activity
• Atmospheric effects
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED LAYER PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function getIdentityLayersPrompt(): string {
    return `
${LAYER_0_FACE_FREEZE}

${LAYER_1_BODY_PRESERVATION}

${LAYER_2_GARMENT_APPLICATION}

${LAYER_3_SCENE_CONSTRUCTION}

${LAYER_4_LIGHTING_HARMONIZATION}
`
}

export function getVariantLayerPrompt(variant: 'A' | 'B' | 'C'): string {
    const variantSection = LAYER_5_MICRO_VARIATION.split('════════════════════════════════════════════════════════════════════════════════')[
        variant === 'A' ? 2 : variant === 'B' ? 4 : 6
    ]

    return `
${LAYER_5_MICRO_VARIATION}

GENERATING VARIANT ${variant}:
${variantSection || `Use Variant ${variant} settings as specified above.`}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logLayerStatus(sessionId: string): void {
    console.log(`\n🔒 IDENTITY LAYERS ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   LAYER 0: Face Freeze (Pixel Lock) ✓`)
    console.log(`   LAYER 1: Body Preservation ✓`)
    console.log(`   LAYER 2: Garment Application ✓`)
    console.log(`   LAYER 3: Scene Construction ✓`)
    console.log(`   LAYER 4: Lighting Harmonization ✓`)
    console.log(`   LAYER 5: Micro Variation (3 outputs) ✓`)
    console.log(`   ═══════════════════════════════════════════════`)
}
