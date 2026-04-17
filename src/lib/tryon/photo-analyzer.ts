import { getGeminiChat } from '@/lib/tryon/gemini-chat'

function formatImageUrl(base64: string) {
  if (base64.startsWith('data:image/')) return base64
  return `data:image/jpeg;base64,${base64}`
}

export type BodyPose = 'standing' | 'sitting' | 'leaning' | 'walking' | 'other'

export interface PhotoAnalysis {
  pose_summary: string
  /** Detected body pose for scene adaptation */
  body_pose: BodyPose
  camera_summary: string
  lighting_summary: string
  realism_constraints: string
  camera_manifest: {
    capture_type: 'iphone_candid' | 'dslr_mirrorless' | 'film_35mm' | 'flash_digicam' | 'unknown'
    focal_length_hint_mm: '24-28' | '28-35' | '35-50' | '50-85' | 'unknown'
    dof_hint: 'deep' | 'moderate' | 'shallow' | 'unknown'
    lighting_type:
      | 'diffused_daylight'
      | 'open_shade_daylight'
      | 'golden_hour'
      | 'foggy_morning'
      | 'on_camera_flash'
      | 'mixed_neon_night'
      | 'mixed'
      | 'unknown'
    wb_family: 'warm' | 'neutral' | 'cool' | 'mixed' | 'unknown'
    imperfections: {
      grain_level: 'none' | 'subtle' | 'medium' | 'strong' | 'unknown'
      compression_hint: 'none' | 'mild_jpeg' | 'heavy_compression' | 'unknown'
      vignette_hint: 'none' | 'subtle' | 'strong' | 'unknown'
      chromatic_aberration_hint: 'none' | 'mild' | 'strong' | 'unknown'
      handheld_tilt_ok: boolean
    }
  }
}

/**
 * Analyze the SUBJECT photo (image 1) for camera + lighting cues so our generated background
 * doesn't look "AI perfect" and stays consistent with the original capture.
 */
export async function analyzeSubjectPhoto(subjectImageBase64: string): Promise<PhotoAnalysis> {
  const openai = getGeminiChat()

  const system = `You are a PROFESSIONAL CINEMATOGRAPHER analyzing a photo for AI scene generation.
Your analysis ensures the AI-generated background matches the original photo's technical characteristics.

Return ONLY JSON with these keys:
body_pose, pose_summary, camera_summary, lighting_summary, realism_constraints, camera_manifest

═══════════════════════════════════════════════════════════════════════════════
BODY POSE (CRITICAL FOR SCENE ADAPTATION):
═══════════════════════════════════════════════════════════════════════════════
body_pose MUST be one of these exact values:
- "standing" = person is upright on their feet, weight on legs, not supported by anything
- "sitting" = person is seated (on chair, floor, steps, stool, couch, ground)
- "leaning" = person is leaning against wall, railing, column, or object for support
- "walking" = person appears in motion, mid-stride, weight shifting
- "other" = lying down, crouching, kneeling, jumping, dancing, or any unusual pose

ANALYZE CAREFULLY:
- Look at leg position, weight distribution, body angle
- Check if they're supported by furniture/surface
- "Leaning" requires visible contact with a support surface

═══════════════════════════════════════════════════════════════════════════════
POSE SUMMARY (Detailed for scene placement):
═══════════════════════════════════════════════════════════════════════════════
pose_summary: Describe body position in detail for natural scene integration.
Include: leg stance, arm placement, torso angle, weight distribution.
Example: "Standing straight, feet shoulder-width, arms relaxed at sides, facing camera directly"
Example: "Seated with legs crossed, slight forward lean, one arm on armrest, looking camera-left"

═══════════════════════════════════════════════════════════════════════════════
CAMERA ANALYSIS (Match in generated image):
═══════════════════════════════════════════════════════════════════════════════
camera_summary: Technical camera setup description.
Include: estimated focal length, shooting distance, camera height relative to subject, any tilt.
Example: "50mm equivalent, shot from 6 feet at eye level, slight upward angle, handheld"

═══════════════════════════════════════════════════════════════════════════════
LIGHTING ANALYSIS (Critical for compositing):
═══════════════════════════════════════════════════════════════════════════════
lighting_summary: Describe light sources, direction, quality.
Include: key light direction, fill amount, any rim/hair light, color temperature.
Example: "Key light from camera-left window (soft), fill from ambient, warm afternoon color temp, soft shadows on right side of face"

═══════════════════════════════════════════════════════════════════════════════
REALISM CONSTRAINTS (Avoid AI/CGI look):
═══════════════════════════════════════════════════════════════════════════════
realism_constraints: List technical imperfections to preserve authenticity:
- Grain/noise level and distribution
- Any motion blur or focus softness
- Lens characteristics (distortion, vignette, chromatic aberration)
- JPEG artifacts if visible
- How shadows should behave
Example: "Match subtle ISO grain visible in shadows, maintain soft background bokeh at edges, keep natural lens vignette in corners, shadow direction must match window light from left"

═══════════════════════════════════════════════════════════════════════════════
CAMERA MANIFEST (Structured data):
═══════════════════════════════════════════════════════════════════════════════
camera_manifest must be a JSON object with:
- capture_type: "iphone_candid" | "dslr_mirrorless" | "film_35mm" | "flash_digicam" | "unknown"
- focal_length_hint_mm: "24-28" | "28-35" | "35-50" | "50-85" | "unknown"
- dof_hint: "deep" (everything sharp) | "moderate" (soft background) | "shallow" (blurred background) | "unknown"
- lighting_type: "diffused_daylight" | "open_shade_daylight" | "golden_hour" | "foggy_morning" | "on_camera_flash" | "mixed_neon_night" | "mixed" | "unknown"
- wb_family: "warm" (yellow/orange) | "neutral" | "cool" (blue) | "mixed" | "unknown"
- imperfections: {
    grain_level: "none" | "subtle" | "medium" | "strong" | "unknown"
    compression_hint: "none" | "mild_jpeg" | "heavy_compression" | "unknown"
    vignette_hint: "none" | "subtle" | "strong" | "unknown"
    chromatic_aberration_hint: "none" | "mild" | "strong" | "unknown"
    handheld_tilt_ok: boolean (true if slight tilt looks natural for this shot)
  }

If genuinely uncertain, use "unknown" values. Don't guess camera specifics - describe what you can see.

FOCUS ONLY ON TECHNICAL/PHOTOGRAPHIC ASPECTS. Do NOT describe the person's identity, face, ethnicity, or age.`

  const user: any[] = [
    { type: 'text', text: 'Analyze this subject photo for camera, lighting, and realism constraints.' },
    { type: 'image_url', image_url: { url: formatImageUrl(subjectImageBase64), detail: 'high' } },
  ]

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user as any },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 500,
  })

  const content = resp.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content) as any

  // Normalize body_pose
  const rawPose = String(parsed.body_pose || '').toLowerCase().trim()
  let body_pose: BodyPose = 'other'
  if (rawPose === 'standing') body_pose = 'standing'
  else if (rawPose === 'sitting') body_pose = 'sitting'
  else if (rawPose === 'leaning') body_pose = 'leaning'
  else if (rawPose === 'walking') body_pose = 'walking'

  return {
    pose_summary: String(parsed.pose_summary || '').trim(),
    body_pose,
    camera_summary: String(parsed.camera_summary || '').trim(),
    lighting_summary: String(parsed.lighting_summary || '').trim(),
    realism_constraints: String(parsed.realism_constraints || '').trim(),
    camera_manifest: {
      capture_type:
        parsed?.camera_manifest?.capture_type === 'iphone_candid' ||
        parsed?.camera_manifest?.capture_type === 'dslr_mirrorless' ||
        parsed?.camera_manifest?.capture_type === 'film_35mm' ||
        parsed?.camera_manifest?.capture_type === 'flash_digicam'
          ? parsed.camera_manifest.capture_type
          : 'unknown',
      focal_length_hint_mm:
        parsed?.camera_manifest?.focal_length_hint_mm === '24-28' ||
        parsed?.camera_manifest?.focal_length_hint_mm === '28-35' ||
        parsed?.camera_manifest?.focal_length_hint_mm === '35-50' ||
        parsed?.camera_manifest?.focal_length_hint_mm === '50-85'
          ? parsed.camera_manifest.focal_length_hint_mm
          : 'unknown',
      dof_hint:
        parsed?.camera_manifest?.dof_hint === 'deep' ||
        parsed?.camera_manifest?.dof_hint === 'moderate' ||
        parsed?.camera_manifest?.dof_hint === 'shallow'
          ? parsed.camera_manifest.dof_hint
          : 'unknown',
      lighting_type:
        parsed?.camera_manifest?.lighting_type === 'diffused_daylight' ||
        parsed?.camera_manifest?.lighting_type === 'open_shade_daylight' ||
        parsed?.camera_manifest?.lighting_type === 'golden_hour' ||
        parsed?.camera_manifest?.lighting_type === 'foggy_morning' ||
        parsed?.camera_manifest?.lighting_type === 'on_camera_flash' ||
        parsed?.camera_manifest?.lighting_type === 'mixed_neon_night' ||
        parsed?.camera_manifest?.lighting_type === 'mixed'
          ? parsed.camera_manifest.lighting_type
          : 'unknown',
      wb_family:
        parsed?.camera_manifest?.wb_family === 'warm' ||
        parsed?.camera_manifest?.wb_family === 'neutral' ||
        parsed?.camera_manifest?.wb_family === 'cool' ||
        parsed?.camera_manifest?.wb_family === 'mixed'
          ? parsed.camera_manifest.wb_family
          : 'unknown',
      imperfections: {
        grain_level:
          parsed?.camera_manifest?.imperfections?.grain_level === 'none' ||
          parsed?.camera_manifest?.imperfections?.grain_level === 'subtle' ||
          parsed?.camera_manifest?.imperfections?.grain_level === 'medium' ||
          parsed?.camera_manifest?.imperfections?.grain_level === 'strong'
            ? parsed.camera_manifest.imperfections.grain_level
            : 'unknown',
        compression_hint:
          parsed?.camera_manifest?.imperfections?.compression_hint === 'none' ||
          parsed?.camera_manifest?.imperfections?.compression_hint === 'mild_jpeg' ||
          parsed?.camera_manifest?.imperfections?.compression_hint === 'heavy_compression'
            ? parsed.camera_manifest.imperfections.compression_hint
            : 'unknown',
        vignette_hint:
          parsed?.camera_manifest?.imperfections?.vignette_hint === 'none' ||
          parsed?.camera_manifest?.imperfections?.vignette_hint === 'subtle' ||
          parsed?.camera_manifest?.imperfections?.vignette_hint === 'strong'
            ? parsed.camera_manifest.imperfections.vignette_hint
            : 'unknown',
        chromatic_aberration_hint:
          parsed?.camera_manifest?.imperfections?.chromatic_aberration_hint === 'none' ||
          parsed?.camera_manifest?.imperfections?.chromatic_aberration_hint === 'mild' ||
          parsed?.camera_manifest?.imperfections?.chromatic_aberration_hint === 'strong'
            ? parsed.camera_manifest.imperfections.chromatic_aberration_hint
            : 'unknown',
        handheld_tilt_ok:
          typeof parsed?.camera_manifest?.imperfections?.handheld_tilt_ok === 'boolean'
            ? parsed.camera_manifest.imperfections.handheld_tilt_ok
            : false,
      },
    },
  }
}


