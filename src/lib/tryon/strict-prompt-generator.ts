/**
 * STRICT PROMPT GENERATOR (Stage 2)
 * 
 * Uses GPT-4o-mini to generate forensic, preservation-focused prompts
 * for ChatGPT Image 1.5 generation.
 * 
 * CORE PRINCIPLE: Treat as image compositing, NOT artistic generation.
 * - Explicitly forbid: face change, body change, pose change, beautification
 * - Emphasize preservation over creativity
 */

import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface GeneratedPrompt {
    prompt: string
    garmentDescription: string
    preservationRules: string[]
    forbiddenOperations: string[]
}

/**
 * Generate a strict, forensic prompt for try-on generation
 * 
 * The prompt is designed to:
 * 1. Describe the garment extraction (not the person)
 * 2. Enforce strict preservation of identity and body
 * 3. Treat the task as compositing, not generation
 * 
 * @param params Generation parameters
 * @returns Structured prompt with preservation rules
 */
export async function generateStrictTryOnPrompt(params: {
    personImageBase64: string
    garmentImageBase64: string
    sceneDescription?: string
}): Promise<GeneratedPrompt> {
    const { personImageBase64, garmentImageBase64, sceneDescription } = params
    const openai = getGeminiChat()

    // Format image URLs
    const formatImageUrl = (base64: string) =>
        base64.startsWith('data:image/')
            ? base64
            : `data:image/jpeg;base64,${base64}`

    try {
        console.log('📝 STAGE 2: Strict Prompt Generation...')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a forensic prompt engineer for virtual try-on.
Your job is to write a STRICT, PRESERVATION-FOCUSED prompt for image generation.

CRITICAL PHILOSOPHY:
- This is IMAGE COMPOSITING, not artistic generation
- The person's identity is SACRED and IMMUTABLE
- We are DRESSING the person, not RECREATING them
- Garment goes ON the body, body does NOT change

YOUR TASK:
1. Analyze the GARMENT image (Image 2) - extract ONLY clothing details
2. IGNORE any person/face in the garment image completely
3. Write a prompt that emphasizes PRESERVATION over CREATIVITY

PROMPT STRUCTURE (MANDATORY):
1. Task statement: "Composite the garment onto this person"
2. Garment description: Detailed clothing attributes
3. Preservation mandate: What MUST remain unchanged
4. Forbidden operations: What MUST NOT happen

Return a JSON object:
{
  "garmentDescription": "Detailed description of the garment ONLY",
  "preservationRules": [
    "List of things that MUST remain unchanged"
  ],
  "forbiddenOperations": [
    "List of things that MUST NOT happen"
  ],
  "prompt": "The complete generation prompt"
}

EXAMPLE PROMPT OUTPUT:
"IMAGE COMPOSITING TASK: Dress this exact person in the garment.

GARMENT TO APPLY:
Navy blue crew-neck cotton t-shirt with short sleeves, relaxed fit, visible ribbed collar, subtle chest pocket.

MANDATORY PRESERVATION (PIXEL-LEVEL):
• Face: Copy exactly from input - same features, same expression, same skin
• Body: Preserve exact proportions - no slimming, no reshaping
• Pose: Keep identical stance and arm positions
• Background: Maintain original environment

FORBIDDEN OPERATIONS:
• Do NOT regenerate the face
• Do NOT beautify or enhance features
• Do NOT modify body shape or proportions
• Do NOT change pose
• Do NOT add artistic interpretation

OUTPUT: The same person wearing the new garment. Face must be identical."`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Generate a strict try-on prompt.
Image 1 = Person (identity source - PRESERVE EXACTLY)
Image 2 = Garment (extract clothing details ONLY, ignore any person in this image)
${sceneDescription ? `Scene: ${sceneDescription}` : 'Background: Keep original'}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: formatImageUrl(personImageBase64),
                                detail: 'high'
                            }
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: formatImageUrl(garmentImageBase64),
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1500,
            temperature: 0.2
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from prompt generator')
        }

        const result = JSON.parse(content) as GeneratedPrompt

        // Log the generated prompt
        console.log(`   ✓ Garment analysis: ${result.garmentDescription.slice(0, 80)}...`)
        console.log(`   ✓ Preservation rules: ${result.preservationRules.length}`)
        console.log(`   ✓ Forbidden operations: ${result.forbiddenOperations.length}`)
        console.log(`   ✓ Prompt length: ${result.prompt.length} chars`)

        return result
    } catch (error) {
        console.error('❌ Prompt generation failed:', error)

        // Return a fallback strict prompt
        return {
            garmentDescription: 'Garment from reference image',
            preservationRules: [
                'Face must remain identical to input',
                'Body proportions must not change',
                'Pose must be preserved exactly',
                'Background should match input'
            ],
            forbiddenOperations: [
                'Do not regenerate face',
                'Do not beautify features',
                'Do not reshape body',
                'Do not change pose',
                'Do not add artistic effects'
            ],
            prompt: `VIRTUAL TRY-ON - IMAGE COMPOSITING TASK

Dress this exact person in the garment shown in Image 2.

MANDATORY PRESERVATION:
• Face: Copy pixel-for-pixel from Image 1
• Body: Maintain exact proportions from Image 1
• Pose: Keep identical to Image 1
• Background: Preserve from Image 1

GARMENT APPLICATION:
• Extract garment from Image 2
• Apply to body in Image 1
• Natural fabric draping and fit

FORBIDDEN:
• Do NOT generate a new face
• Do NOT beautify or enhance
• Do NOT reshape body
• Do NOT change pose
• Do NOT add artistic interpretation

OUTPUT: Same person, different clothing only.`
        }
    }
}

/**
 * Build the final prompt with all constraints for ChatGPT Image 1.5
 * Uses JSON format for stricter constraint enforcement
 */
export function buildFinalGenerationPrompt(
    generatedPrompt: GeneratedPrompt,
    additionalContext?: string
): string {
    const prompt = {
        // CRITICAL PRIORITY - THIS IS THE MOST IMPORTANT RULE
        CRITICAL_PRIORITY: {
            rule: "FACE MUST BE EXACTLY THE SAME AS INPUT IMAGE",
            explanation: "The person in the output MUST be recognizable as the EXACT same person from Image 1. NOT similar. NOT a lookalike. THE SAME PERSON.",
            warning: "If friend looks at output and says 'that doesn't look like you', YOU HAVE FAILED.",
            enforcement: "Face will be pixel-overwritten after generation. Your face output is TEMPORARY and will be DISCARDED."
        },

        task: {
            type: "VIRTUAL_TRY_ON",
            mode: "IDENTITY_LOCKED_COMPOSITING",
            model: "ChatGPT_Image_1.5",
            face_change: "ABSOLUTELY_FORBIDDEN"
        },

        instruction: generatedPrompt.prompt,

        face_rules: {
            priority: "HIGHEST - ABOVE ALL OTHER RULES",
            status: "IMMUTABLE - READ ONLY - DO NOT MODIFY",
            reconstruction_allowed: false,
            message: "THE FACE IS NOT CHANGEABLE. THE FACE IS NOT RECONSTRUCTIBLE. THE FACE IS READ-ONLY.",

            same_person_guarantee: {
                required: true,
                description: "This is the SAME PERSON as Image 1. NOT a model. NOT a lookalike. NOT a similar person. The EXACT SAME INDIVIDUAL.",
                verification: "If you cannot tell it is the same person, you have FAILED."
            },

            forbidden_operations: [
                "Reconstructing any facial geometry",
                "Generating new facial features",
                "Rounding jawlines",
                "Softening angular faces",
                "Making faces fuller or rounder",
                "Slimming or reshaping cheeks",
                "Modifying chin shape or projection",
                "Changing forehead shape or hairline",
                "Altering skull proportions",
                "Beautifying or enhancing skin",
                "Correcting facial asymmetries"
            ],

            jawline_rule: {
                sharp_input: "SHARP_OUTPUT",
                angular_input: "ANGULAR_OUTPUT",
                defined_cheekbones: "DEFINED_CHEEKBONES",
                rounding: "FORBIDDEN",
                softening: "FORBIDDEN",
                improvement: "FORBIDDEN"
            },

            pixel_copy_notice: "The face region will be REPLACED by pixel copy. Your generated face will be DISCARDED. Generate a placeholder only."
        },

        body_rules: {
            status: "IMMUTABLE",
            same_body_rule: {
                enabled: true,
                description: "This is the SAME BODY as Image 1. Same weight, same proportions, same shape."
            },

            proportions: {
                shoulder_width: "PRESERVE_EXACTLY",
                torso_shape: "PRESERVE_EXACTLY",
                hip_width: "PRESERVE_EXACTLY",
                arm_length: "PRESERVE_EXACTLY",
                body_type: "PRESERVE_EXACTLY",
                weight: "PRESERVE_EXACTLY"
            },

            forbidden_operations: [
                "slimming_body",
                "widening_body",
                "reshaping_torso",
                "altering_proportions",
                "changing_posture",
                "beautifying_figure",
                "model_like_transformation"
            ],

            body_check: {
                if_body_looks_slimmer: "WRONG",
                if_body_looks_fuller: "WRONG",
                if_proportions_changed: "WRONG",
                if_posture_improved: "WRONG",
                if_looks_like_model: "WRONG"
            }
        },

        garment_fit: {
            rule: "GARMENT_ADAPTS_TO_BODY",
            body_adapts_to_garment: false,

            expectations: {
                tight_garment: "Shows actual body curves underneath",
                loose_garment: "Drapes over actual body shape",
                structured_garment: "Follows actual shoulder and hip lines"
            },

            forbidden_fit: [
                "idealized_fit",
                "flattering_drape",
                "slimming_effect",
                "body_shaping"
            ]
        },

        preservation_rules: generatedPrompt.preservationRules,

        forbidden_operations: generatedPrompt.forbiddenOperations,

        identity_verification: {
            if_face_looks_better: "WRONG",
            if_face_looks_cleaner: "WRONG",
            if_jawline_rounder: "WRONG",
            if_cheeks_fuller: "WRONG",
            if_friend_cannot_recognize: "FAILED"
        },

        body_verification: {
            if_body_looks_slimmer: "WRONG",
            if_body_looks_fuller: "WRONG",
            if_proportions_changed: "WRONG",
            if_garment_fits_too_well: "SUSPICIOUS",
            if_model_like_figure: "FAILED"
        },

        additional_context: additionalContext || null
    }

    return JSON.stringify(prompt, null, 2)
}

/**
 * Log prompt generation status
 */
export function logPromptGeneratorStatus(sessionId: string, prompt: GeneratedPrompt): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  STAGE 2: STRICT PROMPT GENERATION (4o-mini)                                  ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Garment: ${prompt.garmentDescription.slice(0, 63).padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Preservation Rules:`.padEnd(80) + '║')
    for (const rule of prompt.preservationRules.slice(0, 4)) {
        console.log(`║    • ${rule.slice(0, 68)}`.padEnd(80) + '║')
    }
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Forbidden Operations:`.padEnd(80) + '║')
    for (const op of prompt.forbiddenOperations.slice(0, 4)) {
        console.log(`║    • ${op.slice(0, 68)}`.padEnd(80) + '║')
    }
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
