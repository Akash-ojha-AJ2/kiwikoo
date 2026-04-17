/**
 * PHOTOSHOOT REALISM MODULE
 * 
 * Enforces photorealistic quality in virtual try-on output.
 * 
 * KEY RESEARCH FINDINGS:
 * 
 * 1. LIGHTING COHERENCE: Key/fill/rim light ratios matter.
 *    Light direction must match between subject and background.
 * 
 * 2. DEPTH OF FIELD: Aperture, focal length, and subject distance
 *    create natural background blur (bokeh). Must be consistent.
 * 
 * 3. COLOR TEMPERATURE: Background and subject must share
 *    the same color temperature (warm/cool).
 * 
 * 4. SHADOW DIRECTION: Shadows must point in consistent direction
 *    based on light source. Inconsistent shadows = fake.
 * 
 * 5. CONTACT SHADOWS: Subject must have contact shadow on ground/surface.
 *    Floating appearance = obvious composite.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING COHERENCE BLOCK (CRITICAL)
// ═══════════════════════════════════════════════════════════════════════════════

export const LIGHTING_COHERENCE_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
LIGHTING COHERENCE (PHOTOSHOOT-GRADE MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

⚠️ LIGHTING MUST BE PHYSICALLY COHERENT ACROSS THE ENTIRE IMAGE.

LIGHT DIRECTION MATCHING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The light on the SUBJECT must match the light in the BACKGROUND.

• If background shows sun from left → subject lit from left
• If background is overcast → subject has soft, diffused light
• If background is indoor with window → subject has window light direction
• If background is evening → subject has warm, low-angle light

❌ FORBIDDEN:
• Subject lit from right when background shows sun from left
• Subject with harsh shadows when background is overcast
• Subject with flat lighting when background has dramatic shadows
• Subject with cool light when background is warm sunset

LIGHT QUALITY MATCHING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• HARD light: Direct sun, point source → defined shadows, sharp edges
• SOFT light: Overcast, large windows → gradual shadows, soft edges
• Match the quality exactly between subject and scene

COLOR TEMPERATURE MATCHING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• WARM: Golden hour, tungsten, sunset → Subject also warm
• COOL: Shade, overcast, blue hour → Subject also cool
• NEUTRAL: Daylight balanced → Subject neutral

Color temperature mismatch is the #1 sign of a bad composite.

STUDIO LIGHTING RATIOS (when applicable):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 2:1 ratio: Soft, flattering (beauty/female portraits)
• 3:1 ratio: Standard portrait (natural, balanced)
• 4:1 ratio: Dramatic (male portraits, fashion)

Apply appropriate ratio based on scene mood.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW PHYSICS BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const SHADOW_PHYSICS_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
SHADOW PHYSICS (MANDATORY FOR REALISM)
═══════════════════════════════════════════════════════════════════════════════

⚠️ SHADOWS MUST OBEY PHYSICS. INCORRECT SHADOWS = FAKE IMAGE.

SHADOW DIRECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All shadows in the image must point in the SAME direction.
• Light from top-left → shadows fall to bottom-right
• Light from directly above → shadows fall straight down
• Light from behind → shadows fall toward camera

❌ FORBIDDEN:
• Subject shadow pointing left, background shadows pointing right
• Multiple conflicting shadow directions
• Shadows that don't match light source position

SHADOW SOFTNESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• HARD shadows: Direct sun, small light source, clear sky
• SOFT shadows: Overcast, large window, diffused light
• Match shadow softness between subject and environment

CONTACT SHADOWS (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Where subject touches surfaces, there MUST be contact shadow:
• Under feet → ground contact shadow
• Under chin → neck shadow falling on clothing
• Where clothing folds → shadow in creases
• Where body meets floor/chair → dark contact zone

❌ NO FLOATING SUBJECTS. Subject must be GROUNDED in the scene.

SHADOW COLOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shadows are NOT pure black. They contain:
• Blue in outdoor daylight (sky fill)
• Warm in golden hour
• Cool in shade
• Color of nearby surfaces (bounce light)

Match shadow color to the scene's ambient light.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// DEPTH OF FIELD BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const DEPTH_OF_FIELD_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
DEPTH OF FIELD (PHOTOGRAPHIC REALISM)
═══════════════════════════════════════════════════════════════════════════════

⚠️ PROPER DEPTH OF FIELD CREATES PHOTOGRAPHIC LOOK.

WHAT IS DEPTH OF FIELD (DoF):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DoF is the zone of acceptable sharpness in an image.
• SHALLOW DoF: Subject sharp, background blurred (bokeh)
• DEEP DoF: Everything sharp from foreground to background

PORTRAIT STANDARD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For portraits and fashion:
• Subject (face, upper body) = SHARP
• Background = PROGRESSIVELY BLURRED
• Foreground elements = SLIGHTLY BLURRED (if present)

This creates the classic portrait look.

BOKEH QUALITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bokeh = the aesthetic quality of out-of-focus areas
• GOOD bokeh: Smooth, creamy blur with soft circular highlights
• BAD bokeh: Harsh, busy blur with hard edges

Generate smooth, aesthetic bokeh in background.

DEPTH LAYER RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOREGROUND (if visible):
• Slightly out of focus
• Can be props, foliage, texture
• Creates depth and framing

MIDGROUND (subject):
• PERFECTLY SHARP
• Subject face and body in focus
• This is the focus plane

BACKGROUND:
• Progressively blurred with distance
• More distant = more blur
• Maintains color and shape recognition

❌ FORBIDDEN:
• Background sharper than subject
• Uniform blur (everything equally blurry)
• Subject blurry while background sharp
• No depth blur at all (flat look)

SIMULATE f/2.8 to f/4 APERTURE for natural portrait look.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT INTEGRATION BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const ENVIRONMENT_INTEGRATION_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
ENVIRONMENT INTEGRATION (NO FLOATING SUBJECTS)
═══════════════════════════════════════════════════════════════════════════════

⚠️ SUBJECT MUST BE INTEGRATED INTO THE SCENE, NOT PASTED ON TOP.

GROUNDING (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The subject must appear to EXIST in the environment:
• Feet touching ground with contact shadow
• Clothing interacting with environment (wind, gravity)
• Reflections if standing on reflective surface
• Ambient occlusion where body meets surfaces

❌ FORBIDDEN:
• Subject appearing to float above ground
• No interaction with environment
• Clean cutout look (obvious composite)

AMBIENT LIGHT PICKUP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject should pick up color from environment:
• Green wall → subtle green bounce on skin closest to wall
• Blue sky → cool fill in shadows
• Warm sunset → warm edge light on subject
• Red dress → red bounce on nearby surfaces

This color interaction makes composites believable.

ATMOSPHERIC PERSPECTIVE (for outdoor scenes):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Distant objects appear:
• Lower contrast
• Slightly blue/hazy
• Less saturated

Subject (close to camera) should have full contrast and saturation.
Background (far) should have reduced contrast and slight haze.

SCALE AND PERSPECTIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject size must match the perspective of the scene:
• Eye level camera → subject at eye level
• Low angle → subject appears taller
• High angle → subject appears shorter

Match the camera angle between subject and environment.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// RIM/EDGE LIGHT BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const RIM_LIGHT_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
RIM LIGHT / EDGE LIGHT (SEPARATION & DIMENSIONALITY)
═══════════════════════════════════════════════════════════════════════════════

RIM LIGHT PURPOSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rim light separates subject from background and adds dimension.
• Creates highlight on hair/shoulder edges
• Prevents subject from blending into dark backgrounds
• Adds three-dimensionality

WHEN TO APPLY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Dark backgrounds → strong rim light needed
• Backlit scenes → natural rim light from behind
• Studio setups → typically has rim/hair light
• Outdoor shade → subtle rim from sky

RIM LIGHT COLOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Match the environment:
• Sunset → warm orange/gold rim
• Daylight → neutral/slightly warm rim
• Overcast → cool/neutral rim
• Neon signs nearby → colored rim

AVOID:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Rim light that contradicts main light direction
❌ Too strong rim that looks unnatural
❌ No rim on dark backgrounds (subject blends in)
❌ Wrong color rim for the environment
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-AI ARTIFACTS BLOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const ANTI_AI_ARTIFACTS_BLOCK = `
═══════════════════════════════════════════════════════════════════════════════
ANTI-AI ARTIFACTS (AVOID THESE TELLS)
═══════════════════════════════════════════════════════════════════════════════

⚠️ COMMON AI GENERATION TELLS TO AVOID:

LIGHTING TELLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Subject lit differently than background
❌ Conflicting shadow directions
❌ Color temperature mismatch (warm subject, cool background)
❌ Flat studio lighting in outdoor scene
❌ Missing contact shadows (floating subject)
❌ Unrealistic shadow color (pure black)

DEPTH TELLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ No depth of field (everything equally sharp)
❌ Wrong focus plane (subject blurry, background sharp)
❌ Uniform blur (everything equally blurry)
❌ Hard cutout edges (no natural integration)
❌ Background looks like painted backdrop

TEXTURE TELLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Overly smooth surfaces
❌ Ugly shine / plastic look
❌ Repeated patterns in background
❌ Melting or warping of objects
❌ Inconsistent noise/grain levels

COMPOSITION TELLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Subject scale doesn't match scene
❌ Perspective mismatch
❌ Objects out of context
❌ Incoherent background elements

THIS OUTPUT MUST LOOK LIKE A REAL PHOTOGRAPH.
If any of the above tells are present → GENERATION FAILED.
═══════════════════════════════════════════════════════════════════════════════`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED PHOTOSHOOT REALISM LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export const PHOTOSHOOT_REALISM_LAYER = `
${LIGHTING_COHERENCE_BLOCK}

${SHADOW_PHYSICS_BLOCK}

${DEPTH_OF_FIELD_BLOCK}

${ENVIRONMENT_INTEGRATION_BLOCK}

${RIM_LIGHT_BLOCK}

${ANTI_AI_ARTIFACTS_BLOCK}
`

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE-SPECIFIC LIGHTING PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const SCENE_LIGHTING_PRESETS = {
    studio_white: {
        keyLight: { direction: '45° front-left', quality: 'soft', color: 'neutral' },
        fillLight: { ratio: '2:1', position: 'front-right' },
        rimLight: { position: 'back', intensity: 'medium' },
        background: 'evenly lit, pure white',
        shadows: 'soft, controlled'
    },
    studio_black: {
        keyLight: { direction: '45° side', quality: 'medium-hard', color: 'neutral' },
        fillLight: { ratio: '4:1', position: 'opposite' },
        rimLight: { position: 'back', intensity: 'strong' },
        background: 'pure black, no light spill',
        shadows: 'deep, dramatic'
    },
    outdoor_golden_hour: {
        keyLight: { direction: 'low angle back/side', quality: 'warm soft', color: 'warm orange' },
        fillLight: { source: 'sky', position: 'ambient' },
        rimLight: { source: 'sun', intensity: 'strong warm' },
        background: 'matching golden tones, soft focus',
        shadows: 'long, warm, soft edges'
    },
    outdoor_overcast: {
        keyLight: { direction: 'diffused from above', quality: 'very soft', color: 'cool neutral' },
        fillLight: { source: 'sky', position: 'wrap-around' },
        rimLight: { intensity: 'subtle or none' },
        background: 'matching soft light, muted tones',
        shadows: 'very soft, low contrast'
    },
    indoor_window: {
        keyLight: { direction: 'from window side', quality: 'soft directional', color: 'daylight' },
        fillLight: { source: 'bounce from walls', position: 'opposite window' },
        rimLight: { intensity: 'none or subtle' },
        background: 'interior matching window light',
        shadows: 'soft but directional'
    },
    street_night: {
        keyLight: { direction: 'mixed urban sources', quality: 'mixed', color: 'warm artificial' },
        fillLight: { source: 'ambient urban', position: 'multiple' },
        rimLight: { source: 'street lights/signs', intensity: 'colored accents' },
        background: 'city lights, bokeh, neon',
        shadows: 'multiple directions, dramatic'
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logPhotoshootRealismStatus(): void {
    console.log(`\n📸 PHOTOSHOOT REALISM STATUS`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   📋 LIGHTING_COHERENCE: Active`)
    console.log(`   📋 SHADOW_PHYSICS: Active`)
    console.log(`   📋 DEPTH_OF_FIELD: Active`)
    console.log(`   📋 ENVIRONMENT_INTEGRATION: Active`)
    console.log(`   📋 RIM_LIGHT: Active`)
    console.log(`   📋 ANTI_AI_ARTIFACTS: Active`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🔒 Light direction: MATCHED to scene`)
    console.log(`   🔒 Shadow direction: CONSISTENT`)
    console.log(`   🔒 Color temperature: MATCHED`)
    console.log(`   🔒 Depth of field: f/2.8-4 portrait look`)
    console.log(`   🔒 Contact shadows: REQUIRED`)
    console.log(`   🔒 Subject grounding: MANDATORY`)
}
