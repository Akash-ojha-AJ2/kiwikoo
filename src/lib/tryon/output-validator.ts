/**
 * OUTPUT VALIDATOR (Stage 6)
 * 
 * Final validation of generated output against input.
 * Uses GPT-4o-mini to make pass/fail decisions.
 * 
 * DECISION LOGIC:
 * - Face similarity ≥ 85% → PASS
 * - Face similarity 70-84% → SOFT_FAIL (retry once)
 * - Face similarity < 70% OR body drift > 15% → HARD_FAIL (return with warning)
 * 
 * NEVER SILENTLY "FIX" - failures are visible and honest.
 */

import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import type { FaceExtractionResult } from './face-extractor'
import type { BodyProportions, ProportionValidation } from './body-proportion-validator'

export type ValidationDecision = 'PASS' | 'SOFT_FAIL' | 'HARD_FAIL'

export interface ValidationResult {
    overallScore: number            // 0-100
    faceSimilarity: number          // 0-100
    landmarkDrift: number           // Pixels of drift (estimated)
    bodyProportionStable: boolean
    garmentApplied: boolean
    decision: ValidationDecision
    reasons: string[]
    shouldRetry: boolean
    warningMessage?: string
}

/**
 * Validate output image against input for similarity and correctness
 * 
 * @param params Validation parameters
 * @returns Validation result with decision
 */
export async function validateOutput(params: {
    originalImageBase64: string
    generatedImageBase64: string
    originalFace?: FaceExtractionResult
    bodyValidation?: ProportionValidation
}): Promise<ValidationResult> {
    const {
        originalImageBase64,
        generatedImageBase64,
        originalFace,
        bodyValidation
    } = params

    const openai = getGeminiChat()

    const formatImageUrl = (base64: string) =>
        base64.startsWith('data:image/')
            ? base64
            : `data:image/jpeg;base64,${base64}`

    console.log('🔍 STAGE 6: Output Validation & Decision...')

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a STRICT quality control validator for virtual try-on.
Compare the ORIGINAL person image with the GENERATED try-on result.

Your job is to detect ANY changes to the person's identity or body shape.

CRITICAL CHECKS:
1. FACE SIMILARITY: Is it the SAME person? (0-100%)
   - Same facial structure, same features, same expression
   - Skin tone preserved
   - No beautification or enhancement
   
2. BODY PRESERVATION: Are proportions unchanged? (yes/no)
   - Same body shape
   - No slimming or reshaping
   - Same pose
   
3. GARMENT APPLICATION: Was the new clothing applied? (yes/no)
   - Clothing has changed from original
   - New garment visible on person

Return a JSON object:
{
  "faceSimilarity": 0-100 (100 = identical person),
  "faceDriftDetails": "describe any face changes detected",
  "bodyPreserved": true/false,
  "bodyDriftDetails": "describe any body changes detected",
  "garmentApplied": true/false,
  "garmentDetails": "describe the applied garment",
  "overallQuality": 0-100,
  "issues": ["list of any problems detected"]
}`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Compare these two images:
Image 1 = ORIGINAL person (reference for identity)
Image 2 = GENERATED try-on result

Check if the person's identity and body are preserved.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: formatImageUrl(originalImageBase64),
                                detail: 'high'
                            }
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: formatImageUrl(generatedImageBase64),
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 600,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from validation')
        }

        const validation = JSON.parse(content)

        // Calculate overall score
        const faceSimilarity = validation.faceSimilarity || 0
        const bodyPreserved = validation.bodyPreserved ?? true
        const garmentApplied = validation.garmentApplied ?? true

        // Factor in body validation if provided
        const bodyDrift = bodyValidation?.overallDrift ?? 0
        const bodyProportionStable = bodyPreserved && bodyDrift <= 0.10

        // Calculate overall score
        const overallScore = (
            faceSimilarity * 0.6 +
            (bodyProportionStable ? 100 : 50) * 0.25 +
            (garmentApplied ? 100 : 0) * 0.15
        )

        // Determine decision
        let decision: ValidationDecision
        let shouldRetry = false
        let warningMessage: string | undefined

        if (faceSimilarity >= 85 && bodyProportionStable && garmentApplied) {
            decision = 'PASS'
        } else if (faceSimilarity >= 70 && faceSimilarity < 85) {
            decision = 'SOFT_FAIL'
            shouldRetry = true
            warningMessage = 'Face similarity below threshold. Retrying generation.'
        } else if (faceSimilarity < 70) {
            decision = 'HARD_FAIL'
            warningMessage = `Face identity not preserved (${faceSimilarity}% similarity). Please review the result.`
        } else if (!bodyProportionStable) {
            decision = 'SOFT_FAIL'
            shouldRetry = true
            warningMessage = 'Body proportions changed. Retrying generation.'
        } else if (!garmentApplied) {
            decision = 'SOFT_FAIL'
            shouldRetry = true
            warningMessage = 'Garment not properly applied. Retrying generation.'
        } else {
            decision = 'PASS'
        }

        // Collect reasons
        const reasons: string[] = validation.issues || []
        if (faceSimilarity < 85) {
            reasons.push(`Face similarity: ${faceSimilarity}% (threshold: 85%)`)
        }
        if (!bodyProportionStable) {
            reasons.push('Body proportions changed from original')
        }
        if (!garmentApplied) {
            reasons.push('New garment not visible on person')
        }

        const result: ValidationResult = {
            overallScore,
            faceSimilarity,
            landmarkDrift: 0, // Would be calculated from face data
            bodyProportionStable,
            garmentApplied,
            decision,
            reasons,
            shouldRetry,
            warningMessage
        }

        console.log(`   ✓ Face similarity: ${faceSimilarity}%`)
        console.log(`   ✓ Body preserved: ${bodyProportionStable ? 'YES' : 'NO'}`)
        console.log(`   ✓ Garment applied: ${garmentApplied ? 'YES' : 'NO'}`)
        console.log(`   ✓ Overall score: ${overallScore.toFixed(0)}%`)
        console.log(`   📋 Decision: ${decision}`)

        return result
    } catch (error) {
        console.error('❌ Output validation failed:', error)

        // Return cautious result on failure
        return {
            overallScore: 50,
            faceSimilarity: 50,
            landmarkDrift: 0,
            bodyProportionStable: true,
            garmentApplied: true,
            decision: 'SOFT_FAIL',
            reasons: ['Validation analysis failed - returning with caution'],
            shouldRetry: true,
            warningMessage: 'Validation could not be completed. Please review the result manually.'
        }
    }
}

/**
 * Make final decision based on all validation data
 */
export function makeFinalDecision(params: {
    validationResult: ValidationResult
    bodyValidation?: ProportionValidation
    retryCount: number
    maxRetries: number
}): {
    decision: ValidationDecision
    shouldRetry: boolean
    warningForUser?: string
} {
    const { validationResult, bodyValidation, retryCount, maxRetries } = params

    // If we've exhausted retries, return what we have with warning
    if (retryCount >= maxRetries && validationResult.decision !== 'PASS') {
        return {
            decision: 'HARD_FAIL',
            shouldRetry: false,
            warningForUser: `Quality threshold not met after ${maxRetries} attempts. Result may have identity drift. Face similarity: ${validationResult.faceSimilarity}%`
        }
    }

    // Otherwise, follow the validation decision
    return {
        decision: validationResult.decision,
        shouldRetry: validationResult.shouldRetry,
        warningForUser: validationResult.warningMessage
    }
}

/**
 * Log validation status
 */
export function logValidatorStatus(
    sessionId: string,
    result: ValidationResult
): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  STAGE 6: VALIDATION & DECISION (4o-mini)                                     ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)

    const statusEmoji = result.decision === 'PASS' ? '✅' : result.decision === 'SOFT_FAIL' ? '⚠️' : '❌'
    console.log(`║  Decision: ${statusEmoji} ${result.decision}`.padEnd(80) + '║')
    console.log(`║  Overall Score: ${result.overallScore.toFixed(0)}%`.padEnd(80) + '║')
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Face Similarity: ${result.faceSimilarity}% (threshold: 85%)`.padEnd(80) + '║')
    console.log(`║  Body Preserved: ${result.bodyProportionStable ? 'YES' : 'NO'}`.padEnd(80) + '║')
    console.log(`║  Garment Applied: ${result.garmentApplied ? 'YES' : 'NO'}`.padEnd(80) + '║')

    if (result.reasons.length > 0) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║  Issues:`.padEnd(80) + '║')
        for (const reason of result.reasons.slice(0, 3)) {
            console.log(`║    • ${reason.slice(0, 68)}`.padEnd(80) + '║')
        }
    }

    if (result.warningMessage) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║  ⚠️ ${result.warningMessage.slice(0, 72)}`.padEnd(80) + '║')
    }

    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
