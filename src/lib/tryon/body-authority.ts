/**
 * BODY AUTHORITY
 * 
 * CORE PRINCIPLE: User image = ONLY source for body proportions.
 * Clothing reference body = COMPLETELY INVALID.
 * 
 * The model in the clothing reference has a body.
 * That body is INVISIBLE. It does not exist. It is NULL.
 * 
 * Body proportions are DERIVED from the user image:
 * - Body width
 * - Shoulder slope
 * - Torso depth
 * - Arm thickness
 * - Waist fullness
 * 
 * The garment ADAPTS to the user's body.
 * The user's body NEVER adapts to the garment.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// BODY AUTHORITY TABLE - WHAT COMES FROM WHERE
// ═══════════════════════════════════════════════════════════════

export const BODY_AUTHORITY_TABLE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     📊 BODY AUTHORITY TABLE — SOURCE OF TRUTH                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────┬──────────────────────┬───────────────────────────┐
│ COMPONENT                   │ SOURCE               │ AUTHORITY                 │
├─────────────────────────────┼──────────────────────┼───────────────────────────┤
│ Face geometry               │ User Photo (Image 1) │ 100%                      │
│ Facial fat / cheeks         │ User Photo (Image 1) │ 100%                      │
│ Eyes shape / size           │ User Photo (Image 1) │ 100%                      │
│ Nose width / shape          │ User Photo (Image 1) │ 100%                      │
│ Hairline / Hair volume      │ User Photo (Image 1) │ 100%                      │
│ Neck thickness              │ User Photo (Image 1) │ 100%                      │
│ Shoulder width              │ User Photo (Image 1) │ 100%                      │
│ Shoulder slope              │ User Photo (Image 1) │ 100%                      │
│ Arm thickness               │ User Photo (Image 1) │ 100%                      │
│ Torso width                 │ User Photo (Image 1) │ 100%                      │
│ Torso depth                 │ User Photo (Image 1) │ 100%                      │
│ Waist fullness              │ User Photo (Image 1) │ 100%                      │
│ Body weight / fat           │ User Photo (Image 1) │ 100%                      │
│ Pose / stance               │ User Photo (Image 1) │ 100% (micro-adjust only)  │
│ Skin tone                   │ User Photo (Image 1) │ 100%                      │
├─────────────────────────────┼──────────────────────┼───────────────────────────┤
│ Clothing fabric             │ Garment Image        │ 100%                      │
│ Clothing color              │ Garment Image        │ 100%                      │
│ Clothing pattern            │ Garment Image        │ 100%                      │
│ Clothing seams              │ Garment Image        │ 100%                      │
│ Clothing construction       │ Garment Image        │ 100%                      │
├─────────────────────────────┼──────────────────────┼───────────────────────────┤
│ Garment reference body      │ BLOCKED              │ 0% ⛔                     │
│ Garment reference pose      │ BLOCKED              │ 0% ⛔                     │
│ Garment reference silhouette│ BLOCKED              │ 0% ⛔                     │
│ Garment reference gender    │ BLOCKED              │ 0% ⛔                     │
└─────────────────────────────┴──────────────────────┴───────────────────────────┘
`

// ═══════════════════════════════════════════════════════════════
// CLOTHING REFERENCE CONTAMINATION BLOCK
// ═══════════════════════════════════════════════════════════════

export const CLOTHING_REFERENCE_BLOCK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🚫 CLOTHING REFERENCE CONTAMINATION BLOCK                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

The clothing reference image (Image 2) contains a human body.
That body is COMPLETELY INVALID.

═══════════════════════════════════════════════════════════════════════════════
WHAT THE MODEL IN IMAGE 2 HAS            │ WHAT YOU MUST DO
═══════════════════════════════════════════════════════════════════════════════
A slim body                              → IGNORE, use User's body
Athletic proportions                     → IGNORE, use User's body
Wide shoulders                           → IGNORE, use User's body
Narrow waist                             → IGNORE, use User's body
A certain pose                           → IGNORE, use User's pose
Long legs                                → IGNORE, use User's body
A certain height                         → IGNORE, use User's body
Model-like proportions                   → IGNORE, use User's body

═══════════════════════════════════════════════════════════════════════════════
THE ONLY THINGS TO EXTRACT FROM IMAGE 2
═══════════════════════════════════════════════════════════════════════════════

✓ Fabric texture (cotton, silk, polyester, etc.)
✓ Fabric color (exact RGB values)
✓ Fabric pattern (stripes, floral, solid, etc.)
✓ Construction details (seams, buttons, zippers)
✓ Neckline shape
✓ Sleeve type
✓ Hem type

NOTHING ELSE. The "body" in Image 2 is INVISIBLE.

═══════════════════════════════════════════════════════════════════════════════
WHY THIS MATTERS
═══════════════════════════════════════════════════════════════════════════════

The clothing reference image has NO FACE.
If you steal the body from Image 2, the result will be:
- Face from Image 1
- Body from Image 2
- = FACE PASTED ON WRONG BODY

This is the PASTED-HEAD PROBLEM.
You are explicitly forbidden from causing this.

The body in Image 2 = NULL.
The body in Image 1 = ONLY TRUTH.
`

// ═══════════════════════════════════════════════════════════════
// BODY PHYSICS ALIGNMENT
// ═══════════════════════════════════════════════════════════════

export const BODY_PHYSICS_ALIGNMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🧍 BODY PHYSICS ALIGNMENT                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Analyze the User Photo (Image 1) and DERIVE body physics:

═══════════════════════════════════════════════════════════════════════════════
BODY METRICS TO INFER FROM IMAGE 1
═══════════════════════════════════════════════════════════════════════════════

1. SHOULDER WIDTH
   • Measure relative to head width
   • Narrow / Average / Broad / Very Broad

2. SHOULDER SLOPE
   • Horizontal / Slightly sloped / Sloped

3. TORSO WIDTH
   • Narrow / Average / Full / Very Full

4. ARM THICKNESS
   • Thin / Average / Thick / Very Thick

5. WAIST DEFINITION
   • Defined / Soft / Wide / Very Wide

6. OVERALL BUILD
   • Lean / Average / Heavy / Plus-size

═══════════════════════════════════════════════════════════════════════════════
APPLYING THESE METRICS
═══════════════════════════════════════════════════════════════════════════════

Once you have derived the body metrics from Image 1:

1. These metrics are LOCKED for this generation
2. The garment must FIT these metrics
3. If the garment seems "tight" → show wrinkles/stretch
4. If the garment seems "loose" → show draping
5. NEVER resize the body to fit the garment

═══════════════════════════════════════════════════════════════════════════════
GARMENT ADAPTATION RULES
═══════════════════════════════════════════════════════════════════════════════

The garment ADAPTS to the body:
• Stretches where the body is full
• Drapes where there is space
• Wrinkles at tension points
• Folds naturally with body contours

The body does NOT adapt to the garment:
• Body is not slimmed to fit
• Body is not stretched to fill
• Body proportions are unchanged
• Pose changes are micro-adjustments only
`

// ═══════════════════════════════════════════════════════════════
// FACE-BODY COHERENCE CHECK
// ═══════════════════════════════════════════════════════════════

export const FACE_BODY_COHERENCE_CHECK = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🔗 FACE–BODY COHERENCE CHECK                                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

BEFORE finalizing the image, verify these coherence rules:

═══════════════════════════════════════════════════════════════════════════════
COHERENCE CHECKPOINTS
═══════════════════════════════════════════════════════════════════════════════

□ CHECK 1: FACE FAT = BODY FAT
  • If face is full/round → body MUST be full
  • If face is lean/angular → body can be lean
  • MISMATCH = FAILED

□ CHECK 2: NECK-SHOULDER CONTINUITY
  • Neck width flows into shoulder width
  • No sudden size change
  • No visible seam

□ CHECK 3: HEAD-TO-BODY RATIO
  • The ratio in Image 1 = The ratio in output
  • If head looks "too big" → body was slimmed (FAILED)
  • If head looks "too small" → body was enlarged (FAILED)

□ CHECK 4: SKIN TONE MATCH
  • Face skin tone = Body skin tone
  • No color discontinuity

□ CHECK 5: LIGHT DIRECTION MATCH
  • Light on face matches light on body
  • Shadow direction consistent

═══════════════════════════════════════════════════════════════════════════════
PASTED-HEAD DETECTION (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

If the output looks like:
• A face cut from one photo
• Pasted onto a body from another photo
• A magazine cutout effect
• An awkward composite

→ GENERATION FAILED

The face and body must look like they belong to THE SAME PERSON
in THE SAME PHOTOGRAPH.

Success criteria: "Mother recognizes daughter"
`

// ═══════════════════════════════════════════════════════════════
// COMBINED BODY AUTHORITY PROMPT
// ═══════════════════════════════════════════════════════════════

export function getBodyAuthorityPrompt(): string {
    return `${BODY_AUTHORITY_TABLE}

${CLOTHING_REFERENCE_BLOCK}

${BODY_PHYSICS_ALIGNMENT}

${FACE_BODY_COHERENCE_CHECK}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logBodyAuthorityStatus(sessionId: string): void {
    console.log(`\n📊 BODY AUTHORITY [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   👤 Body source: User Photo (Image 1)`)
    console.log(`   🚫 Garment body: BLOCKED (0% authority)`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✓ Face from: User Photo`)
    console.log(`   ✓ Body from: User Photo`)
    console.log(`   ✓ Pose from: User Photo`)
    console.log(`   ✓ Fabric from: Garment Image`)
    console.log(`   ✗ Garment model body: NULL`)
}
