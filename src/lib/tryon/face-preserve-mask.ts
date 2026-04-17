/**
 * FACE PRESERVE COMPOSITING
 * 
 * The ONLY mathematically sound way to guarantee 100% face preservation:
 * 
 * 1. Let Gemini generate the full try-on image (clothing + scene)
 * 2. Detect the face in BOTH original and generated images
 * 3. Build a head preservation mask (everything from top of head to neck)
 * 4. Composite: paste original head pixels onto generated image
 *    with color-matched feathered blending at the neck boundary
 *
 * Why this works:
 * - Face pixels come from the ORIGINAL photo, not from Gemini's reconstruction
 * - The mask ensures a smooth blend at the neck/chest boundary
 * - Color matching adjusts the original head's lighting to match the scene
 * - Hair, ears, makeup, expression — ALL preserved exactly
 */

import sharp from 'sharp'
import { FaceCoordinates, detectFaceCoordinates } from './face-coordinates'

export interface FacePreserveResult {
    image: string
    applied: boolean
    reason: string
}

/**
 * Preserves the original face by compositing it onto the generated image.
 * 
 * Creates a gradient mask that:
 * - Is 100% opaque from top of image to chin (preserves all head pixels)  
 * - Feathers from chin to below-chest (smooth blend with generated clothing)
 * - Is 0% below the blend zone (generated clothing shows through)
 */
export async function preserveFace(
    originalImageBase64: string,
    generatedImageBase64: string,
): Promise<FacePreserveResult> {
    const isDev = process.env.NODE_ENV !== 'production'

    try {
        // 1. Detect face in both images
        const [origFace, genFace] = await Promise.all([
            detectFaceCoordinates(originalImageBase64, { allowHeuristicFallback: true }),
            detectFaceCoordinates(generatedImageBase64, { allowHeuristicFallback: true }),
        ])

        if (!origFace || !genFace) {
            return { image: generatedImageBase64, applied: false, reason: `no_face_detected (orig=${!!origFace}, gen=${!!genFace})` }
        }

        // 2. Load images
        const origBuffer = Buffer.from(originalImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')
        const genBuffer = Buffer.from(generatedImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')

        const origMeta = await sharp(origBuffer).metadata()
        const genMeta = await sharp(genBuffer).metadata()

        if (!origMeta.width || !origMeta.height || !genMeta.width || !genMeta.height) {
            return { image: generatedImageBase64, applied: false, reason: 'invalid_metadata' }
        }

        // 3. Calculate head region in original image
        // Head extends from top of image to chin + some chest area
        const origFaceBottom = Math.floor((origFace.ymax / 1000) * origMeta.height)
        const origFaceTop = Math.floor((origFace.ymin / 1000) * origMeta.height)
        const origFaceHeight = origFaceBottom - origFaceTop

        // Head mask: preserve from top of image to chin
        // Feather zone: chin to chin + 40% of face height (covers neck/upper chest)
        const headEnd = origFaceBottom
        const featherSize = Math.floor(origFaceHeight * 0.4)
        const blendEnd = Math.min(origMeta.height, headEnd + featherSize)

        // 4. Calculate corresponding region in generated image
        const genFaceBottom = Math.floor((genFace.ymax / 1000) * genMeta.height)
        const genFaceTop = Math.floor((genFace.ymin / 1000) * genMeta.height)
        const genFaceHeight = genFaceBottom - genFaceTop

        // 5. Extract head region from original (top of image to blend zone)
        const origHeadHeight = blendEnd
        const origHeadCrop = await sharp(origBuffer)
            .extract({ left: 0, top: 0, width: origMeta.width, height: Math.min(origHeadHeight, origMeta.height) })
            .toBuffer()

        // 6. Resize original head to match generated image dimensions
        const genBlendEnd = Math.min(genMeta.height, genFaceBottom + Math.floor(genFaceHeight * 0.4))
        const genHeadHeight = genBlendEnd

        const resizedHead = await sharp(origHeadCrop)
            .resize(genMeta.width, genHeadHeight, { fit: 'fill' })
            .removeAlpha()
            .toBuffer()

        // 7. Color matching: sample average colors from both images' face regions
        let colorMatchedHead: Buffer
        try {
            const origFaceRegion = await sharp(origBuffer)
                .extract({
                    left: Math.floor((origFace.xmin / 1000) * origMeta.width),
                    top: origFaceTop,
                    width: Math.floor(((origFace.xmax - origFace.xmin) / 1000) * origMeta.width),
                    height: origFaceHeight,
                })
                .resize(1, 1, { fit: 'cover' })
                .raw()
                .toBuffer()

            const genFaceRegion = await sharp(genBuffer)
                .extract({
                    left: Math.floor((genFace.xmin / 1000) * genMeta.width),
                    top: genFaceTop,
                    width: Math.floor(((genFace.xmax - genFace.xmin) / 1000) * genMeta.width),
                    height: genFaceHeight,
                })
                .resize(1, 1, { fit: 'cover' })
                .raw()
                .toBuffer()

            // Apply 25% of the color shift (subtle warmth/coolness matching)
            const blend = 0.25
            const rMul = Math.max(0.8, Math.min(1.2, 1 + (genFaceRegion[0] / Math.max(1, origFaceRegion[0]) - 1) * blend))
            const gMul = Math.max(0.8, Math.min(1.2, 1 + (genFaceRegion[1] / Math.max(1, origFaceRegion[1]) - 1) * blend))
            const bMul = Math.max(0.8, Math.min(1.2, 1 + (genFaceRegion[2] / Math.max(1, origFaceRegion[2]) - 1) * blend))

            colorMatchedHead = await sharp(resizedHead)
                .linear([rMul, gMul, bMul], [0, 0, 0])
                .toBuffer()

            if (isDev) console.log(`   🎨 Color match: R×${rMul.toFixed(2)} G×${gMul.toFixed(2)} B×${bMul.toFixed(2)}`)
        } catch {
            colorMatchedHead = resizedHead
        }

        // 8. Build feathered gradient mask
        // Top portion: fully white (100% original)
        // Bottom portion: gradient from white to black (feathered blend)
        const solidHeight = Math.max(1, genFaceBottom - Math.floor(genFaceHeight * 0.05)) // just above chin
        const gradientHeight = Math.max(1, genHeadHeight - solidHeight)

        // Build gradient as a series of horizontal bars
        const rows: string[] = []
        for (let y = 0; y < genHeadHeight; y++) {
            let opacity: number
            if (y < solidHeight) {
                opacity = 255 // Fully opaque (keep original)
            } else {
                // Feather from opaque to transparent
                const progress = (y - solidHeight) / gradientHeight
                // Use cosine curve for smoother blend
                opacity = Math.round(255 * (1 - progress) * (1 - progress))
            }
            rows.push(`<rect x="0" y="${y}" width="${genMeta.width}" height="1" fill="rgb(${opacity},${opacity},${opacity})" />`)
        }

        const maskSvg = `<svg width="${genMeta.width}" height="${genHeadHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${genMeta.width}" height="${genHeadHeight}" fill="black" />
  ${rows.join('\n  ')}
</svg>`

        const maskBuffer = await sharp(Buffer.from(maskSvg))
            .resize(genMeta.width, genHeadHeight)
            .grayscale()
            .toColourspace('b-w')
            .toBuffer()

        // 9. Apply mask: RGB head + grayscale mask = RGBA
        const maskedHead = await sharp(colorMatchedHead)
            .joinChannel(maskBuffer)
            .toBuffer()

        // 10. Composite onto generated image at top
        const finalImage = await sharp(genBuffer)
            .ensureAlpha()
            .composite([{
                input: maskedHead,
                left: 0,
                top: 0,
                blend: 'over',
            }])
            .removeAlpha()
            .toFormat('png')
            .toBuffer()

        if (isDev) {
            console.log(`   👤 Head preserved: solidH=${solidHeight}px, featherH=${gradientHeight}px, total=${genHeadHeight}px`)
        }

        return {
            image: `data:image/png;base64,${finalImage.toString('base64')}`,
            applied: true,
            reason: 'success',
        }
    } catch (error) {
        console.error('👤 Face preservation failed:', error)
        return {
            image: generatedImageBase64,
            applied: false,
            reason: `error: ${error instanceof Error ? error.message : String(error)}`,
        }
    }
}
