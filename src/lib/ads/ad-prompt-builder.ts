/**
 * AD PROMPT BUILDER — Gemini Vision + Intelligent Prompt Crafting
 *
 * Gemini sees the product image directly (vision) and crafts a
 * production-quality composition prompt. No separate clothing analysis
 * needed — the model recognizes shoes, bags, shirts, accessories, etc.
 *
 * Text overlay is treated as COMPOSITIONAL TYPOGRAPHY integrated into
 * the design — not a plain text stamp.
 *
 * KEY: Uses the style reference examples from ad-style-examples.ts so
 * GPT-4o can study *real* high-quality prompts before writing its own.
 */
import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import {
  type AdGenerationInput,
  type AdPreset,
  type AdPresetId,
  type CharacterIdentity,
  getAdPreset,
  resolveStylePackForPreset,
  resolveTextSystemForPreset,
  buildFallbackPrompt,
} from './ad-styles'
import { AD_STYLE_EXAMPLES, type AdStyleExample } from './ad-style-examples'

const PROMPT_MODEL = process.env.AD_PROMPT_MODEL?.trim() || 'gemini-2.5-flash'
/** Timeout for Gemini prompt build (ms). On timeout we fall back to template prompt. */
const PROMPT_BUILD_TIMEOUT_MS = 45_000
/** Max prompt length we pass to image model (Gemini). Longer prompts are truncated with warning. */
const MAX_PROMPT_LENGTH = 4000
/** Keep prompt-writing brief compact enough to avoid refusal/overflow behaviors. */
const MAX_GPT_BRIEF_CHARS = 28_000

const STYLIZED_BLUR_PRESETS = new Set<string>(['CREATIVE_CINEMATIC', 'SPORTS_DYNAMIC'])

type PromptBuildMode = 'default' | 'safe'
type PromptBuildOutcome = 'success' | 'refusal' | 'short' | 'error' | 'fallback'

const PROMPT_METRIC_COUNTS = new Map<string, number>()
let PROMPT_METRIC_EVENTS = 0

function recordPromptMetric(presetId: AdPresetId, mode: PromptBuildMode | 'fallback', outcome: PromptBuildOutcome): void {
  const key = `${presetId}|${mode}|${outcome}`
  PROMPT_METRIC_COUNTS.set(key, (PROMPT_METRIC_COUNTS.get(key) || 0) + 1)
  PROMPT_METRIC_EVENTS += 1

  console.log('[AdPromptMetrics]', JSON.stringify({ presetId, mode, outcome, count: PROMPT_METRIC_COUNTS.get(key) }))

  if (PROMPT_METRIC_EVENTS % 25 === 0) {
    const snapshot = Array.from(PROMPT_METRIC_COUNTS.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k, v]) => ({ key: k, count: v }))
    console.log('[AdPromptMetrics] snapshot', JSON.stringify(snapshot))
  }
}

function sanitizeForOpenAI(text: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bpaparazzi\b/gi, 'direct flash editorial'],
    [/\bstreet surveillance footage\b/gi, 'candid documentary street photography'],
    [/\bsurveillance\b/gi, 'documentary'],
    [/\bperfectly mirroring the real human'?s pose\b/gi, 'standing in the same pose'],
    [/\banatomically correct\b/gi, 'anatomically plausible'],
    [/\bthrowing a powerful punch\b/gi, 'extending a boxing glove in a dynamic fitness pose'],
    [/\bchopsticks aimed at face\b/gi, 'chopsticks held up near camera'],
    [/\bMinecraft-style\b/gi, 'retro voxel style'],
    [/\bweapons?\b/gi, 'sharp objects'],
  ]

  let out = text
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function compactForOpenAI(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const head = text.slice(0, Math.max(0, maxChars - 700))
  const tail =
    '\n\n[TRUNCATED FOR SAFETY/LENGTH] Keep the same product fidelity, visual realism, and composition hierarchy.\n'
  return head + tail
}

function estimateUserContentChars(content: any[]): number {
  let total = 0
  for (const part of content) {
    if (part?.type === 'text' && typeof part?.text === 'string') {
      total += part.text.length
    } else if (part?.type === 'image_url' && typeof part?.image_url?.url === 'string') {
      total += part.image_url.url.length
    }
  }
  return total
}

function isRefusalLike(text?: string | null): boolean {
  if (!text) return true
  const t = text.toLowerCase()
  return (
    t.includes("i'm sorry") ||
    t.includes('i cannot assist') ||
    t.includes("i can't assist") ||
    t.includes('cannot help with that') ||
    t.includes('can’t assist with that')
  )
}

// ═══════════════════════════════════════════════════════════════
// PRESET → STYLE EXAMPLE MAPPING
// Each preset maps to the most relevant training examples so
// Gemini can study them before writing the final prompt.
// ═══════════════════════════════════════════════════════════════

const PRESET_EXAMPLE_MAP: Record<string, string[]> = {
  UGC_CANDID: [
    'street-crosswalk-high-angle-candid',
    'urban-crosswalk-sporty-streetwear-motion',
    'high-angle-zebra-crossing-mens-casual',
    'editorial-tropical-night-ruffled-collar',
    'diptych-overpass-dusk-contemplative',
    'lifestyle-gas-station-night-porsche-medellin',
  ],
  UGC_STREET: [
    'editorial-skyscraper-low-angle-sneaker-hero',
    'street-crosswalk-high-angle-candid',
    'street-alley-bandana-crouch',
    'urban-crosswalk-sporty-streetwear-motion',
    'high-angle-zebra-crossing-mens-casual',
    'editorial-denim-corset-faux-fur-wall',
    'raw-analog-lacoste-tennis-court',
    'editorial-warehouse-bucket-hat-sneaker',
  ],
  EDITORIAL_PREMIUM: [
    'overhead-bed-editorial-contemplative',
    'editorial-composite-leather-projected-face',
    'editorial-side-profile-bouquet-minimal',
    'editorial-winter-mountain-faux-fur',
    'editorial-sheer-patent-red-backdrop',
    'editorial-trench-directors-chair-red',
    'editorial-vintage-academic-armchair',
    'editorial-cloud-sky-contemplative',
  ],
  EDITORIAL_FASHION: [
    'editorial-studio-extreme-kick-monochrome',
    'editorial-denim-corset-faux-fur-wall',
    'editorial-composite-leather-projected-face',
    'editorial-low-angle-metal-jewelry-watch',
    'editorial-split-gel-rust-checkerboard',
    'editorial-white-studio-forced-perspective-hand',
    'editorial-newspaper-set-neon-jacket',
    'reeded-glass-neon-green-tracksuit',
  ],
  EDITORIAL_STREET: [
    'street-crosswalk-high-angle-candid',
    'street-alley-bandana-crouch',
    'urban-crosswalk-sporty-streetwear-motion',
    'editorial-denim-corset-faux-fur-wall',
    'raw-analog-lacoste-tennis-court',
    'high-angle-zebra-crossing-mens-casual',
    'editorial-night-fisheye-car-crouch',
  ],
  EDITORIAL_RETRO: [
    'editorial-vintage-doorway-flash-70s',
    'editorial-office-flash-foot-foreground',
    'raw-analog-lacoste-tennis-court',
    'editorial-trench-directors-chair-red',
    'editorial-vintage-academic-armchair',
  ],
  EDITORIAL_CONCEPTUAL: [
    'street-city-crossing-stillness-daylight',
    'metro-platform-stillness-motion-blur',
    'reeded-glass-neon-green-tracksuit',
    'editorial-composite-leather-projected-face',
    'editorial-trio-bench-upward-gaze',
    'diptych-overpass-dusk-contemplative',
  ],
  CREATIVE_CINEMATIC: [
    'editorial-skyscraper-low-angle-sneaker-hero',
    'follow-cam-snowboard-powder-jump',
    'editorial-night-fisheye-car-crouch',
    'urban-crosswalk-sporty-streetwear-motion',
    'metro-platform-stillness-motion-blur',
    'lifestyle-gas-station-night-porsche-medellin',
    'diptych-overpass-dusk-contemplative',
    'street-city-crossing-stillness-daylight',
  ],
  CREATIVE_SURREAL: [
    'creative-sci-fi-cryogenic-helmet-portrait',
    'editorial-trio-bench-upward-gaze',
    'editorial-newspaper-set-neon-jacket',
  ],
  CREATIVE_BOLD_COLOR: [
    'reeded-glass-neon-green-tracksuit',
    'editorial-low-angle-metal-jewelry-watch',
    'editorial-sheer-patent-red-backdrop',
    'studio-red-backdrop-caesars-cap',
    'editorial-split-gel-rust-checkerboard',
    'editorial-white-studio-forced-perspective-hand',
    'low-angle-yellow-blocks-bomber-sneaker',
  ],
  SPORTS_DYNAMIC: [
    'editorial-studio-extreme-kick-monochrome',
    'follow-cam-snowboard-powder-jump',
    'editorial-warehouse-bucket-hat-sneaker',
    'raw-analog-lacoste-tennis-court',
    'urban-crosswalk-sporty-streetwear-motion',
    'low-angle-yellow-blocks-bomber-sneaker',
    'studio-high-angle-hands-frame-face',
  ],
  PRODUCT_LIFESTYLE: [
    'lifestyle-gas-station-night-porsche-medellin',
    'editorial-winter-mountain-faux-fur',
    'urban-crosswalk-sporty-streetwear-motion',
    'editorial-vintage-academic-armchair',
    'editorial-trench-directors-chair-red',
  ],
  PERF_BEST_QUALITY: [
    'street-city-crossing-stillness-daylight',
    'overhead-bed-editorial-contemplative',
    'editorial-composite-leather-projected-face',
    'editorial-side-profile-bouquet-minimal',
    'editorial-sheer-patent-red-backdrop',
    'editorial-trench-directors-chair-red',
    'lifestyle-gas-station-night-porsche-medellin',
  ],
  // ── Cinematic Presets ──
  CINEMATIC_NEO_NOIR: [
    'diptych-overpass-dusk-contemplative',
    'lifestyle-gas-station-night-porsche-medellin',
    'editorial-night-fisheye-car-crouch',
    'metro-platform-stillness-motion-blur',
  ],
  CINEMATIC_STREET_CULTURE: [
    'raw-analog-lacoste-tennis-court',
    'high-angle-zebra-crossing-mens-casual',
    'street-alley-bandana-crouch',
    'editorial-warehouse-bucket-hat-sneaker',
  ],
  CINEMATIC_JEWELRY_CLOSEUP: [
    'editorial-low-angle-metal-jewelry-watch',
    'editorial-side-profile-bouquet-minimal',
    'editorial-tropical-night-ruffled-collar',
  ],
  CINEMATIC_MINECRAFT_HYBRID: [
    'creative-sci-fi-cryogenic-helmet-portrait',
    'editorial-newspaper-set-neon-jacket',
    'editorial-trio-bench-upward-gaze',
  ],
  CINEMATIC_STUDIO_EDITORIAL: [
    'editorial-sheer-patent-red-backdrop',
    'editorial-side-profile-bouquet-minimal',
    'editorial-trench-directors-chair-red',
    'overhead-bed-editorial-contemplative',
    'editorial-studio-extreme-kick-monochrome',
  ],
  CINEMATIC_RETRO_FLIRTY: [
    'editorial-vintage-doorway-flash-70s',
    'editorial-vintage-academic-armchair',
    'raw-analog-lacoste-tennis-court',
    'editorial-office-flash-foot-foreground',
    'editorial-tropical-night-ruffled-collar',
  ],
  CINEMATIC_IPHONE_STREET: [
    'street-crosswalk-high-angle-candid',
    'high-angle-zebra-crossing-mens-casual',
    'urban-crosswalk-sporty-streetwear-motion',
    'editorial-warehouse-bucket-hat-sneaker',
    'street-alley-bandana-crouch',
  ],
  CINEMATIC_GOLDEN_GARDEN: [
    'editorial-side-profile-bouquet-minimal',
    'editorial-cloud-sky-contemplative',
    'editorial-winter-mountain-faux-fur',
    'overhead-bed-editorial-contemplative',
  ],
}

const IDENTITY_EXAMPLE_MAP: Partial<Record<CharacterIdentity, string[]>> = {
  indian_woman_modern: ['editorial-tropical-night-ruffled-collar', 'editorial-side-profile-bouquet-minimal', 'street-crosswalk-high-angle-candid'],
  indian_man_modern: ['editorial-trench-directors-chair-red', 'high-angle-zebra-crossing-mens-casual', 'editorial-dark-blue-bape-sweater'],
  south_asian_modern: ['editorial-tropical-night-ruffled-collar', 'editorial-cloud-sky-contemplative', 'street-crosswalk-high-angle-candid'],
}

const NON_INDIAN_BIASED_EXAMPLES = new Set<string>([
  'editorial-trench-directors-chair-red',
  'editorial-cloud-sky-contemplative',
  'street-crosswalk-high-angle-candid',
  'studio-red-backdrop-caesars-cap',
])

const TEXT_SYSTEM_EXAMPLES: Record<string, string[]> = {
  luxury_masthead: ['luxury-masthead-motion-blur'],
  highstreet_panel: ['highstreet-poster-panel-layout'],
  sports_brush: ['sports-brush-slogan-packshot', 'sports-handheld-vertical-type'],
}

/** Presets that default to "no model" but should respect user's explicit character choice */
const PRODUCT_ONLY_PRESETS: Set<string> = new Set([
  'PRODUCT_HERO',
  'STANDALONE_CLEAN',
  'STANDALONE_SURREAL',
  'STANDALONE_LUXURY_MACRO',
  'STANDALONE_LEVITATION',
  'CREATIVE_3D_RENDER',
  'CREATIVE_DECONSTRUCTED',
  'CREATIVE_GLASSMORPHISM',
  'PERF_MINIMAL_CLEAN',
  'COMMERCIAL_CAROUSEL',
  'UGC_FLAT_LAY',
])

function getStyleExamplesForPreset(input: AdGenerationInput, hasCharacter: boolean): AdStyleExample[] {
  const presetId = input.preset
  let ids = PRESET_EXAMPLE_MAP[presetId] || []
  const identity = input.characterIdentity
  const hasIndianIdentity =
    identity === 'indian_woman_modern' || identity === 'indian_man_modern' || identity === 'south_asian_modern'

  // If user explicitly chose a character on a product-only preset, swap in
  // character-inclusive references so GPT-4o generates with a model
  if (hasCharacter && PRODUCT_ONLY_PRESETS.has(presetId)) {
    ids = ['text-based-dynamic-magenta', 'creative-bold-color-studio', 'creative-fashion-kick-identity']
  }

  if (hasCharacter && identity && IDENTITY_EXAMPLE_MAP[identity]) {
    const identityIds = IDENTITY_EXAMPLE_MAP[identity] || []
    const filteredPresetIds = hasIndianIdentity
      ? ids.filter((id) => !NON_INDIAN_BIASED_EXAMPLES.has(id))
      : ids
    ids = [...identityIds, ...filteredPresetIds]
  }

  const hasTextRequested = Boolean(
    input.textOverlay && (input.textOverlay.headline || input.textOverlay.subline || input.textOverlay.tagline)
  )
  if (hasTextRequested) {
    const textSystem = resolveTextSystemForPreset(input.preset)
    const textIds = TEXT_SYSTEM_EXAMPLES[textSystem] || []
    ids = [...textIds, ...ids]
  }

  const uniqueIds = Array.from(new Set(ids))

  return uniqueIds
    .map((id) => AD_STYLE_EXAMPLES.find((e) => e.id === id))
    .filter(Boolean)
    .slice(0, 6) as AdStyleExample[]
}

export interface ProductAnalysis {
  garmentType?: string
  fabric?: string
  pattern?: string
  color?: string
  fitStyle?: string
  [key: string]: unknown
}

export interface AdPromptResult {
  prompt: string
  model: string
  fallback: boolean
}

/**
 * Build a production-quality image generation prompt using Gemini vision.
 * Gemini sees the product image AND studies real reference prompts.
 */
export async function buildAdPrompt(
  input: AdGenerationInput,
  productImageBase64?: string | null,
  faceAnchor?: string | null
): Promise<AdPromptResult> {
  const preset = getAdPreset(input.preset)
  if (!preset) {
    throw new Error(`Unknown preset: ${input.preset}`)
  }

  try {
    const raw = await withTimeout(
      buildPromptWithGemini(preset, input, productImageBase64, faceAnchor),
      PROMPT_BUILD_TIMEOUT_MS,
      'Ad prompt build'
    )
    const prompt = sanitizeAndCapPrompt(raw)
    return { prompt, model: PROMPT_MODEL, fallback: false }
  } catch (err) {
    console.warn('[AdPromptBuilder] Gemini prompt build failed, using fallback:', err)
    recordPromptMetric(input.preset, 'fallback', 'fallback')
    const prompt = buildFallbackPrompt(input)
    return { prompt, model: 'fallback', fallback: true }
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

/** Strip markdown/code fences, trim, and cap length for image model. */
function sanitizeAndCapPrompt(raw: string): string {
  let s = raw.trim()
  if (s.startsWith('```')) s = s.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
  s = s.trim()
  if (s.length > MAX_PROMPT_LENGTH) {
    console.warn(`[AdPromptBuilder] Prompt length ${s.length} exceeds ${MAX_PROMPT_LENGTH}, truncating`)
    s = s.slice(0, MAX_PROMPT_LENGTH - 20) + '…'
  }
  return s
}

function buildStrategicIntelligenceBlock(
  input: AdGenerationInput,
  preset: AdPreset,
  hasCharacter: boolean,
  hasTextOverlay: boolean
): string {
  const platformFocus = input.platforms.includes('google')
    ? 'conversion clarity and readability at small ad sizes'
    : input.platforms.includes('instagram')
      ? 'thumb-stop impact in feed/reels with immediate visual hook in first glance'
      : input.platforms.includes('facebook')
        ? 'clear story + trust + product comprehension for mixed-age audiences'
        : 'high visual impact with brand-safe composition'

  const ratioFocus =
    input.aspectRatio === '9:16'
      ? 'vertical storytelling with strong top/middle/bottom hierarchy'
      : input.aspectRatio === '16:9'
        ? 'wide cinematic composition with clear left-right balance'
        : input.aspectRatio === '4:5'
          ? 'portrait feed optimization with central product readability'
          : 'balanced square composition with strong central focal structure'

  const textFocus = hasTextOverlay
    ? 'integrate typography as scene object with depth and occlusion'
    : 'pure photography output with zero text elements'

  const characterFocus = hasCharacter
    ? 'character-product interaction must be obvious and physically believable'
    : 'product hero must remain dominant with no accidental human subject'

  return `STRATEGIC INTELLIGENCE OBJECTIVE:
- Ad objective: ${platformFocus}
- Composition objective: ${ratioFocus}
- Text objective: ${textFocus}
- Subject objective: ${characterFocus}
- Preset fidelity: stay true to "${preset.name}" visual DNA while maximizing realism and production polish.`
}

function buildStylePackDirective(input: AdGenerationInput): string {
  const stylePack = input.stylePack || resolveStylePackForPreset(input.preset)
  if (stylePack === 'luxury') {
    return `STYLE PACK (LOCKED): LUXURY
Prioritize premium editorial polish, elevated materials, cinematic lighting, controlled color harmony, and sophisticated fashion composition.`
  }
  if (stylePack === 'sports') {
    return `STYLE PACK (LOCKED): SPORTS
Prioritize athletic energy, dynamic body language, motion-ready framing, bold hero angles, and performance-commercial realism.`
  }
  return `STYLE PACK (LOCKED): HIGH STREET
Prioritize contemporary retail campaign aesthetics, trend-forward styling, urban realism, and clean conversion-ready composition.`
}

function resolveIdentityDirective(input: AdGenerationInput): string {
  const identity = input.characterIdentity || 'global_modern'
  switch (identity) {
    case 'indian_woman_modern':
      return 'Identity direction: Indian woman with modern South Delhi fashion-forward styling. Explicitly avoid stereotypical cues (no tokenistic bindi or costume tropes unless user explicitly asks).'
    case 'indian_man_modern':
      return 'Identity direction: Indian man with modern South Delhi fashion-forward styling. Explicitly avoid stereotypical cues (no tokenistic cultural props unless user explicitly asks).'
    case 'south_asian_modern':
      return 'Identity direction: South Asian modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'east_asian_modern':
      return 'Identity direction: East Asian modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'middle_eastern_modern':
      return 'Identity direction: Middle Eastern modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'african_modern':
      return 'Identity direction: African modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'latina_modern':
      return 'Identity direction: Latina modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'european_modern':
      return 'Identity direction: European modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'north_american_modern':
      return 'Identity direction: North American modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'latin_american_modern':
      return 'Identity direction: Latin American modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'mediterranean_modern':
      return 'Identity direction: Mediterranean modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'south_east_asian_modern':
      return 'Identity direction: South East Asian modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'central_asian_modern':
      return 'Identity direction: Central Asian modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'pacific_islander_modern':
      return 'Identity direction: Pacific Islander modern identity with contemporary urban styling and non-stereotyped representation.'
    case 'mixed_heritage_modern':
      return 'Identity direction: Mixed-heritage modern identity with contemporary urban styling and non-stereotyped representation.'
    default:
      return 'Identity direction: Global modern casting and styling with non-stereotyped representation.'
  }
}

function buildIdentityCastingLock(input: AdGenerationInput): string {
  const identity = input.characterIdentity || 'global_modern'
  if (identity === 'indian_woman_modern') {
    return `CASTING LOCK (CRITICAL):
The model MUST clearly read as a modern Indian woman. Keep casting contemporary, urban, and premium (South Delhi high-street sensibility). Do NOT drift to non-Indian casting. Do NOT add tokenistic stereotypes, costumes, or clichéd cultural props unless user explicitly requests them.`
  }
  if (identity === 'indian_man_modern') {
    return `CASTING LOCK (CRITICAL):
The model MUST clearly read as a modern Indian man. Keep casting contemporary, urban, and premium (South Delhi high-street sensibility). Do NOT drift to non-Indian casting. Do NOT add tokenistic stereotypes, costumes, or clichéd cultural props unless user explicitly requests them.`
  }
  if (identity === 'south_asian_modern') {
    return `CASTING LOCK (CRITICAL):
The model MUST clearly read as South Asian with contemporary, non-stereotyped urban styling. Preserve realistic skin tone and facial structure; do not drift to unrelated identity casting.`
  }
  return `CASTING LOCK:
Honor the selected identity direction and keep casting consistent with the chosen people type.`
}

function buildFaceRealismLock(input: AdGenerationInput): string {
  const ct = input.characterType || 'none'
  const hasHuman = ct === 'human_female' || ct === 'human_male'
  if (!hasHuman) return ''

  return `HUMAN ANTI-AI SKIN & FACE LOCK (CRITICAL — NON-NEGOTIABLE):
The face and body MUST be indistinguishable from a real photograph. If it looks even slightly AI-generated, the output FAILS.
- SKIN TEXTURE (FORENSIC): Render individual pores (especially on nose, cheeks, chin, forehead), fine vellus hair (peach fuzz) visible on cheeks and jawline catching sidelight, natural sebaceous shine on T-zone (forehead, nose, chin), micro-wrinkles around eyes and mouth from muscle use, visible capillaries under thin skin areas (eyelids, temples), and clean natural skin texture. The skin must NOT be smooth, matte, waxy, or porcelain. Do NOT invent freckles, moles, pimples, acne scars, or random blemishes unless they are clearly present in the input reference.
- EYES (CRITICAL): Wet, reflective sclera with visible blood vessels (not pure white). Iris must show complex radial fibers, crypts, and color variation (not flat colored discs). Catchlights must reflect the actual lighting setup described in the prompt. Pupil size must match ambient light level. Under-eye area shows natural dark circles, fine creases, and slight puffiness — NOT airbrushed smooth. Eyelashes are individual strands at varying angles, not a uniform fringe.
- LIPS: Visible lip texture lines (vertical lip rugae), slight dryness variation, natural color gradient from lip edge to center, moisture catching light as tiny specular points — NOT smooth matte plastic or over-glossed CGI.
- FACIAL ASYMMETRY (MANDATORY): Real human faces are asymmetrical. One eye slightly smaller, one eyebrow slightly different shape, mouth line not perfectly horizontal, nostrils not perfectly symmetric, ears at slightly different heights. Enforce this natural asymmetry.
- HAIR: Individual strand separation visible, natural flyaways escaping styled hair, visible scalp at part line, hair density variation, strands catching backlight with translucency. NOT a smooth solid mass or painted-on helmet.
- HANDS & FINGERS: Correct finger count (5 per hand), visible knuckle wrinkles, nail beds with natural cuticles, tendons visible on back of hand, palm lines visible when open, natural finger spacing and curl. Hands must look functional and anatomically correct.
- BODY: Natural body proportions with visible bone structure under skin (collarbones, wrist bones, knuckle joints), muscle definition appropriate to body type, natural skin folds at joints (elbows, wrists, neck), visible tendons and veins where anatomically expected. Body must show real weight and physical presence, not floating or weightless.
- ABSOLUTE PROHIBITIONS: No porcelain/waxy/plastic skin. No symmetrical doll face. No unnaturally perfect teeth. No CGI smooth body. No airbrush beauty filter. No dead mannequin eyes. No identical-length eyelashes. No perfectly smooth hands.`
}

function isStylizedBlurPreset(presetId: string): boolean {
  return STYLIZED_BLUR_PRESETS.has(presetId)
}

function buildEnvironmentRealismLock(presetId: string): string {
  const allowStylizedBlur = isStylizedBlurPreset(presetId)

  return `ENVIRONMENT REALISM LOCK (CRITICAL):
- Background must stay physically believable with readable environmental objects and textures.
- Preserve scene geometry, object edges, and depth continuity (walls, trees, roads, furniture, skyline, props).
- Do NOT default to generic blur wash or artificial bokeh soup behind the subject.
- Use realistic depth behavior: medium/deep depth by default (roughly f/5.6-f/11 look) so subject and key background context both read clearly.
- Keep architectural lines, horizon edges, and environmental textures legible; avoid watercolor-like smear in distant regions.
- If motion blur is used, it must be directional and physically motivated (moving crowd, moving vehicle, shutter drag). Never blur the entire background uniformly.
- ${allowStylizedBlur
      ? 'Stylized blur is allowed only if motivated by motion, lens behavior, or the selected preset style. Keep background structure and scene depth readable.'
      : 'Avoid stylized blur, fake haze, over-diffusion, and excessive bokeh unless explicitly requested by the user.'}
- Keep lighting and shadows coherent across subject and environment so it feels like a real location, not composited mush.`
}

function buildAutoDirectorModeBlock(input: AdGenerationInput, hasCharacter: boolean): string {
  const cameraAuto = (input.cameraAngle || 'auto') === 'auto'
  const poseAuto = !input.subject?.pose
  const expressionAuto = !input.subject?.expression
  if (!cameraAuto && !poseAuto && !expressionAuto) return ''

  const variationIndex = Number(input.variationIndex || 0)
  const angleCycle = ['low', 'down/overhead', 'side profile', 'three-quarter', 'high', 'eye-level', 'dutch']
  const poseCycle = [
    'aggressive forward lean toward camera — weight on balls of feet, torso angled 15° forward, one hand gripping collar/hem, chin slightly down with eyes looking up through brows creating intensity; body language says "I own this frame"',
    'mid-stride dynamic walk — one leg forward with heel just leaving ground, opposite arm swinging naturally, jacket/fabric catching motion, shoulders slightly rotated creating torso twist; capture the split-second frozen energy of someone walking with purpose',
    'deep crouch / squat — knees bent, body low to ground, one hand bracing on knee or touching ground, the other near product or face; raw street energy, weight visibly pressing through legs and feet, fabric bunching at joints',
    'seated with attitude — leaning back on hands or forward on elbows, legs extended or crossed with visible weight shift, one shoulder higher than the other creating asymmetry; not a polite sit, an inhabiting of the space',
    'standing with body tension — one hip pushed out creating S-curve, weight clearly on one leg, opposite knee bent and relaxed, one hand in pocket or on hip with fingers naturally curled not flat; the pose a fashion photographer would call "give me attitude"',
    'arms engaged with product — lifting jacket collar, adjusting sleeve, touching necklace, fixing watch, pulling hoodie strings — hands DOING something specific that creates body asymmetry and narrative; never just hanging at sides',
    'editorial power stance — feet wider than shoulders, body centered and grounded, arms crossed or hands clasped low, direct striking body language; like a magazine cover where the person fills and commands every corner of the frame',
  ]
  const expressionCycle = [
    'piercing direct gaze with slight jaw clench — eyes locked on camera with genuine intensity, subtle tension in masseter muscle, lips closed but not pressed, nostrils slightly flared; the look that stops a thumb mid-scroll',
    'knowing half-smirk with raised brow — one corner of mouth lifted 2-3mm, opposite eyebrow subtly arched, eyes slightly narrowed with amusement; a face that has a secret and knows you want to know it',
    'caught mid-laugh genuine joy — eyes crinkled at corners (crow\'s feet visible), mouth open showing teeth naturally, cheeks lifted creating nasolabial folds, head tilted slightly back; a real laugh frozen at its peak, not a posed smile',
    'brooding intensity with soft eyes — heavy-lidded gaze slightly past camera, jaw relaxed but lips parted 1mm, brow slightly furrowed creating one horizontal crease; vulnerable and magnetic, Peter Lindbergh portrait energy',
    'defiant chin-up attitude — head tilted back 10°, looking down nose at camera through half-closed eyes, one eyebrow slightly raised, lips relaxed in subtle pout; pure confidence bordering on arrogance, fashion editorial power',
    'genuine micro-expression surprise — eyes slightly wider than neutral (not cartoon-wide), eyebrows lifted naturally, lips parted showing just a hint of teeth, head turned 5° as if just noticing camera; authentic candid moment frozen',
    'seductive editorial stillness — eyes directly at lens with dilated-pupil intimacy, lips barely parted with natural moisture, chin slightly down, one side of face catching more light; magnetic and intimate, not blank or vacant',
  ]

  const angleHint = angleCycle[variationIndex % angleCycle.length]
  const poseHint = poseCycle[variationIndex % poseCycle.length]
  const expressionHint = expressionCycle[variationIndex % expressionCycle.length]

  const lines: string[] = []
  if (cameraAuto) {
    lines.push(
      'Camera angle is AUTO: intelligently choose ONE dominant angle based on scene geometry and product salience from this set: low, high, down/overhead, side profile, three-quarter, eye-level, dutch.'
    )
    lines.push(
      'Do not default repeatedly to eye-level framing. Prefer stronger perspective when it improves fashion impact (e.g., low-angle sneaker hero, overhead street grid, side-profile silhouette).'
    )
    lines.push(
      `Variation index ${variationIndex}: bias this generation toward "${angleHint}" while keeping scene realism and preset fidelity.`
    )
  }
  if (hasCharacter && poseAuto) {
    lines.push(
      `Pose is AUTO-DIRECTED (CRITICAL — NO STATIC POSES): The model must look like a REAL HUMAN caught in a REAL MOMENT. Never generate a stiff, symmetrical, arms-at-sides catalog pose. Every pose must have: (1) visible weight distribution on one side, (2) at least one hand DOING something (touching hair, gripping fabric, adjusting accessory), (3) natural body asymmetry (one shoulder higher, hip shifted, head tilted). The body must show physical weight and gravitational grounding — fabric pulls where gravity acts, joints bend naturally, muscles show appropriate tension.`
    )
    lines.push(`Variation index ${variationIndex}: use this specific pose direction: ${poseHint}`)
  }
  if (hasCharacter && expressionAuto) {
    lines.push(
      `Expression is AUTO-DIRECTED (CRITICAL — NO FLAT FACES): The face must express a SPECIFIC HUMAN EMOTION with micro-muscle engagement. Never generate a blank, neutral, dead-eyed, or mannequin expression. Every expression must have: (1) specific eye engagement (crinkles, narrowing, or widening), (2) mouth with subtle asymmetry (one corner higher, lips slightly parted, natural lip texture), (3) visible facial micro-muscles (masseter, orbicularis, frontalis). The expression must tell a story — who is this person, what are they feeling RIGHT NOW?`
    )
    lines.push(`Variation index ${variationIndex}: use this specific expression direction: ${expressionHint}`)
  }

  return `AUTO DIRECTOR MODE (MANDATORY):\n- ${lines.join('\n- ')}`
}

function buildPhotographicRealismLock(): string {
  return `PHOTOGRAPHIC REALISM LOCK (INFLUENCER-GRADE, CRITICAL):
- Single coherent photograph: subject must be grounded in the scene with believable contact shadows and ambient occlusion where body/feet meet surfaces.
- Enforce light physics: natural falloff (inverse-square behavior), no uniform brightness across face/body/background, and coherent shadow direction/softness.
- Preserve camera realism: subtle natural sensor grain/noise (especially in shadow areas), mild lens imperfection, chromatic aberration at frame edges, natural vignetting — these are signs of REAL cameras.
- BODY PHYSICS (ANTI-AI): Weight must visibly transfer through the body — feet press into ground (slight shoe deformation on soft surfaces), fabric pulls downward with gravity, seated poses show cushion compression, leaning poses show structural support through limbs. No floating, no weightless hovering, no anatomically impossible joint angles.
- FABRIC PHYSICS (ANTI-AI): Clothing must respond to body movement and gravity — wrinkles at bend points (elbows, waist, knees), fabric tension across stretched areas (shoulders, chest), natural drape in loose areas, collar/cuff/hem maintaining structural integrity. Fabric surface shows realistic weave/knit texture, not smooth painted-on color.
- ENVIRONMENT PHYSICALITY: Props and surfaces show real-world wear — scuff marks, slight dust, weathering, fingerprints on glass, water stains on concrete, natural patina. Nothing looks factory-new-CGI-clean.
- LIGHTING COHERENCE: Shadow direction must be consistent across ALL elements (subject, props, background). Shadow softness matches light source size (large softbox = soft edges, direct sun = hard edges). Color temperature consistent across the frame. No object lit from a different direction than others.
- Avoid mannequin/catalog look: prioritize candid physical plausibility over synthetic perfection. The image should feel like it was CAPTURED, not RENDERED.`
}

function buildBrandMarkIntegrityLock(): string {
  return `BRAND MARK INTEGRITY (NON-NEGOTIABLE):
- Do NOT invent logos, letters, words, or brand marks that are not clearly visible in the input product image or explicitly provided by the user.
- If brand text/mark is unclear, obscured, or not legible in the source, keep it minimal/neutral instead of hallucinating fake text.
- No random sleeve print, fake wordmarks, or pseudo-brand typography on garments/products.
- Preserve real visible product markings faithfully; never fabricate new branding.`
}

function buildDepthPolicyCameraOverride(presetId: string): string {
  if (isStylizedBlurPreset(presetId)) {
    return 'Depth policy: Controlled stylized blur is allowed for this preset only when motivated by action, lens physics, or atmosphere. Subject and primary environment geometry must remain readable.'
  }
  return 'Depth policy: Do NOT use generic shallow-DoF/bokeh backgrounds. Keep medium depth with readable environmental objects and realistic spatial continuity.'
}

function buildTextArtDirectionBlock(input: AdGenerationInput, preset: AdPreset): string {
  const textSystem = resolveTextSystemForPreset(input.preset)
  if (textSystem === 'sports_brush') {
    return `TEXT ART DIRECTION (SPORTS / GRAFFITI BRUSH SYSTEM):
Typography should feel like an energetic streetwear campaign poster with handwritten/brush energy:
- HEADLINE: Use a dynamic hand-painted brush-stroke or graffiti-style font. The letters should be LARGE and expressive, spanning 60-80% of the frame. Brush strokes show visible texture — dry brush edges, paint droplets, ink spreading. Think spray-painted design meets high-fashion campaign.
- SUBJECT-TEXT LAYERING (CRITICAL): The text sits BEHIND the subject — the person is positioned IN FRONT of the brush letters, emerging through the typography smoothly. Some letters may peek out from behind the subject. This depth layering is mandatory.
- COLOR: White or cream brush strokes on moody/neutral backgrounds. Can also use bold single-color (yellow, red) brush on muted scenes. The text color should contrast the subject's wardrobe.
- SECONDARY ELEMENTS: Small editorial details scattered with precision — series numbers (like "62/365"), collection name in small caps, brand tagline in thin sans-serif at bottom. Circular logo stamp in corner. Vertical text running along one edge.
- HIERARCHY: One dominant brush headline (2-5 words), small editorial details, bottom tagline in clean sans-serif.
- MOOD: Raw creative energy, streetwear culture, artist studio vibes. Think sneaker campaigns, design studio posters.
Render text as realistic brush-painted/spray-painted treatment integrated into the scene.`
  }

  if (textSystem === 'luxury_masthead') {
    return `TEXT ART DIRECTION (LUXURY / ELEGANT SCRIPT SYSTEM):
Typography should feel like a luxury brand campaign or heritage editorial print:
- HEADLINE: Use an elegant serif display or calligraphic script font (like Didot, Playfair Display, custom calligraphic). Text rendered LARGE at the lower-third or center of the frame. The script should have beautiful flowing curves, varying stroke weights, and refined character connections. Mix serif and script — e.g., brand name in serif with "Summer Collection" in flowing italic below.
- SUBJECT-TEXT LAYERING: Text can overlap the subject seamlessly at the lower portion, creating a natural fashion magazine feel. The subject is ABOVE the text compositionally. Alternatively, text can be behind the subject at a large scale.
- TRANSPARENT OVERLAY TECHNIQUE: For close-up portraits, large serif/sans text (like "YOU & ME") can be rendered at 30-50% opacity OVERLAYING across the frame — the background, features, and textures visible THROUGH the translucent letters. This creates a high-fashion glass/frosted effect where text and image merge into one composition.
- COLOR: Cream, champagne, warm gold on dark/moody backgrounds. On lifestyle scenes, use deep navy or charcoal. Script text may have subtle shadow or emboss effect.
- SECONDARY: Brand name in spaced serif at bottom-left, "Collection Name" in italic script below. Small paragraph of body text in one corner.
- HIERARCHY: Dominant serif/script headline, elegant brand treatment, small editorial details.
- MOOD: Timeless luxury, heritage aesthetic, premium brands. Think high-end editorial, designer campaigns.
Render text as premium printed typography.`
  }

  // ── CINEMATIC TEXT SYSTEMS ──

  if (textSystem === 'cinematic_film_poster') {
    return `TEXT ART DIRECTION (CINEMATIC FILM POSTER / TRANSPARENT OVERLAY SYSTEM):
Typography should feel like a cinematic film poster with advanced text-subject integration:
- HEADLINE: Large lowercase or mixed-case serif (like Playfair Display, Cormorant). Size is MASSIVE — spanning 40-60% of the frame width. Split across 2-3 lines for dynamic pacing.
- TRANSPARENT FACE OVERLAY TECHNIQUE (for close-ups): When the composition is a close-up portrait, render the headline text at 30-50% opacity as LARGE outlined or semi-transparent letters directly integrated across the frame. The portrait is visible THROUGH the letters. The text becomes part of the portrait smoothly, not separate from it. Letters may be outlined (stroke only) or filled at very low opacity. This creates a high-art fashion/film poster effect.
- DEPTH LAYERING (for wider shots): Text wraps around the subject organically — some letters in front of the subject, some behind, creating cinematic poster depth.
- COLOR: Warm muted tones — cream, warm gold, faded amber, desaturated peach on dark backgrounds. For transparent overlay, use warm white or cream outlines. Never harsh pure white or black.
- TEXTURE: Subtle film grain matching the image, slight vintage paper quality. Text feels printed, not digital.
- HIERARCHY: One dominant headline phrase, optional tiny issue number or credit line (like "230") in corner.
- MOOD: Indie cinema posters, art house film one-sheets.
Render as REALISTIC PRINTED/OVERLAID element.`
  }

  if (textSystem === 'cinematic_bold_statement') {
    return `TEXT ART DIRECTION (CINEMATIC BOLD STATEMENT / DYNAMIC PATTERN SYSTEM):
Typography should feel striking and frame-filling:
- HEADLINE: MASSIVE ultra-bold condensed or italic uppercase sans-serif (like Impact, Druk, Anton, Bebas Neue). Can be rendered in TWO modes:
  MODE A — SINGLE FOCUS: One word at EXTREME size filling the frame width. High contrast white on black or reversed.
  MODE B — DYNAMIC REPEAT PATTERN: The headline text FILLS THE ENTIRE FRAME as a repeating pattern — same word/phrase repeated in giant bold italic at different sizes and angles, covering the background like a typographic wallpaper. The text overlaps itself, rotates, scales up and down. The subject STANDS OUT FROM this wall of text. Use a bold accent color (neon yellow, electric red, hot pink) for the text against blue sky or natural background. Include a marquee-style ticker at top and bottom.
- SUBJECT-TEXT INTERACTION: Subject physically interacts with the typography — extending BEYOND the text boundary, creating a cutout depth effect where the person stands out from the graphic plane.
- COLOR: Bold contrasting — neon yellow on blue sky, white on black, red on dark. The text color should CONTRAST intentionally with the scene for maximum visual impact.
- HIERARCHY: In SINGLE FOCUS — one word, optional tiny credit. In REPEAT PATTERN — the repeated text IS the background, with the subject as the foreground popping element.
- MOOD: Festival posters, streetwear lookbook drops, dynamic sports campaigns. Maximum visual impact.
Render as flat graphic typography.`
  }

  if (textSystem === 'cinematic_magazine_editorial') {
    return `TEXT ART DIRECTION (CINEMATIC MAGAZINE EDITORIAL SYSTEM):
Typography should feel like a high-end fashion magazine cover with layered complexity:
- HEADLINE: Mixed typography with deliberate contrast — combine elegant serif display (Didot, Bodoni, custom calligraphic) at dominant size with clean geometric sans (Futura, Montserrat) for supporting text. Main title should be large and partially BEHIND the subject.
- MULTI-LAYER COMPOSITION (CRITICAL): Text scattered at MULTIPLE sizes across the entire frame:
  LAYER 1 (BACKGROUND): Massive title letters at very large scale, partially hidden behind the subject
  LAYER 2 (MIDGROUND): Medium text blocks at edges — category labels, subtitles, vertical text along sides
  LAYER 3 (FOREGROUND): Small descriptor paragraphs, issue numbers, dates, credits in corners
  LAYER 4 (DECORATIVE): Scattered individual letters, thin circles/lines, or small icons
- COLOR: Rich 2-3 color palette complementing the scene (white + black + one accent matching dominant scene color). Mix light-on-dark and dark-on-light text within the same composition.
- LAYOUT: Deliberately asymmetric — NOT centered, NOT grid-locked. Text orbits around the subject creating visual energy. Vertical text along edges for dynamism.
- HIERARCHY: 4 layers minimum — massive background title, medium subtitle, small descriptor text, tiny detail text. Each uses different font weight/style.
- MOOD: High fashion magazines, contemporary design covers. Maximalist typography creating visual richness.
Render as realistic magazine print — crisp edges, professional kerning, editorial layout quality.`
  }

  if (textSystem === 'cinematic_street_poster') {
    return `TEXT ART DIRECTION (CINEMATIC STREET POSTER / ENVIRONMENTAL TEXT SYSTEM):
Typography should feel like editorial street poster or physically integrated environmental text:
- HEADLINE: GIANT ultra-bold condensed uppercase (Druk Wide, Knockout, Oswald Black). Each letter 30-50% of frame height. Two integration modes:
  MODE A — BEHIND SUBJECT: Text positioned as flat graphic layer BEHIND the subject. Person stands IN FRONT of giant letters, extending past typography smoothly. Color-matched to scene.
  MODE B — ENVIRONMENTAL/FLOOR TEXT: For down-angle or overhead compositions, text is PRINTED ON THE GROUND/FLOOR/SURFACE the subject stands on. Letters rendered as painted/printed on concrete, studio floor, or wall. Text wraps around ground plane with natural perspective distortion. Subject literally STANDS ON the letters.
- COLOR: Scene-matched — slightly desaturated version of dominant scene color. Bold and saturated on light backgrounds, lighter complementary on dark.
- SECONDARY: Small spaced uppercase subtitle above headline with generous letter-spacing. Year, credit, series name at corners. Bottom tagline in small caps.
- LAYOUT: Strong visual grid — text aligned to invisible gutters, secondary elements at precise mathematical positions.
- HIERARCHY: 3 layers — giant background/floor headline, medium spaced subtitle, small detail text at edges.
- MOOD: Contemporary design studio work, fashion campaign posters.
Render as printed/painted graphic element physically integrated into scene — flat, crisp, perspective-accurate.`
  }

  if (textSystem === 'cinematic_minimal_concept') {
    return `TEXT ART DIRECTION (CINEMATIC MINIMAL CONCEPT / GHOSTED ELEMENT SYSTEM):
Typography should feel like a minimal concept poster with smart text-surface integration:
- HEADLINE: Clean semi-bold sans-serif (DM Sans, Inter, Neue Haas) in uppercase. Anchored to one zone of composition.
- GHOSTED BACKGROUND ELEMENT (CRITICAL): One MASSIVE typographic element — a large number like "09", a single oversized letter, or short word — rendered at 15-30% opacity as part of the ENVIRONMENT SURFACE. For dark scenes: subtle lighter text on dark floor/wall, like etched into the surface. For light scenes: slightly darker tint of background. Fills 40-60% of background, sits BEHIND subject.
- FLOOR/SURFACE INTEGRATION: When camera is down/overhead, ghosted text is ON THE FLOOR — printed, painted, or inlaid into ground. Subject stands ON TOP of the numbers/letters.
- COLOR: Strictly 2-color palette. Headline in dark contrasting color. Ghosted element in lighter background tint. Split text technique: one word broken across two lines with second word in lighter weight.
- PLACEMENT: Asymmetric — headline at lower-left or upper-left, ghosted element opposite for balance, tiny precise details at corners.
- LAYOUT: Swiss/Bauhaus grid — generous negative space, mathematical spacing. The whitespace IS the design.
- BRAND: Small logo/monogram at bottom center. Optional "concept poster series" or "design no. XX" label in tiny spaced caps.
- MOOD: Swiss design posters, album art concepts, architectural portfolio pieces.
Render as clean, precise graphic typography integrated into scene surface.`
  }

  return `TEXT ART DIRECTION (HIGH STREET SYSTEM):
Use modular poster hierarchy with clean commercial structure:
- Strong top headline in bold condensed sans-serif
- Secondary support line in lighter weight
- Optional lower information block with brand details
Typography must be highly legible, grid-aligned, and integrated with the image plane, not a flat afterthought.
Text can be positioned behind the subject for depth layering when the composition allows it.
Prefer realistic poster/signage/paint treatment over heavy 3D extrusion.`
}

// ═══════════════════════════════════════════════════════════════
// GEMINI VISION PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

const OPENAI_VISION_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
])

function toOpenAIDataUrl(base64: string): string | null {
  if (base64.startsWith('data:image/')) {
    const mimeMatch = base64.match(/^data:(image\/[^;]+);base64,/i)
    const mimeType = mimeMatch?.[1]?.toLowerCase() || ''
    if (!OPENAI_VISION_MIME_TYPES.has(mimeType)) {
      console.warn(`[AdPromptBuilder] Skipping unsupported OpenAI vision image MIME type: ${mimeType || 'unknown'}`)
      return null
    }
    return base64
  }

  return `data:image/jpeg;base64,${base64}`
}

async function buildPromptWithGemini(
  preset: AdPreset,
  input: AdGenerationInput,
  productImageBase64?: string | null,
  faceAnchor?: string | null
): Promise<string> {
  const gemini = getGeminiChat()
  const hasText = !!(input.textOverlay && (input.textOverlay.headline || input.textOverlay.subline || input.textOverlay.tagline))
  const modes: PromptBuildMode[] = ['default', 'safe']
  let lastError: Error | null = null

  for (const mode of modes) {
    try {
      const systemMessage = sanitizeForOpenAI(buildSystemMessage(hasText))
      const userContent = buildUserContent(preset, input, productImageBase64, faceAnchor, mode)

      const response = await gemini.chat.completions.create({
        model: PROMPT_MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userContent },
        ],
        temperature: mode === 'safe' ? 0.2 : 0.35,
        max_tokens: 1500,
      })

      const message = response.choices[0]?.message
      const text = message?.content?.trim()
      console.log('[AdPromptBuilder] RAW GEMINI RESPONSE:', JSON.stringify(message))

      if (isRefusalLike(text)) {
        recordPromptMetric(input.preset, mode, 'refusal')
        const msg = `[AdPromptBuilder] Gemini refusal-like output in ${mode} mode`
        console.warn(msg)
        throw new Error(msg)
      }
      if (!text || text.length < 50) {
        recordPromptMetric(input.preset, mode, 'short')
        console.warn(
          '[AdPromptBuilder] Empty or short text returned. System Message length:',
          systemMessage.length,
          'User Content length:',
          estimateUserContentChars(userContent),
          'Mode:',
          mode
        )
        throw new Error('Gemini returned empty or too-short prompt')
      }
      if (text.length > MAX_PROMPT_LENGTH) {
        console.warn(`[AdPromptBuilder] Raw prompt ${text.length} chars (will be capped to ${MAX_PROMPT_LENGTH})`)
      }
      recordPromptMetric(input.preset, mode, 'success')
      console.log(`[AdPromptBuilder] Gemini prompt built (${text.length} chars) in ${mode} mode`)
      return text
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const classified =
        lastError.message.includes('refusal-like output') || lastError.message.includes('too-short prompt')
      if (!classified) recordPromptMetric(input.preset, mode, 'error')
      if (mode === 'default') {
        console.warn('[AdPromptBuilder] Retrying Gemini prompt build in safe mode:', lastError.message)
        continue
      }
    }
  }

  throw (lastError || new Error('Gemini prompt build failed after retries'))
}

function buildSystemMessage(hasText: boolean): string {
  return `You are a PHOTOSHOOT AD DIRECTOR and elite advertising creative director. You write image-generation prompts for Gemini 3 Pro. You think in full productions: lighting design, set mood, lens choice, colour grade, and one brilliant visual idea. Your prompts read like a director's brief to a DP and stylist — specific, obsessive, production-quality.

You receive: a product image, a creative brief, and REFERENCE PROMPTS from real campaigns. Study the references — absorb their density and quality. Your output must match or exceed them. GO CRAZY on style: every frame should look like it belongs in a Vogue spread, a luxury hero spot, or a global lookbook. No safe, generic descriptions.
CRITICAL: Reference prompts can contain example brand words. Treat those words as style examples only — NEVER copy those brand names/slogans unless the user explicitly provided them in the current brief text fields.

YOUR JOB: Write ONE narrative-style prompt (NOT keyword stuffing) that generates a STUNNING, campaign-grade ad image. Think like a director calling the shot: "Key from 45° left, half-stop under; rim from behind right to separate from the drop; fill at 2:1 so we keep shape but don't flatten." Name the mood, the light quality, the palette, the lens.

═══ PRODUCTION-QUALITY LIGHTING (NON-NEGOTIABLE) ═══
Every image must feel like a real photoshoot with a real lighting rig. Be specific: key light angle (e.g. 45° front-left), fill ratio (e.g. 2:1, 3:1), rim or backlight for separation, beauty dish vs softbox vs hard light, colour temperature (warm 3200K, cool 5600K, golden hour). Describe how light hits skin (sculpted cheekbones, catchlights in eyes, subtle rim on hair) and product (specular highlights, fabric weave, material truth). 8K resolution, tack-sharp where it matters. Default to realistic medium depth of field that preserves important background context; only use strong blur when the brief explicitly requires it. No AI mush, no plastic skin, no flat single-source lighting. Specify lens (e.g. 85mm f/1.4), f-stop, and a clear lighting setup in your prompt. Anatomy correct, hands natural, proportions human.

═══ CAMERA ANGLES ═══
Use precise camera angle vocabulary so the image has impact:
- DOWN ANGLE: camera above, looking down at subject/product (flat lay, overhead, top-down).
- HIGH ANGLE: slightly above eye level, looking down — flattering for product and face.
- LOW ANGLE: camera low or at ground level, looking up — heroic, powerful, dramatic.
- SIDE: profile or near-profile view — strong silhouette, editorial.
- THREE-QUARTER: classic 45° to subject — versatile, flattering.
- EYE LEVEL: camera at subject's eye height — natural, direct.
- DUTCH: tilted horizon — tension, energy, fashion.

When the brief specifies a camera angle, use it explicitly in your prompt (e.g. "Shot from a low angle, camera near ground level looking up at the model..."). When "Auto", choose the most impactful angle for the preset and product.

═══ GEMINI 3 PRO OPTIMIZATION ═══

Gemini 3 Pro responds best to NARRATIVE DESCRIPTIONS, not comma-separated tags. Structure your prompt as a flowing visual paragraph using this framework:
[WHAT is in the scene] + [what they're DOING] + [WHERE / environment] + [HOW it LOOKS / mood] + [TECHNICAL specifications]

Example of GOOD narrative structure:
"A confident young man in a charcoal tracksuit sprints through a rain-soaked Tokyo side street at dusk, one arm extended back mid-stride, his red Nike Air Max 97 sneakers catching light from overhead neon signs. The wet asphalt reflects electric blue and magenta from storefronts, creating mirror-like light pools beneath his feet..."

Example of BAD keyword structure:
"man, running, Nike shoes, rain, Tokyo, neon, night, dynamic, 8K"

═══ ABSOLUTE RULES ═══

1. OUTPUT ONLY THE PROMPT. No explanations, no JSON, no markdown.

2. PRODUCT ACCURACY (NON-NEGOTIABLE).
   LOOK AT the product image. Describe EXACTLY: visible brand, colourway (#hex if possible), material (mesh/leather/suede/canvas/satin), shape, distinctive features (logo placement, sole colour, stitching pattern, hardware). Be forensically specific.
   If any logo/wordmark is unreadable or not visible, do NOT invent text/branding. Keep markings neutral rather than hallucinating fake letters.

3. NARRATIVE DENSITY: 300–700 words of flowing visual description. Think like a director: what does the set smell like? Where does the light come from in the room? What's the one thing that makes this frame iconic?
   Include: lighting rig (key at 45°, fill ratio, rim angle, quality of light — soft/hard/feathered), camera (24/35/50/85mm, f/stop, shutter speed if motion), colour palette (use hex codes: "deep crimson #8B0000", "electric cyan #00E5FF"), texture (8K, film grain weight, dewy/matte skin, fabric weave), composition (rule of thirds, leading lines, negative space). Aim for the most amazing, memorable look possible — production-quality lighting and styling in every sentence.
   Name photographers when relevant: Guy Bourdin, Tim Walker, Annie Leibovitz, Martin Parr, Peter Lindbergh, Mario Testino, Inez & Vinoodh.

${hasText ? `4. TYPOGRAPHY = COMPOSITIONAL BLEND (text has been requested by the user).
   Use ONLY the EXACT text strings provided in the brief. Do NOT invent new words, slogans, logos, brand names, numbers, hashtags, or taglines.
   Text is DESIGNED INTO the scene — not added on top. Use 2+ blending techniques:
   a) DEPTH LAYERING: letters BEHIND subject (subject's body occludes parts of text)
   b) 3D EXTRUSION: letters have physical thickness, but MUST maintain perfect architectural structure (NO melting, NO stretching, NO morphing into spikes)
   c) ENVIRONMENT MASKING: text painted on walls or resting on physical surfaces
   d) COLOUR BLEED: text gradient matches scene palette, glows onto nearby surfaces
   e) PARTIAL OCCLUSION: product/hand/hair overlaps parts of text
   f) TYPOGRAPHIC INTEGRITY (CRITICAL): Letters must remain perfectly formed and legible. Avoid letters stretching into weapons, spikes, or morphing into physical scene objects.

   NEVER say "add text" or "text overlay". Instead describe physical presence: "massive ultra-bold white sans-serif letters '[HEADLINE]' — the first characters appear BEHIND the subject's shoulder, letters have 3mm depth with soft shadow, same dramatic rim lighting as the subject, text occupies 30% of frame width."` : `4. NO TEXT / NO TYPOGRAPHY (CRITICAL — NON-NEGOTIABLE).
   The user has NOT requested any text. Do NOT include ANY text, words, letters, numbers, brand names, slogans, watermarks, or typography of ANY kind in the image. The image must be PURELY VISUAL — a photograph with ZERO written content. If you include ANY text, you have FAILED this assignment.
   Do NOT write text on walls, signs, clothing, or any surface. No logos, no brand marks, no captions.`}

5. CHARACTER IS MANDATORY when specified. If brief says "CHARACTER (USER SELECTED — MUST INCLUDE)", the character MUST be prominent, interacting with the product, shown at minimum three-quarter body. User's character choice OVERRIDES preset defaults.

6. END with one AVOID line. Example: "AVOID: blurry, watermark, extra limbs, distorted anatomy, clipart, text errors, multiple products, floating props, objects in mid-air, AI artifacts, malformed hands, melting text, stretched letters, text morphing into scene."

7. MATCH REFERENCE QUALITY. Your prompt must be as detailed, specific, and visually rich as the reference prompts provided.`
}

function buildUserContent(
  preset: AdPreset,
  input: AdGenerationInput,
  productImageBase64?: string | null,
  faceAnchor?: string | null,
  mode: PromptBuildMode = 'default'
): any[] {
  const content: any[] = []
  const strictRealism = input.strictRealism !== false
  const safeMode = mode === 'safe'

  // Pass the product image directly to GPT-4o vision
  if (productImageBase64) {
    const imageUrl = toOpenAIDataUrl(productImageBase64)
    if (imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl,
          detail: safeMode ? 'low' : 'high',
        },
      })
    }
  }

  // Build the text brief
  const sections: string[] = []

  // Determine if user explicitly selected a character
  const ct = input.characterType || 'none'
  const hasCharacter = ct !== 'none'
  const isProductOnlyPreset = PRODUCT_ONLY_PRESETS.has(input.preset)
  // User overrides the preset's "no model" constraint
  const characterOverridesPreset = hasCharacter && isProductOnlyPreset

  // ═══ 1. REFERENCE PROMPTS (the training data) ═══
  // These are REAL prompts that produced stunning images. GPT-4o studies them.
  const examples = getStyleExamplesForPreset(input, hasCharacter)
  if (examples.length > 0) {
    const exampleBlocks = examples
      .slice(0, safeMode ? 2 : 5)
      .map(
        (ex, i) =>
          `REFERENCE ${i + 1}: "${ex.name}"\nPROMPT: ${sanitizeForOpenAI(ex.prompt)}\nSTYLE NOTES: ${sanitizeForOpenAI(ex.styleNotes)}`
      )
      .join('\n\n')

    sections.push(`═══ STUDY THESE REFERENCE PROMPTS ═══
These generated stunning, production-quality images. Match this density, specificity, and quality level in your output.

${exampleBlocks}

═══ END REFERENCES ═══`)
  }

  // ═══ 2. Creative brief ═══
  // If user selected a character on a "product only" preset, override the
  // scene guide to include the character instead of "no model"
  let sceneGuide = preset.sceneGuide
  let avoidTerms = [...preset.avoid]

  // CRITICAL FIX: Strip hardcoded wardrobe instructions from presets to prevent AI from ignoring the uploaded product
  if (productImageBase64 && hasCharacter) {
    sceneGuide = sceneGuide.replace(/Wardrobe is.*?(\.|;)/gi, '')
    sceneGuide = sceneGuide.replace(/Strong styling drives everything:.*?(\.|;)/gi, '')
    sceneGuide += '\n\nCRITICAL OUTFIT OVERRIDE: The subject MUST be wearing the EXACT uploaded product. Completely ignore any other casual or editorial clothing suggestions in this prompt. The uploaded product is the absolute hero and the subject is wearing it.'
  }

  if (characterOverridesPreset) {
    // Replace "no model" scene with a character-inclusive version
    sceneGuide = sceneGuide
      .replace(/No model[;,.]?\s*/gi, '')
      .replace(/product is the hero/gi, 'product is prominently featured')

    // Adapt the scene to include a character
    if (input.preset === 'PRODUCT_LIFESTYLE') {
      sceneGuide = `Lifestyle ad with ${ct === 'animal' ? 'a photorealistic animal' : 'a model'} and the product in a real-world context (minimal room, gas station, urban night, or neutral interior). Product primary and clearly visible; model secondary. Premium lighting, campaign-quality.`
    }

    // Remove "model/person" from the avoid list since user wants one
    avoidTerms = avoidTerms.filter(
      (t) => !t.toLowerCase().includes('model') && !t.toLowerCase().includes('person')
    )
  }

  // Camera angle: explicit instruction when user selected one
  const cameraAngle = input.cameraAngle || 'auto'
  const angleInstruction =
    cameraAngle === 'auto'
      ? 'Camera angle: AUTO-DIRECTED. Choose the most impactful angle for this preset and product; explicitly state the chosen angle in the prompt (e.g. "Shot from a low angle...", "Overhead down-angle...", "Side profile composition...").'
      : cameraAngle === 'down'
        ? 'Camera angle: DOWN ANGLE (mandatory). Camera above, looking down at subject or product. Describe it in the prompt: e.g. "Shot from directly above", "Overhead down-angle view", "Camera looking down at...".'
        : cameraAngle === 'high'
          ? 'Camera angle: HIGH ANGLE (mandatory). Slightly above eye level, looking down. Flattering for product and face. Use in prompt: "Shot from a high angle, camera slightly above..."'
          : cameraAngle === 'low'
            ? 'Camera angle: LOW ANGLE (mandatory). Camera low or at ground level, looking up. Heroic, dramatic. Use in prompt: "Low-angle shot, camera near ground level looking up at...", "Worm\'s-eye view..."'
            : cameraAngle === 'side'
              ? 'Camera angle: SIDE PROFILE (mandatory). Profile or near-profile view. Strong silhouette, editorial. Use in prompt: "Side profile view", "Shot from the side...".'
              : cameraAngle === 'three-quarter'
                ? 'Camera angle: THREE-QUARTER (mandatory). Classic 45° to subject. Use in prompt: "Three-quarter view", "Shot at 45 degrees to the subject...".'
                : cameraAngle === 'eye-level'
                  ? 'Camera angle: EYE LEVEL (mandatory). Camera at subject\'s eye height. Use in prompt: "Eye-level shot", "Camera at subject height...".'
                  : cameraAngle === 'dutch'
                    ? 'Camera angle: DUTCH / TILTED (mandatory). Tilted horizon for tension and energy. Use in prompt: "Dutch angle", "Tilted camera", "Canted horizon...".'
                    : 'Camera angle: Choose the most impactful angle and state it explicitly in your prompt.'

  if (strictRealism && !isStylizedBlurPreset(input.preset)) {
    avoidTerms = [...avoidTerms, 'generic blurry background', 'over-bokeh', 'background mush', 'floating props', 'defying gravity', 'mid-air objects']
  }

  sections.push(`CREATIVE BRIEF:
Preset: ${preset.name} (${preset.category})
Scene direction: ${sceneGuide}
Lighting direction: ${preset.lightingGuide}
Camera direction: ${preset.cameraGuide}
${buildDepthPolicyCameraOverride(input.preset)}
${angleInstruction}
Must avoid: ${avoidTerms.join(', ')}`)
  sections.push(buildStylePackDirective(input))
  const autoDirectorMode = buildAutoDirectorModeBlock(input, hasCharacter)
  if (autoDirectorMode) sections.push(autoDirectorMode)
  sections.push(buildEnvironmentRealismLock(input.preset))
  if (strictRealism) {
    sections.push(buildPhotographicRealismLock())
    sections.push(buildBrandMarkIntegrityLock())
  }

  const hasTextOverlay = !!(input.textOverlay && (input.textOverlay.headline || input.textOverlay.subline || input.textOverlay.tagline))
  sections.push(buildStrategicIntelligenceBlock(input, preset, hasCharacter, hasTextOverlay))
  if (input.preset === 'PERF_BEST_QUALITY') {
    sections.push(`BEST QUALITY MODE (MANDATORY):
Prioritize maximum photoreal fidelity and premium ad finish over stylistic experimentation.
No visual gimmicks unless they improve realism or product salience.
Every output decision should improve conversion readiness and perceived production value.`)
  }

  // ═══ 3. Product instruction ═══
  if (productImageBase64) {
    sections.push(`PRODUCT (attached image — LOOK AT IT):
Describe the EXACT product you see: type (shoe/shirt/bag/accessory), visible brand marks (only if clearly legible), specific colourway, materials (mesh/leather/suede/canvas/satin), shape/silhouette, sole, hardware, stitching, distinctive features. Be forensically specific — "red Nike Air Max 97 with white swoosh, translucent air bubble sole, mesh upper with reflective panels" NOT "a pair of red sneakers". The product in the generated image MUST be a precise visual match.
If logo text or wordmarks are not clearly readable in the source image, do NOT invent brand letters; keep marks neutral/minimal.`)

    sections.push(`PRODUCT FIDELITY LOCK (NON-NEGOTIABLE — CRITICAL):
- The uploaded product image is the ABSOLUTE SOURCE OF TRUTH for what the subject wears or holds.
- You MUST NOT replace, modify, reinterpret, or swap the product for a different garment, accessory, or item.
- The generated image must show the EXACT SAME product: same color, same silhouette, same material, same texture, same fit, same distinctive features.
- If the product is a red polo t-shirt, the output MUST show a red polo t-shirt — NOT a dress, NOT a jacket, NOT a different colored shirt.
- The preset's scene/lighting/camera direction sets the MOOD and ENVIRONMENT — it does NOT override the product. The product is sacred.
- Any complementary wardrobe pieces (pants, shoes, accessories) should be neutral and minimal, NEVER competing with the hero product.
- Describe the product in full detail in your output prompt so Gemini can reproduce it exactly.`)
  }

  // ═══ 4. Character (ALWAYS respected when user selects one) ═══
  if (hasCharacter) {
    if (ct === 'animal') {
      const animal = input.animalType || 'fox'
      const style = input.characterStyle || 'natural, photorealistic'
      sections.push(`CHARACTER (USER SELECTED — MUST INCLUDE):
A photorealistic CGI 3D rendered ${animal} wearing or interacting with the product. ${style} style. Soft diffused studio lighting with realistic scene depth and readable environment details (no generic background blur). Ultra-high detail with sharp fur/feather textures. Bold saturated colors, contemporary luxury brand aesthetic — premium yet playfully absurd.
The ${animal} MUST be prominent in the image — not a background element. It is the model of this ad.`)
    } else {
      const gender = ct === 'human_male' ? 'man' : 'woman'
      const age = input.characterAge || input.subject?.ageRange || '22-30'
      const style = input.characterStyle || 'natural, confident'
      const pose = input.subject?.pose || 'dynamic, editorial'
      const expression = input.subject?.expression || 'confident, direct gaze'
      sections.push(`CHARACTER (USER SELECTED — MUST INCLUDE):
A young ${gender} (age ${age}), ${style} style. ${pose} pose, ${expression}. ${resolveIdentityDirective(input)} ${buildIdentityCastingLock(input)} Realistic skin with visible pores and texture, natural body proportions. The ${gender} wears or holds the product. Describe a specific complementary outfit.
The ${gender} MUST be prominent in the image — not just hands or silhouette. Show at least three-quarter body. This is a model-driven ad.`)
    }
  }

  const faceRealismLock = buildFaceRealismLock(input)
  if (faceRealismLock) {
    sections.push(faceRealismLock)
  }

  // ═══ 5. Face identity lock ═══
  if (faceAnchor && input.lockFaceIdentity) {
    sections.push(`FACE IDENTITY LOCK (CRITICAL — NON-NEGOTIABLE):
Preserve EXACT facial structure, bone geometry, skin tone, and features from the reference person image:
${faceAnchor}
Face is IMMUTABLE. Do NOT alter any facial feature. Include explicit instruction: "Preserve the exact face, jawline, eye shape, skin tone, and facial proportions of the reference person."`)
  }

  // ═══ 6. Text — COMPOSITIONAL BLEND TYPOGRAPHY or NO TEXT ═══
  if (!hasTextOverlay) {
    // CRITICAL: Explicitly tell GPT-4o NOT to add any text
    sections.push(`TEXT: NONE. Do NOT include ANY text, words, letters, numbers, brand names, slogans, or typography in the image, even if reference prompts contain text. The image must be purely visual — no written content whatsoever. This is a photography-only composition.`)
  }

  if (hasTextOverlay) {
    const to = input.textOverlay!

    // Build text entries — ONLY specify WHAT text, not HOW to style it
    // The TEXT ART DIRECTION block handles all styling decisions
    const textEntries: string[] = []
    if (to.headline) {
      textEntries.push(`HEADLINE TEXT: "${to.headline}" — this is the PRIMARY text element. Render it according to the TEXT ART DIRECTION system above. Keep exact spelling and letter order character-by-character.`)
    }
    if (to.subline) {
      textEntries.push(`SUBLINE TEXT: "${to.subline}" — this is the SECONDARY text element. Smaller than headline, positioned as described in the TEXT ART DIRECTION system.`)
    }
    if (to.tagline) {
      textEntries.push(`TAGLINE TEXT: "${to.tagline}" — this is the TERTIARY text element. Smallest, positioned as described in the TEXT ART DIRECTION system.`)
    }

    if (textEntries.length > 0) {
      const allowedText = [to.headline, to.subline, to.tagline]
        .filter((v): v is string => Boolean(v && v.trim()))
        .map((v) => `"${v}"`)
        .join(', ')

      sections.push(`${buildTextArtDirectionBlock(input, preset)}

TEXT CONTENT LOCK (NON-NEGOTIABLE):
Allowed text strings in-image: ${allowedText}.
Use ONLY these exact strings. Do NOT invent extra words, taglines, numbers, hashtags, or brand text.

TEXT ELEMENTS TO RENDER:
${textEntries.join('\n')}

TYPOGRAPHY EXECUTION RULES (CRITICAL — READ CAREFULLY):
- Follow the TEXT ART DIRECTION system above EXACTLY. It specifies font family, weight, case, size, color, placement, and layering technique for this preset.
- The text must have DEPTH INTERACTION with the subject — letters partially behind body parts, transparent overlays on face, text printed on floor/wall surfaces, or text as repeating background pattern (as specified in the art direction).
- Text is PART OF THE IMAGE COMPOSITION, not a flat overlay added afterward. If the text looks like it was typed in Microsoft Word and pasted on top, you have COMPLETELY FAILED.
- The typography style must MATCH the preset mood — cinematic presets get cinematic text, street presets get bold graphic text, luxury presets get elegant serif text.
- NEVER render plain white or black text sitting flatly on top of the image. Every letter must interact with the scene through depth, transparency, material texture, or environmental integration.
- Think of the text as a GRAPHIC DESIGN ELEMENT that a professional art director would compose — not a caption.`)
    }
  }

  // ═══ 7. Aspect ratio 
  const ar = input.aspectRatio || '1:1'
  const arDesc: Record<string, string> = {
    '1:1': 'Square 1:1 — compose all elements centered, balanced symmetry',
    '9:16': 'Vertical 9:16 (Story/Reels) — tall frame, subject fills vertical space, text stacks vertically, use full height',
    '16:9': 'Wide 16:9 (cinematic/banner) — panoramic, subject on one side with product and text balanced across width',
    '4:5': 'Vertical 4:5 (Instagram post) — slightly taller than wide, standard portrait composition',
  }
  sections.push(`ASPECT RATIO: ${arDesc[ar] || arDesc['1:1']}
Compose every element (subject, product, text, background) to fill this format naturally. Do NOT leave dead space.`)

  // ═══ 8. Quality enforcement ═══
  const noTextAvoid = hasTextOverlay ? '' : ', NO text/words/letters/numbers/brand names in the image'
  sections.push(`QUALITY MANDATE (CRAZY GOOD — campaign-grade only):
Your prompt must produce an image that looks like it was shot by a top creative agency (Wieden+Kennedy, TBWA, Ogilvy) for a premium brand. You MUST specify in the prompt:
- Camera angle: state it explicitly (e.g. "Shot from a low angle, camera near ground level...", "Overhead down-angle view...", "Three-quarter profile...")
- Exact lighting rig (key light angle, fill ratio, rim/edge light, bounce)
- Camera: lens mm, f-stop, shutter if motion, depth of field
- Colour grading: cinematic LUT name or tone description
- Texture quality: 8K, photorealistic, film grain if editorial, dewy/matte as appropriate
- Background fidelity: environment objects must stay readable and realistic (avoid default background mush/over-bokeh unless stylistically required)
- Physics fidelity (CRITICAL): coherent contact shadows, realistic light falloff. Props MUST obey gravity and be held with realistic, correct hand poses. NO floating bags, cups, or objects in mid-air. NO floating items. NO pasted-on subject look. NO fake brand text/wordmarks.
- Realism guardrail: NO clay/wax/plastic/melted text, NO toy-like CGI letters, NO synthetic doll skin, NO over-smoothed faces.
- End with AVOID line (MUST include${hasTextOverlay ? '' : ': "no text, no words, no letters, no numbers, no brand names, no typography"'})

Write the prompt NOW. Output ONLY the prompt text.`)

  let textBlock = sections.join('\n\n')
  textBlock = sanitizeForOpenAI(textBlock)
  textBlock = compactForOpenAI(textBlock, MAX_GPT_BRIEF_CHARS)

  content.push({
    type: 'text',
    text: textBlock,
  })

  return content
}
