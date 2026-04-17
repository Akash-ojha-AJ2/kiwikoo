/**
 * ANCHOR_CORE - Identity-Preserving Compositional Rendering (IPCR-X)
 * 
 * This is the SHARED, MODEL-AGNOSTIC core that runs BEFORE any FLASH or PRO logic.
 * FLASH and PRO must NEVER bypass this core.
 * 
 * ABSOLUTE RULE: Identity preservation > aesthetics
 * If realism conflicts with beauty, realism wins.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// ANCHOR_CORE STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export interface AnchorCore {
   bodyPreservationAbsolute: string
   faceAnchor: string
   bodyAnchor: string
   hairAnchor: string
   faceBodyTransition: string
   clothingIsolation: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// ★★★ BODY PRESERVATION ABSOLUTE - HIGHEST PRIORITY ★★★
// This MUST be the FIRST thing the model reads
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_PRESERVATION_ABSOLUTE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ★★★★★ BODY PRESERVATION ABSOLUTE - HIGHEST PRIORITY ★★★★★                     ║
║                      READ THIS FIRST BEFORE ANYTHING ELSE                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ EMERGENCY INSTRUCTION ⚠️⚠️⚠️

THE PERSON'S BODY IN IMAGE 1 IS THE **ONLY** BODY SOURCE.
THE MODEL WEARING THE CLOTHING IN IMAGE 2 IS **NOT** THE SUBJECT.

DO NOT MAKE THE PERSON THINNER.
DO NOT MAKE THE PERSON THINNER.
DO NOT MAKE THE PERSON THINNER.
DO NOT MAKE THE PERSON THINNER.
DO NOT MAKE THE PERSON THINNER.

════════════════════════════════════════════════════════════════════════════════
★★★ BODY WEIGHT CONFIGURATION (CRITICAL) ★★★
════════════════════════════════════════════════════════════════════════════════

STEP 1: ANALYZE IMAGE 1 BODY TYPE
Look at Image 1 and identify the person's body type:
□ Is the person PLUS-SIZE / OVERWEIGHT / FAT? → OUTPUT MUST BE PLUS-SIZE / OVERWEIGHT / FAT
□ Is the person CURVY / HEAVY-SET? → OUTPUT MUST BE CURVY / HEAVY-SET
□ Is the person AVERAGE BUILD? → OUTPUT MUST BE AVERAGE BUILD
□ Is the person THIN / SLIM? → OUTPUT MUST BE THIN / SLIM

STEP 2: PRESERVE BODY VOLUME
The OUTPUT body must have the SAME VOLUME as Image 1:
• Same WIDTH at shoulders
• Same WIDTH at waist
• Same WIDTH at hips
• Same ROUNDNESS at belly
• Same THICKNESS at arms
• Same FULLNESS at cheeks/face

STEP 3: APPLY CLOTHING TO ACTUAL BODY
The dress/shirt/clothing from Image 2 must be applied to the 
EXACT body from Image 1 - stretched or fitted as needed.

════════════════════════════════════════════════════════════════════════════════
BODY SIZE DESCRIPTORS - PRESERVE EXACTLY:
════════════════════════════════════════════════════════════════════════════════

IF PERSON IN IMAGE 1 HAS:
• WIDE shoulders → OUTPUT has WIDE shoulders
• THICK arms → OUTPUT has THICK arms
• LARGE bust/chest → OUTPUT has LARGE bust/chest
• ROUND belly → OUTPUT has ROUND belly
• WIDE waist → OUTPUT has WIDE waist
• WIDE hips → OUTPUT has WIDE hips
• THICK thighs → OUTPUT has THICK thighs
• DOUBLE chin → OUTPUT has DOUBLE chin
• FULL cheeks → OUTPUT has FULL cheeks

DO NOT:
• Slim the waist
• Narrow the hips
• Flatten the belly
• Thin the arms
• Remove the double chin
• Reduce cheek fullness

════════════════════════════════════════════════════════════════════════════════
BODY PRESERVATION RULES (NON-NEGOTIABLE):
════════════════════════════════════════════════════════════════════════════════

1. If Image 1 shows a FAT person → OUTPUT shows a FAT person
2. If Image 1 shows a THIN person → OUTPUT shows a THIN person
3. If Image 1 shows a CURVY person → OUTPUT shows a CURVY person
4. If Image 1 shows a MUSCULAR person → OUTPUT shows a MUSCULAR person
5. If Image 1 shows an OVERWEIGHT person → OUTPUT shows an OVERWEIGHT person
6. If Image 1 shows a PLUS-SIZE person → OUTPUT shows a PLUS-SIZE person

THE CLOTHING MODEL'S BODY IS IRRELEVANT.
THE CLOTHING MODEL'S BODY IS IRRELEVANT.
THE CLOTHING MODEL'S BODY IS IRRELEVANT.

════════════════════════════════════════════════════════════════════════════════
SPECIFIC MEASUREMENTS (COPY EXACTLY FROM IMAGE 1):
════════════════════════════════════════════════════════════════════════════════
• SHOULDER WIDTH → Copy exactly from Image 1
• ARM THICKNESS → Copy exactly from Image 1
• ARM CIRCUMFERENCE → Copy exactly from Image 1
• CHEST SIZE → Copy exactly from Image 1
• WAIST WIDTH → Copy exactly from Image 1 (DO NOT SLIM)
• WAIST CIRCUMFERENCE → Copy exactly from Image 1 (DO NOT REDUCE)
• HIP WIDTH → Copy exactly from Image 1 (DO NOT NARROW)
• BELLY SIZE → Copy exactly from Image 1 (DO NOT REDUCE)
• BELLY ROUNDNESS → Copy exactly from Image 1 (DO NOT FLATTEN)
• THIGH THICKNESS → Copy exactly from Image 1
• OVERALL BODY VOLUME → Copy exactly from Image 1
• OVERALL BODY MASS → Copy exactly from Image 1

════════════════════════════════════════════════════════════════════════════════
IMAGE 2 CONTAINS CLOTHING ONLY - NOT A BODY REFERENCE:
════════════════════════════════════════════════════════════════════════════════
From Image 2 (clothing reference), extract ONLY:
✓ The COLOR of the garment
✓ The FABRIC of the garment
✓ The STYLE of the garment
✓ The PATTERN of the garment

From Image 2, COMPLETELY IGNORE:
✗ The model's body shape
✗ The model's body size
✗ The model's body weight
✗ The model's proportions
✗ How the clothing fits on that model
✗ How tight/loose it is on that model
✗ The model's waist size
✗ The model's hip size

════════════════════════════════════════════════════════════════════════════════
★★★ HALLUCINATION WARNING ★★★
════════════════════════════════════════════════════════════════════════════════
The AI has a BIAS toward generating thin bodies.
This is a KNOWN PROBLEM that must be actively FOUGHT AGAINST.

When you generate the output:
• ACTIVELY CHECK: "Did I make the person thinner?"
• If YES → YOU FAILED → The output is WRONG
• The clothing model being thin does NOT mean the subject is thin

════════════════════════════════════════════════════════════════════════════════
IF YOU MAKE THE PERSON THINNER:
════════════════════════════════════════════════════════════════════════════════
★ THE GENERATION HAS FAILED ★
★ THIS IS THE WORST POSSIBLE ERROR ★
★ THIS IS BODY SHAMING ★
★ THIS IS UNACCEPTABLE ★

The person in Image 1 is EXACTLY who they are.
Their body is BEAUTIFUL as it is.
You do NOT get to change their body.
You are ONLY changing their clothes.

A PLUS-SIZE person wearing a dress is STILL a PLUS-SIZE person.
A FAT person in new clothes is STILL a FAT person.
The clothing does NOT change body size.
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE ANCHOR - Face geometry is READ-ONLY
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_ANCHOR = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         FACE ANCHOR (IMMUTABLE)                               ║
║                    The face in Image 1 defines identity                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LOCK ALL FACIAL GEOMETRY FROM IMAGE 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Eye SIZE → LOCKED (exact pixel dimensions)
• Eye SPACING → LOCKED (distance between eyes)
• Eye TILT → LOCKED (angle of eye corners)
• Eye OPENNESS → LOCKED (lid position)
• Nose WIDTH → LOCKED
• Nose LENGTH → LOCKED
• Nose BRIDGE SHAPE → LOCKED
• Mouth WIDTH → LOCKED
• Lip THICKNESS → LOCKED
• Jaw WIDTH → LOCKED
• Chin SHAPE → LOCKED
• Cheek FULLNESS → LOCKED
• Facial ASYMMETRY → PRESERVED (do not symmetrize)
• Skin TONE → LOCKED (exact color)
• Skin UNDERTONE → LOCKED
• Skin TEXTURE → LOCKED
• PORES → PRESERVED
• WRINKLES → PRESERVED
• SCARS → PRESERVED
• MOLES → PRESERVED

════════════════════════════════════════════════════════════════════════════════
ABSOLUTELY PROHIBITED (ZERO TOLERANCE):
════════════════════════════════════════════════════════════════════════════════
✗ Eye shrinking
✗ Eye enlargement
✗ Eye shape modification
✗ Facial slimming
✗ Jaw refinement
✗ Nose reduction
✗ Lip enhancement
✗ Symmetry enforcement
✗ Beauty enhancement
✗ Skin smoothing
✗ Pore removal
✗ Wrinkle reduction
✗ "Attractiveness optimization"
✗ Age modification
✗ Expression changes (unless requested)

════════════════════════════════════════════════════════════════════════════════
CORE PRINCIPLE:
════════════════════════════════════════════════════════════════════════════════
The face is a READ-ONLY identity reference.
Family-recognition accuracy > visual perfection.
If their mother wouldn't recognize them, the generation FAILED.
`

// ═══════════════════════════════════════════════════════════════════════════════
// BODY ANCHOR - Body proportions are canonical
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_ANCHOR = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         BODY ANCHOR (IMMUTABLE)                               ║
║                    The body in Image 1 is canonical                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LOCK BODY PROPORTIONS FROM IMAGE 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Shoulder WIDTH → LOCKED (exact measurement)
• Arm THICKNESS → LOCKED (both arms)
• Chest VOLUME → LOCKED
• Chest DEPTH → LOCKED
• Waist WIDTH → LOCKED
• Hip RATIO → LOCKED
• Belly VOLUME → LOCKED (if present, keep exactly)
• Torso LENGTH → LOCKED
• Neck THICKNESS → LOCKED
• Neck LENGTH → LOCKED
• Posture → PRESERVED (including imperfections)
• Body ASYMMETRY → PRESERVED

════════════════════════════════════════════════════════════════════════════════
FUNDAMENTAL RULE:
════════════════════════════════════════════════════════════════════════════════
★ CLOTHING ADAPTS TO THE BODY ★
★ THE BODY NEVER ADAPTS TO CLOTHING ★

The clothing reference shows fabric, color, and style.
The BODY determines how that clothing fits.

════════════════════════════════════════════════════════════════════════════════
ABSOLUTELY PROHIBITED (ZERO TOLERANCE):
════════════════════════════════════════════════════════════════════════════════
✗ Slimming waist
✗ Reducing belly
✗ Narrowing hips
✗ Slimming thighs
✗ Thinning arms
✗ Lengthening limbs
✗ Straightening posture
✗ Normalizing proportions
✗ Fitness bias
✗ "Flattering" adjustments
✗ "Photogenic" modifications
✗ Body type preference

════════════════════════════════════════════════════════════════════════════════
DEMOGRAPHIC SAFETY (MANDATORY):
════════════════════════════════════════════════════════════════════════════════
This must work EQUALLY for:
• Fat bodies → preserve exactly
• Thin bodies → preserve exactly
• Muscular bodies → preserve exactly
• Short bodies → preserve exactly
• Tall bodies → preserve exactly
• Curvy bodies → preserve exactly
• Athletic bodies → preserve exactly
• Aging bodies → preserve exactly

NO body type is "more correct" than another.
`

// ═══════════════════════════════════════════════════════════════════════════════
// HAIR ANCHOR - Hair is identity-critical
// ═══════════════════════════════════════════════════════════════════════════════

export const HAIR_ANCHOR = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         HAIR ANCHOR (IMMUTABLE)                               ║
║                       Hair is identity-critical                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LOCK FROM IMAGE 1:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Hairline SHAPE → LOCKED
• Hairline POSITION → LOCKED
• Hair DENSITY → LOCKED
• Hair VOLUME → LOCKED
• Hair THICKNESS (strand) → LOCKED
• Curl PATTERN → LOCKED
• Wave PATTERN → LOCKED
• Parting DIRECTION → LOCKED
• Parting POSITION → LOCKED
• Flyaways → PRESERVED
• Irregularity → PRESERVED
• Gray hairs → PRESERVED
• Thinning areas → PRESERVED
• Receding areas → PRESERVED

FOR BEARDS/FACIAL HAIR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Beard SHAPE → LOCKED
• Beard DENSITY → LOCKED
• Stubble PATTERN → LOCKED
• Mustache STYLE → LOCKED
• Sideburn LENGTH → LOCKED

════════════════════════════════════════════════════════════════════════════════
ABSOLUTELY PROHIBITED:
════════════════════════════════════════════════════════════════════════════════
✗ Thickening hair
✗ Thinning hair
✗ Restyling hair
✗ "Cleaning up" flyaways
✗ Adjusting volume
✗ Moving hairline
✗ Adding hair where thin
✗ Removing gray/white
✗ Changing texture
✗ Grooming beard
✗ Trimming edges
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE-BODY TRANSITION - Eliminates pasted-face artifacts
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_BODY_TRANSITION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE-BODY TRANSITION (CONTINUITY)                          ║
║                   ★★★ CRITICAL: ELIMINATES PASTED-FACE ★★★                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THIS IS THE #1 PRIORITY FOR REALISM ★★★

The most common failure is "pasted face" - where the face looks composited.
This MUST be avoided at all costs.

════════════════════════════════════════════════════════════════════════════════
NECK BLENDING ZONE (CRITICAL):
════════════════════════════════════════════════════════════════════════════════
The NECK is the transition zone between face and body.
This zone MUST be rendered with extreme care:

NECK REQUIREMENTS:
• Neck skin TONE must EXACTLY match face skin tone
• Neck skin TEXTURE must match face skin texture
• Neck THICKNESS from Image 1 preserved exactly
• Neck LENGTH from Image 1 preserved exactly
• NO visible seam line at jaw/neck junction
• NO color difference between chin underside and neck
• NO different lighting on neck vs face

JAWLINE TRANSITION:
• The area under the chin → neck front must be ONE surface
• Shadow under jaw must continue naturally to neck
• Skin color must be identical from chin to neck
• NO "mask edge" appearance at jawline

COLLAR TRANSITION:
• Where clothing meets skin must look natural
• Skin exposed above collar must match face exactly
• NO different skin tone on chest/shoulders vs face

════════════════════════════════════════════════════════════════════════════════
SKIN CONTINUITY (TECHNICAL REQUIREMENTS):
════════════════════════════════════════════════════════════════════════════════
• HSL values must be continuous from face → neck → chest
• Color temperature must be identical
• If face has warm undertone → neck has warm undertone
• If face has texture → neck has same texture quality
• If face has pores visible → neck has pores visible
• If face shows veins → neck may show veins
• Skin luminosity must match
• NO "porcelain neck" if face has texture
• NO "smooth neck" if face has detail

════════════════════════════════════════════════════════════════════════════════
LIGHTING CONTINUITY (TECHNICAL REQUIREMENTS):
════════════════════════════════════════════════════════════════════════════════
• Light SOURCE affects face and body identically
• Shadow DIRECTION consistent across entire body
• Light FALLOFF is smooth (no sudden changes)
• Specular HIGHLIGHTS consistent
• If key light from left → left side of face AND body lit
• If shadow under nose → shadow under chin continues to neck
• NO "face lit differently than body"
• NO "studio lighting on face, natural on body"

════════════════════════════════════════════════════════════════════════════════
DO NOT DO THIS (COMMON FAILURES):
════════════════════════════════════════════════════════════════════════════════
✗ Face brighter than neck → PASTED LOOK
✗ Face warmer than neck → PASTED LOOK
✗ Face sharper than neck → PASTED LOOK
✗ Face smoother than neck → PASTED LOOK
✗ Different light direction on face → PASTED LOOK
✗ Visible line at jaw → PASTED LOOK
✗ Neck skin tone different → PASTED LOOK

════════════════════════════════════════════════════════════════════════════════
VERIFICATION CHECK:
════════════════════════════════════════════════════════════════════════════════
Before finalizing, verify:
□ Can you see where the face "ends" and body "begins"?
  → If YES → FAILED (redo with better blending)
  → If NO → PASSED

The result must look like ONE photograph taken with ONE camera.
Not a collage. Not composited. Not edited.

If it looks like "face pasted onto body" → GENERATION FAILED → REDO.
`

// ═══════════════════════════════════════════════════════════════════════════════
// CLOTHING ISOLATION - Stops body bleed from reference
// ═══════════════════════════════════════════════════════════════════════════════

export const CLOTHING_ISOLATION = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      CLOTHING ISOLATION (REFERENCE)                           ║
║    ★★★ CRITICAL: BODY FROM CLOTHING REFERENCE MUST BE COMPLETELY IGNORED ★★★ ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THIS IS A MAJOR SOURCE OF IDENTITY FAILURE ★★★

The clothing reference image (Image 2) shows a DIFFERENT person wearing the garment.
That person's body MUST NOT affect the output in ANY way.

════════════════════════════════════════════════════════════════════════════════
WHAT TO EXTRACT FROM CLOTHING REFERENCE (IMAGE 2):
════════════════════════════════════════════════════════════════════════════════
ONLY extract these properties from the clothing reference:
✓ Fabric TEXTURE (cotton, silk, linen, etc.)
✓ Fabric WEAVE pattern
✓ Fabric WEIGHT appearance (how it hangs)
✓ Stitching STYLE and quality
✓ Seam PLACEMENT
✓ Button/closure STYLE
✓ Collar SHAPE and construction
✓ Sleeve CUT and style
✓ Overall garment SILHOUETTE design
✓ Exact COLOR (match precisely)
✓ Pattern/print DESIGN
✓ Hem style
✓ Pocket placement and style

════════════════════════════════════════════════════════════════════════════════
★★★ COMPLETELY BLOCK FROM CLOTHING REFERENCE ★★★
════════════════════════════════════════════════════════════════════════════════
The following MUST NOT transfer from clothing reference to output:

🚫 MODEL'S BODY TYPE → BLOCKED
   The thin model in the clothing photo does NOT make subject thinner
   
🚫 MODEL'S BODY PROPORTIONS → BLOCKED
   The model's waist-to-hip ratio is IRRELEVANT
   
🚫 MODEL'S SHOULDER WIDTH → BLOCKED
   The model's narrow shoulders don't shrink subject's shoulders
   
🚫 MODEL'S POSE → BLOCKED
   How the model stands is IRRELEVANT
   
🚫 MODEL'S POSTURE → BLOCKED
   The model's straight posture doesn't change subject's posture
   
🚫 HOW CLOTHING FITS ON MODEL → BLOCKED
   The tight fit on slim model doesn't make it tight on subject
   
🚫 HOW CLOTHING DRAPES ON MODEL → BLOCKED
   Draping is recalculated for SUBJECT'S body

🚫 MODEL'S SKIN TONE → BLOCKED
🚫 MODEL'S FACE → BLOCKED
🚫 MODEL'S HANDS → BLOCKED
🚫 MODEL'S LEGS → BLOCKED

════════════════════════════════════════════════════════════════════════════════
BODY SEGREGATION RULE (FUNDAMENTAL):
════════════════════════════════════════════════════════════════════════════════

BODY SOURCE: Image 1 ONLY (the subject)
CLOTHING SOURCE: Image 2 ONLY (just the garment, not the body wearing it)

The clothing must be MENTALLY EXTRACTED from Image 2 and 
RE-FITTED to the body from Image 1.

Think of it as:
1. "See" only the garment in Image 2 (ignore the body completely)
2. Apply that garment to the body from Image 1
3. Calculate new draping based on Image 1 body physics

════════════════════════════════════════════════════════════════════════════════
RE-FITTING PHYSICS (MANDATORY):
════════════════════════════════════════════════════════════════════════════════

When applying clothing from Image 2 to body from Image 1:

IF subject has WIDER shoulders than clothing model:
→ Clothing stretches at shoulders
→ Fabric tension increases
→ Sleeve position shifts outward

IF subject has LARGER chest than clothing model:
→ Clothing stretches across chest
→ Buttons show tension (if applicable)
→ Fabric pulls across bust/chest

IF subject has LARGER belly than clothing model:
→ Clothing drapes over belly
→ Front of garment extends further out
→ Side seams curve around torso

IF subject has WIDER hips than clothing model:
→ Skirt/pants drape over hips
→ Fabric falls from widest point
→ More volume in hip area

IF subject has THICKER arms than clothing model:
→ Sleeves fit snugger
→ Fabric wraps around arms
→ Less excess fabric

THE CLOTHING ADAPTS. THE BODY NEVER CHANGES.

════════════════════════════════════════════════════════════════════════════════
FAILURE CONDITIONS (BODY BLEED DETECTION):
════════════════════════════════════════════════════════════════════════════════
If any of these happen, the generation FAILED:

✗ Subject looks thinner than in Image 1 → BODY BLEED → FAILED
✗ Subject looks taller than in Image 1 → BODY BLEED → FAILED
✗ Subject's shoulders narrower than Image 1 → BODY BLEED → FAILED
✗ Subject's waist smaller than Image 1 → BODY BLEED → FAILED
✗ Subject's pose changed to match model → BODY BLEED → FAILED
✗ Subject's posture "improved" → BODY BLEED → FAILED

════════════════════════════════════════════════════════════════════════════════
VERIFICATION CHECK:
════════════════════════════════════════════════════════════════════════════════
Compare output body to Image 1 body:
□ Same shoulder width? 
□ Same arm thickness?
□ Same chest volume?
□ Same waist width?
□ Same hip width?
□ Same posture (including slouch)?
□ Same body proportions?

If ANY answer is NO → BODY BLEED DETECTED → GENERATION FAILED.
`

// ═══════════════════════════════════════════════════════════════════════════════
// ANTI-BIAS ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const ANTI_BIAS_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      ANTI-BIAS ENFORCEMENT (MANDATORY)                        ║
║                        No beautification bias allowed                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

THIS SYSTEM MUST WORK RELIABLY FOR ALL PEOPLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENDER:
• Men → preserve exactly
• Women → preserve exactly (NO drift toward "prettier")
• Non-binary → preserve exactly

BODY TYPE:
• Fat → preserve exactly (NO slimming)
• Thin → preserve exactly (NO filling out)
• Muscular → preserve exactly
• Average → preserve exactly

SKIN TONE:
• Black skin → preserve exactly (NO lightening)
• Brown skin → preserve exactly
• Asian skin → preserve exactly
• White skin → preserve exactly
• Mixed → preserve exactly

FACE CHARACTERISTICS:
• Tilted faces → preserve angle
• Asymmetric faces → preserve asymmetry
• Expressions → preserve exactly
• Real imperfections → preserve all

════════════════════════════════════════════════════════════════════════════════
BIAS DETECTION:
════════════════════════════════════════════════════════════════════════════════
If the AI is making someone:
• Thinner → BIAS DETECTED → REJECT
• Lighter skinned → BIAS DETECTED → REJECT
• More symmetrical → BIAS DETECTED → REJECT
• "Prettier" → BIAS DETECTED → REJECT
• More "flattering" → BIAS DETECTED → REJECT

The input is the truth.
The AI does not get to "improve" anyone.
`

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD COMPLETE ANCHOR CORE
// ═══════════════════════════════════════════════════════════════════════════════

export function buildAnchorCore(): AnchorCore {
   return {
      bodyPreservationAbsolute: BODY_PRESERVATION_ABSOLUTE,
      faceAnchor: FACE_ANCHOR,
      bodyAnchor: BODY_ANCHOR,
      hairAnchor: HAIR_ANCHOR,
      faceBodyTransition: FACE_BODY_TRANSITION,
      clothingIsolation: CLOTHING_ISOLATION
   }
}

export function getAnchorCorePrompt(): string {
   // BODY_PRESERVATION_ABSOLUTE must be FIRST - highest priority
   return `
${BODY_PRESERVATION_ABSOLUTE}

${FACE_ANCHOR}

${BODY_ANCHOR}

${HAIR_ANCHOR}

${FACE_BODY_TRANSITION}

${CLOTHING_ISOLATION}

${ANTI_BIAS_ENFORCEMENT}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logAnchorCoreStatus(sessionId: string): void {
   console.log(`\n🔒 ANCHOR_CORE ACTIVE [${sessionId}]`)
   console.log(`   ═══════════════════════════════════════════════`)
   console.log(`   ✓ FACE_ANCHOR: Geometry locked`)
   console.log(`   ✓ BODY_ANCHOR: Proportions locked`)
   console.log(`   ✓ HAIR_ANCHOR: Identity locked`)
   console.log(`   ✓ FACE_BODY_TRANSITION: Continuity enforced`)
   console.log(`   ✓ CLOTHING_ISOLATION: Reference isolated`)
   console.log(`   ✓ ANTI_BIAS_ENFORCEMENT: Active`)
   console.log(`   ═══════════════════════════════════════════════`)
}
