/**
 * IDENTITY MORPHOLOGY LOCK (IML)
 * 
 * Enforces face → body biometric coherence.
 * The facial morphology DETERMINES the body morphology.
 * 
 * RULE: "The body must be anatomically and statistically consistent
 *        with the facial structure from Image 1."
 * 
 * NO idealization, slimming, or normalization allowed.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// FACIAL MORPHOLOGY → BODY MORPHOLOGY MAPPING
// ═══════════════════════════════════════════════════════════════

export const FACE_TO_BODY_MAPPING = {
    // Face fullness indicators
    fullRoundCheeks: {
        implies: ['plus-size torso', 'full arms', 'broad shoulders', 'thick neck'],
        forbids: ['slim waist', 'thin arms', 'narrow shoulders', 'model proportions']
    },
    wideJaw: {
        implies: ['broad shoulders', 'wide neck', 'substantial frame'],
        forbids: ['narrow shoulders', 'slim build', 'petite frame']
    },
    doubleChin: {
        implies: ['heavy build', 'visible belly', 'thick arms', 'full torso'],
        forbids: ['flat stomach', 'athletic build', 'defined abs']
    },
    thickNeck: {
        implies: ['broad shoulders', 'thick arms', 'full torso', 'substantial build'],
        forbids: ['narrow shoulders', 'thin arms', 'slim build']
    },
    softJawline: {
        implies: ['soft body contours', 'rounded features', 'natural fullness'],
        forbids: ['angular body', 'defined muscles', 'sharp contours']
    },
    roundFaceShape: {
        implies: ['fuller body overall', 'rounded proportions', 'soft build'],
        forbids: ['angular body', 'lean build', 'athletic frame']
    },
    // Lean face indicators
    hollowCheeks: {
        implies: ['lean build', 'angular body', 'defined features'],
        forbids: ['full torso', 'thick arms', 'plus-size build']
    },
    sharpJawline: {
        implies: ['angular body', 'defined structure', 'lean build'],
        forbids: ['soft contours', 'rounded build', 'full features']
    }
}

// ═══════════════════════════════════════════════════════════════
// IML COHERENCE PROMPT - INJECT INTO ALL PIPELINES
// ═══════════════════════════════════════════════════════════════

export const IML_COHERENCE_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              IDENTITY MORPHOLOGY LOCK (IML) — MANDATORY                       ║
║           Face → Body Biometric Coherence Layer                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ THE BODY MUST BE ANATOMICALLY CONSISTENT WITH THE FACE ★★★

Before generating the body, you MUST analyze the facial morphology:

═══════════════════════════════════════════════════════════════════════════════
FACIAL MORPHOLOGY → BODY MORPHOLOGY INFERENCE (BINDING)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ FACIAL INDICATOR              │ BODY MUST HAVE                              │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ Full/round cheeks             │ Plus-size torso, full arms                  │
│ Wide jaw                      │ Broad shoulders, wide neck                  │
│ Double chin                   │ Heavy build, visible belly, thick arms      │
│ Thick neck                    │ Broad shoulders, substantial frame          │
│ Soft/undefined jawline        │ Soft body contours, natural fullness        │
│ Round face shape              │ Fuller body overall                         │
│ Visible facial fat            │ Body fat proportional to face               │
│ Wide nose bridge              │ Broader frame structure                     │
│ Full lips with facial weight  │ Proportional body fullness                  │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
COHERENCE CHECKPOINTS (ALL MUST PASS)
═══════════════════════════════════════════════════════════════════════════════

CHECK 1: NECK CONTINUITY
• The neck MUST smoothly transition from face to shoulders
• Face width → Neck width → Shoulder width (proportional)
• NO abrupt size changes between face and body

CHECK 2: CHEEK-ARM CORRELATION
• Full cheeks → Thick upper arms
• Hollow cheeks → Lean arms
• NO mismatch allowed

CHECK 3: JAW-SHOULDER ALIGNMENT
• Wide jaw → Broad shoulders
• Narrow jaw → Narrower shoulders
• Jaw width predicts shoulder width

CHECK 4: CHIN-TORSO MATCH
• Double chin → Body shows proportional weight
• Sharp chin → Leaner torso acceptable
• Chin fat = Body fat indicator

CHECK 5: HEAD-TO-BODY RATIO
• The head-to-body ratio from Image 1 = PRESERVED exactly
• If generated head looks "too big" → body was slimmed (FAIL)
• If generated head looks "too small" → body was enlarged (FAIL)

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN OPERATIONS (IML VIOLATIONS)
═══════════════════════════════════════════════════════════════════════════════

⛔ IDEALIZATION: Making the body "better" than face suggests
⛔ SLIMMING: Reducing body mass below what face indicates
⛔ NORMALIZATION: Pushing body toward "average" model proportions
⛔ BEAUTIFICATION: Improving body aesthetics
⛔ ATHLETIC UPGRADE: Adding muscle definition not in source
⛔ HEIGHT ELONGATION: Stretching body proportions
⛔ POSTURE CORRECTION: Changing spine curvature or stance

═══════════════════════════════════════════════════════════════════════════════
IML FAILURE CONDITIONS
═══════════════════════════════════════════════════════════════════════════════

Generation MUST be rejected if:
□ Full face appears on slim body
□ Round cheeks appear with thin arms
□ Wide jaw appears with narrow shoulders
□ Double chin appears with flat stomach
□ Thick neck appears on narrow frame
□ Head-to-body ratio differs from Image 1
□ Body looks "improved" compared to face weight
□ Neck shows discontinuity between face and body

★★★ THE FACE AND BODY BELONG TO THE SAME PERSON ★★★
★★★ THEY MUST BE BIOMETRICALLY CONSISTENT ★★★
`

// ═══════════════════════════════════════════════════════════════
// BODY SOURCE OF TRUTH ENFORCEMENT
// ═══════════════════════════════════════════════════════════════

export const BODY_SOURCE_ENFORCEMENT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              BODY SOURCE OF TRUTH — ABSOLUTE                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
SOURCE AUTHORITY TABLE
═══════════════════════════════════════════════════════════════════════════════

┌───────────────────────┬────────────────────┬──────────────────────────────┐
│ ATTRIBUTE             │ VALID SOURCE       │ INVALID SOURCE               │
├───────────────────────┼────────────────────┼──────────────────────────────┤
│ Face                  │ User Image (1)     │ Garment Image (2)            │
│ Face geometry         │ User Image (1)     │ Garment Image (2)            │
│ Body shape            │ User Image (1)     │ Garment Image (2)            │
│ Body weight           │ User Image (1)     │ Garment Image (2)            │
│ Body proportions      │ User Image (1)     │ Garment Image (2)            │
│ Pose skeleton         │ User Image (1)     │ Garment Image (2)            │
│ Skin tone             │ User Image (1)     │ Garment Image (2)            │
│ Clothing fabric       │ Garment Image (2)  │ User Image (1)               │
│ Clothing color        │ Garment Image (2)  │ User Image (1)               │
│ Clothing texture      │ Garment Image (2)  │ User Image (1)               │
│ Clothing drape        │ BOTH (adapted)     │ -                            │
└───────────────────────┴────────────────────┴──────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
GARMENT IMAGE BODY = COMPLETELY INVALID
═══════════════════════════════════════════════════════════════════════════════

The person/mannequin/model in the garment reference (Image 2):
• Has a body → IGNORE COMPLETELY
• Has proportions → IGNORE COMPLETELY
• Has a silhouette → IGNORE COMPLETELY
• Has a pose → IGNORE (unless garment-specific)
• Has measurements → IGNORE COMPLETELY

The garment image provides ONLY:
✓ Fabric texture
✓ Fabric color
✓ Construction details
✓ Seam placement
✓ Button/zipper arrangement

NOTHING ELSE from Image 2 is valid.

═══════════════════════════════════════════════════════════════════════════════
ENFORCEMENT RULE
═══════════════════════════════════════════════════════════════════════════════

Even if the garment asset shows:
• A thin model → IGNORE, use User body
• An athletic figure → IGNORE, use User body
• Professional model proportions → IGNORE, use User body
• Idealized silhouette → IGNORE, use User body

The garment STRETCHES, DRAPES, and ADAPTS to the User's actual body.
The User's body NEVER adapts to the garment.
`

// ═══════════════════════════════════════════════════════════════
// COMBINED IML + BODY SOURCE PROMPT
// ═══════════════════════════════════════════════════════════════

export function getIMLPrompt(): string {
    return `${IML_COHERENCE_PROMPT}\n\n${BODY_SOURCE_ENFORCEMENT}`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logIMLStatus(sessionId: string): void {
    console.log(`\n🔒 IDENTITY MORPHOLOGY LOCK [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📐 Face → Body coherence: ACTIVE`)
    console.log(`   🚫 Body idealization: BLOCKED`)
    console.log(`   🚫 Body slimming: BLOCKED`)
    console.log(`   🚫 Garment body reference: BLOCKED`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✓ User Image = Body source`)
    console.log(`   ✓ Garment Image = Fabric source only`)
}
