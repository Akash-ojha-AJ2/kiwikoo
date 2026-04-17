/**
 * INTELLIGENT PIPELINE - Pre-Analysis Module
 * 
 * Responsible for extracting grounded data from user and garment images.
 * This is the "Input Analysis" stage (Stage 0).
 */

import 'server-only'
import { classifyGarment, GarmentClassification } from './garment-classifier'
import { analyzeUserImage, UserAnalysis } from './user-analyzer'

// ═══════════════════════════════════════════════════════════════
// INTELLIGENT PIPELINE TYPES
// ═══════════════════════════════════════════════════════════════

export interface IntelligentPipelineContext {
    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1: DATA EXTRACTION (RAG)
// ═══════════════════════════════════════════════════════════════

export async function extractGroundedData(
    userImageBase64: string,
    garmentImageBase64: string
): Promise<{ userAnalysis: UserAnalysis; garmentClassification: GarmentClassification }> {
    console.log('\n' + '═'.repeat(80))
    console.log('PHASE 1: EXTRACTING GROUNDED DATA (RAG Approach)')
    console.log('═'.repeat(80))

    // Run both analyses in parallel for speed
    const [userAnalysis, garmentClassification] = await Promise.all([
        analyzeUserImage(userImageBase64),
        classifyGarment(garmentImageBase64)
    ])

    console.log('\n📊 EXTRACTION COMPLETE:')
    console.log(`   User: ${userAnalysis.face.shape} face, ${userAnalysis.body.type} body, ${userAnalysis.pose.type}`)
    console.log(`   Garment: ${garmentClassification.category}, hemline at ${garmentClassification.hemline_position}`)

    return { userAnalysis, garmentClassification }
}

// ═══════════════════════════════════════════════════════════════
// PRE-ANALYSIS EXPORT
// ═══════════════════════════════════════════════════════════════

export async function runIntelligentPreAnalysis(
    userImageBase64: string,
    garmentImageBase64: string
): Promise<IntelligentPipelineContext> {
    console.log('\n' + '═'.repeat(80))
    console.log('🧠 INTELLIGENT PIPELINE: Starting pre-analysis')
    console.log('═'.repeat(80))

    const startTime = Date.now()

    // Phase 1: Extract data
    const { userAnalysis, garmentClassification } = await extractGroundedData(
        userImageBase64,
        garmentImageBase64
    )

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n✅ Pre-analysis complete in ${elapsed}s`)

    return {
        userAnalysis,
        garmentClassification
    }
}

// ═══════════════════════════════════════════════════════════════
// INDEX EXPORT (Re-export all modules)
// ═══════════════════════════════════════════════════════════════

export { classifyGarment } from './garment-classifier'
export type { GarmentClassification } from './garment-classifier'
export { analyzeUserImage } from './user-analyzer'
export type { UserAnalysis } from './user-analyzer'


