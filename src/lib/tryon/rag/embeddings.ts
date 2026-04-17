/**
 * RAG EMBEDDINGS - Scenario Embedding Generation
 * 
 * Converts scenarios into vector embeddings for similarity search.
 * Uses OpenAI text-embedding-ada-002 (1536 dimensions).
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import type { UserAnalysis } from '../intelligence/user-analyzer'
import type { GarmentClassification } from '../intelligence/garment-classifier'

export interface ScenarioEmbeddingInput {
    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification
    rating?: 'GOOD' | 'BAD'
    comment?: string
    tags?: string[]
}

/**
 * Generate a textual description of the scenario for embedding
 */
export function buildScenarioText(input: ScenarioEmbeddingInput): string {
    const { userAnalysis, garmentClassification, rating, comment, tags } = input

    // Build comprehensive scenario description
    const parts: string[] = []

    // User characteristics
    parts.push(`User characteristics:`)
    parts.push(`- Face shape: ${userAnalysis.face.shape}`)
    parts.push(`- Skin tone: ${userAnalysis.face.skin_tone_description}`)
    parts.push(`- Body type: ${userAnalysis.body.type}`)
    parts.push(`- Weight category: ${userAnalysis.body.estimated_weight_category}`)
    parts.push(`- Shoulder width: ${userAnalysis.body.shoulder_width}`)
    parts.push(`- Pose: ${userAnalysis.pose.type}`)

    if (userAnalysis.accessories.glasses) {
        parts.push(`- Has glasses: ${userAnalysis.accessories.glasses_type}`)
    }

    // Garment characteristics
    parts.push(`\nGarment characteristics:`)
    parts.push(`- Type: ${garmentClassification.category}`)
    parts.push(`- Hemline position: ${garmentClassification.hemline_position}`)
    parts.push(`- Pattern: ${garmentClassification.pattern_type}`)
    parts.push(`- Pattern scale: ${garmentClassification.pattern_scale}`)
    parts.push(`- Primary color: ${garmentClassification.primary_color_name}`)
    parts.push(`- Collar: ${garmentClassification.collar_type}`)
    parts.push(`- Sleeves: ${garmentClassification.sleeve_type}`)

    // Rating and feedback (if provided)
    if (rating) {
        parts.push(`\nOutcome: ${rating}`)
    }

    if (comment) {
        parts.push(`Issue: ${comment}`)
    }

    if (tags && tags.length > 0) {
        parts.push(`Tags: ${tags.join(', ')}`)
    }

    return parts.join('\n')
}

/**
 * Generate embedding vector from scenario text
 */
export async function generateScenarioEmbedding(
    input: ScenarioEmbeddingInput
): Promise<number[]> {
    console.log('🔢 Generating scenario embedding...')
    const startTime = Date.now()

    const openai = getGeminiChat()

    try {
        // Build text representation
        const scenarioText = buildScenarioText(input)

        // Generate embedding
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: scenarioText,
            encoding_format: 'float'
        })

        const embedding = response.data[0].embedding
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

        console.log(`   ✓ Embedding generated: ${embedding.length} dimensions in ${elapsed}s`)

        return embedding

    } catch (error) {
        console.error('Embedding generation failed:', error)
        throw error
    }
}

/**
 * Generate embedding for a failure pattern
 */
export async function generateFailurePatternEmbedding(
    patternType: string,
    patternDescription: string,
    userCharacteristics: any,
    garmentCharacteristics: any
): Promise<number[]> {
    console.log('🔢 Generating failure pattern embedding...')

    const openai = getGeminiChat()

    const text = `
Failure Pattern: ${patternType}
Description: ${patternDescription}

User: ${JSON.stringify(userCharacteristics)}
Garment: ${JSON.stringify(garmentCharacteristics)}
`.trim()

    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
            encoding_format: 'float'
        })

        return response.data[0].embedding

    } catch (error) {
        console.error('Failure pattern embedding failed:', error)
        throw error
    }
}

/**
 * Batch generate embeddings for multiple scenarios
 */
export async function generateBatchEmbeddings(
    inputs: ScenarioEmbeddingInput[]
): Promise<number[][]> {
    console.log(`🔢 Generating ${inputs.length} embeddings in batch...`)
    const startTime = Date.now()

    const openai = getGeminiChat()

    try {
        const texts = inputs.map(buildScenarioText)

        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: texts,
            encoding_format: 'float'
        })

        const embeddings = response.data.map((item: { embedding: number[] }) => item.embedding)
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

        console.log(`   ✓ ${embeddings.length} embeddings generated in ${elapsed}s`)

        return embeddings

    } catch (error) {
        console.error('Batch embedding generation failed:', error)
        throw error
    }
}
