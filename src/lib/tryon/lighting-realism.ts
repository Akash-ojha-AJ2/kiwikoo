/**
 * LAYER 5: LIGHTING REALISM ENGINE
 * 
 * ANTI-STUDIO: Enforce directional lighting with falloff.
 * Kill the "AI studio look" - uniform, flat, pastel lighting.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export type LightingLane = 'warm_daylight' | 'cool_indoor' | 'environmental'

/**
 * Build lighting realism rules for specific lane
 */
export function buildLightingRealismRules(lane: LightingLane): string {
    const baseLighting = `
═══════════════════════════════════════════════════════════════
LAYER 5: LIGHTING REALISM (ANTI-STUDIO)
═══════════════════════════════════════════════════════════════

⚠️  DIRECTIONAL LIGHTING IS MANDATORY ⚠️

REQUIRED LIGHTING CHARACTERISTICS:

1. DIRECTIONALITY:
   • Light comes from ONE primary direction
   • One side of face/body 5-15% darker
   • Clear light source (window, sun, lamp)
   • Falloff gradient visible

2. SHADOWS:
   • Shadows MUST exist
   • Cast shadows under chin, nose
   • Body shadows on garment
   • Environmental shadows (furniture, etc.)

3. COLOR TEMPERATURE:
   • Variation ±300K allowed
   • Warm or cool bias permitted
   • NOT neutral/gray

4. IMPERFECTION:
   • Slight overexposure OR underexposure (natural)
   • NOT perfectly balanced
   • Dynamic range variation

FORBIDDEN LIGHTING:
═══════════════════════════════════════════════════════════════
✗ Perfect studio lighting (uniform brightness)
✗ No shadows anywhere
✗ Flat lighting (no dimension)
✗ Pastel/creamy tone (AI look)
✗ Ring light effect (even circle)
✗ Pure white background lighting
✗ Computer monitor glow (no environment)
✗ Overly balanced exposure
`

    const laneLighting = {
        warm_daylight: `
WARM DAYLIGHT LANE:
═══════════════════════════════════════════════════════════════
• Color temp: 5500-6500K (golden hour bias)
• 
• Light source: Sun (direct or diffused through clouds)
• Shadows: Soft but present
• Skin tones: Warm, golden undertones
• Feel: Natural outdoor, daytime
• Falloff: Gentle 8-12% from bright side to shadow side

VISUAL CUE: Imagine late afternoon sun through a window.
`,
        cool_indoor: `
COOL INDOOR LANE:
═══════════════════════════════════════════════════════════════
• Color temp: 4000-5000K (cooler bias)
• Light source: Window side-light or indoor artificial
• Shadows: Defined but not harsh
• Skin tones: Cooler undertones
• Feel: Indoor, ambient, natural window light
• Falloff: Clear 10-15% from window side to opposite

VISUAL CUE: Imagine sitting near a window on an overcast day.
`,
        environmental: `
ENVIRONMENTAL LANE (MOODY):
═══════════════════════════════════════════════════════════════
• Color temp: Varies by scene (golden, blue hour, tungsten)
• Light source: Strong directional (low sun, single lamp)
• Shadows: Deep, 20-30% darker
• Skin tones: Dramatic variation
• Feel: High contrast, atmospheric
• Falloff: Pronounced 15-30%

VISUAL CUE: Imagine dramatic window light or sunset side-light.
`
    }

    return `${baseLighting}\n${laneLighting[lane]}\n
VALIDATION:
If lighting is uniform → OUTPUT IS INVALID
Shadows and directionality are MANDATORY.
`.trim()
}

/**
 * Validate lighting directionality in generated image
 */
export async function validateLightingDirectionality(
    imageBase64: string
): Promise<{ is_directional: boolean; falloff_percentage: number; has_shadows: boolean }> {
    console.log('\n🔍 Validating lighting directionality...')

    const openai = getGeminiChat()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `Analyze lighting in this image.

Check:
1. Is lighting directional (one side darker) or uniform (studio-flat)?
2. What's the brightness difference from brightest to darkest side?
3. Are shadows present (under chin, nose, on body)?
4. Does it look like natural light or artificial studio light?

Return JSON: {
  is_directional: boolean,
  falloff_percentage: 0-100,
  has_shadows: boolean,
  lighting_type: "directional_natural" | "directional_artificial" | "uniform_studio"
}`
            }, {
                role: 'user',
                content: [
                    { type: 'text', text: 'Analyze lighting direction and shadows.' },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')

        const isGood = result.is_directional && result.falloff_percentage > 5 && result.has_shadows

        console.log(`   ${isGood ? '✅ Directional lighting' : '❌ Flat/studio lighting'} (falloff: ${result.falloff_percentage}%)`)
        console.log(`   Shadows: ${result.has_shadows ? 'Present' : 'Missing'}`)

        return {
            is_directional: result.is_directional,
            falloff_percentage: result.falloff_percentage,
            has_shadows: result.has_shadows
        }

    } catch (error) {
        console.error('Lighting validation failed:', error)
        // Fail-safe: assume directional if validation fails
        return {
            is_directional: true,
            falloff_percentage: 10,
            has_shadows: true
        }
    }
}

/**
 * Build retry emphasis for failed lighting validation
 */
export function buildLightingRetryEmphasis(falloffPercentage: number): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  ⚠️  PREVIOUS ATTEMPT FAILED: LIGHTING TOO FLAT          ║
╚════════════════════════════════════════════════════════════╝

Previous lighting falloff: ${falloffPercentage}% (threshold: > 5%)

The lighting was too uniform, too studio-like, too "AI perfect".

INCREASED LIGHTING REQUIREMENTS:
• ONE primary light source (window, sun, lamp)
• One side of face/body MUST be 10-15% darker
• Shadows MUST be visible (under chin, nose, body on garment)
• Light direction MUST be clear

Make it look like REAL photography, not a perfect studio setup.
`.trim()
}

/**
 * Get lighting lane randomization for variants
 */
export function getRandomLightingLane(): LightingLane {
    const lanes: LightingLane[] = ['warm_daylight', 'cool_indoor', 'environmental']
    return lanes[Math.floor(Math.random() * lanes.length)]
}
