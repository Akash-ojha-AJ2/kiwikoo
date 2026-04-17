/**
 * PHOTOGRAPHIC REALISM - Anti-AI Look
 * 
 * Adds film grain, lighting consistency, and texture depth
 * to make generated images look like real photographs.
 */

export const PHOTOGRAPHIC_REALISM_PROMPT = `
════════════════════════════════════════════════════════════════════════════════
PHOTOGRAPHIC REALISM (Make this look like a REAL photograph)
════════════════════════════════════════════════════════════════════════════════

FILM QUALITY:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Add subtle film grain (ISO 400-800 equivalent)                            │
│ • Natural sensor noise pattern, NOT digital noise                           │
│ • Slight chromatic aberration at edges                                      │
│ • Micro-contrast variations typical of camera sensors                       │
└─────────────────────────────────────────────────────────────────────────────┘

LENS CHARACTERISTICS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Slight vignetting at corners (natural lens falloff)                       │
│ • Depth of field blur on background                                         │
│ • Focal plane on subject's face                                             │
│ • Natural lens compression based on focal length                            │
└─────────────────────────────────────────────────────────────────────────────┘

SKIN TEXTURE:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Visible pores at close distance                                           │
│ • Natural skin texture variation                                            │
│ • Subsurface scattering (skin translucency)                                │
│ • Micro-wrinkles and lines                                                  │
│ • NOT plastic, waxy, or airbrushed skin                                     │
│ • Natural oil/moisture on skin                                              │
└─────────────────────────────────────────────────────────────────────────────┘

LIGHTING PHYSICS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Consistent shadow direction                                                │
│ • Soft shadows with penumbra                                                 │
│ • Ambient occlusion in creases                                              │
│ • Specular highlights on oily skin areas                                    │
│ • Color temperature consistency                                              │
│ • Bounce light from surfaces                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

FABRIC REALISM:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Visible fabric weave/texture                                              │
│ • Natural drape and fold patterns                                           │
│ • Wrinkles at joints and stress points                                      │
│ • Light absorption/reflection based on fabric type                          │
│ • Thread texture visible on embroidery                                      │
└─────────────────────────────────────────────────────────────────────────────┘

COLOR SCIENCE:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Natural color saturation (not oversaturated)                              │
│ • Match color temperature to light source                                   │
│ • Avoid neon or artificial-looking colors                                   │
│ • Natural color gradients                                                   │
│ • Avoid flat, uniform colors                                                │
└─────────────────────────────────────────────────────────────────────────────┘

ANTI-AI TELLS (AVOID THESE):
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✗ Plastic or waxy skin                                                      │
│ ✗ Perfect symmetry (slight asymmetry is natural)                           │
│ ✗ Uniform lighting without shadows                                          │
│ ✗ Perfectly smooth fabrics                                                  │
│ ✗ Overly sharp edges                                                        │
│ ✗ Missing ambient occlusion                                                 │
│ ✗ Floating elements without shadows                                         │
│ ✗ Unnaturally straight lines                                                │
│ ✗ Missing grain/noise                                                       │
│ ✗ Oversaturated colors                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
`.trim()

export function getPhotographicRealismPrompt(): string {
    return PHOTOGRAPHIC_REALISM_PROMPT
}

export function getFilmGrainPrompt(isoEquivalent: number = 400): string {
    return `
Add realistic film grain:
• Grain pattern: Natural sensor noise at ISO ${isoEquivalent}
• Grain distribution: Slightly more in shadows
• Grain color: Slight color variation in grain
• NOT digital noise or compression artifacts
`.trim()
}

export function getLightingConsistencyPrompt(
    direction: 'front' | 'left' | 'right' | 'back' | 'top' | 'ambient',
    temperature: 'warm' | 'neutral' | 'cool',
    intensity: 'bright' | 'moderate' | 'dim'
): string {
    return `
Lighting Consistency:
• Light direction: ${direction}
• Color temperature: ${temperature}
• Intensity: ${intensity}
• All shadows must fall opposite to light source
• Consistent highlight placement
• Match color temperature across entire image
`.trim()
}
