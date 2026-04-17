import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

function toDataUrl(base64: string): string {
  if (base64.startsWith('data:image/')) return base64
  return `data:image/jpeg;base64,${base64}`
}

export interface SceneQualityAssessment {
  shouldRetry: boolean
  reason: string
  correctionGuidance?: string
  scores: {
    poseNaturalness: number
    lightingCoherence: number
    backgroundQuality: number
    compositionBalance: number
  }
}

const DEFAULT_ASSESSMENT: SceneQualityAssessment = {
  shouldRetry: false,
  reason: 'not_checked',
  scores: {
    poseNaturalness: 85,
    lightingCoherence: 85,
    backgroundQuality: 85,
    compositionBalance: 85,
  },
}

export async function assessSceneRealism(params: {
  generatedImageBase64: string
  anchorZone?: string
  realismGuidance?: string
  expectedLightingBlueprint?: string
  expectedPresetAvoid?: string
}): Promise<SceneQualityAssessment> {
  const openai = getGeminiChat()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a strict realism quality checker for virtual try-on images.
Return JSON only:
{
  "scores": {
    "poseNaturalness": <0-100>,
    "lightingCoherence": <0-100>,
    "backgroundQuality": <0-100>,
    "compositionBalance": <0-100>
  },
  "majorIssues": ["<short issue>", "..."],
  "correctionGuidance": "<single sentence correction focused on realism only>"
}

Rules:
- Focus only on realism quality: pose naturalness, coherent lighting, background quality, composition.
- Do not mention identity, face geometry, or clothing replacement correctness.
- correctionGuidance must be practical and concise, no artistic wording.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Target environment: ${params.anchorZone || 'not provided'}
Existing realism guidance: ${params.realismGuidance || 'not provided'}
Expected lighting blueprint: ${params.expectedLightingBlueprint || 'not provided'}
Expected preset avoid list: ${params.expectedPresetAvoid || 'not provided'}
Evaluate if image needs one corrective regeneration pass for realism.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: toDataUrl(params.generatedImageBase64),
              detail: 'high',
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 240,
  })

  const raw = response.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(raw) as {
    scores?: {
      poseNaturalness?: number
      lightingCoherence?: number
      backgroundQuality?: number
      compositionBalance?: number
    }
    majorIssues?: string[]
    correctionGuidance?: string
  }

  const scores = {
    poseNaturalness: clampScore(parsed.scores?.poseNaturalness ?? DEFAULT_ASSESSMENT.scores.poseNaturalness),
    lightingCoherence: clampScore(parsed.scores?.lightingCoherence ?? DEFAULT_ASSESSMENT.scores.lightingCoherence),
    backgroundQuality: clampScore(parsed.scores?.backgroundQuality ?? DEFAULT_ASSESSMENT.scores.backgroundQuality),
    compositionBalance: clampScore(parsed.scores?.compositionBalance ?? DEFAULT_ASSESSMENT.scores.compositionBalance),
  }

  const minScore = Math.min(
    scores.poseNaturalness,
    scores.lightingCoherence,
    scores.backgroundQuality,
    scores.compositionBalance
  )
  const avgScore =
    (scores.poseNaturalness + scores.lightingCoherence + scores.backgroundQuality + scores.compositionBalance) / 4

  const majorIssues = (parsed.majorIssues || []).filter(Boolean)
  // Only retry when clearly bad — avoid unnecessary double calls and "model dead" perception.
  const shouldRetry = minScore < 55 || (avgScore < 65 && majorIssues.length >= 2)

  return {
    shouldRetry,
    reason: shouldRetry ? 'scene_realism_low' : 'scene_stable',
    correctionGuidance: parsed.correctionGuidance?.trim(),
    scores,
  }
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}
