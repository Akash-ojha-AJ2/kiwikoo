/**
 * IMAGE COMPLEXITY ANALYZER
 * 
 * Analyzes input images to detect complexity factors that may affect
 * generation quality. Provides alerts and recommendations to users.
 * 
 * COMPLEXITY FACTORS:
 * - Unusual poses (extreme angles, partial visibility)
 * - Complex backgrounds (busy, high detail)
 * - Unusual lighting (extreme contrast, mixed sources)
 * - Accessories that may conflict with garment
 * - Face occlusion (hair, hands, objects)
 * - Multiple people in frame
 * - Low image quality
 */

import 'server-only'
import OpenAI from 'openai'

const getOpenAIClient = () => new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
})

// ═══════════════════════════════════════════════════════════════
// COMPLEXITY RESULT TYPE
// ═══════════════════════════════════════════════════════════════

export interface ComplexityFactor {
    factor: string
    severity: 'low' | 'medium' | 'high'
    description: string
    recommendation: string
}

export interface ComplexityAnalysisResult {
    overallComplexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
    complexityScore: number // 0-100
    canProcess: boolean
    factors: ComplexityFactor[]
    alerts: string[]
    recommendations: string[]
    estimatedSuccessRate: number // 0-100
}

// ═══════════════════════════════════════════════════════════════
// COMPLEXITY ANALYSIS PROMPT
// ═══════════════════════════════════════════════════════════════

const COMPLEXITY_ANALYSIS_SYSTEM = `You are an expert image analyst for a virtual try-on system.

Your job is to analyze an input image and determine how COMPLEX it will be for AI image generation.

COMPLEXITY FACTORS TO CHECK:

1. POSE COMPLEXITY
   - Simple: Standing front-facing, neutral pose
   - Complex: Arms crossed, hands on face, unusual angles
   - Very Complex: Extreme poses, partial body, obscured limbs

2. BACKGROUND COMPLEXITY
   - Simple: Solid color, blur, studio
   - Complex: Detailed indoor/outdoor scene
   - Very Complex: Busy street, multiple objects, high detail

3. LIGHTING COMPLEXITY
   - Simple: Even, front-lit, studio lighting
   - Complex: Side-lit, mixed lighting
   - Very Complex: Extreme contrast, harsh shadows, backlighting

4. FACE VISIBILITY
   - Simple: Face fully visible, front-facing
   - Complex: Side profile, tilted head
   - Very Complex: Partially obscured, hair covering face, hands on face

5. ACCESSORIES COMPLEXITY
   - Simple: None or minimal
   - Complex: Necklace, earrings, scarf
   - Very Complex: Glasses, masks, large jewelry, items that may conflict

6. IMAGE QUALITY
   - Simple: High resolution, sharp, well-exposed
   - Complex: Moderate quality, some blur
   - Very Complex: Low quality, blurry, noisy, poorly exposed

7. GARMENT INTERFERENCE
   - Simple: Simple top/dress, minimal details
   - Complex: Layered clothing, patterns
   - Very Complex: Traditional complex garments (sarees, etc.)

For each factor, assess severity and provide specific recommendations.`

const COMPLEXITY_ANALYSIS_USER = `Analyze this image for virtual try-on complexity.

Output a JSON object with:
{
  "overallComplexity": "simple" | "moderate" | "complex" | "very_complex",
  "complexityScore": 0-100 (0=simplest, 100=most complex),
  "canProcess": true/false (false if extremely complex),
  
  "factors": [
    {
      "factor": "name of factor",
      "severity": "low" | "medium" | "high",
      "description": "what makes it complex",
      "recommendation": "how to work around it"
    }
  ],
  
  "alerts": [
    "User-facing alert messages for complex factors"
  ],
  
  "recommendations": [
    "User-facing recommendations to improve results"
  ],
  
  "estimatedSuccessRate": 0-100 (estimated % chance of good result)
}

Be honest about complexity. If the image will be difficult, say so.
The goal is to set realistic expectations for the user.`

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function analyzeImageComplexity(
    imageBase64: string,
    sessionId: string
): Promise<ComplexityAnalysisResult> {
    const client = getOpenAIClient()

    console.log(`\n🔍 IMAGE COMPLEXITY ANALYSIS [${sessionId}]`)
    console.log(`   Checking for difficult generation factors...`)

    const startTime = Date.now()

    try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: COMPLEXITY_ANALYSIS_SYSTEM
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
                            text: COMPLEXITY_ANALYSIS_USER
                        }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content || '{}'

        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            console.log(`   ⚠️ Could not parse complexity analysis`)
            return getDefaultComplexityResult()
        }

        const result = JSON.parse(jsonMatch[0]) as ComplexityAnalysisResult

        const elapsed = Date.now() - startTime
        console.log(`   ✅ Complexity analysis complete in ${elapsed}ms`)
        console.log(`   📊 Overall: ${result.overallComplexity}`)
        console.log(`   📊 Score: ${result.complexityScore}/100`)
        console.log(`   📊 Success rate: ${result.estimatedSuccessRate}%`)
        console.log(`   📊 Can process: ${result.canProcess ? 'YES' : 'NO'}`)

        if (result.alerts.length > 0) {
            console.log(`   ⚠️ Alerts:`)
            result.alerts.forEach(alert => console.log(`      - ${alert}`))
        }

        return result
    } catch (error) {
        console.error(`   ❌ Complexity analysis failed:`, error)
        return getDefaultComplexityResult()
    }
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT RESULT
// ═══════════════════════════════════════════════════════════════

function getDefaultComplexityResult(): ComplexityAnalysisResult {
    return {
        overallComplexity: 'moderate',
        complexityScore: 50,
        canProcess: true,
        factors: [],
        alerts: [],
        recommendations: [],
        estimatedSuccessRate: 70
    }
}

// ═══════════════════════════════════════════════════════════════
// GENERATE USER-FACING COMPLEXITY ALERT
// ═══════════════════════════════════════════════════════════════

export function generateComplexityPromptModifier(result: ComplexityAnalysisResult): string {
    if (result.overallComplexity === 'simple') {
        return '' // No modifier needed
    }

    let modifier = `
════════════════════════════════════════════════════════════════════════════════
⚠️ COMPLEXITY HANDLING — THIS IMAGE HAS CHALLENGING ELEMENTS
════════════════════════════════════════════════════════════════════════════════

Complexity factors detected:
`

    for (const factor of result.factors) {
        if (factor.severity === 'high' || factor.severity === 'medium') {
            modifier += `• ${factor.factor}: ${factor.description}\n`
            modifier += `  → ${factor.recommendation}\n`
        }
    }

    modifier += `
SPECIAL HANDLING REQUIRED:
• Pay extra attention to face preservation
• Be conservative with pose changes
• Preserve original lighting direction
• Do NOT simplify the image

`

    return modifier
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPE FOR FRONTEND
// ═══════════════════════════════════════════════════════════════

export interface ComplexityAlertResponse {
    showAlert: boolean
    alertType: 'info' | 'warning' | 'error'
    title: string
    message: string
    factors: string[]
    recommendations: string[]
    estimatedSuccessRate: number
}

export function createComplexityAlertResponse(result: ComplexityAnalysisResult): ComplexityAlertResponse {
    if (result.overallComplexity === 'simple') {
        return {
            showAlert: false,
            alertType: 'info',
            title: '',
            message: '',
            factors: [],
            recommendations: [],
            estimatedSuccessRate: result.estimatedSuccessRate
        }
    }

    let alertType: 'info' | 'warning' | 'error' = 'info'
    let title = ''
    let message = ''

    if (result.overallComplexity === 'moderate') {
        alertType = 'info'
        title = 'Moderate Complexity Detected'
        message = 'Some elements in your photo may affect results. We\'ll do our best!'
    } else if (result.overallComplexity === 'complex') {
        alertType = 'warning'
        title = 'Complex Image Detected'
        message = 'This photo has some challenging elements. Results may vary.'
    } else if (result.overallComplexity === 'very_complex' || !result.canProcess) {
        alertType = 'error'
        title = 'Very Complex Image'
        message = 'This photo is quite challenging. Consider using a simpler photo for better results.'
    }

    return {
        showAlert: true,
        alertType,
        title,
        message,
        factors: result.alerts,
        recommendations: result.recommendations,
        estimatedSuccessRate: result.estimatedSuccessRate
    }
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logComplexityAnalysis(result: ComplexityAnalysisResult, sessionId: string): void {
    console.log(`\n📊 COMPLEXITY SUMMARY [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   Overall: ${result.overallComplexity.toUpperCase()}`)
    console.log(`   Score: ${result.complexityScore}/100`)
    console.log(`   Success rate: ${result.estimatedSuccessRate}%`)

    if (result.factors.length > 0) {
        console.log(`   Factors:`)
        result.factors.forEach(f => {
            const icon = f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢'
            console.log(`      ${icon} ${f.factor}: ${f.severity}`)
        })
    }

    if (result.alerts.length > 0) {
        console.log(`   Alerts for user:`)
        result.alerts.forEach(a => console.log(`      ⚠️ ${a}`))
    }
}
