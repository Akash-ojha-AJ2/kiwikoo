/**
 * VARIANT QUALITY BASELINE
 * 
 * CRITICAL: All 3 variants must match Option 2's quality
 * Variants should differ ONLY in lighting/environment, NOT quality
 */

import 'server-only'

export const QUALITY_BASELINE = `
═══════════════════════════════════════════════════════════════
QUALITY BASELINE (ALL VARIANTS MUST MEET THIS STANDARD)
═══════════════════════════════════════════════════════════════

⚠️  CRITICAL: User feedback shows Option 2 consistently best quality.
All 3 variants MUST match Option 2's quality level.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 2 SUCCESS CHARACTERISTICS (APPLY TO ALL VARIANTS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1. CONTRAST (NOT FLAT)**
✓ True blacks in deep shadows
✓ Bright highlights where light hits
✓ Rich midtone separation
✓ Dynamic range visible
✗ AVOID: Flat, even tones (Option 1 mistake)

**2. TEXTURE & DETAIL**
✓ Visible skin pores and texture
✓ Garment fabric texture visible (weave, knit pattern)
✓ Subtle ISO 400-800 grain
✓ Hair detail (individual strands)
✗ AVOID: AI-smooth, plastic look

**3. LIGHTING PHYSICS**
✓ Inverse square law applied (face bright → chest darker → background darker)
✓ Natural light fall-off with distance
✓ Visible shadow direction (not ambient)
✓ 2:1 to 4:1 key:fill ratio (NOT 1:1 flat)
✗ AVOID: Even lighting everywhere

**4. DEPTH & DIMENSION**
✓ 3D look (not 2D flat)
✓ Separation from background
✓ Atmospheric perspective (background softer/hazier)
✓ Contact shadows where subject touches environment
✗ AVOID: Flat, cardboard cutout look

**5. CINEMATIC GRADING**
✓ S-curve applied (lifted blacks, rolled highlights)
✓ Color density (rich, not flat)
✓ Slight color separation (warm highlights, cool shadows)
✓ Film-like quality
✗ AVOID: Digital video flatness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT SHOULD DIFFER BETWEEN VARIANTS (ONLY THESE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Variant 1 (Editorial - Clean):**
- Lighting: Soft, diffused (2:1 ratio)
- Environment: Clean, minimal background
- Color temp: Neutral 5,500K
- Mood: Professional, approachable
- BUT: Same texture, contrast, depth as Option 2

**Variant 2 (Candid - Natural):**
- Lighting: Natural sunlight (3:1 ratio)
- Environment: Realistic outdoor/indoor
- Color temp: Warm 4,000K or cool 6,000K depending on scene
- Mood: Natural, authentic
- BUT: Same texture, contrast, depth as Option 2

**Variant 3 (Environmental - Dramatic):**
- Lighting: Dramatic directional (4:1 ratio)
- Environment: Interesting background (architecture, nature)
- Color temp: Creative (golden hour 3,000K or blue hour 7,000K)
- Mood: Cinematic, striking
- BUT: Same texture, contrast, depth as Option 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY CHECKLIST (ALL VARIANTS MUST PASS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before outputting EACH variant, verify:

□ Contrast: True blacks and bright highlights present?
□ Texture: Skin pores visible? Garment texture visible?
□ Grain: Subtle ISO 400-800 grain present?
□ Light physics: Natural fall-off from source?
□ Depth: 3D separation from background?
□ Cinematic: S-curve applied (not flat digital)?

If ANY box is unchecked → REGENERATE that variant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMON FAILURES (FROM USER FEEDBACK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Option 1 typically fails: Too flat, no contrast, even lighting
   → FIX: Apply 2:1 ratio minimum, add proper shadows

❌ Option 3 sometimes fails: Creative lighting but loses quality
   → FIX: Maintain texture/contrast even with dramatic lighting

✅ Option 2 succeeds: Proper contrast, texture, depth
   → REPLICATE this quality in Options 1 & 3

═══════════════════════════════════════════════════════════════
THE RULE: QUALITY CONSTANT, ENVIRONMENT VARIABLE
═══════════════════════════════════════════════════════════════

Think of it like:
- Same camera (quality level)
- Same settings (ISO 400-800, proper exposure)
- DIFFERENT scenes (lighting, location, mood)

NOT:
- Different quality cameras
- Different skill levels
- Some good, some bad

ALL THREE MUST BE PROFESSIONAL GRADE.
`

export const VARIANT_DIFFERENTIATION = `
═══════════════════════════════════════════════════════════════
HOW TO DIFFERENTIATE VARIANTS (WITHOUT LOSING QUALITY)
═══════════════════════════════════════════════════════════════

**VARY THESE (Creative Differences):**

1. **LIGHTING DIRECTION**
   - Variant 1: Front 45° (classic portrait)
   - Variant 2: Side 90° (dramatic modeling)
   - Variant 3: Rim/back 135° (edge separation)

2. **LIGHTING QUALITY**
   - Variant 1: Soft diffused (large window, overcast)
   - Variant 2: Medium (direct sun, partially diffused)
   - Variant 3: Hard/dramatic (spotlight, direct sun)

3. **COLOR TEMPERATURE**
   - Variant 1: Neutral 5,500K (daylight balanced)
   - Variant 2: Warm 4,000K (golden hour, indoor warm)
   - Variant 3: Cool 6,500K (shade, blue hour) OR very warm 3,000K (sunset)

4. **ENVIRONMENT/BACKGROUND**
   - Variant 1: Simple, clean (studio-like, minimal)
   - Variant 2: Natural, realistic (park, street, cafe)
   - Variant 3: Interesting, cinematic (architecture, dramatic sky, urban)

5. **TIME OF DAY IMPLIED**
   - Variant 1: Midday (bright, even)
   - Variant 2: Morning/afternoon (natural, flattering)
   - Variant 3: Golden hour/blue hour (dramatic, colorful)

**DO NOT VARY THESE (Quality Standards):**

✗ Contrast level (all must have good contrast)
✗ Texture detail (all must show texture)
✗ Grain presence (all must have subtle grain)
✗ Sharpness (all must be sharp where in focus)
✗ Depth/3D quality (all must have dimension)
✗ Color saturation richness (all must have film-like density)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLE: 3 VARIANTS OF SAME PERSON IN BLACK POLO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Variant 1 (Editorial):
- Rooftop terrace, clean background
- Soft window light from left, 2:1 ratio
- Neutral daylight 5,500K
- Clear sky, bright but not harsh
- QUALITY: Full texture, good contrast, natural depth

Variant 2 (Candid):
- Same rooftop, natural outdoor light
- Direct sun from top-right, 3:1 ratio
- Warm 4,500K (afternoon sun)
- Realistic environment with plants
- QUALITY: Full texture, good contrast, natural depth

Variant 3 (Environmental):
- Dramatic evening light
- Rim light from behind, 4:1 ratio
- Golden hour 3,000K OR blue hour 7,000K
- Interesting sky, cityscape background
- QUALITY: Full texture, good contrast, natural depth

ALL THREE: Same face, same garment, same quality
DIFFERENCE: Only lighting angle, color, environment
`.trim()
