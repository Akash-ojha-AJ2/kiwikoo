/**
 * Unified API Key Configuration
 * Centralized management for all API keys with validation and support for proj_ format
 */

/**
 * Get and validate OpenAI API key
 * OpenAI API keys can be in various formats - preserve as-is
 */
export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY not configured. Please set it in .env.local')
  }
  
  // Trim whitespace and remove quotes if present
  let cleanedKey = apiKey.trim().replace(/^["']|["']$/g, '')
  
  // Don't modify the key - OpenAI SDK will validate it
  // Keys can be in various formats: sk-*, proj_*, etc.
  // Just ensure it's not empty and has reasonable length
  if (!cleanedKey || cleanedKey.length < 10) {
    throw new Error('OPENAI_API_KEY appears to be invalid or incomplete')
  }
  /**
   * SECURITY NOTE (OWASP):
   * Never log secrets (even partial prefixes) in production logs.
   * Cloud log aggregation + screenshots can leak key material and enable targeted attacks.
   * If debugging is required, validate presence/length only and rotate keys after any exposure.
   */
  
  return cleanedKey
}

/**
 * Get and validate Gemini API key
 * Gemini keys can be in various formats - preserve as-is
 */
export function getGeminiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY not configured. Please set it in .env.local')
  }
  
  // Trim whitespace and remove quotes if present
  let cleanedKey = apiKey.trim().replace(/^["']|["']$/g, '')
  
  // Gemini keys can be in various formats - don't modify them
  // Just validate they exist and have reasonable length
  if (!cleanedKey || cleanedKey.length < 10) {
    throw new Error('GEMINI_API_KEY appears to be invalid or incomplete')
  }
  
  return cleanedKey
}

/**
 * Get Gemini model version (defaults to gemini-2.5-flash)
 */
export function getGeminiModelVersion(): string {
  return process.env.GEMINI_MODEL_VERSION || 'gemini-2.5-flash'
}

/**
 * Get image generation model (defaults to gemini-2.5-flash-image)
 */
export function getImageGenModel(): string {
  return process.env.IMAGE_GEN_MODEL || 'gemini-2.5-flash-image'
}

