/**
 * Nano Banana Style Presets
 * Following the official prompting formula:
 * Action/Change + Specific Element/Change + Desired Style/Effect + Relevant Details
 * 
 * Action Words: Add, Change, Make, Remove, Replace
 */

export interface NanoBananaPreset {
  id: string
  name: string
  description: string
  category: 'indian' | 'street' | 'studio' | 'outdoor' | 'lifestyle' | 'editorial'
  
  // The prompt template following Nano Banana formula
  // Use {garment} for garment description, {face} for face details
  promptTemplate: string
  
  // Style keywords for the environment/mood
  style: string
  
  // Lighting description
  lighting: string
  
  // Optional background description
  background?: string
}

export const nanoBananaPresets: NanoBananaPreset[] = [
  // ==========================================
  // INDIAN TRADITIONAL
  // ==========================================
  {
    id: 'jaipur_palace',
    name: 'Jaipur Palace Courtyard',
    description: 'Elegant heritage palace setting with warm golden light',
    category: 'indian',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing in an ornate Jaipur palace courtyard with intricate carved stone pillars and warm terracotta walls. Soft golden hour sunlight, warm and regal.',
    style: 'Elegant, heritage, royal',
    lighting: 'Golden hour, warm sunlight filtering through arches',
    background: 'Palace courtyard with carved pillars, jharokha windows, terracotta and cream stone',
  },
  {
    id: 'south_temple',
    name: 'South Indian Temple',
    description: 'Dravidian temple architecture with dramatic carved gopuram',
    category: 'indian',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing before a South Indian temple with towering gopuram and intricate stone carvings. Soft morning light, spiritual atmosphere.',
    style: 'Traditional, spiritual, majestic',
    lighting: 'Soft morning light, gentle shadows',
    background: 'Dravidian temple with carved gopuram, stone pillars, temple courtyard',
  },
  {
    id: 'haveli_courtyard',
    name: 'Rajasthani Haveli',
    description: 'Traditional haveli with blue walls and carved windows',
    category: 'indian',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. In a traditional Rajasthani haveli courtyard with vibrant blue walls, carved wooden jharokha windows, and brass accents. Warm afternoon light, rich cultural atmosphere.',
    style: 'Vibrant, cultural, traditional',
    lighting: 'Warm afternoon sun, dappled shadows',
    background: 'Blue haveli walls, carved wooden windows, brass lanterns, terracotta pots',
  },
  {
    id: 'mughal_garden',
    name: 'Mughal Garden',
    description: 'Formal Mughal garden with fountains and cypress trees',
    category: 'indian',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Walking through a formal Mughal garden with symmetrical pathways, flowing fountains, and cypress trees. Soft diffused daylight, serene and elegant.',
    style: 'Formal, serene, refined',
    lighting: 'Soft diffused daylight, gentle reflections from water',
    background: 'Manicured gardens, water channels, cypress trees, marble pathways',
  },

  // ==========================================
  // STREET STYLE
  // ==========================================
  {
    id: 'urban_street',
    name: 'Urban Street Style',
    description: 'Modern city street with authentic urban energy',
    category: 'street',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Walking on a busy urban street with shopfronts, parked vehicles, and city life. Natural overcast daylight, candid street photography style.',
    style: 'Urban, candid, energetic',
    lighting: 'Overcast daylight, even soft light',
    background: 'City street, shopfronts, parked scooters/cars, people in background',
  },
  {
    id: 'cafe_terrace',
    name: 'Cafe Terrace',
    description: 'Cozy outdoor cafe with warm inviting atmosphere',
    category: 'street',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Sitting at a cozy outdoor cafe terrace with wicker chairs, potted plants, and warm string lights. Soft afternoon light, relaxed and inviting.',
    style: 'Cozy, relaxed, lifestyle',
    lighting: 'Soft afternoon light, warm tones',
    background: 'Cafe terrace, wicker furniture, potted plants, string lights',
  },
  {
    id: 'market_lane',
    name: 'Colorful Market Lane',
    description: 'Vibrant bazaar with fabric stalls and local color',
    category: 'street',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Walking through a colorful market lane with fabric stalls, hanging textiles, and bustling vendors. Dappled sunlight through awnings, vibrant atmosphere.',
    style: 'Colorful, vibrant, authentic',
    lighting: 'Dappled sunlight, colorful reflections from fabrics',
    background: 'Market stalls, hanging fabrics, brass items, busy lane',
  },

  // ==========================================
  // STUDIO
  // ==========================================
  {
    id: 'clean_white',
    name: 'Clean White Studio',
    description: 'Minimalist white studio with professional lighting',
    category: 'studio',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing in a clean white photography studio. Professional three-point lighting, soft shadows, e-commerce quality.',
    style: 'Minimal, professional, clean',
    lighting: 'Three-point studio lighting, soft diffused',
    background: 'Seamless white backdrop',
  },
  {
    id: 'warm_beige',
    name: 'Warm Beige Studio',
    description: 'Elegant warm-toned studio with soft lighting',
    category: 'studio',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. In a warm beige studio with soft directional lighting. Elegant, fashion editorial style, subtle shadows.',
    style: 'Elegant, warm, editorial',
    lighting: 'Soft directional light, warm tones',
    background: 'Seamless beige/cream backdrop',
  },
  {
    id: 'grey_gradient',
    name: 'Grey Gradient Studio',
    description: 'Professional grey gradient with dramatic lighting',
    category: 'studio',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. In a grey gradient studio with dramatic side lighting. Professional portrait style, defined shadows.',
    style: 'Professional, dramatic, portrait',
    lighting: 'Side lighting with defined shadows',
    background: 'Grey gradient backdrop',
  },

  // ==========================================
  // OUTDOOR NATURAL
  // ==========================================
  {
    id: 'golden_field',
    name: 'Golden Wheat Field',
    description: 'Dreamy golden hour in an open wheat field',
    category: 'outdoor',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing in a golden wheat field at sunset. Warm golden hour light, dreamy bokeh, romantic atmosphere.',
    style: 'Romantic, dreamy, golden',
    lighting: 'Golden hour backlighting, warm flare',
    background: 'Wheat field, golden stalks, soft horizon',
  },
  {
    id: 'beach_sunset',
    name: 'Beach at Sunset',
    description: 'Coastal sunset with warm ocean vibes',
    category: 'outdoor',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. On a sandy beach with gentle waves and sunset sky. Warm orange and pink light, relaxed coastal atmosphere.',
    style: 'Coastal, warm, relaxed',
    lighting: 'Sunset light, warm orange and pink',
    background: 'Sandy beach, gentle waves, colorful sunset sky',
  },
  {
    id: 'forest_path',
    name: 'Forest Path',
    description: 'Peaceful forest with dappled sunlight',
    category: 'outdoor',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Walking on a peaceful forest path with tall trees and dappled sunlight. Fresh green atmosphere, natural and serene.',
    style: 'Natural, serene, fresh',
    lighting: 'Dappled sunlight through canopy',
    background: 'Forest path, tall trees, green foliage',
  },
  {
    id: 'rooftop_cityscape',
    name: 'Rooftop Cityscape',
    description: 'Urban rooftop with city skyline backdrop',
    category: 'outdoor',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. On a rooftop terrace with city skyline in background. Blue hour lighting, urban sophisticated atmosphere.',
    style: 'Urban, sophisticated, modern',
    lighting: 'Blue hour, city lights',
    background: 'Rooftop terrace, city skyline, glass buildings',
  },

  // ==========================================
  // LIFESTYLE
  // ==========================================
  {
    id: 'home_natural',
    name: 'Home Natural Light',
    description: 'Cozy home interior with window light',
    category: 'lifestyle',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. In a cozy home interior near a large window. Soft natural window light, authentic lifestyle feel.',
    style: 'Cozy, authentic, lifestyle',
    lighting: 'Natural window light, soft shadows',
    background: 'Home interior, window, plants, soft furnishings',
  },
  {
    id: 'bookshop',
    name: 'Vintage Bookshop',
    description: 'Charming bookshop with warm literary atmosphere',
    category: 'lifestyle',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Browsing in a charming vintage bookshop with tall wooden shelves and warm lamp light. Cozy intellectual atmosphere.',
    style: 'Vintage, cozy, intellectual',
    lighting: 'Warm lamp light, soft ambient',
    background: 'Wooden bookshelves, stacked books, vintage lamps',
  },
  {
    id: 'art_gallery',
    name: 'Modern Art Gallery',
    description: 'Minimalist gallery with clean gallery lighting',
    category: 'lifestyle',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing in a modern art gallery with white walls and track lighting. Clean minimal aesthetic, sophisticated atmosphere.',
    style: 'Minimal, sophisticated, artistic',
    lighting: 'Gallery track lighting, even illumination',
    background: 'White gallery walls, abstract art, polished floor',
  },

  // ==========================================
  // EDITORIAL / FASHION
  // ==========================================
  {
    id: 'fashion_editorial',
    name: 'Fashion Editorial',
    description: 'High-fashion editorial with dramatic styling',
    category: 'editorial',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. High-fashion editorial pose in a minimalist setting. Dramatic directional lighting, Vogue-style fashion photography.',
    style: 'High-fashion, dramatic, editorial',
    lighting: 'Dramatic directional, strong shadows',
    background: 'Minimal studio or architectural element',
  },
  {
    id: 'magazine_cover',
    name: 'Magazine Cover',
    description: 'Clean magazine cover style portrait',
    category: 'editorial',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Magazine cover style portrait with clean background. Professional beauty lighting, polished editorial look.',
    style: 'Polished, professional, cover-worthy',
    lighting: 'Beauty lighting with soft fill',
    background: 'Clean solid color or soft gradient',
  },
  {
    id: 'architectural',
    name: 'Architectural Fashion',
    description: 'Modern architecture as fashion backdrop',
    category: 'editorial',
    promptTemplate: 'Replace the clothing with {garment}. Keep exact face: {face}. Standing against modern architectural elements with geometric lines and concrete textures. Dramatic natural light, contemporary fashion aesthetic.',
    style: 'Modern, geometric, contemporary',
    lighting: 'Harsh directional sunlight, strong shadows',
    background: 'Modern architecture, concrete, geometric shapes',
  },
]

/**
 * Get a preset by ID
 */
export function getNanoBananaPreset(id: string): NanoBananaPreset | undefined {
  return nanoBananaPresets.find(p => p.id === id)
}

/**
 * Get all presets in a category
 */
export function getPresetsByCategory(category: NanoBananaPreset['category']): NanoBananaPreset[] {
  return nanoBananaPresets.filter(p => p.category === category)
}

/**
 * Get all preset categories
 */
export function getPresetCategories(): NanoBananaPreset['category'][] {
  return ['indian', 'street', 'studio', 'outdoor', 'lifestyle', 'editorial']
}

/**
 * Build the final prompt from a preset
 * @param preset - The preset to use
 * @param garmentDescription - Description of the garment (from GPT-4o mini analysis)
 * @param faceDescription - Description of the person's face (from GPT-4o mini analysis)
 */
export function buildPresetPrompt(
  preset: NanoBananaPreset,
  garmentDescription: string,
  faceDescription: string
): string {
  return preset.promptTemplate
    .replace('{garment}', garmentDescription)
    .replace('{face}', faceDescription)
}

/**
 * Get all presets as a simple list for UI
 */
export function getAllNanoBananaPresets(): { id: string; name: string; category: string; description: string }[] {
  return nanoBananaPresets.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
  }))
}

