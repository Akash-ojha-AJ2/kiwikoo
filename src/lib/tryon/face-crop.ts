import sharp from 'sharp'
import { detectFaceCoordinates, type FaceCoordinates } from './face-coordinates'

interface FaceCropOutput {
    success: boolean
    faceCropBase64: string
}

const MIN_FACE_CROP_SIZE = 384
const FACE_CROP_PADDING = 0.45

/**
 * Extracts a tight face crop from the person image using Gemini face detection.
 * Returns a high-quality, closely-cropped face for identity reinforcement as Image 3.
 *
 * Uses detected face coordinates when available for a precise crop.
 * Falls back to a center-top heuristic only when detection fails.
 */
export async function extractFaceCrop(
    personImageBase64: string,
    preDetectedFace?: FaceCoordinates | null
): Promise<FaceCropOutput> {
    try {
        const cleanBase64 = personImageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
        const buffer = Buffer.from(cleanBase64, 'base64')
        const metadata = await sharp(buffer).metadata()

        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image metadata')
        }

        let left: number
        let top: number
        let cropWidth: number
        let cropHeight: number

        // Use pre-detected coordinates or run detection for a tight crop
        let face = preDetectedFace
        if (face === undefined) {
            face = await detectFaceCoordinates(cleanBase64, { allowHeuristicFallback: false })
        }

        if (face && face.confidence >= 0.5) {
            // Convert normalized 0-1000 coords to pixels
            const faceLeft = Math.floor((face.xmin / 1000) * metadata.width)
            const faceTop = Math.floor((face.ymin / 1000) * metadata.height)
            const faceRight = Math.ceil((face.xmax / 1000) * metadata.width)
            const faceBottom = Math.ceil((face.ymax / 1000) * metadata.height)
            const faceW = faceRight - faceLeft
            const faceH = faceBottom - faceTop

            // Add padding around face for context (hair, ears, chin, forehead)
            const padX = Math.floor(faceW * FACE_CROP_PADDING)
            const padY = Math.floor(faceH * FACE_CROP_PADDING)

            left = Math.max(0, faceLeft - padX)
            top = Math.max(0, faceTop - padY)
            const right = Math.min(metadata.width, faceRight + padX)
            const bottom = Math.min(metadata.height, faceBottom + padY)
            cropWidth = right - left
            cropHeight = bottom - top
        } else {
            // Fallback heuristic: center-top crop (head region)
            cropWidth = Math.floor(metadata.width * 0.55)
            cropHeight = Math.floor(metadata.height * 0.45)
            left = Math.floor((metadata.width - cropWidth) / 2)
            top = 0
        }

        // Ensure minimum dimensions so Gemini can read facial micro-features
        const scale = Math.max(1, MIN_FACE_CROP_SIZE / Math.min(cropWidth, cropHeight))
        const outputWidth = Math.round(cropWidth * scale)
        const outputHeight = Math.round(cropHeight * scale)

        const croppedBuffer = await sharp(buffer)
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize(outputWidth, outputHeight, { fit: 'inside', withoutEnlargement: false })
            .sharpen({ sigma: 0.8 })
            .toFormat('jpeg', { quality: 92 })
            .toBuffer()

        return {
            success: true,
            faceCropBase64: croppedBuffer.toString('base64'),
        }
    } catch (error) {
        console.warn('Face crop extraction failed:', error)
        return {
            success: false,
            faceCropBase64: '',
        }
    }
}
