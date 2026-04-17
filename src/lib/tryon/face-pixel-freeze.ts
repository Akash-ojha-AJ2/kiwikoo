/**
 * FACE PIXEL FREEZE
 * 
 * CORE PRINCIPLE: Face is NOT described by text. Face is COPIED as pixels.
 * 
 * The face region from Image-1 is a READ-ONLY pixel region.
 * - No generation of new face pixels
 * - No beautification
 * - No slimming
 * - No eye resizing
 * - No skin smoothing
 * - Lighting adjustment = global color temperature ONLY
 * 
 * This is PIXEL AUTHORITY, not text-based identity lock.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// FACE PIXEL FREEZE PROMPT - THE CORE CONSTRAINT
// ═══════════════════════════════════════════════════════════════

export const FACE_PIXEL_FREEZE_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🔒 FACE PIXEL FREEZE — MANDATORY CONSTRAINT                              ║
║        THIS IS PIXEL AUTHORITY, NOT TEXT DESCRIPTION                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THE FACE IS A READ-ONLY PIXEL REGION ★★★

The face from Image 1 must be treated as IMMUTABLE PIXELS.
You are NOT generating a new face.
You are NOT describing a face to recreate.
You are COPYING face pixels.

═══════════════════════════════════════════════════════════════════════════════
WHAT "FACE PIXEL FREEZE" MEANS
═══════════════════════════════════════════════════════════════════════════════

1. FACE REGION = PIXEL COPY
   • Every pixel in the face region comes from Image 1
   • No new face pixels are generated
   • No face pixels are modified

2. ALLOWED FACE CHANGES (MINIMAL)
   ✓ Color temperature shift (warm/cool lighting)
   ✓ Brightness adjustment (matching scene)
   ✗ Everything else = FORBIDDEN

3. FORBIDDEN FACE OPERATIONS
   ✗ Regenerating face pixels
   ✗ Redrawing facial features
   ✗ Beautifying facial features
   ✗ Slimming face shape
   ✗ Resizing eyes
   ✗ Reshaping nose
   ✗ Modifying jawline
   ✗ Smoothing skin
   ✗ Removing wrinkles
   ✗ Changing expression
   ✗ Modifying hairline
   ✗ Changing hair volume

═══════════════════════════════════════════════════════════════════════════════
FACE REGION DEFINITION
═══════════════════════════════════════════════════════════════════════════════

The FACE REGION includes:
• Forehead (to hairline)
• Eyes (both, including lashes)
• Eyebrows (exact shape)
• Nose (exact width and shape)
• Cheeks (exact volume and fat)
• Mouth and lips (exact shape)
• Chin and jaw (exact mass)
• Ears (if visible)
• Neck (at least first 2 inches below jaw)

ALL of these are PIXEL-LOCKED.

═══════════════════════════════════════════════════════════════════════════════
LIGHTING ON FACE = COLOR ONLY
═══════════════════════════════════════════════════════════════════════════════

When applying scene lighting to face:

ALLOWED:
✓ Overall color temperature shift (warm tungsten, cool daylight)
✓ Brightness level matching scene
✓ Shadow color matching scene ambient

FORBIDDEN:
✗ Adding new shadows on face
✗ Changing shadow direction
✗ Adding highlights
✗ Adding rim light
✗ Changing face contrast
✗ Any operation that changes STRUCTURE

RULE: If the lighting adjustment would change how the face LOOKS
      (not just how it's LIT), the adjustment is FORBIDDEN.

═══════════════════════════════════════════════════════════════════════════════
FACE DRIFT DETECTION
═══════════════════════════════════════════════════════════════════════════════

Generation MUST be rejected if:
□ Eyes appear different size than Image 1
□ Nose width changed from Image 1
□ Jaw shape differs from Image 1
□ Cheek volume differs from Image 1
□ Skin texture smoother than Image 1
□ Wrinkles removed from Image 1
□ Expression changed from Image 1
□ Hairline moved from Image 1
□ Face fat reduced from Image 1

If MOTHER would not recognize DAUGHTER → GENERATION FAILED

═══════════════════════════════════════════════════════════════════════════════
FACE-BODY CONTINUITY
═══════════════════════════════════════════════════════════════════════════════

The face and body must be from THE SAME PERSON:

1. NECK CONTINUITY
   • Neck width matches face width
   • No visible seam between face and body
   • Skin tone matches exactly

2. FACE WEIGHT = BODY WEIGHT
   • Full face → Full body
   • Slim face → Slim body
   • NO MISMATCH ALLOWED

3. PASTED-HEAD DETECTION
   If the image looks like a face was pasted onto a different body:
   → GENERATION FAILED
   → The body proportions do not match the face
`

// ═══════════════════════════════════════════════════════════════
// FLASH MODEL SPECIFIC FACE FREEZE
// ═══════════════════════════════════════════════════════════════

export const FLASH_FACE_FREEZE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     FLASH MODEL — FACE PIXEL FREEZE                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FLASH Temperature: 0.01 (DETERMINISTIC)
FLASH Face Mode: PIXEL COPY (not generation)

For FLASH, the face MUST be:
• Identical to Image 1 at pixel level
• No enhancement, no correction, no "improvement"
• Lighting adjustment = color temperature ONLY

FLASH is the IDENTITY-SAFE model.
It sacrifices realism for identity preservation.

PRIORITY ORDER FOR FLASH:
1. Identity preservation (HIGHEST)
2. Body preservation
3. Garment accuracy
4. Scene quality (LOWEST)

If identity cannot be preserved → DO NOT generate.
`

// ═══════════════════════════════════════════════════════════════
// PRO MODEL SPECIFIC FACE FREEZE (TWO-PASS)
// ═══════════════════════════════════════════════════════════════

export const PRO_FACE_FREEZE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     PRO MODEL — TWO-PASS FACE FREEZE                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

PRO Temperature: 0.04 (LOW CREATIVITY)
PRO Face Mode: TWO-PASS COMPOSITE

PASS 1: SCENE + BODY + GARMENT (NO FACE ACCESS)
• Build the scene
• Apply garment to body
• Body proportions from Image 1
• Face region = PLACEHOLDER

PASS 2: FACE PIXEL COMPOSITE
• Copy face pixels from Image 1
• Apply color temperature matching
• NO face modification whatsoever
• NO beautification

PRO must NOT:
• Generate new face pixels
• Correct facial features
• Improve facial appearance
• Make face "more photogenic"

The face goes IN exactly as it is in Image 1.
The face comes OUT exactly as it was in Image 1.
`

// ═══════════════════════════════════════════════════════════════
// COMBINED FACE FREEZE FOR BOTH MODELS
// ═══════════════════════════════════════════════════════════════

export function getFacePixelFreezePrompt(model: 'flash' | 'pro'): string {
    const modelSpecific = model === 'flash' ? FLASH_FACE_FREEZE : PRO_FACE_FREEZE
    return `${FACE_PIXEL_FREEZE_PROMPT}\n\n${modelSpecific}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logFacePixelFreezeStatus(sessionId: string, model: 'flash' | 'pro'): void {
    console.log(`\n🔒 FACE PIXEL FREEZE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📺 Mode: PIXEL AUTHORITY (not text)`)
    console.log(`   🎯 Model: ${model.toUpperCase()}`)
    console.log(`   🌡️  Temperature: ${model === 'flash' ? '0.01' : '0.04'}`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🚫 Face regeneration: BLOCKED`)
    console.log(`   🚫 Face beautification: BLOCKED`)
    console.log(`   🚫 Face slimming: BLOCKED`)
    console.log(`   🚫 Eye resizing: BLOCKED`)
    console.log(`   🚫 Skin smoothing: BLOCKED`)
    console.log(`   ✓  Color temperature: ALLOWED`)
    console.log(`   ✓  Brightness match: ALLOWED`)
}
