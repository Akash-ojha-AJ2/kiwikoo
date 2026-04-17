import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface GarmentAnalysis {
  garment_type: 'dress' | 'top' | 'shirt' | 'blouse' | 'jacket' | 'sweater' | 'coat' | 'kurta' | 'kurti' | 'polo' | 't-shirt' | 'saree-blouse' | 'other'
  sleeve_type: 'sleeveless' | 'spaghetti_strap' | 'cap_sleeve' | 'short_sleeve' | 'three_quarter' | 'long_sleeve' | 'other'
  neckline: 'round' | 'v_neck' | 'square' | 'boat' | 'halter' | 'off_shoulder' | 'high_neck' | 'collared' | 'other'
  length: 'crop' | 'regular' | 'midi' | 'maxi' | 'other'
  fit: 'fitted' | 'regular' | 'loose' | 'oversized'
  has_pattern: boolean
  pattern_description?: string
  primary_color: string
  secondary_colors?: string[]
  notable_details?: string[] // buttons, embroidery, lace, cutouts, etc.
  skin_exposure: 'minimal' | 'moderate' | 'high' // How much skin will be visible
}

/**
 * Analyze a garment image to understand its key characteristics.
 * This helps the renderer understand exactly what to apply.
 */
export async function analyzeGarment(garmentImageBase64: string): Promise<GarmentAnalysis> {
  const openai = getGeminiChat()

  // Strip data URL if present
  const cleanBase64 = garmentImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a fashion expert analyzing garment images for a virtual try-on system.
Analyze the garment and return ONLY valid JSON with these exact fields:

{
  "garment_type": "dress" | "top" | "shirt" | "blouse" | "jacket" | "sweater" | "coat" | "kurta" | "kurti" | "polo" | "t-shirt" | "saree-blouse" | "other",
  "sleeve_type": "sleeveless" | "spaghetti_strap" | "cap_sleeve" | "short_sleeve" | "three_quarter" | "long_sleeve" | "other",
  "neckline": "round" | "v_neck" | "square" | "boat" | "halter" | "off_shoulder" | "high_neck" | "collared" | "mandarin" | "other",
  "length": "crop" | "regular" | "midi" | "maxi" | "floor" | "other",
  "fit": "fitted" | "regular" | "loose" | "oversized",
  "has_pattern": true/false,
  "pattern_description": "optional: describe the pattern if present",
  "primary_color": "main color name",
  "secondary_colors": ["other colors if any"],
  "notable_details": ["buttons", "embroidery", "lace", etc.],
  "skin_exposure": "minimal" | "moderate" | "high"
}

CRITICAL GARMENT TYPE IDENTIFICATION:
- SHIRT: Button-up, ends at WAIST or slightly below, has collar, short/long sleeves
- T-SHIRT: Casual, NO buttons, round neck, short sleeves
- POLO: Collar with 2-3 buttons, short sleeves, ends at waist
- KURTA: Traditional Indian, LONG garment going past hips to KNEE or below, may have mandarin collar
- KURTI: Shorter version of kurta, goes to thigh/mid-thigh
- BLOUSE: Fitted top for women, ends at waist
- TOP: General category for non-specific tops

LENGTH IDENTIFICATION:
- "regular" = ends at waist/hips (shirts, t-shirts, blouses)
- "midi" = ends at thigh level
- "maxi" = ends at or below knee
- "floor" = ankle/floor length

IF THE GARMENT IS SHORT (ends at waist/hips) → It's a SHIRT/T-SHIRT/POLO/BLOUSE
IF THE GARMENT IS LONG (goes past hips) → It's a KURTA/KURTI/DRESS

IMPORTANT for skin_exposure:
- sleeveless/spaghetti_strap = "high" (arms/shoulders visible)
- short_sleeve = "moderate" (some arm visible)
- long_sleeve = "minimal"
- off_shoulder = "high"

Return ONLY the JSON, no explanation.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this garment:' },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${cleanBase64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.1,
  })

  const content = response.choices[0]?.message?.content || '{}'

  // Extract JSON from response
  let jsonText = content.trim()
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonText = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonText) as GarmentAnalysis
    return {
      garment_type: parsed.garment_type || 'other',
      sleeve_type: parsed.sleeve_type || 'other',
      neckline: parsed.neckline || 'other',
      length: parsed.length || 'regular',
      fit: parsed.fit || 'regular',
      has_pattern: parsed.has_pattern || false,
      pattern_description: parsed.pattern_description,
      primary_color: parsed.primary_color || 'unknown',
      secondary_colors: parsed.secondary_colors,
      notable_details: parsed.notable_details,
      skin_exposure: parsed.skin_exposure || 'moderate',
    }
  } catch {
    // Default fallback
    return {
      garment_type: 'top',
      sleeve_type: 'other',
      neckline: 'other',
      length: 'regular',
      fit: 'regular',
      has_pattern: false,
      primary_color: 'unknown',
      skin_exposure: 'moderate',
    }
  }
}

/**
 * Generate specific instructions based on garment analysis.
 */
export function getGarmentInstructions(analysis: GarmentAnalysis): string {
  const instructions: string[] = []

  // Sleeve handling is CRITICAL
  if (analysis.sleeve_type === 'sleeveless' || analysis.sleeve_type === 'spaghetti_strap') {
    instructions.push(`SLEEVELESS GARMENT: Show the subject's bare arms and shoulders. Remove ALL traces of original sleeves.`)
  } else if (analysis.sleeve_type === 'short_sleeve' || analysis.sleeve_type === 'cap_sleeve') {
    instructions.push(`SHORT SLEEVE: Show sleeves ending above the elbow. Subject's lower arms should be visible.`)
  } else if (analysis.sleeve_type === 'three_quarter') {
    instructions.push(`3/4 SLEEVE: Show sleeves ending between elbow and wrist.`)
  } else if (analysis.sleeve_type === 'long_sleeve') {
    instructions.push(`LONG SLEEVE: Show full sleeves to the wrists.`)
  }

  // Neckline
  if (analysis.neckline === 'v_neck') {
    instructions.push(`V-NECKLINE: Show V-shaped neckline with appropriate chest area visible.`)
  } else if (analysis.neckline === 'off_shoulder') {
    instructions.push(`OFF-SHOULDER: Show exposed shoulders. The garment sits below the shoulder line.`)
  } else if (analysis.neckline === 'halter') {
    instructions.push(`HALTER NECKLINE: Show exposed shoulders and back with halter strap around neck.`)
  } else if (analysis.neckline === 'boat' || analysis.neckline === 'square') {
    instructions.push(`${analysis.neckline.toUpperCase()} NECKLINE: Show wide neckline with exposed collarbone.`)
  }

  // Color and pattern
  instructions.push(`PRIMARY COLOR: ${analysis.primary_color}`)
  if (analysis.has_pattern && analysis.pattern_description) {
    instructions.push(`PATTERN: ${analysis.pattern_description} - must be accurately reproduced`)
  }

  // Notable details
  if (analysis.notable_details && analysis.notable_details.length > 0) {
    instructions.push(`DETAILS to preserve: ${analysis.notable_details.join(', ')}`)
  }

  return instructions.join('\n')
}

