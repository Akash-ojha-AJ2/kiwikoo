import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface SceneIntelligenceInput {
    selectedPreset: string
    inputPose: 'standing' | 'sitting' | 'leaning'
    inputFraming: 'close' | 'mid' | 'full'
    garmentType: string
    environmentRiskFlags: string[]
}

export interface SceneIntelligenceOutput {
    preset: string
    scenarioVariant: string
    anchorZone: string
    cameraPolicy: {
        mode: 'inherit'
        allowAdjustment: boolean
    }
    lightingPolicy: {
        facePriority: boolean
        environmentAdapt: boolean
    }
    eyeSafety: 'strict'
    posePolicy: 'locked'
    fallback: {
        used: boolean
        preset: string | null
        reason: string | null
    }
    userRecommendation: string | null

    // ═══════════════════════════════════════════════════════════
    // DIRECTORIAL FIELDS (Scene Realism)
    // These are crafted by GPT-4o mini acting as Director of Photography
    // ═══════════════════════════════════════════════════════════
    naturalMicroAction: string   // How the person naturally exists in this environment
    environmentCues: string      // Shadow direction, light wrapping, atmospheric depth
    iphoneLook: string           // iPhone camera characteristics for this scene
}

export async function runSceneIntelligence(
    input: SceneIntelligenceInput
): Promise<SceneIntelligenceOutput> {
    const openai = getGeminiChat()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a Director of Photography for a virtual try-on photoshoot.

Your job is TWO-FOLD:
1. Resolve scene compatibility (preset, anchor zone, fallback)
2. Craft DIRECTORIAL REALISM CUES that make the final image look like a real iPhone photo

═══════════════════════════════════
PART 1: SCENE RESOLUTION (structural)
═══════════════════════════════════

Decide:
- Which preset should be used
- Which scenario variant is compatible
- Which anchor zone is safe
- Whether a fallback is required

ABSOLUTE RULES:
- Face and eyes are immutable. NEVER reference them.
- Pose is locked to input. NEVER invent or correct pose.
- Presets describe EMPTY ENVIRONMENTS ONLY.
- If preset conflicts with pose, fallback safely.
- NEVER include photography terms like portrait, cinematic, close-up.

ANCHOR ZONE RULES:
- Anchor zones describe WHERE the subject exists relative to the environment.
- Must be compatible with pose.
- Examples: sidewalk_center, rooftop_railing, café_table_edge, studio_center

═══════════════════════════════════
PART 2: DIRECTORIAL REALISM CUES
═══════════════════════════════════

You MUST output these 3 fields. Think like a film director blocking a scene:

═══════════════════════════════════
CRITICAL ANTI-STIFFNESS RULE:
The #1 problem is mannequin-like stiffness. Real people have RELAXED body language.
Their muscles are loose. Their weight is distributed casually, not evenly.
They lean, shift, rest hands on things, angle their body naturally.
FIGHT STIFFNESS in every output. NEVER describe a rigid upright pose.
═══════════════════════════════════

"naturalMicroAction" — HOW does a real person naturally exist in this environment?
  NOT the pose (that's locked). The MICRO-PHYSICS that make the body feel ALIVE:
  - Weight distribution (ALWAYS shift weight to one hip — never perfectly centered)
  - Hand placement (resting on railing? in pocket? holding phone? adjusting sleeve?)
  - Shoulder tension (ALWAYS relaxed and dropped, never squared or tense)
  - Body angle (slightly turned 5-15° from camera, never dead-center facing camera)
  - Gravity effects (clothing draping direction, hair movement from wind)
  - LOOSENESS (muscles relaxed, slight natural slouch, comfortable stance)
  
  GOOD: "weight shifted onto left hip, right hand resting casually on glass railing, shoulders dropped and relaxed, body angled 10° from camera as if mid-conversation, slight forward lean, muscles loose and comfortable"
  BAD: "standing naturally" (too vague, produces mannequin look)
  BAD: "standing upright with arms at sides" (this is a MANNEQUIN, not a person)

"environmentCues" — What makes this person look IN the scene, not pasted ON it?
  - Light source direction (upper-left, behind, diffuse overhead)
  - Shadow behavior (soft shadow falling to lower-right on concrete)
  - Light wrapping (warm golden bounce on jawline from sunset)
  - Atmospheric depth (hazy background, clean foreground)
  - Surface interaction (feet grounded on marble/concrete/grass)
  - Environmental effects on person (breeze on hair, warmth glow on skin)
  - BACKGROUND HUMAN PRESENCE: For ALL non-studio scenes, include 1-3 blurred
    people in the background doing natural things (walking, sitting, talking).
    This is CRITICAL for realism. Empty scenes look AI-generated.
    For studio presets, omit background people.

  GOOD: "warm afternoon sun from upper-left casting soft shadow to lower-right on terrace floor, golden light wrapping around jawline and shoulder, city skyline slightly hazy with atmospheric perspective, two blurred pedestrians walking in the far background"
  BAD: "outdoor lighting" (too vague)
  BAD: any description with ZERO people in background for outdoor/lifestyle scenes

"iphoneLook" — What iPhone camera characteristics match this scene?
  Camera lens: 24mm (ultra-wide), 48mm (main), or 77mm (telephoto)
  Depth: shallow DoF for portrait scenes, deeper for environmental
  HDR: natural computational HDR, never blown highlights
  Color: warm or cool based on environment, natural skin tones
  Noise: slight luminance grain in shadows (not clinical smoothness)

  GOOD: "iPhone 15 Pro 48mm main lens, portrait DoF with skyline softly blurred, natural HDR preserving cloud detail, warm golden skin tones, slight luminance grain in shadows"
  BAD: "high quality photo" (generic)

═══════════════════════════════════
OUTPUT FORMAT: STRICT JSON ONLY
═══════════════════════════════════

{
  "preset": string,
  "scenarioVariant": string,
  "anchorZone": string,
  "cameraPolicy": { "mode": "inherit", "allowAdjustment": false },
  "lightingPolicy": { "facePriority": true, "environmentAdapt": true },
  "eyeSafety": "strict",
  "posePolicy": "locked",
  "fallback": { "used": boolean, "preset": string|null, "reason": string|null },
  "userRecommendation": string|null,
  "naturalMicroAction": string,
  "environmentCues": string,
  "iphoneLook": string
}

FINAL CHECK:
- JSON only. No text outside JSON.
- No hallucinated poses. No facial references.
- naturalMicroAction MUST be specific (weight, hands, shoulders, body angle).
- environmentCues MUST include light direction and shadow behavior.
- iphoneLook MUST specify lens mm and DoF type.`
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        selectedPreset: input.selectedPreset,
                        inputPose: input.inputPose,
                        inputFraming: input.inputFraming,
                        garmentType: input.garmentType
                    })
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4, // Slightly higher for creative directorial cues
            max_tokens: 1500
        })

        const content = response.choices[0]?.message?.content
        if (!content) throw new Error('No content returned from Scene Intelligence')

        const parsed = JSON.parse(content) as SceneIntelligenceOutput

        // Validate directorial fields exist
        if (!parsed.naturalMicroAction || !parsed.environmentCues || !parsed.iphoneLook) {
            console.warn('⚠️ Scene Intelligence missing directorial fields, using defaults')
            parsed.naturalMicroAction = parsed.naturalMicroAction || 'weight naturally distributed, relaxed posture'
            parsed.environmentCues = parsed.environmentCues || 'even ambient lighting, soft natural shadows'
            parsed.iphoneLook = parsed.iphoneLook || 'iPhone 15 Pro 48mm main lens, natural HDR, balanced color'
        }

        console.log(`🎬 DIRECTOR: microAction="${parsed.naturalMicroAction.substring(0, 60)}..."`)
        console.log(`🎬 DIRECTOR: envCues="${parsed.environmentCues.substring(0, 60)}..."`)
        console.log(`🎬 DIRECTOR: iphone="${parsed.iphoneLook.substring(0, 60)}..."`)

        return parsed

    } catch (error) {
        console.error('Scene Intelligence failed:', error)
        // Safe fallback with decent directorial defaults
        return {
            preset: 'studio_gradient',
            scenarioVariant: 'default',
            anchorZone: 'center_stand',
            cameraPolicy: { mode: 'inherit', allowAdjustment: false },
            lightingPolicy: { facePriority: true, environmentAdapt: false },
            eyeSafety: 'strict',
            posePolicy: 'locked',
            fallback: {
                used: true,
                preset: 'studio_gradient',
                reason: 'Scene Intelligence failed'
            },
            userRecommendation: null,
            naturalMicroAction: 'weight naturally centered, relaxed shoulders, arms at natural rest',
            environmentCues: 'soft studio lighting from front-left, minimal shadow on backdrop, clean background',
            iphoneLook: 'iPhone 15 Pro 48mm main lens, deep DoF for studio, neutral color balance, minimal grain'
        }
    }
}
