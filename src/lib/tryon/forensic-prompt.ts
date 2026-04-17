/**
 * FORENSIC PROMPT BUILDER (Stage 2)
 *
 * Builds a MINIMAL positive-only prompt for Nano Banana Pro.
 * Goal: identity-first, concise, zero negative instructions.
 *
 * DESIGN PRINCIPLE:
 * - Shorter prompts = stronger image-adapter signal = better face consistency.
 * - Positive framing only — negative "DO NOT" rules paradoxically increase drift.
 * - Scene description kept to one short line max.
 * - Total prompt target: ~600-900 chars (vs ~4500 before).
 *
 * Supports both Gemini (Image 1/2/3 references) and GPT Image (descriptive references).
 */

import 'server-only'
import type { PresetStrengthProfile } from './preset-strength-profile'

export interface ForensicPromptInput {
  garmentDescription?: string
  garmentIdentityLock?: string
  preset?: string
  lighting?: string
  realismGuidance?: string
  garmentOnPersonGuidance?: string
  faceForensicAnchor?: string
  eyesAnchor?: string
  characterSummary?: string
  poseSummary?: string
  appearanceSummary?: string
  aspectRatio?: '1:1' | '4:5' | '3:4' | '9:16'
  retryMode?: boolean
  sceneCorrectionGuidance?: string
  lightingBlueprint?: string
  presetAvoid?: string
  bodyAnchor?: string
  identityCorrectionGuidance?: string
  styleGuidance?: string
  colorGradingGuidance?: string
  cameraGuidance?: string
  identityDNA?: string            // Soul ID — frozen paragraph describing the person's exact face
  poseInferenceGuidance?: string
  researchContext?: string
  webResearchContext?: string
  additionalAvoidTerms?: string[]
  identityPriorityRules?: string[]
  strengthProfile?: PresetStrengthProfile
  hasFaceReference?: boolean
  faceSpatialLockQuality?: 'strict' | 'relaxed'
  faceBox?: {
    ymin: number
    xmin: number
    ymax: number
    xmax: number
  }
  /** When true, uses GPT Image-compatible descriptive references instead of "Image 1/2/3" */
  useGPTImageFormat?: boolean
  /** Name anchor for latent space locking */
  nameAnchor?: string
  /** Perceived gender from face forensics */
  perceivedGender?: 'masculine' | 'feminine' | 'neutral'
  /** Anti-drift directives from face forensics */
  antiDriftDirectives?: string
  /** Strict swap mode keeps scene, pose, and camera anchored to Image 1 */
  strictSwap?: boolean
  /** Limited finish notes for cleanup, crop, and polish */
  polishNotes?: string
}

export function buildForensicPrompt(input: ForensicPromptInput): string {
  const aspectRatio = input.aspectRatio || '1:1'
  const hasFaceReference = Boolean(input.hasFaceReference)

  // Always use "Image 1/2/3" references — Gemini is the primary render engine
  const personRef = 'Image 1'
  const garmentRef = 'Image 2'
  const faceCropRef = 'Image 3'
  const garment = input.garmentDescription?.trim() || `garment from ${garmentRef}`

  const rawPreset = input.preset?.trim() || ''
  const isStrictSwap = Boolean(input.strictSwap)
  const isSceneChange = !isStrictSwap && rawPreset && rawPreset !== `keep background from ${personRef}`
  const polishNotes = sanitizePolishNotes(input.polishNotes)

  // CONDENSE scene and lighting to save token budget for identity signal
  const sceneBrief = isSceneChange ? condenseScene(rawPreset, 150) : ''
  const lightingBrief = isSceneChange && input.lightingBlueprint
    ? condenseLighting(input.lightingBlueprint, 60)
    : ''

  // ═══════════════════════════════════════════════════════════════════════
  // CONCISE PROMPT — target ~500-800 chars
  // Research shows: shorter prompt = stronger image-reference signal.
  // Let the reference images dictate the face. Text only provides
  // macro-level identity + scene composition + garment instruction.
  // ═══════════════════════════════════════════════════════════════════════

  const lines: string[] = []

  // ── BLOCK 1: WHO (minimal — let images do the talking) ──
  if (input.identityDNA) {
    lines.push(
      `${personRef}: ${input.identityDNA}`
    )
  } else {
    lines.push(
      `Create a photorealistic edit of the exact person from ${personRef}${hasFaceReference ? ` and ${faceCropRef}` : ''}.`
    )
  }
  lines.push(`Copy the face from the reference photos exactly. Do not reconstruct from text.`)
  if (input.bodyAnchor) {
    lines.push(`Keep the same body build and proportions from ${personRef}.`)
  }
  if (isStrictSwap) {
    lines.push(`Keep the original pose, camera angle, framing, and scene from ${personRef}.`)
  }
  lines.push(`Treat this as editing ${personRef} with a new outfit, not generating a different person.`)
  lines.push('')

  // ── BLOCK 2: WHAT ──
  lines.push(
    `OUTFIT: Dress in the garment from ${garmentRef}: ${garment}. Match exact garment type, hem length, neckline, sleeves, colors, pattern, and fabric.`
  )
  if (input.garmentIdentityLock) {
    lines.push(`Garment lock: ${input.garmentIdentityLock}.`)
  }
  lines.push('')

  // ── BLOCK 3: WHERE ──
  if (isSceneChange && sceneBrief) {
    lines.push(
      `Scene: ${sceneBrief}. Photorealistic, ${aspectRatio}.`
    )
  } else {
    lines.push(
      `Keep original background from ${personRef}. Photorealistic, ${aspectRatio}.`
    )
  }

  if (isStrictSwap) {
    lines.push(`Only replace the clothing and harmonize lighting, color, cleanup, crop, and final polish.`)
  }
  if (polishNotes) {
    lines.push(`Polish only: ${polishNotes}.`)
  }

  // ── RETRY ──
  if (input.retryMode) {
    lines.push('')
    lines.push(`Previous attempt drifted from the references. Copy the face from ${personRef} exactly and keep the garment from ${garmentRef} unchanged this time.`)
  }

  return lines.join('\n')
}

function sanitizePolishNotes(notes?: string): string {
  const value = notes?.trim()
  if (!value) return ''

  const forbidden = /(background|scene|location|set|studio|street|pose|camera|lens|angle|zoom|environment)/i
  const sentences = value
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => !forbidden.test(sentence))

  const sanitized = sentences.join('. ').trim()
  if (!sanitized) return ''
  return sanitized.length <= 180 ? sanitized : sanitized.slice(0, 177).trimEnd() + '...'
}

/**
 * Condense a long scene description to just the key environment phrase.
 * E.g. "Modern rooftop terrace with glass railing, clean concrete deck,
 * potted plants, minimalist outdoor seating, and open skyline backdrop."
 * → "Modern rooftop terrace with skyline backdrop"
 */
function condenseScene(scene: string, maxLen: number): string {
  // Remove everything after lighting/camera cues (those are handled separately)
  let s = scene
    .replace(/\. Lighting:.*/i, '')
    .replace(/\. Camera:.*/i, '')
    .replace(/Key:.*$/i, '')
    .replace(/Fill:.*$/i, '')
    .trim()

  // Allow MORE scene description for environment depth (200 char budget)
  // Keep the first 3 descriptive clauses for spatial/material richness
  if (s.length > maxLen) {
    const clauses = s.split(/[,.]/).filter(c => c.trim().length > 5)
    const kept = clauses.slice(0, 3).join(',').trim()
    s = kept.length > 20 ? kept : s.substring(0, maxLen)
  }

  // Final trim
  if (s.length > maxLen) {
    s = s.substring(0, maxLen - 3) + '...'
  }

  // Remove trailing period for clean join
  return s.replace(/\.\s*$/, '').trim()
}

/**
 * Condense lighting blueprint to a very short phrase.
 * E.g. "Key: open daylight from high front-left..."
 * → "Natural daylight"
 */
function condenseLighting(lighting: string, maxLen: number): string {
  const lower = lighting.toLowerCase()

  // Extract the main light type — keep SHORT to preserve identity token budget
  if (lower.includes('golden') || lower.includes('sunset') || lower.includes('golden hour')) {
    return 'Warm golden-hour lighting'
  }
  if (lower.includes('daylight') || lower.includes('natural')) {
    return 'Natural daylight'
  }
  if (lower.includes('softbox') || lower.includes('studio')) {
    return 'Soft studio lighting'
  }
  if (lower.includes('window')) {
    return 'Window light'
  }
  if (lower.includes('candle') || lower.includes('diya') || lower.includes('festive')) {
    return 'Warm candlelight'
  }
  if (lower.includes('overcast')) {
    return 'Overcast daylight'
  }
  if (lower.includes('flash')) {
    return 'Direct flash'
  }

  // Fallback: take first short phrase
  const brief = lighting.split('.')[0].trim()
  return brief.length > maxLen ? brief.substring(0, maxLen - 3) + '...' : brief
}

function condenseIdentityDirective(text: string, maxLen: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLen) return normalized
  return normalized.substring(0, maxLen - 3).trimEnd() + '...'
}
