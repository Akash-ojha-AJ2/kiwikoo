/**
 * FACE IDENTITY RESTORATION (Stage 4)
 *
 * Two-tier approach:
 *  PRIMARY:  Gemini edit pass (holistic "fix the face" instruction)
 *  FALLBACK: InsightFace microservice (pixel-level face swap via inswapper_128)
 *
 * Gemini is the default production-safe path because it preserves clean skin
 * better on many try-on outputs. The optional Python microservice remains as a
 * fallback when a pixel-level identity correction is still needed.
 *
 * Set FACE_SWAP_SERVICE_URL to the InsightFace microservice endpoint.
 * In production (for example on Vercel), that service should be deployed
 * separately and reached over HTTP. Local auto-boot is development-only.
 */

import 'server-only'
import { geminiGenerateContent } from '@/lib/gemini/executor'
import type { GenerateContentConfig, ContentListUnion } from '@google/genai'
import type { FaceCoordinates } from './face-coordinates'
import { spawn } from 'child_process'
import path from 'path'

const FACE_SWAP_SERVICE_URL = process.env.FACE_SWAP_SERVICE_URL?.trim() || ''
const FACE_SWAP_TIMEOUT_MS = Number(process.env.FACE_SWAP_TIMEOUT_MS) || 30_000
const FACE_RESTORE_MODEL = process.env.TRYON_IMAGE_MODEL?.trim() || 'gemini-3-pro-image-preview'
const FACE_SWAP_AUTO_BOOT =
    process.env.FACE_SWAP_AUTO_BOOT !== 'false' && process.env.NODE_ENV !== 'production'
let localFaceSwapBootPromise: Promise<boolean> | null = null

export interface FaceRestoreInput {
    generatedImageBase64: string
    personImageBase64: string
    faceCropBase64?: string
    generatedFace: FaceCoordinates
    personFace: FaceCoordinates
    aspectRatio?: string
    perceivedGender?: 'masculine' | 'feminine' | 'neutral'
}

export interface FaceRestoreResult {
    success: boolean
    restoredImageBase64: string
    processingTimeMs: number
    method?: 'insightface' | 'gemini'
    identitySimilarityBefore?: number
    identitySimilarityAfter?: number
    skinToneDeltaBefore?: number
    skinToneDeltaAfter?: number
    darkSpotArtifactScoreAfter?: number
    error?: string
}

function cleanBase64(dataUrlOrBase64: string): string {
    return dataUrlOrBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
}

function isLocalFaceSwapUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
    } catch {
        return false
    }
}

async function fetchFaceSwapHealth(baseUrl: string, timeoutMs = 2000): Promise<boolean> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetch(`${baseUrl}/health`, { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) return false
        const data = await response.json().catch(() => null) as { status?: string; models_loaded?: boolean } | null
        return Boolean(data?.status === 'ok' && data?.models_loaded)
    } catch {
        return false
    } finally {
        clearTimeout(timeout)
    }
}

async function ensureLocalFaceSwapService(): Promise<boolean> {
    if (!FACE_SWAP_SERVICE_URL || !isLocalFaceSwapUrl(FACE_SWAP_SERVICE_URL) || !FACE_SWAP_AUTO_BOOT) {
        return false
    }

    if (await fetchFaceSwapHealth(FACE_SWAP_SERVICE_URL)) {
        return true
    }

    if (!localFaceSwapBootPromise) {
        localFaceSwapBootPromise = (async () => {
            const serviceDir = path.join(process.cwd(), 'services', 'face-swap')
            const parsed = new URL(FACE_SWAP_SERVICE_URL)
            const host = parsed.hostname === 'localhost' ? '127.0.0.1' : parsed.hostname
            const port = parsed.port || '8765'
            const candidates: Array<{ command: string; args: string[] }> =
                process.platform === 'win32'
                    ? [
                        { command: 'python', args: ['-m', 'uvicorn', 'main:app', '--host', host, '--port', port] },
                        { command: 'py', args: ['-3', '-m', 'uvicorn', 'main:app', '--host', host, '--port', port] },
                    ]
                    : [
                        { command: 'python3', args: ['-m', 'uvicorn', 'main:app', '--host', host, '--port', port] },
                        { command: 'python', args: ['-m', 'uvicorn', 'main:app', '--host', host, '--port', port] },
                    ]

            for (const candidate of candidates) {
                try {
                    const child = spawn(candidate.command, candidate.args, {
                        cwd: serviceDir,
                        detached: true,
                        stdio: 'ignore',
                        windowsHide: true,
                    })
                    ;(child as { unref?: () => void }).unref?.()
                } catch {
                    continue
                }

                for (let attempt = 0; attempt < 10; attempt++) {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    if (await fetchFaceSwapHealth(FACE_SWAP_SERVICE_URL, 1500)) {
                        return true
                    }
                }
            }

            return false
        })()
    }

    return localFaceSwapBootPromise
}

export async function canUseFaceSwapFastPath(): Promise<boolean> {
    if (!FACE_SWAP_SERVICE_URL) return false

    if (isLocalFaceSwapUrl(FACE_SWAP_SERVICE_URL)) {
        return ensureLocalFaceSwapService()
    }

    return true
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

export async function restoreFaceIdentity(
    input: FaceRestoreInput
): Promise<FaceRestoreResult> {
    const isDev = process.env.NODE_ENV !== 'production'

    // When InsightFace is available, use it FIRST — it does actual embedding-level
    // identity transfer via inswapper_128, which is far more reliable than Gemini's
    // generative edit pass for face identity preservation.
    if (FACE_SWAP_SERVICE_URL) {
        if (isDev) console.log('\n━━━ STAGE 4: Face Restore (InsightFace PRIMARY) ━━━')
        try {
            await ensureLocalFaceSwapService()
            const result = await restoreViaInsightFace(input)
            if (result.success) return result
            if (isDev) console.log(`   ⚠️ InsightFace failed: ${result.error}`)
        } catch (err) {
            if (isDev) console.log(`   ⚠️ InsightFace error: ${err}`)
        }

        // Fallback: Gemini edit pass (only if InsightFace failed)
        if (isDev) console.log('   Falling back to Gemini face restore...')
        try {
            const geminiResult = await restoreViaGemini(input)
            if (geminiResult.success) return geminiResult
            if (isDev) console.log(`   ⚠️ Gemini face restore also failed: ${geminiResult.error}`)
        } catch (err) {
            if (isDev) console.log(`   ⚠️ Gemini face restore error: ${err}`)
        }
    } else {
        // No InsightFace: Gemini is the only option
        if (isDev) console.log('\n━━━ STAGE 4: Face Restore (Gemini) ━━━')
        try {
            const geminiResult = await restoreViaGemini(input)
            if (geminiResult.success) return geminiResult
            if (isDev) console.log(`   ⚠️ Gemini face restore failed: ${geminiResult.error}`)
        } catch (err) {
            if (isDev) console.log(`   ⚠️ Gemini face restore error: ${err}`)
        }
    }

    return {
        success: false,
        restoredImageBase64: '',
        processingTimeMs: 0,
        error: 'All face restore methods failed',
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHTFACE MICROSERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function restoreViaInsightFace(
    input: FaceRestoreInput
): Promise<FaceRestoreResult> {
    const startTime = Date.now()
    const isDev = process.env.NODE_ENV !== 'production'

    const body = {
        source_image: cleanBase64(input.personImageBase64),
        target_image: cleanBase64(input.generatedImageBase64),
        face_crop: input.faceCropBase64 ? cleanBase64(input.faceCropBase64) : null,
        source_face_index: 0,
        target_face_index: 0,
    }

    if (isDev) console.log(`   🔗 POST ${FACE_SWAP_SERVICE_URL}/swap`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FACE_SWAP_TIMEOUT_MS)

    try {
        const response = await fetch(`${FACE_SWAP_SERVICE_URL}/swap`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!response.ok) {
            const text = await response.text().catch(() => '')
            throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`)
        }

        const data = await response.json() as {
            success: boolean
            image: string
            processing_ms: number
            identity_similarity_before?: number
            identity_similarity_after?: number
            skin_tone_delta_before?: number
            skin_tone_delta_after?: number
            dark_spot_artifact_score_after?: number
            error?: string
        }

        const elapsed = Date.now() - startTime

        if (!data.success || !data.image) {
            return {
                success: false,
                restoredImageBase64: '',
                processingTimeMs: elapsed,
                method: 'insightface',
                error: data.error || 'No image returned',
            }
        }

        if (isDev) console.log(`   ✅ InsightFace swap completed in ${elapsed}ms (service: ${data.processing_ms}ms)`)

        return {
            success: true,
            restoredImageBase64: `data:image/jpeg;base64,${data.image}`,
            processingTimeMs: elapsed,
            method: 'insightface',
            identitySimilarityBefore: data.identity_similarity_before,
            identitySimilarityAfter: data.identity_similarity_after,
            skinToneDeltaBefore: data.skin_tone_delta_before,
            skinToneDeltaAfter: data.skin_tone_delta_after,
            darkSpotArtifactScoreAfter: data.dark_spot_artifact_score_after,
        }
    } catch (err) {
        clearTimeout(timeout)
        const elapsed = Date.now() - startTime
        const message = err instanceof Error ? err.message : String(err)
        return {
            success: false,
            restoredImageBase64: '',
            processingTimeMs: elapsed,
            method: 'insightface',
            error: message,
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEMINI FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

async function restoreViaGemini(
    input: FaceRestoreInput
): Promise<FaceRestoreResult> {
    const startTime = Date.now()
    const isDev = process.env.NODE_ENV !== 'production'

    try {
        const personBase64 = cleanBase64(input.personImageBase64)
        const genBase64 = cleanBase64(input.generatedImageBase64)
        const hasFaceCrop = Boolean(input.faceCropBase64 && input.faceCropBase64.length > 100)

        const contents: ContentListUnion = [
            {
                inlineData: { data: personBase64, mimeType: 'image/jpeg' },
            } as any,
            'Image 1: the real person. This is the identity reference.',
        ]

        if (hasFaceCrop) {
            const faceCropClean = cleanBase64(input.faceCropBase64!)
            contents.push(
                { inlineData: { data: faceCropClean, mimeType: 'image/jpeg' } } as any,
                'Image 2: face close-up of the same person from Image 1.',
            )
        }

        contents.push(
            { inlineData: { data: genBase64, mimeType: 'image/png' } } as any,
            hasFaceCrop
                ? 'Image 3: a generated photo. The face does not match the person from Image 1.'
                : 'Image 2: a generated photo. The face does not match the person from Image 1.',
        )

        const genderDirective = input.perceivedGender === 'masculine'
            ? 'Preserve masculine presentation, brow weight, jaw shape, hairline, and facial hair exactly as photographed. '
            : input.perceivedGender === 'feminine'
                ? 'Preserve feminine presentation, natural facial proportions, hairline, skin tone, and asymmetry exactly as photographed. '
                : ''

        contents.push(
            `Fix ONLY the face in the generated photo to match the real person from Image 1 exactly.

IDENTITY RULES:
- Copy the face holistically — same bone structure, skin tone, every asymmetry and imperfection from Image 1.
- ${genderDirective}Keep the exact face SHAPE (jawline contour, chin, forehead outline) from the generated photo — only change the interior facial features (eyes, nose, mouth, eyebrows, cheeks).

SKIN QUALITY RULES (CRITICAL):
- The person's skin must look EXACTLY like Image 1. If the reference person has clear, smooth skin, the output must have clear smooth skin — NO added spots, moles, freckles, or blemishes.
- Do NOT introduce any dark spots, acne, pigmentation marks, or skin texture artifacts that are not in Image 1.
- Match the reference skin texture precisely: same pore visibility, same smoothness level, same skin clarity.
- If uncertain, preserve the cleaner skin from the generated photo instead of inventing extra skin details.

PRESERVATION RULES:
- Keep the head angle, lighting direction, expression, clothing, body, and background from the generated photo completely unchanged.
- Do not alter anything outside the face region.

Output the corrected image.`
        )

        if (isDev) console.log(`   🎯 Calling ${FACE_RESTORE_MODEL} for face correction...`)

        const config: GenerateContentConfig = {
            responseModalities: ['TEXT', 'IMAGE'],
            systemInstruction: 'You are a face identity correction tool. You receive a reference person photo and a generated photo where the face has drifted. Your job: replace ONLY the interior face features (eyes, nose, mouth, eyebrows, skin) in the generated photo with those from the reference, matching the lighting and angle of the generated photo. CRITICAL: preserve the face SHAPE (jawline, chin contour) from the generated photo. Match the reference skin EXACTLY — if the reference has clear skin, output must have clear skin with NO added spots, moles, or blemishes. If uncertain, preserve the cleaner skin texture already present in the generated image instead of inventing extra pores, freckles, or dark marks. Do not alter clothing, body, or background.',
            temperature: 0.2,
            topP: 0.85,
            topK: 16,
        }

        const response = await geminiGenerateContent({
            model: FACE_RESTORE_MODEL,
            contents,
            config,
        })

        if (response.data) {
            const elapsed = Date.now() - startTime
            if (isDev) console.log(`   ✅ Gemini face restore in ${(elapsed / 1000).toFixed(1)}s`)
            return {
                success: true,
                restoredImageBase64: `data:image/png;base64,${response.data}`,
                processingTimeMs: elapsed,
                method: 'gemini',
            }
        }

        const responseParts: any[] = response.candidates?.[0]?.content?.parts || []
        for (const part of responseParts) {
            if (part.inlineData?.data) {
                const mimeType = part.inlineData.mimeType || 'image/png'
                const elapsed = Date.now() - startTime
                if (isDev) console.log(`   ✅ Gemini face restore in ${(elapsed / 1000).toFixed(1)}s`)
                return {
                    success: true,
                    restoredImageBase64: `data:${mimeType};base64,${part.inlineData.data}`,
                    processingTimeMs: elapsed,
                    method: 'gemini',
                }
            }
        }

        const textPart = responseParts.find((p: any) => p.text)?.text
        throw new Error(textPart || 'Gemini did not return a restored image')

    } catch (error) {
        const elapsed = Date.now() - startTime
        console.error('❌ Gemini face restore failed:', error)
        return {
            success: false,
            restoredImageBase64: '',
            processingTimeMs: elapsed,
            method: 'gemini',
            error: error instanceof Error ? error.message : String(error),
        }
    }
}
