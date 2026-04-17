/**
 * PRO COMPOSITOR - Thinking/Refinement Mode
 * 
 * PRO = Thinking model with scene construction and fabric realism.
 * Identity is FROZEN before reasoning begins.
 * Temperature capped at 0.04.
 * NO access to face/body geometry during refinement.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// PRO COMPOSITOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_CONFIG = {
    temperature: 0.04,       // Low but allows some scene creativity
    maxTemperature: 0.04,    // Hard cap - never exceed
    maxRetries: 2,
    timeout: 60000,          // 60 second timeout (PRO is slower)
    mode: 'compositor' as const,
    reasoning: true,         // Scene reasoning allowed
    faceReasoning: false,    // Face reasoning BLOCKED
    bodyReasoning: false,    // Body reasoning BLOCKED
    refinement: true,        // Scene/lighting refinement allowed
    beautification: false,   // Never beautify identity
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRO COMPOSITOR PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_COMPOSITOR_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO COMPOSITOR (THINKING MODE)                           ║
║                  Scene Construction + Fabric Realism                          ║
║                  Identity is FROZEN before reasoning                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

PRO MODE PIPELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ANCHOR_CORE → FREEZE identity (face, body, hair) — IMMUTABLE FROM THIS POINT
2. SCENE CONSTRUCTION → Build architecture first
3. LIGHTING REASONING → Calculate realistic light
4. FABRIC REALISM → Drape and texture
5. MICRO-POLISH → Final touches (NO face/body access)

════════════════════════════════════════════════════════════════════════════════
★★★ CRITICAL: IDENTITY FREEZE BEFORE THINKING ★★★
════════════════════════════════════════════════════════════════════════════════
Before PRO does ANY reasoning:
• Face geometry → FROZEN (read-only)
• Body proportions → FROZEN (read-only)
• Hair structure → FROZEN (read-only)
• Skin texture → FROZEN (read-only)

PRO's "thinking" happens ONLY on:
• Scene architecture
• Lighting calculations
• Fabric physics
• Atmospheric effects
• Background details

PRO's "thinking" NEVER touches:
• Face shape
• Eye size
• Body proportions
• Hair geometry
• Skin smoothness

════════════════════════════════════════════════════════════════════════════════
PRO REASONING ZONES:
════════════════════════════════════════════════════════════════════════════════
✓ ALLOWED to reason about:
  • "How should light fall on this scene?"
  • "What architectural details belong here?"
  • "How does this fabric drape?"
  • "What atmospheric effects are appropriate?"
  • "What background elements add realism?"

✗ BLOCKED from reasoning about:
  • "Could this face look better?"
  • "Should the eyes be adjusted?"
  • "Would the body look better if..."
  • "The proportions could be..."
  • "The skin would look nicer if..."

════════════════════════════════════════════════════════════════════════════════
HYPER-CORRECTION GUARD:
════════════════════════════════════════════════════════════════════════════════
PRO models tend to "hyper-correct" — they see imperfections and try to fix them.
This is BLOCKED.

If PRO notices:
• Asymmetric face → DO NOT FIX
• "Unflattering" angle → DO NOT ADJUST
• Skin texture → DO NOT SMOOTH
• "Awkward" proportions → DO NOT CHANGE
• "Imperfect" features → PRESERVE EXACTLY

The person's appearance is NOT an error to correct.
It is identity to preserve.

════════════════════════════════════════════════════════════════════════════════
TEMPERATURE CONTROL:
════════════════════════════════════════════════════════════════════════════════
Temperature is CAPPED at 0.04.
This means:
• Limited creative variation
• Consistent scene construction
• No wild interpretations
• Controlled refinement

If identity starts to drift → LOWER temperature immediately.
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO SCENE REASONING LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_SCENE_REASONING = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO SCENE REASONING LAYER                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

SCENE CONSTRUCTION ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Architecture → Establish structures
2. Materials → Apply textures
3. Props → Place environmental details
4. Depth → Layer foreground/midground/background
5. Lighting → Calculate consistent light
6. Atmosphere → Add ambient effects

LIGHTING REASONING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Light source position → affects all elements consistently
• Shadow direction → must be uniform across scene
• Light temperature → affects clothing AND background
• Light intensity → realistic falloff with distance
• Ambient fill → prevents pure black shadows

FABRIC REASONING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Material weight → how it hangs
• Weave pattern → how it catches light
• Fit to body → follows body geometry (LOCKED)
• Wrinkle patterns → realistic fabric physics
• Color consistency → matches reference exactly
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO IDENTITY FIREWALL
// ═══════════════════════════════════════════════════════════════════════════════

export const PRO_IDENTITY_FIREWALL = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      PRO IDENTITY FIREWALL                                    ║
║                 PRO has NO ACCESS to these during reasoning                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FIREWALL BLOCKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Face pixels → INACCESSIBLE
🔒 Eye geometry → INACCESSIBLE
🔒 Nose geometry → INACCESSIBLE
🔒 Mouth geometry → INACCESSIBLE
🔒 Jaw/chin shape → INACCESSIBLE
🔒 Body proportions → INACCESSIBLE
🔒 Shoulder width → INACCESSIBLE
🔒 Waist/hip ratio → INACCESSIBLE
🔒 Hair geometry → INACCESSIBLE
🔒 Hairline → INACCESSIBLE
🔒 Skin texture → INACCESSIBLE

PRO CAN ONLY ACCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Light hitting face (direction/color ONLY, not face shape)
✓ Shadow on face (position ONLY, not face features)
✓ Clothing areas
✓ Background/scene areas
✓ Atmospheric effects

The firewall ensures PRO cannot "improve" identity.
Identity is read-only data that PRO renders AROUND.
`

// ═══════════════════════════════════════════════════════════════════════════════
// PRO MODE API
// ═══════════════════════════════════════════════════════════════════════════════

export function getProCompositorPrompt(): string {
    return PRO_COMPOSITOR_PROMPT
}

export function getProSceneReasoning(): string {
    return PRO_SCENE_REASONING
}

export function getProIdentityFirewall(): string {
    return PRO_IDENTITY_FIREWALL
}

export function getProTemperature(): number {
    return PRO_CONFIG.temperature
}

export function getProMaxTemperature(): number {
    return PRO_CONFIG.maxTemperature
}

export function logProMode(sessionId: string): void {
    console.log(`\n🧠 PRO COMPOSITOR ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🌡️ Temperature: ${PRO_CONFIG.temperature} (max: ${PRO_CONFIG.maxTemperature})`)
    console.log(`   🔒 Mode: Compositor (thinking)`)
    console.log(`   ✓ Scene Reasoning: Enabled`)
    console.log(`   🔒 Face Reasoning: BLOCKED`)
    console.log(`   🔒 Body Reasoning: BLOCKED`)
    console.log(`   🛡️ Identity Firewall: ACTIVE`)
    console.log(`   ═══════════════════════════════════════════════`)
}
