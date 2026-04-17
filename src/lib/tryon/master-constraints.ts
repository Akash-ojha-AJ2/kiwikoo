/**
 * MASTER CONSTRAINTS - SYSTEM GUARDRAIL PROMPT
 * 
 * This is NOT a creative prompt.
 * This is a SYSTEM GUARDRAIL for identity preservation and photographic realism.
 * 
 * DESIGN PRINCIPLE:
 * Presets control WHERE + HOW the photo is taken, NEVER WHO or WHAT is worn.
 * REAL > PRETTY
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER CONSTRAINT PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const MASTER_CONSTRAINT_PROMPT = `
══════════════════════════════════════
🔒 IDENTITY & BODY CONSTRAINTS (HARD LOCK)
══════════════════════════════════════
1. Face identity must be preserved with ≥95% similarity.
   - NO facial slimming, widening, aging, beautifying, or reshaping.
   - Eye distance, jaw width, cheek volume must match input face.
   - Facial landmarks (100+ points) must be pixel-locked.

2. Body proportions must match the USER IMAGE.
   - Do NOT infer body shape from garment reference.
   - Do NOT slim, stretch, or rebalance body to fit clothing.
   - If garment conflicts with body → garment must adapt, NOT body.
   - Maintain exact head-to-body ratio from input.

3. Garment geometry is read ONLY from the EXTRACTED GARMENT IMAGE.
   - Ignore any body present in original garment reference.
   - Hemline length, sleeve length, fit type must be pixel-matched.
   - Never re-interpret garment category (short kurta ≠ long kurta).

══════════════════════════════════════
👕 GARMENT HANDLING RULES
══════════════════════════════════════
- Color must match garment reference within ±3% RGB variance.
- Pattern must be copied exactly, no simplification or symmetry guessing.
- Fabric drape must follow gravity + body contact points.
- No AI "smoothing" or fantasy folds.
- Texture must show fabric weave at magnification.

══════════════════════════════════════
📷 PHOTOGRAPHIC REALISM RULES
══════════════════════════════════════
1. Lighting
   - One dominant light source.
   - Secondary bounce must be physically plausible.
   - Shadows must align with light direction.
   - No flat studio lighting unless explicitly requested.

2. Camera Physics
   - Choose realistic focal length (24–50mm).
   - Maintain perspective consistency.
   - No extreme depth blur unless phone portrait mode is selected.
   - Include subtle lens artifacts (chromatic aberration at edges).

3. Texture
   - Preserve skin texture, pores, fabric weave.
   - Add subtle sensor noise.
   - Avoid plastic, airbrushed surfaces.
   - Skin must show natural variation (not uniform color).

══════════════════════════════════════
🏠 BACKGROUND RULES (ANTI-AI CLEANNESS)
══════════════════════════════════════
- Backgrounds must feel LIVED-IN.
- Add imperfections: uneven lighting, minor clutter, wear.
- Allow people or objects ONLY in soft background blur.
- Avoid pastel-only palettes unless preset demands it.
- Include environmental texture (wall grain, floor pattern).

══════════════════════════════════════
🚶 POSE & HUMAN BEHAVIOR
══════════════════════════════════════
- Avoid symmetrical, stiff, mannequin poses.
- Weight distribution must feel natural.
- Hands must have relaxed tension.
- Head tilt, shoulder angle, stance should feel candid.
- Micro-movements preferred over perfect stillness.

══════════════════════════════════════
❌ FAILURE CONDITIONS (AUTO-REJECT)
══════════════════════════════════════
Reject and retry if ANY of the following occur:
- Face looks like a different person (similarity < 95%)
- Body shape changes relative to input
- Garment length/category is incorrect
- Background looks AI-generated or overly clean
- Lighting has no clear source
- Skin or fabric looks waxy or painted
- Lower body is exposed or barefoot (unless specified)

══════════════════════════════════════
🔄 EXECUTION STRATEGY
══════════════════════════════════════
1. First LOCK face (freeze identity)
2. Then LOCK body (freeze proportions)
3. Then apply garment (extract and drape)
4. Then place subject into scene preset
5. Then apply lighting (physics-based)
6. Then validate realism (check all rules)

DO NOT prioritize aesthetics over correctness.
REAL > PRETTY.
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE FREEZE PROMPT (CRITICAL)
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_FREEZE_PROMPT = `
🧊 FACE FREEZE PROTOCOL (HIGHEST PRIORITY)
═══════════════════════════════════════════

This face is FROZEN. No modifications allowed.

LOCKED ATTRIBUTES:
- Eye distance (exact pixel match)
- Nose bridge angle and width
- Lip shape and fullness
- Jawline contour
- Cheekbone position
- Forehead proportion
- Chin shape and projection
- Skin texture and pores
- All moles, freckles, scars, wrinkles
- Eye color and iris pattern
- Eyebrow shape and density
- Ear shape and position

FORBIDDEN OPERATIONS:
- Face slimming ❌
- Face widening ❌
- Age reduction ❌
- Age progression ❌
- Beauty filter ❌
- Skin smoothing ❌
- Feature enhancement ❌
- Expression change (unless pose allows) ❌

VALIDATION:
- If output face differs from input by >5%, REJECT and regenerate.
- Compare using 100+ facial landmark points.
- The generated face must be recognizable as the SAME PERSON.
`

// ═══════════════════════════════════════════════════════════════════════════════
// BODY LOCK PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_LOCK_PROMPT = `
🔐 BODY PROPORTIONS LOCK
═══════════════════════════════════════════

Body shape is derived from USER IMAGE only.

LOCKED RATIOS:
- Head-to-body height ratio
- Shoulder width relative to head
- Hip width relative to shoulders
- Arm length relative to torso
- Leg length relative to torso
- Torso thickness

FORBIDDEN:
- Slimming waist ❌
- Widening hips ❌
- Lengthening legs ❌
- Narrowing shoulders ❌
- Any body "correction" ❌

RULE:
If garment does not fit body naturally, garment must STRETCH or DRAPE differently.
Body NEVER changes to fit garment.
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT EXTRACTION RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_EXTRACTION_PROMPT = `
👕 GARMENT EXTRACTION PROTOCOL
═══════════════════════════════════════════

Extract garment from reference image. Ignore the body in the reference.

EXTRACT EXACTLY:
- Garment silhouette/cut
- Hemline position (exact length)
- Sleeve length (exact)
- Neckline shape
- Color (within ±3% RGB)
- Pattern (exact, no symmetry guessing)
- Fabric texture (weave visible)
- Any details (buttons, pockets, stitching)

DO NOT COPY FROM GARMENT REFERENCE:
- Body shape ❌
- Body proportions ❌
- Pose ❌
- Skin color ❌
- Any human features ❌

DRAPING RULES:
- Garment must follow USER BODY contact points
- Gravity affects fabric realistically
- No fantasy folds or AI smoothing
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED MASTER PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export function buildMasterConstraintPrompt(): string {
    return [
        '🚨 SYSTEM CONSTRAINTS (HIGHEST PRIORITY) 🚨',
        '',
        FACE_FREEZE_PROMPT,
        '',
        BODY_LOCK_PROMPT,
        '',
        GARMENT_EXTRACTION_PROMPT,
        '',
        MASTER_CONSTRAINT_PROMPT
    ].join('\n')
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL CONSTRAINT ACCESSORS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONSTRAINTS = {
    face: FACE_FREEZE_PROMPT,
    body: BODY_LOCK_PROMPT,
    garment: GARMENT_EXTRACTION_PROMPT,
    master: MASTER_CONSTRAINT_PROMPT,
    full: buildMasterConstraintPrompt()
}

export default CONSTRAINTS
