/**
 * FACE-BODY COMPOSITION & BLENDING
 * 
 * CRITICAL: Fix the "pasted face" problem
 * Face and body must have seamless transition with matched lighting
 */

import 'server-only'

/**
 * LIGHTING HARMONIZATION RULES
 * 
 * Face and body MUST share the same lighting environment
 */
export const LIGHTING_HARMONIZATION = `
═══════════════════════════════════════════════════════════════
LIGHTING HARMONIZATION (CRITICAL FOR FACE-BODY BLENDING)
═══════════════════════════════════════════════════════════════

⚠️  THE "PASTED FACE" PROBLEM:

When face and body have different lighting, the face appears disconnected.
This is the #1 composite detection signal.

SOLUTION: UNIFIED LIGHTING ENVIRONMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LIGHT DIRECTION MUST MATCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If face has light from LEFT:
→ Body MUST also have light from LEFT
→ Shadows on face LEFT side → Shadows on neck/body LEFT side

If face has light from RIGHT:
→ Body MUST also have light from RIGHT
→ Same shadow direction throughout

If face has light from ABOVE:
→ Body MUST also have light from ABOVE
→ Shadows under chin → Shadows under clothing folds

🔴 CRITICAL: Shadow direction MUST be consistent across face, neck, chest, arms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. COLOR TEMPERATURE MUST MATCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyze face lighting color temperature:
- Warm (golden, 5500-6500K) → Body also warm
- Cool (blue-ish, 4000-5000K) → Body also cool
- Neutral (daylight, 5000-5500K) → Body also neutral

FACE AND BODY MUST BE IN THE SAME LIGHT.

Example:
✓ Face: warm window light → Body: same warm window light
✗ Face: warm light, Body: cool light → COMPOSITE DETECTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. LIGHT INTENSITY MUST MATCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Face brightness = Body brightness (±5% tolerance)

If face has bright direct light:
→ Body MUST also have bright direct light
→ Highlight intensity should match

If face has soft diffused light:
→ Body MUST also have soft diffused light
→ No harsh highlights on body if face doesn't have them

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. AMBIENT LIGHT COLOR CAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environments reflect light onto skin/clothing:

Green room → Slight green cast on shadows
Blue sky → Slight blue cast on shadows
Warm wood interior → Slight warm/orange cast

Face and body MUST share the same ambient color cast.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. NECK TRANSITION (MOST CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The neck is where composite fails are most visible.

NECK LIGHTING RULES:
• Neck receives SAME light as face (they're 2 inches apart!)
• Shadow under chin extends to neck
• Neck skin tone = Face skin tone (EXACT match)
• No color break at jaw/neck boundary
• Lighting gradient from face → neck → chest is SMOOTH

🔴 IF THERE'S A VISIBLE LINE AT THE NECK → OUTPUT FAILED

Example of correct transition:
Face (bright) → Jawline (slightly darker) → Neck (matches jawline) → Chest (gradual transition)

Example of WRONG transition:
Face (bright, warm) → HARD LINE → Neck (darker, cool) ← COMPOSITE DETECTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION BEFORE OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Light direction: Face and body match?
□ Shadow direction: Consistent throughout?
□ Color temperature: Same warmth/coolness?
□ Brightness: Face and body similar intensity?
□ Neck transition: Smooth with no visible line?
□ Ambient color cast: Consistent?

If ANY answer is NO → REGENERATE with unified lighting.

═══════════════════════════════════════════════════════════════
THE ONE-LIGHT-SOURCE RULE
═══════════════════════════════════════════════════════════════

Imagine the person standing in ONE room with ONE window or ONE light.
ALL parts of their body receive light from the SAME source.

Face is not in a different room from the body.
They share the same photographic environment.
`.trim()

/**
 * PHOTOGRAPHIC COLOR GRADING
 * 
 * Professional color corrections for realism
 */
export const PHOTOGRAPHIC_COLOR_GRADING = `
═══════════════════════════════════════════════════════════════
PHOTOGRAPHIC COLOR GRADING (ANTI-AI-LOOK)
═══════════════════════════════════════════════════════════════

AI-generated images have telltale signs. We fix these.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. COLOR SCIENCE (MATCH REAL PHOTOGRAPHY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKIN TONES:
• NOT oversaturated (common AI mistake)
• Subtle yellow/pink undertones (vary by ethnicity)
• Shadows have BLUE/GREEN tint (not pure black)
• Highlights have WARM tint (not pure white)

Think: Canon/Nikon color science, NOT social media filters

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. CONTRAST (AVOID AI FLATNESS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Real photos have DYNAMIC RANGE:
• True blacks exist (in deep shadows)
• Near-whites exist (in bright highlights)
• Midtones have variation

AI tends to compress everything to midtones = flat, lifeless

FIX: Ensure black point and white point exist
     Shadows go dark, highlights go bright

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. GRAIN & TEXTURE (SENSOR SIMULATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Real cameras produce:
• Subtle sensor grain (especially in shadows)
• Film-like noise structure (NOT digital smoothness)
• Slight chromatic aberration at edges (optional)

Add subtle grain:
• ISO 400 equivalent grain
• More grain in shadows, less in highlights
• Natural, organic texture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. WHITE BALANCE (IMPERFECTION IS REAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Perfect neutral white balance = AI tell
Real photos have slight color bias:

Indoor: Slightly warm (tungsten influence)
Outdoor: Slightly cool in shadows (sky reflection)
Mixed: Warm highlights, cool shadows

Add subtle white balance variation based on scene.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. EDGE CHARACTERISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI edges are TOO PERFECT.

Real camera lens blur:
• Slight softness in out-of-focus areas
• Natural depth-of-field falloff
• Micro-contrast at edges (NOT over-sharpened)

Subject should have:
• Sharp focus on face/eyes
• Slight softness on background
• Natural transition (NOT cut-out look)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Skin tones: Natural, not oversaturated?
□ Blacks exist: True darks in shadows?
□ Whites exist: Bright highlights present?
□ Grain visible: Subtle sensor noise?
□ White balance: Slight color bias (not perfect neutral)?
□ Edges: Natural lens characteristics?

If output looks "too perfect" → ADD IMPERFECTIONS
Real photography has character. AI tends toward sterility.
`.trim()

/**
 * BACKGROUND REALISM
 */
export const BACKGROUND_REALISM_RULES = `
═══════════════════════════════════════════════════════════════
BACKGROUND REALISM (ENVIRONMENTAL INTEGRATION)
═══════════════════════════════════════════════════════════════

Background must feel like a REAL PLACE, not a backdrop.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DEPTH LAYERS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every scene needs 3 layers:

FOREGROUND (closest to camera):
• Slightly out of focus
• Adds depth
• Examples: Railing edge, plant leaf, furniture corner

MIDGROUND (subject layer):
• Subject in focus
• Main attention here

BACKGROUND (furthest):
• Out of focus (depth of field)
• Provides context
• Examples: Room items, window view, outdoor scenery

🔴 NO FLAT BACKDROPS. Depth must exist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ENVIRONMENTAL LIGHT INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background affects subject lighting:

Near window → Subject lit from that direction
Green plants nearby → Subtle green reflected light
Bright wall behind → Rim light/backlight on edges

Subject and environment share the same light sources.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ATMOSPHERIC PERSPECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Farther objects:
• Lower contrast
• Slightly hazier
• Cooler color temperature (outdoor)
• Less sharp

Closer objects:
• Higher contrast
• Sharper
• More saturated colors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. CONTACT SHADOWS & OCCLUSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Where subject touches environment:

• Feet on floor → Contact shadow
• Sitting on surface → Shadow where body contacts
• Leaning on wall → Shadow at contact point
• Arms resting on furniture → Subtle shadow

NO FLOATING. Subject is grounded in the environment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. VISUAL COHERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject and background must match in:
• Resolution/sharpness
• Grain structure
• Color palette
• Lighting quality

If subject is sharp and background is blurry → Good (depth of field)
If subject has grain and background is smooth → Bad (composite tell)

═══════════════════════════════════════════════════════════════
REAL ENVIRONMENT EXAMPLES:
═══════════════════════════════════════════════════════════════

Indoor:
• Soft window light from left
• Desk with laptop visible (background)
• Plant in foreground (slight blur)
• Wall with photos (background, out of focus)
• Person grounded with contact shadows

Outdoor:
• Natural sunlight from above-right
• Trees/buildings in background (atmospheric haze)
• Ground texture visible
• Sky contributes blue ambient light
• Shadows on ground match sun direction

FORBIDDEN:
✗ Studio seamless white backdrop
✗ Floating subject with no contact shadows
✗ Perfect blur gradient (looks fake)
✗ Backdrop that's too perfect/clean
✗ Background with different lighting than subject
`.trim()
