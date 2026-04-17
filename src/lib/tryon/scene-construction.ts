/**
 * SCENE CONSTRUCTION
 * 
 * CORE PRINCIPLE: Scenes are BUILT, not painted.
 * 
 * Each scene has:
 * - Architecture type
 * - Foreground objects (tables, chairs, scooters)
 * - Midground elements (people, plants, furniture)
 * - Background depth (streets, windows, walls)
 * - Light source direction + softness
 * - Ambient occlusion
 * 
 * This is STRUCTURAL SCENE CONSTRUCTION, not "add a background".
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// SCENE CONSTRUCTION SCHEMA
// ═══════════════════════════════════════════════════════════════

export interface SceneSchema {
    id: string
    name: string
    architecture: {
        type: string
        materials: string[]
        era: string
    }
    foreground: {
        objects: string[]
        distance: string
        interaction: string
    }
    midground: {
        elements: string[]
        density: 'sparse' | 'moderate' | 'busy'
    }
    background: {
        type: string
        depth: 'shallow' | 'medium' | 'deep'
        blur: 'none' | 'subtle' | 'bokeh'
    }
    lighting: {
        source: string
        direction: string
        softness: 'hard' | 'soft' | 'mixed'
        temperature: 'warm' | 'neutral' | 'cool'
        intensity: 'dim' | 'normal' | 'bright'
    }
    ambience: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
        mood: string
        weather: 'clear' | 'overcast' | 'rain' | 'fog'
    }
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURAL SCENE PRESETS
// ═══════════════════════════════════════════════════════════════

export const SCENE_SCHEMAS: Record<string, SceneSchema> = {
    urban_street: {
        id: 'urban_street',
        name: 'Urban Street',
        architecture: {
            type: 'Commercial street buildings',
            materials: ['concrete', 'glass', 'metal shutters'],
            era: 'Contemporary mixed'
        },
        foreground: {
            objects: ['parked scooter', 'road markings', 'drain cover'],
            distance: '2-3 meters',
            interaction: 'Person stands near but not on objects'
        },
        midground: {
            elements: ['shop fronts', 'parked vehicles', 'distant pedestrians'],
            density: 'moderate'
        },
        background: {
            type: 'Street receding into distance',
            depth: 'deep',
            blur: 'subtle'
        },
        lighting: {
            source: 'Natural daylight + reflections from buildings',
            direction: 'Above and slightly behind',
            softness: 'mixed',
            temperature: 'neutral',
            intensity: 'bright'
        },
        ambience: {
            timeOfDay: 'afternoon',
            mood: 'Everyday urban life',
            weather: 'clear'
        }
    },

    cafe_interior: {
        id: 'cafe_interior',
        name: 'Café Interior',
        architecture: {
            type: 'Cozy indoor café',
            materials: ['wood', 'brick', 'plants'],
            era: 'Modern casual'
        },
        foreground: {
            objects: ['table edge', 'coffee cup', 'menu'],
            distance: '1-2 meters',
            interaction: 'Person near table, natural pose'
        },
        midground: {
            elements: ['other tables', 'counter', 'shelving with products'],
            density: 'moderate'
        },
        background: {
            type: 'Café depth with window light',
            depth: 'medium',
            blur: 'bokeh'
        },
        lighting: {
            source: 'Large windows + pendant lights',
            direction: 'Side lighting from window',
            softness: 'soft',
            temperature: 'warm',
            intensity: 'normal'
        },
        ambience: {
            timeOfDay: 'morning',
            mood: 'Relaxed weekend',
            weather: 'clear'
        }
    },

    office_modern: {
        id: 'office_modern',
        name: 'Modern Office',
        architecture: {
            type: 'Contemporary office space',
            materials: ['glass', 'white walls', 'wood desks'],
            era: 'Modern minimalist'
        },
        foreground: {
            objects: ['desk corner', 'laptop', 'plant'],
            distance: '1-2 meters',
            interaction: 'Person standing or leaning near desk'
        },
        midground: {
            elements: ['office chairs', 'shelving', 'colleagues blurred'],
            density: 'sparse'
        },
        background: {
            type: 'Office space with window wall',
            depth: 'medium',
            blur: 'subtle'
        },
        lighting: {
            source: 'Large windows + overhead panels',
            direction: 'Front and above',
            softness: 'soft',
            temperature: 'cool',
            intensity: 'bright'
        },
        ambience: {
            timeOfDay: 'afternoon',
            mood: 'Professional casual',
            weather: 'clear'
        }
    },

    outdoor_nature: {
        id: 'outdoor_nature',
        name: 'Outdoor Nature',
        architecture: {
            type: 'Natural outdoor setting',
            materials: ['trees', 'grass', 'natural paths'],
            era: 'N/A'
        },
        foreground: {
            objects: ['grass', 'fallen leaves', 'path edge'],
            distance: '2-4 meters',
            interaction: 'Person walking or standing naturally'
        },
        midground: {
            elements: ['trees', 'bushes', 'distant figures'],
            density: 'moderate'
        },
        background: {
            type: 'Forest/park receding',
            depth: 'deep',
            blur: 'subtle'
        },
        lighting: {
            source: 'Dappled sunlight through trees',
            direction: 'Above with speckled shadows',
            softness: 'mixed',
            temperature: 'warm',
            intensity: 'normal'
        },
        ambience: {
            timeOfDay: 'morning',
            mood: 'Peaceful outdoors',
            weather: 'clear'
        }
    },

    rooftop_sunset: {
        id: 'rooftop_sunset',
        name: 'Rooftop Golden Hour',
        architecture: {
            type: 'Urban rooftop',
            materials: ['concrete', 'metal railings', 'city skyline'],
            era: 'Modern urban'
        },
        foreground: {
            objects: ['railing', 'potted plants', 'rooftop furniture'],
            distance: '1-3 meters',
            interaction: 'Person leaning on railing or standing'
        },
        midground: {
            elements: ['other rooftop structures', 'AC units', 'antennas'],
            density: 'sparse'
        },
        background: {
            type: 'City skyline at sunset',
            depth: 'deep',
            blur: 'subtle'
        },
        lighting: {
            source: 'Setting sun on horizon',
            direction: 'Behind and side (rim light)',
            softness: 'soft',
            temperature: 'warm',
            intensity: 'dim'
        },
        ambience: {
            timeOfDay: 'evening',
            mood: 'Golden hour magic',
            weather: 'clear'
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// SCENE CONSTRUCTION PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildSceneConstructionPrompt(schema: SceneSchema): string {
    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🏗️ SCENE CONSTRUCTION: ${schema.name.toUpperCase()}                        
╚═══════════════════════════════════════════════════════════════════════════════╝

This scene must be BUILT structurally, not painted decoratively.

═══════════════════════════════════════════════════════════════════════════════
ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════
Type: ${schema.architecture.type}
Materials: ${schema.architecture.materials.join(', ')}
Era: ${schema.architecture.era}

Build this architecture FIRST. It is the skeleton of the scene.

═══════════════════════════════════════════════════════════════════════════════
FOREGROUND (${schema.foreground.distance})
═══════════════════════════════════════════════════════════════════════════════
Objects: ${schema.foreground.objects.join(', ')}
Interaction: ${schema.foreground.interaction}

These objects establish DEPTH and make the scene feel real.

═══════════════════════════════════════════════════════════════════════════════
MIDGROUND
═══════════════════════════════════════════════════════════════════════════════
Elements: ${schema.midground.elements.join(', ')}
Density: ${schema.midground.density}

This layer separates foreground from background.

═══════════════════════════════════════════════════════════════════════════════
BACKGROUND (${schema.background.depth} depth)
═══════════════════════════════════════════════════════════════════════════════
Type: ${schema.background.type}
Blur: ${schema.background.blur}

The background establishes WHERE we are.

═══════════════════════════════════════════════════════════════════════════════
LIGHTING
═══════════════════════════════════════════════════════════════════════════════
Source: ${schema.lighting.source}
Direction: ${schema.lighting.direction}
Softness: ${schema.lighting.softness}
Temperature: ${schema.lighting.temperature}
Intensity: ${schema.lighting.intensity}

Lighting must be CONSISTENT across the entire image.
The light hits the person AND the environment from the same source.

═══════════════════════════════════════════════════════════════════════════════
AMBIENCE
═══════════════════════════════════════════════════════════════════════════════
Time: ${schema.ambience.timeOfDay}
Mood: ${schema.ambience.mood}
Weather: ${schema.ambience.weather}

═══════════════════════════════════════════════════════════════════════════════
SCENE REALISM RULES
═══════════════════════════════════════════════════════════════════════════════

✗ NO "studio backdrop" feel
✗ NO pastel/creamy aesthetic override
✗ NO floating person on generic background
✗ NO depth mismatch between person and scene

✓ Person is IN the scene, not PLACED IN FRONT of it
✓ Shadows fall naturally on ground/surfaces
✓ Lighting affects person and environment equally
✓ Depth of field is consistent
`
}

// ═══════════════════════════════════════════════════════════════
// ANTI-PASTEL DIVERSITY
// ═══════════════════════════════════════════════════════════════

export const ANTI_PASTEL_DIVERSITY = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║     🎨 ANTI-PASTEL DIVERSITY MANDATE                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

The current system over-biases toward:
• Creamy tones
• Soft pastels
• Lifestyle catalog aesthetics
• Homogeneous "Instagram filter" look

This is BANNED for this generation.

═══════════════════════════════════════════════════════════════════════════════
LIGHTING DIVERSITY (MUST VARY)
═══════════════════════════════════════════════════════════════════════════════
• Neutral daylight (5500K)
• Warm tungsten (3200K)
• Cool overcast (6500K+)
• Harsh midday sun (hard shadows)
• Foggy diffused (no direct light)
• Urban mixed (neon + daylight)

═══════════════════════════════════════════════════════════════════════════════
CONTRAST DIVERSITY (MUST VARY)
═══════════════════════════════════════════════════════════════════════════════
• High contrast (deep blacks, bright highlights)
• Medium contrast (natural range)
• Low contrast (flat, overcast)

═══════════════════════════════════════════════════════════════════════════════
SHADOW PRESENCE (MUST EXIST)
═══════════════════════════════════════════════════════════════════════════════
• Natural shadows on ground
• Cast shadows from objects
• Facial shadows (under nose, chin)
• Body shadows

NO flat, shadowless AI studio lighting.
Real photos have shadows.
`

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logSceneConstruction(sessionId: string, schemaId: string): void {
    const schema = SCENE_SCHEMAS[schemaId]
    console.log(`\n🏗️ SCENE CONSTRUCTION [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   🎬 Scene: ${schema?.name || schemaId}`)
    if (schema) {
        console.log(`   🏛️ Architecture: ${schema.architecture.type}`)
        console.log(`   💡 Lighting: ${schema.lighting.source}`)
        console.log(`   🌡️ Temperature: ${schema.lighting.temperature}`)
        console.log(`   🕐 Time: ${schema.ambience.timeOfDay}`)
    }
}
