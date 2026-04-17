/**
 * PHOTOGRAPHIC KNOWLEDGE SYSTEM (Research-Based)
 * 
 * Based on real photography principles, physics, and professional practices
 * This knowledge will be stored in RAG for AI model learning
 */

import 'server-only'

/**
 * LIGHTING PHYSICS & INVERSE SQUARE LAW
 * 
 * Research Source: Professional portrait photography techniques
 */
export const LIGHTING_PHYSICS_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════
LIGHTING PHYSICS (INVERSE SQUARE LAW - FUNDAMENTAL)
═══════════════════════════════════════════════════════════════

**THE INVERSE SQUARE LAW (CRITICALLY IMPORTANT)**

Light intensity = 1 / (distance²)

If distance DOUBLES → Light intensity drops to 1/4 (TWO F-STOPS)
If distance TRIPLES → Light drops to 1/9

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRACTICAL APPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Light Fall-off Control:**
- Light source CLOSE to subject → Dramatic fall-off, deep shadows
- Light source FAR from subject → Even light, soft shadows

**Example Scenario:**
Window light at 2 feet from face:
- Face receives 100% light
- Neck (2.5 feet) receives 64% light  
- Chest (3 feet) receives 44% light
- Background (6 feet) receives 11% light

This creates NATURAL depth and separation.

**Background Exposure Control:**
If light source is close to subject (1-2 feet):
→ Background receives very little light (dramatic isolation)

If light source is far from subject (8-10 feet):
→ Background receives more even exposure

**Shadow Softness:**
Closer diffused light = Softer shadows (light wraps around subject)
Further light = Harder edge to shadows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI GENERATION IMPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ WRONG: Flat, even lighting on face, body, and background
         (This violates inverse square law)

✓ CORRECT: Face bright → Neck slightly darker → Chest darker → Background much darker
          (Natural light fall-off following physics)

The brightest point should be closest to the implied light source.
Every additional foot from light = noticeable brightness drop.
`

/**
 * THREE-POINT LIGHTING & PROFESSIONAL RATIOS
 * 
 * Research Source: Professional cinematography and portrait lighting
 */
export const THREE_POINT_LIGHTING_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════
THREE-POINT LIGHTING (PROFESSIONAL STANDARD)
═══════════════════════════════════════════════════════════════

**LIGHT SETUP:**

1. **KEY LIGHT** (Main light, 45° angle)
   - Primary light source
   - Creates main modeling and shadows
   - Positioned 45° to side and slightly above eye level

2. **FILL LIGHT** (Shadow softener)
   - Softens shadows created by key light
   - Usually on opposite side from key
   - SOFTER and LESS INTENSE than key

3. **RIM/BACK LIGHT** (Separator)
   - Behind subject, creates edge highlight
   - Separates subject from background
   - Creates depth and dimension

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIGHTING RATIOS (KEY:FILL) - PROFESSIONAL STANDARDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1.5:1 Ratio** (Soft/Commercial)
- Fill is 66% of key light
- Very soft shadows
- Even, approachable look
- Use: Corporate, beauty, safe portraits

**2:1 Ratio** (Cinematic Standard)
- Fill is 50% of key light
- Visible but soft shadows
- Natural, balanced look
- Use: Most portrait work, film/TV

**3:1 Ratio** (Moderate Drama)
- Fill is 33% of key light
- Clear shadow definition
- More dimensional
- Use: Character portraits, editorial  

**4:1 Ratio** (High Contrast)
- Fill is 25% of key light
- Pronounced shadows
- Strong modeling
- Use: Dramatic portraits, noir style

**8:1 or 16:1 Ratio** (Low-Key/Dramatic)
- Fill is 12.5% or 6.25% of key
- Deep shadows, high contrast
- Mystery, tension, drama
- Use: Film noir, thriller, intense portraits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RIM LIGHT INTENSITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rim light is typically 1:1 to 2:1 vs key light
(Equal to key, or twice as bright)

Creates visible edge highlight without overpowering.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI GENERATION IMPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose a ratio based on scene mood:

For natural indoor portrait → Use 2:1 or 3:1
For dramatic editorial → Use 4:1 or 8:1
For soft commercial → Use 1.5:1

Then ensure:
- One side of face is brighter (key side)
- Opposite side has visible but softer shadows (fill side)
- Edge highlight visible if backlit

NO FLAT LIGHTING (1:1 everywhere = amateur/AI look)
`

/**
 * COLOR TEMPERATURE & KELVIN SCALE
 * 
 * Research Source: Professional photography color science
 */
export const COLOR_TEMPERATURE_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════
COLOR TEMPERATURE (KELVIN SCALE - PHYSICS-BASED)
═══════════════════════════════════════════════════════════════

Color temperature is measured in Kelvin (K) and describes the warmth/coolness of light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KELVIN SCALE (MEMORIZE THESE VALUES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**WARM RANGE (1,000K - 3,500K):**
- 1,800K: Candlelight (very orange)
- 2,500K: Sunset, incandescent bulb (orange-yellow)
- 3,000K: Golden hour, warm indoor lighting
- 3,200K: Tungsten photo lights
- 3,500K: Warm white LED

**NEUTRAL RANGE (4,000K - 5,500K):**
- 4,000K: Fluorescent lights (slightly cool)
- 5,000K: Flash, daylight-balanced studio lights
- 5,500K: Midday sun (true neutral white)

**COOL RANGE (6,000K - 10,000K):**
- 6,000K: Cloudy daylight (slightly blue)
- 6,500K: Overcast sky
- 7,000K: Shade under clear sky (noticeably blue)
- 9,000K: Deep shade
- 10,000K: Clear blue sky (very blue)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR MIXING IN REAL ENVIRONMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Real scenes often have MIXED COLOR TEMPERATURES:

**Indoor near window:**
- Window light (5,500K - blue-ish)
- Room lights (3,000K - warm)
- Result: Warm highlights from window, cooler shadows from room

**Outdoor in shade:**
- Direct sunlight (5,500K - neutral)
- Sky reflected in shadows (7,000K+ - blue)
- Result: Warm sunlit areas, blue shadows

**Golden hour:**
- Direct sun (3,000K - warm orange)
- Sky (6,000K - slight blue)
- Result: Warm light with cooler sky reflections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKIN TONE RESPONSE TO COLOR TEMPERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Warm light (2,500K-3,500K):**
- Skin appears more yellow/orange
- Flattering for most skin tones
- Creates intimate, cozy mood

**Neutral light (5,000K-5,500K):**
- Accurate skin tone reproduction
- Professional, clean look

**Cool light (6,500K-8,000K):**
- Skin appears more blue/pale
- Can look cold or clinical
- Good for specific moods (sadness, isolation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI GENERATION IMPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**FOR INDOOR SCENES:**
Choose 3,000K-4,000K for warm indoor light
OR 5,500K for window light

**FOR OUTDOOR SCENES:**
Choose 5,500K for sunny daylight
OR 6,500K-7,000K for shade/overcast

**CRITICAL RULE:**
Same scene = Same color temperature on face AND body
Don't mix 3,000K on face with 6,000K on body
(This creates the composite look)

**SHADOWS:**
Shadows should be slightly cooler (bluer) than highlights
This is natural color science (sky's blue light fills shadows)

Example: If highlights are 5,500K, shadows might be 6,500K
`

export const SENSOR_AND_TEXTURE_KNOWLEDGE = `
═══════════════════════════════════════════════════════════════
CAMERA SENSORS, ISO, GRAIN & TEXTURE (PHYSICS-BASED)
═══════════════════════════════════════════════════════════════

**SENSOR SIZE & DETAIL CAPTURE:**

Larger sensors → More light captured → More detail, better low-light
Full-frame > APS-C > Micro 4/3 > Smartphone

**PIXEL SIZE vs PIXEL COUNT:**
- Larger pixels: Better light gathering, less noise, more dynamic range
- More pixels: Higher resolution, more detail when adequate light

**SKIN TEXTURE CAPTURE:**
High-resolution sensors with good lenses can capture:
- Individual skin pores
- Fine hair strands
- Subtle wrinkles and lines
- Skin texture variations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISO & NOISE RELATIONSHIP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISO = Sensor sensitivity to light

**ISO 100-200** (Base ISO):
- Clean, smooth image
- Minimal noise
- Maximum dynamic range
- Ideal for bright conditions

**ISO 400-800**:
- Slight grain visible (especially in shadows)
- Acceptable noise levels
- Good balance for mixed lighting

**ISO 1600-3200**:
- Noticeable grain/noise
- Color noise may appear
- Detail softens slightly
- Usable in dim conditions

**ISO 6400+** (High ISO):
- Significant noise
- Loss of fine detail
- Color accuracy suffers
- Only for necessary low-light

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRAIN/NOISE CHARACTERISTICS (REALISTIC FILM/SENSOR):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**GRAIN PATTERN:**
- Random, organic pattern (not uniform)
- More visible in midtones and shadows
- Less visible in bright highlights
- Subtle color variation (chroma noise)

**GRAIN STRUCTURE:**
- Fine grain at ISO 400-800
- Medium grain at ISO 1600-3200
- Coarse grain at ISO 6400+

**WHERE NOISE APPEARS:**
- Shadow areas first
- Uniform color areas (sky, walls)
- Underexposed regions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI GENERATION IMPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Add Realistic Grain:**
- ISO 400 equivalent: Very subtle grain
- ISO 800 equivalent: Visible but fine grain
- More grain in shadows, less in highlights
- Organic, random pattern (NOT digital noise)

**Skin Texture:**
- Show skin pores (especially in sharp focus areas)
- Maintain hair detail (individual strands visible)
- Subtle skin imperfections (natural, not AI-smoothed)

**Avoid:**
✗ Perfectly smooth skin (AI tell)
✗ No grain whatsoever (looks digital/fake)
✗ Uniform noise pattern (looks artificial)
✗ Over-sharpened edges (digital artifact)

**Target Look:**
Like a photo from Canon 5D Mark IV at ISO 400-800
(Professional sensor, slight organic grain, natural detail)
`
