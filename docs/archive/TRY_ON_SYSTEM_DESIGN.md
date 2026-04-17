# Virtual Try-On System Design Decisions

## 1. User Flow

### Image Upload
- **Current**: User uploads one person image and one clothing reference image
- **Recommendation**: Keep single reference image for simplicity
- **Future Enhancement**: Support multiple reference images (up to 5 for Gemini 3 Pro) for better face consistency

### Auto-Detection
- **Current**: System auto-detects clothing, face features, lighting, and background
- **Recommendation**: 
  - ✅ Auto-detect clothing (color, pattern, fabric, fit)
  - ✅ Auto-detect face features (for identity lock)
  - ✅ Auto-detect lighting and background (to preserve in simple mode)
  - ✅ Auto-suggest presets based on image analysis (lighting, background type)

### Preset Selection
- **Current**: Manual selection with "None (Default)" option
- **Recommendation**: 
  - Keep manual selection for user control
  - Add "Auto-Suggest" button that analyzes image and recommends best preset
  - Show preset preview before applying

## 2. Face & Body Consistency

### Consistency Level
- **Recommendation**: **Strict cloning (95-100% accuracy)**
  - Exact face structure, skin tone, hair
  - No expression changes unless explicitly requested
  - Body proportions fully locked

### Prevention Rules (ALL ENABLED)
- ✅ **NO new hair** - Preserve exact hair color, length, volume, style
- ✅ **NO new tattoos** - Preserve all existing body art
- ✅ **NO body alterations** - No slimming, bulking, reshaping
- ✅ **NO smoothing or plastic skin** - Natural texture with pores

### Expression Changes
- **Recommendation**: **Locked by default**
  - Preserve exact expression from reference
  - Only allow if user explicitly requests in preset
  - Add warning: "Changing expression may reduce identity accuracy"

## 3. Clothing Behavior

### Original Clothing
- **Current**: Always replaces clothing
- **Recommendation**: 
  - Default: Replace clothing (current behavior)
  - Future: Add "Keep Original" toggle for comparison mode

### Clothing Realism
- **Recommendation**: 
  - ✅ Follow natural wrinkles, shadows, and fabric realism from original
  - ✅ Match lighting direction and intensity
  - ✅ Preserve fabric weight and drape behavior

### Color Changes
- **Recommendation**: **NOT allowed by default**
  - Clothing color must match reference exactly
  - Only allow color variations if user explicitly requests "color variant" preset
  - Add warning about potential identity distortion

### Accessories
- **Recommendation**: **Retain by default**
  - Preserve all accessories (chains, rings, watches, necklaces)
  - Add toggle: "Remove Accessories" if user wants clean look
  - Never add new accessories unless explicitly requested

## 4. Gemini Nano (Face Consistency Engine)

### Analysis Capabilities
- **Recommendation**: Gemini should analyze:
  - ✅ Face embeddings (for identity matching)
  - ✅ Hair (color, texture, length, style)
  - ✅ Skin texture (pores, imperfections, tone)
  - ✅ Lighting (direction, quality, color temp)
  - ✅ Pose (body position, arm placement)
  - ✅ Body outlines (proportions, shape)

### Quality Warnings
- **Recommendation**: 
  - ✅ Generate warnings for low-quality images (< 512px, blurry, low light)
  - ✅ Suggest image improvements before processing
  - ✅ Auto-adjust prompts to protect identity when quality is low

### Prompt Override
- **Recommendation**: 
  - ✅ Auto-adjust prompts to remove identity-distorting instructions
  - ✅ Override user prompts that would change face/hair/body
  - ✅ Log overrides for transparency (show user what was changed)

## 5. ChatGPT Role (Prompt + Preset Brain)

### Prompt Rewriting
- **Recommendation**: 
  - ✅ Always rewrite user prompts into clean, structured instructions
  - ✅ Use strict template format (IDENTITY/BODY/CLOTHING/BACKGROUND/CAMERA)
  - ✅ Remove ambiguous or dangerous language

### Preset Selection
- **Recommendation**: 
  - ✅ Auto-suggest best preset based on image analysis
  - ✅ Show reasoning: "Detected indoor lighting → Suggesting 'Soft Indoor Studio'"
  - ✅ Allow user to override auto-suggestion

### "AI Look" Detection
- **Recommendation**: 
  - ✅ Remove words like: "gloss skin", "hyperpolished", "plastic", "airbrushed", "smooth"
  - ✅ Replace with: "natural skin texture", "realistic", "authentic"
  - ✅ Enforce RAW-realistic style by default

### Fantasy Presets
- **Recommendation**: 
  - ✅ Block fantasy/anime/cartoon requests by default
  - ✅ Only allow if user explicitly selects "Creative/Fantasy" category
  - ✅ Add warning: "Fantasy presets may reduce identity accuracy"

## 6. Image Generation Model

### Current Model
- **Using**: Gemini 2.5 Flash Image (Nano Banana) and Gemini 3 Pro Image Preview (Nano Banana Pro)
- **Identity Locking**: ✅ Supported via reference images and strict prompts
- **LoRA/Embeddings**: Not needed - Gemini uses reference images directly

### Variations
- **Recommendation**: 
  - Generate **one image** by default (faster, more predictable)
  - Add "Generate Variations" option (2-4 variations) for Pro model
  - Show variations in grid layout

## 7. Output Format

### Metadata to Include
- **Recommendation**: Return JSON with:
  ```json
  {
    "imageUrl": "...",
    "metadata": {
      "finalPrompt": "...",
      "selectedPreset": "...",
      "consistencySettings": {
        "faceLock": true,
        "bodyLock": true,
        "hairLock": true
      },
      "safetyOverrides": [],
      "warnings": []
    }
  }
  ```

### User Presets
- **Recommendation**: 
  - ✅ Store user's preferred presets in profile
  - ✅ Remember last used preset per session
  - ✅ Allow custom preset creation (future)

### Before/After Comparison
- **Recommendation**: 
  - ✅ Show side-by-side comparison in UI
  - ✅ Add slider to compare original vs. result
  - ✅ Highlight what changed (clothing only)

## 8. Safety + Realism

### Lighting Validation
- **Recommendation**: 
  - ✅ Reject unrealistic combinations (e.g., outdoor sun + indoor shadows)
  - ✅ Warn if lighting direction conflicts with original
  - ✅ Auto-correct minor lighting inconsistencies

### Enforced Rules
- **Recommendation**: ALL enabled:
  - ✅ Natural skin texture (no smoothing)
  - ✅ No face replacement
  - ✅ No dramatic facial distortion
  - ✅ No plastic/airbrushed look

### Content Filtering
- **Recommendation**: 
  - ✅ Reject anime/cartoon requests by default
  - ✅ Block requests that would distort identity
  - ✅ Show clear error: "This request would modify your identity. Please use a different preset."

## 9. Preset System

### Preset Components
- **Recommendation**: Each preset includes:
  - ✅ Background (description or "preserve original")
  - ✅ Lighting (type, direction, quality, color temp)
  - ✅ Camera angle (match original or specify)
  - ✅ Mood (professional, casual, editorial)
  - ✅ Texture rules (natural, no smoothing)

### Preset Override Behavior
- **Recommendation**: 
  - **Blend with user instructions** (not override)
  - User instructions take priority for clothing
  - Preset applies to background/lighting only
  - If conflict: warn user and use safer option

## 10. Auto-Intelligence Behavior

### Auto-Fix Bad Prompts
- **Recommendation**: 
  - ✅ Auto-fix prompts that would break identity
  - ✅ Remove dangerous words automatically
  - ✅ Log all fixes for transparency

### Warnings
- **Recommendation**: 
  - ✅ Warn when prompt breaks realism
  - ✅ Show preview of what will change
  - ✅ Allow user to proceed or cancel

### Request Refusal
- **Recommendation**: 
  - ✅ Refuse requests that would distort face
  - ✅ Show clear error message
  - ✅ Suggest alternative presets that preserve identity

### Auto-Preset Selection
- **Recommendation**: 
  - ✅ Auto-guess best preset when user doesn't choose
  - ✅ Show reasoning: "Detected: Indoor lighting, neutral background → Using 'Soft Indoor Studio'"
  - ✅ Allow user to change after generation

## Implementation Priority

### Phase 1 (Current - DONE)
- ✅ Strict identity lock
- ✅ Template-based prompts
- ✅ Manual preset selection
- ✅ Basic safety rules

### Phase 2 (Next)
- [ ] Auto-preset suggestion
- [ ] Quality warnings
- [ ] Prompt override logging
- [ ] Before/after comparison UI

### Phase 3 (Future)
- [ ] Multiple reference images
- [ ] Custom presets
- [ ] Variation generation
- [ ] Advanced safety filters

