import sharp from 'sharp'
import { FaceCoordinates } from './face-coordinates'

interface EyeCompositeInput {
    personImageBase64: string        // Source
    generatedImageBase64: string      // Target
    personFace: FaceCoordinates | null
    generatedFace: FaceCoordinates | null
}

/**
 * Composites the original eyes/face area onto the generated image.
 * Uses a soft-edged mask to blend.
 */
export async function compositeEyes(input: EyeCompositeInput): Promise<string> {
    const { personImageBase64, generatedImageBase64, personFace, generatedFace } = input

    if (!personFace || !generatedFace) {
        console.warn('⚠️ Cannot composite eyes: Missing face coordinates.')
        return generatedImageBase64 // Fallback to raw generation
    }

    try {
        const personBuffer = Buffer.from(personImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')
        const genBuffer = Buffer.from(generatedImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')

        // Get metadata for dimensions
        const personMeta = await sharp(personBuffer).metadata()
        const genMeta = await sharp(genBuffer).metadata()

        if (!personMeta.width || !personMeta.height || !genMeta.width || !genMeta.height) {
            throw new Error('Invalid image metadata')
        }

        // Convert 0-1000 coordinates to pixels
        // We target the "Upper Face" (Eyes + Nose Bridge)
        // Box is [ymin, xmin, ymax, xmax]

        // SOURCE CROP
        const srcY = Math.floor((personFace.ymin / 1000) * personMeta.height)
        const srcX = Math.floor((personFace.xmin / 1000) * personMeta.width)
        const srcH = Math.floor(((personFace.ymax - personFace.ymin) / 1000) * personMeta.height)
        const srcW = Math.floor(((personFace.xmax - personFace.xmin) / 1000) * personMeta.width)

        // We restrict crop to the top 60% of the face box (Eyes/Brows/Nose) to avoid mouth issues
        const cropH = Math.floor(srcH * 0.55)

        // Extract Source Upper Face
        const srcFace = await sharp(personBuffer)
            .extract({ left: srcX, top: srcY, width: srcW, height: cropH })
            .toBuffer()

        // TARGET REGION
        const destY = Math.floor((generatedFace.ymin / 1000) * genMeta.height)
        const destX = Math.floor((generatedFace.xmin / 1000) * genMeta.width)
        const destH = Math.floor(((generatedFace.ymax - generatedFace.ymin) / 1000) * genMeta.height)
        const destW = Math.floor(((generatedFace.xmax - generatedFace.xmin) / 1000) * genMeta.width)

        // Resize Source Face to match Target dimensions
        const targetW = destW
        const targetH = Math.floor(destH * 0.55) // Same ratio as crop

        const resizedSrcFace = await sharp(srcFace)
            .resize(targetW, targetH)
            .toBuffer()

        // Create a feathering mask (Alpha channel)
        // We want a soft oval or gradient mask so edges don't look cut
        const mask = await sharp({
            create: {
                width: targetW,
                height: targetH,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        })
            .composite([{
                input: Buffer.from(`
        <svg width="${targetW}" height="${targetH}">
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="70%" style="stop-color:white;stop-opacity:1" />
              <stop offset="100%" style="stop-color:white;stop-opacity:0" />
            </radialGradient>
          </defs>
          <ellipse cx="${targetW / 2}" cy="${targetH / 2}" rx="${targetW / 2.2}" ry="${targetH / 2.2}" fill="url(#grad1)" />
        </svg>
      `),
                blend: 'dest-in'
            }])
            .png()
            .toBuffer()

        // Apply mask to resized source face
        const maskedSrcFace = await sharp(resizedSrcFace)
            .composite([{ input: mask, blend: 'dest-in' }])
            .toBuffer()

        // Composite onto generated image
        const finalImage = await sharp(genBuffer)
            .composite([{
                input: maskedSrcFace,
                left: destX,
                top: destY,
                blend: 'over'
            }])
            .toFormat('png') // Output as PNG base64
            .toBuffer()

        return `data:image/png;base64,${finalImage.toString('base64')}`

    } catch (error) {
        console.error('👁️ Eye Composition Failed:', error)
        return generatedImageBase64 // Fallback
    }
}
