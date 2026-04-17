/**
 * FACE SWAP POST-PROCESSOR
 * 
 * After Gemini generates the scene image, this module:
 * 1. Detects the face in the generated image
 * 2. Extracts the face from the original source image
 * 3. Color-matches the source face to the generated scene lighting
 * 4. Overlays with feathered blending for a seamless composite
 * 
 * This gives 100% face identity preservation while allowing scene changes.
 * Only used for scene-change presets — clothing-only mode doesn't need this.
 * 
 * KEY IMPROVEMENTS over old eye-compositor.ts:
 * - Color/lighting matching (source face adapts to scene lighting)
 * - Proper aspect-ratio scaling (never stretches)
 * - Tighter mask to avoid ghost edges
 * - Graceful fallback (returns generated image if anything fails)
 */

import sharp from 'sharp'
import { FaceCoordinates, detectFaceCoordinates } from './face-coordinates'

export interface FaceSwapResult {
    image: string           // Final composited image (base64)
    applied: boolean        // Whether face swap was applied
    reason: string          // Why it was or wasn't applied
    sourceFace?: FaceCoordinates
    targetFace?: FaceCoordinates
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FACE SWAP FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function applyFaceSwap(
    sourceImageBase64: string,     // Original person image
    generatedImageBase64: string,  // Gemini-generated scene image
): Promise<FaceSwapResult> {

    try {
        // ─── 1. Detect faces in both images ───
        const [sourceFace, targetFace] = await Promise.all([
            detectFaceCoordinates(sourceImageBase64, { allowHeuristicFallback: true }),
            detectFaceCoordinates(generatedImageBase64, { allowHeuristicFallback: true }),
        ])

        if (!sourceFace) {
            return { image: generatedImageBase64, applied: false, reason: 'no_source_face' }
        }
        if (!targetFace) {
            return { image: generatedImageBase64, applied: false, reason: 'no_target_face' }
        }

        // Validate face sizes are reasonable
        const srcFaceArea = (sourceFace.xmax - sourceFace.xmin) * (sourceFace.ymax - sourceFace.ymin)
        const tgtFaceArea = (targetFace.xmax - targetFace.xmin) * (targetFace.ymax - targetFace.ymin)

        if (srcFaceArea < 5000 || tgtFaceArea < 5000) {
            return { image: generatedImageBase64, applied: false, reason: 'face_too_small', sourceFace, targetFace }
        }

        // ─── 2. Load images ───
        const srcBuffer = Buffer.from(sourceImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')
        const genBuffer = Buffer.from(generatedImageBase64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64')

        const srcMeta = await sharp(srcBuffer).metadata()
        const genMeta = await sharp(genBuffer).metadata()

        if (!srcMeta.width || !srcMeta.height || !genMeta.width || !genMeta.height) {
            return { image: generatedImageBase64, applied: false, reason: 'invalid_metadata', sourceFace, targetFace }
        }

        // ─── 3. Extract source face with padding ───
        const srcX = Math.floor((sourceFace.xmin / 1000) * srcMeta.width)
        const srcY = Math.floor((sourceFace.ymin / 1000) * srcMeta.height)
        const srcW = Math.floor(((sourceFace.xmax - sourceFace.xmin) / 1000) * srcMeta.width)
        const srcH = Math.floor(((sourceFace.ymax - sourceFace.ymin) / 1000) * srcMeta.height)

        // 15% padding for blending room
        const padX = Math.floor(srcW * 0.15)
        const padY = Math.floor(srcH * 0.15)
        const cropLeft = Math.max(0, srcX - padX)
        const cropTop = Math.max(0, srcY - padY)
        const cropRight = Math.min(srcMeta.width, srcX + srcW + padX)
        const cropBottom = Math.min(srcMeta.height, srcY + srcH + padY)
        const cropW = cropRight - cropLeft
        const cropH = cropBottom - cropTop

        if (cropW < 30 || cropH < 30) {
            return { image: generatedImageBase64, applied: false, reason: 'crop_too_small', sourceFace, targetFace }
        }

        const srcFaceCrop = await sharp(srcBuffer)
            .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
            .toBuffer()

        // ─── 4. Compute destination placement ───
        const destW = Math.floor(((targetFace.xmax - targetFace.xmin) / 1000) * genMeta.width)
        const destCenterX = Math.floor(((targetFace.xmin + targetFace.xmax) / 2 / 1000) * genMeta.width)
        const destCenterY = Math.floor(((targetFace.ymin + targetFace.ymax) / 2 / 1000) * genMeta.height)

        // Scale uniformly to match destination face width (with padding)
        const destPaddedW = destW + Math.floor(destW * 0.3)
        const scaleFactor = destPaddedW / cropW
        const targetW = Math.round(cropW * scaleFactor)
        const targetH = Math.round(cropH * scaleFactor)

        if (targetW < 30 || targetH < 30) {
            return { image: generatedImageBase64, applied: false, reason: 'target_too_small', sourceFace, targetFace }
        }

        // ─── 5. Color-match source face to generated scene ───
        // Extract the same region from the generated image to sample its color temperature
        const genRegionLeft = Math.max(0, destCenterX - Math.floor(targetW / 2))
        const genRegionTop = Math.max(0, destCenterY - Math.floor(targetH / 2))
        const genRegionW = Math.min(targetW, genMeta.width - genRegionLeft)
        const genRegionH = Math.min(targetH, genMeta.height - genRegionTop)

        let colorMatchedFace: Buffer

        try {
            // Get average color of the face region in the generated image
            const genFaceRegion = await sharp(genBuffer)
                .extract({ left: genRegionLeft, top: genRegionTop, width: genRegionW, height: genRegionH })
                .resize(1, 1, { fit: 'cover' }) // Single pixel = average color
                .raw()
                .toBuffer()

            // Get average color of the source face
            const srcFaceAvg = await sharp(srcFaceCrop)
                .resize(1, 1, { fit: 'cover' })
                .raw()
                .toBuffer()

            // Calculate color shift ratios (simple but effective)
            const rRatio = genFaceRegion[0] / Math.max(1, srcFaceAvg[0])
            const gRatio = genFaceRegion[1] / Math.max(1, srcFaceAvg[1])
            const bRatio = genFaceRegion[2] / Math.max(1, srcFaceAvg[2])

            // Blend: apply ~30% of the color shift (subtle adjustment, not full replacement)
            const blendStrength = 0.3
            const rMul = 1 + (rRatio - 1) * blendStrength
            const gMul = 1 + (gRatio - 1) * blendStrength
            const bMul = 1 + (bRatio - 1) * blendStrength

            // Clamp multipliers to avoid extreme shifts
            const clamp = (v: number) => Math.max(0.7, Math.min(1.3, v))

            colorMatchedFace = await sharp(srcFaceCrop)
                .resize(targetW, targetH, { fit: 'fill' })
                .removeAlpha()
                .linear(
                    [clamp(rMul), clamp(gMul), clamp(bMul)],  // multipliers per channel
                    [0, 0, 0]                                    // offsets
                )
                .toBuffer()

            if (process.env.NODE_ENV !== 'production') {
                console.log(`   🎨 Color match: R×${clamp(rMul).toFixed(2)} G×${clamp(gMul).toFixed(2)} B×${clamp(bMul).toFixed(2)}`)
            }
        } catch {
            // If color matching fails, just resize without color adjustment
            colorMatchedFace = await sharp(srcFaceCrop)
                .resize(targetW, targetH, { fit: 'fill' })
                .removeAlpha()
                .toBuffer()
        }

        // ─── 6. Feathered elliptical mask ───
        const cx = Math.round(targetW / 2)
        const cy = Math.round(targetH / 2)
        const rx = Math.round(targetW / 2.2) // Slightly tighter than full coverage
        const ry = Math.round(targetH / 2.2)

        const maskSvg = `<svg width="${targetW}" height="${targetH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="f" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="50%" stop-color="white" stop-opacity="1" />
      <stop offset="100%" stop-color="white" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${targetW}" height="${targetH}" fill="black" />
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#f)" />
</svg>`

        const maskBuffer = await sharp(Buffer.from(maskSvg))
            .resize(targetW, targetH)
            .grayscale()
            .toColourspace('b-w')
            .toBuffer()

        // Combine: RGB face + grayscale mask = RGBA with feathered edges
        const maskedFace = await sharp(colorMatchedFace)
            .joinChannel(maskBuffer)
            .toBuffer()

        // ─── 7. Composite onto generated image ───
        const compositeLeft = Math.max(0, Math.round(destCenterX - targetW / 2))
        const compositeTop = Math.max(0, Math.round(destCenterY - targetH / 2))

        // Ensure we don't overflow
        const safeLeft = Math.min(Math.max(0, compositeLeft), genMeta.width - targetW)
        const safeTop = Math.min(Math.max(0, compositeTop), genMeta.height - targetH)

        const finalImage = await sharp(genBuffer)
            .ensureAlpha()
            .composite([{
                input: maskedFace,
                left: Math.max(0, safeLeft),
                top: Math.max(0, safeTop),
                blend: 'over'
            }])
            .removeAlpha()
            .toFormat('png')
            .toBuffer()

        if (process.env.NODE_ENV !== 'production') {
            console.log(`   👤 Face swap: ${cropW}x${cropH} → ${targetW}x${targetH} (${scaleFactor.toFixed(2)}x) at (${Math.max(0, safeLeft)},${Math.max(0, safeTop)})`)
        }

        return {
            image: `data:image/png;base64,${finalImage.toString('base64')}`,
            applied: true,
            reason: 'success',
            sourceFace,
            targetFace,
        }
    } catch (error) {
        console.error('👤 Face swap failed:', error)
        return { image: generatedImageBase64, applied: false, reason: `error: ${error instanceof Error ? error.message : String(error)}` }
    }
}
