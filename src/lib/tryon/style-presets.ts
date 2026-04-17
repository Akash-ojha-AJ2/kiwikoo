/**
 * STYLE PRESET SYSTEM - Phase 2
 * 
 * Centralized registry of editorial-grade style presets.
 * These presets control ONLY environment, lighting, camera, mood, and realism.
 * They NEVER describe identity or facial features.
 * They NEVER mention reference images.
 */

export type StylePreset = {
  id: string
  name: string
  environment: string
  lighting: string
  camera: string
  mood: string
  realismNotes: string
}

export const STYLE_PRESETS: Record<string, StylePreset> = {
  editorial_street: {
    id: 'editorial_street',
    name: 'Editorial Street',
    environment: 'Urban street setting with architectural elements, graffiti walls, or modern city backdrop. Dynamic urban environment with depth and texture.',
    lighting: 'Natural daylight with directional shadows. Soft diffused light from side angles. Slight rim lighting for separation from background.',
    camera: 'Professional fashion photography: 85mm portrait lens at f/2.8, shallow depth of field. Eye-level framing. Sharp focus on subject with natural bokeh background.',
    mood: 'Confident, contemporary, fashion-forward. Editorial magazine aesthetic with strong visual presence.',
    realismNotes: 'Photorealistic with natural skin texture. Realistic fabric drape and movement. Authentic urban atmosphere. No over-processing or artificial smoothing.',
  },

  high_fashion_runway: {
    id: 'high_fashion_runway',
    name: 'High Fashion Runway',
    environment: 'Minimalist studio or architectural space with clean lines. Neutral or monochromatic backdrop. Focus on garment and silhouette.',
    lighting: 'Professional studio lighting: three-point setup with key light, fill light, and rim light. Even, flattering illumination with controlled shadows.',
    camera: 'Fashion photography standard: 50mm or 85mm lens, f/4 to f/5.6 for sharpness. Full body or 3/4 framing. Clean, precise composition.',
    mood: 'Sophisticated, elegant, high-end. Luxury fashion aesthetic with refined presentation.',
    realismNotes: 'Crisp, professional quality. Natural skin texture preserved. Fabric details sharp and visible. Editorial-grade realism without artificial enhancement.',
  },

  casual_lifestyle: {
    id: 'casual_lifestyle',
    name: 'Casual Lifestyle',
    environment: 'Everyday settings: cozy home interior, local cafe, park, or neighborhood street. Lived-in, authentic spaces with natural character.',
    lighting: 'Natural window light or soft ambient lighting. Warm, inviting atmosphere. Gentle shadows and highlights.',
    camera: 'Lifestyle photography: 35mm or 50mm lens, natural perspective. Candid framing with comfortable composition. Authentic, unposed feeling.',
    mood: 'Relaxed, approachable, relatable. Warm and inviting atmosphere. Instagram lifestyle aesthetic.',
    realismNotes: 'Natural, authentic look. Realistic skin with visible pores. Natural fabric behavior. Honest, unretouched feeling while maintaining quality.',
  },

  studio_catalog: {
    id: 'studio_catalog',
    name: 'Studio Catalog',
    environment: 'Clean photography studio with seamless white or grey backdrop. Minimal, professional setting focused on product presentation.',
    lighting: 'Even studio lighting with soft boxes. Uniform illumination with minimal shadows. Professional product photography standard.',
    camera: 'Catalog photography: 50mm lens at f/8 for maximum sharpness. Full body or 3/4 framing. Clean, commercial composition.',
    mood: 'Professional, clean, commercial. E-commerce catalog aesthetic with clear product visibility.',
    realismNotes: 'Sharp, detailed, commercial quality. Natural skin texture. Fabric details clearly visible. Professional product photography realism.',
  },

  cinematic_city_pop: {
    id: 'cinematic_city_pop',
    name: 'Cinematic City Pop',
    environment: 'Vibrant cityscape with neon signs, urban architecture, and dynamic street scenes. Modern metropolitan atmosphere with visual energy.',
    lighting: 'Cinematic lighting: mix of natural daylight and artificial neon. Colorful light sources creating dynamic shadows and highlights. Evening or twilight atmosphere.',
    camera: 'Cinematic framing: wide-angle or 50mm lens, dramatic composition. Film-like aesthetic with depth and movement. Dynamic angles.',
    mood: 'Energetic, vibrant, modern. Urban pop culture aesthetic with cinematic flair.',
    realismNotes: 'Film-like quality with natural grain. Realistic skin texture. Authentic urban atmosphere. Cinematic realism with artistic lighting.',
  },

  influencer_social: {
    id: 'influencer_social',
    name: 'Influencer Social',
    environment: 'Instagram-worthy settings: trendy cafes, rooftop terraces, art galleries, or aesthetic urban locations. Visually appealing, curated spaces.',
    lighting: 'Soft, flattering natural light with golden hour warmth or bright, clean daylight. Instagram-optimized lighting for social media appeal.',
    camera: 'Social media style: smartphone aesthetic or 35mm lens, square or vertical framing. Casual, approachable composition.',
    mood: 'Trendy, aspirational, social media ready. Warm and inviting with modern aesthetic appeal.',
    realismNotes: 'Social media quality: natural but polished. Realistic skin with subtle enhancement. Natural fabric appearance. Instagram-ready realism.',
  },
}

/**
 * Get a style preset by ID
 */
export function getStylePreset(id: string): StylePreset | null {
  return STYLE_PRESETS[id] || null
}

/**
 * Get all available style presets
 */
export function getAllStylePresets(): StylePreset[] {
  return Object.values(STYLE_PRESETS)
}

/**
 * Validate that a style preset exists
 */
export function isValidStylePreset(id: string): boolean {
  return id in STYLE_PRESETS
}

