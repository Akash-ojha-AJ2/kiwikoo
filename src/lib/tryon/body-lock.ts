/**
 * BODY GEOMETRY LOCK
 * 
 * Prevents body morphing during garment generation.
 * Body silhouette is READ-ONLY.
 * 
 * LOCKED ATTRIBUTES:
 * - Shoulder width
 * - Torso width
 * - Arm thickness
 * - Neck size
 * - Fat distribution
 * 
 * ALLOWED:
 * - Clothing drape
 * - Fabric folds
 * - Cloth thickness
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// BODY LOCK CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const BODY_LOCK_CONFIG = {
    // Tolerance for body measurements (percentage)
    shoulderWidthTolerance: 0.02,    // 2%
    torsoWidthTolerance: 0.02,       // 2%
    armThicknessTolerance: 0.03,     // 3%
    neckSizeTolerance: 0.02,         // 2%

    // Body regions (protected)
    protectedRegions: [
        'shoulders',
        'torso',
        'arms',
        'neck',
        'waist',
        'hips'
    ],

    // Garment regions (can generate)
    garmentRegions: [
        'shirt',
        'sleeves',
        'collar',
        'hem',
        'fabric_folds',
        'drape'
    ]
}

// ═══════════════════════════════════════════════════════════════
// BODY LOCK PROMPT (PREPEND TO ALL PIPELINES)
// ═══════════════════════════════════════════════════════════════

export const BODY_LOCK_PROMPT = `[BODY GEOMETRY LOCK — NO MORPHING]

BODY SILHOUETTE IS READ-ONLY.
Copy body proportions EXACTLY from Image 1.

═══════════════════════════════════════════════════════════
LOCKED BODY ATTRIBUTES (NEVER CHANGE)
═══════════════════════════════════════════════════════════
- Shoulder width (exact pixels)
- Torso width and length
- Arm thickness and length
- Neck width and length
- Waist circumference
- Hip width
- Fat distribution and placement
- Body posture angle
- Spine curvature

═══════════════════════════════════════════════════════════
FORBIDDEN BODY OPERATIONS
═══════════════════════════════════════════════════════════
- Body slimming or widening
- Posture correction
- Height adjustment
- Shoulder squaring
- Arm thinning
- Neck lengthening
- Waist cinching
- Hip adjustment
- Fat removal or redistribution

═══════════════════════════════════════════════════════════
GARMENT IS OVERLAY ONLY
═══════════════════════════════════════════════════════════
Clothing must ADAPT to body shape:
- Fat bodies → clothing stretches around body
- Thin bodies → clothing hangs loosely
- Broad shoulders → fabric pulls at seams
- Narrow shoulders → fabric bunches

NEVER reshape body to fit garment.
If garment fit is imperfect → THAT IS CORRECT.

═══════════════════════════════════════════════════════════
ALLOWED GARMENT OPERATIONS
═══════════════════════════════════════════════════════════
- Fabric drape based on body volume
- Natural fold patterns
- Wrinkle formation at joints
- Cloth thickness rendering
- Seam placement
- Button/zipper alignment`

// ═══════════════════════════════════════════════════════════════
// BODY WEIGHT ENFORCEMENT (CRITICAL FOR PLUS-SIZE PRESERVATION)
// ═══════════════════════════════════════════════════════════════

export const BODY_WEIGHT_ENFORCEMENT = `[BODY WEIGHT ENFORCEMENT — MANDATORY]

★★★ THIS IS THE MOST CRITICAL BODY RULE ★★★

Before generating the body, ANALYZE THE FACE in Image 1:

═══════════════════════════════════════════════════════════
FACE-TO-BODY WEIGHT CORRELATION (BINDING)
═══════════════════════════════════════════════════════════

| FACE INDICATOR          | BODY REQUIREMENT                    |
|-------------------------|-------------------------------------|
| Full/round cheeks       | → Body MUST be plus-size            |
| Wide jaw                | → Shoulders MUST be broad           |
| Double chin             | → Body MUST be heavy/full           |
| Thick neck              | → Torso MUST be thick               |
| Soft facial contours    | → Body MUST have soft contours      |
| Visible jowls           | → Body MUST show weight             |
| Round face shape        | → Body MUST be fuller               |

═══════════════════════════════════════════════════════════
ANTI-SLIMMING ENFORCEMENT (READ CAREFULLY)
═══════════════════════════════════════════════════════════

If Image 1 shows a person with:
• Full/round face → OUTPUT body MUST be full/round
• Visible body fat in face → OUTPUT body MUST show same fat
• Wide face structure → OUTPUT body MUST be proportionally wide

⛔ GENERATION FAILED CONDITIONS:
• Full face + Slim body = FAILED (MISMATCH)
• Round face + Athletic body = FAILED (MISMATCH)
• Double chin + No belly = FAILED (MISMATCH)
• Wide jaw + Narrow shoulders = FAILED (MISMATCH)

═══════════════════════════════════════════════════════════
THE CLOTHING REFERENCE IMAGE IS IRRELEVANT FOR BODY
═══════════════════════════════════════════════════════════

The model wearing the clothing in Image 2 may be:
• Thin
• Tall
• Athletic
• Different body type

🚫 COMPLETELY IGNORE THE BODY IN IMAGE 2.
🚫 ONLY the body from IMAGE 1 is valid.
🚫 The clothing must STRETCH to fit the ACTUAL body.

═══════════════════════════════════════════════════════════
PLUS-SIZE BODY RULES (IF DETECTED)
═══════════════════════════════════════════════════════════

If the face analysis shows plus-size traits:

MANDATORY:
✓ Full face → KEEP
✓ Wide neck → KEEP
✓ Broad shoulders → KEEP
✓ Thick upper arms → KEEP
✓ Full torso → KEEP
✓ Natural belly → KEEP
✓ Full waist → KEEP
✓ Natural hip width → KEEP

ABSOLUTELY FORBIDDEN:
✗ Flat stomach
✗ Thin waist
✗ Slim arms
✗ Narrow shoulders
✗ Model-like proportions
✗ Any slimming whatsoever

The garment ADAPTS to the plus-size body.
The body NEVER adapts to the garment.`

// ═══════════════════════════════════════════════════════════════
// FACE-BODY COHERENCE ENFORCEMENT
// ═══════════════════════════════════════════════════════════════

export const FACE_BODY_COHERENCE_ENFORCEMENT = `[FACE-BODY COHERENCE — FINAL CHECK]

Before finalizing the image, perform this coherence check:

COHERENCE RULE #1: NECK MATCH
• The neck thickness in the output MUST match Image 1
• Wide face → Wide neck → Broad body

COHERENCE RULE #2: JAW-SHOULDER MATCH
• Jaw width in face MUST correlate with shoulder width
• Wide jaw → Broad shoulders

COHERENCE RULE #3: CHEEK-TORSO MATCH
• Full cheeks → Full torso
• Hollow cheeks → Lean torso

COHERENCE RULE #4: CHIN-BELLY MATCH
• Double chin or rounded chin → Body has weight
• Sharp chin → Leaner body

═══════════════════════════════════════════════════════════
INCOHERENCE = GENERATION FAILED
═══════════════════════════════════════════════════════════

If any of these are true, REGENERATE:
□ Full face + slim body
□ Wide neck + narrow shoulders
□ Round cheeks + flat stomach
□ Double chin + athletic torso

The face and body MUST belong to the SAME person.`

// ═══════════════════════════════════════════════════════════════
// EYE PRESERVATION CONSTRAINTS
// ═══════════════════════════════════════════════════════════════

export const EYE_PRESERVATION_CONFIG = {
    widthTolerance: 0.02,      // 2% max variance
    heightTolerance: 0.02,     // 2% max variance
    distanceTolerance: 0.02,   // 2% max variance (interpupillary)
    shapeTolerance: 0.01       // 1% max shape change
}

export const EYE_PRESERVATION_PROMPT = `[EYE PRESERVATION — CRITICAL]

Eyes are the PRIMARY identity anchor.
Eyes shrinking or changing = GENERATION FAILED.

EYE CONSTRAINTS:
- Eye width: MUST match Image 1 (±2% max)
- Eye height: MUST match Image 1 (±2% max)
- Eye distance: MUST match Image 1 (±2% max)
- Eye shape: MUST match Image 1 (no elongation/rounding)
- Eyelid position: MUST match Image 1
- Eye corners: MUST match Image 1

FORBIDDEN EYE OPERATIONS:
- Eye enlargement
- Eye reduction
- Eye spacing change
- Eyelid lift
- Eye shape modification
- Pupil size change
- Iris color change

If eye landmarks shift by > 2% → REJECT OUTPUT.`

// ═══════════════════════════════════════════════════════════════
// SCENE SPECIFICATION TYPE (STRUCTURAL, NOT TEXT)
// ═══════════════════════════════════════════════════════════════

export interface SceneSpecification {
    id: string
    location: string
    architecture: string[]
    furniture: string[]
    props: string[]
    depthLayers: {
        background: string
        midground: string
        foreground: string
    }
    camera: {
        lens: string
        angle: string
        distance: string
        handheld: boolean
    }
    lighting: {
        source: string
        direction: string
        softness: string
        colorTemperature: number
    }
    requiredElements: string[]  // At least 3 must appear
    forbiddenElements: string[]
}

// ═══════════════════════════════════════════════════════════════
// PRESET ENFORCEMENT CONFIG
// ═══════════════════════════════════════════════════════════════

export const PRESET_ENFORCEMENT_CONFIG = {
    minRequiredElements: 3,  // At least 3 preset-specific objects
    failOnMissing: true,     // Reject if elements missing
    logViolations: true      // Log ❌ for missing elements
}

// ═══════════════════════════════════════════════════════════════
// SCENE BUILD ORDER (MANDATORY)
// ═══════════════════════════════════════════════════════════════

export const SCENE_BUILD_ORDER = `[SCENE CONSTRUCTION ORDER — MANDATORY]

Build scene in this EXACT order:

STEP 1: BACKGROUND ARCHITECTURE
- Buildings, walls, sky
- Distant objects
- Environmental depth

STEP 2: MIDGROUND OBJECTS
- Furniture (tables, chairs)
- Street objects (posts, signs)
- People in background (blurred)

STEP 3: FOREGROUND SUBJECT
- Person from Image 1 (face frozen)
- Body with garment
- Contact shadows

STEP 4: LIGHTING PASS
- Face lighting = PRESERVED from Image 1
- Body lighting = MATCHED to scene
- Environment lighting = Scene-driven

STEP 5: FABRIC REALISM PASS
- Garment shadows
- Fabric folds
- Cloth physics

If any step modifies previous step → GENERATION FAILED.`

// ═══════════════════════════════════════════════════════════════
// PRESET REQUIRED ELEMENTS
// ═══════════════════════════════════════════════════════════════

export const PRESET_REQUIRED_ELEMENTS: Record<string, string[]> = {
    // Café presets
    'cafe_terrace': ['chairs', 'tables', 'cups', 'street_view'],
    'cafe_modern': ['counter', 'coffee_machine', 'menu_board'],
    'cafe_outdoor': ['umbrella', 'street', 'pedestrians'],

    // Street presets
    'urban_street': ['buildings', 'pavement', 'signs'],
    'street_tunnel': ['tunnel_walls', 'lights', 'graffiti'],
    'market_street': ['stalls', 'vendors', 'goods'],

    // Home presets
    'balcony': ['railing', 'plants', 'city_view'],
    'living_room': ['sofa', 'window', 'decor'],
    'terrace': ['furniture', 'plants', 'sky'],

    // Default
    'default': ['background', 'ground', 'lighting']
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function validateBodyGeometry(
    originalBody: { shoulderWidth: number; torsoWidth: number; armThickness: number },
    generatedBody: { shoulderWidth: number; torsoWidth: number; armThickness: number }
): { passed: boolean; violations: string[] } {
    const violations: string[] = []

    const shoulderDiff = Math.abs(originalBody.shoulderWidth - generatedBody.shoulderWidth) / originalBody.shoulderWidth
    if (shoulderDiff > BODY_LOCK_CONFIG.shoulderWidthTolerance) {
        violations.push(`Shoulder width changed by ${(shoulderDiff * 100).toFixed(1)}%`)
    }

    const torsoDiff = Math.abs(originalBody.torsoWidth - generatedBody.torsoWidth) / originalBody.torsoWidth
    if (torsoDiff > BODY_LOCK_CONFIG.torsoWidthTolerance) {
        violations.push(`Torso width changed by ${(torsoDiff * 100).toFixed(1)}%`)
    }

    const armDiff = Math.abs(originalBody.armThickness - generatedBody.armThickness) / originalBody.armThickness
    if (armDiff > BODY_LOCK_CONFIG.armThicknessTolerance) {
        violations.push(`Arm thickness changed by ${(armDiff * 100).toFixed(1)}%`)
    }

    return {
        passed: violations.length === 0,
        violations
    }
}

export function validateEyePreservation(
    originalEyes: { width: number; height: number; distance: number },
    generatedEyes: { width: number; height: number; distance: number }
): { passed: boolean; violations: string[] } {
    const violations: string[] = []

    const widthDiff = Math.abs(originalEyes.width - generatedEyes.width) / originalEyes.width
    if (widthDiff > EYE_PRESERVATION_CONFIG.widthTolerance) {
        violations.push(`Eye width changed by ${(widthDiff * 100).toFixed(1)}%`)
    }

    const heightDiff = Math.abs(originalEyes.height - generatedEyes.height) / originalEyes.height
    if (heightDiff > EYE_PRESERVATION_CONFIG.heightTolerance) {
        violations.push(`Eye height changed by ${(heightDiff * 100).toFixed(1)}%`)
    }

    const distDiff = Math.abs(originalEyes.distance - generatedEyes.distance) / originalEyes.distance
    if (distDiff > EYE_PRESERVATION_CONFIG.distanceTolerance) {
        violations.push(`Eye distance changed by ${(distDiff * 100).toFixed(1)}%`)
    }

    return {
        passed: violations.length === 0,
        violations
    }
}

export function validatePresetElements(
    presetId: string,
    detectedElements: string[]
): { passed: boolean; missing: string[]; found: string[] } {
    const required = PRESET_REQUIRED_ELEMENTS[presetId] || PRESET_REQUIRED_ELEMENTS['default']
    const found = required.filter(el => detectedElements.includes(el))
    const missing = required.filter(el => !detectedElements.includes(el))

    const passed = found.length >= PRESET_ENFORCEMENT_CONFIG.minRequiredElements

    if (!passed && PRESET_ENFORCEMENT_CONFIG.logViolations) {
        console.error(`❌ PRESET ENFORCEMENT FAILED: ${presetId}`)
        console.error(`   Required: ${required.join(', ')}`)
        console.error(`   Found: ${found.join(', ')}`)
        console.error(`   Missing: ${missing.join(', ')}`)
    }

    return { passed, missing, found }
}

// ═══════════════════════════════════════════════════════════════
// LOGGING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function logBodyLockStatus(sessionId: string): void {
    console.log(`\n📐 BODY GEOMETRY LOCK [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📌 Shoulder Width: LOCKED`)
    console.log(`   📌 Torso Width: LOCKED`)
    console.log(`   📌 Arm Thickness: LOCKED`)
    console.log(`   📌 Fat Distribution: LOCKED`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   ✏️ Garment Drape: GENERATE`)
    console.log(`   ✏️ Fabric Folds: GENERATE`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🚫 Body Slimming: FORBIDDEN`)
    console.log(`   🚫 Posture Correction: FORBIDDEN`)
}

export function logEyePreservationStatus(sessionId: string): void {
    console.log(`\n👁️ EYE PRESERVATION [${sessionId}]`)
    console.log(`   Tolerance: ±2%`)
    console.log(`   Width: LOCKED`)
    console.log(`   Height: LOCKED`)
    console.log(`   Distance: LOCKED`)
}

export function logSceneBuildOrder(presetId: string): void {
    console.log(`\n🏗️ SCENE BUILD ORDER [${presetId}]`)
    console.log(`   1. Background Architecture`)
    console.log(`   2. Midground Objects`)
    console.log(`   3. Foreground Subject`)
    console.log(`   4. Lighting Pass`)
    console.log(`   5. Fabric Realism Pass`)
}
