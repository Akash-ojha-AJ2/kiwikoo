/**
 * CHARACTER RESOLVER
 * 
 * Fetches a user's character reference images from the identity_images table
 * and selects the best 4 face references for a given preset/scene.
 * 
 * This is the core of the multi-reference identity system — like Higgsfield,
 * we send multiple angle-specific photos to Gemini for dramatically better
 * face consistency.
 */

import { createServiceClient } from '@/lib/auth'
import { type IdentityImageType } from '@/lib/identity/types'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CharacterReference {
    imageUrl: string
    imageType: IdentityImageType
    label: string  // e.g. "Front face reference", "Body reference"
}

export interface CharacterResolverResult {
    available: boolean           // true if character has ≥1 image
    complete: boolean            // true if all 7 slots filled
    references: CharacterReference[]  // best 2-3 references for this preset
    allImages: CharacterReference[]   // all available images
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET → ANGLE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps preset categories to the ideal character reference angles.
 * Priority order matters — first match is most important.
 */
const PRESET_ANGLE_MAP: Record<string, IdentityImageType[]> = {
    // Studio / front-facing presets
    studio: ['face_front', 'face_smile', 'face_left', 'face_right'],
    minimal: ['face_front', 'face_smile', 'face_left', 'face_right'],
    editorial: ['face_front', 'face_left', 'face_smile', 'face_right'],

    // Outdoor / candid presets
    urban: ['face_left', 'face_front', 'face_smile', 'face_right'],
    street: ['face_left', 'face_front', 'face_smile', 'face_right'],
    rooftop: ['face_front', 'face_right', 'face_smile', 'face_left'],
    terrace: ['face_front', 'face_right', 'face_smile', 'face_left'],

    // Profile / side shots
    mirror: ['face_right', 'face_front', 'face_smile', 'face_left'],
    selfie: ['face_front', 'face_smile', 'face_left', 'face_right'],

    // Nature / golden hour
    golden: ['face_front', 'face_smile', 'face_left', 'face_right'],
    sunset: ['face_left', 'face_front', 'face_smile', 'face_right'],
    garden: ['face_front', 'face_smile', 'face_left', 'face_right'],

    // Indoor / cozy
    cafe: ['face_smile', 'face_front', 'face_left', 'face_right'],
    restaurant: ['face_front', 'face_smile', 'face_left', 'face_right'],
    library: ['face_front', 'face_left', 'face_smile', 'face_right'],

    // Action / movement
    running: ['face_front', 'face_left', 'face_smile', 'face_right'],
    walking: ['face_left', 'face_front', 'face_smile', 'face_right'],

    // Night / dark
    night: ['face_front', 'face_left', 'face_smile', 'face_right'],
    neon: ['face_front', 'face_left', 'face_smile', 'face_right'],
}

// Default: all 4 face angles (FACE-ONLY — never body, body refs have competing clothing)
const DEFAULT_ANGLES: IdentityImageType[] = ['face_front', 'face_smile', 'face_left', 'face_right']

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve the best character references for a given user and preset.
 * 
 * @param userId - Auth user ID (UUID)
 * @param presetId - Optional preset identifier (e.g. 'urban_rooftop_golden')
 * @returns CharacterResolverResult with best references
 */
export async function resolveCharacterReferences(
    userId: string,
    presetId?: string
): Promise<CharacterResolverResult> {
    const emptyResult: CharacterResolverResult = {
        available: false,
        complete: false,
        references: [],
        allImages: [],
    }

    try {
        const service = createServiceClient()

        // Find the influencer profile by user_id
        const { data: profile } = await service
            .from('influencer_profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

        if (!profile) return emptyResult

        // Fetch all active identity images
        const { data: images, error } = await service
            .from('identity_images')
            .select('image_type, image_url, image_path')
            .eq('influencer_profile_id', profile.id)
            .eq('is_active', true)

        if (error || !images || images.length === 0) return emptyResult

        // Map to CharacterReference
        const allImages: CharacterReference[] = images.map((img: any) => ({
            imageUrl: img.image_url,
            imageType: img.image_type as IdentityImageType,
            label: getLabelForType(img.image_type),
        }))

        const availableTypes = new Set(allImages.map(img => img.imageType))

        // Find best angles for this preset
        const desiredAngles = getDesiredAngles(presetId)

        // Pick references: prioritize desired angles, then fill with what's available
        const references: CharacterReference[] = []
        const usedTypes = new Set<IdentityImageType>()

        // First pass: pick from desired angles in priority order
        for (const angle of desiredAngles) {
            if (availableTypes.has(angle) && !usedTypes.has(angle)) {
                const ref = allImages.find(img => img.imageType === angle)
                if (ref) {
                    references.push(ref)
                    usedTypes.add(angle)
                }
            }
            if (references.length >= 4) break  // Max 4 face references (Gemini supports up to 14 total)
        }

        // Second pass: if we still have < 2, add any available face image
        if (references.length < 2) {
            const facePriority: IdentityImageType[] = ['face_front', 'face_smile', 'face_left', 'face_right']
            for (const faceType of facePriority) {
                if (availableTypes.has(faceType) && !usedTypes.has(faceType)) {
                    const ref = allImages.find(img => img.imageType === faceType)
                    if (ref) {
                        references.push(ref)
                        usedTypes.add(faceType)
                    }
                }
                if (references.length >= 4) break
            }
        }

        // NOTE: Body references are intentionally excluded.
        // Body shots show the person in DIFFERENT clothing, which causes Gemini
        // to copy that outfit instead of the target garment from Image 2.

        return {
            available: allImages.length > 0,
            complete: allImages.length >= 7,
            references,
            allImages,
        }
    } catch (err) {
        console.error('Character resolver error:', err)
        return emptyResult
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the desired reference angles for a preset.
 * Matches keywords in the preset ID against the angle map.
 */
function getDesiredAngles(presetId?: string): IdentityImageType[] {
    if (!presetId) return DEFAULT_ANGLES

    const lower = presetId.toLowerCase()

    // Check each keyword mapping
    for (const [keyword, angles] of Object.entries(PRESET_ANGLE_MAP)) {
        if (lower.includes(keyword)) {
            return angles
        }
    }

    return DEFAULT_ANGLES
}

/**
 * Get a human-readable label for an image type.
 */
function getLabelForType(imageType: string): string {
    const labels: Record<string, string> = {
        face_front: 'Front face reference',
        face_smile: 'Smiling face reference',
        face_left: 'Left profile reference',
        face_right: 'Right profile reference',
        body_front: 'Full body front reference',
        body_left: 'Full body left reference',
        body_right: 'Full body right reference',
    }
    return labels[imageType] || 'Identity reference'
}

/**
 * Download an image URL and convert to base64.
 * Used to send character references to Gemini.
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
    try {
        const response = await fetch(imageUrl)
        if (!response.ok) return null

        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        return base64
    } catch (err) {
        console.error('Failed to fetch image as base64:', err)
        return null
    }
}
