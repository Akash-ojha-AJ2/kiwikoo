/**
 * RAG Module Index
 * 
 * Re-exports all RAG system components
 */

// Core RAG Pipeline
export {
    runRAGPipeline,
    saveFeedbackToRAG,
    autoSaveBadFeedback
} from './rag-pipeline'
export type {
    RAGPipelineInput,
    RAGPipelineResult,
    FeedbackInput,
    StoreFeedbackResult,
    RetrievedExample,
    RAGRetrievalResult
} from './rag-pipeline'

// Embeddings
export {
    generateScenarioEmbedding,
    generateFailurePatternEmbedding,
    buildScenarioText
} from './embeddings'
export type { ScenarioEmbeddingInput } from './embeddings'

// Storage
export {
    storeFeedback,
    autoCreateFailureFeedback
} from './storage'

// Retrieval
export {
    retrieveSimilarScenarios,
    getRelevantFailurePatterns
} from './retrieval'
export type { RetrievalInput } from './retrieval'

// Context Building
export {
    buildRAGContext,
    buildRAGSummary
} from './context-builder'
export type { RAGContextInput } from './context-builder'
