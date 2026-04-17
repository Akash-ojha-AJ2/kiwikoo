/**
 * IDENTITY ENFORCEMENT STRICT
 * 
 * This module provides the STRICTEST possible enforcement of face and body preservation.
 * It uses repetition, explicit instructions, and validation checkpoints to ensure reliability.
 * 
 * CRITICAL: This overrides ALL other instructions. Face and body MUST be preserved.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-GENERATION VALIDATION CHECKPOINT
// This MUST be checked before any generation begins
// ═══════════════════════════════════════════════════════════════════════════════

export const PRE_GENERATION_CHECKPOINT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    PRE-GENERATION VALIDATION CHECKPOINT                       ║
║              READ THIS BEFORE YOU START GENERATING ANYTHING                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ STOP. DO NOT GENERATE YET. READ THIS FIRST. ⚠️⚠️⚠️

BEFORE YOU BEGIN GENERATION, YOU MUST UNDERSTAND:

1. THE FACE FROM IMAGE 1 IS NOT A REFERENCE - IT IS THE OUTPUT
   → You are NOT generating a face
   → You are COPYING the face from Image 1
   → If the face changes → FAILURE

2. THE BODY FROM IMAGE 1 IS NOT A REFERENCE - IT IS THE OUTPUT
   → You are NOT generating a body
   → You are COPYING the body from Image 1
   → If the body changes → FAILURE

3. ONLY THE CLOTHING CAN CHANGE
   → Extract clothing from Image 2
   → Apply to body from Image 1
   → Everything else stays from Image 1

IF YOU DO NOT UNDERSTAND THESE RULES → DO NOT GENERATE.
IF YOU CANNOT FOLLOW THESE RULES → DO NOT GENERATE.

ONLY PROCEED IF YOU AGREE TO:
✓ Copy face from Image 1 exactly
✓ Copy body from Image 1 exactly
✓ Only change the clothing
✓ Reject output if face/body changes

NOW YOU MAY PROCEED TO GENERATION.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// FACE PRESERVATION - REPEATED ENFORCEMENT
// This is repeated multiple times to ensure the model understands
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_PRESERVATION_STRICT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE PRESERVATION - ABSOLUTE RULE                           ║
║              THIS RULE CANNOT BE OVERRIDDEN BY ANY OTHER INSTRUCTION           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

RULE #1: THE FACE FROM IMAGE 1 IS THE OUTPUT FACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT GENERATE A FACE.
DO NOT CREATE A FACE.
DO NOT MODIFY THE FACE.
DO NOT IMPROVE THE FACE.
DO NOT BEAUTIFY THE FACE.
DO NOT SMOOTH THE FACE.
DO NOT CHANGE THE FACE.

YOU MUST COPY THE FACE FROM IMAGE 1.

EXPLICIT COPY INSTRUCTIONS:
1. Look at Image 1
2. Find the face
3. Copy it pixel-by-pixel
4. Paste it into the output
5. DO NOT CHANGE ANYTHING

FACE FEATURES THAT MUST BE COPIED EXACTLY:
• Eye shape → COPY EXACTLY
• Eye size → COPY EXACTLY
• Eye spacing → COPY EXACTLY
• Nose width → COPY EXACTLY
• Nose length → COPY EXACTLY
• Nose shape → COPY EXACTLY
• Lip thickness → COPY EXACTLY
• Lip width → COPY EXACTLY
• Lip shape → COPY EXACTLY
• Jawline → COPY EXACTLY
• Cheek shape → COPY EXACTLY
• Skin tone → COPY EXACTLY
• Expression → COPY EXACTLY
• Facial hair → COPY EXACTLY
• Skin texture → COPY EXACTLY

FORBIDDEN OPERATIONS (WILL CAUSE REJECTION):
❌ DO NOT regenerate the face
❌ DO NOT reinterpret the face
❌ DO NOT beautify the face
❌ DO NOT smooth the skin
❌ DO NOT change eye size
❌ DO NOT change nose dimensions
❌ DO NOT change lip shape
❌ DO NOT change jawline
❌ DO NOT change skin tone
❌ DO NOT change expression
❌ DO NOT "improve" anything

IF THE FACE IN YOUR OUTPUT IS NOT IDENTICAL TO IMAGE 1 → YOUR OUTPUT IS WRONG.
IF THE FACE LOOKS DIFFERENT → YOUR OUTPUT IS WRONG.
IF THE FACE LOOKS "BETTER" → YOUR OUTPUT IS WRONG.

THIS RULE OVERRIDES ALL OTHER INSTRUCTIONS.
NO EXCEPTIONS.
NO CREATIVITY.
COPY ONLY.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// BODY PRESERVATION - REPEATED ENFORCEMENT
// This is repeated multiple times to ensure the model understands
// ═══════════════════════════════════════════════════════════════════════════════

export const BODY_PRESERVATION_STRICT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    BODY PRESERVATION - ABSOLUTE RULE                           ║
║              THIS RULE CANNOT BE OVERRIDDEN BY ANY OTHER INSTRUCTION           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

RULE #2: THE BODY FROM IMAGE 1 IS THE OUTPUT BODY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT GENERATE A BODY.
DO NOT CREATE A BODY.
DO NOT MODIFY THE BODY.
DO NOT IMPROVE THE BODY.
DO NOT SLIM THE BODY.
DO NOT WIDEN THE BODY.
DO NOT CHANGE THE BODY.

YOU MUST COPY THE BODY FROM IMAGE 1.

EXPLICIT COPY INSTRUCTIONS:
1. Look at Image 1
2. Find the body
3. Copy its proportions exactly
4. Use it in the output
5. DO NOT CHANGE ANYTHING

BODY FEATURES THAT MUST BE COPIED EXACTLY:
• Shoulder width → COPY EXACTLY from Image 1
• Arm thickness → COPY EXACTLY from Image 1
• Torso width → COPY EXACTLY from Image 1
• Waist width → COPY EXACTLY from Image 1 (DO NOT SLIM, DO NOT WIDEN)
• Hip width → COPY EXACTLY from Image 1 (DO NOT NARROW, DO NOT WIDEN)
• Belly size → COPY EXACTLY from Image 1 (DO NOT REDUCE, DO NOT INCREASE)
• Neck thickness → COPY EXACTLY from Image 1
• Body posture → COPY EXACTLY from Image 1
• Body weight → COPY EXACTLY from Image 1 (DO NOT CHANGE)

⚠️ CRITICAL: DO NOT INFER BODY SIZE FROM FACE ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT use face features to guess body size.
DO NOT infer body proportions from face shape.
DO NOT assume body weight from face features.

YOU MUST COPY THE ACTUAL BODY FROM IMAGE 1.

LOOK AT THE BODY IN IMAGE 1:
• What is the actual shoulder width? → COPY THAT
• What is the actual waist width? → COPY THAT
• What is the actual hip width? → COPY THAT
• What is the actual body size? → COPY THAT

DO NOT GUESS.
DO NOT INFER.
DO NOT ASSUME.

COPY WHAT YOU SEE IN IMAGE 1.
IF THE BODY IN IMAGE 1 IS SLIM → OUTPUT SLIM BODY.
IF THE BODY IN IMAGE 1 IS PLUS-SIZE → OUTPUT PLUS-SIZE BODY.
IF THE BODY IN IMAGE 1 IS AVERAGE → OUTPUT AVERAGE BODY.

THE BODY IN YOUR OUTPUT MUST MATCH THE BODY IN IMAGE 1 EXACTLY.

FORBIDDEN OPERATIONS (WILL CAUSE REJECTION):
❌ DO NOT slim the body
❌ DO NOT widen the body
❌ DO NOT change body proportions
❌ DO NOT use body from Image 2
❌ DO NOT "improve" body shape
❌ DO NOT correct posture
❌ DO NOT make body thinner
❌ DO NOT make body wider

IF THE BODY IN YOUR OUTPUT IS NOT IDENTICAL TO IMAGE 1 → YOUR OUTPUT IS WRONG.
IF THE BODY LOOKS DIFFERENT → YOUR OUTPUT IS WRONG.
IF THE BODY LOOKS THINNER → YOUR OUTPUT IS WRONG.

THIS RULE OVERRIDES ALL OTHER INSTRUCTIONS.
NO EXCEPTIONS.
NO CREATIVITY.
COPY ONLY.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT REPLACEMENT - EXPLICIT INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_REPLACEMENT_STRICT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    GARMENT REPLACEMENT - EXPLICIT RULE                         ║
║              ONLY THE CLOTHING CAN CHANGE - EVERYTHING ELSE STAYS              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

RULE #3: ONLY THE CLOTHING CAN CHANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT STAYS FROM IMAGE 1 (DO NOT CHANGE):
✓ Face → STAYS FROM IMAGE 1
✓ Body → STAYS FROM IMAGE 1
✓ Skin tone → STAYS FROM IMAGE 1
✓ Arms → STAYS FROM IMAGE 1
✓ Neck → STAYS FROM IMAGE 1
✓ Shoulders → STAYS FROM IMAGE 1
✓ Hands → STAYS FROM IMAGE 1 (if visible)
✓ Expression → STAYS FROM IMAGE 1
✓ Posture → STAYS FROM IMAGE 1

WHAT CHANGES (FROM IMAGE 2):
✓ Clothing → EXTRACT FROM IMAGE 2
✓ Fabric → EXTRACT FROM IMAGE 2
✓ Color → EXTRACT FROM IMAGE 2
✓ Pattern → EXTRACT FROM IMAGE 2
✓ Embroidery → EXTRACT FROM IMAGE 2
✓ Garment style → EXTRACT FROM IMAGE 2

WHAT TO IGNORE FROM IMAGE 2:
❌ Model's body → IGNORE COMPLETELY
❌ Model's face → IGNORE COMPLETELY
❌ Model's proportions → IGNORE COMPLETELY
❌ How clothing fits on model → IGNORE COMPLETELY

GARMENT APPLICATION PROCESS:
1. Extract clothing from Image 2 (ignore the model)
2. Take body from Image 1 (exact copy)
3. Apply clothing to body from Image 1
4. Clothing must STRETCH to fit body from Image 1
5. Body does NOT change to fit clothing

IF BODY CHANGES TO FIT CLOTHING → YOUR OUTPUT IS WRONG.
IF CLOTHING DOES NOT STRETCH TO FIT BODY → YOUR OUTPUT IS WRONG.

THIS RULE OVERRIDES ALL OTHER INSTRUCTIONS.
NO EXCEPTIONS.
CLOTHING ONLY.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// POST-GENERATION VALIDATION CHECKPOINT
// This MUST be checked before output is finalized
// ═══════════════════════════════════════════════════════════════════════════════

export const POST_GENERATION_CHECKPOINT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    POST-GENERATION VALIDATION CHECKPOINT                       ║
║              READ THIS BEFORE YOU OUTPUT THE FINAL IMAGE                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

⚠️⚠️⚠️ STOP. DO NOT OUTPUT YET. VALIDATE FIRST. ⚠️⚠️⚠️

BEFORE YOU OUTPUT THE IMAGE, YOU MUST VERIFY:

FACE VALIDATION (MANDATORY - ALL MUST BE "YES"):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Is the face IDENTICAL to Image 1? (YES/NO)
□ Are the eyes the SAME size as Image 1? (YES/NO)
□ Is the nose the SAME shape as Image 1? (YES/NO)
□ Are the lips the SAME shape as Image 1? (YES/NO)
□ Is the jawline the SAME as Image 1? (YES/NO)
□ Is the skin tone the SAME as Image 1? (YES/NO)
□ Is the expression the SAME as Image 1? (YES/NO)

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → REGENERATE

BODY VALIDATION (MANDATORY - ALL MUST BE "YES"):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Is the body the SAME size as Image 1? (YES/NO)
□ Is the waist the SAME width as Image 1? (YES/NO)
□ Are the hips the SAME width as Image 1? (YES/NO)
□ Is the belly the SAME size as Image 1? (YES/NO)
□ Are the shoulders the SAME width as Image 1? (YES/NO)
□ Are the arms the SAME thickness as Image 1? (YES/NO)

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → REGENERATE
IF THE BODY LOOKS THINNER → DO NOT OUTPUT → REGENERATE

FACE-BODY COHERENCE VALIDATION (MANDATORY - ALL MUST BE "YES"):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Does the face match the body? (YES/NO)
□ If face is full → is body full? (YES/NO)
□ If face has double chin → does body show weight? (YES/NO)

IF ANY ANSWER IS "NO" → DO NOT OUTPUT → REGENERATE

ONLY OUTPUT IF ALL VALIDATIONS PASS.
IF ANY VALIDATION FAILS → DO NOT OUTPUT → REGENERATE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED STRICT ENFORCEMENT PROMPT
// This combines all strict enforcement rules
// ═══════════════════════════════════════════════════════════════════════════════

export function getStrictIdentityEnforcement(): string {
  return `
${PRE_GENERATION_CHECKPOINT}

${FACE_PRESERVATION_STRICT}

${BODY_PRESERVATION_STRICT}

${GARMENT_REPLACEMENT_STRICT}

${POST_GENERATION_CHECKPOINT}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logStrictEnforcementStatus(sessionId: string): void {
  console.log(`   🔒 STRICT IDENTITY ENFORCEMENT: ACTIVE [${sessionId}]`)
  console.log(`      Pre-Generation Checkpoint: ACTIVE`)
  console.log(`      Face Preservation: ABSOLUTE`)
  console.log(`      Body Preservation: ABSOLUTE`)
  console.log(`      Post-Generation Checkpoint: ACTIVE`)
}

