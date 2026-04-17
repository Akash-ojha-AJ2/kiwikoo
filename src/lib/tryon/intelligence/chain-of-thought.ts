/**
 * CHAIN-OF-THOUGHT PROMPTING
 * 
 * Forces the model through explicit reasoning steps.
 * This reduces hallucination by making each step verifiable.
 */

import { UserAnalysis } from './user-analyzer'
import { GarmentClassification } from './garment-classifier'

export function buildChainOfThoughtPrompt(
    userAnalysis: UserAnalysis,
    garmentClassification: GarmentClassification
): string {
    return `
════════════════════════════════════════════════════════════════════════════════
CHAIN-OF-THOUGHT EXECUTION (Follow these steps IN ORDER)
════════════════════════════════════════════════════════════════════════════════

You MUST execute these steps in order. Do NOT skip any step.

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: FACE EXTRACTION                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Look at Image 1 face and identify:                                          │
│ • Face shape: ${userAnalysis.face.shape} ✓                                  │
│ • Skin tone: ${userAnalysis.face.skin_tone_hex} ✓                           │
│ • Eye shape: ${userAnalysis.face.eye_shape} ✓                               │
│ • Nose: ${userAnalysis.face.nose_type} ✓                                    │
│ • Facial hair: ${userAnalysis.face.facial_hair} ✓                           │
│                                                                              │
│ OUTPUT: Copy this EXACT face to the output image.                           │
│ VERIFY: Does output face match these specifications? If NO → regenerate.    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: BODY PROPORTIONS                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Look at Image 1 body and identify:                                          │
│ • Body type: ${userAnalysis.body.type} ✓                                    │
│ • Weight category: ${userAnalysis.body.estimated_weight_category} ✓         │
│ • Shoulder width: ${userAnalysis.body.shoulder_width} ✓                     │
│                                                                              │
│ IMPORTANT: Use ONLY body from Image 1, NOT from Image 2.                    │
│ The person in Image 2 is just a garment model - ignore their body.          │
│                                                                              │
│ OUTPUT: Same body proportions as Image 1.                                   │
│ VERIFY: Is body type ${userAnalysis.body.type}? If NO → regenerate.        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: POSE REPLICATION                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Look at Image 1 pose and identify:                                          │
│ • Pose type: ${userAnalysis.pose.type} ✓                                    │
│ • Arms: ${userAnalysis.pose.arm_position} ✓                                 │
│ • Hands: ${userAnalysis.pose.hand_position} ✓                               │
│ • Head: ${userAnalysis.pose.head_tilt} ✓                                    │
│                                                                              │
│ OUTPUT: Same pose as Image 1.                                               │
│ VERIFY: Is pose ${userAnalysis.pose.type}? If NO → regenerate.             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: GARMENT APPLICATION                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Look at Image 2 garment and identify:                                       │
│ • Type: ${garmentClassification.category} ✓                                 │
│ • Hemline: ${garmentClassification.hemline_position} ✓                      │
│ • Pattern: ${garmentClassification.pattern_type} ✓                          │
│ • Colors: ${garmentClassification.pattern_colors.join(', ')} ✓             │
│                                                                              │
│ APPLY this garment to the body from Step 2.                                 │
│ The garment adapts to the body, NOT the other way around.                   │
│                                                                              │
│ OUTPUT: Garment on body with correct type and length.                       │
│ VERIFY: Is hemline at ${garmentClassification.hemline_position}? If NO → regenerate. │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: ACCESSORIES PRESERVATION                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ From Image 1, preserve these accessories:                                    │
${userAnalysis.accessories.glasses ? `│ • Glasses: ${userAnalysis.accessories.glasses_type} ✓\n` : ''}
${userAnalysis.accessories.watch ? '│ • Watch ✓\n' : ''}
${userAnalysis.accessories.bag ? `│ • Bag: ${userAnalysis.accessories.bag_type} ✓\n` : ''}
${userAnalysis.accessories.phone ? '│ • Phone in hand ✓\n' : ''}
${userAnalysis.accessories.jewelry.length > 0 ? `│ • Jewelry: ${userAnalysis.accessories.jewelry.join(', ')} ✓\n` : ''}
│                                                                              │
│ OUTPUT: All accessories preserved from Image 1.                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: FINAL VERIFICATION (Before outputting)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Check each item before generating output:                                    │
│                                                                              │
│ □ Face matches Image 1? (same person, same features)                        │
│ □ Body matches Image 1? (same proportions, not slimmer/different)           │
│ □ Pose matches Image 1? (same arm/hand positions)                           │
│ □ Garment is ${garmentClassification.category}? (correct type)              │
│ □ Hemline is at ${garmentClassification.hemline_position}? (correct length) │
│ □ Pattern colors are ${garmentClassification.pattern_colors.join(', ')}?    │
│ □ All accessories preserved?                                                 │
│                                                                              │
│ If ANY check fails, DO NOT output. Regenerate the failed component.         │
└─────────────────────────────────────────────────────────────────────────────┘
`.trim()
}

export function buildSelfVerificationPrompt(): string {
    return `
════════════════════════════════════════════════════════════════════════════════
SELF-VERIFICATION CHECKLIST (Check before outputting)
════════════════════════════════════════════════════════════════════════════════

Before generating the final output, verify:

✓ FACE: Is the face in the output the SAME person as Image 1?
  - Same face shape
  - Same skin tone
  - Same features (eyes, nose, mouth)
  - Same expression (if applicable)

✓ BODY: Is the body the SAME as Image 1?
  - Same body type (not slimmer or larger)
  - Same proportions
  - NOT the body from Image 2

✓ GARMENT: Does the garment match Image 2?
  - Same type (shirt/kurta/dress)
  - Same length (hemline position)
  - Same pattern
  - Same colors

✓ POSE: Is the pose the SAME as Image 1?
  - Same arm positions
  - Same hand positions
  - Same head angle

✓ ACCESSORIES: Are all accessories from Image 1 preserved?
  - Glasses, watch, jewelry, bag, phone

IF ANY CHECK FAILS: Do not output this image.
`.trim()
}
