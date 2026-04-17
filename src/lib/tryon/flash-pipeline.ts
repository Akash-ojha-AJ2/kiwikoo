/**
 * FLASH PIPELINE - Deterministic Rendering Mode
 * 
 * FLASH is fundamentally different from PRO:
 * - Deterministic (temperature 0.01)
 * - Obeys constraints literally
 * - Good at pixel copying
 * - No reasoning/refinement
 * - Single-pass execution
 * 
 * FLASH is IDEAL for identity preservation because it doesn't "think"
 */

import 'server-only'
import {
    getIdentityLayersPrompt,
    getVariantLayerPrompt,
    logLayerStatus
} from './identity-layers'

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_CONFIG = {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.01,        // Absolute minimum - deterministic
    maxTemperature: 0.01,     // Hard cap - never exceed
    maxRetries: 2,
    timeout: 45000,           // 45 second timeout

    // FLASH capabilities
    pixelCopying: true,       // FLASH is good at this
    reasoning: false,         // FLASH doesn't reason
    refinement: false,        // No multi-pass
    beautification: false,    // Never beautify
    identityEditing: false,   // Never edit identity
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH-SPECIFIC PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_EXECUTION_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         FLASH EXECUTION MODE                                  ║
║                 Deterministic • Literal • No Creativity                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

You are operating in FLASH mode.

FLASH MODE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXECUTE instructions LITERALLY
   - Do exactly what is specified
   - Do not interpret or improvise
   - Do not add anything not requested

2. COPY pixels where instructed
   - Face pixels → COPY from Image 1
   - Body proportions → COPY from Image 1
   - These are not suggestions, they are commands

3. NO REASONING or "improving"
   - Do not think about what might look "better"
   - Do not enhance or beautify
   - Do not fix perceived "imperfections"

4. SINGLE PASS execution
   - Generate output in one pass
   - No refinement loops
   - No second-guessing

════════════════════════════════════════════════════════════════════════════════
FLASH CONSTRAINTS:
════════════════════════════════════════════════════════════════════════════════

FACE: COPY exactly from Image 1 (pixel-level)
BODY: COPY proportions exactly from Image 1
CLOTHING: APPLY from Image 2 to body from Image 1
SCENE: Build as specified
LIGHTING: Apply uniformly

You are a RENDERER, not a CREATOR.
You EXECUTE, you do not DESIGN.
`

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH PIPELINE BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export interface FlashPipelineConfig {
    sessionId: string
    variant: 'A' | 'B' | 'C'
    presetPrompt: string
    userRequest?: string
}

export function buildFlashPrompt(config: FlashPipelineConfig): string {
    const { sessionId, variant, presetPrompt, userRequest } = config

    logLayerStatus(sessionId)
    logFlashMode(sessionId)

    const identityLayers = getIdentityLayersPrompt()
    const variantLayer = getVariantLayerPrompt(variant)

    return `
${FLASH_EXECUTION_PROMPT}

${identityLayers}

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
FINAL INSTRUCTION (FLASH):
════════════════════════════════════════════════════════════════════════════════

Execute this virtual try-on:
1. COPY face from Image 1 (pixel-exact)
2. COPY body proportions from Image 1 (exact)
3. APPLY clothing from Image 2 to that body
4. BUILD scene as specified
5. APPLY lighting uniformly

Do NOT modify the person's face.
Do NOT modify the person's body proportions.
Do NOT make the person thinner.
Do NOT beautify or enhance.

GENERATE VARIANT ${variant} NOW.
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFlashMode(sessionId: string): void {
    console.log(`\n⚡ FLASH PIPELINE ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🌡️ Temperature: ${FLASH_CONFIG.temperature} (LOCKED)`)
    console.log(`   🔒 Mode: Deterministic Execution`)
    console.log(`   📋 Pixel Copying: ENABLED`)
    console.log(`   🚫 Reasoning: DISABLED`)
    console.log(`   🚫 Beautification: DISABLED`)
    console.log(`   ═══════════════════════════════════════════════`)
}

export function getFlashTemperature(): number {
    return FLASH_CONFIG.temperature
}

export function getFlashModel(): string {
    return FLASH_CONFIG.model
}
