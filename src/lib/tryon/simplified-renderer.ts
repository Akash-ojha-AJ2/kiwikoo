/**
 * SIMPLIFIED FACE-FIRST RENDERER
 * 
 * This renderer prioritizes FACE IDENTITY above everything else.
 * Uses a short, focused prompt instead of verbose constraints.
 * 
 * KEY PRINCIPLE: Short prompt = Better model focus = Better face consistency
 */

import 'server-only'
import { extractGarmentIfNeeded } from './garment-extraction'
import { classifyGarment } from './intelligence/garment-classifier'
import { buildFaceFirstPrompt, FACE_FIRST } from './face-first-identity'
import { SAFETY_CONSTRAINTS, GARMENT_SCOPE_DETECTION } from './safety-constraints'
import { GoogleGenAI } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'

const getClient = () => new GoogleGenAI({ apiKey: getGeminiKey() })

export interface SimplifiedTryOnOptions {
    userImageBase64: string
    garmentImageBase64: string
    quality: 'fast' | 'high'
    aspectRatio?: string
}

/**
 * Simplified face-first try-on renderer
 * 
 * This uses a SHORT, FOCUSED prompt that prioritizes face identity.
 * No verbose constraints, no redundant rules - just the essentials.
 */
export async function renderTryOnSimplified(
    options: SimplifiedTryOnOptions
): Promise<string> {
    console.log('\n' + '═'.repeat(80))
    console.log('🧊 SIMPLIFIED FACE-FIRST TRY-ON (IDENTITY PRIORITY)')
    console.log('═'.repeat(80))

    const isPro = options.quality === 'high'
    const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image'

    console.log(`   Model: ${model}`)
    console.log(`   Mode: FACE-FIRST (Identity > Everything)`)

    // ═══ GARMENT EXTRACTION ═══
    const garmentResult = await extractGarmentIfNeeded(options.garmentImageBase64)
    const garmentClass = await classifyGarment(garmentResult.extractedGarmentBase64)

    console.log(`   Garment: ${garmentClass.category} (${garmentClass.hemline_position})`)

    // ═══ BUILD SHORT, FOCUSED PROMPT ═══
    const faceFirstPrompt = buildFaceFirstPrompt()

    const prompt = `
${faceFirstPrompt}

═══════════════════════════════════════════════════════════════
📋 TASK INSTRUCTIONS
═══════════════════════════════════════════════════════════════

Image 1 = THE PERSON (their face, their body, their identity)
Image 2 = THE GARMENT (extract only: fabric, color, pattern, cut)

YOUR TASK:
Put the garment from Image 2 onto the person from Image 1.

RULES:
1. The face in output MUST be the EXACT same face as Image 1
2. The body in output MUST match the body proportions of Image 1
3. The garment must be from Image 2: ${garmentClass.category}, hemline at ${garmentClass.hemline_position}
4. Background should feel natural and lived-in

${SAFETY_CONSTRAINTS}

${GARMENT_SCOPE_DETECTION}

═══════════════════════════════════════════════════════════════
🔴 GARMENT DETAILS (FROM IMAGE 2)
═══════════════════════════════════════════════════════════════

Type: ${garmentClass.category}
Hemline: ${garmentClass.hemline_position}
Description: ${garmentClass.hemline_description}

Copy the EXACT length from Image 2. Do not extend or shorten.

═══════════════════════════════════════════════════════════════
✅ FINAL CHECK (ASK YOURSELF)
═══════════════════════════════════════════════════════════════

Before outputting, verify:
□ Is this the SAME PERSON as Image 1? (not similar, SAME)
□ Is the face preserved with exact geometry?
□ Is the body proportionally correct?
□ Is the garment correct type and length?

If ANY answer is NO → regenerate with stricter face lock.

🧊 REMEMBER: Identity > Realism > Garment > Background > Style
`.trim()

    // Log prompt length for debugging
    console.log(`   Prompt length: ${prompt.length} characters`)

    // ═══ GENERATE ═══
    const client = getClient()

    const cleanUser = options.userImageBase64.replace(/^data:image\/\w+;base64,/, '')
    const cleanGarment = garmentResult.extractedGarmentBase64.replace(/^data:image\/\w+;base64,/, '')

    const response = await client.models.generateContent({
        model,
        contents: [{
            role: 'user',
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: cleanUser } },
                { inlineData: { mimeType: 'image/jpeg', data: cleanGarment } }
            ]
        }],
        config: {
            temperature: 0.01, // Very low for consistency
            candidateCount: 1,
            imageConfig: { aspectRatio: options.aspectRatio || '3:4' } as any
        }
    })

    const imageData = response.candidates?.[0]?.content?.parts?.find((p: any) =>
        p.inlineData?.mimeType?.startsWith('image/')
    )?.inlineData?.data

    if (!imageData) {
        throw new Error('No image returned from Gemini')
    }

    console.log('✅ Generation complete (Face-First Mode)')

    return imageData
}

export default renderTryOnSimplified
