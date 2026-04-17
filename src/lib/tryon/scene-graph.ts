/**
 * SCENE GRAPH - Structured Background Architecture
 * 
 * Replaces flat prompts with structured scene specifications.
 * Backgrounds must feel like real places, not AI vibes.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE GRAPH INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SceneGraph {
    id: string
    name: string
    architecture: string[]
    materials: string[]
    props: string[]
    depth: {
        foreground: string
        midground: string
        background: string
    }
    ambient_life: string
    lighting_context: string
    time_of_day: 'morning' | 'midday' | 'afternoon' | 'golden_hour' | 'evening' | 'night'
    weather: 'clear' | 'cloudy' | 'overcast' | 'foggy' | 'rainy' | 'harsh_sun'
    region: 'india' | 'urban_global' | 'european' | 'asian_modern' | 'american' | 'neutral'
    avoid: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE GRAPH LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export const SCENE_LIBRARY: Record<string, SceneGraph> = {
    indian_street: {
        id: 'indian_street',
        name: 'Indian Street',
        architecture: ['narrow buildings', 'aged shopfronts', 'painted walls', 'balconies with railings'],
        materials: ['painted brick', 'dusty asphalt', 'metal shutters', 'weathered wood', 'concrete'],
        props: ['parked scooters', 'signboards', 'overhead wires', 'potted plants', 'charpoy'],
        depth: {
            foreground: 'street elements, scooter handles, signboard edges',
            midground: 'shopfronts, walking pedestrians, auto-rickshaw',
            background: 'buildings, overhead wires, distant temple spire'
        },
        ambient_life: 'distant pedestrians, subtle chaos, vendor activity',
        lighting_context: 'natural daylight with pollution haze, warm undertones',
        time_of_day: 'afternoon',
        weather: 'clear',
        region: 'india',
        avoid: ['too clean', 'western architecture', 'empty streets', 'generic backgrounds']
    },

    courtyard_garden: {
        id: 'courtyard_garden',
        name: 'Courtyard Garden',
        architecture: ['courtyard walls', 'arched doorways', 'stone columns', 'tiled floor'],
        materials: ['terracotta pots', 'stone pavers', 'whitewashed walls', 'wooden door frames'],
        props: ['potted plants', 'climbing vines', 'iron garden furniture', 'water feature'],
        depth: {
            foreground: 'plant leaves, pot edges',
            midground: 'seating area, main plants',
            background: 'courtyard walls, arched doorway, sky glimpse'
        },
        ambient_life: 'butterflies, falling leaves, dappled shadows',
        lighting_context: 'dappled light through trees, soft shadows',
        time_of_day: 'morning',
        weather: 'clear',
        region: 'india',
        avoid: ['overgrown plants', 'dirt', 'clutter', 'dark corners']
    },

    modern_cafe: {
        id: 'modern_cafe',
        name: 'Modern Café',
        architecture: ['large windows', 'exposed brick accent wall', 'pendant lighting', 'bar counter'],
        materials: ['polished concrete floor', 'wood tables', 'metal chairs', 'glass panels'],
        props: ['coffee cups', 'menu boards', 'plants in ceramic pots', 'laptop users'],
        depth: {
            foreground: 'table edge, coffee cup',
            midground: 'seating area, bar counter',
            background: 'window view, pendant lights, other patrons'
        },
        ambient_life: 'quiet conversation, barista activity, soft music implied',
        lighting_context: 'warm tungsten from pendants, natural window light',
        time_of_day: 'afternoon',
        weather: 'overcast',
        region: 'urban_global',
        avoid: ['harsh fluorescent', 'empty cafe', 'sterile feeling']
    },

    studio_minimal: {
        id: 'studio_minimal',
        name: 'Minimal Studio',
        architecture: ['seamless backdrop', 'clean walls', 'professional setup'],
        materials: ['paper backdrop', 'polished floor', 'neutral tones'],
        props: ['minimal - focus on subject'],
        depth: {
            foreground: 'none - clean',
            midground: 'subject only',
            background: 'gradient backdrop, soft vignette'
        },
        ambient_life: 'none - controlled environment',
        lighting_context: 'professional studio lighting, softboxes, fill lights',
        time_of_day: 'midday',
        weather: 'clear',
        region: 'neutral',
        avoid: ['shadows on backdrop', 'visible equipment', 'harsh edges']
    },

    urban_rooftop: {
        id: 'urban_rooftop',
        name: 'Urban Rooftop',
        architecture: ['rooftop edge', 'city skyline', 'water tanks', 'antenna'],
        materials: ['concrete floor', 'metal railings', 'brick parapet', 'weathered surfaces'],
        props: ['potted plants', 'fairy lights', 'outdoor furniture', 'clotheslines'],
        depth: {
            foreground: 'railing, potted plant',
            midground: 'rooftop elements, water tank',
            background: 'city skyline, distant buildings, sky'
        },
        ambient_life: 'distant traffic sounds, birds, city hum',
        lighting_context: 'open sky light, city pollution glow',
        time_of_day: 'golden_hour',
        weather: 'clear',
        region: 'india',
        avoid: ['dangerous edges', 'cluttered mess', 'too urban-gritty']
    },

    temple_complex: {
        id: 'temple_complex',
        name: 'Temple Complex',
        architecture: ['carved pillars', 'gopuram in distance', 'mandapa', 'stone steps'],
        materials: ['carved granite', 'polished stone floor', 'brass lamps', 'flower garlands'],
        props: ['oil lamps', 'flower offerings', 'temple elephant distant', 'devotees'],
        depth: {
            foreground: 'carved pillar edge, flower petals',
            midground: 'mandapa, brass lamp',
            background: 'gopuram, sky, distant structures'
        },
        ambient_life: 'devotees walking, temple bells, incense smoke',
        lighting_context: 'warm morning light, oil lamp glow, stone reflections',
        time_of_day: 'morning',
        weather: 'clear',
        region: 'india',
        avoid: ['crowds covering subject', 'too dark', 'disrespectful framing']
    },

    beach_sunset: {
        id: 'beach_sunset',
        name: 'Beach Sunset',
        architecture: ['shoreline', 'distant hills or structures', 'fishing boats'],
        materials: ['sand', 'wet sand near water', 'wooden boat', 'rope nets'],
        props: ['fishing boats', 'coconut trees', 'beach vendors distant', 'shells'],
        depth: {
            foreground: 'sand texture, shell, footprints',
            midground: 'fishing boat, coconut shadow',
            background: 'ocean, setting sun, distant horizon'
        },
        ambient_life: 'waves, distant fishermen, seagulls',
        lighting_context: 'golden hour, warm orange, long shadows',
        time_of_day: 'golden_hour',
        weather: 'clear',
        region: 'india',
        avoid: ['crowded beach', 'plastic waste', 'harsh midday sun']
    },

    heritage_haveli: {
        id: 'heritage_haveli',
        name: 'Heritage Haveli',
        architecture: ['carved jharokhas', 'ornate doorways', 'inner courtyard', 'frescoed walls'],
        materials: ['sandstone', 'lime plaster', 'carved wood', 'brass fixtures', 'mirror work'],
        props: ['antique furniture', 'brass vessels', 'cushioned seating', 'traditional carpets'],
        depth: {
            foreground: 'carved column, brass vessel',
            midground: 'seating area, arched doorway',
            background: 'courtyard glimpse, sky through jharokha'
        },
        ambient_life: 'peaceful, occasional bird song, distant courtyard sounds',
        lighting_context: 'natural light through jharokhas, warm interior',
        time_of_day: 'afternoon',
        weather: 'clear',
        region: 'india',
        avoid: ['modern elements', 'cluttered antiques', 'museum feeling']
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE GRAPH TO PROMPT
// ═══════════════════════════════════════════════════════════════════════════════

export function buildScenePrompt(scene: SceneGraph): string {
    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    SCENE GRAPH: ${scene.name.toUpperCase()}
╚═══════════════════════════════════════════════════════════════════════════════╝

ARCHITECTURE (MUST INCLUDE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.architecture.map(a => `• ${a}`).join('\n')}

MATERIALS (VISIBLE TEXTURES):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.materials.map(m => `• ${m}`).join('\n')}

PROPS (ENVIRONMENTAL DETAILS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.props.map(p => `• ${p}`).join('\n')}

DEPTH LAYERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• FOREGROUND: ${scene.depth.foreground}
• MIDGROUND: ${scene.depth.midground}
• BACKGROUND: ${scene.depth.background}

AMBIENT LIFE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.ambient_life}

LIGHTING CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Time: ${scene.time_of_day}
• Weather: ${scene.weather}
• Light: ${scene.lighting_context}

AVOID (DO NOT INCLUDE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.avoid.map(a => `✗ ${a}`).join('\n')}

════════════════════════════════════════════════════════════════════════════════
SCENE VALIDATION:
════════════════════════════════════════════════════════════════════════════════
If key architectural elements are MISSING → scene FAILS.
If materials look generic/AI-generated → scene FAILS.
If depth layers are flat → scene FAILS.
The background must feel LIVED-IN, not generated.
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET SCENE BY ID OR CREATE CUSTOM
// ═══════════════════════════════════════════════════════════════════════════════

export function getSceneById(sceneId: string): SceneGraph | undefined {
    return SCENE_LIBRARY[sceneId]
}

export function getScenePromptById(sceneId: string): string | undefined {
    const scene = getSceneById(sceneId)
    if (!scene) return undefined
    return buildScenePrompt(scene)
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

export function logSceneGraph(scene: SceneGraph): void {
    console.log(`\n🏛️ SCENE GRAPH: ${scene.name}`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   🏗️ Architecture: ${scene.architecture.slice(0, 3).join(', ')}...`)
    console.log(`   🧱 Materials: ${scene.materials.slice(0, 3).join(', ')}...`)
    console.log(`   ☀️ Lighting: ${scene.lighting_context}`)
    console.log(`   🌍 Region: ${scene.region}`)
    console.log(`   ═══════════════════════════════════════════════`)
}
