import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { extractJson } from './json-repair'

function toDataUrl(base64: string): string {
  if (base64.startsWith('data:image/')) return base64
  return `data:image/jpeg;base64,${base64}`
}

export interface IdentityCompositionAssessment {
  shouldRetry: boolean
  reason: string
  validationAvailable?: boolean
  identityCorrectionGuidance?: string
  compositionCorrectionGuidance?: string
  garmentCorrectionGuidance?: string
  scores: {
    faceIdentity: number
    bodyConsistency: number
    compositionQuality: number
    backgroundIntegrity: number
    garmentFidelity: number
  }
}

const DEFAULT_ASSESSMENT: IdentityCompositionAssessment = {
  shouldRetry: false,
  reason: 'not_checked',
  validationAvailable: false,
  scores: {
    faceIdentity: 85,
    bodyConsistency: 85,
    compositionQuality: 85,
    backgroundIntegrity: 85,
    garmentFidelity: 85,
  },
}

export async function assessIdentityAndComposition(params: {
  sourceImageBase64: string
  generatedImageBase64: string
  faceCropBase64?: string
  garmentImageBase64?: string
  presetId?: string
  anchorZone?: string
}): Promise<IdentityCompositionAssessment> {
  const openai = getGeminiChat()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: [
          'You are a strict quality checker for virtual try-on identity preservation, garment fidelity, and composition.',
          'Return JSON only:',
          '{',
          '  "scores": {',
          '    "faceIdentity": <0-100>,',
          '    "bodyConsistency": <0-100>,',
          '    "compositionQuality": <0-100>,',
          '    "backgroundIntegrity": <0-100>,',
          '    "garmentFidelity": <0-100>',
          '  },',
          '  "majorIssues": ["<short issue>", "..."],',
          '  "identityCorrectionGuidance": "<single sentence about face/body preservation>",',
          '  "compositionCorrectionGuidance": "<single sentence about composition/background correction>",',
          '  "garmentCorrectionGuidance": "<single sentence about garment mismatch correction>"',
          '}',
          '',
          'Rules:',
          '- Compare the generated image against the source portrait for identity preservation.',
          '- Face identity means same person: facial geometry, eye relation, eye aperture, brow-eye spacing, cheek fullness, midface width, nose-lip-jaw relation, age impression, and skin texture.',
          '- Body consistency means same build, shoulder width, torso width, limb thickness, and natural proportions.',
          '- Composition quality means framing, balance, depth structure, and subject placement feel photographic and intentional.',
          '- Background integrity means no Gemini blur haze, no smear, no fake bokeh masking, and no pasted subject edges.',
          '- Garment fidelity means the clothing in the generated image matches the garment reference in type, collar, sleeves, buttons, hem length, fit, color, pattern, and fabric behavior.',
          '- Be strict about slight face change. If the generated face looks like a similar person instead of the same person, score it low.',
          '- Pay special attention to eye shape/opening and facial fullness. Slightly puffier cheeks or changed eye aperture are failures.',
          '- If the shirt changes into a different silhouette, collar, sleeve length, or button structure, garment fidelity is low.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              `Preset: ${params.presetId || 'not provided'}`,
              `Target scene: ${params.anchorZone || 'not provided'}`,
              'Image 1 is the source identity.',
              'Image 2 is an optional face crop from the source identity.',
              'Image 3 is the generated result to evaluate.',
              'Image 4 is an optional garment reference.',
              'Check for face drift, body reshaping, garment mismatch, weak composition, mushy backgrounds, generic blur haze, and sticker-like separation.',
            ].join('\n'),
          },
          {
            type: 'image_url',
            image_url: {
              url: toDataUrl(params.sourceImageBase64),
              detail: 'high',
            },
          },
          ...(params.faceCropBase64
            ? [{
                type: 'image_url' as const,
                image_url: {
                  url: toDataUrl(params.faceCropBase64),
                  detail: 'high' as const,
                },
              }]
            : []),
          {
            type: 'image_url',
            image_url: {
              url: toDataUrl(params.generatedImageBase64),
              detail: 'high',
            },
          },
          ...(params.garmentImageBase64
            ? [{
                type: 'image_url' as const,
                image_url: {
                  url: toDataUrl(params.garmentImageBase64),
                  detail: 'high' as const,
                },
              }]
            : []),
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 260,
  })

  const raw = response.choices[0]?.message?.content || '{}'
  let parsed: {
    scores?: {
      faceIdentity?: number
      bodyConsistency?: number
      compositionQuality?: number
      backgroundIntegrity?: number
      garmentFidelity?: number
    }
    majorIssues?: string[]
    identityCorrectionGuidance?: string
    compositionCorrectionGuidance?: string
    garmentCorrectionGuidance?: string
  }

  try {
    parsed = extractJson<{
      scores?: {
        faceIdentity?: number
        bodyConsistency?: number
        compositionQuality?: number
        backgroundIntegrity?: number
        garmentFidelity?: number
      }
      majorIssues?: string[]
      identityCorrectionGuidance?: string
      compositionCorrectionGuidance?: string
      garmentCorrectionGuidance?: string
    }>(raw)
  } catch (parseError) {
    console.warn(
      '[tryon] identity/composition assessment unavailable:',
      parseError instanceof Error ? parseError.message : String(parseError)
    )
    return {
      ...DEFAULT_ASSESSMENT,
      reason: 'validation_unavailable',
    }
  }

  const hasStructuredScores = [
    parsed.scores?.faceIdentity,
    parsed.scores?.bodyConsistency,
    parsed.scores?.compositionQuality,
    parsed.scores?.backgroundIntegrity,
    parsed.scores?.garmentFidelity,
  ].some((value) => typeof value === 'number' && Number.isFinite(value))

  if (!hasStructuredScores) {
    return {
      ...DEFAULT_ASSESSMENT,
      reason: 'validation_unavailable',
    }
  }

  const scores = {
    faceIdentity: clampScore(parsed.scores?.faceIdentity ?? DEFAULT_ASSESSMENT.scores.faceIdentity),
    bodyConsistency: clampScore(parsed.scores?.bodyConsistency ?? DEFAULT_ASSESSMENT.scores.bodyConsistency),
    compositionQuality: clampScore(parsed.scores?.compositionQuality ?? DEFAULT_ASSESSMENT.scores.compositionQuality),
    backgroundIntegrity: clampScore(parsed.scores?.backgroundIntegrity ?? DEFAULT_ASSESSMENT.scores.backgroundIntegrity),
    garmentFidelity: clampScore(parsed.scores?.garmentFidelity ?? DEFAULT_ASSESSMENT.scores.garmentFidelity),
  }

  const minScore = Math.min(
    scores.faceIdentity,
    scores.bodyConsistency,
    scores.compositionQuality,
    scores.backgroundIntegrity,
    scores.garmentFidelity
  )
  const avgScore =
    (scores.faceIdentity + scores.bodyConsistency + scores.compositionQuality + scores.backgroundIntegrity + scores.garmentFidelity) / 5
  const majorIssues = (parsed.majorIssues || []).filter(Boolean)

  const shouldRetry =
    scores.faceIdentity < 70 ||
    scores.bodyConsistency < 68 ||
    scores.garmentFidelity < 70 ||
    minScore < 60 ||
    (avgScore < 68 && majorIssues.length >= 2)

  return {
    shouldRetry,
    reason: shouldRetry ? 'identity_or_composition_low' : 'identity_and_composition_stable',
    validationAvailable: true,
    identityCorrectionGuidance: parsed.identityCorrectionGuidance?.trim(),
    compositionCorrectionGuidance: parsed.compositionCorrectionGuidance?.trim(),
    garmentCorrectionGuidance: parsed.garmentCorrectionGuidance?.trim(),
    scores,
  }
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}
