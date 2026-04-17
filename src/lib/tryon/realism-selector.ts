import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import dataset from './realism-dataset.json'

export type CaptureType = 'iphone_candid' | 'dslr_mirrorless' | 'film_35mm' | 'flash_digicam' | 'unknown'
export type LightingType =
  | 'diffused_daylight'
  | 'open_shade_daylight'
  | 'golden_hour'
  | 'foggy_morning'
  | 'on_camera_flash'
  | 'mixed_neon_night'
  | 'unknown'

export interface RealismRecipe {
  id: string
  tags: {
    capture_type: CaptureType
    lighting_type: LightingType
    location_type: string
    time_of_day: string
    vibe: string
  }
  camera: {
    lens_hint: string
    pov_hint: string
    framing_hint: string
    dof_hint: string
  }
  imperfections: {
    grain: string
    compression: string
    vignette: string
    chromatic_aberration: string
    handheld_tilt_ok: boolean
    motion_blur_hint: string
  }
  scene_template: string
  negative_template: string
}

export interface RealismSelectionInput {
  preset?: {
    pose_name?: string
    lighting_name?: string
    background_name?: string
    style_pack?: string
    background_focus?: string
  }
  photoConstraintsText?: string
  photoManifest?: Record<string, unknown>
  userRequest?: string
}

export interface RealismSelectionResult {
  recipe_id: string
  why: string
}

function safeString(x: unknown): string {
  return String(x ?? '').trim()
}

function normalizeForMatch(s: string): string {
  return (s || '').toLowerCase()
}

function pickHeuristic(input: RealismSelectionInput, recipes: RealismRecipe[]): RealismRecipe {
  const style = normalizeForMatch(safeString(input.preset?.style_pack))
  const lightingName = normalizeForMatch(safeString(input.preset?.lighting_name))
  const backgroundName = normalizeForMatch(safeString(input.preset?.background_name))
  const constraints = normalizeForMatch(safeString(input.photoConstraintsText))
  const request = normalizeForMatch(safeString(input.userRequest))

  const wantsNeon = request.includes('neon') || lightingName.includes('neon') || constraints.includes('neon')
  if (wantsNeon) {
    return recipes.find((r) => r.tags.lighting_type === 'mixed_neon_night') ?? recipes[0]
  }

  const wantsFlash = style.includes('flash') || lightingName.includes('flash') || constraints.includes('flash')
  if (wantsFlash) {
    return recipes.find((r) => r.tags.lighting_type === 'on_camera_flash') ?? recipes[0]
  }

  const wantsMist = request.includes('mist') || request.includes('fog') || constraints.includes('fog') || lightingName.includes('fog')
  if (wantsMist) {
    return recipes.find((r) => r.tags.lighting_type === 'foggy_morning') ?? recipes[0]
  }

  const wantsGolden = request.includes('golden') || constraints.includes('golden hour') || lightingName.includes('golden')
  if (wantsGolden) {
    return recipes.find((r) => r.tags.lighting_type === 'golden_hour') ?? recipes[0]
  }

  const wantsCafe =
    backgroundName.includes('cafe') ||
    backgroundName.includes('terrace') ||
    backgroundName.includes('trattoria') ||
    constraints.includes('terrace') ||
    constraints.includes('cafe')
  if (wantsCafe) {
    return recipes.find((r) => r.id === 'iphone_candid_trattoria_shade') ?? recipes[0]
  }

  const wantsParisStairs =
    backgroundName.includes('paris') ||
    constraints.includes('paris') ||
    constraints.includes('stone stair') ||
    backgroundName.includes('stairs')
  if (wantsParisStairs) {
    return recipes.find((r) => r.id === 'iphone_candid_paris_stairs_day') ?? recipes[0]
  }

  // Default: natural iPhone candid city/day
  return recipes.find((r) => r.id === 'iphone_candid_paris_stairs_day') ?? recipes[0]
}

/**
 * Select the best realism recipe for the current scenario.
 * - Uses ChatGPT for nuanced selection
 * - Falls back to a deterministic heuristic if LLM selection fails
 */
export async function selectRealismRecipe(input: RealismSelectionInput): Promise<{
  recipe: RealismRecipe
  selection: RealismSelectionResult
}> {
  const recipes = (dataset as any)?.recipes as RealismRecipe[] | undefined
  if (!recipes?.length) {
    throw new Error('Realism dataset missing or empty')
  }

  const fallbackRecipe = pickHeuristic(input, recipes)

  const openai = getGeminiChat()

  const system = `You are selecting a "photorealism recipe" for a virtual try-on image edit pipeline.
Return ONLY JSON: {"recipe_id":"...","why":"..."}.

Selection rules:
- Choose ONE recipe_id from the provided list.
- Prefer the recipe that best matches the SUBJECT PHOTO capture (camera/lighting/DOF) and the requested preset.
- Prioritize everyday realism unless the user explicitly requests stylized neon/flash/night vibes.
- Ignore and do NOT use identity traits. Ignore and do NOT use clothing design details (garment comes from reference image).
- If uncertain, choose a safe default that matches a natural candid phone photo.`

  const brief = {
    preset: input.preset ?? {},
    userRequest: safeString(input.userRequest),
    photoConstraintsText: safeString(input.photoConstraintsText),
    photoManifest: input.photoManifest ?? {},
    availableRecipes: recipes.map((r) => ({
      id: r.id,
      tags: r.tags,
    })),
  }

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(brief) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 200,
    })

    const raw = resp.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as any
    const recipe_id = safeString(parsed.recipe_id)
    const why = safeString(parsed.why) || 'Selected for best match to capture + lighting constraints.'

    const selected = recipes.find((r) => r.id === recipe_id)
    if (selected) {
      return { recipe: selected, selection: { recipe_id: selected.id, why } }
    }
  } catch {
    // fall through to heuristic
  }

  return {
    recipe: fallbackRecipe,
    selection: {
      recipe_id: fallbackRecipe.id,
      why: `Fallback heuristic: matched ${fallbackRecipe.tags.capture_type}/${fallbackRecipe.tags.lighting_type}.`,
    },
  }
}


