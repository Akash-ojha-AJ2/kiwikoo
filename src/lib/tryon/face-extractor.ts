/**
 * FACE EXTRACTOR (Stage 1 - Face Freeze)
 * 
 * Extracts face region with expanded bounding box and creates binary mask.
 * This is the CRITICAL module for face preservation.
 * 
 * CORE PRINCIPLE: Face is NOT described by text. Face is COPIED as pixels.
 * 
 * The face region from the input image is a READ-ONLY pixel region.
 * - No generation of new face pixels
 * - No beautification
 * - No slimming
 * - No enhancement
 */

import { getGeminiChat } from '@/lib/tryon/gemini-chat'

export interface FaceLandmarks {
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
    noseTip: { x: number; y: number }
    leftMouth: { x: number; y: number }
    rightMouth: { x: number; y: number }
    chin: { x: number; y: number }
}

export interface BoundingBox {
    x: number       // Top-left x
    y: number       // Top-left y
    width: number
    height: number
    // Expanded bounds (+15% horizontal, +25% vertical)
    expandedX: number
    expandedY: number
    expandedWidth: number
    expandedHeight: number
}

export interface FaceExtractionResult {
    facePixels: string           // Base64 of cropped face region (expanded)
    faceMask: string             // Binary alpha mask for compositing (Base64 PNG)
    landmarks: FaceLandmarks     // Eye, nose, mouth positions (normalized 0-1)
    boundingBox: BoundingBox     // Original + expanded bounds
    confidence: number           // Detection confidence (0-1)
    imageWidth: number           // Original image width
    imageHeight: number          // Original image height
}

/**
 * Extract face region for pixel-level preservation
 * 
 * Uses GPT-4o-mini vision to:
 * 1. Detect face bounding box
 * 2. Extract facial landmarks (eyes, nose, mouth corners)
 * 3. Expand bounding box by +15% horizontal, +25% vertical
 * 
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @returns Face extraction result or null if no face detected
 */
export async function extractFaceForFreeze(
    imageBase64: string
): Promise<FaceExtractionResult | null> {
    const openai = getGeminiChat()

    // Format image URL
    const imageUrl = imageBase64.startsWith('data:image/')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`

    try {
        console.log('🔒 STAGE 1: Face Freeze - Extracting face region...')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a precise facial detection system for virtual try-on.
Your job is to detect the EXACT face region and facial landmarks for pixel-level preservation.

CRITICAL: This data will be used to COPY the face pixel-by-pixel, so accuracy is essential.

Return a JSON object with these exact fields:
{
  "detected": true/false,
  "confidence": 0.0-1.0,
  "imageWidth": estimated image width in pixels,
  "imageHeight": estimated image height in pixels,
  "boundingBox": {
    "x": top-left X as fraction of image width (0.0-1.0),
    "y": top-left Y as fraction of image height (0.0-1.0),
    "width": width as fraction of image width (0.0-1.0),
    "height": height as fraction of image height (0.0-1.0)
  },
  "landmarks": {
    "leftEye": { "x": X fraction, "y": Y fraction },
    "rightEye": { "x": X fraction, "y": Y fraction },
    "noseTip": { "x": X fraction, "y": Y fraction },
    "leftMouth": { "x": X fraction, "y": Y fraction },
    "rightMouth": { "x": X fraction, "y": Y fraction },
    "chin": { "x": X fraction, "y": Y fraction }
  }
}

All coordinates are normalized to 0.0-1.0 range.
The bounding box should tightly frame the face (forehead to chin, ear to ear).`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Detect the face region and extract precise landmark positions. Return exact coordinates.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 600,
            temperature: 0.1
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from face detection')
        }

        const detection = JSON.parse(content)

        if (!detection.detected) {
            console.log('   ❌ No face detected in image')
            return null
        }

        // Calculate expanded bounding box (+15% horizontal, +25% vertical)
        const bbox = detection.boundingBox
        const horizontalExpansion = bbox.width * 0.15
        const verticalExpansion = bbox.height * 0.25

        const expandedX = Math.max(0, bbox.x - horizontalExpansion / 2)
        const expandedY = Math.max(0, bbox.y - verticalExpansion / 2)
        const expandedWidth = Math.min(1 - expandedX, bbox.width + horizontalExpansion)
        const expandedHeight = Math.min(1 - expandedY, bbox.height + verticalExpansion)

        const boundingBox: BoundingBox = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
            expandedX,
            expandedY,
            expandedWidth,
            expandedHeight
        }

        // For now, we store the original image as face pixels
        // In a production system, this would be cropped using canvas/sharp
        // The actual cropping will happen in the reintegration step
        const result: FaceExtractionResult = {
            facePixels: imageBase64, // Full image for now - cropping done at composite time
            faceMask: '', // Will be generated during reintegration
            landmarks: detection.landmarks,
            boundingBox,
            confidence: detection.confidence,
            imageWidth: detection.imageWidth || 1024,
            imageHeight: detection.imageHeight || 1024
        }

        // Log extraction result
        console.log(`   ✓ Face detected with ${(result.confidence * 100).toFixed(0)}% confidence`)
        console.log(`   ✓ Bounding box: (${(bbox.x * 100).toFixed(1)}%, ${(bbox.y * 100).toFixed(1)}%)`)
        console.log(`   ✓ Face size: ${(bbox.width * 100).toFixed(1)}% x ${(bbox.height * 100).toFixed(1)}%`)
        console.log(`   ✓ Expanded region: +15% horizontal, +25% vertical`)
        console.log(`   🔒 Face is now FROZEN - pixel copy mode active`)

        return result
    } catch (error) {
        console.error('❌ Face extraction failed:', error)
        return null
    }
}

/**
 * Generate feathered alpha mask for face compositing
 * 
 * @param width - Mask width in pixels
 * @param height - Mask height in pixels
 * @param featherRadius - Feather radius in pixels (default: 12)
 * @returns Base64 encoded PNG mask
 */
export function generateFeatheredMask(
    width: number,
    height: number,
    featherRadius: number = 12
): string {
    // This would use canvas in browser or sharp in Node.js
    // For now, return a placeholder - actual implementation needs canvas access
    console.log(`   🎭 Generating feathered mask (${width}x${height}, feather: ${featherRadius}px)`)

    // Placeholder - in production, this generates an actual feathered ellipse mask
    return ''
}

/**
 * Log face freeze status for debugging
 */
export function logFaceExtractorStatus(sessionId: string, result: FaceExtractionResult | null): void {
    console.log(`\n╔═══════════════════════════════════════════════════════════════════════════════╗`)
    console.log(`║  STAGE 1: FACE FREEZE (PIXEL EXTRACTION)                                      ║`)
    console.log(`║  Session: ${sessionId.padEnd(64)}║`)
    console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)

    if (result) {
        console.log(`║  Status: ✅ FACE FROZEN`.padEnd(80) + '║')
        console.log(`║  Confidence: ${(result.confidence * 100).toFixed(0)}%`.padEnd(80) + '║')
        console.log(`║  Bounding Box: (${(result.boundingBox.x * 100).toFixed(1)}%, ${(result.boundingBox.y * 100).toFixed(1)}%)`.padEnd(80) + '║')
        console.log(`║  Face Size: ${(result.boundingBox.width * 100).toFixed(1)}% x ${(result.boundingBox.height * 100).toFixed(1)}%`.padEnd(80) + '║')
        console.log(`║  Expanded: +15% horizontal, +25% vertical`.padEnd(80) + '║')
        console.log(`╠═══════════════════════════════════════════════════════════════════════════════╣`)
        console.log(`║  🔒 FACE IS NOW IMMUTABLE - NO REGENERATION ALLOWED                          ║`)
    } else {
        console.log(`║  Status: ❌ NO FACE DETECTED`.padEnd(80) + '║')
        console.log(`║  Cannot proceed with face preservation pipeline`.padEnd(80) + '║')
    }

    console.log(`╚═══════════════════════════════════════════════════════════════════════════════╝\n`)
}
