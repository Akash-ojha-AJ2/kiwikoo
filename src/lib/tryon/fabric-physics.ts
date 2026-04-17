/**
 * FABRIC PHYSICS & REALISM SYSTEM
 * 
 * This module ensures realistic clothing physics:
 * - Gravity and drape
 * - Tension and stretch
 * - Wrinkle patterns
 * - Fit behavior on different body types
 * 
 * Fixes unrealistic physics and clothing mismatch issues.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// FABRIC PHYSICS PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const FABRIC_PHYSICS_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               FABRIC PHYSICS & REALISM SYSTEM                                 ║
║                  Realistic Clothing Behavior                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ CLOTHING MUST OBEY REAL-WORLD PHYSICS ★★★

════════════════════════════════════════════════════════════════════════════════
GRAVITY & DRAPE PHYSICS:
════════════════════════════════════════════════════════════════════════════════

All fabric is affected by GRAVITY:

HEAVY FABRICS (denim, wool, leather):
• Fall straight down
• Minimal flow or flutter
• Create vertical folds
• Hang from shoulders/waist with weight
• Resist wind and movement

LIGHT FABRICS (silk, chiffon, cotton):
• Flow and drape around body
• Conform to body curves
• Create soft, curved folds
• Flutter with movement
• Respond to body heat

STRUCTURED FABRICS (suiting, canvas):
• Hold shape even when empty
• Sharp creases and angles
• Defined shoulder/chest shapes
• Resist body conformity

════════════════════════════════════════════════════════════════════════════════
BODY-FABRIC INTERACTION:
════════════════════════════════════════════════════════════════════════════════

When garment meets body:

TIGHT FIT ON PLUS-SIZE BODY:
• Fabric STRETCHES visibly
• Horizontal tension lines across belly
• Pull marks at buttons/closures
• Fabric rides up at hem
• Stress wrinkles at seams
• Skin texture may show through thin fabric
★ This is CORRECT and REALISTIC

TIGHT FIT ON SLIM BODY:
• Smooth fit with minimal tension
• Fewer wrinkles
• Fabric lays flat
• Clean lines

LOOSE FIT ON PLUS-SIZE BODY:
• Fabric drapes OVER body curves
• Silhouette shows body shape underneath
• Hem falls at different levels (shorter over belly)
• Natural gathering at sides

LOOSE FIT ON SLIM BODY:
• Fabric hangs with excess
• More vertical folds
• Boxier silhouette
• Hem hangs evenly

════════════════════════════════════════════════════════════════════════════════
WRINKLE PHYSICS:
════════════════════════════════════════════════════════════════════════════════

Wrinkles form at STRESS POINTS:

COMPRESSION WRINKLES (body pressing fabric):
• At belly on fitted tops
• At chest on tight shirts
• At thighs on fitted pants
• Around armpits when arms down

TENSION WRINKLES (fabric being pulled):
• Horizontal lines across stretched areas
• Radiating from buttons
• At shoulder seams on broad shoulders
• Across back when arms forward

GRAVITY WRINKLES (fabric falling):
• Vertical folds in loose fabric
• Pooling at hem of long garments
• Bunching at waistband

JOINT WRINKLES (body bending):
• At elbows
• At knees
• At waist when sitting
• Behind knees

════════════════════════════════════════════════════════════════════════════════
FIT REALISM BY BODY TYPE:
════════════════════════════════════════════════════════════════════════════════

PLUS-SIZE BODY + FITTED GARMENT:
✓ Visible tension across midsection
✓ Horizontal stretch lines
✓ Button gaps on shirts
✓ Fabric pulling at seams
✓ Shorter effective length (rides up over belly)
✓ Arm holes may pull
✓ Natural body creases visible through fabric

PLUS-SIZE BODY + LOOSE GARMENT:
✓ Fabric drapes over curves
✓ Natural A-line or flowing silhouette
✓ Hem uneven (shorter in front if belly)
✓ Fabric gathers at sides
✓ Comfortable, natural look

SLIM BODY + FITTED GARMENT:
✓ Clean lines
✓ Minimal tension
✓ Smooth lay
✓ Defined body shape visible

SLIM BODY + LOOSE GARMENT:
✓ Excess fabric visible
✓ Boxy appearance
✓ Fabric doesn't fill garment
✓ More vertical folds

════════════════════════════════════════════════════════════════════════════════
LIGHTING ON FABRIC:
════════════════════════════════════════════════════════════════════════════════

Fabric responds to light:

MATTE FABRICS (cotton, linen):
• Soft, diffuse highlights
• No sharp reflections
• Even color across surface
• Visible texture

SATIN/SILK FABRICS:
• Sharp, bright highlights
• Gradient from light to dark
• Reflects light sources
• Color shifts with angle

STRUCTURED FABRICS:
• Shadows in folds
• Crisp highlight edges
• Clear light/shadow transitions

════════════════════════════════════════════════════════════════════════════════
PHYSICS FAIL CONDITIONS:
════════════════════════════════════════════════════════════════════════════════

★ UNREALISTIC - Must regenerate if:
✗ Clothing floats (no gravity)
✗ No tension on stretched fabric
✗ No wrinkles on fitted plus-size
✗ Wrinkles in wrong places
✗ Fabric goes through body
✗ Impossible smooth fit on large body
✗ "Painted on" look without physics
✗ Lighting doesn't match fabric type
`

// ═══════════════════════════════════════════════════════════════════════════════
// CLOTHING FIT MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

export const CLOTHING_FIT_MATCHING = `
════════════════════════════════════════════════════════════════════════════════
CLOTHING FIT MATCHING SYSTEM
════════════════════════════════════════════════════════════════════════════════

The garment from Image 2 has a certain FIT STYLE.
This fit style ADAPTS to the body from Image 1.

★★★ FIT ADAPTATION RULES ★★★

1. BODYCON/TIGHT FIT from Image 2:
   → On plus-size body: Stretched, tension lines, pulls at seams
   → On slim body: Smooth, form-fitting, clean lines
   
2. REGULAR FIT from Image 2:
   → On plus-size body: Fitted but comfortable, some pull
   → On slim body: Standard fit, minimal tension
   
3. LOOSE/OVERSIZED FIT from Image 2:
   → On plus-size body: Drapes over curves, flows around body
   → On slim body: Boxy, excess fabric, vertical folds

════════════════════════════════════════════════════════════════════════════════
SIZE ADAPTATION (CRITICAL):
════════════════════════════════════════════════════════════════════════════════

The garment SIZE ADAPTS to the body:

• S garment on XL body → Shows as XL (stretched, tight)
• XL garment on S body → Shows as XL (oversized, baggy)
• Garment "grows" or "shrinks" realistically
• THIS IS NOT MAGIC - IT'S PHYSICS

On PLUS-SIZE body, fitted garment shows:
□ Horizontal stretch lines
□ Visible tension
□ Shorter effective length
□ Pull at closures
□ Stress at seams
□ Body shape visible through fabric

This is CORRECT. This is REALITY.
Do NOT make it smoother than physics allows.

════════════════════════════════════════════════════════════════════════════════
COLOR & PATTERN MATCHING:
════════════════════════════════════════════════════════════════════════════════

SOLID COLORS:
• Exact color match required
• Lighting affects shade (darker in shadows)
• Fabric sheen affects appearance

PATTERNS:
• Pattern WARPS around body curves
• Stripes curve around belly/bust
• Plaids distort at stretch points
• This is PHYSICALLY CORRECT

Pattern behavior:
□ Horizontal stripes curve around curves
□ Vertical patterns spread at wide points
□ Prints stretch where fabric stretches
□ Logos may distort on curved surfaces

════════════════════════════════════════════════════════════════════════════════
SEAM & CONSTRUCTION MATCHING:
════════════════════════════════════════════════════════════════════════════════

Seams from garment scan:
• Position stays consistent
• May pull/stretch on larger body
• Follow body contours
• Stress shows at seam intersections

Buttons/closures:
• Same buttons as Image 2
• May show gaps on larger body
• Pull marks radiating from buttons
• Realistic button holes
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED PHYSICS PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function getFabricPhysicsPrompt(): string {
    return `
${FABRIC_PHYSICS_PROMPT}

${CLOTHING_FIT_MATCHING}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFabricPhysicsStatus(sessionId: string): void {
    console.log(`\n🧵 FABRIC PHYSICS SYSTEM ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   ✓ Gravity & Drape: ACTIVE`)
    console.log(`   ✓ Body-Fabric Interaction: ACTIVE`)
    console.log(`   ✓ Wrinkle Physics: ACTIVE`)
    console.log(`   ✓ Fit Realism: ACTIVE`)
    console.log(`   ✓ Color/Pattern Matching: ACTIVE`)
    console.log(`   ═══════════════════════════════════════════════`)
}
