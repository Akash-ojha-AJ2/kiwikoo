/**
 * GLOBAL PRESETS — BACKWARD COMPATIBILITY WRAPPER
 * 
 * All actual presets now live in photoshoot.ts.
 * This file provides backward-compatible exports.
 */

import type { ScenePreset } from './india'
import { PHOTOSHOOT_PRESETS } from './photoshoot'

export const GLOBAL_PRESETS: ScenePreset[] = PHOTOSHOOT_PRESETS.filter(p => p.region === 'global')

export function getGlobalPresets(): ScenePreset[] {
    return GLOBAL_PRESETS
}

export function getGlobalPreset(id: string): ScenePreset | undefined {
    return GLOBAL_PRESETS.find(p => p.id === id)
}

export function getGlobalPresetsByCategory(category: ScenePreset['category']): ScenePreset[] {
    return GLOBAL_PRESETS.filter(p => p.category === category)
}

export const DEFAULT_GLOBAL_PRESET = GLOBAL_PRESETS[0]

// Re-export ANTI_PORTRAIT_RULE from india.ts
export { ANTI_PORTRAIT_RULE } from './india'
