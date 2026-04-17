/**
 * MASTER SPECIFICATION - Production Virtual Try-On System
 * 
 * This file contains the hard constraints and rules that govern
 * the entire try-on system. All prompts and logic must adhere to these.
 * 
 * RELIABILITY > CREATIVITY
 */

export const MASTER_SPEC = {
    version: '1.0.0',
    lastUpdated: '2024-12-24',

    // ═══════════════════════════════════════════════════════════════
    // IDENTITY AUTHORITY ORDER (NON-NEGOTIABLE)
    // ═══════════════════════════════════════════════════════════════

    IDENTITY_AUTHORITY: `
IDENTITY AUTHORITY ORDER (HARD CONSTRAINTS – NEVER VIOLATE):

1. USER FACE IMAGE
   - Defines identity, ethnicity, age, expression
   - Face pixels must be preserved exactly
   
2. USER FACE → BODY INFERENCE
   - Body proportions inferred ONLY from face
   - Never from garment image
   
3. GARMENT IMAGE (EXTRACTED ONLY)
   - Defines fabric, color, pattern, cut
   - Must NOT define body shape or proportions
   
4. SCENE / BACKGROUND
   - Visual context only

⚠️  Lower layers may NEVER override higher layers.
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // GARMENT HANDLING RULES
    // ═══════════════════════════════════════════════════════════════

    GARMENT_RULES: `
GARMENT HANDLING RULES:

If clothing reference contains a person:
• Automatically extract garment only
• Remove human completely
• Preserve exact: color, pattern, fabric texture, neckline, hemline, sleeve length

After extraction, classify garment into:
{
  garment_type: "SHIRT" | "SHORT_KURTA" | "LONG_KURTA" | "DRESS" | etc.
  length: "waist" | "hip" | "mid_thigh" | "knee" | "below_knee"
  sleeve: "sleeveless" | "short" | "three_quarter" | "full"
  fit_behavior: description
  DO_NOT: [absolute constraints]
}

The DO_NOT rules are ABSOLUTE. If violated, generation is invalid.

Example DO_NOT rules:
SHORT_KURTA:
- MUST end at HIP
- MUST NOT extend to knee
- MUST NOT flare into dress

SHIRT:
- MUST end at WAIST or HIP
- MUST NOT become a kurta
- MUST NOT extend past hip
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // FACE & BODY CONSISTENCY RULES
    // ═══════════════════════════════════════════════════════════════

    FACE_BODY_RULES: `
FACE FREEZE (MANDATORY):
• Face is READ-ONLY
• Do NOT regenerate face
• Do NOT stylize face
• Do NOT change eye size, nose shape, jawline
• Match lighting only by global color temperature

BODY SHAPE:
• Infer from face only
• If garment suggests different body → IGNORE garment body
• Garment must adapt to body, not the opposite

⚠️  No "face pasted onto body" artifacts allowed.
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // MULTI-VARIANT GENERATION RULES
    // ═══════════════════════════════════════════════════════════════

    MULTI_VARIANT_RULES: `
MULTI-VARIANT GENERATION RULES:

Generate EXACTLY 3 variants.

Across all 3:
• Face pixels identical
• Body proportions identical
• Garment geometry identical

Variants must differ ONLY by:
• Camera distance (standard / closer / wider)
• Lighting lane
• Background context

STYLE LANES (one per variant):
1. Warm natural daylight
2. Cool realistic indoor
3. Moody / contrast-rich or outdoor sun

⚠️  No pastel bias unless explicitly requested.
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // MODEL-SPECIFIC BEHAVIOR
    // ═══════════════════════════════════════════════════════════════

    MODEL_BEHAVIOR: `
FLASH MODEL:
• Strict execution only
• No creative reinterpretation
• Temperature ≤ 0.01

PRO MODEL:
• Two-pass rendering:
  Pass 1: Scene + body + garment (no face access)
  Pass 2: Face integration (READ-ONLY)
• Temperature ≤ 0.04
• No facial correction or beautification
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // RAG INTEGRATION
    // ═══════════════════════════════════════════════════════════════

    RAG_RULES: `
RAG INTEGRATION:

Before generation:
• Retrieve similar GOOD examples
• Retrieve similar BAD examples

For BAD examples:
• Explicitly list what went wrong
• Explicitly state how to avoid it

Apply lessons STRICTLY.

If conflict occurs:
• HARD RULES override RAG examples
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION & AUTO-FEEDBACK
    // ═══════════════════════════════════════════════════════════════

    VALIDATION_RULES: `
VALIDATION & AUTO-FEEDBACK:

If any occur:
• Face similarity < threshold
• Garment length/type violated
• Pattern or color changed
• Body proportions mismatch

→ Mark as BAD
→ Store failure pattern
→ Use as negative RAG example
`.trim(),

    // ═══════════════════════════════════════════════════════════════
    // PRIMARY OBJECTIVE
    // ═══════════════════════════════════════════════════════════════

    PRIMARY_OBJECTIVE: `
PRIMARY OBJECTIVE:

Produce realistic, identity-faithful, garment-accurate try-on images 
across all body types, ethnicities, and genders, with consistent face, 
correct body physics, and diverse styles.

RELIABILITY > CREATIVITY
`.trim()
}

// ═══════════════════════════════════════════════════════════════
// GARMENT DO-NOT RULES BY TYPE
// ═══════════════════════════════════════════════════════════════

export const GARMENT_DO_NOT_RULES: Record<string, string[]> = {
    SHIRT: [
        'MUST end at WAIST or upper HIP',
        'MUST NOT extend to mid-thigh',
        'MUST NOT become a kurta',
        'MUST NOT extend past hip level'
    ],

    T_SHIRT: [
        'MUST end at WAIST',
        'MUST NOT extend to hip',
        'MUST NOT become a tunic'
    ],

    SHORT_KURTA: [
        'MUST end at HIP or upper mid-thigh',
        'MUST NOT extend to knee',
        'MUST NOT flare into dress',
        'MUST NOT become a long kurta'
    ],

    LONG_KURTA: [
        'MUST end at KNEE or below',
        'MUST NOT shorten to hip',
        'MUST NOT become a shirt'
    ],

    KURTI: [
        'Length depends on style',
        'MUST maintain extracted length',
        'MUST NOT change from short to long or vice versa'
    ],

    DRESS: [
        'MUST maintain extracted length',
        'MUST NOT split into top+bottom',
        'One-piece only'
    ],

    CROP_TOP: [
        'MUST end ABOVE waist',
        'MUST NOT extend to waist',
        'MUST show midriff'
    ],

    BLOUSE: [
        'MUST end at WAIST',
        'MUST NOT extend past waist',
        'Fitted style only'
    ]
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION THRESHOLDS
// ═══════════════════════════════════════════════════════════════

export const VALIDATION_THRESHOLDS = {
    // Face similarity from guardrail
    FACE_SIMILARITY_MIN: 70,  // 70% minimum for acceptance
    FACE_SIMILARITY_WARN: 80, // 80% is good, <80 worth noting

    // Garment type must match exactly
    GARMENT_TYPE_MUST_MATCH: true,
    GARMENT_LENGTH_MUST_MATCH: true,

    // Pattern/color tolerance
    PATTERN_SIMILARITY_MIN: 75,  // 75% pattern match
    COLOR_SIMILARITY_MIN: 80,    // 80% color match

    // Max retries
    MAX_RETRY_ATTEMPTS: 3
}

// ═══════════════════════════════════════════════════════════════
// TEMPERATURE SETTINGS
// ═══════════════════════════════════════════════════════════════

export const TEMPERATURE_SETTINGS = {
    FLASH: 0.01,  // Extremely deterministic
    PRO: 0.04,    // Very deterministic
    ANALYSIS: 0.1 // GPT-4o analysis (slightly more flexible)
}
