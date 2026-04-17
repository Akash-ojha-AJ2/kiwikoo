import { GoogleGenAI, type ContentListUnion, type GenerateContentConfig, type ImageConfig } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'
import {
  analyzeGarmentForensic,
  type GarmentAnalysis
} from './face-analyzer'
import { getStylePreset, type StylePreset } from './style-presets'
import { getTryOnPresetV3, getFullPreset, logPresetEnforcement } from './presets'
import {
  buildDualEnginePipeline,
  enforceModelRouting,
  validatePipelineInputs,
  logIdentitySafetyCheck,
  type PipelineMode,
  type ModelType
} from './dual-engine'
import {
  extractFaceCropForImage3,
  HYPER_REALISM_FACE_BLOCK,
  HYPER_REALISM_PHYSICS_BLOCK,
  logHyperRealismStatus
} from './hyper-realism'
import { generateIdentityHash } from './identity-cropper'
import {
  IML_COHERENCE_PROMPT,
  BODY_SOURCE_ENFORCEMENT,
  getIMLPrompt,
  logIMLStatus
} from './identity-morphology-lock'
import {
  MULTI_VARIANT_DIVERSITY_PROMPT,
  generateDiverseStyles,
  buildStylePrompt,
  logStyleDiversity,
  type StyleCombination
} from './style-diversity-engine'
import {
  FACE_PIXEL_FREEZE_PROMPT,
  FLASH_FACE_FREEZE,
  PRO_FACE_FREEZE,
  getFacePixelFreezePrompt,
  logFacePixelFreezeStatus
} from './face-pixel-freeze'
import {
  BODY_AUTHORITY_TABLE,
  CLOTHING_REFERENCE_BLOCK,
  BODY_PHYSICS_ALIGNMENT,
  FACE_BODY_COHERENCE_CHECK,
  getBodyAuthorityPrompt,
  logBodyAuthorityStatus
} from './body-authority'
import {
  SCENE_SCHEMAS,
  buildSceneConstructionPrompt,
  ANTI_PASTEL_DIVERSITY,
  logSceneConstruction
} from './scene-construction'
// FACE-FIRST IDENTITY - Forensic photo compositor constraints
import { FACE_FIRST, buildFaceFirstPrompt } from './face-first-identity'
import { getFaceFreezeEmergency } from './face-freeze-emergency'
import { getFaceGarmentUltraLock, getFaceUltraLock, getGarmentUltraLock } from './face-garment-ultra-lock'

const getClient = () => new GoogleGenAI({ apiKey: getGeminiKey() })

function stripDataUrl(base64: string): string {
  return (base64 || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
}

function normalizeAspectRatio(ratio: string | undefined): string {
  const raw = String(ratio || '').trim()
  if (!raw) return '3:4'
  const allowed = new Set(['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'])
  if (allowed.has(raw)) return raw
  if (raw === '4:5') return '3:4'
  if (raw === '5:4') return '4:3'
  return '3:4'
}

// ====================================================================================
// NEW ARCHITECTURE: Image-only identity, text-only garment, prompt-controlled scene
// ====================================================================================

/**
 * STYLE REFERENCE (--sref equivalent)
 * The visual aesthetic - photography style, grain, mood
 */
const STYLE_SETTINGS: Record<string, string> = {
  iphone_candid: `📱 iPhone Candid Style:
Shot on iPhone 15 Pro, 24mm wide angle with natural barrel distortion
Slight motion blur suggesting spontaneous capture
Natural smartphone color science with warm tones
Minor lens flare from bright areas
Authentic social media aesthetic`,

  editorial: `📸 Editorial Fashion Style:
Shot on Canon 5D Mark IV with 85mm f/1.4
Professional three-point lighting
Shallow depth of field with creamy bokeh
Magazine-quality but not over-processed
Subtle film grain reminiscent of Portra 400`,

  documentary: `🎥 Documentary Style:
Shot on Fuji X100V or similar rangefinder
Natural available light only
Honest and unposed feeling
Street photography aesthetic
Slight grain and contrast`,

  golden_hour: `🌅 Golden Hour Style:
Warm sunset light at 15-20 degrees above horizon
Long shadows and orange-pink color cast
Natural lens warmth and flare
Glowing skin highlights
Dreamy but authentic`,

  studio_clean: `🏢 Studio Clean Style:
Professional studio lighting setup
White or grey seamless backdrop
Even, flattering illumination
Commercial photography quality
Sharp focus throughout`,

  lifestyle: `🏠 Lifestyle Style:
Natural window light
Lived-in, authentic environments
Candid and relatable
Warm and inviting atmosphere
Instagram lifestyle aesthetic`,
}

/**
 * SCENE PRESETS - Where the photo takes place
 * Now with pose-adaptive placement for natural scene integration
 */
interface ScenePreset {
  description: string
  lighting: string
  details: string
  /** Pose-adaptive placement - scene adapts to user's pose, not the other way around */
  poseAdaptation: {
    standing: string
    sitting: string
    leaning: string
    walking: string
    other: string
  }
}

const SCENE_PRESETS: Record<string, ScenePreset> = {
  keep_original: {
    description: 'Keep the original background exactly as it appears',
    lighting: 'Same lighting as the original photo',
    details: 'Do not modify anything about the environment',
    poseAdaptation: {
      standing: 'Keep exact original placement',
      sitting: 'Keep exact original placement',
      leaning: 'Keep exact original placement',
      walking: 'Keep exact original placement',
      other: 'Keep exact original placement',
    },
  },

  studio_white: {
    description: 'Professional photography studio with seamless white paper backdrop',
    lighting: 'Three-point studio lighting: soft key light from 45°, fill light opposite, rim light for separation',
    details: 'Natural paper curve where wall meets floor, subtle shadow gradients, minor creases visible',
    poseAdaptation: {
      standing: 'Standing naturally on studio floor, full body or 3/4 framing',
      sitting: 'Seated on white studio apple box or stool, clean minimal setup',
      leaning: 'Leaning slightly against white cyclorama wall edge',
      walking: 'Mid-stride movement captured on studio floor',
      other: 'Natural placement on studio floor with appropriate framing',
    },
  },

  studio_grey: {
    description: 'Photography studio with grey muslin fabric backdrop',
    lighting: 'Soft box lighting from camera right creating gentle directional shadows',
    details: 'Natural fabric texture and draping, slightly worn edges, uneven neutral tones',
    poseAdaptation: {
      standing: 'Standing centered against grey backdrop, professional portrait framing',
      sitting: 'Seated on wooden stool or low bench, fabric draping behind',
      leaning: 'Leaning casually against studio wall or posing stand',
      walking: 'Captured in motion across studio space',
      other: 'Natural placement with grey backdrop visible behind',
    },
  },

  outdoor_natural: {
    description: 'Lush Indian garden with bougainvillea, tropical plants, and stone pathways',
    lighting: 'Dappled natural sunlight filtering through leaves, organic shadow patterns',
    details: 'Terracotta pots, moss between stones, fallen flowers, weathered textures',
    poseAdaptation: {
      standing: 'Standing on weathered stone pathway, garden around, bougainvillea visible',
      sitting: 'Seated on low garden wall or ornate stone bench among plants',
      leaning: 'Leaning against old tree trunk or garden pillar with vines',
      walking: 'Strolling through garden path, plants on either side',
      other: 'Naturally placed in garden setting with tropical backdrop',
    },
  },

  outdoor_golden: {
    description: 'Indian rooftop terrace at golden hour with city skyline',
    lighting: 'Warm golden sun at 15°, long shadows, orange-pink sky gradient',
    details: 'Potted tulsi and money plant, faded chairs, rusty railing, atmospheric haze',
    poseAdaptation: {
      standing: 'Standing by terrace railing, golden light on face, city behind',
      sitting: 'Seated on old terrace chair or low parapet wall, sunset visible',
      leaning: 'Leaning on rusty terrace railing, overlooking city at golden hour',
      walking: 'Walking across rooftop terrace, potted plants around',
      other: 'Natural terrace placement with golden hour lighting',
    },
  },

  outdoor_beach: {
    description: 'Authentic Goa beach with palm trees and fishing boats in distance',
    lighting: 'Bright coastal sun with water glare, fill from sand reflection',
    details: 'Wet sand with footprints, seaweed, weathered palms, beach shack visible',
    poseAdaptation: {
      standing: 'Standing on sandy beach, waves in background, palm trees visible',
      sitting: 'Seated on beach sand or colorful beach towel, ocean behind',
      leaning: 'Leaning against weathered palm tree trunk or beach shack post',
      walking: 'Walking along shoreline, wet sand, footprints trailing',
      other: 'Natural beach placement with coastal backdrop',
    },
  },

  street_city: {
    description: 'Vibrant Indian city street with colorful buildings and local life',
    lighting: 'Harsh midday sun with strong shadows, slight dust haze in air',
    details: 'Parked scooters, chai stall, tangled wires, hand-painted signs, auto-rickshaw',
    poseAdaptation: {
      standing: 'Standing on busy sidewalk, colorful shops behind, urban activity visible',
      sitting: 'Seated on weathered building steps or chai stall bench, street visible',
      leaning: 'Leaning against colorful painted wall or old pillar, signs around',
      walking: 'Walking down busy street, scooters and shops blurred behind',
      other: 'Natural street placement with urban Indian backdrop',
    },
  },

  street_cafe: {
    description: 'Cozy Indian café with vintage Bollywood posters and fairy lights',
    lighting: 'Warm ambient bulb light mixed with cool window daylight',
    details: 'Mismatched wooden chairs, chipped tables, plants in recycled tins, chai menu',
    poseAdaptation: {
      standing: 'Standing at café counter ordering, chalkboard menu visible behind',
      sitting: 'Seated at wooden café table, chai cup nearby, fairy lights above',
      leaning: 'Leaning on café counter or doorframe, vintage posters visible',
      walking: 'Entering café through door, interior visible behind',
      other: 'Natural café placement with cozy ambiance',
    },
  },

  lifestyle_home: {
    description: 'Real Indian apartment with natural window light and personal touches',
    lighting: 'Natural window light with dust motes, warm afternoon glow',
    details: 'Family photos, indoor plants, colorful cushions, everyday clutter, chai cup',
    poseAdaptation: {
      standing: 'Standing by window in living room, afternoon light, home visible',
      sitting: 'Seated on sofa or floor cushions, coffee table nearby, homey feel',
      leaning: 'Leaning in doorframe or against kitchen counter at home',
      walking: 'Walking through home corridor or between rooms',
      other: 'Natural home placement with lived-in Indian apartment feel',
    },
  },

  lifestyle_office: {
    description: 'Modern Indian corporate office with typical workspace setup',
    lighting: 'Overhead fluorescent mixed with window light from one side',
    details: 'Dual monitors, papers, water bottle, desk plant, motivational poster',
    poseAdaptation: {
      standing: 'Standing by office window or near whiteboard, colleagues blurred behind',
      sitting: 'Seated at desk with ergonomic chair, laptop open, coffee mug nearby',
      leaning: 'Leaning on cubicle divider or standing desk, office visible',
      walking: 'Walking through office corridor, glass partitions visible',
      other: 'Natural office placement with corporate workspace backdrop',
    },
  },

  editorial_minimal: {
    description: 'Minimal industrial space with raw concrete and architectural elements',
    lighting: 'Dramatic directional light creating deep shadows, rim light on hair',
    details: 'Raw concrete walls with form marks, polished floor with scuffs, negative space',
    poseAdaptation: {
      standing: 'Standing in vast industrial space, concrete walls, dramatic shadows',
      sitting: 'Seated on concrete ledge or industrial step, architectural lines visible',
      leaning: 'Leaning against raw concrete column, dramatic rim lighting',
      walking: 'Striding through industrial space, motion and architecture combined',
      other: 'Natural placement in minimal industrial setting',
    },
  },
}

// ====================================================================================
// ANTI-AI MARKERS - Making images look authentic
// ====================================================================================

const REALISM_REQUIREMENTS = `🎯 ANTI-AI REQUIREMENTS (Make it look REAL, not AI-generated):

HUMAN DETAILS:
• Visible skin pores and fine texture on face
• Natural micro-expressions (not frozen perfect smile)
• Subtle skin color variation across face and body
• Natural hair with flyaways, frizz, and imperfect strands
• Real eye reflections showing light source

CLOTHING PHYSICS:
• Natural fabric wrinkles from body movement
• Proper draping based on fabric weight and type
• Minor imperfections in how clothes fit
• Realistic shadows under fabric folds

ENVIRONMENT AUTHENTICITY:
• Real-world imperfections (dust, wear, age)
• Proper depth of field and focus
• Subtle film grain or sensor noise
• Natural color variations in lighting

AVOID THESE AI TELLS:
• Plastic/waxy skin appearance
• Over-sharpened or over-smoothed features
• Uncanny symmetry in face or body
• Floating or detached elements
• Unrealistic lighting or shadows`

// ====================================================================================
// PROMPT BUILDERS - NEW ARCHITECTURE: Image-only identity, text-only garment
// ====================================================================================

interface PromptContext {
  presetId: string | null
  scene: typeof SCENE_PRESETS[string] | null
  styleKey: string
  keepBackground: boolean
  garmentDescription: string // Text description from garment analysis
  lightingInstruction?: string
  garmentEnforcementBlock?: string // Strict pattern/color enforcement from JSON schema
}

/**
 * Build prompt for NEW ARCHITECTURE: Identity from image only, garment from text
 * No forensic analysis, no multi-image references, no garment images
 * 
 * PRO IDENTITY PRESERVATION ARCHITECTURE:
 * - Face is IMMUTABLE read-only pixel region
 * - PRO must NOT generate or modify the face
 * - Temperature hard limit: 0.04
 * - Face creativity: ZERO
 * - Beauty correction: DISABLED
 */
function buildProPrompt(ctx: PromptContext): string {
  const { scene, styleKey, keepBackground, garmentDescription, lightingInstruction } = ctx

  const style = STYLE_SETTINGS[styleKey] || STYLE_SETTINGS.iphone_candid
  const lighting = lightingInstruction || 'natural lighting'

  // ═══════════════════════════════════════════════════════════════════════════
  // PRO IDENTITY PRESERVATION ARCHITECTURE - MANDATORY
  // ═══════════════════════════════════════════════════════════════════════════
  const proIdentityArchitecture = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              PRO MODEL — IDENTITY PRESERVATION ARCHITECTURE                   ║
║                         MANDATORY CONSTRAINTS                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

★★★ PRO MUST NOT GENERATE OR MODIFY THE FACE ★★★

════════════════════════════════════════════════════════════════════════════════
FACE HANDLING (IMMUTABLE):
════════════════════════════════════════════════════════════════════════════════
• The face from Image 1 is IMMUTABLE
• Treat the face as a READ-ONLY PIXEL REGION
• Do NOT redraw facial features
• Do NOT enhance facial features
• Do NOT beautify facial features
• Do NOT symmetrize facial features
• Do NOT correct facial features

ABSOLUTELY FORBIDDEN - FACE:
✗ Changes to eye size
✗ Changes to eye shape
✗ Changes to nose width
✗ Changes to nose shape
✗ Changes to jaw shape
✗ Changes to jaw mass
✗ Changes to cheek volume
✗ Changes to lip shape
✗ Changes to beard
✗ Changes to hairline
✗ Skin smoothing
✗ Wrinkle removal
✗ Any beautification
✗ Any "improvement"

════════════════════════════════════════════════════════════════════════════════
BODY HANDLING (LOCKED — ANALYZE FACE FIRST):
════════════════════════════════════════════════════════════════════════════════

★★★ BEFORE GENERATING BODY, ANALYZE THE FACE ★★★

Look at the face in Image 1 and determine body mass:

| IF FACE SHOWS...        | THEN BODY MUST BE...                |
|-------------------------|-------------------------------------|
| Full/round cheeks       | Plus-size, full torso               |
| Wide jaw                | Broad shoulders                     |
| Double chin             | Heavy build, visible belly          |
| Thick neck              | Thick arms, full torso              |
| Soft jawline            | Soft body contours                  |
| Round face shape        | Fuller body overall                 |

• The body from Image 1 defines the ONLY valid body
• Preserve body mass EXACTLY as shown
• Preserve shoulder width EXACTLY
• Preserve arm thickness EXACTLY  
• Preserve torso volume EXACTLY
• Maintain original head-to-shoulder ratio
• Maintain original head-to-torso ratio

ABSOLUTELY FORBIDDEN - BODY:
✗ Slimming the body
✗ Stretching the body
✗ Elongating the body
✗ Reshaping the body
✗ "Flattering" adjustments
✗ Model-like proportions
✗ Athletic body from round face
✗ Slim waist from full cheeks

★★★ FULL FACE = FULL BODY — NO EXCEPTIONS ★★★

════════════════════════════════════════════════════════════════════════════════
CLOTHING REFERENCE RULE (CBN-ST):
════════════════════════════════════════════════════════════════════════════════
• The clothing reference image contains NO VALID BODY
• Ignore ALL human proportions in clothing reference
• The model wearing the clothes is IRRELEVANT
• Treat clothing reference as FABRIC-ONLY:
  ✓ Texture
  ✓ Color
  ✓ Seams
  ✓ Drape
• The garment must STRETCH to fit the person's body
• The body must NEVER shrink to fit the clothing
• If the user is plus-size → cloth wrinkles and stretches around their body

════════════════════════════════════════════════════════════════════════════════
PRO MODEL PARAMETERS:
════════════════════════════════════════════════════════════════════════════════
• Temperature hard limit: 0.04
• Face creativity: ZERO
• Beauty correction: DISABLED
• Identity editing: DISABLED
• Body slimming: DISABLED

════════════════════════════════════════════════════════════════════════════════
FACE-BODY COHERENCE (FINAL CHECK):
════════════════════════════════════════════════════════════════════════════════

Before finalizing, verify these coherence rules:

CHECK 1: FACE-BODY WEIGHT MATCH
• Full face → Full body (NOT slim body)
• Round cheeks → Thick arms (NOT thin arms)
• Wide jaw → Broad shoulders (NOT narrow)
• Double chin → Body shows weight (NOT flat stomach)

CHECK 2: NECK-SHOULDER MATCH
• Thick neck → Broad shoulders
• The neck must connect face to body smoothly

CHECK 3: PROPORTION MATCH
• Head-to-body ratio from Image 1 = PRESERVED
• If head seems "big" relative to body → FAILED (body was slimmed)

⛔ MISMATCH = GENERATION FAILED:
• Round face + slim body = FAILED
• Full cheeks + thin arms = FAILED
• Wide neck + narrow shoulders = FAILED

════════════════════════════════════════════════════════════════════════════════
FAIL CONDITIONS (GENERATION FAILED IF):
════════════════════════════════════════════════════════════════════════════════
★ If facial structure changes → FAIL
★ If eyes, nose, or jaw drift → FAIL
★ If body mass changes → FAIL
★ If body is slimmer than face suggests → FAIL
★ If head size changes → FAIL
★ If face looks beautified → FAIL
★ If full face appears on slim body → FAIL
`

  // Keep background mode
  if (keepBackground) {
    return `VIRTUAL CLOTHING TRY-ON — IDENTITY PRESERVATION ENGINE

${proIdentityArchitecture}

${FACE_PIXEL_FREEZE_PROMPT}

${PRO_FACE_FREEZE}

${BODY_AUTHORITY_TABLE}

${CLOTHING_REFERENCE_BLOCK}

${BODY_PHYSICS_ALIGNMENT}

${FACE_BODY_COHERENCE_CHECK}

${ANTI_PASTEL_DIVERSITY}

YOUR TASK:
Create a new photo of this EXACT same person wearing a new outfit.

GARMENT TO APPLY:
Look at Image 2 - that is the garment. Analyze it visually and copy:
• The exact garment type (shirt/kurta/dress) as shown
• The exact length as shown (where it ends on the body)
• The exact pattern and color as shown
• DO NOT use any text description - look at the image itself

EXECUTION ORDER (MANDATORY):
1. ANALYZE Image 1 face → derive body proportions
2. COPY face pixels (not generate new ones)
3. APPLY body proportions from face analysis
4. BLOCK all body data from clothing reference
5. EXTRACT garment fabric/color/pattern ONLY from clothing ref
6. ADAPT garment to user's body (not vice versa)
7. VERIFY face-body coherence before output

LIGHTING RULE:
• Lighting adjustments = global color temperature ONLY
• Do NOT relight face independently
• Do NOT add new shadows on face

${REALISM_REQUIREMENTS}

SUCCESS CRITERIA:
✓ Mother recognizes daughter
✓ Face fat = Body fat (no mismatch)
✓ No pasted-head feeling
✓ Family would recognize them instantly`
  }

  // Scene change mode
  if (scene && scene.description) {
    return `FASHION PHOTOGRAPHY: VIRTUAL TRY-ON WITH NEW SCENE

${proIdentityArchitecture}

${IML_COHERENCE_PROMPT}

${BODY_SOURCE_ENFORCEMENT}

YOUR TASK:
Create a professional fashion photo of this person wearing a new outfit in a new setting.

GARMENT TO APPLY:
Look at Image 2 - that is the garment. Copy exactly what you see visually.

EXECUTION ORDER:
1. FREEZE face and body from Image 1 (read-only)
2. Build scene WITHOUT face access
3. Apply garment to LOCKED body
4. Composite original face pixels back

SCENE:
📍 LOCATION: ${scene.description}
💡 LIGHTING: ${scene.lighting}
🔍 DETAILS: ${scene.details}

STYLE:
${style}

${REALISM_REQUIREMENTS}

CRITICAL RULES:
• Face CANNOT change - direct pixel copy from input image
• Body proportions CANNOT change - exact from input image
• Scene lighting affects skin COLOR only, not face STRUCTURE
• Background should be sharp and detailed, not blurry AI mush

The person should look naturally photographed in this location.`
  }

  // Custom background (fallback)
  return `VIRTUAL TRY-ON

${proIdentityArchitecture}

GARMENT TO APPLY:
Look at Image 2 - copy the garment exactly as shown visually.

OUTFIT: Apply the garment described above with natural fit on LOCKED body.

${style}

${REALISM_REQUIREMENTS}

Create an authentic-looking photo of this exact person in the new outfit.
Face and body are IMMUTABLE from Image 1.`
}

/**
 * Build prompt for Flash model - NEW ARCHITECTURE: Image-only identity, text-only garment
 * 
 * FLASH MODEL CONSTRAINTS - MANDATORY:
 * - Identity and body preservation over creativity
 * - Temperature: 0.01 (deterministic)
 * - No beautification, no fashion poses
 */
function buildFlashPrompt(ctx: PromptContext): string {
  const { scene, keepBackground, garmentDescription, lightingInstruction, garmentEnforcementBlock } = ctx

  const lighting = lightingInstruction || 'natural lighting'

  // ═══════════════════════════════════════════════════════════════════════════
  // FLASH IDENTITY & BODY LOCK - MANDATORY
  // ═══════════════════════════════════════════════════════════════════════════
  const flashIdentityLock = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║              FLASH MODEL — IDENTITY & BODY LOCK                               ║
║                     MANDATORY CONSTRAINTS                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

This generation must prioritize IDENTITY and BODY preservation over creativity.

════════════════════════════════════════════════════════════════════════════════
IDENTITY & BODY LOCK (ANALYZE FACE TO DETERMINE BODY):
════════════════════════════════════════════════════════════════════════════════

★★★ BEFORE GENERATING BODY, ANALYZE THE FACE ★★★

Look at the face in Image 1 and determine body mass:

| IF FACE SHOWS...        | THEN BODY MUST BE...                |
|-------------------------|-------------------------------------|
| Full/round cheeks       | Plus-size, full torso               |
| Wide jaw                | Broad shoulders                     |
| Double chin             | Heavy build, visible belly          |
| Thick neck              | Thick arms, full torso              |
| Soft jawline            | Soft body contours                  |
| Round face shape        | Fuller body overall                 |

• The person in Image 1 defines the ONLY valid human
• Preserve face geometry EXACTLY
• Preserve eye size EXACTLY
• Preserve nose width EXACTLY
• Preserve jaw mass EXACTLY
• Preserve cheek volume EXACTLY
• Preserve body mass EXACTLY
• Preserve shoulder width EXACTLY
• Preserve arm thickness EXACTLY
• Preserve torso volume EXACTLY
• Maintain original head-to-shoulder ratio from Image 1
• Maintain original head-to-torso ratio from Image 1

ABSOLUTELY FORBIDDEN:
✗ Do NOT slim the body
✗ Do NOT stretch the body
✗ Do NOT elongate the body
✗ Do NOT reshape the body
✗ Do NOT change face structure
✗ Do NOT resize eyes
✗ Do NOT reshape nose
✗ Do NOT modify jaw
✗ Do NOT create slim body from round face
✗ Do NOT create athletic body from full cheeks

★★★ FULL FACE = FULL BODY — NO EXCEPTIONS ★★★

════════════════════════════════════════════════════════════════════════════════
CLOTHING REFERENCE RULE (CBN-ST):
════════════════════════════════════════════════════════════════════════════════
• The clothing reference image contains NO VALID BODY
• The model wearing the clothes is IRRELEVANT
• Ignore ALL human proportions in the clothing reference
• Treat clothing reference as FABRIC-ONLY:
  ✓ Texture
  ✓ Color
  ✓ Seams
  ✓ Drape
• The garment must STRETCH to fit the person's body
• The body must NEVER shrink to fit the clothing
• If the user is plus-size → cloth wrinkles and stretches around their body

════════════════════════════════════════════════════════════════════════════════
POSE & PHYSICS:
════════════════════════════════════════════════════════════════════════════════
• Use natural posture appropriate to the person's body mass
• No fashion poses
• No model stances
• Natural clothing drape based on body shape

════════════════════════════════════════════════════════════════════════════════
SCENE LIMITATION:
════════════════════════════════════════════════════════════════════════════════
• Apply only mild background variation
• Do NOT change camera angle dramatically
• Lighting variations only (neutral / warm / cool)

════════════════════════════════════════════════════════════════════════════════
VARIANTS RULE:
════════════════════════════════════════════════════════════════════════════════
Generate with:
• Same face (exact pixels)
• Same body (exact proportions)
• Same garment fit
• Different lighting moods ONLY

════════════════════════════════════════════════════════════════════════════════
FAIL CONDITIONS:
════════════════════════════════════════════════════════════════════════════════
★ If body mass changes → FAIL
★ If head size changes → FAIL
★ If face looks beautified → FAIL
★ If face structure changes → FAIL
★ If eyes, nose, or jaw drift → FAIL
`

  if (keepBackground) {
    return `CLOTHING TRY-ON — FLASH IDENTITY PRESERVATION ENGINE

${flashIdentityLock}

${FACE_PIXEL_FREEZE_PROMPT}

${FLASH_FACE_FREEZE}

${BODY_AUTHORITY_TABLE}

${CLOTHING_REFERENCE_BLOCK}

${BODY_PHYSICS_ALIGNMENT}

${FACE_BODY_COHERENCE_CHECK}

GARMENT TO APPLY:
Look at Image 2 - copy the garment exactly as shown visually.

FLASH EXECUTION ORDER (DETERMINISTIC):
1. ANALYZE face in Image 1 → derive body proportions
2. PIXEL COPY face (temperature 0.01, NO generation)
3. BODY from face analysis ONLY
4. BLOCK clothing reference body (it is NULL)
5. EXTRACT garment fabric/color ONLY
6. ADAPT garment to user body
7. VERIFY face-body coherence

FLASH PRIORITY (IDENTITY > ALL):
1. Identity preservation (HIGHEST)
2. Body preservation
3. Garment accuracy
4. Scene quality (LOWEST)

FORBIDDEN:
✗ Face regeneration
✗ Face beautification
✗ Body slimming
✗ Body from clothing reference

SUCCESS:
✓ Mother recognizes daughter
✓ Face fat = Body fat
✓ No pasted-head effect`
  }

  if (scene && scene.description) {
    return `CLOTHING TRY-ON + SCENE CHANGE

${flashIdentityLock}

GARMENT TO APPLY:
Look at Image 2 - copy the garment exactly as shown visually.
${garmentEnforcementBlock || ''}

TASK:
1. COPY face pixels exactly from Image 1
2. PRESERVE body proportions exactly from Image 1
3. Remove their current outfit completely
4. Apply the garment (ADAPTED to their actual body)
5. Change background to: ${scene.description}
6. Natural pose appropriate to body mass (no fashion poses)

SCENE:
📍 ${scene.description}
💡 ${scene.lighting}
🔍 ${scene.details}

BODY CONSISTENCY:
• Preserve original body proportions from Image 1
• No slimming, stretching, or posture correction

❌ FORBIDDEN: 
• Different face or person
• Changed eye shape or color
• Lighter or darker skin
• Changed lip shape
• Smoothed/plastic skin
• Thinner body
• Changed body proportions

OUTPUT: SAME person (exact face and body), NEW clothes (adapted to their body), NEW background.`
  }

  // Fallback
  return `CLOTHING TRY-ON

${flashIdentityLock}

GARMENT TO APPLY:
Look at Image 2 - copy the garment exactly as shown visually.
${garmentEnforcementBlock || ''}

Apply the garment described above.
KEEP EXACT same face (pixel copy from Image 1).
KEEP EXACT same body proportions.
Garment ADAPTS to body, body does NOT change.

OUTPUT: Same person (exact face and body), new outfit.`
}

// ====================================================================================
// RENDER FUNCTIONS
// ====================================================================================

export interface SimpleRenderOptions {
  subjectImageBase64: string // Image 1: Person (identity source)
  garmentImageBase64: string // Image 2: Garment (visual reference, no face/identity)
  backgroundInstruction: string
  lightingInstruction?: string
  quality: 'fast' | 'high'
  aspectRatio?: string
  resolution?: string
  stylePresetId?: string
  userRequest?: string  // Contains all constraint prompts and preset scene descriptions
  garmentEnforcementBlock?: string // Strict pattern/color enforcement from JSON schema
}

// ====================================================================================
// DEPRECATED: FORENSIC-ENHANCED PROMPTS (Not used in new architecture)
// ====================================================================================
// These functions are kept for reference but are not called in the new architecture.
// The new architecture uses image-only identity (no forensic text descriptions).

/**
 * @deprecated Not used in new architecture - identity comes from image only
 */
function buildDynamicEyeLock(analysis: any): string {
  return `
═══════════════════════════════════════════════════════════════════════════════
👁️ BIOMETRIC EYE LOCK (NON-NEGOTIABLE HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════════════════════════
The eyes are the PRIMARY identity vector. You must match these specific forensics:

• COLOR: [${analysis.eyeColor || 'Reference'}] - Exact match required
• SHAPE: [${analysis.eyeShape || 'Reference'}]
• EYEBROWS: [${analysis.eyebrowShape || 'Reference'}] - ${analysis.eyebrowThickness || ''}
• LIDS: [${analysis.eyelidType || 'Reference'}]

⚠️ REJECTION CRITERIA:
- If eye color is different -> REJECT
- If eye shape is generic/round -> REJECT
- If skin around eyes is smoothed -> REJECT
═══════════════════════════════════════════════════════════════════════════════`
}

/**
 * @deprecated Not used in new architecture - identity comes from image only
 */
function buildForensicEnhancedPrompt(
  faceAnalysis: any,
  garmentAnalysis: GarmentAnalysis,
  scene: ScenePreset | null,
  styleKey: string,
  keepBackground: boolean,
  identityCount: number,
  photoAnalysis?: any,
  variant: 'flash' | 'pro' = 'pro'
): string {
  const style = STYLE_SETTINGS[styleKey] || STYLE_SETTINGS.iphone_candid
  // @ts-ignore - deprecated function
  const identityPrompt = buildIdentityPromptFromAnalysis(faceAnalysis)
  const eyeLockPrompt = buildDynamicEyeLock(faceAnalysis)
  // @ts-ignore - deprecated function
  const garmentPrompt = buildGarmentPromptFromAnalysis(garmentAnalysis)

  // Get detected body pose for scene adaptation
  const bodyPose: any = photoAnalysis?.body_pose || 'standing'

  // Get pose-adaptive placement if scene is available
  const poseSpecificPlacement = (scene?.poseAdaptation && typeof bodyPose === 'string' && bodyPose in scene.poseAdaptation)
    ? scene.poseAdaptation[bodyPose as keyof typeof scene.poseAdaptation] || ''
    : ''

  const captureHints = photoAnalysis
    ? `CAPTURE MATCH(from original photo):
- Camera: ${photoAnalysis.camera_summary}
- Lighting: ${photoAnalysis.lighting_summary}
- Detected pose: ${bodyPose.toUpperCase()} - adapt scene accordingly
  - Realism: ${photoAnalysis.realism_constraints}
- Lens hint: ${photoAnalysis.camera_manifest.focal_length_hint_mm} mm, DOF: ${photoAnalysis.camera_manifest.dof_hint}
- WB: ${photoAnalysis.camera_manifest.wb_family}, Grain: ${photoAnalysis.camera_manifest.imperfections.grain_level}

COMPOSITING AVOIDANCE:
- Do NOT look like a cutout.No halo edges.Add subtle light wrap and ambient occlusion.
- Add correct contact shadows on neck / under chin / under arms / where clothes touch body.
- Match background blur, grain / noise, and compression to the subject photo.`
    : ''

  const refExplanation = identityCount > 0
    ? `You have ${identityCount + 1} reference photos of the SAME PERSON.The LAST image is the GARMENT.`
    : `Image 1 = PERSON reference.Image 2 = GARMENT to apply.`

  if (keepBackground) {
    // Flash works best with short "edit the photo" instructions to avoid face drift.
    if (variant === 'flash') {
      return `🎯 CLOTHING TRY - ON: CHANGE THE OUTFIT

${refExplanation}

CHARACTER REFERENCE: Use Images 1 - ${identityCount + 1} as character reference sheets.
These images show the EXACT person who must appear.Maintain their exact facial features.

  ${identityPrompt}

${garmentPrompt}

═══════════════════════════════════════════════════════════════════════════════
🚨 CRITICAL: YOU MUST CHANGE THE CLOTHING
═══════════════════════════════════════════════════════════════════════════════
The person is currently wearing one outfit.You MUST replace it with a DIFFERENT outfit from the garment reference.

⚠️ ANTI - HALLUCINATION CHECK:
- Look at the LAST image - that is the NEW garment
  - The output person MUST be wearing THIS garment, NOT their original clothes
    - If the output looks the same as input → YOU FAILED
      - The garment color, style, and type MUST match the garment reference exactly

═══════════════════════════════════════════════════════════════════════════════
TASK: SWAP CLOTHING
═══════════════════════════════════════════════════════════════════════════════
1. LOOK at the garment reference(last image) - memorize its color, style, fabric
2. REMOVE the person's current outfit COMPLETELY (no traces left)
3. DRESS them in the garment from the reference - exact same color and style
4. Keep face, body, pose, background UNCHANGED

⛔ NEGATIVE PROMPT(FORBIDDEN):
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape, altering nose or lips
    - Lightening or darkening skin tone, smoothing skin texture
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance
          - Keeping the original outfit(MOST COMMON FAILURE)

✅ TECHNICAL REQUIREMENTS(For Realistic Texture):
- Shot on 85mm lens, visible pore details, slight skin imperfections
  - Natural skin texture with micro - details, not plastic or waxy
    - Realistic fabric wrinkles and draping
      - Match original photo's grain, compression, and sharpness

✅ SUCCESS CRITERIA:
- Person wears EXACTLY the garment from reference
  - Garment color matches reference exactly
    - Face is IDENTICAL to character reference images
      - Background is identical to input(same photo quality, not AI - perfect)

OUTPUT: Same person(from character reference), same background, DIFFERENT outfit(from garment reference).`
    }

    return `🔒 CLOTHING TRY - ON - FORENSIC IDENTITY MODE

${refExplanation}

CHARACTER REFERENCE: Images 1 - ${identityCount + 1} are character reference sheets.
Use these as the ground truth for the person's identity. Maintain exact facial features.

${identityPrompt}

${eyeLockPrompt}

${garmentPrompt}

═══════════════════════════════════════════════════════════════════════════════
🚨🚨🚨 CRITICAL: YOU MUST CHANGE THE CLOTHING 🚨🚨🚨
═══════════════════════════════════════════════════════════════════════════════
This is a TRY - ON task.The person MUST end up wearing a DIFFERENT outfit.

  ANTI - HALLUCINATION CHECKLIST:
□ Look at the LAST image - that is the NEW garment to apply
□ Memorize its exact color, fabric, neckline, sleeves, pattern
□ The output person MUST wear THIS garment, NOT their original clothes
□ If output looks like input → TASK FAILED
□ If garment color / style differs from reference → TASK FAILED

═══════════════════════════════════════════════════════════════════════════════
⛔ NEGATIVE PROMPT(FORBIDDEN - PREVENTS FACE DRIFT):
═══════════════════════════════════════════════════════════════════════════════
Ensure consistent identity.FORBIDDEN:
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape / size / spacing, altering nose / lips
    - Lightening or darkening skin tone, smoothing skin texture, removing pores
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance
          - Averaging faces, blending identities, creating a generic face
            - Keeping the original outfit(MOST COMMON FAILURE)

═══════════════════════════════════════════════════════════════════════════════
✅ TECHNICAL REQUIREMENTS(Candid Photography Technique):
═══════════════════════════════════════════════════════════════════════════════
- Shot on 85mm lens, visible pore details, slight skin imperfections
  - Natural skin texture with micro - details, not plastic or waxy
    - Realistic fabric wrinkles and draping
      - Match original photo's grain, compression, and sharpness
        - Candid photography style, not studio - perfect

═══════════════════════════════════════════════════════════════════════════════
🔐 SOURCE HIERARCHY
═══════════════════════════════════════════════════════════════════════════════
IDENTITY → Character reference images(Images 1 - ${identityCount + 1}) - use as ground truth
CLOTHING → Garment reference(LAST image) ← THIS MUST BE APPLIED
BACKGROUND → Keep ORIGINAL from person image(do NOT regenerate)
POSE → Keep original
LIGHTING → Keep original

═══════════════════════════════════════════════════════════════════════════════
📋 EXECUTION STEPS
═══════════════════════════════════════════════════════════════════════════════
1. STUDY the garment reference - what color ? what style ? what fabric ?
  2. STUDY the person references - memorize face details
3. REMOVE person's current outfit COMPLETELY
4. DRESS them in the garment from reference - EXACT color and style
5. VERIFY: Is the new outfit DIFFERENT from original ? If same → redo
6. VERIFY: Does garment match reference exactly ? If not → redo
7. VERIFY: Is face identical ? Is background unchanged ?

═══════════════════════════════════════════════════════════════════════════════
⛔ FAILURE MODES(MUST AVOID)
═══════════════════════════════════════════════════════════════════════════════
❌ Keeping the original outfit(MOST COMMON FAILURE)
❌ Generating a similar but not identical garment
❌ Wrong garment color(must match reference exactly)
❌ AI - generated / artificial looking background
❌ Face drift or beautification

═══════════════════════════════════════════════════════════════════════════════
✅ SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════
✓ Person wears EXACTLY the garment from the reference image
✓ Garment color and style match reference precisely
✓ Face is biometrically identical
✓ Background is ORIGINAL(not AI - regenerated, same quality / grain)
✓ Natural fabric wrinkles and draping

OUTPUT: SAME person + SAME background + DIFFERENT outfit(from garment ref).`
  }

  if (scene?.description) {
    return `📸 CLOTHING TRY - ON + SCENE CHANGE

${refExplanation}

CHARACTER REFERENCE: Images 1 - ${identityCount + 1} are character reference sheets.
Use these as the ground truth for the person's identity. Maintain exact facial features.

${identityPrompt}

${eyeLockPrompt}

${garmentPrompt}

═══════════════════════════════════════════════════════════════════════════════
🚨🚨🚨 CRITICAL: YOU MUST CHANGE THE CLOTHING 🚨🚨🚨
═══════════════════════════════════════════════════════════════════════════════
This is a TRY - ON task.The person MUST wear a DIFFERENT outfit.

  ANTI - HALLUCINATION CHECKLIST:
□ Look at the LAST image - that is the NEW garment
□ Memorize its exact color, fabric, neckline, sleeves, pattern
□ The output person MUST wear THIS garment, NOT their original clothes
□ If output clothing looks like input → TASK FAILED

═══════════════════════════════════════════════════════════════════════════════
⛔ NEGATIVE PROMPT(FORBIDDEN - PREVENTS FACE DRIFT):
═══════════════════════════════════════════════════════════════════════════════
Ensure consistent identity.FORBIDDEN:
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape / size / spacing, altering nose / lips
    - Lightening or darkening skin tone, smoothing skin texture, removing pores
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance
          - Averaging faces, blending identities, creating a generic face
            - Keeping the original outfit(MOST COMMON FAILURE)

═══════════════════════════════════════════════════════════════════════════════
✅ TECHNICAL REQUIREMENTS(Candid Photography Technique):
═══════════════════════════════════════════════════════════════════════════════
- Shot on 85mm lens, visible pore details, slight skin imperfections
  - Natural skin texture with micro - details, not plastic or waxy
    - Realistic fabric wrinkles and draping
      - Match original photo's grain, compression, and sharpness
        - Candid photography style, not studio - perfect

═══════════════════════════════════════════════════════════════════════════════
🔐 SOURCE HIERARCHY
═══════════════════════════════════════════════════════════════════════════════
IDENTITY → Character reference images(Images 1 - ${identityCount + 1}) - use as ground truth
CLOTHING → Garment reference(LAST image) ← MUST BE APPLIED
POSE → Keep from person image(${bodyPose.toUpperCase()})
BACKGROUND → NEW scene(described below)

${captureHints}

═══════════════════════════════════════════════════════════════════════════════
🎬 SCENE(NEW BACKGROUND)
═══════════════════════════════════════════════════════════════════════════════
📍 ${scene.description}
💡 ${scene.lighting}
🔍 ${scene.details}

⚠️ ANTI - AI BACKGROUND RULES:
- Background must look like a REAL PHOTOGRAPH, not AI - generated
  - Add natural imperfections: dust, wear, uneven lighting, real textures
    - Include mundane details: power lines, cracks, stains, everyday objects
      - Avoid: perfect symmetry, unnaturally clean surfaces, generic compositions
        - Match the photo quality to the person(same grain, compression, sharpness)

═══════════════════════════════════════════════════════════════════════════════
🧍 POSE - ADAPTIVE PLACEMENT
═══════════════════════════════════════════════════════════════════════════════
Person is ${bodyPose.toUpperCase()} → Scene adapts: ${poseSpecificPlacement}
Do NOT change their pose.Scene wraps around them.

═══════════════════════════════════════════════════════════════════════════════
📋 EXECUTION STEPS
═══════════════════════════════════════════════════════════════════════════════
1. STUDY garment reference - what color ? style ? fabric ?
  2. STUDY person references - memorize face
3. REMOVE person's current outfit COMPLETELY
4. DRESS them in garment from reference - EXACT color / style
5. KEEP their pose(${bodyPose})
6. CREATE realistic scene around them
7. VERIFY: Is outfit DIFFERENT from original ? If same → redo
8. VERIFY: Does garment match reference ? If not → redo
9. VERIFY: Does background look like real photo ? If AI - perfect → redo

═══════════════════════════════════════════════════════════════════════════════
⛔ FAILURE MODES
═══════════════════════════════════════════════════════════════════════════════
❌ Keeping original outfit(MOST COMMON FAILURE)
❌ Wrong garment color(must match reference)
❌ AI - looking background(too clean, too perfect)
❌ Face drift or beautification

═══════════════════════════════════════════════════════════════════════════════
✅ SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════
✓ Person wears EXACTLY the garment from reference
✓ Face is biometrically identical to input
✓ Pose matches input(${bodyPose})
✓ Background looks like REAL photo(not AI - generated)
✓ Natural integration: shadows, lighting, grain

OUTPUT: Same person + same pose + DIFFERENT outfit + realistic new scene.`
  }

  return `🎯 CLOTHING TRY - ON - CHANGE THE OUTFIT

${refExplanation}

CHARACTER REFERENCE: Images 1 - ${identityCount + 1} are character reference sheets.
Use these as the ground truth for the person's identity. Maintain exact facial features.

${identityPrompt}

${eyeLockPrompt}

${garmentPrompt}

═══════════════════════════════════════════════════════════════════════════════
🚨 CRITICAL: YOU MUST CHANGE THE CLOTHING 🚨
═══════════════════════════════════════════════════════════════════════════════
Look at the LAST image - that is the NEW garment.
The output person MUST wear THIS garment, NOT their original clothes.
If output looks like input → TASK FAILED.

═══════════════════════════════════════════════════════════════════════════════
⛔ NEGATIVE PROMPT(FORBIDDEN):
═══════════════════════════════════════════════════════════════════════════════
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape / size / spacing, altering nose / lips
    - Lightening or darkening skin tone, smoothing skin texture, removing pores
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance
          - Keeping the original outfit(MOST COMMON FAILURE)

═══════════════════════════════════════════════════════════════════════════════
✅ TECHNICAL REQUIREMENTS:
═══════════════════════════════════════════════════════════════════════════════
- Shot on 85mm lens, visible pore details, slight skin imperfections
  - Natural skin texture with micro - details, not plastic or waxy
    - Realistic fabric wrinkles and draping

═══════════════════════════════════════════════════════════════════════════════
🔐 RULES
═══════════════════════════════════════════════════════════════════════════════
IDENTITY → From character reference images(use as ground truth)
CLOTHING → From garment reference(LAST image) - MUST apply this
BACKGROUND → Keep original

OUTPUT: Same person(from character reference), DIFFERENT outfit(from garment reference).`
}

// ====================================================================================
// GARMENT-ONLY EXTRACTION (Prevents face-bleed from garment reference images)
// ====================================================================================

/**
 * @deprecated Not used in new architecture - garment images are never sent to Gemini
 */
async function extractGarmentOnlyReference(
  client: GoogleGenAI,
  model: string,
  garmentBase64: string
): Promise<string> {
  // Use a fast, deterministic extraction pass to produce a garment-only reference.
  const extractionPrompt = `GARMENT EXTRACTION(CLOTHING ONLY)

You are given an image that may include a person wearing a garment.
Your job: output an image that contains ONLY the garment.Remove the person completely.

  Requirements:
- Output a clean garment - only reference image on a plain white background(flat - lay or mannequin is OK, but NO HUMAN).
- Preserve the garment EXACTLY: color, pattern, fabric texture, neckline, sleeves, trims, logos, embroidery.
- Do NOT add accessories, do NOT change garment design, do NOT change colors.
- Keep the garment centered, fully visible, sharp focus, neutral lighting.

Return ONLY the extracted garment image.`

  const contents: ContentListUnion = [
    { inlineData: { data: garmentBase64, mimeType: 'image/jpeg' } } as any,
    extractionPrompt,
  ]

  const config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig: { aspectRatio: '1:1' } as any,
    temperature: 0,
  }

  const resp = await client.models.generateContent({ model, contents, config })
  if (resp.candidates?.length) {
    for (const part of resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        return part.inlineData.data
      }
    }
  }
  throw new Error('Garment extraction failed - no image generated')
}

/**
 * @deprecated Not used in new architecture - single-step only
 */
async function renderTwoStepForensic(
  client: GoogleGenAI,
  model: string,
  subjectBase64: string,
  garmentBase64: string,
  identityImages: string[],
  faceAnalysis: any,
  garmentAnalysis: GarmentAnalysis,
  scene: ScenePreset,
  styleKey: string,
  aspectRatio: string,
  resolution?: string,
  photoAnalysis?: any
): Promise<string> {
  const identityCount = identityImages.length
  const style = STYLE_SETTINGS[styleKey] || STYLE_SETTINGS.iphone_candid
  // @ts-ignore - deprecated function
  const identityPrompt = buildIdentityPromptFromAnalysis(faceAnalysis)
  const eyeLockPrompt = buildDynamicEyeLock(faceAnalysis)
  // @ts-ignore - deprecated function
  const garmentPrompt = buildGarmentPromptFromAnalysis(garmentAnalysis)

  // Get detected body pose for scene adaptation
  const bodyPose: any = photoAnalysis?.body_pose || 'standing'
  const poseSpecificPlacement = (scene.poseAdaptation && typeof bodyPose === 'string' && bodyPose in scene.poseAdaptation)
    ? scene.poseAdaptation[bodyPose as keyof typeof scene.poseAdaptation] || ''
    : ''

  console.log('🎯 TWO-STEP (FORENSIC)')
  console.log('   Step 1: Identity + Outfit Lock (neutral background)')

  const step1Prompt = `STEP 1: DRESS THIS PERSON IN THE NEW GARMENT

CHARACTER REFERENCE: Images 1 - ${identityCount + 1} are character reference sheets.
Use these as the ground truth for the person's identity. Maintain exact facial features.

The LAST image is the NEW GARMENT to apply.

🚨 CRITICAL: YOU MUST CHANGE THEIR CLOTHING 🚨
- Look at the LAST image - that is the new garment
  - Memorize its color, fabric, neckline, sleeves, pattern
    - The person MUST end up wearing THIS garment, not their original clothes
      - If output looks like input → TASK FAILED

═══════════════════════════════════════════════════════════════════════════════
${identityPrompt}
${eyeLockPrompt}
═══════════════════════════════════════════════════════════════════════════════
${garmentPrompt}

⛔ NEGATIVE PROMPT(FORBIDDEN):
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape / size / spacing, altering nose / lips
    - Lightening or darkening skin tone, smoothing skin texture, removing pores
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance
          - Keeping the original outfit(MOST COMMON FAILURE)

✅ TECHNICAL REQUIREMENTS:
- Shot on 85mm lens, visible pore details, slight skin imperfections
  - Natural skin texture with micro - details, not plastic or waxy
    - Realistic fabric wrinkles and draping

RULES:
• CLOTHING from garment reference ONLY - apply this exact garment
• IDENTITY from character reference images ONLY - same face exactly
• IGNORE any person in garment image
• REMOVE original outfit completely - no traces

TASK:
1) STUDY garment reference - memorize its color and style
2) REMOVE the person's current outfit
3) DRESS them in the garment from reference
4) Use plain grey studio background
5) VERIFY: Are they wearing the NEW garment ? If same as input → redo

OUTPUT: Same person(from character reference) + DIFFERENT outfit(from garment reference) + grey background.`

  const step1Contents: ContentListUnion = []
  step1Contents.push({ inlineData: { data: subjectBase64, mimeType: 'image/jpeg' } } as any)
  for (const img of identityImages) {
    if (img && img.length > 100) {
      step1Contents.push({ inlineData: { data: img, mimeType: 'image/jpeg' } } as any)
    }
  }
  step1Contents.push({ inlineData: { data: garmentBase64, mimeType: 'image/jpeg' } } as any)
  step1Contents.push(step1Prompt)

  const step1Config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig: { aspectRatio } as any,
    temperature: 0.01,
  }

  const step1Resp = await client.models.generateContent({
    model,
    contents: step1Contents,
    config: step1Config,
  })

  let step1Image: string | null = null
  if (step1Resp.candidates?.length) {
    for (const part of step1Resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        step1Image = part.inlineData.data
        break
      }
    }
  }
  if (!step1Image) throw new Error('Forensic Step 1 failed - no image generated')

  console.log('   Step 2: Scene Application (identity locked)')

  const captureHints = photoAnalysis
    ? `CAPTURE MATCH(from original photo):
- Camera: ${photoAnalysis.camera_summary}
- Lighting: ${photoAnalysis.lighting_summary}
- Realism: ${photoAnalysis.realism_constraints}
- Lens hint: ${photoAnalysis.camera_manifest.focal_length_hint_mm} mm, DOF: ${photoAnalysis.camera_manifest.dof_hint}
- WB: ${photoAnalysis.camera_manifest.wb_family}, Grain: ${photoAnalysis.camera_manifest.imperfections.grain_level}
`
    : ''

  const step2Prompt = `STEP 2: PLACE IN REALISTIC SCENE

Take this person EXACTLY as they appear and place them in a new environment.

═══════════════════════════════════════════════════════════════════════════════
🔒 PERSON IS LOCKED(DO NOT CHANGE)
═══════════════════════════════════════════════════════════════════════════════
• Face: Keep EXACTLY as in input image
• Skin tone: Keep EXACTLY as in input
• Clothing: Keep EXACTLY as in input(from Step 1)
• Pose: Keep EXACTLY(${bodyPose.toUpperCase()})
• Body: No changes whatsoever

⛔ NEGATIVE PROMPT(FORBIDDEN):
- Changing facial structure, different person, morphing features, cartoonish face
  - Widening or narrowing face, changing eye shape / size / spacing, altering nose / lips
    - Lightening or darkening skin tone, smoothing skin texture, removing pores
      - Changing hairstyle, hair color, or hair texture
        - Beautifying, perfecting, or "improving" the person's appearance

═══════════════════════════════════════════════════════════════════════════════
🎬 NEW SCENE
═══════════════════════════════════════════════════════════════════════════════
📍 ${scene.description}
💡 ${scene.lighting}
🔍 ${scene.details}

Pose - adaptive: ${poseSpecificPlacement}

═══════════════════════════════════════════════════════════════════════════════
⚠️ ANTI - AI BACKGROUND RULES(CRITICAL)
═══════════════════════════════════════════════════════════════════════════════
The background must look like a REAL PHOTOGRAPH, not AI - generated:
✓ Add natural imperfections: dust, wear, scratches, uneven paint
✓ Add mundane real - world details: power lines, pipes, stains, cracks
✓ Include asymmetry and natural randomness
✓ Add realistic textures: rough concrete, worn wood, dusty surfaces
✓ Match photo grain / noise to the person
✗ Avoid: perfect symmetry, impossibly clean surfaces
✗ Avoid: unnaturally vibrant colors
✗ Avoid: generic / stock - photo compositions
✗ Avoid: smooth, "rendered" looking surfaces

${style}

${captureHints}

═══════════════════════════════════════════════════════════════════════════════
🔗 INTEGRATION(Avoid Photoshop / cutout look)
═══════════════════════════════════════════════════════════════════════════════
- Same noise / grain as the person
  - Matching shadow direction
    - Contact shadows: under chin, arms, where clothes touch body
      - Natural light wrap on edges
        - Matching depth - of - field
          - Scene elements positioned for ${bodyPose} pose

OUTPUT: Same person(unchanged) naturally photographed in realistic scene.`

  const step2Contents: ContentListUnion = [
    { inlineData: { data: step1Image, mimeType: 'image/jpeg' } } as any,
    step2Prompt,
  ]

  const imageConfig: ImageConfig = { aspectRatio } as any
  if (model.includes('pro') && resolution) {
    ; (imageConfig as any).imageSize = resolution
  }

  const step2Config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig,
    temperature: 0,
  }

  const step2Resp = await client.models.generateContent({
    model,
    contents: step2Contents,
    config: step2Config,
  })

  if (step2Resp.candidates?.length) {
    for (const part of step2Resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        return part.inlineData.data
      }
    }
  }

  console.log('   ⚠️ Forensic Step 2 failed, returning Step 1 result')
  return step1Image
}

/**
 * Single-step render - PHASE 3: Person + Garment (+ optional Face Crop for hyper-realism)
 * 
 * HYPER-REALISM MODE (3 images):
 * - Image 1 = Person (full body context)
 * - Image 2 = Garment (clothing reference)
 * - Image 3 = Face crop (IMMUTABLE face pixels)
 */
async function renderSingleStep(
  client: GoogleGenAI,
  model: string,
  subjectBase64: string,
  garmentImageBase64: string,
  prompt: string,
  aspectRatio: string,
  temperature: number,
  resolution?: string,
  faceCropBase64?: string // NEW: Optional face crop for hyper-realism
): Promise<string> {
  // Build contents array
  const contents: ContentListUnion = []

  // IMAGE 1: Person (identity source)
  contents.push({ inlineData: { data: subjectBase64, mimeType: 'image/jpeg' } } as any)

  // IMAGE 2: Garment (visual reference only, no identity)
  contents.push({ inlineData: { data: garmentImageBase64, mimeType: 'image/jpeg' } } as any)

  // IMAGE 3: Face crop (optional - for hyper-realism face matching)
  const hyperRealismEnabled = !!faceCropBase64
  if (faceCropBase64) {
    contents.push({ inlineData: { data: faceCropBase64, mimeType: 'image/jpeg' } } as any)
  }

  // Prompt (includes role separation and garment application rules)
  contents.push(prompt)

  // ============================================================
  // PHASE 3: DEBUG & SAFETY ASSERTIONS (MANDATORY)
  // ============================================================
  const imageCount = contents.filter((item: any) => item.inlineData?.mimeType?.startsWith('image/')).length
  const expectedImageCount = hyperRealismEnabled ? 3 : 2

  console.log(`\n   🔍 DEBUG & SAFETY ASSERTIONS (renderSingleStep):`)
  console.log(`      Final assembled prompt preview: ${prompt.slice(0, 100)}...`)
  console.log(`      Images sent to Gemini: ${imageCount} (expected: ${expectedImageCount})`)
  console.log(`      Image 1 (person): ✓`)
  console.log(`      Image 2 (garment): ✓`)
  console.log(`      Image 3 (face crop): ${hyperRealismEnabled ? '✓ HYPER-REALISM ACTIVE' : '- not used'}`)

  // HARD FAILURE if contract violated
  if (imageCount !== expectedImageCount) {
    const error = new Error(`ARCHITECTURE VIOLATION: Expected ${expectedImageCount} images, got ${imageCount}`)
    console.error(`   ❌ ${error.message}`)
    throw error
  }

  console.log(`   ✅ All architecture assertions passed`)

  const imageConfig: ImageConfig = { aspectRatio } as any
  if (model.includes('pro') && resolution) {
    (imageConfig as any).imageSize = resolution
  }

  const config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig,
    temperature,
  }

  console.log(`   📸 Generating with Image 1 (identity) + Image 2 (garment)${hyperRealismEnabled ? ' + Image 3 (face crop)' : ''}`)

  const resp = await client.models.generateContent({ model, contents, config })

  // Extract image from response
  if (resp.candidates?.length) {
    for (const part of resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        return part.inlineData.data
      }
    }
  }

  throw new Error('No image generated')
}


/**
 * @deprecated Not used in new architecture - single-step only
 * Two-step render - for scene changes
 * Step 1: Lock identity with outfit (neutral background)
 * Step 2: Apply scene (identity baked in)
 */
async function renderTwoStep(
  client: GoogleGenAI,
  model: string,
  subjectBase64: string,
  garmentBase64: string,
  identityImages: string[],
  scene: typeof SCENE_PRESETS[string],
  styleKey: string,
  aspectRatio: string,
  resolution?: string,
  isPro: boolean = true
): Promise<string> {
  const identityCount = identityImages.length
  const style = STYLE_SETTINGS[styleKey] || STYLE_SETTINGS.iphone_candid

  console.log('🎯 TWO-STEP WORKFLOW')
  console.log('   Step 1: Identity + Outfit Lock')

  // ========== STEP 1: Lock identity with outfit ==========
  const step1Prompt = isPro
    ? `STEP 1: IDENTITY - LOCKED OUTFIT APPLICATION

${identityCount > 0
      ? `You have ${identityCount + 1} photos of the SAME PERSON from different angles.
Study their face carefully from all angles.
The LAST image is the NEW CLOTHING.`
      : `Image 1 = PERSON. Image 2 = NEW CLOTHING.`
    }

🔒 IDENTITY PRESERVATION: Preserve the face from the input image exactly.

TASK:
1. Analyze the person's face from all provided angles
2. Remove their current outfit
3. Apply the garment from the last image
4. Use PLAIN GREY studio background(neutral)
5. Even, flat lighting

FOCUS ON PERFECT IDENTITY:
• Every facial feature exactly matched
• Skin tone precisely preserved
• Body proportions identical
• Natural fabric fit on their body shape

${REALISM_REQUIREMENTS}

This step locks their identity.Face must be PERFECT.`
    : `OUTFIT + IDENTITY LOCK

${identityCount > 0
      ? `First ${identityCount + 1} images = SAME PERSON. Last = CLOTHING.`
      : `Image 1 = PERSON. Image 2 = CLOTHING.`
    }

Put new outfit on person.
Grey studio background.
Flat lighting.

  CRITICAL: Face must match references EXACTLY.
Same eyes, nose, lips, skin tone, shape.
Real skin with visible pores.`

  const step1Contents: ContentListUnion = []
  step1Contents.push({ inlineData: { data: subjectBase64, mimeType: 'image/jpeg' } } as any)

  for (const img of identityImages) {
    if (img && img.length > 100) {
      step1Contents.push({ inlineData: { data: img, mimeType: 'image/jpeg' } } as any)
    }
  }

  step1Contents.push({ inlineData: { data: garmentBase64, mimeType: 'image/jpeg' } } as any)
  step1Contents.push(step1Prompt)

  const step1Config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig: { aspectRatio } as any,
    temperature: 0.01, // Ultra-low for identity precision
  }

  const step1Start = Date.now()
  const step1Resp = await client.models.generateContent({
    model,
    contents: step1Contents,
    config: step1Config
  })
  console.log(`   ✓ Step 1 done in ${((Date.now() - step1Start) / 1000).toFixed(1)} s`)

  // Extract step 1 image
  let step1Image: string | null = null
  if (step1Resp.candidates?.length) {
    for (const part of step1Resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        step1Image = part.inlineData.data
        break
      }
    }
  }

  if (!step1Image) {
    throw new Error('Step 1 failed - no image generated')
  }

  console.log('   Step 2: Scene Application')

  // ========== STEP 2: Apply scene (identity locked) ==========
  const step2Prompt = isPro
    ? `SCENE PLACEMENT - IDENTITY LOCKED

Take this person EXACTLY as they appear and place them in a new environment.

⚠️ THEIR FACE IS LOCKED.DO NOT MODIFY ANY FACIAL FEATURES.

NEW ENVIRONMENT:
📍 ${scene.description}

LIGHTING:
💡 ${scene.lighting}

ENVIRONMENTAL DETAILS:
🔍 ${scene.details}

VISUAL STYLE:
${style}

WHAT TO CHANGE:
• Background → new scene
• Lighting on skin / clothes → match new environment
• Add environmental context

WHAT TO KEEP IDENTICAL:
• Face - every feature locked
• Body shape and proportions
• Clothing(already correct)
• Pose and expression

${REALISM_REQUIREMENTS}

The person should look naturally photographed in this location.
Environmental lighting can affect their appearance, but facial FEATURES stay identical.`
    : `SCENE CHANGE - IDENTITY LOCKED

Place this person in: ${scene.description}
Add: ${scene.details}
Lighting: ${scene.lighting}

⚠️ DO NOT CHANGE:
• Face(locked - same features)
• Body shape
• Clothing

Only change the background and apply scene lighting.
Make it look like they were photographed there.`

  const step2Contents: ContentListUnion = [
    { inlineData: { data: step1Image, mimeType: 'image/jpeg' } } as any,
    step2Prompt,
  ]

  const imageConfig: ImageConfig = { aspectRatio } as any
  if (model.includes('pro') && resolution) {
    (imageConfig as any).imageSize = resolution
  }

  const step2Config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
    imageConfig,
    temperature: 0, // Maximum determinism for face preservation
  }

  const step2Start = Date.now()
  const step2Resp = await client.models.generateContent({
    model,
    contents: step2Contents,
    config: step2Config
  })
  console.log(`   ✓ Step 2 done in ${((Date.now() - step2Start) / 1000).toFixed(1)} s`)

  // Extract step 2 image
  if (step2Resp.candidates?.length) {
    for (const part of step2Resp.candidates[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
        return part.inlineData.data
      }
    }
  }

  // Fallback to step 1 if step 2 fails
  console.log('   ⚠️ Step 2 failed, returning Step 1 result')
  return step1Image
}

// ====================================================================================
// MAIN ENTRY POINT
// ====================================================================================

export async function renderTryOnFast(params: SimpleRenderOptions): Promise<string> {
  const {
    subjectImageBase64,
    garmentImageBase64,
    backgroundInstruction,
    lightingInstruction,
    quality,
    aspectRatio: userAspect,
    resolution,
    stylePresetId,
    userRequest,
    garmentEnforcementBlock,
  } = params

  const client = getClient()
  const isPro = quality === 'high'
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'
  const aspectRatio = normalizeAspectRatio(userAspect || '3:4')

  // Clean and validate images
  const cleanSubject = stripDataUrl(subjectImageBase64)
  const cleanGarment = stripDataUrl(garmentImageBase64)

  if (!cleanSubject || cleanSubject.length < 100) throw new Error('Invalid subject image')
  if (!cleanGarment || cleanGarment.length < 100) throw new Error('Invalid garment image')

  // Determine scene and mode
  const scene = stylePresetId && SCENE_PRESETS[stylePresetId] ? SCENE_PRESETS[stylePresetId] : null

  const bgLower = backgroundInstruction.toLowerCase()
  const keepBackground = !stylePresetId ||
    stylePresetId === 'keep_original' ||
    bgLower.includes('keep') ||
    bgLower.includes('original') ||
    bgLower.includes('same') ||
    bgLower.includes('unchanged')

  // Determine style
  let styleKey = 'iphone_candid'
  if (stylePresetId?.includes('studio')) styleKey = 'studio_clean'
  else if (stylePresetId?.includes('editorial')) styleKey = 'editorial'
  else if (stylePresetId?.includes('golden')) styleKey = 'golden_hour'
  else if (stylePresetId?.includes('street') || stylePresetId?.includes('cafe')) styleKey = 'lifestyle'
  else if (stylePresetId?.includes('beach') || stylePresetId?.includes('outdoor')) styleKey = 'documentary'

  // Temperature settings
  const temperature = 0

  console.log(`\n🚀 TRY-ON RENDER (PHASE 3 ARCHITECTURE)`)
  console.log(`   Model: ${model}`)
  console.log(`   Preset: ${stylePresetId || 'none'}`)
  console.log(`   Mode: ${keepBackground ? 'CLOTHING-ONLY' : 'SCENE-CHANGE'}`)
  console.log(`   Style: ${styleKey}`)
  console.log(`   Resolution: ${resolution || '1K'}`)
  console.log(`   🔒 Identity: Pixel-level from Image 1 only`)
  console.log(`   👗 Garment: Visual reference from Image 2 (no face/identity)`)
  console.log(`   📸 Images to Gemini: 2 (person + garment)`)

  const startTime = Date.now()
  let resultBase64: string

  try {
    // ============================================================
    // GARMENT ANALYSIS - DISABLED FOR FLASH (VISUAL ONLY)
    // ============================================================
    // FLASH pipeline: garmentText MUST be empty to keep prompt LOCKED
    // Image 2 is used VISUALLY only - no text injection
    let garmentDescription = ''

    if (!isPro) {
      // FLASH: Skip GPT analysis, use Image 2 as visual reference only
      console.log('\n👔 FLASH Pipeline: Using Image 2 visually only (no text analysis)')
      console.log('   📸 Garment image will be sent as Image 2 (visual reference)')
    } else {
      // PRO: ALSO use Image 2 visually - NO text description
      // Let Gemini analyze the garment image directly for better accuracy
      console.log('\n👔 PRO Pipeline: Using Image 2 visually (Gemini will analyze directly)')
      console.log('   📸 Garment image will be sent as Image 2 (visual reference)')
      console.log('   ℹ️ No text description injected - Gemini analyzes the image itself')
      // garmentDescription stays empty - Gemini sees Image 2 and determines:
      // - garment type (shirt/kurta/dress)
      // - length (short/long)
      // - pattern and color
      // This avoids text description errors
    }

    // ============================================================
    // STYLE PRESET LOOKUP (PHASE 2)
    // Supports both UI presets (presets.ts) AND style presets (style-presets.ts)
    // ============================================================
    let selectedStylePreset: StylePreset | null = null
    let uiPreset = stylePresetId ? getTryOnPresetV3(stylePresetId) : null

    if (stylePresetId) {
      // First, try to find as a style preset directly
      selectedStylePreset = getStylePreset(stylePresetId)

      // If not found, try to find as a UI preset and map to style preset
      if (!selectedStylePreset && uiPreset) {
        // UI presets have a style_pack field that maps to style presets
        const stylePackId = uiPreset.style_pack?.replace(/_/g, '_') || 'casual_lifestyle'
        // Try common mappings
        const stylePackMappings: Record<string, string> = {
          'candid_iphone': 'casual_lifestyle',
          'candid_home': 'casual_lifestyle',
          'candid_instagram': 'influencer_social',
          'documentary_street': 'editorial_street',
          'editorial_vogue': 'high_fashion_runway',
          'editorial_professional': 'studio_catalog',
          'travel_golden': 'influencer_social',
          'travel_vacation': 'casual_lifestyle',
          'travel_journal': 'casual_lifestyle',
          'vogue_editorial': 'high_fashion_runway',
          'linkedin_professional': 'studio_catalog',
          'preserve_original': 'casual_lifestyle',
        }
        const mappedPresetId = stylePackMappings[stylePackId] || 'casual_lifestyle'
        selectedStylePreset = getStylePreset(mappedPresetId)
        console.log(`   📦 UI Preset "${stylePresetId}" → Style Pack "${mappedPresetId}"`)
      }
    }

    // Default to casual_lifestyle if no preset found
    if (!selectedStylePreset) {
      selectedStylePreset = getStylePreset('casual_lifestyle')
    }

    // TypeScript guard: selectedStylePreset should never be null after this point
    if (!selectedStylePreset) {
      throw new Error('Failed to load style preset: casual_lifestyle not found')
    }

    console.log(`   🎨 Style Preset: ${selectedStylePreset.name} (${selectedStylePreset.id})`)

    // ============================================================
    // DUAL-ENGINE PIPELINE (PHASE 4) - FLASH vs PRO SEPARATION
    // ============================================================
    // FLASH: Identity-critical, locked prompt, no beautification
    // PRO_IDENTITY_LOCKED: High-realism identity-critical (for try-on)
    // PRO: Aesthetic/UGC only (NOT for try-on)

    const pipelineMode: PipelineMode = 'tryon'
    // For try-on: use pro_identity_locked for high quality, flash for fast
    const modelType: ModelType = isPro ? 'pro_identity_locked' : 'flash'

    // Enforce routing rules
    enforceModelRouting(pipelineMode, modelType)

    // Build pipeline-specific prompt
    const pipelineResult = buildDualEnginePipeline({
      mode: pipelineMode,
      model: modelType,
      presetId: stylePresetId
    })

    // Validate pipeline inputs
    const validation = validatePipelineInputs(
      2, // imageCount
      true, // hasPersonImage
      true, // hasGarmentImage
      pipelineResult.prompt
    )

    if (!validation.valid) {
      console.error('❌ PIPELINE VALIDATION FAILED:', validation.errors)
      throw new Error(`Pipeline validation failed: ${validation.errors.join(', ')}`)
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Pipeline warnings:', validation.warnings)
    }

    // ============================================================
    // CRITICAL: Include backgroundInstruction (contains ultra-fidelity prompts)
    // The backgroundInstruction comes from pipeline.ts with scene analysis
    // and ultra-fidelity constraints. It MUST be included in final prompt.
    // ============================================================
    const pipelinePrompt = pipelineResult.prompt
    const pipelineTemperature = pipelineResult.temperature

    // Build comprehensive prompt that includes preset and all constraints
    // Start with ULTRA LOCK (maximum strength for both face and garment)
    const faceUltraLock = getFaceUltraLock()
    const garmentUltraLock = getGarmentUltraLock()
    const emergencyFaceFreeze = getFaceFreezeEmergency()

    let comprehensivePrompt = `${faceUltraLock}\n\n${garmentUltraLock}\n\n${emergencyFaceFreeze}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK OVERVIEW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Image 1 = Person (face, body, pose) → COPY FACE AND BODY EXACTLY
Image 2 = Garment only (ignore body in Image 2) → EXTRACT AND APPLY GARMENT

BODY RULES:
• Use body proportions from Image 1 only
• Copy body shape from Image 1 exactly
• Do NOT slim or modify body

GARMENT RULES:
• Extract garment from Image 2
• Apply garment to body from Image 1
• Copy exact type, length, color, pattern
${garmentEnforcementBlock || ''}

OUTPUT: Same person (Image 1 face + Image 1 body) wearing the garment (Image 2).
`.trim()

    // Add preset scene description if available (CRITICAL for preset application)
    if (backgroundInstruction && !backgroundInstruction.toLowerCase().includes('keep') && !backgroundInstruction.toLowerCase().includes('original')) {
      comprehensivePrompt += `\n\n════════════════════════════════════════════════════════════════════════════════\nSCENE & BACKGROUND (PRESET):\n════════════════════════════════════════════════════════════════════════════════\n${backgroundInstruction}\n`
      console.log(`   ✅ Preset background included: "${backgroundInstruction.slice(0, 80)}..."`)
    }

    // Add lighting instruction if available (CRITICAL for preset application)
    if (lightingInstruction && lightingInstruction !== 'natural lighting') {
      comprehensivePrompt += `\n\nLIGHTING (PRESET):\n${lightingInstruction}\n`
      console.log(`   ✅ Preset lighting included: "${lightingInstruction}"`)
    }

    // Add userRequest (contains all constraint prompts, preset scene descriptions, etc.)
    // This is CRITICAL - it contains all the comprehensive constraints we built
    // BUT: Truncate if too long to prevent token overflow (32K limit)
    if (userRequest) {
      // Estimate tokens: ~4 chars per token, so 32K tokens ≈ 128K chars
      // Reserve space for base prompt, images, and other content (~50K chars)
      // So we can use ~78K chars for userRequest, but be conservative: 50K chars max
      const maxUserRequestLength = 50000
      const truncatedUserRequest = userRequest.length > maxUserRequestLength
        ? userRequest.substring(0, maxUserRequestLength) + '\n\n[TRUNCATED - Token limit protection]'
        : userRequest

      comprehensivePrompt += `\n\n${truncatedUserRequest}\n`
      console.log(`   ✅ User request/constraints included: ${truncatedUserRequest.length} chars${userRequest.length > maxUserRequestLength ? ' (truncated)' : ''}`)
    }

    // REPEAT ULTRA LOCKS AT THE END (reinforcement - zero tolerance for drift)
    comprehensivePrompt += `\n\n${faceUltraLock}\n\n${garmentUltraLock}\n\n${emergencyFaceFreeze}\n`
    console.log(`   🔒🔒🔒 Face & Garment Ultra Lock: INJECTED AT START AND END (zero tolerance for drift)`)

    // Remove forbidden terms that could cause beautification or face drift
    // These terms can trigger AI to beautify or modify the face/body
    const forbiddenTerms = [
      'editorial', 'fashion pose', 'portrait', 'studio',
      'perfect', 'enhance', 'improve', 'beautify',
      'sharp', 'clean', 'elegant', 'artistic', 'creative', 'aesthetic',
      'model', 'mannequin', 'fashion model',
      'perfect symmetry', 'facial symmetry',
      'polished', 'refined', 'stylized', 'glamorous'
    ]
    let cleanedPrompt = comprehensivePrompt
    for (const term of forbiddenTerms) {
      // Use word boundaries to avoid removing parts of words
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      cleanedPrompt = cleanedPrompt.replace(regex, '')
    }
    // Clean up multiple spaces/newlines created by removals
    cleanedPrompt = cleanedPrompt.replace(/\n{3,}/g, '\n\n').replace(/ {2,}/g, ' ')
    comprehensivePrompt = cleanedPrompt
    console.log(`   🧹 Cleaned forbidden terms from prompt (prevent beautification/face drift)`)

    const finalPrompt = comprehensivePrompt


    // ============================================================
    // LOG TWO-PASS PIPELINE AND PRESET ENFORCEMENT STATUS
    // ============================================================
    console.log(`\n🔧 DUAL-ENGINE PIPELINE RESULT:`)
    console.log(`   Pipeline: ${pipelineResult.pipeline?.toUpperCase() || 'SINGLE_PASS'}`)
    console.log(`   Model: ${pipelineResult.model}`)
    console.log(`   Temperature: ${pipelineTemperature}`)
    console.log(`   Assertions: ${pipelineResult.assertions.join(', ')}`)
    console.log(`   backgroundInstruction included: YES (${backgroundInstruction.length} chars)`)

    // Check if two-pass PRO was used
    if ('passes' in pipelineResult && pipelineResult.passes) {
      console.log(`   \n   ═══ TWO-PASS PRO ARCHITECTURE ACTIVE ═══`)
      console.log(`   🎬 Pass 1: Scene Construction`)
      console.log(`   🎬 Pass 2: Fabric & Light Refinement`)
      console.log(`   🔒 Face Freeze: LAYER_0 (same as FLASH)`)
    }

    // Log preset enforcement if applicable
    if (stylePresetId) {
      const fullPreset = getFullPreset(stylePresetId)
      if (fullPreset) {
        logPresetEnforcement(fullPreset, stylePresetId)
      } else {
        console.warn(`   \n   ⚠️ PRESET NOT FOUND: "${stylePresetId}"`)
        console.warn(`      Structural enforcement may not be applied.`)
      }
    }

    const estimatedTokens = finalPrompt.length / 4 // Rough estimate: 4 chars per token
    console.log(`   Prompt length: ${finalPrompt.length} chars (estimated ${Math.round(estimatedTokens)} tokens)`)
    if (estimatedTokens > 30000) {
      console.warn(`   ⚠️ WARNING: Estimated tokens (${Math.round(estimatedTokens)}) approaching 32K limit!`)
    }
    console.log(`\n   📝 FINAL ASSEMBLED PROMPT (preview - first 500 chars):`)
    console.log(`   ${'─'.repeat(70)}`)
    console.log(`   ${finalPrompt.substring(0, 500)}...`)
    console.log(`   ${'─'.repeat(70)}`)

    // ============================================================
    // HYPER-REALISM: Extract face crop for Image 3 (PRO only)
    // ============================================================
    let faceCropBase64: string | undefined = undefined

    if (isPro) {
      try {
        const imageHash = generateIdentityHash(cleanSubject)
        const faceCropResult = await extractFaceCropForImage3(cleanSubject, imageHash)
        faceCropBase64 = faceCropResult.faceCropBase64
        logHyperRealismStatus(true)
      } catch (error) {
        console.warn('⚠️ HYPER-REALISM: Face crop extraction failed, proceeding with 2-image mode')
        console.warn('   Error:', error)
        logHyperRealismStatus(false)
      }
    }

    // Add hyper-realism blocks to prompt for PRO mode with face crop
    let hyperRealismPrompt = finalPrompt
    if (faceCropBase64) {
      hyperRealismPrompt = `${finalPrompt}\n\n${HYPER_REALISM_FACE_BLOCK}\n\n${HYPER_REALISM_PHYSICS_BLOCK}`
    }

    // ============================================================
    // SINGLE-STEP RENDER - DUAL-ENGINE CONTRACT
    // ============================================================
    console.log(`\n🎬 Rendering with Gemini (Image 1: person, Image 2: garment${faceCropBase64 ? ', Image 3: face crop' : ''})...`)
    resultBase64 = await renderSingleStep(
      client,
      model,
      cleanSubject, // Image 1: Person (identity source)
      cleanGarment, // Image 2: Garment (visual reference)
      hyperRealismPrompt, // Dual-engine composed prompt + hyper-realism blocks
      aspectRatio,
      pipelineTemperature, // Use pipeline-specific temperature
      resolution,
      faceCropBase64 // Image 3: Face crop (optional, for hyper-realism)
    )

    // NOTE: Face identity preservation is done through prompt constraints
    // (forensic compositor mode) rather than post-processing reintegration
    console.log('\n🔒 IDENTITY PRESERVATION: Via forensic compositor prompt constraints')

    const elapsed = Date.now() - startTime
    console.log(`\n✅ RENDER COMPLETE in ${(elapsed / 1000).toFixed(1)}s`)
    console.log('   🔒 FACE IDENTITY: Forensic compositor mode active')
    console.log('')

    return `data:image/jpeg;base64,${resultBase64}`
  } catch (error) {
    console.error('❌ RENDER FAILED:', error)
    throw error
  }
}

// Compatibility wrapper (updated for new architecture)
export async function renderTryOnV3(params: {
  subjectImageBase64: string
  garmentImageBase64: string
  garmentBackupImageBase64?: string
  stylePack?: any
  backgroundFocus?: any
  shootPlan: { scene_text: string; prompt_text?: string }
  opts: { quality: 'fast' | 'high'; aspectRatio?: string; resolution?: string }
  extraStrict?: boolean
  garmentAnalysis?: any
  stylePresetId?: string
}): Promise<string> {
  return renderTryOnFast({
    subjectImageBase64: params.subjectImageBase64,
    garmentImageBase64: params.garmentImageBase64, // Used for analysis only
    backgroundInstruction: params.shootPlan.scene_text || 'keep original background',
    lightingInstruction: 'natural lighting',
    quality: params.opts.quality,
    aspectRatio: params.opts.aspectRatio,
    resolution: params.opts.resolution,
    stylePresetId: params.stylePresetId,
  })
}
