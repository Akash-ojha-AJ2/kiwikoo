/**
 * MASTER PROMPT ARCHITECTURE - COMPLETE REWRITE
 * 
 * STRICT BLOCK STRUCTURE (NO PROSE):
 * [FACE_FREEZE] - Copy face pixels, do not generate
 * [IDENTITY_LOCK] - Preserve geometry, hairline, beard
 * [CLOTHING_REPLACE] - Remove original, apply reference exactly
 * [POSE_LIMIT] - Micro only
 * [SCENE] - Real Indian photoshoot environment
 * [LIGHTING] - Preserve face light, harmonize garment + scene
 * 
 * FORBIDDEN TERMS (WILL CAUSE FAILURE):
 * - reimagine, editorial, cinematic, fashion pose, dramatic lighting
 * - portrait, studio, perfect, enhance, sharp, defined
 */

import 'server-only'
import { BODY_LOCK_PROMPT, BODY_WEIGHT_ENFORCEMENT, FACE_BODY_COHERENCE_ENFORCEMENT, EYE_PRESERVATION_PROMPT } from './body-lock'
import { getProSemanticPrompt } from './pro-semantic'

// ═══════════════════════════════════════════════════════════════
// FORBIDDEN TERMS (AUTO-FAIL IF PRESENT)
// ═══════════════════════════════════════════════════════════════

export const FORBIDDEN_TERMS = [
    'reimagine', 'editorial', 'cinematic', 'fashion pose', 'dramatic lighting',
    'portrait', 'studio', 'perfect', 'enhance', 'sharp', 'defined', 'clean',
    'beautiful', 'stunning', 'gorgeous', 'elegant', 'glamorous', 'polished',
    'flawless', 'refined', 'crisp', 'vivid', 'vibrant', 'bold', 'striking',
    'resembling', 'similar to', 'like the person', 'preserve identity',
    'artistic', 'creative', 'unique', 'stylized', 'aesthetic', 'vibe',
    'model', 'mannequin', 'fashion model', 'pose like'
]

// ═══════════════════════════════════════════════════════════════
// [FACE_FREEZE] - ABSOLUTE (NO EXCEPTIONS)
// ═══════════════════════════════════════════════════════════════

export const FACE_FREEZE_BLOCK = `[FACE_FREEZE]
Face region = READ ONLY.
Copy face pixels from Image 1.
Do not generate face.
Do not modify face.
Do not reinterpret face.

Face includes:
- Forehead to chin
- Ear to ear
- Eyebrows, eyes, nose, mouth, jawline
- Skin texture, pores, marks, stubble

If uncertain about any face pixel → copy from Image 1.
If model attempts to regenerate face → GENERATION FAILED.`

// ═══════════════════════════════════════════════════════════════
// [IDENTITY_LOCK] - Geometry and features
// ═══════════════════════════════════════════════════════════════

export const IDENTITY_LOCK_BLOCK = `[IDENTITY_LOCK]
Lock these features from Image 1:
- Hairline shape
- Beard shape and density
- Skin tone
- Ear shape
- Head size in frame
- Neck proportions

Allowed: lighting harmonization ONLY.
Forbidden: geometry edits.`

// ═══════════════════════════════════════════════════════════════
// [CLOTHING_REPLACE] - Destructive rebuild
// ═══════════════════════════════════════════════════════════════

export const CLOTHING_REPLACE_BLOCK = `[CLOTHING_REPLACE]
Original garment pixels = REMOVE completely.
Garment region = chest, waist, sleeves, collar.

New garment from Image 2 must:
- Match reference garment structure EXACTLY
- Match fabric COLOR EXACTLY (no color shift)
- Match fabric fall and drape
- Match seam logic and stitching
- Respect body depth and pose
- Show wrinkles at joints
- Follow gravity

GARMENT COLOR RULE:
- Color of garment = EXACT match to Image 2
- Do not shift hue, saturation, or brightness
- Do not add color grading to garment
- If Image 2 shows blue shirt → output blue shirt

If original garment visible after generation → RETRY.
If garment color differs from Image 2 → RETRY.`

// ═══════════════════════════════════════════════════════════════
// [ANTI_HALLUCINATION] - Prevent adding elements not in reference
// ═══════════════════════════════════════════════════════════════

export const ANTI_HALLUCINATION_BLOCK = `[ANTI-HALLUCINATION — CRITICAL]

★★★ DO NOT INVENT ELEMENTS NOT IN THE INPUT IMAGES ★★★

═══════════════════════════════════════════════════════════
GARMENT SCOPE RULE (DO NOT ADD EXTRA CLOTHING)
═══════════════════════════════════════════════════════════

ONLY change what is shown in Image 2 (clothing reference):
• If reference shows ONLY a top → Change ONLY the top
• If reference shows ONLY a dress → Change ONLY the dress
• If reference shows ONLY pants → Change ONLY the pants

⛔ DO NOT ADD CLOTHING ELEMENTS NOT IN REFERENCE:
• Reference shows kurta top → DO NOT add pants/salwar
• Reference shows shirt → DO NOT add jacket
• Reference shows top → DO NOT add bottom wear
• Reference shows dress → DO NOT add accessories

KEEP FROM IMAGE 1 (USER PHOTO):
✓ Their original pants/bottom wear (if reference is top-only)
✓ Their original shoes
✓ Their original accessories
✓ Their original jewelry

The clothing reference defines ONLY what gets replaced.
Everything else stays from the user's original photo.

═══════════════════════════════════════════════════════════
BACKGROUND HALLUCINATION BAN
═══════════════════════════════════════════════════════════

IF "keep original background" or similar is specified:
• Background = EXACT copy from Image 1
• NO scene changes
• NO new environments
• NO street scenes added
• NO café scenes added
• NO studio backdrops

The background pixels should be IDENTICAL to Image 1.
Only the clothing region changes.

═══════════════════════════════════════════════════════════
ANATOMY HALLUCINATION BAN
═══════════════════════════════════════════════════════════

DO NOT hallucinate body parts:
• If Image 1 shows person from waist up → Do NOT generate legs
• If arms are partly visible → Do NOT extend them
• If hands are cropped → Do NOT complete them

Respect the original image boundaries.

═══════════════════════════════════════════════════════════
FAILURE CONDITIONS
═══════════════════════════════════════════════════════════

Generation FAILED if:
□ Added pants when reference only showed top
□ Added salwar/dupatta when reference only showed kurta
□ Changed background when "keep background" was specified
□ Added accessories not in either input image
□ Extended body parts beyond original image boundaries`

// ═══════════════════════════════════════════════════════════════
// [POSE_LIMIT] - Micro only
// ═══════════════════════════════════════════════════════════════

export const POSE_LIMIT_BLOCK = `[POSE_LIMIT]
Face = FROZEN. Body = SUBTLE CHANGES ALLOWED.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE (ABSOLUTELY FROZEN):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Head position: LOCKED (no rotation changes)
- Face expression: IDENTICAL to Image 1
- Eye direction: IDENTICAL to Image 1
- Head tilt: PRESERVED exactly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BODY (SUBTLE CHANGES ALLOWED):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Allowed body pose changes:
✓ Sitting ↔ Standing (subtle transition)
✓ Leaning slightly ↔ Upright
✓ Arms at sides ↔ Arms relaxed
✓ Weight shift between legs
✓ Shoulder angle adjustments

LIMITS:
- Torso rotation: ≤ 20° from original
- Shoulder shift: ≤ 10%
- Arm position: natural variations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Allowed hand states:
✓ Rest at sides
✓ Slight bend at elbow
✓ In pocket (if natural)
✓ Holding nothing

Forbidden:
✗ Floating hands
✗ Extra fingers
✗ Merged fingers
✗ Fashion model poses

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: Face-Body Independence
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The body can change pose.
The face CANNOT change at all.
Think: "Same person, different pose, same exact face."`

// ═══════════════════════════════════════════════════════════════
// [SCENE] - Real Indian photoshoot environment
// ═══════════════════════════════════════════════════════════════

export const SCENE_BLOCK = `[SCENE]
Background = MUST CHANGE from original.
Scene from preset = MANDATORY.

The output MUST visibly show the preset environment:
- Background MUST match preset description
- Lighting MUST match preset lighting type
- Camera angle MUST match preset camera specs
- Depth layers MUST be visible (foreground, midground, background)

DO NOT keep the original background.
DO NOT generate neutral/blank backgrounds.

Scene requirements:
- Match camera height of Image 1
- Match focal length (estimate from face size)
- Include foreground + midground + background depth
- Add contact shadows under arms, neck, waist
- Add color bleed from environment onto clothing

VALIDATION:
If scene does not match preset → GENERATION FAILED.
If background unchanged from Image 1 → GENERATION FAILED.`

// ═══════════════════════════════════════════════════════════════
// [LIGHTING] - Layer-based lighting
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_BLOCK = `[LIGHTING]
⚠️ LIGHTING MUST MATCH THE SCENE - NO FLAT STUDIO LIGHTING.

LAYER-BASED LIGHTING:
1. Face lighting = PRESERVED from Image 1 (direction + temperature)
2. Garment lighting = adjusted to match scene preset
3. Background lighting = scene-driven

LIGHT DIRECTION:
- Identify light source direction from Image 1
- Shadow direction on body MUST match face shadows
- Shadow under chin, on garment folds, at arm creases

SCENE MATCHING:
- Outdoor scene → natural daylight with depth and direction
- Indoor scene → window or practical light direction
- Evening scene → warm, low-angle lighting
- NEVER flat, even lighting from all angles

FORBIDDEN:
- Flat frontal lighting (AI look)
- Shadowless face + body
- Rim light in natural scenes
- Over-bright commercial look`

// ═══════════════════════════════════════════════════════════════
// [NEGATIVE] - Hard ban list
// ═══════════════════════════════════════════════════════════════

export const NEGATIVE_BLOCK = `[NEGATIVE]
NEVER generate:
- New face
- Different person
- Smoothed skin
- Changed eye color
- Modified jawline
- Altered beard
- Fashion pose
- Floating limbs
- Mannequin stance
- Composited look
- Fantasy lighting
- CGI render
- AI art style`

// ═══════════════════════════════════════════════════════════════
// COMPLETE PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildMasterPrompt(sceneDescription: string): string {
    return `${FACE_FREEZE_BLOCK}

${EYE_PRESERVATION_PROMPT}

${IDENTITY_LOCK_BLOCK}

${BODY_LOCK_PROMPT}

${BODY_WEIGHT_ENFORCEMENT}

${FACE_BODY_COHERENCE_ENFORCEMENT}

${CLOTHING_REPLACE_BLOCK}

${ANTI_HALLUCINATION_BLOCK}

${POSE_LIMIT_BLOCK}

${SCENE_BLOCK}

═══════════════════════════════════════════════════════════════
MANDATORY SCENE SPECIFICATION (MUST BE VISIBLE IN OUTPUT):
═══════════════════════════════════════════════════════════════
${sceneDescription}

The above scene description is NOT optional.
The output MUST show this environment.
If the scene is not visible → retry generation.
═══════════════════════════════════════════════════════════════

${LIGHTING_BLOCK}

${NEGATIVE_BLOCK}`
}

/**
 * Build FLASH prompt (strictest identity, near-deterministic)
 */
export function buildFlashMasterPrompt(sceneDescription: string): string {
    return `[FLASH MODE]
Temperature: 0.01 (near-deterministic)
Face creativity: ZERO
Face modification: FORBIDDEN

${buildMasterPrompt(sceneDescription)}`
}

/**
 * Build PRO prompt (SEMANTIC INVARIANTS, NOT PIXEL LOCKS)
 * 
 * PRO is a "thinking" model that responds to semantic guidance.
 * Pixel-lock language causes PRO to hallucinate and compensate.
 * 
 * PRO = 3-Layer Editor:
 * - Layer 1: Identity Anchor (semantic invariants)
 * - Layer 2: Scene Construction (structural)
 * - Layer 3: Editorial Refinement (local-only)
 */
export function buildProMasterPrompt(sceneDescription: string): string {
    // PRO uses SEMANTIC controls, not pixel locks
    const proSemanticControls = getProSemanticPrompt()

    return `[PRO MODE — SEMANTIC EDITOR PIPELINE]

This is NOT a fashion editorial shoot.
This is a REALISTIC TRY-ON.

The person is NOT being improved.
The person is being shown in new clothing.
That is the ONLY change allowed.

${proSemanticControls}

═══════════════════════════════════════════════════════════════
SCENE SPECIFICATION:
═══════════════════════════════════════════════════════════════
${sceneDescription}

Build this scene ARCHITECTURALLY, not aesthetically.
If specified elements are missing → scene is INCORRECT.
═══════════════════════════════════════════════════════════════

${CLOTHING_REPLACE_BLOCK}

${ANTI_HALLUCINATION_BLOCK}

${POSE_LIMIT_BLOCK}

${NEGATIVE_BLOCK}`
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface ForbiddenCheck {
    valid: boolean
    violations: string[]
}

/**
 * Check for forbidden terms in prompt.
 */
export function checkForbiddenTerms(prompt: string): ForbiddenCheck {
    const lowerPrompt = prompt.toLowerCase()
    const violations: string[] = []

    for (const term of FORBIDDEN_TERMS) {
        if (lowerPrompt.includes(term.toLowerCase())) {
            violations.push(term)
        }
    }

    return {
        valid: violations.length === 0,
        violations
    }
}

/**
 * Log master prompt status.
 */
export function logMasterPromptStatus(mode: 'flash' | 'pro', promptLength: number): void {
    console.log(`\n🎯 MASTER PROMPT (${mode.toUpperCase()})`)
    console.log(`   📝 Length: ${promptLength} chars`)
    console.log(`   🧊 FACE_FREEZE: ✓`)
    console.log(`   🔒 IDENTITY_LOCK: ✓`)
    console.log(`   👕 CLOTHING_REPLACE: ✓`)
    console.log(`   🧍 POSE_LIMIT: ✓`)
    console.log(`   🏠 SCENE: ✓`)
    console.log(`   💡 LIGHTING: ✓`)
    console.log(`   ❌ NEGATIVE: ✓`)
}
