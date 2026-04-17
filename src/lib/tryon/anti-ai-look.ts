/**
 * ANTI-AI LOOK — PHOTOGRAPHIC AUTHENTICITY
 * 
 * Specific triggers to combat the AI-generated appearance.
 * Focused on lighting, shadows, skin, and camera artifacts.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// AI TELLS TO ELIMINATE
// ═══════════════════════════════════════════════════════════════

export const AI_TELLS_TO_FIX = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚫 AI TELLS TO ELIMINATE — MAKE IT LOOK REAL                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ DETECT AND FIX THESE AI ARTIFACTS ★★★

═══════════════════════════════════════════════════════════════════════════════
SKIN PROBLEMS (FIX THESE)
═══════════════════════════════════════════════════════════════════════════════

AI TELL: Plastic/waxy skin
FIX: Add visible pores, natural color variation, subsurface scattering

AI TELL: Over-smoothed skin
FIX: Keep natural texture, fine lines, subtle imperfections

AI TELL: Uniform skin color
FIX: Add natural flush (cheeks, nose tip), color variation across face

AI TELL: Hyper-symmetrical features
FIX: Allow subtle natural asymmetry

AI TELL: Glowing/ethereal skin
FIX: Use realistic matte with natural oils only in T-zone

═══════════════════════════════════════════════════════════════════════════════
LIGHTING PROBLEMS (FIX THESE)
═══════════════════════════════════════════════════════════════════════════════

AI TELL: Flat, uniform lighting
FIX: Add directional light with clear source, natural falloff

AI TELL: No shadows
FIX: Add proper shadows based on light direction

AI TELL: Multiple light directions
FIX: Single primary light source with consistent shadows

AI TELL: Rim light everywhere
FIX: Rim light only where light source would create it

AI TELL: Perfect exposure everywhere
FIX: Natural exposure variation (brighter in light, darker in shadow)

═══════════════════════════════════════════════════════════════════════════════
SHADOW PROBLEMS (FIX THESE)
═══════════════════════════════════════════════════════════════════════════════

AI TELL: Missing shadows
FIX: Add cast shadows (under chin, behind subject, under feet)

AI TELL: Soft, undefined shadows
FIX: Hard sun = hard shadows, soft light = soft shadows (match the scene)

AI TELL: Wrong shadow direction
FIX: Shadows must be opposite light source

AI TELL: No ambient occlusion
FIX: Add dark contact areas (where arm meets body, under chin, in folds)

AI TELL: Floating subject
FIX: Ground shadow, contact shadow where feet meet ground
`

// ═══════════════════════════════════════════════════════════════
// LIGHTING CONTROL — PROFESSIONAL GRADE
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_CONTROL = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  💡 LIGHTING CONTROL — MATCH THE ORIGINAL                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

STEP 1: IDENTIFY LIGHT SOURCE IN IMAGE 1
─────────────────────────────────────────────────────────────────────────────
Look at the shadows in Image 1 to determine where light is coming from:
• Shadows on RIGHT → Light from LEFT
• Shadows on LEFT → Light from RIGHT
• Shadows BELOW → Light from ABOVE
• Minimal shadows → Overcast/ambient light

STEP 2: APPLY SAME LIGHTING TO OUTPUT
─────────────────────────────────────────────────────────────────────────────
The generated image MUST have:
• Same light direction
• Same shadow intensity
• Same color temperature
• Same contrast level

STEP 3: VERIFY LIGHTING CONSISTENCY
─────────────────────────────────────────────────────────────────────────────
Check that:
□ Face & body lit from same direction
□ Garment shadows match face shadows
□ Background lighting matches subject lighting
□ No contradictory light sources
`

// ═══════════════════════════════════════════════════════════════
// SHADOW CONTROL — PHYSICALLY CORRECT
// ═══════════════════════════════════════════════════════════════

export const SHADOW_CONTROL = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌓 SHADOW CONTROL — PHYSICALLY CORRECT                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
SHADOW TYPES (ALL MUST BE PRESENT)
═══════════════════════════════════════════════════════════════════════════════

1. FORM SHADOWS
   • Shadows on curved surfaces facing away from light
   • Gradual transition from light to dark
   • Example: Side of nose, under cheekbones, side of neck

2. CAST SHADOWS
   • Shadows projected by objects blocking light
   • Sharp or soft edge depending on light type
   • Example: Shadow under chin, shadow under feet

3. AMBIENT OCCLUSION
   • Dark areas where surfaces meet
   • Contact shadows
   • Example: Where arm meets body, inside of elbow, under collar

4. GROUND SHADOW
   • Shadow of entire subject on ground
   • Establishes subject is ON the ground
   • Critical for preventing "floating" look

═══════════════════════════════════════════════════════════════════════════════
SHADOW RULES
═══════════════════════════════════════════════════════════════════════════════

• All shadows point AWAY from light source
• Shadow color = darker + slightly blue/cool (not pure black)
• Shadow edges: hard light = hard edge, soft light = soft edge
• Shadow density decreases with distance
• NO shadows without a cause
• NO missing shadows where they should exist
`

// ═══════════════════════════════════════════════════════════════
// PHOTOGRAPHIC AUTHENTICITY
// ═══════════════════════════════════════════════════════════════

export const PHOTOGRAPHIC_AUTHENTICITY = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  📸 PHOTOGRAPHIC AUTHENTICITY — CAMERA ARTIFACTS                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Include these SUBTLE camera artifacts for realism:

DEPTH OF FIELD:
• Subject in focus, background slightly soft
• Gradual focus falloff (not abrupt blur)
• Bokeh in out-of-focus highlights

SENSOR CHARACTERISTICS:
• Subtle luminance noise in shadows
• Very slight color noise in low-light areas
• Natural sensor grain (NOT digital noise patterns)

LENS CHARACTERISTICS:
• Slight vignetting at corners (darker edges)
• Minimal chromatic aberration on high-contrast edges
• Natural sharpness falloff at frame edges

COLOR SCIENCE:
• Slightly warm or slightly cool based on lighting
• Not perfectly neutral
• Natural color temperature shifts

EXPOSURE:
• Natural dynamic range
• Slight highlight compression
• Slightly lifted black point (not crushed blacks)

═══════════════════════════════════════════════════════════════════════════════
THIS IMAGE SHOULD LOOK LIKE:
═══════════════════════════════════════════════════════════════════════════════

"A photo taken by a friend with an iPhone at this location"

NOT:

"A professional studio render by an AI"
`

// ═══════════════════════════════════════════════════════════════
// COMBINED PROMPT
// ═══════════════════════════════════════════════════════════════

export function getAntiAILookPrompt(): string {
    return `
${AI_TELLS_TO_FIX}

${LIGHTING_CONTROL}

${SHADOW_CONTROL}

${PHOTOGRAPHIC_AUTHENTICITY}

════════════════════════════════════════════════════════════════════════════════
ANTI-AI CHECKLIST (VERIFY BEFORE OUTPUT)
════════════════════════════════════════════════════════════════════════════════

□ Skin has visible pores and natural texture (not smooth/plastic)
□ Lighting has single consistent direction
□ Shadows are present and correct
□ Ambient occlusion in contact areas
□ Ground shadow prevents floating look
□ Subtle camera artifacts for authenticity
□ Image looks like a real photo, not AI-generated

IF ANY CHECK FAILS → GENERATION FAILED
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logAntiAIStatus(sessionId: string): void {
    console.log(`\n🚫 ANTI-AI LOOK [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🎨 Skin: NATURAL TEXTURE`)
    console.log(`   💡 Lighting: CONSISTENT DIRECTION`)
    console.log(`   🌓 Shadows: PHYSICALLY CORRECT`)
    console.log(`   📸 Camera: AUTHENTIC ARTIFACTS`)
}
