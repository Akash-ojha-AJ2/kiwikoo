/**
 * AI Campaign Strategist — Types
 *
 * The strategist operates in sequential phases, each activating
 * a different "role" in the 4-role growth team.
 */

/** Phases the strategist moves through sequentially */
export type StrategistPhase =
    | 'intake'      // Hybrid Adaptive Intake — strategic questions
    | 'researcher'  // 🧠 Market intelligence & competitor analysis
    | 'ideator'     // 💡 Content concept generation
    | 'scripter'    // ✍️ High-converting script writing
    | 'analyst'     // 📊 Optimization & A/B variants
    | 'complete'    // Strategy finalized, campaign ready

/** Phase metadata for the UI */
export interface PhaseInfo {
    id: StrategistPhase
    label: string
    emoji: string
    description: string
}

export const STRATEGIST_PHASES: PhaseInfo[] = [
    { id: 'intake', label: 'Strategy Intake', emoji: '🎯', description: 'Understanding your brand & goals' },
    { id: 'researcher', label: 'Research', emoji: '🧠', description: 'Market intelligence & competitor analysis' },
    { id: 'ideator', label: 'Content Ideas', emoji: '💡', description: 'Strategic content concepts' },
    { id: 'scripter', label: 'Scripts & Copy', emoji: '✍️', description: 'High-converting scripts & hooks' },
    { id: 'analyst', label: 'Optimization', emoji: '📊', description: 'A/B variants & conversion lift' },
    { id: 'complete', label: 'Campaign Ready', emoji: '🚀', description: 'Strategy complete — launch your campaign' },
]

/** A single message in the strategist conversation */
export interface StrategistMessage {
    role: 'user' | 'assistant'
    content: string
    phase?: StrategistPhase
    /** If the assistant produced a campaign creation payload */
    campaignPayload?: CampaignStrategyOutput | null
    /** User-uploaded images (base64 data URLs) */
    images?: string[]
    /** AI-generated campaign visual images */
    generatedImages?: GeneratedCampaignImage[]
    timestamp?: string
}

/** An AI-generated image within the strategist chat */
export interface GeneratedCampaignImage {
    /** Base64 data URL of the generated image */
    imageBase64: string
    /** Description/prompt used to generate */
    description: string
    /** The ad preset used, if any */
    preset?: string
    /** Quality score from rating */
    qualityScore?: number
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RICH STRATEGY DATA TYPES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** A content angle with effectiveness scoring */
export interface ContentAngle {
    angle: string
    score: number           // 1-10 effectiveness score
    example: string         // example content idea
    format: string          // Reel | Carousel | Story | Video | Blog | Ad
    funnel_stage: string    // TOFU | MOFU | BOFU
    why_it_works: string    // psychological trigger
}

/** A hook with category and platform */
export interface HookItem {
    text: string
    category: string        // curiosity | transformation | controversy | social_proof | urgency
    platform: string        // Meta | TikTok | YouTube | Universal
}

/** A script with metadata */
export interface ScriptItem {
    title: string
    body: string
    platform: string        // Meta | TikTok | YouTube | Universal
    duration: string        // e.g. "30s" "60s" "15s"
    framework: string       // PAS | AIDA | BAB | Narrative Reframe
    score: number           // 1-10 conversion potential
}

/** A structured A/B test variant */
export interface ABVariant {
    label: string           // "Variant A", "Variant B"
    description: string
    what_it_tests: string   // what hypothesis this variant tests
}

/** Structured output the AI generates when strategy is complete */
export interface CampaignStrategyOutput {
    title: string
    goal: 'sales' | 'awareness' | 'launch' | 'traffic'
    brief: string
    positioning: string
    audience: {
        age_min?: number
        age_max?: number
        gender?: string
        location?: string
        interests?: string[]
        psychographics?: string
    }
    creative: {
        headline?: string
        description?: string
        cta_text?: string
        hooks?: HookItem[]
        scripts?: ScriptItem[]
    }
    budget: {
        budget_type: 'daily' | 'lifetime'
        daily_budget?: number
        total_budget?: number
        recommended_platforms?: string[]
    }
    funnel: {
        awareness?: string
        consideration?: string
        conversion?: string
    }
    content_angles?: ContentAngle[]
    ab_variants?: ABVariant[]
}

/** Brand context extracted from the database for the AI */
export interface BrandContext {
    companyName: string
    brandType: string
    targetAudience: string
    vertical: string
    existingCampaignCount: number
    products: Array<{
        id: string
        name: string
        description?: string
        price?: number
        category?: string
        imageUrl?: string
    }>
}
