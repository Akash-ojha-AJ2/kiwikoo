/**
 * AD STYLE REFERENCE EXAMPLES
 *
 * Curated high-quality prompts for ad generation. GPT-4o uses these as
 * references when building the final composition prompt.
 */

export interface AdStyleExample {
  id: string
  name: string
  prompt: string
  styleNotes: string
  imagePath?: string
}

export const AD_STYLE_EXAMPLES: AdStyleExample[] = [
  // ─── Message 1 (9) ───
  {
    id: 'overhead-bed-editorial-contemplative',
    name: 'Overhead Bed Editorial – Contemplative Couture',
    prompt: `A high-fashion editorial, overhead studio shot presents a statuesque young woman with very fair skin in a contemplative resting pose atop a rectangular mattress styled with rumpled off-white to cream silk linens and two large, slightly flattened pillows at the head. She is dressed in couture-inspired sculptural white satin opera gloves, sheer mesh tights, and a couture ivory turtleneck dress with laces. Above, the background is clipped to a baby blue void, creating a staged minimalist effect around the subject. The light is soft, diffuse, and overhead, causing minimal specular highlights and only gentle shadows within the fabric folds and beneath the resting figure; the model's skin displays visible warm subtle translucency at the limbs due to soft surface scattering, evoking an editorial yet intimate, introspective mood. The frame is tightly cropped orthogonally to the bed's rectangle, maximizing a contemplative sense of isolation. Everything is captured with deep focus and digital sharpness, no vignette, no edge distortion, and with a minimalist, clean modern editorial mood.`,
    styleNotes: 'Overhead orthogonal crop, baby blue void, soft diffuse overhead light, couture ivory + opera gloves. Use for premium editorial, bridal, beauty.',
  },
  {
    id: 'editorial-denim-corset-faux-fur-wall',
    name: 'Editorial – Denim Corset & Faux Fur on Weathered Wall',
    prompt: `A medium shot captures a young Asian woman in a stylized outfit, standing against a textured, weathered wall. She wears a form-fitted, light denim corset with dark accents and oversized metallic grommets, paired with a short, matching denim skirt. Her ensemble includes dramatic, oversized hoop earrings and a chunky necklace. Her arms are draped in a brown faux fur jacket with voluminous sleeves. She carries a small, cream-colored handbag with decorative holes and a dangling key charm. Her stockings are lace-trimmed, complementing her knee-high, black heeled boots. The setting features an urban, distressed wall with visible cracks and wires. The image employs natural daylight, creating a warm, muted color palette that enhances the bohemian, fashion-forward mood and commemorates an offbeat, eclectic style.`,
    styleNotes: 'Medium shot, weathered urban wall, natural daylight, warm muted palette, bohemian/eclectic. Use for street editorial, denim campaigns.',
  },
  {
    id: 'editorial-composite-leather-projected-face',
    name: 'Editorial Composite – Leather Walk + Giant Projected Face',
    prompt: `A straight-on composite medium-to-close shot features two young model-aged women. In the foreground, a tall, fair-skinned white woman walks toward the camera with runway poise. She wears a glossy black leather jacket with strong shoulder pads and intricate ribbed detailing, paired with a matching asymmetrical leather skirt. Tall black leather boots and gloves complete the outfit. She has slicked-back hair and formal makeup, accessorized with oversized rectangular sunglasses. The background is dominated by an enormous projected close-up of a second Indian female model with dark, choppy cropped hair, ultra-blunt micro bangs, and glossy black wrap-around sunglasses; she has very smooth skin, a slight nose flush, and a small metallic septum ring. The setting is intentionally minimal, with a matte black studio backdrop and a cool, subtle-textured gray concrete floor. Negative space between the walking model (slightly off-center, right lower third) and the enormous background face. Lighting is crisp and technical: soft studio key on the projected face with subsurface scattering; walking model lit with high-contrast softbox and cooler rim fill. Color palette: blacks, pale and warm neutral skin tones, metallic silver, gray. Ultra-high resolution, sharp focus, no motion blur. Cool, clinical, austere high-fashion severity.`,
    styleNotes: 'Composite: walking leather model + giant projected face, matte black backdrop. Use for bold editorial, luxury campaigns.',
  },
  {
    id: 'editorial-side-profile-bouquet-minimal',
    name: 'Editorial – Side Profile Bouquet on Gray',
    prompt: `A side-profile medium shot captures a young East Asian woman in her mid-20s holding a striking bouquet wrapped in a vibrant, glossy blue material. The bouquet features a mix of delicate white flowers and speckled pink blooms with long, slender stems and swirling tendrils, arranged artistically. She wears an ivory sleeveless dress over a black turtleneck, with her straight, dark hair cascading over her shoulder. The plain, light gray background enhances the minimalistic and modern aesthetic. The lighting is soft and diffuse, highlighting the textures of the fabric and flowers, with gentle shadows adding depth. The color palette contrasts the vivid blue and soft pastels of the flowers with the stark black and ivory of her attire. The framing focuses on a portion of her face, set against the minimalist backdrop. The overall atmosphere is artistic, contemporary, and serene.`,
    styleNotes: 'Side-profile medium, light gray backdrop, soft diffuse light, bouquet + ivory/black outfit. Use for beauty, fragrance, floral campaigns.',
  },
  {
    id: 'creative-sci-fi-cryogenic-helmet-portrait',
    name: 'Creative – Sci-Fi Cryogenic Helmet Portrait',
    prompt: `Hyper-realistic cinematic portrait of a bald man with a serious expression, wearing dark round red-lensed goggles and a futuristic black armored suit, inside a transparent cryogenic helmet covered in ice particles and condensation, illuminated with cold soft blue lighting, close-up side profile view, minimal white-blue background, high-detail textures on suit and helmet, 85mm portrait lens, HDR color grading, cinematic sci-fi lab atmosphere, frosty ambient effects, photorealistic style.`,
    styleNotes: 'Close-up side profile, cryogenic helmet with frost/condensation, cold blue lighting, sci-fi lab mood. Use for tech, gaming, futuristic fashion.',
  },
  {
    id: 'editorial-winter-mountain-faux-fur',
    name: 'Editorial – Winter Mountain Faux Fur Full-Body',
    prompt: `A low-angle medium shot captures a young adult Caucasian woman standing in a snowy mountainous landscape. She is wearing a textured ensemble featuring a brown cable-knit jacket over a faux fur coat, with form-fitting leggings and fluffy knee-high boots, all in matching earthy tones. A cream knitted cap and oversized sunglasses complete the look. She stands confidently, one hand on her hip, exuding fashion-forward poise. The background displays a snow-dusted mountain under a clear, vibrant blue sky. The lighting is bright, likely natural sunlight, creating sharp, crisp highlights and shadows. High-resolution, modern digital camera, dynamic and adventurous mood.`,
    styleNotes: 'Low-angle medium, snowy mountain, natural sunlight, cable-knit + faux fur. Use for outerwear, winter campaigns.',
  },
  {
    id: 'lifestyle-gas-station-night-porsche-medellin',
    name: 'Lifestyle – Gas Station Night Porsche Medellin',
    prompt: `Generate an ultra-realistic portrait and photograph of the person from the reference selfie, positioned as shown. They are leaning against a black Porsche GT3 RS at a gas station in Medellin, Colombia at night. The person is wearing a black Nike tracksuit, New Era cap green, and rimless Montblanc eyeglasses. Make the hair a little bit wavy. Face accuracy 100%. The scene captures the ambiance of a gas station in Medellin Colombia at night, with the ground appearing wet and reflecting the colorful urban lights and signs. The background includes typical gas station elements and a building with signs. Ultra-realistic and detailed cinematic quality, as if captured by an iPhone 17 Pro Max. The overall color grading should be dark and moody, with vibrant reflections from the artificial lights and blue shadows.`,
    styleNotes: 'Night gas station, wet reflective ground, Porsche GT3 RS, Medellin urban lights, dark moody grade. Use for automotive, streetwear, lifestyle.',
  },
  {
    id: 'editorial-vintage-doorway-flash-70s',
    name: 'Editorial – Vintage 70s Doorway Frontal Flash',
    prompt: `Mid-frame editorial portrait, subject tightly framed in doorway. Slight top-to-bottom angle creating dominance and presence. Camera: ISO 640, f/4.0, 1/100 s — crisp editorial sharpness with vintage softness. Strong analog grain, emulating 70s magazine stock. Gray fade treatment with subtle vignette. Direct frontal fill flash, slightly harsh, iconic vintage paparazzi/editorial style. SUBJECT: Young adult Caucasian female, slim, relaxed yet confrontational attitude. Wardrobe: Oversized charcoal-gray suit, pale blue shirt unbuttoned to reveal white undershirt, oversized dark heavy-frame eyeglasses, minimal jewelry. Pose: Hands in pockets, leaning slightly forward, commanding presence. SCENE: Weathered architectural doorway with peeling paint and aged wood. Deep stairwell fading into darkness. Harsh frontal flash balanced against doorway shadows, sharp contrasts. Vintage 70s editorial — raw, glossy, bold. Color palette: Muted grays, washed blues, faded whites. Glossy reflections, gritty grain overlay, softened vintage tones.`,
    styleNotes: 'Mid-frame in doorway, frontal flash, 70s magazine grain, weathered door, charcoal suit. Use for vintage editorial, bold tailoring.',
  },
  {
    id: 'street-crosswalk-high-angle-candid',
    name: 'Street – Crosswalk High-Angle Candid',
    prompt: `A young fashionable woman walks naturally across a wide pedestrian crosswalk wearing baggy denim cargo pants with visible seams and a khaki tank top neatly tucked in. She wears black cat-eye sunglasses and minimal silver jewelry, appearing relaxed and casual with one hand in her pocket and the other holding a takeaway coffee cup. The setting is a road and pedestrian crosswalk with clear white zebra crossing lines on textured asphalt; no urban or city elements are visible. The lighting is neutral, natural daylight with soft overcast shadows and realistic exposure. Textural details include visible skin pores, textured denim fabric with pronounced seams, slight scuff marks on her shoes, and the gritty, slightly uneven asphalt beneath her feet. The wide, high-angle framing is candid and slightly impersonal. Muted, natural colors and documentary-style realism. Candid street camera photo, high-angle traffic camera shot, hyper-real texture fidelity.`,
    styleNotes: 'High-angle wide shot, zebra crosswalk, overcast daylight, documentary realism. Use for streetwear, candid UGC.',
  },
  // ─── Message 2 (5) ───
  {
    id: 'reeded-glass-neon-green-tracksuit',
    name: 'Editorial – Reeded Glass Neon Green Tracksuit Portrait',
    prompt: `Side profile portrait of a man facing left, wearing a bright neon green tracksuit, photographed entirely through thick vertically reeded architectural glass, vertical grooves running top to bottom across the entire frame, parallel vertical lines clearly visible, no horizontal texture, full-frame optical distortion dominating the image, textured acrylic glass in the foreground, realistic physical light refraction warping the profile of the face and upper body into vertical repetitions, subtle neon green glow softly radiating from the clothing and gently bleeding into the glass ridges, faint green light scattering through the vertical grooves, high-key studio background in pale gray and off-white tones, cool neutral lighting, modern editorial portrait, restrained and minimal, physical optics not digital, no glitch.`,
    styleNotes: 'Side profile through reeded glass, full-frame vertical distortion, neon green glow, high-key studio. Use for editorial portraiture, sportswear.',
  },
  {
    id: 'raw-analog-lacoste-tennis-court',
    name: 'RAW Analog – Lacoste Tennis Court Gen Z Editorial',
    prompt: `RAW analog editorial of two Gen Z tennis standing casually on the court near the net, playful and rebellious vibe. In the foreground, a female wears a cropped white Lacoste sports top, pleated white Lacoste tennis skirt, white Lacoste crew socks with bold black swoosh, and crisp white Lacoste sneakers with black swoosh. A headband and wristbands add a retro flair. Her tennis racket lies on the clay blue court beside scattered white tennis balls. Behind her, a male athlete sits relaxed on the other side of the net, leaning back with casual posture. He wears an all-white Lacoste outfit: oversized tee, shorts, Lacoste socks with swoosh logo, and white Lacoste sneakers with black swoosh. Style: RAW analog fashion editorial. Lens: 35mm overhead angle, slightly tilted for candid imperfection. Lighting: natural daylight, soft urban outdoor tone, slight overexposure for film look. Mood: rebellious, carefree, Gen Z editorial sports-lifestyle crossover. Textures: analog film grain, matte finish, scattered tennis balls enhancing imperfection. Color palette: whites + blacks dominant, balanced by clay blue tennis court.`,
    styleNotes: 'RAW analog film grain, tennis court, Lacoste all-white, 35mm overhead tilted, Gen Z rebellious. Use for sportswear, lifestyle tennis.',
  },
  {
    id: 'follow-cam-snowboard-powder-jump',
    name: 'Action – Follow-Cam Snowboard Powder & Jump',
    prompt: `Follow-cam snowboard shot from directly behind a rider in a white jacket, positioned near the bottom of the frame, standing sideways on the board while carving fast through snow, with powder spraying outward behind the tail. A single massive snow jump rises in the distance at center frame beneath a clear blue sky, with subtle directional motion blur in the snow to convey speed.`,
    styleNotes: 'Follow-cam from behind, white jacket rider, powder spray, distant snow jump, clear blue sky. Use for winter sports, outerwear.',
  },
  {
    id: 'urban-crosswalk-sporty-streetwear-motion',
    name: 'Street – Urban Crosswalk Sporty Streetwear Motion Blur',
    prompt: `Ultra-realistic female model walking confidently on an urban street, mid-step motion, natural stride, sneakers clearly visible, stylish sporty-streetwear outfit (colorful fitted top, layered skirt or joggers, accessories), dynamic motion blur on background, crisp sharp focus on model, natural sunlight, soft shadows, high-detail skin and fabric texture, editorial street fashion photography, 35mm lens, modern urban environment, candid real-life moment, natural expression, premium sneaker advertisement style cinematic street lighting, slight depth of field, high-contrast sunlight and shade, real asphalt texture.`,
    styleNotes: 'Low-angle urban crosswalk, motion blur background, sharp model, 35mm, premium sneaker ad style. Use for streetwear, sneaker campaigns.',
  },
  {
    id: 'metro-platform-stillness-motion-blur',
    name: 'Editorial – Metro Platform Stillness vs Crowd Motion',
    prompt: `A cinematic editorial photograph of a black man standing still on a busy crossing platform while crowds rush past him in heavy motion blur; he remains sharp and calm as people dissolve into streaks of movement; slow shutter effect, long exposure photography; muted urban color palette, soft industrial lighting, concrete textures, metro train in background; feeling of isolation, introspection, emotional contrast between chaos and stillness; contemporary fashion editorial mood, minimal styling, natural expression; shallow depth of field, cinematic framing, realism, high detail.`,
    styleNotes: 'Still subject vs motion-blur crowds, metro platform, long exposure, isolation/introspection. Use for contemporary fashion editorial.',
  },
  // ─── Message 3 (9) – prompts written from image descriptions ───
  {
    id: 'editorial-sheer-patent-red-backdrop',
    name: 'Editorial – Sheer Top & Patent Pants on Red',
    prompt: `High-fashion editorial portrait of a young Southeast Asian man in side profile, facing left, against a solid vibrant red studio backdrop. He wears a sheer, semi-transparent long-sleeve top revealing his torso, and high-waisted patent-leather or glossy black pants with a distinctive sheen. Minimal jewelry; clean, editorial grooming. Lighting is soft and even, high-key, with subtle rim separation from the red background. Cool, neutral studio light emphasizing fabric texture and skin clarity. Composition: medium shot, side profile, sharp focus on subject. Restrained, modern editorial mood; flawless skin and fabric detail; 8K digital sharpness, no grain, no vignette.`,
    styleNotes: 'Side profile, solid red backdrop, sheer top + patent pants, high-key studio. Use for menswear editorial, bold color blocking.',
  },
  {
    id: 'editorial-split-gel-rust-checkerboard',
    name: 'Editorial – Split Gel Lighting Rust & Checkerboard',
    prompt: `Medium shot editorial portrait of a young woman with short, dark, slightly messy hair in side profile against a split-toned studio background. She wears an oversized rust-red or burnt orange collared shirt with voluminous sleeves and high-waisted pants featuring a black and dark green-teal psychedelic checkerboard pattern with a warped, optical-illusion effect around hip and thigh. Large chunky light-colored sunglasses, small dark earrings, black belt. Lighting: dramatic colored gels — warm reddish-orange light from the left illuminating her face, neck, and left side of the shirt; cool vibrant lime green light from the right highlighting the right side of her pants and shirt and casting a strong green cast on the background. Clear division of color on the background from warm brown-orange left to bright lime green right. Shadows add depth; high-quality sharp focus. Modern, edgy, fashion-forward mood.`,
    styleNotes: 'Split gel lighting (warm left, lime right), rust shirt, checkerboard pants, bold editorial. Use for fashion editorial, statement pieces.',
  },
  {
    id: 'editorial-projected-light-chromatic',
    name: 'Editorial – Projected Light Patterns Chromatic',
    prompt: `Medium shot of a young East Asian woman in a contemplative pose, looking to the left. Long, dark, wavy hair over shoulders; simple mustard yellow long-sleeved shirt; warm skin tone, subtle makeup, hint of blush, orange-toned lipstick. Strong natural light enters from an unseen source, casting distinct rectangular and diagonal patterns of light and shadow across a plain light grey background wall. Light patterns exhibit subtle chromatic aberration or prismatic effects with faint rainbow fringes along edges, as if light passes through textured glass or window panes. Warm reddish-orange glow from this light illuminates her right cheek and side of her nose; high-contrast play of light and shadow on face and upper body. Soft, artistic natural lighting; slightly nostalgic or film-like color grading. Calm, reflective mood; modern editorial or lifestyle portrait.`,
    styleNotes: 'Projected light patterns, chromatic aberration, mustard shirt, grey wall. Use for beauty, lifestyle editorial, artistic portraiture.',
  },
  {
    id: 'editorial-trench-directors-chair-red',
    name: 'Editorial – Trench & Director’s Chair on Red',
    prompt: `Fashion editorial medium shot of a person seated on a light wooden director's chair, face largely cropped (only lower chin and neck, dark hair visible). They wear a long double-breasted trench coat in light tan or khaki with dark brown buttons and classic lapel; underneath, a crisp white collared shirt and solid black necktie. Legs crossed at the knees; cream or off-white crew socks with two distinct black horizontal stripes near the cuff; sleek black patent leather loafers. One arm rests casually on the crossed leg; the other hand raised toward the head in a thoughtful gesture. Background: solid, clean, vibrant reddish-orange. Lighting soft and even, studio-style, minimal harsh shadows; textures of fabric and sheen of shoes highlighted. Modern, clean, editorial aesthetic; emphasis on fashion and style.`,
    styleNotes: 'Director’s chair, trench + white shirt + black tie, striped socks, patent loafers, red backdrop. Use for classic fashion, tailoring campaigns.',
  },
  {
    id: 'editorial-vintage-academic-armchair',
    name: 'Editorial – Vintage Academic Armchair Interior',
    prompt: `Full-body editorial portrait of a young East Asian man seated centrally in a mustard yellow or olive green velvet armchair, facing the viewer with a calm, neutral expression. Hands clasped loosely in lap, legs crossed at ankles. Dark medium-length hair with fringe. Attire: light brown crew-neck knit sweater over a white collared shirt with subtle dark patterned print; dark grey and brown plaid trousers slightly cropped; brown and black checkered socks; brown lace-up chukka or desert boots. Setting: dark deep brown or black wall; left side — tall woven basket with lush green plants, ivy draped from upper left, hint of dark blue-green fabric; right side — small dark side table with patterned cloth, stack of old books, ornate golden object, blue ceramic table lamp with white shade, vintage globe, green vase with pink-purple and yellow flowers. Floor: distressed or vintage-patterned surface in mottled brown and grey; patches of green moss-like material around armchair base; dark jacket with gold buttons and vintage brown leather suitcase on floor. Lighting: soft, warm, dim indoor artificial; table lamp as visible source. Contemplative, sophisticated, slightly nostalgic; modern editorial fashion with vintage academic theme.`,
    styleNotes: 'Vintage academic interior, velvet armchair, knit + plaid, lamp and books. Use for heritage, intellectual, lifestyle editorial.',
  },
  {
    id: 'editorial-newspaper-set-neon-jacket',
    name: 'Editorial – Newspaper Set Neon Jacket Low Angle',
    prompt: `Low-angle full-body editorial portrait of a young woman seated confidently in an environment entirely covered in newspapers — walls, floor, and the chair she sits on. Newspapers create a textured monochrome backdrop with splashes of color from ads and headlines (e.g. RONA, Ingeborg Shoes, JOB FAIR). She has dark straight hair and slim dark sunglasses, cool direct gaze toward viewer. Outfit: black turtleneck; bright neon lime green or yellow cropped collared jacket with subtle puff sleeves and faint gold chain strap; loose wide-leg black pants with fringed or textured detail down outer seams; clean white sneakers with white laces. Pose: relaxed but powerful, arms spread wide resting on newspaper-covered armrests of the improvised chair. Lighting bright and even; subject and attire stand out against the busy backdrop. Contemporary, editorial, avant-garde; high-quality sharp focus on subject.`,
    styleNotes: 'Newspaper-covered set, neon lime jacket, low angle, bold composition. Use for streetwear, avant-garde fashion.',
  },
  {
    id: 'editorial-trio-bench-upward-gaze',
    name: 'Editorial – Trio on Bench Upward Gaze',
    prompt: `Minimalist editorial photograph of three individuals — two women and one man — sitting side by side on a dark sleek bench against a stark white brick wall with clearly visible horizontal and vertical mortar lines. All three look upwards with heads tilted back in a uniform, contemplative pose. Left: young woman with long dark hair, plain white short-sleeve t-shirt, loose black pants, black lace-up boots, hands clasped in lap. Center: Black man, shirtless, upper body painted or covered in matte deep black substance, sculptural appearance, defined torso; dark cropped trousers above ankle, barefoot. Right: young woman with long dark hair, loose light brown or beige textured crew-neck sweater, cream or pale beige cropped pants, white low-top sneakers, hands in lap. Foreground: flat light grey concrete or tiled floor. Lighting: bright, cool neutral, soft but defined shadows beneath bench and subjects. Modern, artistic, stark editorial feel; symmetrical composition; muted palette; focus on human form, identity, and shared experience.`,
    styleNotes: 'Three on bench, white brick wall, upward gaze, one body painted black. Use for conceptual fashion, art direction.',
  },
  {
    id: 'editorial-cloud-sky-contemplative',
    name: 'Editorial – Contemplative Against Cloud Sky',
    prompt: `Editorial-style portrait of a young woman against a vast, cloudy sky. She is in the lower-middle section of the frame, occupying roughly the lower third; approximately two-thirds of the upper frame is expansive soft blue and scattered white and light grey clouds. No horizon line or ground elements — only sky visible. She has dark shoulder-length straight or slightly wavy hair, medium skin tone. Attire: blazer or jacket with small houndstooth or check pattern in brown, grey, and off-white; light-colored top (white or cream) with visible collar and buttoned cuffs. Head tilted slightly down, gaze toward the left; right hand raised with fingers touching or running through the hair at the side of her head; pensive, casual gesture. Lighting natural, soft, even; overcast or diffused sunlight; no harsh shadows. Mood: quiet, contemplative, slightly ethereal. Muted palette: blues, whites, greys, earthy tones from clothing. Sharp focus on subject; clouds soft backdrop.`,
    styleNotes: 'Vast cloud sky, houndstooth blazer, contemplative pose, lower-third composition. Use for lifestyle, fragrance, dreamy editorial.',
  },
  {
    id: 'editorial-tropical-night-ruffled-collar',
    name: 'Editorial – Tropical Night Ruffled Collar',
    prompt: `Medium shot editorial portrait of a young South Asian or Middle Eastern woman standing outdoors or in a studio set resembling a tropical or nocturnal environment. Dense green foliage on the left with individual leaves and branches visible; on the right, taller darker palm-like leaves silhouetted against a lighter hazy background. Strong red light source illuminates the wall behind the plants and partially highlights her hair and the right side of her face and shirt, casting warm tones and subtle shadows through the foliage; dramatic, moody atmosphere. She faces forward with head tilted slightly to her right. Left hand raised to her face, fingers gently spread across cheek and eye area, thoughtful or contemplative expression. Full lips, gaze toward viewer. Short wavy bob with subtle blue or green highlights on the side nearest the red light. Attire: loose-fitting collared white shirt (linen or cotton), top buttons undone, V-neckline; distinctive white intricately ruffled or lace-edged collar around her neck; long voluminous sleeves. Shallow depth of field; woman in sharp focus, background softly blurred. Subtle film-like grain or texture. Modern, artistic, mysterious editorial mood.`,
    styleNotes: 'Red light through foliage, ruffled white collar, tropical night mood. Use for beauty, fashion editorial, atmospheric portraiture.',
  },
  // ─── Message 4 (8) – prompts written from image descriptions ───
  {
    id: 'studio-high-angle-hands-frame-face',
    name: 'Studio – High-Angle Hands Framing Face',
    prompt: `Dynamic high-angle fashion portrait of a young man with curly light brown hair and blue eyes, wearing a dark gray fleece zip-up jacket with bold black lettering (e.g. PLAY), ribbed cuffs with alternating dark gray and black stripes, plain off-white or cream t-shirt underneath, silver chain necklace with stylized pendant. Black cargo pants with pocket on upper thigh; orange and black sneakers (white midsole, black outsole) visible. Pose: crouching or leaning forward with wide stance, both hands extended toward the camera in the foreground framing his face — left hand higher and open, right hand lower with fingers curved, silver geometric triangular ring on ring finger. Background: seamless bright white or very light gray studio. Lighting: bright, soft, even, cool neutral; minimal shadows; textures of clothing and facial details highlighted. Modern, youthful, rebellious street-fashion editorial; high-resolution, sharp, flawless; realistic physical light and textures.`,
    styleNotes: 'High angle, hands framing face, gray fleece, orange sneakers, white studio. Use for streetwear, youth campaigns.',
  },
  {
    id: 'studio-red-backdrop-caesars-cap',
    name: 'Studio – Red Backdrop Caesars Cap & Leather',
    prompt: `High-angle full-body editorial portrait of a young man with mustache and dark hair, black baseball cap with "CAESARS PALACE" in light stylized font, looking directly at the camera. Right hand gently adjusting dark sunglasses; left hand casually on hip. Outfit: black t-shirt or crew neck, unbuttoned black faux leather jacket or blazer; multiple delicate gold chain necklaces with small pendant (e.g. initial E); black leather or faux leather pants. Crisp white sneakers with prominent red accents on soles and inner lining. Ring with dark stone on right hand; subtle tattoos on right forearm; small hoop or stud earrings. Background: solid vibrant red. Lighting: bright, even, high-key studio with minimal shadows. Wide-angle perspective looking down; dynamic, engaging composition. Cool, confident, fashion-forward mood.`,
    styleNotes: 'Solid red backdrop, Caesars cap, black leather, gold chains, white sneakers red accent. Use for streetwear, bold editorial.',
  },
  {
    id: 'editorial-dark-blue-bape-sweater',
    name: 'Editorial – Dark Blue Backdrop BAPE Sweater',
    prompt: `Modern editorial side-profile portrait of a young man with short dark tightly curled hair and neatly trimmed goatee. Head tilted slightly upward, gaze toward upper left; contemplative or aspirational look; neutral or slightly serious expression; defined cheekbones, full lips. Attire: contemporary rectangular clear-framed sunglasses with reflective lenses; thick silver chain with large interlocking links and distinct clasp at center; light blue crew-neck knitted sweater with large white plush highly stylized graphic (e.g. BAPE or similar bubbly graffiti-like font) on front, raised soft texture. Background: solid deep royal blue or dark blue; clean, impactful contrast. Lighting: cool and even, professional studio; key from front-right creating subtle highlights on forehead, nose bridge, lips, top of head; soft shadows under chin and on left side of face and body. Modern, artistic, fashion-forward; emphasis on style and clean aesthetics; sharp focus on face and clothing.`,
    styleNotes: 'Dark blue backdrop, clear sunglasses, BAPE-style sweater, side profile. Use for streetwear, hype fashion editorial.',
  },
  {
    id: 'low-angle-yellow-blocks-bomber-sneaker',
    name: 'Editorial – Low-Angle Yellow Blocks Bomber & Sneaker',
    prompt: `Dynamic low-angle full-body portrait of a young man with dark curly hair, subtle smile, direct confident gaze. He is seated or posed on bright yellow geometric blocks against a gradient of vivid orange and bright yellow studio background; soft slightly hazy or smoky texture in upper left. Attire: black bomber or varsity jacket with white and yellow striped ribbed cuffs and collar; white and yellow embroidered emblem (e.g. stylized H) on left chest; light beige or khaki joggers with elasticated cuffs; clean white sneakers with double-chevron or two-arrow logo on side (e.g. Hummel). One sneaker (raised leg) prominently in extreme foreground, filling bottom center of frame, sole and side profile showcased; other foot on yellow block. Pose: leaning back or sitting on blocks, left leg bent with foot elevated toward camera. Lighting: warm, directional, predominantly yellow and orange; soft shadows defining features and clothing folds; subtle glow or lens flare upper right. Youthful, stylish, energetic; modern streetwear or fashion editorial; premium advertisement or sneaker-focused piece; sharp focus on subject and attire.`,
    styleNotes: 'Low angle, yellow geometric blocks, bomber jacket, sneaker hero in foreground, orange-yellow gradient. Use for sneaker, streetwear campaigns.',
  },
  {
    id: 'high-angle-blazer-neon-sunglasses',
    name: 'Studio – High-Angle Blazer Neon Green Sunglasses',
    prompt: `High-angle full-body editorial portrait of a young person (female or gender-neutral) with dark hair pulled back, positioned centrally, tilted slightly upward. Dynamic, slightly playful pose; wide genuine smile showing teeth; eyes obscured by prominent thick-framed rectangular sunglasses in vibrant bright neon green with dark lenses. Attire: oversized double-breasted grey blazer with subtle fine-checked or textured pattern, classic lapels, wool-like fabric; underneath, light blue and white striped collared shirt partially unbuttoned; at bottom of frame, bright red possibly patent leather low-heeled or flat shoes. Small silver hoop earring visible. Background: plain seamless white or very light grey. Lighting: bright, even, cool-toned; high-key studio with minimal soft shadows; clarity and detail emphasized. Modern, stylish, confident editorial; classic elements (blazer, striped shirt) with bold contemporary accents (neon green sunglasses, red shoes); high-angle perspective adding energetic, unique dynamic; slight fisheye-like optical distortion.`,
    styleNotes: 'High angle, oversized blazer, neon green sunglasses, red shoes, white background. Use for bold fashion, Gen Z editorial.',
  },
  {
    id: 'paparazzi-flash-surrounded-cameras',
    name: 'Editorial – Paparazzi Flash Surrounded by Cameras',
    prompt: `Dramatic high-contrast editorial portrait of a man (East Asian or mixed heritage, young to middle-aged, dark complexion) from chest up, seated, looking directly forward with composed, confident expression. He is surrounded by multiple hands holding smartphones and professional cameras with bright flashes illuminating him; paparazzi-like atmosphere. Dark hair slicked back or low ponytail/bun; distinct mustache and short well-groomed goatee; eyes hidden behind dark rectangular sunglasses with thick frames. Attire: black turtleneck under black possibly double-breasted blazer or suit jacket; prominent gold chain with large simple gold cross pendant on the turtleneck; large elaborate possibly diamond-encrusted ring on right hand; small silver hoop earrings both ears. Left arm visible with tattoo on forearm beneath rolled-up jacket sleeve; legs crossed, dark trousers in lower right. Foreground and background filled with blurred flashing presence of devices and subtle outlines of other people. Lighting: intense harsh lighting from multiple camera flashes; strong highlights on face, clothing, accessories; deep dramatic shadows; visible lens flares. Shallow depth of field; man sharp, foreground hands and background blurred. Color palette: blacks, golds, bright white of flashes. Celebrity, red-carpet, fashion editorial, intense public scrutiny; modern, slightly rebellious aesthetic.`,
    styleNotes: 'Paparazzi flash, surrounded by camera phones, gold cross, black turtleneck. Use for celebrity-style editorial, luxury streetwear.',
  },
  {
    id: 'high-angle-zebra-crossing-mens-casual',
    name: 'Street – High-Angle Zebra Crossing Mens Casual',
    prompt: `Full-body high-angle editorial shot of a young man standing on a zebra crossing (pedestrian crosswalk), looking directly up at the camera with confident, slightly serious expression. Dark neatly styled short hair; clear skin, defined jawline. Attire: plain black short-sleeve t-shirt slightly tucked at front; light blue relaxed-fit baggy jeans; sneakers primarily beige or cream with black accents on sides and white laces. Accessories: thin silver chain necklace; rectangular black sunglasses; prominent gold watch on left wrist; hands casually in jean pockets. Pose: feet slightly apart, left foot slightly forward; relaxed yet self-assured posture. Setting: black and white zebra crossing, wide white stripes horizontal across frame with dark grey/black asphalt; texture of asphalt and painted lines clearly visible; outdoor urban setting. Camera angle: high, looking down. Lighting: bright natural daylight; well-lit scene with soft minimal shadows. Clean, modern, urban street-style aesthetic; fashion editorial photography.`,
    styleNotes: 'High angle, zebra crossing, black tee, light jeans, gold watch, casual stance. Use for streetwear, menswear casual editorial.',
  },
  {
    id: 'diptych-overpass-dusk-contemplative',
    name: 'Editorial – Diptych Overpass Dusk Contemplative',
    prompt: `Two-panel vertical diptych, cinematic editorial. Top panel: medium close-up of a young woman slightly blurred and in motion, central, facing slightly right, head tilted back and left, eyes closed or nearly closed, lips slightly parted, pensive or dreamy expression. Medium-brown wavy hair around shoulders; dark blue top and dark jacket; foreground out of sharp focus, soft ethereal effect. Background: multi-lane city road with streetlights, car headlights and taillights, green public bus on left; across water, city skyline with countless building lights; sky deep twilight blue with faint orange and pink near horizon (late dusk or early night). Blurred woman against bustling backdrop; sense of detachment or introspection. Bottom panel: same woman in sharp focus, waist up, standing at overpass railing, both hands on light-colored railing, leaning forward, head tilted up, gaze toward sky or distant city lights; expression of wonder, contemplation, or longing. Wavy medium-brown hair; dark blue fitted t-shirt or top under dark slightly shiny open jacket (leather or satin); light beige or off-white trousers; delicate necklace, watch or bracelet on left wrist. Background: same city road, traffic, water, glowing cityscape, twilight sky; sharp focus on woman, distant lights slightly bokeh. Diptych juxtaposes blurry dreamy motion with sharp still introspection. Cool, muted urban palette: blues, grays, warm yellow-orange of artificial lights; low-key, atmospheric; concrete railing and asphalt texture. Cinematic street photography or editorial portrait; natural, candid feel; realism and emotional state within urban landscape.`,
    styleNotes: 'Diptych: overpass at dusk, blur then sharp, city lights, contemplative. Use for cinematic lifestyle, emotional editorial.',
  },
  {
    id: 'street-city-crossing-stillness-daylight',
    name: 'Street Editorial - Daylight City Crossing Stillness',
    prompt: `A cinematic street-fashion portrait of a Black man standing still in the center of a busy city avenue while pedestrians move past him in heavy directional motion blur. He remains tack-sharp and calm, hands in pockets, wearing a textured light beige overcoat over muted layers. Mid-telephoto framing from chest to knees, camera centered for symmetry with converging street lines and buildings receding into the distance. Late afternoon natural sunlight with a warm key across the face and coat, soft urban fill from the street canyon, and subtle cool shadows in the lower frame. Passing figures become painterly streaks at both sides, preserving an emotional contrast between stillness and chaos. Real asphalt texture, real traffic and cabs in the background, no fantasy effects. Contemporary fashion editorial mood, introspective and restrained, realistic skin texture and fabric weave, high-detail cinematic realism.`,
    styleNotes: 'City center still subject with long-exposure crowd blur in daylight. Use for introspective fashion storytelling and metro editorial campaigns.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\Midjourney_  A Black man stands calmly amidst the bustling city_.jpg',
  },
  {
    id: 'editorial-office-flash-foot-foreground',
    name: 'Editorial - Office Flash with Foot in Foreground',
    prompt: `Raw analog-inspired editorial portrait of a young man reclining in a black office chair inside a paneled room, captured with direct frontal flash. One sneaker sole dominates the lower-left foreground, exaggerated by a wide-angle lens, while the subject leans back with a relaxed but confrontational expression, fingers near temple. Wardrobe: oversized white graphic tee, muted olive cargo pants with visible seam structure, watch and minimal bracelet, casual retro sneakers. Background includes white wall paneling, a dark desk surface, and subtle office clutter to keep the frame lived-in and real. Lighting is harsh on-camera flash with crisp shadow edges and mild falloff to the walls, creating a late-90s magazine feel. Keep skin natural with visible texture, preserve fabric folds and shoe wear, slight film grain, matte finish, candid editorial imperfection.`,
    styleNotes: 'Direct flash office portrait with exaggerated foreground sneaker. Use for youth streetwear and rebellious lifestyle editorials.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\Calling you 🤙__#90s #8march #oldschool #viral.jpg',
  },
  {
    id: 'editorial-warehouse-bucket-hat-sneaker',
    name: 'Street Editorial - Warehouse Bucket Hat Sneaker Hero',
    prompt: `Low-angle streetwear editorial of a man seated on a rough concrete ledge in an industrial warehouse with tall window grids and warm daylight streaming in. He wears a dark bucket hat, clear glasses, dark denim jacket, light shorts, crew socks with bold vertical text, and black-and-white sneakers that read sharply in the foreground. Accessories include layered chain, gold bracelet, ring, and takeaway iced coffee cup as a lifestyle prop. Composition prioritizes footwear and lower-body styling from a near-ground camera position while maintaining strong eye contact and attitude. Lighting is natural directional daylight softened by window diffusion, with realistic contrast, concrete dust texture, and subtle warm highlights on skin and denim seams. Urban, relaxed, premium sneaker-ad mood with tactile realism and no artificial CGI sheen.`,
    styleNotes: 'Industrial windows, seated bucket-hat styling, low-angle sneaker emphasis. Use for footwear campaigns and street lifestyle ads.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\_Bucket Hat Style & Graphic Socks OOTD.jpg',
  },
  {
    id: 'street-alley-bandana-crouch',
    name: 'Street Editorial - Bandana Alley Crouch',
    prompt: `A gritty urban fashion editorial portrait of a young woman crouching low in the middle of a narrow brick alley, shot at street level with a subtle wide-angle lens. She wears a printed bandana, slim wraparound sunglasses, strapless brown top, distressed light-wash baggy jeans, and chunky gray-white sneakers. Pose is grounded and powerful: elbows resting near knees, one hand lightly touching the asphalt, direct cool gaze at camera. Natural overcast daylight keeps skin tones honest and fabrics soft while preserving detail in denim tears, asphalt grain, and brick textures with fire escapes rising behind. Palette is muted reds, browns, and slate grays for a documentary-meets-editorial mood. Keep focus crisp on face and outfit with mild depth falloff in the alley background, realistic proportions, and no glam smoothing.`,
    styleNotes: 'Street-level crouch in brick alley with bandana and distressed denim. Use for Gen Z streetwear and sneaker-focused social ads.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\download (7).jpg',
  },
  {
    id: 'editorial-low-angle-metal-jewelry-watch',
    name: 'Editorial - Low-Angle Metallic Jewelry Impact',
    prompt: `High-fashion studio portrait shot from an extreme low angle, placing an outstretched hand in the immediate foreground as the hero element. A young woman in futuristic street couture wears oversized reflective sunglasses, sculptural metallic arm cuffs, stacked chrome bracelets, elongated metallic nails, and a bright neon-lime statement watch. Outfit mixes dark denim and technical textures with visible seams and patch details. Background is seamless light gray-white, minimal and clean, allowing accessories to dominate. Lighting is crisp studio key with controlled highlights for metal reflections, soft fill to retain skin texture, and subtle shadow shaping under jaw and arms. Composition is dramatic and confrontational with natural perspective distortion from the low viewpoint, premium editorial sharpness, and a cool, modern luxury-tech vibe.`,
    styleNotes: 'Extreme low-angle hand-forward composition with metallic jewelry and lime watch. Use for accessories, watches, and futuristic fashion ads.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\download (6).jpg',
  },
  {
    id: 'editorial-white-studio-forced-perspective-hand',
    name: 'Editorial - White Studio Forced Perspective Hand',
    prompt: `Experimental fashion portrait in a seamless white studio, shot with a close wide lens to exaggerate forced perspective. A crouching young man extends one hand aggressively toward camera so fingers fill most of the frame, while his face and body stay visible behind in sharp editorial styling. Wardrobe combines an orange ribbed knit top, faded dark denim, tinted sunglasses, rings, and bold western-inspired pointed shoes with red-and-black flame motifs. Lighting is bright and neutral with subtle analog texture, preserving skin details, knit weave, and distressed denim grain. The pose feels rebellious and kinetic, as if captured mid-gesture in a raw studio session. Maintain realistic anatomy despite perspective stretch, crisp focus transitions, and modern magazine-level clarity with mild film grit.`,
    styleNotes: 'White studio forced-perspective hand with crouch and flame boots. Use for bold youth editorials and statement footwear campaigns.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\download (5).jpg',
  },
  {
    id: 'editorial-night-fisheye-car-crouch',
    name: 'Street Editorial - Night Fisheye Car Crouch',
    prompt: `Cinematic night street portrait in a neon-lit entertainment district, captured with a fisheye-wide lens for immersive perspective. A young woman with short platinum hair crouches low on wet cracked asphalt directly in front of a white sports car, with bright urban signage and parked dark vehicles framing the scene. Styling is casual-street: oversized dark sweatshirt, loose light pants, worn canvas sneakers. She looks straight into camera with relaxed confidence and a slightly detached expression. Lighting is mixed practical neon and sodium streetlight, producing warm-cool color contrast, reflective highlights on car paint, and moody urban shadows. Include subtle analog grain, slight lens edge distortion, and realistic nighttime noise while keeping the subject sharp and centered. The mood is rebellious, nocturnal, and documentary-fashion hybrid.`,
    styleNotes: 'Fisheye night city crouch in front of sports car with neon signage. Use for automotive-streetwear crossovers and nightlife campaigns.',
    imagePath: 'c:\\Users\\Tamada\\Downloads\\download (4).jpg',
  },
  {
    id: 'editorial-skyscraper-low-angle-sneaker-hero',
    name: 'Editorial - Skyscraper Low-Angle Sneaker Hero',
    prompt: `Ultra-real urban fashion editorial captured from a dramatic low ground-level angle in a modern financial district with glass skyscrapers rising overhead against a clear saturated blue sky. A young woman crouches confidently in the foreground, one sneaker dominating the lower frame as the hero product, with the city architecture curving around her through subtle wide-lens perspective. Styling is clean sporty streetwear: white tee, short bottoms, white crew socks, and chunky white sneakers with visible sole geometry and stitching detail. Lighting is bright natural midday sun with crisp directional shadows on pavement, high contrast, and real reflective highlights on building facades. Keep expression calm but assertive with direct camera connection. Preserve realistic concrete texture, urban depth, and true optical behavior without synthetic blur.`,
    styleNotes: 'Extreme low-angle city architecture with foreground sneaker dominance. Use for premium sneaker campaigns and urban performance fashion.',
    imagePath: 'embedded://image_1',
  },
  {
    id: 'editorial-studio-extreme-kick-monochrome',
    name: 'Editorial - Studio Extreme Kick Monochrome',
    prompt: `Minimalist high-fashion studio portrait on a clean light-gray seamless background, shot from a very low angle with forced perspective. A woman in tailored monochrome plaid outerwear and wide-leg trousers steps forward with one heavy black combat boot thrust toward camera, sole texture sharply visible and dominating the frame. The subject keeps a composed, high-fashion expression with strong posture and long limb lines. Lighting is neutral, diffused, and technical: broad soft key with subtle edge separation, preserving fine fabric weave and boot material detail while avoiding flatness. Composition emphasizes scale contrast between the near boot and the full body in background for a commanding editorial look. Keep geometry clean, no visual artifacts, crisp detail from foreground to subject, and realistic shadow contact on studio floor.`,
    styleNotes: 'Low-angle studio kick with foreground boot, monochrome tailoring, clean seamless backdrop. Use for fashion-forward footwear and avant editorial drops.',
    imagePath: 'embedded://image_2',
  }
]

/** Look up an example by id */
export function getAdStyleExample(id: string): AdStyleExample | undefined {
  return AD_STYLE_EXAMPLES.find((e) => e.id === id)
}
