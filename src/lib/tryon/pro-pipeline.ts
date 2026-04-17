/**
 * PRO PIPELINE - Thinking Model with Two-Pass Architecture
 * 
 * PRO is fundamentally different from FLASH:
 * - Thinking/reasoning model
 * - Tends to over-correct and "improve"
 * - Needs explicit permission boundaries
 * - Must be split into TWO internal passes
 * 
 * PRO_SCENE_PASS: Scene + lighting only (NO face/identity access)
 * PRO_REFINEMENT_PASS: Garment realism only (face = READ ONLY)
 */

import 'server-only'
import {
    getIdentityLayersPrompt,
    getVariantLayerPrompt,
    logLayerStatus
} from './identity-layers'

// ═══════════════════════════════════════════════════════════════════════════════
// PRO CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_CONFIG = {
    model: 'gemini-2.0-pro-exp',
    temperature: 0.04,        // Low but allows scene creativity
    maxTemperature: 0.04,     // Hard cap - never exceed
    maxRetries: 2,
    timeout: 90000,           // 90 second timeout (PRO is slower)

    // PRO capabilities
    pixelCopying: false,      // PRO is NOT good at this
    sceneReasoning: true,     // PRO can reason about scenes
    fabricReasoning: true,    // PRO can reason about fabric
    faceReasoning: false,     // BLOCKED - PRO cannot reason about faces
    bodyReasoning: false,     // BLOCKED - PRO cannot reason about bodies
    refinement: true,         // PRO can refine scenes
    beautification: false,    // Never beautify identity
    identityEditing: false,   // Never edit identity
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRO IDENTITY FIREWALL
// PRO has NO ACCESS to these during any pass
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_IDENTITY_FIREWALL = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO IDENTITY FIREWALL                                    ║
║                PRO has NO ACCESS to identity during reasoning                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ CRITICAL: IDENTITY IS FROZEN BEFORE PRO STARTS ★★★

Before PRO begins ANY reasoning, the following are LOCKED:

🔒 FACE (INACCESSIBLE):
   - Face pixels → FROZEN (cannot read or modify)
   - Eye geometry → FROZEN
   - Nose geometry → FROZEN
   - Mouth geometry → FROZEN
   - Jaw/chin shape → FROZEN
   - Facial features → FROZEN

🔒 BODY (INACCESSIBLE):
   - Body proportions → FROZEN
   - Shoulder width → FROZEN
   - Waist width → FROZEN
   - Hip width → FROZEN
   - Belly size → FROZEN
   - Body shape → FROZEN

🔒 HAIR (INACCESSIBLE):
   - Hairline → FROZEN
   - Hair geometry → FROZEN
   - Hair volume → FROZEN

════════════════════════════════════════════════════════════════════════════════
PRO CAN ONLY ACCESS:
════════════════════════════════════════════════════════════════════════════════

✓ Scene architecture
✓ Background elements
✓ Lighting calculations
✓ Fabric draping
✓ Garment surface details
✓ Atmospheric effects

PRO's "thinking" happens ONLY in these areas.
PRO cannot see, access, or modify identity elements.
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO PASS 1: SCENE PASS
// No face access, no identity reasoning, scene + lighting only
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_SCENE_PASS = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO PASS 1: SCENE PASS                                   ║
║             Scene + Lighting Only • NO Face/Identity Access                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

In this pass, you are reasoning ONLY about the scene.

SCENE PASS SCOPE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ ALLOWED to reason about:
  • Background architecture
  • Scene composition
  • Depth layers (foreground/midground/background)
  • Lighting setup and direction
  • Atmospheric effects
  • Props and environmental details
  • Camera angle and framing

✗ BLOCKED from reasoning about:
  • Face (any aspect)
  • Body proportions
  • "Improving" the person
  • "Fixing" features
  • Identity elements

════════════════════════════════════════════════════════════════════════════════
SCENE REASONING QUESTIONS:
════════════════════════════════════════════════════════════════════════════════

Answer these for scene construction:
• What is the architectural environment?
• What materials are visible (marble, wood, concrete)?
• What is the lighting source and direction?
• What props belong in this scene?
• What is the depth structure?
• What atmospheric effects are appropriate?

DO NOT ASK:
• Would the face look better if...
• Should the body be...
• Could the proportions be improved...
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO PASS 2: REFINEMENT PASS
// Garment realism only, face = READ ONLY
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_REFINEMENT_PASS = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO PASS 2: REFINEMENT PASS                              ║
║              Garment Realism Only • Face = READ ONLY                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

In this pass, you are refining ONLY the garment.

REFINEMENT PASS SCOPE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ ALLOWED to reason about:
  • Fabric draping and folds
  • Wrinkle patterns
  • Fabric texture details
  • Light interaction with fabric
  • Garment fit (on locked body)
  • Seam and stitching details

✗ BLOCKED from reasoning about:
  • Face (READ ONLY - do not modify)
  • Body shape (READ ONLY - do not modify)
  • Body proportions (READ ONLY - do not modify)
  • "Improving" fit by changing body
  • "Flattering" adjustments

════════════════════════════════════════════════════════════════════════════════
GARMENT REFINEMENT QUESTIONS:
════════════════════════════════════════════════════════════════════════════════

Answer these for garment realism:
• How does this fabric drape on this specific body?
• Where do natural folds form?
• How does light reflect off this fabric?
• What is the fabric weight and how does it hang?

DO NOT ASK:
• Would the garment look better if the body was...
• Should the waist be... (NO - body is locked)
• Could the fit be more flattering if... (NO - body doesn't change)
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO HYPER-CORRECTION GUARD
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_HYPER_CORRECTION_GUARD = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   PRO HYPER-CORRECTION GUARD                                  ║
║                        Stop the "Improvement" Reflex                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ WARNING: PRO models tend to "improve" things ★★★

You notice:
• Asymmetric face → DO NOT FIX (it's their face)
• Fuller body → DO NOT SLIM (it's their body)
• Skin texture → DO NOT SMOOTH (it's their skin)
• Dark skin → DO NOT LIGHTEN (it's their skin tone)
• Tired eyes → DO NOT BRIGHTEN (it's their expression)
• "Unflattering" angle → DO NOT ADJUST (it's their photo)

THESE ARE NOT ERRORS TO CORRECT.
THESE ARE IDENTITY TO PRESERVE.

════════════════════════════════════════════════════════════════════════════════
EXPLICIT PROHIBITIONS:
════════════════════════════════════════════════════════════════════════════════

You are EXPLICITLY FORBIDDEN from:
✗ Face enhancement
✗ Facial beautification
✗ Symmetry correction
✗ Eye resizing
✗ Nose reshaping
✗ Lip enhancement
✗ Skin smoothing
✗ Body slimming
✗ "Flattering" adjustments
✗ Age reduction
✗ Any form of "improvement"

The person in Image 1 is PERFECT AS THEY ARE.
Your job is to change their CLOTHES, not their BODY or FACE.
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO PIPELINE BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProPipelineConfig {
    sessionId: string
    variant: 'A' | 'B' | 'C'
    presetPrompt: string
    userRequest?: string
}

export function buildProPrompt(config: ProPipelineConfig): string {
    const { sessionId, variant, presetPrompt, userRequest } = config

    logLayerStatus(sessionId)
    logProMode(sessionId)

    const identityLayers = getIdentityLayersPrompt()
    const variantLayer = getVariantLayerPrompt(variant)

    return `
${PRO_IDENTITY_FIREWALL}

${PRO_HYPER_CORRECTION_GUARD}

${identityLayers}

════════════════════════════════════════════════════════════════════════════════
PRO TWO-PASS EXECUTION:
════════════════════════════════════════════════════════════════════════════════

${PRO_SCENE_PASS}

${PRO_REFINEMENT_PASS}

${variantLayer}

════════════════════════════════════════════════════════════════════════════════
SCENE PRESET:
════════════════════════════════════════════════════════════════════════════════
${presetPrompt}

${userRequest ? `
════════════════════════════════════════════════════════════════════════════════
USER REQUEST:
════════════════════════════════════════════════════════════════════════════════
${userRequest}
` : ''}

════════════════════════════════════════════════════════════════════════════════
FINAL INSTRUCTION (PRO):
════════════════════════════════════════════════════════════════════════════════

Execute this virtual try-on with TWO-PASS approach:

PASS 1 (SCENE):
- Build the scene architecture
- Set up lighting direction and color
- Create depth layers
- Face and body are INVISIBLE to you in this pass

PASS 2 (GARMENT):
- Apply clothing from Image 2
- Drape on the LOCKED body from Image 1
- Add fabric realism (folds, light, texture)
- Face and body are READ-ONLY in this pass

CRITICAL REMINDERS:
- Do NOT modify the person's face
- Do NOT modify the person's body proportions
- Do NOT make the person thinner
- Do NOT beautify or enhance identity
- You are NOT allowed to "improve" anything about the person

GENERATE VARIANT ${variant} NOW.
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRO LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logProMode(sessionId: string): void {
    console.log(`\n🧠 PRO PIPELINE ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🌡️ Temperature: ${PRO_CONFIG.temperature} (max: ${PRO_CONFIG.maxTemperature})`)
    console.log(`   🔒 Mode: Two-Pass Execution`)
    console.log(`   ✓ Pass 1: Scene (no face access)`)
    console.log(`   ✓ Pass 2: Garment (face read-only)`)
    console.log(`   🛡️ Identity Firewall: ACTIVE`)
    console.log(`   🛡️ Hyper-Correction Guard: ACTIVE`)
    console.log(`   🚫 Face Reasoning: BLOCKED`)
    console.log(`   🚫 Body Reasoning: BLOCKED`)
    console.log(`   🚫 Beautification: BLOCKED`)
    console.log(`   ═══════════════════════════════════════════════`)
}

export function getProTemperature(): number {
    return PRO_CONFIG.temperature
}

export function getProModel(): string {
    return PRO_CONFIG.model
}
