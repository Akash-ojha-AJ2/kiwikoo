/**
 * RAG RETRIEVAL - Similarity Search for Similar Scenarios
 * 
 * Retrieves similar GOOD and BAD examples from database
 * for learning and avoiding past mistakes.
 */

import 'server-only'
import { createClient } from '@/lib/auth'
import { generateScenarioEmbedding } from './embeddings'
import type { UserAnalysis } from '../intelligence/user-analyzer'
import type { GarmentClassification } from '../intelligence/garment-classifier'

export interface RetrievalInput {
    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification
    similarityThreshold?: number
    maxGoodExamples?: number
    maxBadExamples?: number
}

export interface RetrievedExample {
    id: string
    rating: 'GOOD' | 'BAD'
    comment: string | null
    tags: string[]
    similarity: number

    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification
}

export interface RAGRetrievalResult {
    goodExamples: RetrievedExample[]
    badExamples: RetrievedExample[]
    retrievalTimeMs: number
}

/**
 * Retrieve similar scenarios from database
 */
export async function retrieveSimilarScenarios(
    input: RetrievalInput
): Promise<RAGRetrievalResult> {
    console.log('\n🔍 RAG RETRIEVAL: Searching for similar scenarios...')
    const startTime = Date.now()

    const {
        userAnalysis,
        garmentClassification,
        similarityThreshold = 0.75,
        maxGoodExamples = 5,
        maxBadExamples = 5
    } = input

    try {
        // Generate embedding for current scenario
        const queryEmbedding = await generateScenarioEmbedding({
            userAnalysis,
            garmentClassification
        })

        const supabase = await createClient()

        // Search for GOOD examples
        const { data: goodData, error: goodError } = await supabase
            .rpc('search_good_examples', {
                query_embedding: queryEmbedding as any,
                similarity_threshold: similarityThreshold,
                max_results: maxGoodExamples
            })

        if (goodError) {
            // Only log if it's not a missing function error (expected in development)
            if (!goodError.message?.includes('Could not find the function')) {
                console.error('Failed to retrieve good examples:', goodError)
            } else {
                // Expected: Database functions not set up yet - using real-world data only
                console.log('   ⚠️ Database RAG functions not available (using real-world data only)')
            }
        }

        // Search for BAD examples
        const { data: badData, error: badError } = await supabase
            .rpc('search_bad_examples', {
                query_embedding: queryEmbedding as any,
                similarity_threshold: similarityThreshold,
                max_results: maxBadExamples
            })

        if (badError) {
            // Only log if it's not a missing function error (expected in development)
            if (!badError.message?.includes('Could not find the function')) {
                console.error('Failed to retrieve bad examples:', badError)
            }
            // Don't log again if we already logged the warning above
        }

        const goodExamples: RetrievedExample[] = (goodData || []).map((row: any) => ({
            id: row.id,
            rating: 'GOOD',
            comment: row.comment,
            tags: row.tags || [],
            similarity: row.similarity,
            userAnalysis: row.user_analysis,
            garmentClassification: row.garment_classification
        }))

        const badExamples: RetrievedExample[] = (badData || []).map((row: any) => ({
            id: row.id,
            rating: 'BAD',
            comment: row.comment,
            tags: row.tags || [],
            similarity: row.similarity,
            userAnalysis: row.user_analysis,
            garmentClassification: row.garment_classification
        }))

        const elapsed = Date.now() - startTime

        console.log(`   ✓ Retrieved ${goodExamples.length} GOOD examples`)
        console.log(`   ✓ Retrieved ${badExamples.length} BAD examples`)
        console.log(`   ✓ Retrieval completed in ${elapsed}ms`)

        return {
            goodExamples,
            badExamples,
            retrievalTimeMs: elapsed
        }

    } catch (error) {
        console.error('RAG retrieval failed:', error)

        // Return empty results on error (don't block generation)
        return {
            goodExamples: [],
            badExamples: [],
            retrievalTimeMs: Date.now() - startTime
        }
    }
}

/**
 * Get failure patterns relevant to current scenario
 */
export async function getRelevantFailurePatterns(
    userAnalysis: UserAnalysis,
    garmentClassification: GarmentClassification
): Promise<any[]> {
    try {
        const supabase = await createClient()

        // Get recent failure patterns
        const { data, error } = await supabase
            .from('tryon_failure_patterns')
            .select('*')
            .order('last_seen', { ascending: false })
            .limit(10)

        if (error) {
            // Only log if it's not a missing table error (expected in development)
            if (!error.message?.includes("Could not find the table")) {
                console.error('Failed to get failure patterns:', error)
            }
            // Expected: Table not set up yet - return empty array
            return []
        }

        // Filter by relevance (simple matching for now)
        const relevant = (data || []).filter((pattern: any) => {
            const userMatch =
                pattern.user_characteristics.face_shape === userAnalysis.face.shape ||
                pattern.user_characteristics.body_type === userAnalysis.body.type

            const garmentMatch =
                pattern.garment_characteristics.category === garmentClassification.category ||
                pattern.garment_characteristics.hemline === garmentClassification.hemline_position

            return userMatch && garmentMatch
        })

        console.log(`   ✓ Found ${relevant.length} relevant failure patterns`)

        return relevant

    } catch (error) {
        console.error('Failed to get failure patterns:', error)
        return []
    }
}
