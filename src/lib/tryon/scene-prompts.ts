/**
 * HIGGSFIELD-STYLE SCENE PROMPT LIBRARY
 * 
 * These prompts:
 * - NEVER describe the face
 * - NEVER reimagine the person
 * - Focus on environment, camera, light, realism
 * - Allow micro pose variation only
 * 
 * The person already exists. We only generate:
 * - Clothing
 * - Environment
 * - Lighting
 * - Camera behavior
 * - Background interaction
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// GLOBAL SYSTEM PREFIX (INJECT ALWAYS - NON-NEGOTIABLE)
// ═══════════════════════════════════════════════════════════════

export const GLOBAL_SYSTEM_PREFIX = `A real person already exists in the image.

Do NOT generate or alter the face, head, hair, beard, or expression.
Do NOT beautify, stylize, or reconstruct identity.

Only generate:
- clothing
- environment
- lighting
- camera behavior
- background interaction

The person is not posing.
The moment is candid and unplanned.`

// ═══════════════════════════════════════════════════════════════
// POSE RULE (GLOBAL)
// ═══════════════════════════════════════════════════════════════

export const POSE_RULE = `POSE LIMITS:
- Subtle weight shifts only
- Natural seated or standing balance
- Relaxed arm movement below shoulders
- No dramatic posing
- No editorial stance
- No mannequin posture`

// ═══════════════════════════════════════════════════════════════
// GARMENT PRIORITY (GLOBAL)
// ═══════════════════════════════════════════════════════════════

export const GARMENT_PRIORITY = `GARMENT PRIORITY:
Clothing replacement has highest priority.

Garment must:
- Follow gravity
- Show natural wrinkles
- Respect body contact points
- Cast correct shadows

If conflict occurs, preserve garment realism over background detail.`

// ═══════════════════════════════════════════════════════════════
// CAMERA LOGIC (GLOBAL)
// ═══════════════════════════════════════════════════════════════

export const CAMERA_LOGIC = `CAMERA LOGIC:
Camera behaves like a consumer device.
- Imperfect framing allowed
- Slight tilt allowed
- Minor motion blur allowed
- No studio lighting`

// ═══════════════════════════════════════════════════════════════
// SCENE PROMPTS - HOME / INTERIOR (1-40)
// ═══════════════════════════════════════════════════════════════

export const HOME_INTERIOR_PROMPTS = [
    'Natural window light entering a lived-in apartment, sheer curtains softly diffusing sunlight.',
    'Late afternoon light spilling across a modest living room with everyday clutter.',
    'Warm indoor lighting with uneven shadows from table lamps.',
    'Morning light bouncing off pale walls and wooden furniture.',
    'Subtle dust particles visible in sunbeams near a window.',
    'Indoor plants casting soft shadows on textured walls.',
    'Family photos slightly out of focus on shelves.',
    'Casual living room scene with mismatched cushions and books.',
    'Soft evening light with warm color temperature.',
    'Home interior with realistic color bleed from walls.',
    'Slightly underexposed indoor scene, handheld feel.',
    'Quiet domestic moment with neutral tones.',
    'Natural shadow gradients on furniture and floor.',
    'Cozy interior with soft contrast and muted highlights.',
    'Indoor scene with imperfect framing and partial crop.',
    'Realistic ambient bounce light from floor.',
    'Indoor lighting mixing warm bulbs and daylight.',
    'Subtle vignette from phone lens.',
    'Slight noise from low-light capture.',
    'Casual home setting with no styling.',
    'Background elements partially cut off.',
    'Minor lens distortion near edges.',
    'Indoor environment with realistic depth.',
    'Natural fabric textures emphasized by side light.',
    'Realistic occlusion from furniture edges.',
    'Slight blur in background from phone camera.',
    'Warm neutral grading, no saturation boost.',
    'Everyday home realism, unstaged.',
    'Lived-in apartment feel.',
    'Ambient household shadows.',
    'Natural window glare.',
    'Soft highlight roll-off.',
    'Indoor shadows touching subject.',
    'Furniture casting real contact shadows.',
    'Natural corner lighting.',
    'Imperfect symmetry in framing.',
    'Quiet interior moment.',
    'Home scene with depth layering.',
    'Realistic light falloff.',
    'Documentary-style indoor capture.',
]

// ═══════════════════════════════════════════════════════════════
// SCENE PROMPTS - OFFICE / WORK (41-70)
// ═══════════════════════════════════════════════════════════════

export const OFFICE_WORK_PROMPTS = [
    'Fluorescent overhead lighting with uneven falloff.',
    'Office cubicles with muted colors.',
    'Natural window light mixing with artificial lights.',
    'Slightly cool white balance.',
    'Desk clutter partially visible.',
    'Monitors emitting soft ambient glow.',
    'Subtle reflection on glass partitions.',
    'Neutral corporate environment.',
    'Casual workplace moment.',
    'Slight compression artifacts from indoor lighting.',
    'Realistic shadow under desk edges.',
    'Background blur from phone camera.',
    'Office scene without stylization.',
    'Workday candid capture.',
    'Uneven lighting across room.',
    'Desk lamp creating localized highlight.',
    'Office plants adding depth.',
    'Cubicle walls cutting frame edges.',
    'Subtle motion blur from handheld capture.',
    'Neutral color palette.',
    'Everyday corporate realism.',
    'Slight grain from low ISO phone sensor.',
    'Imperfect framing.',
    'Quiet office atmosphere.',
    'Mixed lighting temperatures.',
    'Soft reflection on floor.',
    'Natural posture at workplace.',
    'Office realism without editorial polish.',
    'Documentary workplace feel.',
    'Consumer camera capture.',
]

// ═══════════════════════════════════════════════════════════════
// SCENE PROMPTS - STREET / URBAN INDIA (71-120)
// ═══════════════════════════════════════════════════════════════

export const STREET_URBAN_INDIA_PROMPTS = [
    'Narrow street with tangled wires overhead.',
    'Uneven pavement textures visible.',
    'Dust haze softening distance.',
    'Auto-rickshaw blur in background.',
    'Warm evening sunlight.',
    'Broken shadows from trees.',
    'Street clutter adding realism.',
    'Handheld framing with slight tilt.',
    'Soft sunlight bouncing off walls.',
    'Urban grit without exaggeration.',
    'Midday harsh light softened by dust.',
    'Natural skin-tone lighting from environment.',
    'Busy street partially blurred.',
    'Realistic scale and depth.',
    'Color bleed from nearby walls.',
    'Street signage slightly out of focus.',
    'Movement implied but frozen.',
    'Sun glare near frame edge.',
    'Natural occlusion from poles or walls.',
    'Street realism, unstaged.',
    'Shadows touching ground naturally.',
    'Asphalt texture visible.',
    'Warm neutral grading.',
    'Imperfect crop.',
    'Everyday Indian street moment.',
    'No cinematic lighting.',
    'Slight overexposure from sun.',
    'Ambient street reflections.',
    'Noise from daylight phone capture.',
    'Background pedestrians blurred.',
    'Dust particles catching light.',
    'Subtle motion blur.',
    'Realistic street color palette.',
    'Urban depth layering.',
    'Natural perspective distortion.',
    'Street environment dominating frame.',
    'No fashion pose.',
    'Candid timing.',
    'Real world street realism.',
    'Consumer camera limitations.',
    'Side light from buildings.',
    'Narrow alley framing.',
    'Warm sun with cool shadows.',
    'Organic imperfections.',
    'Street clutter partially cut.',
    'Documentary realism.',
    'Natural scale preservation.',
    'Uncontrolled lighting.',
    'Real environment logic.',
    'Authentic Indian street atmosphere.',
]

// ═══════════════════════════════════════════════════════════════
// SCENE PROMPTS - OUTDOOR / TRAVEL (121-160)
// ═══════════════════════════════════════════════════════════════

export const OUTDOOR_TRAVEL_PROMPTS = [
    'Soft overcast daylight.',
    'Natural breeze implied in environment.',
    'Uneven natural terrain.',
    'Distant background softly blurred.',
    'Early morning light.',
    'Late afternoon golden light.',
    'Natural shadow under feet.',
    'Environmental haze.',
    'Neutral color grading.',
    'No cinematic contrast.',
    'Travel-journal feel.',
    'Wide handheld framing.',
    'Light cloud diffusion.',
    'Realistic ground contact.',
    'Natural background scale.',
    'Outdoor ambient noise feel.',
    'Subtle lens flare.',
    'Natural vegetation shadows.',
    'Imperfect horizon.',
    'Casual outdoor moment.',
    'Realistic light spill.',
    'Minor exposure imbalance.',
    'No dramatic lighting.',
    'Natural scene layering.',
    'Outdoor realism.',
    'Environmental depth cues.',
    'Slight tilt.',
    'Consumer lens distortion.',
    'Organic imperfections.',
    'Travel authenticity.',
    'Everyday outdoor scene.',
    'Wind-softened light.',
    'Environmental reflections.',
    'Documentary outdoor capture.',
    'Natural weather conditions.',
    'No stylization.',
    'Real physical presence.',
    'Natural scale preservation.',
    'Soft focus distance.',
    'Casual framing.',
]

// ═══════════════════════════════════════════════════════════════
// CAMERA / REALISM MODIFIERS (161-200)
// ═══════════════════════════════════════════════════════════════

export const CAMERA_REALISM_MODIFIERS = [
    'Handheld iPhone perspective.',
    'Slight framing error.',
    'Minor lens softness.',
    'No artificial sharpness.',
    'Natural noise profile.',
    'Imperfect focus lock.',
    'Mild exposure inconsistency.',
    'Realistic sensor response.',
    'No symmetry correction.',
    'No beautification filters.',
    'Slight color cast from environment.',
    'Natural highlight roll-off.',
    'Soft shadow gradients.',
    'No HDR exaggeration.',
    'Consumer dynamic range.',
    'Realistic blur behavior.',
    'Edge softness.',
    'Minor motion artifact.',
    'Natural light physics.',
    'No post-processing look.',
    'Uncontrolled capture feel.',
    'Imperfect white balance.',
    'Real camera limitations.',
    'Subtle vignette.',
    'Environmental glare.',
    'Organic composition.',
    'Casual framing.',
    'Natural imperfections.',
    'Everyday realism.',
    'No studio logic.',
    'Raw phone capture feel.',
    'Authentic scale.',
    'Physical grounding.',
    'Natural occlusion.',
    'Unplanned moment.',
    'Real world physics.',
    'No cinematic polish.',
    'Documentary realism.',
    'Unstaged presence.',
    'Identity preserved, environment generated.',
]

// ═══════════════════════════════════════════════════════════════
// ALL PROMPTS COMBINED
// ═══════════════════════════════════════════════════════════════

export const ALL_SCENE_PROMPTS = [
    ...HOME_INTERIOR_PROMPTS,
    ...OFFICE_WORK_PROMPTS,
    ...STREET_URBAN_INDIA_PROMPTS,
    ...OUTDOOR_TRAVEL_PROMPTS,
    ...CAMERA_REALISM_MODIFIERS,
]

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get a random scene prompt from a category.
 */
export function getRandomScenePrompt(
    category: 'home' | 'office' | 'street' | 'outdoor' | 'camera' | 'any'
): string {
    let prompts: string[]

    switch (category) {
        case 'home':
            prompts = HOME_INTERIOR_PROMPTS
            break
        case 'office':
            prompts = OFFICE_WORK_PROMPTS
            break
        case 'street':
            prompts = STREET_URBAN_INDIA_PROMPTS
            break
        case 'outdoor':
            prompts = OUTDOOR_TRAVEL_PROMPTS
            break
        case 'camera':
            prompts = CAMERA_REALISM_MODIFIERS
            break
        case 'any':
        default:
            prompts = ALL_SCENE_PROMPTS
    }

    return prompts[Math.floor(Math.random() * prompts.length)]
}

/**
 * Get a random camera modifier.
 */
export function getRandomCameraModifier(): string {
    return CAMERA_REALISM_MODIFIERS[
        Math.floor(Math.random() * CAMERA_REALISM_MODIFIERS.length)
    ]
}

/**
 * Build a complete Higgsfield-style prompt.
 * 
 * This injects all required global rules + scene + camera.
 */
export function buildHiggsfieldPrompt(
    sceneCategory: 'home' | 'office' | 'street' | 'outdoor' | 'any'
): string {
    const scene = getRandomScenePrompt(sceneCategory)
    const camera = getRandomCameraModifier()

    return `${GLOBAL_SYSTEM_PREFIX}

${POSE_RULE}

${GARMENT_PRIORITY}

${CAMERA_LOGIC}

SCENE: ${scene}
CAMERA: ${camera}`
}

/**
 * Build a compact Higgsfield prompt (< 1500 chars).
 */
export function buildCompactHiggsfieldPrompt(
    scene: string
): string {
    return `${GLOBAL_SYSTEM_PREFIX}

SCENE: ${scene}

${POSE_RULE}

${GARMENT_PRIORITY}

${CAMERA_LOGIC}`
}

/**
 * Map preset ID to category.
 */
export function getSceneCategoryFromPresetId(presetId: string): 'home' | 'office' | 'street' | 'outdoor' | 'any' {
    if (presetId.includes('home') || presetId.includes('lifestyle') || presetId.includes('kitchen') || presetId.includes('living')) {
        return 'home'
    }
    if (presetId.includes('office') || presetId.includes('work') || presetId.includes('cafe') || presetId.includes('cowork')) {
        return 'office'
    }
    if (presetId.includes('street') || presetId.includes('urban') || presetId.includes('market') || presetId.includes('chai')) {
        return 'street'
    }
    if (presetId.includes('outdoor') || presetId.includes('travel') || presetId.includes('beach') || presetId.includes('park') || presetId.includes('rooftop')) {
        return 'outdoor'
    }
    return 'any'
}

/**
 * Get scene prompts count.
 */
export function getScenePromptsCount(): {
    home: number
    office: number
    street: number
    outdoor: number
    camera: number
    total: number
} {
    return {
        home: HOME_INTERIOR_PROMPTS.length,
        office: OFFICE_WORK_PROMPTS.length,
        street: STREET_URBAN_INDIA_PROMPTS.length,
        outdoor: OUTDOOR_TRAVEL_PROMPTS.length,
        camera: CAMERA_REALISM_MODIFIERS.length,
        total: ALL_SCENE_PROMPTS.length,
    }
}
