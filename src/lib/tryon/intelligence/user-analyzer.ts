/**
 * USER ANALYZER - Anti-Hallucination System
 * 
 * Extracts EXACT structured data from user image before generation.
 * This includes face features, body proportions, pose, and accessories.
 * 
 * RAG Approach: Ground generation in extracted facts.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

// ═══════════════════════════════════════════════════════════════
// USER ANALYSIS TYPES
// ═══════════════════════════════════════════════════════════════

export type FaceShape =
    | 'oval'
    | 'round'
    | 'square'
    | 'heart'
    | 'oblong'
    | 'diamond'
    | 'unknown'

export type BodyType =
    | 'slim'
    | 'average'
    | 'athletic'
    | 'muscular'
    | 'curvy'
    | 'plus_size'
    | 'unknown'

export type PoseType =
    | 'standing_straight'
    | 'standing_casual'
    | 'hands_on_hips'
    | 'arms_crossed'
    | 'arms_raised'
    | 'sitting'
    | 'walking'
    | 'other'

export interface UserAnalysis {
    // Face features (critical for face matching)
    face: {
        shape: FaceShape
        skin_tone_hex: string
        skin_tone_description: string
        eye_shape: string
        nose_type: string
        mouth_shape: string
        facial_hair: string
        face_width: 'narrow' | 'medium' | 'wide'
        distinctive_features: string[]
    }

    // Body estimation (from visible parts)
    body: {
        type: BodyType
        estimated_weight_category: 'underweight' | 'normal' | 'overweight' | 'obese'
        shoulder_width: 'narrow' | 'medium' | 'broad'
        torso_type: 'short' | 'average' | 'long'
        visible_body_parts: string[]
    }

    // Pose information
    pose: {
        type: PoseType
        arm_position: string
        hand_position: string
        hand_visibility: 'both_visible' | 'one_visible' | 'hidden' | 'partial'
        head_tilt: string
        body_angle: string
    }

    // Accessories (must preserve)
    accessories: {
        glasses: boolean
        glasses_type: string
        jewelry: string[]
        watch: boolean
        bag: boolean
        bag_type: string
        phone: boolean
        other: string[]
    }

    // Background
    background: {
        location_type: string
        lighting_direction: 'front' | 'left' | 'right' | 'back' | 'top' | 'ambient'
        lighting_intensity: 'bright' | 'moderate' | 'dim'
        color_temperature: 'warm' | 'neutral' | 'cool'
        key_elements: string[]
    }

    // Current clothing (to remove)
    current_clothing: {
        type: string
        color: string
        description: string
    }

    // Summary for prompt
    face_summary: string
    body_summary: string

    // Confidence
    analysis_confidence: number
}

// ═══════════════════════════════════════════════════════════════
// ANALYZE USER IMAGE
// ═══════════════════════════════════════════════════════════════

export async function analyzeUserImage(userImageBase64: string): Promise<UserAnalysis> {
    console.log('\n👤 USER ANALYZER: Extracting user data...')
    const startTime = Date.now()

    const openai = getGeminiChat()

    // Clean base64 if needed
    const cleanBase64 = userImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a precise image analysis system. Extract EXACT structured data from this user photo.

This data will be used to ensure the generated image has the SAME face, body, pose, and accessories.

Return ONLY valid JSON with this structure:
{
  "face": {
    "shape": "oval" | "round" | "square" | "heart" | "oblong" | "diamond" | "unknown",
    "skin_tone_hex": "#hexcode",
    "skin_tone_description": "light/medium/dark + undertone",
    "eye_shape": "description",
    "nose_type": "description",
    "mouth_shape": "description",
    "facial_hair": "none/stubble/beard/mustache/full_beard",
    "face_width": "narrow" | "medium" | "wide",
    "distinctive_features": ["mole on cheek", "dimples", etc.]
  },
  "body": {
    "type": "slim" | "average" | "athletic" | "muscular" | "curvy" | "plus_size" | "unknown",
    "estimated_weight_category": "underweight" | "normal" | "overweight" | "obese",
    "shoulder_width": "narrow" | "medium" | "broad",
    "torso_type": "short" | "average" | "long",
    "visible_body_parts": ["head", "torso", "arms", "legs", etc.]
  },
  "pose": {
    "type": "standing_straight" | "standing_casual" | "hands_on_hips" | "arms_crossed" | "arms_raised" | "sitting" | "walking" | "other",
    "arm_position": "description of arm position",
    "hand_position": "description of hand position",
    "hand_visibility": "both_visible" | "one_visible" | "hidden" | "partial",
    "head_tilt": "straight" | "tilted_left" | "tilted_right" | "looking_down" | "looking_up",
    "body_angle": "frontal" | "slight_left" | "slight_right" | "profile"
  },
  "accessories": {
    "glasses": true/false,
    "glasses_type": "none" | "regular" | "sunglasses" | "reading",
    "jewelry": ["earrings", "necklace", "bracelet", "rings", etc.],
    "watch": true/false,
    "bag": true/false,
    "bag_type": "none" | "handbag" | "backpack" | "clutch" | "shoulder_bag",
    "phone": true/false,
    "other": ["scarf", "hat", etc.]
  },
  "background": {
    "location_type": "indoor/outdoor + specific type",
    "lighting_direction": "front" | "left" | "right" | "back" | "top" | "ambient",
    "lighting_intensity": "bright" | "moderate" | "dim",
    "color_temperature": "warm" | "neutral" | "cool",
    "key_elements": ["trees", "buildings", "furniture", etc.]
  },
  "current_clothing": {
    "type": "shirt/t-shirt/dress/etc",
    "color": "color description",
    "description": "brief description"
  },
  "face_summary": "One line describing face for matching",
  "body_summary": "One line describing body proportions",
  "analysis_confidence": 0-100
}`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this person\'s image. Extract face features, body type, pose, accessories, and background. Be precise - this data ensures the output matches this exact person. Return JSON only.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${cleanBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content || ''

        const { extractJson } = await import('@/lib/tryon/json-repair')
        const parsed = extractJson<Record<string, any>>(content)

        const analysis: UserAnalysis = {
            face: {
                shape: parsed.face?.shape || 'unknown',
                skin_tone_hex: parsed.face?.skin_tone_hex || '#C68642',
                skin_tone_description: parsed.face?.skin_tone_description || 'medium tone',
                eye_shape: parsed.face?.eye_shape || 'unknown',
                nose_type: parsed.face?.nose_type || 'unknown',
                mouth_shape: parsed.face?.mouth_shape || 'unknown',
                facial_hair: parsed.face?.facial_hair || 'none',
                face_width: parsed.face?.face_width || 'medium',
                distinctive_features: parsed.face?.distinctive_features || []
            },
            body: {
                type: parsed.body?.type || 'unknown',
                estimated_weight_category: parsed.body?.estimated_weight_category || 'normal',
                shoulder_width: parsed.body?.shoulder_width || 'medium',
                torso_type: parsed.body?.torso_type || 'average',
                visible_body_parts: parsed.body?.visible_body_parts || []
            },
            pose: {
                type: parsed.pose?.type || 'standing_casual',
                arm_position: parsed.pose?.arm_position || 'at sides',
                hand_position: parsed.pose?.hand_position || 'relaxed',
                hand_visibility: parsed.pose?.hand_visibility || 'partial',
                head_tilt: parsed.pose?.head_tilt || 'straight',
                body_angle: parsed.pose?.body_angle || 'frontal'
            },
            accessories: {
                glasses: parsed.accessories?.glasses || false,
                glasses_type: parsed.accessories?.glasses_type || 'none',
                jewelry: parsed.accessories?.jewelry || [],
                watch: parsed.accessories?.watch || false,
                bag: parsed.accessories?.bag || false,
                bag_type: parsed.accessories?.bag_type || 'none',
                phone: parsed.accessories?.phone || false,
                other: parsed.accessories?.other || []
            },
            background: {
                location_type: parsed.background?.location_type || 'unknown',
                lighting_direction: parsed.background?.lighting_direction || 'ambient',
                lighting_intensity: parsed.background?.lighting_intensity || 'moderate',
                color_temperature: parsed.background?.color_temperature || 'neutral',
                key_elements: parsed.background?.key_elements || []
            },
            current_clothing: {
                type: parsed.current_clothing?.type || 'unknown',
                color: parsed.current_clothing?.color || 'unknown',
                description: parsed.current_clothing?.description || ''
            },
            face_summary: parsed.face_summary || '',
            body_summary: parsed.body_summary || '',
            analysis_confidence: parsed.analysis_confidence || 50
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

        console.log(`   ✓ Face: ${analysis.face.shape}, ${analysis.face.skin_tone_description}`)
        console.log(`   ✓ Body: ${analysis.body.type}, ${analysis.body.shoulder_width} shoulders`)
        console.log(`   ✓ Pose: ${analysis.pose.type}, arms ${analysis.pose.arm_position}`)
        console.log(`   ✓ Accessories: glasses=${analysis.accessories.glasses}, watch=${analysis.accessories.watch}`)
        console.log(`   ✓ Analysis completed in ${elapsed}s`)

        return analysis

    } catch (error) {
        console.error('User analysis failed:', error)

        // Return safe defaults
        return {
            face: {
                shape: 'unknown',
                skin_tone_hex: '#C68642',
                skin_tone_description: 'medium tone',
                eye_shape: 'unknown',
                nose_type: 'unknown',
                mouth_shape: 'unknown',
                facial_hair: 'none',
                face_width: 'medium',
                distinctive_features: []
            },
            body: {
                type: 'unknown',
                estimated_weight_category: 'normal',
                shoulder_width: 'medium',
                torso_type: 'average',
                visible_body_parts: []
            },
            pose: {
                type: 'standing_casual',
                arm_position: 'at sides',
                hand_position: 'relaxed',
                hand_visibility: 'partial',
                head_tilt: 'straight',
                body_angle: 'frontal'
            },
            accessories: {
                glasses: false,
                glasses_type: 'none',
                jewelry: [],
                watch: false,
                bag: false,
                bag_type: 'none',
                phone: false,
                other: []
            },
            background: {
                location_type: 'unknown',
                lighting_direction: 'ambient',
                lighting_intensity: 'moderate',
                color_temperature: 'neutral',
                key_elements: []
            },
            current_clothing: {
                type: 'unknown',
                color: 'unknown',
                description: ''
            },
            face_summary: 'Analysis failed',
            body_summary: 'Analysis failed',
            analysis_confidence: 0
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE GROUNDED PROMPT FROM USER ANALYSIS
// ═══════════════════════════════════════════════════════════════

export function generateUserGroundedPrompt(analysis: UserAnalysis): string {
    const accessoryList = [
        analysis.accessories.glasses ? `Glasses (${analysis.accessories.glasses_type})` : null,
        analysis.accessories.watch ? 'Watch' : null,
        analysis.accessories.bag ? `Bag (${analysis.accessories.bag_type})` : null,
        analysis.accessories.phone ? 'Phone in hand' : null,
        ...analysis.accessories.jewelry,
        ...analysis.accessories.other
    ].filter(Boolean)

    return `
════════════════════════════════════════════════════════════════════════════════
USER ANALYSIS (GPT-4o EXTRACTED DATA)
════════════════════════════════════════════════════════════════════════════════

FACE SPECIFICATIONS (MUST MATCH EXACTLY):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Face Shape: ${analysis.face.shape.toUpperCase()}
│ Skin Tone: ${analysis.face.skin_tone_description} (${analysis.face.skin_tone_hex})
│ Face Width: ${analysis.face.face_width}
│ Eye Shape: ${analysis.face.eye_shape}
│ Nose Type: ${analysis.face.nose_type}
│ Facial Hair: ${analysis.face.facial_hair}
│ Distinctive Features: ${analysis.face.distinctive_features.join(', ') || 'none'}
│ 
│ SUMMARY: ${analysis.face_summary}
└─────────────────────────────────────────────────────────────────────────────┘

BODY SPECIFICATIONS (MUST PRESERVE):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Body Type: ${analysis.body.type.toUpperCase()}
│ Weight Category: ${analysis.body.estimated_weight_category}
│ Shoulder Width: ${analysis.body.shoulder_width}
│ Torso Type: ${analysis.body.torso_type}
│ 
│ SUMMARY: ${analysis.body_summary}
└─────────────────────────────────────────────────────────────────────────────┘

POSE (COPY EXACTLY):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Type: ${analysis.pose.type}
│ Arms: ${analysis.pose.arm_position}
│ Hands: ${analysis.pose.hand_position} (${analysis.pose.hand_visibility})
│ Head: ${analysis.pose.head_tilt}
│ Body Angle: ${analysis.pose.body_angle}
└─────────────────────────────────────────────────────────────────────────────┘

ACCESSORIES (KEEP ALL):
${accessoryList.length > 0 ? accessoryList.map(a => `• ${a}`).join('\n') : '• None'}

GENERATION RULES:
1. Face shape MUST be: ${analysis.face.shape}
2. Skin tone MUST be: ${analysis.face.skin_tone_hex}
3. Body type MUST be: ${analysis.body.type}
4. Pose MUST be: ${analysis.pose.type}
5. ALL accessories MUST be preserved
6. DO NOT change face features
7. DO NOT change body proportions
8. DO NOT change pose
`.trim()
}
