import { getGeminiChat } from '@/lib/tryon/gemini-chat'
import type { VerifyResult } from './types'

function formatImageUrl(base64: string) {
  if (base64.startsWith('data:image/')) return base64
  return `data:image/jpeg;base64,${base64}`
}

export async function verifyTryOnImage(params: {
  outputImageBase64: string
  subjectImageBase64: string
  garmentRefBase64: string
}): Promise<VerifyResult> {
  const openai = getGeminiChat()

  const system = `You are an EXTREMELY STRICT QA checker for a virtual try-on system.
Your job is to catch ANY issues that make the output look fake, AI-generated, or inconsistent.

═══════════════════════════════════════════════════════════════════
OUTPUT FORMAT (JSON only)
═══════════════════════════════════════════════════════════════════
{
  "ok": boolean,
  "reasons": ["array of issues found"],
  "has_extra_people": boolean,
  "appears_collage": boolean,
  "face_geometry_match": "exact" | "close" | "different",
  "pose_preserved": boolean,
  "scene_plausible": boolean,
  "lighting_realism": "high" | "medium" | "low",
  "lighting_consistent": boolean,
  "subject_color_preserved": boolean,
  "looks_ai_generated": boolean,
  "background_detail_preserved": boolean,
  "background_has_grain": boolean,
  "dof_realistic": boolean,
  "garment_applied": boolean,
  "garment_fidelity": "high" | "medium" | "low",
  "identity_preserved": boolean,
  "identity_fidelity": "high" | "medium" | "low",
  "original_outfit_still_present": boolean,
  "output_is_unedited_copy": boolean
}

═══════════════════════════════════════════════════════════════════
VERIFICATION RULES
═══════════════════════════════════════════════════════════════════

FACE GEOMETRY (CRITICAL - be extremely strict):
- "exact": Face is pixel-perfect match to IMAGE B - same eye shape, nose, lips, jawline, proportions
- "close": Face looks like the same person but with minor drift (slightly different eye shape, subtle proportion changes)
- "different": Face is clearly a different person or has significant drift

IMPORTANT: "close" is NOT acceptable for high-quality output. We want "exact" only.
Look for:
- Eye shape and size changes
- Nose bridge width changes
- Lip thickness/shape changes
- Jawline contour changes
- Facial proportion changes (eye spacing, nose-to-lip distance)
- Skin texture smoothing or changes

POSE PRESERVED:
- true ONLY if the pose matches IMAGE B exactly
- Check: head tilt, shoulder angle, arm position, body lean, hand placement
- Even small pose changes should be flagged as false

BACKGROUND & REALISM:
- background_has_grain: true if visible film grain or sensor noise in background
- background_detail_preserved: false if background looks smeary, painterly, or over-smoothed
- dof_realistic: false if bokeh looks fake (perfect circles, uniform blur, hard cutoffs)
- looks_ai_generated: true if ANY of these:
  - Plastic/waxy skin
  - Perfect symmetry
  - HDR glow or bloom
  - Neon/cyberpunk grading without context
  - Wet streets without rain
  - Over-perfect backgrounds
  - Unnatural lighting
  - Missing grain/noise where expected

LIGHTING:
- lighting_consistent: false if subject and background have different time-of-day or color temperature
- lighting_realism: "low" if lighting looks studio-perfect, CGI, or has halos/bloom

IDENTITY & COLOR:
- subject_color_preserved: false if face/skin tone changed from IMAGE B
- identity_preserved: false if it's not the same person
- identity_fidelity: "low" if face drifted, "medium" if slight changes, "high" only if exact match

GARMENT:
- garment_applied: true if the subject is wearing the garment from IMAGE C
- garment_fidelity: check color match, pattern match, neckline, sleeves, buttons
- original_outfit_still_present: true if still wearing clothes from IMAGE B

OK is true ONLY if ALL of these are true:
- Exactly one subject
- Not a collage
- face_geometry_match is "exact"
- pose_preserved is true
- garment_applied is true
- garment_fidelity is "high"
- identity_preserved is true
- identity_fidelity is "high"
- original_outfit_still_present is false
- looks_ai_generated is false
- scene_plausible is true
- lighting_consistent is true
- subject_color_preserved is true`

  const user = [
    { type: 'text', text: 'IMAGE A: Output image to verify (the generated result).' },
    { type: 'image_url', image_url: { url: formatImageUrl(params.outputImageBase64), detail: 'high' } },
    { type: 'text', text: 'IMAGE B: Original subject photo (identity + pose source). The output MUST be this EXACT person in this EXACT pose.' },
    { type: 'image_url', image_url: { url: formatImageUrl(params.subjectImageBase64), detail: 'high' } },
    { type: 'text', text: 'IMAGE C: Garment reference (the clothing that should be worn in the output).' },
    { type: 'image_url', image_url: { url: formatImageUrl(params.garmentRefBase64), detail: 'high' } },
    {
      type: 'text',
      text: `VERIFICATION CHECKLIST:

1. FACE GEOMETRY: Compare face in IMAGE A to IMAGE B pixel-by-pixel.
   - Are eye shapes identical? (shape, size, spacing)
   - Is nose identical? (bridge width, nostril shape, length)
   - Are lips identical? (shape, thickness, cupid's bow)
   - Is jawline identical? (contour, chin shape)
   - Are facial proportions identical?
   → Rate: "exact" / "close" / "different"

2. POSE: Is the pose in IMAGE A exactly the same as IMAGE B?
   - Head tilt and angle?
   - Shoulder position?
   - Arm placement?
   - Body lean?
   → true only if EXACT match

3. SKIN/COLOR: Did the face/skin exposure or color change from IMAGE B?
   - Skin tone lighter/darker/different undertone?
   - Face exposure different?
   → subject_color_preserved = true only if unchanged

4. GARMENT: Is the subject wearing the garment from IMAGE C?
   - Same color?
   - Same pattern/print?
   - Same neckline, sleeves, details?
   - Or still wearing original outfit from IMAGE B?
   → Rate fidelity and check original_outfit_still_present

5. REALISM: Does IMAGE A look like a real photo?
   - Is there visible grain/noise? (should be)
   - Is background texture preserved or smeary/painterly?
   - Is bokeh realistic or fake (perfect circles)?
   - Any plastic skin, HDR glow, or CGI artifacts?
   → looks_ai_generated = true if it looks fake

6. SCENE: Is the scene physically plausible?
   - Can this pose exist in this setting?
   - Any floating furniture or impossible placements?

7. LIGHTING: Does lighting match between subject and background?
   - Same time of day?
   - Same color temperature?
   - Same shadow direction?

Return JSON only. Be EXTREMELY strict - any drift from the original is a failure.`,
    },
  ] as any

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.05, // Very low for consistent strict evaluation
    max_tokens: 500,
  })

  const content = resp.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content) as any

  // Extract face geometry match (new field)
  const face_geometry_match = 
    parsed.face_geometry_match === 'exact' || parsed.face_geometry_match === 'close' || parsed.face_geometry_match === 'different'
      ? parsed.face_geometry_match
      : 'different' // Default to failure

  // Extract pose preserved (new field)
  const pose_preserved = typeof parsed.pose_preserved === 'boolean' ? parsed.pose_preserved : false

  // Extract grain check (new field)
  const background_has_grain = typeof parsed.background_has_grain === 'boolean' ? parsed.background_has_grain : false

  // Existing fields with conservative defaults
  const background_detail_preserved = typeof parsed.background_detail_preserved === 'boolean' ? parsed.background_detail_preserved : false
  const dof_realistic = typeof parsed.dof_realistic === 'boolean' ? parsed.dof_realistic : false
  const looks_ai_generated = typeof parsed.looks_ai_generated === 'boolean' ? parsed.looks_ai_generated : true
  const scene_plausible = typeof parsed.scene_plausible === 'boolean' ? parsed.scene_plausible : false
  const lighting_consistent = typeof parsed.lighting_consistent === 'boolean' ? parsed.lighting_consistent : false
  const subject_color_preserved = typeof parsed.subject_color_preserved === 'boolean' ? parsed.subject_color_preserved : false

  const lighting_realism =
    parsed.lighting_realism === 'high' || parsed.lighting_realism === 'medium' || parsed.lighting_realism === 'low'
      ? parsed.lighting_realism
      : 'low'

  const garment_fidelity =
    parsed.garment_fidelity === 'high' || parsed.garment_fidelity === 'medium' || parsed.garment_fidelity === 'low'
      ? parsed.garment_fidelity
      : 'low'

  const identity_fidelity =
    parsed.identity_fidelity === 'high' || parsed.identity_fidelity === 'medium' || parsed.identity_fidelity === 'low'
      ? parsed.identity_fidelity
      : 'low'

  // Derive ok based on all checks
  const derivedOk = 
    !parsed.has_extra_people &&
    !parsed.appears_collage &&
    face_geometry_match === 'exact' &&
    pose_preserved &&
    !!parsed.garment_applied &&
    garment_fidelity === 'high' &&
    !!parsed.identity_preserved &&
    identity_fidelity === 'high' &&
    !parsed.original_outfit_still_present &&
    !parsed.output_is_unedited_copy &&
    !looks_ai_generated &&
    scene_plausible &&
    lighting_consistent &&
    subject_color_preserved &&
    background_detail_preserved

  return {
    ok: derivedOk,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
    has_extra_people: !!parsed.has_extra_people,
    appears_collage: !!parsed.appears_collage,
    face_geometry_match,
    pose_preserved,
    scene_plausible,
    lighting_realism,
    lighting_consistent,
    subject_color_preserved,
    looks_ai_generated,
    background_detail_preserved,
    background_has_grain,
    dof_realistic,
    garment_applied: !!parsed.garment_applied,
    garment_fidelity,
    identity_preserved: !!parsed.identity_preserved,
    identity_fidelity,
    original_outfit_still_present: !!parsed.original_outfit_still_present,
    output_is_unedited_copy: !!parsed.output_is_unedited_copy,
  }
}
