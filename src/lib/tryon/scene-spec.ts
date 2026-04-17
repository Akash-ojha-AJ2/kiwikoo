/**
 * SCENE SPECIFICATION SYSTEM
 * 
 * Structural scene definitions instead of text prompts.
 * Scenes are built with architecture, materials, props, and depth layers.
 * Presets define REQUIRED and FORBIDDEN objects.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE SPECIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArchitectureSpec {
    style: string
    structures: string[]
    walls?: string
    floor?: string
    ceiling?: string
}

export interface MaterialSpec {
    name: string
    surface: 'matte' | 'satin' | 'glossy' | 'rough' | 'textured'
    color?: string
}

export interface PropSpec {
    name: string
    placement: 'foreground' | 'midground' | 'background'
    required: boolean
}

export interface DepthLayer {
    layer: 'foreground' | 'midground' | 'background'
    elements: string[]
    blur: 'sharp' | 'slight' | 'medium' | 'heavy'
}

export interface LightingModel {
    type: 'natural' | 'artificial' | 'mixed'
    source: string
    direction: 'front' | 'side' | 'back' | 'top' | 'ambient'
    colorTemp: number  // Kelvin
    intensity: 'low' | 'medium' | 'high'
    shadows: 'none' | 'soft' | 'medium' | 'hard'
}

export interface CameraModel {
    lens: string      // e.g., "50mm", "85mm"
    framing: 'full-body' | 'three-quarter' | 'half-body' | 'close-up'
    angle: 'eye-level' | 'slightly-low' | 'slightly-high'
    dof: 'shallow' | 'medium' | 'deep'
}

export interface SceneSpecification {
    id: string
    name: string
    location: string
    architecture: ArchitectureSpec
    materials: MaterialSpec[]
    props: PropSpec[]
    clutterLevel: 'minimal' | 'light' | 'moderate' | 'heavy'
    peopleDensity: 'none' | 'sparse' | 'few' | 'moderate'
    depthLayers: DepthLayer[]
    lightingModel: LightingModel
    cameraModel: CameraModel
    requiredObjects: string[]
    forbiddenObjects: string[]
    region: 'india' | 'global' | 'any'
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE LIBRARY - Structural Definitions
// ═══════════════════════════════════════════════════════════════════════════════

export const SCENE_LIBRARY: Record<string, SceneSpecification> = {

    // ─────────────────────────────────────────────────────────────────────────────
    // INDIA SCENES
    // ─────────────────────────────────────────────────────────────────────────────

    india_street_morning: {
        id: 'india_street_morning',
        name: 'Indian Street - Morning',
        location: 'Indian urban street',
        architecture: {
            style: 'Indian urban',
            structures: ['old buildings with balconies', 'shop fronts', 'overhead wires'],
            walls: 'painted plaster in faded colors',
            floor: 'concrete sidewalk with weathering'
        },
        materials: [
            { name: 'painted_plaster', surface: 'textured', color: 'ochre/blue/green faded' },
            { name: 'concrete', surface: 'rough' },
            { name: 'metal_shutters', surface: 'rough', color: 'rust or painted' }
        ],
        props: [
            { name: 'parked_scooter', placement: 'midground', required: false },
            { name: 'chai_stall', placement: 'background', required: false },
            { name: 'shop_signs', placement: 'background', required: true },
            { name: 'plants_in_pots', placement: 'foreground', required: false }
        ],
        clutterLevel: 'moderate',
        peopleDensity: 'sparse',
        depthLayers: [
            { layer: 'foreground', elements: ['street edge', 'nearby objects'], blur: 'sharp' },
            { layer: 'midground', elements: ['buildings', 'shops'], blur: 'slight' },
            { layer: 'background', elements: ['distant buildings', 'sky'], blur: 'medium' }
        ],
        lightingModel: {
            type: 'natural',
            source: 'morning sun',
            direction: 'side',
            colorTemp: 4500,
            intensity: 'medium',
            shadows: 'medium'
        },
        cameraModel: {
            lens: '50mm',
            framing: 'full-body',
            angle: 'eye-level',
            dof: 'medium'
        },
        requiredObjects: ['buildings', 'street'],
        forbiddenObjects: ['western_brands', 'snow', 'cherry_blossoms'],
        region: 'india'
    },

    india_courtyard: {
        id: 'india_courtyard',
        name: 'Indian Courtyard - Golden Hour',
        location: 'Traditional Indian courtyard',
        architecture: {
            style: 'Traditional Indian',
            structures: ['courtyard walls', 'arched doorways', 'jharokhas'],
            walls: 'lime plaster with age patina',
            floor: 'stone or tile flooring'
        },
        materials: [
            { name: 'lime_plaster', surface: 'textured', color: 'white/cream aged' },
            { name: 'sandstone', surface: 'rough' },
            { name: 'wood_carved', surface: 'satin' }
        ],
        props: [
            { name: 'potted_tulsi', placement: 'foreground', required: true },
            { name: 'brass_lamp', placement: 'midground', required: false },
            { name: 'rangoli', placement: 'foreground', required: false },
            { name: 'wooden_door', placement: 'background', required: true }
        ],
        clutterLevel: 'light',
        peopleDensity: 'none',
        depthLayers: [
            { layer: 'foreground', elements: ['floor pattern', 'plants'], blur: 'sharp' },
            { layer: 'midground', elements: ['courtyard space'], blur: 'sharp' },
            { layer: 'background', elements: ['walls', 'doorways'], blur: 'slight' }
        ],
        lightingModel: {
            type: 'natural',
            source: 'golden hour sun',
            direction: 'side',
            colorTemp: 3500,
            intensity: 'medium',
            shadows: 'soft'
        },
        cameraModel: {
            lens: '85mm',
            framing: 'three-quarter',
            angle: 'eye-level',
            dof: 'shallow'
        },
        requiredObjects: ['courtyard', 'traditional_architecture'],
        forbiddenObjects: ['modern_furniture', 'electronics', 'western_decor'],
        region: 'india'
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // GLOBAL SCENES
    // ─────────────────────────────────────────────────────────────────────────────

    modern_cafe: {
        id: 'modern_cafe',
        name: 'Modern Café',
        location: 'Contemporary café interior',
        architecture: {
            style: 'Modern minimalist',
            structures: ['large windows', 'clean walls', 'marble counter'],
            walls: 'white or light gray',
            floor: 'polished concrete or wood'
        },
        materials: [
            { name: 'marble', surface: 'glossy', color: 'white with gray veins' },
            { name: 'glass', surface: 'glossy' },
            { name: 'wood', surface: 'satin', color: 'light oak' }
        ],
        props: [
            { name: 'coffee_cup', placement: 'foreground', required: false },
            { name: 'plants', placement: 'midground', required: true },
            { name: 'pendant_lights', placement: 'background', required: true },
            { name: 'wooden_chairs', placement: 'midground', required: false }
        ],
        clutterLevel: 'minimal',
        peopleDensity: 'sparse',
        depthLayers: [
            { layer: 'foreground', elements: ['table edge', 'nearby objects'], blur: 'slight' },
            { layer: 'midground', elements: ['café interior'], blur: 'sharp' },
            { layer: 'background', elements: ['windows', 'outside view'], blur: 'medium' }
        ],
        lightingModel: {
            type: 'mixed',
            source: 'large windows + pendant lights',
            direction: 'front',
            colorTemp: 5000,
            intensity: 'medium',
            shadows: 'soft'
        },
        cameraModel: {
            lens: '35mm',
            framing: 'three-quarter',
            angle: 'eye-level',
            dof: 'medium'
        },
        requiredObjects: ['cafe_interior', 'seating'],
        forbiddenObjects: ['clutter', 'trash', 'messy_tables'],
        region: 'global'
    },

    studio_white: {
        id: 'studio_white',
        name: 'E-commerce Studio',
        location: 'Clean white studio',
        architecture: {
            style: 'Studio',
            structures: ['infinity curve', 'clean backdrop'],
            walls: 'pure white seamless',
            floor: 'white seamless'
        },
        materials: [
            { name: 'seamless_paper', surface: 'matte', color: 'pure white' }
        ],
        props: [],
        clutterLevel: 'minimal',
        peopleDensity: 'none',
        depthLayers: [
            { layer: 'foreground', elements: ['floor'], blur: 'sharp' },
            { layer: 'midground', elements: ['subject space'], blur: 'sharp' },
            { layer: 'background', elements: ['backdrop'], blur: 'sharp' }
        ],
        lightingModel: {
            type: 'artificial',
            source: 'multiple softboxes',
            direction: 'front',
            colorTemp: 5500,
            intensity: 'high',
            shadows: 'none'
        },
        cameraModel: {
            lens: '50mm',
            framing: 'full-body',
            angle: 'eye-level',
            dof: 'deep'
        },
        requiredObjects: ['white_background'],
        forbiddenObjects: ['props', 'furniture', 'shadows'],
        region: 'global'
    },

    sunset_walkway: {
        id: 'sunset_walkway',
        name: 'Sunset Walkway',
        location: 'Open promenade at sunset',
        architecture: {
            style: 'Urban outdoor',
            structures: ['promenade', 'railings', 'lamp posts'],
            floor: 'paved walkway'
        },
        materials: [
            { name: 'concrete_paving', surface: 'textured' },
            { name: 'metal_railings', surface: 'satin' }
        ],
        props: [
            { name: 'lamp_post', placement: 'background', required: false },
            { name: 'distant_people', placement: 'background', required: false }
        ],
        clutterLevel: 'minimal',
        peopleDensity: 'sparse',
        depthLayers: [
            { layer: 'foreground', elements: ['walkway'], blur: 'sharp' },
            { layer: 'midground', elements: ['promenade'], blur: 'sharp' },
            { layer: 'background', elements: ['sunset sky', 'horizon'], blur: 'slight' }
        ],
        lightingModel: {
            type: 'natural',
            source: 'setting sun',
            direction: 'back',
            colorTemp: 3000,
            intensity: 'medium',
            shadows: 'soft'
        },
        cameraModel: {
            lens: '85mm',
            framing: 'full-body',
            angle: 'eye-level',
            dof: 'medium'
        },
        requiredObjects: ['sunset_sky', 'open_space'],
        forbiddenObjects: ['crowds', 'vehicles'],
        region: 'global'
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export function buildScenePrompt(spec: SceneSpecification): string {
    const architectureDesc = `
ARCHITECTURE:
• Style: ${spec.architecture.style}
• Structures: ${spec.architecture.structures.join(', ')}
${spec.architecture.walls ? `• Walls: ${spec.architecture.walls}` : ''}
${spec.architecture.floor ? `• Floor: ${spec.architecture.floor}` : ''}
${spec.architecture.ceiling ? `• Ceiling: ${spec.architecture.ceiling}` : ''}`

    const materialsDesc = `
MATERIALS:
${spec.materials.map(m => `• ${m.name}: ${m.surface} surface${m.color ? `, ${m.color}` : ''}`).join('\n')}`

    const propsDesc = `
PROPS:
${spec.props.map(p => `• ${p.name}: ${p.placement}${p.required ? ' (REQUIRED)' : ' (optional)'}`).join('\n')}`

    const depthDesc = `
DEPTH LAYERS:
${spec.depthLayers.map(d => `• ${d.layer.toUpperCase()}: ${d.elements.join(', ')} [${d.blur} focus]`).join('\n')}`

    const lightingDesc = `
LIGHTING:
• Type: ${spec.lightingModel.type}
• Source: ${spec.lightingModel.source}
• Direction: ${spec.lightingModel.direction}
• Color temperature: ${spec.lightingModel.colorTemp}K
• Intensity: ${spec.lightingModel.intensity}
• Shadows: ${spec.lightingModel.shadows}`

    const cameraDesc = `
CAMERA:
• Lens: ${spec.cameraModel.lens}
• Framing: ${spec.cameraModel.framing}
• Angle: ${spec.cameraModel.angle}
• Depth of field: ${spec.cameraModel.dof}`

    const constraintsDesc = `
REQUIRED ELEMENTS (must be visible):
${spec.requiredObjects.map(o => `• ${o}`).join('\n')}

FORBIDDEN ELEMENTS (must NOT appear):
${spec.forbiddenObjects.map(o => `• ${o}`).join('\n')}`

    return `
╔═══════════════════════════════════════════════════════════════════════════════╗
║  SCENE: ${spec.name.padEnd(66)}║
╚═══════════════════════════════════════════════════════════════════════════════╝

Location: ${spec.location}
Clutter level: ${spec.clutterLevel}
People density: ${spec.peopleDensity}
${architectureDesc}
${materialsDesc}
${propsDesc}
${depthDesc}
${lightingDesc}
${cameraDesc}
${constraintsDesc}
`
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export function getSceneById(id: string): SceneSpecification | undefined {
    return SCENE_LIBRARY[id]
}

export function getScenesByRegion(region: 'india' | 'global' | 'any'): SceneSpecification[] {
    return Object.values(SCENE_LIBRARY).filter(s => s.region === region || s.region === 'any')
}

export function logSceneSpec(spec: SceneSpecification): void {
    console.log(`\n🏛️ SCENE SPECIFICATION: ${spec.name}`)
    console.log(`   ═══════════════════════════════════════════════`)
    console.log(`   📍 Location: ${spec.location}`)
    console.log(`   🏗️ Architecture: ${spec.architecture.style}`)
    console.log(`   💡 Lighting: ${spec.lightingModel.source} (${spec.lightingModel.colorTemp}K)`)
    console.log(`   📷 Camera: ${spec.cameraModel.lens}, ${spec.cameraModel.framing}`)
    console.log(`   ✓ Required: ${spec.requiredObjects.join(', ')}`)
    console.log(`   ✗ Forbidden: ${spec.forbiddenObjects.join(', ')}`)
    console.log(`   ═══════════════════════════════════════════════`)
}
