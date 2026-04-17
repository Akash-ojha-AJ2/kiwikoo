/**
 * BACKGROUND PRESERVATION & PHYSICS REALISM
 * 
 * Prevents scene hallucination and ensures realistic body physics.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// BACKGROUND PRESERVATION — KEEP ORIGINAL SCENE
// ═══════════════════════════════════════════════════════════════

export const BACKGROUND_PRESERVATION = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌍 BACKGROUND PRESERVATION — KEEP THE ORIGINAL SCENE                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ DO NOT CHANGE THE BACKGROUND ★★★

The background in Image 1 is the CORRECT background. Do NOT replace it.

═══════════════════════════════════════════════════════════════════════════════
SCENE PRESERVATION RULES
═══════════════════════════════════════════════════════════════════════════════

1. LOCATION
   • If Image 1 shows a BEACH → Output must show a BEACH
   • If Image 1 shows a CITY → Output must show a CITY
   • If Image 1 shows INDOORS → Output must show INDOORS
   • If Image 1 shows a PARK → Output must show a PARK
   
   DO NOT CHANGE THE LOCATION TYPE.

2. SPECIFIC ELEMENTS
   • If Image 1 has OCEAN WAVES → Keep ocean waves
   • If Image 1 has TREES → Keep trees
   • If Image 1 has BUILDINGS → Keep buildings
   • If Image 1 has SKY → Keep similar sky
   
   Preserve the ESSENCE of the original background.

3. TIME OF DAY
   • If Image 1 is during GOLDEN HOUR → Keep golden hour
   • If Image 1 is MIDDAY → Keep midday lighting
   • If Image 1 is OVERCAST → Keep overcast
   
   DO NOT CHANGE THE TIME OF DAY.

4. WEATHER
   • If Image 1 is SUNNY → Keep sunny
   • If Image 1 is CLOUDY → Keep cloudy
   • If Image 1 shows RAIN → Keep rain indication
   
   DO NOT CHANGE THE WEATHER.

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN BACKGROUND CHANGES
═══════════════════════════════════════════════════════════════════════════════

✗ Beach → Concrete/Urban (FORBIDDEN)
✗ Outdoor → Indoor (FORBIDDEN)
✗ Nature → Studio (FORBIDDEN)
✗ Street → Office (FORBIDDEN)
✗ Park → Cafe (FORBIDDEN)
✗ Sunny → Night (FORBIDDEN)
✗ Any location change (FORBIDDEN)

THE USER WANTS TO SEE HOW THEY LOOK IN THAT GARMENT *IN THAT LOCATION*.
NOT IN A DIFFERENT LOCATION.
`

// ═══════════════════════════════════════════════════════════════
// PHYSICS REALISM — NATURAL BODY BEHAVIOR
// ═══════════════════════════════════════════════════════════════

export const PHYSICS_REALISM = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  ⚖️ PHYSICS REALISM — NATURAL BODY BEHAVIOR                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

★★★ THE BODY MUST FOLLOW PHYSICS ★★★

═══════════════════════════════════════════════════════════════════════════════
POSE NATURALNESS
═══════════════════════════════════════════════════════════════════════════════

NATURAL POSE INDICATORS:
• Slight asymmetry (not perfectly symmetrical)
• Weight distribution on one leg more than other
• Relaxed shoulders (not tensed up)
• Natural arm hang (slightly bent, not straight)
• Head tilt matching original
• Hands relaxed (not stiff)

STIFF POSE INDICATORS (AVOID):
✗ Perfect symmetry (mannequin look)
✗ Arms straight down like a robot
✗ Shoulders tensed/raised
✗ Head perfectly centered
✗ Standing at military attention
✗ Hands flat against body

═══════════════════════════════════════════════════════════════════════════════
GRAVITY & FABRIC PHYSICS
═══════════════════════════════════════════════════════════════════════════════

FABRIC BEHAVIOR:
• Fabric hangs DOWN (gravity)
• Fabric wrinkles at joints (elbows, waist)
• Fabric drapes over curves naturally
• Fabric has weight (heavier = fewer folds, lighter = more folds)
• Loose fabric creates natural folds
• Tight fabric shows body contour

GRAVITY RULES:
• Nothing floats
• Hair falls down (unless wind)
• Jewelry hangs down
• Fabric hemlines are level (unless movement)
• Loose ends fall toward ground

═══════════════════════════════════════════════════════════════════════════════
BODY PROPORTIONS
═══════════════════════════════════════════════════════════════════════════════

MUST MATCH IMAGE 1:
• Head-to-body ratio → SAME
• Shoulder width → SAME
• Arm length → SAME
• Torso length → SAME
• Leg length → SAME
• Overall height → SAME

FORBIDDEN CHANGES:
✗ Body slimmer than original
✗ Body taller than original
✗ Limbs longer/shorter than original
✗ Proportions "idealized"
✗ Any body modification

═══════════════════════════════════════════════════════════════════════════════
GROUND CONTACT
═══════════════════════════════════════════════════════════════════════════════

• Feet must touch the ground (not floating)
• Cast shadow must exist under feet
• Weight must appear on ground
• Ground plane must be consistent with background
• If beach → sand ground
• If street → pavement ground

═══════════════════════════════════════════════════════════════════════════════
ENVIRONMENTAL INTERACTION
═══════════════════════════════════════════════════════════════════════════════

• Wind affects hair and loose fabric consistently
• Light comes from consistent direction
• Shadows match the environment
• Reflections if on wet surface
• Subject fits scale of environment
`

// ═══════════════════════════════════════════════════════════════
// COMBINED PROMPT
// ═══════════════════════════════════════════════════════════════

export function getBackgroundPhysicsPrompt(): string {
    return `
${BACKGROUND_PRESERVATION}

${PHYSICS_REALISM}

════════════════════════════════════════════════════════════════════════════════
SCENE & BODY MANDATE
════════════════════════════════════════════════════════════════════════════════

1. KEEP THE ORIGINAL BACKGROUND from Image 1
   • Same location type (beach = beach, city = city)
   • Same time of day
   • Same weather/atmosphere

2. BODY PHYSICS MUST BE NATURAL
   • No stiff mannequin poses
   • Fabric drapes with gravity
   • Proportions match Image 1

3. PERSON MUST FIT THE ENVIRONMENT
   • Correct scale
   • Proper ground contact
   • Appropriate shadows

IF THE BACKGROUND TYPE CHANGES → GENERATION FAILED.
IF THE BODY LOOKS STIFF/UNNATURAL → GENERATION FAILED.
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logBackgroundPhysicsStatus(sessionId: string): void {
    console.log(`\n🌍 BACKGROUND & PHYSICS [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🏖️ Background: PRESERVE ORIGINAL`)
    console.log(`   ⚖️ Physics: NATURAL BODY`)
    console.log(`   👣 Ground: PROPER CONTACT`)
}
