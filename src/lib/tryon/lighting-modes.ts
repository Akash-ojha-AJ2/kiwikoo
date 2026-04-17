/**
 * LIGHTING MODES SYSTEM
 * 
 * Current presets are overly pastel and editorial.
 * Replace with REAL-WORLD lighting modes.
 * 
 * Lighting affects: Scene, Clothing, Shadows
 * Lighting does NOT affect: Face geometry, Hair geometry
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// LIGHTING MODE TYPES
// ═══════════════════════════════════════════════════════════════

export type LightingMode =
    | 'WARM_REAL_WORLD'
    | 'COOL_NEUTRAL'
    | 'HARSH_REALITY'
    | 'LOW_LIGHT_REAL'
    | 'GOLDEN_HOUR'
    | 'OVERCAST_SOFT'

export interface LightingModeConfig {
    mode: LightingMode
    name: string
    description: string
    colorTemperature: number // Kelvin
    intensity: number // 0-1
    contrast: number // 0-1
    shadowHardness: number // 0-1 (0 = soft, 1 = hard)
    prompt: string
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING MODE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_MODES: Record<LightingMode, LightingModeConfig> = {
    WARM_REAL_WORLD: {
        mode: 'WARM_REAL_WORLD',
        name: 'Warm Real World',
        description: 'Indoor warm lighting, cafe/restaurant ambient',
        colorTemperature: 3200,
        intensity: 0.7,
        contrast: 0.5,
        shadowHardness: 0.3,
        prompt: `LIGHTING: WARM REAL WORLD
- Color temperature: 3200K (warm tungsten)
- Source: mixed practical lights (ceiling, lamps)
- Shadows: soft, warm-tinted
- No studio lighting
- Natural imperfections (uneven, mixed sources)
- Slight orange/amber cast in shadows`
    },

    COOL_NEUTRAL: {
        mode: 'COOL_NEUTRAL',
        name: 'Cool Neutral',
        description: 'Daylight office/modern space, neutral tones',
        colorTemperature: 5500,
        intensity: 0.8,
        contrast: 0.4,
        shadowHardness: 0.2,
        prompt: `LIGHTING: COOL NEUTRAL
- Color temperature: 5500K (neutral daylight)
- Source: large windows, diffused natural light
- Shadows: soft, neutral gray
- Clean but not clinical
- Slight blue tint in shadows
- Even, flattering illumination`
    },

    HARSH_REALITY: {
        mode: 'HARSH_REALITY',
        name: 'Harsh Reality',
        description: 'Direct sunlight, outdoor midday, strong shadows',
        colorTemperature: 6000,
        intensity: 1.0,
        contrast: 0.8,
        shadowHardness: 0.9,
        prompt: `LIGHTING: HARSH REALITY
- Color temperature: 6000K (direct sun)
- Source: overhead sun, no diffusion
- Shadows: hard-edged, dark
- High contrast between lit and shadow areas
- Realistic outdoor photography look
- Slight overexposure in highlights allowed`
    },

    LOW_LIGHT_REAL: {
        mode: 'LOW_LIGHT_REAL',
        name: 'Low Light Real',
        description: 'Evening/dim interior, atmospheric',
        colorTemperature: 2800,
        intensity: 0.4,
        contrast: 0.6,
        shadowHardness: 0.5,
        prompt: `LIGHTING: LOW LIGHT REAL
- Color temperature: 2800K (warm evening)
- Source: practical lights, candles, dim bulbs
- Deep shadows with preserved detail
- Atmospheric, moody but realistic
- Visible grain/noise acceptable
- Face still clearly visible`
    },

    GOLDEN_HOUR: {
        mode: 'GOLDEN_HOUR',
        name: 'Golden Hour',
        description: 'Late afternoon outdoor, warm directional light',
        colorTemperature: 3500,
        intensity: 0.8,
        contrast: 0.5,
        shadowHardness: 0.4,
        prompt: `LIGHTING: GOLDEN HOUR
- Color temperature: 3500K (golden sunset)
- Source: low-angle sun through atmosphere
- Warm rim light on subject
- Shadows long and soft
- Orange/gold highlights
- Natural outdoor photography`
    },

    OVERCAST_SOFT: {
        mode: 'OVERCAST_SOFT',
        name: 'Overcast Soft',
        description: 'Cloudy day outdoor, even diffused light',
        colorTemperature: 6500,
        intensity: 0.6,
        contrast: 0.3,
        shadowHardness: 0.1,
        prompt: `LIGHTING: OVERCAST SOFT
- Color temperature: 6500K (cloudy sky)
- Source: overcast sky, giant softbox
- Minimal hard shadows
- Even illumination
- Slightly cool/gray tones
- Flattering, forgiving light`
    }
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING CONSTRAINT LAYER
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_CONSTRAINT_LAYER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      LIGHTING CONSTRAINT LAYER                                ║
║                      WHAT LIGHTING CAN AND CANNOT DO                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

LIGHTING MAY AFFECT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Scene color temperature
✓ Clothing color temperature
✓ Shadow color and intensity
✓ Highlight areas on clothing
✓ Background atmosphere
✓ Fabric appearance (sheen, matte)

LIGHTING MUST NOT AFFECT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Face GEOMETRY (shape, proportions)
❌ Hair GEOMETRY (volume, shape, density)
❌ Body PROPORTIONS
❌ Eye SIZE or SHAPE
❌ Nose SIZE or SHAPE
❌ Face SYMMETRY

RULE:
Lighting changes COLOR and SHADOW.
Lighting NEVER changes SHAPE or SIZE.

If face/hair geometry appears different under new lighting → OUTPUT IS WRONG.
`

// ═══════════════════════════════════════════════════════════════
// PRESET LIGHTING MAPPING
// ═══════════════════════════════════════════════════════════════

export interface PresetWithLighting {
    presetId: string
    lightingMode: LightingMode
}

export const PRESET_LIGHTING_MAP: Record<string, LightingMode> = {
    // Cafe presets
    'india_cafe_terrace': 'WARM_REAL_WORLD',
    'india_cafe_street': 'WARM_REAL_WORLD',
    'global_urban_cafe': 'WARM_REAL_WORLD',

    // Street presets
    'india_street_market': 'HARSH_REALITY',
    'india_street_rickshaw': 'GOLDEN_HOUR',
    'global_street_shopping': 'OVERCAST_SOFT',

    // Indoor presets
    'india_home_living': 'WARM_REAL_WORLD',
    'india_office_modern': 'COOL_NEUTRAL',
    'global_studio_minimal': 'COOL_NEUTRAL',

    // Outdoor presets
    'india_garden_terrace': 'GOLDEN_HOUR',
    'india_rooftop_sunset': 'GOLDEN_HOUR',
    'global_park_nature': 'OVERCAST_SOFT',

    // Evening presets
    'india_restaurant_fine': 'LOW_LIGHT_REAL',
    'global_lounge_elegant': 'LOW_LIGHT_REAL',

    // Default
    'default': 'COOL_NEUTRAL'
}

export function getLightingModeForPreset(presetId: string): LightingModeConfig {
    const mode = PRESET_LIGHTING_MAP[presetId] || PRESET_LIGHTING_MAP['default']
    return LIGHTING_MODES[mode]
}

// ═══════════════════════════════════════════════════════════════
// BUILD LIGHTING PROMPT
// ═══════════════════════════════════════════════════════════════

export function buildLightingPrompt(presetId: string): string {
    const config = getLightingModeForPreset(presetId)

    return `${config.prompt}

${LIGHTING_CONSTRAINT_LAYER}

APPLIED LIGHTING MODE: ${config.name}
Color Temperature: ${config.colorTemperature}K
Intensity: ${(config.intensity * 100).toFixed(0)}%
Shadow Hardness: ${config.shadowHardness < 0.3 ? 'Soft' : config.shadowHardness < 0.7 ? 'Medium' : 'Hard'}
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logLightingMode(sessionId: string, presetId: string): void {
    const config = getLightingModeForPreset(presetId)
    console.log(`\n💡 LIGHTING MODE [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📌 Preset: ${presetId}`)
    console.log(`   🌡️ Mode: ${config.name}`)
    console.log(`   🎨 Temperature: ${config.colorTemperature}K`)
    console.log(`   ☀️ Intensity: ${(config.intensity * 100).toFixed(0)}%`)
    console.log(`   🌑 Shadow: ${config.shadowHardness < 0.3 ? 'Soft' : config.shadowHardness < 0.7 ? 'Medium' : 'Hard'}`)
    console.log(`   ═══════════════════════════════════════`)
}
