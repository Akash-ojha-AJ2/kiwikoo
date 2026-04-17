/**
 * NANO BANANA PRO GENERATOR (Stage 3)
 * 
 * Production image generator using Nano Banana Pro (Gemini) ONLY.
 * This is the SOLE image generation model in the production pipeline.
 * 
 * CORE PRINCIPLE:
 * - Nano Banana is UNTRUSTED for face/body preservation
 * - The pipeline ENFORCES truth via face reintegration
 * - Generator suggests pixels, pipeline decides reality
 * 
 * FORBIDDEN BEHAVIORS:
 * - Face generation/modification
 * - Body reshaping
 * - Pose correction
 * - Beautification
 */

import { GoogleGenAI } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'
// GPT Image experiment toggle
import {
    isGPTImageEnabled,
    generateWithGPTImage as generateWithGPTImageAPI,
    logModelSelection,
    getImageGenerationModelName
} from './gpt-image-generator'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QualityTier = 'low' | 'medium' | 'high'

export interface NanoBananaParams {
    personImageBase64: string      // Image 1: Person (identity reference)
    garmentImageBase64: string     // Image 2: Garment (visual only)
    prompt: string                 // Strict try-on prompt from Stage 2
    qualityTier?: QualityTier      // Cost tier (default: low)
    isRetry?: boolean              // True if this is a retry after drift detection
    /** DO NOT TOUCH: hard-fail on forbidden prompt terms (no silent auto-repair). */
    strictPromptValidation?: boolean
}

export interface NanoBananaResult {
    image: string                  // Base64 encoded result image
    generationTimeMs: number       // Time taken for generation
    qualityTier: QualityTier       // Quality tier used
    promptCleaned: boolean         // Whether forbidden terms were removed
    warning?: string               // Any warnings about the generation
}

// ═══════════════════════════════════════════════════════════════════════════
// FORBIDDEN TERMS (AUTOMATICALLY STRIPPED)
// Nano Banana interprets permission more strongly than instruction.
// These terms give permission to "help" — which causes identity drift.
// ═══════════════════════════════════════════════════════════════════════════

const FORBIDDEN_TERMS = [
    // Core forbidden
    'perfect',
    'enhance',
    'improve',
    // 'editorial', // ALLOWED for presets
    // 'fashion', // ALLOWED for presets
    'model',
    // 'studio', // ALLOWED for presets
    'portrait',
    'artistic',
    'aesthetic',
    'creative',
    // 'clean', // ALLOWED for presets
    'sharp',
    'elegant',
    'symmetry',
    'ideal',
    // Extended forbidden
    'beautif',       // Catches beautify, beautiful, beautification
    'flawless',
    'stunning',
    'gorgeous',
    'glamour',
    // 'professional', // ALLOWED for presets
    'high fashion',
    'vogue',
    'magazine',
    'retouched',
    'airbrushed',
    'idealized',
    'perfected',
    'mannequin',
    'refined',
    'polished',
    'sleek',
    'crisp',
    'HDR',
    // 'dramatic', // ALLOWED for lighting style
    // 'cinematic', // ALLOWED for lighting style
    // 'photoshoot', // ALLOWED for presets
    // 'catalog', // ALLOWED for presets
    'lookbook',
    'flattering',
    'slimming',
    'toning',
    'smoothing',
]

// ═══════════════════════════════════════════════════════════════════════════
// QUALITY TIER CONFIG
// Temperature MUST be 0.01-0.05 for identity safety
// Higher temperature = more hallucination = identity drift
// ═══════════════════════════════════════════════════════════════════════════

const QUALITY_CONFIG: Record<QualityTier, {
    model: string
    temperature: number
    maxTokens: number
    canRetry: boolean
}> = {
    low: {
        model: 'gemini-3-pro-image-preview',
        temperature: 0.01,                // MINIMUM — most identity-safe
        maxTokens: 4096,
        canRetry: true
    },
    medium: {
        model: 'gemini-3-pro-image-preview',
        temperature: 0.03,                // Still very low
        maxTokens: 8192,
        canRetry: true
    },
    high: {
        model: 'gemini-3-pro-image-preview',
        temperature: 0.05,                // Maximum allowed — NO retries
        maxTokens: 8192,
        canRetry: false
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT CLEANING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Strip forbidden terms from prompt
 * Returns cleaned prompt and whether cleaning occurred
 */
export function cleanPromptForNanoBanana(prompt: string): {
    cleaned: string
    wasModified: boolean
    termsRemoved: string[]
} {
    let cleaned = prompt
    const termsRemoved: string[] = []

    for (const term of FORBIDDEN_TERMS) {
        const regex = new RegExp(term, 'gi')
        if (regex.test(cleaned)) {
            termsRemoved.push(term)
            cleaned = cleaned.replace(regex, '')
        }
    }

    // Clean up double spaces and formatting issues
    cleaned = cleaned.replace(/\s+/g, ' ').trim()

    return {
        cleaned,
        wasModified: termsRemoved.length > 0,
        termsRemoved
    }
}

/**
 * Build the JSON-structured enforcement prompt for Nano Banana Pro
 * 
 * Uses structured JSON for stricter constraint parsing and face fidelity.
 */
function buildEnforcementPrompt(userPrompt: string, isRetry: boolean = false): string {
    // ═══════════════════════════════════════════════════════════════════════════
    // EXTRACT SCENE + LIGHTING FROM USER PROMPT
    // The hybrid pipeline injects these as "SCENE: ..." and "LIGHTING: ..."
    // We extract them to place at TOP LEVEL of the enforcement JSON
    // ═══════════════════════════════════════════════════════════════════════════
    let sceneText = ''
    let lightingText = ''
    let cleanedInstruction = userPrompt

    // Extract SCENE: line
    const sceneMatch = userPrompt.match(/SCENE:\s*(.+?)(?:\n|$)/i)
    if (sceneMatch) {
        sceneText = sceneMatch[1].trim()
        cleanedInstruction = cleanedInstruction.replace(sceneMatch[0], '').trim()
    }

    // Extract LIGHTING: line
    const lightingMatch = userPrompt.match(/LIGHTING:\s*(.+?)(?:\n|$)/i)
    if (lightingMatch) {
        lightingText = lightingMatch[1].trim()
        cleanedInstruction = cleanedInstruction.replace(lightingMatch[0], '').trim()
    }

    const hasSceneOverride = sceneText.length > 0 || lightingText.length > 0

    console.log('ENFORCEMENT PROMPT BUILDER:')
    console.log(`  Scene extracted: ${sceneText || 'NONE'}`)
    console.log(`  Lighting extracted: ${lightingText || 'NONE'}`)
    console.log(`  Has scene override: ${hasSceneOverride}`)

    const prompt: Record<string, unknown> = {
        // ═══════════════════════════════════════════════════════════════════════
        // TASK DEFINITION — WHAT TO DO
        // ═══════════════════════════════════════════════════════════════════════
        TASK: {
            action: "Apply clothing from Image 2 onto the person in Image 1",
            mode: "VIRTUAL_TRY_ON",
            clothing_only: !hasSceneOverride,
        },

        // ═══════════════════════════════════════════════════════════════════════
        // SCENE OVERRIDE — TOP PRIORITY FOR ENVIRONMENT
        // This section MUST be followed for background and lighting.
        // If a scene is specified, the output MUST show that environment.
        // ═══════════════════════════════════════════════════════════════════════
        ...(hasSceneOverride ? {
            SCENE_OVERRIDE: {
                priority: "MANDATORY — Output MUST match this scene description",
                background: sceneText || "Keep original background",
                lighting: lightingText || "Match scene lighting",
                enforcement: "The generated image background and lighting MUST reflect this scene. DO NOT ignore this. DO NOT keep the original background if a scene is specified.",
            }
        } : {}),

        // ═══════════════════════════════════════════════════════════════════════
        // IDENTITY LOCK — Face + body from Image 1
        // ═══════════════════════════════════════════════════════════════════════
        IDENTITY: {
            face: "COPY face from Image 1 EXACTLY. Same person, same features.",
            body: "KEEP body shape, weight, proportions from Image 1 EXACTLY.",
            forbidden: [
                "face_alteration", "beautification", "slimming",
                "symmetry_correction", "skin_smoothing", "jawline_rounding"
            ]
        },

        // ═══════════════════════════════════════════════════════════════════════
        // GARMENT — From Image 2
        // ═══════════════════════════════════════════════════════════════════════
        GARMENT: {
            source: "Image 2",
            rule: "Garment adapts to body, body does NOT adapt to garment",
            forbidden: ["idealized_fit", "flattering_drape", "body_shaping"]
        },

        // ═══════════════════════════════════════════════════════════════════════
        // CAMERA — Realistic
        // ═══════════════════════════════════════════════════════════════════════
        CAMERA: {
            type: "phone_camera",
            style: "candid_single_photo",
            pose_correction: false,
            lighting: hasSceneOverride ? "FOLLOW_SCENE_OVERRIDE" : "match_input"
        },

        // User instruction (clothing swap + any extra text)
        instruction: cleanedInstruction,

        // Retry notice
        ...(isRetry ? {
            retry_notice: "Previous attempt altered human appearance. Preserve original face and body exactly."
        } : {})
    }

    return JSON.stringify(prompt, null, 2)
}

/**
 * Get retry prompt append (for use when first attempt drifts)
 */
export function getRetryPromptAppend(): string {
    return `

RETRY NOTICE:

The previous attempt altered human appearance.
This is not allowed.
Preserve the original face and body exactly.
Undo any enhancement or correction.
Only apply the clothing.`
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create Gemini client for Nano Banana Pro
 */
function getNanoBananaClient(): GoogleGenAI {
    const apiKey = getGeminiKey()
    return new GoogleGenAI({ apiKey })
}

/**
 * Generate try-on image using Nano Banana Pro
 * 
 * @param params Generation parameters
 * @returns Generated image result
 */
export async function generateWithNanoBanana(
    params: NanoBananaParams
): Promise<NanoBananaResult> {
    // ═══════════════════════════════════════════════════════════════════════════
    // EXPERIMENT TOGGLE: Check if GPT Image is enabled
    // If enabled, route to GPT Image API instead of Gemini
    // ═══════════════════════════════════════════════════════════════════════════
    logModelSelection()

    if (isGPTImageEnabled()) {
        console.log('🧪 EXPERIMENT MODE: Routing to GPT Image API')
        console.log('   To disable: Set IMAGE_GENERATION_MODEL=gemini in .env.local')
        return generateWithGPTImageAPI(params)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DEFAULT: Gemini (Nano Banana Pro) - Production pipeline
    // ═══════════════════════════════════════════════════════════════════════════
    const {
        personImageBase64,
        garmentImageBase64,
        prompt,
        qualityTier = 'low',
        isRetry = false,
        strictPromptValidation = false
    } = params

    const config = QUALITY_CONFIG[qualityTier]
    const client = getNanoBananaClient()
    const startTime = Date.now()

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║  STAGE 3: NANO BANANA PRO — IMAGE GENERATION                                  ║')
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣')
    console.log(`║  Model: ${config.model.padEnd(67)}║`)
    console.log(`║  Quality Tier: ${qualityTier.toUpperCase().padEnd(60)}║`)
    console.log(`║  Temperature: ${config.temperature.toFixed(2).padEnd(61)}║`)
    console.log(`║  Can Retry: ${config.canRetry ? 'YES' : 'NO'.padEnd(63)}║`)
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n')

    // Clean forbidden terms from prompt
    const { cleaned: cleanedPrompt, wasModified, termsRemoved } = cleanPromptForNanoBanana(prompt)

    if (strictPromptValidation && wasModified) {
        throw new Error(`FINAL_PROMPT_BLOCKED_FORBIDDEN_TERMS: ${termsRemoved.join(', ')}`)
    }

    if (wasModified) {
        console.log('⚠️ PROMPT CLEANING: Removed forbidden terms:')
        for (const term of termsRemoved) {
            console.log(`   ❌ "${term}"`)
        }
    }

    // IDENTITY-CRITICAL — DO NOT MODIFY
    // identity-safe final render must use the pre-sanitized prompt as-is.
    // No additional face/body authority text is allowed in strict mode.
    const enforcementPrompt = strictPromptValidation
        ? cleanedPrompt
        : buildEnforcementPrompt(cleanedPrompt, isRetry)

    if (isRetry) {
        console.log('🔄 RETRY MODE: Appending retry notice to prompt')
    }

    // Format images - strip data URI prefix
    const formatBase64 = (b64: string) =>
        b64.startsWith('data:image/')
            ? b64.split(',')[1] || b64
            : b64

    const personImage = formatBase64(personImageBase64)
    const garmentImage = formatBase64(garmentImageBase64)

    try {
        // Use the models API to generate content
        const response = await client.models.generateContent({
            model: config.model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: enforcementPrompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: personImage
                            }
                        },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: garmentImage
                            }
                        }
                    ]
                }
            ],
            config: {
                temperature: config.temperature,
                maxOutputTokens: config.maxTokens,
                responseModalities: ['image', 'text']
            }
        })

        const generationTimeMs = Date.now() - startTime

        // Extract image from response
        let imageBase64 = ''
        let warning: string | undefined

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0]
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if ('inlineData' in part && part.inlineData?.data) {
                        imageBase64 = part.inlineData.data
                        break
                    }
                }
            }
        }

        if (!imageBase64) {
            throw new Error('No image generated from Nano Banana Pro')
        }

        console.log(`\n✓ Image generated in ${(generationTimeMs / 1000).toFixed(1)}s`)
        console.log('⚠️ Note: Verify identity fidelity from IMAGE 1 anchor in final output')

        return {
            image: imageBase64,
            generationTimeMs,
            qualityTier,
            promptCleaned: wasModified,
            warning
        }
    } catch (error) {
        console.error('❌ Nano Banana Pro generation failed:', error)
        throw error
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log Nano Banana generation status
 */
export function logNanoBananaStatus(
    sessionId: string,
    result: NanoBananaResult
): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  NANO BANANA PRO — GENERATION COMPLETE                                        ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Status: ✅ IMAGE GENERATED`.padEnd(80) + '║')
    console.log(`║  Time: ${(result.generationTimeMs / 1000).toFixed(1)}s`.padEnd(80) + '║')
    console.log(`║  Quality Tier: ${result.qualityTier.toUpperCase()}`.padEnd(80) + '║')
    console.log(`║  Prompt Cleaned: ${result.promptCleaned ? 'YES' : 'NO'}`.padEnd(80) + '║')
    if (result.warning) {
        console.log(`║  ⚠️ Warning: ${result.warning.slice(0, 60)}`.padEnd(80) + '║')
    }
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  🔒 NANO BANANA OUTPUT IS UNTRUSTED                                           ║`)
    console.log(`║  → Identity authority is IMAGE 1 input anchor                                ║`)
    console.log(`║  → Body pose/composition are allowed to adapt naturally to scene intent      ║`)
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
