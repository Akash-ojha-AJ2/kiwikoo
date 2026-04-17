import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiKey } from '@/lib/config/api-keys'

const getGenAI = () => {
  const apiKey = getGeminiKey()
  return new GoogleGenerativeAI(apiKey)
}

// Helper to parse base64 data URL and extract raw data + mime type
function parseBase64Image(dataUrl: string): { data: string; mimeType: string } {
  // Check if it's a data URL format
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    }
  }
  // Assume it's raw base64 jpeg if no prefix
  return {
    mimeType: 'image/jpeg',
    data: dataUrl,
  }
}

export async function generateWithGemini(
  personImage: string,
  clothingImage: string,
  prompt: string
): Promise<string> {
  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const person = parseBase64Image(personImage)
    const clothing = parseBase64Image(clothingImage)

    const result = await model.generateContent([
      {
        inlineData: {
          data: person.data,
          mimeType: person.mimeType,
        },
      },
      {
        inlineData: {
          data: clothing.data,
          mimeType: clothing.mimeType,
        },
      },
      prompt,
    ])

    const response = await result.response
    // Note: Gemini may return text, not images directly
    // For image generation, you might need a different approach
    return response.text()
  } catch (error) {
    console.error('Gemini generation error:', error)
    throw error
  }
}

/**
 * Generate an ad image using Gemini's native image generation.
 * Defaults to gemini-2.5-flash-image (confirmed working, supports image generation).
 * Override via AD_IMAGE_MODEL env var for gemini-3-pro-image-preview etc.
 * Returns a base64 encoded image string (data URL).
 */
export async function generateIntelligentAdComposition(
  productImage?: string,
  influencerImage?: string,
  compositionPrompt?: string,
  options?: {
    /** When true, influencer image is placed FIRST for stronger identity attention */
    lockFaceIdentity?: boolean
    /** Optional tight face crop for stronger identity reinforcement */
    faceCropBase64?: string
    /** Output aspect ratio — injected into prompt as composition instruction */
    aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5'
    /** Override temperature for face-lock (lower = more deterministic / less face drift) */
    temperature?: number
  }
): Promise<string> {
  try {
    const genAI = getGenAI()

    // Use Nano Banana Pro (gemini-3-pro-image-preview) for best ad quality
    // Same model as try-on pipeline — best at creative composition
    const modelName =
      process.env.AD_IMAGE_MODEL ||
      'gemini-3-pro-image-preview'

    console.log(`[Gemini] Using model: ${modelName} for ad image generation`)

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        // @ts-ignore - responseModalities is valid for image models
        responseModalities: ['image', 'text'],
        // Lower randomness for face-lock (0.2) vs normal (0.4)
        temperature: options?.temperature ?? 0.4,
        topP: options?.lockFaceIdentity ? 0.8 : 0.9,
        topK: options?.lockFaceIdentity ? 32 : 64,
      },
    })

    const parts: any[] = []

    // Image input order matters for identity attention:
    // If face-lock is on, influencer image goes FIRST (stronger attention)
    if (options?.lockFaceIdentity && influencerImage) {
      const parsed = parseBase64Image(influencerImage)
      parts.push({
        inlineData: {
          data: parsed.data,
          mimeType: parsed.mimeType,
        },
      })
      if (options.faceCropBase64) {
        const faceCrop = parseBase64Image(options.faceCropBase64)
        parts.push({
          inlineData: {
            data: faceCrop.data,
            mimeType: faceCrop.mimeType,
          },
        })
      }
      // Then product image
      if (productImage) {
        const parsed2 = parseBase64Image(productImage)
        parts.push({
          inlineData: {
            data: parsed2.data,
            mimeType: parsed2.mimeType,
          },
        })
      }
    } else {
      // Default order: product first, then influencer
      if (productImage) {
        const parsed = parseBase64Image(productImage)
        parts.push({
          inlineData: {
            data: parsed.data,
            mimeType: parsed.mimeType,
          },
        })
      }

      if (influencerImage) {
        const parsed = parseBase64Image(influencerImage)
        parts.push({
          inlineData: {
            data: parsed.data,
            mimeType: parsed.mimeType,
          },
        })
      }
    }

    // Build aspect ratio instruction
    const ar = options?.aspectRatio || '1:1'
    const arMap: Record<string, string> = {
      '1:1': 'square 1:1 composition (equal width and height)',
      '9:16': 'vertical 9:16 portrait composition (tall, like an Instagram Story or Reels)',
      '16:9': 'wide 16:9 landscape composition (cinematic, like a banner or YouTube thumbnail)',
      '4:5': 'vertical 4:5 portrait composition (like an Instagram post)',
    }
    const arInstruction = `\n\nIMAGE FORMAT: Generate the image in ${arMap[ar] || arMap['1:1']} aspect ratio. Compose all elements to fit this format perfectly.`

    // Add the prompt with aspect ratio
    const finalPrompt = (compositionPrompt ||
      'Generate a professional advertising image that integrates the product naturally. Use professional studio lighting, clean composition, and brand-appropriate aesthetics. Output a high-quality photorealistic ad image.') + arInstruction

    parts.push(finalPrompt)

    console.log('[Gemini] Generating ad image...')
    const result = await model.generateContent(parts)
    const response = result.response

    // Check for image parts in the response
    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No response candidates from Gemini')
    }

    const content = candidates[0].content
    if (!content || !content.parts) {
      throw new Error('No content parts in Gemini response')
    }

    // Look for inline image data in the response
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
        const base64Image = part.inlineData.data
        const mimeType = part.inlineData.mimeType
        console.log(
          `[Gemini] Generated ad image: ${mimeType}, ${Math.round(base64Image.length / 1024)}KB`
        )
        return `data:${mimeType};base64,${base64Image}`
      }
    }

    // If no image found, check for text (might be an error or description)
    for (const part of content.parts) {
      if (part.text) {
        console.warn(
          '[Gemini] Received text instead of image:',
          part.text.substring(0, 200)
        )
      }
    }

    throw new Error('Gemini did not return an image in the response')
  } catch (error) {
    console.error('Gemini ad composition error:', error)
    throw error
  }
}
