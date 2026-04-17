/**
 * RAG PIPELINE - Main Orchestrator for RAG System
 * 
 * Integrates retrieval, context building, and feedback storage
 * into the intelligent try-on pipeline.
 */

import 'server-only'
import type { UserAnalysis } from '../intelligence/user-analyzer'
import type { GarmentClassification } from '../intelligence/garment-classifier'
import type { FaceValidationResult } from '../intelligence/face-guardrail'
import type { GarmentValidationResult } from '../intelligence/garment-guardrail'

import { retrieveSimilarScenarios, getRelevantFailurePatterns } from './retrieval'
import { buildRAGContext, buildRAGSummary } from './context-builder'
import { storeFeedback, autoCreateFailureFeedback, type FeedbackInput } from './storage'

export interface RAGPipelineInput {
    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification
}

export interface RAGPipelineResult {
    ragContext: string
    ragSummary: string
    goodExamplesCount: number
    badExamplesCount: number
    failurePatternsCount: number
}

/**
 * Run RAG pipeline to get context for generation
 */
export async function runRAGPipeline(
    input: RAGPipelineInput
): Promise<RAGPipelineResult> {
    console.log('\n' + '═'.repeat(80))
    console.log('🧠 RAG PIPELINE: Retrieving learned knowledge')
    console.log('═'.repeat(80))

    const startTime = Date.now()

    try {
        // 1. Retrieve similar scenarios
        const { goodExamples, badExamples } = await retrieveSimilarScenarios({
            userAnalysis: input.userAnalysis,
            garmentClassification: input.garmentClassification,
            similarityThreshold: 0.75,
            maxGoodExamples: 5,
            maxBadExamples: 5
        })

        // 2. Get relevant failure patterns
        const failurePatterns = await getRelevantFailurePatterns(
            input.userAnalysis,
            input.garmentClassification
        )

        // 3. Build RAG context for prompt
        const ragContext = buildRAGContext({
            goodExamples,
            badExamples,
            currentGarmentType: input.garmentClassification.category
        })

        // 4. Build summary
        const ragSummary = buildRAGSummary({
            goodExamples,
            badExamples,
            currentGarmentType: input.garmentClassification.category
        })

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

        console.log('\n📊 RAG PIPELINE RESULTS:')
        console.log(`   ✓ Good examples: ${goodExamples.length}`)
        console.log(`   ✓ Bad examples: ${badExamples.length}`)
        console.log(`   ✓ Failure patterns: ${failurePatterns.length}`)
        console.log(`   ✓ Summary: ${ragSummary}`)
        console.log(`   ✓ RAG pipeline completed in ${elapsed}s`)

        return {
            ragContext,
            ragSummary,
            goodExamplesCount: goodExamples.length,
            badExamplesCount: badExamples.length,
            failurePatternsCount: failurePatterns.length
        }

    } catch (error) {
        console.error('RAG pipeline failed:', error)

        // Return empty context on failure (don't block generation)
        return {
            ragContext: '',
            ragSummary: 'RAG retrieval failed',
            goodExamplesCount: 0,
            badExamplesCount: 0,
            failurePatternsCount: 0
        }
    }
}

/**
 * Store feedback after generation
 */
export async function saveFeedbackToRAG(input: FeedbackInput) {
    return storeFeedback(input)
}

/**
 * Auto-save bad feedback from validation failures
 */
export async function autoSaveBadFeedback(
    userId: string,
    feedbackData: Omit<FeedbackInput, 'userId' | 'rating'>
) {
    return autoCreateFailureFeedback(userId, feedbackData)
}

// Re-export types
export type { FeedbackInput, StoreFeedbackResult } from './storage'
export type { RetrievedExample, RAGRetrievalResult } from './retrieval'
