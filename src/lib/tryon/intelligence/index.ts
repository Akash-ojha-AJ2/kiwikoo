/**
 * Intelligence Module Index
 * 
 * Re-exports all intelligence modules for easy importing
 */

// Core analyzers
export { classifyGarment, generateGarmentGroundedPrompt } from './garment-classifier'
export type { GarmentClassification, GarmentCategory, HemlinePosition, PatternType } from './garment-classifier'

export { analyzeUserImage, generateUserGroundedPrompt } from './user-analyzer'
export type { UserAnalysis, FaceShape, BodyType, PoseType } from './user-analyzer'

// Guardrails
export { validateFaceMatch } from './face-guardrail'
export type { FaceValidationResult } from './face-guardrail'

export { validateGarmentMatch } from './garment-guardrail'
export type { GarmentValidationResult } from './garment-guardrail'

// Prompting
export { buildChainOfThoughtPrompt, buildSelfVerificationPrompt } from './chain-of-thought'
export { getPhotographicRealismPrompt, getFilmGrainPrompt, getLightingConsistencyPrompt, PHOTOGRAPHIC_REALISM_PROMPT } from './photographic-realism'

// Orchestration
export {
    initRetryContext,
    updateContextAfterFailure,
    detectFailures,
    shouldRetry,
    generateRetryEmphasis,
    logOrchestratorStatus
} from './retry-orchestrator'
export type { RetryContext, FailureType, OrchestratorResult } from './retry-orchestrator'

// Orchestration
export {
    runIntelligentPreAnalysis,
    extractGroundedData
} from './intelligent-pipeline'
export type { IntelligentPipelineContext } from './intelligent-pipeline'

// New Modules (Nano Banana Pro)
export { runSceneIntelligence } from './scene-intelligence-engine'
export type { SceneIntelligenceInput, SceneIntelligenceOutput } from './scene-intelligence-engine'

export { resolveAnchorZone, PRESET_ANCHOR_MAP } from './anchor-zone-resolver'
export type { AnchorZoneResolution } from './anchor-zone-resolver'

// Removed: sanitized-prompt-builder (replaced by forensic-prompt.ts in the strict pipeline)
