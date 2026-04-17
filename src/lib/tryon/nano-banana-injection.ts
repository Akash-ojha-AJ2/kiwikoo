/**
 * NANO BANANA PROMPT INJECTION
 * 
 * Final prompt blocks injected before Nano Banana generation.
 * These enforce the key design principles:
 * 
 * 1. SCENE AUTHORITY RULE - Scene from Image 1 only
 * 2. HUMAN LOCK RULE - No beautification or geometry changes
 * 3. MENTAL MODEL RULE - Only adjust environment and clothing
 * 
 * PART 10 of the Identity-Safe Try-On System
 */

import 'server-only'
import type { SceneAuthority } from './scene-authority.schema'

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE AUTHORITY RULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scene authority rule - environment inherited from Image 1 only.
 */
export const SCENE_AUTHORITY_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         SCENE AUTHORITY RULE                                   ║
║                 Environment = Image 1 ONLY (No Switching)                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

ABSOLUTE REQUIREMENT:
Environment and lighting must be inherited ONLY from Image 1.

WHAT THIS MEANS:
• If Image 1 is INDOOR → output must be INDOOR
• If Image 1 is OUTDOOR → output must be OUTDOOR
• Lighting type must match Image 1
• Background style must match Image 1

FORBIDDEN ACTIONS:
✗ NO indoor to outdoor switching
✗ NO outdoor to indoor switching
✗ NO introducing a new location
✗ NO changing background style
✗ NO altering lighting type
✗ NO scene "improvements"

All variants must share the SAME scene from Image 1.
`

// ═══════════════════════════════════════════════════════════════════════════════
// HUMAN LOCK RULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Human lock rule - no beautification or geometry changes.
 */
export const HUMAN_LOCK_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           HUMAN LOCK RULE                                      ║
║               Face + Body = FINAL (No Enhancement Allowed)                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

ABSOLUTE REQUIREMENT:
Face and body are FINAL. Do not modify them.

WHAT THIS MEANS:
• Face geometry is LOCKED
• Body proportions are LOCKED
• Skin texture is LOCKED
• Body mass is LOCKED

FORBIDDEN ACTIONS:
✗ NO beautifying the face
✗ NO slimming the body
✗ NO enhancing features
✗ NO smoothing skin beyond lighting
✗ NO reinterpreting geometry
✗ NO "improving" appearance

The person in the output must be IDENTICAL to the person in the input.
Not similar. IDENTICAL.
`

// ═══════════════════════════════════════════════════════════════════════════════
// MENTAL MODEL RULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mental model rule - defines what the model is actually doing.
 */
export const MENTAL_MODEL_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          MENTAL MODEL RULE                                     ║
║          You Are a Clothing Swapper, Not a Photo Enhancer                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

UNDERSTAND YOUR ROLE:
• You are adjusting ENVIRONMENT and CLOTHING only
• You are NOT improving the person
• You are NOT enhancing the photo
• You are NOT making them "look better"

THINK OF IT AS:
"I am taking THIS EXACT PERSON and putting them in THIS EXACT SCENE
 wearing DIFFERENT CLOTHING. Nothing else changes."

YOUR JOB:
1. Keep the person EXACTLY as they are
2. Keep the scene EXACTLY as shown in Image 1
3. Apply the garment from Image 2
4. Done. No embellishment.

SELF-CHECK:
"Did I change anything about the person besides their clothing?"
If YES → You made a mistake. Regenerate.
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT AUTHORITY RULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Garment authority rule - exact pattern replication, no simplification.
 */
export const GARMENT_AUTHORITY_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        GARMENT AUTHORITY RULE                                  ║
║             Replicate Exactly — Do Not Reinterpret or Simplify                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

ABSOLUTE REQUIREMENT:
The clothing reference image defines the EXACT garment.
This is a garment REPLICATION task, NOT reinterpretation.

WHAT MUST BE PRESERVED:
• Fabric patterns (exact motifs)
• Pattern density and scale
• Pattern placement on garment
• Decorative elements (embroidery, prints, textures)
• Color accuracy
• Garment structure and cut

FORBIDDEN ACTIONS:
✗ NO changing fabric patterns
✗ NO simplifying or redrawing motifs
✗ NO altering pattern density or scale
✗ NO inventing decorative elements
✗ NO removing decorative elements
✗ NO "artistic reinterpretation"

Accuracy is MORE IMPORTANT than visual polish.
If the pattern looks "cleaner" than the reference → FAIL.
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT COMPLETENESS RULE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Garment completeness rule - no missing pants.
 */
export const GARMENT_COMPLETENESS_RULE = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     GARMENT COMPLETENESS RULE                                  ║
║                   Complete Outfit — No Missing Pants                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

ABSOLUTE REQUIREMENT:
The final output must depict a COMPLETE outfit.

IF REFERENCE SHOWS UPPER GARMENT ONLY:
• Generate appropriate lower garments (pants or skirt)
• Lower garments must be:
  - Plain (no patterns)
  - Neutral color (black, navy, beige, gray)
  - Non-distracting
  - Consistent with outfit style

FORBIDDEN ACTIONS:
✗ NO converting tops into dresses
✗ NO omitting lower garments
✗ NO unnaturally extending the top
✗ NO cropping to hide missing pants

SELF-CHECK:
"Is the person wearing a complete outfit?"
If answer is NO → regenerate with pants/skirt.
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED INJECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the final prompt injection block for Nano Banana.
 * 
 * @param sceneAuthority - Resolved scene authority (for context)
 * @returns Complete prompt injection string
 */
export function buildFinalPromptInjection(sceneAuthority?: SceneAuthority): string {
    const sceneContext = sceneAuthority ? `
[DETECTED SCENE: ${sceneAuthority.detected_scene.environment.toUpperCase()} @ ${Math.round(sceneAuthority.detected_scene.confidence * 100)}% confidence]
[LIGHTING: ${sceneAuthority.lighting_profile.type} @ ${sceneAuthority.lighting_profile.color_temperature_kelvin}K]
` : ''

    return `
════════════════════════════════════════════════════════════════════════════════
                    NANO BANANA CONTROL LAYER (vFinal)
     Identity-Safe, Scene-Aware, Garment-Faithful Try-On System Enforcement
════════════════════════════════════════════════════════════════════════════════
${sceneContext}
${SCENE_AUTHORITY_RULE}

${HUMAN_LOCK_RULE}

${GARMENT_AUTHORITY_RULE}

${GARMENT_COMPLETENESS_RULE}

${MENTAL_MODEL_RULE}

════════════════════════════════════════════════════════════════════════════════
                            FINAL DESIGN PRINCIPLE
════════════════════════════════════════════════════════════════════════════════

Identity is ENFORCED.
Scene is OWNED.
Garment is REPLICATED.
You EXECUTE — you NEVER DECIDE.

════════════════════════════════════════════════════════════════════════════════
`.trim()
}

/**
 * Get lightweight injection (for token-constrained contexts).
 */
export function getLightweightInjection(): string {
    return `
RULES:
1. Scene from Image 1 ONLY. No indoor/outdoor switching.
2. Face and body are FINAL. No beautification.
3. Garment patterns EXACTLY as shown. No simplification.
4. Complete outfit required. No missing pants.
5. You adjust clothing ONLY. You do not improve the person.

FORBIDDEN: Scene switching, face modification, body reshaping, pattern redesign, missing pants.
`.trim()
}

/**
 * Log that final injection was applied.
 */
export function logNanoBananaInjection(sceneAuthority?: SceneAuthority): void {
    console.log('\n🍌 NANO BANANA INJECTION APPLIED')
    console.log('   ═══════════════════════════════════════')
    console.log('   ✓ Scene Authority Rule: ACTIVE')
    console.log('   ✓ Human Lock Rule: ACTIVE')
    console.log('   ✓ Garment Authority Rule: ACTIVE')
    console.log('   ✓ Garment Completeness Rule: ACTIVE')
    console.log('   ✓ Mental Model Rule: ACTIVE')
    if (sceneAuthority) {
        console.log(`   ✓ Scene: ${sceneAuthority.detected_scene.environment}`)
        console.log(`   ✓ Lighting: ${sceneAuthority.lighting_profile.type}`)
    }
    console.log('   ═══════════════════════════════════════')
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const NANO_BANANA_RULES = {
    sceneAuthority: SCENE_AUTHORITY_RULE,
    humanLock: HUMAN_LOCK_RULE,
    garmentAuthority: GARMENT_AUTHORITY_RULE,
    garmentCompleteness: GARMENT_COMPLETENESS_RULE,
    mentalModel: MENTAL_MODEL_RULE,
    buildInjection: buildFinalPromptInjection,
    lightweight: getLightweightInjection
}

export default NANO_BANANA_RULES
