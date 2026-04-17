/**
 * INPUT QUALITY GATE (Stage 0)
 * 
 * Validates input image quality before processing.
 * Rejects images that would produce poor results.
 * 
 * ENGINEERING PHILOSOPHY:
 * - Fail fast with clear feedback
 * - Never hide quality issues
 * - User gets actionable feedback
 */

import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface QualityCheckResult {
    isValid: boolean
    issues: string[]
    checks: {
        faceVisible: boolean
        faceSizeOk: boolean       // Face not too small (< 10% of image)
        blurScore: number         // 0-1, higher = sharper
        poseNeutrality: number    // 0-1, higher = more neutral
        lightingQuality: number   // 0-1, higher = better
        faceOcclusion: boolean    // Is face partially covered?
    }
    recommendation?: string
}

/**
 * Run input quality gate using GPT-4o-mini vision
 * 
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns Quality check result with pass/fail status and issues
 */
export async function runInputQualityGate(
    imageBase64: string
): Promise<QualityCheckResult> {
    const openai = getGeminiChat()

    // Format image URL
    const imageUrl = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`

    try {
        console.log('🔍 STAGE 0: Input Quality Gate - Analyzing image...')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an image quality analyzer for a virtual try-on system.
Your job is to evaluate if an input image is suitable for accurate try-on generation.

CRITICAL REQUIREMENTS FOR TRY-ON:
1. Face MUST be clearly visible (not cropped, not occluded)
2. Face must be large enough (at least 10% of image area)
3. Image must be reasonably sharp (not blurry)
4. Pose should be relatively neutral (facing camera, not extreme angles)
5. Lighting should show face clearly (not silhouette, not overexposed)

Return a JSON object with these exact fields:
{
  "faceVisible": true/false,
  "faceSizeOk": true/false,
  "blurScore": 0.0-1.0 (1 = perfectly sharp),
  "poseNeutrality": 0.0-1.0 (1 = perfectly neutral front-facing),
  "lightingQuality": 0.0-1.0 (1 = perfect lighting),
  "faceOcclusion": true/false (is face partially blocked by hand, hair, object?),
  "issues": ["list", "of", "specific", "issues"],
  "recommendation": "What user should do if issues exist"
}`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze this image for virtual try-on suitability. Be strict - we need clear face visibility for identity preservation.'
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
            max_tokens: 500,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from quality gate')
        }

        const analysis = JSON.parse(content)

        // Determine if image passes quality gate
        const issues: string[] = analysis.issues || []

        // Add issues based on scores
        if (!analysis.faceVisible) {
            issues.push('No face detected in image')
        }
        if (!analysis.faceSizeOk) {
            issues.push('Face is too small - please use a closer shot')
        }
        if (analysis.blurScore < 0.5) {
            issues.push('Image is too blurry')
        }
        if (analysis.poseNeutrality < 0.3) {
            issues.push('Face angle is too extreme - please face the camera more directly')
        }
        if (analysis.lightingQuality < 0.3) {
            issues.push('Lighting is poor - face is not clearly visible')
        }
        if (analysis.faceOcclusion) {
            issues.push('Face is partially blocked - please remove obstructions')
        }

        // Calculate overall validity
        const isValid =
            analysis.faceVisible &&
            analysis.faceSizeOk &&
            analysis.blurScore >= 0.4 &&
            analysis.poseNeutrality >= 0.2 &&
            analysis.lightingQuality >= 0.2 &&
            !analysis.faceOcclusion

        const result: QualityCheckResult = {
            isValid,
            issues: [...new Set(issues)], // Remove duplicates
            checks: {
                faceVisible: analysis.faceVisible,
                faceSizeOk: analysis.faceSizeOk,
                blurScore: analysis.blurScore,
                poseNeutrality: analysis.poseNeutrality,
                lightingQuality: analysis.lightingQuality,
                faceOcclusion: analysis.faceOcclusion
            },
            recommendation: analysis.recommendation
        }

        // Log result
        console.log(`   ✓ Face visible: ${result.checks.faceVisible}`)
        console.log(`   ✓ Face size OK: ${result.checks.faceSizeOk}`)
        console.log(`   ✓ Blur score: ${result.checks.blurScore.toFixed(2)}`)
        console.log(`   ✓ Pose neutrality: ${result.checks.poseNeutrality.toFixed(2)}`)
        console.log(`   ✓ Lighting quality: ${result.checks.lightingQuality.toFixed(2)}`)
        console.log(`   ✓ Face occluded: ${result.checks.faceOcclusion}`)
        console.log(`   📋 Result: ${isValid ? '✅ PASS' : '❌ FAIL'}`)

        if (!isValid) {
            console.log(`   ⚠️ Issues: ${issues.join(', ')}`)
        }

        return result
    } catch (error) {
        console.error('❌ Quality gate analysis failed:', error)

        // Return fail-safe: allow processing but with warning
        return {
            isValid: true, // Don't block on analysis failure
            issues: ['Quality analysis failed - proceeding with caution'],
            checks: {
                faceVisible: true,
                faceSizeOk: true,
                blurScore: 0.5,
                poseNeutrality: 0.5,
                lightingQuality: 0.5,
                faceOcclusion: false
            },
            recommendation: 'Quality check could not be completed. Results may vary.'
        }
    }
}

/**
 * Log quality gate status for debugging
 */
export function logQualityGateStatus(sessionId: string, result: QualityCheckResult): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  STAGE 0: INPUT QUALITY GATE                                                  ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Status: ${result.isValid ? '✅ PASSED' : '❌ FAILED'}`.padEnd(80) + '║')
    console.log(`║  Face Visible: ${result.checks.faceVisible ? 'YES' : 'NO'}`.padEnd(80) + '║')
    console.log(`║  Face Size OK: ${result.checks.faceSizeOk ? 'YES' : 'NO'}`.padEnd(80) + '║')
    console.log(`║  Blur Score: ${(result.checks.blurScore * 100).toFixed(0)}%`.padEnd(80) + '║')
    console.log(`║  Pose Neutrality: ${(result.checks.poseNeutrality * 100).toFixed(0)}%`.padEnd(80) + '║')
    console.log(`║  Lighting Quality: ${(result.checks.lightingQuality * 100).toFixed(0)}%`.padEnd(80) + '║')
    if (result.issues.length > 0) {
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║  Issues:`.padEnd(80) + '║')
        for (const issue of result.issues) {
            console.log(`║    • ${issue}`.padEnd(80) + '║')
        }
    }
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
