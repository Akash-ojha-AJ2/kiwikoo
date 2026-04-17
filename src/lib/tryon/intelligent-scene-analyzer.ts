/**
 * INTELLIGENT SCENE ANALYZER
 * 
 * This module analyzes the ENTIRE input image to understand:
 * - Pose (standing, sitting, leaning, walking, etc.)
 * - Environment (indoor, outdoor, urban, nature, etc.)
 * - Lighting conditions (harsh sun, soft window, studio, etc.)
 * - Expression (smiling, serious, candid, etc.)
 * - Accessories (bags, jewelry, glasses, etc.)
 * - Camera angle and framing
 * 
 * Then it generates a CONTEXT-SPECIFIC prompt for image generation,
 * not generic static prompts.
 */

import 'server-only'
import OpenAI from 'openai'

const getOpenAIClient = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
})

// ═══════════════════════════════════════════════════════════════
// SCENE ANALYSIS RESULT
// ═══════════════════════════════════════════════════════════════

export interface SceneAnalysisResult {
    // Pose Analysis
    pose: {
        type: 'standing' | 'sitting' | 'walking' | 'leaning' | 'lying' | 'crouching' | 'other'
        description: string
        armPosition: string
        handPosition: string
        legPosition: string
        headTilt: string
        isNatural: boolean
        weight_distribution: string
    }

    // Environment Analysis
    environment: {
        type: 'outdoor_urban' | 'outdoor_nature' | 'indoor_home' | 'indoor_office' | 'indoor_studio' | 'other'
        description: string
        background_elements: string[]
        depth: 'shallow' | 'medium' | 'deep'
        time_of_day: 'morning' | 'afternoon' | 'evening' | 'night' | 'unknown'
    }

    // Lighting Analysis
    lighting: {
        source: string
        direction: 'front' | 'side' | 'back' | 'overhead' | 'mixed'
        quality: 'harsh' | 'soft' | 'diffused' | 'mixed'
        color_temperature: 'warm' | 'neutral' | 'cool'
        shadows: string
        highlights: string
    }

    // Face & Expression
    face: {
        expression: string
        smile_type: 'big_smile' | 'gentle_smile' | 'neutral' | 'serious' | 'other'
        eye_contact: boolean
        head_angle: string
        hair_style: string
        jawline_description: string
        face_framing: string
    }

    // Accessories
    accessories: {
        items: string[]
        should_keep: string[]
        should_remove: string[]
    }

    // Camera
    camera: {
        framing: 'full_body' | 'three_quarter' | 'waist_up' | 'chest_up' | 'close_up'
        angle: 'eye_level' | 'high_angle' | 'low_angle'
        estimated_focal_length: string
    }

    // Generated Context-Specific Prompt
    contextPrompt: string
}

// ═══════════════════════════════════════════════════════════════
// INTELLIGENT SCENE ANALYSIS PROMPTS
// ═══════════════════════════════════════════════════════════════

const SCENE_ANALYSIS_SYSTEM_PROMPT = `You are an expert visual analyst for a virtual try-on system.

Your job is to analyze the ENTIRE input image and understand:
1. The person's EXACT pose (every detail)
2. The environment/background
3. The lighting conditions
4. Facial expression and features
5. Accessories they're wearing
6. Camera angle and framing

You will then generate a CONTEXT-SPECIFIC prompt that tells the image generation model EXACTLY how to recreate this scene with a new garment.

CRITICAL RULES:
- Be extremely specific about the pose. "Standing" is not enough. Describe EVERY detail.
- Note which hand is doing what
- Note the exact head tilt and expression
- Describe the lighting as if you're a cinematographer
- The goal is to recreate THIS EXACT scene with only the clothing changed

FACE & JAWLINE PROTECTION:
- Pay special attention to the JAWLINE shape
- Note if face is more square, round, oval, pointed
- The jawline MUST be preserved exactly in generation
- Any accessories near the face (earrings, hair) must be noted`

const SCENE_ANALYSIS_USER_PROMPT = `Analyze this image in extreme detail for a virtual try-on scenario.

I need you to capture EVERY aspect of this image so we can recreate it perfectly with only the clothing changed.

Output a JSON object with these sections:

{
  "pose": {
    "type": "standing | sitting | walking | leaning | lying | crouching | other",
    "description": "Detailed description of the full pose",
    "armPosition": "Exact position of both arms",
    "handPosition": "What each hand is doing (e.g., 'right hand touching hair, left hand on hip')",
    "legPosition": "Position of legs/feet",
    "headTilt": "Direction and degree of head tilt",
    "isNatural": true/false,
    "weight_distribution": "Which leg has weight or how they're balanced"
  },
  
  "environment": {
    "type": "outdoor_urban | outdoor_nature | indoor_home | indoor_office | indoor_studio | other",
    "description": "Detailed description of the setting",
    "background_elements": ["list", "of", "visible", "elements"],
    "depth": "shallow | medium | deep",
    "time_of_day": "morning | afternoon | evening | night | unknown"
  },
  
  "lighting": {
    "source": "What is creating the light (sun, window, studio lights, etc.)",
    "direction": "front | side | back | overhead | mixed",
    "quality": "harsh | soft | diffused | mixed",
    "color_temperature": "warm | neutral | cool",
    "shadows": "Description of shadow placement and softness",
    "highlights": "Where are the bright spots on the person"
  },
  
  "face": {
    "expression": "Detailed description of facial expression",
    "smile_type": "big_smile | gentle_smile | neutral | serious | other",
    "eye_contact": true/false,
    "head_angle": "Which direction they're looking and head tilt",
    "hair_style": "Description of hair and how it frames the face",
    "jawline_description": "CRITICAL: Exact shape of jawline - square, round, pointed, etc.",
    "face_framing": "What's around the face (hair, earrings, collar, etc.)"
  },
  
  "accessories": {
    "items": ["list", "of", "all", "accessories"],
    "should_keep": ["items to keep in try-on (jewelry, bags, glasses)"],
    "should_remove": ["items that will conflict with new garment"]
  },
  
  "camera": {
    "framing": "full_body | three_quarter | waist_up | chest_up | close_up",
    "angle": "eye_level | high_angle | low_angle",
    "estimated_focal_length": "e.g., '50mm portrait lens', '35mm wide'"
  }
}

Be EXTREMELY detailed. This analysis will directly determine the quality of the output.`

// ═══════════════════════════════════════════════════════════════
// CONTEXT-SPECIFIC PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

const CONTEXT_PROMPT_SYSTEM = `You are writing a SPECIFIC prompt for an image generation model.

You have been provided with detailed scene analysis of an input image.
Your job is to write a prompt that will:
1. Recreate the EXACT same pose
2. Recreate the EXACT same environment/lighting
3. Keep the face PIXEL-IDENTICAL
4. Change ONLY the clothing

The prompt must be so specific that the output looks like the same photo session, just with different clothes.

KEY PRINCIPLES:
1. POSE: Describe the exact body position, hand placement, weight distribution
2. FACE: Emphasize PIXEL COPY. The face is NOT to be regenerated. It must be copied.
3. JAWLINE: Explicitly protect the jawline shape. This often drifts.
4. EXPRESSION: Keep the exact smile/expression
5. ENVIRONMENT: Keep the same background feel
6. LIGHTING: Apply the same lighting physics
7. ACCESSORIES: Keep specified accessories

Write the prompt in imperative style (do this, not this, etc.)`

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function analyzeScene(
    userImageBase64: string,
    sessionId: string
): Promise<SceneAnalysisResult> {
    const client = getOpenAIClient()

    console.log(`\n🎬 INTELLIGENT SCENE ANALYSIS [${sessionId}]`)
    console.log(`   Analyzing entire image context...`)

    const startTime = Date.now()

    try {
        // Clean base64
        const cleanBase64 = userImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

        // Step 1: Analyze the scene
        const analysisResponse = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: SCENE_ANALYSIS_SYSTEM_PROMPT
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
                            text: SCENE_ANALYSIS_USER_PROMPT
                        }
                    ]
                }
            ],
            max_tokens: 2000,
            temperature: 0.1
        })

        const analysisContent = analysisResponse.choices[0]?.message?.content || '{}'

        // Extract JSON
        const jsonMatch = analysisContent.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.log(`   ⚠️ Could not parse scene analysis`)
            return getDefaultSceneAnalysis()
        }

        const analysis = JSON.parse(jsonMatch[0])

        const elapsed = Date.now() - startTime
        console.log(`   ✅ Scene analysis complete in ${elapsed}ms`)
        console.log(`   🎭 Pose: ${analysis.pose?.type} - ${analysis.pose?.description?.substring(0, 50)}...`)
        console.log(`   🌍 Environment: ${analysis.environment?.type}`)
        console.log(`   💡 Lighting: ${analysis.lighting?.direction} ${analysis.lighting?.quality}`)
        console.log(`   😊 Expression: ${analysis.face?.smile_type}`)
        console.log(`   📐 Jawline: ${analysis.face?.jawline_description}`)

        // Step 2: Generate context-specific prompt
        const contextPrompt = await generateContextPrompt(analysis, sessionId)

        return {
            ...analysis,
            contextPrompt
        }
    } catch (error) {
        console.error(`   ❌ Scene analysis failed:`, error)
        return getDefaultSceneAnalysis()
    }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE CONTEXT-SPECIFIC PROMPT
// ═══════════════════════════════════════════════════════════════

async function generateContextPrompt(
    analysis: Partial<SceneAnalysisResult>,
    sessionId: string
): Promise<string> {
    const client = getOpenAIClient()

    console.log(`   📝 Generating context-specific prompt...`)

    const promptRequest = `Based on this scene analysis, write a SPECIFIC prompt for virtual try-on.

SCENE ANALYSIS:
${JSON.stringify(analysis, null, 2)}

Write a prompt that:
1. Instructs to maintain the EXACT pose: ${analysis.pose?.description}
2. Instructs to FREEZE the face - pixel copy, no regeneration
3. EXPLICITLY PROTECTS THE JAWLINE: ${analysis.face?.jawline_description}
4. Keeps the expression: ${analysis.face?.expression}
5. Maintains environment feel: ${analysis.environment?.description}
6. Applies same lighting: ${analysis.lighting?.source}, ${analysis.lighting?.direction}
7. Keeps accessories: ${analysis.accessories?.should_keep?.join(', ')}

The prompt should be direct imperative instructions.
Start with "VIRTUAL TRY-ON - CONTEXT-SPECIFIC GENERATION"

Include a JAWLINE PROTECTION section that explicitly describes the jawline shape and forbids any changes.

Keep it under 800 words but be extremely specific.`

    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: CONTEXT_PROMPT_SYSTEM
                },
                {
                    role: 'user',
                    content: promptRequest
                }
            ],
            max_tokens: 1200,
            temperature: 0.2
        })

        const contextPrompt = response.choices[0]?.message?.content || ''
        console.log(`   ✅ Context prompt generated (${contextPrompt.length} chars)`)

        return contextPrompt
    } catch (error) {
        console.error(`   ❌ Context prompt generation failed:`, error)
        return getDefaultContextPrompt(analysis)
    }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

function getDefaultSceneAnalysis(): SceneAnalysisResult {
    return {
        pose: {
            type: 'standing',
            description: 'Standing naturally',
            armPosition: 'Relaxed at sides',
            handPosition: 'Natural hand position',
            legPosition: 'Standing on both feet',
            headTilt: 'Facing forward',
            isNatural: true,
            weight_distribution: 'Even'
        },
        environment: {
            type: 'outdoor_urban',
            description: 'Urban outdoor setting',
            background_elements: ['buildings', 'trees'],
            depth: 'medium',
            time_of_day: 'afternoon'
        },
        lighting: {
            source: 'Natural daylight',
            direction: 'front',
            quality: 'soft',
            color_temperature: 'neutral',
            shadows: 'Soft shadows',
            highlights: 'Natural highlights'
        },
        face: {
            expression: 'Natural expression',
            smile_type: 'gentle_smile',
            eye_contact: true,
            head_angle: 'Facing camera',
            hair_style: 'Natural hair',
            jawline_description: 'Natural jawline shape',
            face_framing: 'Hair framing face'
        },
        accessories: {
            items: [],
            should_keep: [],
            should_remove: []
        },
        camera: {
            framing: 'three_quarter',
            angle: 'eye_level',
            estimated_focal_length: '50mm'
        },
        contextPrompt: getDefaultContextPrompt({})
    }
}

function getDefaultContextPrompt(analysis: Partial<SceneAnalysisResult>): string {
    return `VIRTUAL TRY-ON - CONTEXT-SPECIFIC GENERATION

POSE PRESERVATION:
Maintain the exact pose from the input image. Keep all body positions, arm placements, and posture.

FACE FREEZE (CRITICAL):
The face must be PIXEL-COPIED from the input image.
DO NOT regenerate the face.
DO NOT beautify the face.
DO NOT change any facial features.

JAWLINE PROTECTION (CRITICAL):
The jawline shape MUST remain EXACTLY as in the input image.
DO NOT slim the jaw.
DO NOT widen the jaw.
DO NOT smooth the jawline.
The exact contour must be preserved.

EXPRESSION:
Keep the same expression from the input image.

LIGHTING:
Match the lighting conditions from the input image.

GENERATE THE IMAGE NOW.`
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logSceneAnalysis(result: SceneAnalysisResult, sessionId: string): void {
    console.log(`\n🎬 SCENE ANALYSIS SUMMARY [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📍 Pose: ${result.pose.type}`)
    console.log(`   🌍 Environment: ${result.environment.type}`)
    console.log(`   💡 Lighting: ${result.lighting.direction} ${result.lighting.quality}`)
    console.log(`   😊 Expression: ${result.face.smile_type}`)
    console.log(`   📐 Jawline: ${result.face.jawline_description}`)
    console.log(`   📸 Camera: ${result.camera.framing}, ${result.camera.angle}`)
    console.log(`   👜 Accessories to keep: ${result.accessories.should_keep.join(', ') || 'none'}`)
}
