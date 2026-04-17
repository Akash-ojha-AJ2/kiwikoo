-- ═══════════════════════════════════════════════════════════════
-- TRYON FEEDBACK SYSTEM - Database Schema
-- ═══════════════════════════════════════════════════════════════

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ═══════════════════════════════════════════════════════════════
-- TABLE: tryon_feedback
-- Stores user feedback on generated images with vector embeddings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tryon_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- User who provided feedback
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rating & Comment
    rating TEXT NOT NULL CHECK (rating IN ('GOOD', 'BAD')),
    comment TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Input Images (URLs to Supabase Storage)
    user_image_url TEXT NOT NULL,
    garment_image_url TEXT NOT NULL,
    output_image_url TEXT NOT NULL,
    
    -- Analysis Data (structured JSON)
    user_analysis JSONB NOT NULL,
    garment_classification JSONB NOT NULL,
    
    -- Validation Results
    face_validation JSONB,
    garment_validation JSONB,
    
    -- Vector Embedding for Similarity Search
    -- OpenAI text-embedding-ada-002 produces 1536 dimensions
    scenario_embedding VECTOR(1536),
    
    -- Generation Metadata
    generation_prompt TEXT,
    model_used TEXT,
    attempt_number INTEGER DEFAULT 1,
    
    -- Tryon Session Reference
    tryon_session_id TEXT,
    variant_index INTEGER
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

-- Vector similarity search index (ivfflat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS tryon_feedback_embedding_idx 
    ON tryon_feedback 
    USING ivfflat (scenario_embedding vector_cosine_ops)
    WITH (lists = 100);

-- Filter indexes
CREATE INDEX IF NOT EXISTS tryon_feedback_rating_idx 
    ON tryon_feedback(rating);
    
CREATE INDEX IF NOT EXISTS tryon_feedback_user_idx 
    ON tryon_feedback(user_id);
    
CREATE INDEX IF NOT EXISTS tryon_feedback_created_idx 
    ON tryon_feedback(created_at DESC);
    
CREATE INDEX IF NOT EXISTS tryon_feedback_tags_idx 
    ON tryon_feedback USING GIN(tags);

-- ═══════════════════════════════════════════════════════════════
-- TABLE: tryon_failure_patterns
-- Stores aggregated failure patterns for learning
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tryon_failure_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Pattern Identification
    pattern_type TEXT NOT NULL,
    pattern_description TEXT NOT NULL,
    
    -- Scenario Characteristics
    user_characteristics JSONB NOT NULL,
    garment_characteristics JSONB NOT NULL,
    
    -- Failure Details
    failure_details JSONB NOT NULL,
    
    -- Solution
    solution_applied TEXT,
    solution_effective BOOLEAN DEFAULT FALSE,
    
    -- Pattern Embedding
    pattern_embedding VECTOR(1536),
    
    -- Frequency Tracking
    occurrence_count INTEGER DEFAULT 1,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Related Feedback IDs
    related_feedback_ids UUID[] DEFAULT '{}'
);

-- Indexes for failure patterns
CREATE INDEX IF NOT EXISTS tryon_failure_patterns_type_idx 
    ON tryon_failure_patterns(pattern_type);
    
CREATE INDEX IF NOT EXISTS tryon_failure_patterns_embedding_idx 
    ON tryon_failure_patterns 
    USING ivfflat (pattern_embedding vector_cosine_ops)
    WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tryon_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_failure_patterns ENABLE ROW LEVEL SECURITY;

-- Users can read all feedback (for learning)
CREATE POLICY "Allow read access to all users" 
    ON tryon_feedback FOR SELECT 
    TO authenticated 
    USING (true);

-- Users can only insert their own feedback
CREATE POLICY "Users can insert own feedback" 
    ON tryon_feedback FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" 
    ON tryon_feedback FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Failure patterns are read-only for users
CREATE POLICY "Allow read access to failure patterns" 
    ON tryon_failure_patterns FOR SELECT 
    TO authenticated 
    USING (true);

-- Only service role can insert/update failure patterns
CREATE POLICY "Service role can manage failure patterns" 
    ON tryon_failure_patterns FOR ALL 
    TO service_role 
    USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_tryon_feedback_updated_at
    BEFORE UPDATE ON tryon_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tryon_failure_patterns_updated_at
    BEFORE UPDATE ON tryon_failure_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS FOR SIMILARITY SEARCH
-- ═══════════════════════════════════════════════════════════════

-- Search for similar GOOD examples
CREATE OR REPLACE FUNCTION search_good_examples(
    query_embedding VECTOR(1536),
    similarity_threshold FLOAT DEFAULT 0.75,
    max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    rating TEXT,
    comment TEXT,
    tags TEXT[],
    user_analysis JSONB,
    garment_classification JSONB,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.rating,
        f.comment,
        f.tags,
        f.user_analysis,
        f.garment_classification,
        1 - (f.scenario_embedding <=> query_embedding) AS similarity
    FROM tryon_feedback f
    WHERE f.rating = 'GOOD'
        AND f.scenario_embedding IS NOT NULL
        AND 1 - (f.scenario_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY f.scenario_embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Search for similar BAD examples
CREATE OR REPLACE FUNCTION search_bad_examples(
    query_embedding VECTOR(1536),
    similarity_threshold FLOAT DEFAULT 0.75,
    max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    rating TEXT,
    comment TEXT,
    tags TEXT[],
    user_analysis JSONB,
    garment_classification JSONB,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.rating,
        f.comment,
        f.tags,
        f.user_analysis,
        f.garment_classification,
        1 - (f.scenario_embedding <=> query_embedding) AS similarity
    FROM tryon_feedback f
    WHERE f.rating = 'BAD'
        AND f.scenario_embedding IS NOT NULL
        AND 1 - (f.scenario_embedding <=> query_embedding) >= similarity_threshold
    ORDER BY f.scenario_embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
