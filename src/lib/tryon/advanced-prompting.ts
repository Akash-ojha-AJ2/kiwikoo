/**
 * ADVANCED AI IMAGE GENERATION TECHNIQUES
 * 
 * Based on research into AI image generation best practices:
 * - Google Gemini character consistency features
 * - InstantID and DreamIdentity frameworks
 * - Professional prompt engineering techniques
 * 
 * KEY PRINCIPLES:
 * 1. Structured identity-first prompts
 * 2. Explicit identity markers ("same person", "identical features")
 * 3. Anti-AI-tell language (avoid "CGI", "digital art")
 * 4. Photographic realism triggers
 * 5. Precise facial feature descriptions
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// STRUCTURED PROMPT FORMAT
// ═══════════════════════════════════════════════════════════════

/**
 * Research shows this format is most effective:
 * Identity + Core Traits + Clothing/Style + Pose + Lighting/Camera + Background
 * 
 * The IDENTITY block must remain constant to preserve character.
 */

export interface StructuredPromptContext {
    // From GPT face analysis
    skinTone: string
    faceShape: string
    eyeDescription: string
    hairDescription: string
    distinctiveFeatures: string[]

    // From scene analysis
    pose: string
    expression: string

    // Garment info
    garmentDescription: string

    // Environment
    background: string
    lighting: string

    // Camera
    cameraSettings: string
}

// ═══════════════════════════════════════════════════════════════
// ANTI-AI-TELL LANGUAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Research shows these terms TRIGGER realistic output:
 * - "photo", "photograph", "RAW image"
 * - "realistic pores", "natural skin texture"
 * - "symmetrical facial features"
 * 
 * These terms TRIGGER AI-looking output (AVOID):
 * - "CGI", "digital art", "3D render"
 * - "illustration", "cartoon"
 * - "perfect", "flawless"
 */

export const ANTI_AI_TELL_TRIGGERS = `
════════════════════════════════════════════════════════════════════════════════
PHOTOGRAPHIC REALISM TRIGGERS — USE THESE
════════════════════════════════════════════════════════════════════════════════

INCLUDE THESE TERMS (triggers realism):
• "candid photograph"
• "RAW camera image"
• "unedited photo"
• "natural skin texture with visible pores"
• "realistic skin imperfections"
• "subtle asymmetry in facial features"
• "natural flyaway hairs"
• "genuine expression"
• "shot on iPhone 15 Pro Max"
• "f/1.8 aperture, shallow depth of field"

AVOID THESE TERMS (triggers AI look):
• "CGI" — NEVER USE
• "digital art" — NEVER USE
• "3D render" — NEVER USE
• "illustration" — NEVER USE
• "perfect skin" — NEVER USE
• "flawless" — NEVER USE
• "beautiful" (vague) — REPLACE WITH DESCRIPTIVE
• "amazing" (vague) — REPLACE WITH DESCRIPTIVE

REPLACEMENT EXAMPLES:
• Instead of "beautiful woman" → "woman with warm olive skin, wavy brown hair, honey-colored eyes, confident expression"
• Instead of "nice clothes" → "mustard yellow cotton kurta with gold thread embroidery, button placket"
• Instead of "good lighting" → "soft window light from left, 5000K color temperature, gentle shadows"
`

// ═══════════════════════════════════════════════════════════════
// EXPLICIT IDENTITY MARKERS
// ═══════════════════════════════════════════════════════════════

export const IDENTITY_MARKERS = `
════════════════════════════════════════════════════════════════════════════════
EXPLICIT IDENTITY MARKERS — CRITICAL FOR FACE PRESERVATION
════════════════════════════════════════════════════════════════════════════════

USE THESE EXACT PHRASES (research-proven to improve identity preservation):

"THE SAME PERSON as shown in Image 1"
"IDENTICAL facial features — no modifications"
"100% matching: bone structure, skin tone, facial expression, appearance"
"EXACT replica of the face from the reference image"
"Face identity LOCKED to Image 1"
"Do NOT generate a new face — COPY the existing face"

FEATURE-SPECIFIC MARKERS:
"Keep the EXACT eye shape from Image 1"
"Preserve the EXACT nose width and shape from Image 1"
"Maintain the EXACT lip shape and fullness from Image 1"
"Keep the EXACT jawline contour from Image 1"
"Preserve the EXACT brow shape and arch from Image 1"
"Maintain the EXACT cheek volume from Image 1"
"Keep the EXACT forehead proportions from Image 1"
"Preserve ALL skin texture including pores, marks, and imperfections from Image 1"
`

// ═══════════════════════════════════════════════════════════════
// PHOTOGRAPHIC STYLE LIBRARY
// ═══════════════════════════════════════════════════════════════

export interface PhotographicStyle {
    id: string
    name: string
    cameraTriggers: string
    lightingTriggers: string
    colorTriggers: string
    textureTriggers: string
    avoidTriggers: string[]
}

export const PHOTOGRAPHIC_STYLES: PhotographicStyle[] = [
    {
        id: 'iphone_candid',
        name: 'iPhone Candid (Default)',
        cameraTriggers: 'shot on iPhone 15 Pro Max, f/1.8 aperture, 24mm wide lens, natural shallow depth of field, slight motion blur on edges',
        lightingTriggers: 'available light, no flash, soft ambient lighting, natural color temperature',
        colorTriggers: 'slightly warm color cast, Instagram-ready colors, natural saturation, not overly processed',
        textureTriggers: 'visible skin texture, natural pores, subtle grain from high ISO, authentic phone camera look',
        avoidTriggers: ['studio lighting', 'perfect exposure', 'professional camera', 'flash photography']
    },
    {
        id: 'dslr_portrait',
        name: 'DSLR Portrait',
        cameraTriggers: 'Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, bokeh in background, sharp focus on eyes',
        lightingTriggers: 'natural window light, soft shadows, catchlights in eyes, Rembrandt lighting pattern',
        colorTriggers: 'neutral color grading, true skin tones, slight warmth, professional color balance',
        textureTriggers: 'visible skin texture, pores, fine hair detail, fabric texture visible, professional sharpness',
        avoidTriggers: ['over-smoothed skin', 'airbrushed', 'heavy filter', 'instagram filter']
    },
    {
        id: 'fashion_editorial',
        name: 'Fashion Editorial',
        cameraTriggers: 'medium format Hasselblad, 80mm lens, tethered studio shot, precise focus, high resolution capture',
        lightingTriggers: 'beauty dish with diffuser, rim light from behind, controlled studio environment, fashion lighting setup',
        colorTriggers: 'slightly desaturated, high contrast, magazine-ready, fashion color grading',
        textureTriggers: 'extremely detailed skin, visible makeup texture, fabric weave visible, editorial sharpness',
        avoidTriggers: ['natural light', 'casual shot', 'amateur lighting', 'over-processed']
    },
    {
        id: 'street_documentary',
        name: 'Street Documentary',
        cameraTriggers: 'Leica M11, 35mm lens, street photography style, candid moment, decisive moment capture',
        lightingTriggers: 'harsh midday sun, deep shadows, contrasty available light, urban lighting',
        colorTriggers: 'slightly gritty, documentary color grading, authentic street tones, news photographer style',
        textureTriggers: 'gritty texture, slight grain, imperfect but authentic, real-world look',
        avoidTriggers: ['studio', 'controlled lighting', 'posed', 'perfect composition']
    },
    {
        id: 'golden_hour_outdoor',
        name: 'Golden Hour Outdoor',
        cameraTriggers: 'Sony A7IV, 50mm f/1.4 lens, backlit silhouette edges, warm light wrapping face',
        lightingTriggers: 'golden hour sunlight, warm backlighting, lens flare acceptable, 3200K color temperature',
        colorTriggers: 'warm orange tones, golden highlights, film-like color science, Kodak Portra 400 emulation',
        textureTriggers: 'soft glow on skin, warm light catching facial features, natural outdoor texture',
        avoidTriggers: ['harsh midday', 'flash', 'studio', 'cold tones']
    },
    {
        id: 'indian_festive',
        name: 'Indian Festive',
        cameraTriggers: 'Canon 5D Mark IV, 50mm f/1.2, wedding photographer style, vibrant celebration capture',
        lightingTriggers: 'warm tungsten and diya light, mixed artificial and natural, festive lighting with fairy lights',
        colorTriggers: 'rich warm tones, saturated traditional colors, gold and red emphasis, festive vibrancy',
        textureTriggers: 'jewelry sparkle, fabric shimmer, detailed traditional textile textures visible',
        avoidTriggers: ['western studio', 'cold lighting', 'minimalist', 'desaturated']
    }
]

// ═══════════════════════════════════════════════════════════════
// STRUCTURED PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildAdvancedPrompt(
    context: Partial<StructuredPromptContext>,
    style: PhotographicStyle
): string {
    return `
════════════════════════════════════════════════════════════════════════════════
ADVANCED AI IMAGE GENERATION — RESEARCH-BASED PROMPT STRUCTURE
════════════════════════════════════════════════════════════════════════════════

${IDENTITY_MARKERS}

════════════════════════════════════════════════════════════════════════════════
IDENTITY BLOCK (CONSTANT — DO NOT MODIFY)
════════════════════════════════════════════════════════════════════════════════

Subject: THE SAME PERSON as shown in Image 1
Skin: ${context.skinTone || 'Match exactly from Image 1'}
Face: ${context.faceShape || 'IDENTICAL to Image 1'} face shape
Eyes: ${context.eyeDescription || 'COPY exactly from Image 1'}
Hair: ${context.hairDescription || 'PRESERVE exactly from Image 1'}
Expression: ${context.expression || 'Keep expression from Image 1'}
Distinctive: ${context.distinctiveFeatures?.join(', ') || 'All features from Image 1'}

════════════════════════════════════════════════════════════════════════════════
CLOTHING/GARMENT BLOCK (FROM IMAGE 2)
════════════════════════════════════════════════════════════════════════════════

Garment: ${context.garmentDescription || 'Extract fabric and style from Image 2 ONLY'}
NOTE: Use ONLY the fabric, color, and pattern from Image 2
      IGNORE any body, pose, or face in Image 2

════════════════════════════════════════════════════════════════════════════════
POSE BLOCK (FROM IMAGE 1 ANALYSIS)
════════════════════════════════════════════════════════════════════════════════

Pose: ${context.pose || 'EXACT pose from Image 1'}
This pose must be maintained exactly. Do NOT create a new pose.

════════════════════════════════════════════════════════════════════════════════
CAMERA & STYLE: ${style.name}
════════════════════════════════════════════════════════════════════════════════

Camera: ${style.cameraTriggers}
Lighting: ${style.lightingTriggers}
Color: ${style.colorTriggers}
Texture: ${style.textureTriggers}

AVOID: ${style.avoidTriggers.join(', ')}

════════════════════════════════════════════════════════════════════════════════
BACKGROUND/ENVIRONMENT
════════════════════════════════════════════════════════════════════════════════

Background: ${context.background || 'KEEP from Image 1'}
Lighting: ${context.lighting || 'MATCH from Image 1'}

${ANTI_AI_TELL_TRIGGERS}

════════════════════════════════════════════════════════════════════════════════
OUTPUT REQUIREMENTS
════════════════════════════════════════════════════════════════════════════════

Generate a CANDID PHOTOGRAPH (not digital art, not CGI, not illustration).

Output must look like:
✓ A real photo taken with a camera
✓ With natural skin including pores and texture
✓ With the EXACT same person from Image 1
✓ Wearing the garment from Image 2
✓ In a natural, unstaged moment

Output must NOT look like:
✗ AI-generated
✗ CGI or 3D render
✗ Overly smooth or plastic skin
✗ A different person
✗ A fashion illustration

GENERATE THE IMAGE NOW.
`
}

// ═══════════════════════════════════════════════════════════════
// GET STYLE BY ID
// ═══════════════════════════════════════════════════════════════

export function getPhotographicStyle(styleId: string): PhotographicStyle {
    return PHOTOGRAPHIC_STYLES.find(s => s.id === styleId) || PHOTOGRAPHIC_STYLES[0]
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logAdvancedPrompting(sessionId: string, style: PhotographicStyle): void {
    console.log(`\n📸 ADVANCED PROMPTING [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Style: ${style.name}`)
    console.log(`   Camera: ${style.cameraTriggers.substring(0, 50)}...`)
    console.log(`   Anti-AI-Tell: ENABLED`)
    console.log(`   Identity Markers: ENABLED`)
    console.log(`   Structured Format: Identity → Clothing → Pose → Camera → Background`)
}
