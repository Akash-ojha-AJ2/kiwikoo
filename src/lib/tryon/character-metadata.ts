/**
 * CHARACTER METADATA EXTRACTOR
 * 
 * Extracts a persistent forensic face identity from a user's character images.
 * This runs ONCE when images are uploaded (not on every try-on request),
 * storing the result in influencer_profiles.character_metadata.
 * 
 * Every try-on for this user then uses the SAME metadata, ensuring 
 * consistent face identity across all generations — like a face fingerprint.
 */

import 'server-only'
import { createServiceClient } from '@/lib/auth'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'

const FORENSIC_MODEL = process.env.TRYON_FORENSIC_PROMPT_MODEL?.trim() || 'gpt-4o'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CharacterMetadata {
    // Face geometry  
    faceShape: string           // round/oval/square/heart/oblong/diamond
    faceWidth: string           // narrow/medium/wide/very wide
    cheekVolume: string         // hollow/flat/medium/full/prominent
    jawlineType: string         // sharp/angular/soft/rounded/square/tapered
    chinShape: string           // pointed/rounded/square/cleft
    foreheadHeight: string      // low/medium/high

    // Features
    noseDescription: string     // e.g. "medium-wide bridge with rounded tip"
    lipDescription: string      // e.g. "medium-full with defined cupid's bow"
    skinTexture: string         // smooth/lightly textured/visibly porous
    skinTone: string            // e.g. "medium warm brown"
    beardDescription: string    // density + style or "clean-shaven"

    // Eyes
    eyeShape: string            // almond/round/hooded/deep-set/monolid
    eyeSpacing: string          // narrow/medium/wide
    irisColor: string           // dark brown/light brown/hazel/blue/green
    eyelidBrow: string          // eyelid crease type + brow description
    eyewearDescription: string  // frame description or "none"

    // Body
    bodyBuild: string           // e.g. "medium build, broad shoulders, athletic torso"
    hairDescription: string     // e.g. "short black wavy hair"

    // Summaries (used directly in prompts)
    characterSummary: string    // one-line identity summary
    faceAnchor: string          // composed face description for prompts
    eyesAnchor: string          // composed eyes description for prompts
    bodyAnchor: string          // composed body description for prompts

    // Meta
    extractedAt: string         // ISO timestamp
    sourceImageType: string     // which image was analyzed (usually face_front)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract character metadata from a user's identity images.
 * Uses the front face image as primary source.
 * Stores the result in influencer_profiles.character_metadata.
 * 
 * @param userId - Auth user ID
 * @returns The extracted metadata, or null if extraction fails
 */
export async function extractCharacterMetadata(
    userId: string
): Promise<CharacterMetadata | null> {
    const isDev = process.env.NODE_ENV !== 'production'

    try {
        const service = createServiceClient()

        // Find the influencer profile
        const { data: profile } = await service
            .from('influencer_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!profile) {
            if (isDev) console.log('🪞 No influencer profile found for metadata extraction')
            return null
        }

        // Get the best image for analysis — prefer face_front, fall back to face_smile
        const { data: images } = await service
            .from('identity_images')
            .select('image_type, image_url')
            .eq('influencer_profile_id', profile.id)
            .eq('is_active', true)
            .in('image_type', ['face_front', 'face_smile', 'face_left'])
            .order('image_type')  // face_front first alphabetically

        if (!images || images.length === 0) {
            if (isDev) console.log('🪞 No face images available for metadata extraction')
            return null
        }

        // Pick best: face_front > face_smile > face_left
        const priorityOrder = ['face_front', 'face_smile', 'face_left']
        const bestImage = priorityOrder
            .map(type => images.find((img: any) => img.image_type === type))
            .find(Boolean)

        if (!bestImage) return null

        if (isDev) console.log(`🪞 Extracting character metadata from ${bestImage.image_type}...`)

        // Fetch image as base64
        const imageResponse = await fetch(bestImage.image_url)
        if (!imageResponse.ok) {
            console.error('Failed to fetch character image for metadata:', imageResponse.status)
            return null
        }
        const imageBuffer = await imageResponse.arrayBuffer()
        const imageBase64 = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:image/jpeg;base64,${imageBase64}`

        // Also try to get the body_front image for body analysis
        const { data: bodyImages } = await service
            .from('identity_images')
            .select('image_type, image_url')
            .eq('influencer_profile_id', profile.id)
            .eq('is_active', true)
            .eq('image_type', 'body_front')
            .maybeSingle()

        let bodyDataUrl: string | null = null
        if (bodyImages?.image_url) {
            try {
                const bodyResponse = await fetch(bodyImages.image_url)
                if (bodyResponse.ok) {
                    const bodyBuffer = await bodyResponse.arrayBuffer()
                    bodyDataUrl = `data:image/jpeg;base64,${Buffer.from(bodyBuffer).toString('base64')}`
                }
            } catch { /* ignore body fetch errors */ }
        }

        // Run GPT-4o analysis
        const metadata = await analyzeForMetadata(dataUrl, bodyDataUrl, bestImage.image_type)
        if (!metadata) return null

        // Store in DB
        const { error: updateError } = await service
            .from('influencer_profiles')
            .update({
                character_metadata: metadata,
                character_metadata_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)

        if (updateError) {
            console.error('Failed to store character metadata:', updateError)
            // Still return the metadata even if storage fails
        } else if (isDev) {
            console.log('🪞 Character metadata stored successfully')
        }

        return metadata
    } catch (err) {
        console.error('Character metadata extraction error:', err)
        return null
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GPT-4o ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

async function analyzeForMetadata(
    faceDataUrl: string,
    bodyDataUrl: string | null,
    sourceImageType: string
): Promise<CharacterMetadata | null> {
    const openai = getGeminiChat()

    const content: any[] = [
        {
            type: 'text',
            text: `Analyze this person's face and body for a PERSISTENT identity profile.
This metadata will be stored and reused across many AI generations to ensure the SAME face is always produced.

I need SPECIFIC, MEASURABLE descriptions — not generic phrases. Describe what you ACTUALLY SEE.

Return JSON only:
{
  "faceShape": "<round/oval/square/heart/oblong/diamond>",
  "faceWidth": "<narrow/medium/wide/very wide — relative to face height>",
  "cheekVolume": "<hollow/flat/medium/full/prominent>",
  "jawlineType": "<sharp/angular/soft/rounded/square/tapered>",
  "chinShape": "<pointed/rounded/square/cleft>",
  "foreheadHeight": "<low/medium/high>",
  "noseDescription": "<bridge width + tip shape, e.g. 'medium-wide bridge with rounded tip'>",
  "lipDescription": "<lip fullness + shape, e.g. 'medium-full with defined cupid's bow'>",
  "skinTexture": "<smooth/lightly textured/visibly porous/rough>",
  "skinTone": "<specific tone + warmth, e.g. 'medium warm brown' or 'light cool beige'>",
  "beardDescription": "<density + style + coverage, or 'clean-shaven'>",
  "eyeShape": "<almond/round/hooded/deep-set/monolid>",
  "eyeSpacing": "<narrow/medium/wide>",
  "irisColor": "<dark brown/light brown/hazel/blue/green>",
  "eyelidBrow": "<eyelid crease type + brow thickness and arch>",
  "eyewearDescription": "<frame shape and style, or 'none'>",
  "hairDescription": "<length + color + texture, e.g. 'short black wavy hair'>",
  "bodyBuild": "<shoulder width + torso build + overall mass, e.g. 'medium build, broad shoulders'>",
  "characterSummary": "<one sentence describing this person's key distinguishing features>",
  "distinguishingMarks": "<any moles, scars, dimples, or notable marks — or 'none'>"
}

Rules:
- Describe what you ACTUALLY SEE — be brutally specific.
- Face width and fullness are the #1 drift in AI — be precise.
- If the face is round and wide, say so. If cheeks are full, say full.
- If beard is thick and dense, say thick and dense.
- This metadata will be used to PREVENT AI from changing face features.
- Do NOT infer name, age, ethnicity, or sensitive attributes.
- Keep each field concise but precise.`,
        },
        {
            type: 'image_url',
            image_url: {
                url: faceDataUrl,
                detail: 'low',
            },
        },
    ]

    // Add body image if available
    if (bodyDataUrl) {
        content.push(
            {
                type: 'text',
                text: 'Also analyze the body proportions from this full-body image:',
            },
            {
                type: 'image_url',
                image_url: {
                    url: bodyDataUrl,
                    detail: 'low',
                },
            }
        )
    }

    const response = await openai.chat.completions.create({
        model: FORENSIC_MODEL,
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 600,
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw) as Record<string, string>

    // Compose the anchor strings (used directly in prompts)
    const faceGeometryParts = [
        parsed.faceWidth && parsed.faceShape
            ? `${parsed.faceWidth} ${parsed.faceShape} face shape`
            : null,
        parsed.cheekVolume ? `${parsed.cheekVolume} cheeks` : null,
        parsed.jawlineType ? `${parsed.jawlineType} jawline` : null,
        parsed.chinShape ? `${parsed.chinShape} chin` : null,
        parsed.foreheadHeight ? `${parsed.foreheadHeight} forehead` : null,
        parsed.noseDescription || null,
        parsed.lipDescription || null,
        parsed.skinTexture ? `${parsed.skinTexture} skin texture` : null,
        parsed.skinTone ? `${parsed.skinTone} skin tone` : null,
        parsed.beardDescription || null,
        parsed.eyewearDescription && parsed.eyewearDescription !== 'none'
            ? `${parsed.eyewearDescription} eyewear`
            : null,
    ].filter(Boolean)

    const faceAnchor = faceGeometryParts.length > 0
        ? `preserve exact ${faceGeometryParts.join(', ')}`
        : 'preserve exact face shape, features, and skin texture'

    const eyesAnchor = [
        parsed.eyeShape ? `${parsed.eyeShape} eye shape` : null,
        parsed.eyeSpacing ? `${parsed.eyeSpacing} inter-eye spacing` : null,
        parsed.irisColor ? `${parsed.irisColor} iris color` : null,
        parsed.eyelidBrow || null,
    ].filter(Boolean).join(', ') || 'preserve exact eye geometry and color'

    const bodyAnchor = parsed.bodyBuild
        ? `preserve ${parsed.bodyBuild} — do not slim, reshape, or idealize the body`
        : 'preserve original body build, weight, shoulder width, and proportions exactly'

    const metadata: CharacterMetadata = {
        faceShape: parsed.faceShape || 'unknown',
        faceWidth: parsed.faceWidth || 'unknown',
        cheekVolume: parsed.cheekVolume || 'unknown',
        jawlineType: parsed.jawlineType || 'unknown',
        chinShape: parsed.chinShape || 'unknown',
        foreheadHeight: parsed.foreheadHeight || 'unknown',
        noseDescription: parsed.noseDescription || 'unknown',
        lipDescription: parsed.lipDescription || 'unknown',
        skinTexture: parsed.skinTexture || 'unknown',
        skinTone: parsed.skinTone || 'unknown',
        beardDescription: parsed.beardDescription || 'clean-shaven',
        eyeShape: parsed.eyeShape || 'unknown',
        eyeSpacing: parsed.eyeSpacing || 'unknown',
        irisColor: parsed.irisColor || 'unknown',
        eyelidBrow: parsed.eyelidBrow || 'unknown',
        eyewearDescription: parsed.eyewearDescription || 'none',
        bodyBuild: parsed.bodyBuild || 'unknown',
        hairDescription: parsed.hairDescription || 'unknown',
        characterSummary: parsed.characterSummary || '',
        faceAnchor,
        eyesAnchor,
        bodyAnchor,
        extractedAt: new Date().toISOString(),
        sourceImageType,
    }

    return metadata
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADER — fetch stored metadata for pipeline use
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load previously stored character metadata for a user.
 * Used by the renderer to get pre-extracted face data.
 */
export async function loadCharacterMetadata(
    userId: string
): Promise<CharacterMetadata | null> {
    try {
        const service = createServiceClient()

        const { data: profile } = await service
            .from('influencer_profiles')
            .select('character_metadata')
            .eq('user_id', userId)
            .maybeSingle()

        if (!profile?.character_metadata) return null

        return profile.character_metadata as CharacterMetadata
    } catch (err) {
        console.error('Failed to load character metadata:', err)
        return null
    }
}
