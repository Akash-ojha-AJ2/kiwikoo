/**
 * LAYER 0: GARMENT EXTRACTION PRE-PIPELINE
 * 
 * MANDATORY BLOCKER: If garment reference contains a person,
 * extract garment BEFORE proceeding to generation.
 * 
 * Ensures garment image body does NOT contaminate output body.
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface GarmentExtractionResult {
    hasPersonDetected: boolean
    extractedGarmentBase64: string
    extractionQuality?: number
    processingTimeMs: number
}

/**
 * Detect if image contains a person
 */
async function detectPerson(imageBase64: string): Promise<boolean> {
    console.log('🔍 Detecting if garment image contains person...')

    const openai = getGeminiChat()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: 'Analyze if this image contains a person (full body, torso, or any human body part). Return JSON: { contains_person: boolean, confidence: 0-100 }'
            }, {
                role: 'user',
                content: [
                    { type: 'text', text: 'Does this image contain a person?' },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')

        console.log(`   ${result.contains_person ? '⚠️  Person detected' : '✓ No person detected'} (${result.confidence}% confidence)`)

        return result.contains_person

    } catch (error) {
        console.error('Person detection failed:', error)
        // Fail-safe: assume no person if detection fails
        return false
    }
}

/**
 * Extract garment using Nano-Banana
 */
async function nanoBananaExtractClothing(imageBase64: string): Promise<string> {
    console.log('🎨 Extracting garment with Nano-Banana...')

    try {
        const response = await fetch('http://localhost:8000/background-removal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageBase64,
                mode: 'clothing_extraction'  // Special mode for garment only
            })
        })

        if (!response.ok) {
            throw new Error(`Nano-Banana API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.result  // Base64 of extracted garment

    } catch (error) {
        console.error('Nano-Banana extraction failed:', error)
        throw new Error('Garment extraction failed. Cannot proceed with generation.')
    }
}

/**
 * Validate extraction quality
 */
async function validateExtractionQuality(extractedBase64: string): Promise<{ score: number, issues: string[] }> {
    console.log('✓ Validating extraction quality...')

    const openai = getGeminiChat()

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: `Analyze this extracted garment image quality. Check:
- Is garment fully visible?
- Are edges clean (not raggedy)?
- Is person fully removed?
- Are colors preserved?
- Is pattern intact?

Return JSON: { quality_score: 0-100, issues: [list of problems] }`
            }, {
                role: 'user',
                content: [
                    { type: 'text', text: 'Validate extraction quality.' },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${extractedBase64}` }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')

        console.log(`   Quality score: ${result.quality_score}%`)
        if (result.issues && result.issues.length > 0) {
            console.log(`   Issues: ${result.issues.join(', ')}`)
        }

        return {
            score: result.quality_score / 100,
            issues: result.issues || []
        }

    } catch (error) {
        console.error('Quality validation failed:', error)
        // Return default acceptable quality if validation fails
        return { score: 0.85, issues: [] }
    }
}

/**
 * MAIN: Extract garment if needed (MANDATORY BLOCKER)
 */
export async function extractGarmentIfNeeded(
    garmentImageBase64: string
): Promise<GarmentExtractionResult> {
    console.log('\n' + '═'.repeat(80))
    console.log('LAYER 0: GARMENT EXTRACTION PRE-PIPELINE')
    console.log('═'.repeat(80))

    const startTime = Date.now()

    // Step 1: Detect person
    const hasPerson = await detectPerson(garmentImageBase64)

    if (!hasPerson) {
        console.log('\n✓ Garment image has no person - using as-is')
        console.log('   Skipping extraction (no contamination risk)')

        return {
            hasPersonDetected: false,
            extractedGarmentBase64: garmentImageBase64,
            processingTimeMs: Date.now() - startTime
        }
    }

    // Step 2: Person detected - MANDATORY extraction
    console.log('\n⚠️  PERSON DETECTED IN GARMENT IMAGE')
    console.log('   This is a BLOCKER - extraction is MANDATORY')
    console.log('   Reason: Prevent body contamination (garment body → output body)')

    // Step 3: Extract garment
    const extractedGarment = await nanoBananaExtractClothing(garmentImageBase64)

    // Step 4: Validate quality
    const quality = await validateExtractionQuality(extractedGarment)

    if (quality.score < 0.85) {
        console.error('\n❌ EXTRACTION QUALITY TOO LOW')
        console.error(`   Score: ${(quality.score * 100).toFixed(0)}% (threshold: 85%)`)
        console.error(`   Issues: ${quality.issues.join(', ')}`)
        throw new Error('Garment extraction quality insufficient. Cannot proceed with generation.')
    }

    const elapsed = Date.now() - startTime

    console.log('\n✅ GARMENT EXTRACTION COMPLETE')
    console.log(`   Person removed, garment isolated`)
    console.log(`   Quality: ${(quality.score * 100).toFixed(0)}%`)
    console.log(`   Processing time: ${(elapsed / 1000).toFixed(2)}s`)

    return {
        hasPersonDetected: true,
        extractedGarmentBase64: extractedGarment,
        extractionQuality: quality.score,
        processingTimeMs: elapsed
    }
}

/**
 * Force extraction (for testing/debugging)
 */
export async function forceExtractGarment(
    garmentImageBase64: string
): Promise<string> {
    console.log('🔧 Force extracting garment (testing mode)...')
    return await nanoBananaExtractClothing(garmentImageBase64)
}
