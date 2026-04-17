export interface ReferencePrompt {
  id: string
  category: 'identity-preservation' | 'clothing-application' | 'style-enhancement' | 'quality-control'
  description: string
  prompt: string
  exampleOutput?: string
  priority: number
}

/**
 * Default reference prompts for training GPT-4o mini to generate high-quality try-on prompts
 * These serve as examples and guidance for the intelligent prompt generation
 */
export const referencePrompts: ReferencePrompt[] = [
  // Identity Preservation Prompts
  {
    id: 'identity-1',
    category: 'identity-preservation',
    description: 'Detailed facial feature preservation',
    prompt: `Preserve the person's identity exactly: Maintain the exact facial structure with oval face shape, almond-shaped brown eyes, natural eyebrow arch, medium nose, and medium mouth. Preserve the distinctive features including the specific bone structure, expression, age range (mid-20s), and all unique facial characteristics. The skin tone should remain medium with smooth texture, and hair should maintain its brown color, straight texture, natural style, and medium length.`,
    priority: 10,
  },
  {
    id: 'style-iphone-cafe',
    category: 'style-enhancement',
    description: 'Minimalist café business aesthetic, candid iPhone perspective',
    prompt: `A candid iPhone-style moment: a person in a business suit stands at a café counter, one hand inside a large black tote bag, searching for a card. Minimalist setting with neutral tones and overhead lighting; authentic smartphone perspective.

Identity lock: keep face, hair, expression, pose, body shape, age, gender, and camera composition identical to the source. Do not modify identity.

Clothing integration: replace only clothing per the reference if requested; match fabric texture, seams, folds, and natural shadows; keep anatomy consistent.

Lighting and mood: overhead, neutral illumination; soft reflections; subtle ambient café tone.

Camera feel: iPhone perspective, natural framing.
`,
    priority: 10,
  },
  {
    id: 'style-cyberhiker-hood',
    category: 'style-enhancement',
    description: 'Technical hardshell with oversized hood, alpine ambience',
    prompt: `A naturally posed side profile in front of a rugged rock wall in mountainous terrain. The person wears a matte black technical waterproof hardshell jacket with an oversized hood fully raised, angular shaping, and cinch cords creating a structured form. Taped seams and waterproof zippers emphasize high-performance, utilitarian design. High-contrast, orange-tinted wraparound goggles reflect the alpine landscape; the face is partially obscured with nose and part of lips visible.

Identity lock: keep the person exactly as in the source. Do not change face, hair, expression, pose, body, age, or camera composition.

Clothing integration: replicate fabric texture, taped seams, and zipper details; maintain silhouette and natural drape; preserve exact proportions.

Lighting and mood: soft, diffused, indirect daylight; cinematic yet realistic; emphasize fabric and rock textures.

Camera feel: subtle spontaneous framing with slight tilt that feels authentic to iPhone candid photography.
`,
    priority: 10,
  },
  {
    id: 'style-italian-espresso',
    category: 'style-enhancement',
    description: 'Rustic Italian bar, warm terracotta, casual elegance',
    prompt: `A candid scene of a person sitting at a tiny outdoor table of a rustic Italian bar, sipping a small espresso cup with relaxed elegance. A wide-brimmed straw hat, soft cream-toned blouse, and minimal gold hoop earrings; hair in loose waves around the face. Background shows warm terracotta walls with textured, weathered surfaces and vibrant green wooden shutters slightly open to reveal soft interior shadows.

Identity lock: preserve face, hair, expression, pose, age, and camera angle; do not add or remove accessories except those present in the source.

Lighting and mood: natural late-morning sunlight with warm highlights and subtle shadows; emphasize fabric folds and ceramic reflections.

Camera feel: casual framing with slight tilt; authentic iPhone village photography aesthetic.
`,
    priority: 9,
  },
  {
    id: 'style-gorpcore-alpine',
    category: 'style-enhancement',
    description: 'Outdoor gorpcore, overcast alpine slope with rugged rocks',
    prompt: `A casually captured iPhone photograph: a relaxed subject with arms gently crossed on a lightly grassy alpine slope beside rugged rocky formations. The person wears a burgundy windbreaker with realistic creases and waterproof fabric, khaki cargo pants with natural folds and faint soil traces near hems, and chunky dark gray sneakers with thick soles. Hood casually up, sunglasses reflecting soft mountain light; neutral face subtly shadowed.

Identity lock: keep identity and pose identical to the source; do not change body shape or facial features.

Lighting and mood: slightly overcast ambient daylight; gentle shadows on uneven terrain; distant jagged ridges veiled in mist.

Camera feel: casual, slightly tilted angle; spontaneous candid intimacy typical of outdoor iPhone photography.
`,
    priority: 9,
  },
  {
    id: 'style-parisian-street',
    category: 'style-enhancement',
    description: 'Parisian street textures, ivory silk, black leather, casual headphones',
    prompt: `A spontaneously captured iPhone-styled candid photo against a textured Parisian stone wall. The person wears an ivory silk blouse with soft draping and subtle fabric wrinkles, sleek black leather pants, and classic white Converse sneakers gently scuffed. Minimal black headphones rest lightly over hair; a translucent iced coffee glass shows realistic condensation.

Identity lock: keep face, hair, expression, pose, and proportions exactly the same as the source; do not modify identity.

Lighting and mood: soft natural daylight illuminating neutral makeup and natural skin texture; reveal fine pores and faint freckles authentically.

Camera feel: slightly tilted overhead angle with off-center framing; genuine iPhone street photography intimacy.
`,
    priority: 8,
  },
  {
    id: 'style-urban-selfie',
    category: 'style-enhancement',
    description: 'Urban tunnel selfie, bleached brows aesthetic, silver accent lashes',
    prompt: `A natural close-up iPhone selfie in a softly lit, neutral-toned underground tunnel. The subject presents bleached eyebrows that blend softly into the skin and subtle silver eyelashes; slick, wet-look hair styled back neatly; calm expression engaging directly with the camera. Minimalist makeup with muted, slightly glossy nude lips and icy silver eyeshadow; simple black top with light texture; minimal silver jewelry.

Identity lock: preserve face, hair, expression, and age exactly; do not alter eyebrow fullness or eyelash details unless they appear in the source image.

Lighting and mood: soft, diffused tunnel illumination with delicate highlights; authentic urban vibe; realistic skin texture.

Camera feel: close handheld smartphone perspective with clean framing.
`,
    priority: 8,
  },
  {
    id: 'identity-2',
    category: 'identity-preservation',
    description: 'Comprehensive identity lock',
    prompt: `Lock the person's identity: Preserve every facial detail including face shape (round), eye color (blue) and shape (round), eyebrow shape (arched), nose (small), mouth (small), skin tone (fair) and texture (smooth), hair color (blonde), texture (wavy), style (long layers), and length (long). Maintain the distinctive features array and ensure the bone structure, expression, and age range remain unchanged.`,
    priority: 9,
  },

  // Clothing Application Prompts
  {
    id: 'clothing-1',
    category: 'clothing-application',
    description: 'Detailed garment application',
    prompt: `Apply this clothing accurately: A cotton t-shirt with solid pattern in navy blue color, regular fit type, round neckline, short sleeve length. The design elements include a small logo on the chest. Ensure the fabric drapes naturally, the fit is realistic and comfortable, and the color matches exactly. The garment should integrate seamlessly with the person's body shape.`,
    priority: 10,
  },
  {
    id: 'clothing-2',
    category: 'clothing-application',
    description: 'Complex garment with details',
    prompt: `Apply this clothing precisely: A silk blouse with floral pattern in pastel pink and white, fitted fit type, V-neckline, long sleeve length. Design elements include pearl buttons down the front and delicate lace trim on the cuffs. The fabric should show natural silk sheen and drape, maintain the exact pattern placement, and fit the person's body proportions realistically.`,
    priority: 9,
  },

  // Style Enhancement Prompts
  {
    id: 'style-1',
    category: 'style-enhancement',
    description: 'Photorealistic scene description',
    prompt: `A photorealistic full-body portrait shot of the person wearing the clothing, standing naturally with a confident pose, set in a modern studio environment with soft, diffused lighting. The scene is illuminated by professional three-point lighting setup, creating a clean, professional atmosphere. Captured with a 85mm portrait lens at f/2.8, emphasizing sharp focus on the subject with natural background blur. The image should be in a 4:5 portrait format with ultra-realistic fabric textures, natural shadows, and perfect color accuracy.`,
    priority: 10,
  },
  {
    id: 'style-2',
    category: 'style-enhancement',
    description: 'Natural outdoor scene',
    prompt: `A photorealistic full-body shot of the person in the clothing, walking naturally in an urban park setting during golden hour. The scene is illuminated by warm, natural sunlight filtering through trees, creating a vibrant, lifestyle atmosphere. Captured with a 50mm lens at f/4, emphasizing the subject with slight background separation. The image should be in a 16:9 format with realistic fabric movement, natural lighting on the clothing, and authentic environmental integration.`,
    priority: 8,
  },

  // Quality Control Prompts
  {
    id: 'quality-1',
    category: 'quality-control',
    description: 'Physics and realism requirements',
    prompt: `Maintain realistic physics, fabric behavior, and natural fit. The clothing should follow the body's contours naturally, show appropriate fabric drape and movement, create realistic shadows and highlights, and maintain proper proportions. Avoid any distortions, unrealistic stretching, or unnatural fabric behavior. The garment should look as if it was actually worn, not digitally placed.`,
    priority: 10,
  },
  {
    id: 'quality-2',
    category: 'quality-control',
    description: 'Consistency and accuracy',
    prompt: `Ensure perfect consistency: The person's identity must remain 100% unchanged, the clothing must match the reference image exactly in color, pattern, and style, and the overall composition must be photorealistic with no artifacts, distortions, or unrealistic elements. The lighting should be consistent across the entire image, and all details should be sharp and clear.`,
    priority: 9,
  },

  // Real-World Example Prompts (High-Quality Training Examples)
  {
    id: 'realism-1',
    category: 'style-enhancement',
    description: 'Detailed coffee shop scene with realistic lighting and micro-details',
    prompt: `A candid, medium-shot portrait of a woman sitting on a white stool at a wooden window bar inside a coffee shop. She is viewed in profile, facing left toward a large glass window. She is sipping from an iced coffee while holding a smartphone. The setting combines industrial chic elements (exposed rusty beam) with minimalist cafe aesthetics (white walls, dried florals). The exterior view through the window shows a street scene with a white pickup truck and a tree. Natural sunlight enters from the left window, creating soft, diffused side-lighting with neutral to warm color temperature. The composition uses a low-angle camera perspective (lens below eye-level) with moderate depth of field - foreground crisp, background slightly softened. The focal point is the subject's face and the drink. The color palette includes deep forest green, cognac brown, gold accents, and pale pink details with medium contrast. The subject has Caucasian skin tone, blonde hair styled half-up with a beige claw clip, gold sculptural hoop earring, rosy blush makeup, and is wearing a dark espresso brown oversized leather jacket with silver zipper detail, medium light wash blue relaxed-fit jeans, and chocolate brown sneakers with white stripes and pink heel tab. The leather jacket shows natural folds and creases at elbow and waist. The jeans have fabric bunching at the knee due to seated position. All clothing maintains realistic fabric behavior and natural fit. The lighting creates realistic shadows and highlights on the clothing and skin.`,
    priority: 10,
  },
  {
    id: 'realism-2',
    category: 'style-enhancement',
    description: 'Mirror selfie with detailed clothing texture and realistic lighting',
    prompt: `A mirror selfie captured in a bright bedroom with asymmetrical composition. The subject occupies the right half of the frame, facing away from the viewer towards a mirror. Their left hand holds a smartphone near the vertical center line. Natural daylight enters from window behind the subject, creating backlit, diffused soft lighting with neutral leaning cool color temperature. The subject has brown/dark blonde hair in a messy bun with loose strands, wearing a pastel pink and white vertical striped shirt with cotton/poplin fabric weave, loose/oversized fit with visible folds and shadows indicating fabric drape. A cream and yellow flower-shaped hair clip (resembling Plumeria/Frangipani) grips the hair bun on the right. Gold hoop earring visible on left ear, manicured fingernails with white tips, gold ring bands on fingers. The background shows a white wall, window with green foliage outside, white radiator below window, and a dark brown tote bag with checkered pattern. The lighting creates realistic shadows and highlights, with the back of the room in deep, cool-toned shadow. The fabric textures are sharp and detailed, showing realistic fabric behavior and natural drape.`,
    priority: 10,
  },
  {
    id: 'realism-3',
    category: 'style-enhancement',
    description: 'Full-body mirror selfie with detailed outfit and realistic textures',
    prompt: `A modern aesthetic influencer-style full-body mirror selfie in a clean minimalist apartment bedroom. The subject is a young woman taking a full-body mirror selfie, one hand casually tucked into her pocket, standing in a minimalist bedroom. She has a shoulder-length brunette bob, loose and casual, tucked slightly into hoodie. She wears a washed forest green oversized hoodie with vintage wash texture, kangaroo pocket, dropped shoulders, thick comfy fabric. The bottom is optic white high-waisted barrel-leg denim trousers with relaxed tapered fit, slightly cropped at ankle. The shoes are grey and teal green retro sneakers with gum soles, classic three-stripe design (Adidas Samba style), white ribbed socks. A black leather slouchy hobo-style shoulder bag is worn over the shoulder. Multiple silver/gold rings on fingers holding a light baby blue smartphone case covering the face. The background is a clean minimalist apartment bedroom with white walls, mid-century modern wooden chair with green cushion (left), white modern drawer unit (right), framed art poster with blue distorted smiley faces, woven jute rug, and polished wooden floorboards. Dim directional daylight enters from the left, creating a moody atmosphere with the back of the room in deep, cool-toned shadow. The lighting creates realistic deeper shadows in background while maintaining sharp fabric details. The texture shows directional natural daylight, clean minimalist aesthetic, sharp fabric details, realistic deeper shadows in background. All clothing maintains realistic fabric behavior, natural fit, and authentic texture.`,
    priority: 10,
  },
  {
    id: 'realism-4',
    category: 'style-enhancement',
    description: 'Overhead selfie with detailed facial features and clothing texture',
    prompt: `A casual, playful iPhone selfie shot from a distinctly exaggerated overhead wide-angle perspective portrays a young woman reclining on softly textured white pillows. She gazes directly into the camera with a relaxed, dreamy expression, her long, thick lashes and rosy cheeks authentically detailed. Her original off-shoulder top, with gently wrinkled fabric and layered texture, subtly reveals one shoulder, reflecting a contemporary, stylish personal flair. One arm curls naturally beside her head, creating a spontaneous, intimate pose. Soft, natural indoor sunlight casts gentle shadows enhancing the fabric and hair textures, while the elevated selfie angle emphasizes her enlarged facial features and upper body interaction. The overall composition evokes candid, expressive social media selfie aesthetics with authentic personal warmth and textural realism. The lighting creates gentle shadows that enhance fabric and hair textures realistically. The clothing shows realistic fabric wrinkles and natural drape. The face maintains perfect consistency with authentic details.`,
    priority: 10,
  },
  {
    id: 'realism-5',
    category: 'style-enhancement',
    description: 'Business casual scene with minimalist setting and realistic lighting',
    prompt: `A girl in a business suit stands at a café counter, one hand inside her large black tote bag, searching for her card. Minimalist setting with neutral tones and overhead lighting. iPhone perspective. The scene uses realistic overhead lighting that creates natural shadows and highlights. The business suit maintains realistic fabric texture and fit. The minimalist setting with neutral tones creates a clean, professional atmosphere. The lighting is consistent across the entire scene, creating realistic depth and dimension. All clothing details are sharp and clear, showing realistic fabric behavior.`,
    priority: 9,
  },
  {
    id: 'realism-6',
    category: 'style-enhancement',
    description: 'Christmas market scene with detailed clothing and face consistency',
    prompt: `A beautiful young woman (early 20s) sitting on a wooden market bench with knees pulled up and arms wrapped around them, giving a cheerful wink. Expression: cute, warm, festive. Hair: dark brown, long loose waves with a cozy knit headband. Complexion: fair with rosy winter cheeks. Clothing: cream knit sweater, red corduroy shorts, white wool socks, tan winter boots with faux fur. Setting: outdoor Christmas market with twinkle lights, wooden stalls, warm hanging lanterns. Lighting: warm golden fairy-light glow creating a cozy, festive, romantic mood. Camera: low-to-mid angle, slight wide-angle with warm bloom, subject centered among Christmas lights. CRITICAL: Preserve face exactly - skin color (fair with rosy winter cheeks), hair texture (long loose waves), all facial details. Match clothing exactly - cream knit sweater color and texture, red corduroy shorts color and fabric, white wool socks texture, tan winter boots with faux fur details.`,
    priority: 10,
  },
  {
    id: 'realism-7',
    category: 'style-enhancement',
    description: 'Indoor selfie with detailed fabric textures and lighting',
    prompt: `Bright indoor setting with natural daylight from large window. Subject: petite young woman with light brown wavy hair and fair skin. Pose: sitting sideways on a cream-colored velvet sofa, one knee up, torso slightly twisted toward the camera, taking a casual selfie with rose-gold iPhone held in right hand, left hand resting on her thigh, soft playful smile. Attire: soft mint-green satin cropped camisole with thin straps, matching high-waist satin shorts with delicate lace trim, small gold belly chain, thin gold anklet. Details: long almond-shaped nude-pink manicure. Lighting: warm diffused sunlight pouring in from the side, gentle highlights on skin and fabric. Background: light gray walls, flowing white curtains, hints of green plants near the window. Overall vibe: fresh, cozy, feminine morning selfie aesthetic. CRITICAL: Preserve face exactly - skin color (fair), hair texture (light brown wavy), all facial details. Match clothing exactly - mint-green satin color and texture, lace trim details, fabric sheen.`,
    priority: 10,
  },
  {
    id: 'realism-8',
    category: 'style-enhancement',
    description: 'Train interior with detailed clothing consistency',
    prompt: `Candid Japanese train interior selfie, soft window light, realistic smartphone shot, cute filter. Subject: three stunning Japanese women in their early 20s, sleek black hair with wispy bangs, glowing skin, glossy lips. Outfit: oversized cream knit sweaters slipping off shoulders, tiny black pleated skirts barely covering thighs, white knee-high socks with lace trim. Accessories: plush bear-ear muffs, tiny pearl chokers, holding matcha lattes in cute cups, fluffy pom-pom phone straps. Pose: middle girl sitting on the others' laps, all doing bunny-paw poses under chins, sweet innocent smiles. Setting: cozy train seat with soft natural light. Mood: ultra-soft angelic kawaii, warm and irresistibly cute. CRITICAL: Preserve face exactly - skin color (glowing), hair texture (sleek black with wispy bangs), all facial details. Match clothing exactly - cream knit sweater color and texture, black pleated skirt fabric and pleat details, white knee-high socks with lace trim.`,
    priority: 10,
  },
  {
    id: 'realism-9',
    category: 'style-enhancement',
    description: 'Cloud sky scene with face and clothing consistency',
    prompt: `The person from the reference photo (keep the face 100% accurate from the reference image) relaxing on a fluffy, glowing cloud high above the sky, surrounded by soft golden sunlight and vast layers of clouds stretching to the horizon. The person is lying back comfortably with a pillow, wearing clothing from reference. The lighting is cinematic and warm, capturing the golden hour ambiance with radiant highlights and gentle shadows across the clouds. Captured with a wide-angle lens at medium depth of field, balancing focus between the subject and the surrounding dreamy sky. The overall atmosphere is surreal and serene, blending realism with fantasy in a peaceful, imaginative setting. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details from reference. Match clothing exactly - color, pattern, fabric texture from reference.`,
    priority: 10,
  },
  {
    id: 'realism-10',
    category: 'style-enhancement',
    description: 'Studio flash with detailed clothing shine and face preservation',
    prompt: `The background is a darkly lit room, probably under the podium. The main emphasis is on the subject's face and the details of their costume. Emphasize the expressiveness of the gaze and the luxurious look of the outfit. The photo is lit by a flash from the camera, which emphasizes the shine of beads and crystals on the clothing, as well as the subject's shiny skin. Victoria's Secret style: sensuality, luxury, glamour. Very detailed. Important: do not change the face. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details. Match clothing exactly - color, pattern, fabric texture, shine of beads and crystals.`,
    priority: 10,
  },
  {
    id: 'realism-11',
    category: 'style-enhancement',
    description: 'Car trunk scene with detailed clothing and face consistency',
    prompt: `A high-angle shot looking down into the trunk of a bright yellow sports car. The subject is lying relaxed inside an open car trunk, legs bent and crossed, right arm stretched upward, left hand holding a lit cigarette near mouth. The background is a dark outdoor nighttime setting with faint building silhouette. The lighting is hard direct flash (35mm analog style) with dark ambient background. Flash photography with grainy film texture. Edgy, mysterious, candid atmosphere. Subject has long, ash-brown, textured wolf cut hair, relaxed dreamy expression looking to the side. Wearing sleeveless cropped black hoodie with high collar, faded black denim shorts vintage distressed style with raw hem and frayed fibers, Onitsuka Tiger Mexico 66 sneakers (Yellow and Black). CRITICAL: Preserve face exactly - skin color, hair texture (ash-brown textured wolf cut), all facial details. Match clothing exactly - black hoodie color and fabric, black denim shorts color and distressed texture, yellow and black sneakers with exact design.`,
    priority: 10,
  },
  {
    id: 'realism-12',
    category: 'style-enhancement',
    description: 'Minimal studio with detailed textures',
    prompt: `A hyper-realistic full-body portrait of uploaded image. Their pose is sitting. Beside them stands a vertical oversized camera, placed firmly on the ground, slightly tilted for a stylish aesthetic. The object is approximately at arm-height, allowing them to casually lean one arm on it for support. In their other hand, they hold a cup. Minimal lavender studio background with soft cinematic lighting. Ultra-detailed textures on clothing, skin, hair, object surfaces. Composition clean, minimal, modern, and visually striking. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details. Match clothing exactly - color, pattern, fabric texture with ultra-detailed rendering.`,
    priority: 10,
  },
  {
    id: 'realism-13',
    category: 'style-enhancement',
    description: 'Polaroid style with face and clothing preservation',
    prompt: `Create a Polaroid-style photo, as if it were taken with a Polaroid camera. The photo should look like a regular snapshot, without any obvious props or staged elements. Add a slight blur and a consistent light source, such as a flash from a dim room, scattered throughout the photo. Don't alter the faces. Replace the background with soft white curtains. The subject is looking directly at the camera, capturing a natural, candid moment. Bright, direct flash, high contrast, and dramatic shadows to nail the instant photo vibe. The printed photo will sit on a matte white surface for that authentic analog feel. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details. Match clothing exactly - color, pattern, fabric texture.`,
    priority: 10,
  },
  {
    id: 'realism-14',
    category: 'style-enhancement',
    description: 'Elevator scene with strict face preservation',
    prompt: `The scene takes place inside an elevator with cinematic lighting, clean details, and a realistic overhead camera angle. The subject should be posed naturally, keeping facial identity, body proportions, and lighting consistent with the original subject. Strictly preserve the original facial identity and features. Do not modify or alter their faces in any way. Maintain their original face shape, eyes, nose, mouth, and skin tone. No face replacement, no stylization, no beautification. The final output must look like a natural photo taken inside an elevator, with sharp details, balanced composition, and no distortions. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details with no modifications. Match clothing exactly - color, pattern, fabric texture.`,
    priority: 10,
  },
  {
    id: 'realism-15',
    category: 'style-enhancement',
    description: 'Victorian costume with detailed fabric and face consistency',
    prompt: `Recreate the subject from royal Victorian dress with pearl accessories. Ensure the person's identity, face, body proportions, and hairstyle remain consistent. The clothing should be applied with realistic textures, natural folds, and correct fitting, matching the style of Victorian royal dress. Generate a clean, photorealistic result with accurate lighting and natural shadows. CRITICAL: Preserve face exactly - skin color, hair texture, all facial details. Match clothing exactly - Victorian dress color, pattern, fabric texture (velvet, silk, lace), pearl accessories details.`,
    priority: 10,
  },
  {
    id: 'realism-16',
    category: 'style-enhancement',
    description: 'Witch costume with detailed fabric textures',
    prompt: `Recreate the subject from a young woman with long brown hair and glasses wearing black velvet witch gown with lace sleeves, a pointed hat, and striped stockings. Ensure the person's identity, face, body proportions, and hairstyle remain consistent. The clothing should be applied with realistic textures, natural folds, and correct fitting, matching the style of witch costume. Generate a clean, photorealistic result with accurate lighting and natural shadows. CRITICAL: Preserve face exactly - skin color, hair texture (long brown), glasses, all facial details. Match clothing exactly - black velvet gown color and texture, lace sleeves details, pointed hat, striped stockings pattern.`,
    priority: 10,
  },
]

/**
 * Get reference prompts by category
 */
export function getReferencePromptsByCategory(
  category: ReferencePrompt['category']
): ReferencePrompt[] {
  return referencePrompts.filter((p) => p.category === category).sort((a, b) => b.priority - a.priority)
}

/**
 * Get all reference prompts sorted by priority
 */
export function getAllReferencePrompts(): ReferencePrompt[] {
  return [...referencePrompts].sort((a, b) => b.priority - a.priority)
}

/**
 * Get reference prompts formatted for GPT system prompt
 */
export function getReferencePromptsForSystemPrompt(): string {
  const prompts = getAllReferencePrompts()
  return prompts
    .map(
      (p, index) => `
Example ${index + 1} (${p.category}):
Description: ${p.description}
Prompt: ${p.prompt}
${p.exampleOutput ? `Example Output: ${p.exampleOutput}` : ''}
`
    )
    .join('\n')
}

