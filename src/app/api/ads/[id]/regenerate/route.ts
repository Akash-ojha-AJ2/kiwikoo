/**
 * AD REGENERATE API
 * 
 * POST - Regenerate an ad creative with new image
 * Uses correct schema: ad_creatives has image_url, rating columns
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { tryAcquireInFlight } from '@/lib/traffic-guard'
import { rateAdCreative, generateAdCopy } from '@/lib/openai'
import { generateIntelligentAdComposition } from '@/lib/gemini'
import { GeminiRateLimitError } from '@/lib/gemini/executor'
import { saveUpload } from '@/lib/storage'

export const maxDuration = 60

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    let inFlight: { allowed: boolean; retryAfterSeconds?: number; release?: () => Promise<void> } | null = null
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if brand
        const service = createServiceClient()
        const { data: profile } = await service
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', authUser.id)
            .single()

        const role = (profile?.role || '').toLowerCase()
        if (role !== 'brand') {
            return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
        }

        // Fetch creative
        const { data: creative, error: fetchError } = await service
            .from('ad_creatives')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !creative) {
            return NextResponse.json({ error: 'Creative not found' }, { status: 404 })
        }

        if (creative.brand_id !== authUser.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        inFlight = await tryAcquireInFlight(authUser.id, 'ads')
        if (!inFlight.allowed) {
            const retry = inFlight.retryAfterSeconds ?? 15
            return NextResponse.json(
                { error: 'An ad is already being generated. Please wait for it to finish.', retryAfterSeconds: retry },
                { status: 429, headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' } }
            )
        }

        const rateLimit = await checkRateLimit(authUser.id, 'ads')
        if (!rateLimit.allowed) {
            const retry = rateLimit.retryAfterSeconds ?? 60
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a moment and try again.', retryAfterSeconds: retry, resetTime: rateLimit.resetTime },
                { status: 429, headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' } }
            )
        }

        const body = await request.json().catch(() => null)
        const promptModifier = body?.promptModifier || ''

        // Generate new ad image
        const prompt = promptModifier || `Generate a professional advertising image. Use studio lighting, clean composition, and brand-appropriate aesthetics.`

        if (process.env.NODE_ENV !== 'production') console.log('[Regenerate] Generating new ad image...')
        const generatedImage = await generateIntelligentAdComposition(
            undefined, // No product image stored
            undefined, // No influencer image stored
            prompt
        )

        // Rate the new ad
        const rating = await rateAdCreative(generatedImage)
        const qualityScore = (rating as any)?.score || 75

        // Generate new copy
        const copyVariants = await generateAdCopy(generatedImage, {
            brandName: profile?.full_name || undefined,
        })

        // Extract MIME type and save image
        let contentType = 'image/jpeg'
        let fileExtension = 'jpg'
        const mimeMatch = generatedImage.match(/^data:(image\/\w+);base64,/)
        if (mimeMatch) {
            contentType = mimeMatch[1]
            if (contentType === 'image/png') fileExtension = 'png'
            else if (contentType === 'image/webp') fileExtension = 'webp'
        }

        const imagePath = `${authUser.id}/${Date.now()}.${fileExtension}`
        const imageUrl = await saveUpload(generatedImage, imagePath, 'ads', contentType)
        if (process.env.NODE_ENV !== 'production') console.log('[Regenerate] Saved new image:', imageUrl)

        // Update the ad creative with correct column names
        const { data: updated, error: updateError } = await service
            .from('ad_creatives')
            .update({
                image_url: imageUrl,
                rating: qualityScore,
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error('[Regenerate] Update error:', updateError)
            return NextResponse.json({ error: 'Failed to update creative' }, { status: 500 })
        }

        if (process.env.NODE_ENV !== 'production') console.log('[Regenerate] Updated creative:', updated?.id)

        return NextResponse.json({
            id: updated.id,
            imageUrl: updated.image_url,
            copy: copyVariants,
            rating: qualityScore,
        })

    } catch (error) {
        console.error('Ad regen error:', error)
        if (error instanceof GeminiRateLimitError) {
            const retryAfterSeconds = Math.min(
                60,
                Math.ceil((error.retryAfterMs ?? 30_000) / 1000)
            ) || 30
            return NextResponse.json(
                {
                    error: error.message || 'Rate limit reached. Please retry shortly.',
                    code: 'RATE_LIMIT',
                    retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(retryAfterSeconds),
                        'Cache-Control': 'no-store',
                    },
                }
            )
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        )
    } finally {
        void inFlight?.release?.()
    }
}
