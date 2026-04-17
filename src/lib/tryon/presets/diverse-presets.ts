/**
 * DIVERSE PRESETS — COMPREHENSIVE VISUAL SPECIFICATIONS
 * 
 * Each preset defines the COMPLETE visual treatment:
 * - Scene (location, depth, props)
 * - Lighting Physics (source, direction, quality, temperature)
 * - Face Lighting (how light hits face, shadows, catchlights)
 * - Color Grading (shadows, highlights, midtones, LUT style)
 * - Contrast & Texture (contrast level, grain, sharpness)
 * - Realism Constraints (skin texture, imperfections)
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE PRESET INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ComprehensivePreset {
    id: string
    label: string
    category: 'outdoor' | 'indoor' | 'urban' | 'studio' | 'lifestyle'

    // Scene
    scene: {
        location: string
        foreground: string
        midground: string
        background: string
    }

    // Lighting Physics
    lighting: {
        source: string
        direction: 'front' | 'side' | 'back' | 'overhead' | 'below' | 'mixed'
        quality: 'hard' | 'soft' | 'diffused' | 'mixed'
        temperature: number  // Kelvin (2700K-8000K)
        temperatureLabel: 'very warm' | 'warm' | 'neutral' | 'cool' | 'very cool'
        intensity: 'dim' | 'normal' | 'bright' | 'harsh'
    }

    // Face Lighting
    faceLighting: {
        style: 'rembrandt' | 'butterfly' | 'loop' | 'split' | 'flat' | 'rim'
        shadowAreas: string
        catchlights: string
        skinHighlights: string
    }

    // Color Grading
    colorGrade: {
        shadowTint: string
        highlightTint: string
        midtonePush: 'warm' | 'neutral' | 'cool'
        saturation: 'muted' | 'natural' | 'vibrant'
        lookStyle: string
    }

    // Contrast & Texture
    texture: {
        contrast: 'low' | 'medium' | 'high' | 'very high'
        microContrast: 'soft' | 'natural' | 'sharp'
        filmGrain: 'none' | 'fine' | 'medium' | 'coarse'
        noiseCharacter: string
    }

    // Realism Constraints
    realism: {
        skinTexture: 'preserve all' | 'natural' | 'slightly soft'
        imperfections: 'show all' | 'natural' | 'minimal'
        sharpness: 'soft' | 'natural' | 'sharp' | 'very sharp'
        lensDistortion: 'none' | 'subtle' | 'noticeable'
    }
}

// ═══════════════════════════════════════════════════════════════
// 15 DIVERSE PRESETS
// ═══════════════════════════════════════════════════════════════

export const DIVERSE_PRESETS: ComprehensivePreset[] = [

    // ─────────────────────────────────────────────────────────────
    // 1. GOLDEN HOUR TERRACE
    // ─────────────────────────────────────────────────────────────
    {
        id: 'golden_hour_terrace',
        label: 'Golden Hour Terrace',
        category: 'outdoor',
        scene: {
            location: 'Rooftop terrace at sunset',
            foreground: 'Metal railing, potted plants',
            midground: 'Open terrace space',
            background: 'City skyline silhouette, orange sky'
        },
        lighting: {
            source: 'Setting sun at 15° above horizon',
            direction: 'side',
            quality: 'soft',
            temperature: 3200,
            temperatureLabel: 'very warm',
            intensity: 'normal'
        },
        faceLighting: {
            style: 'rembrandt',
            shadowAreas: 'Far cheek in soft shadow, warm fill from reflected light',
            catchlights: 'Golden, positioned at 10 o\'clock',
            skinHighlights: 'Warm golden glow on highlight side'
        },
        colorGrade: {
            shadowTint: 'Cool blue',
            highlightTint: 'Warm orange',
            midtonePush: 'warm',
            saturation: 'natural',
            lookStyle: 'Kodak Portra 400 film simulation'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'fine',
            noiseCharacter: 'Organic, filmic'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 2. HARSH MIDDAY STREET
    // ─────────────────────────────────────────────────────────────
    {
        id: 'harsh_midday_street',
        label: 'Harsh Midday Street',
        category: 'urban',
        scene: {
            location: 'Urban street at noon',
            foreground: 'Concrete pavement, sharp shadows',
            midground: 'Parked vehicles, shop fronts',
            background: 'Buildings, clear blue sky'
        },
        lighting: {
            source: 'Direct overhead sun',
            direction: 'overhead',
            quality: 'hard',
            temperature: 5500,
            temperatureLabel: 'neutral',
            intensity: 'harsh'
        },
        faceLighting: {
            style: 'butterfly',
            shadowAreas: 'Deep shadows under brows, under nose, under chin',
            catchlights: 'Small, bright, centered',
            skinHighlights: 'Bright, slightly blown on forehead'
        },
        colorGrade: {
            shadowTint: 'Neutral black',
            highlightTint: 'Neutral white',
            midtonePush: 'neutral',
            saturation: 'muted',
            lookStyle: 'High contrast documentary'
        },
        texture: {
            contrast: 'very high',
            microContrast: 'sharp',
            filmGrain: 'none',
            noiseCharacter: 'Clean digital'
        },
        realism: {
            skinTexture: 'preserve all',
            imperfections: 'show all',
            sharpness: 'very sharp',
            lensDistortion: 'none'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 3. MOODY OVERCAST
    // ─────────────────────────────────────────────────────────────
    {
        id: 'moody_overcast',
        label: 'Moody Overcast',
        category: 'outdoor',
        scene: {
            location: 'Outdoor on cloudy day',
            foreground: 'Wet pavement, fallen leaves',
            midground: 'Trees, benches',
            background: 'Grey overcast sky, distant buildings'
        },
        lighting: {
            source: 'Diffused skylight through clouds',
            direction: 'front',
            quality: 'diffused',
            temperature: 6500,
            temperatureLabel: 'cool',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'flat',
            shadowAreas: 'Minimal shadows, even lighting',
            catchlights: 'Large, soft, diffused',
            skinHighlights: 'Matte, no hot spots'
        },
        colorGrade: {
            shadowTint: 'Teal/cyan',
            highlightTint: 'Desaturated grey',
            midtonePush: 'cool',
            saturation: 'muted',
            lookStyle: 'Scandinavian minimal, Fincher-esque'
        },
        texture: {
            contrast: 'low',
            microContrast: 'soft',
            filmGrain: 'medium',
            noiseCharacter: 'Filmic, organic'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'soft',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 4. NIGHT CAFÉ TUNGSTEN
    // ─────────────────────────────────────────────────────────────
    {
        id: 'night_cafe_tungsten',
        label: 'Night Café Tungsten',
        category: 'indoor',
        scene: {
            location: 'Indoor café at night',
            foreground: 'Wooden table, coffee cup',
            midground: 'Other tables, warm pendant lights',
            background: 'Dark windows showing night outside'
        },
        lighting: {
            source: 'Overhead tungsten pendant lights',
            direction: 'overhead',
            quality: 'soft',
            temperature: 2700,
            temperatureLabel: 'very warm',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'butterfly',
            shadowAreas: 'Soft shadow under nose and chin, warm fill everywhere',
            catchlights: 'Warm amber, circular from pendant',
            skinHighlights: 'Warm amber glow, intimate feel'
        },
        colorGrade: {
            shadowTint: 'Deep amber',
            highlightTint: 'Warm orange',
            midtonePush: 'warm',
            saturation: 'natural',
            lookStyle: 'Cinematic tungsten, Wong Kar-wai mood'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'coarse',
            noiseCharacter: 'High ISO look, grainy'
        },
        realism: {
            skinTexture: 'slightly soft',
            imperfections: 'natural',
            sharpness: 'soft',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 5. OFFICE FLUORESCENT
    // ─────────────────────────────────────────────────────────────
    {
        id: 'office_fluorescent',
        label: 'Office Fluorescent',
        category: 'indoor',
        scene: {
            location: 'Modern office cubicle',
            foreground: 'Desk, laptop, keyboard',
            midground: 'Cubicle partitions, other desks',
            background: 'White walls, glass partitions'
        },
        lighting: {
            source: 'Overhead fluorescent panels',
            direction: 'overhead',
            quality: 'hard',
            temperature: 6000,
            temperatureLabel: 'cool',
            intensity: 'bright'
        },
        faceLighting: {
            style: 'flat',
            shadowAreas: 'Slight shadow under chin, clinical even light',
            catchlights: 'Rectangular, from ceiling panels',
            skinHighlights: 'Even, slightly harsh'
        },
        colorGrade: {
            shadowTint: 'Slight green cast',
            highlightTint: 'Cool white',
            midtonePush: 'cool',
            saturation: 'muted',
            lookStyle: 'Corporate, clinical, Microsoft Teams call'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'sharp',
            filmGrain: 'none',
            noiseCharacter: 'Sterile digital'
        },
        realism: {
            skinTexture: 'preserve all',
            imperfections: 'show all',
            sharpness: 'sharp',
            lensDistortion: 'none'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 6. NEON NIGHT CITY
    // ─────────────────────────────────────────────────────────────
    {
        id: 'neon_night_city',
        label: 'Neon Night City',
        category: 'urban',
        scene: {
            location: 'City street at night',
            foreground: 'Wet pavement reflecting neon',
            midground: 'Shop signs, LED billboards',
            background: 'Dark buildings with lit windows'
        },
        lighting: {
            source: 'Mixed neon signs (pink, blue, green) + street lights',
            direction: 'mixed',
            quality: 'mixed',
            temperature: 4500,
            temperatureLabel: 'neutral',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'split',
            shadowAreas: 'One side lit by neon, other in shadow',
            catchlights: 'Colored neon reflections',
            skinHighlights: 'Color spill from neon (pink, blue)'
        },
        colorGrade: {
            shadowTint: 'Deep blue/purple',
            highlightTint: 'Pink/magenta from neon',
            midtonePush: 'cool',
            saturation: 'vibrant',
            lookStyle: 'Blade Runner, cyberpunk'
        },
        texture: {
            contrast: 'high',
            microContrast: 'sharp',
            filmGrain: 'medium',
            noiseCharacter: 'High ISO night photography'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'noticeable'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 7. MORNING WINDOW SOFT
    // ─────────────────────────────────────────────────────────────
    {
        id: 'morning_window_soft',
        label: 'Morning Window Light',
        category: 'indoor',
        scene: {
            location: 'Bedroom/living room near window',
            foreground: 'Curtains, furniture edge',
            midground: 'Room interior, plants',
            background: 'Window view, morning light'
        },
        lighting: {
            source: 'Large window, soft morning sun',
            direction: 'side',
            quality: 'soft',
            temperature: 5000,
            temperatureLabel: 'neutral',
            intensity: 'normal'
        },
        faceLighting: {
            style: 'loop',
            shadowAreas: 'Gentle shadow on far side, soft transition',
            catchlights: 'Large rectangular window reflection',
            skinHighlights: 'Soft, natural glow'
        },
        colorGrade: {
            shadowTint: 'Neutral grey',
            highlightTint: 'Slight warm',
            midtonePush: 'neutral',
            saturation: 'natural',
            lookStyle: 'Clean lifestyle, Kinfolk magazine'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'fine',
            noiseCharacter: 'Subtle, organic'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 8. STUDIO WHITE CLEAN
    // ─────────────────────────────────────────────────────────────
    {
        id: 'studio_white_clean',
        label: 'Studio White (E-commerce)',
        category: 'studio',
        scene: {
            location: 'White photography studio',
            foreground: 'Clean white floor',
            midground: 'Nothing, clean space',
            background: 'Pure white cyclorama'
        },
        lighting: {
            source: 'Softbox front + fill lights',
            direction: 'front',
            quality: 'soft',
            temperature: 5500,
            temperatureLabel: 'neutral',
            intensity: 'bright'
        },
        faceLighting: {
            style: 'flat',
            shadowAreas: 'Minimal, filled by reflectors',
            catchlights: 'Large softbox reflections',
            skinHighlights: 'Even, clean, product-style'
        },
        colorGrade: {
            shadowTint: 'Pure neutral',
            highlightTint: 'Clean white',
            midtonePush: 'neutral',
            saturation: 'natural',
            lookStyle: 'E-commerce catalog, Amazon listing'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'none',
            noiseCharacter: 'Ultra clean'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'minimal',
            sharpness: 'sharp',
            lensDistortion: 'none'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 9. INDIAN STREET MARKET
    // ─────────────────────────────────────────────────────────────
    {
        id: 'indian_street_market',
        label: 'Indian Street Market',
        category: 'urban',
        scene: {
            location: 'Busy Indian market street',
            foreground: 'Vegetable carts, goods on display',
            midground: 'Crowd, shops, hanging wires',
            background: 'Buildings, tarps, signboards'
        },
        lighting: {
            source: 'Harsh sun filtered through tarps',
            direction: 'overhead',
            quality: 'mixed',
            temperature: 5200,
            temperatureLabel: 'neutral',
            intensity: 'harsh'
        },
        faceLighting: {
            style: 'split',
            shadowAreas: 'Patchy shadows from overhead tarps',
            catchlights: 'Multiple small catchlights',
            skinHighlights: 'Sweaty sheen, natural'
        },
        colorGrade: {
            shadowTint: 'Warm brown',
            highlightTint: 'Slightly yellow',
            midtonePush: 'warm',
            saturation: 'vibrant',
            lookStyle: 'Documentary India, Steve McCurry'
        },
        texture: {
            contrast: 'high',
            microContrast: 'sharp',
            filmGrain: 'medium',
            noiseCharacter: 'Gritty, textured'
        },
        realism: {
            skinTexture: 'preserve all',
            imperfections: 'show all',
            sharpness: 'sharp',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 10. BEACH BRIGHT DAY
    // ─────────────────────────────────────────────────────────────
    {
        id: 'beach_bright_day',
        label: 'Beach Bright Day',
        category: 'outdoor',
        scene: {
            location: 'Beach during day',
            foreground: 'Sand texture',
            midground: 'Beach umbrellas, distant people',
            background: 'Ocean, blue sky'
        },
        lighting: {
            source: 'Bright sun + reflected light from sand',
            direction: 'overhead',
            quality: 'hard',
            temperature: 5600,
            temperatureLabel: 'neutral',
            intensity: 'harsh'
        },
        faceLighting: {
            style: 'butterfly',
            shadowAreas: 'Under brows, strong fill from sand reflection',
            catchlights: 'Bright, small, sun position',
            skinHighlights: 'Bright, slightly tan glow'
        },
        colorGrade: {
            shadowTint: 'Warm tan',
            highlightTint: 'Bright, slight yellow',
            midtonePush: 'warm',
            saturation: 'vibrant',
            lookStyle: 'Summer vacation, saturated blues'
        },
        texture: {
            contrast: 'high',
            microContrast: 'sharp',
            filmGrain: 'none',
            noiseCharacter: 'Clean summer look'
        },
        realism: {
            skinTexture: 'preserve all',
            imperfections: 'natural',
            sharpness: 'sharp',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 11. FOGGY MORNING PARK
    // ─────────────────────────────────────────────────────────────
    {
        id: 'foggy_morning_park',
        label: 'Foggy Morning Park',
        category: 'outdoor',
        scene: {
            location: 'Park in early morning fog',
            foreground: 'Grass with dew',
            midground: 'Trees fading into mist',
            background: 'Fog, silhouettes'
        },
        lighting: {
            source: 'Diffused sun through fog',
            direction: 'back',
            quality: 'diffused',
            temperature: 5800,
            temperatureLabel: 'neutral',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'rim',
            shadowAreas: 'Face mostly in soft shadow, rim light on edges',
            catchlights: 'Soft, diffused',
            skinHighlights: 'Subtle rim glow, matte face'
        },
        colorGrade: {
            shadowTint: 'Cool grey-blue',
            highlightTint: 'Desaturated white',
            midtonePush: 'cool',
            saturation: 'muted',
            lookStyle: 'Ethereal, dreamy, soft'
        },
        texture: {
            contrast: 'low',
            microContrast: 'soft',
            filmGrain: 'medium',
            noiseCharacter: 'Soft, atmospheric'
        },
        realism: {
            skinTexture: 'slightly soft',
            imperfections: 'natural',
            sharpness: 'soft',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 12. DIWALI FESTIVE
    // ─────────────────────────────────────────────────────────────
    {
        id: 'diwali_festive',
        label: 'Diwali Festive',
        category: 'lifestyle',
        scene: {
            location: 'Home decorated for Diwali',
            foreground: 'Diyas, rangoli',
            midground: 'String lights, decorations',
            background: 'Decorated interior, fairy lights'
        },
        lighting: {
            source: 'Mixed diyas + fairy lights + ambient',
            direction: 'mixed',
            quality: 'soft',
            temperature: 2800,
            temperatureLabel: 'very warm',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'loop',
            shadowAreas: 'Warm soft shadows, multiple light sources',
            catchlights: 'Multiple warm points from diyas',
            skinHighlights: 'Golden, festive glow'
        },
        colorGrade: {
            shadowTint: 'Deep warm orange',
            highlightTint: 'Bright gold',
            midtonePush: 'warm',
            saturation: 'vibrant',
            lookStyle: 'Festive, celebratory, rich'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'fine',
            noiseCharacter: 'Warm, filmic'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 13. COWORKING MODERN
    // ─────────────────────────────────────────────────────────────
    {
        id: 'coworking_modern',
        label: 'Modern Co-working Space',
        category: 'indoor',
        scene: {
            location: 'Trendy co-working space',
            foreground: 'Laptop, coffee, plants',
            midground: 'Designer furniture, people working',
            background: 'Exposed brick, industrial windows'
        },
        lighting: {
            source: 'Large windows + pendant industrial lights',
            direction: 'side',
            quality: 'mixed',
            temperature: 4500,
            temperatureLabel: 'neutral',
            intensity: 'normal'
        },
        faceLighting: {
            style: 'loop',
            shadowAreas: 'Natural side shadow, warm fill',
            catchlights: 'Window + pendant combo',
            skinHighlights: 'Natural, healthy glow'
        },
        colorGrade: {
            shadowTint: 'Warm brown',
            highlightTint: 'Clean white',
            midtonePush: 'neutral',
            saturation: 'natural',
            lookStyle: 'WeWork aesthetic, startup vibe'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'fine',
            noiseCharacter: 'Modern, clean'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 14. EVENING TERRACE BLUE HOUR
    // ─────────────────────────────────────────────────────────────
    {
        id: 'evening_terrace_bluehour',
        label: 'Blue Hour Terrace',
        category: 'outdoor',
        scene: {
            location: 'Terrace at dusk (blue hour)',
            foreground: 'Terrace railing, potted plants',
            midground: 'Terrace furniture',
            background: 'City lights, deep blue sky'
        },
        lighting: {
            source: 'Blue hour sky + city lights + indoor spill',
            direction: 'mixed',
            quality: 'soft',
            temperature: 7000,
            temperatureLabel: 'very cool',
            intensity: 'dim'
        },
        faceLighting: {
            style: 'flat',
            shadowAreas: 'Even blue fill, warm accents from city lights',
            catchlights: 'Blue-ish, from sky',
            skinHighlights: 'Cool blue with warm touches'
        },
        colorGrade: {
            shadowTint: 'Deep blue',
            highlightTint: 'Warm orange (city lights)',
            midtonePush: 'cool',
            saturation: 'natural',
            lookStyle: 'Blue hour magic, cinematic'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'natural',
            filmGrain: 'medium',
            noiseCharacter: 'Low-light filmic'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'natural',
            lensDistortion: 'subtle'
        }
    },

    // ─────────────────────────────────────────────────────────────
    // 15. MINIMAL GREY STUDIO
    // ─────────────────────────────────────────────────────────────
    {
        id: 'minimal_grey_studio',
        label: 'Minimal Grey Studio',
        category: 'studio',
        scene: {
            location: 'Grey seamless backdrop studio',
            foreground: 'Grey floor',
            midground: 'Clean space',
            background: 'Medium grey seamless'
        },
        lighting: {
            source: 'Large softbox at 45 degrees',
            direction: 'side',
            quality: 'soft',
            temperature: 5500,
            temperatureLabel: 'neutral',
            intensity: 'normal'
        },
        faceLighting: {
            style: 'rembrandt',
            shadowAreas: 'Classic rembrandt triangle, defined but soft',
            catchlights: 'Large softbox at 10 o\'clock',
            skinHighlights: 'Natural, defined cheekbones'
        },
        colorGrade: {
            shadowTint: 'Neutral grey',
            highlightTint: 'Clean neutral',
            midtonePush: 'neutral',
            saturation: 'muted',
            lookStyle: 'Editorial, fashion magazine'
        },
        texture: {
            contrast: 'medium',
            microContrast: 'sharp',
            filmGrain: 'fine',
            noiseCharacter: 'Professional studio'
        },
        realism: {
            skinTexture: 'natural',
            imperfections: 'natural',
            sharpness: 'sharp',
            lensDistortion: 'none'
        }
    }
]

// ═══════════════════════════════════════════════════════════════
// PRESET LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getDiversePreset(id: string): ComprehensivePreset | undefined {
    return DIVERSE_PRESETS.find(p => p.id === id)
}

export function getDiversePresetsByCategory(category: ComprehensivePreset['category']): ComprehensivePreset[] {
    return DIVERSE_PRESETS.filter(p => p.category === category)
}

export function getAllDiversePresets(): ComprehensivePreset[] {
    return DIVERSE_PRESETS
}

// ═══════════════════════════════════════════════════════════════
// CONVERT PRESET TO PROMPT
// ═══════════════════════════════════════════════════════════════

export function buildPresetPrompt(preset: ComprehensivePreset): string {
    return `
═══════════════════════════════════════════════════════════════
PRESET: ${preset.label.toUpperCase()}
═══════════════════════════════════════════════════════════════

SCENE:
• Location: ${preset.scene.location}
• Foreground: ${preset.scene.foreground}
• Midground: ${preset.scene.midground}
• Background: ${preset.scene.background}

LIGHTING PHYSICS:
• Source: ${preset.lighting.source}
• Direction: ${preset.lighting.direction}
• Quality: ${preset.lighting.quality}
• Color temperature: ${preset.lighting.temperature}K (${preset.lighting.temperatureLabel})
• Intensity: ${preset.lighting.intensity}

FACE LIGHTING:
• Style: ${preset.faceLighting.style}
• Shadow areas: ${preset.faceLighting.shadowAreas}
• Catchlights: ${preset.faceLighting.catchlights}
• Skin highlights: ${preset.faceLighting.skinHighlights}

COLOR GRADING:
• Shadow tint: ${preset.colorGrade.shadowTint}
• Highlight tint: ${preset.colorGrade.highlightTint}
• Midtone push: ${preset.colorGrade.midtonePush}
• Saturation: ${preset.colorGrade.saturation}
• Look style: ${preset.colorGrade.lookStyle}

TEXTURE & CONTRAST:
• Contrast: ${preset.texture.contrast}
• Micro-contrast: ${preset.texture.microContrast}
• Film grain: ${preset.texture.filmGrain}
• Noise: ${preset.texture.noiseCharacter}

REALISM:
• Skin texture: ${preset.realism.skinTexture}
• Imperfections: ${preset.realism.imperfections}
• Sharpness: ${preset.realism.sharpness}
• Lens distortion: ${preset.realism.lensDistortion}
`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logPresetSelection(preset: ComprehensivePreset, sessionId: string): void {
    console.log(`\n🎬 PRESET SELECTED [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📍 ${preset.label} (${preset.category})`)
    console.log(`   💡 Light: ${preset.lighting.temperature}K ${preset.lighting.temperatureLabel}`)
    console.log(`   🎨 Grade: ${preset.colorGrade.lookStyle}`)
    console.log(`   📊 Contrast: ${preset.texture.contrast}`)
}
