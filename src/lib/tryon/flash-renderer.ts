/**
 * FLASH RENDERER - Deterministic Rendering Mode
 * 
 * FLASH = Fast, deterministic, pixel-first rendering.
 * No refinement loops, no reasoning, no beautification.
 * Temperature locked at 0.01.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH RENDERER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_CONFIG = {
    temperature: 0.01,       // Absolute minimum - no creativity
    maxRetries: 2,           // Quick retries only
    timeout: 30000,          // 30 second timeout
    mode: 'deterministic' as const,
    reasoning: false,        // No reasoning allowed
    refinement: false,       // No refinement loops
    beautification: false,   // No beautification
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH RENDERER PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_RENDERER_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      FLASH RENDERER (DETERMINISTIC)                           ║
║                     Fast, Pixel-First, No Creativity                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FLASH MODE PIPELINE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ANCHOR_CORE → Lock identity (face, body, hair)
2. CLOTHING REPLACEMENT → Pixel-first swap
3. SCENE APPLICATION → Simple placement
4. LIGHTING HARMONIZATION → Match only, don't create

════════════════════════════════════════════════════════════════════════════════
FLASH RULES (MANDATORY):
════════════════════════════════════════════════════════════════════════════════
✓ Execute instructions literally
✓ Copy pixels where specified
✓ Apply clothing to locked body
✓ Simple scene integration
✓ Lighting consistency only

════════════════════════════════════════════════════════════════════════════════
FLASH PROHIBITIONS:
════════════════════════════════════════════════════════════════════════════════
✗ NO refinement loops
✗ NO reasoning about "what looks better"
✗ NO beautification of any kind
✗ NO creative interpretation
✗ NO "improving" the image
✗ NO second-guessing instructions
✗ NO thinking about aesthetics
✗ NO enhancement attempts

════════════════════════════════════════════════════════════════════════════════
TEMPERATURE LOCK:
════════════════════════════════════════════════════════════════════════════════
Temperature is LOCKED at 0.01.
This means:
• Near-deterministic output
• Minimal variation between runs
• Instructions are followed literally
• No "creative freedom"

════════════════════════════════════════════════════════════════════════════════
FLASH IS A COPIER, NOT A CREATOR:
════════════════════════════════════════════════════════════════════════════════
• Face → COPY from Image 1
• Body → COPY from Image 1
• Hair → COPY from Image 1
• Clothing → COPY style from Image 2, FIT to body from Image 1
• Scene → APPLY as specified

If something isn't specified, PRESERVE from input.
Do not fill in gaps with creativity.
`

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH RENDERING CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const FLASH_CONSTRAINTS = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      FLASH CONSTRAINT LAYER                                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

IDENTITY HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Face pixels → COPY (no generation)
• Eye geometry → LOCK (no change)
• Body proportions → LOCK (no change)
• Hair structure → LOCK (no change)
• Skin texture → PRESERVE (no smoothing)

CLOTHING HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Get design from Image 2
• Apply to body from Image 1
• Drape according to body physics
• Match lighting to scene
• Preserve fabric texture exactly

SCENE HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Apply specified background
• Match lighting direction
• Simple depth integration
• No complex scene reasoning
• No atmospheric effects unless specified
`

// ═══════════════════════════════════════════════════════════════════════════════
// FLASH MODE API
// ═══════════════════════════════════════════════════════════════════════════════

export function getFlashRendererPrompt(): string {
    return FLASH_RENDERER_PROMPT
}

export function getFlashConstraints(): string {
    return FLASH_CONSTRAINTS
}

export function getFlashTemperature(): number {
    return FLASH_CONFIG.temperature
}

export function logFlashMode(sessionId: string): void {
    console.log(`\n⚡ FLASH RENDERER ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🌡️ Temperature: ${FLASH_CONFIG.temperature}`)
    console.log(`   🔒 Mode: Deterministic`)
    console.log(`   🚫 Reasoning: Disabled`)
    console.log(`   🚫 Beautification: Disabled`)
    console.log(`   ═══════════════════════════════════════════════`)
}
