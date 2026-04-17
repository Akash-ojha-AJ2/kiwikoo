# Face & Eye Consistency Plan — Nano Banana Pro Try-On

**Problem:** Eyes and face are changing a lot in try-on output; face is mismatching despite identity-preservation logic.

**Goal:** Align with research and Nano Banana Pro’s capabilities to maximize face and eye consistency without changing the core model.

---

## 1. Research Summary (Findings from 20+ sources)

### 1.1 Why eyes drift most
- **Eyes are the highest-drift region** in identity-preserving generation: models often change eye shape, gaze, iris, and spacing even when “face” is requested.
- **Text-only prompts are weak** for exact eye preservation; effective approaches use **reference images + explicit eye/face description**.
- **Semantic correspondence** (e.g. “eye-for-an-eye” style transfer) and **identity-conditioned** methods (Arc2Face, FlashFace, DreamIdentity) keep eyes by using face/identity embeddings or multiple references, not just text.

### 1.2 What works for face consistency
- **Multiple reference images** of the same person (different angles/expressions) give the model a clearer identity signal than a single image.
- **Decoupling identity from attributes**: describe “who” (face geometry, eyes, skin) separately from “what changes” (clothing, pose, lighting).
- **Strict “do not change” instructions** for face/eyes in plain language and in structured control blocks.
- **Spatial constraints** (face bbox, position/scale lock) reduce drift.
- **Reference order**: person image(s) first, then garment, then text — so identity is the primary anchor (we already do this).

### 1.3 Nano Banana Pro specifics
- **Up to 14 reference images**, including **up to 5 human references** for “character consistency.”
- **Multi-turn / chat** is recommended for iterative edits; we use single-turn but can add a retry with stricter instructions.
- **High-fidelity detail preservation** is a documented use case; prompts should explicitly ask to preserve face/eye details from the reference.
- No public “strict facial consistency mode” in the API; we rely on **reference count + prompt design**.

---

## 2. Current Pipeline (Relevant Parts)

- **Face forensics (GPT-4o):** Builds `faceAnchor`, `bodyAnchor`, etc. from the person image. `faceAnchor` is one sentence (eye shape/spacing, nose, lips, jaw, skin, etc.).
- **Forensic prompt:** Injects `faceAnchor` into a “FACE LOCK” block and into a JSON `control.face.forensic_signature`, plus `face_rules` (e.g. preserve_gaze_eye_alignment_nose_lips_jawline).
- **Content order to Gemini:** `[person_image, optional_face_crop, garment_image, prompt]`. **Face crop is currently disabled** (`faceCropBase64: undefined`).
- **Face box:** We have `faceBox` (from face coordinates) and `faceSpatialLock` in the prompt for position/scale.
- **Retry:** One retry with `retryMode: true` and stricter `exact_face_from_image_1`, `no_gaze_change`, `no_face_relight`.

Gaps vs. research:
- Only **one** person image; we do not use 2–3 references (e.g. full body + face crop).
- **Eyes** are not called out separately from “face” in the forensic schema or in the prompt.
- **Face crop** exists in code but is not passed; we never send a second identity reference.

---

## 3. Recommended Plan (Phased)

### Phase 1 — Quick wins (no new infra)

1. **Enable face crop as second reference**
   - In `nano-banana-pro-renderer.ts`, call `extractFaceCrop(personImageBase64)` (or the detection-based `extractFaceCropForImage3` if we have face detection) and pass the result as `faceCropBase64` into `generateTryOnDirect`.
   - Content order stays: `[person_full, face_crop, garment, prompt]`. This gives Nano Banana Pro two person references for identity (full + face), which matches “multi-reference for consistency.”

2. **Eyes-first forensic anchor**
   - In `face-forensics.ts`, extend the JSON schema to include explicit **eye** fields, e.g.:
     - `eyesAnchor`: "eye shape (e.g. almond, round), inter-pupillary spacing, iris color, gaze direction, eyelid and brow from this image"
   - In `forensic-prompt.ts`:
     - Add an **EYES / GAZE block** in plain text (like FACE LOCK): e.g. “Preserve exact eye shape, iris color, gaze direction, eyelid and brow from Image 1. Do not change eye size, spacing, or expression.”
     - Use `eyesAnchor` (or the existing `faceAnchor` expanded with eye detail) in that block and in `control.face` or a new `control.eyes` if we add it.

3. **Strengthen face_rules and avoid list**
   - In `forensic-prompt.ts`, add explicit eye rules to `face_rules`, e.g.:
     - `preserve_exact_eye_shape_iris_and_gaze_from_Image_1`
     - `no_eye_resize_spacing_or_expression_change`
   - In `avoid`, add: `changed eyes`, `different gaze`, `eye shape change`, `iris color change`.

4. **Retry mode: eye-specific**
   - In the retry branch, add to `enforce`: `no_eye_change`, `exact_eyes_from_image_1`, and in the retry prompt text repeat the EYES block and “Do not alter eyes in any way.”

### Phase 2 — Deeper forensic description

5. **Structured eye description from GPT**
   - In `face-forensics.ts`, ask GPT for structured eye fields, e.g.:
     - `eyeShape`, `eyeSpacing`, `irisColor`, `gazeDirection`, `eyelidBrow`
   - Merge these into one `eyesAnchor` string and into the prompt’s EYES block so the model gets a very explicit, eye-specific description.

6. **Face box quality**
   - Ensure `faceBox` is from a reliable detector (we have `detectFaceCoordinates`). If we have multiple faces, use the largest or the one closest to center for the lock. Document that spatial lock applies to the same face we describe in the forensic anchor.

### Phase 3 — Multi-reference and API tuning (if needed)

7. **Up to 3 person references**
   - When we have multiple identity images (e.g. from influencer profile), send up to 2–3 person images (e.g. full body + 1–2 face/portrait crops) before the garment image, so we use Nano Banana Pro’s “up to 5 human references” for a single subject.
   - Keep prompt text clear: “The same person appears in Image 1, Image 2 [and 3]. Preserve this person’s face and eyes exactly from these references.”

8. **Prompt phrasing**
   - Start the prompt with a single “IDENTITY (non-negotiable)” line: “The face and eyes in the output must be exactly the same person as in Image 1 (and Image 2). Do not change face shape, eye shape, gaze, or iris.”
   - Keep FACE LOCK and EYES blocks near the top of the prompt so they are not deprioritized.

9. **Temperature and config**
   - We already use low temperature (0.01); keep it. Optionally try `topK: 24` or `topP: 0.85` for slightly more determinism if the API allows.

10. **Optional: second retry with eyes-only emphasis**
    - If the first retry still shows eye drift, add a second retry that shortens the prompt to “Preserve the exact face and eyes from Image 1. Do not change anything about the eyes or face. Apply only the garment and scene from the previous instructions.” (Minimal task, maximum identity emphasis.)

---

## 4. Implementation Checklist

- [ ] **P1.1** Enable face crop: in `nano-banana-pro-renderer.ts`, call `extractFaceCrop` (or detection-based crop) and pass `faceCropBase64` into `generateTryOnDirect`.
- [ ] **P1.2** Add `eyesAnchor` (or expand `faceAnchor`) in `face-forensics.ts` with explicit eye shape, spacing, iris, gaze, eyelid/brow.
- [ ] **P1.3** Add EYES block in `forensic-prompt.ts` and use eyes anchor there and in control.
- [ ] **P1.4** Add eye-specific `face_rules` and `avoid` terms in `forensic-prompt.ts`.
- [ ] **P1.5** In retry mode, add `no_eye_change` / `exact_eyes_from_image_1` and repeat EYES block in retry prompt.
- [ ] **P2.1** (Optional) Structured eye fields from GPT in `face-forensics.ts` and merge into `eyesAnchor`.
- [ ] **P2.2** (Optional) Verify face box source and document which face is locked.
- [ ] **P3.1** (Optional) Support 2–3 person references when multiple identity images exist.
- [ ] **P3.2** (Optional) Add leading “IDENTITY (non-negotiable)” line to prompt.
- [ ] **P3.3** (Optional) Second retry with eyes-only emphasis if metrics show persistent drift.

---

## 5. Success Criteria

- **Qualitative:** Reviewers report that eyes and face “match the reference” in the majority of try-ons.
- **Quantitative (if we add metrics):** Face similarity score (e.g. embedding or landmark) between person image and generated image above a chosen threshold; optional eye-region similarity.
- **A/B:** Compare current pipeline vs. P1 (face crop + eyes block + retry eye rules) on the same set of inputs and choose the better default.

---

## 6. References (Summary)

- Arc2Face, ConsistentID, FlashFace, DreamIdentity: identity-conditioned or multi-scale face features improve consistency; text-only is limited.
- Eye-for-an-eye, EyePreserve: eyes need explicit treatment (reference + description or identity-preserving synthesis).
- Nano Banana Pro docs: up to 14 references, 5 human refs for character consistency; multi-turn recommended for complex edits.
- Vertex AI / Imagen: face mesh and reference image types for preservation; Gemini 3 Pro Image uses reference images + prompt.
- Virtual try-on (PromptDresser, UP-VTON): preserve face/identity while editing garment; text + reference and inpainting strategies.

---

*Document generated from web research and codebase review. Implement in order Phase 1 → Phase 2 → Phase 3 as needed.*
