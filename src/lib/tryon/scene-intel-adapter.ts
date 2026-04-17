/**
 * SCENE INTELLIGENCE ADAPTER (Stage 1)
 *
 * Resolves user intent → strict scene config using GPT-4o.
 *
 * RULES:
 * - Output is STRICT JSON ONLY (SceneIntelOutput).
 * - NEVER describes the person.
 * - Presets describe EMPTY environments only.
 * - If preset conflicts with inherited pose → fallback to studio_gradient.
 * - No "portrait", "model", "fashion", "cinematic" language.
 * - lightingMode is ALWAYS "environment_coherent" (scene-consistent harmonization).
 * - facePolicy is ALWAYS "immutable".
 * - posePolicy is ALWAYS "inherit" (inherit from Image 1).
 */

import 'server-only'
import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import { getPresetById } from './presets/index'
import { getPresetExampleGuidance, getRequestExampleGuidance } from './presets/example-prompts-reference'

const PROMPT_INTEL_MODEL = process.env.TRYON_PROMPT_MODEL?.trim() || 'gpt-4o'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SceneIntelOutput {
  /** Resolved preset id (e.g. "studio_gradient", "india_street", "modern_cafe") */
  preset: string
  /** Scenario variant within the preset */
  scenarioVariant: string
  /** Anchor zone description – describes the EMPTY environment around the subject */
  anchorZone: string
  /** Lighting mode – ALWAYS "environment_coherent" (scene-consistent harmonization) */
  lightingMode: 'environment_coherent'
  /** Pose policy – ALWAYS "inherit" (from Image 1) */
  posePolicy: 'inherit'
  /** Face policy – ALWAYS "immutable" */
  facePolicy: 'immutable'
  /** Camera policy – ALWAYS "inherit" */
  cameraPolicy: 'inherit'
  /** Additional realism guidance for camera/lighting/depth (environment only) */
  realismGuidance?: string
  /** Explicit lighting blueprint for subject-scene harmonization */
  lightingBlueprint?: string
  /** Preset-specific elements to avoid (from curated preset metadata) */
  presetAvoid?: string
  /** Fallback info if preset was rejected */
  fallback?: {
    preset: 'studio_gradient'
    reason: string
  }
}

export interface SceneIntelInput {
  userRequest?: string
  presetId?: string
  presetDescription?: string
  personImageBase64?: string
  availablePresets: string[]
}

interface PresetPolicy {
  anchorZone: string
  realismGuidance: string
  lightingBlueprint: string
  presetAvoid?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT (GPT-4o)
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are a strict Scene Intelligence Engine for a virtual try-on system.

Your job: Given a user request (or preset name), output a JSON object describing the EMPTY ENVIRONMENT only.

ABSOLUTE RULES:
1. NEVER describe a person, face, body, pose, expression, or gaze.
2. NEVER use words: "portrait", "model", "fashion", "cinematic", "editorial", "stunning", "beautiful", "elegant".
3. Presets describe EMPTY locations — no people in them.
4. Lighting policy is "environment_coherent": describe physically plausible scene lighting that can harmonize subject + background as one photo.
5. posePolicy is ALWAYS "inherit" — the person's pose comes from Image 1, not from you.
6. facePolicy is ALWAYS "immutable" — the face is never altered.
7. cameraPolicy is ALWAYS "inherit" — camera angle comes from Image 1.
8. If you cannot resolve the user request to a safe environment, use fallback: { preset: "studio_gradient", reason: "<why>" }.

OUTPUT FORMAT (JSON only, no markdown, no explanation):
{
  "preset": "<preset_id>",
  "scenarioVariant": "<brief variant name>",
  "anchorZone": "<1-2 sentence description of the EMPTY environment>",
  "lightingMode": "environment_coherent",
  "posePolicy": "inherit",
  "facePolicy": "immutable",
  "cameraPolicy": "inherit"
}

Or with fallback:
{
  "preset": "studio_gradient",
  "scenarioVariant": "fallback",
  "anchorZone": "Clean gradient studio backdrop with soft even lighting",
  "lightingMode": "environment_coherent",
  "posePolicy": "inherit",
  "facePolicy": "immutable",
  "cameraPolicy": "inherit",
  "fallback": { "preset": "studio_gradient", "reason": "<reason>" }
}`

const VISION_REALISM_SYSTEM_PROMPT = `You are a realism cinematography planner for virtual try-on.
You analyze the person's photo and select the best scene variant, camera angle, and color grade.

You must output JSON only:
{
  "anchorZone": "<selected environment description>",
  "realismGuidance": "<single sentence with camera realism + physically plausible lighting/depth>",
  "lightingBlueprint": "<single sentence with practical lighting blueprint: key/fill/rim direction, color temperature, shadow softness>",
  "scenarioVariant": "<short variant name>",
  "selectedSceneId": "<id of the chosen scene variant>",
  "selectedCameraId": "<id of the chosen camera angle>",
  "selectedColorGradeId": "<id of the chosen color grade>"
}

Rules for selecting variants:
- Analyze the person's photo: their skin tone (warm/cool/neutral), lighting direction, body framing (close-up vs full body), background context.
- Choose the scene variant whose "bestFor" matches the person's characteristics.
- Choose the camera angle whose "bestFor" matches the person's framing in their photo.
- Choose the color grade whose "bestFor" matches the person's skin tone and lighting.
- Lighting must be physically plausible and the SAME for subject and background.
- realismGuidance must state subject is grounded in environment with coherent lighting.
- Include harmonization cues: ambient color spill, contact shadows, and light wrap.
- Keep wording concise and production-safe.`

function toDataUrl(base64: string): string {
  if (base64.startsWith('data:image/')) return base64
  return `data:image/jpeg;base64,${base64}`
}

function buildPresetPolicy(presetId?: string, presetDescription?: string, selectedSceneId?: string, selectedCameraId?: string, selectedColorGradeId?: string): PresetPolicy {
  const preset = presetId ? getPresetById(presetId) : undefined
  const exampleGuidance = getPresetExampleGuidance(presetId)
  
  // Select the best scene variant (or use default)
  let selectedScene = presetDescription || preset?.scene || 'Clean gradient studio backdrop with soft even ambient lighting.'
  if (preset?.scenes && selectedSceneId) {
    const found = preset.scenes.find(s => s.id === selectedSceneId)
    if (found) selectedScene = found.scene
  } else if (preset?.scenes && preset.scenes.length > 0) {
    selectedScene = preset.scenes[0].scene // Default to first variant
  }

  // Select the best camera angle (or use default)
  let selectedCamera = preset?.camera || 'natural perspective, realistic depth'
  if (preset?.cameras && selectedCameraId) {
    const found = preset.cameras.find(c => c.id === selectedCameraId)
    if (found) selectedCamera = found.camera
  } else if (preset?.cameras && preset.cameras.length > 0) {
    selectedCamera = preset.cameras[0].camera // Default to first variant
  }

  // Select color grade
  let selectedColorGrade = ''
  if (preset?.colorGrades && selectedColorGradeId) {
    const found = preset.colorGrades.find(g => g.id === selectedColorGradeId)
    if (found) selectedColorGrade = found.grade
  } else if (preset?.colorGrades && preset.colorGrades.length > 0) {
    selectedColorGrade = preset.colorGrades[0].grade // Default to first
  }

  const anchorZone = selectedScene.trim()
  const baseLighting =
    (preset?.lighting ||
      'ambient practical lighting with coherent shadow direction and natural falloff').trim()
  const presetAvoid = preset?.negative_bias?.trim() || undefined

  const realismGuidance = [
    'Single coherent photograph: subject lit by and grounded in the same environment.',
    `Use preset lighting logic: ${baseLighting}.`,
    exampleGuidance?.vibe ? `Target vibe from successful references: ${exampleGuidance.vibe}.` : '',
    exampleGuidance?.scene ? `Reference scene characteristics: ${exampleGuidance.scene}.` : '',
    'Apply environmental harmonization: ambient color spill and subtle edge light wrap on the subject.',
    `Camera treatment: ${selectedCamera}.`,
    exampleGuidance?.camera ? `Camera treatment from references: ${exampleGuidance.camera}.` : '',
    selectedColorGrade ? `Color grading: ${selectedColorGrade}.` : '',
    exampleGuidance?.colorGrading
      ? `Color treatment from references: ${exampleGuidance.colorGrading}.`
      : '',
    'Background materials must remain photoreal with natural texture variation and subtle imperfections.',
    'Maintain natural camera rendering with consistent micro-contrast and light grain.',
    'Preserve natural contact shadows and local ambient occlusion.',
    'Avoid cut-out or pasted-on appearance.',
    presetAvoid ? `Avoid per preset: ${presetAvoid}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const lightingBlueprint = [
    `Lighting blueprint from preset "${presetId || 'custom'}":`,
    'derive key/fill/rim from visible scene sources,',
    `match highlight and shadow direction to "${baseLighting}",`,
    exampleGuidance?.lighting ? `reference lighting behavior: ${exampleGuidance.lighting},` : '',
    'keep subject and background in the same color-temperature space,',
    'add subtle ambient color spill and edge light wrap from the environment,',
    'preserve realistic falloff and contact shadows at feet/body edges.',
  ].join(' ')

  return {
    anchorZone,
    realismGuidance,
    lightingBlueprint,
    presetAvoid:
      [presetAvoid, ...(exampleGuidance?.avoidTerms || [])]
        .filter(Boolean)
        .join('; ') || undefined,
  }
}

function mergeGuidance(primary: string, secondary?: string): string {
  if (!secondary?.trim()) return primary
  return `${secondary.trim()} ${primary}`
}

/** Build variant options text for GPT-4o to choose from */
function buildVariantOptions(preset: any): string {
  const lines: string[] = []
  
  if (preset?.scenes?.length) {
    lines.push('SCENE VARIANTS (pick one):')
    for (const s of preset.scenes) {
      lines.push(`  - id: "${s.id}" | bestFor: ${s.bestFor} | scene: ${s.scene.substring(0, 100)}...`)
    }
  }
  if (preset?.cameras?.length) {
    lines.push('CAMERA ANGLES (pick one):')
    for (const c of preset.cameras) {
      lines.push(`  - id: "${c.id}" | bestFor: ${c.bestFor} | camera: ${c.camera}`)
    }
  }
  if (preset?.colorGrades?.length) {
    lines.push('COLOR GRADES (pick one):')
    for (const g of preset.colorGrades) {
      lines.push(`  - id: "${g.id}" | bestFor: ${g.bestFor} | grade: ${g.grade.substring(0, 80)}...`)
    }
  }
  
  return lines.join('\n')
}

async function buildVisionRealismGuidance(params: {
  personImageBase64?: string
  presetDescription: string
  userRequest?: string
  presetId?: string
}): Promise<{ anchorZone: string; realismGuidance: string; lightingBlueprint: string; scenarioVariant: string; selectedSceneId?: string; selectedCameraId?: string; selectedColorGradeId?: string }> {
  const openai = getGeminiChat()
  
  // Get the preset to provide variant options
  const preset = params.presetId ? getPresetById(params.presetId) : undefined
  const variantOptions = preset ? buildVariantOptions(preset) : ''

  const userText = `Selected environment preset: ${params.presetDescription}
Optional user request: ${params.userRequest || 'none'}

${variantOptions ? `\nAVAILABLE VARIANTS:\n${variantOptions}\n\nAnalyze the person's photo and pick the BEST variant for each category based on their skin tone, lighting, framing, and style.` : ''}

Refine the environment for photorealism. The person must appear lit by and grounded in this same environment. Describe only environment and camera realism; do not describe the person.`

  const content: any[] = [{ type: 'text', text: userText }]
  if (params.personImageBase64) {
    content.push({
      type: 'image_url',
      image_url: {
        url: toDataUrl(params.personImageBase64),
        detail: 'high',
      },
    })
  }

  const response = await openai.chat.completions.create({
    model: PROMPT_INTEL_MODEL,
    messages: [
      { role: 'system', content: VISION_REALISM_SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 400,
  })

  const raw = response.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(raw) as {
    anchorZone?: string
    realismGuidance?: string
    lightingBlueprint?: string
    scenarioVariant?: string
    selectedSceneId?: string
    selectedCameraId?: string
    selectedColorGradeId?: string
  }

  return {
    anchorZone: (parsed.anchorZone || params.presetDescription).trim(),
    realismGuidance: (
      parsed.realismGuidance ||
      'Single coherent photograph: subject lit by and grounded in the same environment.'
    ).trim(),
    lightingBlueprint: (
      parsed.lightingBlueprint ||
      'Match scene lighting on subject: natural key and fill from visible environment sources.'
    ).trim(),
    scenarioVariant: (parsed.scenarioVariant || 'preset_refined').trim(),
    selectedSceneId: parsed.selectedSceneId,
    selectedCameraId: parsed.selectedCameraId,
    selectedColorGradeId: parsed.selectedColorGradeId,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve user request to a strict scene config via GPT-4o.
 *
 * @param userRequest - User's scene/preset request (e.g. "co-working space" or "india_street")
 * @param availablePresets - List of available preset IDs for grounding
 * @returns SceneIntelOutput — strict JSON config
 */
export async function getStrictSceneConfig(
  input: SceneIntelInput
): Promise<SceneIntelOutput> {
  try {
    const userRequest = (input.userRequest || '').trim()
    const requestGuidance = getRequestExampleGuidance(userRequest)

    const presetId = (input.presetId || '').trim()
    const presetDescription = (input.presetDescription || '').trim()

    // Deterministic preset path: if preset description is provided, it is the
    // authoritative environment and must not be replaced by fallback.
    if (presetDescription.length > 0) {
      const deterministicPreset = presetId || 'preset_selected'
      try {
        const refined = await buildVisionRealismGuidance({
          personImageBase64: input.personImageBase64,
          presetDescription,
          userRequest,
          presetId: deterministicPreset,
        })
        // Build policy using AI-selected variants
        const presetPolicy = buildPresetPolicy(
          deterministicPreset, 
          presetDescription, 
          refined.selectedSceneId, 
          refined.selectedCameraId, 
          refined.selectedColorGradeId
        )
        console.log(`🎯 AI Variant Selection: scene=${refined.selectedSceneId || 'default'} camera=${refined.selectedCameraId || 'default'} grade=${refined.selectedColorGradeId || 'default'}`)
        return {
          preset: deterministicPreset,
          scenarioVariant: refined.scenarioVariant || 'preset_locked',
          anchorZone: refined.anchorZone || presetPolicy.anchorZone,
          lightingMode: 'environment_coherent',
          posePolicy: 'inherit',
          facePolicy: 'immutable',
          cameraPolicy: 'inherit',
          realismGuidance: mergeGuidance(presetPolicy.realismGuidance, refined.realismGuidance),
          lightingBlueprint: mergeGuidance(presetPolicy.lightingBlueprint, refined.lightingBlueprint),
          presetAvoid: [presetPolicy.presetAvoid, ...(requestGuidance?.avoidTerms || [])]
            .filter(Boolean)
            .join('; ') || undefined,
        }
      } catch {
        const presetPolicy = buildPresetPolicy(deterministicPreset, presetDescription)
        return {
          preset: deterministicPreset,
          scenarioVariant: 'preset_locked',
          anchorZone: presetPolicy.anchorZone,
          lightingMode: 'environment_coherent',
          posePolicy: 'inherit',
          facePolicy: 'immutable',
          cameraPolicy: 'inherit',
          realismGuidance: mergeGuidance(
            presetPolicy.realismGuidance,
            requestGuidance
              ? `Reference vibe hints: ${requestGuidance.vibe}. Scene cues: ${requestGuidance.scene}.`
              : undefined
          ),
          lightingBlueprint: mergeGuidance(
            presetPolicy.lightingBlueprint,
            requestGuidance?.lighting
              ? `Reference lighting hints: ${requestGuidance.lighting}.`
              : undefined
          ),
          presetAvoid: [presetPolicy.presetAvoid, ...(requestGuidance?.avoidTerms || [])]
            .filter(Boolean)
            .join('; ') || undefined,
        }
      }
    }

    const openai = getGeminiChat()

    const requestHint = requestGuidance
      ? `\nReference style hints from successful examples:\n- vibe: ${requestGuidance.vibe}\n- scene cues: ${requestGuidance.scene}\n- lighting cues: ${requestGuidance.lighting}`
      : ''

    const userMessage = `User request: "${userRequest || 'clean studio'}"
Available presets: ${input.availablePresets.join(', ')}
${requestHint}

Resolve this to a strict scene config. Remember: describe the EMPTY environment only. No people. No face. No pose.`

    const response = await openai.chat.completions.create({
      model: PROMPT_INTEL_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const raw = response.choices[0]?.message?.content || ''
    const parsed = JSON.parse(raw) as SceneIntelOutput
    const resolvedPresetId = (parsed.preset || '').trim()
    const resolvedPresetPolicy = resolvedPresetId
      ? buildPresetPolicy(resolvedPresetId, getPresetById(resolvedPresetId)?.scene || '')
      : undefined

    // Enforce immutable policies (safety net)
    parsed.lightingMode = 'environment_coherent'
    parsed.posePolicy = 'inherit'
    parsed.facePolicy = 'immutable'
    parsed.cameraPolicy = 'inherit'
    if (resolvedPresetPolicy?.anchorZone) {
      parsed.anchorZone = mergeGuidance(
        resolvedPresetPolicy.anchorZone,
        parsed.anchorZone
      )
    }
    if (!parsed.realismGuidance) {
      parsed.realismGuidance =
        'Single coherent photograph: subject lit by and grounded in the same environment; shadows and highlights on the subject consistent with the scene; consistent perspective and depth; no pasted-on or cut-out look. Keep realistic background texture and camera grain consistency.'
    }
    if (resolvedPresetPolicy?.realismGuidance) {
      parsed.realismGuidance = mergeGuidance(
        resolvedPresetPolicy.realismGuidance,
        parsed.realismGuidance
      )
    }
    if (!parsed.lightingBlueprint) {
      parsed.lightingBlueprint =
        'Match scene lighting on subject: natural key and fill from visible environment sources, coherent shadow direction and softness, and consistent color temperature between subject and background.'
    }
    if (resolvedPresetPolicy?.lightingBlueprint) {
      parsed.lightingBlueprint = mergeGuidance(
        resolvedPresetPolicy.lightingBlueprint,
        parsed.lightingBlueprint
      )
    }
    const fallbackPresetAvoid = resolvedPresetPolicy?.presetAvoid ||
      (presetId ? buildPresetPolicy(presetId, presetDescription).presetAvoid : undefined)
    parsed.presetAvoid = [fallbackPresetAvoid, parsed.presetAvoid, ...(requestGuidance?.avoidTerms || [])]
      .filter(Boolean)
      .join('; ') || undefined

    console.log(`🎬 Scene Intel: preset=${parsed.preset} zone="${parsed.anchorZone.substring(0, 60)}..."`)

    return parsed
  } catch (error) {
    console.error('⚠️ Scene Intel Adapter failed, using fallback:', error)

    // Deterministic fallback — never fail the pipeline
    return {
      preset: 'studio_gradient',
      scenarioVariant: 'fallback',
      anchorZone: 'Clean gradient studio backdrop with soft even ambient lighting.',
      lightingMode: 'environment_coherent',
      posePolicy: 'inherit',
      facePolicy: 'immutable',
      cameraPolicy: 'inherit',
      realismGuidance:
        'Single coherent photograph: subject lit by and grounded in the same environment; shadows and highlights on the subject consistent with the scene; consistent perspective and depth; no pasted-on or cut-out look. Keep realistic background texture and camera grain consistency.',
      lightingBlueprint:
        'Match scene lighting on subject: natural key and fill from visible environment sources, coherent shadow direction and softness, and consistent color temperature between subject and background.',
      presetAvoid: 'No hard flash, no exaggerated color cast, no cut-out edges, no pasted subject appearance.',
      fallback: {
        preset: 'studio_gradient',
        reason: error instanceof Error ? error.message : 'Scene intel adapter error',
      },
    }
  }
}
