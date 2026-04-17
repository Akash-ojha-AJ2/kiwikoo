/**
 * Try-On Style Presets - PREMIUM CURATED EDITION
 * Photography-accurate presets with proper Kelvin temperatures, light direction, and iPhone characteristics
 * Focused on achievable photorealism with Higgsfield-level detail
 */

export interface TryOnPreset {
  id: string
  name: string
  description: string
  category: 'best' | 'indian' | 'travel' | 'lifestyle' | 'editorial' | 'street'
  positive: string[]
  negative: string[]
  deviation: number
  safe: true
  background?: string
  backgroundElements?: {
    people?: string
    objects?: string
    atmosphere?: string
  }
  lighting?: {
    type: string
    source: string
    direction: string
    quality: string
    colorTemp: string // Kelvin-accurate
  }
  camera_style?: {
    angle: string
    lens: string
    framing: string
    depthOfField?: string
  }
  pose?: {
    stance: string
    arms: string
    expression: string
    energy: 'relaxed' | 'confident' | 'dynamic' | 'casual' | 'elegant' | 'powerful'
    bodyAngle?: string
  }
}

export const tryOnPresets: TryOnPreset[] = [
  // ==========================================
  // BEST CATEGORY - Premium Curated Presets
  // ==========================================

  {
    id: 'candid_iphone_snapshot',
    name: 'Candid iPhone Snapshot',
    description: 'Higgsfield-style authentic iPhone photo with natural imperfections, texture fidelity, and strict identity preservation',
    category: 'best',
    positive: [
      'Authentic iPhone camera aesthetic with natural lens characteristics',
      'Visible skin texture, authentic pores, and fine hair strands',
      'Slightly imperfect framing (casual tilt, off-center)',
      'Natural grain and noise in shadows (no sterile CGI look)',
      'Soft natural daylight with realistic falloff',
      'Fabric weave and material texture clearly visible',
      'Genuine human presence, not a posed model',
      'Cooler shadows, warmer highlights (natural white balance)',
    ],
    negative: [
      'No beautification or skin smoothing',
      'No plastic/waxy skin texture',
      'No professional studio lighting',
      'No heavy bokeh blurring the background',
      'No perfect symmetry',
      'No stock photo aesthetic',
    ],
    deviation: 0.05, // Ultra-strict
    safe: true,
    background: 'Authentic real-world environment (street, park, or interior)',
    backgroundElements: {
      people: 'Background blur of distant life',
      objects: 'Everyday objects with natural wear and tear',
      atmosphere: 'Spontaneous, unposed, slice-of-life reality',
    },
    lighting: {
      type: 'Natural ambient daylight',
      source: 'Sun or window',
      direction: 'Soft directional',
      quality: 'Authentic/Raw',
      colorTemp: '5500K (Daylight)',
    },
    camera_style: {
      angle: 'Eye level (handheld)',
      lens: 'iPhone 26mm f/1.8',
      framing: 'Casual/Imperfect',
      depthOfField: 'Natural smartphone depth',
    },
    pose: {
      stance: 'Natural/Relaxed',
      arms: 'By sides or holding phone',
      expression: 'Natural/Neutral (matches input identity)',
      energy: 'relaxed',
      bodyAngle: 'Natural',
    },
  },

  {
    id: 'golden_hour_field',
    name: 'Golden Hour Field',
    description: 'Summer field at golden hour (2500-3000K) with genuine messy windblown hair and fabric translucency',
    category: 'best',
    positive: [
      'Golden hour backlight (2500-3000K) creating warm rim light around subject',
      'Hair genuinely windblown and tousled catching golden light',
      'Relaxed natural expression',
      'Fabric showing TRANSLUCENCY where sun shines through thin material',
      'Individual wheat/grass stalks visible with seeds catching light',
      'Cool blue sky (8000K+) contrasting with warm golden earth',
      'Natural skin shine from summer warmth, visible pores',
      'iPhone lens flare artifact where sun enters frame',
      'Dynamic capture with hair and fabric movement',
    ],
    negative: [
      'No perfectly styled hair - must be messy',
      'No static catalog pose',
      'No heavy bokeh hiding field texture',
      'No uniform warm orange grade throughout - sky stays cool blue',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Summer wheat or wildflower field at golden hour',
    backgroundElements: {
      people: 'Solo figure in open field',
      objects: 'Individual grass stalks, wildflowers, distant tree line silhouette, birds possible',
      atmosphere: 'Joyful freedom, genuine candid moment, warm light cool shadows',
    },
    lighting: {
      type: 'Golden hour backlight',
      source: 'Low sun at 15-30 degrees above horizon',
      direction: 'Strong backlight creating rim/halo effect',
      quality: 'Warm direct + cool fill from blue sky',
      colorTemp: '2500-3000K highlights, 6000K+ shadow fill from sky',
    },
    camera_style: {
      angle: 'Eye level or slightly low shooting up',
      lens: 'iPhone wide or portrait mode',
      framing: 'Spontaneous motion capture',
      depthOfField: 'Natural - field texture visible not heavily blurred',
    },
    pose: {
      stance: 'Standing with natural movement',
      arms: 'Relaxed',
      expression: 'Natural/Relaxed (matches input identity)',
      energy: 'dynamic',
      bodyAngle: 'Natural spontaneous angle',
    },
  },

  {
    id: 'misty_dawn_meadow',
    name: 'Misty Dawn Meadow',
    description: 'Contemplative figure in fog-filled meadow at dawn with visible breath, damp hair, and natural lens flare',
    category: 'best',
    positive: [
      'Thick atmospheric fog creating natural depth - NOT fake blur',
      'Dawn light (4000-5000K) seeping through mist as pale warm glow',
      'Breath visible in cold air adding authenticity',
      'Hair slightly damp clinging to neck from humidity',
      'Coat fibers showing texture catching moisture',
      'Individual grass tufts with dew droplets visible',
      'Bird silhouette in distant sky adding environmental life',
      'iPhone grain texture visible especially in shadowed areas',
      'Natural lens flare from veiled sun through mist',
      'Cool green-gray tones (5500-6500K) in shadows',
    ],
    negative: [
      'No artificial bokeh replacing natural fog atmosphere',
      'No uniform warm tone - keep cool morning palette',
      'No perfect dry hair styling',
      'No clear sunny weather - must be foggy',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Dew-laden meadow with thick morning fog over distant hills',
    backgroundElements: {
      people: 'Solitary contemplative figure',
      objects: 'Grass tufts with dew, distant trees fading into fog, fence posts barely visible, lone bird',
      atmosphere: 'Mistbound quiet solitude, natural atmospheric fog, cool damp morning',
    },
    lighting: {
      type: 'Diffused dawn through dense fog',
      source: 'Veiled sun behind thick mist layer',
      direction: 'Soft omnidirectional with slight warm glow from sun direction',
      quality: 'Extremely soft, fog acting as giant diffuser',
      colorTemp: '4000-5000K warm glow, 5500-6500K cool shadows',
    },
    camera_style: {
      angle: 'Slightly below eye level',
      lens: 'iPhone with visible grain in shadows',
      framing: 'Generous negative space filled with mist',
      depthOfField: 'Natural fog creating atmospheric depth',
    },
    pose: {
      stance: 'Standing motionless at meadow edge',
      arms: 'In coat pockets or at sides',
      expression: 'Contemplative, peaceful, absorbing silence',
      energy: 'relaxed',
      bodyAngle: 'Gazing slightly away from camera',
    },
  },

  {
    id: 'italian_alley_turn',
    name: 'Italian Alley Turn',
    description: 'Turning back with genuine smile in narrow Mediterranean alleyway (5000K open shade) with cobblestone and terracotta detail',
    category: 'best',
    positive: [
      'Narrow Italian alleyway with open shade providing soft even light (5000-5500K)',
      'Turning back mid-walk with warm genuine smile showing teeth',
      'Terracotta pots with lush flowering plants - individual leaves visible',
      'Weathered pastel walls showing authentic patina, cracks, water stains',
      'Each cobblestone individually textured with moss in gaps',
      'Linen or cotton fabric showing natural weave texture',
      'Cat-eye sunglasses or silk scarf as authentic accessory',
      'Composition slightly tilted capturing spontaneous travel moment',
      'Warm tones on sunlit stone (3500K) vs cool shade (6000K)',
    ],
    negative: [
      'No heavy bokeh hiding alley architectural details',
      'No uniform warm orange filter',
      'No static posed modeling shot',
      'No CGI-smooth walls or plants',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Narrow Italian alleyway with terracotta pots and pastel Mediterranean walls',
    backgroundElements: {
      people: 'Solo figure turning back toward camera',
      objects: 'Terracotta pots with geraniums, weathered wooden shutters, iron balconies, scattered flower petals',
      atmosphere: 'Romantic afternoon travel memory, charming Mediterranean warmth',
    },
    lighting: {
      type: 'Open shade with reflected warm light from sunlit walls',
      source: 'Sky above narrow alley + reflected sunlight from walls',
      direction: 'Soft directional from sky, warm bounce from sides',
      quality: 'Even on face, dramatic on textured walls',
      colorTemp: '5000-5500K shade, 3500K reflected warm from sunlit stone',
    },
    camera_style: {
      angle: 'Eye level with casual slight tilt',
      lens: 'iPhone in portrait orientation',
      framing: 'Candid mid-turn travel snapshot',
      depthOfField: 'Natural - alley details sharp enough to see texture',
    },
    pose: {
      stance: 'Turning back mid-walk',
      arms: 'Natural mid-motion',
      expression: 'Natural, authentic expression (matches input identity)',
      energy: 'dynamic',
      bodyAngle: 'Three-quarter turn looking back over shoulder',
    },
  },

  {
    id: 'urban_brick_candid',
    name: 'Urban Brick Candid',
    description: 'Spontaneous street capture turning corner of brick building with plant in sidewalk crack and individual brick textures',
    category: 'best',
    positive: [
      'Warm-toned brick building with individual brick texture visible',
      'Small green plant growing from crack in concrete sidewalk',
      'Soft overcast daylight (5500-6500K) creating even lighting',
      'Each brick showing unique weathering, mortar lines visible',
      'Fine hair strands loose and windblown framing face',
      'Natural skin texture with subtle imperfections',
      'Casual slightly tilted framing like candid street snap',
      'Textured concrete sidewalk with weathering patterns',
      'Cool shadows (7000K) in recessed areas',
    ],
    negative: [
      'No heavy bokeh hiding brick architectural detail',
      'No posed model awareness',
      'No uniform color grade',
      'No smooth CGI surfaces',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Urban brick building corner with textured sidewalk',
    backgroundElements: {
      people: 'Solo figure at street corner, distant blurred pedestrians possible',
      objects: 'Individual bricks with patina, sidewalk cracks with weeds, iron window bars, street signage',
      atmosphere: 'Minimalist urban street photography, authentic candid moment',
    },
    lighting: {
      type: 'Overcast diffused daylight (giant softbox effect)',
      source: 'Cloud-covered sky',
      direction: 'Even soft top lighting',
      quality: 'Gentle, revealing textures without harsh shadows',
      colorTemp: '5500-6500K neutral, slightly cool in shadows',
    },
    camera_style: {
      angle: 'Slightly tilted candid angle',
      lens: 'iPhone',
      framing: 'Spontaneous street photography',
      depthOfField: 'Moderate - brick details visible',
    },
    pose: {
      stance: 'Turning corner naturally',
      arms: 'Relaxed mid-motion',
      expression: 'Looking down or away naturally, not camera-aware',
      energy: 'casual',
      bodyAngle: 'Caught mid-turn',
    },
  },

  {
    id: 'window_light_portrait',
    name: 'Window Light Portrait',
    description: 'Soft directional window light (natural softbox) with visible dust motes, indoor plants, and natural shadows',
    category: 'best',
    positive: [
      'Large window acting as natural softbox (5000-6000K)',
      'Directional sidelight creating gentle shadows on face',
      'Visible dust motes floating in light beam',
      'Indoor plants with individual leaf detail near window',
      'Fabric showing natural drape and fold shadows',
      'Natural skin texture with pores, slight shine in highlights',
      'Weathered wooden window frame or vintage furniture visible',
      'Cool shadows (7000K) on far side of face',
      'Warm sunlight (4000K) where direct beam hits',
    ],
    negative: [
      'No heavy bokeh blurring room details',
      'No artificial studio lighting look',
      'No perfectly clean sterile environment',
      'No smooth poreless skin',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Indoor space near large window with natural light',
    backgroundElements: {
      people: 'Solo figure in natural window light',
      objects: 'Potted plants, vintage furniture, curtain texture, dust motes in light',
      atmosphere: 'Intimate indoor sanctuary, peaceful natural light moment',
    },
    lighting: {
      type: 'Single large window as softbox',
      source: 'Daylight through window',
      direction: 'Strong sidelight from window',
      quality: 'Soft but directional, creating gentle shadow gradients',
      colorTemp: '5000-6000K main, warmer if direct sun visible',
    },
    camera_style: {
      angle: 'Eye level or slightly above',
      lens: 'iPhone portrait',
      framing: 'Classic portrait with environmental context',
      depthOfField: 'Natural separation',
    },
    pose: {
      stance: 'Relaxed near window',
      arms: 'Natural resting position',
      expression: 'Serene, contemplative',
      energy: 'relaxed',
      bodyAngle: 'Angled toward window light',
    },
  },

  // ==========================================
  // INDIAN CATEGORY - Priority Presets
  // ==========================================

  {
    id: 'varanasi_ghat_sunrise',
    name: 'Varanasi Ghat Sunrise',
    description: 'Standing on ancient stone ghat steps at sunrise (3000K) with Ganges mist, temple spires, and centuries of wear visible',
    category: 'indian',
    positive: [
      'Ancient stone ghat steps showing centuries of wear from footsteps',
      'Early morning mist rising from Ganges creating soft atmospheric haze',
      'Sunrise light (3000K warm) breaking through pink-golden river mist',
      'Temple spires and old buildings visible through atmospheric perspective',
      'Visible moss, water stains, and weathering on stone steps',
      'Cool morning shadows (7000K) contrasting with warm sunlit areas',
      'Distant boats and pilgrims as atmospheric silhouettes',
      'Holding chai cup in hand for authentic detail',
      'Reflections shimmering on calm water surface',
    ],
    negative: [
      'No uniform warm orange grade - maintain cool shadow contrast',
      'No CGI mist or artificial atmosphere',
      'No perfectly clean new stone',
      'No heavy blur hiding ghat architecture',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Ancient Varanasi ghats at sunrise with river mist and temple spires',
    backgroundElements: {
      people: 'Solo figure on steps, distant pilgrims as silhouettes, sadhus possible',
      objects: 'Worn stone steps, moored boats, temple spires, hanging bells, flower offerings, chai cups',
      atmosphere: 'Sacred morning calm, spiritual India awakening, river mist',
    },
    lighting: {
      type: 'Sunrise through river mist',
      source: 'Low sun through atmospheric haze',
      direction: 'Backlit/sidelit with soft misty fill',
      quality: 'Ethereal soft glow through mist particles',
      colorTemp: '3000K golden-pink highlights, 7000K cool blue-gray shadows',
    },
    camera_style: {
      angle: 'Level or slightly below on steps',
      lens: 'iPhone wide',
      framing: 'Environmental portrait with river context',
      depthOfField: 'Atmospheric - architecture visible through mist',
    },
    pose: {
      stance: 'Standing or sitting on ghat steps',
      arms: 'Holding chai cup naturally',
      expression: 'Peaceful, contemplative morning mood',
      energy: 'relaxed',
      bodyAngle: 'Looking toward river or sunrise',
    },
  },

  {
    id: 'rajasthani_haveli_jali',
    name: 'Rajasthani Haveli Jali',
    description: 'Standing in ornate sandstone haveli courtyard with intricate jali screens creating geometric shadow patterns',
    category: 'indian',
    positive: [
      'Carved sandstone haveli courtyard with centuries of patina',
      'Intricate jali screens filtering sunlight into geometric shadow patterns',
      'Blue-painted accents on doors and windows (characteristic Rajasthani color)',
      'Worn marble or stone floor showing age and use patterns',
      'Weathered sandstone pillars with visible craftsmanship detail',
      'Traditional brass urli or potted tulsi plant in corner',
      'Morning light (4500K) through jali creating warm pattern, cool shadows',
      'Crumbling edges, lime wash texture, natural weathering visible',
    ],
    negative: [
      'No perfectly restored clean architecture',
      'No uniform warm tone - maintain shadow contrast',
      'No CGI architectural surfaces',
      'No artificial studio lighting',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Traditional Rajasthani haveli courtyard with carved jali screens',
    backgroundElements: {
      people: 'Solo figure in courtyard center or near pillar',
      objects: 'Carved jali screens, sandstone pillars, blue painted doors, brass vessels, potted plants',
      atmosphere: 'Historic grandeur fading gracefully, morning calm, heritage India',
    },
    lighting: {
      type: 'Sunlight filtered through carved jali screens',
      source: 'Morning sun through stone lattice work',
      direction: 'Creates geometric patterns on floor and walls',
      quality: 'Dappled with high contrast pattern',
      colorTemp: '4500K warm light patches, 6500K cool in deep shadows',
    },
    camera_style: {
      angle: 'Eye level showcasing architecture',
      lens: 'iPhone wide to capture courtyard',
      framing: 'Full body with architectural context',
      depthOfField: 'Deep - carved details visible throughout',
    },
    pose: {
      stance: 'Standing naturally in courtyard',
      arms: 'Relaxed or one hand touching pillar',
      expression: 'Peaceful, contemplative',
      energy: 'relaxed',
      bodyAngle: 'Three-quarter against architecture',
    },
  },

  {
    id: 'munnar_tea_garden',
    name: 'Munnar Tea Garden',
    description: 'Standing among rolling emerald tea plantation hills with misty valleys, tea pickers in distance, and cool highland light',
    category: 'indian',
    positive: [
      'Rolling emerald tea plantation hills with individual tea bushes visible',
      'Soft morning mist in valleys creating atmospheric depth between hills',
      'Tea workers in traditional dress visible as distant figures with baskets',
      'Individual tea leaves detailed on nearby bushes',
      'Red earth paths visible between tea rows',
      'Cool highland light (6000K) creating neutral color balance',
      'Eucalyptus or shade trees at field edges',
      'Blue-gray atmospheric perspective in distant hills',
    ],
    negative: [
      'No uniform green color grade - maintain natural variation',
      'No CGI landscape',
      'No artificial haze effect',
      'No heavy blur hiding tea leaf detail',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Rolling tea plantation hills of Kerala/Munnar with misty valleys',
    backgroundElements: {
      people: 'Solo figure among tea bushes, distant tea pickers',
      objects: 'Tea bushes with individual leaves, red earth paths, wicker baskets, shade trees',
      atmosphere: 'Highland freshness, morning mist between hills, peaceful plantation calm',
    },
    lighting: {
      type: 'Soft highland morning light through mist',
      source: 'Diffused sun through mountain atmosphere',
      direction: 'Soft overhead with atmospheric fill',
      quality: 'Gentle, even, revealing green textures',
      colorTemp: '6000K neutral/cool, warm only on skin',
    },
    camera_style: {
      angle: 'Eye level among tea bushes',
      lens: 'iPhone standard or wide',
      framing: 'Portrait with rolling hills visible behind',
      depthOfField: 'Moderate - atmospheric distant hills',
    },
    pose: {
      stance: 'Standing naturally among tea bushes',
      arms: 'Relaxed or touching tea leaves',
      expression: 'Peaceful, enjoying the morning scenery',
      energy: 'relaxed',
      bodyAngle: 'Natural pose among plantation',
    },
  },

  {
    id: 'jaisalmer_fort_rampart',
    name: 'Jaisalmer Fort Rampart',
    description: 'Standing on golden sandstone fort ramparts at golden hour with vast Thar desert vista and carved architectural detail',
    category: 'indian',
    positive: [
      'Weathered golden sandstone fort walls with carved Rajput architectural detail',
      'Late afternoon golden hour (2800K) warming sandstone to rich amber',
      'Vast Thar desert vista stretching to horizon with scattered acacia trees',
      'Traditional crenellations and carved brackets (jharokhas) framing view',
      'Dusty desert haze creating atmospheric depth in background',
      'Cool shadows (7000K) in carved insets contrasting with warm lit stone',
      'Worn flagstone floor showing centuries of foot traffic',
      'Distant village silhouettes or camel possible on horizon',
    ],
    negative: [
      'No uniform orange color grade - maintain cool shadow contrast',
      'No CGI architecture or landscape',
      'No modern elements visible',
      'No artificial staging',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Sandstone desert fort ramparts overlooking Thar desert',
    backgroundElements: {
      people: 'Solo figure on ramparts, distant figures possible',
      objects: 'Carved sandstone, desert vista, thorny acacia trees, carved jharokhas, distant dunes',
      atmosphere: 'Royal Rajasthan grandeur, desert vastness, golden hour magic',
    },
    lighting: {
      type: 'Late afternoon golden hour',
      source: 'Low sun warming sandstone facade',
      direction: 'Strong sidelight on architecture',
      quality: 'Warm on stone surfaces, soft haze in distance',
      colorTemp: '2800K amber on sunlit stone, 7000K cool in shadows',
    },
    camera_style: {
      angle: 'Eye level on ramparts',
      lens: 'iPhone wide for vista context',
      framing: 'Portrait with desert backdrop',
      depthOfField: 'Natural - distant landscape visible',
    },
    pose: {
      stance: 'Standing at rampart edge gazing at desert',
      arms: 'Resting on stone parapet or at sides',
      expression: 'Contemplating the vastness',
      energy: 'relaxed',
      bodyAngle: 'Profile or three-quarter against vista',
    },
  },

  {
    id: 'kerala_backwaters',
    name: 'Kerala Backwaters',
    description: 'On traditional houseboat with coconut palm-lined backwaters, golden evening light reflecting on calm water',
    category: 'indian',
    positive: [
      'Traditional Kerala houseboat (kettuvallam) with coir rope and wood texture',
      'Coconut palm trees lining the backwater canals',
      'Golden evening light (3500K) reflecting on calm glassy water',
      'Distant village houses with terracotta roofs visible on shore',
      'Chinese fishing nets silhouette in distance possible',
      'Real water texture with reflections, not mirror-smooth CGI',
      'Cool blue sky (7000K) reflected in water shadows',
      'Natural wood grain on boat surfaces',
    ],
    negative: [
      'No heavy blur hiding palm detail',
      'No uniform warm grade - water reflects cool sky',
      'No CGI water surface',
      'No artificial staging',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Kerala backwaters with houseboat and palm-lined canals',
    backgroundElements: {
      people: 'Solo figure on houseboat deck',
      objects: 'Houseboat texture, coconut palms, distant fishing nets, village houses',
      atmosphere: 'Serene backwater evening, gentle ripples on water, tropical calm',
    },
    lighting: {
      type: 'Golden evening light with water reflections',
      source: 'Low sun through palm trees',
      direction: 'Sidelight with water reflection fill',
      quality: 'Warm main light, cool reflected fill from sky',
      colorTemp: '3500K golden sun, 7000K sky reflection in water',
    },
    camera_style: {
      angle: 'Eye level from boat deck',
      lens: 'iPhone wide',
      framing: 'Environmental with backwater context',
      depthOfField: 'Natural atmospheric',
    },
    pose: {
      stance: 'Relaxed on houseboat deck',
      arms: 'Resting on rail or at sides',
      expression: 'Peaceful, enjoying the scenery',
      energy: 'relaxed',
      bodyAngle: 'Looking toward water or sunset',
    },
  },

  // ==========================================
  // TRAVEL CATEGORY
  // ==========================================

  {
    id: 'tropical_retreat_path',
    name: 'Tropical Retreat Path',
    description: 'Walking barefoot on weathered wooden platform through tropical palm canopy with dappled filtered light',
    category: 'travel',
    positive: [
      'Walking barefoot on weathered wooden platform with visible grain and weathering',
      'Dense tropical palm fronds creating natural canopy overhead',
      'Warm dappled light (4000K) filtering through layered palm leaves',
      'Cool shadows (6500K) contrasting with bright light patches',
      'Ferns and tropical plants with individual leaf textures',
      'Wooden deck planks showing natural wear and slight warping',
      'Humid atmosphere visible as slight haze',
      'Traveling yoga mat or beach bag as authentic prop possible',
      'Framed from behind capturing natural walking movement',
    ],
    negative: [
      'No posed awareness of camera from behind',
      'No uniform warm tone',
      'No CGI foliage',
      'No perfect lighting',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Tropical retreat wooden walkway surrounded by palm canopy',
    backgroundElements: {
      people: 'Solo figure walking away from camera',
      objects: 'Weathered wooden deck, palm fronds, ferns, hanging vines, retreat signage',
      atmosphere: 'Retreat serenity, tropical humidity, dappled filtered light',
    },
    lighting: {
      type: 'Warm sunlight filtered through tropical canopy',
      source: 'Overhead sun through dense palm leaves',
      direction: 'Dappled from above creating irregular shadow patterns',
      quality: 'Soft filtered with occasional bright spots breaking through',
      colorTemp: '4000K warm in light patches, 6500K cool in shade',
    },
    camera_style: {
      angle: 'Behind subject slightly low',
      lens: 'iPhone wide',
      framing: 'Full body from behind with canopy visible',
      depthOfField: 'Natural with soft distant bokeh',
    },
    pose: {
      stance: 'Walking naturally barefoot mid-stride',
      arms: 'One arm holding mat/bag, other relaxed',
      expression: 'Not visible - back to camera',
      energy: 'relaxed',
      bodyAngle: 'Walking away from camera',
    },
  },

  {
    id: 'beach_sunset_silhouette',
    name: 'Beach Sunset Silhouette',
    description: 'Standing barefoot in gentle surf at sunset with warm rim light, cool cyan water shadows, and fabric catching ocean breeze',
    category: 'travel',
    positive: [
      'Standing barefoot in gentle surf with water around ankles',
      'Warm sunset (2500K) painting sky in orange-pink gradient',
      'Cool cyan shadows (8000K+) in water and wave shadows',
      'Fabric catching ocean breeze showing natural movement',
      'Hair damp and lightly rippling in wind',
      'iPhone flash fill slightly visible on skin',
      'Curling waves with foam texture visible',
      'Purple sky gradient overhead above warm horizon',
      'Natural water droplets on feet and ankles',
    ],
    negative: [
      'No uniform warm grade - maintain cool water shadows',
      'No CGI water texture',
      'No perfect posed symmetry',
      'No artificial lighting look',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Beach at sunset with glowing sky gradient and ocean waves',
    backgroundElements: {
      people: 'Solo figure in gentle surf',
      objects: 'Curling waves with foam, wet sand with footprints, horizon line',
      atmosphere: 'Dreamy beach snapshot, ocean breeze, golden hour magic',
    },
    lighting: {
      type: 'Sunset backlight with flash fill',
      source: 'Low sun at horizon plus subtle iPhone flash',
      direction: 'Strong backlight creating rim glow',
      quality: 'Dramatic sky gradient with soft fill on subject',
      colorTemp: '2500K warm horizon, 8000K+ cyan water shadows, purple overhead sky',
    },
    camera_style: {
      angle: 'Eye level from beach',
      lens: 'iPhone portrait or wide',
      framing: 'Full body with expansive sky',
      depthOfField: 'Natural with soft horizon',
    },
    pose: {
      stance: 'Standing in surf looking over shoulder',
      arms: 'Natural at sides',
      expression: 'Serene, quiet poise',
      energy: 'elegant',
      bodyAngle: 'Three-quarter turn looking back at camera',
    },
  },

  {
    id: 'alpine_meadow_twirl',
    name: 'Alpine Meadow Twirl',
    description: 'Mid-twirl in wildflower meadow with snow-capped peaks, vintage film grain, and motion blur in flowing dress',
    category: 'travel',
    positive: [
      'Twirling genuinely across wildflower meadow - motion blur in dress',
      'Snow-capped mountain peaks majestically behind',
      'Bursts of yellow and purple wildflowers visible around feet',
      'Cool mountain blues (7000K) in peaks contrasting with warm meadow (5000K)',
      'Hair caught mid-motion in alpine breeze',
      'Subtle vintage film grain for nostalgic feel',
      'Cerulean sky with natural fluffy clouds',
      'Individual flower petals and grass blades tactile',
      'Movement blur showing genuine twirl not static pose',
    ],
    negative: [
      'No static catalog pose - must show motion',
      'No heavy digital processing',
      'No uniform warm color grade',
      'No CGI mountains',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Alpine wildflower meadow with snow-capped peaks',
    backgroundElements: {
      people: 'Solo figure mid-twirl in meadow',
      objects: 'Yellow and purple wildflowers, alpine grass, distant snow peaks, fluffy clouds',
      atmosphere: 'Timeless joyful freedom, spirited liberation, vintage warmth',
    },
    lighting: {
      type: 'Bright alpine sunlight',
      source: 'High mountain sun',
      direction: 'Clear overhead creating crisp shadows',
      quality: 'Shimmering clarity with subtle grain',
      colorTemp: '5000K on meadow, 7000K cool on distant mountains',
    },
    camera_style: {
      angle: 'Sweeping medium shot',
      lens: 'Wide angle for landscape context',
      framing: 'Subject with vast nature',
      depthOfField: 'Deep - mountains visible',
    },
    pose: {
      stance: 'Mid-twirl in meadow',
      arms: 'Extended in natural spin',
      expression: 'Joyful liberation',
      energy: 'dynamic',
      bodyAngle: 'Spinning with dress motion blur',
    },
  },

  // ==========================================
  // LIFESTYLE CATEGORY
  // ==========================================

  {
    id: 'indoor_mirror_candid',
    name: 'Indoor Mirror Candid',
    description: 'Sitting on floor before slightly dirty mirror in dimly lit bedroom with unmade bed and muted cool-toned shadows',
    category: 'lifestyle',
    positive: [
      'Sitting on floor before slightly dirty bedroom mirror with smudges',
      'Dimly lit room (3000-4000K lamp) with unmade bed visible behind',
      'Muted ambient light with cool lavender-gray shadows (7000K)',
      'Scattered personal items and casual bedroom disarray',
      'Gazing into phone with relaxed authentic expression',
      'Visible fabric grain of casual clothing',
      'Scuffs on shoes, worn socks texture visible',
      'Off-center framing with slight tilt - candid not posed',
      'Muted saturation characteristic of 2010s aesthetic',
    ],
    negative: [
      'No uniform warm tone - must be cool-muted',
      'No heavy bokeh hiding room details',
      'No perfect clean room',
      'No artificial studio lighting',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Dimly lit bedroom with slightly dirty mirror and casual disarray',
    backgroundElements: {
      people: 'Solo figure sitting on floor',
      objects: 'Dirty mirror, unmade bed, scattered clothes, personal items, worn carpet',
      atmosphere: 'Intimate teenage/young adult bedroom, nostalgic casual moment',
    },
    lighting: {
      type: 'Muted ambient indoor light',
      source: 'Dim overhead or lamp',
      direction: 'Soft diffused from above',
      quality: 'Low contrast, soft, intimate',
      colorTemp: '3000-4000K warm lamp, 7000K cool shadows',
    },
    camera_style: {
      angle: 'Floor level informal',
      lens: 'iPhone front camera style',
      framing: 'Off-center with slight tilt',
      depthOfField: 'Natural - room details visible',
    },
    pose: {
      stance: 'Sitting casually on floor',
      arms: 'Holding phone',
      expression: 'Relaxed, authentic, lips slightly parted',
      energy: 'relaxed',
      bodyAngle: 'Facing mirror',
    },
  },

  {
    id: 'street_food_moment',
    name: 'Street Food Moment',
    description: 'At outdoor food stall with taco/food in hand, golden hour through trees, genuine eating moment with slight food mess',
    category: 'lifestyle',
    positive: [
      'Sitting at outdoor street food stall in golden hour (3000K)',
      'Dappled warm light filtering through nearby tree leaves',
      'Generously filled food lifted toward parted lips - about to bite',
      'Tiny food drip at corner of mouth - authentic eating moment',
      'Visible food textures: charred edges, fresh vegetables, glistening sauce',
      'Serene half-lidded expression with calm poise',
      'Urban background softly visible with other patrons',
      'Near knee-level angle like arm-length iPhone snap',
      'Cool shadows (7000K) where tree shade falls',
    ],
    negative: [
      'No heavy bokeh hiding street background detail',
      'No uniform warm grade',
      'No artificial food styling',
      'No perfect posed model shot',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Outdoor street food stall with urban environment',
    backgroundElements: {
      people: 'Fellow patrons at nearby tables, vendor working',
      objects: 'Food stand, condiment bottles, paper plates, plastic chairs, urban elements',
      atmosphere: 'Lively street food energy, warm afternoon, authentic dining',
    },
    lighting: {
      type: 'Golden hour through tree leaves',
      source: 'Setting sun filtered through foliage',
      direction: 'Dappled sidelight',
      quality: 'Warm glow with visible shadow patterns',
      colorTemp: '3000K warm highlights, 7000K cool tree shadows',
    },
    camera_style: {
      angle: 'Near knee level casual',
      lens: 'iPhone from arm length',
      framing: 'Casual dining portrait',
      depthOfField: 'Soft background with visible street details',
    },
    pose: {
      stance: 'Sitting at food stand',
      arms: 'Holding food toward mouth',
      expression: 'Relaxed eating moment, half-lidded calm',
      energy: 'casual',
      bodyAngle: 'Facing camera with food',
    },
  },

  {
    id: 'sunroom_afternoon',
    name: 'Sunroom Afternoon',
    description: 'Reclining on velvet furniture in plant-filled sunroom with golden afternoon shafts and visible dust motes',
    category: 'lifestyle',
    positive: [
      'Reclining on deep velvet furniture with visible fabric texture',
      'Lush overgrown indoor plants surrounding the space',
      'Golden afternoon light shafts (4000K) streaming through windows',
      'Visible dust motes floating in light beams',
      'Hair cascading loosely around shoulders',
      'Serene introspective expression with natural makeup',
      'Rich velvet texture visible on furniture',
      'Weathered window frames add vintage charm',
      'Cool shadows (6500K) in areas away from direct light',
    ],
    negative: [
      'No heavy bokeh hiding plant details',
      'No uniform warm grade',
      'No artificial studio styling',
      'No perfectly clean environment',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Lush sunroom with overgrown plants and velvet furniture',
    backgroundElements: {
      people: 'Solo figure reclining',
      objects: 'Velvet furniture, potted plants with individual leaves, vintage decor, dust motes',
      atmosphere: 'Intimate greenhouse charm, golden afternoon sanctuary',
    },
    lighting: {
      type: 'Golden afternoon through windows',
      source: 'Sun through sunroom glass',
      direction: 'Directional shafts of warm light',
      quality: 'Defined rays with visible dust particles',
      colorTemp: '4000K warm shafts, 6500K cool shadows',
    },
    camera_style: {
      angle: 'Subtle elevated angle',
      lens: 'iPhone portrait',
      framing: 'Balanced subject with environment',
      depthOfField: 'Natural - plant details visible',
    },
    pose: {
      stance: 'Reclining gracefully',
      arms: 'Relaxed natural position',
      expression: 'Serene, contemplative',
      energy: 'relaxed',
      bodyAngle: 'Face angled toward light',
    },
  },

  // ==========================================
  // EDITORIAL CATEGORY
  // ==========================================

  {
    id: 'foggy_cottage_path',
    name: 'Foggy Cottage Path',
    description: 'Standing on rain-slick path beside rustic cottage in thick dawn fog with visible breath and natural lens flare',
    category: 'editorial',
    positive: [
      'Rain-dark slick asphalt path beside rustic cottage',
      'Thick natural fog blurring cottage into atmospheric outlines - NOT fake bokeh',
      'Breath visible as vapor in cold morning air',
      'Hair damp and clinging to neck from humidity',
      'Coat fibers showing texture, slightly damp',
      'Moss visible on gateposts despite fog',
      'Faint natural lens flare from veiled sun through mist',
      'iPhone grain in shadowed corners',
      'Water droplets beading on nearby leaves',
      'Pale gray-green color palette (6000K)',
    ],
    negative: [
      'No artificial bokeh replacing natural fog',
      'No uniform warm tone',
      'No perfect dry hair',
      'No clear sunny weather',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Rustic cottage beside rain-slick path in thick morning fog',
    backgroundElements: {
      people: 'Solitary figure on path',
      objects: 'Cottage outlines in fog, mossy gateposts, wet leaves with droplets, path surface',
      atmosphere: 'Mistbound reverie, damp cold morning, quiet solitude',
    },
    lighting: {
      type: 'Diffused dawn through thick fog',
      source: 'Veiled sun barely visible through mist',
      direction: 'Soft omnidirectional fog-diffused',
      quality: 'Extremely soft with subtle flare',
      colorTemp: '6000K pale gray-green overall',
    },
    camera_style: {
      angle: 'Chest height slight tilt',
      lens: 'iPhone with visible grain',
      framing: 'Generous negative space around subject',
      depthOfField: 'Natural fog creates atmosphere',
    },
    pose: {
      stance: 'Standing still on path',
      arms: 'One in pocket, one at side',
      expression: 'Contemplative, breath visible',
      energy: 'relaxed',
      bodyAngle: 'Facing camera',
    },
  },

  {
    id: 'townhouse_autumn',
    name: 'Townhouse Autumn',
    description: 'Leaning against ornate iron fence before historic townhouse with visible rust patina and fallen autumn leaves',
    category: 'editorial',
    positive: [
      'Ornate iron fence with visible rust and patina texture',
      'Historic townhouse facade with weathered brickwork visible',
      'Soft autumnal daylight (5500K) with warm undertones',
      'Scattered fallen leaves with visible veins and color variation',
      'Hair in loose natural waves',
      'Calm introspective expression',
      'Mellow glow on fabric showing texture',
      'Vintage lampposts or architectural details in background',
      'Cool shadows (6500K) in recessed areas',
    ],
    negative: [
      'No heavy bokeh hiding architectural details',
      'No uniform warm grade',
      'No modern elements visible',
      'No artificial perfection',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Historic townhouse with iron fence and autumn leaves',
    backgroundElements: {
      people: 'Solo figure at fence',
      objects: 'Iron fence with rust, townhouse facade, fallen leaves, vintage details',
      atmosphere: 'Autumn elegance, gentle European melancholy, vintage charm',
    },
    lighting: {
      type: 'Soft autumn afternoon',
      source: 'Sun through autumn haze',
      direction: 'Warm diffused frontal',
      quality: 'Mellow, flattering but natural',
      colorTemp: '5500K overall, cool in shadows',
    },
    camera_style: {
      angle: 'Softly tilted elevated',
      lens: 'iPhone',
      framing: 'Generous vintage-feel space',
      depthOfField: 'Natural - facade visible',
    },
    pose: {
      stance: 'Leaning against fence',
      arms: 'One on fence rail',
      expression: 'Calm, contemplative',
      energy: 'relaxed',
      bodyAngle: 'Natural lean',
    },
  },

  {
    id: 'heritage_terrace_seaside',
    name: 'Heritage Terrace Seaside',
    description: 'Leaning on weathered marble balustrade overlooking calm sea with soft 35mm film grain aesthetic',
    category: 'editorial',
    positive: [
      'Weathered marble balustrade with visible age patina and veining',
      'Calm Mediterranean sea in background',
      'Soft diffused early afternoon light (5500K)',
      'Subtle 35mm film grain texture throughout',
      'Polished marble floor showing wear patterns',
      'Faded wicker furniture visible in periphery',
      'Contemplative gaze toward sea horizon',
      'Muted vintage color palette - NOT saturated',
      'Classic balanced composition reminiscent of Slim Aarons',
    ],
    negative: [
      'No modern digital sharpness - must have film grain',
      'No uniform warm grade',
      'No artificial perfection',
      'No CGI surfaces',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Heritage estate terrace overlooking Mediterranean sea',
    backgroundElements: {
      people: 'Solo figure at balustrade',
      objects: 'Marble balustrade, stone floor, wicker furniture, decorative urns, sea view',
      atmosphere: 'Old-money elegance, timeless Mediterranean afternoon',
    },
    lighting: {
      type: 'Soft diffused afternoon',
      source: 'Hazy sun through maritime atmosphere',
      direction: 'Soft frontal with natural fill',
      quality: 'Flattering, film-like quality',
      colorTemp: '5500K neutral with slight warmth',
    },
    camera_style: {
      angle: 'Eye level balanced',
      lens: '50mm equivalent classic',
      framing: 'Elegant with environment',
      depthOfField: 'Moderate - soft sea background',
    },
    pose: {
      stance: 'Leaning against balustrade',
      arms: 'One on railing elegantly',
      expression: 'Contemplating horizon',
      energy: 'elegant',
      bodyAngle: 'Three-quarter elegant lean',
    },
  },

  // ==========================================
  // STREET CATEGORY
  // ==========================================

  {
    id: 'post_rain_street',
    name: 'Post Rain Street',
    description: 'Standing on wet urban street after rain with puddle reflections, neon signs reflected, and visible water droplets',
    category: 'street',
    positive: [
      'Wet urban street surface with visible puddle reflections',
      'Post-rain atmosphere with damp surfaces catching light',
      'Neon signs or city lights reflecting in wet pavement',
      'Cool evening light mixed with warm artificial sources',
      'Visible water droplets on nearby surfaces',
      'Urban architecture with weathered textures',
      'Steam or mist rising from warm surfaces possible',
      'Cool blue hour sky (8000K) with warm street lights (3000K)',
      'iPhone grain visible in shadow areas',
    ],
    negative: [
      'No heavy bokeh hiding street details',
      'No uniform color grade',
      'No dry perfectly clean street',
      'No artificial staging',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Wet urban street after rain with reflections',
    backgroundElements: {
      people: 'Solo figure, distant pedestrians with umbrellas possible',
      objects: 'Wet pavement, puddle reflections, neon signs, urban fixtures',
      atmosphere: 'Moody post-rain urban evening, mixed artificial and natural light',
    },
    lighting: {
      type: 'Mixed blue hour and artificial',
      source: 'Sky glow plus neon/street lights',
      direction: 'Multiple colored sources',
      quality: 'Dramatic reflections on wet surfaces',
      colorTemp: '8000K cool sky, 3000K warm neon/lights',
    },
    camera_style: {
      angle: 'Low angle emphasizing reflections',
      lens: 'iPhone',
      framing: 'Street scene with reflections',
      depthOfField: 'Natural urban depth',
    },
    pose: {
      stance: 'Standing on wet street',
      arms: 'Natural',
      expression: 'Urban cool attitude',
      energy: 'confident',
      bodyAngle: 'Facing camera or three-quarter',
    },
  },

  {
    id: 'cafe_window_seat',
    name: 'Cafe Window Seat',
    description: 'Sitting at cafe window with coffee, soft daylight from window, and busy street visible through glass',
    category: 'street',
    positive: [
      'Sitting at cafe window seat with coffee cup in hand',
      'Large window providing soft directional daylight (5500K)',
      'Busy street activity visible but soft through window glass',
      'Steam rising from coffee cup catching light',
      'Natural skin texture with window light shadows',
      'Cafe interior details: wooden table, menu, pastry possible',
      'Reflections in window glass layering interior and exterior',
      'Warm interior (3500K) contrasting with cool street light (6000K)',
    ],
    negative: [
      'No heavy blur hiding interior or street details',
      'No posed catalog look',
      'No artificial lighting',
      'No perfectly clean environment',
    ],
    deviation: 0.15,
    safe: true,
    background: 'Cafe interior at window seat with street view',
    backgroundElements: {
      people: 'Solo figure, street pedestrians through window',
      objects: 'Coffee cup, cafe table, pastry, window frame, street activity',
      atmosphere: 'Cozy cafe moment, watching the world, peaceful urban pause',
    },
    lighting: {
      type: 'Mix of window daylight and interior warmth',
      source: 'Window plus interior ambient',
      direction: 'Sidelight from window',
      quality: 'Soft directional with warm fill',
      colorTemp: '5500K window light, 3500K warm interior',
    },
    camera_style: {
      angle: 'Level across table',
      lens: 'iPhone',
      framing: 'Intimate cafe portrait',
      depthOfField: 'Natural with soft street through window',
    },
    pose: {
      stance: 'Sitting at window',
      arms: 'Holding coffee cup',
      expression: 'Relaxed, contemplative',
      energy: 'relaxed',
      bodyAngle: 'Facing window or camera',
    },
  },
]

// ==========================================
// INDIAN STYLE PRESETS - Added for Indian market
// All use deep depth of field for sharp backgrounds
// ==========================================

const indianPresets: TryOnPreset[] = [
  {
    id: 'mumbai_street_candid',
    name: 'Mumbai Street Candid',
    description: 'Authentic Mumbai street scene with deep focus, colorful buildings, and natural daylight',
    category: 'indian',
    positive: [
      'Authentic Mumbai street aesthetic with colorful painted buildings',
      'Deep depth of field - f/8 aperture - background in SHARP FOCUS',
      'Natural diffused daylight (5500-6000K) - neutral, not warm',
      'Visible architectural details in background - no blur',
      'Real skin texture with natural shine from humidity',
      'Authentic street life elements in background',
      'iPhone-style candid capture, slightly imperfect framing',
    ],
    negative: [
      'No bokeh blur - background must be sharp',
      'No orange/warm color grading',
      'No beautification or skin smoothing',
      'No shallow depth of field',
    ],
    deviation: 0.05,
    safe: true,
    background: 'Mumbai street with colorful buildings, all details sharp and visible',
    lighting: {
      type: 'Natural diffused daylight',
      source: 'Overcast sky or building shade',
      direction: 'Soft even lighting',
      quality: 'Authentic street photography',
      colorTemp: '5500-6000K (Neutral)',
    },
    camera_style: {
      angle: 'Eye level candid',
      lens: '35mm equivalent at f/8 for deep focus',
      framing: 'Candid street photography',
      depthOfField: 'DEEP - everything in focus',
    },
    pose: {
      stance: 'Natural walking or standing',
      arms: 'Natural relaxed',
      expression: 'Natural/Neutral (matches input identity)',
      energy: 'casual',
      bodyAngle: 'Natural',
    },
  },
  {
    id: 'jaipur_palace_courtyard',
    name: 'Jaipur Palace Courtyard',
    description: 'Elegant Jaipur-style palace courtyard with intricate architecture in sharp focus',
    category: 'indian',
    positive: [
      'Rajasthani palace architecture with carved stone details',
      'Deep depth of field - f/11 aperture - ALL architecture details visible',
      'Neutral daylight (5500K) - not warm golden',
      'Intricate carved pillars and jali screens in sharp focus',
      'Traditional sandstone/marble flooring visible',
      'Real skin texture, natural appearance',
      'Elegant but candid pose',
    ],
    negative: [
      'No bokeh blur - architecture MUST be sharp',
      'No warm orange grading - keep neutral',
      'No beautification',
      'No soft focus or dreamy effects',
    ],
    deviation: 0.05,
    safe: true,
    background: 'Rajasthani palace courtyard with carved stone pillars and arches, all in sharp focus',
    lighting: {
      type: 'Natural courtyard light',
      source: 'Open sky filtered through arches',
      direction: 'Soft directional from courtyard opening',
      quality: 'Even, revealing architectural detail',
      colorTemp: '5500K (Neutral daylight)',
    },
    camera_style: {
      angle: 'Eye level or slightly low',
      lens: '35mm at f/11 for maximum sharpness',
      framing: 'Person with architectural context',
      depthOfField: 'MAXIMUM DEPTH - everything sharp',
    },
    pose: {
      stance: 'Standing elegantly',
      arms: 'Natural or touching architecture',
      expression: 'Natural/Neutral (matches input identity)',
      energy: 'elegant',
      bodyAngle: 'Three-quarter or facing camera',
    },
  },
  {
    id: 'south_indian_temple',
    name: 'South Indian Temple',
    description: 'Traditional South Indian temple backdrop with ornate gopuram carvings in focus',
    category: 'indian',
    positive: [
      'Ornate South Indian temple architecture (gopuram style)',
      'Deep depth of field - f/8 - all carvings visible and sharp',
      'Neutral daylight (5500-6500K) - NOT warm',
      'Detailed stone sculptures and temple carvings in background',
      'Traditional temple courtyard or entrance',
      'Natural skin texture, authentic appearance',
    ],
    negative: [
      'No bokeh blur - temple details must be visible',
      'No warm color grading',
      'No beautification effects',
      'No soft dreamy focus',
    ],
    deviation: 0.05,
    safe: true,
    background: 'South Indian temple with carved gopuram and stone sculptures, all details sharp',
    lighting: {
      type: 'Natural outdoor daylight',
      source: 'Sun (diffused or shade)',
      direction: 'Even lighting for detail visibility',
      quality: 'Clear and detailed',
      colorTemp: '5500-6500K (Neutral)',
    },
    camera_style: {
      angle: 'Eye level',
      lens: '35mm at f/8',
      framing: 'Person with temple background',
      depthOfField: 'DEEP - temple details visible',
    },
    pose: {
      stance: 'Standing naturally',
      arms: 'Natural or traditional gesture',
      expression: 'Natural/Neutral (matches input identity)',
      energy: 'relaxed',
      bodyAngle: 'Natural',
    },
  },
]

// Add Indian presets to main array
tryOnPresets.push(...indianPresets)

/**
 * RELIABLE PRESET IDs - Only presets that preserve face consistency
 * REMOVED: misty_dawn_meadow (loses face in fog)
 * ADDED: Indian presets with deep DoF
 */
const REALISTIC_PRESET_IDS = [
  'candid_iphone_snapshot',      // ✅ Best - works reliably
  'mumbai_street_candid',        // ✅ NEW - Indian street
  'jaipur_palace_courtyard',     // ✅ NEW - Indian palace
  'south_indian_temple',         // ✅ NEW - Temple backdrop
  'urban_brick_candid',          // ✅ Overcast, neutral
]

/**
 * Get all presets - FILTERED to realistic only (no warm/dramatic)
 */
export function getAllPresets(): TryOnPreset[] {
  // Filter to only realistic presets
  return tryOnPresets.filter(p => REALISTIC_PRESET_IDS.includes(p.id))
}

/**
 * Get preset by ID (still allows access to all presets by ID)
 */
export function getPresetById(id: string): TryOnPreset | undefined {
  return tryOnPresets.find((p) => p.id === id)
}

/**
 * Get presets by category (filtered to realistic)
 */
export function getPresetsByCategory(category: TryOnPreset['category']): TryOnPreset[] {
  return tryOnPresets.filter((p) => p.category === category && REALISTIC_PRESET_IDS.includes(p.id))
}
