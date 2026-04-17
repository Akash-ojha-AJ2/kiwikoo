/**
 * AD STYLE PRESETS — PRODUCTION GRADE
 * 
 * Categorized preset system for ad generation.
 * Brands select from these presets — GPT-4o crafts the final prompt.
 * 
 * Categories: UGC | Editorial | Commercial | Creative | Standalone | Indian Fashion
 */

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const AD_PRESET_IDS = [
  'UGC_CANDID',
  'UGC_STREET',
  'EDITORIAL_PREMIUM',
  'EDITORIAL_FASHION',
  'EDITORIAL_STREET',
  'EDITORIAL_RETRO',
  'EDITORIAL_CONCEPTUAL',
  'CREATIVE_CINEMATIC',
  'CREATIVE_SURREAL',
  'CREATIVE_BOLD_COLOR',
  'SPORTS_DYNAMIC',
  'PRODUCT_LIFESTYLE',
  'PERF_BEST_QUALITY',
  'CINEMATIC_NEO_NOIR',
  'CINEMATIC_STREET_CULTURE',
  'CINEMATIC_JEWELRY_CLOSEUP',
  'CINEMATIC_MINECRAFT_HYBRID',
  'CINEMATIC_STUDIO_EDITORIAL',
  'CINEMATIC_RETRO_FLIRTY',
  'CINEMATIC_IPHONE_STREET',
  'CINEMATIC_GOLDEN_GARDEN',
  'UGC_POV_INFLUENCER',
  'CREATIVE_BERAW_GLITCH',
  'SPORTS_BOXING_ACTION',
  'CINEMATIC_DARK_NEO_NOIR',
] as const

export type AdPresetId = (typeof AD_PRESET_IDS)[number]

export type AdPresetCategory =
  | 'ugc'
  | 'editorial'
  | 'commercial'
  | 'creative'
  | 'standalone'
  | 'performance'
  | 'sports'
  | 'indian'
  | 'cinematic'

export type Platform = 'instagram' | 'facebook' | 'google' | 'influencer'

export type CaptionTone = 'casual' | 'premium' | 'confident'

export type CtaType = 'shop_now' | 'learn_more' | 'explore' | 'buy_now'

export type CharacterType = 'human_female' | 'human_male' | 'animal' | 'none'
export type CharacterIdentity =
  | 'global_modern'
  | 'indian_woman_modern'
  | 'indian_man_modern'
  | 'south_asian_modern'
  | 'east_asian_modern'
  | 'middle_eastern_modern'
  | 'african_modern'
  | 'latina_modern'
  | 'european_modern'
  | 'mixed_heritage_modern'
  | 'north_american_modern'
  | 'latin_american_modern'
  | 'mediterranean_modern'
  | 'south_east_asian_modern'
  | 'central_asian_modern'
  | 'pacific_islander_modern'

export type StylePack = 'luxury' | 'high_street' | 'sports'
export type PresetTextSystem = 'luxury_masthead' | 'highstreet_panel' | 'sports_brush' | 'cinematic_film_poster' | 'cinematic_bold_statement' | 'cinematic_magazine_editorial' | 'cinematic_street_poster' | 'cinematic_minimal_concept'

export type FontStyle = 'serif' | 'sans-serif' | 'handwritten' | 'bold-display'

export type TextPlacement =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

export type AspectRatio = '1:1' | '9:16' | '16:9' | '4:5'

/** Camera angle for ad composition — down, side, low, high, etc. */
export type CameraAngle =
  | 'auto'
  | 'eye-level'
  | 'low'
  | 'high'
  | 'down'
  | 'side'
  | 'three-quarter'
  | 'dutch'

export interface TextOverlayConfig {
  headline?: string
  subline?: string
  tagline?: string
  placement?: TextPlacement
  fontStyle?: FontStyle
}

export interface AdPreset {
  id: AdPresetId
  name: string
  description: string
  category: AdPresetCategory
  icon: string
  whenToUse: string[]
  platforms: Platform[]
  /** Scene, lighting, and composition guidance for the prompt builder */
  sceneGuide: string
  /** Lighting description for consistency */
  lightingGuide: string
  /** Camera/lens guidance */
  cameraGuide: string
  /** Negative terms to avoid */
  avoid: string[]
}

function sanitizePresetCopy(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bpaparazzi\b/gi, 'direct flash editorial'],
    [/\bstreet surveillance footage\b/gi, 'candid documentary street photography'],
    [/\bsurveillance\b/gi, 'documentary'],
    [/\bperfectly mirroring the real human'?s pose\b/gi, 'standing in the same pose'],
    [/\banatomically correct\b/gi, 'anatomically plausible'],
    [/\bthrowing a powerful punch\b/gi, 'extending a boxing glove in a dynamic fitness pose'],
    [/\bchopsticks aimed at face\b/gi, 'chopsticks held up near camera'],
    [/\bMinecraft-style\b/gi, 'retro voxel style'],
  ]

  let out = text
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement)
  }
  return out.replace(/\s{2,}/g, ' ').trim()
}

function sanitizePreset(preset: AdPreset): AdPreset {
  return {
    ...preset,
    sceneGuide: sanitizePresetCopy(preset.sceneGuide),
    lightingGuide: sanitizePresetCopy(preset.lightingGuide),
    cameraGuide: sanitizePresetCopy(preset.cameraGuide),
    avoid: Array.from(new Set(preset.avoid.map((t) => sanitizePresetCopy(t)).filter(Boolean))),
  }
}

const PRESET_STYLE_PACK_OVERRIDES: Partial<Record<AdPresetId, StylePack>> = {
  EDITORIAL_PREMIUM: 'luxury',
  EDITORIAL_FASHION: 'luxury',
  EDITORIAL_RETRO: 'luxury',
  PERF_BEST_QUALITY: 'luxury',
  SPORTS_DYNAMIC: 'sports',
  CREATIVE_CINEMATIC: 'sports',
  CINEMATIC_NEO_NOIR: 'luxury',
  CINEMATIC_JEWELRY_CLOSEUP: 'luxury',
  CINEMATIC_STUDIO_EDITORIAL: 'luxury',
  CINEMATIC_GOLDEN_GARDEN: 'luxury',
  UGC_POV_INFLUENCER: 'high_street',
  CREATIVE_BERAW_GLITCH: 'high_street',
  SPORTS_BOXING_ACTION: 'sports',
  CINEMATIC_DARK_NEO_NOIR: 'luxury',
}

const PRESET_TEXT_SYSTEM_OVERRIDES: Partial<Record<AdPresetId, PresetTextSystem>> = {
  // ── Core presets ──
  EDITORIAL_PREMIUM: 'luxury_masthead',
  EDITORIAL_FASHION: 'luxury_masthead',
  EDITORIAL_RETRO: 'luxury_masthead',
  EDITORIAL_STREET: 'cinematic_bold_statement',
  EDITORIAL_CONCEPTUAL: 'cinematic_minimal_concept',
  SPORTS_DYNAMIC: 'sports_brush',
  CREATIVE_CINEMATIC: 'cinematic_street_poster',
  CREATIVE_SURREAL: 'cinematic_film_poster',
  CREATIVE_BOLD_COLOR: 'cinematic_bold_statement',
  UGC_CANDID: 'cinematic_street_poster',
  UGC_STREET: 'cinematic_bold_statement',
  PRODUCT_LIFESTYLE: 'cinematic_minimal_concept',
  PERF_BEST_QUALITY: 'luxury_masthead',
  // ── Cinematic presets ──
  CINEMATIC_NEO_NOIR: 'cinematic_film_poster',
  CINEMATIC_STREET_CULTURE: 'cinematic_bold_statement',
  CINEMATIC_JEWELRY_CLOSEUP: 'cinematic_magazine_editorial',
  CINEMATIC_MINECRAFT_HYBRID: 'cinematic_street_poster',
  CINEMATIC_STUDIO_EDITORIAL: 'cinematic_minimal_concept',
  CINEMATIC_RETRO_FLIRTY: 'cinematic_magazine_editorial',
  CINEMATIC_IPHONE_STREET: 'cinematic_street_poster',
  CINEMATIC_GOLDEN_GARDEN: 'cinematic_film_poster',
  UGC_POV_INFLUENCER: 'cinematic_bold_statement',
  CREATIVE_BERAW_GLITCH: 'sports_brush',
  SPORTS_BOXING_ACTION: 'sports_brush',
  CINEMATIC_DARK_NEO_NOIR: 'cinematic_film_poster',
}

export type PresetTier = 'safe' | 'bold' | 'experimental'
export type PresetStability = 'high' | 'medium'
export type PresetPack = 'performance' | 'fashion' | 'experimental' | 'sports' | 'heritage' | 'creator'

export interface PresetTaxonomy {
  tier: PresetTier
  stability: PresetStability
  pack: PresetPack
}

export type AdPresetDisplay = AdPreset & PresetTaxonomy

export interface AdGenerationInput {
  preset: AdPresetId
  campaignId?: string
  variationIndex?: number
  stylePack?: StylePack

  // Image inputs
  productImage?: string
  influencerImage?: string
  lockFaceIdentity?: boolean
  strictRealism?: boolean

  // Character
  characterType?: CharacterType
  characterIdentity?: CharacterIdentity
  animalType?: string
  characterStyle?: string
  characterAge?: string

  // Text overlay
  textOverlay?: TextOverlayConfig

  // Aspect ratio
  aspectRatio?: AspectRatio

  // Camera angle (down, side, low, high, etc.) for pro composition
  cameraAngle?: CameraAngle

  // Text controls
  headline?: string
  ctaType: CtaType
  captionTone?: CaptionTone

  // Platform selection
  platforms: Platform[]

  // Subject overrides (legacy, still supported)
  subject?: {
    gender?: 'male' | 'female' | 'unisex'
    ageRange?: string
    pose?: string
    expression?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// PRESET DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const AD_PRESETS: AdPreset[] = [
  {
    id: 'UGC_POV_INFLUENCER',
    name: 'POV Influencer',
    description: 'Playful, candid snapshot in a casual Asian restaurant',
    category: 'ugc',
    icon: 'Camera',
    whenToUse: ['Influencer content', 'Food/Beverage', 'Casual fashion'],
    platforms: ['instagram', 'influencer'],
    sceneGuide:
      `A playful, candid snapshot taken in a dimly lit, casual Asian restaurant. The subject is leaning forward over a dark wooden table. The subject MUST be wearing the uploaded product. They are looking directly into the camera with a playful expression. The foreground is dominated by a hand holding a pair of wooden chopsticks, held up near the camera. Plates of prepared food (gyoza, fried chicken) are visible on the table.`,
    lightingGuide:
      `Mixed artificial indoor lighting. Overhead key light creating strong highlights, bright catchlights in the eyes. Slightly warm color temperature. Soft, slightly low contrast, muted shadows.`,
    cameraGuide:
      `Smartphone photography (iPhone aesthetic). Extreme Close-up (ECU) / Point-of-View (POV). Very low angle, shooting sharply upward from table level toward the subject's face. Ultra-Wide Angle lens. Emphasize distortion, making the subject's head and the foreground chopsticks appear disproportionately large. Shallow depth of field, focusing sharply on the subject's eyes and the foreground chopsticks, allowing the background to remain soft. Subtle digital noise (grain).`,
    avoid: ['oversharpening', 'HDR effects', 'studio lighting', 'perfect symmetry'],
  },
  {
    id: 'CREATIVE_BERAW_GLITCH',
    name: 'BeRaw Digital Glitch',
    description: 'Digital art mixed with reality: a human and their retro 8-bit voxel alter-ego',
    category: 'creative',
    icon: 'Sparkles',
    whenToUse: ['Gaming drops', 'Metaverse streetwear', 'Digital campaigns'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      `Two subjects side-by-side in symmetry on a bright Miami street. Subject 1 is a human, looking down, standing casually with hands resting near their hips. Subject 1 MUST be wearing the uploaded product. Subject 2 is a retro 3D voxel video-game character standing in the same pose. Subject 2 MUST also be wearing a pixelated, blocky version of the EXACT SAME uploaded product (matching the color and style precisely). Street setting with a pastel pink/mint stucco wall and abstract geometric graffiti. A retro pastel car in the blurry background.`,
    lightingGuide:
      `Bright, clean, almost shadowless Miami daylight. Direct but not harsh light (slight haze). Uniform illumination across both the organic human skin and the flat digital facets of the voxel character. Identical lighting reinforces the identical poses.`,
    cameraGuide:
      `Smartphone iPhone 16 Pro simulation. Main wide camera (24mm eq). Portrait mode depth-effect on. Full-body portrait capturing them from the knees up. Eye-level or slightly below chest height. Shallow depth of field keeping both subjects sharp with the background blurred. Typical iPhone processing: warm white balance (6500K), lifted shadows, slight saturation boost on blues/greens.`,
    avoid: ['dramatic shadows', 'dark backgrounds', 'over-smoothed skin', 'HDR artifacts', 'different poses', 'strong blur on the voxel character'],
  },
  {
    id: 'SPORTS_BOXING_ACTION',
    name: 'Action Boxing',
    description: 'High-energy sports portrait with dynamic motion blur',
    category: 'sports',
    icon: 'Activity',
    whenToUse: ['Athletic wear', 'Sports campaigns', 'High-energy apparel'],
    platforms: ['instagram', 'google'],
    sceneGuide:
      `Intense athletic sports action shot. Subject MUST be wearing the exact uploaded product. Subject is extending a red boxing glove directly toward the camera in a dynamic fitness pose. High editorial sports model pose. Solid crimson red background with subtle texture.`,
    lightingGuide:
      `Neutral studio lighting. Soft frontal light with slight shadowing. Dramatic and intense tone. Dominant red and black color palette with natural flesh tones.`,
    cameraGuide:
      `Close-up with dynamic angle focused on the extended boxing glove. Slight wide angle lens to distort and enlarge the incoming glove. ISO 200, f/4.5, 1/160s. Sharp focus on the face, but shallow depth of field rendering the glove and background blurred. Motion blur on hair and glove indicating swift movement. Moderate cinematic 35mm film grain.`,
    avoid: ['static poses', 'flat lighting', 'deep depth of field', 'bright cheerful colors', 'distorted anatomy'],
  },
  {
    id: 'CINEMATIC_DARK_NEO_NOIR',
    name: 'Cinematic Neo-Noir',
    description: 'Deep crimson monochromatic neo-noir editorial portrait',
    category: 'cinematic',
    icon: 'Film',
    whenToUse: ['Premium menswear', 'High-end watches', 'Luxury lifestyle'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      `Introspective, powerful, silent authority mood. Subject MUST be wearing the exact uploaded product, separated clearly from a strong deep crimson red monochromatic background. Editorial cinematic framing.`,
    lightingGuide:
      `Low-key cinematic lighting. Dramatic side light coming slightly from below. Subtle rim light outlining the jawline, hair, and any accessories. High contrast with deep shadows.`,
    cameraGuide:
      `Slightly low-angle portrait. Close-up or medium close-up. Shallow depth of field. Ultra high detail photorealistic photography. Sharp focus on the face showing hyper-realistic skin texture and visible pores. Clean background with no artifacts.`,
    avoid: ['stylization', 'anime', 'CGI', 'painterly look', 'soft beauty lighting', 'wide angle distortion', 'smiling', 'exaggerated expressions', 'blur artifacts'],
  },
  {
    id: 'UGC_CANDID',
    name: 'UGC Candid',
    description: 'Authentic, relatable social media feel',
    category: 'ugc',
    icon: 'Camera',
    whenToUse: ['Instagram ads', 'Influencer content', 'Casual brands'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Real urban environment — sidewalk, café terrace, overpass railing at dusk, or lived-in room with concrete, brick, or warm wood. Authentic textures; nothing staged or sterile. Capture a spontaneous moment: mid-laugh, mid-stride, leaning on a railing looking at city lights, or candid glance away from camera. Expression must be ALIVE — not blank stare; a slight smirk, caught-off-guard smile, eyes mid-blink, or contemplative gaze into distance. Feels like a frame pulled from a documentary or a friend\'s best candid iPhone shot, but lit and composed like a brand campaign. Subject\'s hands should be doing something natural: holding coffee, adjusting sunglasses, touching hair, resting on a railing.',
    lightingGuide:
      'Production-quality natural light: soft directional window light or overcast daylight as key (45° to subject), minimal fill so shadows stay soft but shape the face with cinematic dimension. Skin texture and fabric weave visible — no plastic smoothing. Visible warm subsurface scattering on ears and fingertips. Subtle rim from a practical (window, streetlamp, open door) to separate subject from background. Colour temperature warm (5500K daylight or 4500K golden hour). Allow natural lens flare from sun if shooting into light. For night/dusk: moody warm-cool split with city lights providing orange practicals and blue ambient sky.',
    cameraGuide:
      '35mm equivalent, f/2.8–4, slightly off-center framing with cinematic rule-of-thirds. Eye-level, high-angle looking down, or over-shoulder for intimacy. Realistic depth with both subject and key background objects readable. Micro motion blur on a hand or hair strand for life. Visible skin pores, fabric weave, shoe scuffs. Feels like premium mirrorless — sharp where it matters, creamy natural falloff. 4:5 or 9:16 vertical preferred.',
    avoid: ['studio lighting', 'perfect symmetry', 'stiff professional posing', 'blank mannequin expression', 'flat on-camera flash', 'plastic AI skin', 'dead eyes'],
  },
  {
    id: 'UGC_STREET',
    name: 'Street Realism',
    description: 'Streetwear, crosswalk, documentary-style candid',
    category: 'ugc',
    icon: 'MapPin',
    whenToUse: ['Streetwear', 'Sneaker ads', 'Urban brands'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Subject on a real pedestrian crosswalk with clear white zebra lines on textured asphalt, or standing confidently on a metro overpass, or walking through an urban intersection. Natural stride or relaxed stance with weight on one leg — one hand in pocket, the other holding a coffee or phone. Expression: cool confidence, slight head tilt, direct gaze upward at camera or looking away with purpose. Sneakers, watch, chain, and sunglasses must read clearly. Background shows real urban texture: cracked asphalt, painted road markings, concrete, steel guardrails. Feels like genuine candid street documentary footage upgraded to fashion-campaign quality.',
    lightingGuide:
      'Natural daylight — bright overcast for even exposure with soft minimal shadows, or harsh noon sun creating strong directional shadows on asphalt for graphic effect. Realistic exposure as in genuine street photography. No artificial fill. Skin shows natural shine, slight sweat. Fabric shows realistic wrinkles and wear. Optional: dusk city lighting with warm street lamps and cool blue sky for cinematic split-tone mood.',
    cameraGuide:
      'High-angle looking down (traffic cam / overpass perspective) at 24–35mm for wide documentary feel, OR low Dutch angle for power. Hyper-real texture fidelity: visible skin pores, denim weave, shoe tread, asphalt grain, painted line edges. Slight wide-angle barrel distortion acceptable. Minor motion blur on one arm or hair for life. f/4–5.6 for realistic depth. 8K detail.',
    avoid: ['studio backdrop', 'flat flash', 'over-stylized', 'clean pristine surfaces', 'static mannequin pose', 'blank expression', 'AI smoothing'],
  },
  {
    id: 'EDITORIAL_PREMIUM',
    name: 'Premium Editorial',
    description: 'Magazine-quality, refined, luxury',
    category: 'editorial',
    icon: 'Sparkles',
    whenToUse: ['Brand campaigns', 'High-end brands', 'Storytelling'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: One frame that could open a Vogue spread. Real-world environment — architectural interior with aged walls, minimal outdoor with vast sky, velvet armchair in dimly-lit academic room, or mattress styled with silk linens against a coloured void. Refined, composed posture; every element intentional. Subject\'s expression tells a story — contemplative with eyes closed, commanding direct gaze, or serene side-profile with eyes downcast. Hands placed deliberately: clasped in lap, holding a bouquet, adjusting collar, or resting on armrest. Wardrobe reads as couture: tailored trench, ivory turtleneck dress, cable-knit layered over collared shirt, or sheer top with patent pants. Think Peter Lindbergh, Annie Leibovitz: storytelling, emotional weight, and cinematic intimacy in a single image.',
    lightingGuide:
      'Production-quality cinematic: soft directional key at 45° front-left or front-right (large softbox, window, or practical lamp). Fill at 2:1 ratio so face and fabric are sculpted with dimension, not flat. Optional warm rim for hair and shoulder separation. Visible subsurface scattering on ears and skin edges. 5500–5600K neutral with allowance for warm practicals (table lamp, candle). Skin micro-texture fully preserved: pores, fine hairs, natural imperfections. Fabric weave and material sheen visible. Premium tonal quality with full dynamic range, no crushed blacks or clipped highlights.',
    cameraGuide:
      '50–85mm portrait lens, f/2–2.8, shallow DoF with creamy bokeh falloff. Refined cinematic composition: rule-of-thirds, or centered with overhead orthogonal crop, or side-profile with negative space. Tack-sharp on subject\'s eyes and key wardrobe detail. Background objects readable but secondary. 8K resolution where it matters. Slight film-like colour rendition optional.',
    avoid: ['casual UGC feel', 'smartphone aesthetic', 'cluttered backgrounds', 'flat even lighting', 'blank mannequin expression', 'over-smoothed AI skin', 'generic pose'],
  },
  {
    id: 'EDITORIAL_FASHION',
    name: 'Fashion Editorial',
    description: 'Runway-inspired, strong styling, high fashion',
    category: 'editorial',
    icon: 'Shirt',
    whenToUse: ['Fashion launches', 'Lookbook', 'Designer brands'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: Model as living sculpture. Studio with solid saturated backdrop (vibrant red, deep blue, warm orange-yellow gradient, or clean white), or minimal architectural set, or set entirely covered in a material (newspapers, fabric). Strong styling drives everything: denim corset with grommets, oversized charcoal suit, sheer mesh top with patent pants, neon-jacket-over-black, leather and ribbed detailing. Pose is EDITORIAL — not generic standing: seated with crossed legs and hand near face, crouching with hands framing face toward camera, leaning with head tilted back, sitting on geometric colored blocks with shoe sole toward lens, or standing in a doorway with commanding presence. Expression must have ATTITUDE: confident smirk, cool direct gaze over lowered sunglasses, wide genuine smile, confrontational stare, or eyes-closed serenity. Product is the star — fabric, silhouette, accessories, sneakers, jewelry must read crystal-clear.',
    lightingGuide:
      'Controlled studio rig: key at 45° (beauty dish or large softbox), fill to taste (2:1 or 3:1 for drama). Strong rim or kicker for hair and shoulder separation against colored backdrop. Optional colored gel splits (warm orange from left, cool green from right) for editorial tension. Sharp specular detail on leather, patent, metal grommets, chain jewelry. For red/blue/orange backdrops: even studio wash with subtle gradient, subject separated by rim. 5600K on skin. For outdoor/set: harsh natural directional light acceptable for raw editorial edge. Skin real — pores, texture, micro-shine — never over-smoothed.',
    cameraGuide:
      '85–100mm telephoto for full or three-quarter body, OR 35mm wide with slight barrel distortion for dynamic low/high angles (shoe sole in foreground, face far). f/2.8–4. High-angle looking down for power, or extreme low-angle with subject looming, or straight-on dead-center. Fashion editorial framing — every inch of the frame intentional. Tack-sharp on subject and wardrobe detail. 8K.',
    avoid: ['casual/candid', 'smartphone look', 'natural/UGC feel', 'generic standing pose', 'blank expression', 'flat lighting', 'AI-smoothed skin'],
  },
  {
    id: 'EDITORIAL_STREET',
    name: 'Street Editorial',
    description: 'Urban edge, candid editorial, fashion-forward',
    category: 'editorial',
    icon: 'MapPin',
    whenToUse: ['Streetwear', 'Urban brands', 'Youth editorial'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: Urban fashion in real context — graffiti wall, concrete overpass, weathered distressed wall with visible cracks and wires, storefront glass, wet asphalt reflecting city lights, gas station at night, or metro railing. Subject has ATTITUDE: leaning against wall with arms crossed, walking mid-stride with hair in motion, crouching with wide stance, or standing with defiant hip-cock and direct gaze. Expression is alive — rebellious smirk, cool indifference, caught mid-laugh, or intense contemplative stare. Wardrobe is street-fashion-forward: denim corset with oversized hoop earrings, bomber jacket with varsity patches over joggers, black leather head-to-toe, or baggy cargo pants with a fitted tank. Accessories must POP: chunky chains, statement sunglasses, visible sneaker details, oversized rings. Raw but lit like a campaign — one frame that could lead a streetwear drop. Martin Parr meets high fashion.',
    lightingGuide:
      'Natural urban light: harsh directional daylight creating strong graphic shadows on concrete, or overcast soft key preserving detail everywhere. For night: moody mixed sources — warm neon signs, cool blue ambient, wet-surface reflections creating orange-teal color separation. Optional: prominent direct flash surrounded by phone flashlights for a red-carpet chaos editorial feel. Film grain and slight desaturation for edge. No clinical studio look — environment-driven shadows and color casts. Skin texture real: shine from humidity, visible pores.',
    cameraGuide:
      '35mm wide or 50mm standard, street framing, slight Dutch tilt for energy. f/2.8–4. Documentary-meets-campaign: slightly imperfect framing that feels alive. High-angle looking down for wide scale power feel, or low-angle for heroic energy. Subtle motion blur on hand or fabric if subject is mid-action. Film grain overlay acceptable. Background objects readable — not generic blur wash. 8K.',
    avoid: ['studio', 'perfect lighting', 'clean backgrounds', 'posed perfection', 'bland expression', 'static symmetry', 'over-smooth AI skin'],
  },
  {
    id: 'EDITORIAL_RETRO',
    name: 'Retro Editorial',
    description: '70s vintage, frontal flash, analog film texture',
    category: 'editorial',
    icon: 'Film',
    whenToUse: ['Vintage brands', 'Bold tailoring', 'Confrontational fashion'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: One frame from a vintage 70s fashion magazine shoot. Subject tightly framed in a weathered architectural doorway with peeling paint and aged wood, deep stairwell fading into darkness behind, OR on an outdoor tennis court with scattered balls and analog imperfection, OR seated in a director\'s chair against a solid red backdrop. Wardrobe is retro-meets-modern: oversized charcoal-gray suit with pale blue shirt, heavy dark-frame eyeglasses; or all-white tennis outfit with retro headband and wooden racket; or classic trench coat with crisp white shirt and black tie. Pose is CONFRONTATIONAL yet relaxed — hands in pockets leaning forward, lounging with crossed legs, or mid-casual-action with playful rebellion. Expression: commanding presence with slight smirk, or deadpan cool that dares you to look away. Strong body language — the subject owns the frame.',
    lightingGuide:
      'Direct frontal fill flash, slightly harsh and iconic of vintage 70s flash/editorial style — strong highlight on face, deep shadows behind. Strong analog film grain emulating Kodachrome or Ektachrome stock: visible grain structure, NOT digital noise. Gray fade treatment with subtle optical vignette at edges. Warm amber-teal color shifts. For outdoor: natural daylight with slight overexposure for washed film look, warm (4500–5000K). Matte finish, not glossy digital. Production-quality "vintage" — rich and dimensional, never muddy.',
    cameraGuide:
      'ISO 640, f/4, 1/100s feel. 35–50mm prime. Crisp editorial sharpness on eyes and wardrobe with vintage optical softness at edges. Slight vignetting. Analog color shifts (warm shadows, cool highlights). Film grain prominent and organic, not synthetic. Slightly tilted or perfectly frontal for editorial impact. 8K base resolution with convincing film treatment overlay.',
    avoid: ['modern clean digital look', 'soft diffused beauty lighting', 'no grain/texture', 'generic pose', 'blank expression', 'smartphone aesthetic'],
  },
  {
    id: 'EDITORIAL_CONCEPTUAL',
    name: 'Conceptual Editorial',
    description: 'Optical effects, motion blur stillness, composites',
    category: 'editorial',
    icon: 'Wand2',
    whenToUse: ['Conceptual campaigns', 'Emotional contrast', 'Optical effects'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: ONE strong visual concept per frame. Options: (A) Subject standing perfectly still on a metro platform while crowds dissolve into streaks of motion blur around them — chaos vs. calm, isolation vs. movement, emotional contrast. Expression: serene, introspective, untouched by the rush. (B) Subject photographed through thick vertically-reeded architectural glass — physical light refraction warps the profile into vertical repetitions, neon color from clothing bleeds through the glass ridges. Physical optics, NOT digital glitch. (C) Composite: walking model in foreground with enormous projected close-up of a second face filling the background — scale contrast, editorial confrontation. (D) Three subjects on a bench against white wall, all looking upward in synchronized contemplation — minimalist, sculptural, identity-focused. The concept must be UNMISTAKABLE in the frame.',
    lightingGuide:
      'Lighting serves the concept: (A) Metro: muted industrial, soft overhead fluorescents, warm train lights, cool concrete ambient — the still subject\'s face is the sharpest lit element. (B) Reeded glass: high-key studio, cool neutral, pale gray background — the glass creates all visual interest via physical refraction. (C) Composite: crisp technical dual-key — soft even wash on projected face, high-contrast softbox plus cooler rim on walking model. (D) Bench: bright cool neutral, soft but defined shadows — minimal, gallery lighting. All: skin texture preserved, no AI smoothing, realistic subsurface scattering.',
    cameraGuide:
      '(A) 1/8–1/4 second shutter, tripod, subject holds still — crowds become streaks. Shallow DoF on subject, deep on motion trails. (B) Sharp focus through glass, 85mm, f/2.8 — let the physical optics do the work. (C) 50mm, both planes sharp, composite depth. (D) Symmetric frontal, 35mm. All: 8K resolution, tack-sharp on subject(s), cinematic framing with strong negative space.',
    avoid: ['busy clutter', 'multiple competing concepts', 'digital filter effects', 'blank expressions', 'generic standing pose', 'low-resolution haze'],
  },
  {
    id: 'CREATIVE_CINEMATIC',
    name: 'Cinematic Motion',
    description: 'Dynamic action, motion blur, dramatic angles',
    category: 'creative',
    icon: 'Film',
    whenToUse: ['Sports', 'Athletic brands', 'Energy/action', 'Nightlife'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Freeze a moment of KINETIC ENERGY — the best frame from an action sequence. Options: (A) Runner mid-stride against deep orange/red backdrop, full body in motion blur with limbs streaking, backpack and fabric caught in wind, captured with slow shutter for kinetic effect. (B) Snowboarder carving through powder from behind — follow-cam perspective, snow spraying outward, massive jump in distance, clear blue sky above. (C) Dusk overpass: subject leaning on railing, head tilted back, city lights and traffic below creating warm bokeh — cinematic calm amid urban motion. (D) Subject surrounded by phone flashlights — direct-flash editorial chaos, harsh multiple flashes creating dramatic highlights and deep shadows, red-carpet energy. Expression matches the energy: fierce determination while running, serene joy while snowboarding, contemplative wonder looking at city, cool composure amid camera flashes.',
    lightingGuide:
      'Dramatic and directional: (A) Golden hour rim from behind creating silhouette edge, or warm-cool contrast (orange rim, blue fill). 35mm film grain, vintage documentary glow. (B) Bright natural snow-reflected light, clear blue sky, white surfaces bouncing fill everywhere. (C) Mixed urban practicals: warm tungsten from streetlamps, cool blue from twilight sky, car headlights creating bokeh circles. (D) Multiple harsh flash bursts from different angles, creating specular pops on skin, jewelry, sunglasses — deep dramatic shadows between sources, slight lens flare. All: high contrast, cinematic color grade, production-quality dynamic lighting.',
    cameraGuide:
      '24–35mm wide for power and inclusion of environment. (A) 1/30–1/60 shutter for intentional motion blur, or 1/500 freeze with panning background blur. Low perspective, shooting upward. (B) GoPro follow-cam from behind, wide with slight fisheye distortion. (C) 50mm, medium shot, slight above-eye angle, shallow DoF on subject with city bokeh. (D) 35mm, tight medium shot, shallow DoF, subject sharp amid blurred phone screens. f/2–2.8. 8K.',
    avoid: ['static pose', 'clean studio setting', 'gentle soft composition', 'blank expression', 'stiff body', 'flat lighting'],
  },
  {
    id: 'CREATIVE_SURREAL',
    name: 'Surreal Conceptual',
    description: 'One uncanny element in a realistic scene',
    category: 'creative',
    icon: 'Wand2',
    whenToUse: ['Brand storytelling', 'Campaign hero', 'Sci-fi / tech'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: Photorealistic scene with ONE surreal or sci-fi twist that makes the viewer do a double-take. The subject is calm and unaffected, as if the impossible is normal for them. Examples: (A) Man in futuristic black armored suit, bald head inside a transparent cryogenic helmet covered in ice particles and condensation, red-lensed goggles — frosty lab atmosphere. (B) Three people on a bench, center figure\'s entire body coated in matte black sculptural substance, seated normally among clothed companions — identity contrast. (C) Woman standing amid newspaper-covered environment — walls, floor, chair, every surface layered with colorful newspaper — neon jacket cutting through the monochrome chaos. The surreal element must be PHYSICALLY PLAUSIBLE — lit consistently with the scene, casting correct shadows, interacting with environment. Expression: calm, serene, perhaps faintly amused — never shocked by their own surreality.',
    lightingGuide:
      'Production lighting matching the realistic base scene: key at 45°, fill at 2:1. The surreal element is lit IDENTICALLY to everything else (same shadow direction, same color temperature, same specular quality). For cryogenic/cold: soft blue ambient wash, cold key, frost-scattered light. For body-painted/sculptural: gallery-style clean neutral, no dramatic shadows. For newspaper set: bright even studio light, minimal shadows, subject\'s outfit providing color contrast. Skin and material textures fully preserved — no AI smoothing.',
    cameraGuide:
      '35–85mm depending on framing (50mm for environmental surreal, 85mm for portrait close-up). f/2.8–4, clean composition with the surreal element clearly readable. Tack-sharp on subject and surreal detail. Moderate DoF so environment context is preserved. 8K resolution.',
    avoid: ['multiple surreal elements', 'fantasy illustration', 'digital glitch effects', 'horror', 'chaos', 'blank expression', 'generic pose', 'poorly lit surreal element'],
  },
  {
    id: 'CREATIVE_BOLD_COLOR',
    name: 'Bold Color Studio',
    description: 'Strong colour contrast, gel lighting, neon accents',
    category: 'creative',
    icon: 'Palette',
    whenToUse: ['Fashion brands', 'Colour-led campaigns', 'Statement pieces'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: COLOUR IS THE HERO. Solid saturated studio backdrop — vibrant red (#CC0000), royal blue (#003399), warm orange-to-yellow gradient, or rich emerald — with subject in high-contrast outfit that pops against it. Or: split-gel lighting creating warm-cool color division across face and body, two-tone background. Or: full-frame reeded glass with neon-colored tracksuit bleeding color through the vertical distortion. Pose is dynamic and fashion-forward: seated on geometric colored blocks with sneaker sole in extreme foreground, looking down from above with wide smile through bold sunglasses, leaning with hip-cock and hand adjusting shades, or standing in side-profile letting the color and distortion do the work. Expression MUST have life: confident smirk, genuine laugh, cool indifference, or eyes-closed serenity. Accessories pop: chunky chains, neon-frame sunglasses, statement rings, bright shoes.',
    lightingGuide:
      'Directional key at 45° with beauty dish or large softbox, fill at 2:1 or 3:1 for sculpted drama. Strong rim/kicker for edge separation from colored backdrop. For gel splits: warm reddish-orange from left, cool lime-green from right, creating distinct halves on face and clothing. For reeded glass: high-key studio, cool neutral — subject\'s clothing provides the color punch through the glass. Saturated intentional palette — color accuracy is critical. Specular highlights on jewelry, leather, patent materials. 5600K on skin. Sharp fabric detail.',
    cameraGuide:
      '50–85mm for straight-on fashion, OR 24–35mm wide-angle for dynamic high/low angles with fisheye-like distortion (face close to lens, body tapering). f/2.8–4. High-angle looking down for playful energy, extreme low-angle with shoe sole filling bottom frame, dead-center symmetric, or side-profile through glass. Every inch of frame purposeful. Tack-sharp on subject and wardrobe. 8K.',
    avoid: ['neutral muted tones', 'natural outdoor backgrounds', 'low saturation', 'casual/candid feel', 'blank expression', 'generic standing pose', 'flat even lighting'],
  },
  {
    id: 'SPORTS_DYNAMIC',
    name: 'Sports Action',
    description: 'Dynamic athletic motion, frozen or motion blur',
    category: 'sports',
    icon: 'Zap',
    whenToUse: ['Athletic brands', 'Sportswear', 'Energy drinks', 'Fitness'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Peak athletic motion captured at its most explosive frame. Options: (A) RAW analog editorial of two Gen Z athletes on a tennis court near the net — scattered balls, wooden racket, all-white outfits, playful rebellious body language (seated casually, leaning back). (B) Snowboard follow-cam from directly behind rider in white jacket, powder spraying outward, massive snow jump in distance, blue sky. (C) Runner mid-stride with backpack against deep orange studio backdrop, full-body motion blur streaking limbs and fabric. (D) Subject seated on bright yellow geometric blocks, bomber jacket, sneaker sole in extreme foreground filling bottom of frame — sneaker hero shot with attitude. Expression: fierce athletic determination, or rebellious carefree Gen Z energy, or confident smirk. Product (shoe, apparel, equipment) MUST be clearly visible and hero-lit.',
    lightingGuide:
      'For analog tennis: natural daylight, soft overcast outdoor tone, slight overexposure for vintage film look. Analog film grain, matte finish. For snowboard: bright reflected snow-light, clear blue sky, natural fill. For motion blur: dramatic key from 45° or rim from behind, golden hour glow, 35mm film grain. For sneaker hero: warm directional key (orange-yellow), soft haze/smoke, slight lens flare, dramatic rim on shoe sole. All: high contrast, cinematic, production-grade. Skin real with natural athletic shine.',
    cameraGuide:
      '24–35mm wide, low perspective for power OR follow-cam from behind. (Tennis) 35mm overhead angle, slightly tilted for candid imperfection. (Snowboard) Wide GoPro-style behind rider. (Motion blur) 1/30–1/60 shutter, panning shot. (Sneaker hero) Extreme low-angle, shoe sole in foreground, 24mm with perspective distortion. f/2.8. 8K.',
    avoid: ['static standing pose', 'studio portrait setting', 'muted tones', 'gentle soft mood', 'blank expression', 'stiff body language'],
  },
  {
    id: 'PRODUCT_LIFESTYLE',
    name: 'Product Lifestyle',
    description: 'Product in natural real-world setting',
    category: 'commercial',
    icon: 'ShoppingBag',
    whenToUse: ['D2C brands', 'Catalog ads', 'Product clarity'],
    platforms: ['instagram', 'google'],
    sceneGuide:
      'Director brief: Product in a REAL lived-in context that tells a story. Options: gas station at night with wet asphalt reflecting neon signs and a Porsche in the background; snowy mountain landscape with earthy-toned outerwear and faux-fur boots; vintage academic room with velvet armchair, stacked books, and table lamp; overpass railing at dusk with city skyline behind; or director\'s chair against a solid red backdrop with trench coat and loafers. Product is primary — every seam, texture, material sheen must be camera-ready. Model secondary but NOT a mannequin: natural relaxed pose, confident expression, hands interacting with product or environment. The setting should make someone want the LIFE that comes with the product.',
    lightingGuide:
      'Soft directional key from 30–45° (window, golden hour, or practical lamp), fill at 2:1 for shape without harshness. 5500K neutral for daylight, 3200–4000K warm for interior/night. For night scenes: dark moody grade with vibrant reflections from artificial lights and cool blue shadows, wet surfaces reflecting colored sources. For outdoor: natural sunlight creating sharp crisp highlights and shadows. Product lit to premium standard: material texture, stitching detail, zipper hardware, fabric weave all visible. Skin natural and real.',
    cameraGuide:
      '50mm standard for clean product-focused framing, OR 35mm for environmental context. f/2.8–4. Product and key styling details tack-sharp. Background readable but secondary. Professional e-commerce clarity married to lifestyle storytelling. 8K. Slight film-like color rendition for warmth.',
    avoid: ['cluttered busy backgrounds', 'dramatic artistic distortion', 'heavy stylisation', 'product lost in scene', 'blank expression on model', 'flat even lighting'],
  },
  {
    id: 'PERF_BEST_QUALITY',
    name: 'Best Quality Pro',
    description: 'Highest-fidelity production look',
    category: 'performance',
    icon: 'Crown',
    whenToUse: ['Flagship ad sets', 'High-budget campaigns', 'Homepage hero'],
    platforms: ['instagram', 'facebook', 'google'],
    sceneGuide:
      'Director brief: A FLAWLESS campaign hero frame — the single image a global brand would put on a billboard, homepage, or flagship ad. One unmistakable focal subject wearing or holding the product, in a clean but cinematic environment that enhances the story. Environment options: architectural interior with aged character, silk-linened bed against a colored void, cloud-filled sky with subject in lower third, snowy mountain at golden hour, clean white studio with bold colored accents. Subject\'s expression is the MOST IMPORTANT element: it must convey genuine human emotion — confident direct gaze, contemplative profile looking into distance, caught-mid-smile warmth, serene closed-eyes stillness, or defiant upward tilt. Hands doing something purposeful: adjusting collar, clasped thoughtfully, holding bouquet, resting on railing. Posture tells a story. Every element in the frame serves the product and narrative. This preset should produce images that are INDISTINGUISHABLE from a real photoshoot.',
    lightingGuide:
      'Balanced premium rig: soft directional key at 45° with large modifier, controlled fill at 2:1 ratio, subtle rim for three-dimensional separation. Realistic material highlights: glossy sheen on leather, soft diffusion on cotton, sharp specular on metal/jewelry. Skin micro-texture FULLY preserved: pores, fine facial hair, natural imperfections, warm subsurface scattering at ears and fingertips. High dynamic range — no crushed blacks, no clipped highlights, full tonal information in shadows and highlights. Premium cinematic color science: rich but not oversaturated, neutral but not flat. 5500K neutral with allowance for warm environmental practicals.',
    cameraGuide:
      '50–85mm commercial portrait lens, precise focus placement on eyes and hero product detail. Shallow-to-medium DoF (f/2–4) depending on product readability needs. Cinematic composition: strong rule-of-thirds, or overhead orthogonal, or centered symmetric, or side-profile with expansive negative space. 8K sharpness on all hero details. Smooth natural falloff in bokeh areas. No digital artifacts, no edge compression, no vignette unless intentional.',
    avoid: ['over-stylized chaos', 'low-contrast haze', 'blurry hero subject', 'artifact-heavy post effects', 'blank mannequin expression', 'dead eyes', 'AI-smoothed plastic skin', 'generic standing pose', 'flat featureless lighting'],
  },
  // ── CINEMATIC PRESETS ─────────────────────────────────────────
  {
    id: 'CINEMATIC_NEO_NOIR',
    name: 'Neo-Noir Portrait',
    description: 'Moody rooftop night portrait, neon-lit, raw and visceral',
    category: 'cinematic',
    icon: 'Film',
    whenToUse: ['Night campaigns', 'Edgy brands', 'Streetwear drops', 'Neo-noir editorial'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Centered close-up portrait on a rooftop at night. Subject\'s face framed tightly with an intense upward gaze toward the sky, head tilted slightly back with fixed intensity. Urban rooftop background with blurred city lights in deep purples and cool blues glowing softly behind the subject — indistinct urban environment creating a stark, cinematic neo-noir ambience. Subject wears the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern). Style it with dark, minimal complementary pieces that don\'t compete with the hero product. Subject may have raw details like damp hair clinging to forehead, visible fresh marks or textures on skin that add visceral rawness. Pose is upright and commanding — not relaxed, not posed — frozen in a moment of raw intensity. The frame should feel like a still from a neo-noir film: one person alone on a rooftop, looking up, surrounded by the glow of a sleeping city. Every element serves the mood — raw, visceral, cinematic editorial portrait.',
    lightingGuide:
      'ISO 800, f/2.8, 1/60s feel — tuned for low-light neon atmosphere. No flash — lit ONLY by ambient neon and city light. Low fill light sculpting facial contours with deep purple and cool blue reflections from neon sources accentuating skin texture. Strong sculpting shadows under jawline and jacket folds, softer gradients across face creating dimensional depth. Skin must show wet sheen and real texture — pores, micro-imperfections, natural subsurface scattering. Color temperature split: cool blue-purple ambient from sky and city, warm accents from distant neon signs. Production-quality neo-noir lighting — moody, dimensional, never flat.',
    cameraGuide:
      'Close-up portrait framing, centered composition with subject\'s face filling the frame. Slight vignette framing subject against the blurred rooftop background. Shallow depth of field — subject crisp and sharp, urban background details softly obscured into bokeh circles of purple and blue city lights. Subtle neon lens flare shimmering across jacket surface adds cinematic artifact. Medium film grain overlay for gritty cinematic tone — NOT digital noise, organic grain structure. 85mm equivalent portrait lens feel. Tack-sharp on eyes and facial texture. 8K resolution with convincing film grain treatment.',
    avoid: ['bright daylight', 'studio lighting', 'flat flash', 'happy expressions', 'clean polished look', 'beauty filter smoothing', 'plastic AI skin', 'generic backgrounds', 'cluttered frame'],
  },
  {
    id: 'CINEMATIC_STREET_CULTURE',
    name: 'Street Culture Raw',
    description: 'Raw 90s street culture, park bench confidence, film grain',
    category: 'cinematic',
    icon: 'MapPin',
    whenToUse: ['Streetwear brands', 'Retro campaigns', '90s aesthetic', 'Youth culture'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Medium shot of a young person sitting confidently on a park bench in autumn. Subject leans forward toward the camera, elbows resting on widely spread knees, exuding strong, raw confidence with a smirking, intense expression — rebellious attitude. Subject wears the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern, brand marks). Style the rest of the outfit with complementary streetwear pieces that don\'t compete with the hero product. Background: crisp fall park with orange-yellow leaves scattered on ground, bare trees, soft golden sunlight filtering through branches, cool misty autumn atmosphere. The scene should feel like an authentic moment captured in street culture — raw, unpolished, real. Dynamic pose with weight leaning aggressively forward, hands expressive and natural. Ultra-realistic skin texture: visible pores, natural shine, imperfections. The frame should make you feel the cold autumn air and hear leaves crunching.',
    lightingGuide:
      'Natural autumn daylight: soft golden sunlight filtering through bare tree branches creating dappled warm-cool light patterns. Cinematic lighting with sharp focus on face and upper body. Color temperature warm (4500–5200K golden hour autumn feel). Slight overexposure on highlights for that vintage film look. Warm amber tones on skin from filtered sunlight, cool blue-green in shadow areas. No artificial fill — pure natural light with cinematic quality. Skin shows natural shine and texture from cold weather. Fabric shows realistic nylon sheen and wrinkles. Cool misty atmosphere visible in background adding depth layers.',
    cameraGuide:
      'Medium shot, slightly below eye level for power dynamic. 35–50mm equivalent for environmental context while keeping subject dominant. f/2.8–4 for moderate depth — subject sharp, background readable but with soft fall-off. Photorealistic detail: ultra-realistic skin texture, fabric weave on nylon, leaf textures on ground, wood grain on bench. Dynamic pose composition with subject leaning forward creates natural leading lines. Film grain overlay: medium-heavy vintage film stock feel (Kodak Gold 200 / Fuji Superia vibes). Slight warm color shift in shadows. 8K resolution base with convincing analog film treatment. Captures the raw, confrontational energy of 90s street photography.',
    avoid: ['studio setting', 'clean modern aesthetic', 'beauty filter', 'over-stylized', 'passive expression', 'stiff pose', 'digital clean look', 'AI smoothing', 'generic western suburban park'],
  },
  {
    id: 'CINEMATIC_JEWELRY_CLOSEUP',
    name: 'Intimate Close-Up',
    description: 'Macro jewelry & accessory editorial, hand-face composition',
    category: 'cinematic',
    icon: 'Heart',
    whenToUse: ['Jewelry brands', 'Accessories', 'Beauty editorial', 'Luxury close-ups'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: Extreme close-up captured with iPhone intimacy — hand pressed near face, fingers adorned with the EXACT product accessories from the uploaded reference image (preserve every detail: material, color, brand marks, design). Hair escaping in golden or natural strands from a messy bun. Subject pressing fingertips near frosted lips where subtle gloss barely catches light. The frame slants just enough to feel unstudied and spontaneous — a stolen intimate moment, not a posed shoot. The uploaded product is the hero — featured prominently in the hand-face composition. Tiny skin pores texture visible on cheek, contrasting with metallic/product surfaces. Background is soft and environmental — ocean rocks with water shimmer, stairwell, or brushed metal — always secondary to the hand-face-product triangle. Every element serves this composition: the product, the skin, the lips, the hair, the light. Modern muse editorial feel — effortless luxury captured in a candid moment.',
    lightingGuide:
      'Natural ambient light with soft directional quality — midday sunlight, cold fluorescent glow, or golden hour warmth depending on environment. Light must catch and dance on jewelry surfaces: sharp specular highlights on silver/gold rings, soft diffused glow on matte skin, subtle gloss reflection on lips. Sun-kissed quality on skin with warm subsurface scattering. Color temperature natural (5500K daylight or warm golden hour). Visible light interaction with every surface: metal reflections, skin luminosity, hair translucency, fabric matte. No harsh shadows — soft wraparound light that reveals texture without drama. iPhone camera light quality — honest, intimate, real.',
    cameraGuide:
      'Extreme close-up, hand-face jewelry focus. iPhone-captured aesthetic: slightly tilted frame (2–5° dutch angle) for natural spontaneity. Very shallow depth of field — sharp focus on jewelry and nearest skin, soft fall-off on background. Macro-level detail: individual skin pores, ring engravings, chain link detail, nail texture, lip gloss sheen, hair strand separation. f/1.8–2.4 equivalent. The composition is the hand-face triangle — rings near lips, fingers touching face, jewelry as the bridge between person and viewer. Lens may pick up subtle reflections in jewelry surfaces (phone screen, environment). No heavy processing — clean, intimate, modern editorial captured on mobile. 8K detail on jewelry and skin texture.',
    avoid: ['wide shots', 'full body', 'studio backdrop', 'heavy makeup', 'over-processed', 'flat lighting on jewelry', 'generic product photography', 'stiff posed hands', 'AI-smoothed skin', 'fake bokeh'],
  },
  {
    id: 'CINEMATIC_MINECRAFT_HYBRID',
    name: 'Minecraft Hybrid',
    description: 'Photorealistic subject in voxel Minecraft world',
    category: 'cinematic',
    icon: 'Box',
    whenToUse: ['Gaming collabs', 'Gen Z campaigns', 'Viral content', 'Mixed-media editorial'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: High-quality cinematic Minecraft screenshot — mixed-media composition where the human subject remains COMPLETELY photorealistic and unchanged (no pixelation or block filters on their body, clothing, or face) but is embedded in a voxel-based Minecraft environment. CRITICAL: Any non-human object in direct physical contact with or nearby the subject (pets, props, items) MUST be converted into Minecraft block models or mobs — a real dog becomes a Minecraft wolf, a real tree becomes blocky voxel tree. Background analysis: take the reference image\'s background structure and recreate it entirely out of Minecraft voxel blocks. Trees, terrain, paths, foliage — all cubic blocks with pixel art textures. Atmosphere should replicate the original mood (foggy forest, sunny park, urban street) using blocky volumetric fog layers and Minecraft-appropriate atmospheric effects. The human is a portal between real and virtual — photorealistic person standing naturally in a world made of blocks. This creates a surreal, shareable, viral-ready image that bridges gaming culture and fashion.',
    lightingGuide:
      'Minecraft daylight with gentle haze and consistent block-based shadows. The lighting on the photorealistic subject must match the Minecraft world lighting direction and color temperature — seamless integration is critical. Soft ambient from Minecraft sky, directional sun creating blocky shadow patterns on voxel ground that naturally extend to the subject\'s feet. Subject retains photorealistic skin lighting: pores, subsurface scattering, material reflections — all at camera-ready quality. The voxel environment uses Minecraft\'s characteristic flat-lit surfaces with sharp shadow edges on block faces. Color temperature unified between both worlds: warm golden for daytime, cool blue-purple for night/overcast. No lighting discontinuity between real subject and voxel world.',
    cameraGuide:
      'Maintain the exact camera angle and framing from the reference composition. Third-person game camera feel with cinematic quality — slightly elevated or at character eye level. Depth of field should bridge both worlds: subject sharp, voxel environment with natural depth falloff. The voxel blocks should have clean pixel-art textures with visible block edges and faces. Subject\'s clothing, skin, and accessories at 8K photorealistic detail contrasting beautifully with the lo-fi voxel world. Composition follows gaming screenshot conventions but with campaign-level polish. No UI elements, no HUD, no inventory bars — pure cinematic game screenshot aesthetic.',
    avoid: ['pixelated subject', 'block filter on human', 'realistic background', 'UI elements', 'HUD overlay', 'low quality', 'inconsistent lighting between subject and world', 'cartoon style on human', 'flat 2D look', 'generic 3D render'],
  },
  {
    id: 'CINEMATIC_STUDIO_EDITORIAL',
    name: 'Studio Editorial',
    description: 'Full-body fashion studio portrait, editorial confidence, minimal background',
    category: 'cinematic',
    icon: 'Sparkles',
    whenToUse: ['Fashion e-commerce', 'Lookbook', 'Studio campaigns', 'Brand identity'],
    platforms: ['instagram', 'facebook', 'google'],
    sceneGuide:
      'Director brief: Full-body fashion portrait in a professional fashion studio. Subject stands in a confident, slightly dominant editorial fashion pose — torso slightly leaned forward and angled, legs positioned apart with a relaxed stance. One hand placed naturally on the upper thigh while the other grips the waistband or belt area. The posture must appear natural, relaxed, and editorial — NOT stiff catalog posing. Subject wears the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern, stitching, texture). Style the rest of the outfit with minimal complementary pieces that don\'t compete with the hero product. Clothing must look realistic with natural fabric stretching, wrinkles, and lighting response. Expression is serious, confident, slightly seductive editorial fashion — natural lips, relaxed eyebrows, subtle gaze directly toward the camera. The entire frame should feel like it came from a fashion lookbook — minimal, clean, powerful.',
    lightingGuide:
      'Professional fashion studio lighting: soft key light from 45° front-left (large softbox or beauty dish), fill at 2:1 ratio for sculpted but not harsh dimensionality. Subtle shadows that define jawline, collarbone, and fabric folds without being dramatic. Balanced contrast with realistic skin rendering — slight natural skin texture, visible pores, very subtle sun pigmentation. Background is minimalistic light neutral or gray with subtle tonal gradation. No harsh edge shadows. Color temperature neutral 5500–5600K. Avoid artificial or over-smoothed AI skin look — skin must read as REAL with micro-texture and natural luminosity. Fabric lighting response must be truthful: matte cotton absorbs, denim shows weave, hair catches specular highlights.',
    cameraGuide:
      'Full body shot, centered composition, vertical portrait format, fashion magazine editorial style. 50–85mm portrait lens equivalent, f/4–5.6 for moderate depth keeping entire subject sharp from head to shoes. Ultra photorealistic rendering, high detail, cinematic fashion photography quality. Sharp focus throughout with natural depth of field falloff only on background. 8K resolution. Framing leaves breathing room above head and below feet. Clean composition with no distracting elements. The pose, the clothes, and the expression tell the entire story.',
    avoid: ['busy backgrounds', 'heavy color grading', 'dramatic shadows', 'cartoon or stylized look', 'over-smoothed AI skin', 'stiff catalog pose', 'exaggerated body proportions', 'logos or prints on clothing', 'cluttered accessories', 'beauty filter'],
  },
  {
    id: 'CINEMATIC_RETRO_FLIRTY',
    name: 'Retro Flirty Editorial',
    description: 'High-angle 50mm, flirtatious candid, Italian retro vibes',
    category: 'cinematic',
    icon: 'Heart',
    whenToUse: ['Fashion brands', 'Retro campaigns', 'Sportswear editorial', 'European aesthetic'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: High-angle shot looking down at a young woman in her early 20s. She looks UP at the camera in a flirtatious, candid way — the angle creates intimacy and playful power dynamic. Her left arm reaches behind holding her right arm along her body, legs crossed in an almost innocent but provocative posture. The setting is a warm retro interior — think mid-century modern room with dark wood paneling, leather armchairs, herringbone parquet floor, vintage rug, scattered magazines. Subject wears the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern). Style the rest of the outfit with complementary retro-inspired pieces that don\'t compete with the hero product. Makeup is intentional: soft enhanced features with natural volumized lashes, cat-eye black liner, pink gloss lips, natural soft cheek contour. The entire scene should feel like a 1970s Italian fashion editorial brought into the modern day — warm, intimate, confident, with the model owning the frame from below the camera.',
    lightingGuide:
      'Warm practical interior lighting: overhead ambient creating the high-angle illumination, supplemented by warm practical sources (table lamps, window light) at 3200–4500K for that golden retro warmth. Slight overexposure on highlights for vintage film quality. Color palette is warm earth tones: brown wood, cognac leather, cream rug, warm skin tones. Film grain: medium analog grain structure (Kodak Portra 400 / Fuji Pro 400H vibes). Matte finish, not glossy digital. Skin shows natural texture with warm subsurface scattering, realistic pores and imperfections. Hair catches warm highlights with natural shine. Fabric shows realistic texture — pattern weave, sock ribbing, shoe leather grain.',
    cameraGuide:
      'High angle 50mm camera, shooting downward at the seated subject. f/2.8–4 for shallow-to-moderate depth — subject sharp, environment readable but with warm falloff. The high angle emphasizes the upward gaze and creates the flirtatious candid dynamic. Composition has the subject filling roughly 2/3 of the frame with environment context visible around her. Vintage film color science: warm shadows, slightly desaturated highlights, amber-teal color shifts. Film grain prominent and organic. Slightly warm color cast throughout. The framing should feel like a behind-the-scenes shot from a vintage Italian fashion house — intimate, unguarded, magnetic. 8K base resolution with convincing analog film treatment.',
    avoid: ['clean digital look', 'cold color temperature', 'studio backdrop', 'modern minimalist setting', 'blank expression', 'stiff pose', 'over-retouched skin', 'harsh flash', 'low-angle', 'generic background'],
  },
  {
    id: 'CINEMATIC_IPHONE_STREET',
    name: 'iPhone Street Candid',
    description: 'Wide-angle iPhone snapshot, urban playful, spontaneous energy',
    category: 'cinematic',
    icon: 'Camera',
    whenToUse: ['Streetwear brands', 'Gen Z campaigns', 'Casual brands', 'Social-first content'],
    platforms: ['instagram', 'facebook'],
    sceneGuide:
      'Director brief: Natural, dynamically playful wide-angle iPhone-style photograph of a person standing on a lively city street corner, looking directly upward into the camera with a genuine neutral expression and relaxed posture. Hair is casually tousled with subtle natural waves. Subject wears the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern). Style the rest of the outfit with layered urban pieces that complement the hero product without competing. Accessories: minimalistic canvas crossbody bag in warm taupe, sleek silver chain bracelet adding subtle edge. The urban backdrop vividly captures textured brick storefronts with diverse signage, scattered pedestrians engaged in casual activities, glimpses of parked bicycles, and subtle blur of city traffic. The entire image must feel like an authentic iPhone snapshot from a friend — spontaneous, unposed, a moment captured amid everyday city life, but with the styling of a campaign lookbook.',
    lightingGuide:
      'Soft natural afternoon sunlight filtering through nearby trees casting delicate shadows and highlights. The light accentuates realistic fabric textures including creases on jacket sleeves, varied hair strands, and detailed skin pores. Warm afternoon color temperature (5000–5500K) with golden quality in highlights and cool blue in shadows. No artificial fill — pure natural urban daylight. Brick and stone surfaces show warm reflected light. Glass storefronts catch sky reflections. Skin shows natural shine from outdoor warmth, visible pores, realistic texture. iPhone camera light quality — honest, direct, slightly contrasty with natural HDR feel.',
    cameraGuide:
      'Wide-angle iPhone-style: 24–26mm equivalent with pronounced wide-angle lens distortion. Elevated camera angle (shot from above, looking down at the subject). The wide-angle distortion emphasizes upper body prominently with slight foreshortening of legs, creating the engaging spontaneous feel typical of an authentic iPhone snapshot. f/1.8–2.4 with natural iPhone depth effect. Subject sharp with slight natural background softening (not heavy bokeh — computational photography style). Visible environmental context: readable signage, brick textures, pedestrian motion. Hyper-detailed textures: skin pores, fabric weave, sneaker stitching, bag canvas grain, bracelet links. The composition reinforces effortlessly stylish, playful yet genuine urban aesthetic with clear authenticity. 8K resolution with iPhone processing aesthetic.',
    avoid: ['professional studio look', 'DSLR bokeh', 'flat lighting', 'stiff pose', 'blank expression', 'over-processed', 'beauty filter', 'generic background', 'heavy color grading', 'artificial depth of field'],
  },
  {
    id: 'CINEMATIC_GOLDEN_GARDEN',
    name: 'Golden Garden Reverie',
    description: 'Golden hour garden setting, timeless calm, flowing fabrics',
    category: 'cinematic',
    icon: 'Star',
    whenToUse: ['Luxury brands', 'Romantic campaigns', 'Timeless editorial', 'Organic/natural brands'],
    platforms: ['instagram'],
    sceneGuide:
      'Director brief: Golden afternoon sunlight filters through the sprawling branches of a centuries-old oak tree, casting intricate lacework shadows upon a weathered stone bench nestled in a peaceful garden. A young woman with hair cascading in soft waves sits in tranquil contemplation, wearing the EXACT product garment from the uploaded reference image — preserve every detail of the product (color, material, fit, logos, pattern). Style the rest of the outfit with minimal complementary pieces that suit the garden setting. Her fingers lightly trace the edge of a delicate porcelain teacup. The gentle rustle of leaves mingles with the subtle warmth of late-day light. The composition captures a quiet moment of stillness from a gentle eye-level perspective, evoking a timeless sense of calm and introspection. The garden is lush with green grass, scattered autumn leaves at the base of the oak, and a sense of vast peaceful landscape behind. Every element tells a story of unhurried elegance — the worn stone of the bench, the delicate porcelain, the product garment catching the golden light, the ancient tree. This is a moment frozen in golden time.',
    lightingGuide:
      'Golden hour magic light: late afternoon sun low in the sky creating long warm shadows and backlighting through oak tree branches. Strong warm color temperature (4000—4800K golden hour). The light illuminates the fine texture of dress fabric and reveals subtle freckles across skin. Rim light from behind catches hair edges creating a golden halo effect. Lens flare from direct sunlight filtering through leaves is welcome and adds to the ethereal quality. Fill comes naturally from green grass reflecting warm ambient light upward onto the subject. Skin shows warm subsurface scattering, natural freckles, subtle texture. Fabric catches and flows with the light — cream dress becomes luminous and translucent at edges. The stone bench shows worn texture in the golden wash. Deep shadows in the tree canopy contrast with the bright golden light creating dramatic natural chiaroscuro.',
    cameraGuide:
      'Eye-level or slightly below, gentle composition maintaining intimacy with the subject. 50–85mm portrait lens, f/2.8–4 for moderate depth — subject and immediate environment sharp, distant garden falling into soft golden bokeh. The oak tree branches create natural framing above. Vertical portrait format preferred. Tack-sharp on subject\'s hands, teacup, and face details. Natural lens flare from sun acceptable. Film-like color rendition with warm golden tones throughout. Fine detail: hair strand separation in backlight, porcelain teacup translucency, fabric drape and fold shadows, stone bench weathering texture, leaf veins on ground. The composition evokes classic oil painting aesthetics combined with photographic realism. 8K resolution with warm cinematic color science.',
    avoid: ['harsh midday light', 'cold color temperature', 'urban setting', 'modern architecture', 'busy backgrounds', 'action poses', 'intense expressions', 'heavy contrast', 'over-saturated colors', 'AI-smoothed skin', 'plastic fabric look'],
  },
]

// Production guard: every AD_PRESET_IDS must have a matching preset (fail fast on misconfig)
const _definedPresetIds = new Set(AD_PRESETS.map((p) => p.id))
for (const id of AD_PRESET_IDS) {
  if (!_definedPresetIds.has(id)) throw new Error(`Ad preset missing definition: ${id}`)
}
if (_definedPresetIds.size !== AD_PRESETS.length) {
  throw new Error('Duplicate ad preset IDs detected')
}

const SANITIZED_AD_PRESETS: AdPreset[] = AD_PRESETS.map(sanitizePreset)

for (const preset of SANITIZED_AD_PRESETS) {
  if (!preset.sceneGuide || !preset.lightingGuide || !preset.cameraGuide) {
    throw new Error(`Preset "${preset.id}" has empty guide fields`)
  }
}

for (const presetId of Object.keys(PRESET_STYLE_PACK_OVERRIDES) as AdPresetId[]) {
  if (!AD_PRESET_IDS.includes(presetId)) {
    throw new Error(`Invalid style pack override key: ${presetId}`)
  }
}
for (const presetId of Object.keys(PRESET_TEXT_SYSTEM_OVERRIDES) as AdPresetId[]) {
  if (!AD_PRESET_IDS.includes(presetId)) {
    throw new Error(`Invalid text system override key: ${presetId}`)
  }
}

const TIER_SORT: Record<PresetTier, number> = {
  safe: 0,
  bold: 1,
  experimental: 2,
}

const CATEGORY_DEFAULT_TAXONOMY: Record<AdPresetCategory, PresetTaxonomy> = {
  ugc: { tier: 'safe', stability: 'high', pack: 'creator' },
  editorial: { tier: 'bold', stability: 'medium', pack: 'fashion' },
  commercial: { tier: 'safe', stability: 'high', pack: 'performance' },
  creative: { tier: 'experimental', stability: 'medium', pack: 'experimental' },
  standalone: { tier: 'safe', stability: 'high', pack: 'performance' },
  performance: { tier: 'safe', stability: 'high', pack: 'performance' },
  sports: { tier: 'bold', stability: 'medium', pack: 'sports' },
  indian: { tier: 'bold', stability: 'high', pack: 'heritage' },
  cinematic: { tier: 'bold', stability: 'medium', pack: 'fashion' },
}

const PRESET_TAXONOMY_OVERRIDES: Partial<Record<AdPresetId, PresetTaxonomy>> = {
  EDITORIAL_PREMIUM: { tier: 'safe', stability: 'high', pack: 'fashion' },
  PERF_BEST_QUALITY: { tier: 'safe', stability: 'high', pack: 'performance' },
  SPORTS_DYNAMIC: { tier: 'bold', stability: 'high', pack: 'sports' },
}

function withTaxonomy(preset: AdPreset): AdPresetDisplay {
  const defaults = CATEGORY_DEFAULT_TAXONOMY[preset.category]
  const override = PRESET_TAXONOMY_OVERRIDES[preset.id]
  return {
    ...preset,
    ...(override || defaults),
  }
}

// ═══════════════════════════════════════════════════════════════
// PRESET CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const AD_PRESET_CATEGORIES: {
  id: AdPresetCategory
  label: string
  icon: string
}[] = [
    { id: 'cinematic', label: 'Cinematic', icon: 'Film' },
    { id: 'ugc', label: 'UGC', icon: 'Camera' },
    { id: 'editorial', label: 'Editorial', icon: 'BookOpen' },
    { id: 'commercial', label: 'Commercial', icon: 'ShoppingBag' },
    { id: 'creative', label: 'Creative', icon: 'Wand2' },
    { id: 'standalone', label: 'Standalone', icon: 'Box' },
    { id: 'performance', label: 'Performance', icon: 'Zap' },
    { id: 'sports', label: 'Sports', icon: 'Star' },
    { id: 'indian', label: 'Indian Fashion', icon: 'Crown' },
  ]

export function getPresetsByCategory(category: AdPresetCategory): AdPresetDisplay[] {
  return SANITIZED_AD_PRESETS
    .filter((p) => p.category === category)
    .map(withTaxonomy)
    .sort((a, b) => TIER_SORT[a.tier] - TIER_SORT[b.tier])
}

// ═══════════════════════════════════════════════════════════════
// LEGACY PROMPT TEMPLATES (fallback if GPT-4o times out)
// ═══════════════════════════════════════════════════════════════

const SAFETY_SUFFIX = `
No surreal elements (unless preset requires it), no fantasy effects, no glitch art, no collage, no duplicated features, no floating objects (unless preset requires it), no exaggerated anatomy, no body distortion, no extra unplanned text, no unplanned logos, no watermarks, no unrealistic lighting (unless preset requires it), no painterly or illustrated style (unless preset requires it). Photorealistic commercial photography unless preset explicitly specifies otherwise.
COMPOSITION: Use strong focal hierarchy — subject and product are the visual anchors. Depth layering with foreground, mid-ground, background. Balanced negative space. No cluttered or chaotic frames.
PRODUCT: The uploaded product must be the hero — accurate color, texture, pattern, design details. Must be clearly visible, well-lit, and prominent in the frame.
TEXT: If text is requested, render it crisp, properly spelled, well-kerned, and naturally integrated. If no text requested, include ZERO text of any kind.
HANDS: Five fingers per hand, correct anatomy, natural bone structure, realistic nail beds. No extra, fused, or missing fingers.`

/**
 * Build a basic fallback prompt from preset + input (no GPT).
 * Used when GPT-4o prompt builder times out.
 */
/** Presets that default to "product only" but allow user character override */
const PRODUCT_ONLY_PRESET_IDS: Set<string> = new Set(['PRODUCT_LIFESTYLE'])

export function buildFallbackPrompt(input: AdGenerationInput): string {
  const preset = SANITIZED_AD_PRESETS.find((p) => p.id === input.preset)
  if (!preset) throw new Error(`Unknown preset: ${input.preset}`)

  const character = resolveCharacterDescription(input)
  const textOverlay = resolveTextOverlay(input.textOverlay)
  const hasCharacter = !!character

  // Override scene guide when user selects character on product-only preset
  let sceneGuide = preset.sceneGuide
  let avoidTerms = [...preset.avoid]

  if (hasCharacter && PRODUCT_ONLY_PRESET_IDS.has(input.preset)) {
    sceneGuide = sceneGuide
      .replace(/No model[;,.]?\s*/gi, '')
      .replace(/product is the hero/gi, 'product is prominently featured')
    avoidTerms = avoidTerms.filter(
      (t) => !t.toLowerCase().includes('model') && !t.toLowerCase().includes('person')
    )
  }

  const hasText = !!(input.textOverlay && (input.textOverlay.headline || input.textOverlay.subline || input.textOverlay.tagline))
  const noTextInstruction = hasText ? '' : 'NO TEXT: Do NOT include any text, words, letters, numbers, brand names, slogans, or typography in the image. This is a photography-only composition with ZERO written content.'
  const stylePackDirective =
    input.stylePack === 'luxury'
      ? 'Style pack: LUXURY. Premium editorial polish, elevated materials, cinematic lighting, restrained color harmony, and sophisticated composition.'
      : input.stylePack === 'sports'
        ? 'Style pack: SPORTS. Dynamic athletic energy, body-in-motion clarity, bold angles, and high-impact commercial sports styling.'
        : 'Style pack: HIGH STREET. Modern retail campaign look, trend-forward styling, clean typography zones, and urban-commercial realism.'

  return [
    stylePackDirective,
    sceneGuide,
    character ? `Character (MUST be prominent): ${character}` : '',
    `Lighting: ${preset.lightingGuide}`,
    `Camera: ${preset.cameraGuide}`,
    textOverlay,
    noTextInstruction,
    `Avoid: ${avoidTerms.join(', ')}${hasText ? '' : ', text, words, letters, numbers, brand names'}.`,
    SAFETY_SUFFIX,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function resolveCharacterDescription(input: AdGenerationInput): string {
  const ct = input.characterType || (input.subject?.gender ? (input.subject.gender === 'male' ? 'human_male' : 'human_female') : 'none')

  if (ct === 'none') return ''
  if (ct === 'animal') {
    return `A photorealistic ${input.animalType || 'animal'} wearing the featured product. ${input.characterStyle ? `Style: ${input.characterStyle}.` : ''}`
  }

  const gender = ct === 'human_male' ? 'man' : 'woman'
  const age = input.characterAge || input.subject?.ageRange || '22-30'
  const style = input.characterStyle || 'natural, confident'
  const pose = input.subject?.pose || 'relaxed, natural'
  const expression = input.subject?.expression || 'confident'
  const identityDirective =
    input.characterIdentity === 'indian_woman_modern'
      ? 'Indian woman, modern South Delhi aesthetic (contemporary urban styling), explicitly avoid stereotypical or costume-like cultural cues. Casting lock: the model must clearly read as Indian and must not drift to non-Indian identity.'
      : input.characterIdentity === 'indian_man_modern'
        ? 'Indian man, modern South Delhi aesthetic (contemporary urban styling), explicitly avoid stereotypical or costume-like cultural cues. Casting lock: the model must clearly read as Indian and must not drift to non-Indian identity.'
        : input.characterIdentity === 'south_asian_modern'
          ? 'South Asian modern identity with contemporary styling and realistic urban context.'
          : input.characterIdentity === 'east_asian_modern'
            ? 'East Asian modern identity with contemporary styling and realistic urban context.'
            : input.characterIdentity === 'middle_eastern_modern'
              ? 'Middle Eastern modern identity with contemporary styling and realistic urban context.'
              : input.characterIdentity === 'african_modern'
                ? 'African modern identity with contemporary styling and realistic urban context.'
                : input.characterIdentity === 'latina_modern'
                  ? 'Latina modern identity with contemporary styling and realistic urban context.'
                  : input.characterIdentity === 'european_modern'
                    ? 'European modern identity with contemporary styling and realistic urban context.'
                    : input.characterIdentity === 'north_american_modern'
                      ? 'North American modern identity with contemporary styling and realistic urban context.'
                      : input.characterIdentity === 'latin_american_modern'
                        ? 'Latin American modern identity with contemporary styling and realistic urban context.'
                        : input.characterIdentity === 'mediterranean_modern'
                          ? 'Mediterranean modern identity with contemporary styling and realistic urban context.'
                          : input.characterIdentity === 'south_east_asian_modern'
                            ? 'South East Asian modern identity with contemporary styling and realistic urban context.'
                            : input.characterIdentity === 'central_asian_modern'
                              ? 'Central Asian modern identity with contemporary styling and realistic urban context.'
                              : input.characterIdentity === 'pacific_islander_modern'
                                ? 'Pacific Islander modern identity with contemporary styling and realistic urban context.'
                                : input.characterIdentity === 'mixed_heritage_modern'
                                  ? 'Mixed-heritage modern identity with contemporary styling and realistic urban context.'
                                  : 'Global modern look with contemporary styling and non-stereotyped representation.'

  return `A young ${gender} (${age}), ${style} style, ${pose} pose, ${expression} expression. ${identityDirective} Body proportions and facial features are realistic and anatomically plausible.`
}

function resolveTextOverlay(overlay?: TextOverlayConfig): string {
  if (!overlay) return ''
  const parts: string[] = []
  if (overlay.headline) parts.push(`Main text: "${overlay.headline}"`)
  if (overlay.subline) parts.push(`Secondary text: "${overlay.subline}"`)
  if (overlay.tagline) parts.push(`Tagline: "${overlay.tagline}"`)
  if (overlay.placement) parts.push(`Text placement: ${overlay.placement} of the image`)
  if (overlay.fontStyle) parts.push(`Font style: ${overlay.fontStyle}`)
  return parts.length > 0 ? `TEXT OVERLAY: ${parts.join('. ')}.` : ''
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getAdPreset(id: AdPresetId): AdPresetDisplay | undefined {
  const preset = SANITIZED_AD_PRESETS.find((p) => p.id === id)
  return preset ? withTaxonomy(preset) : undefined
}

export function getAdPresetList(): AdPresetDisplay[] {
  return SANITIZED_AD_PRESETS.map(withTaxonomy)
}

export function resolveStylePackForPreset(presetId: AdPresetId): StylePack {
  const override = PRESET_STYLE_PACK_OVERRIDES[presetId]
  if (override) return override

  const preset = SANITIZED_AD_PRESETS.find((p) => p.id === presetId)
  if (!preset) return 'high_street'

  if (preset.category === 'sports') return 'sports'
  if (preset.category === 'editorial' || preset.category === 'indian') return 'luxury'
  return 'high_street'
}

export function resolveTextSystemForPreset(presetId: AdPresetId): PresetTextSystem {
  const override = PRESET_TEXT_SYSTEM_OVERRIDES[presetId]
  if (override) return override

  const stylePack = resolveStylePackForPreset(presetId)
  if (stylePack === 'sports') return 'sports_brush'
  if (stylePack === 'luxury') return 'luxury_masthead'
  return 'highstreet_panel'
}

export function validateAdInput(
  input: AdGenerationInput
): { valid: boolean; error?: string } {
  if (!SANITIZED_AD_PRESETS.find((p) => p.id === input.preset)) {
    return { valid: false, error: 'Invalid preset selected' }
  }

  if (input.textOverlay?.headline) {
    const wordCount = input.textOverlay.headline.trim().split(/\s+/).length
    if (wordCount > 12) {
      return { valid: false, error: 'Headline cannot exceed 12 words' }
    }
  }

  if (!input.platforms || input.platforms.length === 0) {
    return { valid: false, error: 'At least one platform must be selected' }
  }

  const validCtas: CtaType[] = ['shop_now', 'learn_more', 'explore', 'buy_now']
  if (!validCtas.includes(input.ctaType)) {
    return { valid: false, error: 'Invalid CTA type' }
  }

  if (input.characterType === 'animal' && !input.animalType) {
    return { valid: false, error: 'Please select an animal type' }
  }

  return { valid: true }
}

// ═══════════════════════════════════════════════════════════════
// CTA, TONE, PLATFORM, CHARACTER DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════════

export const CTA_OPTIONS: { value: CtaType; label: string }[] = [
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'explore', label: 'Explore' },
  { value: 'buy_now', label: 'Buy Now' },
]

export const TONE_OPTIONS: { value: CaptionTone; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'premium', label: 'Premium' },
  { value: 'confident', label: 'Confident' },
]

export const PLATFORM_OPTIONS: {
  value: Platform
  label: string
  icon: string
}[] = [
    { value: 'instagram', label: 'Instagram', icon: 'Instagram' },
    { value: 'facebook', label: 'Facebook', icon: 'Facebook' },
    { value: 'google', label: 'Google Ads', icon: 'Globe' },
    { value: 'influencer', label: 'Influencer', icon: 'Users' },
  ]

export const CHARACTER_OPTIONS: {
  value: CharacterType
  label: string
  icon: string
}[] = [
    { value: 'human_female', label: 'Woman', icon: 'User' },
    { value: 'human_male', label: 'Man', icon: 'User' },
    { value: 'animal', label: 'Animal', icon: 'Cat' },
    { value: 'none', label: 'No Character', icon: 'Ban' },
  ]

export const ANIMAL_OPTIONS: string[] = [
  'Polar Bear',
  'Cat',
  'Dog',
  'Fox',
  'Owl',
  'Rabbit',
  'Raccoon',
  'Lion',
  'Tiger',
  'Monkey',
]

export const CHARACTER_STYLE_OPTIONS: string[] = [
  'Gen Z Casual',
  'High Fashion',
  'Athletic / Sporty',
  'Streetwear',
  'Elegant / Refined',
  'Bohemian',
  'Minimalist',
  'Bold / Statement',
]

export const CHARACTER_IDENTITY_OPTIONS: {
  value: CharacterIdentity
  label: string
  forCharacter?: Array<'human_female' | 'human_male'>
}[] = [
    { value: 'global_modern', label: 'Global Modern' },
    { value: 'indian_woman_modern', label: 'Indian Woman (South Delhi Modern)', forCharacter: ['human_female'] },
    { value: 'indian_man_modern', label: 'Indian Man (South Delhi Modern)', forCharacter: ['human_male'] },
    { value: 'south_asian_modern', label: 'South Asian Modern' },
    { value: 'south_east_asian_modern', label: 'South East Asian Modern' },
    { value: 'east_asian_modern', label: 'East Asian Modern' },
    { value: 'central_asian_modern', label: 'Central Asian Modern' },
    { value: 'middle_eastern_modern', label: 'Middle Eastern Modern' },
    { value: 'mediterranean_modern', label: 'Mediterranean Modern' },
    { value: 'african_modern', label: 'African Modern' },
    { value: 'latina_modern', label: 'Latina Modern', forCharacter: ['human_female'] },
    { value: 'latin_american_modern', label: 'Latin American Modern' },
    { value: 'north_american_modern', label: 'North American Modern' },
    { value: 'european_modern', label: 'European Modern' },
    { value: 'pacific_islander_modern', label: 'Pacific Islander Modern' },
    { value: 'mixed_heritage_modern', label: 'Mixed Heritage Modern' },
  ]

export const STYLE_PACK_OPTIONS: { value: StylePack; label: string }[] = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'high_street', label: 'High Street' },
  { value: 'sports', label: 'Sports' },
]

export const FONT_STYLE_OPTIONS: { value: FontStyle; label: string }[] = [
  { value: 'serif', label: 'Serif (Classic)' },
  { value: 'sans-serif', label: 'Sans-serif (Modern)' },
  { value: 'handwritten', label: 'Handwritten' },
  { value: 'bold-display', label: 'Bold Display' },
]

export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '1:1', label: '1:1 Square', icon: 'Square' },
  { value: '9:16', label: '9:16 Story', icon: 'Smartphone' },
  { value: '16:9', label: '16:9 Wide', icon: 'Monitor' },
  { value: '4:5', label: '4:5 Post', icon: 'Image' },
]

export const TEXT_PLACEMENT_OPTIONS: { value: TextPlacement; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
]

/** Camera angle options for pro ad composition (down, side, low, high, etc.) */
export const CAMERA_ANGLE_OPTIONS: { value: CameraAngle; label: string }[] = [
  { value: 'auto', label: 'Auto (best for style)' },
  { value: 'down', label: 'Down angle (looking down)' },
  { value: 'high', label: 'High angle' },
  { value: 'low', label: 'Low angle (hero / dramatic)' },
  { value: 'side', label: 'Side profile' },
  { value: 'three-quarter', label: 'Three-quarter' },
  { value: 'eye-level', label: 'Eye level' },
  { value: 'dutch', label: 'Dutch / tilted' },
]



