/**
 * EXAMPLE PROMPTS REFERENCE — TRAINING & PRESET INTELLIGENCE
 *
 * Curated examples: image + prompt pairs used to:
 * - Update and tune presets (scene, lighting, vibe)
 * - Inform prompt builder so the model makes intelligent decisions (pose, framing, mood)
 * - Maintain face fidelity rules without hard-coding pose; model infers natural pose from preset + scene
 *
 * Usage: Import and use in scene intelligence, preset loader, or prompt composer
 * to align outputs with these reference aesthetics.
 */
import { getPresetById } from './index'

export interface ExamplePromptReference {
  id: string
  name: string
  /** Map to existing or new preset id in photoshoot.ts */
  presetId: string
  vibe: string
  scene: string
  lighting: string
  /** Pose is inferred by model from scene + preset; no explicit pose prompt required */
  poseNotes: string
  styleKeywords: string[]
  fullPrompt: string
  negativePrompt?: string
  aspectRatio?: string
  camera?: string
  colorGrading?: string
  /** e.g. keep face 100% identical to reference */
  faceRule?: string
}

export const EXAMPLE_PROMPTS_REFERENCE: ExamplePromptReference[] = [
  {
    id: 'gas_station_night_uk',
    name: 'Gas Station Night (England)',
    presetId: 'urban_gas_station_night',
    vibe: 'Dark, moody, cinematic night. Vibrant reflections from artificial lights on wet ground.',
    scene: 'Gas station in England at night. Wet ground reflecting colourful urban lights and signs. Black car (e.g. Golf R) as prop. Background: gas pumps, Esso/Tesco/Costa signs, canopy lights, building.',
    lighting: 'Overhead canopy lights, lit storefronts and signs. Wet surfaces create strong reflections. Dark sky, artificial light mix (warm and cool). HDR cinematic sharpness, natural night look.',
    poseNotes: 'Leaning casually against car, relaxed posture, hands in pockets or out of frame. Direct gaze or slight angle. Model infers natural stance from environment.',
    styleKeywords: ['ultra-realistic', 'cinematic night', 'HDR', 'iPhone 17 Pro Max', 'natural proportions', 'realistic textures', 'vertical 9:16', 'no filter'],
    fullPrompt: `Generate an ultra-realistic portrait and photograph of the person from the reference selfie, positioned as shown in the provided image. They are leaning against a black golf r at a gas station in England at night.
The person is wearing a black Nike tracksuit. Make the Hairs are a little bit wavy. Face accuracy 100%. The scene captures the ambiance of a gas station in england at night, with the ground appearing wet and reflecting the colorful urban lights and signs The background includes typical gas station elements and a building with signs. The image should have ultra-realistic and detailed cinematic quality, as if captured by an iPhone 17 Pro Max, with natural proportions and realistic textures.
The overall color grading should be dark and moody, reflecting the night scene, with vibrant reflections from the artificial lights.
(Style: ultra-realistic detailed hyper, 8k, cinematic night lighting, HDR cinematic sharpness, iPhone 17 Pro Max photo)

DONT CHANGE FACE. KEEP THE FACE 100% IDENTICAL TO THE REFERENCE PHOTO. Hyper-realistic iPhone RAW photo, vertical 9:16 aspect ratio.`,
    faceRule: 'Keep face 100% identical to reference.',
    aspectRatio: '9:16',
    camera: 'iPhone 17 Pro Max, vertical',
    colorGrading: 'Dark and moody, vibrant reflections from artificial lights.',
  },
  {
    id: 'european_cafe_outdoor',
    name: 'Outdoor European Café',
    presetId: 'lifestyle_cafe',
    vibe: 'Warm, confident, travel editorial. Natural sunlight, stone architecture, effortless lifestyle.',
    scene: 'Outdoor European café. Stone building, menu boards (e.g. Coctels Crepe, Pâtisserie), round white table with gold rim. Props: glass coffee, book, compact camera. Woven cane chairs. Cobblestone or paved ground.',
    lighting: 'Natural warm sunlight from the side. Realistic highlights and soft shadows on face and fabric. Balanced exposure, clean editorial tones. No harsh overexposure.',
    poseNotes: 'Seated at table, forearms on table, hands clasped or relaxed. Head slightly tilted, side-looking gaze. Sunglasses optional. Model infers relaxed café pose.',
    styleKeywords: ['candid lifestyle', 'travel editorial', 'artsy Pinterest editorial', 'natural warm sunlight', 'textured linen', 'vertical framing', 'same perspective as reference'],
    fullPrompt: `Hyper-realistic iPhone RAW photo, vertical 9:16, natural lifestyle photography, no filter, no cinematic grading, artsy Pinterest editorial aesthetic. A highly attractive young adult man with an athletic and naturally muscular build sitting casually at an outdoor European cafe table in the exact same pose as the reference image with relaxed posture natural hand gesture and side-looking gaze creating effortless confident energy. Textured cream linen-style shirt slightly open at the collar, paired with sunglasses. Outdoor café environment with stone architecture menu boards café chairs glass coffee drink on the table book and compact camera. Shot on iPhone with vertical framing, natural warm sunlight from the side creating realistic highlights and soft shadows. Ultra-realistic human skin texture, visible pores, no beauty filter. Negative: skinny body, soft physique, exaggerated bodybuilder, different pose, CGI, illustration, anime, HDR plastic skin, watermark.`,
    negativePrompt: 'skinny body soft physique exaggerated bodybuilder proportions different pose different lighting CGI look illustration anime HDR plastic skin watermark text logo',
    aspectRatio: '9:16',
    camera: 'iPhone, vertical, candid lifestyle angle',
    colorGrading: 'Natural warm, balanced exposure, clean editorial tones.',
    faceRule: 'Keep face 100% identical to reference.',
  },
  {
    id: 'mirror_selfie_bedroom_raw',
    name: 'Raw Mirror Selfie (Bedroom)',
    presetId: 'casual_mirror_selfie',
    vibe: 'Raw, intimate, unfiltered. Phone flash, dirty mirror, peace sign, nighttime selfie.',
    scene: 'Bedroom mirror selfie. Full-length mirror, slight smudges/dust on mirror. Bed with patterned sheets (e.g. Hello Kitty), closet/shelving visible. Ceiling lamp. Girly bedroom, lived-in but tidy.',
    lighting: 'Harsh direct phone flash reflected off mirror. Blown highlights on skin and fabric, hard shadows, uneven exposure, visible grain. Secondary: ceiling bedroom lamp. Raw flash photography.',
    poseNotes: 'Sitting on edge of bed, leaning slightly forward. Phone at chest height partially obscuring face. One hand in peace sign (V) near face, other holding phone. Shoulders rounded, head tilted. Model infers authentic mirror selfie pose.',
    styleKeywords: ['raw mirror selfie', 'flash photography', 'unfiltered realism', 'imperfect framing', 'accidental composition', 'dimly lit nighttime vibe'],
    fullPrompt: `A gritty handheld iPhone mirror selfie shot late at night in a girly bedroom mirror. The woman is captured via reflection, holding the phone casually at chest height, partially obscuring her Face. The mirror is slightly dirty with smudges, dust smudges adding texture and realism.
She is sitting on the edge of her Bed slightly leaned forward. Relaxed, unposed: one leg bent, other hanging naturally. Right hand raised in front of face at chin level, prominent peace sign (V). Left hand holding phone. She wears elegant black formfitting croptop, black leather miniskirt, white sneaker. Wavy hairstyle.
Lighting: harsh direct Phone flash reflected off mirror, blown highlights, hard shadows, uneven exposure, visible grain, flash glare streaks. Aesthetic: raw mirror selfie, flash photography, unfiltered realism, imperfect framing, accidental composition.`,
    aspectRatio: '9:16',
    camera: 'iPhone mirror selfie, handheld',
    colorGrading: 'Natural with strong flash contrast, muted background.',
  },
  {
    id: 'ikea_sofa_candid',
    name: 'IKEA Sofa Candid',
    presetId: 'lifestyle_living_room',
    vibe: 'Candid, spontaneous, soft daylight. Authentic textures, relaxed moment.',
    scene: 'Living room with IKEA Stockholm sofa (light grey fabric, visible weave). Large window, sheer curtains. Clean minimal décor, warm earthy tones. One accent plant.',
    lighting: 'Soft daylight filtering through nearby window. Gentle indoor ambient light. Authentic skin and fabric textures, subtle sofa fabric grain. No harsh shadows.',
    poseNotes: 'Sitting casually on sofa, relaxed posture. Natural hair flowing. Slightly tilted composition. Model infers relaxed, unaware moment.',
    styleKeywords: ['candid', 'spontaneous', 'genuine iPhone photography', 'creative framing', 'casually tilted', 'relaxed unaware moment'],
    fullPrompt: `A candid, spontaneous snapshot of a young woman sitting casually on an IKEA Stockholm sofa, wearing a lightweight pastel pink blouse and soft denim jeans. Her natural hair flows loosely, catching soft daylight filtering through a nearby window. The gentle indoor ambient light unveils authentic textures of her skin, fabric details of her blouse, and the subtle grain of the sofa fabric. The composition is casually tilted, capturing a relaxed, unaware moment with creative framing, typical of genuine iPhone photography.`,
    aspectRatio: 'portrait',
    camera: 'iPhone, candid',
    colorGrading: 'Natural, soft, pastel and muted tones.',
  },
  {
    id: 'orange_chair_indoor_travel',
    name: 'Orange Chair Indoor (Travel / Swap)',
    presetId: 'studio_cream', // or lifestyle_coworking-style; neutral indoor
    vibe: 'Clean, modern, travel photo. Sharp focus, natural colors, DSLR look.',
    scene: 'Indoor modern space. Bright orange plastic chairs (perforated backrest). Dark vertical wood panels. Light grey floor (polished concrete or tile). Minimalist seating.',
    lighting: 'Soft even illumination from recessed ceiling spotlights. Controlled, professional. Subtle reflections on wood. No harsh shadows.',
    poseNotes: 'Seated upright on chair, knees bent, feet flat. Hands clasped loosely on lap. Body angled slightly toward camera. Model infers natural seated pose.',
    styleKeywords: ['photorealistic', 'DSLR look', 'natural colors', 'sharp focus', 'travel photo', 'high quality'],
    fullPrompt: `Use the first image as the base scene and location. Keep the exact same background, camera angle, perspective, lighting, and pose of the person from image 1. Replace the person's face and head with the face from image 3. Change the clothing to match image 2 exactly. Clothes must fit naturally with realistic fabric folds and shadows. Final image: real travel photo, high quality, sharp focus, photorealistic, DSLR look, natural colors. No changes to background, no extra people, no distortion.`,
    negativePrompt: 'low quality, blurry, distorted face, wrong proportions, cartoon, anime, AI look, fake skin, extra fingers, bad hands, wrong lighting, different background, altered pose, stretched face, mismatch shadows',
    faceRule: 'Face from image 3; natural proportions, realistic skin texture, matching lighting.',
    colorGrading: 'Natural, balanced, warm wood and orange contrast.',
  },
  {
    id: 'golden_hour_bed_selfie',
    name: 'Golden Hour Bed Selfie (Blinds)',
    presetId: 'golden_hour_bedroom',
    vibe: 'Soft, daydreaming, cinematic. Striped shadows from blinds, warm golden hour.',
    scene: 'Bedroom. White or off-white linen sheets, wrinkled. Subject lying on bed. Window with horizontal blinds. Minimal background.',
    lighting: 'Soft golden hour light through window blinds casting striped shadows across face and bedding. High contrast light/shadow bands. Warm golden hue. Soft muted shadows.',
    poseNotes: 'Lying on back, looking up at camera. Head slightly tilted. Shoulders visible. Oversized hoodie. Model infers POV selfie-from-above pose.',
    styleKeywords: ['POV selfie', 'golden hour', 'striped shadows', 'film grain', 'shallow depth of field', 'cinematic tones', 'lens flare', 'minimal makeup', 'visible skin texture'],
    fullPrompt: `POV selfie taken from above, soft golden hour light streaming through window blinds casting striped shadows across the face of a 22-year-old white woman with freckles. She's lying on white linen sheets, wearing an oversized oatmeal hoodie. Her expression is soft, almost daydreaming. Minimal makeup, visible skin texture, glossy lips. Cinematic tones, lens flare, shallow depth of field, film grain aesthetic.`,
    aspectRatio: 'portrait',
    camera: 'POV from above, selfie',
    colorGrading: 'Warm golden, natural, cinematic.',
  },
  {
    id: 'minecraft_voxel_photorealistic',
    name: 'Minecraft Voxel (Photorealistic Subject)',
    presetId: 'outdoor_park', // scene is replaced by voxel; use for style ref only
    vibe: 'Mixed-media: photorealistic human in blocky environment. Pose without showing face (goggles/balaclava).',
    scene: 'Minecraft-style voxel world: blocky mountains, snow and grass blocks, blocky trees, cubic clouds, blue sky. Snowy biome.',
    lighting: 'Minecraft daylight, gentle haze, block-based shadows. Bright natural. Reflective goggles catch sky.',
    poseNotes: 'Standing in snow. Faces obscured by ski goggles and balaclava/neck gaiter. One person arms crossed; other hand at neck adjusting gear. Model infers confident outdoor pose without revealing face.',
    styleKeywords: ['mixed-media', 'photorealistic subject', 'voxel environment', 'Minecraft', 'no pixelation on person', 'blocky background'],
    fullPrompt: `High-quality cinematic Minecraft screenshot. Mixed-media: Photorealistic subject embedded in voxel-based environment. Human from reference remains completely photorealistic. No pixelation on body, clothing, or face. Background recreated in Minecraft blocks. Trees, terrain, foliage as cubic blocks. Minecraft daylight, gentle haze, block-based shadows. Maintain exact camera angle and framing from reference.`,
    faceRule: 'Faces can be obscured (goggles, balaclava) for pose-only integration.',
  },
  {
    id: 'bw_disposable_party',
    name: 'B&W Disposable Camera (House Party)',
    presetId: 'studio_gray_flash',
    vibe: 'Grainy, lo-fi, 1990s disposable camera. Dark academia bad boy. Harsh flash, high contrast.',
    scene: 'Dimly lit house party. Dark, blurred background. Vague shapes of people. Shallow depth of field.',
    lighting: 'Harsh direct frontal flash. Strong contrasts, bright highlights on skin and hair, deep shadows. Flash reflections in eyes. Film grain.',
    poseNotes: 'Chest up, body slightly angled. Head turned to camera, direct gaze. Relaxed but confident. Model infers intense eye contact, slight lean.',
    styleKeywords: ['black and white', 'disposable camera', '1990s', 'grainy', 'lo-fi', 'dark academia', 'harsh flash', 'siren eyes'],
    fullPrompt: `High-contrast black and white photo taken with a 1990s disposable camera at a dark house party. A handsome young man with dark, curly hair and a sharp jawline is staring directly into the lens. Focus on the eyes: intense, light-colored irises with a piercing, predatory gaze, slightly heavy-lidded (siren eyes), reflecting the harsh camera flash. He is wearing a black button-down shirt. The image is grainy, lo-fi, with a "dark academia" bad boy aesthetic.`,
    aspectRatio: 'portrait',
    camera: 'Disposable camera, frontal flash',
    colorGrading: 'High-contrast black and white, grainy.',
  },
  {
    id: 'car_wild_grass_editorial',
    name: 'Car in Wild Grass (Editorial)',
    presetId: 'outdoor_golden_hour', // open landscape variant
    vibe: 'Cinematic avant-garde editorial. Minimalist, timeless. Overexposed sky, wild grass.',
    scene: 'Open landscape of untamed wild grass. Black vintage two-door car, driver door open. Subject in driver seat. Overexposed white sky, expansive negative space.',
    lighting: 'Diffuse soft overcast. High-contrast yet controlled. Soft falloff, gentle highlights. Matte cinematic finish, subtle film grain. Minimal color saturation.',
    poseNotes: 'Seated low in driver seat, one hand on steering wheel, body leaning slightly forward. Head tilted downward. Other hand on thigh. Feet on grass outside car. Sunglasses. Model infers introspective, emotionally restrained pose.',
    styleKeywords: ['cinematic editorial', 'minimalist', 'fashion-forward', 'medium-format', '4K', 'ultra-high resolution', 'matte finish', 'film grain'],
    fullPrompt: `A cinematic avant-garde editorial photograph of the subject seated low inside a black car, driver seat, front door open. One hand on steering wheel, body leaning slightly forward. Head tilted downward, calm, introspective mood. Dark oversized layered clothing, wide-leg trousers, polished leather boots. Dark sunglasses. Black curly hair preserved from reference. Scene: open landscape of untamed wild grass, overexposed sky, expansive negative space. Lighting: high-contrast yet controlled, soft falloff, gentle highlights. Matte cinematic finish, subtle film grain, minimal color saturation, medium-format depth and clarity. Timeless, minimalist, fashion-forward, 4K quality.`,
    faceRule: 'Strictly preserve face from reference; sunglasses obscure eyes.',
    colorGrading: 'Matte cinematic, minimal saturation.',
  },
  {
    id: 'godfather_mafia_office',
    name: 'Godfather / Mafia Office',
    presetId: 'editorial_mafia_office',
    vibe: 'Bold editorial, luxury fashion magazine cover. Harsh flash, paparazzi-like rawness.',
    scene: 'Mafia office / study. Brown leather English-style sofa (tufted, nailhead trim). Dark wood paneling. Leather desk chair, desk. Classic opulent study.',
    lighting: 'Strong direct frontal flash. Harsh contrasts, crisp shadows, glossy highlights on skin, fabric sheen, metallic jewelry. Bold cast shadows. Raw editorial, paparazzi-like.',
    poseNotes: 'Seated on leather sofa, body angled with relaxed lean. One hand holds cigar near face. Other arm on sofa back. Symmetry and negative space. Model infers magazine-cover pose.',
    styleKeywords: ['editorial', 'magazine cover', 'luxury styling', 'flash', 'pinstripe suit', 'metallic accents', 'analog grain', 'Godfather aesthetic'],
    fullPrompt: `Mid-frame portrait, subject sitting in leather English-style sofa, body angled with relaxed lean. One hand holds a cigar near the face. Young adult male, Godfather movie style. Wardrobe: Italian mafia suit over striped shirt and patterned tie, chunky metallic jewelry (rings, bracelet). Scene: Mafia office like Godfather. Dark wood paneling, brown leather. Camera: ISO 400, f/4, 1/125 s, sharp focus. Strong direct frontal flash: harsh contrasts, crisp shadows, glossy highlights. Subtle analog grain. Moderate DoF, subject sharp, background softened. Bold editorial portrait for luxury fashion magazine cover. Color: deep burgundy, muted whites, metallic accents.`,
    colorGrading: 'Deep burgundy, muted whites, metallic accents, high contrast.',
  },
  // ─── Batch 2: Fire/horse, European bench, Igloo BMW, Subway fish-eye, Saree, Gray flash ───
  {
    id: 'fire_ring_horse_editorial',
    name: 'Fire Ring & Horse (Editorial Night)',
    presetId: 'outdoor_park',
    vibe: 'Cinematic fine art, editorial luxury. Dramatic night, high contrast, powerful symbolism.',
    scene: 'Open natural landscape at night, overgrown wild grass (green and dry brown). Minimalist metal stool. Ring of fire blazing on the ground around subject. Powerful dark horse standing directly behind, partially overlapping silhouette. Dark cinematic background.',
    lighting: 'Primary: ring of fire on ground — warm upward-casting light, orange and yellow. Strong contrast with dark background. Colored glints of fire on skin, fabric, metal stool. Night photography, shallow depth of field.',
    poseNotes: 'Seated low on metal stool, legs stretched forward, feet firmly planted. Hands clasped loosely between knees holding leather reins. Slightly slouched, shoulders relaxed, head tilted slightly downward. Sunglasses. Model infers calm, thoughtful, confident pose.',
    styleKeywords: ['cinematic', 'fine art', 'editorial luxury', 'dramatic lighting', 'high contrast', 'night photography', 'powerful symbolism', 'fashion photography', 'ultra-realism', 'medium format'],
    fullPrompt: `Contrasty artistic editorial photography of a young man based on the reference image, preserving identity. He is seated low on a minimalist metal stool in an open natural landscape overgrown with wild grass. Legs stretched forward, feet firmly planted. Dark layered clothing: structured jacket, wide trousers, rugged leather boots, dark sunglasses. Hair like the photo (black, wet, curly, chin-length). One hand rests between his knees holding thin leather reins. Posture slightly slouched, shoulders relaxed, head tilted slightly downward, calm thoughtful confident expression. A ring of fire blazes on the ground surrounding him. Directly behind him stands a powerful horse, body partially overlapping his silhouette; horse emits subtle sparks and smoldering ember effects. Scene at night, dark cinematic background, rich contrast, colored glints of fire on skin, fabric, metal. Medium format, cinematic look, shallow depth of field, dramatic lighting, editorial luxury photography, subtle textures, ultra-detailed, sharp, artistic composition, atmospheric mood. Strictly preserve face and hair from reference.`,
    faceRule: 'Strictly preserve face and hair from first attached photo; sunglasses obscure eyes.',
    aspectRatio: 'portrait',
    camera: 'Medium format, cinematic',
    colorGrading: 'Dark cinematic, fire reflections, high contrast.',
  },
  {
    id: 'european_bench_street',
    name: 'European City Bench (Lifestyle)',
    presetId: 'lifestyle_european_bench',
    vibe: 'Natural, casual, refined. Soft daylight, urban chic, lifestyle editorial.',
    scene: 'European city sidewalk. Wooden slatted bench. Light-colored stone buildings, windows, balconies with wrought-iron, ivy on walls. Paved street, crosswalk. Parked bicycle, blurred pedestrians. Small oval tray on bench.',
    lighting: 'Soft natural daylight, overcast or late afternoon. Diffused, no harsh shadows. Gentle highlights on leather and metal. Flattering even illumination.',
    poseNotes: 'Seated on bench, leaning back casually. Legs crossed at ankles, extended forward. One hand holds small ceramic cup at chest height, other on lap. Body angled slightly. Sunglasses. Model infers relaxed, confident street pose.',
    styleKeywords: ['lifestyle', 'editorial', 'natural lighting', 'urban chic', 'European', 'refined', 'ultra-realistic', 'iPhone photo'],
    fullPrompt: `Use the girl from the primary reference image as the exact and only subject. Face, hair, skin tone, body locked to first reference. Match lighting conditions and framing from the second reference image. Subject: young woman on wooden outdoor bench on European city sidewalk, stone buildings, ivy, paved street. Relaxed pose, small cup in hand. Natural daylight, soft diffused. Real amateur everyday iPhone photo, natural lighting, slight noise, subtle softness. No beauty filters, no body optimization, no studio look. Clothing and environment from second reference.`,
    faceRule: 'Face, hair, skin tone, body strictly locked to primary reference; lighting and framing from secondary reference.',
    colorGrading: 'Muted natural, earthy tones, light buildings.',
  },
  {
    id: 'igloo_bmw_crash_flash',
    name: 'Igloo BMW Crash (Flash Winter)',
    presetId: 'celebration_festive', // mood: chaotic, flash; no literal preset — use for style ref
    vibe: 'Chaotic, flash-shot, raw. Black humor, rebellious, underground fashion. Yakutian Arctic.',
    scene: 'Lived-in igloo interior. Carved ice walls, thick fur blankets, low wooden table. Thermoses, insulated bottles, packets. Snow and ice debris on floor. White BMW 5 M (2024) crashed through ice wall behind subject, shattered ice, glowing red taillights. Frozen landscape visible through opening.',
    lighting: 'Harsh direct camera flash. Freezes every detail — ice texture, fabric fibers, frost. Grainy realism, slight film grain, imperfect exposure. High contrast.',
    poseNotes: 'Seated slumped over low table. One leg bent foot on ground, other extended with foot on table. Elbow on knee, hand under chin. Relaxed, introspective despite chaos. Model infers casual slumped pose.',
    styleKeywords: ['flash photography', 'grainy film', 'dark festive chaos', 'rebellious', 'Yakut Arctic', 'igloo', 'BMW', 'underground fashion', 'raw realism'],
    fullPrompt: `A chaotic, flash-shot winter scene inside a real lived-in igloo in the Yakutian Arctic. Use attached portrait as ONLY and EXACT facial reference. No glasses, no sunglasses. Hair short or medium only as in reference. Face 100% accuracy — no changes to structure, proportions, expression, skin texture, age, identity. Main character sitting slumped over low makeshift table, fur blankets, carved ice walls, wooden objects, thermoses. Behind him white BMW 5 M 2024 crashed into icy wall, shattered ice, snow, red taillights. Oversized patterned sweater, black voluminous pants. One leg on table, elbow on knee, chin on hand. Harsh direct camera flash, grainy realism, film grain, imperfect exposure. Ironic, festive, cultural contrast, cinematic chaos, underground fashion shoot. Face unchanged 100%.`,
    faceRule: 'Face 100% identical to reference; no glasses; hair length as reference.',
    colorGrading: 'Cool whites and blues of snow/ice, dark clothing, red taillights.',
  },
  {
    id: 'subway_fisheye_streetwear',
    name: 'Subway / Underpass Fish-Eye (Streetwear)',
    presetId: 'street_subway_fisheye',
    vibe: 'Gritty urban, streetwear chic. Low-angle fish-eye, fluorescent light, graffiti.',
    scene: 'Underground or subway passage. Concrete stairs, tiled walls covered in black graffiti. Metal handrail. Dark curved ceiling. Urban, raw.',
    lighting: 'Bright overhead rectangular fluorescent fixtures. Harsh industrial illumination. Sharp contrasts, deep shadows under stairs. Cool or neutral white. Reflections on lens distortion.',
    poseNotes: 'Seated on concrete stairs, leaning slightly back. One leg bent foot on step, other extended down. One hand on lap holding drawstring; other hand raised with index finger to lips (shush gesture). Sunglasses. Model infers confident, playful urban pose.',
    styleKeywords: ['fish-eye', 'streetwear', 'graffiti', 'urban', 'low-angle', 'fluorescent', 'gritty', 'New Balance', 'editorial'],
    fullPrompt: `Low-angle wide-angle portrait with prominent fish-eye lens effect. Young woman seated on concrete stairs in underground/subway passage. Graffiti-covered tiled walls, metal handrail, fluorescent overhead lights. Athletic streetwear: two-tone track jacket, matching pants, New Balance 530s. Right hand raised with index finger to lips (shush gesture). Dark sunglasses. Strong barrel distortion, curved edges. Harsh overhead fluorescent, sharp contrasts, deep shadows. Streetwear chic, gritty urban, stylized photographic approach.`,
    faceRule: 'Sunglasses and hand gesture obscure full face; identity from reference.',
    camera: 'Wide-angle fish-eye, low angle',
    colorGrading: 'Cool neutral, fluorescent white, dark tones.',
  },
  {
    id: 'yellow_saree_editorial',
    name: 'Yellow Saree (Dramatic Wall)',
    presetId: 'studio_editorial',
    vibe: 'Grainy yet bright. 90s movie baddie, windy romantic. Deep shadows, dramatic contrast, mystery.',
    scene: 'Solid white wall as backdrop. Minimalist. Subject standing against wall. No other props.',
    lighting: 'Strong directional light from upper left. Dramatic high-contrast shadows. Diagonal shadow on wall. Bright highlights on face, skin, saree sheen. Deep shadows define body and fabric folds. Natural or studio mimicking sunlight.',
    poseNotes: 'Standing, relaxed yet elegant. Facing slightly left, head turned to camera. One hand resting on saree folds near waist. Legs planted. Long braid with gajra over shoulder. Model infers confident, calm editorial pose.',
    styleKeywords: ['saree', 'sunflower print', 'retro', 'Pinterest aesthetic', 'deep neck', 'dramatic shadows', '90s movie', 'gajra', 'braid', 'editorial'],
    fullPrompt: `Grainy yet bright, based on reference. Woman draped in perfect yellow saree with sleeveless blouse (transparent), deep neck Pinterest-style aesthetic retro saree, sunflower print on saree. Vibe: 90s movie brown-haired baddie, beautiful long thick braid to waist with gajra, windy romantic atmosphere. She stands against a solid white wall. Deep shadows and dramatic contrasts add mystery. Chest naturally large, not padded bra. Face and identity from reference.`,
    faceRule: 'Face 100% from reference; natural skin texture, no beautification.',
    colorGrading: 'Natural warm, yellow prominent, bright and shadowed.',
  },
  {
    id: 'gray_backdrop_flash_portrait',
    name: 'Gray Backdrop Flash (Editorial Portrait)',
    presetId: 'studio_editorial',
    vibe: 'Cinematic fashion editorial, retro flash energy. Raw vintage analog grain, detached confidence.',
    scene: 'Studio. Smooth gray gradient backdrop, minimal, distraction-free. No props.',
    lighting: 'Strong frontal flash as key. Sharp specular highlights on sunglasses, slight glare bloom. Defined shadows under chin, suit folds, softened on backdrop. Subtle rim light on edges. Heavy vintage analog film grain.',
    poseNotes: 'Medium close-up, chest upward. Arms crossed over chest, facing forward with slight tilt. Head tilted slightly. Confident editorial posture. Model infers still, detached confidence.',
    styleKeywords: ['editorial', 'high-fashion', 'vintage', 'film grain', 'direct flash', 'red sunglasses', '90s editorial', 'shallow DoF'],
    fullPrompt: `SHOT: Medium close-up portrait, chest upward, arms crossed, facing forward with slight tilt. ISO 400, f/4, 1/125 s, clean exposure, shallow depth of field. Heavy vintage analog grain, 90s editorial. Direct flash — sharp specular highlight on sunglasses, glare bloom. LENS: Crisp optics, soft vignette. Lens flare sparkle from flash on sunglasses. Shallow DoF, subject sharp, background neutral gradient. SUBJECT: Young adult male, average build, confident editorial posture, arms folded. Wardrobe: Oversized black suit jacket with padded shoulders, crisp white shirt, black tie, rectangular red-tinted sunglasses. SCENE: Studio, smooth gray gradient backdrop. CINEMATOGRAPHY: Strong frontal flash, subtle rim. Cinematic fashion editorial with retro flash energy. Shadows defined under chin and suit folds. STYLE: Editorial high-fashion portrait, vintage camera realism. Color: deep black suit, white shirt, muted gray backdrop, red sunglasses tint. Heavy grain overlay, analog softness, flash highlights, cinematic grit.`,
    faceRule: 'Face preserved from reference; focus on facial details, skin texture, costume texture.',
    aspectRatio: 'portrait',
    camera: 'ISO 400, f/4, 1/125 s, shallow DoF',
    colorGrading: 'Deep black, white shirt, muted gray, red tint on sunglasses.',
  },
  // ─── Batch 3: Beam portrait, B&W fish-eye, alternative model, sky fall, Wassily meta, orange leap, BeReal Minecraft, meta-selfie phone, snow angel, waterfront, McDonald's BMW, futuristic white ───
  {
    id: 'vertical_beam_studio_portrait',
    name: 'Vertical Beam Studio (Face Bisected)',
    presetId: 'studio_editorial',
    vibe: 'Solitary, geometric, contemplative. Helmut Newton shadow studies meets Noell Oszvald.',
    scene: 'Minimal studio, neutral gray seamless backdrop. Narrow vertical spotlight strip as only light.',
    lighting: 'Single harsh narrow vertical beam from front-left, bisecting face. One side bright, one side deep shadow. Artificial light carving through facial planes. Neutral cinematic grading, restrained contrast, natural skin tones.',
    poseNotes: 'Head-on, facing camera. One shoulder slightly raised, forearm across body. Direct calm gaze. Model infers still, contemplative pose.',
    styleKeywords: ['full-frame DSLR', '8K', 'editorial', 'theatrical light', 'facial architecture', 'hyper-minimalist', 'golden section', '50mm f/2'],
    fullPrompt: `Full-frame DSLR portrait, 8K. Japanese male model, hair exactly as reference, emerging from darkness, face bisected by harsh vertical beam, one eye perfectly illuminated. Delicate tattoos, nose ring, earrings. Minimal studio, neutral gray background, narrow vertical spotlight strip. Head-on 50mm f/2. Golden section composition, vertical slash of light as dominant element. Neutral cinematic grading, natural skin tones. Artificial light carving through facial planes. Extreme skin realism, visible pores, fine facial hair, natural imperfections, sharp eyelash and eyebrow detail. Solitary, geometric, contemplative. Helmut Newton shadow studies meets Noell Oszvald. Hyper-minimalist, theatrical light cutting, 8K clarity.`,
    faceRule: 'Face 100% from reference; preserve tattoos, nose ring, earrings.',
    camera: '50mm f/2, head-on',
    colorGrading: 'Neutral cinematic, restrained contrast.',
  },
  {
    id: 'bw_fisheye_night_street',
    name: 'B&W Fish-Eye Night Street',
    presetId: 'street_subway_fisheye',
    vibe: 'Moody, gritty, 90s editorial. High contrast, circular distortion.',
    scene: 'Urban street at night, East Asian city. Neon signs (East Asian characters), multi-story buildings, storefronts. Dark ground, subtle reflections.',
    lighting: 'Dramatic artificial night lighting. Very bright overexposed streetlamp behind subject, strong highlight on hair and shoulder. Neon signs provide ambient fill. High contrast B&W.',
    poseNotes: 'Standing, body angled slightly left, head turned to camera. Hands clasped below waist, obscured by oversized sleeves. Shoulders slightly rounded. Model infers calm, introspective street pose.',
    styleKeywords: ['black and white', 'fish-eye', 'wide angle', '90s', 'neon', 'night', 'editorial', 'film grain', 'high contrast'],
    fullPrompt: `Japanese model, black and white, high contrast, very strong flash like 90s analog photo. Wide angle. Urban night, neon signs, circular fisheye frame. Standing, hands clasped, oversized blazer. Moody, gritty, cinematic.`,
    faceRule: 'Face from reference; B&W preserves identity in stylized form.',
    camera: 'Wide angle / fish-eye',
    colorGrading: 'Black and white, high contrast, film grain.',
  },
  {
    id: 'alternative_model_pink_hair_studio',
    name: 'Alternative Model (Pink Hair, Studio)',
    presetId: 'studio_editorial',
    vibe: 'High fashion streetwear editorial. Alternative model, confident, dark studio.',
    scene: 'Dark studio. Muted gray textured backdrop (canvas or concrete). Minimal, subject isolated.',
    lighting: 'Hard directional side light. Deep contrast shadows. Direct studio flash, defined shadows and highlights. Slight vignette, center brighter.',
    poseNotes: 'Standing facing camera, shoulders relaxed, hands loose by sides. Slightly low angle. Confident posture. Model infers strong, centered stance.',
    styleKeywords: ['alternative model', 'short pink hair', 'facial tattoos', 'round glasses', 'oversized black t-shirt', '85mm', 'premium campaign', 'cinematic lighting'],
    fullPrompt: `High fashion streetwear editorial, alternative model with short pink hair, facial tattoos, round amber glasses, oversized black t-shirt (graphic). Centered composition, strong confident posture, camera slightly low angle, dark studio background, hard directional side light, deep contrast shadows, cinematic lighting, sharp fabric texture, 85mm lens, premium brand campaign, ultra detailed. Face and hair exactly as reference.`,
    faceRule: 'Hair, facial tattoos, nose ring, earrings exactly as reference.',
    camera: '85mm, slightly low angle',
    colorGrading: 'Deep contrast, dark backdrop.',
  },
  {
    id: 'sky_falling_moroccan_planes',
    name: 'Sky Falling (Moroccan Planes)',
    presetId: 'outdoor_park',
    vibe: 'Cinematic, dreamlike. Sunset sky, floating, full body.',
    scene: 'Very high in sky. Soft pinkish-orange sunset sky. Layer of white/pink clouds below. Small propeller planes with Moroccan flags on tails, rotating in background.',
    lighting: 'Soft warm golden hour from implied horizon. No harsh shadows. Gentle highlights on skin, clothing, clouds. Slightly blurred background, dramatic depth of field.',
    poseNotes: 'Horizontal, lying on back as if falling backward. Arms bent and raised, one hand open. Legs extended, slightly bent. Face calm, profile or three-quarter. Model infers floating/falling pose.',
    styleKeywords: ['cinematic', 'sunset', 'full body', 'floating', 'Gucci', 'linen', '4K', 'depth of field', 'eye level'],
    fullPrompt: `Generate man from reference. Location: very high in sky, soft pinkish-orange sunset. Small planes with Moroccan flag on tail rotating in background. Man in horizontal position, effect of falling backward, face calm and relaxed. Same outfit as reference: wide-fit white linen pants, Gucci crossbody with keychain and Volkswagen car key floating, silver Gucci necklace floating, metal bracelet. Frame at human eye level, full body. Cinematic, slightly blurred background, dramatic DoF, beautiful color correction, soft lighting, ultra-realistic, 4K.`,
    faceRule: 'Face and outfit from reference; preserve identity.',
    aspectRatio: 'full body',
    camera: 'Eye level, full body',
    colorGrading: 'Soft warm sunset, cinematic.',
  },
  {
    id: 'wassily_chair_meta_phones',
    name: 'Wassily Chair Meta-Selfie (Four Phones)',
    presetId: 'studio_white',
    vibe: 'High-fashion editorial, Agent/Matrix. Hyper-stylized, recursive meta.',
    scene: 'Indoor studio. Seamless stark white backdrop. Modern black leather and chrome chair (Wassily/LC1 style).',
    lighting: 'High-key, bright diffuse main light slightly above and forward. Strong contrast between black suit and white background. Subtle rim on hair and shoulders. Minimal shadows.',
    poseNotes: 'Seated in chair, legs crossed at knee. One hand on lap, other raised holding thin wooden stick between lips. Four hands (others) holding smartphones pointed at subject; screens show live preview of her. Model infers composed, enigmatic pose.',
    styleKeywords: ['meta-selfie', 'Wassily chair', 'mirrored visor', 'wet hair', 'high-key', 'Agent Matrix', 'smartphone preview', 'editorial'],
    fullPrompt: `High-fashion editorial. Subject seated in modern black leather and chrome chair (Wassily). Futuristic mirrored visor sunglasses, middle-parted slicked wet-look hair. Holds thin wooden stick between lips. Four different hands surrounding her, each holding smartphone pointed at her; screens display live camera preview of her face. Oversized black suit, white shirt, black tie. Stark white backdrop. High-key studio, bright diffuse light. Monochromatic with red lip, gold earrings. Medium close-up, slightly low angle. Simulated iPhone 15 snapshot quality, soft low-contrast finish, subtle grain.`,
    faceRule: 'Use person from input portrait; outfit from reference.',
    camera: '35–50mm equivalent, slightly low',
    colorGrading: 'High-key, monochrome + red lip.',
  },
  {
    id: 'orange_background_leap',
    name: 'Orange Background Leap',
    presetId: 'studio_editorial',
    vibe: 'High-energy, joyful. Solid color backdrop, dynamic pose.',
    scene: 'Studio. Seamless vivid solid orange background. No other elements.',
    lighting: 'Bright even studio light. Soft shadow beneath subject reinforcing airborne look. Full illumination.',
    poseNotes: 'Mid-leap, full body. One leg extended forward-down, other bent behind. Arms outstretched and raised. One hand holds tablet (screen away from camera), other open. Joyful expression. Model infers expansive, energetic jump.',
    styleKeywords: ['full body', 'mid-leap', 'solid orange', 'tablet', 'editorial', 'joyful', 'studio'],
    fullPrompt: `Based on reference posture: young Black Beninese woman, no mustache, wearing green shirt, white pants, white sneakers, tablet in one hand and other hand raised (no large headphones). Maintain exact posture of reference image — mid-leap, arms raised, joyful expression. Seamless orange background. Face and identity as specified.`,
    faceRule: 'Identity: Black Beninese woman; posture from reference.',
    colorGrading: 'Vivid orange, clean contrast.',
  },
  {
    id: 'bereal_minecraft_miami_duo',
    name: 'BeReal Minecraft Duo (Miami)',
    presetId: 'casual_street_candid',
    vibe: 'BeReal meets Digital Glitch. Spontaneous, ironic, identical poses.',
    scene: 'Miami/Wynwood style. Pastel pink wall with abstract graffiti (blue, purple geometric). Concrete sidewalk. Vintage pastel car blurred in background. Utility box on wall.',
    lighting: 'Bright sunny day, almost shadowless. Even light, slight haze or reflection from light buildings. Emphasizes mundane moment and texture (skin, concrete, pixelated character).',
    poseNotes: 'Two subjects: (1) Young man, standing slightly hunched, head down, both hands at waist adjusting shorts, thumbs in waistband. (2) Minecraft pixelated character in identical pose beside him. Same posture, mirror copy. Model infers casual caught-between-moments pose.',
    styleKeywords: ['BeReal', 'digital glitch', 'Minecraft', 'Miami', 'graffiti', 'identical pose', 'lifestyle', 'iPhone 16 Pro'],
    fullPrompt: `Lifestyle_image, digital_art. Young guy (ref) + Minecraft pixelated double, same pose: standing, slightly hunched, head down, hands on waist adjusting shorts. Miami street, pink graffiti wall, bright sunny day. BeReal spontaneity, perfect mirroring between real and pixel double. Avoid: dramatic shadows, dark background, portrait blur, HDR, different poses. iPhone 16 Pro wide, natural sun, typical iPhone processing.`,
    faceRule: 'Human subject from reference; Minecraft double mirrors pose only (pose without giving away face for pixel character).',
    colorGrading: 'Miami bright, pastels, natural saturation.',
  },
  {
    id: 'meta_selfie_phone_golden_hour',
    name: 'Meta-Selfie (Face Behind Phone)',
    presetId: 'casual_street_candid',
    vibe: 'Casual snapshot, Accidental Renaissance. Face hidden; identity on screen.',
    scene: 'Urban sidewalk, European-style, golden hour. Red brick wall strongly lit. Darker buildings and sky above.',
    lighting: 'Strong golden hour sunlight, very warm. Brick wall intensely lit orange/red. Hand, phone, foreground with softer natural shadows. Mild flare from low-angle sun.',
    poseNotes: 'Person holding smartphone horizontally, face completely hidden behind phone. Screen facing viewer shows selfie: same person, head tilted, kiss/pout expression, finger near chin. Arm extended toward camera. Model infers influencer documentation pose; real-world face never shown.',
    styleKeywords: ['meta-selfie', '0.5x ultra-wide', 'rear camera selfie', 'golden hour', 'face hidden', 'recursive', 'iPhone'],
    fullPrompt: `Meta-selfie outdoors at golden hour. Person holding smartphone horizontally; real face completely hidden behind phone. Screen facing viewer shows live rear-camera selfie preview: same person, head tilted, soft kiss/pout, fingers near chin, black NY Yankees cap, fur-collar jacket. 0.5x ultra-wide rear camera selfie. Background on screen: urban street, red brick wall. Real-world background: same red brick wall, warm light. Shallow DoF, phone screen sharp. Warm grading, soft contrast, minimal sharpening. Casual snapshot, influencer documentation.`,
    faceRule: 'Real-world face hidden; identity visible only on phone screen.',
    camera: 'Simulated iPhone 15, 0.5x ultra-wide',
    colorGrading: 'Warm golden hour, boosted reds and yellows.',
  },
  {
    id: 'snow_angel_fur_coat_flash',
    name: 'Snow Angel (Fur Coat Flash)',
    presetId: 'outdoor_park',
    vibe: 'Colorful glam early-2000s snapshot. Low-res grainy, candid.',
    scene: 'Outdoor winter. Pristine white snow, mounds and depressions. Vast snowy landscape, background blurred. Night or dim ambient, flash-lit.',
    lighting: 'Direct camera flash. Strong highlights, defined shadows. Multi-colored sparkles (red, green, blue, orange, yellow) scattered on snow. Slight tungsten wash. Low-res, grainy, JPEG artifacts.',
    poseNotes: 'Lying on back, arms and legs spread (snow angel). Head slightly tilted, relaxed smile, eyes down. Coat splayed open. Mittens on snow. Model infers spontaneous snow pose.',
    styleKeywords: ['snow', 'fur coat', 'flash', 'early-2000s', 'grainy', 'low-res', 'Ugg boots', 'candid', 'colorful glam'],
    fullPrompt: `Sprawled full-length on freshly fallen snow. Oversized men's fur coat (tan/beige and dark striped), light-colored Ugg-style boots, light-wash jeans tucked in, fuzzy mittens. Direct flash, frosty backdrop, colorful sparkles on snow. Hair softly textured, head natural, relaxed pose. Low-resolution, grainy, subtle pixelation, soft JPEG artifacts. Slight tilt, cropped edges, candid street scene. Artificial tungsten lighting, colorful washes and sparkles. Colorful glam early-2000s snapshot, grainy low-res nostalgia.`,
    faceRule: 'Identity from reference; preserve expression and hair.',
    colorGrading: 'Tungsten wash, colorful sparkles, nostalgic.',
  },
  {
    id: 'waterfront_railing_braids',
    name: 'Waterfront Railing (Braids)',
    presetId: 'outdoor_golden_hour',
    vibe: 'Relaxed, serene, vacation. Soft daylight, confident ease.',
    scene: 'Sandy ground or path by calm water. Dark metal railing. Calm sea, distant green hills with white buildings. Light blue partly cloudy sky.',
    lighting: 'Soft natural daylight, early morning or late afternoon. Even, subtle highlights on skin and clothing, soft shadows. Clear and natural.',
    poseNotes: 'Standing leaning against railing. One forearm on railing, other hand in pants pocket. Legs crossed at ankles. Body angled slightly. Direct gaze. Model infers relaxed, confident waterfront pose.',
    styleKeywords: ['waterfront', 'braids', 'cornrows', 'striped shirt', 'soft daylight', 'editorial', 'luxury streetwear', '85mm'],
    fullPrompt: `Ultra-realistic influencer portrait. Tall athletic man, oval face, sharp bone structure, medium brown skin, warm undertones, natural texture. Cornrows pulled back neatly. Calm confident expression. Fashion-forward luxury streetwear: oversized structured silhouettes, bold textures, wide trousers. Deep blacks, earthy browns, statement colors. Watch, bracelets, rings, chain necklace. Editorial campaign look, confident posture, natural masculine elegance. Cinematic lighting, soft shadows, high contrast, shallow DoF, 85mm, ultra-detailed, 8K. Standing by waterfront railing, relaxed pose.`,
    faceRule: 'Face 100% from reference; preserve braids, jewelry, tattoos.',
    camera: '85mm, editorial',
    colorGrading: 'Natural, cinematic, premium.',
  },
  {
    id: 'mcdonalds_bmw_night',
    name: 'McDonald\'s BMW (Night Parking Lot)',
    presetId: 'street_mcdonalds_bmw_night',
    vibe: 'Luxury street lifestyle, mafia aesthetic. Luxury + fast food contrast.',
    scene: 'Nighttime urban fast-food parking lot. Brightly lit McDonald\'s in background (glowing sign, yellow arches). Street lamps. Dark asphalt. White BMW M5 Competition (G80) front-facing, hood as seating.',
    lighting: 'Cinematic night. Street lamps warm yellowish. McDonald\'s building bright. Soft rim on shoulders and hair, gentle highlights on face. Natural shadows under chin, around eyes. No overexposure.',
    poseNotes: 'Sitting casually on hood of BMW. One leg stretched on hood, other foot on ground. One hand holding burger (mid-bite), other holding McDonald\'s cup with straw. Relaxed, confident, slightly dominant. Model infers candid luxury-street pose.',
    styleKeywords: ['McDonald\'s', 'BMW M5', 'night', 'cinematic', 'luxury street', 'mafia aesthetic', '8K', 'photorealistic'],
    fullPrompt: `Ultra-realistic cinematic night photo. Use uploaded photo as main subject; face 100% identical, no beautification, no AI smoothing. Scene: night urban fast-food parking lot, brightly lit McDonald's, yellow arches, street lamps. Subject sitting on hood of white BMW M5 Competition (G80), black suit, relaxed confident pose. One hand burger (mid-bite), other McDonald's cup with straw. On hood: McDonald's bags, fries, boxes. Cinematic night lighting, street-lamp illumination, soft rim, natural shadows. DSLR/cinema 35mm, shallow DoF, subject sharp, background soft. Luxury street lifestyle, rich but hungry, ironic, mafia aesthetic. 8K, photorealistic, no cartoon, no artifacts.`,
    negativePrompt: 'cartoon, anime, illustration, low quality, blurry, changed face, plastic skin, distorted hands, extra fingers, deformed body, wrong car model, logos broken',
    faceRule: 'Face 100% identical to upload; no beautification.',
    camera: '35mm, shallow DoF',
    colorGrading: 'Dark moody night, vibrant artificial lights.',
  },
  {
    id: 'futuristic_streetwear_white_studio',
    name: 'Futuristic Streetwear (White Studio)',
    presetId: 'studio_white',
    vibe: 'Cyberpunk minimalism, Y2K, high-fashion runway. Sleek, rebellious.',
    scene: 'Studio. Crisp seamless bright white background. Small portion of white floor in frame.',
    lighting: 'Bright even diffuse studio. Minimal harsh shadows. Subtle highlights on metallic accessories. Strong contrast between dark attire and white backdrop.',
    poseNotes: 'Full body, standing. Body slightly angled right, head and gaze straight forward. Shoulders relaxed, arms loose by sides. Confident, composed. Model infers dynamic yet composed editorial stance.',
    styleKeywords: ['futuristic', 'streetwear', 'cyberpunk', 'Y2K', 'asymmetrical zipper', 'silver metallic', 'visor sunglasses', 'full body', 'white backdrop'],
    fullPrompt: `Futuristic fashion editorial full-body portrait. Young adult slim female, Caucasian, direct eye contact, head slightly tilted but front-facing. Relaxed confident posture, shoulders natural, arms by sides. Oversized black T-shirt with asymmetrical silver zipper, wide cargo black skirt, bold silver belt buckle. Metallic silver futuristic sunglasses, layered earrings. Full-length shot, head to toe with floor in frame. Body slightly angled for silhouette; face centered and fully visible. Monochrome black with silver accents on crisp white background. Avant-garde streetwear fused with Y2K cyberpunk.`,
    faceRule: 'Subject from reference; outfit and styling as described.',
    camera: 'Full body, centered',
    colorGrading: 'Monochrome black and silver on white.',
  },
  // ─── Batch 4: YouTube influencer, airport traveler, patio cafe, crimson neo-noir ───
  {
    id: 'youtube_influencer_studio',
    name: 'YouTube Influencer (Studio Portrait)',
    presetId: 'studio_cream',
    vibe: 'Lifestyle YouTube creator. Friendly, approachable, vlog-ready. Professional but casual.',
    scene: 'Studio. Clean blue or neutral background. Minimal, distraction-free. Optional: dark gray paneled door for smart-casual variant.',
    lighting: 'Cinematic YouTube lighting. Soft key light with subtle rim light. Professional studio look. Even, flattering. Shallow depth of field.',
    poseNotes: 'Standing, arms crossed over chest, hands subtly tucked under biceps. Facing camera directly. Confident, relaxed posture. Model infers approachable creator pose.',
    styleKeywords: ['YouTube', 'influencer', 'vlog-ready', 'DSLR', '8K', 'content creator', 'lifestyle', 'soft key', 'rim light', 'shallow DoF'],
    fullPrompt: `Ultra-realistic male AI influencer, early 20s, sharp masculine facial structure, strong jawline, smooth natural skin texture, short dark brown hair styled upward with volume, thick defined eyebrows, hazel eyes, confident calm expression, clean-shaven. Lifestyle YouTube creator aesthetic, casual modern outfit (neutral t-shirt or light jacket). Relaxed confident posture, friendly approachable vibe. Cinematic YouTube lighting, soft key with subtle rim, professional studio look, shallow depth of field, clean blue or neutral background. DSLR quality, 8K, hyper-realistic details, natural skin imperfections, high dynamic range, modern content creator style, vlog-ready portrait, premium influencer branding.`,
    faceRule: 'Face and identity from reference; no beautification.',
    camera: 'DSLR, shallow DoF',
    colorGrading: 'Clean, natural, premium.',
  },
  {
    id: 'airport_terminal_rimowa',
    name: 'Airport Terminal (Rimowa Traveler)',
    presetId: 'lifestyle_airport_terminal',
    vibe: 'Naturalistic, candid travel. Sporty-chic, unposed, iPhone quality.',
    scene: 'Modern airport terminal or jet bridge. Expansive floor-to-ceiling glass walls. Tarmac visible: ground vehicles, runway markings, jet bridges. Cylindrical silver column, waist-height railing. Dark grey speckled carpet. Polished metal and glass.',
    lighting: 'Muted natural daylight through large windows. Overcast bright sky, diffused light. Subtle shadows on clothing, skin, hair. Suitcase surface softly reflects ambient light.',
    poseNotes: 'Standing, relaxed, leaning slightly forward. One hand on extended Rimowa handle, other arm loose at side. Body angled slightly toward windows. Gaze down or to side. Model infers spontaneous travel moment.',
    styleKeywords: ['airport', 'travel', 'Rimowa', 'candid', 'iPhone', 'sporty-chic', 'naturalistic', 'layered outfit'],
    fullPrompt: `A young traveler with soft shoulder-length chestnut hair wears slightly oversized olive-green windbreaker layered over heather gray hoodie, relaxed navy joggers, white Adidas sneakers — casual sporty-chic. Standing casually near expansive glass walls of a bustling airport terminal, holding handle of sleek silver Rimowa aluminum suitcase, metallic surface softly reflecting ambient light. Muted natural daylight through large windows, subtle shadows enhancing textures of clothing, skin, hair. Captured spontaneously, mid-shot with gentle tilt and off-center composition, unposed authentic moment of travel anticipation. Modern industrial architecture, polished metal and glass. Natural color palette slightly muted. High-quality iPhone photography in airport environments.`,
    faceRule: 'Subject from input portrait; outfit and luggage as described.',
    camera: 'iPhone, mid-shot, slight tilt',
    colorGrading: 'Natural, slightly muted, candid.',
  },
  {
    id: 'outdoor_patio_green_noodles',
    name: 'Outdoor Patio (Green Noodles / Influencer)',
    presetId: 'lifestyle_tropical_patio',
    vibe: 'Accidental Renaissance, casual snapshot. Lush tropical patio, influencer aesthetic.',
    scene: 'Upscale outdoor restaurant or resort patio. White marble-patterned table. Large dark green patio umbrella. Lush tropical greenery, palms, large leaves. White geometric lattice wall through plants. Plush tan booth seating. Props: large white bowl (green noodles/salad), small plate with chopsticks, designer handbag (e.g. Gucci Dionysus), rounded water glass.',
    lighting: 'High contrast mixed natural light. Subject and table shaded by umbrella — deep shadows, low contrast on face and table. Background foliage brightly sunlit, strong separation, rim on leaves. Shallow DoF, bokeh on greenery.',
    poseNotes: 'Seated, leaning slightly forward, arms on table. One hand holds sunglasses near mouth/chin; other on table showing stacked jewelry. Gaze slightly to side. Relaxed, unposed. Model infers candid dining moment.',
    styleKeywords: ['outdoor cafe', 'tropical', 'umbrella', 'Accidental Renaissance', 'iPhone 15', 'shallow DoF', 'influencer', 'stacked jewelry'],
    fullPrompt: `Influencer_generation. Use person from input portrait. Scene: relaxed candid moment at upscale lush outdoor restaurant patio. Subject seated on plush tan booth behind white table. Foreground: large white bowl with green noodle/salad dish, small plate with chopsticks, designer handbag (patterned canvas and leather), rounded water glass. Subject holding sunglasses near face, looking slightly to side. Style: Accidental Renaissance, casual snapshot, influencer aesthetic. Lighting: subject shaded by large dark green patio umbrella (deep shadows, low contrast); background foliage brightly sunlit, rim on leaves. Color: natural greens and browns, warm tan, bright white. Texture: soft focus, natural grain, cotton shirt, glossy leaves. Slightly high angle, medium close-up, shallow DoF. iPhone 15, softened contrast, natural grain, no aggressive sharpening. Outfit from reference (oversized white button-down, khaki cap, stacked gold bracelets, earrings).`,
    faceRule: 'Use exact outfit from input reference; subject from input portrait.',
    camera: 'iPhone 15, 35–50mm equivalent',
    colorGrading: 'Natural greens and browns, warm tan, bright white.',
  },
  {
    id: 'crimson_neo_noir_portrait',
    name: 'Crimson Neo-Noir Portrait',
    presetId: 'studio_crimson_noir',
    vibe: 'Cinematic neo-noir. Introspective, powerful, silent authority. Low-key, dramatic.',
    scene: 'Studio. Solid deep crimson red (or maroon) monochromatic background. Smooth, out of focus. No other elements.',
    lighting: 'Low-key cinematic. Strong dramatic side light from slightly below. Subtle rim light outlining jawline, beard, and glasses. High contrast, deep shadows. No soft beauty lighting.',
    poseNotes: 'Upper body angled slightly. One forearm visible resting on surface or leg. Relaxed shoulders, casual yet composed. Head tilted slightly up and to side. Sunglasses (e.g. Ray-Ban Wayfarer). Model infers introspective, powerful pose.',
    styleKeywords: ['neo-noir', 'crimson', 'low-key', 'dramatic side light', 'rim light', 'editorial', 'cinematic', 'hyper-realistic skin', 'no stylization'],
    fullPrompt: `Use provided reference as main identity source. Recreate subject EXACTLY: same face structure, proportions, beard, hairstyle, age, ethnicity. Do NOT alter identity, beautify, or stylize. Cinematic neo-noir portrait: strong deep crimson red monochromatic background, low-key cinematic lighting, dramatic side light from slightly below, subtle rim light outlining jawline beard and glasses, high contrast deep shadows. Hyper-realistic skin texture, visible pores and beard detail. Dark navy/blue-black jacket with matte fabric (or light beige ribbed sweater per ref). Introspective, powerful, silent authority mood. Slightly low-angle portrait, close-up or medium close-up, shallow DoF, subject clearly separated from background, editorial cinematic framing. Ultra high detail, sharp focus on face, clean background. No blur artifacts, distortion, cartoon, illustration, painterly look, soft beauty lighting, wide angle distortion, smiling, exaggerated expressions. Do NOT change face, eyes, nose, jaw. Photorealistic, cinematic, professional.`,
    negativePrompt: 'No stylization, no anime, no CGI, no painterly look, no soft beauty lighting, no wide angle distortion, no smiling, no exaggerated expressions',
    faceRule: 'Face 100% identical to reference; do NOT change face, eyes, nose, jaw. No beautification.',
    camera: 'Slightly low angle, close-up/medium close-up, shallow DoF',
    colorGrading: 'Deep crimson background, high contrast, rich moody.',
  },
  {
    id: 'kerala_theyyam_gtr_drone',
    name: 'Kerala Theyyam + GT-R Aerial',
    presetId: 'outdoor_kerala_theyyam_gtr',
    vibe: 'Powerful cultural fusion in humid monsoon atmosphere, calm but dramatic.',
    scene: 'Traditional Kerala tiled ancestral house centered in frame, dense tropical greenery and coconut trees, slightly wet mud driveway, matte black Nissan GT-R R34 widebody parked in front, Theyyam performer in vibrant red costume beside the car.',
    lighting: 'Soft overcast monsoon daylight with diffused shadows, subtle mist between trees, warm headlight beams reflecting on damp ground and volumetric humidity.',
    poseNotes: 'Static environmental composition; vehicle and performer positioned using rule of thirds to keep heritage house dominant.',
    styleKeywords: ['aerial drone', 'kerala', 'theyyam', 'monsoon', 'wet ground reflections', 'cinematic realism', 'global illumination', 'ultra detailed'],
    fullPrompt: `Ultra-photorealistic cinematic aerial image at about 45-degree drone angle. Traditional Kerala ancestral tiled house surrounded by dense tropical greenery and humid monsoon air. Slightly wet mud driveway in front with matte black Nissan GT-R R34 widebody parked aggressively. Headlights ON with warm realistic beam spread and damp-ground reflections. Traditional Kerala Theyyam performer in full vibrant red costume standing calmly beside the car. True-to-life greens, earthy browns, deep matte blacks, realistic red costume detail, natural filmic contrast, no oversaturation.`,
    negativePrompt: 'cartoon, anime, CGI plastic look, oversaturation, harsh midday sun, fake fog, warped architecture',
    camera: 'Aerial drone style, cinematic 35mm look, slightly tilted perspective',
    colorGrading: 'Filmic natural realism with humid atmospheric depth and balanced contrast.',
    faceRule: 'When a face is visible, preserve identity exactly with no beautification or facial reshaping.',
  },
  {
    id: 'bw_minimalist_studio_glasses',
    name: 'Black-and-White Minimalist Studio Portrait',
    presetId: 'studio_bw_minimalist_portrait',
    vibe: 'Minimalist monochrome fashion portrait with high graphic contrast and clean lines.',
    scene: 'Neutral light-toned studio wall background, no props, vertical 9:16 composition with subject isolated cleanly.',
    lighting: 'Soft frontal-top studio key with gentle fill, smooth light-to-shadow transitions, crisp contour definition without harsh clipping.',
    poseNotes: 'Head tilted back, chin raised, eyes half-open toward camera. Relaxed fashion posture emphasizing neck line and facial contours.',
    styleKeywords: ['black and white', 'minimalist', 'fashion portrait', 'square translucent glasses', 'high contrast', 'clean background'],
    fullPrompt: `Photorealistic black-and-white minimalist portrait in vertical 9:16. Subject looks into camera with head tilted back, chin raised, eyes half-open. Preserve facial structure exactly from reference. Smooth dark hair in a high long ponytail, large square glasses with natural reflections, natural skin texture with clean retouch, dramatic but controlled contrast, soft studio front-top light, clean neutral background.`,
    negativePrompt: 'face distortion, anime, CGI, painterly, over-smoothing, blown highlights, warped glasses geometry',
    camera: 'Portrait framing, close-up to medium close-up, studio capture',
    colorGrading: 'Monochrome high-contrast with smooth tonal rolloff.',
    faceRule: 'Preserve exact face geometry from reference with no distortion of eyes, nose, jaw, or proportions.',
  },
  {
    id: 'cozy_teddy_bear_selfie',
    name: 'Cozy Teddy Bear Couch Selfie',
    presetId: 'home_cozy_teddy_selfie',
    vibe: 'Youthful cozy late-evening candid with intimate realistic texture.',
    scene: 'Apartment living-room couch with textured throw blanket midground, soft neutral wall, pastel pillow background, slight foreground sleeve blur.',
    lighting: 'Diffused key from 45 degrees camera-left simulating soft window light, gentle couch bounce fill, realistic micro-shadows in plush fur.',
    poseNotes: 'Phone held close at slight downward angle. Teddy bear pressed against cheek with natural fur compression. Relaxed shoulders and soft pout expression.',
    styleKeywords: ['cozy selfie', 'teddy bear', 'living room', 'natural pores', 'iphone realism', 'raw texture'],
    fullPrompt: `High-resolution RAW-like cozy selfie. Subject with loose messy waves, natural pores, subtle cheek redness, minimal makeup, pastel oversized hoodie, pastel rose acrylic nails, holding beige plush teddy bear pressed to cheek with realistic fur compression and stitching detail. Living room couch context, soft realistic lighting, authentic skin and fabric micro-contrast, no CGI plush look.`,
    negativePrompt: 'plastic skin, CGI plush fur, over-smoothed pores, waxy hoodie texture, fake depth blur',
    camera: 'Front-facing phone capture simulation, 50mm equivalent perspective',
    colorGrading: 'True-to-life warm-neutral tones with gentle highlight rolloff.',
    faceRule: 'Keep face and eyes identical to the reference identity with no beautification or geometric drift.',
  },
  {
    id: 'travel_scene_lock_dslr',
    name: 'Travel Scene Lock (DSLR Realism)',
    presetId: 'travel_scene_lock_realism',
    vibe: 'High-quality travel photo realism with strict scene continuity.',
    scene: 'Use base travel scene as fixed location with unchanged background geometry, perspective, and lighting.',
    lighting: 'Maintain original scene lighting exactly, with physically consistent shadows on clothing and body.',
    poseNotes: 'Keep original pose and camera angle from base image; only clothing changes should occur naturally on body.',
    styleKeywords: ['travel photo', 'scene lock', 'dslr realism', 'natural colors', 'sharp focus', 'no distortion'],
    fullPrompt: `Keep the first image as fixed scene authority: same background, camera angle, perspective, lighting, and pose. Apply requested clothing with realistic fit, folds, and shadows while preserving true body proportions. Final output must look like a real travel photo: sharp, photorealistic, natural colors, no distortion, no extra people.`,
    negativePrompt: 'low quality, blurry, distorted face, wrong proportions, anime, CGI look, fake skin, extra fingers, wrong lighting, different background, altered pose',
    camera: 'Natural DSLR-like travel framing',
    colorGrading: 'Balanced natural tones with realistic dynamic range.',
    faceRule: 'Identity from source image remains immutable; no face swap, no face/head replacement, no facial reshaping.',
  },
  {
    id: 'elevator_mirror_urban_chic',
    name: 'Elevator Mirror Urban Chic',
    presetId: 'street_elevator_mirror_chic',
    vibe: 'Quietly confident urban mirror capture with monochrome chic styling.',
    scene: 'Business elevator interior with brushed-steel walls, cool LED strips overhead, subtle smudges and fingerprints on metal and mirror surfaces.',
    lighting: 'Cool practical LED key from above, soft metallic bounce fill, realistic reflective highlights on steel and phone edges.',
    poseNotes: 'Phone at waist height with slight tilt, gaze directed to phone screen, one finger near call button, relaxed posture.',
    styleKeywords: ['elevator mirror', 'urban chic', 'iphone capture', 'cool leds', 'monochrome mood', 'real texture'],
    fullPrompt: `Urban elevator mirror selfie with brushed steel walls, cool LED strips, subtle fingerprints and smudges visible on reflective surfaces. Soft cream satin top with tailored pants, natural skin texture, understated jewelry, relaxed phone-at-waist pose, gaze down to display. Monochrome-leaning palette and realistic fabric creases, authentic iPhone mirror-capture feel.`,
    negativePrompt: 'perfectly clean mirror CGI, plastic steel texture, studio beauty lighting, exaggerated stylization, warped reflections',
    camera: 'iPhone mirror capture, slight handheld tilt',
    colorGrading: 'Muted monochrome-leaning tones with realistic metallic contrast.',
    faceRule: 'Preserve exact identity and natural face texture with no beautification, reshaping, or eye drift.',
  },
  {
    id: 'sky_negative_space_editorial_ref',
    name: 'Sky Negative Space Editorial',
    presetId: 'editorial_sky_negative_space',
    vibe: 'Airy minimalist editorial with large sky dominance and calm posture.',
    scene: 'Subject positioned low in frame under expansive clouded sky with minimal horizon clutter.',
    lighting: 'Soft natural daylight with gentle contrast, preserving cloud detail and atmospheric depth.',
    poseNotes: 'Relaxed standing posture, natural hand placement, subtle head tilt.',
    styleKeywords: ['negative space', 'sky editorial', 'minimal', 'cloud texture', 'natural light'],
    fullPrompt: `Editorial outdoor composition with sky as the primary visual field. Keep subject low in frame and maintain realistic cloud texture, natural tones, and non-stylized facial detail.`,
    camera: '50mm, deep focus, wide vertical composition',
    colorGrading: 'Filmic neutral-cool with soft contrast.',
    faceRule: 'Identity unchanged; no beautification or geometry drift.',
  },
  {
    id: 'night_garden_flash_ref',
    name: 'Night Garden Flash Editorial',
    presetId: 'editorial_night_garden_flash',
    vibe: 'Raw flash-at-night editorial with tropical texture and controlled color contrast.',
    scene: 'Dense foliage backdrop at night with natural leaf layering and dark environmental depth.',
    lighting: 'Direct frontal flash plus subtle colored spill on foliage; realistic falloff and no fake glow.',
    poseNotes: 'Still upper-body pose with relaxed shoulders and candid expression.',
    styleKeywords: ['flash', 'night', 'garden', 'editorial', 'tropical'],
    fullPrompt: `Night editorial portrait in a tropical garden with direct flash realism, clean skin texture, and physically plausible colored spill. Preserve facial identity exactly.`,
    camera: '35mm, crisp flash detail, medium depth',
    colorGrading: 'Warm skin with restrained red-green contrast.',
    faceRule: 'Face lock absolute; no smoothing, no reshaping.',
  },
  {
    id: 'white_brick_bench_ref',
    name: 'White Brick Bench Studio',
    presetId: 'studio_white_brick_bench',
    vibe: 'Minimal architecture-forward studio realism.',
    scene: 'White brick wall, dark bench seating, clean matte floor, centered composition.',
    lighting: 'Broad diffused frontal key with gentle side contour, even tonal transitions.',
    poseNotes: 'Seated neutral posture with natural micro-asymmetry and relaxed limbs.',
    styleKeywords: ['minimal studio', 'white brick', 'bench', 'clean geometry'],
    fullPrompt: `Photorealistic studio scene with white brick wall and bench. Keep textures crisp and avoid blur haze.`,
    camera: '35-50mm, deep focus',
    colorGrading: 'Neutral clean tones, subtle contrast.',
    faceRule: 'Preserve exact face structure and expression from source.',
  },
  {
    id: 'newspaper_editorial_ref',
    name: 'Newspaper Set Editorial',
    presetId: 'editorial_newspaper_set',
    vibe: 'Graphic editorial with playful set design and crisp printed textures.',
    scene: 'Chair and environment covered with layered newspapers, visible typography and paper folds.',
    lighting: 'Punchy front-top key, balanced fill from paper surfaces, mild side separation.',
    poseNotes: 'Relaxed seated pose with confident attitude and natural limb placement.',
    styleKeywords: ['newspaper set', 'graphic editorial', 'set design', 'fashion'],
    fullPrompt: `Editorial fashion setup with newspaper-wrapped chair and floor. Keep print details legible and textures realistic.`,
    camera: '35mm, low seated angle, deep focus',
    colorGrading: 'Clean neutral-white with subtle warm highlights.',
    faceRule: 'No face stylization or feature alteration.',
  },
  {
    id: 'court_geometric_sun_ref',
    name: 'Court Geometric Sunlight',
    presetId: 'editorial_court_geometric_sun',
    vibe: 'Natural hard-light editorial with geometric architecture.',
    scene: 'Outdoor court lines, walls, and strong diagonal sunlight-shadow geometry.',
    lighting: 'Hard natural key sunlight, ground bounce fill, crisp shadow edges with realistic direction.',
    poseNotes: 'Ground-seated casual pose with relaxed posture and believable weight distribution.',
    styleKeywords: ['hard sunlight', 'geometric shadows', 'court', 'editorial'],
    fullPrompt: `Outdoor editorial on a court with strong geometric sunlight. Keep hard shadow logic physically consistent and detail sharp.`,
    camera: '35mm full-body, deep focus',
    colorGrading: 'Natural warm daylight with clean contrast.',
    faceRule: 'Identity and facial proportions unchanged.',
  },
  {
    id: 'window_blind_portrait_ref',
    name: 'Window Blind Portrait',
    presetId: 'studio_window_blind_portrait',
    vibe: 'Quiet cinematic portrait with natural blind light pattern.',
    scene: 'Minimal interior wall with clean blind-shadow projection across scene and subject.',
    lighting: 'Directional sunlight through blinds, soft bounce fill preserving texture in shadow bands.',
    poseNotes: 'Still seated/standing portrait pose with natural head angle and calm expression.',
    styleKeywords: ['blind shadows', 'cinematic portrait', 'natural light', 'minimal wall'],
    fullPrompt: `Portrait with real sunlight blind stripes and natural skin texture. Avoid fake projection artifacts or blur haze.`,
    camera: 'Portrait close-medium framing, medium depth',
    colorGrading: 'Warm cinematic-neutral with smooth transitions.',
    faceRule: 'Exact face lock; no eye/jaw/nose change.',
  },
  {
    id: 'dark_study_editorial_ref',
    name: 'Dark Study Set Editorial',
    presetId: 'editorial_dark_study_set',
    vibe: 'Vintage-inspired dark-set editorial with rich prop storytelling.',
    scene: 'Armchair, lamp, books, flowers, and textured rug in a controlled dark environment.',
    lighting: 'Warm practical key with soft directional fill and restrained rim separation.',
    poseNotes: 'Seated composed pose, hands relaxed, natural shoulder line.',
    styleKeywords: ['dark study', 'vintage editorial', 'props', 'warm practicals'],
    fullPrompt: `Cinematic dark-set editorial with realistic practical lamp lighting and preserved fabric/prop texture detail.`,
    camera: '50mm seated environmental portrait, deep detail',
    colorGrading: 'Warm-earth palette with controlled shadows.',
    faceRule: 'Identity fidelity mandatory; no beauty retouch.',
  },
  {
    id: 'orange_director_chair_ref',
    name: 'Orange Director Chair Studio',
    presetId: 'studio_orange_director_chair',
    vibe: 'Bold color-block fashion editorial with clean studio realism.',
    scene: 'Solid orange seamless background with director chair and minimal set interruption.',
    lighting: 'Soft frontal key, subtle fill, clean separation without clipping the orange channel.',
    poseNotes: 'Seated crossed-leg editorial pose with relaxed hand placement.',
    styleKeywords: ['orange seamless', 'director chair', 'fashion studio', 'color block'],
    fullPrompt: `Studio fashion portrait on orange seamless with realistic skin and textile response. Keep backdrop smooth without banding or blur.`,
    camera: 'Full-body seated framing, deep focus',
    colorGrading: 'Rich but controlled warm orange with neutral skin.',
    faceRule: 'Face unchanged and unretouched.',
  },
  {
    id: 'green_red_gel_editorial_ref',
    name: 'Green-Red Gel Editorial',
    presetId: 'studio_green_red_gel_editorial',
    vibe: 'Stylized but photoreal editorial color-light contrast.',
    scene: 'Minimal wall setup with clean gradients and controlled colored spill.',
    lighting: 'Warm key with green side fill, preserving natural skin texture and contour logic.',
    poseNotes: 'Standing three-quarter pose with natural body line and relaxed joints.',
    styleKeywords: ['gel lighting', 'editorial color', 'green red', 'studio'],
    fullPrompt: `Editorial studio portrait with controlled dual-color lighting and realistic skin/fabric texture.`,
    camera: 'Three-quarter standing, medium-deep focus',
    colorGrading: 'Color-separated cinematic tones without posterization.',
    faceRule: 'No facial reshaping or artificial smoothing.',
  },
  {
    id: 'red_seamless_profile_ref',
    name: 'Red Seamless Profile',
    presetId: 'studio_red_seamless_profile',
    vibe: 'Elegant side-profile editorial against bold red seamless.',
    scene: 'Clean red seamless background with no set clutter and profile-centric composition.',
    lighting: 'Soft side key with subtle frontal fill and fine edge contour.',
    poseNotes: 'Natural side-profile posture with relaxed neck and shoulder alignment.',
    styleKeywords: ['red seamless', 'profile', 'editorial', 'clean studio'],
    fullPrompt: `Red seamless profile portrait with realistic skin and garment detail, sharp edge definition, and no blur-wall artifacts.`,
    camera: 'Medium profile framing, deep focus',
    colorGrading: 'Balanced red background with preserved skin realism.',
    faceRule: 'Preserve exact profile anatomy and identity.',
  },
]

/** Preset IDs that have at least one example (for prompt builder to prefer these) */
const PRESET_ALIASES: Record<string, string> = {
  studio_black: 'studio_gray_flash',
  studio_grey: 'studio_white',
  studio_gradient: 'studio_white',
  celebration_festive: 'celebration_festive',
  studio_gray_flash: 'studio_gray_flash',
  lifestyle_airport_terminal: 'lifestyle_airport_terminal',
  lifestyle_tropical_patio: 'lifestyle_tropical_patio',
  lifestyle_european_bench: 'lifestyle_european_bench',
  urban_gas_station_night: 'casual_street_candid',
  editorial_mafia_office: 'studio_editorial',
  street_subway_fisheye: 'casual_street_candid',
  street_mcdonalds_bmw_night: 'casual_street_candid',
  studio_crimson_noir: 'studio_editorial',
  outdoor_kerala_theyyam_gtr: 'outdoor_golden_hour',
  studio_bw_minimalist_portrait: 'studio_white',
  street_elevator_mirror_chic: 'casual_mirror_selfie',
  editorial_sky_negative_space: 'studio_editorial',
  editorial_night_garden_flash: 'studio_gray_flash',
  editorial_newspaper_set: 'studio_editorial',
  editorial_court_geometric_sun: 'outdoor_park',
  studio_window_blind_portrait: 'golden_hour_bedroom',
  editorial_dark_study_set: 'studio_editorial',
  studio_orange_director_chair: 'studio_cream',
  studio_green_red_gel_editorial: 'studio_editorial',
  studio_red_seamless_profile: 'studio_editorial',
}

const WARNED_MISSING_PRESETS = new Set<string>()

function validateExamplePromptDataset(): void {
  const ids = new Set<string>()
  for (const example of EXAMPLE_PROMPTS_REFERENCE) {
    if (!example.id?.trim()) {
      throw new Error('Example prompt dataset error: example id is empty')
    }
    if (ids.has(example.id)) {
      throw new Error(`Example prompt dataset error: duplicate example id "${example.id}"`)
    }
    ids.add(example.id)

    if (!example.presetId?.trim()) {
      throw new Error(`Example prompt dataset error: presetId missing for "${example.id}"`)
    }
    if (!example.scene?.trim()) {
      throw new Error(`Example prompt dataset error: scene missing for "${example.id}"`)
    }
    if (!example.lighting?.trim()) {
      throw new Error(`Example prompt dataset error: lighting missing for "${example.id}"`)
    }
    if (!example.styleKeywords?.length) {
      throw new Error(`Example prompt dataset error: styleKeywords missing for "${example.id}"`)
    }

    const resolvedPresetId = PRESET_ALIASES[example.presetId] || example.presetId
    if (!getPresetById(resolvedPresetId)) {
      // Gracefully skip examples referencing removed presets instead of crashing
      if (process.env.NODE_ENV !== 'production' && !WARNED_MISSING_PRESETS.has(example.presetId)) {
        console.warn(
          `[example-prompts] Skipping example "${example.id}": preset "${example.presetId}" no longer exists`
        )
        WARNED_MISSING_PRESETS.add(example.presetId)
      }
    }
  }
}

validateExamplePromptDataset()

export const EXAMPLE_PRESET_IDS = Array.from(
  new Set(
    EXAMPLE_PROMPTS_REFERENCE.map((e) => PRESET_ALIASES[e.presetId] || e.presetId)
  )
)

/** Get examples by preset id (for tuning that preset's copy) */
export function getExamplesByPresetId(
  presetId: string
): ExamplePromptReference[] {
  return EXAMPLE_PROMPTS_REFERENCE.filter((e) => e.presetId === presetId)
}

/** Get all unique style keywords (for negative prompt or style hints) */
export function getAllStyleKeywords(): string[] {
  const set = new Set<string>()
  for (const e of EXAMPLE_PROMPTS_REFERENCE) {
    e.styleKeywords.forEach((k) => set.add(k))
  }
  return Array.from(set)
}

export interface PresetExampleGuidance {
  presetId: string
  matchedExamples: number
  vibe: string
  scene: string
  lighting: string
  poseInference: string
  colorGrading: string
  camera: string
  styleKeywords: string[]
  avoidTerms: string[]
  identityRules: string[]
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[_-]/g, ' ').trim()
}

function toTokens(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((t) => t.length >= 3)
}

function scorePresetMatch(targetPresetId: string, example: ExamplePromptReference): number {
  if (!targetPresetId) return 0
  if (example.presetId === targetPresetId) return 100

  const targetTokens = new Set(toTokens(targetPresetId))
  const exampleTokens = new Set([
    ...toTokens(example.presetId),
    ...toTokens(example.id),
    ...toTokens(example.name),
  ])

  let overlap = 0
  for (const token of targetTokens) {
    if (exampleTokens.has(token)) overlap += 1
  }
  return overlap
}

function topUniqueByLength(values: string[], limit: number): string[] {
  const seen = new Set<string>()
  const deduped = values
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => {
      const key = normalizeText(v)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.length - a.length)
  return deduped.slice(0, limit)
}

function getDefaultPoseInference(presetId?: string): string {
  const preset = getPresetById((presetId || '').trim())
  if (!preset) return ''
  if (preset.motion === 'candid motion') {
    return 'Use natural candid posture with believable weight shift and relaxed hand placement while preserving anatomy and source identity.'
  }
  if (preset.motion === 'subtle motion') {
    return 'Keep the source pose with subtle natural posture dynamics (small shoulder angle variation and organic hand tension), never rigid mannequin alignment.'
  }
  return 'Keep the source pose stable with natural joint articulation and non-rigid posture; avoid mannequin stiffness.'
}

export function getPresetExampleGuidance(presetId?: string): PresetExampleGuidance | null {
  const rawTarget = (presetId || '').trim()
  const target = PRESET_ALIASES[rawTarget] || rawTarget
  if (!target) return null
  const preset = getPresetById(rawTarget) || getPresetById(target)

  let scored = EXAMPLE_PROMPTS_REFERENCE
    .map((example) => ({ example, score: scorePresetMatch(target, example) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return null

  // Prefer direct preset matches. If none, keep top semantic matches.
  const hasDirect = scored.some((x) => x.score >= 100)
  if (hasDirect) {
    scored = scored.filter((x) => x.score >= 100)
  } else {
    scored = scored.slice(0, 4)
  }

  const examples = scored.map((x) => x.example)
  const styleKeywords = topUniqueByLength(
    examples.flatMap((e) => e.styleKeywords || []),
    14
  )

  const avoidTerms = topUniqueByLength(
    examples
      .flatMap((e) => (e.negativePrompt || '').split(/[;,]/))
      .map((v) => v.trim())
      .filter(Boolean),
    12
  )

  const identityRules = topUniqueByLength(
    examples.map((e) => e.faceRule || '').filter(Boolean),
    6
  )

  const vibe = topUniqueByLength(examples.map((e) => e.vibe), 3).join(' ')
  const scene =
    topUniqueByLength(examples.map((e) => e.scene), 2).join(' ') ||
    preset?.scene ||
    'Realistic environment matching the selected preset.'
  const lighting =
    topUniqueByLength(examples.map((e) => e.lighting), 3).join(' ') ||
    preset?.lighting ||
    'Physically plausible scene lighting with coherent key/fill behavior.'
  const poseInference =
    topUniqueByLength(examples.map((e) => e.poseNotes), 3).join(' ') ||
    getDefaultPoseInference(rawTarget) ||
    getDefaultPoseInference(target)
  const colorGrading = topUniqueByLength(
    examples.map((e) => e.colorGrading || '').filter(Boolean),
    3
  ).join(' ')
  const camera = topUniqueByLength(
    examples.map((e) => e.camera || '').filter(Boolean),
    3
  ).join(' ') || preset?.camera || 'Natural camera rendering with coherent perspective and depth.'

  return {
    presetId: target,
    matchedExamples: examples.length,
    vibe,
    scene,
    lighting,
    poseInference,
    colorGrading,
    camera,
    styleKeywords,
    avoidTerms,
    identityRules,
  }
}

export function getRequestExampleGuidance(userRequest?: string): PresetExampleGuidance | null {
  const request = (userRequest || '').trim()
  if (!request) return null

  const requestTokens = new Set(toTokens(request))
  if (!requestTokens.size) return null

  const scored = EXAMPLE_PROMPTS_REFERENCE
    .map((example) => {
      const text = [example.id, example.name, example.vibe, example.scene, example.lighting]
        .join(' ')
      const exampleTokens = new Set(toTokens(text))
      let overlap = 0
      for (const token of requestTokens) {
        if (exampleTokens.has(token)) overlap += 1
      }
      return { example, score: overlap }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  if (!scored.length) return null

  // Reuse aggregator by pretending a pseudo-preset id bucket.
  const pseudoPreset = scored[0].example.presetId
  const direct = getPresetExampleGuidance(pseudoPreset)
  if (!direct) return null

  // Override with request-focused matched examples and merged fields.
  const examples = scored.map((x) => x.example)
  const preset = getPresetById(pseudoPreset)
  return {
    ...direct,
    presetId: pseudoPreset,
    matchedExamples: examples.length,
    vibe: topUniqueByLength(examples.map((e) => e.vibe), 3).join(' '),
    scene:
      topUniqueByLength(examples.map((e) => e.scene), 3).join(' ') ||
      preset?.scene ||
      direct.scene,
    lighting:
      topUniqueByLength(examples.map((e) => e.lighting), 3).join(' ') ||
      preset?.lighting ||
      direct.lighting,
    poseInference:
      topUniqueByLength(examples.map((e) => e.poseNotes), 3).join(' ') ||
      getDefaultPoseInference(pseudoPreset) ||
      direct.poseInference,
    colorGrading: topUniqueByLength(
      examples.map((e) => e.colorGrading || '').filter(Boolean),
      3
    ).join(' '),
    camera: topUniqueByLength(
      examples.map((e) => e.camera || '').filter(Boolean),
      3
    ).join(' ') || preset?.camera || direct.camera,
    styleKeywords: topUniqueByLength(
      examples.flatMap((e) => e.styleKeywords || []),
      14
    ),
    avoidTerms: topUniqueByLength(
      examples
        .flatMap((e) => (e.negativePrompt || '').split(/[;,]/))
        .map((v) => v.trim())
        .filter(Boolean),
      12
    ),
    identityRules: topUniqueByLength(
      examples.map((e) => e.faceRule || '').filter(Boolean),
      6
    ),
  }
}
