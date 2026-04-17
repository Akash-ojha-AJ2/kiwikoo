export type TryOnJobOutputStatus = 'completed' | 'failed'

export interface TryOnJobOutput {
  referenceImageId: string | null
  status: TryOnJobOutputStatus
  imageUrl?: string
  base64Image?: string
  outputImagePath?: string
  error?: string
  label?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isBase64StoragePath(path: string | null | undefined): boolean {
  return Boolean(path && path.startsWith('base64://'))
}

export function splitStoredOutput(path: string | null | undefined): {
  imageUrl?: string
  base64Image?: string
} {
  if (!path) return {}
  if (isBase64StoragePath(path)) {
    return { base64Image: path.replace('base64://', '') }
  }
  return { imageUrl: path }
}

function normalizeRawOutput(raw: unknown, index: number): TryOnJobOutput | null {
  if (!raw) return null

  if (typeof raw === 'string') {
    const parts = splitStoredOutput(raw)
    if (!parts.imageUrl && !parts.base64Image) return null
    return {
      referenceImageId: null,
      status: 'completed',
      outputImagePath: raw,
      imageUrl: parts.imageUrl,
      base64Image: parts.base64Image,
      label: `Option ${index + 1}`,
    }
  }

  if (!isRecord(raw)) return null

  const path =
    (typeof raw.outputImagePath === 'string' && raw.outputImagePath) ||
    (typeof raw.output_image_path === 'string' && raw.output_image_path) ||
    (typeof raw.imageUrl === 'string' && raw.imageUrl) ||
    (typeof raw.image_url === 'string' && raw.image_url) ||
    (typeof raw.url === 'string' && raw.url) ||
    null

  const directBase64 =
    (typeof raw.base64Image === 'string' && raw.base64Image) ||
    (typeof raw.base64_image === 'string' && raw.base64_image) ||
    undefined

  const parts = splitStoredOutput(path)
  const imageUrl = parts.imageUrl
  const base64Image = directBase64 || parts.base64Image
  const error = typeof raw.error === 'string' ? raw.error : undefined
  const status = (raw.status === 'failed' || (!imageUrl && !base64Image && error))
    ? 'failed'
    : 'completed'

  if (!imageUrl && !base64Image && !error) {
    return null
  }

  return {
    referenceImageId:
      typeof raw.referenceImageId === 'string'
        ? raw.referenceImageId
        : typeof raw.reference_image_id === 'string'
          ? raw.reference_image_id
          : null,
    status,
    outputImagePath: path || undefined,
    imageUrl,
    base64Image,
    error,
    label: typeof raw.label === 'string' ? raw.label : `Option ${index + 1}`,
  }
}

export function getJobOutputsFromRecord(job: {
  output_image_path?: string | null
  settings?: unknown
}): TryOnJobOutput[] {
  const settings = isRecord(job.settings) ? job.settings : {}
  const settingsOutputs = Array.isArray(settings.outputs)
    ? settings.outputs
    : isRecord(settings.outcome) && Array.isArray(settings.outcome.outputs)
      ? settings.outcome.outputs
      : Array.isArray(settings.variants)
        ? settings.variants
        : []

  const normalized = settingsOutputs
    .map((output, index) => normalizeRawOutput(output, index))
    .filter((output): output is TryOnJobOutput => Boolean(output))

  if (normalized.length > 0) {
    return normalized
  }

  const legacyPath = job.output_image_path || null
  const legacyParts = splitStoredOutput(legacyPath)
  if (!legacyParts.imageUrl && !legacyParts.base64Image) {
    return []
  }

  return [
    {
      referenceImageId: null,
      status: 'completed',
      outputImagePath: legacyPath || undefined,
      imageUrl: legacyParts.imageUrl,
      base64Image: legacyParts.base64Image,
      label: 'Result',
    },
  ]
}

export function getFirstSuccessfulOutput(outputs: TryOnJobOutput[]): TryOnJobOutput | null {
  return outputs.find((output) => output.status === 'completed' && (output.imageUrl || output.base64Image)) || null
}

export function getAllOutputPaths(outputs: TryOnJobOutput[]): string[] {
  return outputs
    .map((output) => output.outputImagePath || output.imageUrl || null)
    .filter((path): path is string => Boolean(path))
}
