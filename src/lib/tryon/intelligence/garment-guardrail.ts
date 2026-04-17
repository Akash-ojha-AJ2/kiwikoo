/**
 * GARMENT GUARDRAIL - Post-Generation Validation
 * 
 * Validates that the garment type in the output matches the reference.
 * Rejects outputs where short kurta became long kurta, etc.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { GarmentCategory, HemlinePosition } from './garment-classifier'
import { extractJson } from '@/lib/tryon/json-repair'

export interface GarmentValidationResult {
    is_valid: boolean
    type_match: boolean
    length_match: boolean
    pattern_match: boolean
    color_match: boolean
    issues: string[]
    recommendation: 'accept' | 'reject' | 'retry'
    validationAvailable?: boolean
    explicitDecision?: boolean
    details: {
        expected_type: GarmentCategory
        actual_type: GarmentCategory
        expected_hemline: HemlinePosition
        actual_hemline: HemlinePosition
    }
}

export async function validateGarmentMatch(
    referenceImageBase64: string,
    generatedImageBase64: string,
    expectedCategory: GarmentCategory,
    expectedHemline: HemlinePosition
): Promise<GarmentValidationResult> {
    console.log('\n👔 GARMENT GUARDRAIL: Validating garment match...')
    const startTime = Date.now()

    const openai = getGeminiChat()

    const cleanReference = referenceImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
    const cleanGenerated = generatedImageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a garment verification system. Compare the garment in Image 1 (reference) with the garment in Image 2 (generated output).

Check:
1. Is it the same TYPE of garment? (shirt stayed shirt, kurta stayed kurta)
2. Is the LENGTH the same? (short stayed short, long stayed long)
3. Is the PATTERN the same? (same design)
4. Are the COLORS the same?

Expected garment: ${expectedCategory}
Expected hemline: ${expectedHemline}

Return JSON:
{
  "type_match": true/false,
  "actual_type": "SHIRT" | "SHORT_KURTA" | "LONG_KURTA" | etc.,
  "length_match": true/false,
  "actual_hemline": "hip_level" | "knee" | etc.,
  "pattern_match": true/false,
  "color_match": true/false,
  "issues": ["list of mismatches"],
  "recommendation": "accept" | "reject" | "retry"
}`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Compare these garments. Image 1 is the reference (expected: ${expectedCategory}, hemline: ${expectedHemline}). Image 2 is the generated output. Do they match?`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${cleanReference}`,
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
            type_match?: boolean
            actual_type?: GarmentCategory
            length_match?: boolean
            actual_hemline?: HemlinePosition
            pattern_match?: boolean
            color_match?: boolean
            issues?: string[]
            recommendation?: 'accept' | 'reject' | 'retry'
        }>(content)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        const hasStructuredDecision =
            typeof parsed.type_match === 'boolean' &&
            typeof parsed.length_match === 'boolean'

        if (!hasStructuredDecision) {
            return {
                is_valid: false,
                type_match: false,
                length_match: false,
                pattern_match: false,
                color_match: false,
                issues: ['Validation unavailable'],
                recommendation: 'retry',
                validationAvailable: false,
                explicitDecision: false,
                details: {
                    expected_type: expectedCategory,
                    actual_type: 'UNKNOWN',
                    expected_hemline: expectedHemline,
                    actual_hemline: 'unknown'
                }
            }
        }

        const typeMatch = parsed.type_match === true
        const lengthMatch = parsed.length_match === true
        const recommendation =
            parsed.recommendation ||
            (typeMatch && lengthMatch ? 'accept' : 'retry')

        const result: GarmentValidationResult = {
            is_valid: typeMatch && lengthMatch,
            type_match: typeMatch,
            length_match: lengthMatch,
            pattern_match: Boolean(parsed.pattern_match),
            color_match: Boolean(parsed.color_match),
            issues: parsed.issues || [],
            recommendation,
            validationAvailable: true,
            explicitDecision: recommendation !== 'retry' || (parsed.issues || []).length > 0,
            details: {
                expected_type: expectedCategory,
                actual_type: parsed.actual_type || 'UNKNOWN',
                expected_hemline: expectedHemline,
                actual_hemline: parsed.actual_hemline || 'unknown'
            }
        }

        if (result.is_valid) {
            console.log(`   ✅ Garment VALID: type=${result.type_match}, length=${result.length_match} (${elapsed}s)`)
        } else {
            console.log(`   ❌ Garment REJECTED: ${result.issues.join(', ')} (${elapsed}s)`)
            console.log(`   Expected: ${expectedCategory} (${expectedHemline})`)
            console.log(`   Got: ${result.details.actual_type} (${result.details.actual_hemline})`)
        }

        return result

    } catch (error) {
        console.warn(
            '[tryon] garment guardrail unavailable:',
            error instanceof Error ? error.message : String(error)
        )
        return {
            is_valid: false,
            type_match: false,
            length_match: false,
            pattern_match: false,
            color_match: false,
            issues: ['Validation unavailable'],
            recommendation: 'retry',
            validationAvailable: false,
            explicitDecision: false,
            details: {
                expected_type: expectedCategory,
                actual_type: 'UNKNOWN',
                expected_hemline: expectedHemline,
                actual_hemline: 'unknown'
            }
        }
    }
}
