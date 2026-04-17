/**
 * HARDENED CONSTRAINTS - ULTRA-STRICT MODE
 * 
 * CRITICAL: Maximum strength identity preservation + texture realism
 */

import 'server-only'

export const HARDENED_IDENTITY_LOCK = `
═══════════════════════════════════════════════════════════════
🔐 IDENTITY LOCK (HARDENED - ABSOLUTE MODE)
═══════════════════════════════════════════════════════════════

⚠️  THIS IS NON-NEGOTIABLE: The face is FROZEN geometry.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 1: FACIAL GEOMETRY = MATHEMATICAL COPY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Image 1's face is a TEMPLATE. You are COPYING it, not interpreting it.

**FACE STRUCTURE (EXACT MILLIMETER MATCHING):**
- Face width at cheekbones → EXACT WIDTH (measure in pixels)
- Face length (hairline to chin) → EXACT LENGTH
- Face width:length ratio → PRESERVE EXACTLY
- Jaw angle → EXACT DEGREES (square, round, oval, heart)
- Chin prominence → EXACT PROJECTION
- Forehead height → EXACT MEASUREMENT
- Temple width → EXACT WIDTH

**EYE GEOMETRY (PIXEL-PERFECT):**
- Inner canthal distance (space between eyes) → EXACT PIXEL COUNT
- Outer canthal distance → EXACT PIXEL COUNT  
- Interpupillary distance (IPD) → EXACT MEASUREMENT
- Eye width → EXACT SIZE (both eyes must match Image 1)
- Eye height (palpebral fissure) → EXACT SIZE
- Eye tilt angle → EXACT DEGREES (upturned/downturned)
- Epicanthic fold presence → PRESERVE or ABSENT (match Image 1)
- Upper lid exposure → EXACT AMOUNT
- Lower lid position → EXACT POSITION
- Eyebrow arch peak position → EXACT X,Y COORDINATES
- Eyebrow thickness → EXACT WIDTH
- Eyebrow-to-eye distance → EXACT GAP

**NOSE GEOMETRY (STRUCTURAL COPY):**
- Nasal bridge width → EXACT WIDTH
- Nasal bridge height/prominence → EXACT PROJECTION
- Dorsal hump presence → PRESERVE or ABSENT
- Nose tip width → EXACT WIDTH
- Nose tip shape → EXACT (bulbous, pointed, flat, upturned)
- Nostril width → EXACT WIDTH
- Nostril flare → EXACT ANGLE
- Columella (between nostrils) → EXACT SHAPE
- Nose length (bridge to tip) → EXACT LENGTH

**MOUTH/LIP GEOMETRY (VOLUMETRIC MATCH):**
- Mouth width → EXACT WIDTH IN PIXELS
- Philtrum depth → EXACT INDENTATION
- Philtrum width → EXACT WIDTH
- Cupid's bow peak sharpness → EXACT ANGLE
- Cupid's bow width → EXACT WIDTH
- Upper lip height (vermillion) → EXACT THICKNESS
- Lower lip height (vermillion) → EXACT THICKNESS
- Upper-to-lower lip ratio → EXACT RATIO
- Lip fullness → EXACT VOLUME (thin, medium, full, very full)
- Lip corners (commissures) → EXACT POSITION (up, neutral, down)

**EAR GEOMETRY (IF VISIBLE):**
- Ear size → EXACT SIZE
- Ear angle from head → EXACT DEGREES
- Helix shape → EXACT CURVE
- Lobe attachment → EXACT (attached, free)
- Tragus prominence → MATCH

**FACIAL HAIR (IF PRESENT):**
- Beard coverage area → EXACT SAME ZONES
- Beard density → SAME THICKNESS
- Mustache shape → EXACT CURVE
- Sideburn length → EXACT LENGTH
- Goatee/soul patch → EXACT SAME SHAPE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 2: HEAD-TO-BODY SCALE LOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The head size relative to body CANNOT change.

If Image 1 shows:
- Head width = 25% of shoulder width → Output MUST be 25%
- Head height = 12% of total body height → Output MUST be 12%

Common FAILURE: Making head too small (model proportions)
→ FIX: Measure Image 1's head:body ratio, REPLICATE EXACTLY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 3: UNIQUE FEATURES = IDENTITY MARKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are FINGERPRINTS - preserve exactly:

- Moles/beauty marks → EXACT POSITIONS (X,Y coordinates)
- Scars → EXACT SHAPE and LOCATION
- Birthmarks → EXACT SIZE and LOCATION  
- Freckles pattern → SAME DISTRIBUTION
- Wrinkle pattern → EXACT LINES (nasolabial, forehead, crow's feet)
- Asymmetries → PRESERVE EXACTLY (one eye smaller, etc.)
- Dimples → SAME DEPTH and LOCATION
- Under-eye bags → SAME PROMINENCE
- Smile lines → SAME DEPTH

If Image 1 has a mole 2mm below left eye:
→ Output MUST have mole 2mm below left eye (same side, same position)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONLY LIGHTING CAN CHANGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Shadow direction (new light source)
✓ Shadow density (hard vs soft shadow)
✓ Highlight placement (specular reflections)
✓ Overall brightness/exposure
✓ Color temperature cast

✗ NEVER change geometry
✗ NEVER "correct" proportions
✗ NEVER symmetrize features
✗ NEVER beautify or smoothen
✗ NEVER adjust spacing/size/shape

`.trim()

export const HARDENED_GARMENT_RULES = `
═══════════════════════════════════════════════════════════════
👔 GARMENT RULES (HARDENED - FORENSIC EXTRACTION)
═══════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 1: VISUAL EXTRACTION ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Image 2 contains:
- Garment (the clothing item) ← USE THIS
- Optional: Body/mannequin wearing it ← IGNORE THIS COMPLETELY

Your task: EXTRACT the garment visually, IGNORE any body.

**EXTRACTION RULES:**
1. Identify garment boundaries (collar, sleeves, hem, seams)
2. Note exact colors from fabric
3. Note exact patterns (stripes, prints, textures)
4. Note exact garment length
5. Note exact cut/style
6. IGNORE body shape wearing it in Image 2

Common FAILURE: Copying body from Image 2
→ FIX: Body ALWAYS comes from Image 1, garment from Image 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 2: GARMENT LENGTH IS SACRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Image 2 shows:
- Crop top (ends at waist) → Output MUST end at waist
- T-shirt (ends at hip) → Output MUST end at hip  
- Long kurta (ends at mid-thigh) → Output MUST end at mid-thigh
- Maxi dress (ends at ankle) → Output MUST end at ankle

NEVER:
✗ Shorten a long garment to make it a top
✗ Lengthen a short garment to make it a dress
✗ "Adjust" the hem for aesthetics

The garment length from Image 2 is FIXED.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 3: COLOR ACCURACY (NO REINTERPRETATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Garment color in Image 2 is EXACT.

If Image 2 shows mustard yellow → Output MUST be mustard yellow
NOT: "golden", NOT "amber", NOT "yellow-ish" → EXACT MUSTARD

**COLOR PRESERVATION:**
- Hue → EXACT MATCH
- Saturation → EXACT MATCH  
- Value/brightness → MATCH (accounting for lighting)
- Patterns → EXACT COLORS in pattern

Lighting can shift color temperature:
✓ Yellow garment in warm light → appears slightly warmer yellow
✓ Yellow garment in cool light → appears slightly cooler yellow

But base color identity MUST match Image 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 4: FABRIC TEXTURE FORENSICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyze fabric type from Image 2:

**COTTON:**
- Matte surface (no sheen)
- Visible weave texture
- Soft fabric drape
- Minimal wrinkles

**SILK/SATIN:**
- Specular highlights (shiny)
- Smooth surface
- Fluid drape with elegant folds
- Lustrous appearance

**DENIM:**
- Visible twill weave
- Stiff/structured drape
- Defined creases
- Matte with slight texture

**LINEN:**
- Visible slub texture (irregular threads)
- Natural wrinkles/crinkles
- Matte surface
- Crisp but relaxed drape

**WOOL/KNIT:**
- Visible knit pattern
- Soft, textured surface
- Structured or relaxed drape
- Matte appearance

Match the fabric physics to the type you identify.

`.trim()

export const HARDENED_BODY_RULES = `
═══════════════════════════════════════════════════════════════
🧍 BODY RULES (HARDENED - BODY TYPE LOCK)
═══════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 1: BODY TYPE = FACE TYPE (CORRELATION LOCK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The face tells you the body. They MUST match naturally.

If Image 1 face shows:
- Fuller cheeks, rounder face → Body must have corresponding fullness
- Lean face, defined jawline → Body must be correspondingly lean
- Strong bone structure → Body should reflect athletic build

**CRITICAL CORRELATION:**
Face and body are ONE PERSON. Analyze Image 1 holistically:
- Neck thickness → Indicates body build
- Shoulder width (if visible) → Indicates frame size
- Visible body parts → Give proportional clues

NEVER:
✗ Put a fuller face on a slim body
✗ Put a lean face on a fuller body
✗ Mismatch proportions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 2: NO SLIMMING, NO EXAGGERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Preserve EXACT body proportions from Image 1:

- Shoulder width → SAME WIDTH
- Chest/bust size → SAME SIZE
- Waist width → SAME WIDTH (do NOT cinch)
- Hip width → SAME WIDTH
- Arm thickness → SAME THICKNESS
- Leg thickness → SAME THICKNESS
- Belly/stomach → SAME SHAPE (do NOT flatten)

Common CRITICAL FAILURE: "Cleaning up" the body
→ This is UNACCEPTABLE. The body is PERFECT as-is in Image 1.

If Image 1 shows a fuller belly:
✓ Output MUST show fuller belly
✗ Output with flat stomach = FAILURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 3: NATURAL BODY-GARMENT INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Garment MUST drape over body realistically:

- Tight garments → Show body contours underneath
- Loose garments → Drape with space between fabric and body
- Stretch fabrics → Hug curves naturally
- Stiff fabrics → Maintain structure with defined folds

NEVER create "air-brushed" look where garment magically smooths body.
Real fabric follows gravity and body shape.

`.trim()

export const HARDENED_TEXTURE_REALISM = `
═══════════════════════════════════════════════════════════════
🔬 TEXTURE REALISM (HARDENED - MAXIMUM DETAIL)
═══════════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 1: SKIN MUST HAVE TEXTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY SKIN DETAILS:**
- Pores (individual pore visibility on face, especially nose, cheeks, forehead)
- Fine lines (around eyes, forehead, mouth - preserve from Image 1)
- Skin irregularities (texture variation, not perfectly smooth)
- Subsurface scattering (slight translucency, especially ears, nose tip)
- Micro-texture (skin is NOT plastic, NOT porcelain)

**FAILURE MODE:** Skin looks like:
✗ Plastic mannequin (too smooth)
✗ Painted (flat, textureless)
✗ AI-generated (uncanny smooth)
✗ Magazine cover (over-retouched)

**SUCCESS MODE:** Skin looks like:
✓ Real human skin (natural imperfections)
✓ Visible pores (especially in sharp focus areas)
✓ Natural texture variation
✓ Documentary photography quality

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 2: FABRIC MUST HAVE WEAVE/TEXTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY FABRIC DETAILS:**

For COTTON/WOVEN:
✓ Visible thread weave pattern
✓ Individual thread texture (if close enough)
✓ Slight irregularities in weave
✓ Natural fiber characteristic

For KNIT:
✓ Visible stitch pattern
✓ Loop structure visible
✓ Texture depth (not flat)
✓ Stretch marks if fabric is tensioned

For DENIM:
✓ Twill diagonal lines
✓ Thread texture
✓ Fade patterns where applicable
✓ Stitch details visible

For SILK/SATIN:
✓ Fine weave (smooth but not plastic)
✓ Subtle texture underneath sheen
✓ Natural fiber quality

**FAILURE:** Garment looks like:
✗ Solid color paint (no fabric texture)
✗ Digital material (fake sheen)
✗ Vector graphic (too smooth)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 3: HAIR MUST HAVE STRAND DETAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY HAIR DETAILS:**
✓ Individual hair strands (especially at edges, backlit areas)
✓ Hair texture (straight, wavy, curly - individual fiber quality)
✓ Flyaway hairs (natural disorder)
✓ Hair thickness variation
✓ Natural imperfections (not perfectly smooth)

✗ AVOID: Hair that looks like:
- Plastic wig
- Painted mass
- Too perfectly groomed
- Vect or graphic shape

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 4: FILM GRAIN = REALISM MARKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY:**
Add subtle ISO 400-800 film grain across entire image.

This prevents:
✗ Digital-smooth overprocessed look
✗ AI-perfect plastic quality
✗ Uncanny valley smoothness

Grain should be:
✓ Subtle but visible when zoomed
✓ Consistent across image
✓ Natural (not digital noise)
✓ Film-like (organic pattern)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE 5: ENVIRONMENTAL TEXTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background/environment must have realistic texture:

- Walls → Texture, imperfections, paint irregularities
- Wood → Grain pattern, knots
- Concrete → Roughness, pores
- Glass → Reflections, slight imperfections
- Sky → Atmosphere, not solid blue
- Foliage → Individual leaves/details (not blurred mass)

Real environments are NEVER perfectly clean.

`.trim()

export const HARDENED_FAIL_CONDITIONS = `
═══════════════════════════════════════════════════════════════
🚨 FAIL CONDITIONS (HARDENED - REGENERATION TRIGGERS)
═══════════════════════════════════════════════════════════════

If ANY of these occur, REGENERATE IMMEDIATELY:

**IDENTITY FAILURES:**
❌ Face shape changed from Image 1
❌ Eye spacing different from Image 1
❌ Nose shape different from Image 1
❌ Mouth width different from Image 1
❌ Face too smooth (missing skin texture)
❌ Head-to-body ratio incorrect

**GARMENT FAILURES:**
❌ Garment length different from Image 2
❌ Garment color different from Image 2
❌ Body from Image 2 visible (should be from Image 1 only)
❌ Fabric texture missing (looks painted)

**BODY FAILURES:**
❌ Body proportions changed from Image 1 (slimming)
❌ Body type mismatch with face
❌ Unnatural garment draping

**TEXTURE FAILURES:**
❌ Skin too smooth (plastic/painted)
❌ No pores visible
❌ No fabric weave visible
❌ Hair looks like solid mass
❌ No film grain present

**VARIANT FAILURES:**
❌ Variant faces differ from each other
❌ Variant bodies differ from each other
❌ Variant garments differ from each other

ANY FAILURE = COMPLETE REGENERATION REQUIRED

`.trim()
