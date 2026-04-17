import OpenAI from 'openai'
import { string } from 'zod'
import { getOpenAIKey } from '@/lib/config/api-keys'

// Create OpenAI client factory function
// Creates a fresh client each time to ensure latest env vars are used
const createOpenAIClient = (): OpenAI => {
  try {
    const apiKey = getOpenAIKey()
    return new OpenAI({
      apiKey,
      // Use default configuration - let OpenAI SDK handle all validation
    })
  } catch (error) {
    console.error('Failed to create OpenAI client:', error)
    throw error
  }
}

// Export a function that creates a new client each time to ensure fresh env vars
// This is important because Next.js may cache the module and env vars might change
export function getOpenAI(): OpenAI {
  return createOpenAIClient()
}

// For backward compatibility, create a lazy-loaded instance
let openaiInstance: OpenAI | null = null

const getOpenAIInstance = (): OpenAI => {
  if (!openaiInstance) {
    openaiInstance = createOpenAIClient()
  }
  return openaiInstance
}

// Export openai for backward compatibility
export const openai = {
  get chat() {
    return getOpenAIInstance().chat
  },
  get images() {
    return getOpenAIInstance().images
  },
} as OpenAI

// ============================================================================
// GPT-4o Mini Vision: Intelligent Image Analysis & Strict Prompt Writing
// Based on Nano Banana / Gemini Image Generation Best Practices
// Reference: https://ai.google.dev/gemini-api/docs/image-generation#prompt-guide
// ============================================================================

export type TryOnEditType =
  | 'clothing_change'
  | 'background_change'
  | 'lighting_change'
  | 'pose_change'
  | 'camera_change'

export interface PromptWriterInput {
  personImage: string // base64 with or without data URI prefix
  clothingImage?: string // base64 - garment reference (may contain a person - IGNORE their face)
  backgroundImage?: string // base64 - background reference
  editType: TryOnEditType
  userRequest?: string
  model?: 'flash' | 'pro'
}

export interface PromptWriterResult {
  prompt: string
  personDescription: string
  referenceDescription: string
}

/**
 * Use GPT-4o mini with vision to analyze images and write a STRICT, DETAILED prompt for Gemini.
 * 
 * Key Nano Banana principles applied:
 * 1. "Describe the scene, don't just list keywords" - narrative prompts
 * 2. "High-Fidelity detail preservation" - describe face features in extreme detail
 * 3. "Advanced composition" - clear role labels for each image
 * 4. Template: "Using the provided images, place [garment] onto [person]. 
 *    Ensure that the features of [person] remain completely unchanged."
 */
export async function writePromptFromImages(
  input: PromptWriterInput
): Promise<PromptWriterResult> {
  const { personImage, clothingImage, backgroundImage, editType, userRequest, model = 'flash' } = input

  const openaiClient = getOpenAI()

  // Clean base64 strings and ensure proper format
  const formatImageUrl = (base64: string) => {
    if (base64.startsWith('data:image/')) {
      return base64
    }
    return `data:image/jpeg;base64,${base64}`
  }

  // Build messages with images
  const imageInputs: OpenAI.Chat.Completions.ChatCompletionContentPart[] = []

  // Add person image FIRST (this is the identity source)
  imageInputs.push({
    type: 'image_url',
    image_url: {
      url: formatImageUrl(personImage),
      detail: 'high',
    },
  })

  // Add reference image based on edit type
  const referenceImage = editType === 'background_change' ? backgroundImage : clothingImage
  if (referenceImage) {
    imageInputs.push({
      type: 'image_url',
      image_url: {
        url: formatImageUrl(referenceImage),
        detail: 'high',
      },
    })
  }

  // =========================================================================
  // SYSTEM PROMPT: Photo-Quality Edit Prompts for Gemini/Nano Banana
  // Based on: 30 Gemini Prompts for Photo-Quality Edits + Google's Prompt Guide
  // Formula: Action + Subject + Constraints + Preservation + Quality Checks
  // =========================================================================
  const systemPrompt = `You are an expert prompt engineer for Gemini/Nano Banana photo-realistic image editing. Your goal is to write prompts that produce photo-quality edits while preserving identity.

## PROMPT FORMULA (Photo-Quality Editing)
Action + Subject + Modification + Preservation Rules + Quality Parameters

## CRITICAL PRINCIPLES

1. **Preserve Identity**: Always explicitly state what must remain unchanged
2. **Avoid Over-Processing**: Include anti-processing constraints (no plastic skin, no haloing)
3. **Realistic Lighting**: Specify how lighting should match the edit
4. **Layered Commands**: Combine multiple clear instructions
5. **Negative Prompts**: Specify what NOT to do

## YOUR ANALYSIS TASKS

### TASK 1: Analyze PERSON IMAGE (Image 1) - EXTREME DETAIL
Describe every identifiable feature for preservation:
- Face shape, jawline, cheekbones (specific shapes)
- Eye details: shape, color, spacing, eyelid type
- Nose details: bridge, tip, nostril shape
- Lip shape, fullness
- Skin: exact tone (e.g., "warm olive", "cool beige"), texture, pores, any marks/moles
- Hair: color, texture, length, style
- Current expression and pose
- Current clothing (what to replace)

### TASK 2: Analyze GARMENT/REFERENCE IMAGE (Image 2) - EXACT CLOTHING REPLICATION
⚠️ CRITICAL: If there is a person/face in this image, COMPLETELY IGNORE IT. Extract ONLY the garment.
⚠️ CRITICAL: The output must have the EXACT SAME GARMENT - same color, same pattern, same everything.

Describe the garment with EXTREME precision for exact replication:
- **Type**: Exact garment type (sleeveless kurti, A-line dress, fitted blouse, etc.)
- **Color**: EXACT shade (e.g., "deep maroon/burgundy wine color", not just "red")
- **Pattern**: EXACT pattern description (e.g., "small white cross-stitch/geometric embroidered motifs scattered across the fabric")
- **Pattern placement**: Where patterns appear (all over, on yoke, at hem, etc.)
- **Pattern spacing**: Dense, scattered, clustered, etc.
- **Fabric**: Material, texture, weight (lightweight cotton, smooth silk, etc.)
- **Neckline**: Exact style (round, V-neck, boat neck, with/without placket, buttons)
- **Sleeves**: Sleeveless, cap sleeve, full sleeve, etc.
- **Fit**: A-line, fitted, loose, etc.
- **Special details**: Front placket, buttons, piping, pleats, slit, etc.
- **Silhouette**: Overall shape when worn

THE GOAL: Someone reading your description should be able to visualize the EXACT garment.

### TASK 3: Write the PROMPT

Use the NANO BANANA face consistency method:
- Say "this person" to refer to the person from the uploaded image
- This is the official way to maintain face consistency in Nano Banana

Structure:
1. **Start**: "Change the clothing on this person to..."
2. **Garment**: [EXACT detailed garment description]
3. **Face rule**: "Keep this person's exact face unchanged."

## OUTPUT FORMAT (JSON)
{
  "personDescription": "Brief description of person for logging",
  "referenceDescription": "EXACT detailed description of GARMENT ONLY",
  "prompt": "The simple, direct prompt using 'this person'"
}

## PROMPT EXAMPLES (IMAGE EDIT Style)

**Clothing Change (BEST):**
"Replace the clothing with a deep maroon sleeveless tunic featuring a round neckline, front placket with two buttons, and scattered small white geometric embroidered motifs. Lightweight cotton fabric with soft texture. Do not change the person's face, hair, or skin."

**Simple Clothing Change:**
"Replace the outfit with the maroon tunic from the reference image. Keep the same person, same face, same pose."

**With Scene:**
"Replace the clothing with the maroon embroidered tunic. Add a forest background with dappled sunlight. Maintain the original person's face and features exactly."

## RULES (CRITICAL FOR FACE CONSISTENCY)
1. Frame as "Replace the clothing" not "Change the person"
2. Be EXTREMELY SPECIFIC about garment details (color, pattern, neckline, fabric)
3. End with "Do not change the person's face" or "Keep the same person"
4. Keep prompts SHORT - under 100 words works best
5. Do NOT describe facial features - just say "same face" or "same person"
6. Emphasize this is an EDIT of the existing image, not a new generation
7. Include "from the reference image" to make it clear which is the garment source`

  // =========================================================================
  // USER PROMPT: Photo-quality edit task instruction
  // =========================================================================
  const userPrompt = `Analyze these images and write a PHOTO-QUALITY edit prompt for ${editType.replace('_', ' ')}.

**IMAGE 1: PERSON (Identity Source)**
This person's face and body MUST remain 100% identical in the output.
Analyze their facial features in extreme detail for preservation.

**IMAGE 2: ${editType === 'background_change' ? 'BACKGROUND REFERENCE' : 'GARMENT REFERENCE'}**
${editType === 'background_change'
      ? 'Extract only the environment/scene details. Do not change the subject identity.'
      : 'Extract ONLY the clothing details (color, pattern, fabric, style). If there is a person wearing the garment, COMPLETELY IGNORE their face - we only want the garment.'}

${userRequest ? `**USER REQUEST:** ${userRequest}` : ''}

**MODEL:** ${model === 'pro' ? 'Gemini 3 Pro (can handle detailed prompts)' : 'Gemini 2.5 Flash (keep prompt focused but complete)'}

Write the prompt following the photo-quality template:
1. Action + Subject + Modification
2. Preservation clause (exact face features)
3. Anti-processing constraints (no plastic skin, preserve pores)
4. Quality parameters (photo-realistic, natural lighting)`

  try {
    console.log('🤖 GPT-4o mini: Analyzing images with strict identity extraction...')

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            ...imageInputs,
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000, // Increased for more detailed output
      temperature: 0.2,  // Lower temperature for more consistent, precise output
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from GPT-4o mini')
    }

    const parsed = JSON.parse(content) as PromptWriterResult

    console.log('✅ GPT-4o mini: Strict prompt written successfully')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📸 PERSON ANALYSIS:')
    console.log(`   ${parsed.personDescription.slice(0, 200)}...`)
    console.log('👕 GARMENT ANALYSIS (face ignored):')
    console.log(`   ${parsed.referenceDescription.slice(0, 200)}...`)
    console.log('📝 PROMPT STATS:')
    console.log(`   Length: ${parsed.prompt.length} characters`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return parsed
  } catch (error) {
    console.error('❌ GPT-4o mini prompt writing failed:', error)
    console.warn('⚠️ Falling back to template-based prompt (less precise)')

    // Fallback: return a basic prompt using the edit templates
    const { buildEditPrompt } = await import('./prompts/edit-templates')
    const fallbackPrompt = buildEditPrompt({
      editType,
      userRequest,
      model,
    })

    return {
      prompt: fallbackPrompt,
      personDescription: 'Analysis failed - using template fallback',
      referenceDescription: 'Analysis failed - using template fallback',
    }
  }
}

export interface FaceFeatures {
  faceShape: string
  eyeColor: string
  eyeShape: string
  eyebrowShape: string
  nose: string
  mouth: string
  skinTone: string
  skinTexture: string
  hairColor: string
  hairTexture: string
  hairStyle: string
  hairLength: string
  facialFeatures: string[]
  boneStructure: string
  expression: string
  ageRange: string
  ethnicity: string
  distinctiveFeatures: string[]
}

export interface ClothingAnalysis {
  garmentType: string
  fabric: string
  pattern: string
  color: string
  fitType: string
  neckline: string
  sleeveLength: string
  designElements: string[]
}

export interface AdRating {
  score: number
  breakdown: {
    composition: number
    productIntegration: number
    visualQuality: number
    brandConsistency: number
    modelQuality: number
    background: number
    overallAppeal: number
  }
  reasons: string
  improvements: string[]
}

// Helper to safely format image URL
const formatImageUrl = (base64: string) => {
  if (base64.startsWith('data:image/')) {
    return base64
  }
  return `data:image/jpeg;base64,${base64}`
}

export async function analyzeFaceFeatures(imageBase64: string): Promise<FaceFeatures> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this face image with extreme precision for virtual try-on identity preservation.

Return a detailed JSON object with these fields:

1. faceShape: Specific shape (oval, round, square, heart, diamond, oblong, triangular)
2. eyeColor: Exact color with nuance (e.g., "hazel with green undertones", "dark brown", "blue-gray")
3. eyeShape: Precise shape (almond, round, hooded, monolid, upturned, downturned)
4. eyebrowShape: Exact shape (arched, straight, s-shaped, rounded, angled) and thickness (thin, medium, thick, bushy)
5. nose: Detailed description (bridge width, tip shape, nostril width)
6. mouth: Full description (lip fullness, shape, cupid's bow prominence)
7. skinTone: Specific tone using descriptive terms (fair, light, medium, tan, olive, brown, deep, etc.) - avoid generic terms
8. skinTexture: Texture details (smooth, textured, pores visible, matte, dewy, etc.)
9. hairColor: Exact color including highlights/undertones (e.g., "dark brown with caramel highlights")
10. hairTexture: Precise texture (straight, wavy, curly, coily, kinky) with density (fine, medium, thick)
11. hairStyle: Current style (loose, ponytail, bun, braided, short crop, etc.)
12. hairLength: Exact length (very short, short, ear-length, chin-length, shoulder-length, mid-back, long)
13. facialFeatures: Array of notable features (high cheekbones, dimples, widow's peak, etc.)
14. boneStructure: Structure description (prominent, delicate, angular, soft, well-defined)
15. expression: Current expression (neutral, smiling, serious, relaxed, etc.)
16. ageRange: Specific age range (late teens, early 20s, mid 20s, late 20s, early 30s, etc.)
17. ethnicity: Apparent ethnicity if identifiable (Caucasian, Asian, African, Latin, Middle Eastern, Mixed, etc.)
18. distinctiveFeatures: Array of unique identifying features (moles, freckles, facial hair, piercings, glasses, scars, birthmarks, makeup style, etc.)

Be hyper-specific and detailed. These features will be used to preserve identity in virtual try-on generation.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: formatImageUrl(imageBase64),
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    })

    if (process.env.NODE_ENV !== 'production') {
      console.log('=== FACE ANALYSIS API RESPONSE ===', response.id, response.model)
    }

    const content = response.choices[0]?.message?.content
    if (!content || content.trim() === '') {
      console.error('Face analysis: No content returned from OpenAI')
      console.error('Full response structure:', JSON.stringify(response, null, 2))
      throw new Error('No response from face analysis')
    }

    // Check for OpenAI refusal messages
    const contentLower = content.toLowerCase()
    if (
      contentLower.includes('unable to analyze') ||
      contentLower.includes('cannot analyze') ||
      contentLower.includes('i cannot') ||
      contentLower.includes('i\'m unable')
    ) {
      console.warn('Face analysis: OpenAI refused to analyze face')
      throw new Error('OpenAI refused to analyze face features')
    }

    // Parse JSON safely
    let features: FaceFeatures
    try {
      features = JSON.parse(content) as FaceFeatures
    } catch (parseError) {
      console.error('Face analysis: Failed to parse JSON response:', parseError)
      throw new Error('Invalid JSON response from face analysis')
    }

    // Validate and ensure all properties are initialized
    if (!features.facialFeatures) {
      features.facialFeatures = []
    }
    if (!features.distinctiveFeatures) {
      features.distinctiveFeatures = []
    }

    // Validate that we have reasonable data
    if (!features.skinTone || !features.hairColor || !features.faceShape) {
      console.warn('Face analysis returned incomplete data:', features)
    }

    // Ensure all required fields have defaults
    return {
      faceShape: features.faceShape || 'oval',
      eyeColor: features.eyeColor || 'brown',
      eyeShape: features.eyeShape || 'almond',
      eyebrowShape: features.eyebrowShape || 'natural arch',
      nose: features.nose || 'medium bridge, rounded tip',
      mouth: features.mouth || 'medium fullness',
      skinTone: features.skinTone || 'medium',
      skinTexture: features.skinTexture || 'smooth',
      hairColor: features.hairColor || 'brown',
      hairTexture: features.hairTexture || 'straight, medium thickness',
      hairStyle: features.hairStyle || 'natural loose',
      hairLength: features.hairLength || 'medium',
      facialFeatures: features.facialFeatures || [],
      boneStructure: features.boneStructure || 'balanced',
      expression: features.expression || 'neutral',
      ageRange: features.ageRange || 'mid 20s',
      ethnicity: features.ethnicity || 'mixed',
      distinctiveFeatures: features.distinctiveFeatures || [],
    }
  } catch (error) {
    console.error('Face analysis error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))

    // Return default structure on error with warning
    console.warn('Using default face features due to analysis error')
    return {
      faceShape: 'oval',
      eyeColor: 'brown',
      eyeShape: 'almond',
      eyebrowShape: 'natural arch',
      nose: 'medium bridge, rounded tip',
      mouth: 'medium fullness',
      skinTone: 'medium',
      skinTexture: 'smooth',
      hairColor: 'brown',
      hairTexture: 'straight, medium thickness',
      hairStyle: 'natural loose',
      hairLength: 'medium',
      facialFeatures: ['natural features'],
      boneStructure: 'balanced',
      expression: 'neutral',
      ageRange: 'mid 20s',
      ethnicity: 'mixed',
      distinctiveFeatures: [],
    }
  }
}

export async function analyzeClothingImage(imageBase64: string): Promise<ClothingAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this clothing image with extreme precision for virtual try-on generation.

Return a detailed JSON object with these fields:

1. garmentType: Specific type (t-shirt, blouse, sweater, jacket, dress, hoodie, tank top, cardigan, etc.)
2. fabric: Exact fabric type and texture:
   - Material: cotton, silk, denim, leather, wool, polyester, linen, velvet, satin, etc.
   - Texture quality: smooth, textured, ribbed, knit, woven, brushed, etc.
   - Sheen/finish: matte, glossy, shiny, satin finish, etc.
   - Weight indication: lightweight, medium weight, heavy, structured, etc.

3. pattern: Hyper-detailed pattern description:
   - If solid: exact color uniformity
   - If striped: orientation (vertical/horizontal), stripe width, spacing, colors
   - If floral: size of flowers, color palette, density
   - If geometric: shape details, size, arrangement
   - If printed: subject matter, colors, placement
   - Include pattern scale (micro, small, medium, large, oversized)

4. color: Single string describing the exact color with nuance (e.g., "navy blue with cool undertones", "forest green with warm highlights")

5. fitType: Precise fit (fitted, tailored, regular, relaxed, loose, oversized, cropped, longline)

6. neckline: Exact neckline type (crew neck, V-neck, scoop neck, boat neck, turtleneck, off-shoulder, collar, hood, etc.)

7. sleeveLength: Precise length (sleeveless, cap sleeve, short sleeve, elbow length, 3/4 sleeve, long sleeve, extra long)

8. designElements: Comprehensive array of all visible details:
   - Hardware: zippers (type, color, placement), buttons (count, style, material), snaps, buckles
   - Trim: lace, embroidery, piping, ribbing, cuffs, collar details
   - Embellishments: sequins, beads, studs, patches, appliqués
   - Logos/branding: placement, style, visibility
   - Pockets: type, count, placement
   - Stitching: topstitching, decorative stitching, seam details
   - Other: drawstrings, ties, belts, pleats, ruffles, any unique features

Be hyper-specific about every visible detail. These attributes will be used to match clothing exactly in virtual try-on.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: formatImageUrl(imageBase64),
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const choice = response.choices?.[0]
    const content = choice?.message?.content
    const refusal = (choice?.message as any)?.refusal

    // Handle GPT refusal gracefully (e.g. content policy)
    if (refusal || !content) {
      console.warn('[ClothingAnalysis] GPT refused or returned empty:', refusal || 'no content')
      // Return a safe default instead of crashing
      return {
        garmentType: 'fashion product',
        fabric: 'standard fabric, medium weight',
        pattern: 'as visible in product image',
        color: 'as visible in product image',
        fitType: 'standard fit',
        neckline: 'standard',
        sleeveLength: 'standard',
        designElements: [],
      } as ClothingAnalysis
    }

    const analysis = JSON.parse(content) as ClothingAnalysis

    // Validate that we have reasonable data
    if (!analysis.color || !analysis.fabric || !analysis.garmentType) {
      console.warn('Clothing analysis returned incomplete data:', analysis)
    }

    return analysis
  } catch (error) {
    console.error('Clothing analysis error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))

    // Return default structure on error with warning
    console.warn('Using default clothing analysis due to error')
    return {
      garmentType: 'top',
      fabric: 'cotton, medium weight, matte finish',
      pattern: 'solid color',
      color: 'neutral tone',
      fitType: 'regular fit',
      neckline: 'round neck',
      sleeveLength: 'short sleeve',
      designElements: [],
    }
  }
}

export async function generateIntelligentTryOnPrompt(
  personImageBase64: string,
  clothingImageBase64: string,
  faceFeatures: FaceFeatures,
  clothingAnalysis: ClothingAnalysis,
  options?: {
    stylePreset?: string
    background?: string
    pose?: string
    expression?: string
    editMode?: 'simple' | 'full'
  }
): Promise<string> {
  try {
    // NOTE: The new pipeline uses strict edit templates (no analysis/orchestration).
    // Keep this function for backward compatibility with callers, but delegate to the new template builder.
    const { getPresetById } = await import('./prompts/try-on-presets')
    const { buildEditPrompt } = await import('./prompts/edit-templates')

    const selectedPreset = options?.stylePreset ? getPresetById(options.stylePreset) : undefined

    const presetBackground = selectedPreset?.background
    const presetLighting = selectedPreset?.lighting
      ? `${selectedPreset.lighting.type}, ${selectedPreset.lighting.direction}, ${selectedPreset.lighting.colorTemp}`
      : undefined
    const presetCamera = selectedPreset?.camera_style
      ? `${selectedPreset.camera_style.angle}, ${selectedPreset.camera_style.lens}, ${selectedPreset.camera_style.framing}`
      : undefined
    const presetPose = selectedPreset?.pose ? `${selectedPreset.pose.stance}. Arms: ${selectedPreset.pose.arms}.` : undefined
    const presetExpression = selectedPreset?.pose?.expression

    return buildEditPrompt({
      editType: 'clothing_change',
      userRequest: undefined,
      background: options?.background ?? presetBackground,
      pose: options?.pose ?? presetPose,
      expression: options?.expression ?? presetExpression,
      camera: presetCamera,
      lighting: presetLighting,
      model: 'flash',
    })
  } catch (error) {
    console.error('❌ Intelligent prompt generation error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))

    // ==============================================================
    // FALLBACK: STRICT IDENTITY LOCK PROMPT (When GPT-4o Mini fails)
    // ==============================================================
    console.warn('⚠️  Using fallback STRICT IDENTITY LOCK prompt')

    // Determine edit mode for fallback
    const fallbackEditMode = options?.editMode || (options?.stylePreset ? 'full' : 'simple')

    const fallbackPrompt = `IDENTITY
Keep the person's exact face structure, proportions, eyes, eyebrows, nose, lips. Preserve the original skin texture and tone (${faceFeatures?.skinTone ?? 'medium'}). Do NOT change hair length (${faceFeatures?.hairLength ?? 'medium'}), color (${faceFeatures?.hairColor ?? 'brown'}), or volume. Do NOT add or remove hair. Do NOT change facial features in any way. Preserve exact expression (${faceFeatures?.expression ?? 'neutral'}).

BODY
Maintain original body shape, posture, and pose. No slimming or reshaping. No new muscles or waist shapes. Preserve shoulder width, arm position, and neck angle exactly as shown in reference.

CLOTHING
Replace the current clothing with the reference ${clothingAnalysis.garmentType}. Match exactly:
- Color: ${clothingAnalysis.color}
- Pattern: ${clothingAnalysis.pattern}
- Fabric: ${clothingAnalysis.fabric}
- Buttons, stitching, folds, and micro-details precisely
- Sleeve length: ${clothingAnalysis.sleeveLength}
- Fit: ${clothingAnalysis.fitType}
Avoid hallucination of new textures or colors.

BACKGROUND
${fallbackEditMode === 'simple'
        ? 'Keep the original background exactly as shown in the person\'s photo. Do not change background, lighting, or environment.'
        : options?.background
          ? `Background: ${options.background}`
          : 'Keep the original background unless preset specifies otherwise.'}

CAMERA SETTINGS
Match angle, lighting direction, shadow direction, and depth-of-field from the original photo. Preserve perspective of the torso.

QUALITY
Realistic skin details with natural texture (not smoothed). Clean edges. No accessories added. No new hair created. No body distortion. Natural film grain (ISO 400-800 equivalent).

🔒 ABSOLUTE IDENTITY LOCK - ZERO TOLERANCE POLICY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL DIRECTIVE: EXACT FACIAL IDENTITY MATCH REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST PRESERVE THE PERSON'S EXACT IDENTITY FROM THE REFERENCE IMAGE.

MANDATORY IDENTITY PRESERVATION (100% ACCURACY REQUIRED):

1. FACIAL STRUCTURE:
   • Face Shape: ${faceFeatures?.faceShape ?? 'oval'} → MUST MATCH EXACTLY
   • Bone Structure: ${faceFeatures?.boneStructure ?? 'balanced'} → PRESERVE PRECISELY
   • Facial Proportions: Maintain exact ratios between features

2. FACIAL FEATURES (EXACT MATCH REQUIRED):
   • Eyes: ${faceFeatures?.eyeColor ?? 'brown'} ${faceFeatures?.eyeShape ?? 'almond'} eyes
     - Eye color: ${faceFeatures?.eyeColor ?? 'brown'} → NO CHANGES ALLOWED
     - Eye shape: ${faceFeatures?.eyeShape ?? 'almond'} → EXACT MATCH REQUIRED
     - Eyebrows: ${faceFeatures?.eyebrowShape ?? 'natural arch'} → PRESERVE SHAPE
   • Nose: ${faceFeatures?.nose ?? 'medium bridge, rounded tip'} → EXACT MATCH REQUIRED
   • Mouth: ${faceFeatures?.mouth ?? 'medium fullness'} → EXACT MATCH REQUIRED
   • Ears: Match reference exactly

3. SKIN AND COMPLEXION (CRITICAL):
   • Skin Tone: ${faceFeatures?.skinTone ?? 'medium'} → MUST PRESERVE EXACTLY, NO LIGHTENING OR DARKENING
   • Skin Texture: ${faceFeatures?.skinTexture ?? 'smooth'}
${(faceFeatures?.facialFeatures?.length ?? 0) > 0 ? `   • Facial Features: ${faceFeatures?.facialFeatures?.join(', ') ?? ''} → MUST INCLUDE ALL` : ''}
${(faceFeatures?.distinctiveFeatures?.length ?? 0) > 0 ? `   • Distinctive Marks: ${faceFeatures?.distinctiveFeatures?.join(', ') ?? ''} → MUST PRESERVE ALL` : ''}

4. HAIR (EXACT MATCH REQUIRED):
   • Color: ${faceFeatures?.hairColor ?? 'brown'} → NO CHANGES ALLOWED
   • Texture: ${faceFeatures?.hairTexture ?? 'straight, medium thickness'}
   • Style: ${faceFeatures?.hairStyle ?? 'natural loose'}
   • Length: ${faceFeatures?.hairLength ?? 'medium'}

5. EXPRESSION AND AGE:
   • Expression: ${faceFeatures?.expression ?? 'neutral'} → PRESERVE EXACTLY
   • Age Range: ${faceFeatures?.ageRange ?? 'mid 20s'} → NO AGE CHANGES
   • Ethnicity: ${faceFeatures?.ethnicity ?? 'mixed'} → PRESERVE EXACTLY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 STRICTLY PROHIBITED - ZERO TOLERANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ DO NOT beautify, enhance, or "improve" facial features
❌ DO NOT change skin tone (no lightening, darkening, or color shifts)
❌ DO NOT modify hair color, texture, style, or length
❌ DO NOT alter facial proportions or bone structure
❌ DO NOT change eye color, shape, or expression
❌ DO NOT smooth wrinkles or remove facial features
❌ DO NOT change the person's age appearance
❌ DO NOT swap or replace the person's identity
❌ DO NOT apply makeup unless present in reference
❌ This is VIRTUAL TRY-ON, NOT A NEW PERSON GENERATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👔 CLOTHING APPLICATION (Person's Face Unchanged):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply this ${clothingAnalysis.garmentType} to the person:

GARMENT DETAILS:
• Type: ${clothingAnalysis.garmentType}
• Fabric: ${clothingAnalysis.fabric}
• Color: ${clothingAnalysis.color}
• Pattern: ${clothingAnalysis.pattern}
• Fit: ${clothingAnalysis.fitType}
• Neckline: ${clothingAnalysis.neckline}
• Sleeves: ${clothingAnalysis.sleeveLength}
${clothingAnalysis.designElements.length > 0 ? `• Design Elements: ${clothingAnalysis.designElements.join(', ')}` : ''}

FABRIC BEHAVIOR:
• Natural drape with realistic folds at shoulders, elbows, and waist
• Authentic weight and texture for ${clothingAnalysis.fabric}
• Proper fit following ${clothingAnalysis.fitType} style

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 SCENE COMPOSITION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENVIRONMENT:
• Setting: ${options?.background || 'Modern, professional studio with clean background'}
• Pose: ${options?.pose || 'Natural, relaxed, confident stance'}
• Expression: ${options?.expression || (faceFeatures?.expression ?? 'neutral')}

LIGHTING (Professional Photography):
• Setup: Soft, diffused key light from 45° angle
• Color Temperature: 5500K (neutral daylight)
• Shadows: Subtle shadows under chin and gentle highlights on cheekbones
• Fabric Lighting: Realistic light interaction with soft shadows in clothing folds

CAMERA (Professional Quality):
• Lens: 85mm portrait lens at f/2.8 aperture
• Framing: 3/4 body shot, eye-level angle
• Focus: Sharp focus on face and clothing
• Depth of Field: Natural bokeh background
• Quality: Professional photography standard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FINAL VERIFICATION CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before outputting the image, verify:
✓ Face matches reference EXACTLY (skin tone, features, structure)
✓ Hair matches reference EXACTLY (color, texture, style, length)
✓ Expression matches reference EXACTLY
✓ Age and ethnicity preserved EXACTLY
✓ Only clothing has changed - person is identical
✓ Photorealistic quality with natural lighting
✓ Professional photography look

REMEMBER: This is VIRTUAL TRY-ON, not face generation. The person's identity MUST remain 100% identical to the reference image. Only the clothing changes.`

    console.log('📝 Fallback prompt generated with enhanced CHARACTER LOCK emphasis')
    return fallbackPrompt
  }
}

export async function optimizeTryOnPrompt(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a prompt optimizer. Compress the given prompt to ≤420 tokens while preserving ALL critical information: identity lock directives, clothing fidelity, preset/style information, color/pattern fidelity. Remove redundancy but keep all mandatory constraints.',
        },
        {
          role: 'user',
          content: `Optimize this prompt to ≤420 tokens:\n\n${prompt}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content || prompt
  } catch (error) {
    console.error('Prompt optimization error:', error)
    return prompt.substring(0, 2000) // Fallback: truncate
  }
}

export async function rateAdCreative(
  adImageBase64: string,
  productImageBase64?: string,
  influencerImageBase64?: string
): Promise<AdRating> {
  try {
    const content: any[] = [
      {
        type: 'text',
        text: `Rate this ad creative on 7 dimensions (0-100 each):
1. Composition & Layout (20pts): Visual balance, rule of thirds, focal point
2. Product Integration (20pts): Product visibility, prominence, natural placement
3. Visual Quality (15pts): Image sharpness, lighting, color grading
4. Brand Consistency (15pts): Brand colors, style, guidelines adherence
5. Model/Subject Quality (15pts): Pose, expression, professionalism
6. Background & Environment (10pts): Context, atmosphere, relevance
7. Overall Appeal (5pts): General attractiveness, marketability

Return JSON with: score (0-100), breakdown (object with each dimension score), reasons (detailed feedback), improvements (array of actionable suggestions). Reference successful campaigns from Nike, Gucci, Loewe for standards.`,
      },
      {
        type: 'image_url',
        image_url: {
          url: formatImageUrl(adImageBase64),
        },
      },
    ]

    if (productImageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: formatImageUrl(productImageBase64),
        },
      })
    }

    if (influencerImageBase64) {
      content.push({
        type: 'image_url',
        image_url: {
          url: formatImageUrl(influencerImageBase64),
        },
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return result as AdRating
  } catch (error) {
    console.error('Ad rating error:', error)
    return {
      score: 50,
      breakdown: {
        composition: 10,
        productIntegration: 10,
        visualQuality: 10,
        brandConsistency: 10,
        modelQuality: 10,
        background: 10,
        overallAppeal: 5,
      },
      reasons: 'Error analyzing ad',
      improvements: [],
    }
  }
}

export async function generateCollaborationProposal(
  brandDetails: {
    companyName: string
    vertical?: string
    budgetRange?: string
  },
  influencerProfile: {
    bio?: string
    niches: string[]
    followers?: number
  },
  proposalDetails: {
    budget?: number
    timeline?: string
    goals?: string[]
    notes?: string
  }
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional brand representative writing a warm, personalized collaboration proposal. Reference specific aspects of the influencer\'s niche, highlight mutual benefits, and sound genuine (not generic). Keep it 200-300 words.',
        },
        {
          role: 'user',
          content: `Brand: ${brandDetails.companyName}${brandDetails.vertical ? ` (${brandDetails.vertical})` : ''}
Influencer Niches: ${influencerProfile.niches.join(', ')}
Influencer Bio: ${influencerProfile.bio || 'Not provided'}
Followers: ${influencerProfile.followers || 'Not specified'}
Budget: ${proposalDetails.budget ? `$${proposalDetails.budget}` : 'To be discussed'}
Timeline: ${proposalDetails.timeline || 'Flexible'}
Goals: ${proposalDetails.goals?.join(', ') || 'Brand awareness and engagement'}
Additional Notes: ${proposalDetails.notes || 'None'}

Generate a personalized collaboration proposal.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    })

    return response.choices[0]?.message?.content || 'We would love to collaborate with you!'
  } catch (error) {
    console.error('Proposal generation error:', error)
    return 'We would love to collaborate with you!'
  }
}

export async function generateProductRecommendations(
  influencerProfile: {
    bio?: string
    niches: string[]
  },
  products: Array<{
    id: string
    name: string
    description?: string
    category?: string
  }>
): Promise<
  Array<{
    productId: string
    matchScore: number
    reason: string
  }>
> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a product matching AI. Match products to influencers based on niches, bio, and product categories. Return JSON array with productId, matchScore (0-100), and reason for each match. Return top 10 matches.',
        },
        {
          role: 'user',
          content: `Influencer Niches: ${influencerProfile.niches.join(', ')}
Influencer Bio: ${influencerProfile.bio || 'Not provided'}

Products:
${products.map((p) => `- ${p.id}: ${p.name} (${p.category || 'uncategorized'}) - ${p.description || ''}`).join('\n')}

Match products to this influencer.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return (result.matches || result.recommendations || []) as Array<{
      productId: string
      matchScore: number
      reason: string
    }>
  } catch (error) {
    console.error('Product recommendation error:', error)
    return []
  }
}

export async function generateAdCopy(
  adImageBase64: string,
  context: {
    productName?: string
    brandName?: string
    niche?: string
    audience?: string
  }
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Generate 3-5 ad copy variants with different tones (professional, casual, aspirational). Include platform-specific hashtags. Each variant should be 1-2 sentences.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate ad copy for this image.
Product: ${context.productName || 'Not specified'}
Brand: ${context.brandName || 'Not specified'}
Niche: ${context.niche || 'Fashion'}
Target Audience: ${context.audience || 'General'}

Generate multiple copy variants.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: formatImageUrl(adImageBase64),
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.9,
    })

    const content = response.choices[0]?.message?.content || ''
    return content.split('\n').filter((line) => line.trim().length > 0)
  } catch (error) {
    console.error('Ad copy generation error:', error)
    return ['Check out this amazing product!']
  }
}

export async function generateAdImprovementSuggestions(
  adImageBase64: string,
  context: {
    productType?: string
    niche?: string
    audience?: string
  }
): Promise<
  Array<{
    category: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
    rationale: string
  }>
> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Provide data-driven improvement suggestions based on successful campaigns from Nike, Gucci, Loewe. Be specific and actionable. Reference specific techniques (e.g., "Nike-style dynamic composition").',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ad and provide improvement suggestions.
Product Type: ${context.productType || 'Fashion'}
Niche: ${context.niche || 'General'}
Audience: ${context.audience || 'General'}

Return JSON array with: category (composition, lighting, background, etc.), suggestion (actionable), priority (high/medium/low), rationale.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${adImageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return (result.suggestions || result.improvements || []) as Array<{
      category: string
      suggestion: string
      priority: 'high' | 'medium' | 'low'
      rationale: string
    }>
  } catch (error) {
    console.error('Improvement suggestions error:', error)
    return []
  }
}

export async function analyzeOutfitAndProvideAdvice(imageBase64: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this outfit and provide styling advice, including what works well, what could be improved, and suggestions for accessories or alternatives. Consider current fashion trends.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || 'This is a nice outfit!'
  } catch (error) {
    console.error('Outfit analysis error:', error)
    return 'Unable to analyze outfit at this time.'
  }
}

export async function chatWithFashionBuddy(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a friendly fashion assistant. Provide styling advice, answer fashion questions, and help users with their style choices. Be conversational and helpful.',
      },
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    })

    return response.choices[0]?.message?.content || "I'm here to help with fashion advice!"
  } catch (error) {
    console.error('Fashion buddy chat error:', error)
    return "I'm having trouble right now. Please try again!"
  }
}

