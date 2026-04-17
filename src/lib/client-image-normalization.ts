'use client'

const OPENAI_SUPPORTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
])

const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.92

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('This image format could not be decoded in the browser'))
    image.src = dataUrl
  })
}

function getScaledSize(width: number, height: number) {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height }
  }

  const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export async function normalizeImageFileForVisionUpload(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image uploads are supported')
  }

  if (OPENAI_SUPPORTED_MIME_TYPES.has(file.type)) {
    return readFileAsDataUrl(file)
  }

  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(sourceDataUrl)
  const size = getScaledSize(image.naturalWidth || image.width, image.naturalHeight || image.height)

  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas is unavailable for image conversion')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size.width, size.height)
  context.drawImage(image, 0, 0, size.width, size.height)

  const converted = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  if (!converted.startsWith('data:image/jpeg;base64,')) {
    throw new Error('Image conversion failed')
  }

  return converted
}
