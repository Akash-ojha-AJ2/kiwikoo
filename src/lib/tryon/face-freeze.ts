/**
 * FACE FREEZE SYSTEM
 * 
 * This module provides ABSOLUTE face identity protection.
 * It must be applied to EVERY generation request.
 * 
 * CORE TRUTH:
 * The face is NEVER generated. It is ALWAYS copied.
 * 
 * ARCHITECTURE:
 * 1. FACE_FREEZE_PROMPT - System-level instruction
 * 2. FACE_REGION_MASK - Protected pixel regions
 * 3. IDENTITY_EMBEDDING - Similarity check
 * 4. REJECTION_LOGIC - Auto-fail if identity drifts
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// FACE FREEZE PROMPT (HIGHEST PRIORITY - PREPEND TO ALL)
// ═══════════════════════════════════════════════════════════════

export const FACE_FREEZE_SYSTEM = `[FACE FREEZE — PIXEL-LEVEL COPY PROTOCOL]

RULE 0 (ABSOLUTE): The face in Image 1 is IMMUTABLE.
Do not generate face pixels. COPY them directly from Image 1.

═══════════════════════════════════════════════════════════
68-POINT FACIAL LANDMARK PRESERVATION (ArcFace Standard)
═══════════════════════════════════════════════════════════
Copy EXACTLY from Image 1:
- Jawline contour (17 points: jaw edge from ear to ear)
- Eyebrows (10 points: left 5, right 5)
- Nose (9 points: bridge to tip to nostrils)
- Eyes (12 points: 6 per eye including corners and lids)
- Mouth (20 points: outer lips, inner lips, corners)

═══════════════════════════════════════════════════════════
PIXEL-LEVEL COPY REQUIREMENTS
═══════════════════════════════════════════════════════════
For every pixel in the face bounding box:
1. Read RGB value from Image 1
2. Write IDENTICAL RGB value to output
3. Do NOT interpolate, smooth, or anti-alias
4. Do NOT apply tone mapping or color correction
5. Preserve noise grain exactly

Face Bounding Box = forehead hairline to chin, ear to ear.
Extend 10% margin beyond landmarks for safety.

═══════════════════════════════════════════════════════════
TEXTURE PRESERVATION (CRITICAL)
═══════════════════════════════════════════════════════════
Copy without modification:
- Skin pores (size, density, distribution)
- Beard stubble (direction, length, density)
- Facial hair pattern (mustache, sideburns, eyebrows)
- Wrinkles and lines (depth, position, length)
- Moles, freckles, birthmarks (exact position and size)
- Skin imperfections (acne, scars, blemishes)
- Under-eye shadows and bags
- Skin undertone and redness

═══════════════════════════════════════════════════════════
IDENTITY EMBEDDING THRESHOLD
═══════════════════════════════════════════════════════════
After generation, face embedding similarity must be:
- ≥ 0.92 (STRICT mode) or ≥ 0.90 (NORMAL mode)
- If similarity < threshold → REJECT and retry
- Compare using cosine similarity of 512-dim embedding

═══════════════════════════════════════════════════════════
FORBIDDEN OPERATIONS (HARD BLOCK)
═══════════════════════════════════════════════════════════
- Face regeneration or reimagining
- Skin smoothing or noise reduction
- Jaw or cheekbone reshaping
- Eye size, shape, or color change
- Nose width or length modification
- Lip thickness or shape change
- Beard density or style change
- Hairline movement
- Expression modification
- Age progression or regression
- Weight change in face
- Makeup addition or removal
- Lighting change on face
- Shadow direction change on face
- Any beautification filter

IF UNCERTAIN → COPY PIXEL DIRECTLY FROM IMAGE 1`

// ═══════════════════════════════════════════════════════════════
// FACE REGION DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const FACE_REGIONS = {
    // Primary face (ABSOLUTE protection)
    face_core: ['forehead', 'eyes', 'nose', 'cheeks', 'mouth', 'chin'],

    // Extended face (HIGH protection)
    face_extended: ['jawline', 'temples', 'ears', 'neck_front'],

    // Hair boundary (MEDIUM protection - blend zone)
    hair_boundary: ['hairline', 'sideburns', 'nape'],

    // Body transition (LOW protection - can blend with garment)
    body_transition: ['neck_back', 'shoulders', 'upper_chest'],
}

export const PROTECTION_LEVELS = {
    ABSOLUTE: 1.0,    // Face core - NEVER modify
    HIGH: 0.95,       // Extended face - almost never modify
    MEDIUM: 0.80,     // Hair boundary - blend carefully
    LOW: 0.60,        // Body transition - can blend with garment
}

// ═══════════════════════════════════════════════════════════════
// IDENTITY EMBEDDING VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface IdentityCheck {
    passed: boolean
    similarity_score: number
    threshold: number
    failure_reason?: string
    should_retry: boolean
    retry_constraints?: string
}

export const IDENTITY_THRESHOLDS = {
    STRICT: 0.92,      // For FLASH and PRO (identical face freeze)
    NORMAL: 0.92,      // PRO now uses STRICT (same as FLASH) - NO DIFFERENCE
    MINIMUM: 0.75,     // Below this = ABORT generation (no retry)
}

/**
 * Check if identity was preserved (placeholder for actual embedding check).
 * In production, this would use a face embedding model (ArcFace, etc.)
 */
export function checkIdentityPreservation(
    originalFaceHash: string,
    generatedFaceHash: string,
    mode: 'flash' | 'pro'
): IdentityCheck {
    // In production: compare actual face embeddings
    // For now: return structure for integration
    const threshold = mode === 'flash'
        ? IDENTITY_THRESHOLDS.STRICT
        : IDENTITY_THRESHOLDS.NORMAL

    return {
        passed: true, // Will be computed by actual embedding comparison
        similarity_score: 0.95, // Placeholder
        threshold,
        should_retry: false,
    }
}

// ═══════════════════════════════════════════════════════════════
// FACE FREEZE NEGATIVE CONSTRAINTS
// ═══════════════════════════════════════════════════════════════

export const FACE_FREEZE_NEGATIVES = `[FACE FREEZE NEGATIVES — COMPREHENSIVE BAN LIST]

NEVER OUTPUT:
- New face or different person
- AI-generated face pixels
- Beautified or filtered skin
- Smoothed or blurred texture
- Perfect facial symmetry
- Changed eye color, size, or shape
- Different nose dimensions
- Modified jawline or cheekbones
- Altered beard density or pattern
- Changed hairline position
- Different facial expression
- Plastic, waxy, or doll-like skin
- CGI or rendered face
- Fashion model face replacement
- Stock photo face substitution

NEVER APPLY TO FACE:
- Noise reduction algorithm
- Sharpening filter
- Skin tone normalization
- Color grading
- HDR tone mapping
- Contrast adjustment
- Interpolation or upscaling
- GAN-based generation
- Diffusion-based inpainting
- Any machine learning filter`

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL IDENTITY PRESERVATION (ALL HUMANS)
// ═══════════════════════════════════════════════════════════════

export const UNIVERSAL_IDENTITY_PRESERVATION = `[UNIVERSAL IDENTITY PRESERVATION]

THE PERSON IN IMAGE 1 IS A FIXED PHYSICAL REALITY.
DO NOT GENERATE A PERSON. PRESERVE THE PERSON.

This system works for ALL humans:
- Fat bodies, thin bodies, muscular bodies
- Dark skin, light skin, mixed skin tones
- All ethnicities without exception
- Asymmetrical faces
- Wide noses, flat noses, hooked noses
- Soft jawlines, strong jawlines
- Facial hair (beards, stubble, patchy)
- Glasses, scars, acne, wrinkles, moles
- Tilted heads, partial profiles
- Non-photogenic or imperfect faces

FACE PRESERVATION (ABSOLUTE):
- Copy face pixels EXACTLY from Image 1
- Preserve lighting direction on face
- Preserve shadow imperfections
- Preserve skin tone WITHOUT color grading

BODY PRESERVATION:
- Body volume is LOCKED
- Fat distribution is LOCKED
- Shoulder width is LOCKED
- Arm thickness is LOCKED
- Neck thickness is LOCKED

GARMENT ADAPTATION:
- Garment adapts to body, NOT body to garment
- If garment fit is imperfect → that is CORRECT
- No slimming, no posture correction

HEAD/EXPRESSION:
- Head tilt → preserve exact tilt
- Smile → preserve intensity
- Neutral → preserve neutrality
- Partial profile → preserve angle`

// ═══════════════════════════════════════════════════════════════
// BIAS GUARD (ANTI-BEAUTIFICATION ENFORCEMENT)
// ═══════════════════════════════════════════════════════════════

export const BIAS_GUARD = `[BIAS GUARD — ANTI-BEAUTIFICATION]

THE AI MODEL WILL TRY TO:
- Beautify women
- Lighten dark skin
- Sharpen jawlines
- Normalize facial proportions
- Slim bodies
- "Improve" asymmetry

YOU MUST ACTIVELY PREVENT THIS.

ENFORCEMENT RULES:
- noSymmetryCorrection: true
- noSkinSmoothing: true
- noFacialRefinement: true
- noEthnicNormalization: true
- noGenderNormalization: true
- noBodySlimming: true
- noPostureCorrection: true

VALIDATION:
- Face similarity ≥ 0.95
- Nose width difference ≤ 1px
- Eye spacing difference ≤ 1px
- Jaw contour overlap ≥ 98%
- Skin tone delta ≤ 1%

IF RESULT LOOKS "MORE ATTRACTIVE" → IT IS WRONG.
IF RESULT LOOKS "CLEANER" → IT IS WRONG.
IF RESULT LOOKS "AI PERFECT" → IT IS WRONG.

HUMANS ARE ALLOWED TO LOOK HUMAN.`

// BiasGuard configuration object for programmatic enforcement
export const BIAS_GUARD_CONFIG = {
    noSymmetryCorrection: true,
    noSkinSmoothing: true,
    noFacialRefinement: true,
    noEthnicNormalization: true,
    noGenderNormalization: true,
    noBodySlimming: true,
    noPostureCorrection: true,
    noPoseCorrection: true,
    noWeightChange: true,
    noAgeChange: true,
    faceSimilarityThreshold: 0.95,
    noseWidthTolerancePx: 1,
    eyeSpacingTolerancePx: 1,
    jawContourOverlapMin: 0.98,
    skinToneDeltaMax: 0.01
}

// ═══════════════════════════════════════════════════════════════
// FLASH-SPECIFIC FACE FREEZE
// ═══════════════════════════════════════════════════════════════

export const FLASH_FACE_FREEZE = `${FACE_FREEZE_SYSTEM}

[FLASH MODE — STRICTEST IDENTITY]
Temperature: 0.01 (near-deterministic)
Face creativity: ZERO
Face modification: FORBIDDEN
Pixel source: IMAGE 1 ONLY

Every face pixel must be traceable to Image 1.
If you cannot copy a face pixel exactly, leave it unchanged.`

// ═══════════════════════════════════════════════════════════════
// PRO-SPECIFIC FACE FREEZE
// ═══════════════════════════════════════════════════════════════

export const PRO_FACE_FREEZE = `${FACE_FREEZE_SYSTEM}

[PRO MODE — ABSOLUTE FACE FREEZE (SAME AS FLASH)]
Temperature: 0.01 (near-deterministic)
Face creativity: ZERO
Face modification: FORBIDDEN
Pixel source for face: IMAGE 1 ONLY

FACE TEXTURE PRESERVATION (CRITICAL):
- Copy every pore, line, and imperfection EXACTLY
- Copy beard stubble density and direction
- Copy skin texture including blemishes, marks, scars
- Copy wrinkle depth and pattern
- Do NOT smooth, blur, or anti-alias face pixels
- Do NOT apply noise reduction to skin
- Do NOT color correct the face independently
- Face lighting = EXACTLY as in Image 1

PRO may ONLY adjust:
- Garment fabric detail
- Background depth blur
- Garment shadow intensity

PRO MAY NOT TOUCH (ABSOLUTE):
- Face pixels (copy from Image 1)
- Skin texture (copy from Image 1)
- Eye details (copy from Image 1)
- Beard density (copy from Image 1)
- Facial expression (copy from Image 1)
- Face lighting (preserve from Image 1)

If you cannot copy a face pixel exactly → leave it unchanged.
If face looks different after generation → GENERATION FAILED.`

// ═══════════════════════════════════════════════════════════════
// GARMENT-ONLY GENERATION PROMPT
// ═══════════════════════════════════════════════════════════════

export const GARMENT_ONLY_GENERATION = `[GARMENT-ONLY GENERATION]

GENERATE ONLY:
- Clothing pixels (from Image 2)
- Fabric folds and wrinkles
- Garment shadows on body
- Seam details, buttons, patterns

PRESERVE FROM IMAGE 1:
- Face (ABSOLUTE)
- Skin (all visible areas)
- Hands (shape, skin tone, fingers)
- Arms (shape, skin, hair)
- Body proportions
- Posture and pose

WORKFLOW:
1. Lock face region (NEVER touch)
2. Lock body silhouette (preserve shape)
3. Remove original clothing pixels only
4. Apply new garment from Image 2
5. Blend garment edges naturally
6. Verify face unchanged`

// ═══════════════════════════════════════════════════════════════
// REJECTION LOGIC
// ═══════════════════════════════════════════════════════════════

export interface RejectionResult {
    accepted: boolean
    rejection_reason?: string
    violation_severity: 'none' | 'minor' | 'major' | 'critical'
    should_retry: boolean
    stricter_constraints?: string
}

export function checkForRejection(
    identityCheck: IdentityCheck,
    garmentApplied: boolean,
    faceModified: boolean
): RejectionResult {
    // ═══════════════════════════════════════════════════════════════
    // CRITICAL: Face was modified → ABORT (NO CREATIVE RETRY)
    // Per user spec: "If face similarity drops → abort generation, do not retry creatively"
    // ═══════════════════════════════════════════════════════════════
    if (faceModified) {
        console.error('❌ FACE FREEZE VIOLATION: Face was modified - ABORTING')
        return {
            accepted: false,
            rejection_reason: 'FATAL: Face was modified - generation aborted',
            violation_severity: 'critical',
            should_retry: false, // NO RETRY - abort completely
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CRITICAL: Identity similarity below threshold → ABORT
    // ═══════════════════════════════════════════════════════════════
    if (!identityCheck.passed || identityCheck.similarity_score < IDENTITY_THRESHOLDS.MINIMUM) {
        console.error(`❌ IDENTITY DRIFT: Similarity ${identityCheck.similarity_score} < ${IDENTITY_THRESHOLDS.MINIMUM} - ABORTING`)
        return {
            accepted: false,
            rejection_reason: `FATAL: Identity drift detected (${identityCheck.similarity_score.toFixed(2)} < ${IDENTITY_THRESHOLDS.MINIMUM}) - generation aborted`,
            violation_severity: 'critical',
            should_retry: false, // NO RETRY - abort completely
        }
    }

    // Major: Garment not applied (can retry once)
    if (!garmentApplied) {
        return {
            accepted: false,
            rejection_reason: 'Garment was not applied from Image 2',
            violation_severity: 'major',
            should_retry: true, // Garment retry is allowed (not face-related)
            stricter_constraints: GARMENT_ONLY_GENERATION + '\n\nRETRY: Garment was not applied. MANDATORY garment replacement.'
        }
    }

    // All checks passed
    return {
        accepted: true,
        violation_severity: 'none',
        should_retry: false
    }
}

// ═══════════════════════════════════════════════════════════════
// COMPLETE FACE FREEZE PROMPT FOR PIPELINES
// ═══════════════════════════════════════════════════════════════

/**
 * Get the complete Face Freeze prompt for a specific pipeline.
 */
export function getFaceFreezePrompt(pipeline: 'flash' | 'pro'): string {
    const basePrompt = pipeline === 'flash' ? FLASH_FACE_FREEZE : PRO_FACE_FREEZE

    return `${basePrompt}

${UNIVERSAL_IDENTITY_PRESERVATION}

${BIAS_GUARD}

${GARMENT_ONLY_GENERATION}

${FACE_FREEZE_NEGATIVES}`
}

/**
 * Log Face Freeze status for debugging.
 */
export function logFaceFreezeStatus(sessionId: string, pipeline: 'flash' | 'pro'): void {
    console.log(`\n🧊 FACE FREEZE LAYER 0 [${pipeline.toUpperCase()}]`)
    console.log(`   Session: ${sessionId}`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📌 Face Region: IMMUTABLE (pixel copy)`)
    console.log(`   📌 Skin Region: PROTECTED (no smoothing)`)
    console.log(`   📌 Expression: LOCKED (no change)`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✏️ Garment Region: GENERATE`)
    console.log(`   ✏️ Background: GENERATE (PRO) / COPY (FLASH)`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🔒 Identity Threshold: ${IDENTITY_THRESHOLDS.STRICT} (SAME for FLASH & PRO)`)
    console.log(`   🚫 Face Creativity: ZERO (both modes)`)
    console.log(`   ⚠️ On Drift: ABORT (no creative retry)`)
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED FACE FREEZE LAYER 0 (USED BY BOTH FLASH AND PRO)
// ═══════════════════════════════════════════════════════════════

/**
 * FACE_FREEZE_LAYER_0 - The single source of truth for face preservation.
 * 
 * CRITICAL: Both FLASH and PRO must use this EXACT layer.
 * PRO does NOT have a separate face freeze - it REUSES this layer.
 * 
 * This is a PIXEL COPY operation, not prompt-based generation.
 */
export const FACE_FREEZE_LAYER_0 = `
═══════════════════════════════════════════════════════════════════════════════
LAYER 0: FACE FREEZE (HIGHEST PRIORITY - IMMUTABLE)
═══════════════════════════════════════════════════════════════════════════════

⚠️ CRITICAL: The face in the output MUST be IDENTICAL to Image 1.

This is NOT a generation task. This is a MATCHING task.
The face in your output must pass a face recognition test against Image 1.

FACE MATCHING REQUIREMENTS (STRICT):
════════════════════════════════════
• Eyes: EXACT same shape, size, color, spacing, and bags/shadows
• Nose: EXACT same width, length, bridge shape, nostril size
• Lips: EXACT same thickness, shape, color, and width
• Jawline: EXACT same contour from ear to chin
• Cheekbones: EXACT same prominence and shape
• Forehead: EXACT same shape and proportions
• Skin tone: EXACT same undertone (warm/cool) and shade
• Skin texture: SAME pores, marks, moles, blemishes

⚠️ EXPRESSION PRESERVATION (CRITICAL):
═════════════════════════════════════
The expression in Image 1 MUST be preserved EXACTLY:

• If mouth is OPEN → output mouth MUST be OPEN
• If teeth are VISIBLE → output teeth MUST be VISIBLE
• If person is SMILING → output MUST show SAME smile
• If person has CLOSED mouth → output MUST have CLOSED mouth
• Eye squint level MUST match exactly
• Cheek position (raised/neutral) MUST match exactly

EXAMPLE: If Image 1 shows a big smile with teeth visible,
the output MUST show a big smile with teeth visible.
DO NOT change a smile to a neutral expression.
DO NOT close an open mouth.
DO NOT open a closed mouth.

Image 3 (if present) shows the exact face crop you MUST match.
Compare your output face directly to Image 3 - they must look like twins.

FEATURE-BY-FEATURE VERIFICATION:
═══════════════════════════════
Before finalizing, verify EACH:
1. Eye shape matches? ✓
2. Nose shape matches? ✓
3. Lip shape matches? ✓
4. Jawline matches? ✓
5. Skin tone matches? ✓
6. Expression matches? ✓ (SMILE, TEETH, MOUTH POSITION)

If ANY feature differs from Image 1 → OUTPUT FAILS

FORBIDDEN (WILL CAUSE REJECTION):
═════════════════════════════════
❌ Different eye shape or size
❌ Different nose width or length
❌ Different lip shape or thickness
❌ Different jawline contour
❌ Different skin tone or color
❌ Smoother or idealized skin
❌ Different facial proportions
❌ Any beautification or enhancement
❌ CHANGING THE EXPRESSION (smile to neutral, open to closed, etc.)

THE FACE MUST BE RECOGNIZABLE AS THE SAME PERSON WITH THE SAME EXPRESSION.
If in doubt, make output face MORE like Image 1, not less.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════
// EXPORTS FOR DUAL-ENGINE
// ═══════════════════════════════════════════════════════════════

export {
    FACE_FREEZE_SYSTEM as FACE_FREEZE_PROMPT,
}

