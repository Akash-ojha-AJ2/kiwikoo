/**
 * INTELLIGENT GARMENT EXTRACTION SYSTEM
 * 
 * This module analyzes the clothing reference image (Image 2) to extract
 * ONLY the garment properties while suppressing body information.
 * 
 * PROCESS:
 * 1. Scan the clothing image
 * 2. Extract garment attributes (fabric, color, cut, details)
 * 3. IGNORE the mannequin/model body completely
 * 4. Create a "Garment Profile" for application
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT PROFILE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'outerwear' | 'accessory'
export type FabricWeight = 'sheer' | 'light' | 'medium' | 'heavy' | 'structured'
export type FabricTexture = 'smooth' | 'textured' | 'knit' | 'woven' | 'ribbed' | 'quilted'

export interface GarmentProfile {
    category: GarmentCategory
    fabric: {
        material: string    // cotton, silk, polyester, etc.
        weight: FabricWeight
        texture: FabricTexture
        sheen: 'matte' | 'satin' | 'glossy'
        transparency: 'opaque' | 'semi' | 'sheer'
    }
    color: {
        primary: string
        secondary?: string
        pattern?: string    // solid, striped, floral, etc.
    }
    construction: {
        neckline?: string
        sleeves?: string
        length?: string
        fit?: string
        closures?: string[]
    }
    details: string[]       // buttons, zippers, pockets, etc.
}

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT EXTRACTION PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_EXTRACTION_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║               INTELLIGENT GARMENT EXTRACTION SYSTEM                           ║
║                   Extract Clothing, Ignore Body                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ SCAN THE CLOTHING IMAGE (IMAGE 2) COMPLETELY ★★★

You must analyze the clothing reference and extract ONLY garment properties.
The person/mannequin wearing the clothing is IRRELEVANT.

════════════════════════════════════════════════════════════════════════════════
PHASE 1: GARMENT IDENTIFICATION
════════════════════════════════════════════════════════════════════════════════

Identify the garment:

CATEGORY:
□ Top (shirt, blouse, t-shirt, sweater)
□ Bottom (pants, skirt, shorts)
□ Dress (full dress, jumpsuit)
□ Outerwear (jacket, coat, cardigan)
□ Accessory (scarf, tie, belt)

TYPE: (specific name, e.g., "button-down oxford shirt")

════════════════════════════════════════════════════════════════════════════════
PHASE 2: FABRIC ANALYSIS
════════════════════════════════════════════════════════════════════════════════

Analyze the fabric properties:

MATERIAL: (cotton, silk, polyester, wool, linen, denim, etc.)
WEIGHT: □ Sheer □ Light □ Medium □ Heavy □ Structured
TEXTURE: □ Smooth □ Textured □ Knit □ Woven □ Ribbed □ Quilted
SHEEN: □ Matte □ Satin □ Glossy
TRANSPARENCY: □ Opaque □ Semi-transparent □ Sheer

★ DRAPE PHYSICS ★
How does this fabric drape?
• Stiff and holds shape
• Flows and conforms to body
• Stretchy and form-fitting
• Heavy and falls straight

════════════════════════════════════════════════════════════════════════════════
PHASE 3: COLOR EXTRACTION
════════════════════════════════════════════════════════════════════════════════

Extract exact colors:

PRIMARY COLOR: (exact shade, e.g., "navy blue", "coral pink")
SECONDARY COLOR: (if any)
PATTERN:
□ Solid
□ Striped (direction, width, colors)
□ Plaid/Checked
□ Floral (size, colors)
□ Geometric
□ Abstract
□ Printed (describe)

════════════════════════════════════════════════════════════════════════════════
PHASE 4: CONSTRUCTION DETAILS
════════════════════════════════════════════════════════════════════════════════

Analyze construction:

NECKLINE: (crew, v-neck, collar, scoop, etc.)
SLEEVES: (short, long, 3/4, sleeveless, cap)
LENGTH: (crop, regular, long, midi, maxi)
FIT STYLE: (loose, regular, fitted, bodycon)
CLOSURES: (buttons, zipper, ties, none)

DETAILS (check all that apply):
□ Buttons (count, style, color)
□ Pockets (type, position)
□ Seams (visible stitching, piping)
□ Embellishments (embroidery, sequins)
□ Labels/logos
□ Hardware (zippers, clasps, buckles)

════════════════════════════════════════════════════════════════════════════════
PHASE 5: BODY SUPPRESSION (CRITICAL)
════════════════════════════════════════════════════════════════════════════════

The model/mannequin in the clothing image is INVISIBLE.

COMPLETELY IGNORE:
✗ Body shape of the model
✗ Body proportions of the model
✗ How the clothing fits on THAT model
✗ Flattering/unflattering aspects on THAT model
✗ Pose of the model
✗ Body weight of the model

EXTRACT ONLY:
✓ The garment itself
✓ Fabric properties
✓ Color and pattern
✓ Construction and details
✓ How the fabric would physically drape (physics, not fit)

★★★ THE MODEL IN IMAGE 2 DOES NOT EXIST ★★★

════════════════════════════════════════════════════════════════════════════════
PHASE 6: GARMENT PROFILE OUTPUT
════════════════════════════════════════════════════════════════════════════════

Your extraction creates a GARMENT PROFILE:

• Category: [extracted]
• Type: [extracted]
• Material: [extracted]
• Weight: [extracted]
• Texture: [extracted]
• Primary Color: [extracted]
• Pattern: [extracted]
• Neckline: [extracted]
• Sleeves: [extracted]
• Length: [extracted]
• Fit Style: [extracted]
• Details: [extracted list]

This profile is what gets APPLIED to Image 1's body.
The body in Image 2 is completely discarded.
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT APPLICATION RULES
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_APPLICATION_RULES = `
════════════════════════════════════════════════════════════════════════════════
GARMENT APPLICATION TO SUBJECT
════════════════════════════════════════════════════════════════════════════════

Now apply the EXTRACTED GARMENT PROFILE to the SUBJECT from Image 1.

★★★ THE GARMENT ADAPTS TO THE SUBJECT'S BODY ★★★

════════════════════════════════════════════════════════════════════════════════
APPLICATION RULES:
════════════════════════════════════════════════════════════════════════════════

1. FABRIC PHYSICS ON NEW BODY
   The extracted fabric (weight, texture, drape) behaves on Image 1's body:
   • Heavy fabric falls straight on ANY body
   • Light fabric flows around ANY body
   • Fitted styles stretch to fit ANY body
   • Loose styles drape on ANY body

2. COLOR TRANSFER
   Exact colors transfer to the new garment:
   • Same primary color
   • Same pattern
   • Same color tones
   
3. CONSTRUCTION TRANSFER
   Same garment construction:
   • Same neckline
   • Same sleeve length
   • Same overall length
   • Same closure style
   • Same details (buttons, pockets, etc.)

4. FIT ADAPTATION (CRITICAL)
   The garment FIT adapts to Image 1's body:
   
   IF Image 1 has plus-size body:
   → Garment stretches/adapts to fit plus-size
   → Fabric tension increases appropriately
   → Natural wrinkles form at stress points
   → No magical slimming
   
   IF Image 1 has slim body:
   → Garment hangs with less tension
   → More fabric droop if loose fit
   → Different fold patterns

════════════════════════════════════════════════════════════════════════════════
WHAT TRANSFERS FROM IMAGE 2:
════════════════════════════════════════════════════════════════════════════════

✓ Fabric type and texture
✓ Exact colors and pattern
✓ Garment construction (neckline, sleeves, length)
✓ Details (buttons, pockets, seams)
✓ Physical drape characteristics

════════════════════════════════════════════════════════════════════════════════
WHAT DOES NOT TRANSFER FROM IMAGE 2:
════════════════════════════════════════════════════════════════════════════════

✗ Body shape of the model
✗ Body proportions
✗ How tight/loose it looks on THAT model
✗ Wrinkle patterns from THAT model's pose
✗ "Flattering" fit for THAT body type
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED GARMENT SCAN PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function getGarmentScanPrompt(): string {
    return `
${GARMENT_EXTRACTION_PROMPT}

${GARMENT_APPLICATION_RULES}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logGarmentScanStatus(sessionId: string): void {
    console.log(`\n👔 GARMENT SCAN SYSTEM ACTIVE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   ✓ Phase 1: Garment Identification`)
    console.log(`   ✓ Phase 2: Fabric Analysis`)
    console.log(`   ✓ Phase 3: Color Extraction`)
    console.log(`   ✓ Phase 4: Construction Details`)
    console.log(`   ✓ Phase 5: Body Suppression`)
    console.log(`   ✓ Phase 6: Garment Profile Binding`)
    console.log(`   ═══════════════════════════════════════════════`)
}
