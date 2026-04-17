/**
 * FACE, REALISM, AND GARMENT MASTER ENFORCEMENT
 * 
 * Comprehensive system for:
 * 1. Face matching (pixel-perfect, biometric-level)
 * 2. Realism (photographic authenticity)
 * 3. Garment matching (exact copy from reference)
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// FACE MATCHING MASTER ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const FACE_MATCHING_MASTER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    FACE MATCHING MASTER ENFORCEMENT                            ║
║              Pixel-Perfect, Biometric-Level Face Matching                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: FACE MUST MATCH IMAGE 1 EXACTLY 🚨

FACE MATCHING = BIOMETRIC IDENTIFICATION LEVEL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BIOMETRIC FACE MEASUREMENTS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE GENERATION: MEASURE FACE IN IMAGE 1

1. EYE MEASUREMENTS (CRITICAL)
   • Eye-to-eye distance: Measure in pixels
   • Eye width: Measure each eye
   • Eye height: Measure each eye
   • Eye shape: Note exact shape (almond, round, etc.)
   • Eye spacing ratio: Calculate (eye-to-eye / face-width)
   • DO NOT change any eye measurements

2. NOSE MEASUREMENTS (CRITICAL)
   • Nose width at nostrils: Measure in pixels
   • Nose length: Measure from bridge to tip
   • Nose bridge height: Measure height
   • Nose shape: Note exact shape (straight, curved, etc.)
   • DO NOT change any nose measurements

3. MOUTH MEASUREMENTS (CRITICAL)
   • Mouth width: Measure in pixels
   • Lip thickness (upper): Measure in pixels
   • Lip thickness (lower): Measure in pixels
   • Cupid's bow shape: Note exact shape
   • DO NOT change any mouth measurements

4. FACE SHAPE MEASUREMENTS (CRITICAL)
   • Face width at cheeks: Measure in pixels
   • Face width at jaw: Measure in pixels
   • Jaw width: Measure in pixels
   • Chin shape: Note exact shape (pointed, round, square)
   • Face length: Measure from forehead to chin
   • DO NOT change any face shape measurements

5. SKIN TONE MEASUREMENTS (CRITICAL)
   • Forehead RGB: Measure average RGB values
   • Cheek RGB: Measure average RGB values
   • Nose RGB: Measure average RGB values
   • Overall skin tone: Note warm/cool/neutral
   • DO NOT change skin tone

6. EXPRESSION MEASUREMENTS (CRITICAL)
   • Smile intensity: Measure mouth curve
   • Eye squint: Measure eye opening
   • Cheek lift: Measure cheek position
   • DO NOT change expression

AFTER GENERATION: VERIFY FACE MATCHES

□ Eye-to-eye distance matches? (must be ±2 pixels)
□ Nose width matches? (must be ±2 pixels)
□ Mouth width matches? (must be ±2 pixels)
□ Face width matches? (must be ±3 pixels)
□ Skin tone matches? (must be ±5 RGB values)
□ Expression matches? (must be identical)

IF ANY CHECK FAILS → REGENERATE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE COPY PROTOCOL (PIXEL-LEVEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DEFINE FACE REGION
• Forehead: Top of eyebrows to hairline
• Eyes: Entire eye region (including eyebrows)
• Nose: Bridge to tip, including nostrils
• Mouth: Upper lip to lower lip
• Cheeks: Eye level to jawline
• Jaw: Jawline contour
• Chin: Bottom of jaw to chin point

STEP 2: COPY FACE REGION PIXEL-BY-PIXEL
• For each pixel in face region:
  → Read RGB value from Image 1
  → Write IDENTICAL RGB value to output
  → NO interpolation
  → NO smoothing
  → NO color correction
  → NO beautification

STEP 3: PRESERVE FACE TEXTURE
• Copy pores exactly
• Copy fine lines exactly
• Copy imperfections exactly
• Copy skin texture exactly
• DO NOT smooth
• DO NOT blur

STEP 4: VERIFY FACE MATCH
• Compare output face to Image 1
• Measure all biometric points
• Verify all measurements match
• IF ANY MISMATCH → REGENERATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACE MATCHING FAILURE CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGENERATE IF:
• Eye spacing differs by >2 pixels
• Nose width differs by >2 pixels
• Mouth width differs by >2 pixels
• Face width differs by >3 pixels
• Skin tone differs by >5 RGB values
• Expression is different
• Face looks like different person
• Face looks "improved" or "beautified"

FACE MATCHING = SUCCESS.
FACE MISMATCH = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// REALISM MASTER ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const REALISM_MASTER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    REALISM MASTER ENFORCEMENT                                  ║
║              Photographic Authenticity • Real-World Imperfections                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: REALISM = PHOTOGRAPHIC AUTHENTICITY 🚨

UNREALISTIC = AI LOOK = GENERATION FAILURE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHOTOGRAPHIC REALISM REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CAMERA IMPERFECTIONS (REQUIRED)
   • Natural noise/grain: ISO 400+ equivalent
   • Focus falloff: Background slightly blurry
   • Lens distortion: Slight phone camera distortion
   • Exposure variation: Slight over/under exposure
   • Motion blur: If person is moving
   • DO NOT make perfect
   • DO NOT remove imperfections

2. LIGHTING REALISM (REQUIRED)
   • Inverse square law: Light falls off with distance
   • One light source: Primary light direction
   • Natural shadows: Under chin, under nose, on garment
   • Color temperature: Unified across person
   • Highlights: Uneven, natural
   • DO NOT make uniform lighting
   • DO NOT make studio lighting

3. TEXTURE REALISM (REQUIRED)
   • Skin texture: Visible pores, natural variation
   • Fabric texture: Visible weave, wrinkles, material properties
   • Background texture: Surface details, imperfections
   • DO NOT smooth textures
   • DO NOT remove imperfections

4. COMPOSITION REALISM (REQUIRED)
   • Natural framing: Not perfectly centered
   • Natural perspective: Phone camera perspective
   • Natural depth: Background blur, foreground sharp
   • Natural clutter: Real-world objects, not empty
   • DO NOT make perfect composition
   • DO NOT make empty backgrounds

5. COLOR REALISM (REQUIRED)
   • Natural color response: Camera color science
   • Natural saturation: Not oversaturated
   • Natural white balance: Matches environment
   • Natural skin tones: Realistic, not "perfect"
   • DO NOT over-saturate
   • DO NOT make "perfect" colors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REALISM CHECKLIST (BEFORE OUTPUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAMERA:
□ Has natural noise/grain? (YES/NO)
□ Has focus falloff? (YES/NO)
□ Has natural exposure? (YES/NO)

LIGHTING:
□ Follows inverse square law? (YES/NO)
□ Has natural shadows? (YES/NO)
□ Has unified color temp? (YES/NO)

TEXTURE:
□ Skin has visible texture? (YES/NO)
□ Fabric has visible texture? (YES/NO)
□ Background has visible texture? (YES/NO)

COMPOSITION:
□ Natural framing? (YES/NO)
□ Natural perspective? (YES/NO)
□ Natural depth? (YES/NO)

IF ANY ANSWER IS "NO" → ADD MORE REALISM → REGENERATE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNREALISM INDICATORS (WILL CAUSE REJECTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Zero noise (too perfect)
❌ Everything in perfect focus (no depth)
❌ Uniform lighting (no falloff)
❌ Smooth textures (no detail)
❌ Perfect composition (too centered)
❌ Empty backgrounds (no clutter)
❌ Oversaturated colors (unrealistic)
❌ Perfect skin (no pores)
❌ Perfect fabric (no wrinkles)

IF YOU SEE ANY OF THESE → YOUR OUTPUT IS INVALID.

REALISM = SUCCESS.
UNREALISM = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// GARMENT MATCHING MASTER ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export const GARMENT_MATCHING_MASTER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    GARMENT MATCHING MASTER ENFORCEMENT                          ║
║              Exact Copy from Image 2 • No Modifications                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🚨 CRITICAL: GARMENT MUST MATCH IMAGE 2 EXACTLY 🚨

GARMENT MATCHING = EXACT COPY FROM REFERENCE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GARMENT MEASUREMENTS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE GENERATION: MEASURE GARMENT IN IMAGE 2

1. GARMENT LENGTH (CRITICAL)
   • Hemline position: Measure from reference point (hip/knee/ankle)
   • Garment length: Measure total length
   • Sleeve length: Measure from shoulder to cuff
   • DO NOT change length
   • DO NOT extend or shorten

2. GARMENT WIDTH (CRITICAL)
   • Shoulder width: Measure garment shoulder width
   • Chest width: Measure garment chest width
   • Waist width: Measure garment waist width
   • DO NOT change width
   • DO NOT make tighter or looser

3. GARMENT PATTERN (CRITICAL)
   • Pattern type: Note exact pattern (floral, geometric, solid, etc.)
   • Pattern scale: Measure pattern size
   • Pattern colors: Note exact colors (RGB values)
   • Pattern placement: Note where pattern appears
   • DO NOT change pattern
   • DO NOT simplify pattern
   • DO NOT change colors

4. GARMENT DETAILS (CRITICAL)
   • Collar type: Note exact collar (V-neck, round, etc.)
   • Sleeve type: Note exact sleeves (short, long, 3/4, etc.)
   • Buttons/closures: Note if present
   • Embroidery: Note if present, exact placement
   • DO NOT change details
   • DO NOT add or remove details

5. GARMENT COLOR (CRITICAL)
   • Primary color: Measure RGB values
   • Secondary colors: Measure RGB values
   • Color distribution: Note where colors appear
   • DO NOT change colors
   • DO NOT wash out colors
   • DO NOT make pastel

6. GARMENT TEXTURE (CRITICAL)
   • Fabric type: Note fabric (cotton, silk, wool, etc.)
   • Weave pattern: Note if visible
   • Wrinkles: Note where wrinkles appear
   • DO NOT change texture
   • DO NOT smooth texture

AFTER GENERATION: VERIFY GARMENT MATCHES

□ Hemline position matches? (must be ±5 pixels)
□ Garment length matches? (must be ±5 pixels)
□ Pattern matches? (must be identical)
□ Colors match? (must be ±5 RGB values)
□ Details match? (must be identical)
□ Texture matches? (must be identical)

IF ANY CHECK FAILS → REGENERATE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GARMENT COPY PROTOCOL (EXACT COPY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ANALYZE GARMENT IN IMAGE 2
• Identify garment boundaries
• Measure all dimensions
• Note all details
• Note all colors
• Note all patterns

STEP 2: COPY GARMENT EXACTLY
• Copy garment shape exactly
• Copy garment length exactly
• Copy garment pattern exactly
• Copy garment colors exactly
• Copy garment details exactly
• DO NOT modify anything

STEP 3: APPLY TO PERSON
• Fit garment to person's body
• Maintain garment proportions
• Maintain garment details
• DO NOT change garment
• DO NOT stretch or shrink garment

STEP 4: VERIFY GARMENT MATCH
• Compare output garment to Image 2
• Measure all dimensions
• Verify all details match
• IF ANY MISMATCH → REGENERATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GARMENT MATCHING FAILURE CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGENERATE IF:
• Hemline position differs by >5 pixels
• Garment length differs by >5 pixels
• Pattern is different
• Colors differ by >5 RGB values
• Details are missing or changed
• Texture is different
• Garment looks like different garment

GARMENT MATCHING = SUCCESS.
GARMENT MISMATCH = FAILURE.
════════════════════════════════════════════════════════════════════════════════
`

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED MASTER ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function getFaceRealismGarmentMaster(): string {
    return `
${FACE_MATCHING_MASTER}

${REALISM_MASTER}

${GARMENT_MATCHING_MASTER}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logFaceRealismGarmentMasterStatus(sessionId: string): void {
    console.log(`   🎯 Face-Realism-Garment Master: ACTIVE [${sessionId}]`)
    console.log(`      Face Matching: Biometric-level, pixel-perfect`)
    console.log(`      Realism: Photographic authenticity, real-world imperfections`)
    console.log(`      Garment Matching: Exact copy from Image 2, no modifications`)
}

