/**
 * VISIBLE ISSUES FIX MODULE
 * 
 * Targets the most common visible issues in generated images:
 * 1. Background/scene changes
 * 2. Pose changes
 * 3. Missing accessories
 * 4. Hands and arm positions
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// POSE LOCK — EXACT BODY POSITION
// ═══════════════════════════════════════════════════════════════

export const POSE_LOCK = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🧍 POSE LOCK — COPY EXACT BODY POSITION                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

Copy the EXACT pose from Image 1:

ARMS:
□ Left arm position → COPY EXACTLY
□ Right arm position → COPY EXACTLY
□ If arm is raised → Keep it raised
□ If arm is bent → Keep it bent
□ If hand is on face/phone → Keep hand there

HANDS:
□ Hand position → COPY EXACTLY
□ What hands are doing → COPY EXACTLY
□ If holding phone → Keep holding phone
□ If touching hair → Keep touching hair

LEGS:
□ Leg stance → COPY EXACTLY
□ Weight distribution → COPY EXACTLY
□ Standing/sitting → COPY EXACTLY

HEAD:
□ Head tilt → COPY EXACTLY
□ Direction looking → COPY EXACTLY
□ Expression → COPY EXACTLY

FORBIDDEN POSE CHANGES:
✗ Arms down when they were up
✗ Standing still when in motion
✗ Hands visible when they were hidden
✗ Different stance
✗ Different weight distribution
`

// ═══════════════════════════════════════════════════════════════
// ACCESSORY PRESERVATION — KEEP WHAT THEY'RE WEARING
// ═══════════════════════════════════════════════════════════════

export const ACCESSORY_PRESERVATION = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  👜 ACCESSORY PRESERVATION — KEEP ALL ACCESSORIES                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Copy ALL accessories from Image 1:

BAGS:
□ Purse/handbag → KEEP
□ Crossbody bag → KEEP
□ Backpack → KEEP
□ Bag position (shoulder, hand) → COPY EXACTLY

JEWELRY:
□ Earrings → KEEP
□ Necklace → KEEP
□ Bracelet → KEEP
□ Rings → KEEP
□ Watch → KEEP

EYEWEAR:
□ Glasses → KEEP
□ Sunglasses → KEEP

HEAD:
□ Hat → KEEP
□ Hair accessories → KEEP
□ Scarf on head → KEEP

OTHER:
□ Phone in hand → KEEP
□ Any item being held → KEEP
□ Bindi/tikka → KEEP

DO NOT REMOVE ANY ACCESSORY.
If Image 1 has a white crossbody bag, the output MUST have a white crossbody bag.
`

// ═══════════════════════════════════════════════════════════════
// BACKGROUND TYPE LOCK — SAME LOCATION TYPE
// ═══════════════════════════════════════════════════════════════

export const BACKGROUND_TYPE_LOCK = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  🏙️ BACKGROUND TYPE LOCK — SAME LOCATION TYPE                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

Identify the location type in Image 1 and KEEP IT:

OUTDOOR:
• Street/sidewalk → OUTPUT: Street/sidewalk
• Park → OUTPUT: Park
• Beach → OUTPUT: Beach
• City → OUTPUT: City
• Mall exterior → OUTPUT: Mall exterior

INDOOR:
• Living room → OUTPUT: Living room
• Office → OUTPUT: Office
• Temple → OUTPUT: Temple
• Restaurant interior → OUTPUT: Restaurant interior
• Metro station → OUTPUT: Metro station

KEEP THE SAME:
• Time of day (day/night)
• Weather (sunny/cloudy)
• Urban/rural setting
• Colors and atmosphere

FORBIDDEN CHANGES:
✗ Outdoor → Indoor
✗ Street → Metro station
✗ Beach → Café
✗ Park → Office
✗ Any location type change

THE USER TOOK THEIR PHOTO IN THAT LOCATION.
THEY WANT TO SEE THEMSELVES *IN THAT LOCATION* WITH NEW CLOTHES.
NOT IN A RANDOM DIFFERENT LOCATION.
`

// ═══════════════════════════════════════════════════════════════
// COMBINED FIX
// ═══════════════════════════════════════════════════════════════

export function getVisibleIssuesFixPrompt(): string {
    return `
${POSE_LOCK}

${ACCESSORY_PRESERVATION}

${BACKGROUND_TYPE_LOCK}

════════════════════════════════════════════════════════════════════════════════
VISIBLE ISSUES CHECKLIST
════════════════════════════════════════════════════════════════════════════════

Before outputting, verify:
□ Pose is EXACTLY the same as Image 1
□ All accessories are present
□ Background is the SAME location type
□ Hands are in the same position
□ Bag/purse is where it was

IF ANY ITEM IS MISSING OR CHANGED → GENERATION FAILED
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logVisibleIssuesFix(sessionId: string): void {
    console.log(`\n🔧 VISIBLE ISSUES FIX [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🧍 Pose: EXACT COPY`)
    console.log(`   👜 Accessories: PRESERVE ALL`)
    console.log(`   🏙️ Background: SAME TYPE`)
}
