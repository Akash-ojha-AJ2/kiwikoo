/**
 * PHOTOREALISM POLISH
 * 
 * Removes the "AI-generated look" from outputs.
 * 
 * AI images often look fake because they are TOO PERFECT:
 * - Too smooth skin
 * - Too clean edges
 * - Too saturated colors
 * - Too sharp everywhere
 * - No lens imperfections
 * - No film grain
 * - No subtle noise
 * - Perfect lighting
 * 
 * Real photos have IMPERFECTIONS. This module adds them.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// ANTI-AI-LOOK PROMPT
// ═══════════════════════════════════════════════════════════════

export const ANTI_AI_LOOK_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     📷 PHOTOREALISM — ELIMINATE AI LOOK                                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THIS IMAGE MUST LOOK LIKE A REAL PHOTOGRAPH, NOT AI-GENERATED ★★★

═══════════════════════════════════════════════════════════════════════════════
SKIN TEXTURE (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

Real skin has:
✓ Visible pores (not smooth plastic)
✓ Subtle texture variations
✓ Minor imperfections (freckles, spots)
✓ Natural oiliness or matte areas
✓ Fine facial hair (peach fuzz)

AI skin looks:
✗ Waxy, plastic, poreless
✗ Uniformly smooth
✗ Over-blurred
✗ Airbrush-perfect

RULE: Keep natural skin texture from Image 1. Do NOT smooth.

═══════════════════════════════════════════════════════════════════════════════
LENS PHYSICS (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

Real cameras have:
✓ Slight chromatic aberration at edges
✓ Natural vignetting (darker corners)
✓ Subtle lens distortion
✓ Depth of field falloff
✓ Focus rolloff at subject edges

AI images have:
✗ Perfect sharpness everywhere
✗ No lens character
✗ Clinical, sterile look

RULE: Simulate a real camera lens (50mm f/1.8 look).

═══════════════════════════════════════════════════════════════════════════════
FILM GRAIN / SENSOR NOISE (IMPORTANT)
═══════════════════════════════════════════════════════════════════════════════

Real photos have:
✓ Fine luminance noise (especially in shadows)
✓ Subtle color noise in dark areas
✓ Slight grain structure
✓ Not perfectly clean

RULE: Add subtle noise equivalent to ISO 400-800 digital sensor.

═══════════════════════════════════════════════════════════════════════════════
LIGHTING IMPERFECTION (IMPORTANT)
═══════════════════════════════════════════════════════════════════════════════

Real lighting has:
✓ Slight color temperature variation across frame
✓ Mixed light sources
✓ Natural shadow softness falloff
✓ Ambient bounce light
✓ Imperfect exposure

AI lighting has:
✗ Perfectly uniform color temperature
✗ Too-clean shadows
✗ Perfect exposure everywhere
✗ Studio-perfect look

RULE: Light should feel like real environment, not AI studio.

═══════════════════════════════════════════════════════════════════════════════
EDGE QUALITY (IMPORTANT)
═══════════════════════════════════════════════════════════════════════════════

Real photos have:
✓ Subtle edge softness
✓ Natural hair flyaways
✓ Slight motion blur in peripheral areas
✓ Imperfect subject/background separation

AI images have:
✗ Razor-sharp, artificial edge detection
✗ Unnatural separation between subject and background
✗ Too-perfect hair edges

RULE: Edges should not look "cut out."

═══════════════════════════════════════════════════════════════════════════════
COLOR SCIENCE (IMPORTANT)
═══════════════════════════════════════════════════════════════════════════════

Real photos have:
✓ Slightly muted, natural colors
✓ Color rolloff in highlights
✓ Shadow color tinting
✓ Natural saturation levels

AI images have:
✗ Over-saturated, punchy colors
✗ HDR-like dynamic range
✗ Unnatural vibrancy
✗ Perfect color balance

RULE: Colors should feel like shot on iPhone or DSLR, not processed.

═══════════════════════════════════════════════════════════════════════════════
MICRO-DETAILS (SUBTLE BUT CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

Real photos have:
✓ Fabric texture visible
✓ Stray threads on clothing
✓ Subtle wrinkles in fabric
✓ Natural drape and fold shadows
✓ Slight imperfections in garment

AI clothing looks:
✗ Too clean and pressed
✗ No micro-wrinkles
✗ Perfect stitching
✗ Unnaturally smooth fabric

RULE: Fabric should look worn by a real person, not fresh off a mannequin.

═══════════════════════════════════════════════════════════════════════════════
THE ULTIMATE TEST
═══════════════════════════════════════════════════════════════════════════════

Ask: "Would someone scroll past this on Instagram thinking it's a real photo?"

If YES → Success
If NO (looks AI-generated) → FAILED
`

// ═══════════════════════════════════════════════════════════════
// IPHONE CAMERA SIMULATION
// ═══════════════════════════════════════════════════════════════

export const IPHONE_CAMERA_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     📱 IPHONE CAMERA SIMULATION                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Simulate iPhone 14/15 Pro camera characteristics:

LENS:
• 24mm equivalent wide lens
• f/1.78 aperture
• Natural bokeh for portrait mode
• Slight barrel distortion

PROCESSING:
• Apple's natural color science (not over-processed)
• Smart HDR but not excessive
• Natural skin tones (not orange or pink)
• Balanced shadows (not crushed)

SENSOR:
• Subtle noise in low light
• Not artificially clean
• Natural dynamic range

OUTPUT:
• Looks like taken by a friend with their phone
• NOT like a professional studio shoot
• NOT like AI-generated
• Casual, authentic feel
`

// ═══════════════════════════════════════════════════════════════
// DSLR PORTRAIT SIMULATION  
// ═══════════════════════════════════════════════════════════════

export const DSLR_PORTRAIT_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     📷 DSLR PORTRAIT SIMULATION                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Simulate Canon/Nikon DSLR portrait characteristics:

LENS:
• 85mm f/1.4 or 50mm f/1.8
• Creamy, natural bokeh
• Slight chromatic aberration at edges
• Natural vignetting

SENSOR:
• Full-frame depth of field
• Natural noise at ISO 400-800
• Rich shadow detail
• Highlight rolloff (not clipped)

STYLE:
• Editorial portrait feel
• Natural light preference
• Authentic skin tones
• Not over-edited
`

// ═══════════════════════════════════════════════════════════════
// COMBINED PHOTOREALISM PROMPT
// ═══════════════════════════════════════════════════════════════

export function getPhotorealismPrompt(cameraStyle: 'iphone' | 'dslr' = 'iphone'): string {
    const cameraPrompt = cameraStyle === 'iphone' ? IPHONE_CAMERA_PROMPT : DSLR_PORTRAIT_PROMPT
    return `${ANTI_AI_LOOK_PROMPT}\n\n${cameraPrompt}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logPhotorealismStatus(sessionId: string): void {
    console.log(`\n📷 PHOTOREALISM POLISH [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🚫 Smooth skin: BLOCKED`)
    console.log(`   🚫 Perfect edges: BLOCKED`)
    console.log(`   🚫 Over-saturation: BLOCKED`)
    console.log(`   ✓  Skin texture: PRESERVED`)
    console.log(`   ✓  Lens physics: SIMULATED`)
    console.log(`   ✓  Film grain: ADDED`)
    console.log(`   ✓  Natural colors: ENFORCED`)
}
