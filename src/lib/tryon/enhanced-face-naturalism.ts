/**
 * ENHANCED FACE CONSISTENCY & NATURALISM CONSTRAINTS
 * 
 * This module provides ultra-strict face preservation rules
 * and naturalism constraints for life-like image generation.
 * 
 * KEY IMPROVEMENTS:
 * - Face anchor point system (17 critical landmarks)
 * - Natural skin rendering (subsurface scattering, micro-texture)
 * - Life-like behavior (micro-expressions, natural asymmetry)
 * - Anti-AI detection (avoid "AI look")
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED FACE ANCHOR SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_ANCHOR_SYSTEM = `
🎯 FACE ANCHOR POINT SYSTEM (17 CRITICAL LANDMARKS)
══════════════════════════════════════════════════════

The face from Image 1 has 17 ANCHOR POINTS that must be PIXEL-LOCKED.
These points form a unique facial fingerprint that CANNOT change.

PRIMARY ANCHOR TRIANGLE (IDENTITY CORE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LEFT EYE CENTER - X,Y position locked
2. RIGHT EYE CENTER - X,Y position locked  
3. NOSE TIP - X,Y position locked

➤ This triangle defines the face's unique geometry
➤ Distance ratios between these 3 points = IMMUTABLE

SECONDARY ANCHORS (FEATURE DEFINITION):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. LEFT EYE INNER CORNER
5. LEFT EYE OUTER CORNER
6. RIGHT EYE INNER CORNER
7. RIGHT EYE OUTER CORNER
8. LEFT EYEBROW PEAK
9. RIGHT EYEBROW PEAK
10. NOSE BRIDGE TOP
11. LEFT NOSTRIL OUTER
12. RIGHT NOSTRIL OUTER
13. MOUTH LEFT CORNER
14. MOUTH RIGHT CORNER
15. UPPER LIP CENTER
16. LOWER LIP CENTER
17. CHIN CENTER

ANCHOR LOCK RULES:
━━━━━━━━━━━━━━━━━━
- All 17 anchor positions must maintain relative distances from Image 1
- Anchor distance variance allowed: ≤2% (MAXIMUM)
- If any anchor drifts >2% from reference → REJECT output
- Lighting changes do NOT move anchors (only illumination changes)

ANCHOR VALIDATION:
━━━━━━━━━━━━━━━━━━
Eye distance in Image 1: [MEASURE] → Output must match ±2%
Nose-to-chin in Image 1: [MEASURE] → Output must match ±2%
Mouth width in Image 1: [MEASURE] → Output must match ±2%
`

// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL SKIN RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

export const NATURAL_SKIN_RENDERING = `
🌟 NATURAL SKIN RENDERING (ANTI-PLASTIC)
══════════════════════════════════════════

Skin must look REAL, not rendered. Apply these physics-based rules:

SUBSURFACE SCATTERING (SSS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Light penetrates skin slightly, creating warm glow
- Strongest at: ears, nose tip, fingertips, thin areas
- Ears should have slight red/orange translucency against backlight
- Cheeks should show subtle warmth from blood vessels below
- Lips have visible SSS (slightly translucent)

MICRO-TEXTURE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Pores visible on nose, cheeks, chin, forehead
- Pore density varies by region (more on nose, less on forehead)
- Fine vellus hair (peach fuzz) visible on cheeks in side light
- Skin creases at expression areas (around eyes, mouth)
- Natural oil/shine on T-zone (forehead, nose, chin)

COLOR VARIATION (NON-UNIFORM):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Redness at cheeks, nose tip, ears
- Slight yellowness at high points (forehead, nose bridge)
- Darker tones in shadow areas (under eyes, neck)
- Blood vessel visibility at temples
- Lip color different from skin tone

FORBIDDEN (AI TELLS):
━━━━━━━━━━━━━━━━━━━━━━
❌ Perfectly uniform skin tone
❌ Airbrush/blur over pores
❌ Plastic-like surface reflection
❌ Missing subsurface scattering
❌ No color variation across face
❌ Missing micro-texture
`

// ═══════════════════════════════════════════════════════════════════════════════
// LIFE-LIKE BEHAVIOR RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const LIFELIKE_BEHAVIOR = `
🧬 LIFE-LIKE BEHAVIOR (NATURAL HUMAN APPEARANCE)
══════════════════════════════════════════════════

Humans are NOT symmetrical. Embrace natural asymmetry and micro-imperfections.

NATURAL ASYMMETRY (KEEP FROM IMAGE 1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- One eye slightly larger than other → PRESERVE
- One eyebrow higher/different shape → PRESERVE
- Nose slightly tilted → PRESERVE
- Mouth corners at different heights → PRESERVE
- Uneven hairline → PRESERVE
- One ear higher/different → PRESERVE

DO NOT "FIX" THESE - They are identity markers.

NATURAL MICRO-EXPRESSIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
If pose is casual/candid, add subtle expression cues:
- Slight eye squint (especially in bright light)
- Micro-smile at mouth corners (natural resting face)
- Eyebrow position varies with head tilt
- Slight jaw tension or relaxation

AVOID DEAD/MANNEQUIN FACE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Perfectly relaxed blank expression
❌ Eyes staring straight with no life
❌ Mouth in perfect neutral position
❌ Eyebrows in perfect neutral arch

NATURAL EYE BEHAVIOR:
━━━━━━━━━━━━━━━━━━━━━━
- Catchlights (reflections) in both eyes
- Catchlight position matches scene lighting
- Slight moisture/wetness visible
- Visible blood vessels in sclera (white of eye)
- Eyelashes cast micro-shadows on iris

NATURAL HAIR BEHAVIOR:
━━━━━━━━━━━━━━━━━━━━━━
- Individual strand visibility at edges
- Flyaway hairs (natural, not perfect)
- Hair reacts to implied breeze/movement
- Hair has volume, not flat
`

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-AI DETECTION RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const ANTI_AI_DETECTION = `
🔍 ANTI-AI DETECTION (AVOID COMMON AI TELLS)
══════════════════════════════════════════════

Generated images often have subtle tells. AVOID these:

FACE/SKIN TELLS:
━━━━━━━━━━━━━━━━━
❌ Over-smoothed skin (beauty filter effect)
❌ Glowing/luminous skin (unnatural radiance)
❌ Perfect symmetry in face
❌ Plastic-looking eyes
❌ Hair melting into skin at hairline
❌ Ears that don't match (shape, size, position)
❌ Teeth too perfect/white (if visible)

EYE TELLS (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━
❌ Eyes not looking at same focal point
❌ Iris shape different between eyes
❌ Missing or wrong catchlight reflections
❌ Sclera (whites) too bright/clean
❌ Eyelashes inconsistent direction

LIGHTING TELLS:
━━━━━━━━━━━━━━━━━
❌ Shadows inconsistent with light source
❌ No subsurface scattering on ears/nose
❌ Flat lighting with no dimensionality
❌ Specular highlights in wrong positions

TEXTURE TELLS:
━━━━━━━━━━━━━━━
❌ Fabric looks painted/flat
❌ Hair strands merged/blobby
❌ Jewelry without proper reflection
❌ Buttons/details inconsistent

BACKGROUND TELLS:
━━━━━━━━━━━━━━━━━
❌ Repeating patterns
❌ Nonsensical text/signage
❌ Warped architecture
❌ Missing shadows of subject

IF ANY OF THESE ARE DETECTED IN YOUR OUTPUT → REGENERATE
`

// ═══════════════════════════════════════════════════════════════════════════════
// ENHANCED FACE CONSISTENCY PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const ENHANCED_FACE_CONSISTENCY = `
🎯 ENHANCED FACE CONSISTENCY (MAXIMUM IDENTITY LOCK)
══════════════════════════════════════════════════════

STEP 1: FACIAL FINGERPRINT EXTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From Image 1, extract and LOCK:
- Face shape classification (oval, round, square, heart, oblong)
- Eye shape classification (almond, round, hooded, monolid, downturned)
- Nose shape classification (straight, curved, wide, narrow, button)
- Lip shape classification (full, thin, bow-shaped, wide, narrow)
- Skin tone (Fitzpatrick scale 1-6)
- All unique markers (moles, scars, birthmarks, freckles)

STEP 2: PROPORTION LOCK
━━━━━━━━━━━━━━━━━━━━━━━
Calculate and FREEZE these ratios:
- Face width / Face height
- Eye width / Face width
- Inter-eye distance / Face width
- Nose width / Mouth width
- Forehead height / Face height
- Chin height / Face height

VARIANCE ALLOWED: ≤2% on any ratio
If variance exceeds 2% → OUTPUT IS INVALID

STEP 3: FEATURE TRANSFER (NOT REGENERATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Do NOT regenerate the face. TRANSFER it:
- Copy face structure exactly
- Apply new lighting to existing face
- Adjust only: shadows, highlights, color temperature
- NEVER modify geometry

STEP 4: VALIDATION
━━━━━━━━━━━━━━━━━━━
Before output, verify:
✓ Same person recognition test = PASS
✓ All 17 anchor points within 2% variance
✓ No feature drift (eyes, nose, mouth in correct positions)
✓ Natural skin rendering applied
✓ No AI tells present
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED NATURALISM PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function buildEnhancedFaceConsistencyPrompt(): string {
    return [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '🧊 ENHANCED FACE CONSISTENCY & NATURALISM (V2.0)',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        FACE_ANCHOR_SYSTEM,
        '',
        ENHANCED_FACE_CONSISTENCY,
        '',
        NATURAL_SKIN_RENDERING,
        '',
        LIFELIKE_BEHAVIOR,
        '',
        ANTI_AI_DETECTION
    ].join('\n')
}

const faceNaturalism = {
    faceAnchors: FACE_ANCHOR_SYSTEM,
    skinRendering: NATURAL_SKIN_RENDERING,
    lifelike: LIFELIKE_BEHAVIOR,
    antiAI: ANTI_AI_DETECTION,
    enhanced: ENHANCED_FACE_CONSISTENCY,
    full: buildEnhancedFaceConsistencyPrompt()
}

export default faceNaturalism
