/**
 * INTELLIGENT RAG SYSTEM
 * 
 * Enhanced RAG system that:
 * 1. Uses real-world data for face copy, camera, lighting, physics
 * 2. Intelligently selects relevant examples
 * 3. Builds comprehensive context for model learning
 * 4. Integrates with existing RAG pipeline
 */

import 'server-only'
import { runRAGPipeline, type RAGPipelineInput, type RAGPipelineResult } from './rag/rag-pipeline'
import { formatRealWorldRAGData } from './rag/real-world-data'
import { formatPhotographyRAGKnowledge } from './rag/photography-seed-data'
import { formatGarmentDifferentiationRAG } from './rag/seed-data'
import type { UserAnalysis } from './intelligence/user-analyzer'
import type { GarmentClassification } from './intelligence/garment-classifier'

export interface IntelligentRAGResult {
    ragContext: string
    ragSummary: string
    realWorldData: string
    photographyKnowledge: string
    garmentKnowledge: string
    combinedContext: string
    goodExamplesCount: number
    badExamplesCount: number
    failurePatternsCount: number
}

/**
 * Run intelligent RAG system with real-world data
 */
export async function runIntelligentRAG(
    input: RAGPipelineInput
): Promise<IntelligentRAGResult> {
    console.log('\n' + '═'.repeat(80))
    console.log('🧠 INTELLIGENT RAG SYSTEM: Retrieving knowledge + Real-world data')
    console.log('═'.repeat(80))

    const startTime = Date.now()

    try {
        // 1. Run standard RAG pipeline (database retrieval)
        const ragResult: RAGPipelineResult = await runRAGPipeline(input)

        // 2. Get real-world data (face copy, camera, lighting, physics)
        const realWorldData = formatRealWorldRAGData()

        // 3. Get photography knowledge (lighting physics, color temp, etc.)
        const photographyKnowledge = formatPhotographyRAGKnowledge()

        // 4. Get garment differentiation knowledge
        const garmentKnowledge = formatGarmentDifferentiationRAG()

        // 5. Combine all knowledge into comprehensive context
        const combinedContext = buildCombinedRAGContext({
            ragContext: ragResult.ragContext,
            realWorldData,
            photographyKnowledge,
            garmentKnowledge
        })

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

        console.log('\n📊 INTELLIGENT RAG RESULTS:')
        console.log(`   ✓ Database examples: ${ragResult.goodExamplesCount} good, ${ragResult.badExamplesCount} bad`)
        console.log(`   ✓ Real-world data: Face copy, camera, lighting, physics`)
        console.log(`   ✓ Photography knowledge: Lighting physics, color temp`)
        console.log(`   ✓ Garment knowledge: Length differentiation`)
        console.log(`   ✓ Combined context: ${combinedContext.length} chars`)
        console.log(`   ✓ Intelligent RAG completed in ${elapsed}s`)

        return {
            ragContext: ragResult.ragContext,
            ragSummary: ragResult.ragSummary,
            realWorldData,
            photographyKnowledge,
            garmentKnowledge,
            combinedContext,
            goodExamplesCount: ragResult.goodExamplesCount,
            badExamplesCount: ragResult.badExamplesCount,
            failurePatternsCount: ragResult.failurePatternsCount
        }

    } catch (error) {
        console.error('Intelligent RAG system failed:', error)

        // Return real-world data even if database retrieval fails
        const realWorldData = formatRealWorldRAGData()
        const photographyKnowledge = formatPhotographyRAGKnowledge()
        const garmentKnowledge = formatGarmentDifferentiationRAG()

        return {
            ragContext: '',
            ragSummary: 'RAG retrieval failed, using real-world data only',
            realWorldData,
            photographyKnowledge,
            garmentKnowledge,
            combinedContext: buildCombinedRAGContext({
                ragContext: '',
                realWorldData,
                photographyKnowledge,
                garmentKnowledge
            }),
            goodExamplesCount: 0,
            badExamplesCount: 0,
            failurePatternsCount: 0
        }
    }
}

/**
 * Build combined RAG context from all sources
 */
function buildCombinedRAGContext(input: {
    ragContext: string
    realWorldData: string
    photographyKnowledge: string
    garmentKnowledge: string
}): string {
    const sections: string[] = []

    sections.push('╔═══════════════════════════════════════════════════════════════════════════════╗')
    sections.push('║                    INTELLIGENT RAG SYSTEM                                      ║')
    sections.push('║              Learning from Real-World Data + Database Examples                ║')
    sections.push('╚═══════════════════════════════════════════════════════════════════════════════╝')
    sections.push('')

    // 1. Real-world data (highest priority - always included)
    sections.push(input.realWorldData)
    sections.push('')

    // 2. Photography knowledge (always included)
    sections.push(input.photographyKnowledge)
    sections.push('')

    // 3. Garment knowledge (always included)
    sections.push(input.garmentKnowledge)
    sections.push('')

    // 4. Database examples (if available)
    if (input.ragContext && !input.ragContext.includes('No similar scenarios')) {
        sections.push(input.ragContext)
        sections.push('')
    }

    sections.push('╔═══════════════════════════════════════════════════════════════════════════════╗')
    sections.push('║                    FINAL DIRECTIVE                                             ║')
    sections.push('╚═══════════════════════════════════════════════════════════════════════════════╝')
    sections.push('')
    sections.push('APPLY ALL LESSONS FROM:')
    sections.push('1. Real-world data (face copy, camera, lighting, physics)')
    sections.push('2. Photography knowledge (lighting physics, color temp)')
    sections.push('3. Garment knowledge (length differentiation)')
    if (input.ragContext && !input.ragContext.includes('No similar scenarios')) {
        sections.push('4. Database examples (similar scenarios)')
    }
    sections.push('')
    sections.push('IF ANY CHECK FAILS → REGENERATE.')
    sections.push('')

    return sections.join('\n')
}

/**
 * Get RAG context for prompt injection
 */
export function getRAGContextForPrompt(ragResult: IntelligentRAGResult): string {
    return ragResult.combinedContext
}

/**
 * Log intelligent RAG status
 */
export function logIntelligentRAGStatus(sessionId: string, ragResult: IntelligentRAGResult): void {
    console.log(`\n🧠 INTELLIGENT RAG SYSTEM [${sessionId}]`)
    console.log(`   ✓ Real-world data: Face copy, camera, lighting, physics`)
    console.log(`   ✓ Photography knowledge: Lighting physics, color temp`)
    console.log(`   ✓ Garment knowledge: Length differentiation`)
    console.log(`   ✓ Database examples: ${ragResult.goodExamplesCount} good, ${ragResult.badExamplesCount} bad`)
    console.log(`   ✓ Combined context: ${ragResult.combinedContext.length} chars`)
}

