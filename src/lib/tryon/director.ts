import type { BackgroundFocusMode, InstagramStylePack, ShootPlanV3 } from './types'

/**
 * Simple scene description generator.
 * No AI calls - just direct mapping for reliability.
 * 
 * IMPORTANT: The preset's background_name is the PRIMARY scene instruction.
 * The realism recipe only provides camera/grain/imperfection details, NOT scene.
 */
export async function generateShootPlanV3(params: {
  pose_name: string
  lighting_name: string
  background_name: string
  userRequest?: string
  photoConstraints?: string
  photoManifest?: Record<string, unknown>
  stylePack?: InstagramStylePack
  backgroundFocus?: BackgroundFocusMode
  realismRecipe?: {
    id: string
    scene_template: string
    negative_template: string
    camera: { lens_hint: string; pov_hint: string; framing_hint: string; dof_hint: string }
    imperfections: {
      grain: string
      compression: string
      vignette: string
      chromatic_aberration: string
      handheld_tilt_ok: boolean
      motion_blur_hint: string
    }
  }
  selectedRecipeWhy?: string
}): Promise<ShootPlanV3> {
  const {
    lighting_name,
    background_name,
    userRequest,
    realismRecipe,
    selectedRecipeWhy,
  } = params

  // The preset's background_name is the PRIMARY scene instruction
  // DO NOT override it with the realism recipe's scene_template
  let scene_text = background_name

  // Add lighting info if it's not "keep original"
  if (lighting_name && !lighting_name.toLowerCase().includes('keep') && !lighting_name.toLowerCase().includes('original')) {
    scene_text = `${scene_text} with ${lighting_name}`
  }

  // Add user request if provided
  if (userRequest) {
    scene_text = `${scene_text}. ${userRequest}`
  }

  // NOTE: We deliberately DO NOT use realismRecipe.scene_template here
  // The preset controls the scene. The recipe only provides technical details.

  return {
    prompt_text: scene_text,
    scene_text,
    selected_recipe_id: realismRecipe?.id,
    selected_recipe_why: selectedRecipeWhy,
  }
}
