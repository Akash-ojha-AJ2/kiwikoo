/**
 * IDENTITY, GARMENT, AND REALISM CONSTRAINTS
 * 
 * Comprehensive constraint system prioritizing:
 * 1. Face Identity (highest)
 * 2. Face-Body Proportion Match
 * 3. Garment Preservation
 * 4. Real-world photographic realism
 * 
 * NO beautification, NO stylization, NO reinterpretation.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE CONSTRAINT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export const IDENTITY_GARMENT_REALISM_CONSTRAINTS = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║         IDENTITY, GARMENT, AND REALISM CONSTRAINTS                            ║
║     Preserve identity • Preserve garment • Simulate real human camera photo   ║
║     NO "improvement", NO "beautification", NO "stylization", NO "reinterpretation" ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 ABSOLUTE PRIORITY ORDER (DO NOT VIOLATE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FACE IDENTITY (HIGHEST PRIORITY)
2. FACE–BODY PROPORTION MATCH
3. GARMENT SHAPE, LENGTH, COLOR, PATTERN
4. POSE + PRESET
5. BACKGROUND
6. LIGHTING
7. AESTHETIC QUALITY (LOWEST PRIORITY)

⚠️ If any higher priority is at risk, sacrifice all lower priorities.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧬 FACE IDENTITY LOCK (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST treat the uploaded user photo as a hard biometric reference.

FACE RULES (MUST MATCH):
• Eye shape, eye distance, eyelid fold → MUST MATCH
• Nose width, bridge height → MUST MATCH
• Lip shape, cupid's bow → MUST MATCH
• Jaw width, chin shape → MUST MATCH
• Cheek fullness → MUST MATCH
• Skin tone → MUST MATCH (no whitening, no smoothing)
• Age → DO NOT CHANGE
• Gender → DO NOT CHANGE

❌ DO NOT:
• "Refine", "symmetrize", "beautify"
• Change smile style
• Change face width or head size
• Generate a "similar looking" face

IF THE FACE DOES NOT MATCH → THE IMAGE IS INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧍 BODY–FACE PROPORTION LOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The body must be scaled to the face using real human proportions.

RULES:
• Head size must be proportional to shoulders
• Neck thickness must match face size
• Shoulder width must match original body
• Chest–waist–hip ratio must stay consistent

❌ DO NOT:
• Shrink or enlarge body to fit garment
• Stretch torso
• Slim arms or legs artificially

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👗 GARMENT PRESERVATION (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The garment reference is ground truth, not inspiration.

MUST PRESERVE:
• Exact garment category (e.g. SHORT KURTA ≠ LONG KURTA)
• Exact hemline position (hip / mid-thigh / knee / ankle)
• Exact sleeve length
• Exact embroidery placement
• Exact fabric color (no pastel washing)
• Exact pattern density (do not simplify)

❌ DO NOT:
• Infer garment type from text if image contradicts it
• Extend garment length
• Replace fabric texture
• Change silhouette

IF GARMENT IMAGE CONTAINS A PERSON:
• Ignore that person's body
• Extract garment only
• NEVER copy that body's proportions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 PRESETS = CAMERA CONTEXT ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRESETS DO NOT CHANGE FACE OR BODY.

PRESETS ONLY CONTROL:
• Pose (minor)
• Camera distance
• Background type
• Lighting environment

PRESET CONSTRAINTS:
• Pose changes must be ≤ 15°
• No extreme turns
• No dramatic expressions
• No fashion poses unless explicitly selected

IF PRESET CONFLICTS WITH FACE OR GARMENT → IGNORE PRESET.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 REAL-WORLD BACKGROUND RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backgrounds must look like:
• Phone camera
• Human-taken photo
• Imperfect environments

REQUIRED:
• People OR objects OR clutter
• Slight background blur or depth
• Imperfect alignment
• Natural perspective

❌ FORBIDDEN:
• Studio gradients
• Perfect symmetry
• Empty "AI rooms"
• Pastel washes
• Unreal bokeh blobs
• Over-clean interiors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 PHOTOGRAPHIC LIGHTING (REAL PHYSICS ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lighting must obey physics.

RULES:
• One dominant light source
• Shadows must match direction
• Skin highlights must be uneven
• No global glow
• No cinematic haze unless explicitly requested

❌ DO NOT:
• Add rim lights
• Add studio beauty lighting
• Add fantasy lighting
• Over-soften skin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 CAMERA REALISM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIMULATE:
• Smartphone or mirrorless camera
• Mild noise
• Natural sharpness falloff
• Imperfect exposure

❌ DO NOT:
• Over-sharpen
• Add HDR look
• Add cinematic grading
• Add unreal lens flares

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 INTELLIGENCE OVERRIDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF CONFLICTS OCCUR:
Face > Body > Garment > Preset > Background

IF UNCERTAIN:
Choose the most conservative, least changed output.

IF FACE CONSISTENCY DROPS:
• Freeze pose
• Freeze camera
• Freeze lighting
• Remove background complexity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 HARD FAILURE CONDITIONS (REGENERATE IF ANY OCCUR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGENERATE IF:
• Face looks like a different person
• Face shape changes across variants
• Garment length changes
• Body proportions change
• Skin tone changes
• Output looks like a studio render

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SUCCESS DEFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A successful image should look like:
"The same person took a normal photo on a different day wearing this garment."

NOT:
• A fashion shoot
• An AI portrait
• A cinematic still

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔁 MULTI-VARIANT RULE (3 IMAGES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Variants may differ ONLY in:
• Lighting temperature (warm / neutral / cool)
• Minor background context
• Minor camera distance

FACE, BODY, GARMENT MUST BE PIXEL-LEVEL CONSISTENT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧊 FINAL DIRECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU ARE NOT ALLOWED TO BE CREATIVE.
YOU ARE ALLOWED TO BE ACCURATE.

IF ACCURACY AND REALISM CONFLICT → CHOOSE ACCURACY.
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the identity, garment, and realism constraints
 * This is the comprehensive constraint system with priority ordering
 */
export function getIdentityGarmentRealismConstraints(): string {
  return IDENTITY_GARMENT_REALISM_CONSTRAINTS
}

/**
 * Log that identity-garment-realism constraints are active
 */
export function logIdentityGarmentRealismStatus(sessionId: string): void {
  console.log(`   🎯 Identity-Garment-Realism: ACTIVE [${sessionId}]`)
  console.log(`      Priority: Face > Body > Garment > Preset > Background`)
  console.log(`      Philosophy: Accuracy over creativity`)
}

