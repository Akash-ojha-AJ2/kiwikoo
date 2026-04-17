export type EditType =
  | 'clothing_change'
  | 'background_change'
  | 'lighting_change'
  | 'pose_change'
  | 'camera_change'

export type ModelVariant = 'flash' | 'pro'

export interface EditPromptInput {
  editType: EditType

  /**
   * Optional user free-text request. Keep it short; templates will enforce strict rules.
   */
  userRequest?: string

  /**
   * Optional guidance. These are interpreted as *edit* requests, not identity changes.
   */
  background?: string
  pose?: string
  expression?: string
  camera?: string
  lighting?: string

  /**
   * Used to slightly tighten prompt adherence. (Not a hard guarantee.)
   */
  model?: ModelVariant
}

/**
 * Build a strict "photo-quality image edit" instruction string.
 *
 * Based on:
 * - Nano Banana Pro prompting guidance
 * - 30 Gemini Prompts for Photo-Quality Edits
 * - Google's Gemini Prompt Design guide
 *
 * Key principles:
 * 1. Preserve pores and micro-texture
 * 2. Maintain original facial structure and identity
 * 3. Avoid over-smoothing and haloing
 * 4. No plastic skin, no beautification
 * 5. Photo-quality with realistic skin sheen
 */
export function buildEditPrompt(input: EditPromptInput): string {
  const {
    editType,
    userRequest,
    background,
    pose,
    expression,
    camera,
    lighting,
    model = 'flash',
  } = input

  const userLine = userRequest?.trim() ? `User request: ${userRequest.trim()}` : ''

  // Optional composition adjustments
  const compositionLines: string[] = []
  if (camera?.trim()) compositionLines.push(`Camera/Framing: ${camera.trim()}`)
  if (pose?.trim()) compositionLines.push(`Pose: ${pose.trim()} (slight change only; keep body shape)`)
  if (expression?.trim()) compositionLines.push(`Expression: ${expression.trim()} (subtle change only; keep identity)`)

  const settingLines: string[] = []
  if (background?.trim()) settingLines.push(`Background/Location: ${background.trim()}`)

  const lightingLines: string[] = []
  if (lighting?.trim()) lightingLines.push(`Lighting: ${lighting.trim()} (match shadows on subject)`)

  const perEditRules = getEditRules(editType)

  // Model-specific strictness
  const strictnessNote =
    model === 'pro'
      ? 'This is a PHOTO-QUALITY edit with maximum fidelity. Not a new generation.'
      : 'This is a PHOTO-QUALITY edit. Not a new generation.'

  return [
    'MODE: PHOTO-QUALITY IMAGE EDIT',
    strictnessNote,
    '',
    'SUBJECT:',
    '- Use the PERSON IMAGE as the ONLY source of identity/face/body.',
    '',
    'IDENTITY PRESERVATION (NON-NEGOTIABLE):',
    '- Face must remain 100% identical to the PERSON IMAGE.',
    '- Preserve pores, micro-texture, skin grain, and natural imperfections.',
    '- Maintain original facial structure: jawline, cheekbones, eye spacing.',
    '- Keep all unique features: moles, freckles, scars, age signs.',
    '- No beautification: do not slim face, do not change eyes/nose/lips.',
    '- No skin smoothing: avoid over-smoothing, no airbrushing effect.',
    '- Preserve gender expression and body proportions exactly.',
    '- Output must contain exactly ONE person (from PERSON IMAGE).',
    '',
    'PHOTO-QUALITY RULES (Critical):',
    '- No plastic skin: maintain realistic skin sheen and texture.',
    '- No haloing: edges must be clean without glow artifacts.',
    '- No over-sharpening: natural micro-contrast only.',
    '- Realistic lighting: coherent shadows, highlights, and reflections.',
    '- Natural highlight roll-off: no clipped foreheads or blown areas.',
    '- Real-to-life output: no CGI, no uncanny valley effect.',
    '',
    'EDIT INSTRUCTIONS:',
    ...perEditRules,
    '',
    compositionLines.length ? ['COMPOSITION:', ...compositionLines, ''].join('\n') : '',
    settingLines.length ? ['SETTING:', ...settingLines, ''].join('\n') : '',
    lightingLines.length ? ['LIGHTING:', ...lightingLines, ''].join('\n') : '',
    userLine,
    '',
    'QUALITY CHECKLIST (self-verify):',
    '- [ ] Skin micro-texture visible at 100% zoom',
    '- [ ] Natural highlight roll-off (no clipped areas)',
    '- [ ] Clean edges, zero halos',
    '- [ ] Color-true skin tones',
    '- [ ] Identity matches PERSON IMAGE exactly',
    '',
    'If any instruction conflicts with identity preservation, IGNORE IT and keep identity.',
  ]
    .filter(Boolean)
    .join('\n')
}

function getEditRules(editType: EditType): string[] {
  switch (editType) {
    case 'clothing_change':
      return [
        '- Replace the subject\'s clothing to match the GARMENT REFERENCE image.',
        '- GARMENT REFERENCE: Extract ONLY the garment (color, pattern, texture, fabric, style).',
        '- IGNORE any face/person/body in the GARMENT REFERENCE completely.',
        '- Complete garment replacement: natural fit, proper draping, realistic fabric shadows.',
        '- Match neckline, sleeves, and silhouette accurately from reference.',
        '- Fabric should interact naturally with body and lighting.',
      ]
    case 'background_change':
      return [
        '- Replace the background to match the BACKGROUND REFERENCE image.',
        '- BACKGROUND REFERENCE: Environment only (do not change subject identity).',
        '- Match perspective, depth, and lighting so subject looks truly in scene.',
        '- Apply believable light wrap on subject edges.',
        '- No mismatched reflections or shadows.',
        '- Seamless blend without halos or cut-out edges.',
      ]
    case 'lighting_change':
      return [
        '- Adjust lighting on subject and scene as requested (keep identity unchanged).',
        '- Preserve skin texture: do not retouch, smooth, or beautify.',
        '- Lighting must be physically plausible: coherent shadows and highlights.',
        '- Apply subtle dodge & burn to balance midtones if needed.',
        '- Natural highlight roll-off: no clipping on skin areas.',
      ]
    case 'pose_change':
      return [
        '- Make a slight pose change while keeping body type and proportions.',
        '- Keep face identity unchanged and recognizable.',
        '- Keep the edit subtle: do not alter into a different model.',
        '- Maintain fabric drape consistent with new pose.',
        '- Preserve all facial features exactly.',
      ]
    case 'camera_change':
      return [
        '- Adjust camera angle/framing slightly as requested (keep identity unchanged).',
        '- Maintain photorealistic optics and perspective.',
        '- Simulate lens characteristics (depth of field, bokeh) if applicable.',
        '- Keep subject within focus plane; background gently defocused if appropriate.',
        '- Do not change the person into a different face/body.',
      ]
    default:
      return ['- Perform the requested edit while preserving identity exactly.']
  }
}


