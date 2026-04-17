export function normalizeBase64(imageBase64: string | undefined | null, targetSize: number = 1024): string {
  // Handle null/undefined/empty strings
  if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
    throw new Error('Invalid image data: imageBase64 is required and must be a non-empty string')
  }
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  
  // Validate that we have actual base64 data
  if (!base64Data || base64Data.length < 100) {
    throw new Error('Invalid image data: base64 string is too short or invalid')
  }
  
  // For now, return as-is. In production, you'd want to:
  // 1. Decode base64 to image
  // 2. Resize to targetSize x targetSize
  // 3. Re-encode to base64
  // This would require a library like sharp or canvas
  
  return base64Data
}

export async function redactClothingRefFaces(imageBase64: string): Promise<string> {
  // In production, use face detection to blur/remove faces from clothing reference images
  // For now, return as-is
  return imageBase64
}

export async function autoGarmentCrop(imageBase64: string): Promise<string> {
  // In production, use object detection to auto-crop garment from image
  // For now, return as-is
  return imageBase64
}

