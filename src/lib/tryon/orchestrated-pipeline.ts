/**
 * ORCHESTRATED PIPELINE
 * 
 * Multi-stage pipeline that coordinates GPT and Gemini:
 * 
 * STAGE 0: Human Detection (existing)
 *   - GPT checks if clothing has human
 *   - If yes → extract garment
 * 
 * STAGE 1: Face Analysis (GPT-4o)
 *   - Analyze user's face
 *   - Derive body proportions from face
 *   - Generate custom prompt for THIS person
 * 
 * STAGE 2: Image Generation (Gemini × 3)
 *   - Run Gemini 3 times independently
 *   - Each time with the same identity constraints
 *   - Different lighting/variation per run
 * 
 * This ensures:
 * - Body matches face (GPT decides body from face)
 * - Garment body is stripped (from Stage 0)
 * - 3 high-quality variants with consistency
 */

import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'
import {
    analyzeUserFace,
    type FaceAnalysisResult,
    logFaceAnalysis
} from './gpt-face-analyzer'
import {
    preprocessGarmentImage,
    type PreprocessResult
} from './garment-preprocessor'
import {
    FACE_PIXEL_FREEZE_PROMPT,
    PRO_FACE_FREEZE
} from './face-pixel-freeze'
import {
    BODY_AUTHORITY_TABLE,
    CLOTHING_REFERENCE_BLOCK,
    FACE_BODY_COHERENCE_CHECK
} from './body-authority'
import {
    ANTI_PASTEL_DIVERSITY
} from './scene-construction'
import {
    ANTI_AI_LOOK_PROMPT,
    IPHONE_CAMERA_PROMPT,
    logPhotorealismStatus
} from './photorealism-polish'
import {
    getDiversePreset,
    buildPresetPrompt,
    logPresetSelection,
    type ComprehensivePreset
} from './presets/diverse-presets'
import {
    POSE_PRESERVATION_PROMPT,
    FACE_RELIABILITY_PROMPT,
    logReliabilityStatus
} from './pose-preservation'
import {
    analyzeScene,
    logSceneAnalysis,
    type SceneAnalysisResult
} from './intelligent-scene-analyzer'

// ═══════════════════════════════════════════════════════════════
// PIPELINE RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrchestratedPipelineResult {
    success: boolean
    variants: string[] // 3 base64 images
    faceAnalysis: FaceAnalysisResult
    garmentExtracted: boolean
    processingTime: number
    errors: string[]
}

export interface GenerationVariant {
    id: number
    lightingMode: 'warm' | 'neutral' | 'cool'
    resultBase64: string | null
    error: string | null
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING VARIATIONS FOR 3 RUNS
// ═══════════════════════════════════════════════════════════════

const LIGHTING_VARIATIONS = [
    {
        id: 1,
        mode: 'warm' as const,
        instruction: 'Warm, golden lighting. ~3500K color temperature. Cozy, inviting atmosphere.'
    },
    {
        id: 2,
        mode: 'neutral' as const,
        instruction: 'Neutral daylight. ~5500K color temperature. Natural, balanced lighting.'
    },
    {
        id: 3,
        mode: 'cool' as const,
        instruction: 'Cool, overcast lighting. ~6500K color temperature. Modern, clean atmosphere.'
    }
]

// ═══════════════════════════════════════════════════════════════
// MAIN ORCHESTRATED PIPELINE
// ═══════════════════════════════════════════════════════════════

export async function runOrchestratedPipeline(
    userImageBase64: string,
    garmentImageBase64: string,
    presetId: string,
    sessionId: string
): Promise<OrchestratedPipelineResult> {
    const startTime = Date.now()
    const errors: string[] = []

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`)
    console.log(`║      ORCHESTRATED PIPELINE [${sessionId}]                        `)
    console.log(`╚═══════════════════════════════════════════════════════════════╝`)

    // ═══════════════════════════════════════════════════════════════
    // STAGE 0: Garment Preprocessing (Human Detection + Extraction)
    // ═══════════════════════════════════════════════════════════════

    console.log(`\n───────────────────────────────────────────────────────────────`)
    console.log(`STAGE 0: GARMENT PREPROCESSING`)
    console.log(`───────────────────────────────────────────────────────────────`)

    let processedGarment = garmentImageBase64
    let garmentExtracted = false

    try {
        const preprocessResult = await preprocessGarmentImage(garmentImageBase64, { sessionId })

        if (preprocessResult.wasExtracted && preprocessResult.processedImage) {
            processedGarment = preprocessResult.processedImage
            garmentExtracted = true
            console.log(`   ✅ Garment extracted from human reference`)
        } else {
            processedGarment = preprocessResult.processedImage
            console.log(`   ℹ️ No human detected, using original garment image`)
        }
    } catch (error) {
        console.error(`   ⚠️ Garment preprocessing failed, using original:`, error)
        errors.push('Garment preprocessing failed')
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 1: Face Analysis (GPT-4o)
    // ═══════════════════════════════════════════════════════════════

    console.log(`\n───────────────────────────────────────────────────────────────`)
    console.log(`STAGE 1: FACE ANALYSIS (GPT-4o)`)
    console.log(`───────────────────────────────────────────────────────────────`)

    let faceAnalysis: FaceAnalysisResult

    try {
        faceAnalysis = await analyzeUserFace(userImageBase64, sessionId)
        logFaceAnalysis(faceAnalysis, sessionId)
    } catch (error) {
        console.error(`   ⚠️ Face analysis failed:`, error)
        errors.push('Face analysis failed')
        faceAnalysis = {
            faceShape: 'oval',
            cheekVolume: 'average',
            jawWidth: 'average',
            skinTone: 'medium',
            hasDoubleChin: false,
            neckThickness: 'average',
            expectedBodyBuild: 'average',
            expectedShoulderWidth: 'average',
            expectedArmThickness: 'average',
            customPrompt: ''
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // STAGE 2: Image Generation (Gemini × 3)
    // ═══════════════════════════════════════════════════════════════

    console.log(`\n───────────────────────────────────────────────────────────────`)
    console.log(`STAGE 2: IMAGE GENERATION (3 VARIANTS)`)
    console.log(`───────────────────────────────────────────────────────────────`)

    const variants: string[] = []

    // Run 3 generations with different lighting
    for (const lighting of LIGHTING_VARIATIONS) {
        console.log(`\n   🎨 Generating variant ${lighting.id} (${lighting.mode} lighting)...`)

        try {
            const result = await generateSingleVariant(
                userImageBase64,
                processedGarment,
                faceAnalysis,
                lighting,
                presetId,
                sessionId
            )

            if (result) {
                variants.push(result)
                console.log(`   ✅ Variant ${lighting.id} complete`)
            } else {
                console.log(`   ❌ Variant ${lighting.id} failed`)
                errors.push(`Variant ${lighting.id} generation failed`)
            }
        } catch (error) {
            console.error(`   ❌ Variant ${lighting.id} error:`, error)
            errors.push(`Variant ${lighting.id}: ${error}`)
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPLETE
    // ═══════════════════════════════════════════════════════════════

    const processingTime = Date.now() - startTime

    console.log(`\n───────────────────────────────────────────────────────────────`)
    console.log(`PIPELINE COMPLETE`)
    console.log(`───────────────────────────────────────────────────────────────`)
    console.log(`   ⏱️ Total time: ${processingTime}ms`)
    console.log(`   ✅ Variants generated: ${variants.length}/3`)
    console.log(`   🔧 Garment extracted: ${garmentExtracted ? 'YES' : 'NO'}`)
    if (errors.length > 0) {
        console.log(`   ⚠️ Errors: ${errors.length}`)
    }

    return {
        success: variants.length > 0,
        variants,
        faceAnalysis,
        garmentExtracted,
        processingTime,
        errors
    }
}

// ═══════════════════════════════════════════════════════════════
// SINGLE VARIANT GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateSingleVariant(
    userImageBase64: string,
    garmentImageBase64: string,
    faceAnalysis: FaceAnalysisResult,
    lighting: typeof LIGHTING_VARIATIONS[number],
    presetId: string,
    sessionId: string
): Promise<string | null> {
    const client = new GoogleGenAI({ apiKey: getGeminiKey() })

    // Build the comprehensive prompt
    const prompt = buildVariantPrompt(faceAnalysis, lighting, presetId)

    // Clean base64
    const cleanUser = userImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    const cleanGarment = garmentImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: cleanUser
                            }
                        },
                        { text: '\n[Image 2: GARMENT REFERENCE - Extract fabric/color ONLY, ignore body]\n' },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: cleanGarment
                            }
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.01, // VERY deterministic for identity
                responseModalities: ['IMAGE', 'TEXT'] as any,
                candidateCount: 1
            } as any
        })

        // Extract image from response
        const result = response as any
        if (result?.candidates?.[0]?.content?.parts) {
            for (const part of result.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    return part.inlineData.data
                }
            }
        }

        return null
    } catch (error) {
        console.error(`   Generation error:`, error)
        return null
    }
}

// ═══════════════════════════════════════════════════════════════
// BUILD VARIANT PROMPT
// ═══════════════════════════════════════════════════════════════

function buildVariantPrompt(
    faceAnalysis: FaceAnalysisResult,
    lighting: typeof LIGHTING_VARIATIONS[number],
    presetId: string
): string {
    return `VIRTUAL TRY-ON — IDENTITY PRESERVATION PIPELINE

═══════════════════════════════════════════════════════════════
GPT FACE ANALYSIS RESULT (USE THIS TO DETERMINE BODY)
═══════════════════════════════════════════════════════════════

This person has been analyzed by GPT-4o:
• Face shape: ${faceAnalysis.faceShape}
• Cheek volume: ${faceAnalysis.cheekVolume}
• Jaw width: ${faceAnalysis.jawWidth}
• Skin tone: ${faceAnalysis.skinTone}
• Double chin: ${faceAnalysis.hasDoubleChin ? 'YES' : 'NO'}
• Neck thickness: ${faceAnalysis.neckThickness}

DERIVED BODY REQUIREMENTS (FROM FACE ANALYSIS):
• Body build: ${faceAnalysis.expectedBodyBuild.toUpperCase()}
• Shoulder width: ${faceAnalysis.expectedShoulderWidth}
• Arm thickness: ${faceAnalysis.expectedArmThickness}

★★★ THE BODY MUST MATCH THESE SPECIFICATIONS ★★★

${faceAnalysis.customPrompt}

═══════════════════════════════════════════════════════════════
FACE PIXEL FREEZE
═══════════════════════════════════════════════════════════════

${FACE_PIXEL_FREEZE_PROMPT}

═══════════════════════════════════════════════════════════════
BODY AUTHORITY
═══════════════════════════════════════════════════════════════

${BODY_AUTHORITY_TABLE}

${CLOTHING_REFERENCE_BLOCK}

═══════════════════════════════════════════════════════════════
COHERENCE CHECK
═══════════════════════════════════════════════════════════════

${FACE_BODY_COHERENCE_CHECK}

═══════════════════════════════════════════════════════════════
LIGHTING FOR THIS VARIANT
═══════════════════════════════════════════════════════════════

${lighting.instruction}

═══════════════════════════════════════════════════════════════
ANTI-PASTEL DIVERSITY
═══════════════════════════════════════════════════════════════

${ANTI_PASTEL_DIVERSITY}

═══════════════════════════════════════════════════════════════
PHOTOREALISM — ELIMINATE AI LOOK
═══════════════════════════════════════════════════════════════

${ANTI_AI_LOOK_PROMPT}

${IPHONE_CAMERA_PROMPT}

═══════════════════════════════════════════════════════════════
POSE & EXPRESSION LOCK
═══════════════════════════════════════════════════════════════

${POSE_PRESERVATION_PROMPT}

═══════════════════════════════════════════════════════════════
FACE RELIABILITY — ZERO TOLERANCE
═══════════════════════════════════════════════════════════════

${FACE_RELIABILITY_PROMPT}

═══════════════════════════════════════════════════════════════
EXECUTION ORDER
═══════════════════════════════════════════════════════════════

1. READ face analysis above (GPT determined body type)
2. COPY face pixels from Image 1
3. BUILD body with ${faceAnalysis.expectedBodyBuild} proportions
4. EXTRACT garment fabric/color from Image 2 (IGNORE body in Image 2)
5. ADAPT garment to the ${faceAnalysis.expectedBodyBuild} body
6. ADD photorealistic imperfections (skin texture, lens physics)
7. VERIFY: looks like real photo, NOT AI-generated

SUCCESS:
✓ Face matches Image 1 exactly
✓ Body is ${faceAnalysis.expectedBodyBuild} build (from face analysis)
✓ No pasted-head effect
✓ Garment fits naturally on THIS body
✓ Would pass as real photo on Instagram

GENERATE THE IMAGE NOW.`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logPipelineResult(result: OrchestratedPipelineResult, sessionId: string): void {
    console.log(`\n📊 PIPELINE RESULT [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Success: ${result.success ? 'YES' : 'NO'}`)
    console.log(`   Variants: ${result.variants.length}/3`)
    console.log(`   Garment extracted: ${result.garmentExtracted ? 'YES' : 'NO'}`)
    console.log(`   Time: ${result.processingTime}ms`)
    console.log(`   Errors: ${result.errors.length}`)
}
