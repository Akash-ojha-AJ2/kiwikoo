# AI Models Configuration Guide

## Overview

The TRIA try-on system uses a two-stage AI pipeline:
1. **GPT-4o Mini** (OpenAI) - Intelligent prompt generation
2. **Gemini 3 Pro Image Preview** (Google) - High-quality image generation

## Stage 1: GPT-4o Mini Prompt Generation

### Role
GPT-4o Mini acts as the "intelligent brain" that analyzes images and generates optimized prompts for image generation.

### Process

1. **Image Analysis** (using GPT-4o):
   - Analyzes person image to extract facial features (face shape, eyes, skin tone, hair, etc.)
   - Analyzes clothing image to extract garment details (fabric, pattern, color, fit, etc.)

2. **Prompt Generation** (using GPT-4o Mini):
   - Receives both images as base64
   - Receives extracted face features and clothing analysis
   - Uses reference prompts as training examples
   - Generates a comprehensive, narrative-style prompt

### Instructions to GPT-4o Mini

The system prompt includes:

```
You are an expert virtual try-on prompt engineer. Your task is to analyze images and generate highly detailed, optimized prompts for AI image generation.

CRITICAL GUIDELINES:
1. Describe scenes narratively, not as keyword lists
2. Be hyper-specific about details (fabric textures, lighting, camera angles)
3. Provide context and intent for the image
4. Use photography and cinematic language
5. Emphasize identity preservation and clothing accuracy

REFERENCE PROMPTS (Learn from these examples):
[Examples from reference-prompts.ts]

When generating prompts:
- Analyze both the person image and clothing image together
- Extract all critical details from the provided analyses
- Create a comprehensive, descriptive prompt that tells a story
- Include specific camera angles, lighting, and technical details
- Ensure identity preservation is explicitly stated
- Describe clothing application with fabric, fit, and style details
- Add photorealistic scene descriptions
- Maintain quality control requirements
```

### User Prompt Structure

```
Analyze the provided person image and clothing image together. Generate a comprehensive, detailed prompt for virtual try-on image generation.

[Identity Preservation Requirements - detailed facial features]
[Clothing Application Requirements - detailed garment attributes]
[Scene Description]
[Style Instructions - pose, expression, background]

Generate a photorealistic, narrative-style prompt that:
1. Describes the scene in detail (camera angle, lighting, environment)
2. Explicitly preserves the person's identity with all facial features
3. Accurately applies the clothing with fabric, fit, and style details
4. Ensures realistic physics, natural fit, and authentic appearance
5. Uses photography terminology (lens, aperture, lighting setup)
6. Includes fine details for photorealistic quality

Create a prompt that tells a story and describes the scene, not just a list of keywords.
```

### Configuration

- **Model**: `gpt-4o-mini`
- **Temperature**: `0.4` (balance between creativity and consistency)
- **Max Tokens**: `1500`
- **Vision**: Enabled (receives both images)

### Output

Returns a detailed, narrative-style prompt optimized for Gemini image generation.

---

## Stage 2: Gemini 3 Pro Image Preview Generation

### Role
Gemini 3 Pro Image Preview (Nano Banana Pro) generates the final high-quality try-on image based on the prompt from GPT-4o Mini.

### Process

1. **Receives**:
   - Generated prompt from GPT-4o Mini
   - Person image (base64)
   - Clothing image (base64, optional)

2. **Configuration**:
   - **Model**: `gemini-3-pro-image-preview` (or `gemini-2.5-flash-image` for faster generation)
   - **Aspect Ratio**: `4:5` (portrait, default) - Options: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`
   - **Resolution**: `2K` (default) - Options: `1K`, `2K`, `4K` (Pro model only)
   - **Response Modalities**: `['IMAGE']` (image only, no text)

3. **Image Generation**:
   - Processes prompt and reference images
   - Generates photorealistic try-on image
   - Maintains identity preservation
   - Applies clothing accurately

### Instructions to Gemini

**CRITICAL FOCUS AREAS:**
1. **REALISM**: Generate photorealistic images with authentic details, natural textures, realistic fabric behavior
2. **LIGHTING**: Follow lighting instructions exactly - implement source, direction, quality, color temperature with realistic shadows/highlights
3. **TONE**: Maintain consistent color palette, mood, and aesthetic throughout
4. **FACE CONSISTENCY**: Preserve person's identity EXACTLY - all facial features must match reference perfectly
5. **CLOTHING CONSISTENCY**: Match clothing EXACTLY - color, pattern, fabric texture, fit, micro-details must match reference precisely

The prompt sent to Gemini includes:

1. **Scene Description**: Detailed photorealistic scene with camera angles, lighting specifications, environment
2. **Lighting Details**: Source (natural sunlight, window, overhead), direction (side-lighting, backlit), quality (soft/diffused, harsh), color temperature (warm, cool, neutral)
3. **Identity Preservation**: Explicit instructions to preserve ALL facial features exactly (face shape, eyes, nose, mouth, skin tone, hair, expression, age)
4. **Clothing Application**: Detailed instructions for accurate clothing application with micro-details (zippers, buttons, patterns, textures, folds, creases)
5. **Quality Requirements**: Realistic physics, natural fit, authentic appearance, realistic fabric behavior
6. **Tone & Color Palette**: Consistent color scheme and mood throughout

### Example Prompt Structure

```
A photorealistic full-body portrait shot of the person wearing the clothing, standing naturally with a confident pose, set in a modern studio environment with soft, diffused lighting. The scene is illuminated by professional three-point lighting setup, creating a clean, professional atmosphere. Captured with a 85mm portrait lens at f/2.8, emphasizing sharp focus on the subject with natural background blur.

Preserve the person's identity exactly: Maintain the exact facial structure with oval face shape, almond-shaped brown eyes, natural eyebrow arch, medium nose, and medium mouth. [Detailed facial features...]

Apply this clothing accurately: A cotton t-shirt with solid pattern in navy blue color, regular fit type, round neckline, short sleeve length. [Detailed clothing attributes...]

Maintain realistic physics, fabric behavior, and natural fit. The clothing should follow the body's contours naturally, show appropriate fabric drape and movement, create realistic shadows and highlights, and maintain proper proportions.
```

### Configuration Options

**Model Selection**:
- `gemini-2.5-flash-image`: Fast generation, 1024px, up to 3 images
- `gemini-3-pro-image-preview`: Professional quality, up to 4K, up to 14 images (default)

**Aspect Ratios**:
- `4:5` - Portrait (default for try-on)
- `1:1` - Square
- `16:9` - Landscape
- `9:16` - Vertical/Stories

**Resolutions** (Pro model only):
- `1K` - Fast, lower quality
- `2K` - Balanced quality/speed (default)
- `4K` - Highest quality, slower

### Output

Returns base64-encoded image (PNG format) with data URI prefix:
```
data:image/png;base64,<base64_data>
```

---

## Complete Flow

```
1. User uploads person image + clothing image
   ↓
2. GPT-4o analyzes images → extracts features
   ↓
3. GPT-4o Mini receives:
   - Both images (base64)
   - Face features analysis
   - Clothing analysis
   - Reference prompts
   ↓
4. GPT-4o Mini generates intelligent prompt
   ↓
5. Gemini 3 Pro receives:
   - Generated prompt
   - Person image
   - Clothing image
   ↓
6. Gemini generates try-on image
   ↓
7. Image saved to Supabase Storage
   ↓
8. Returned to user
```

## Environment Variables

```env
# OpenAI - For GPT-4o Mini prompt generation
OPENAI_API_KEY="[YOUR_OPENAI_API_KEY]"

# Google Gemini - For image generation
GEMINI_API_KEY="[YOUR_GEMINI_API_KEY]"
GEMINI_IMAGE_MODEL="gemini-3-pro-image-preview"  # Optional, defaults to Pro
```

## Reference Prompts

Reference prompts are stored in `src/lib/prompts/reference-prompts.ts` and serve as training examples for GPT-4o Mini. They include:

- **Identity Preservation**: Examples of detailed facial feature preservation
- **Clothing Application**: Examples of accurate garment application
- **Style Enhancement**: Photorealistic scene descriptions
- **Quality Control**: Physics and realism requirements

## Customization

### Adding Reference Prompts

Edit `src/lib/prompts/reference-prompts.ts` to add new reference prompts:

```typescript
{
  id: 'custom-1',
  category: 'identity-preservation',
  description: 'Your description',
  prompt: 'Your example prompt',
  priority: 10,
}
```

### Adjusting GPT Instructions

Edit `src/lib/prompts/prompt-manager.ts` → `formatReferencePromptsForSystemPrompt()` to modify GPT instructions.

### Changing Gemini Settings

Edit `src/app/api/tryon/route.ts` to change:
- Model: `model: 'gemini-2.5-flash-image'` or `'gemini-3-pro-image-preview'`
- Aspect Ratio: `aspectRatio: '16:9'`
- Resolution: `resolution: '4K'`

## Troubleshooting

### GPT-4o Mini Issues
- Check `OPENAI_API_KEY` is set correctly
- Verify API key has access to GPT-4o Mini
- Check prompt length (max 1500 tokens)

### Gemini Issues
- Check `GEMINI_API_KEY` is set correctly
- Verify API key has access to image generation models
- Check image size limits (Pro model supports up to 14 images)
- Verify aspect ratio and resolution are valid for selected model

### Image Quality Issues
- Increase resolution to `4K` (slower but higher quality)
- Enhance reference prompts with better examples
- Adjust GPT temperature (lower = more consistent, higher = more creative)

