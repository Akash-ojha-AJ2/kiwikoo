import 'server-only'
import sharp from 'sharp'
import type { GenerateContentConfig } from '@google/genai'
import { geminiGenerateContent } from '@/lib/gemini/executor'
import {
  buildSmartEditPlan,
  computeExpandedRect,
  inferScope,
  inferTask,
  type GeminiEditScope,
  type PlannerRegionStats,
  type SmartEditTask,
  type NormalizedExpansionRect,
} from '@/lib/ads/edit-planner'

const SUPPORTED_ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'] as const

interface ParsedImage {
  mimeType: string
  base64: string
  buffer: Buffer
}

export interface GeminiImageEditOptions {
  imageBase64: string
  maskBase64?: string
  prompt: string
  referenceImageBase64?: string
  scope?: GeminiEditScope
  task?: SmartEditTask
  expansionOverride?: NormalizedExpansionRect
}

function parseDataUrl(dataUrl: string): ParsedImage {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Expected a base64 data URL image payload')
  }

  const mimeType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1]
  const base64 = match[2]
  return {
    mimeType,
    base64,
    buffer: Buffer.from(base64, 'base64'),
  }
}

function pickAspectRatio(width: number, height: number): string {
  const ratio = width / height
  let best: string = SUPPORTED_ASPECT_RATIOS[0]
  let bestDiff = Number.POSITIVE_INFINITY

  for (const candidate of SUPPORTED_ASPECT_RATIOS) {
    const [w, h] = candidate.split(':').map(Number)
    const diff = Math.abs(ratio - w / h)
    if (diff < bestDiff) {
      best = candidate
      bestDiff = diff
    }
  }

  return best
}

function createStatsFromRect(left: number, top: number, width: number, height: number, canvasWidth: number, canvasHeight: number): PlannerRegionStats {
  return {
    left,
    top,
    width,
    height,
    areaRatio: (width * height) / Math.max(1, canvasWidth * canvasHeight),
    centerX: left + width / 2,
    centerY: top + height / 2,
  }
}

function createFallbackRegionStats(
  canvasWidth: number,
  canvasHeight: number,
  task: Exclude<SmartEditTask, 'auto'>,
  scope: Exclude<GeminiEditScope, 'auto'>
): PlannerRegionStats | null {
  if (scope === 'full_frame') {
    return createStatsFromRect(0, 0, canvasWidth, canvasHeight, canvasWidth, canvasHeight)
  }

  if (task === 'pose_change') {
    return createStatsFromRect(
      Math.round(canvasWidth * 0.14),
      Math.round(canvasHeight * 0.06),
      Math.round(canvasWidth * 0.72),
      Math.round(canvasHeight * 0.88),
      canvasWidth,
      canvasHeight
    )
  }

  if (scope === 'subject' || task === 'hold_product' || task === 'wear_accessory' || task === 'scene_edit') {
    return createStatsFromRect(
      Math.round(canvasWidth * 0.2),
      Math.round(canvasHeight * 0.1),
      Math.round(canvasWidth * 0.6),
      Math.round(canvasHeight * 0.78),
      canvasWidth,
      canvasHeight
    )
  }

  return null
}

async function buildMaskFromStats(canvasWidth: number, canvasHeight: number, stats: PlannerRegionStats): Promise<Buffer> {
  const radius = Math.round(Math.min(stats.width, stats.height) * 0.12)
  const svg = `
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" fill="black" />
      <rect x="${Math.round(stats.left)}" y="${Math.round(stats.top)}" width="${Math.round(stats.width)}" height="${Math.round(stats.height)}" rx="${radius}" ry="${radius}" fill="white" />
    </svg>
  `.trim()
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function deriveRegionStats(mask: Buffer): Promise<PlannerRegionStats> {
  const { data, info } = await sharp(mask)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  let minX = info.width
  let minY = info.height
  let maxX = -1
  let maxY = -1
  let activePixels = 0

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * info.channels
      const r = data[index] ?? 0
      const g = data[index + 1] ?? 0
      const b = data[index + 2] ?? 0
      const alpha = data[index + 3] ?? 255
      const luminance = (r + g + b) / 3
      if (alpha < 245 || luminance > 16) {
        activePixels += 1
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (!activePixels || maxX < 0 || maxY < 0) {
    throw new Error('No editable region detected in the mask')
  }

  const width = maxX - minX + 1
  const height = maxY - minY + 1
  return {
    left: minX,
    top: minY,
    width,
    height,
    areaRatio: activePixels / (info.width * info.height),
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  }
}

async function expandMaskForPlan(
  mask: Buffer,
  stats: PlannerRegionStats,
  plan: ReturnType<typeof buildSmartEditPlan>,
  expansionOverride?: NormalizedExpansionRect
): Promise<Buffer> {
  if (!plan.shouldExpandMask && !expansionOverride) {
    return sharp(mask).png().toBuffer()
  }

  const metadata = await sharp(mask).metadata()
  const canvasWidth = metadata.width || 1024
  const canvasHeight = metadata.height || 1024
  const rect = expansionOverride
    ? {
        left: expansionOverride.left * canvasWidth,
        top: expansionOverride.top * canvasHeight,
        width: expansionOverride.width * canvasWidth,
        height: expansionOverride.height * canvasHeight,
      }
    : computeExpandedRect(stats, canvasWidth, canvasHeight, plan)
  const radius = Math.round(Math.min(rect.width, rect.height) * 0.12)

  const svg = `
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" fill="black" />
      <rect x="${Math.round(rect.left)}" y="${Math.round(rect.top)}" width="${Math.round(rect.width)}" height="${Math.round(rect.height)}" rx="${radius}" ry="${radius}" fill="white" />
    </svg>
  `.trim()

  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function buildSelectionPreview(baseImage: Buffer, stats: PlannerRegionStats, plan: ReturnType<typeof buildSmartEditPlan>): Promise<Buffer> {
  const metadata = await sharp(baseImage).metadata()
  const canvasWidth = metadata.width || 1024
  const canvasHeight = metadata.height || 1024
  const rect = computeExpandedRect(stats, canvasWidth, canvasHeight, plan)

  const overlaySvg = `
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" fill="rgba(0,0,0,0.10)"/>
      <rect x="${Math.round(rect.left)}" y="${Math.round(rect.top)}" width="${Math.round(rect.width)}" height="${Math.round(rect.height)}" rx="18" ry="18" fill="rgba(255,214,10,0.24)" stroke="rgba(255,59,48,0.95)" stroke-width="8" stroke-dasharray="18 12"/>
      <text x="${Math.min(canvasWidth - 24, Math.round(rect.left) + 18)}" y="${Math.max(36, Math.round(rect.top) - 12)}" font-size="30" font-family="Arial, sans-serif" font-weight="700" fill="#111111">SMART EDIT: ${plan.task.replace(/_/g, ' ').toUpperCase()}</text>
    </svg>
  `.trim()

  return sharp(baseImage)
    .composite([{ input: Buffer.from(overlaySvg), blend: 'over' }])
    .png()
    .toBuffer()
}

function buildEditInstructions(
  prompt: string,
  stats: PlannerRegionStats,
  hasReferenceImage: boolean,
  plan: ReturnType<typeof buildSmartEditPlan>
) {
  const horizontal = stats.centerX / Math.max(1, stats.left + stats.width) < 0.33 ? 'left' : stats.centerX / Math.max(1, stats.left + stats.width) > 0.67 ? 'right' : 'center'
  const vertical = stats.centerY / Math.max(1, stats.top + stats.height) < 0.33 ? 'upper' : stats.centerY / Math.max(1, stats.top + stats.height) > 0.67 ? 'lower' : 'middle'
  const areaSize = stats.areaRatio < 0.04 ? 'small' : stats.areaRatio < 0.18 ? 'medium' : 'large'

  const scopeRules = plan.scope === 'local'
    ? [
        '- Treat the selected mask as a strict local edit boundary except for minimal edge blending.',
        '- Keep everything outside the selected region visually unchanged.',
      ]
    : plan.scope === 'subject'
      ? [
          '- Treat the selected mask as the anchor, but you may modify the whole subject as needed for believable pose, grip, wearing, or body alignment.',
          '- Preserve identity, facial likeness, and overall scene continuity.',
        ]
      : [
          '- Treat the selected mask as the focus, but you may revise the broader frame to fulfill the request cohesively.',
          '- Preserve identity and the premium campaign aesthetic unless the prompt explicitly asks for a bigger transformation.',
        ]

  return [
    'You are an elite AI advertising image editor with strong aesthetic judgment and spatial reasoning.',
    'Image 1 is the original image.',
    'Image 2 is a smart visual preview of the requested region/task.',
    'Image 3 is the edit mask used as the anchor region.',
    hasReferenceImage
      ? 'Image 4 is a reference or product image. Use it faithfully when adding, replacing, holding, or wearing an item.'
      : 'No external reference image is provided; infer the best visual solution from the original image and prompt.',
    `Task type: ${plan.task.replace(/_/g, ' ')}.`,
    `Edit scope: ${plan.scope.replace(/_/g, ' ')}.`,
    `Primary target: ${plan.target.replace(/_/g, ' ')}.`,
    `Selected region: ${areaSize} region in the ${vertical} ${horizontal} area of the image.`,
    `Creative direction: ${plan.creativeDirection}`,
    `User request: ${prompt}`,
    'Core rules:',
    ...scopeRules,
    '- Preserve subject identity and premium campaign polish.',
    '- Make the result look intentionally art-directed, not mechanically pasted.',
    '- Respect correct perspective, hand/finger contact, material response, scale, and occlusion.',
    '- If the request implies a better composition or micro-adjustment, make that decision intelligently.',
    '- Apply tasteful, high-end styling choices rather than literal low-quality overlays.',
    '- If editing text, render clean, deliberate typography with correct spacing and hierarchy.',
    '- If removing objects, reconstruct hidden content believably.',
    ...plan.integrationNotes.map((note) => `- ${note}`),
    '- Return one final edited image only.',
  ].join('\n')
}

async function extractImageFromResponse(response: Awaited<ReturnType<typeof geminiGenerateContent>>) {
  if (response.data) {
    return `data:image/png;base64,${response.data}`
  }

  const parts = response.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
    }
  }

  const textPart = parts.find((part) => part.text)?.text
  throw new Error(textPart || 'Gemini did not return an edited image')
}

export async function editImageWithGemini(options: GeminiImageEditOptions): Promise<{ image: string; model: string; task: string; scope: string }> {
  const baseImage = parseDataUrl(options.imageBase64)
  const referenceImage = options.referenceImageBase64 ? parseDataUrl(options.referenceImageBase64) : null
  const metadata = await sharp(baseImage.buffer).metadata()
  const width = metadata.width || 1024
  const height = metadata.height || 1024
  const aspectRatio = pickAspectRatio(width, height)
  const inferredTask = inferTask(options.prompt, Boolean(referenceImage), options.task)
  const inferredScope = inferScope(options.prompt, options.scope, inferredTask)

  let baseStats: PlannerRegionStats | null = null
  let originalMaskBuffer: Buffer | null = null

  if (options.maskBase64) {
    try {
      const originalMask = parseDataUrl(options.maskBase64)
      originalMaskBuffer = originalMask.buffer
      baseStats = await deriveRegionStats(originalMask.buffer)
    } catch (error) {
      if (inferredScope === 'local') {
        throw error
      }
    }
  }

  if (!baseStats) {
    baseStats = createFallbackRegionStats(width, height, inferredTask, inferredScope)
    if (!baseStats) {
      throw new Error('Paint a region for localized edits. Broad subject or full-frame edits can run without a mask.')
    }
    originalMaskBuffer = await buildMaskFromStats(width, height, baseStats)
  }

  const plan = buildSmartEditPlan({
    prompt: options.prompt,
    stats: baseStats,
    hasReferenceImage: Boolean(referenceImage),
    requestedScope: options.scope,
    requestedTask: options.task,
  })
  if (!originalMaskBuffer) {
    throw new Error('Unable to determine edit region')
  }
  const expandedMaskBuffer = await expandMaskForPlan(originalMaskBuffer, baseStats, plan, options.expansionOverride)
  const maskImage: ParsedImage = {
    mimeType: 'image/png',
    buffer: expandedMaskBuffer,
    base64: expandedMaskBuffer.toString('base64'),
  }

  const regionStats = await deriveRegionStats(maskImage.buffer)
  const selectionPreview = await buildSelectionPreview(baseImage.buffer, regionStats, plan)
  const selectionPreviewBase64 = selectionPreview.toString('base64')

  const contents: Array<string | { inlineData: { mimeType: string; data: string } }> = [
    { inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } },
    { inlineData: { mimeType: 'image/png', data: selectionPreviewBase64 } },
    { inlineData: { mimeType: maskImage.mimeType, data: maskImage.base64 } },
    buildEditInstructions(options.prompt, regionStats, Boolean(referenceImage), plan),
  ]

  if (referenceImage) {
    contents.splice(3, 0, {
      inlineData: {
        mimeType: referenceImage.mimeType,
        data: referenceImage.base64,
      },
    })
  }

  const config: GenerateContentConfig = {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: aspectRatio as any,
    },
    temperature: 0.42,
    topP: 0.9,
    topK: 32,
    systemInstruction: `Perform a premium photoreal ad edit. Current task: ${plan.task}. Current scope: ${plan.scope}. Preferred model behavior: ${plan.model}. The mask is an anchor, not a prison, when the plan requires broader subject reasoning.`,
  }

  const response = await geminiGenerateContent({
    model: plan.model,
    contents,
    config,
  })

  const image = await extractImageFromResponse(response)
  return { image, model: plan.model, task: plan.task, scope: plan.scope }
}
