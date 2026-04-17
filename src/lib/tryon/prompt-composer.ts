/**
 * PROMPT COMPOSER - IPCR-X ARCHITECTURE
 * 
 * Identity-Preserving Compositional Rendering - Cross-Model
 * 
 * CRITICAL: Identity MUST come ONLY from Image 1.
 * ANCHOR_CORE runs FIRST - locks face, body, hair.
 * Presets may ONLY control environment, lighting, camera, background.
 * Presets must NEVER describe the subject, pose, or appearance.
 * 
 * PROMPT STRUCTURE:
 * 1. ANCHOR_CORE (face, body, hair, transition, clothing isolation)
 * 2. Scene preset (environment ONLY)
 * 3. Lighting
 * 4. Camera optics
 * 5. Negative constraints
 * 6. Final safeguard
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import {
  getPresetById,
  getPresetSummaryForSelection,
  getAllPresetIds,
  DEFAULT_PRESET,
  type ScenePreset
} from './presets/index'

import { getAnchorCorePrompt, logAnchorCoreStatus } from './anchor-core'


/**
 * Get the full ANCHOR_CORE prompt.
 * This includes: FACE_ANCHOR, BODY_ANCHOR, HAIR_ANCHOR,
 * FACE_BODY_TRANSITION, CLOTHING_ISOLATION, ANTI_BIAS_ENFORCEMENT
 */
function getIdentityAnchor(sessionId?: string): string {
  if (sessionId) {
    logAnchorCoreStatus(sessionId)
  }
  return getAnchorCorePrompt()
}

const IDENTITY_LOCK = getAnchorCorePrompt()


const GARMENT_LOCK = `Dress the same person in the garment shown in Image 2.
The garment must match Image 2 exactly in color, fabric, construction, and drape.
The garment must FIT the subject's body - body does NOT change for clothing.`


const NEGATIVE_CONSTRAINTS = `Do not beautify, stylize, or artistically reinterpret.
Do not smooth skin or alter natural features.
Do not slim, lengthen, or "improve" the body.
Do not change eye size, face shape, or proportions.
This is a realistic photo edit, not fashion illustration.`


const FINAL_SAFEGUARD = `If there is any ambiguity, preserve the person exactly as seen in Image 1.
Recognition accuracy > visual perfection.
If their family wouldn't recognize them, the generation FAILED.`


function buildSceneBlock(preset: ScenePreset): string {
    return `Environment: ${preset.scene}
Lighting: ${preset.lighting}
Camera: ${preset.camera}`
}


export interface PromptComposerInput {
  garmentDescription?: string
  presetId?: string
  sceneHint?: string
  regionPreference?: 'india' | 'global' | 'any'
}

export interface ComposedPrompt {
  prompt: string
  presetUsed: ScenePreset
  selectionMethod: 'direct' | 'gpt-selected' | 'fallback'
}

/**
 * Build final try-on prompt with strict identity/scene separation
 */
export async function buildFinalTryOnPrompt(
  input: PromptComposerInput
): Promise<string> {
  const composed = await composePromptWithPreset(input)
  return composed.prompt
}

/**
 * Full composition with metadata
 */
export async function composePromptWithPreset(
  input: PromptComposerInput
): Promise<ComposedPrompt> {
  const { presetId, sceneHint, regionPreference = 'india' } = input

  let preset: ScenePreset
  let selectionMethod: 'direct' | 'gpt-selected' | 'fallback'

    if (presetId) {
    const directPreset = getPresetById(presetId)
    if (directPreset) {
      preset = directPreset
      selectionMethod = 'direct'
    } else {
      console.warn(`⚠️ Preset "${presetId}" not found, using fallback`)
      preset = DEFAULT_PRESET
      selectionMethod = 'fallback'
    }
  } else if (sceneHint) {
    try {
      preset = await selectPresetWithGPT(sceneHint, regionPreference)
      selectionMethod = 'gpt-selected'
    } catch {
      preset = DEFAULT_PRESET
      selectionMethod = 'fallback'
    }
  } else {
    preset = DEFAULT_PRESET
    selectionMethod = 'fallback'
  }

      
  const finalPrompt = `${IDENTITY_LOCK}

${GARMENT_LOCK}

${buildSceneBlock(preset)}

${NEGATIVE_CONSTRAINTS}

${FINAL_SAFEGUARD}`

  return {
    prompt: finalPrompt,
    presetUsed: preset,
    selectionMethod
  }
}


async function selectPresetWithGPT(
  sceneHint: string,
  regionPreference: 'india' | 'global' | 'any'
): Promise<ScenePreset> {
  const openai = getGeminiChat()
  const availablePresets = getPresetSummaryForSelection()
  const validIds = getAllPresetIds()

  const systemPrompt = `Select ONE preset ID from this list based on the scene hint.
Output ONLY the preset ID, nothing else.

${availablePresets}

${regionPreference !== 'any' ? `Prefer ${regionPreference} presets.` : ''}
Default: india_home_lifestyle`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sceneHint },
      ],
      temperature: 0.1,
      max_tokens: 30,
    })

    const selectedId = response.choices[0]?.message?.content?.trim().toLowerCase()

    if (selectedId && validIds.includes(selectedId)) {
      const preset = getPresetById(selectedId)
      if (preset) return preset
    }

    return DEFAULT_PRESET
  } catch {
    return DEFAULT_PRESET
  }
}


export function getMinimalPrompt(): string {
  return `${IDENTITY_LOCK}

${GARMENT_LOCK}

Environment: Natural indoor setting
Lighting: Soft window light
Camera: 50mm lens, natural perspective

${NEGATIVE_CONSTRAINTS}

${FINAL_SAFEGUARD}`
}

export function getPromptWithPreset(presetId: string): string {
  const preset = getPresetById(presetId) || DEFAULT_PRESET

  return `${IDENTITY_LOCK}

${GARMENT_LOCK}

${buildSceneBlock(preset)}

${NEGATIVE_CONSTRAINTS}

${FINAL_SAFEGUARD}`
}

export { IDENTITY_LOCK, GARMENT_LOCK, NEGATIVE_CONSTRAINTS, FINAL_SAFEGUARD }

