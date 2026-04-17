/**
 * INDIAN PRESETS — TYPE DEFINITIONS
 * 
 * This file now only exports the ScenePreset interface.
 * All actual presets live in photoshoot.ts.
 * 
 * Kept for backward compatibility since many files import
 * ScenePreset from this module.
 */

export const ANTI_PORTRAIT_RULE = `ANTI-PORTRAIT RULE:
- No studio framing
- No centered headshot
- No shallow beauty depth
- No spotlight lighting
- No three-point portrait lighting
- Ambient environmental lighting only`

// ═══════════════════════════════════════════════════════════════
// MULTI-VARIANT TYPES
// ═══════════════════════════════════════════════════════════════

export interface SceneVariant {
    id: string           // e.g. 'warm_corner', 'window_seat'
    scene: string        // Full environment description
    bestFor: string      // AI hint: 'warm skin tones', 'outdoor original photos'
}

export interface CameraAngle {
    id: string           // e.g. 'closeup', 'full_body', 'editorial'
    camera: string       // Lens + framing spec
    bestFor: string      // AI hint: 'headshot originals', 'full body originals'
}

export interface ColorGrade {
    id: string           // e.g. 'warm_film', 'cool_editorial', 'neutral'
    grade: string        // Color treatment description (injected into prompt)
    bestFor: string      // AI hint: 'warm skin tones', 'cool lighting environments'
}

export interface ScenePreset {
    id: string
    label: string
    category: 'home' | 'office' | 'street' | 'outdoor' | 'travel' | 'lifestyle'
    region: 'india' | 'global'
    /** Default scene (backward compat) — or use scenes[] for multi-variant */
    scene: string
    lighting: string   // Physics-based lighting (shared across variants)
    /** Default camera (backward compat) — or use cameras[] for multi-variant */
    camera: string
    motion: 'static' | 'subtle motion' | 'candid motion'
    mood: 'candid'
    style: 'realism'
    negative_bias: string
    /** Multiple scene variants — AI selects based on person's photo */
    scenes?: SceneVariant[]
    /** Multiple camera angle options — AI selects based on original photo framing */
    cameras?: CameraAngle[]
    /** Color grading options — AI selects based on skin tone and lighting */
    colorGrades?: ColorGrade[]
}

// Re-export photoshoot presets as "Indian" presets for backward compatibility
import { PHOTOSHOOT_PRESETS } from './photoshoot'

export const INDIAN_PRESETS: ScenePreset[] = PHOTOSHOOT_PRESETS.filter(p => p.region === 'india')

export function getIndianPresets(): ScenePreset[] {
    return INDIAN_PRESETS
}

export function getIndianPreset(id: string): ScenePreset | undefined {
    return INDIAN_PRESETS.find(p => p.id === id)
}

export function getIndianPresetsByCategory(category: ScenePreset['category']): ScenePreset[] {
    return INDIAN_PRESETS.filter(p => p.category === category)
}

export const DEFAULT_INDIAN_PRESET = PHOTOSHOOT_PRESETS[0]
