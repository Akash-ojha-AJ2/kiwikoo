/**
 * FACE GUARDRAIL - Post-Generation Validation
 * 
 * Validates that the generated face matches the original.
 * Rejects outputs where face doesn't match.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { extractJson } from '@/lib/tryon/json-repair'

export interface FaceValidationResult {
    is_valid: boolean
    similarity_score: number  // 0-100
    issues: string[]
    recommendation: 'accept' | 'reject' | 'retry'
    validationAvailable?: boolean
    analysis: {
        face_shape_match: boolean
        skin_tone_match: boolean
        features_match: boolean
        same_person: boolean
    }
}

export async function validateFaceMatch(
    originalImageBase64: string,
    generatedImageBase64: string
): Promise<FaceValidationResult> {
    console.log('\n🔍 FACE GUARDRAIL: Validating face match...')
    const startTime = Date.now()

    const openai = getGeminiChat()

    // Clean base64
    const cleanOriginal = originalImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    const cleanGenerated = generatedImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a face verification system. Compare the face in Image 1 (original) with the face in Image 2 (generated).

Determine if they are the SAME PERSON.

Return JSON:
{
  "same_person": true/false,
  "similarity_score": 0-100,
  "face_shape_match": true/false,
  "skin_tone_match": true/false,
  "features_match": true/false,
  "issues": ["list of mismatches if any"],
  "recommendation": "accept" | "reject" | "retry"
}

Scoring guide:
- 90-100: Same person, excellent match
- 70-89: Same person, minor differences (acceptable)
- 50-69: Uncertain, some similarities (retry recommended)
- 0-49: Different person (reject)`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Compare these two faces. Image 1 is the original, Image 2 is the generated output. Are they the same person?'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${cleanOriginal}`,
                                detail: 'high'
                            }
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${cleanGenerated}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content || ''
        const parsed = extractJson<{
            same_person?: boolean
            similarity_score?: number
            face_shape_match?: boolean
            skin_tone_match?: boolean
            features_match?: boolean
            issues?: string[]
            recommendation?: 'accept' | 'reject' | 'retry'
        }>(content)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

        const result: FaceValidationResult = {
            is_valid: Number(parsed.similarity_score || 0) >= 70,
            similarity_score: Number(parsed.similarity_score || 0),
            issues: parsed.issues || [],
            recommendation: parsed.recommendation || 'reject',
            validationAvailable: true,
            analysis: {
                face_shape_match: Boolean(parsed.face_shape_match),
                skin_tone_match: Boolean(parsed.skin_tone_match),
                features_match: Boolean(parsed.features_match),
                same_person: Boolean(parsed.same_person)
            }
        }

        if (result.is_valid) {
            console.log(`   ✅ Face VALID: ${result.similarity_score}% similarity (${elapsed}s)`)
        } else {
            console.log(`   ❌ Face REJECTED: ${result.similarity_score}% similarity (${elapsed}s)`)
            console.log(`   Issues: ${result.issues.join(', ')}`)
        }

        return result

    } catch (error) {
        console.warn(
            '[tryon] face guardrail unavailable:',
            error instanceof Error ? error.message : String(error)
        )
        return {
            is_valid: false,
            similarity_score: 0,
            issues: ['Validation unavailable'],
            recommendation: 'retry',
            validationAvailable: false,
            analysis: {
                face_shape_match: false,
                skin_tone_match: false,
                features_match: false,
                same_person: false
            }
        }
    }
}
