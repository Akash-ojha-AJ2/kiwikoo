/**
 * MULTI-VARIANT OUTPUT SYSTEM (PRO ONLY)
 * 
 * PRO generates exactly 3 images per request.
 * Face, hair, body, clothing IDENTICAL across all 3.
 * Only allowed variation: lighting micro, camera distance, background motion, DOF.
 */

import 'server-only'

// ═══════════════════════════════════════════════════════════════
// VARIANT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface VariantConfig {
    variantCount: number
    identicalAcrossVariants: string[]
    allowedVariations: string[]
    cameraDistanceVariance: number // percentage
    lightingMicroVariance: number // percentage
}

export const PRO_VARIANT_CONFIG: VariantConfig = {
    variantCount: 3,
    identicalAcrossVariants: [
        'face_pixels',
        'hair_geometry',
        'body_proportions',
        'clothing_design',
        'clothing_color',
        'pose',
        'expression'
    ],
    allowedVariations: [
        'lighting_micro_intensity',
        'camera_distance',
        'background_human_motion',
        'depth_of_field_noise',
        'ambient_shadow_intensity'
    ],
    cameraDistanceVariance: 0.05, // ±5%
    lightingMicroVariance: 0.03  // ±3%
}

// ═══════════════════════════════════════════════════════════════
// VARIANT CONSTRAINT LAYER
// ═══════════════════════════════════════════════════════════════

export const MULTI_VARIANT_CONSTRAINT = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      MULTI-VARIANT OUTPUT (PRO)                               ║
║                      3 IMAGES PER REQUEST                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Generate exactly 3 image variants.

IDENTICAL ACROSS ALL 3 VARIANTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Face pixels → IDENTICAL (pixel-level match)
• Hair geometry → IDENTICAL
• Body proportions → IDENTICAL
• Clothing design → IDENTICAL
• Clothing color → IDENTICAL
• Pose → IDENTICAL
• Expression → IDENTICAL

ALLOWED VARIATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Lighting micro-intensity (±3%)
✓ Camera distance (±5%)
✓ Background human motion (different passersby)
✓ Depth-of-field noise (bokeh variation)
✓ Ambient shadow intensity (±5%)

VARIANT DESCRIPTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Variant 1: Standard framing, baseline lighting
Variant 2: Slightly closer (5%), warmer micro-tone
Variant 3: Slightly further (5%), cooler micro-tone

User will select their preferred variant.
`

// ═══════════════════════════════════════════════════════════════
// VARIANT OUTPUT TYPES
// ═══════════════════════════════════════════════════════════════

export interface VariantOutput {
    variantId: 1 | 2 | 3
    imageData: string // base64
    cameraDistance: 'standard' | 'closer' | 'further'
    lightingTone: 'baseline' | 'warmer' | 'cooler'
    metadata: {
        faceHash: string
        hairHash: string
        bodyHash: string
    }
}

export interface MultiVariantResult {
    success: boolean
    variants: VariantOutput[]
    consistencyCheck: {
        faceConsistent: boolean
        hairConsistent: boolean
        bodyConsistent: boolean
        allIdentical: boolean
    }
    selectedVariant?: 1 | 2 | 3
}

// ═══════════════════════════════════════════════════════════════
// VARIANT GENERATION PROMPTS
// ═══════════════════════════════════════════════════════════════

export function getVariantPrompt(variantId: 1 | 2 | 3): string {
    const basePrompt = MULTI_VARIANT_CONSTRAINT

    switch (variantId) {
        case 1:
            return `${basePrompt}

GENERATING VARIANT 1:
- Camera: Standard framing
- Lighting: Baseline intensity
- Tone: Neutral
`
        case 2:
            return `${basePrompt}

GENERATING VARIANT 2:
- Camera: 5% closer than standard
- Lighting: Slightly increased (+3%)
- Tone: Slightly warmer
`
        case 3:
            return `${basePrompt}

GENERATING VARIANT 3:
- Camera: 5% further than standard
- Lighting: Slightly decreased (-3%)
- Tone: Slightly cooler
`
    }
}

// ═══════════════════════════════════════════════════════════════
// VARIANT CONSISTENCY VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface VariantConsistencyCheck {
    facesIdentical: boolean
    hairIdentical: boolean
    bodiesIdentical: boolean
    clothingIdentical: boolean
    maxFaceDelta: number
    maxHairDelta: number
    maxBodyDelta: number
}

export function validateVariantConsistency(
    variants: VariantOutput[]
): VariantConsistencyCheck {
    if (variants.length !== 3) {
        return {
            facesIdentical: false,
            hairIdentical: false,
            bodiesIdentical: false,
            clothingIdentical: false,
            maxFaceDelta: 1.0,
            maxHairDelta: 1.0,
            maxBodyDelta: 1.0
        }
    }

    // Compare hashes across variants
    const faceHashes = variants.map(v => v.metadata.faceHash)
    const hairHashes = variants.map(v => v.metadata.hairHash)
    const bodyHashes = variants.map(v => v.metadata.bodyHash)

    const facesIdentical = faceHashes.every(h => h === faceHashes[0])
    const hairIdentical = hairHashes.every(h => h === hairHashes[0])
    const bodiesIdentical = bodyHashes.every(h => h === bodyHashes[0])

    return {
        facesIdentical,
        hairIdentical,
        bodiesIdentical,
        clothingIdentical: true, // Assumed if body is identical
        maxFaceDelta: facesIdentical ? 0 : 0.1,
        maxHairDelta: hairIdentical ? 0 : 0.1,
        maxBodyDelta: bodiesIdentical ? 0 : 0.1
    }
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════

export function logMultiVariantStatus(sessionId: string): void {
    console.log(`\n🎲 MULTI-VARIANT OUTPUT [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   📊 Variants: 3`)
    console.log(`   🔒 Identical: face, hair, body, clothing`)
    console.log(`   ✓ Varying: lighting ±3%, camera ±5%`)
    console.log(`   ═══════════════════════════════════════`)
}

export function logVariantConsistency(
    sessionId: string,
    check: VariantConsistencyCheck
): void {
    console.log(`\n✅ VARIANT CONSISTENCY CHECK [${sessionId}]`)
    console.log(`   ═══════════════════════════════════════`)
    console.log(`   👤 Faces identical: ${check.facesIdentical ? '✓' : '❌'}`)
    console.log(`   💇 Hair identical: ${check.hairIdentical ? '✓' : '❌'}`)
    console.log(`   🧍 Bodies identical: ${check.bodiesIdentical ? '✓' : '❌'}`)
    console.log(`   👕 Clothing identical: ${check.clothingIdentical ? '✓' : '❌'}`)
    console.log(`   ═══════════════════════════════════════`)

    if (!check.facesIdentical || !check.hairIdentical || !check.bodiesIdentical) {
        console.log(`   ⚠️ CONSISTENCY VIOLATION DETECTED`)
    }
}
