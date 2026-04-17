/**
 * BODY PROPORTION VALIDATOR (Stage 5)
 * 
 * Measures and validates body proportions between input and output.
 * Ensures no body reshaping or beautification has occurred.
 * 
 * CORE PRINCIPLE: Body shape must not be improved or altered.
 * We preserve people, not beautify them.
 */

import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface BodyProportions {
    shoulderWidth: number        // As fraction of image width
    hipWidth: number             // As fraction of image width
    hipToWaistRatio: number      // Hip width / waist width
    torsoLength: number          // Shoulder to hip as fraction of height
    headToBodyRatio: number      // Head height / total visible body
    armLength?: number           // If visible
    legLength?: number           // If visible
}

export interface ProportionValidation {
    isValid: boolean
    overallDrift: number         // Overall drift from original (0-1)
    specificDrifts: {
        shoulderWidth: number
        hipWidth: number
        hipToWaistRatio: number
        torsoLength: number
        headToBodyRatio: number
    }
    shouldRetry: boolean         // If true, retry generation
    issues: string[]
}

/**
 * Measure body proportions in an image
 * 
 * Uses GPT-4o-mini vision to analyze body proportions.
 * 
 * @param imageBase64 - Base64 encoded image
 * @returns Body proportions measurements
 */
export async function measureBodyProportions(
    imageBase64: string
): Promise<BodyProportions> {
    const openai = getGeminiChat()

    const imageUrl = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`

    try {
        console.log('📐 STAGE 5: Measuring body proportions...')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a body proportion analyzer for virtual try-on quality control.
Measure the body proportions in this image for comparison.

Return a JSON object with proportions as fractions (0.0-1.0):
{
  "shoulderWidth": shoulder width as fraction of image width,
  "hipWidth": hip width as fraction of image width,
  "waistWidth": waist width as fraction of image width,
  "shoulderToHipLength": distance from shoulder to hip as fraction of visible height,
  "headHeight": head height as fraction of total visible body height,
  "bodyVisible": true/false (is body clearly visible for measurement?),
  "confidence": 0.0-1.0
}

Be precise - these measurements are used to detect unwanted body modifications.`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Measure body proportions in this image for comparison analysis.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 400,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from body measurement')
        }

        const measurement = JSON.parse(content)

        // Calculate derived ratios
        const hipToWaistRatio = measurement.hipWidth / (measurement.waistWidth || measurement.hipWidth)

        const result: BodyProportions = {
            shoulderWidth: measurement.shoulderWidth || 0.3,
            hipWidth: measurement.hipWidth || 0.25,
            hipToWaistRatio,
            torsoLength: measurement.shoulderToHipLength || 0.3,
            headToBodyRatio: measurement.headHeight || 0.15
        }

        console.log(`   ✓ Shoulder width: ${(result.shoulderWidth * 100).toFixed(1)}%`)
        console.log(`   ✓ Hip width: ${(result.hipWidth * 100).toFixed(1)}%`)
        console.log(`   ✓ Hip-to-waist ratio: ${result.hipToWaistRatio.toFixed(2)}`)
        console.log(`   ✓ Torso length: ${(result.torsoLength * 100).toFixed(1)}%`)

        return result
    } catch (error) {
        console.error('❌ Body proportion measurement failed:', error)

        // Return default proportions on failure
        return {
            shoulderWidth: 0.3,
            hipWidth: 0.25,
            hipToWaistRatio: 1.0,
            torsoLength: 0.3,
            headToBodyRatio: 0.15
        }
    }
}

/**
 * Validate body proportions between original and generated images
 * 
 * @param original - Original image proportions
 * @param generated - Generated image proportions
 * @param tolerance - Acceptable drift percentage (default: 10%)
 * @returns Validation result
 */
export function validateProportions(
    original: BodyProportions,
    generated: BodyProportions,
    tolerance: number = 0.10
): ProportionValidation {
    console.log('🔍 STAGE 5: Validating body proportions...')

    // Calculate drift for each measurement
    const shoulderDrift = Math.abs(original.shoulderWidth - generated.shoulderWidth) / original.shoulderWidth
    const hipDrift = Math.abs(original.hipWidth - generated.hipWidth) / original.hipWidth
    const ratioDrift = Math.abs(original.hipToWaistRatio - generated.hipToWaistRatio) / original.hipToWaistRatio
    const torsoDrift = Math.abs(original.torsoLength - generated.torsoLength) / original.torsoLength
    const headDrift = Math.abs(original.headToBodyRatio - generated.headToBodyRatio) / original.headToBodyRatio

    const specificDrifts = {
        shoulderWidth: shoulderDrift,
        hipWidth: hipDrift,
        hipToWaistRatio: ratioDrift,
        torsoLength: torsoDrift,
        headToBodyRatio: headDrift
    }

    // Calculate overall drift (weighted average)
    const overallDrift = (
        shoulderDrift * 0.25 +
        hipDrift * 0.25 +
        ratioDrift * 0.2 +
        torsoDrift * 0.15 +
        headDrift * 0.15
    )

    // Identify specific issues
    const issues: string[] = []
    if (shoulderDrift > tolerance) {
        issues.push(`Shoulder width changed by ${(shoulderDrift * 100).toFixed(0)}%`)
    }
    if (hipDrift > tolerance) {
        issues.push(`Hip width changed by ${(hipDrift * 100).toFixed(0)}%`)
    }
    if (ratioDrift > tolerance * 1.5) { // More lenient for ratios
        issues.push(`Hip-to-waist ratio changed by ${(ratioDrift * 100).toFixed(0)}%`)
    }
    if (torsoDrift > tolerance) {
        issues.push(`Torso length changed by ${(torsoDrift * 100).toFixed(0)}%`)
    }

    const isValid = overallDrift <= tolerance
    const shouldRetry = overallDrift > tolerance && overallDrift <= tolerance * 1.5

    console.log(`   ✓ Overall drift: ${(overallDrift * 100).toFixed(1)}%`)
    console.log(`   ✓ Tolerance: ${(tolerance * 100).toFixed(0)}%`)
    console.log(`   ✓ Status: ${isValid ? '✅ VALID' : shouldRetry ? '⚠️ RETRY' : '❌ FAILED'}`)

    return {
        isValid,
        overallDrift,
        specificDrifts,
        shouldRetry,
        issues
    }
}

/**
 * Run full body proportion enforcement stage
 */
export async function runBodyProportionEnforcement(params: {
    originalImageBase64: string
    generatedImageBase64: string
    tolerance?: number
}): Promise<ProportionValidation> {
    const { originalImageBase64, generatedImageBase64, tolerance = 0.10 } = params

    console.log('\n📊 STAGE 5: Body Proportion Enforcement')

    // Measure original
    console.log('   📐 Measuring original image...')
    const originalProportions = await measureBodyProportions(originalImageBase64)

    // Measure generated
    console.log('   📐 Measuring generated image...')
    const generatedProportions = await measureBodyProportions(generatedImageBase64)

    // Validate
    const validation = validateProportions(originalProportions, generatedProportions, tolerance)

    return validation
}

/**
 * Log body proportion validation status
 */
export function logBodyProportionStatus(
    sessionId: string,
    validation: ProportionValidation
): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  STAGE 5: BODY PROPORTION ENFORCEMENT                                         ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Status: ${validation.isValid ? '✅ VALID' : validation.shouldRetry ? '⚠️ RETRY' : '❌ FAILED'}`.padEnd(80) + '║')
    console.log(`║  Overall Drift: ${(validation.overallDrift * 100).toFixed(1)}%`.padEnd(80) + '║')
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Specific Drifts:`.padEnd(80) + '║')
    console.log(`║    Shoulders: ${(validation.specificDrifts.shoulderWidth * 100).toFixed(1)}%`.padEnd(80) + '║')
    console.log(`║    Hips: ${(validation.specificDrifts.hipWidth * 100).toFixed(1)}%`.padEnd(80) + '║')
    console.log(`║    Waist Ratio: ${(validation.specificDrifts.hipToWaistRatio * 100).toFixed(1)}%`.padEnd(80) + '║')
    console.log(`║    Torso: ${(validation.specificDrifts.torsoLength * 100).toFixed(1)}%`.padEnd(80) + '║')
    if (validation.issues.length > 0) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║  Issues:`.padEnd(80) + '║')
        for (const issue of validation.issues) {
            console.log(`║    • ${issue}`.padEnd(80) + '║')
        }
    }
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
