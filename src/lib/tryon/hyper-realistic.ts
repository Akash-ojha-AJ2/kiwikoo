/**
 * HYPER-REALISTIC GENERATION CONSTRAINTS
 * 
 * This module contains the most aggressive constraints for:
 * 1. FACE MATCHING - Pixel-level face preservation
 * 2. LIGHTING REALISM - Professional photography lighting
 * 3. IMAGE QUALITY - Anti-AI, photorealistic output
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// FACE MATCHING — PIXEL-LEVEL PRECISION
// ═══════════════════════════════════════════════════════════════

export const HYPER_FACE_MATCH = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔒 HYPER FACE MATCH — PIXEL-LEVEL PRECISION                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ FACE MATCHING PROTOCOL — MAXIMUM STRICTNESS ★★★

This is NOT a text description of a face. This is PIXEL DATA.
Copy the face pixels from Image 1. Do not generate new face pixels.

═══════════════════════════════════════════════════════════════════════════════
FACIAL LANDMARK PRESERVATION (ALL MUST MATCH)
═══════════════════════════════════════════════════════════════════════════════

EYES:
□ Eye shape (almond, round, hooded) → COPY EXACTLY
□ Eye size relative to face → COPY EXACTLY
□ Distance between eyes → COPY EXACTLY
□ Iris color and pattern → COPY EXACTLY
□ Eyelid crease position → COPY EXACTLY
□ Under-eye area (bags, darkness) → COPY EXACTLY
□ Eye corners (upturned, downturned) → COPY EXACTLY
□ Lash length and density → COPY EXACTLY

NOSE:
□ Nose bridge width → COPY EXACTLY
□ Nose tip shape (bulbous, pointed) → COPY EXACTLY
□ Nostril shape and size → COPY EXACTLY
□ Nose bridge bump/curve → COPY EXACTLY
□ Nose-to-lip distance → COPY EXACTLY

MOUTH:
□ Lip shape and fullness → COPY EXACTLY
□ Lip color and texture → COPY EXACTLY
□ Mouth width → COPY EXACTLY
□ Cupid's bow shape → COPY EXACTLY
□ Teeth visibility and appearance → COPY EXACTLY
□ Smile lines and dimples → COPY EXACTLY

FACE STRUCTURE:
□ Face shape (oval, round, square, heart) → COPY EXACTLY
□ Cheekbone prominence → COPY EXACTLY
□ Cheek volume (full, hollow) → COPY EXACTLY
□ Jawline angle and width → COPY EXACTLY
□ Chin shape and size → COPY EXACTLY
□ Forehead height and width → COPY EXACTLY
□ Temple width → COPY EXACTLY

SKIN:
□ Skin tone → COPY EXACTLY
□ Skin texture (pores, fine lines) → COPY EXACTLY
□ Freckles, moles, birthmarks → COPY EXACTLY
□ Acne, scars, imperfections → COPY EXACTLY
□ Under-skin blood flow (flush areas) → COPY EXACTLY

EXPRESSION:
□ Current expression → COPY EXACTLY
□ Micro-expressions → COPY EXACTLY
□ Eye engagement → COPY EXACTLY
□ Smile type and intensity → COPY EXACTLY

═══════════════════════════════════════════════════════════════════════════════
VERIFICATION CHECKLIST (Model must verify before output)
═══════════════════════════════════════════════════════════════════════════════

Before outputting, verify:
✓ Is this the SAME person? (Not similar — SAME)
✓ Would a friend recognize this person immediately?
✓ Would a facial recognition system match these faces?
✓ Are ALL facial landmarks in the same positions?
✓ Is the skin texture identical (not smoothed)?
✓ Is the expression exactly the same?

IF ANY ANSWER IS "NO" → DO NOT OUTPUT
`

// ═══════════════════════════════════════════════════════════════
// LIGHTING REALISM — PROFESSIONAL PHOTOGRAPHY STANDARDS
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_REALISM = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  💡 LIGHTING REALISM — PROFESSIONAL PHOTOGRAPHY                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ LIGHTING MUST FOLLOW PHYSICS — NOT AI IMAGINATION ★★★

═══════════════════════════════════════════════════════════════════════════════
LIGHT SOURCE CONSISTENCY
═══════════════════════════════════════════════════════════════════════════════

RULE: Light direction must be CONSISTENT across the entire image.

If the original image has:
• Light from the LEFT → Keep shadows on RIGHT of all objects
• Light from the RIGHT → Keep shadows on LEFT of all objects
• Light from ABOVE → Keep shadows BELOW all objects
• Light from FRONT → Keep minimal, soft shadows

The garment must be lit from the SAME direction as the face.
The background must be lit from the SAME direction as the subject.

═══════════════════════════════════════════════════════════════════════════════
SHADOW PHYSICS
═══════════════════════════════════════════════════════════════════════════════

RULE: Shadows must be physically correct.

• Shadow direction = opposite of light source
• Shadow softness = based on light source size and distance
• Shadow color = influenced by ambient/reflected light
• Cast shadows = where objects block light
• Form shadows = on curved surfaces facing away from light

FORBIDDEN:
✗ Shadows going in different directions
✗ Missing cast shadows
✗ Unrealistic shadow darkness
✗ Shadows without a cause
✗ Lit areas where light cannot reach

═══════════════════════════════════════════════════════════════════════════════
COLOR TEMPERATURE MATCHING
═══════════════════════════════════════════════════════════════════════════════

RULE: Color temperature must be consistent.

• All elements must share the same color temperature
• Face, garment, and background must have matching white balance
• Warm light (3200K) = orange tones on everything
• Cool light (6500K) = blue tones on everything
• Mixed lighting = realistic color transitions

FORBIDDEN:
✗ Face has different color temp than garment
✗ Background has different color temp than subject
✗ Unrealistic color casts
✗ Over-saturated or neon colors

═══════════════════════════════════════════════════════════════════════════════
CATCHLIGHTS AND REFLECTIONS
═══════════════════════════════════════════════════════════════════════════════

• Eyes must have catchlights matching the light source
• Shiny surfaces must reflect consistently
• Jewelry, buttons, glasses must reflect the same light

═══════════════════════════════════════════════════════════════════════════════
AMBIENT OCCLUSION
═══════════════════════════════════════════════════════════════════════════════

• Darker areas where objects meet (under chin, where arm meets body)
• Subtle shadowing in crevices and folds
• Natural light falloff in enclosed areas
`

// ═══════════════════════════════════════════════════════════════
// IMAGE QUALITY — PHOTOREALISTIC OUTPUT
// ═══════════════════════════════════════════════════════════════

export const IMAGE_QUALITY_CONSTRAINTS = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  📷 IMAGE QUALITY — PHOTOREALISTIC OUTPUT                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ OUTPUT MUST BE INDISTINGUISHABLE FROM A REAL PHOTOGRAPH ★★★

═══════════════════════════════════════════════════════════════════════════════
TEXTURE REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

SKIN:
• Visible pores at appropriate scale
• Natural skin texture variation
• Subtle imperfections (not airbrushed)
• Visible fine hairs on face
• Natural color variation (flush, undertones)

FABRIC:
• Visible fabric weave/texture
• Natural wrinkles from body movement
• Proper fabric weight behavior
• Thread details at close range
• Natural fabric sheen based on material

HAIR:
• Individual strands visible
• Natural flyaways and frizz
• Realistic light interaction (not plastic)
• Natural color variation within strands

═══════════════════════════════════════════════════════════════════════════════
DEPTH AND FOCUS
═══════════════════════════════════════════════════════════════════════════════

• Natural depth of field (not everything in focus)
• Focus on subject face/eyes
• Gradual blur falloff (not abrupt)
• Background blur based on aperture
• No artificial bokeh artifacts

═══════════════════════════════════════════════════════════════════════════════
CAMERA ARTIFACTS (REALISTIC IMPERFECTIONS)
═══════════════════════════════════════════════════════════════════════════════

INCLUDE (subtle):
• Slight lens vignetting at corners
• Minimal chromatic aberration
• Subtle film grain/sensor noise
• Natural lens sharpness falloff at edges

AVOID:
• Over-sharpening halos
• Artificial noise patterns
• Fake film grain overlays
• Digital compression artifacts

═══════════════════════════════════════════════════════════════════════════════
ANTI-AI DETECTION
═══════════════════════════════════════════════════════════════════════════════

The image must PASS as a real photograph:
✓ Natural asymmetry in face
✓ Realistic eye reflections
✓ Proper ear detail
✓ Realistic finger detail (if visible)
✓ Natural hair physics
✓ Believable skin color variation
✓ Proper anatomical proportions

FAIL CONDITIONS (AI tells):
✗ Waxy/plastic skin
✗ Perfect symmetry
✗ Incorrect eye reflections
✗ Unrealistic hand anatomy
✗ Hair that looks painted
✗ Over-smooth gradients
✗ Floating or detached elements
`

// ═══════════════════════════════════════════════════════════════
// COMBINED HYPER-REALISTIC PROMPT
// ═══════════════════════════════════════════════════════════════

export function getHyperRealisticPrompt(): string {
    return `
${HYPER_FACE_MATCH}

${LIGHTING_REALISM}

${IMAGE_QUALITY_CONSTRAINTS}

════════════════════════════════════════════════════════════════════════════════
FINAL MANDATE
════════════════════════════════════════════════════════════════════════════════

Generate an image that:
1. Contains the EXACT same face from Image 1 (pixel-level match)
2. Has PHYSICALLY CORRECT lighting (consistent direction, proper shadows)
3. Looks like a REAL PHOTOGRAPH (not AI-generated)

The output must pass:
• Human recognition test (friends would recognize this person)
• Photographer inspection (lighting makes physical sense)
• AI detection test (would pass as a real photo)

GENERATE NOW.
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logHyperRealisticStatus(sessionId: string): void {
    console.log(`\n🎯 HYPER-REALISTIC CONSTRAINTS [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🔒 Face: PIXEL-LEVEL MATCH`)
    console.log(`   💡 Lighting: PHYSICS-BASED`)
    console.log(`   📷 Quality: PHOTOREALISTIC`)
    console.log(`   ⚠️ Anti-AI: MAXIMUM`)
}
