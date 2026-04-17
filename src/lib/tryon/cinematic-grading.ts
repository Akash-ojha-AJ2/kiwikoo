/**
 * CINEMATIC COLOR GRADING & FILM LOOK
 * 
 * Research-based knowledge on professional color science
 */

import 'server-only'

export const CINEMATIC_COLOR_GRADING = `
═══════════════════════════════════════════════════════════════
CINEMATIC COLOR GRADING (FILM LOOK - RESEARCH-BASED)
═══════════════════════════════════════════════════════════════

**WHAT IS CINEMATIC COLOR?**

Film look ≠ Perfect digital colors
Film look = Tonal contrast + Color density + Gentle roll-off

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
S-CURVE TONE (SIGNATURE OF FILM):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Shadows:** Lifted (not pure black, crushed to dark gray)
**Midtones:** Contrast increased
**Highlights:** Rolled off (not pure white, gentle falloff)

This creates the "filmic" S-curve:
- Bottom of curve (shadows): Lifted baseline
- Middle of curve (midtones): Steeper slope = more contrast
- Top of curve (highlights): Gentle rolloff to avoid blown whites    
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR DENSITY (FILM vs DIGITAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Digital (Flat/Video Look):**
- Pure, saturated colors
- Even saturation across all tones
- Clinical, sterile feel

**Film (Cinematic Look):**
- Rich, dense colors
- Desaturated shadows
- More saturated midtones
- Gentle saturation in highlights
- Organic, dimensional

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKIN TONE SCIENCE (PROFESSIONAL STANDARD):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Skin Tone Line (IRE Waveform):**
Skin tones fall on a specific diagonal line in vectorscope
Range: 11-2 o'clock position

**Skin Tone Characteristics:**
- Slight yellow/orange undertone (NOT pink)
- Subtle red in cheeks (blood flow)
- Blue/green tint in shadows (natural)
- Highlights: Warm (NOT pure white)

**AVOID (Common AI Mistake):**
✗ Oversaturated skin (looks plastic)
✗ Pink/magenta skin tones
✗ Pure white highlights on skin
✗ Uniform skin color (no variation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CINEMATIC COLOR PALETTES (COMMON GRADES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1. TEAL & ORANGE (Blockbuster Standard)**
- Shadows: Teal/cyan tint
- Skin tones: Warm orange
- Creates strong color separation
- High contrast, bold look

**2. BLEACH BYPASS (Desaturated Film)**
- Reduced overall saturation
- Increased contrast
- Shadows: Crushed slightly
- Gritty, realistic feel

**3. WARM NOSTALGIA**
- Overall warm cast (3,500K-4,000K feel)
- Lifted blacks (faded film look)
- Soft highlights
- Vintage, comforting mood

**4. COLD CLINICAL**
- Cool color temperature (6,500K+)
- High contrast
- Pure whites, deep blacks
- Modern, sterile mood

**5. GOLDEN HOUR (Natural)**
- Warm highlights (3,000K-3,500K)
- Cool shadows (6,000K-7,000K)
- Natural color separation
- Flattering, cinematic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHADOW & HIGHLIGHT COLOR TINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shadows should NOT be pure black/gray - they have color

**SHADOW TINTS (Common Film Looks):**
- Blue shadows (outdoor/natural)
- Teal shadows (modern cinematic)
- Green shadows (vintage film)
- Purple shadows (artistic/stylized)

**HIGHLIGHT TINTS:**
- Warm (golden/orange) for flattering
- Slight yellow for vintage
- Cool (slight blue) for modern/sterile

**COMPLEMENTARY COLOR THEORY:**
Warm highlights + Cool shadows = Pleasing contrast
Cool highlights + Warm shadows = Unusual but artistic
`.trim()
