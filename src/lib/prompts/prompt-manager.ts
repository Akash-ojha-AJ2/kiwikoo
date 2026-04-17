/**
 * PROMPT MANAGER - Simplified for Visual Anchoring Architecture
 * 
 * REMOVED:
 * - Biometric term scanners
 * - Facial feature hygiene checks
 * - Proportion/body checks
 * - Age-related blocking
 * 
 * KEPT:
 * - Reference prompts for style guidance
 * - Basic validation (identity lock, image count)
 */

import { ReferencePrompt, getAllReferencePrompts } from './reference-prompts'

/**
 * Load reference prompts from storage
 */
export function loadReferencePrompts(): ReferencePrompt[] {
  return getAllReferencePrompts()
}

/**
 * Format reference prompts for GPT system prompt
 * 
 * SIMPLIFIED: No biometric rules, no facial feature restrictions
 * Identity preservation is handled by IMAGE (not text description)
 */
export function formatReferencePromptsForSystemPrompt(): string {
  const prompts = getAllReferencePrompts()

  return `You are a virtual try-on prompt engineer. Generate scene/lighting descriptions ONLY.

ARCHITECTURE (NON-NEGOTIABLE):
- Image 1 = Person (SOLE identity source - preserved by visual reference only)
- Image 2 = Garment (clothing reference only)
- Your text = Scene, lighting, camera settings ONLY

YOU MUST WRITE (SAFE ZONE):
- Scene description (environment, setting)
- Lighting description (type, direction, quality)
- Camera settings (lens, framing)
- Style notes (photorealistic, no stylization)

YOU MUST NOT WRITE (FORBIDDEN):
- Facial features, skin tone, proportions, ethnicity, age, body type
- Hair color, eye color, lip shape
- Any identity-related descriptions
- "Image 1" or "Image 2" references (handled separately)

The identity is preserved by the IMAGE, not by text description.
Do not describe the person. Just describe the scene.

═══════════════════════════════════════════════════════════════
📚 REFERENCE PROMPTS (Scene/Style Examples)
═══════════════════════════════════════════════════════════════
${prompts
      .map(
        (p, index) => `
[${p.category.toUpperCase()}] Example ${index + 1}: ${p.description}
${p.prompt}
`
      )
      .join('\n---\n')}

OUTPUT FORMAT (STRICT):
Write ONLY scene/lighting/camera text. Nothing else.
Example: "Scene: Urban street with morning light. Lighting: Soft directional from left. Camera: 85mm portrait lens."
`
}

/**
 * Validate a prompt - SIMPLIFIED
 * 
 * REMOVED:
 * - Biometric term blocking
 * - Facial feature validation
 * - Proportion checks
 * 
 * KEPT:
 * - Check prompt isn't empty
 * - Check for basic quality markers
 */
export function validatePrompt(prompt: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty')
    return { valid: false, errors, warnings }
  }

  if (prompt.length < 50) {
    warnings.push('Prompt is short - may lack detail')
  }

  if (prompt.length > 2500) {
    warnings.push('Prompt is very long - may be truncated')
  }

  // Check for identity lock sentence (REQUIRED)
  const hasIdentityLock = /use image 1 as the sole source of identity/i.test(prompt)
    || /preserve the same person from image 1/i.test(prompt)
    || /sole source of identity/i.test(prompt)

  if (!hasIdentityLock) {
    warnings.push('Missing identity lock sentence - identity may drift')
  }

  // Check for garment reference (REQUIRED)
  const hasGarmentRef = /image 2/i.test(prompt) || /garment/i.test(prompt)

  if (!hasGarmentRef) {
    warnings.push('Missing garment reference')
  }

  // NO LONGER CHECKED:
  // - Facial feature mentions (allowed in preservation context)
  // - Skin tone mentions (allowed in preservation context)
  // - Body proportion mentions (removed)
  // - Age/ethnicity mentions (removed)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Format prompt with consistent structure
 */
export function formatPrompt(
  sceneDescription: string,
  qualityRequirements: string
): string {
  return `${sceneDescription}

${qualityRequirements}`
}
