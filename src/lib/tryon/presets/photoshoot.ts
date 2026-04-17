/**
 * CURATED SCENE PRESETS - INSTAGRAM-READY (MULTI-VARIANT)
 *
 * Each preset has:
 * - Multiple scene variants (AI picks based on person's photo)
 * - Multiple camera angles (AI picks based on original framing)
 * - Color grading options (AI picks based on skin tone + lighting)
 * - Rich lighting blueprint (shared across variants)
 * - Negative bias constraints
 */

import type { ScenePreset } from './india'

// ═══════════════════════════════════════════════════════════════
// STUDIO PRESETS
// ═══════════════════════════════════════════════════════════════

const STUDIO_PRESETS: ScenePreset[] = [
  {
    id: 'studio_white',
    label: 'Seamless White Studio',
    category: 'lifestyle',
    region: 'global',
    scene: 'Professional photo studio with seamless white cyclorama, curved infinity wall, polished white epoxy floor with subtle reflections.',
    lighting: 'Large softbox front-left at 45°, matched fill front-right 1-stop lower, overhead silk diffusion for edge separation. 5500K neutral daylight balanced.',
    camera: '85mm f/1.8, chest-up to full-body framing, tack-sharp on eyes.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No colored gels, no harsh shadows, no visible stands, no oversaturation, no plastic skin, no beauty filter.',
    scenes: [
      { id: 'infinity_wall', scene: 'Seamless white cyclorama with curved infinity wall meeting polished white epoxy floor, smooth tonal gradient from pure white center to light grey edges, shadowless horizon line.', bestFor: 'clean product shots, formal attire, professional headshots' },
      { id: 'textured_white', scene: 'White studio with hand-troweled plaster wall showing subtle texture and natural imperfections, matte white concrete floor with visible aggregate pattern.', bestFor: 'casual wear, lifestyle brand shots, textured garments' },
      { id: 'high_key', scene: 'Bright high-key white studio with luminous wrap-around light from floor-to-ceiling diffusion panels, ethereal glow with minimal shadow definition.', bestFor: 'light skin tones, delicate fabrics, feminine styling' },
    ],
    cameras: [
      { id: 'portrait_tight', camera: '85mm f/1.8, chest-up tight portrait, ISO 100, 1/200s, tack-sharp on both eyes with clean backdrop falloff.', bestFor: 'headshot or close-up original photos' },
      { id: 'three_quarter', camera: '50mm f/2.8, three-quarter body from knees up, full garment visibility, medium depth of field.', bestFor: 'half-body original photos showing torso' },
      { id: 'full_body', camera: '35mm f/4.0, full body head-to-toe, complete outfit visibility with studio context and floor texture.', bestFor: 'full body original photos, outfit-focused content' },
    ],
    colorGrades: [
      { id: 'neutral_clean', grade: 'Neutral 5500K, no color cast, true whites, accurate skin reproduction, crisp clean professional finish.', bestFor: 'all skin tones, product-accurate color representation' },
      { id: 'warm_cream', grade: 'Warm 5000K with cream undertones, soft highlight roll-off, flattering skin warmth, subtle filmic texture.', bestFor: 'warm skin tones, golden undertones, earth-tone garments' },
      { id: 'cool_editorial', grade: 'Cool 6000K with crisp blue-white tones, high micro-contrast, fashion editorial punch, clean modern grading.', bestFor: 'cool skin tones, bold colors, editorial styling' },
    ],
  },
  {
    id: 'studio_cream',
    label: 'Warm Cream Backdrop',
    category: 'lifestyle',
    region: 'global',
    scene: 'Warm cream seamless paper backdrop with visible paper grain and fiber texture, matte concrete floor with natural scuff variation.',
    lighting: 'Broad diffused source from camera-left for gentle modeling, cream wall bounce camera-right for shadow detail, overhead spill for shoulder separation. 4800-5100K warm-neutral.',
    camera: '85mm f/2.0, three-quarter framing, natural skin rendering.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No cool blue cast, no hard specular flash, no clipped highlights, no heavy orange grade, no synthetic bokeh.',
    scenes: [
      { id: 'paper_roll', scene: 'Cream seamless paper backdrop with visible paper roll curvature at floor transition, matte concrete floor with authentic scuff marks, warm intimate studio atmosphere.', bestFor: 'portraits, casual wear, warm lighting' },
      { id: 'linen_wall', scene: 'Natural linen fabric backdrop in warm ecru tone with visible weave texture, aged wooden floorboards with honey patina and grain.', bestFor: 'textured garments, knitwear, bohemian styling' },
      { id: 'warm_plaster', scene: 'Hand-applied venetian plaster wall in warm sand tone with subtle trowel marks and organic imperfections, polished concrete floor with fine aggregate.', bestFor: 'luxury garments, warm skin tones, elevated casual' },
    ],
    cameras: [
      { id: 'beauty_close', camera: '100mm f/2.0, tight beauty framing head and shoulders, ISO 100, soft backdrop falloff with paper texture visible.', bestFor: 'close-up headshot originals, jewelry-focused' },
      { id: 'lifestyle_mid', camera: '50mm f/2.8, mid-body from waist up showing garment details against textured backdrop.', bestFor: 'half-body originals, top-focused outfits' },
      { id: 'full_editorial', camera: '35mm f/3.5, full body editorial with visible floor texture and complete outfit in context.', bestFor: 'full body originals, complete outfit display' },
    ],
    colorGrades: [
      { id: 'warm_film', grade: 'Warm analog film tone with lifted blacks, soft highlight roll-off, golden 4800K warmth, Kodak Portra skin rendering, subtle grain.', bestFor: 'warm skin tones, earth-tone garments, vintage aesthetic' },
      { id: 'neutral_soft', grade: 'Neutral balanced exposure with soft contrast, true-to-life colors, natural skin at 5200K, clean professional finish.', bestFor: 'all skin tones, accurate garment color display' },
      { id: 'matte_fade', grade: 'Slightly desaturated matte look with faded blacks, subtle warm cast, magazine editorial processing, filmic texture.', bestFor: 'editorial styling, muted color palettes, pastel garments' },
    ],
  },
  {
    id: 'studio_editorial',
    label: 'Fashion Editorial Studio',
    category: 'lifestyle',
    region: 'global',
    scene: 'High-end editorial studio with white painted brick wall showing authentic mortar texture, polished concrete floor, sparse architectural geometry.',
    lighting: 'Large diffused window-style source from frame-left for sculptural modeling, white card bounce fill, narrow overhead strip for contour separation. 5300-5600K daylight.',
    camera: '85-100mm f/2.8, editorial framing with clean geometry and intentional negative space.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No cluttered props, no visible strobes, no harsh direct flash, no excessive sharpening, no gaussian blur.',
    scenes: [
      { id: 'brick_minimal', scene: 'White painted brick wall with authentic mortar lines and texture variation, polished concrete floor with aggregate pattern, spare architectural geometry with negative space.', bestFor: 'structured garments, formal wear, strong silhouettes' },
      { id: 'concrete_arch', scene: 'Raw poured concrete wall with form-tie marks, steel-framed arched doorway creating geometric frame, smooth sealed concrete floor, industrial-chic editorial space.', bestFor: 'streetwear, contemporary fashion, bold patterns' },
      { id: 'gallery_clean', scene: 'Museum-white gallery wall with track lighting overhead, pale oak hardwood floor with natural grain, architectural column at frame edge, minimalist gallery setting.', bestFor: 'luxury fashion, clean designs, monochrome outfits' },
    ],
    cameras: [
      { id: 'editorial_tight', camera: '100mm f/2.8, tight editorial crop face and upper body, ISO 100, 1/250s, precise geometric composition.', bestFor: 'close-up originals, face-focused content' },
      { id: 'fashion_mid', camera: '85mm f/2.0, three-quarter fashion framing with architectural context, sharp garment detail, shallow depth.', bestFor: 'half-body originals, garment detail emphasis' },
      { id: 'full_standing', camera: '50mm f/4.0, full body standing with negative space, architectural lines framing subject, deep focus.', bestFor: 'full body originals, outfit showcase' },
    ],
    colorGrades: [
      { id: 'high_fashion', grade: 'High contrast editorial with deep blacks, bright whites, punchy micro-contrast, fashion magazine processing at 5500K.', bestFor: 'bold looks, structured garments, strong styling' },
      { id: 'soft_luxury', grade: 'Soft luxury finish with lifted shadows, creamy highlights, subtle warmth at 5200K, Vogue-like refinement.', bestFor: 'delicate fabrics, luxury brands, soft styling' },
      { id: 'bw_editorial', grade: 'Rich black and white with full tonal range, deep cinematic blacks, silver-gelatin quality, hyper-realistic skin texture visible.', bestFor: 'monochrome outfits, dramatic styling, artistic shots' },
    ],
  },
  {
    id: 'bw_studio_portrait',
    label: 'B&W Studio Portrait',
    category: 'lifestyle',
    region: 'global',
    scene: 'Clean studio with neutral backdrop, strong symmetry, hyper-realistic skin texture with visible pores.',
    lighting: 'Single key light from 45° camera-left with controlled falloff, minimal fill allowing dramatic shadow depth, subtle hair light from above-behind. 5500K daylight balanced.',
    camera: '85mm f/2.0, ISO 100, 1/500s, tack-sharp on both eyes, intense polished editorial realism.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No color, no beauty smoothing, no soft focus, no glamour lighting, no airbrushed skin, no flat grey tones.',
    scenes: [
      { id: 'dark_studio', scene: 'Clean dark charcoal studio backdrop with subtle tonal gradient, subject centered in tight composition, strong symmetry, hyper-realistic skin with visible pores and fine vellus hair.', bestFor: 'dramatic portraits, strong expressions, dark outfits' },
      { id: 'light_studio', scene: 'Light grey seamless backdrop with clean falloff, centered tight composition, strong symmetry, natural skin texture with every pore and fine detail visible.', bestFor: 'light garments, softer mood, clean minimalism' },
      { id: 'contrasty_split', scene: 'Deep black studio backdrop, split lighting creating half-lit face with dramatic shadow, single-source sculpting, intense character study atmosphere.', bestFor: 'bold editorial, moody styling, statement pieces' },
    ],
    cameras: [
      { id: 'tight_85', camera: '85mm f/2.0, tight centered composition, ISO 100, 1/500s, tack-sharp on both eyes, shallow depth isolating subject.', bestFor: 'close-up originals, portrait emphasis' },
      { id: 'medium_50', camera: '50mm f/2.8, medium close-up centered, chest and face, sharp detail on skin texture and fabric.', bestFor: 'half-body originals, garment + face balance' },
      { id: 'full_dramatic', camera: '35mm f/4.0, full body centered with deep negative space, dramatic studio isolation.', bestFor: 'full body originals, silhouette emphasis' },
    ],
    colorGrades: [
      { id: 'rich_bw', grade: 'Rich black and white with full dynamic range, deep true blacks, bright clean whites, silver-gelatin film quality, hyper-realistic skin detail.', bestFor: 'all skin tones, classic b&w portrait' },
      { id: 'high_contrast_bw', grade: 'High contrast black and white with crushed deep shadows, bright punchy highlights, dramatic tonal separation, editorial edge.', bestFor: 'dramatic expressions, bold fashion, strong features' },
      { id: 'soft_bw', grade: 'Soft matte black and white with lifted shadows, gentle tonal curve, fine grain, intimate emotional quality.', bestFor: 'soft expressions, delicate features, romantic mood' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// LIFESTYLE PRESETS
// ═══════════════════════════════════════════════════════════════

const LIFESTYLE_PRESETS: ScenePreset[] = [
  {
    id: 'lifestyle_cafe',
    label: 'Modern Cafe',
    category: 'lifestyle',
    region: 'india',
    scene: 'Contemporary Indian cafe with exposed brick wall, light oak tables, brass pendant fixtures, and monstera plant near storefront glass.',
    lighting: 'Key: soft natural daylight through left storefront glazing. Fill: pendant fixture spill and warm wall bounce. Rim: subtle warm edge from Edison fixtures. 4800-5200K warm-neutral.',
    camera: '50mm f/2.0 eye-level framing, three-quarter composition.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No messy tabletops, no neon tint, no flat lighting, no pasted-on subject, no harsh spots.',
    scenes: [
      { id: 'window_seat', scene: 'Contemporary cafe window seat with exposed red-brown brick wall, light oak table with coffee cup and croissant, brass pendant lights, monstera plant by storefront glass, soft daylight streaming in.', bestFor: 'warm, inviting shots, casual wear, daytime content' },
      { id: 'bar_counter', scene: 'Modern cafe bar counter with brushed concrete top, espresso machine in background, hanging Edison bulbs, wooden shelving with glass jars, warm intimate lighting.', bestFor: 'close-up shots, urban style, evening content' },
      { id: 'terrace_corner', scene: 'Outdoor cafe terrace with wrought-iron bistro table, potted plants, cobblestone floor, string lights overhead, distant street life in soft focus.', bestFor: 'outdoor-lit originals, summery outfits, relaxed vibe' },
    ],
    cameras: [
      { id: 'sitting_close', camera: '50mm f/1.8, seated close-up from across the table with foreground coffee cup creating depth.', bestFor: 'close-up or headshot originals, intimate framing' },
      { id: 'standing_mid', camera: '35mm f/2.8, standing three-quarter shot with full cafe context visible behind.', bestFor: 'half-body originals, outfit visibility with environment' },
      { id: 'candid_walk', camera: '85mm f/2.0, candid walking-in shot from outside through the glass, voyeuristic editorial style.', bestFor: 'full body originals, storytelling content' },
    ],
    colorGrades: [
      { id: 'cafe_warm', grade: 'Warm cafe ambiance at 4500K with golden tones, lifted warm shadows, rich wood and brass color rendering.', bestFor: 'warm skin tones, earth-tone outfits, cozy aesthetic' },
      { id: 'morning_bright', grade: 'Bright morning light at 5500K, clean exposure with airy highlights, fresh and energetic feel.', bestFor: 'light skin tones, bright garments, morning content' },
      { id: 'moody_evening', grade: 'Moody evening amber at 3500K, deep shadows, warm highlights, cinematic cafe atmosphere.', bestFor: 'dark garments, evening content, dramatic styling' },
    ],
  },
  {
    id: 'lifestyle_living_room',
    label: 'Modern Living Room',
    category: 'home',
    region: 'india',
    scene: 'Contemporary living room with floor-to-ceiling windows, neutral linen sofa, warm oak floorboards, sheer curtains filtering light.',
    lighting: 'Key: broad soft window daylight from left through sheer curtains. Fill: warm wall and ceiling bounce. Rim: rear window spill creating luminous edge. 4900-5300K warm daylight.',
    camera: '50mm f/2.0 eye-level, three-quarter body framing.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No fluorescent green cast, no clutter, no competing light sources, no compositing artifacts, no portrait-mode blur.',
    scenes: [
      { id: 'sofa_natural', scene: 'Floor-to-ceiling windows with cityscape beyond, neutral linen sofa with throw pillows, warm oak floorboards, sheer white curtains filtering soft daylight, fiddle-leaf fig plant.', bestFor: 'relaxed poses, casual home wear, natural soft lighting' },
      { id: 'reading_nook', scene: 'Cozy reading corner with armchair by a large window, floor lamp casting warm pool of light, bookshelf in background, soft rug underfoot, intimate domestic atmosphere.', bestFor: 'seated poses, cozy outfits, warm tones in original' },
      { id: 'modern_minimal', scene: 'Minimalist open-plan living space with polished concrete floors, low-profile modular sofa in grey, large abstract art on white wall, floor-to-ceiling glass with clean cityscape.', bestFor: 'modern styling, structured outfits, contemporary aesthetic' },
    ],
    cameras: [
      { id: 'seated_intimate', camera: '85mm f/2.0, seated or reclined three-quarter shot with sofa texture and pillow visible.', bestFor: 'close-up originals, upper body emphasis' },
      { id: 'standing_room', camera: '35mm f/3.5, standing full body with visible room context — windows, furniture, flooring.', bestFor: 'full body originals, outfit showcase with home context' },
      { id: 'doorway_lean', camera: '50mm f/2.8, leaning against doorframe with room visible behind, casual editorial pose.', bestFor: 'half-body originals, casual lifestyle content' },
    ],
    colorGrades: [
      { id: 'daylight_airy', grade: 'Clean airy daylight at 5400K, bright windows, soft shadows, fresh and modern residential feeling.', bestFor: 'light outfits, bright originals, clean aesthetic' },
      { id: 'golden_afternoon', grade: 'Warm afternoon light at 4200K with golden window glow, deep warm shadows, honey-toned wood emphasis.', bestFor: 'warm skin tones, sunset-lit originals, cozy mood' },
      { id: 'evening_lamp', grade: 'Evening lamp ambiance at 3200K, warm pools of light, dark ambient corners, intimate domestic mood.', bestFor: 'dark outfits, moody originals, evening content' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// OUTDOOR PRESETS
// ═══════════════════════════════════════════════════════════════

const OUTDOOR_PRESETS: ScenePreset[] = [
  {
    id: 'outdoor_golden_hour',
    label: 'Golden Hour Walkway',
    category: 'outdoor',
    region: 'global',
    scene: 'Waterfront promenade with warm paving stones, safety railing, mature trees, sunset sky in gold and peach.',
    lighting: 'Key: low warm sun from camera-left near horizon. Fill: open sky ambient cool-toned. Rim: warm golden back edge on shoulders and hair. 3500-4500K golden-hour mix.',
    camera: '85mm f/1.8 portrait, three-quarter body with sunset bokeh.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No crowds, no midday overhead light, no crushed shadows, no overcooked orange saturation, no fake lens flare.',
    scenes: [
      { id: 'promenade_sunset', scene: 'Waterfront promenade with warm honey-toned paving stones, low brushed-steel railing, mature trees with backlit foliage, expansive sunset sky with layered cirrus clouds painted gold and peach, ocean visible beyond.', bestFor: 'warm-toned originals, open spaces, romantic content' },
      { id: 'garden_path', scene: 'Manicured garden path with gravel walkway between clipped hedges, ornamental lamp posts, distant fountain, sky gradient from amber through rose to soft violet, flowers catching last light.', bestFor: 'elegant outfits, garden-party vibes, feminine styling' },
      { id: 'urban_bridge', scene: 'Pedestrian bridge with cable stays and steel railings at golden hour, warm backlighting through urban skyline silhouettes, river reflection below catching golden light, long dramatic shadows.', bestFor: 'urban style, streetwear, dynamic originals' },
    ],
    cameras: [
      { id: 'golden_portrait', camera: '85mm f/1.8, three-quarter portrait with beautiful sunset bokeh circles from distant lights.', bestFor: 'close-up or half-body originals, dreamy aesthetic' },
      { id: 'wide_walk', camera: '35mm f/2.8, full body walking along path with expansive sky context and environmental storytelling.', bestFor: 'full body originals, travel content, wide scenes' },
      { id: 'silhouette_rim', camera: '50mm f/2.0, three-quarter body with strong rim light from setting sun creating golden edge separation.', bestFor: 'backlit originals, silhouette-friendly' },
    ],
    colorGrades: [
      { id: 'golden_warm', grade: 'Rich golden warmth at 3800K, orange-amber highlights, deep warm shadows, sun-kissed skin glow.', bestFor: 'warm skin tones, golden original lighting' },
      { id: 'film_sunset', grade: 'Cinematic sunset grade with teal shadows and warm highlights, split toning, filmic contrast at 4200K.', bestFor: 'dramatic content, cool-warm contrast, editorial' },
      { id: 'pastel_dusk', grade: 'Soft pastel dusk tones with lavender shadows, peach highlights, gentle 4500K warmth, dreamy romantic feel.', bestFor: 'light skin tones, pastel outfits, romantic aesthetic' },
    ],
  },
  {
    id: 'outdoor_beach',
    label: 'Beach Evening',
    category: 'outdoor',
    region: 'india',
    scene: 'Indian coastline with golden sand, gentle turquoise shoreline, dramatic horizon sky in amber to steel blue.',
    lighting: 'Key: setting sun from rear-side creating warm rim outline. Fill: sky dome and sand bounce opening facial shadows. Rim: sun edge from horizon. Mixed 3800-5200K.',
    camera: '50mm f/2.0, three-quarter with ocean horizon and sand texture.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No crowds, no beach umbrellas, no harsh noon sun, no unrealistic teal-orange push, no HDR tonemapping.',
    scenes: [
      { id: 'shore_walk', scene: 'Fine golden sand with natural ripple patterns, gentle turquoise foam lapping at beach edge, sparse footprints, dramatic amber-to-blue sky gradient, distant fishing boats for depth.', bestFor: 'walking poses, casual beachwear, open space' },
      { id: 'rocky_coast', scene: 'Dramatic rocky coastline with dark volcanic boulders, tide pool reflections, crashing white spray, sky turning deep amber with steel-blue cloud layers, rugged texture.', bestFor: 'strong poses, edgy styling, dramatic originals' },
      { id: 'palm_shade', scene: 'Beach with leaning coconut palm casting geometric shadows, woven rope hammock nearby, warm sand with shell fragments, turquoise water in middle distance, tropical atmosphere.', bestFor: 'relaxed poses, resort wear, tropical content' },
    ],
    cameras: [
      { id: 'beach_portrait', camera: '85mm f/2.0, three-quarter portrait with ocean and sky creating layered background bokeh.', bestFor: 'close-up originals, portrait emphasis' },
      { id: 'walk_wide', camera: '35mm f/3.5, full body walking on shoreline with visible sand, water, and extensive sky.', bestFor: 'full body originals, beach walk content' },
      { id: 'low_angle', camera: '24mm f/4.0, low angle looking slightly up with dramatic sky behind, sand in foreground.', bestFor: 'strong poses, dramatic full-body originals' },
    ],
    colorGrades: [
      { id: 'sunset_coastal', grade: 'Coastal sunset with warm amber skin tones, teal-turquoise water, gradient sky from gold to indigo.', bestFor: 'warm skin tones, sunset content' },
      { id: 'tropical_vivid', grade: 'Vivid tropical palette with saturated blues and greens, warm golden sand, punchy contrast at 5000K.', bestFor: 'bright outfits, midday-lit originals, vibrant content' },
      { id: 'muted_coastal', grade: 'Muted organic coastal tones with desaturated blues, warm sandy neutrals, subtle film grain, documentary feel.', bestFor: 'neutral outfits, muted originals, natural aesthetic' },
    ],
  },
  {
    id: 'outdoor_park',
    label: 'Morning Park',
    category: 'outdoor',
    region: 'india',
    scene: 'Urban park with emerald lawn, paved paths, mature trees, park benches, morning mist.',
    lighting: 'Key: low morning sun through tree canopy creating dappled patterns. Fill: grass and path bounce. Rim: warm backlight through leaves. 4300-5200K with mist diffusion.',
    camera: '50mm f/2.8 environmental framing with foreground-midground-background depth.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No crowded paths, no neon-bright greens, no hard midday light, no CGI foliage, no oversaturation.',
    scenes: [
      { id: 'tree_canopy', scene: 'Manicured park path under mature banyan canopy with dappled morning light, emerald lawn with dew, wooden bench nearby, light morning mist hovering low.', bestFor: 'natural soft lighting, casual outfits, fresh content' },
      { id: 'garden_bloom', scene: 'Botanical garden section with blooming flower beds in foreground, stone pathway, ornamental fountain in mid-distance, lush green canopy above.', bestFor: 'colorful outfits, feminine styling, spring content' },
      { id: 'lake_edge', scene: 'Park lake edge with still water reflecting trees and sky, wooden railing, overhanging willow branches, morning sun creating sparkle on water surface.', bestFor: 'reflective/calm mood, elegant wear, serene content' },
    ],
    cameras: [
      { id: 'path_walk', camera: '50mm f/2.8, three-quarter body walking on park path with tree-lined depth.', bestFor: 'walking or standing originals, environmental context' },
      { id: 'bench_seated', camera: '85mm f/2.0, seated on park bench with blurred green foliage background.', bestFor: 'seated originals, relaxed pose, portrait emphasis' },
      { id: 'wide_nature', camera: '28mm f/4.0, full body with expansive park landscape providing rich environmental context.', bestFor: 'full body originals, travel content, wide shots' },
    ],
    colorGrades: [
      { id: 'morning_fresh', grade: 'Fresh morning light at 5200K, clean greens, dewy brightness, natural skin with slight cool undertone.', bestFor: 'all skin tones, morning content, fresh aesthetic' },
      { id: 'warm_golden', grade: 'Warm golden morning at 4500K, amber-tinted light through leaves, warm shadows, sun-kissed feel.', bestFor: 'warm skin tones, golden-lit originals' },
      { id: 'lush_film', grade: 'Lush film look with rich deep greens, warm skin tones slightly lifted, analog grain, Fuji 400H aesthetic.', bestFor: 'nature content, vintage aesthetic, earthy outfits' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// URBAN PRESETS
// ═══════════════════════════════════════════════════════════════

const URBAN_PRESETS: ScenePreset[] = [
  {
    id: 'urban_rooftop_day',
    label: 'Rooftop Terrace Day',
    category: 'outdoor',
    region: 'india',
    scene: 'High-rise rooftop terrace with glass railing, concrete deck, city skyline backdrop, clear sky.',
    lighting: 'Key: open daylight from high front-left with cloud diffusion. Fill: concrete and glass bounce. Rim: skyline back edge separation. 5500-6000K neutral-cool.',
    camera: '35-50mm perspective, lifestyle composition with skyline depth.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No rooftop clutter, no AC units, no flat overcast haze, no clipped highlights, no HDR halos.',
    scenes: [
      { id: 'glass_railing', scene: 'Modern rooftop with frameless glass railing, clean concrete deck with expansion joints, geometric planters with manicured plants, sweeping city skyline at varying distances, clear blue sky with wispy clouds.', bestFor: 'modern styling, urban content, clean aesthetic' },
      { id: 'lounge_area', scene: 'Rooftop lounge with teak outdoor furniture and neutral cushions, potted palms, decorative string lights (off in daylight), metal coffee table, skyline panorama behind.', bestFor: 'relaxed poses, lifestyle content, social media aesthetic' },
      { id: 'sunset_deck', scene: 'Open rooftop deck at golden hour with warm light on concrete, dramatic long shadows, city lights beginning to twinkle below, sky gradient from warm amber to deep blue.', bestFor: 'warm-toned originals, evening content, dramatic shots' },
    ],
    cameras: [
      { id: 'skyline_wide', camera: '24-35mm f/4.0, full body with dramatic skyline panorama providing context and scale.', bestFor: 'full body originals, dramatic backgrounds, travel content' },
      { id: 'railing_lean', camera: '50mm f/2.8, three-quarter body leaning near railing with depth bokeh of city below.', bestFor: 'half-body originals, casual lifestyle poses' },
      { id: 'deck_portrait', camera: '85mm f/2.0, chest-up portrait with soft city skyline bokeh creating urban atmosphere.', bestFor: 'close-up originals, portrait emphasis with urban feel' },
    ],
    colorGrades: [
      { id: 'urban_crisp', grade: 'Crisp urban daylight at 5800K, clean blue sky, sharp contrast, neutral accurate colors.', bestFor: 'all skin tones, daytime content, clean aesthetic' },
      { id: 'hazy_warm', grade: 'Warm hazy afternoon at 4800K with slight atmospheric warmth, gentle contrast, golden urban glow.', bestFor: 'warm skin tones, afternoon content, soft mood' },
      { id: 'blue_hour', grade: 'Cool blue-hour tones at 7000K with warm accent lights from city below, deep sky, magical transition light.', bestFor: 'evening content, dramatic styling, cool tones' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// CELEBRATION PRESETS
// ═══════════════════════════════════════════════════════════════

const CELEBRATION_PRESETS: ScenePreset[] = [
  {
    id: 'celebration_festive',
    label: 'Festive Evening',
    category: 'lifestyle',
    region: 'india',
    scene: 'Festive interior with marigold garlands, brass diyas, tea-light candles, silk drapes, polished marble floor.',
    lighting: 'Key: clustered diya and candle practicals creating warm illumination. Fill: warm bounce from silk drapes. Rim: string-light back edge with circular bokeh. 2600-3200K festive warmth.',
    camera: '50mm f/1.8 eye-level, chest to three-quarter with festive bokeh.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No harsh flash washing out ambiance, no gaudy decorations, no cheap plastic decor, no flat lighting, no cool white light.',
    scenes: [
      { id: 'diwali_warm', scene: 'Festive interior with fresh marigold garlands in orange and yellow, polished brass diyas with flickering flames, clustered tea-lights at multiple depths, rich silk drapes in deep red, polished marble floor reflecting warm light, rangoli visible.', bestFor: 'Indian ethnic wear, festive content, warm skin tones' },
      { id: 'fairy_lights', scene: 'Intimate celebration space with cascading fairy light curtain backdrop, scattered rose petals on white surface, gold and champagne tone decor, soft gauze draping, modern festive elegance.', bestFor: 'contemporary festive wear, soft styling, celebration content' },
      { id: 'mandap_garden', scene: 'Outdoor evening celebration with fabric-draped mandap structure, string lights woven through branches, floating flower arrangements, warm lanterns on ground, open sky with first stars.', bestFor: 'outdoor festive wear, wedding content, grand styling' },
    ],
    cameras: [
      { id: 'festive_close', camera: '85mm f/1.4, tight portrait with rich layered festive bokeh from candles and lights behind.', bestFor: 'close-up originals, jewelry showcase, beauty content' },
      { id: 'festive_mid', camera: '50mm f/1.8, three-quarter body with visible festive decor context and layered light bokeh.', bestFor: 'half-body originals, outfit detail, celebration content' },
      { id: 'festive_full', camera: '35mm f/2.8, full body in celebration setting with complete outfit and environment visible.', bestFor: 'full body originals, lehenga/saree showcase, grand context' },
    ],
    colorGrades: [
      { id: 'diwali_gold', grade: 'Rich warm gold at 2800K, amber diya light on skin, deep orange and red saturation, traditional festive warmth.', bestFor: 'warm skin tones, traditional Indian wear, diwali content' },
      { id: 'celebration_soft', grade: 'Soft warm glow at 3500K with lifted shadows, gentle gold highlights, rose-tinted ambiance.', bestFor: 'all skin tones, modern festive wear, elegant mood' },
      { id: 'night_sparkle', grade: 'Night festive with deep blacks, sparkling highlights, gold accent color, high contrast glamour.', bestFor: 'dark outfits with embellishment, evening content, glamorous styling' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// CASUAL PRESETS
// ═══════════════════════════════════════════════════════════════

const CASUAL_PRESETS: ScenePreset[] = [
  {
    id: 'casual_mirror_selfie',
    label: 'Mirror Selfie',
    category: 'lifestyle',
    region: 'india',
    scene: 'Bedroom mirror corner with wood frame, neutral wall, clean floor, minimal home objects.',
    lighting: 'Key: window side light reflected in mirror from camera-left. Fill: room bounce from ceiling and walls. Rim: faint lamp edge. Mixed 3800-4600K indoor.',
    camera: '26mm smartphone wide-angle selfie lens, handheld mirror perspective.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No professional setup, no perfect symmetry, no beauty framing, no CGI look, no portrait-mode blur.',
    scenes: [
      { id: 'bedroom_mirror', scene: 'Bedroom full-length mirror with wood or metal frame, neutral matte wall in off-white, warm wood laminate floor, hanging jacket on hook, small plant nearby, realistic glass reflections.', bestFor: 'casual OOTD content, authentic home feel, everyday styling' },
      { id: 'closet_mirror', scene: 'Walk-in closet mirror with clothing rack visible behind, storage boxes, hatbox or shoe organizer edge, clean organized space, warm interior lighting.', bestFor: 'fashion content, wardrobe showcase, styling posts' },
      { id: 'bathroom_mirror', scene: 'Clean modern bathroom mirror above vanity, marble countertop edge, wall sconce casting even light, towel bar visible, tiled wall texture, bright clean atmosphere.', bestFor: 'bright selfies, fresh morning content, clean aesthetic' },
    ],
    cameras: [
      { id: 'selfie_standard', camera: '26mm smartphone wide-angle, handheld at chest height angled up, phone visible in mirror, natural slight tilt.', bestFor: 'all originals, standard mirror selfie' },
      { id: 'full_mirror', camera: '26mm smartphone wide-angle, held at waist showing full body in mirror with floor visible.', bestFor: 'full body originals, outfit check OOTD' },
      { id: 'high_angle', camera: '26mm smartphone, held above head creating slight high-angle with room below, flattering perspective.', bestFor: 'close-up originals, slim flattering angle' },
    ],
    colorGrades: [
      { id: 'phone_natural', grade: 'Natural smartphone processing with slight warmth, realistic indoor color, minor noise at ISO 800+, authentic feel.', bestFor: 'all skin tones, authentic content' },
      { id: 'warm_filter', grade: 'Warm Instagram-style filter with lifted shadows, golden warmth, slight desaturation, VSCO aesthetic.', bestFor: 'warm skin tones, lifestyle content' },
      { id: 'bright_clean', grade: 'Bright clean exposure with white balance correction, punchy colors, clear skin rendering, polished selfie look.', bestFor: 'light skin tones, bright outfits, clean aesthetic' },
    ],
  },
  {
    id: 'casual_street_candid',
    label: 'Street Candid',
    category: 'street',
    region: 'india',
    scene: 'Indian sidewalk with textured painted wall, muted storefronts, concrete pavement, sparse traffic blur.',
    lighting: 'Key: soft overcast sky through urban corridor. Fill: pavement and wall bounce. Rim: ambient glow from street end. 5200-5800K neutral daylight.',
    camera: '48mm smartphone main camera f/1.8, eye-level casual framing.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No runway posing, no theatrical lighting, no HDR halos, no over-smoothed textures, no oversaturated colors.',
    scenes: [
      { id: 'painted_wall', scene: 'Clean Indian sidewalk with textured cream or terracotta painted wall, muted colorful storefront depth, concrete pavement with natural patina, sparse background traffic blur suggesting urban life.', bestFor: 'casual outfits, urban content, colorful backgrounds' },
      { id: 'market_lane', scene: 'Narrow market lane with old wooden shopfronts, hand-painted signs, hanging fabric awnings, cobblestone ground, dappled light through canopy, lived-in texture.', bestFor: 'cultural content, bohemian styling, storytelling posts' },
      { id: 'metro_exit', scene: 'Modern metro station exit with brushed steel columns, clean glass panels, polished granite steps, urban signage, contemporary architectural geometry.', bestFor: 'urban style, streetwear, modern aesthetic' },
    ],
    cameras: [
      { id: 'street_candid', camera: '48mm f/1.8, eye-level candid framing as if friend took the photo while walking, natural shallow depth.', bestFor: 'casual originals, candid feel' },
      { id: 'street_editorial', camera: '85mm f/2.0, compressed perspective with blurred street depth, editorial street style.', bestFor: 'fashion-forward originals, elevated street style' },
      { id: 'wide_context', camera: '28mm f/4.0, wide shot showing full street atmosphere with subject placed using rule of thirds.', bestFor: 'full body originals, environmental storytelling' },
    ],
    colorGrades: [
      { id: 'street_natural', grade: 'Natural street daylight at 5500K, true colors, realistic contrast, documentary authenticity.', bestFor: 'all skin tones, accurate street documentation' },
      { id: 'urban_warm', grade: 'Warm urban tone at 4800K, slight golden cast, enhanced warm textures, Instagram-ready warmth.', bestFor: 'warm skin tones, earth-tone outfits, warm original lighting' },
      { id: 'faded_film', grade: 'Faded film look with lifted blacks, desaturated blues, warm midtones, analog street photography aesthetic.', bestFor: 'vintage styling, muted outfits, artistic content' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// EXTENDED PRESETS
// ═══════════════════════════════════════════════════════════════

const EXTENDED_PRESETS: ScenePreset[] = [
  {
    id: 'golden_hour_bedroom',
    label: 'Golden Hour Bed',
    category: 'home',
    region: 'global',
    scene: 'Cozy bedroom with rumpled linen bedding, wooden blinds casting stripe patterns, warm-toned walls.',
    lighting: 'Key: low golden sun through blinds creating warm stripe pattern. Fill: wall and ceiling bounce. Rim: narrow warm edge from blind slits. 3400-4200K golden.',
    camera: 'Selfie POV from above, slightly angled, authentic phone quality.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No harsh flash, no cold blue cast, no perfectly flat bedding, no hotel-room look, no beauty filter.',
    scenes: [
      { id: 'blinds_stripes', scene: 'Bedroom with rumpled off-white linen bedding, slatted wooden blinds casting warm stripe patterns, matte cream walls, minimal bedside — book, coffee mug, small plant on nightstand.', bestFor: 'morning content, cozy aesthetic, warm originals' },
      { id: 'sheer_curtain', scene: 'Bedroom bathed in soft light through sheer white curtains, pale wooden bed frame, textured knit throw at foot, warm hardwood floor, peaceful morning atmosphere.', bestFor: 'soft lighting originals, delicate outfits, feminine content' },
      { id: 'sunset_glow', scene: 'Bedroom at sunset with deep golden-amber light flooding through window, long shadows across rumpled duvet, warm copper and bronze tones throughout, intimate evening warmth.', bestFor: 'evening content, dramatic warm lighting, intimate mood' },
    ],
    cameras: [
      { id: 'above_selfie', camera: 'Smartphone POV from above, slightly angled, showing bed context and body with authentic casual perspective.', bestFor: 'casual selfie originals, lying-down or sitting poses' },
      { id: 'bed_edge', camera: '50mm f/2.0, sitting on bed edge with window light and room context, three-quarter from side.', bestFor: 'seated originals, relaxed lifestyle content' },
      { id: 'standing_room', camera: '35mm f/3.5, standing in bedroom with visible bed, furniture, window light, complete room context.', bestFor: 'full body originals, bedroom OOTD content' },
    ],
    colorGrades: [
      { id: 'morning_gold', grade: 'Warm morning gold at 3800K, honey-amber light through blinds, warm skin glow, lifted cream shadows.', bestFor: 'warm skin tones, morning content, cozy feel' },
      { id: 'soft_neutral', grade: 'Soft neutral at 4800K with gentle warmth, balanced shadows, clean skin rendering, airy bedroom feel.', bestFor: 'all skin tones, neutral outfits, clean aesthetic' },
      { id: 'sunset_amber', grade: 'Deep sunset amber at 3200K, rich golden saturation, dramatic warm shadows, romantic intimate atmosphere.', bestFor: 'evening content, warm dramatic lighting, intimate mood' },
    ],
  },
  {
    id: 'studio_gray_flash',
    label: 'Gray Flash Editorial',
    category: 'lifestyle',
    region: 'global',
    scene: 'Medium gray gradient studio with matte floor, no props, tonal roll-off from center to edges.',
    lighting: 'Key: controlled direct frontal flash. Fill: low ambient bounce from gray surfaces. Rim: narrow side kicker for garment edge separation. 5200-5600K neutral.',
    camera: '85mm f/2.0 chest-up to mid-shot, fashion editorial composition.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No soft beauty flattening, no pastel haze, no overexposed hotspots, no plastic skin, no oversharpening.',
    scenes: [
      { id: 'neutral_gray', scene: 'True neutral gray gradient backdrop at ~50% without color bias, clean matte floor, visible tonal roll-off from center to edges creating depth, classic fashion studio.', bestFor: 'all garment colors, accurate color representation, editorial content' },
      { id: 'charcoal_moody', scene: 'Deep charcoal-gray backdrop with dramatic gradient to near-black at edges, polished dark floor with subtle reflection, moody high-fashion atmosphere.', bestFor: 'dark outfits, dramatic styling, bold fashion content' },
      { id: 'light_gray_airy', scene: 'Light silver-gray backdrop with clean gradient to white at edges, matte light floor, airy open studio feel with modern minimalism.', bestFor: 'light outfits, bright styling, fresh editorial content' },
    ],
    cameras: [
      { id: 'fashion_close', camera: '85mm f/2.0, chest-up tight fashion crop with shallow backdrop falloff, sharp face and garment detail.', bestFor: 'close-up originals, beauty and fashion emphasis' },
      { id: 'editorial_mid', camera: '50mm f/2.8, mid-body from waist up with visible gray gradient backdrop, editorial composition.', bestFor: 'half-body originals, garment detail showcase' },
      { id: 'full_body_flash', camera: '35mm f/4.0, full body head-to-toe with complete outfit and studio gradient context.', bestFor: 'full body originals, complete outfit display' },
    ],
    colorGrades: [
      { id: 'flash_neutral', grade: 'Crisp flash neutral at 5500K, true grays, accurate skin rendering, high micro-contrast, sharp editorial punch.', bestFor: 'all skin tones, accurate garment colors, editorial' },
      { id: 'flash_warm', grade: 'Warm flash tone at 5000K, slight golden skin warmth, rich gray tones, flattering portrait quality.', bestFor: 'warm skin tones, warm-toned garments' },
      { id: 'desaturated_fashion', grade: 'Slightly desaturated fashion grade, muted mid-tones, strong blacks, magazine editorial processing.', bestFor: 'high fashion, muted palettes, artistic styling' },
    ],
  },
  {
    id: 'lifestyle_airport_terminal',
    label: 'Airport Travel Candid',
    category: 'travel',
    region: 'global',
    scene: 'Modern airport terminal with glass walls, steel columns, polished terrazzo, rolling suitcase nearby.',
    lighting: 'Key: broad overcast daylight through glass walls. Fill: polished tile and metal bounce. Rim: back window edge creating luminous outline. 5200-6200K cool-neutral.',
    camera: 'Smartphone mid-shot with casual tilt, travel influencer aesthetic.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No stiff posing, no flash hotspot, no oversaturated signage, no fake motion blur, no crowds.',
    scenes: [
      { id: 'departure_hall', scene: 'Airport departure concourse with floor-to-ceiling glass showing tarmac, brushed steel columns, chrome handrails, rolling cabin suitcase nearby, polished terrazzo with wayfinding markings, departure boards in distance.', bestFor: 'travel content, airport OOTD, modern aesthetic' },
      { id: 'lounge_window', scene: 'Airport premium lounge with panoramic runway window, comfortable armchair, coffee table with cup, aircraft visible on tarmac, soft ambient downlighting, premium travel atmosphere.', bestFor: 'elevated travel content, business style, luxury aesthetic' },
      { id: 'corridor_walk', scene: 'Long airport corridor with moving walkway, curved ceiling with strip lighting, glass walls showing sky, rolling luggage behind, dynamic sense of journey and movement.', bestFor: 'walking poses, travel lifestyle, dynamic content' },
    ],
    cameras: [
      { id: 'travel_candid', camera: '28mm smartphone, mid-shot with casual tilt and off-center framing, travel influencer candid style.', bestFor: 'casual originals, candid travel content' },
      { id: 'window_portrait', camera: '50mm f/2.0, three-quarter portrait against terminal window with soft runway bokeh.', bestFor: 'half-body originals, portrait with travel context' },
      { id: 'walking_full', camera: '35mm f/3.5, full body walking through terminal with visible luggage and architecture.', bestFor: 'full body originals, movement emphasis, travel storytelling' },
    ],
    colorGrades: [
      { id: 'travel_clean', grade: 'Clean travel light at 5800K, neutral whites, accurate colors, crisp modern airport atmosphere.', bestFor: 'all skin tones, clean travel style' },
      { id: 'warm_journey', grade: 'Warm journey tone at 4800K with slight golden warmth, soft contrast, inviting travel mood.', bestFor: 'warm skin tones, cozy travel content' },
      { id: 'editorial_cool', grade: 'Cool editorial airport at 6500K with blue-tinted ambient, high contrast, modern travel editorial look.', bestFor: 'cool-toned outfits, business travel, editorial content' },
    ],
  },
  {
    id: 'lifestyle_tropical_patio',
    label: 'Tropical Patio Lunch',
    category: 'lifestyle',
    region: 'global',
    scene: 'Resort patio with canvas umbrella, marble table, artful food, tropical foliage backdrop.',
    lighting: 'Key: soft shaded daylight under umbrella. Fill: table and stone bounce. Rim: bright sunlit foliage edge. Mixed 4500-6000K.',
    camera: 'Smartphone medium close-up from slight high angle, influencer lunch style.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No empty table, no sterile ambiance, no over-sharpened food, no flat exposure, no oversaturated tropicals.',
    scenes: [
      { id: 'umbrella_dining', scene: 'Upscale resort patio under dark green canvas umbrella, marble round table with artful food plating and glass of lime water, dense tropical foliage (palms, banana leaves, bougainvillea) creating lush backdrop.', bestFor: 'lunch content, resort wear, tropical aesthetic' },
      { id: 'poolside_lunch', scene: 'Infinity pool edge dining area with turquoise water beyond, white marble table, tropical cocktail, wicker furniture, palm shadow on cream stone, horizon visible.', bestFor: 'pool/resort content, swimwear adjacent, luxury aesthetic' },
      { id: 'garden_terrace', scene: 'Covered garden terrace with climbing jasmine on wooden pergola, terracotta tile floor, iron bistro table with colorful salad, dappled leaf shadows, birdsong atmosphere.', bestFor: 'garden content, brunch aesthetic, European-tropical fusion' },
    ],
    cameras: [
      { id: 'lunch_above', camera: '28mm smartphone, medium close-up from high angle with food props in foreground creating depth layers.', bestFor: 'sitting originals, food + fashion content' },
      { id: 'patio_mid', camera: '50mm f/2.0, three-quarter seated with visible table setting and tropical background.', bestFor: 'half-body originals, lifestyle dining content' },
      { id: 'standing_tropical', camera: '35mm f/3.5, standing full body with tropical foliage backdrop and patio context.', bestFor: 'full body originals, resort outfit showcase' },
    ],
    colorGrades: [
      { id: 'tropical_warm', grade: 'Warm tropical at 4800K, rich greens enhanced, golden skin warmth, saturated food colors, resort paradise feel.', bestFor: 'warm skin tones, colorful outfits, summer content' },
      { id: 'airy_bright', grade: 'Airy bright at 5800K, clean exposure, lifted whites, fresh tropical brightness, social media-ready.', bestFor: 'light skin tones, bright outfits, fresh aesthetic' },
      { id: 'film_exotic', grade: 'Film exotic at 4500K with rich earth tones, subtle film grain, vintage tropical postcard quality.', bestFor: 'earth-tone outfits, vintage aesthetic, travel content' },
    ],
  },
  {
    id: 'home_cozy_teddy_selfie',
    label: 'Cozy Home Selfie',
    category: 'home',
    region: 'global',
    scene: 'Apartment sofa with chunky knit throw, cushion accents, neutral wall, soft afternoon light.',
    lighting: 'Key: diffused window light at 45 degrees. Fill: sofa fabric and wall bounce. Rim: mild ambient wrap from room walls.',
    camera: 'Front-facing smartphone selfie perspective with wide-angle optics.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No over-smoothed skin, no CGI fabric texture, no waxy look, no fake edge blur, no beauty filter.',
    scenes: [
      { id: 'sofa_cozy', scene: 'Plush sofa with chunky knit throw blanket, pastel and earth-tone cushion accents, neutral warm white wall, lived-in scale — remote on armrest, mug on coffee table, soft afternoon light.', bestFor: 'cozy home content, casual wear, relaxed selfies' },
      { id: 'bed_morning', scene: 'Morning bed with fluffy white duvet, multiple soft pillows, warm wood headboard, bedside table with candle and phone, gentle window light, lazy morning atmosphere.', bestFor: 'morning content, sleepwear/loungewear, fresh natural look' },
      { id: 'floor_cushion', scene: 'Floor-level sitting area with large cushions and bean bag, soft rug texture, wall with hanging photos or artwork, warm lamp light, bohemian cozy aesthetic.', bestFor: 'ground-level poses, boho styling, intimate content' },
    ],
    cameras: [
      { id: 'selfie_cozy', camera: '26mm front-facing smartphone, cozy selfie from slightly above, subject and cushions sharp, room detail present.', bestFor: 'selfie originals, casual close-up content' },
      { id: 'sitting_full', camera: '28mm smartphone rear camera, full body seated or cross-legged with visible room context around.', bestFor: 'full body originals, outfit showcase on sofa' },
      { id: 'candid_side', camera: '50mm f/2.0, candid side angle as if someone on the sofa took the photo, intimate casual perspective.', bestFor: 'friend-took-it aesthetic, natural candid feel' },
    ],
    colorGrades: [
      { id: 'cozy_warm', grade: 'Cozy warm at 4000K, soft golden ambient light, warm cream shadows, comfortable domestic warmth.', bestFor: 'warm skin tones, cozy content, evening light' },
      { id: 'bright_home', grade: 'Bright home at 5200K, clean daylight, airy whites, natural skin rendering, fresh daytime feel.', bestFor: 'all skin tones, morning/afternoon content, clean look' },
      { id: 'instagram_warm', grade: 'Instagram warm filter at 4500K, lifted shadows, golden midtones, slightly desaturated, curated aesthetic.', bestFor: 'social media content, warm aesthetic, lifestyle posts' },
    ],
  },
  {
    id: 'studio_white_brick_bench',
    label: 'White Brick Bench Studio',
    category: 'lifestyle',
    region: 'global',
    scene: 'Minimal studio with painted white brick wall, dark bench, matte concrete floor.',
    lighting: 'Key: broad diffused front source. Fill: white brick and floor bounce. Rim: subtle side contour light for body separation.',
    camera: '35-50mm editorial composition with deep focus.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No overexposed wall losing brick detail, no blur haze, no texture smoothing, no plastic skin.',
    scenes: [
      { id: 'bench_seated', scene: 'White painted brick wall with authentic mortar lines, dark wooden bench as only prop, matte concrete floor, clean geometric negative space, natural texture variation.', bestFor: 'seated poses, full outfit visibility, minimalist content' },
      { id: 'wall_lean', scene: 'Textured white brick wall with subject leaning casually, industrial metal stool or wooden crate, concrete floor, raw authentic studio atmosphere.', bestFor: 'standing poses, casual styling, urban brand content' },
      { id: 'arch_frame', scene: 'White brick studio with architectural arched opening creating natural frame, dark bench positioned inside arch, soft directional light from side, curated editorial geometry.', bestFor: 'elevated styling, formal wear, architectural framing' },
    ],
    cameras: [
      { id: 'bench_full', camera: '35mm f/4.0, full body seated on bench with deep focus preserving all wall texture and floor material.', bestFor: 'full body originals, seated poses, outfit showcase' },
      { id: 'standing_mid', camera: '50mm f/2.8, standing three-quarter against brick wall with visible texture and architectural lines.', bestFor: 'half-body originals, casual editorial' },
      { id: 'detail_close', camera: '85mm f/2.0, close-up portrait with brick texture in soft focus creating textured studio bokeh.', bestFor: 'close-up originals, face emphasis, accessory showcase' },
    ],
    colorGrades: [
      { id: 'studio_neutral', grade: 'Neutral studio at 5500K, true whites on brick, accurate skin, clean contrast, product-photography clarity.', bestFor: 'all skin tones, garment-accurate colors' },
      { id: 'warm_analog', grade: 'Warm analog studio at 4800K, cream-tinted brick, warm skin rendition, subtle film emulation.', bestFor: 'warm skin tones, vintage or earthy garments' },
      { id: 'high_contrast', grade: 'High contrast editorial with deep shadows in brick mortar, bright highlights, punchy micro-contrast, dramatic.', bestFor: 'bold styling, dark garments, fashion-forward content' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// LOCATION PRESETS (natural, realistic)
// ═══════════════════════════════════════════════════════════════

const CINEMATIC_PRESETS: ScenePreset[] = [
  {
    id: 'stadium_editorial',
    label: 'Stadium Editorial',
    category: 'outdoor',
    region: 'global',
    scene: 'Empty stadium seats outdoors, rows of colored plastic chairs, open sky above.',
    lighting: 'Natural daylight, soft shadows, overcast sky. 5500K neutral.',
    camera: '50mm f/2.8, medium shot, natural perspective.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No crowds, no harsh shadows, no artificial look.',
    scenes: [
      { id: 'blue_seats', scene: 'Outdoor stadium with rows of blue plastic seats, concrete steps, open sky, natural daylight, real stadium environment.', bestFor: 'cool-toned content, structured outfits' },
      { id: 'red_seats', scene: 'Outdoor arena with red plastic seats and concrete steps, real sports ground, natural overcast light.', bestFor: 'bold garments, warm accent garments' },
      { id: 'mixed_seats', scene: 'Weathered outdoor stadium with faded colored seats, worn concrete, real aging and patina.', bestFor: 'vintage styling, casual wear' },
    ],
    cameras: [
      { id: 'centered_above', camera: '50mm f/2.8, centered medium shot from slightly above, natural depth of field.', bestFor: 'standard portraits, symmetry emphasis' },
      { id: 'low_angle_rows', camera: '35mm f/4.0, low angle with seat rows visible, full body.', bestFor: 'full body originals' },
      { id: 'side_profile', camera: '85mm f/2.0, side profile with blurred seats behind, shallow depth.', bestFor: 'close-up originals, profile shots' },
    ],
    colorGrades: [
      { id: 'cool_blue', grade: 'Cool natural daylight, slightly desaturated background, clean realistic look.', bestFor: 'cool skin tones, blue garments' },
      { id: 'warm_contrast', grade: 'Warm natural skin tones against cool environment, balanced contrast.', bestFor: 'warm skin tones' },
      { id: 'faded_film', grade: 'Slightly faded natural colors, muted tones, casual real-photo quality.', bestFor: 'vintage styling, muted colors' },
    ],
  },
  {
    id: 'nyc_nightlife',
    label: 'NYC Night Street',
    category: 'street',
    region: 'global',
    scene: 'City street in the evening with storefronts, streetlights, and passing cars.',
    lighting: 'Warm streetlights and storefront glow, soft ambient urban light. Mixed warm light.',
    camera: '50mm f/1.8, shallow depth of field, slightly blurred background.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No daytime, no harsh flash, no overly stylized look.',
    scenes: [
      { id: 'pub_exterior', scene: 'Street sidewalk outside a bar or restaurant in the evening, warm light from doorway, a few people nearby, normal urban activity.', bestFor: 'evening outfits, urban style' },
      { id: 'corner_neon', scene: 'City street corner at evening with lit shop signs, streetlights reflecting on pavement, cars passing, real urban environment.', bestFor: 'streetwear, evening mood' },
      { id: 'cafe_window', scene: 'Cafe storefront at night with warm interior light through window, simple outdoor table, quiet street with distant lights.', bestFor: 'casual elegant, warm mood' },
    ],
    cameras: [
      { id: 'night_portrait', camera: '50mm f/1.8, three-quarter portrait, slightly blurred background lights, natural evening look.', bestFor: 'half-body originals' },
      { id: 'street_wide', camera: '35mm f/2.8, full body on sidewalk with visible storefronts and street context.', bestFor: 'full body originals' },
      { id: 'candid_walk', camera: '85mm f/2.0, subject sharp with softly blurred street background.', bestFor: 'walking originals' },
    ],
    colorGrades: [
      { id: 'neon_cinematic', grade: 'Warm evening tones, natural streetlight colors on skin, slight warmth, real night photo quality.', bestFor: 'all skin tones, evening content' },
      { id: 'warm_tungsten', grade: 'Warm tungsten at 3200K, golden skin under streetlight, natural shadows.', bestFor: 'warm skin tones' },
      { id: 'desaturated_noir', grade: 'Slightly desaturated evening tones, natural contrast, muted colors, real street photo feel.', bestFor: 'dark outfits, moody styling' },
    ],
  },
  {
    id: 'italian_restaurant',
    label: 'Italian Restaurant Evening',
    category: 'lifestyle',
    region: 'global',
    scene: 'Restaurant with warm indoor lighting, wooden tables, candles, cozy atmosphere.',
    lighting: 'Warm overhead lights and soft candlelight, natural indoor restaurant ambiance. 3000-3500K warm.',
    camera: '35mm f/1.8, medium close-up, slightly blurred warm background.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No bright daylight, no harsh flash, no cold lighting.',
    scenes: [
      { id: 'terrace_dining', scene: 'Outdoor restaurant terrace in the evening, string lights overhead, white tablecloth, warm ambient lighting, other diners softly blurred.', bestFor: 'elegant evening wear' },
      { id: 'indoor_trattoria', scene: 'Cozy indoor restaurant with brick walls, warm lighting, candle on table, rustic wooden furniture, real restaurant interior.', bestFor: 'casual dining content' },
      { id: 'courtyard_garden', scene: 'Courtyard restaurant with stone walls, hanging plants, warm lantern light, cobblestone floor, open sky above.', bestFor: 'formal evening wear' },
    ],
    cameras: [
      { id: 'dining_close', camera: '35mm f/1.8, medium close-up, warm blurred lights behind, natural restaurant framing.', bestFor: 'close-up originals' },
      { id: 'seated_mid', camera: '50mm f/2.0, three-quarter seated with restaurant environment visible.', bestFor: 'half-body originals' },
      { id: 'entrance_full', camera: '28mm f/2.8, full body near restaurant entrance with warm glow behind.', bestFor: 'full body originals' },
    ],
    colorGrades: [
      { id: 'candlelight_warm', grade: 'Warm candlelight 3000K, golden skin, soft warm shadows, natural restaurant lighting.', bestFor: 'all skin tones' },
      { id: 'trattoria_cozy', grade: 'Cozy warm 3200K, amber tones, natural wood and brick colors, real indoor atmosphere.', bestFor: 'warm skin tones' },
      { id: 'evening_elegant', grade: 'Refined warm 3500K, gentle contrast, natural highlight roll-off, polished but real.', bestFor: 'formal styling' },
    ],
  },
  {
    id: 'urban_film_street',
    label: 'Urban Street',
    category: 'street',
    region: 'global',
    scene: 'Stone-paved street with old buildings, natural daylight, everyday urban environment.',
    lighting: 'Soft natural daylight, slightly directional from side, gentle shadows. 5000-5500K natural.',
    camera: '50mm f/2.0, eye-level medium shot, natural street photography.',
    motion: 'subtle motion',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No harsh noon sun, no overly stylized look, no artificial smoothness.',
    scenes: [
      { id: 'stone_street', scene: 'Narrow stone-paved street with old buildings, a few people walking, natural daylight, everyday urban scene.', bestFor: 'casual outfits, vintage styling' },
      { id: 'market_morning', scene: 'Morning market street with shop awnings, natural light, a few pedestrians, everyday atmosphere.', bestFor: 'casual wear, morning content' },
      { id: 'alley_golden', scene: 'Narrow alley with textured walls, afternoon sunlight coming from one side, natural warm tones, real urban environment.', bestFor: 'warm outfits, afternoon light' },
    ],
    cameras: [
      { id: 'high_angle', camera: '50mm f/2.0, slightly high angle, street context around subject.', bestFor: 'standing originals' },
      { id: 'street_level', camera: '35mm f/2.8, eye-level with slightly blurred surroundings, candid street feel.', bestFor: 'casual originals' },
      { id: 'compressed_tele', camera: '85mm f/2.0, subject sharp with softly blurred street behind.', bestFor: 'close-up originals' },
    ],
    colorGrades: [
      { id: 'nostalgic_film', grade: 'Natural daylight colors, slightly muted, warm skin, casual real-photo quality.', bestFor: 'all skin tones, everyday content' },
      { id: 'warm_analog', grade: 'Warm afternoon light 4500K, golden tones, natural warm feeling.', bestFor: 'warm skin tones' },
      { id: 'cool_documentary', grade: 'Cool natural daylight 5500K, balanced colors, straightforward natural photo quality.', bestFor: 'cool skin tones' },
    ],
  },
  {
    id: 'rooftop_evening',
    label: 'Rooftop Evening',
    category: 'lifestyle',
    region: 'global',
    scene: 'Rooftop area at sunset or dusk, city visible in background, warm string lights.',
    lighting: 'Warm string lights mixed with natural dusk sky light, soft warm tones. 3500-5000K mixed.',
    camera: '50mm f/1.8, three-quarter with softly blurred background lights.',
    motion: 'static',
    mood: 'candid',
    style: 'realism',
    negative_bias: 'No daytime bright, no harsh flash, no overly styled look.',
    scenes: [
      { id: 'bar_dusk', scene: 'Rooftop area at dusk with string lights overhead, simple furniture, city skyline visible, sky transitioning from warm to blue.', bestFor: 'evening lifestyle content' },
      { id: 'lounge_sunset', scene: 'Rooftop with low furniture, plants, last warm sunlight, long shadows, city visible below.', bestFor: 'golden hour content' },
      { id: 'party_night', scene: 'Rooftop gathering with fairy lights, people in soft focus, city lights at night, relaxed social atmosphere.', bestFor: 'party outfits' },
    ],
    cameras: [
      { id: 'cityscape_portrait', camera: '50mm f/1.8, three-quarter portrait with softly blurred city lights behind.', bestFor: 'half-body originals' },
      { id: 'wide_atmosphere', camera: '28mm f/2.8, full body with rooftop and city panorama behind.', bestFor: 'full body originals' },
      { id: 'intimate_close', camera: '85mm f/2.0, close portrait with blurred warm lights behind.', bestFor: 'close-up originals' },
    ],
    colorGrades: [
      { id: 'blue_hour', grade: 'Dusk light, deep blue sky with warm accent lights, balanced natural skin, real evening photo.', bestFor: 'all skin tones' },
      { id: 'golden_last_light', grade: 'Last golden sunlight 3500K, warm amber glow, natural warm shadows.', bestFor: 'warm skin tones' },
      { id: 'night_glamour', grade: 'Evening with soft contrast, warm highlights from string lights, natural night photo quality.', bestFor: 'evening wear' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════

export const PHOTOSHOOT_PRESETS: ScenePreset[] = [
  ...STUDIO_PRESETS,
  ...LIFESTYLE_PRESETS,
  ...OUTDOOR_PRESETS,
  ...URBAN_PRESETS,
  ...CELEBRATION_PRESETS,
  ...CASUAL_PRESETS,
  ...EXTENDED_PRESETS,
  ...CINEMATIC_PRESETS,
]

function validatePhotoshootPresetDataset(presets: ScenePreset[]): void {
  const ids = new Set<string>()
  for (const preset of presets) {
    if (!preset.id?.trim()) throw new Error('Preset dataset error: preset id is empty')
    if (ids.has(preset.id)) throw new Error(`Preset dataset error: duplicate preset id "${preset.id}"`)
    ids.add(preset.id)
    if (!preset.scene?.trim()) throw new Error(`Preset dataset error: scene missing for "${preset.id}"`)
    if (!preset.lighting?.trim()) throw new Error(`Preset dataset error: lighting missing for "${preset.id}"`)
    if (!preset.camera?.trim()) throw new Error(`Preset dataset error: camera missing for "${preset.id}"`)
    if (!preset.negative_bias?.trim()) throw new Error(`Preset dataset error: negative_bias missing for "${preset.id}"`)
    // Validate multi-variant arrays if present
    if (preset.scenes && preset.scenes.length < 2) {
      throw new Error(`Preset dataset error: scenes[] must have at least 2 variants for "${preset.id}"`)
    }
    if (preset.cameras && preset.cameras.length < 2) {
      throw new Error(`Preset dataset error: cameras[] must have at least 2 variants for "${preset.id}"`)
    }
    if (preset.colorGrades && preset.colorGrades.length < 2) {
      throw new Error(`Preset dataset error: colorGrades[] must have at least 2 color grades for "${preset.id}"`)
    }
  }
}

validatePhotoshootPresetDataset(PHOTOSHOOT_PRESETS)

export function getPhotoshootPreset(id: string): ScenePreset | undefined {
  return PHOTOSHOOT_PRESETS.find(p => p.id === id)
}

export function getPhotoshootPresetsByCategory(category: ScenePreset['category']): ScenePreset[] {
  return PHOTOSHOOT_PRESETS.filter(p => p.category === category)
}

export function getPhotoshootPresetIds(): string[] {
  return PHOTOSHOOT_PRESETS.map(p => p.id)
}
