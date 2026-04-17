import { ALL_PRESETS, getPresetById, type ScenePreset } from './presets/index'
import type { TryOnStylePreset, TryOnPresetCategory, InstagramStylePack } from './types'
import { getPresetExampleGuidance } from './presets/example-prompts-reference'
import { getPresetStrengthProfile } from './preset-strength-profile'

/**
 * UI PRESETS BRIDGE
 * 
 * Dynamically maps the Situation-Based Presets (presets/index.ts)
 * to the UI-compatible TryOnStylePreset format.
 * 
 * CRITICAL: This bridge PRESERVES structural fields for enforcement.
 * Do NOT flatten or lose any ScenePreset data.
 */

// Helper to map string style to enum (fallback to candid_iphone)
function mapStyleToPack(style: string): InstagramStylePack {
  if (style.includes('vogue') || style.includes('editorial')) return 'editorial_vogue'
  if (style.includes('travel') || style.includes('vacation')) return 'travel_vacation'
  if (style.includes('street')) return 'documentary_street'
  if (style.includes('home')) return 'candid_home'
  if (style.includes('professional')) return 'linkedin_professional'
  return 'candid_iphone'
}

// Convert ScenePreset to TryOnStylePreset - PRESERVES ALL STRUCTURAL FIELDS
function convertToUiPreset(p: ScenePreset): TryOnStylePreset {
  const sceneSummary = p.scene
    .split(/[.;]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 1)
    .join('. ')
  const lightingSummary = p.lighting
    .split(/[.;]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 1)
    .join('. ')
  return {
    id: p.id,
    name: p.label,
    description: [sceneSummary, lightingSummary].filter(Boolean).join(' • '),
    category: p.category as TryOnPresetCategory,
    pose_mode: 'locked',
    identity_lock: 'high',
    pose_name: '', // Handled by Pose Guard now
    lighting_name: p.lighting,
    background_name: p.scene,
    style_pack: mapStyleToPack(p.style),
    background_focus: 'sharper_bg',

    // ═══════════════════════════════════════════════════════════════
    // STRUCTURAL FIELDS (Nano-Banana Pro Architecture)
    // These MUST be preserved for preset enforcement
    // ═══════════════════════════════════════════════════════════════
    camera_spec: p.camera,
    motion_spec: p.motion,
    negative_bias: p.negative_bias,
    region: p.region,
  }
}

// Generate the V3 list from the Master Source
export const TRYON_PRESETS_V3: TryOnStylePreset[] = ALL_PRESETS.map(convertToUiPreset)

function validateTryOnPresetBridge(): void {
  if (!TRYON_PRESETS_V3.length) {
    throw new Error('Try-on preset bridge error: no UI presets generated from ALL_PRESETS')
  }

  const uiIds = new Set<string>()
  for (const preset of TRYON_PRESETS_V3) {
    if (!preset.id?.trim()) {
      throw new Error('Try-on preset bridge error: preset id is empty')
    }
    if (uiIds.has(preset.id)) {
      throw new Error(`Try-on preset bridge error: duplicate UI preset id "${preset.id}"`)
    }
    uiIds.add(preset.id)

    if (!preset.background_name?.trim()) {
      throw new Error(`Try-on preset bridge error: background_name missing for "${preset.id}"`)
    }
    if (!preset.lighting_name?.trim()) {
      throw new Error(`Try-on preset bridge error: lighting_name missing for "${preset.id}"`)
    }
    if (!preset.camera_spec?.trim()) {
      throw new Error(`Try-on preset bridge error: camera_spec missing for "${preset.id}"`)
    }
    if (!preset.negative_bias?.trim()) {
      throw new Error(`Try-on preset bridge error: negative_bias missing for "${preset.id}"`)
    }
  }

  const sourceIds = new Set(ALL_PRESETS.map((preset) => preset.id))
  if (uiIds.size !== sourceIds.size) {
    throw new Error(
      `Try-on preset bridge error: source/UI preset count mismatch (source=${sourceIds.size}, ui=${uiIds.size})`
    )
  }
}

validateTryOnPresetBridge()

export function getTryOnPresetV3(id: string): TryOnStylePreset | undefined {
  return TRYON_PRESETS_V3.find((p) => p.id === id)
}

/**
 * Get the FULL ScenePreset structure for structural enforcement.
 * 
 * CRITICAL: Use this when you need the complete preset specification
 * for scene construction (not just UI display).
 */
export function getFullPreset(id: string): ScenePreset | undefined {
  return getPresetById(id)
}

export function getTryOnPresetCategoriesV3(): TryOnPresetCategory[] {
  // Return unique categories from the dataset
  const categories = new Set(TRYON_PRESETS_V3.map(p => p.category))
  return Array.from(categories)
}

export function getTryOnPresetListV3(): Array<{
  id: string
  name: string
  category: TryOnPresetCategory
  description: string
  vibe?: string
  poseHint?: string
  framingHint?: string
  sceneObjects?: string
  styleTags?: string[]
  faceStability?: 'max' | 'high'
  lightingHint?: string
}> {
  return TRYON_PRESETS_V3.map((p) => {
    const guidance = getPresetExampleGuidance(p.id)
    const strength = getPresetStrengthProfile({ presetId: p.id, category: p.category })
    const faceStability: 'max' | 'high' = strength.identityRigidity >= 0.98 ? 'max' : 'high'
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      vibe: guidance?.vibe,
      poseHint: guidance?.poseInference,
      framingHint: guidance?.camera,
      sceneObjects: guidance?.scene,
      styleTags: guidance?.styleKeywords?.slice(0, 6),
      faceStability,
      lightingHint: p.lighting_name.split(/[.;]/)[0]?.trim(),
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// PRESET ENFORCEMENT TRACKING (Warn-then-fail pattern)
// ═══════════════════════════════════════════════════════════════

// Track consecutive preset application failures per session
const presetMissTracker = new Map<string, number>()

/**
 * Log preset application and track consecutive misses.
 * 
 * Pattern: Warn first, fail hard after 2 consecutive misses.
 * Per user spec: "Do NOT silently fall back to generic indoor scene"
 */
export function trackPresetApplication(
  sessionId: string,
  presetId: string,
  wasApplied: boolean
): { shouldAbort: boolean; consecutiveMisses: number } {
  const key = `${sessionId}:${presetId}`

  if (wasApplied) {
    // Reset tracker on success
    presetMissTracker.delete(key)
    console.log(`✅ PRESET APPLIED: ${presetId}`)
    return { shouldAbort: false, consecutiveMisses: 0 }
  }

  // Increment miss count
  const currentMisses = (presetMissTracker.get(key) || 0) + 1
  presetMissTracker.set(key, currentMisses)

  if (currentMisses === 1) {
    // First miss - WARN only
    console.warn(`⚠️ PRESET WARNING: "${presetId}" elements not visually confirmed (miss 1/2)`)
    return { shouldAbort: false, consecutiveMisses: 1 }
  } else {
    // Second consecutive miss - FAIL
    console.error(`❌ PRESET FAILURE: "${presetId}" not applied after 2 attempts - ABORTING`)
    console.error(`   This is NOT a silent fallback. Generation will fail.`)
    presetMissTracker.delete(key) // Reset for next session
    return { shouldAbort: true, consecutiveMisses: 2 }
  }
}

/**
 * Log preset enforcement status for debugging.
 */
export function logPresetEnforcement(preset: ScenePreset | undefined, presetId: string): void {
  if (!preset) {
    console.error(`❌ PRESET NOT FOUND: "${presetId}" - this is a configuration error`)
    return
  }

  console.log(`\n🎬 PRESET ENFORCEMENT: ${preset.label}`)
  console.log(`   ═══════════════════════════════════════`)
  console.log(`   📍 Location: ${preset.scene.substring(0, 60)}...`)
  console.log(`   💡 Lighting: ${preset.lighting.substring(0, 60)}...`)
  console.log(`   📷 Camera: ${preset.camera}`)
  console.log(`   🎥 Motion: ${preset.motion}`)
  console.log(`   🌍 Region: ${preset.region}`)
  console.log(`   ⛔ Avoid: ${preset.negative_bias}`)
  console.log(`   ═══════════════════════════════════════`)
}
