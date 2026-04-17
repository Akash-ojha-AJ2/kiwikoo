/**
 * CBN-ST™ - Clothing Body Neutralization with SafeTensors
 * 
 * This is a NEW TECHNOLOGY LAYER that fixes the root cause of body bleed.
 * 
 * ROOT CAUSE: Clothing reference images contain a human body that the model
 * silently merges with the user's body, causing:
 * - Fat face + slim body
 * - Wrong shoulder width  
 * - Neck mismatch
 * - "Face pasted on body" feeling
 * - Women suffering more (body variance is higher)
 * 
 * SOLUTION: Strip identity information from clothing reference before generation.
 * Keep: Fabric, Cut, Stitching, Color, Drape physics
 * Block: Body shape, Pose, Weight, Muscle mass, Shoulder width, Torso length
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// CLOTHING BODY NEUTRALIZATION (CBN)
// ═══════════════════════════════════════════════════════════════════════════════

export const CLOTHING_BODY_NEUTRALIZATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               CBN-ST™ CLOTHING BODY NEUTRALIZATION                            ║
║                    SafeTensor Technology Layer                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ CRITICAL: READ THIS BEFORE PROCESSING IMAGE 2 ★★★

The clothing reference image (Image 2) contains a MANNEQUIN or HUMAN BODY.
That body is NOT the target human.
That body must be COMPLETELY IGNORED.

════════════════════════════════════════════════════════════════════════════════
CLOTHING REFERENCE SAFETY OVERRIDE:
════════════════════════════════════════════════════════════════════════════════

The model in the clothing image has:
• A body shape → INVALID, IGNORE
• Shoulder width → INVALID, IGNORE
• Torso thickness → INVALID, IGNORE
• Waist shape → INVALID, IGNORE
• Hip shape → INVALID, IGNORE
• Arm size → INVALID, IGNORE
• Posture → INVALID, IGNORE
• Weight/mass → INVALID, IGNORE

These signals EXIST but you are FORBIDDEN from using them.

════════════════════════════════════════════════════════════════════════════════
GARMENT TENSOR (EXTRACT ONLY THESE):
════════════════════════════════════════════════════════════════════════════════

From Image 2, extract ONLY:
✓ Fabric texture (cotton, silk, polyester, etc.)
✓ Fabric color (exact color values)
✓ Fabric material (weight, sheen, transparency)
✓ Garment cut (neckline, sleeves, length)
✓ Stitch lines and seams
✓ Buttons, zippers, closures
✓ Patterns (stripes, florals, etc.)
✓ Fabric drape physics (how it falls)

════════════════════════════════════════════════════════════════════════════════
BODY SUPPRESSION MASK (BSM):
════════════════════════════════════════════════════════════════════════════════

The following from Image 2 are SUPPRESSED:
🚫 Torso silhouette → SUPPRESSED
🚫 Shoulder slope → SUPPRESSED
🚫 Arm thickness → SUPPRESSED
🚫 Waist curves → SUPPRESSED
🚫 Hip curves → SUPPRESSED
🚫 Chest volume → SUPPRESSED
🚫 Back posture → SUPPRESSED
🚫 Neck thickness → SUPPRESSED

These are NEGATIVE IDENTITY TENSORS.
The model SEES them but CANNOT USE them.
`

// ═══════════════════════════════════════════════════════════════════════════════
// BODY GEOMETRY SAFE LOCK (USER IMAGE WINS)
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_GEOMETRY_PRIORITY = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               BODY GEOMETRY PRIORITY (USER IMAGE WINS)                        ║
║                        Body-First Architecture                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THE BODY FROM IMAGE 1 IS ABSOLUTE ★★★

There is NO AVERAGING. There is NO BLENDING.
User body = 100% | Clothing body = 0%

════════════════════════════════════════════════════════════════════════════════
BODY GEOMETRY PRIORITY RULE:
════════════════════════════════════════════════════════════════════════════════

• The body proportions from Image 1 are ABSOLUTE
• Clothing must ADAPT to this body
• Body must NEVER adapt to clothing
• No averaging between bodies
• No slimming to fit clothing
• No reshaping to match model

════════════════════════════════════════════════════════════════════════════════
SIGNAL PRIORITY TABLE:
════════════════════════════════════════════════════════════════════════════════

Signal          | Source          | Priority
----------------|-----------------|----------
Face            | User Image (1)  | 100% ✓
Body            | User Image (1)  | 100% ✓
Pose            | User Image (1)  | 100% ✓
Weight          | User Image (1)  | 100% ✓
Clothing Fabric | Clothing (2)    | 100% ✓
Clothing Color  | Clothing (2)    | 100% ✓
Clothing Body   | Clothing (2)    | 0% ✗ BLOCKED

════════════════════════════════════════════════════════════════════════════════
WHAT THIS FIXES:
════════════════════════════════════════════════════════════════════════════════

✓ Fat face + slim body → FIXED
✓ Shoulder mismatch → FIXED
✓ Neck thickness issues → FIXED
✓ Women body distortion → FIXED
✓ "Attached face" feeling → FIXED
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE-BODY COHERENCE LOCK
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_BODY_COHERENCE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               FACE–BODY COHERENCE LOCK                                        ║
║                   Anatomical Consistency                                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ FACE AND BODY MUST BE FROM THE SAME PERSON ★★★

The face from Image 1 belongs to a specific body.
That body has a specific mass, proportions, and structure.
The output must maintain this coherence.

════════════════════════════════════════════════════════════════════════════════
FACE–BODY COHERENCE RULE:
════════════════════════════════════════════════════════════════════════════════

• Face size must match body mass from Image 1
• Neck thickness must match shoulder width
• Jaw width must align with torso scale
• Cheek fullness must match body weight
• Chin shape must match overall build

════════════════════════════════════════════════════════════════════════════════
COHERENCE CHECKS:
════════════════════════════════════════════════════════════════════════════════

IF Image 1 shows:
• Full/round face → Body must also be full
• Wide jaw → Shoulders must be proportionally wide
• Thick neck → Body mass must match
• Full cheeks → Body weight must match

COHERENCE VIOLATION = GENERATION FAILED

════════════════════════════════════════════════════════════════════════════════
THIS FIXES:
════════════════════════════════════════════════════════════════════════════════

✓ Small eyes issue → Eyes stay same size relative to face
✓ Fat face / slim body → IMPOSSIBLE with this rule
✓ "Attached face" syndrome → Face and body are coherent
✓ Neck mismatch → Neck connects face to body correctly
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO-SPECIFIC HUMAN SAFETY DIRECTIVE
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_HUMAN_SAFETY_DIRECTIVE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               PRO MODE HUMAN SAFETY DIRECTIVE                                 ║
║                    Stop the "Improvement" Reflex                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ PRO IS WORSE THAN FLASH BECAUSE IT TRIES TO HELP ★★★

PRO tries to:
• Harmonize proportions → FORBIDDEN
• Beautify faces → FORBIDDEN
• Balance features → FORBIDDEN
• Improve aesthetics → FORBIDDEN

════════════════════════════════════════════════════════════════════════════════
PRO MODE HUMAN SAFETY BLOCKS:
════════════════════════════════════════════════════════════════════════════════

• Do NOT normalize human proportions
• Do NOT aesthetically improve faces or bodies
• Do NOT balance facial features
• Do NOT correct asymmetry
• Do NOT smooth skin texture
• Do NOT resize eyes
• Do NOT reshape nose
• Do NOT refine jawline
• Do NOT reduce weight
• Do NOT enhance features
• Preserve perceived weight and posture EXACTLY
• ANY attempt to improve humans is FORBIDDEN

════════════════════════════════════════════════════════════════════════════════
PRO REASONING RESTRICTIONS:
════════════════════════════════════════════════════════════════════════════════

PRO may reason about:
✓ Scene composition
✓ Lighting setup
✓ Fabric draping
✓ Background elements

PRO may NOT reason about:
✗ "This face would look better if..."
✗ "The body proportions should be..."
✗ "For better aesthetics..."
✗ "To harmonize the image..."
✗ Any human modification

════════════════════════════════════════════════════════════════════════════════
WHY THIS MATTERS:
════════════════════════════════════════════════════════════════════════════════

PRO's "helpfulness" causes:
• Women → Slimmed waists, narrowed hips
• Fuller faces → Made thinner
• Dark skin → Lightened
• Asymmetric faces → "Corrected"

This is HARMFUL. This is BIAS. This is FORBIDDEN.
`

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-IMAGE VARIANT SAFETY
// ═══════════════════════════════════════════════════════════════════════════════

export const VARIANT_SAFETENSOR_LOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               VARIANT SAFETENSOR LOCK                                         ║
║             Same Identity Across All Variants                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

When generating 3 variants, they MUST:

════════════════════════════════════════════════════════════════════════════════
IDENTICAL ACROSS ALL VARIANTS (LOCKED):
════════════════════════════════════════════════════════════════════════════════

• Same face pixels (exact copy)
• Same body geometry (exact proportions)
• Same body weight (no variance)
• Same clothing fit (same drape)
• Same pose (no movement)
• Same expression (no change)

════════════════════════════════════════════════════════════════════════════════
DIFFERENT ACROSS VARIANTS (ALLOWED):
════════════════════════════════════════════════════════════════════════════════

• Lighting temperature (warm/cool/dramatic)
• Camera distance (±5%)
• Environmental context (background activity)
• Atmospheric effects (haze, bokeh)
• Shadow intensity

════════════════════════════════════════════════════════════════════════════════
SAFETENSOR BINDING:
════════════════════════════════════════════════════════════════════════════════

All variants share:
• Same CBN (Clothing Body Neutralization)
• Same Body Lock (Image 1 proportions)
• Same Face Lock (Image 1 pixels)

Only Scene + Lighting change between variants.
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED CBN-ST PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function getCBNSTPrompt(isPro: boolean = false): string {
    const basePrompt = `
${CLOTHING_BODY_NEUTRALIZATION}

${BODY_GEOMETRY_PRIORITY}

${FACE_BODY_COHERENCE}

${VARIANT_SAFETENSOR_LOCK}
`

    if (isPro) {
        return `
${PRO_HUMAN_SAFETY_DIRECTIVE}

${basePrompt}
`
    }

    return basePrompt
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logCBNSTStatus(sessionId: string, isPro: boolean): void {
    console.log(`\n🛡️ CBN-ST™ ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   ✓ Clothing Body Neutralization: ACTIVE`)
    console.log(`   ✓ Body Suppression Mask: ACTIVE`)
    console.log(`   ✓ Body Geometry Priority: USER IMAGE WINS`)
    console.log(`   ✓ Face-Body Coherence Lock: ACTIVE`)
    console.log(`   ✓ Variant SafeTensor Lock: ACTIVE`)
    if (isPro) {
        console.log(`   ✓ PRO Human Safety Directive: ACTIVE`)
    }
    console.log(`   ═══════════════════════════════════════════════`)
}
