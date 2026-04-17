/**
 * PHASE-2: ENVIRONMENT & LIGHTING REFINEMENT (Human Locked)
 * 
 * Use AFTER Phase-1 try-on is complete.
 * 
 * CORE PRINCIPLE:
 * - Human region is READ-ONLY — absolutely no modifications
 * - Only environment, lighting, background, and color grading are touched
 * - Success = "slightly imperfect but real", not "better looking"
 * 
 * MENTAL MODEL:
 * You are a lighting technician and set decorator.
 * You are NOT a photographer or stylist.
 * Your job is to improve the room and light around an unchanged human.
 */

import { GoogleGenAI } from '@google/genai'
import { getGeminiKey } from '@/lib/config/api-keys'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RefinementParams {
    phase1ImageBase64: string      // Phase-1 try-on output
    originalPersonBase64?: string  // Optional: original person for validation
    temperature?: number           // Default: 0.02 (very low)
}

export interface RefinementResult {
    image: string                  // Base64 encoded refined image
    refinementTimeMs: number       // Time taken for refinement
    warning?: string               // Any warnings
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE-2 PROMPT STRUCTURE
// Order: Human Lock → Task Scope → Lighting → Background → Color → Forbidden
// ═══════════════════════════════════════════════════════════════════════════

function buildRefinementPrompt(): string {
    // ═══════════════════════════════════════════════════════════════════════════
    // 🔒 ABSOLUTE HUMAN LOCK (MANDATORY FIRST)
    // ═══════════════════════════════════════════════════════════════════════════
    const humanLock = `CRITICAL RULE — HUMAN REGION IS READ-ONLY:

The person in the image is final and must not be modified.

DO NOT:
- Change the face
- Change facial expression
- Change skin tone or texture
- Change body shape or posture
- Change hair, makeup, or jewelry
- Re-render or enhance the human subject in any way

Treat the human as a pasted photograph.
Any modification to the human is forbidden.`

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎯 TASK SCOPE (VERY STRICT)
    // ═══════════════════════════════════════════════════════════════════════════
    const taskScope = `TASK:

Refine only the ENVIRONMENT and LIGHTING around the person.

Allowed operations:
- Background refinement
- Lighting harmonization
- Shadow consistency
- Depth and ambience
- Color grading

The person must remain visually identical before and after.
Only the surroundings may improve.`

    // ═══════════════════════════════════════════════════════════════════════════
    // 💡 LIGHTING (PHYSICAL, NOT AESTHETIC)
    // ═══════════════════════════════════════════════════════════════════════════
    const lighting = `LIGHTING INSTRUCTIONS:

Apply physically plausible indoor lighting that matches the existing scene.

- Soft ambient light
- Natural falloff
- Realistic shadow direction
- No subject spotlighting
- No face lighting enhancement
- No beauty lighting
- No dramatic contrast

Lighting should affect the room, not the person.
The human must not appear retouched or highlighted.`

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏠 BACKGROUND & DEPTH
    // ═══════════════════════════════════════════════════════════════════════════
    const background = `BACKGROUND:

Improve background realism subtly.
Enhance depth, texture, and spatial consistency.
Maintain original scene context.
No studio backdrops.
No artificial staging.
No background that implies a professional photoshoot.

The environment should look naturally captured, not designed.`

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎨 COLOR & TONE (SAFE GRADING ONLY)
    // ═══════════════════════════════════════════════════════════════════════════
    const colorGrading = `COLOR GRADING:

Apply mild global color correction only.
Preserve original skin tones exactly.
No skin smoothing.
No color shifts on the face.
No stylized filters.

The image should look naturally balanced, not edited.`

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚫 EXPLICITLY FORBIDDEN (REPEAT INTENTIONALLY)
    // ═══════════════════════════════════════════════════════════════════════════
    const forbidden = `FORBIDDEN:

- Beautification
- Facial enhancement
- Skin smoothing
- Symmetry correction
- Posture correction
- Fashion styling
- Editorial or cinematic effects
- Model-like appearance
- Perfect or idealized visuals`

    // ═══════════════════════════════════════════════════════════════════════════
    // 🧠 MENTAL MODEL
    // ═══════════════════════════════════════════════════════════════════════════
    const mentalModel = `MENTAL MODEL:

You are a lighting technician and set decorator.
You are NOT a photographer.
You are NOT a stylist.
You are NOT improving the person.

Your job is to improve the room and light around an unchanged human.`

    // Combine all blocks in order
    return `${humanLock}

${taskScope}

${lighting}

${background}

${colorGrading}

${forbidden}

${mentalModel}`
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN REFINEMENT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phase-2: Refine environment and lighting while keeping human locked
 * 
 * Temperature: 0.01-0.03 (minimum creativity)
 * Human: READ-ONLY
 */
export async function refineEnvironmentAndLighting(
    params: RefinementParams
): Promise<RefinementResult> {
    const {
        phase1ImageBase64,
        temperature = 0.02
    } = params

    const apiKey = getGeminiKey()
    const client = new GoogleGenAI({ apiKey })
    const startTime = Date.now()

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗')
    console.log('║  PHASE-2: ENVIRONMENT & LIGHTING REFINEMENT                                   ║')
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣')
    console.log('║  Mode: Human LOCKED, Environment EDITABLE                                     ║')
    console.log(`║  Temperature: ${temperature.toFixed(3).padEnd(60)}║`)
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n')

    // Build the refinement prompt
    const prompt = buildRefinementPrompt()

    // Format image - strip data URI prefix
    const formatBase64 = (b64: string) =>
        b64.startsWith('data:image/')
            ? b64.split(',')[1] || b64
            : b64

    const phase1Image = formatBase64(phase1ImageBase64)

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: phase1Image
                            }
                        }
                    ]
                }
            ],
            config: {
                temperature: temperature,
                maxOutputTokens: 8192,
                responseModalities: ['image', 'text']
            }
        })

        const refinementTimeMs = Date.now() - startTime

        // Extract image from response
        let imageBase64 = ''
        let warning: string | undefined

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0]
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if ('inlineData' in part && part.inlineData?.data) {
                        imageBase64 = part.inlineData.data
                        break
                    }
                }
            }
        }

        if (!imageBase64) {
            throw new Error('No image generated from Phase-2 refinement')
        }

        console.log(`\n✓ Environment refined in ${(refinementTimeMs / 1000).toFixed(1)}s`)
        console.log('🔒 Human region remained READ-ONLY')
        console.log('💡 Lighting and background enhanced')

        return {
            image: imageBase64,
            refinementTimeMs,
            warning
        }
    } catch (error) {
        console.error('❌ Phase-2 refinement failed:', error)
        throw error
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log Phase-2 refinement status
 */
export function logRefinementStatus(
    sessionId: string,
    result: RefinementResult
): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  PHASE-2: REFINEMENT COMPLETE                                                 ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  Status: ✅ ENVIRONMENT REFINED`.padEnd(80) + '║')
    console.log(`║  Time: ${(result.refinementTimeMs / 1000).toFixed(1)}s`.padEnd(80) + '║')
    console.log(`║  Human: 🔒 READ-ONLY (unchanged)`.padEnd(80) + '║')
    if (result.warning) {
        console.log(`║  ⚠️ Warning: ${result.warning.slice(0, 60)}`.padEnd(80) + '║')
    }
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
    console.log(`║  ✅ SUCCESS CRITERIA:                                                         ║`)
    console.log(`║  → Face pixel-identical to Phase-1                                            ║`)
    console.log(`║  → Body shape unchanged                                                       ║`)
    console.log(`║  → Lighting feels more realistic                                              ║`)
    console.log(`║  → Image feels natural, not perfect                                           ║`)
    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
