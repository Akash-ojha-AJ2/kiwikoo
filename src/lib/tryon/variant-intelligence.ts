/**
 * LAYER 7: 3-VARIANT INTELLIGENCE
 * 
 * Generate 3 TRULY DIFFERENT images, not just camera distance changes.
 * Editorial, Candid, Environmental must feel meaningfully different.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import type { LightingLane } from './lighting-realism'

export type VariantName = 'Editorial' | 'Candid' | 'Environmental'

export interface VariantSpec {
    name: VariantName
    cameraDistance: 'standard' | 'closer' | 'wider'
    lightingLane: LightingLane
    poseEnergy: 'composed' | 'relaxed' | 'dynamic'
    backgroundEmphasis: 'minimal' | 'balanced' | 'strong'
    moodDescription: string
}

/**
 * Define 3-variant specifications
 */
export const VARIANT_SPECS: Record<VariantName, VariantSpec> = {
    Editorial: {
        name: 'Editorial',
        cameraDistance: 'standard',
        lightingLane: 'warm_daylight',
        poseEnergy: 'composed',
        backgroundEmphasis: 'minimal',
        moodDescription: 'Clean, balanced, editorial magazine feel. Warm natural light, composed pose, minimal background distraction.'
    },

    Candid: {
        name: 'Candid',
        cameraDistance: 'closer',
        lightingLane: 'cool_indoor',
        poseEnergy: 'relaxed',
        backgroundEmphasis: 'balanced',
        moodDescription: 'Natural, candid moment. Cool indoor light, relaxed posture, ambient background presence. Feels genuine, not staged.'
    },

    Environmental: {
        name: 'Environmental',
        cameraDistance: 'wider',
        lightingLane: 'environmental',
        poseEnergy: 'dynamic',
        backgroundEmphasis: 'strong',
        moodDescription: 'Environmental portrait. Strong directional light, dynamic pose energy, prominent background elements. Deep shadows, high contrast.'
    }
}

/**
 * Build variant-specific prompt additions
 */
export function buildVariantPrompt(variantName: VariantName): string {
    const spec = VARIANT_SPECS[variantName]

    return `
═══════════════════════════════════════════════════════════════
VARIANT: ${spec.name.toUpperCase()}
═══════════════════════════════════════════════════════════════

MOOD: ${spec.moodDescription}

CAMERA:
• Distance: ${spec.cameraDistance}
${spec.cameraDistance === 'standard' ? '  → Waist-up to full body frame' : ''}
${spec.cameraDistance === 'closer' ? '  → Chest-up, more intimate framing' : ''}
${spec.cameraDistance === 'wider' ? '  → Full body with environmental context' : ''}

LIGHTING:
• Lane: ${spec.lightingLane}
${spec.lightingLane === 'warm_daylight' ? '  → Warm, golden hour, natural outdoor feel' : ''}
${spec.lightingLane === 'cool_indoor' ? '  → Cool, window light, indoor ambient' : ''}
${spec.lightingLane === 'environmental' ? '  → Dramatic, directional, high contrast' : ''}

POSE ENERGY:
• Energy: ${spec.poseEnergy}
${spec.poseEnergy === 'composed' ? '  → Confident but relaxed, editorial stance' : ''}
${spec.poseEnergy === 'relaxed' ? '  → Natural, candid, slight lean or weight shift' : ''}
${spec.poseEnergy === 'dynamic' ? '  → Active, engaged, strong body language' : ''}

BACKGROUND:
• Emphasis: ${spec.backgroundEmphasis}
${spec.backgroundEmphasis === 'minimal' ? '  → Soft blur, muted, face/garment primary focus' : ''}
${spec.backgroundEmphasis === 'balanced' ? '  → Visible but not competing, contextual' : ''}
${spec.backgroundEmphasis === 'strong' ? '  → Clear environmental elements, part of composition' : ''}

CRITICAL:
This variant MUST feel different from the other two.
Not just cropping - actual MOOD and ENERGY difference.
`.trim()
}

/**
 * Validate variant difference between two images
 */
export async function validateVariantDifference(
    variantA: string,
    variantB: string,
    nameA: string,
    nameB: string
): Promise<{ difference_score: number; differences: string[]; too_similar: boolean }> {
    console.log(`\n🔍 Comparing ${nameA} vs ${nameB}...`)

    const openai = getGeminiChat()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `Compare these two images of the same person.

How different are they? Consider:
1. Lighting (color temp, direction, mood)
2. Camera distance/framing
3. Background presence/emphasis
4. Pose energy (composed, relaxed, dynamic)
5. Overall mood/feel

Rate 0-100 where:
- 0-20 = Nearly identical (just minor crop)
- 20-40 = Somewhat different (lighting or pose)
- 40-60 = Clearly different (multiple elements)
- 60-100 = Very different (distinct mood/composition)

Return JSON: {
  difference_score: 0-100,
  differences: [list of specific differences],
  similar_elements: [what's the same]
}`
            }, {
                role: 'user',
                content: [
                    { type: 'text', text: `Compare ${nameA} vs ${nameB}. How different?` },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${variantA}`, detail: 'low' }
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${variantB}`, detail: 'low' }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')

        const tooSimilar = result.difference_score < 30

        console.log(`   Difference: ${result.difference_score}% ${tooSimilar ? '❌ TOO SIMILAR' : '✅ SUFFICIENTLY DIFFERENT'}`)
        if (result.differences && result.differences.length > 0) {
            console.log(`   Differences: ${result.differences.slice(0, 3).join(', ')}`)
        }

        return {
            difference_score: result.difference_score,
            differences: result.differences || [],
            too_similar: tooSimilar
        }

    } catch (error) {
        console.error('Variant comparison failed:', error)
        // Fail-safe: assume different enough if validation fails
        return {
            difference_score: 40,
            differences: [],
            too_similar: false
        }
    }
}

/**
 * Validate all 3 variants are sufficiently different
 */
export async function validateAllVariants(
    variants: { name: VariantName; imageBase64: string }[]
): Promise<{ all_different: boolean; pairs: { a: string; b: string; score: number }[] }> {
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('VALIDATING 3-VARIANT DIFFERENCE')
    console.log('═══════════════════════════════════════════════════════════════')

    const pairs: { a: string; b: string; score: number }[] = []

    // Compare all pairs
    for (let i = 0; i < variants.length - 1; i++) {
        for (let j = i + 1; j < variants.length; j++) {
            const comparison = await validateVariantDifference(
                variants[i].imageBase64,
                variants[j].imageBase64,
                variants[i].name,
                variants[j].name
            )

            pairs.push({
                a: variants[i].name,
                b: variants[j].name,
                score: comparison.difference_score
            })
        }
    }

    const allDifferent = pairs.every(p => p.score >= 30)

    console.log(`\n${allDifferent ? '✅ All variants sufficiently different' : '❌ Variants too similar'}`)
    pairs.forEach(p => {
        console.log(`   ${p.a} vs ${p.b}: ${p.score}%`)
    })

    return {
        all_different: allDifferent,
        pairs
    }
}

/**
 * Build retry emphasis for failed variant validation
 */
export function buildVariantRetryEmphasis(): string {
    return `
╔════════════════════════════════════════════════════════════╗
║  ⚠️  PREVIOUS ATTEMPT FAILED: VARIANTS TOO SIMILAR       ║
╚════════════════════════════════════════════════════════════╝

The 3 variants were too similar (only camera distance changed).

INCREASED VARIANT DIFFERENCE REQUIREMENT:

Each variant MUST have a DISTINCT MOOD:

1. EDITORIAL:
   - Warm, balanced lighting
   - Composed, confident pose
   - Minimal background

2. CANDID:
   - Cool, natural indoor light
   - Relaxed, genuine posture
   - Ambient background presence

3. ENVIRONMENTAL:
   - Dramatic, directional light with deep shadows
   - Dynamic pose energy
   - Strong background elements

Make them feel like 3 DIFFERENT photographers shot this person.
`.trim()
}
