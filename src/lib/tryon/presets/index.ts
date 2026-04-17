/**
 * SCENE DATASET INDEX
 * 
 * Central export for all scene presets.
 * All presets now live in photoshoot.ts (24 curated presets).
 * india.ts and global.ts provide backward-compatible filtered views.
 */

import { INDIAN_PRESETS, getIndianPreset, getIndianPresets, DEFAULT_INDIAN_PRESET, type ScenePreset, type SceneVariant, type CameraAngle, type ColorGrade } from './india'
import { GLOBAL_PRESETS, getGlobalPreset, getGlobalPresets, DEFAULT_GLOBAL_PRESET } from './global'
import { PHOTOSHOOT_PRESETS, getPhotoshootPreset, getPhotoshootPresetsByCategory } from './photoshoot'

// Re-export types
export type { ScenePreset, SceneVariant, CameraAngle, ColorGrade }

// ═══════════════════════════════════════════════════════════════
// COMBINED DATASET
// ═══════════════════════════════════════════════════════════════

/**
 * All available scene presets (24 curated presets from photoshoot.ts)
 * INDIAN_PRESETS and GLOBAL_PRESETS are filtered views of the same set
 */
export const ALL_PRESETS: ScenePreset[] = PHOTOSHOOT_PRESETS

/**
 * Get any preset by ID
 */
export function getPresetById(id: string): ScenePreset | undefined {
    return ALL_PRESETS.find(p => p.id === id)
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: ScenePreset['category']): ScenePreset[] {
    return ALL_PRESETS.filter(p => p.category === category)
}

/**
 * Get presets by region
 */
export function getPresetsByRegion(region: 'india' | 'global'): ScenePreset[] {
    return ALL_PRESETS.filter(p => p.region === region)
}

/**
 * Get presets by mood
 */
export function getPresetsByMood(mood: ScenePreset['mood']): ScenePreset[] {
    return ALL_PRESETS.filter(p => p.mood === mood)
}

/**
 * Search presets by keyword in scene description
 */
export function searchPresets(keyword: string): ScenePreset[] {
    const lower = keyword.toLowerCase()
    return ALL_PRESETS.filter(p =>
        p.scene.toLowerCase().includes(lower) ||
        p.label.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower)
    )
}

// ═══════════════════════════════════════════════════════════════
// DATASET SUMMARY (for Scene Intelligence selection)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a condensed dataset summary for GPT-4o mini to select from
 * Scene Intelligence uses this to pick the right preset
 */
export function getPresetSummaryForSelection(): string {
    const lines: string[] = ['AVAILABLE PRESETS:']

    for (const p of ALL_PRESETS) {
        lines.push(`  - ${p.id}: ${p.label} [${p.region}] (${p.category})`)
    }

    return lines.join('\n')
}

/**
 * Get preset IDs only (for validation)
 */
export function getAllPresetIds(): string[] {
    return ALL_PRESETS.map(p => p.id)
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT / FALLBACK
// ═══════════════════════════════════════════════════════════════

/**
 * Default fallback preset (Studio White)
 */
export const DEFAULT_PRESET = DEFAULT_INDIAN_PRESET

/**
 * Get default preset for a region
 */
export function getDefaultPreset(region: 'india' | 'global' = 'india'): ScenePreset {
    return region === 'india' ? DEFAULT_INDIAN_PRESET : DEFAULT_GLOBAL_PRESET
}

// Re-export region-specific functions for backward compatibility
export {
    INDIAN_PRESETS,
    GLOBAL_PRESETS,
    PHOTOSHOOT_PRESETS,
    getIndianPreset,
    getIndianPresets,
    getGlobalPreset,
    getGlobalPresets,
    getPhotoshootPreset,
    getPhotoshootPresetsByCategory,
    DEFAULT_INDIAN_PRESET,
    DEFAULT_GLOBAL_PRESET
}
