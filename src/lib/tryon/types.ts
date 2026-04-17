export type TryOnPresetCategory =
  | 'home'
  | 'office'
  | 'street'
  | 'outdoor'
  | 'travel'
  | 'lifestyle'
  | 'editorial' // For minimal/studio looks

export type InstagramStylePack =
  | 'candid_iphone'
  | 'editorial_ig'
  | 'flash_party'
  | 'travel_journal'
  | 'surveillance_doc'
  // Extended style packs for Higgsfield-style presets
  | 'preserve_original'
  | 'editorial_vogue'
  | 'editorial_professional'
  | 'travel_golden'
  | 'travel_vacation'
  | 'documentary_street'
  | 'candid_instagram'
  | 'candid_home'
  | 'linkedin_professional'
  | 'vogue_editorial'

export type BackgroundFocusMode = 'moderate_bokeh' | 'sharper_bg'

export interface TryOnStylePreset {
  id: string
  name: string
  description: string
  category: TryOnPresetCategory
  pose_name: string
  lighting_name: string
  background_name: string
  style_pack: InstagramStylePack
  background_focus: BackgroundFocusMode
  /**
   * Identity stability control:
   * - normal: default behavior
   * - high: prefer stronger identity locking (use stricter render on first pass and retry on medium drift)
   */
  identity_lock?: 'normal' | 'high'
  /**
   * Whether the preset is allowed to change pose:
   * - locked: keep pose exactly (best identity consistency)
   * - subtle: allow small adjustments (head tilt, shoulder angle, arm placement). Recommend extra identity refs.
   */
  pose_mode?: 'locked' | 'subtle'

  // ═══════════════════════════════════════════════════════════════
  // STRUCTURAL PRESET FIELDS (Nano-Banana Pro Architecture)
  // These fields preserve the full ScenePreset structure for enforcement
  // ═══════════════════════════════════════════════════════════════

  /** Camera specification (lens, angle, distance) */
  camera_spec?: string

  /** Motion type (static, subtle motion, candid motion) */
  motion_spec?: 'static' | 'subtle motion' | 'candid motion'

  /** Negative bias - what to explicitly avoid in scene */
  negative_bias?: string

  /** Region for localization (india, global) */
  region?: 'india' | 'global'
}

export interface ShootPlanV3 {
  prompt_text: string
  scene_text?: string
  camera_text?: string
  imperfection_text?: string
  negative_text?: string
  selected_recipe_id?: string
  selected_recipe_why?: string
}

export interface TryOnQualityOptions {
  quality: 'high' | 'fast'
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9'
  resolution?: '1K' | '2K' | '4K'
}

export interface VerifyResult {
  ok: boolean
  reasons: string[]
  has_extra_people: boolean
  appears_collage: boolean

  // Face geometry check (new - stricter than identity_preserved)
  face_geometry_match?: 'exact' | 'close' | 'different'

  // Pose preservation check (new)
  pose_preserved?: boolean

  // Scene and lighting
  scene_plausible?: boolean
  lighting_realism?: 'high' | 'medium' | 'low'
  lighting_consistent?: boolean
  subject_color_preserved?: boolean
  looks_ai_generated?: boolean

  // Background quality
  background_detail_preserved?: boolean
  background_has_grain?: boolean  // New: check for film grain
  dof_realistic?: boolean

  // Garment application
  garment_applied: boolean
  garment_fidelity: 'high' | 'medium' | 'low'

  // Identity preservation
  identity_preserved: boolean
  identity_fidelity: 'high' | 'medium' | 'low'

  // Original outfit check
  original_outfit_still_present: boolean
  output_is_unedited_copy: boolean
}
