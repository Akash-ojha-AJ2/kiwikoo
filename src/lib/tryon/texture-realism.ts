/**
 * TEXTURE REALISM SYSTEM
 * 
 * Enforces realistic textures across:
 * - Face/skin texture (pores, imperfections, natural variation)
 * - Fabric texture (weave, wrinkles, material properties)
 * - Background texture (surfaces, materials, imperfections)
 * - Lighting interaction with textures
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// TEXTURE REALISM ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const TEXTURE_REALISM_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    TEXTURE REALISM ENFORCEMENT                                 ║
║              Real-world textures • No AI smoothing • Photographic authenticity  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: TEXTURE IS REQUIRED FOR REALISM 🚨

SMOOTH TEXTURES = AI LOOK = UNREALISTIC = GENERATION FAILURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE/SKIN TEXTURE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REAL SKIN HAS TEXTURE - COPY IT FROM IMAGE 1:

1. VISIBLE PORES (REQUIRED)
   • Forehead: Visible pores, not smooth
   • Cheeks: Visible pores, natural texture
   • Nose: Larger pores (T-zone), natural
   • Chin: Visible pores, not plastic
   • DO NOT smooth or blur pores
   • DO NOT make skin "perfect"

2. SKIN IMPERFECTIONS (REQUIRED IF PRESENT IN IMAGE 1)
   • Fine lines: Copy from Image 1
   • Wrinkles: Copy from Image 1
   • Blemishes: Copy from Image 1 (if visible)
   • Uneven tone: Copy from Image 1
   • Sun spots: Copy from Image 1 (if visible)
   • DO NOT remove imperfections
   • DO NOT "improve" skin

3. SKIN TEXTURE VARIATION (REQUIRED)
   • Different areas have different textures
   • Forehead may be oilier (shinier)
   • Cheeks may be drier (matte)
   • Nose may have larger pores
   • DO NOT make uniform texture
   • DO NOT make all areas same smoothness

4. SKIN TONE VARIATION (REQUIRED)
   • Natural color variation across face
   • Slightly darker around eyes
   • Slightly lighter on forehead
   • Natural blush on cheeks (if present in Image 1)
   • DO NOT make uniform color
   • DO NOT make "perfect" skin tone

5. SKIN LIGHTING INTERACTION (REQUIRED)
   • Skin reflects light naturally
   • Oily areas reflect more (forehead, nose)
   • Dry areas reflect less (cheeks)
   • Natural highlights and shadows on skin
   • DO NOT make uniform lighting
   • DO NOT make "studio" lighting

FORBIDDEN SKIN TEXTURE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Smoothing skin (removes texture)
❌ Blurring pores (removes detail)
❌ Making uniform texture (unrealistic)
❌ Removing imperfections (unrealistic)
❌ Making "perfect" skin (AI look)
❌ Over-saturating skin (unrealistic)
❌ Making plastic-looking skin (AI look)

IF SKIN LOOKS SMOOTH → YOUR OUTPUT IS INVALID.
IF SKIN LOOKS PLASTIC → YOUR OUTPUT IS INVALID.
IF SKIN HAS NO TEXTURE → YOUR OUTPUT IS INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FABRIC TEXTURE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REAL FABRIC HAS TEXTURE - COPY IT FROM IMAGE 2:

1. FABRIC WEAVE PATTERN (REQUIRED)
   • Cotton: Visible weave, slightly rough
   • Silk: Smooth but with subtle texture
   • Wool: Coarse texture, visible fibers
   • Denim: Twill weave pattern visible
   • Chiffon: Light, flowing, subtle texture
   • DO NOT make fabric flat
   • DO NOT remove weave pattern

2. FABRIC WRINKLES (REQUIRED)
   • Compression wrinkles: Where body presses fabric
   • Tension wrinkles: Where fabric is stretched
   • Gravity wrinkles: Where fabric hangs
   • Natural fold wrinkles: Where fabric folds
   • DO NOT make fabric perfectly smooth
   • DO NOT remove all wrinkles

3. FABRIC MATERIAL PROPERTIES (REQUIRED)
   • Heavy fabric: Hangs straight, minimal flow
   • Light fabric: Flows, drapes, moves
   • Stiff fabric: Holds shape, sharp creases
   • Soft fabric: Conforms to body, soft folds
   • DO NOT ignore fabric weight
   • DO NOT make all fabrics same texture

4. FABRIC LIGHTING INTERACTION (REQUIRED)
   • Fabric reflects light based on material
   • Shiny fabric (silk): Strong highlights
   • Matte fabric (cotton): Diffuse reflection
   • Textured fabric: Uneven highlights
   • DO NOT make uniform lighting
   • DO NOT make "perfect" fabric lighting

5. FABRIC IMPERFECTIONS (REQUIRED IF PRESENT)
   • Stitch lines: Visible if present
   • Seams: Visible if present
   • Fabric wear: Copy from Image 2
   • Natural deformation: Copy from Image 2
   • DO NOT remove imperfections
   • DO NOT make "perfect" fabric

FORBIDDEN FABRIC TEXTURE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Smoothing fabric (removes texture)
❌ Removing wrinkles (unrealistic)
❌ Making uniform texture (unrealistic)
❌ Making "perfect" fabric (AI look)
❌ Ignoring fabric weight (physics violation)
❌ Making flat fabric (no depth)

IF FABRIC LOOKS SMOOTH → YOUR OUTPUT IS INVALID.
IF FABRIC HAS NO TEXTURE → YOUR OUTPUT IS INVALID.
IF FABRIC LOOKS PAINTED → YOUR OUTPUT IS INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKGROUND TEXTURE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REAL BACKGROUNDS HAVE TEXTURE:

1. SURFACE TEXTURES (REQUIRED)
   • Walls: Paint texture, slight imperfections
   • Floors: Wood grain, tile grout, carpet fibers
   • Furniture: Wood grain, fabric texture, metal finish
   • DO NOT make surfaces perfectly smooth
   • DO NOT remove surface detail

2. MATERIAL TEXTURES (REQUIRED)
   • Wood: Visible grain, knots, natural variation
   • Metal: Scratches, wear, reflections
   • Fabric: Weave pattern, wrinkles, folds
   • Glass: Reflections, slight distortion
   • DO NOT make materials uniform
   • DO NOT remove material properties

3. IMPERFECTIONS (REQUIRED)
   • Cracks in walls (if present)
   • Scratches on surfaces (if present)
   • Wear on furniture (if present)
   • Natural clutter (if present)
   • DO NOT make everything perfect
   • DO NOT remove real-world imperfections

4. LIGHTING INTERACTION (REQUIRED)
   • Textures interact with light
   • Rough surfaces: Diffuse reflection
   • Smooth surfaces: Specular reflection
   • Natural shadows on textures
   • DO NOT make uniform lighting
   • DO NOT make "perfect" lighting

FORBIDDEN BACKGROUND TEXTURE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Smoothing surfaces (removes texture)
❌ Removing imperfections (unrealistic)
❌ Making uniform texture (unrealistic)
❌ Making "perfect" backgrounds (AI look)
❌ Removing material properties (unrealistic)

IF BACKGROUND LOOKS SMOOTH → YOUR OUTPUT IS INVALID.
IF BACKGROUND HAS NO TEXTURE → YOUR OUTPUT IS INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXTURE CONSISTENCY (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEXTURES MUST BE CONSISTENT:

1. FACE TEXTURE CONSISTENCY
   • Same texture across all variants
   • Same pores, same imperfections
   • Same skin tone variation
   • DO NOT vary texture between variants

2. FABRIC TEXTURE CONSISTENCY
   • Same fabric texture across all variants
   • Same wrinkles, same weave
   • Same material properties
   • DO NOT vary fabric texture between variants

3. BACKGROUND TEXTURE CONSISTENCY
   • Same background texture across variants (if same background)
   • Same surface textures, same imperfections
   • DO NOT vary background texture unnecessarily

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXTURE REALISM CHECKLIST (BEFORE OUTPUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before output, verify:

FACE TEXTURE:
□ Are pores visible? (YES/NO)
□ Is skin texture natural? (YES/NO)
□ Are imperfections preserved? (YES/NO)
□ Does skin have natural variation? (YES/NO)
□ Does skin look realistic, not plastic? (YES/NO)

FABRIC TEXTURE:
□ Is fabric weave visible? (YES/NO)
□ Are wrinkles present? (YES/NO)
□ Does fabric have natural texture? (YES/NO)
□ Does fabric look realistic, not painted? (YES/NO)

BACKGROUND TEXTURE:
□ Are surface textures visible? (YES/NO)
□ Are imperfections present? (YES/NO)
□ Does background look realistic? (YES/NO)

IF ANY ANSWER IS "NO" → ADD MORE TEXTURE → REGENERATE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXTURE REFERENCE: REAL PHOTOGRAPHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compare your output to real photographs:
• Real photos have visible texture
• Real photos have imperfections
• Real photos have natural variation
• Real photos have realistic lighting interaction

If your output looks "too perfect" → ADD MORE TEXTURE.
If your output looks "too smooth" → ADD MORE TEXTURE.
If your output looks "AI-generated" → ADD MORE TEXTURE.

TEXTURE = REALISM.
NO TEXTURE = AI LOOK = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE TEXTURE SPECIFIC ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_TEXTURE_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE TEXTURE ENFORCEMENT                                    ║
║              Copy skin texture from Image 1 - Pores, imperfections, variation   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FACE TEXTURE = COPY FROM IMAGE 1

SKIN TEXTURE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. COPY PORES FROM IMAGE 1
   • Forehead pores: Copy exactly
   • Cheek pores: Copy exactly
   • Nose pores: Copy exactly (T-zone, larger)
   • Chin pores: Copy exactly
   • DO NOT smooth pores
   • DO NOT blur pores

2. COPY IMPERFECTIONS FROM IMAGE 1
   • Fine lines: Copy exactly
   • Wrinkles: Copy exactly
   • Blemishes: Copy exactly (if visible)
   • Uneven tone: Copy exactly
   • DO NOT remove imperfections
   • DO NOT "improve" skin

3. COPY SKIN TONE VARIATION FROM IMAGE 1
   • Forehead tone: Copy exactly
   • Cheek tone: Copy exactly
   • Eye area tone: Copy exactly
   • Natural variation: Copy exactly
   • DO NOT make uniform tone
   • DO NOT "correct" skin tone

4. COPY SKIN TEXTURE VARIATION FROM IMAGE 1
   • Oily areas (forehead, nose): Copy shine
   • Dry areas (cheeks): Copy matte
   • Natural variation: Copy exactly
   • DO NOT make uniform texture
   • DO NOT make all areas same

5. COPY LIGHTING INTERACTION FROM IMAGE 1
   • Highlights on oily areas: Copy
   • Shadows on dry areas: Copy
   • Natural lighting variation: Copy
   • DO NOT make uniform lighting
   • DO NOT make "studio" lighting

FACE TEXTURE CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Are pores visible? (must be YES)
□ Is skin texture natural? (must be YES)
□ Are imperfections preserved? (must be YES)
□ Does skin have variation? (must be YES)
□ Does skin look realistic? (must be YES)

IF ANY ANSWER IS "NO" → COPY TEXTURE FROM IMAGE 1 → REGENERATE.

FACE TEXTURE = REALISM.
NO TEXTURE = AI LOOK = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// FABRIC TEXTURE SPECIFIC ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const FABRIC_TEXTURE_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FABRIC TEXTURE ENFORCEMENT                                  ║
║              Copy fabric texture from Image 2 - Weave, wrinkles, material      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FABRIC TEXTURE = COPY FROM IMAGE 2

FABRIC TEXTURE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. COPY WEAVE PATTERN FROM IMAGE 2
   • Visible weave: Copy exactly
   • Weave scale: Copy exactly
   • Weave direction: Copy exactly
   • DO NOT remove weave
   • DO NOT make fabric flat

2. COPY WRINKLES FROM IMAGE 2
   • Compression wrinkles: Copy exactly
   • Tension wrinkles: Copy exactly
   • Gravity wrinkles: Copy exactly
   • Fold wrinkles: Copy exactly
   • DO NOT remove wrinkles
   • DO NOT make fabric smooth

3. COPY MATERIAL PROPERTIES FROM IMAGE 2
   • Fabric weight: Copy exactly
   • Fabric stiffness: Copy exactly
   • Fabric shine: Copy exactly
   • DO NOT change material properties
   • DO NOT make all fabrics same

4. COPY LIGHTING INTERACTION FROM IMAGE 2
   • Highlights: Copy exactly
   • Shadows: Copy exactly
   • Reflection: Copy exactly
   • DO NOT make uniform lighting
   • DO NOT make "perfect" lighting

5. COPY IMPERFECTIONS FROM IMAGE 2
   • Stitch lines: Copy exactly (if visible)
   • Seams: Copy exactly (if visible)
   • Wear: Copy exactly (if visible)
   • DO NOT remove imperfections
   • DO NOT make "perfect" fabric

FABRIC TEXTURE CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Is fabric weave visible? (must be YES)
□ Are wrinkles present? (must be YES)
□ Does fabric have texture? (must be YES)
□ Does fabric look realistic? (must be YES)

IF ANY ANSWER IS "NO" → COPY TEXTURE FROM IMAGE 2 → REGENERATE.

FABRIC TEXTURE = REALISM.
NO TEXTURE = AI LOOK = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED TEXTURE REALISM
// ═══════════════════════════════════════════════════════════════════════════════

export function getTextureRealismEnforcement(): string {
    return TEXTURE_REALISM_ENFORCEMENT
}

export function getFaceTextureEnforcement(): string {
    return FACE_TEXTURE_ENFORCEMENT
}

export function getFabricTextureEnforcement(): string {
    return FABRIC_TEXTURE_ENFORCEMENT
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logTextureRealismStatus(sessionId: string): void {
    console.log(`   🎨 Texture Realism: ACTIVE [${sessionId}]`)
    console.log(`      Face texture: Pores, imperfections, natural variation`)
    console.log(`      Fabric texture: Weave, wrinkles, material properties`)
    console.log(`      Background texture: Surfaces, materials, imperfections`)
    console.log(`      Philosophy: Texture = Realism, No texture = AI look`)
}

