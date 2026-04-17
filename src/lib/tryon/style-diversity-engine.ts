/**
 * STYLE DIVERSITY ENGINE
 * 
 * Prevents aesthetic monotony by enforcing variation across multiple axes.
 * Each generation (especially multi-variant) MUST differ across at least 3 axes.
 * 
 * AXES OF VARIATION:
 * 1. Lighting Temperature (warm / neutral / cool)
 * 2. Contrast (soft / medium / high)
 * 3. Scene Realism (clean / lived-in / raw)
 * 4. Time of Day (morning / afternoon / evening / night)
 * 5. Color Palette (muted / earthy / bold)
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// VARIATION AXES DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const LIGHTING_TEMPERATURE = {
    warm: {
        kelvin: '3200K-4500K',
        description: 'Golden, amber, sunset-like tones',
        effect: 'Cozy, intimate, nostalgic feel',
        promptFragment: 'warm golden lighting, amber tones, ~3500K color temperature'
    },
    neutral: {
        kelvin: '5000K-5500K',
        description: 'Balanced daylight, true colors',
        effect: 'Natural, accurate, commercial feel',
        promptFragment: 'neutral daylight lighting, balanced white, ~5200K color temperature'
    },
    cool: {
        kelvin: '6000K-8000K',
        description: 'Blue-ish, overcast, clinical tones',
        effect: 'Modern, clean, editorial feel',
        promptFragment: 'cool blue-ish lighting, overcast tones, ~6500K color temperature'
    }
} as const

export const CONTRAST_LEVELS = {
    soft: {
        ratio: 'low',
        description: 'Minimal shadow depth, flat lighting',
        effect: 'Dreamy, ethereal, gentle mood',
        promptFragment: 'soft flat lighting, minimal shadows, low contrast'
    },
    medium: {
        ratio: 'balanced',
        description: 'Natural shadow depth, defined but not harsh',
        effect: 'Natural, realistic, balanced mood',
        promptFragment: 'natural lighting with defined shadows, medium contrast'
    },
    high: {
        ratio: 'dramatic',
        description: 'Deep shadows, bright highlights',
        effect: 'Dramatic, editorial, impactful mood',
        promptFragment: 'dramatic lighting, deep shadows, high contrast, chiaroscuro elements'
    }
} as const

export const SCENE_REALISM = {
    clean: {
        description: 'Pristine, styled, no imperfections',
        effect: 'Commercial, catalog, polished',
        promptFragment: 'clean pristine environment, well-styled space, minimal clutter'
    },
    livedIn: {
        description: 'Personal touches, slight disorder, authentic',
        effect: 'Relatable, authentic, lifestyle',
        promptFragment: 'lived-in environment, personal touches, authentic clutter, real space'
    },
    raw: {
        description: 'Gritty, unpolished, documentary feel',
        effect: 'Street, documentary, unfiltered',
        promptFragment: 'raw unpolished environment, gritty textures, documentary aesthetic'
    }
} as const

export const TIME_OF_DAY = {
    morning: {
        lightDirection: 'low angle, east',
        warmth: 'warm-neutral',
        effect: 'Fresh, hopeful, energetic',
        promptFragment: 'early morning light, low angle sun from east, fresh atmosphere'
    },
    afternoon: {
        lightDirection: 'overhead to west',
        warmth: 'neutral-warm',
        effect: 'Bright, active, vibrant',
        promptFragment: 'afternoon daylight, full brightness, active atmosphere'
    },
    evening: {
        lightDirection: 'low angle, west',
        warmth: 'warm-golden',
        effect: 'Golden hour, romantic, nostalgic',
        promptFragment: 'golden hour evening light, warm sunset tones, romantic atmosphere'
    },
    night: {
        lightDirection: 'artificial sources',
        warmth: 'mixed/cool',
        effect: 'Intimate, urban, moody',
        promptFragment: 'night scene, artificial lighting, urban ambiance, moody atmosphere'
    }
} as const

export const COLOR_PALETTE = {
    muted: {
        saturation: 'low',
        colors: 'desaturated, faded, vintage',
        effect: 'Subtle, sophisticated, timeless',
        promptFragment: 'muted color palette, desaturated tones, subtle vintage feel'
    },
    earthy: {
        saturation: 'medium',
        colors: 'browns, greens, terracottas, naturals',
        effect: 'Organic, grounded, natural',
        promptFragment: 'earthy color palette, natural tones, organic browns and greens'
    },
    bold: {
        saturation: 'high',
        colors: 'vibrant, saturated, punchy',
        effect: 'Energetic, modern, eye-catching',
        promptFragment: 'bold vibrant colors, high saturation, punchy color palette'
    }
} as const

// ═══════════════════════════════════════════════════════════════
// STYLE COMBINATION TYPE
// ═══════════════════════════════════════════════════════════════

export interface StyleCombination {
    id: string
    lighting: keyof typeof LIGHTING_TEMPERATURE
    contrast: keyof typeof CONTRAST_LEVELS
    sceneRealism: keyof typeof SCENE_REALISM
    timeOfDay: keyof typeof TIME_OF_DAY
    colorPalette: keyof typeof COLOR_PALETTE
}

// ═══════════════════════════════════════════════════════════════
// PREDEFINED DIVERSE COMBINATIONS
// ═══════════════════════════════════════════════════════════════

export const DIVERSE_STYLE_SETS: StyleCombination[][] = [
    // Set 1: Classic diversity (3 variants)
    [
        { id: 'warm-lifestyle', lighting: 'warm', contrast: 'soft', sceneRealism: 'livedIn', timeOfDay: 'afternoon', colorPalette: 'earthy' },
        { id: 'cool-editorial', lighting: 'cool', contrast: 'high', sceneRealism: 'clean', timeOfDay: 'morning', colorPalette: 'muted' },
        { id: 'golden-raw', lighting: 'warm', contrast: 'medium', sceneRealism: 'raw', timeOfDay: 'evening', colorPalette: 'bold' }
    ],
    // Set 2: Urban variety
    [
        { id: 'urban-night', lighting: 'cool', contrast: 'high', sceneRealism: 'raw', timeOfDay: 'night', colorPalette: 'bold' },
        { id: 'cafe-morning', lighting: 'warm', contrast: 'soft', sceneRealism: 'livedIn', timeOfDay: 'morning', colorPalette: 'earthy' },
        { id: 'studio-neutral', lighting: 'neutral', contrast: 'medium', sceneRealism: 'clean', timeOfDay: 'afternoon', colorPalette: 'muted' }
    ],
    // Set 3: Natural variety
    [
        { id: 'golden-hour', lighting: 'warm', contrast: 'medium', sceneRealism: 'livedIn', timeOfDay: 'evening', colorPalette: 'earthy' },
        { id: 'overcast-raw', lighting: 'cool', contrast: 'soft', sceneRealism: 'raw', timeOfDay: 'afternoon', colorPalette: 'muted' },
        { id: 'bright-clean', lighting: 'neutral', contrast: 'high', sceneRealism: 'clean', timeOfDay: 'morning', colorPalette: 'bold' }
    ]
]

// ═══════════════════════════════════════════════════════════════
// STYLE GENERATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a unique style combination that differs from existing ones
 */
export function generateUniqueStyle(existingStyles: StyleCombination[]): StyleCombination {
    const lightingOptions = Object.keys(LIGHTING_TEMPERATURE) as (keyof typeof LIGHTING_TEMPERATURE)[]
    const contrastOptions = Object.keys(CONTRAST_LEVELS) as (keyof typeof CONTRAST_LEVELS)[]
    const sceneOptions = Object.keys(SCENE_REALISM) as (keyof typeof SCENE_REALISM)[]
    const timeOptions = Object.keys(TIME_OF_DAY) as (keyof typeof TIME_OF_DAY)[]
    const paletteOptions = Object.keys(COLOR_PALETTE) as (keyof typeof COLOR_PALETTE)[]

    // Count used options
    const usedLighting = new Set(existingStyles.map(s => s.lighting))
    const usedContrast = new Set(existingStyles.map(s => s.contrast))
    const usedScene = new Set(existingStyles.map(s => s.sceneRealism))
    const usedTime = new Set(existingStyles.map(s => s.timeOfDay))
    const usedPalette = new Set(existingStyles.map(s => s.colorPalette))

    // Prefer unused options
    const selectUnused = <T>(options: T[], used: Set<T>): T => {
        const unused = options.filter(o => !used.has(o))
        if (unused.length > 0) {
            return unused[Math.floor(Math.random() * unused.length)]
        }
        return options[Math.floor(Math.random() * options.length)]
    }

    return {
        id: `generated-${Date.now()}`,
        lighting: selectUnused(lightingOptions, usedLighting),
        contrast: selectUnused(contrastOptions, usedContrast),
        sceneRealism: selectUnused(sceneOptions, usedScene),
        timeOfDay: selectUnused(timeOptions, usedTime),
        colorPalette: selectUnused(paletteOptions, usedPalette)
    }
}

/**
 * Generate N diverse styles that differ across at least 3 axes each
 */
export function generateDiverseStyles(count: number): StyleCombination[] {
    if (count <= 0) return []

    // Try to use a predefined set first
    if (count === 3) {
        const setIndex = Math.floor(Math.random() * DIVERSE_STYLE_SETS.length)
        return DIVERSE_STYLE_SETS[setIndex]
    }

    const styles: StyleCombination[] = []
    for (let i = 0; i < count; i++) {
        styles.push(generateUniqueStyle(styles))
    }
    return styles
}

/**
 * Calculate how many axes differ between two styles
 */
export function calculateStyleDifference(style1: StyleCombination, style2: StyleCombination): number {
    let diff = 0
    if (style1.lighting !== style2.lighting) diff++
    if (style1.contrast !== style2.contrast) diff++
    if (style1.sceneRealism !== style2.sceneRealism) diff++
    if (style1.timeOfDay !== style2.timeOfDay) diff++
    if (style1.colorPalette !== style2.colorPalette) diff++
    return diff
}

/**
 * Check if styles are sufficiently diverse (at least 3 axes different)
 */
export function validateStyleDiversity(styles: StyleCombination[]): { valid: boolean; minDifference: number } {
    let minDiff = 5 // Max possible

    for (let i = 0; i < styles.length; i++) {
        for (let j = i + 1; j < styles.length; j++) {
            const diff = calculateStyleDifference(styles[i], styles[j])
            minDiff = Math.min(minDiff, diff)
        }
    }

    return {
        valid: minDiff >= 3,
        minDifference: minDiff
    }
}

// ═══════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Build a style prompt fragment from a style combination
 */
export function buildStylePrompt(style: StyleCombination): string {
    const lighting = LIGHTING_TEMPERATURE[style.lighting]
    const contrast = CONTRAST_LEVELS[style.contrast]
    const scene = SCENE_REALISM[style.sceneRealism]
    const time = TIME_OF_DAY[style.timeOfDay]
    const palette = COLOR_PALETTE[style.colorPalette]

    return `
VISUAL STYLE SPECIFICATION [${style.id}]:
• Lighting: ${lighting.promptFragment}
• Contrast: ${contrast.promptFragment}
• Environment: ${scene.promptFragment}
• Time: ${time.promptFragment}
• Colors: ${palette.promptFragment}

This variant should feel distinct from other variants while maintaining
the SAME exact face and body from Image 1.
`
}

// ═══════════════════════════════════════════════════════════════
// MULTI-VARIANT DIVERSITY PROMPT
// ═══════════════════════════════════════════════════════════════

export const MULTI_VARIANT_DIVERSITY_PROMPT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              MULTI-VARIANT DIVERSITY REQUIREMENT                              ║
╚═══════════════════════════════════════════════════════════════════════════════╝

When generating multiple variants, they MUST differ significantly.

═══════════════════════════════════════════════════════════════════════════════
WHAT MUST BE THE SAME ACROSS ALL VARIANTS
═══════════════════════════════════════════════════════════════════════════════
✓ Face (pixel-locked, identical across all)
✓ Body morphology (same proportions, same weight)
✓ Garment (same clothing item)
✓ Garment color and texture

═══════════════════════════════════════════════════════════════════════════════
WHAT MUST DIFFER ACROSS VARIANTS (AT LEAST 3 AXES)
═══════════════════════════════════════════════════════════════════════════════
□ Lighting temperature (warm ↔ neutral ↔ cool)
□ Contrast level (soft ↔ medium ↔ high)
□ Scene realism (clean ↔ lived-in ↔ raw)
□ Time of day (morning ↔ afternoon ↔ evening ↔ night)
□ Color palette mood (muted ↔ earthy ↔ bold)
□ Camera distance (close ↔ medium ↔ wide)
□ Background environment

═══════════════════════════════════════════════════════════════════════════════
FORBIDDEN: SAME IMAGE THREE TIMES
═══════════════════════════════════════════════════════════════════════════════

If variants are too similar (less than 3 axes different):
→ REGENERATE with more variation

Each variant should feel like a different photo session,
NOT the same photo with minor adjustments.
`

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logStyleDiversity(styles: StyleCombination[]): void {
    console.log(`\n🎨 STYLE DIVERSITY ENGINE`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Generating ${styles.length} distinct variants:`)

    styles.forEach((style, i) => {
        console.log(`\n   Variant ${i + 1} [${style.id}]:`)
        console.log(`      💡 Lighting: ${style.lighting}`)
        console.log(`      📊 Contrast: ${style.contrast}`)
        console.log(`      🏠 Scene: ${style.sceneRealism}`)
        console.log(`      🕐 Time: ${style.timeOfDay}`)
        console.log(`      🎨 Palette: ${style.colorPalette}`)
    })

    const validation = validateStyleDiversity(styles)
    console.log(`\n   ═══════════════════════════════════════`)
    console.log(`   Diversity valid: ${validation.valid ? '✓ YES' : '✗ NO'}`)
    console.log(`   Min axis difference: ${validation.minDifference}/5`)
}
