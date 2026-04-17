export type GeminiEditScope = 'auto' | 'local' | 'subject' | 'full_frame'

export type SmartEditTask =
  | 'auto'
  | 'hold_product'
  | 'wear_accessory'
  | 'pose_change'
  | 'text_edit'
  | 'remove_object'
  | 'stylized_effect'
  | 'replace_region'
  | 'add_object'
  | 'scene_edit'
  | 'general_edit'

export interface PlannerRegionStats {
  left: number
  top: number
  width: number
  height: number
  areaRatio: number
  centerX: number
  centerY: number
}

export interface NormalizedExpansionRect {
  left: number
  top: number
  width: number
  height: number
}

export type SmartEditModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'

export interface SmartEditPlan {
  task: Exclude<SmartEditTask, 'auto'>
  scope: Exclude<GeminiEditScope, 'auto'>
  target: 'face' | 'hand' | 'upper_body' | 'full_subject' | 'background' | 'text_zone' | 'region'
  shouldExpandMask: boolean
  creativeDirection: string
  integrationNotes: string[]
  model: SmartEditModel
  modelReason: string
  previewExpansion: {
    xPad: number
    yPad: number
    widthScale: number
    heightScale: number
    fullFrame?: boolean
  }
}

export const SMART_EDIT_PRESETS: Array<{
  label: string
  task: SmartEditTask
  prompt: string
}> = [
  { label: 'Lighting', task: 'scene_edit', prompt: 'Refine the lighting in this area with a premium cinematic glow and better direction.' },
  { label: 'Background', task: 'scene_edit', prompt: 'Replace this area with a cleaner premium background that matches the subject and color story.' },
  { label: 'Product Placement', task: 'hold_product', prompt: 'Place my reference product into this area with realistic scale, grip, and contact shadows.' },
  { label: 'Camera Angle', task: 'pose_change', prompt: 'Adjust the pose and camera angle to feel more editorial and dynamic while keeping identity intact.' },
]

export const SMART_EDIT_TASK_OPTIONS: Array<{
  value: SmartEditTask
  label: string
  hint: string
}> = [
  { value: 'auto', label: 'Auto', hint: 'Let the AI infer the best edit strategy.' },
  { value: 'wear_accessory', label: 'Wear', hint: 'Make the subject wear glasses, jewelry, bags, or accessories.' },
  { value: 'hold_product', label: 'Hold', hint: 'Put a product or prop into the hand with believable grip.' },
  { value: 'pose_change', label: 'Pose', hint: 'Repose the subject while keeping identity and style.' },
  { value: 'remove_object', label: 'Remove', hint: 'Delete an object and reconstruct the hidden area.' },
  { value: 'text_edit', label: 'Text', hint: 'Add or replace typography in a selected area.' },
  { value: 'stylized_effect', label: 'Effect', hint: 'Apply glitter, glow, metallic, or other aesthetic effects.' },
  { value: 'replace_region', label: 'Replace', hint: 'Swap the selected area with something new.' },
  { value: 'scene_edit', label: 'Scene', hint: 'Change lighting, environment, or broader composition.' },
]

export function inferTask(prompt: string, hasReferenceImage: boolean, requestedTask: SmartEditTask = 'auto'): Exclude<SmartEditTask, 'auto'> {
  if (requestedTask !== 'auto') return requestedTask

  const value = prompt.toLowerCase()
  if (/(hold|holding|grip|gripping|carry|carrying|in his hand|in her hand|into this hand|place .* hand)/.test(value)) return 'hold_product'
  if (/(wear|put on|make him wear|make her wear|glasses|sunglasses|watch|ring|earring|necklace|bag strap|accessory)/.test(value)) return 'wear_accessory'
  if (/(pose|repose|stance|gesture|hand position|arm position|body angle|change his pose|change her pose|head angle|lean|turn his body|turn her body)/.test(value)) return 'pose_change'
  if (/(text|headline|title|caption|typography|logo|wordmark|copy)/.test(value)) return 'text_edit'
  if (/(remove|erase|delete|clean up|take away)/.test(value)) return 'remove_object'
  if (/(glitter|sparkle|glow|shine|metallic|chrome|neon|texture|aesthetic|esthetic)/.test(value)) return 'stylized_effect'
  if (/(replace|swap|change to|turn into)/.test(value)) return 'replace_region'
  if (/(background|scene|environment|wall|sky|set|location|lighting|light it|relight)/.test(value)) return 'scene_edit'
  if (hasReferenceImage || /(add|insert|place|put)/.test(value)) return 'add_object'
  return 'general_edit'
}

export function inferScope(
  prompt: string,
  requestedScope: GeminiEditScope = 'auto',
  task?: Exclude<SmartEditTask, 'auto'>
): Exclude<GeminiEditScope, 'auto'> {
  if (requestedScope !== 'auto') return requestedScope
  const value = prompt.toLowerCase()
  if (task === 'pose_change' || task === 'hold_product' || task === 'wear_accessory') return 'subject'
  if (task === 'scene_edit' || /(camera|zoom out|zoom in|reframe|recompose|full image|entire image|whole image|overall)/.test(value)) {
    return 'full_frame'
  }
  return 'local'
}

export function inferTarget(prompt: string, stats: PlannerRegionStats): SmartEditPlan['target'] {
  const value = prompt.toLowerCase()
  if (/(hand|grip|holding|carry|wrist|fingers|palm)/.test(value)) return 'hand'
  if (/(glasses|sunglasses|eyes|face|cheek|lips|makeup|nose|ear)/.test(value)) return 'face'
  if (/(shirt|jacket|chest|torso|upper body|collar)/.test(value)) return 'upper_body'
  if (/(background|scene|wall|sky|set|environment|lighting)/.test(value)) return 'background'
  if (/(text|headline|title|caption|logo|typography)/.test(value)) return 'text_zone'
  if (stats.areaRatio > 0.22) return 'full_subject'
  return 'region'
}


function chooseModel(args: {
  task: Exclude<SmartEditTask, 'auto'>
  scope: Exclude<GeminiEditScope, 'auto'>
  prompt: string
  hasReferenceImage: boolean
  stats: PlannerRegionStats
}): { model: SmartEditModel; reason: string } {
  const value = args.prompt.toLowerCase()
  const largeMask = args.stats.areaRatio > 0.16
  const highReasoningTask = args.task === 'pose_change' || args.task === 'scene_edit'
  const multiConstraintTask = args.task === 'hold_product' || args.task === 'wear_accessory'
  const mentionsCamera = /(camera angle|camera|reframe|recompose|editorial angle|perspective)/.test(value)
  const mentionsLighting = /(lighting|relight|glow|sunlight|shadow direction|cinematic light)/.test(value)
  const complex =
    args.scope === 'full_frame' ||
    highReasoningTask ||
    (multiConstraintTask && args.hasReferenceImage) ||
    largeMask ||
    mentionsCamera ||
    (mentionsLighting && args.scope !== 'local')

  if (complex) {
    return {
      model: 'gemini-3-pro-image-preview',
      reason: 'Broader compositional or reasoning-heavy edit detected.',
    }
  }

  return {
    model: 'gemini-2.5-flash-image',
    reason: 'Localized edit detected; optimized for faster turnaround.',
  }
}

export function buildSmartEditPlan(args: {
  prompt: string
  stats: PlannerRegionStats
  hasReferenceImage: boolean
  requestedScope?: GeminiEditScope
  requestedTask?: SmartEditTask
}): SmartEditPlan {
  const task = inferTask(args.prompt, args.hasReferenceImage, args.requestedTask)
  const scope = inferScope(args.prompt, args.requestedScope, task)
  const target = inferTarget(args.prompt, args.stats)

  const integrationNotes = [
    'Respect real-world lighting and shadow direction.',
    'Blend edges naturally with the original photo.',
    'Preserve premium editorial ad quality rather than sticker-like compositing.',
  ]

  let creativeDirection = 'Execute the request with tasteful, realistic ad-art direction.'
  let shouldExpandMask = false
  let previewExpansion: SmartEditPlan['previewExpansion'] = {
    xPad: 0.08,
    yPad: 0.08,
    widthScale: 1.16,
    heightScale: 1.16,
  }

  if (task == 'hold_product') {
    shouldExpandMask = true
    creativeDirection = 'Stage the product as if the subject is intentionally holding it, with believable grip, finger placement, wrist angle, scale, and contact shadows.'
    integrationNotes.push('If needed, adjust the nearby hand, wrist, forearm, and upper body posture to support a natural holding pose.')
    previewExpansion = { xPad: 0.45, yPad: 0.55, widthScale: 1.9, heightScale: 2.2 }
  } else if (task == 'wear_accessory') {
    shouldExpandMask = true
    creativeDirection = 'Make the subject convincingly wear the referenced accessory with correct fit, perspective, anchor points, and subtle styling polish.'
    integrationNotes.push('Allow small facial, ear, hair, or collar adjustments needed for believable wearing.')
    previewExpansion = target === 'face'
      ? { xPad: 0.45, yPad: 0.45, widthScale: 1.9, heightScale: 1.6 }
      : { xPad: 0.4, yPad: 0.4, widthScale: 1.8, heightScale: 1.9 }
  } else if (task == 'pose_change') {
    shouldExpandMask = true
    creativeDirection = 'Change the subject pose intentionally and fashionably while preserving identity and ad quality.'
    integrationNotes.push('Body alignment may change across the subject, not just inside the painted region.')
    previewExpansion = { xPad: 1.2, yPad: 1.0, widthScale: 3.2, heightScale: 3.8 }
  } else if (task == 'text_edit') {
    creativeDirection = 'Render crisp, premium typography integrated into the composition with intentional hierarchy and spacing.'
  } else if (task == 'remove_object') {
    creativeDirection = 'Remove the object cleanly and reconstruct the hidden surfaces or background believably.'
  } else if (task == 'stylized_effect') {
    creativeDirection = 'Apply the effect with restraint, texture realism, and aesthetic polish suited for a premium campaign image.'
  } else if (task == 'scene_edit') {
    shouldExpandMask = true
    creativeDirection = 'Rework the broader scene while keeping the subject identity and the campaign look cohesive.'
    previewExpansion = { xPad: 0, yPad: 0, widthScale: 1, heightScale: 1, fullFrame: scope === 'full_frame' }
  }

  if (scope === 'subject' && !shouldExpandMask) {
    shouldExpandMask = true
    previewExpansion = { xPad: 0.8, yPad: 0.8, widthScale: 2.6, heightScale: 3.0 }
  }

  if (scope === 'full_frame') {
    previewExpansion = { xPad: 0, yPad: 0, widthScale: 1, heightScale: 1, fullFrame: true }
    shouldExpandMask = true
  }

  const modelSelection = chooseModel({
    task,
    scope,
    prompt: args.prompt,
    hasReferenceImage: args.hasReferenceImage,
    stats: args.stats,
  })

  return {
    task,
    scope,
    target,
    shouldExpandMask,
    creativeDirection,
    integrationNotes,
    model: modelSelection.model,
    modelReason: modelSelection.reason,
    previewExpansion,
  }
}

export function getTaskLabel(task: SmartEditTask) {
  const found = SMART_EDIT_TASK_OPTIONS.find((option) => option.value === task)
  return found?.label || task.replace(/_/g, ' ')
}

export function computeExpandedRect(
  stats: PlannerRegionStats,
  canvasWidth: number,
  canvasHeight: number,
  plan: Pick<SmartEditPlan, 'previewExpansion'>
) {
  if (plan.previewExpansion.fullFrame) {
    return { left: 0, top: 0, width: canvasWidth, height: canvasHeight }
  }

  const width = stats.width * plan.previewExpansion.widthScale
  const height = stats.height * plan.previewExpansion.heightScale
  const left = Math.max(0, stats.left - stats.width * plan.previewExpansion.xPad)
  const top = Math.max(0, stats.top - stats.height * plan.previewExpansion.yPad)

  return {
    left,
    top,
    width: Math.min(canvasWidth - left, width),
    height: Math.min(canvasHeight - top, height),
  }
}

export function toNormalizedExpansionRect(rect: { left: number; top: number; width: number; height: number }, canvasWidth: number, canvasHeight: number): NormalizedExpansionRect {
  return {
    left: Math.max(0, Math.min(1, rect.left / Math.max(1, canvasWidth))),
    top: Math.max(0, Math.min(1, rect.top / Math.max(1, canvasHeight))),
    width: Math.max(0.01, Math.min(1, rect.width / Math.max(1, canvasWidth))),
    height: Math.max(0.01, Math.min(1, rect.height / Math.max(1, canvasHeight))),
  }
}

export function fromNormalizedExpansionRect(rect: NormalizedExpansionRect, canvasWidth: number, canvasHeight: number) {
  return {
    left: rect.left * canvasWidth,
    top: rect.top * canvasHeight,
    width: rect.width * canvasWidth,
    height: rect.height * canvasHeight,
  }
}
