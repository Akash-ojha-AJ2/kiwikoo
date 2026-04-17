/**
 * GPT FACE ANALYZER
 * 
 * This module uses GPT-4o Vision to analyze a person's face and
 * generate a CUSTOM prompt tailored to that specific person.
 * 
 * FLOW:
 * 1. GPT-4o sees the user's face
 * 2. GPT-4o analyzes: face shape, fat level, skin tone
 * 3. GPT-4o derives expected body proportions
 * 4. GPT-4o writes a custom prompt for Gemini
 * 
 * This ensures the prompt is SPECIFIC to this person,
 * not a generic "preserve identity" instruction.
 */

import 'server-only'
import OpenAI from 'openai'

const getOpenAIClient = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
})

// ═══════════════════════════════════════════════════════════════
// FACE ANALYSIS RESULT TYPE
// ═══════════════════════════════════════════════════════════════

export interface FaceAnalysisResult {
    // Face characteristics
    faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'full'
    cheekVolume: 'hollow' | 'average' | 'full' | 'very_full'
    jawWidth: 'narrow' | 'average' | 'wide' | 'very_wide'
    skinTone: string
    hasDoubleChin: boolean
    neckThickness: 'thin' | 'average' | 'thick'

    // Derived body expectations
    expectedBodyBuild: 'slim' | 'average' | 'full' | 'plus_size'
    expectedShoulderWidth: 'narrow' | 'average' | 'broad'
    expectedArmThickness: 'thin' | 'average' | 'thick'

    // Generated prompt
    customPrompt: string
}

// ═══════════════════════════════════════════════════════════════
// BODY-AWARE ANALYSIS PROMPT FOR GPT-4O
// ═══════════════════════════════════════════════════════════════

const BODY_AWARE_SYSTEM_PROMPT = `You are an expert body and face analyst for a virtual try-on system.

Your FIRST task is to determine: IS THE BODY VISIBLE in this image?

BODY VISIBILITY CHECK:
- If you can see shoulders, torso, arms, or any body parts → BODY IS VISIBLE
- If the image is only a close-up face/head shot → BODY IS NOT VISIBLE

YOUR CRITICAL RULE:
★ If body IS visible → Analyze the ACTUAL BODY you see. Do NOT derive from face.
★ If body is NOT visible → Derive body type from face characteristics.

This is CRITICAL. If you see a slim body, report it as slim. Do NOT make slim bodies fat.
If you see a plus-size body, report it as plus-size. Do NOT make fat bodies slim.

ACCURACY IS MORE IMPORTANT THAN FLATTERY.
The output will directly determine how the generated image looks.
If you report wrong body type, the person will look completely different.`

const BODY_AWARE_USER_PROMPT = `Analyze this image carefully.

STEP 1: BODY VISIBILITY CHECK
Look at the image. Can you see ANY of the following?
- Shoulders
- Torso/chest area
- Arms
- Waist area
- Any body parts beyond just head/neck

Answer: Is body visible? (yes/no)

STEP 2: ANALYZE BASED ON VISIBILITY
IF body IS visible (you can see shoulders, arms, torso):
  → Describe the ACTUAL body you see
  → Do NOT derive from face, use what you SEE
  → Be accurate: slim, average, full, or plus_size?

IF body is NOT visible (close-up face only):
  → Derive expected body from face characteristics
  → Full face usually means fuller body
  → Slim face usually means slimmer body

STEP 3: Output JSON
{
  "bodyVisible": true | false,
  "imageType": "full_body" | "half_body" | "upper_body" | "close_up_face",
  
  "faceShape": "oval" | "round" | "square" | "heart" | "oblong" | "full",
  "cheekVolume": "hollow" | "average" | "full" | "very_full",
  "jawWidth": "narrow" | "average" | "wide" | "very_wide",
  "skinTone": "description",
  "hasDoubleChin": true | false,
  "neckThickness": "thin" | "average" | "thick",
  
  "bodySource": "observed" | "derived_from_face",
  "observedBodyBuild": "slim" | "average" | "full" | "plus_size",
  "observedShoulderWidth": "narrow" | "average" | "broad",
  "observedArmThickness": "thin" | "average" | "thick",
  "observedWaist": "slim" | "average" | "wide",
  
  "finalBodyBuild": "slim" | "average" | "full" | "plus_size",
  "finalShoulderWidth": "narrow" | "average" | "broad",
  "finalArmThickness": "thin" | "average" | "thick"
}

IMPORTANT:
- If bodyVisible is true, use the OBSERVED body for final values
- If bodyVisible is false, derive from face characteristics
- Be ACCURATE. If you see a slim person, say slim. If you see plus-size, say plus-size.`

// ═══════════════════════════════════════════════════════════════
// CUSTOM PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

const PROMPT_GENERATION_SYSTEM = `You are writing a prompt for an image generation model (Gemini) that will create a virtual try-on image.

You will receive:
1. Face analysis of the person
2. Garment description
3. Scene/preset information

Your job is to write a SPECIFIC prompt that:
1. Describes THIS person's face exactly
2. Describes THIS person's expected body (derived from face)
3. Tells the model exactly how to preserve identity
4. Blocks the model from using the garment reference's body

The prompt must be detailed and specific to this person.
Generic instructions like "preserve identity" do NOT work.
You must describe WHAT to preserve.`

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function analyzeUserFace(
    userImageBase64: string,
    sessionId: string
): Promise<FaceAnalysisResult> {
    const client = getOpenAIClient()

    console.log(`\n🔍 GPT BODY-AWARE ANALYSIS [${sessionId}]`)
    console.log(`   Step 1: Checking if body is visible in image...`)

    const startTime = Date.now()

    try {
        // Clean base64
        const cleanBase64 = userImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: BODY_AWARE_SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${cleanBase64}`,
                                detail: 'high'
                            }
                        },
                        {
                            type: 'text',
                            text: BODY_AWARE_USER_PROMPT
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.1 // Low temperature for accuracy
        })

        const content = response.choices[0]?.message?.content || '{}'

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.log(`   ⚠️ Could not parse analysis, using defaults`)
            return getDefaultAnalysis()
        }

        const analysis = JSON.parse(jsonMatch[0])

        const elapsed = Date.now() - startTime
        console.log(`   ✅ Analysis complete in ${elapsed}ms`)
        console.log(`   📊 Body visible: ${analysis.bodyVisible ? 'YES' : 'NO'}`)
        console.log(`   📊 Image type: ${analysis.imageType}`)
        console.log(`   📊 Body source: ${analysis.bodySource}`)

        if (analysis.bodyVisible) {
            console.log(`   📊 OBSERVED body build: ${analysis.observedBodyBuild}`)
            console.log(`   📊 FINAL body build: ${analysis.finalBodyBuild}`)
        } else {
            console.log(`   📊 DERIVED body build: ${analysis.finalBodyBuild}`)
        }

        // Generate custom prompt with correct body info
        const customPrompt = await generateCustomPrompt({
            ...analysis,
            expectedBodyBuild: analysis.finalBodyBuild,
            expectedShoulderWidth: analysis.finalShoulderWidth,
            expectedArmThickness: analysis.finalArmThickness,
            bodyWasObserved: analysis.bodyVisible
        }, sessionId)

        return {
            faceShape: analysis.faceShape,
            cheekVolume: analysis.cheekVolume,
            jawWidth: analysis.jawWidth,
            skinTone: analysis.skinTone,
            hasDoubleChin: analysis.hasDoubleChin,
            neckThickness: analysis.neckThickness,
            expectedBodyBuild: analysis.finalBodyBuild,
            expectedShoulderWidth: analysis.finalShoulderWidth,
            expectedArmThickness: analysis.finalArmThickness,
            customPrompt
        }
    } catch (error) {
        console.error(`   ❌ Analysis failed:`, error)
        return getDefaultAnalysis()
    }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE CUSTOM PROMPT FOR THIS SPECIFIC PERSON
// ═══════════════════════════════════════════════════════════════

async function generateCustomPrompt(
    analysis: Partial<FaceAnalysisResult>,
    sessionId: string
): Promise<string> {
    const client = getOpenAIClient()

    console.log(`   📝 Generating custom prompt for this person...`)

    const promptRequest = `Based on this face analysis, write a detailed prompt for the image generation model.

FACE ANALYSIS:
- Face shape: ${analysis.faceShape}
- Cheek volume: ${analysis.cheekVolume}
- Jaw width: ${analysis.jawWidth}
- Skin tone: ${analysis.skinTone}
- Has double chin: ${analysis.hasDoubleChin}
- Neck thickness: ${analysis.neckThickness}
- Expected body build: ${analysis.expectedBodyBuild}
- Expected shoulders: ${analysis.expectedShoulderWidth}
- Expected arm thickness: ${analysis.expectedArmThickness}

Write a prompt that:
1. Describes this specific face (not generic "preserve identity")
2. Describes the expected body proportions
3. Tells the model to COPY the face, not regenerate it
4. Tells the model to IGNORE any body in the clothing reference
5. Includes specific measurements/ratios if possible

The prompt should be direct instructions, not conversation.
Start with "Generate an image of..."

Keep it under 500 words but be specific.`

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPT_GENERATION_SYSTEM
                },
                {
                    role: 'user',
                    content: promptRequest
                }
            ],
            max_tokens: 800,
            temperature: 0.3
        })

        const customPrompt = response.choices[0]?.message?.content || ''
        console.log(`   ✅ Custom prompt generated (${customPrompt.length} chars)`)

        return customPrompt
    } catch (error) {
        console.error(`   ❌ Custom prompt generation failed:`, error)
        return getDefaultPrompt(analysis)
    }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

function getDefaultAnalysis(): FaceAnalysisResult {
    return {
        faceShape: 'oval',
        cheekVolume: 'average',
        jawWidth: 'average',
        skinTone: 'medium',
        hasDoubleChin: false,
        neckThickness: 'average',
        expectedBodyBuild: 'average',
        expectedShoulderWidth: 'average',
        expectedArmThickness: 'average',
        customPrompt: getDefaultPrompt({})
    }
}

function getDefaultPrompt(analysis: Partial<FaceAnalysisResult>): string {
    return `Generate an image of this exact person wearing the new garment.

FACE: Copy the face exactly from the input image. Do NOT regenerate or beautify.
BODY: The body must match the face proportions. ${analysis.expectedBodyBuild || 'Average'} build.
GARMENT: Take only the fabric, color, and pattern from the garment reference. IGNORE any body in the garment image.

The face and body must look like they belong to the same person.
Do NOT create a "pasted head" effect.`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logFaceAnalysis(result: FaceAnalysisResult, sessionId: string): void {
    console.log(`\n📊 FACE ANALYSIS RESULT [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Face: ${result.faceShape}, cheeks ${result.cheekVolume}`)
    console.log(`   Derived body: ${result.expectedBodyBuild}`)
    console.log(`   Shoulders: ${result.expectedShoulderWidth}`)
    console.log(`   Arms: ${result.expectedArmThickness}`)
    console.log(`   Custom prompt: ${result.customPrompt.length} chars`)
}
