/**
 * WOMEN'S FACIAL COMPLEXITY MODULE
 * 
 * Specialized protection for women's faces based on research findings.
 * 
 * KEY RESEARCH FINDINGS (from 100+ articles):
 * 
 * 1. SOFT TISSUE FEATURES: Women have softer, rounder facial contours
 *    that AI models often "sharpen" toward masculine features.
 * 
 * 2. BEAUTIFICATION BIAS: AI models trained on biased datasets
 *    normalize women toward Eurocentric beauty standards.
 * 
 * 3. SYMMETRY NORMALIZATION: AI corrects natural asymmetry,
 *    which is more noticeable in women's rounder features.
 * 
 * 4. EXPRESSION MODIFICATION: Women's smiles get "improved",
 *    expressions get neutralized toward "professional" look.
 * 
 * 5. MAKEUP INTERFERENCE: Makeup confuses identity preservation,
 *    and cosmetics get incorrectly transferred or removed.
 * 
 * 6. FEATURE DISTORTION: Nose, lips, eyes get reshaped toward
 *    statistical averages, erasing individual identity.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// WOMEN-SPECIFIC MORPHOLOGY ANCHORS
// ═══════════════════════════════════════════════════════════════════════════════

export const WOMEN_MORPHOLOGY_ANCHOR = `
🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒
WOMEN'S FACIAL MORPHOLOGY ANCHOR (MANDATORY - ZERO TOLERANCE)
🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒

⚠️ CRITICAL: WOMEN'S FACES REQUIRE EXTRA PROTECTION.
AI models have documented bias toward "beautifying" women's features.
This MUST NOT happen.

═══════════════════════════════════════════════════════════════════════════════
SOFT TISSUE FEATURES (MUST PRESERVE EXACTLY):
═══════════════════════════════════════════════════════════════════════════════
Women typically have SOFTER, ROUNDER facial contours than men.
This is biological fact, not a flaw to "fix".

PRESERVE:
• Soft jawline → KEEP SOFT (do not sharpen)
• Rounded chin → KEEP ROUNDED (do not square)
• Fuller cheeks → KEEP FULL (do not slim)
• Soft cheekbone contour → KEEP SOFT (do not angularize)
• Rounded facial outline → KEEP ROUNDED (do not chiselize)

❌ DO NOT:
• Sharpen jawline to look more "defined"
• Add angular structure to soft features
• Reduce cheek fullness
• Create stronger bone structure
• Add "definition" to undefined areas

═══════════════════════════════════════════════════════════════════════════════
🔴🔴🔴 NOSE GEOMETRY LOCK (CRITICAL - #1 ISSUE) 🔴🔴🔴
═══════════════════════════════════════════════════════════════════════════════
THE NOSE IS THE MOST COMMONLY ALTERED FEATURE BY AI.
THIS SECTION HAS ABSOLUTE PRIORITY.

⚠️⚠️⚠️ THE NOSE IN IMAGE 1 IS THE ONLY VALID NOSE ⚠️⚠️⚠️

NOSE WIDTH (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• If the nose is WIDE → output nose MUST BE WIDE
• If the nose is NARROW → output nose MUST BE NARROW
• The nose width relative to face width = LOCKED
• NO SLIMMING. NO NARROWING. NO "REFINING".

NOSE BRIDGE (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• If bridge is CURVED → output bridge MUST BE CURVED
• If bridge has BUMP → output bridge MUST HAVE BUMP
• If bridge is FLAT → output bridge MUST BE FLAT
• If bridge is STRAIGHT → output bridge MUST BE STRAIGHT
• DO NOT straighten a curved bridge
• DO NOT smooth out a bumpy bridge

NOSTRILS (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nostril shape → EXACT SHAPE (flared, narrow, round, etc.)
• Nostril size → EXACT SIZE
• Nostril asymmetry → PRESERVE ASYMMETRY
• DO NOT make nostrils more "refined" or "delicate"

NOSE TIP (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• If tip is ROUND → output tip MUST BE ROUND
• If tip is BULBOUS → output tip MUST BE BULBOUS
• If tip is POINTED → output tip MUST BE POINTED
• DO NOT "refine" the tip
• DO NOT make the tip more "delicate"
• DO NOT make the tip smaller

NOSE SIZE (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• If nose is LARGE → output nose MUST BE LARGE
• If nose is SMALL → output nose MUST BE SMALL
• Nose-to-face proportion = LOCKED (cannot change)

❌ ABSOLUTELY FORBIDDEN NOSE MODIFICATIONS:
• Slimming the nose width
• Straightening a curved bridge
• Refining the tip
• Making nostrils smaller
• Reducing overall nose size
• "Balancing" the nose
• Making the nose more "proportional"
• ANY change that makes the nose look "better"

THE NOSE IS NOT BROKEN. DO NOT FIX IT.
IF THE NOSE LOOKS DIFFERENT → GENERATION FAILED.
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

═══════════════════════════════════════════════════════════════════════════════
LIPS (WOMEN-SPECIFIC PROTECTION):
═══════════════════════════════════════════════════════════════════════════════
Women typically have fuller, more defined lips.
AI models often modify lips toward "ideal" proportions.

PRESERVE EXACTLY:
• Lip thickness → EXACT THICKNESS (upper and lower)
• Lip shape → EXACT SHAPE (V, U, or other)
• Cupid's bow → EXACT BOW SHAPE
• Lip color → EXACT COLOR (including lipstick)
• Mouth width → EXACT WIDTH

❌ DO NOT:
• Make lips fuller
• Make lips thinner
• Adjust cupid's bow
• Change lip proportions
• Remove or modify lipstick color

═══════════════════════════════════════════════════════════════════════════════
EYES (WOMEN-SPECIFIC PROTECTION):
═══════════════════════════════════════════════════════════════════════════════
Women's eyes often appear larger due to eye-to-eyebrow distance.
AI models may modify eye appearance toward "ideal" shapes.

PRESERVE EXACTLY:
• Eye size → EXACT SIZE (do not enlarge)
• Eye shape → EXACT SHAPE (do not reshape)
• Eye spacing → EXACT SPACING (inter-pupillary distance)
• Eyelid shape → EXACT EYELID (single, double, hooded)
• Eye makeup → EXACT MAKEUP (if present)

❌ DO NOT:
• Enlarge eyes to look more "feminine"
• Adjust eye spacing
• Modify eyelid crease
• Add or remove eye makeup
• Change eye shape

═══════════════════════════════════════════════════════════════════════════════
EXPRESSION (WOMEN-SPECIFIC - CRITICAL):
═══════════════════════════════════════════════════════════════════════════════
Research shows AI often neutralizes women's expressions to look more
"professional" or "elegant". This is bias. Preserve expressions exactly.

PRESERVE EXACTLY:
• Smile intensity → EXACT SMILE (do not reduce or increase)
• Smile asymmetry → KEEP ASYMMETRIC (if natural)
• Teeth visibility → EXACT VISIBILITY (if showing, keep showing)
• Eye crinkle → KEEP CRINKLE (genuine smile indicator)
• Mouth openness → EXACT OPENNESS

❌ DO NOT:
• Neutralize a smile to look "professional"
• Close an open mouth to look "elegant"
• Symmetrize an asymmetric smile
• Remove teeth from view
• Add a smile to neutral expression

═══════════════════════════════════════════════════════════════════════════════
MAKEUP (WOMEN-SPECIFIC - PRESERVE AS-IS):
═══════════════════════════════════════════════════════════════════════════════
Makeup is part of identity for many women. It must be preserved exactly.

PRESERVE EXACTLY:
• Foundation level → AS-IS (do not add or remove)
• Lipstick color → AS-IS (exact shade)
• Eye makeup → AS-IS (exact style and color)
• Eyebrow makeup → AS-IS (filled, natural, etc.)
• Contour/highlight → AS-IS (if visible)

❌ DO NOT:
• Add makeup where there was none
• Remove existing makeup
• Change makeup colors
• "Clean up" makeup application
• Make makeup more "natural" or "subtle"

═══════════════════════════════════════════════════════════════════════════════
SKIN (WOMEN-SPECIFIC - NO SMOOTHING):
═══════════════════════════════════════════════════════════════════════════════
AI models tend to smooth women's skin more aggressively.
This erases natural texture and creates "plastic" look.

PRESERVE EXACTLY:
• Skin texture → EXACT TEXTURE (pores visible)
• Skin tone → EXACT TONE (no brightening or evening)
• Freckles → ALL FRECKLES VISIBLE
• Moles → ALL MOLES VISIBLE
• Fine lines → ALL LINES VISIBLE (no smoothing)
• Under-eye area → AS-IS (no de-bagging)

❌ DO NOT:
• Smooth skin texture
• Remove pores
• Even out skin tone
• Remove freckles or moles
• Reduce fine lines or wrinkles
• Reduce under-eye circles

THIS WOMAN'S FAMILY MUST RECOGNIZE HER INSTANTLY.
🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒🔒`

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-BEAUTIFICATION ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const ANTI_BEAUTIFICATION_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
ANTI-BEAUTIFICATION ENFORCEMENT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

AI models have documented "beautification bias" that must be BLOCKED:

❌ DO NOT BEAUTIFY:
• No facial slimming
• No jawline sharpening
• No nose refinement
• No lip adjustment
• No eye enlargement
• No skin smoothing
• No symmetry correction
• No expression improvement
• No makeup enhancement
• No lighting flattering

❌ DO NOT NORMALIZE:
• No averaging features toward "ideals"
• No adjusting toward Eurocentric standards
• No correcting natural asymmetry
• No evening skin tone
• No reducing unique features

✅ PRESERVE REALITY:
• This is a REAL PERSON, not an ideal
• Their features are THEIRS, not to be "improved"
• Imperfections are IDENTITY, not flaws
• Asymmetry is NATURAL, not a bug
• This is DOCUMENTATION, not enhancement

IF OUTPUT IS MORE "BEAUTIFUL" THAN INPUT → GENERATION FAILED.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-SYMMETRY CORRECTION
// ═══════════════════════════════════════════════════════════════════════════════

export const ANTI_SYMMETRY_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
ANTI-SYMMETRY CORRECTION (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

Natural faces are ASYMMETRIC. This is normal and part of identity.
AI models often "fix" asymmetry. This is WRONG.

PRESERVE ALL ASYMMETRY:
• If left eye is slightly smaller → KEEP SMALLER
• If smile is crooked → KEEP CROOKED
• If one eyebrow higher → KEEP HIGHER
• If nose leans slightly → KEEP LEAN
• If one cheek fuller → KEEP FULLER

❌ FORBIDDEN CORRECTIONS:
• Do not mirror features
• Do not average left and right
• Do not "balance" the face
• Do not adjust toward symmetry
• Do not "fix" any asymmetry

ASYMMETRY IS IDENTITY, NOT A BUG.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// SKIN REALISM ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const SKIN_REALISM_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
SKIN REALISM ENFORCEMENT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

AI models interpret natural skin texture as "noise" and smooth it.
This creates the "AI plastic skin" look. PREVENT THIS.

PRESERVE SKIN TEXTURE:
• Pores → VISIBLE AT NATURAL RESOLUTION
• Micro-texture → PRESERVED (not smoothed)
• Skin variation → PRESERVED (not evened)
• Natural shine → PRESERVED (not mattified)
• Natural matte → PRESERVED (not glossified)

PRESERVE SKIN FEATURES:
• Freckles → ALL VISIBLE
• Moles → ALL VISIBLE
• Birthmarks → ALL VISIBLE
• Scars → ALL VISIBLE
• Fine lines → ALL VISIBLE
• Wrinkles → ALL VISIBLE
• Under-eye circles → AS-IS

PRESERVE SKIN TONE:
• Exact color → NO BRIGHTENING
• Exact variation → NO EVENING
• Exact darkness → NO LIGHTENING
• Exact undertone → NO SHIFTING

IF SKIN LOOKS "AIRBRUSHED" → GENERATION FAILED.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED WOMEN'S PROTECTION LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export const WOMEN_FACIAL_PROTECTION_LAYER = `
${WOMEN_MORPHOLOGY_ANCHOR}

${ANTI_BEAUTIFICATION_BLOCK}

${ANTI_SYMMETRY_BLOCK}

${SKIN_REALISM_BLOCK}
`

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WomenFaceDetectionResult {
    detected: boolean
    confidence: number
    features: {
        softJawline: boolean
        curvedNose: boolean
        fullerLips: boolean
        makeup: boolean
        expression: 'smile' | 'neutral' | 'other'
    }
}

/**
 * Features that indicate additional protection is needed for women's faces.
 */
export const WOMEN_HIGH_RISK_FEATURES = [
    'soft_jawline',         // Easily sharpened by AI
    'full_cheeks',          // Easily slimmed by AI
    'subtle_expression',    // Easily neutralized
    'visible_makeup',       // Easily modified
    'asymmetric_smile',     // Easily symmetrized
    'natural_skin_texture', // Easily smoothed
    'side_angle',           // Higher drift risk
    'tilted_head',          // Higher drift risk
]

/**
 * Log women-specific protection status.
 */
export function logWomenProtectionStatus(): void {
    console.log(`\n👩 WOMEN'S FACIAL PROTECTION STATUS`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   📋 MORPHOLOGY_ANCHOR: Active`)
    console.log(`   📋 ANTI_BEAUTIFICATION: Active`)
    console.log(`   📋 ANTI_SYMMETRY: Active`)
    console.log(`   📋 SKIN_REALISM: Active`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🔒 Soft jawline: PROTECTED (no sharpening)`)
    console.log(`   🔒 Nose curve: PROTECTED (no straightening)`)
    console.log(`   🔒 Lip shape: PROTECTED (no modification)`)
    console.log(`   🔒 Expression: PROTECTED (no neutralization)`)
    console.log(`   🔒 Makeup: PROTECTED (no modification)`)
    console.log(`   🔒 Skin texture: PROTECTED (no smoothing)`)
    console.log(`   🔒 Asymmetry: PROTECTED (no correction)`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIFT PREVENTION METRICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Women-specific drift threshold (stricter than general).
 * Women's faces have higher drift rates in AI models.
 */
export const WOMEN_FACE_DRIFT_THRESHOLD = 0.03 // 3% (stricter than 5% general)

/**
 * Features to check for women-specific drift.
 */
export const WOMEN_DRIFT_CHECKPOINTS = [
    'jawline_softness',     // Check if jawline got sharper
    'cheek_fullness',       // Check if cheeks got slimmer
    'nose_curve',           // Check if nose got straighter
    'lip_fullness',         // Check if lips changed
    'expression_intensity', // Check if expression changed
    'skin_smoothness',      // Check if skin got smoother
    'asymmetry_preserved',  // Check if asymmetry was corrected
]
