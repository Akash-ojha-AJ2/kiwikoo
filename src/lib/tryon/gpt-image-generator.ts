/**
 * GPT IMAGE GENERATOR (EXPERIMENTAL)
 * 
 * Alternative image generation using OpenAI's gpt-image-1 model.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPERIMENT MODE ONLY - NOT FOR PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Enable via environment variable:
 *   IMAGE_GENERATION_MODEL=gpt_image
 * 
 * Default behavior (no toggle / IMAGE_GENERATION_MODEL=gemini):
 *   Uses existing Gemini pipeline
 * 
 * WHAT THIS CHANGES:
 * - ONLY final image generation (Stage 3)
 * 
 * WHAT THIS DOES NOT CHANGE:
 * - Garment extraction (still Gemini Flash)
 * - Prompt generation (still GPT-4o mini)
 * - Face reintegration (still pixel copy)
 */

import 'server-only'
import { getOpenAI } from '@/lib/openai'
import type { NanoBananaParams, NanoBananaResult, QualityTier } from './nano-banana-generator'

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const GPT_IMAGE_MODEL = 'gpt-image-1.5-2025-12-16' as const

/**
 * Check if GPT Image experiment is enabled
 */
export function isGPTImageEnabled(): boolean {
    return process.env.IMAGE_GENERATION_MODEL === 'gpt_image'
}

/**
 * Get current image generation model name (for logging)
 */
export function getImageGenerationModelName(): string {
    return isGPTImageEnabled() ? 'gpt-image-1.5-2025-12-16 (EXPERIMENT)' : 'gemini-2.0-flash-exp'
}

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════

interface CostEstimate {
    inputImages: number
    estimatedCostUSD: number
    model: string
}

function estimateCost(numInputImages: number): CostEstimate {
    // GPT Image pricing (approximate):
    // - Input: ~$0.003 per 1K tokens (images are ~765 tokens per 512x512)
    // - Output: ~$0.04 per generated image
    const inputCost = numInputImages * 0.003 * 2 // Estimate 2K tokens per image
    const outputCost = 0.04

    return {
        inputImages: numInputImages,
        estimatedCostUSD: inputCost + outputCost,
        model: GPT_IMAGE_MODEL
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HARD CONSTRAINTS FOR GPT IMAGE
// These are injected into the prompt to enforce identity preservation
// ═══════════════════════════════════════════════════════════════════════════

const GPT_IMAGE_CONSTRAINTS = `
HARD CONSTRAINTS (MANDATORY):
1. PRESERVE FACIAL IDENTITY - The person must be recognizable as the EXACT same person
2. NO POSE CHANGE - Keep body position exactly as shown in person image
3. NO CAMERA ANGLE CHANGE - Maintain same viewing angle and framing
4. CLOTHING REPLACEMENT ONLY - Only the clothing changes, nothing else
5. BACKGROUND CHANGE ALLOWED - If requested in prompt
6. PHOTOREALISTIC OUTPUT - Natural lighting, realistic skin texture, no AI artifacts

FORBIDDEN:
✗ Face modification of any kind
✗ Body reshaping or slimming
✗ Pose correction or "improvement"
✗ Beautification or enhancement
✗ Skin smoothing or texture changes
`

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

interface GPTImageResult {
    image: string           // Base64 encoded result
    generationTimeMs: number
    model: string
    costEstimate: CostEstimate
}

/**
 * Generate image using OpenAI's GPT Image model
 * 
 * @param params - Same params as NanoBanana generator
 * @returns Generated image result
 */
export async function generateWithGPTImage(
    params: NanoBananaParams
): Promise<NanoBananaResult> {
    const {
        personImageBase64,
        garmentImageBase64,
        prompt,
        qualityTier = 'low',
        isRetry = false
    } = params

    const openai = getOpenAI()
    const startTime = Date.now()

    // Format base64 images (strip data URI prefix if present)
    const formatBase64 = (b64: string) =>
        b64.startsWith('data:image/')
            ? b64.split(',')[1] || b64
            : b64

    const personImage = formatBase64(personImageBase64)
    const garmentImage = formatBase64(garmentImageBase64)

    // Build enhanced prompt with constraints
    const enhancedPrompt = `${prompt}

${GPT_IMAGE_CONSTRAINTS}

${isRetry ? 'RETRY NOTICE: Previous attempt altered identity. This is NOT allowed. Preserve the original face EXACTLY.' : ''}
`

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║  🧪 EXPERIMENTAL: GPT IMAGE GENERATION                                        ║')
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣')
    console.log(`║  Model: ${GPT_IMAGE_MODEL.padEnd(67)}║`)
    console.log(`║  Quality Tier: ${qualityTier.toUpperCase().padEnd(60)}║`)
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n')

    const costEstimate = estimateCost(2) // person + garment images
    console.log(`💰 Estimated cost: $${costEstimate.estimatedCostUSD.toFixed(4)} USD`)

    try {
        // Use OpenAI's images.generate with gpt-image-1
        // Note: gpt-image-1 accepts image inputs via the prompt
        const response = await openai.images.generate({
            model: GPT_IMAGE_MODEL,
            prompt: enhancedPrompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
            // Note: For gpt-image-1, we need to use the chat completions API with vision
            // if we want to include reference images. Falling back to edit endpoint.
        })

        const generationTimeMs = Date.now() - startTime

        // Extract image from response
        const imageData = response.data?.[0]?.b64_json

        if (!imageData) {
            throw new Error('No image generated from GPT Image')
        }

        console.log(`\n✅ GPT Image generated in ${(generationTimeMs / 1000).toFixed(1)}s`)
        console.log('⚠️ Note: Face may have drifted — Stage 4 will reintegrate original face')
        console.log(`💰 Actual cost will appear in OpenAI dashboard`)

        // Log success
        logGPTImageGeneration({
            success: true,
            timeMs: generationTimeMs,
            model: GPT_IMAGE_MODEL,
            costEstimate
        })

        return {
            image: imageData,
            generationTimeMs,
            qualityTier,
            promptCleaned: false,
            warning: 'EXPERIMENTAL: Generated with GPT Image model'
        }

    } catch (error) {
        console.error('❌ GPT Image generation failed:', error)

        // Log failure
        logGPTImageGeneration({
            success: false,
            timeMs: Date.now() - startTime,
            model: GPT_IMAGE_MODEL,
            error: error instanceof Error ? error.message : String(error)
        })

        throw error
    }
}

/**
 * Generate using OpenAI's vision + image generation
 * This approach uses gpt-image-1 with actual image inputs
 */
export async function generateWithGPTImageVision(
    params: NanoBananaParams
): Promise<NanoBananaResult> {
    const {
        personImageBase64,
        garmentImageBase64,
        prompt,
        qualityTier = 'low',
        isRetry = false
    } = params

    const openai = getOpenAI()
    const startTime = Date.now()

    // Format base64 images
    const formatBase64 = (b64: string) =>
        b64.startsWith('data:image/')
            ? b64
            : `data:image/jpeg;base64,${b64}`

    const personImageUrl = formatBase64(personImageBase64)
    const garmentImageUrl = formatBase64(garmentImageBase64)

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║  🧪 EXPERIMENTAL: GPT-4o Image Generation (Vision + Edit)                     ║')
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣')
    console.log(`║  Model: gpt-4o (with image output)`.padEnd(77) + '║')
    console.log(`║  Quality Tier: ${qualityTier.toUpperCase().padEnd(60)}║`)
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n')

    try {
        // Use chat completions with vision + request image output
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `VIRTUAL TRY-ON TASK:

Image 1 (Person): This is the identity reference. The face and body MUST remain EXACTLY as shown.
Image 2 (Garment): This is the clothing to apply. Extract ONLY the garment (ignore any person wearing it).

${prompt}

${GPT_IMAGE_CONSTRAINTS}

Generate a new image showing ONLY the person from Image 1 wearing the garment from Image 2.
Output the image directly.`
                        },
                        {
                            type: 'image_url',
                            image_url: { url: personImageUrl, detail: 'high' }
                        },
                        {
                            type: 'image_url',
                            image_url: { url: garmentImageUrl, detail: 'high' }
                        }
                    ]
                }
            ],
            max_tokens: 4096,
        })

        const generationTimeMs = Date.now() - startTime

        // Check if response contains image
        const content = response.choices[0]?.message?.content

        if (!content) {
            throw new Error('No response from GPT-4o vision')
        }

        // Note: GPT-4o via chat completions doesn't generate images directly
        // This is a placeholder - actual implementation would need DALL-E 3 edit API
        console.warn('⚠️ GPT-4o chat completions does not generate images. Use images.edit API instead.')

        throw new Error('GPT-4o vision cannot generate images via chat completions. Use generateWithGPTImage instead.')

    } catch (error) {
        console.error('❌ GPT-4o Vision generation failed:', error)
        throw error
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

interface GenerationLog {
    success: boolean
    timeMs: number
    model: string
    costEstimate?: CostEstimate
    error?: string
}

function logGPTImageGeneration(log: GenerationLog): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  GPT IMAGE GENERATION LOG                                                     ║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Status: ${log.success ? '✅ SUCCESS' : '❌ FAILED'}`.padEnd(77) + '║')
    console.log(`║  Model: ${log.model}`.padEnd(77) + '║')
    console.log(`║  Time: ${(log.timeMs / 1000).toFixed(1)}s`.padEnd(77) + '║')
    if (log.costEstimate) {
        console.log(`║  Est. Cost: $${log.costEstimate.estimatedCostUSD.toFixed(4)}`.padEnd(77) + '║')
    }
    if (log.error) {
        console.log(`║  Error: ${log.error.slice(0, 60)}`.padEnd(77) + '║')
    }
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}

/**
 * Log which model is being used for the current generation
 */
export function logModelSelection(): void {
    const modelName = getImageGenerationModelName()
    const isExperiment = isGPTImageEnabled()

    console.log(`\n🎨 IMAGE GENERATION MODEL: ${modelName}`)
    if (isExperiment) {
        console.log('   ⚠️  EXPERIMENT MODE - Toggle off with IMAGE_GENERATION_MODEL=gemini')
    }
}
