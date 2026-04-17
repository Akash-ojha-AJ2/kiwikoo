/**
 * RAG STORAGE - Store Feedback in Database
 * 
 * Handles saving feedback to Supabase with embeddings.
 */

import 'server-only'
import { createClient } from '@/lib/auth'
import { generateScenarioEmbedding, type ScenarioEmbeddingInput } from './embeddings'
import type { UserAnalysis } from '../intelligence/user-analyzer'
import type { GarmentClassification } from '../intelligence/garment-classifier'
import type { FaceValidationResult } from '../intelligence/face-guardrail'
import type { GarmentValidationResult } from '../intelligence/garment-guardrail'

export interface FeedbackInput {
    userId: string
    rating: 'GOOD' | 'BAD'
    comment?: string
    tags?: string[]

    // Images (should be URLs to Supabase Storage)
    userImageUrl: string
    garmentImageUrl: string
    outputImageUrl: string

    // Analysis data
    userAnalysis: UserAnalysis
    garmentClassification: GarmentClassification

    // Validation results (if available)
    faceValidation?: FaceValidationResult | null
    garmentValidation?: GarmentValidationResult | null

    // Generation metadata
    generationPrompt?: string
    modelUsed?: string
    attemptNumber?: number
    tryonSessionId?: string
    variantIndex?: number
}

export interface StoreFeedbackResult {
    success: boolean
    feedbackId?: string
    error?: string
}

/**
 * Store feedback in database with embedding
 */
export async function storeFeedback(input: FeedbackInput): Promise<StoreFeedbackResult> {
    console.log('\n💾 Storing feedback in database...')
    const startTime = Date.now()

    try {
        const supabase = await createClient()

        // Generate embedding for this scenario
        const embedding = await generateScenarioEmbedding({
            userAnalysis: input.userAnalysis,
            garmentClassification: input.garmentClassification,
            rating: input.rating,
            comment: input.comment,
            tags: input.tags
        })

        // Insert into database
        const { data, error } = await supabase
            .from('tryon_feedback')
            .insert({
                user_id: input.userId,
                rating: input.rating,
                comment: input.comment || null,
                tags: input.tags || [],

                user_image_url: input.userImageUrl,
                garment_image_url: input.garmentImageUrl,
                output_image_url: input.outputImageUrl,

                user_analysis: input.userAnalysis as any,
                garment_classification: input.garmentClassification as any,

                face_validation: input.faceValidation as any,
                garment_validation: input.garmentValidation as any,

                scenario_embedding: embedding as any,

                generation_prompt: input.generationPrompt || null,
                model_used: input.modelUsed || null,
                attempt_number: input.attemptNumber || 1,

                tryon_session_id: input.tryonSessionId || null,
                variant_index: input.variantIndex || null
            })
            .select('id')
            .single()

        if (error) {
            console.error('Failed to store feedback:', error)
            return { success: false, error: error.message }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`   ✓ Feedback stored: ${data.id} in ${elapsed}s`)

        // If this is a BAD feedback with validation failures, create failure pattern
        if (input.rating === 'BAD' && (input.faceValidation || input.garmentValidation)) {
            await createFailurePattern(input, data.id)
        }

        return { success: true, feedbackId: data.id }

    } catch (error) {
        console.error('Error storing feedback:', error)
        return { success: false, error: String(error) }
    }
}

/**
 * Create or update failure pattern
 */
async function createFailurePattern(
    input: FeedbackInput,
    feedbackId: string
): Promise<void> {
    try {
        const supabase = await createClient()

        // Determine failure type
        const failureTypes: string[] = []
        const failureDetails: any = {}

        if (input.faceValidation && !input.faceValidation.is_valid) {
            failureTypes.push('FACE_MISMATCH')
            failureDetails.face_similarity = input.faceValidation.similarity_score
            failureDetails.face_issues = input.faceValidation.issues
        }

        if (input.garmentValidation) {
            if (!input.garmentValidation.type_match) {
                failureTypes.push('GARMENT_TYPE_WRONG')
            }
            if (!input.garmentValidation.length_match) {
                failureTypes.push('GARMENT_LENGTH_WRONG')
            }
            if (!input.garmentValidation.pattern_match) {
                failureTypes.push('PATTERN_WRONG')
            }
            if (!input.garmentValidation.color_match) {
                failureTypes.push('COLOR_WRONG')
            }
            failureDetails.garment_issues = input.garmentValidation.issues
        }

        // Add tag-based failures
        if (input.tags) {
            if (input.tags.includes('wrong_pose')) failureTypes.push('POSE_WRONG')
            if (input.tags.includes('accessories_missing')) failureTypes.push('ACCESSORIES_MISSING')
            if (input.tags.includes('body_different')) failureTypes.push('BODY_MISMATCH')
        }

        // For each failure type, create or update pattern
        for (const patternType of failureTypes) {
            const patternDescription = input.comment || `${patternType} detected`

            // Check if pattern already exists
            const { data: existing } = await supabase
                .from('tryon_failure_patterns')
                .select('*')
                .eq('pattern_type', patternType)
                .limit(1)
                .maybeSingle()

            if (existing) {
                // Update existing pattern
                await supabase
                    .from('tryon_failure_patterns')
                    .update({
                        occurrence_count: existing.occurrence_count + 1,
                        last_seen: new Date().toISOString(),
                        related_feedback_ids: [...existing.related_feedback_ids, feedbackId]
                    })
                    .eq('id', existing.id)

                console.log(`   ✓ Updated failure pattern: ${patternType}`)
            } else {
                // Create new pattern
                await supabase
                    .from('tryon_failure_patterns')
                    .insert({
                        pattern_type: patternType,
                        pattern_description: patternDescription,
                        user_characteristics: {
                            face_shape: input.userAnalysis.face.shape,
                            body_type: input.userAnalysis.body.type,
                            pose: input.userAnalysis.pose.type
                        } as any,
                        garment_characteristics: {
                            category: input.garmentClassification.category,
                            hemline: input.garmentClassification.hemline_position,
                            pattern: input.garmentClassification.pattern_type
                        } as any,
                        failure_details: failureDetails as any,
                        related_feedback_ids: [feedbackId]
                    })

                console.log(`   ✓ Created failure pattern: ${patternType}`)
            }
        }
    } catch (error) {
        console.error('Failed to create failure pattern:', error)
        // Don't throw - failure pattern creation is non-critical
    }
}

/**
 * Auto-create feedback from validation failures
 */
export async function autoCreateFailureFeedback(
    userId: string,
    input: Omit<FeedbackInput, 'userId' | 'rating'>
): Promise<StoreFeedbackResult> {
    console.log('🤖 Auto-creating BAD feedback from validation failure...')

    // Build auto-generated comment
    const issues: string[] = []

    if (input.faceValidation && !input.faceValidation.is_valid) {
        issues.push(`Face similarity: ${input.faceValidation.similarity_score}%`)
        issues.push(...input.faceValidation.issues)
    }

    if (input.garmentValidation && !input.garmentValidation.is_valid) {
        issues.push(...input.garmentValidation.issues)
    }

    const comment = `Auto-detected issues: ${issues.join('; ')}`

    const tags = ['auto_detected']
    if (input.faceValidation && !input.faceValidation.is_valid) tags.push('wrong_face')
    if (input.garmentValidation && !input.garmentValidation.type_match) tags.push('wrong_type')
    if (input.garmentValidation && !input.garmentValidation.length_match) tags.push('wrong_length')

    return storeFeedback({
        ...input,
        userId,
        rating: 'BAD',
        comment,
        tags
    })
}
