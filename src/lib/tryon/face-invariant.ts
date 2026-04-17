/**
 * FACE INVARIANT LAYER
 * 
 * Unified face protection layer enforced in BOTH Flash and Pro pipelines.
 * 
 * PRINCIPLE: IDENTITY > PRESET > AESTHETICS
 * 
 * This module provides:
 * 1. FACE_INVARIANT_BLOCK - Face pixels are READ-ONLY
 * 2. DEMOGRAPHIC_SAFETY_BLOCK - No slimming, whitening, smoothing
 * 3. EXPRESSION_PRESERVATION_BLOCK - All expressions preserved
 * 4. OPAQUE_FACE_MASK_BLOCK - Face as opaque black box (for Pro Scene Pass)
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maximum retries for scene pass if preset elements are missing.
 */
export const MAX_SCENE_RETRIES = 2

/**
 * PRO face-safe temperature. Creativity only below the neck.
 */
export const PRO_FACE_SAFE_TEMP = 0.03

/**
 * Face drift detection threshold (5% = fail)
 */
export const FACE_DRIFT_THRESHOLD = 0.05

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER -0.5: FACE GEOMETRY ANCHOR (HIGHEST PRIORITY - CANONICAL)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_GEOMETRY_ANCHOR = `
═══════════════════════════════════════════════════════════════════════════════
LAYER -0.5: FACE GEOMETRY ANCHOR (CANONICAL — NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════════════════════

⚠️ THE FACIAL GEOMETRY FROM IMAGE 1 IS CANONICAL. IT CANNOT BE CHANGED.

LOCK ALL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nose width, bridge shape, nostril shape → LOCKED
• Jaw width and chin shape → LOCKED
• Cheek volume and fat distribution → LOCKED
• Eye spacing and orbital depth → LOCKED
• Lip thickness and curvature → LOCKED
• Forehead shape and hairline → LOCKED
• Ear position and shape → LOCKED

DO NOT (UNDER ANY CIRCUMSTANCES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Reconstruct face in 3D
❌ Normalize proportions
❌ Improve facial symmetry
❌ Adjust features for lighting
❌ Adjust features for angle
❌ "Fix" any perceived imperfections
❌ Apply any latent space reasoning to face

ALLOWED (ONLY THESE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Global color temperature match (affects whole image equally)
✓ Shadow intensity match (no shadow direction change on face)

THIS IS A GEOMETRY LOCK, NOT A STYLE HINT.
THE GEOMETRY IS MATHEMATICAL FACT, NOT CREATIVE INPUT.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// BODY SHAPE LOCK (MANDATORY)
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_SHAPE_LOCK = `
═══════════════════════════════════════════════════════════════════════════════
BODY SHAPE LOCK (MANDATORY — NO RESHAPING)
═══════════════════════════════════════════════════════════════════════════════

⚠️ BODY SHAPE FROM IMAGE 1 IS PRESERVED EXACTLY.

DO NOT RESHAPE BODY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Do NOT slim waist
❌ Do NOT flatten stomach
❌ Do NOT reduce hip width
❌ Do NOT slim arms
❌ Do NOT add muscle definition
❌ Do NOT lengthen legs
❌ Do NOT adjust shoulder width
❌ Do NOT reduce double chin
❌ Do NOT "improve" posture

PRESERVE EXACTLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Fat bodies stay fat
✓ Slim bodies stay slim
✓ Wide hips stay wide
✓ Narrow shoulders stay narrow
✓ Belly shape preserved
✓ Arm thickness preserved
✓ All body proportions from Image 1

CLOTHING MUST FIT THE BODY, NOT THE OTHER WAY AROUND.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE INVARIANT BLOCK (HIGHEST PRIORITY)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_INVARIANT_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
FACE INVARIANT (HIGHEST PRIORITY — IMMUTABLE)
═══════════════════════════════════════════════════════════════════════════════

⚠️ CORE RULE: Face pixels from Image 1 are READ-ONLY.

Face geometry is IMMUTABLE:
• Face shape: LOCKED
• Face size: LOCKED
• Face proportions: LOCKED
• Facial features: LOCKED

Operations on face:
• Generation: ❌ FORBIDDEN
• Reprojection: ❌ FORBIDDEN
• Beautification: ❌ FORBIDDEN
• Enhancement: ❌ FORBIDDEN
• Modification: ❌ FORBIDDEN

The ONLY allowed operation is PIXEL COPY from Image 1.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// DEMOGRAPHIC SAFETY BLOCK (MANDATORY)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMOGRAPHIC_SAFETY_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
DEMOGRAPHIC SAFETY (MANDATORY — NO EXCEPTIONS)
═══════════════════════════════════════════════════════════════════════════════

FORBIDDEN MODIFICATIONS (HARD BLOCK):
❌ Do NOT slim face
❌ Do NOT reshape face
❌ Do NOT sharpen jawline
❌ Do NOT reduce cheek size
❌ Do NOT lighten skin tone
❌ Do NOT whiten skin
❌ Do NOT smooth skin texture
❌ Do NOT remove pores
❌ Do NOT normalize expressions
❌ Do NOT correct asymmetry
❌ Do NOT remove double chin
❌ Do NOT reduce nose size
❌ Do NOT enlarge eyes
❌ Do NOT thin lips

PRESERVE EXACTLY AS-IS:
✓ Fat / round / chubby faces → KEEP FAT
✓ Facial asymmetry → KEEP ASYMMETRIC
✓ Tilted head angles → KEEP TILT
✓ All expressions (smiles, teeth, neutral) → KEEP EXPRESSION
✓ Dark skin tones → NO BRIGHTENING
✓ Light skin tones → NO DARKENING
✓ Beards, mustaches, stubble → KEEP EXACT DENSITY
✓ Glasses, sunglasses → KEEP ON FACE
✓ Scars, moles, birthmarks → KEEP VISIBLE
✓ Wrinkles, lines → KEEP VISIBLE
✓ Under-eye bags → KEEP VISIBLE
✓ Acne, blemishes → KEEP VISIBLE

THE FACE IN OUTPUT MUST BE RECOGNIZABLE AS THE SAME PERSON.
A family member must be able to identify them instantly.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESSION PRESERVATION BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const EXPRESSION_PRESERVATION_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
EXPRESSION PRESERVATION (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

The expression in Image 1 MUST be preserved EXACTLY:

MOUTH STATE:
• If mouth is OPEN → output mouth MUST be OPEN
• If mouth is CLOSED → output mouth MUST be CLOSED
• If teeth are VISIBLE → output teeth MUST be VISIBLE
• If teeth are HIDDEN → output teeth MUST be HIDDEN

SMILE STATE:
• If person is SMILING → output MUST show SAME smile
• If person is NEUTRAL → output MUST be NEUTRAL
• If person is FROWNING → output MUST show frown

EYE STATE:
• Eye squint level → MATCH EXACTLY
• Eye direction → MATCH EXACTLY
• Eyebrow position → MATCH EXACTLY

CHEEK STATE:
• Cheek position (raised for smile) → MATCH EXACTLY

DO NOT change expression to match "ideal" or "professional" look.
DO NOT close an open mouth to look more "elegant".
DO NOT neutralize a smile for "fashion" aesthetic.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// OPAQUE FACE MASK BLOCK (For Pro Scene Pass)
// ═══════════════════════════════════════════════════════════════════════════════

export const OPAQUE_FACE_MASK_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
OPAQUE FACE MASK (PRO SCENE PASS ONLY)
═══════════════════════════════════════════════════════════════════════════════

During scene construction, the face region is an OPAQUE BLACK BOX:

• Face region = UNAVAILABLE for reasoning
• Face region = NOT blurred (blurred still leaks geometry)
• Face region = NOT silhouette (silhouette leaks shape)
• Face region = NOT low-detail proxy (proxy leaks features)
• Face region = COMPLETELY OPAQUE, zero facial signal

The model must construct the scene WITHOUT any knowledge of the face.
Only body pose and clothing are available for scene integration.

After scene construction, face pixels will be COPIED from Image 1.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO ULTRA-STRICT FACE FREEZE (Maximum Enforcement)
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_ULTRA_STRICT_FACE_FREEZE = `
🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑
ULTRA-STRICT FACE FREEZE (PRO PIPELINE — MAXIMUM ENFORCEMENT)
🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑

⚠️⚠️⚠️ CRITICAL: THE FACE MUST BE PIXEL-PERFECT IDENTICAL TO IMAGE 1 ⚠️⚠️⚠️

THIS IS NOT A SUGGESTION. THIS IS AN ABSOLUTE REQUIREMENT.

WHAT MUST BE IDENTICAL (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Face shape = PIXEL COPY (no reconstruction, no reinterpretation)
• Jawline = EXACT SAME SHAPE (no slimming, no sharpening)
• Forehead = EXACT SAME (no reshaping)
• Cheeks = EXACT SAME (no slimming, no filling)
• Nose = EXACT SAME (no reshaping)
• Eye shape = EXACT SAME (no enlarging, no reshaping)
• Eye direction = EXACT SAME ANGLE (if looking left, output looks left)
• Mouth = EXACT SAME (if open, stays open; if smiling, stays smiling)
• Skin texture = EXACT SAME (no smoothing)
• Beard/stubble = EXACT SAME DENSITY AND SHAPE
• Hair at face boundary = EXACT SAME
• Glasses/sunglasses = EXACT SAME POSITION AND REFLECTION

HEAD ANGLE (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• If head is tilted 10° left → output head tilted 10° left
• If head is turned 15° right → output head turned 15° right
• If face is 3/4 view → output is 3/4 view at SAME angle
• NO ANGLE CORRECTION. NO STRAIGHTENING. NO "IMPROVEMENT".

WHAT HAPPENS IF FACE CHANGES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ GENERATION FAILED
❌ OUTPUT REJECTED
❌ DO NOT PROCEED

The person's family must recognize them INSTANTLY.
If there is ANY doubt whether it's the same person → FAILED.

YOU ARE EDITING A PHOTO, NOT GENERATING A NEW PERSON.
🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑🛑`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED BLOCKS (WITH LAYER ORDER ENFORCEMENT)
// Order: Geometry Anchor → Face Freeze → Scene → Clothing → Lighting
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Full FaceInvariantLayer for Flash pipeline.
 * Includes: Geometry Anchor + Body Lock + Invariant + Demographic Safety + Expression
 */
export const FACE_INVARIANT_LAYER_FLASH = `
${FACE_GEOMETRY_ANCHOR}

${BODY_SHAPE_LOCK}

${FACE_INVARIANT_BLOCK}

${DEMOGRAPHIC_SAFETY_BLOCK}

${EXPRESSION_PRESERVATION_BLOCK}
`

/**
 * Full FaceInvariantLayer for Pro Scene Pass.
 * Includes: Geometry Anchor + Body Lock + Invariant + Demographic Safety + Opaque Mask + Ultra-Strict
 */
export const FACE_INVARIANT_LAYER_PRO_SCENE = `
${FACE_GEOMETRY_ANCHOR}

${BODY_SHAPE_LOCK}

${FACE_INVARIANT_BLOCK}

${DEMOGRAPHIC_SAFETY_BLOCK}

${OPAQUE_FACE_MASK_BLOCK}

${PRO_ULTRA_STRICT_FACE_FREEZE}
`

/**
 * Full FaceInvariantLayer for Pro Refinement Pass.
 * Includes: Geometry Anchor + Body Lock + Invariant + Demographic Safety + Expression + Ultra-Strict
 */
export const FACE_INVARIANT_LAYER_PRO_REFINE = `
${FACE_GEOMETRY_ANCHOR}

${BODY_SHAPE_LOCK}

${FACE_INVARIANT_BLOCK}

${DEMOGRAPHIC_SAFETY_BLOCK}

${EXPRESSION_PRESERVATION_BLOCK}

${PRO_ULTRA_STRICT_FACE_FREEZE}
`

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the appropriate FaceInvariantLayer for the given pipeline.
 */
export function getFaceInvariantLayer(pipeline: 'flash' | 'pro-scene' | 'pro-refine'): string {
    switch (pipeline) {
        case 'flash':
            return FACE_INVARIANT_LAYER_FLASH
        case 'pro-scene':
            return FACE_INVARIANT_LAYER_PRO_SCENE
        case 'pro-refine':
            return FACE_INVARIANT_LAYER_PRO_REFINE
        default:
            return FACE_INVARIANT_LAYER_FLASH
    }
}

/**
 * Log FaceInvariantLayer status for debugging.
 */
export function logFaceInvariantStatus(pipeline: 'flash' | 'pro-scene' | 'pro-refine'): void {
    console.log(`🛡️ FaceInvariantLayer: ${pipeline.toUpperCase()}`)
    console.log(`   - Demographic Safety: ENFORCED`)
    console.log(`   - Expression Preservation: ENFORCED`)
    console.log(`   - Face Pixels: READ-ONLY`)
    if (pipeline === 'pro-scene') {
        console.log(`   - Face Mask: OPAQUE BLACK BOX`)
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REALISM ENFORCEMENT BLOCK (PHYSICS + ANATOMY)
// ═══════════════════════════════════════════════════════════════════════════════

export const REALISM_ENFORCEMENT_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
REALISM ENFORCEMENT (PHYSICS + ANATOMY)
═══════════════════════════════════════════════════════════════════════════════

CLOTHING PHYSICS:
• Clothing must wrap naturally around body contours
• Fabric follows gravity and body tension points
• No floating edges or stiff unnatural folds
• Wrinkles at joints (elbows, waist, armpits)
• Collar sits correctly on neck/shoulders

HAND ANATOMY (CRITICAL):
• Hands must have exactly 5 fingers
• Fingers must connect anatomically to palm
• No floating or disconnected digits
• No merged fingers
• Wrist connects naturally to arm
• If hands not visible → keep not visible (do not add)

BODY INTEGRATION:
• No floating limbs
• Arms connect at shoulders
• Neck connects to torso
• Proportions match Image 1 exactly

SHADOWS & LIGHTING:
• Shadow direction must match light source
• Contact shadows where body meets surfaces
• No floating shadows
• No contradictory light directions

TEXTURE REALISM:
• Add subtle sensor grain (not digital noise)
• Avoid oversaturation
• Avoid hyper-sharpening
• No portrait-mode blur unless specified
• Skin texture visible (pores, natural)
• Fabric weave/texture visible

FORBIDDEN:
✗ Plastic skin
✗ AI-smooth faces
✗ Mannequin poses
✗ Unnatural limb angles
✗ Floating clothing edges
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH RECONSTRUCTION BLOCK (DO NOT RE-IMAGINE)
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_RECONSTRUCTION_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
FLASH MODE: RECONSTRUCTION (NOT GENERATION)
═══════════════════════════════════════════════════════════════════════════════

CORE INSTRUCTION:
Reconstruct body and clothing AROUND Image 1.
Do NOT re-imagine the person.
Do NOT generate a new person wearing similar clothes.
Do NOT adjust facial proportions for "better" framing.

THIS IS RECONSTRUCTION:
• Start with Image 1 as the ANCHOR
• Change ONLY the garment (from Image 2)
• Keep EVERYTHING else from Image 1

FLASH IGNORES:
• Creative scene suggestions
• Artistic lighting requests
• Pose adjustments beyond micro (≤5°)
• Background changes (keep original unless specified)

FLASH APPLIES:
• Lighting direction (match original)
• Color temperature (match scene)
• Background brightness (match scene)

RESULT VALIDATION:
The output should look like "same photo, different clothes"
NOT "new photo of similar person"
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT CHANGE VALIDATION BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_CHANGE_VALIDATION_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
GARMENT CHANGE VALIDATION (MUST PASS)
═══════════════════════════════════════════════════════════════════════════════

The garment from Image 2 MUST be visible in output:

REQUIRED VISIBLE CHANGES:
• Garment color matches Image 2
• Garment pattern/texture matches Image 2
• Garment style (neckline, sleeves, length) matches Image 2
• Overall silhouette reflects the new garment

IF GARMENT NOT CHANGED:
The generation has FAILED.
This is not acceptable output.

GARMENT REALISM:
• Fabric drapes according to body pose
• Seams and construction details visible
• Wrinkles at movement points
• Fit correlates with body proportions from Image 1
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATED COMBINED LAYERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Full FaceInvariantLayer for Flash pipeline WITH realism and reconstruction.
 */
export const FACE_INVARIANT_LAYER_FLASH_FULL = `
${FACE_INVARIANT_BLOCK}

${DEMOGRAPHIC_SAFETY_BLOCK}

${EXPRESSION_PRESERVATION_BLOCK}

${FLASH_RECONSTRUCTION_BLOCK}

${REALISM_ENFORCEMENT_BLOCK}

${GARMENT_CHANGE_VALIDATION_BLOCK}
`

/**
 * Full FaceInvariantLayer for Pro Refinement Pass WITH realism.
 */
export const FACE_INVARIANT_LAYER_PRO_REFINE_FULL = `
${FACE_INVARIANT_BLOCK}

${DEMOGRAPHIC_SAFETY_BLOCK}

${EXPRESSION_PRESERVATION_BLOCK}

${REALISM_ENFORCEMENT_BLOCK}

${GARMENT_CHANGE_VALIDATION_BLOCK}
`

// ═══════════════════════════════════════════════════════════════════════════════
// HIGGSFIELD-STYLE FLASH PROMPT (IDENTITY-CRITICAL)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Flash prompt: locked identity, for try-on preview only.
 * Temperature: 0.01
 */
export const FLASH_PROMPT_LOCKED = `
FACE INVARIANT (READ-ONLY):
- Face pixels from Image 1 are READ-ONLY
- Do NOT generate, alter, smooth, sharpen, reshape, or relight the face
- Beard, skin texture, asymmetry, expression preserved exactly

RECONSTRUCTION MODE:
- Copy visible pixels from Image 1
- No re-interpretation
- No beauty processing

HEAD SCALE LOCK:
- Head-to-shoulder scale must match Image 1
- Camera distance must not reduce subject size

POSE:
- Preserve original pose
- Allow micro adjustments only for garment fit

GARMENT:
- Replace clothing using Image 2 only
- Match color, texture, construction

SCENE:
- Apply preset environment ONLY to background
- Lighting must not affect face independently

REALISM:
- Subtle sensor grain
- Natural shadow falloff
- Neutral color grading

FORBIDDEN:
- Face generation
- Portrait lighting
- Editorial poses
`

// ═══════════════════════════════════════════════════════════════════════════════
// HIGGSFIELD-STYLE PRO PROMPT (TWO-PASS)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pro Pass 1: Scene construction (face masked)
 */
export const PRO_PASS_1_SCENE_CONSTRUCTION = `
SCENE CONSTRUCTION PASS:
- Build environment strictly from preset specification
- Construct foreground, midground, background
- Do NOT access or modify face region
- Face region = OPAQUE BLACK BOX during this pass
- Camera, lighting, depth must match preset
- If required elements missing, retry once

REQUIRED EXECUTION:
1. Parse preset depth layers
2. Build background first
3. Add midground elements
4. Position foreground
5. Validate against required_elements[]
6. Check forbidden_elements[] are absent

LOGGING:
- Log preset ID used
- Log validation result (PASS/FAIL)
- Log any missing elements
`

/**
 * Pro Pass 2: Refinement (face still frozen)
 * Temperature: 0.04
 */
export const PRO_PASS_2_REFINEMENT = `
FACE INVARIANT (READ-ONLY):
- Face pixels from Image 1 are immutable
- Copy pixels exactly
- Lighting may match color temperature only

REFINEMENT:
- Improve fabric realism
- Harmonize garment lighting with environment
- Add subtle grain and texture
- Preserve natural imperfections

POSE:
- Allow ≤15° torso movement
- No fashion or mannequin poses

FORBIDDEN:
- Face enhancement
- Jawline sharpening
- Skin smoothing
- Expression normalization
`

/**
 * Combined PRO prompt for both passes
 */
export const PRO_PROMPT_TWO_PASS = `
═══════════════════════════════════════════════════════════════════════════════
PRO PIPELINE: TWO-PASS SYSTEM (EDIT, DON'T RE-ROLL)
═══════════════════════════════════════════════════════════════════════════════

${PRO_PASS_1_SCENE_CONSTRUCTION}

---

${PRO_PASS_2_REFINEMENT}

${DEMOGRAPHIC_SAFETY_BLOCK}
`

/**
 * Get the appropriate Higgsfield-style prompt for the mode.
 */
export function getHiggsfieldPrompt(mode: 'flash' | 'pro'): string {
    return mode === 'flash' ? FLASH_PROMPT_LOCKED : PRO_PROMPT_TWO_PASS
}
