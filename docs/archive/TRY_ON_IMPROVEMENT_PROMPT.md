# Try-On Pipeline Improvement Instructions

## 🎯 MISSION
Improve the virtual try-on AI pipeline to generate higher quality, more consistent, and more realistic try-on images. Focus ONLY on the try-on generation pipeline - do NOT modify storage, authentication, database schemas, or any other system components.

---

## 📋 SYSTEM OVERVIEW

### Current Architecture
The try-on system uses a two-stage AI pipeline:

1. **GPT-4o Mini (Brain)**: Analyzes images and generates intelligent, detailed prompts
2. **Gemini 3 Pro Image Preview (Generator)**: Generates photorealistic try-on images based on prompts

### Current Flow
```
User Uploads Images → API Route → Face Analysis (GPT-4o) → Clothing Analysis (GPT-4o) 
→ Intelligent Prompt Generation (GPT-4o Mini) → Image Generation (Gemini 3 Pro) 
→ Storage Upload → Return Result
```

---

## ✅ FILES YOU CAN MODIFY (Try-On Pipeline Only)

### Core Try-On Files
1. **`src/app/api/tryon/route.ts`**
   - Main API endpoint for try-on generation
   - Orchestrates the entire pipeline
   - Handles image processing, AI calls, and job management
   - ⚠️ **DO NOT** modify storage upload calls (line ~226) - only improve the generation logic

2. **`src/lib/openai.ts`**
   - **ONLY** these functions:
     - `analyzeFaceFeatures()` - Face feature extraction
     - `analyzeClothingImage()` - Clothing analysis
     - `generateIntelligentTryOnPrompt()` - Intelligent prompt generation (MAIN FOCUS)
   - ⚠️ **DO NOT** modify other functions in this file (collaboration proposals, ad generation, etc.)

3. **`src/lib/nanobanana.ts`**
   - Gemini image generation integration
   - `generateTryOn()` function
   - Model configuration and response parsing
   - ⚠️ **DO NOT** change the storage or API key handling

4. **`src/lib/prompts/reference-prompts.ts`**
   - Reference prompts for GPT training
   - Add/improve example prompts
   - Categorize and prioritize prompts

5. **`src/lib/prompts/prompt-manager.ts`**
   - Prompt formatting and management utilities
   - System prompt construction
   - Prompt validation

6. **`src/lib/prompts/try-on-presets.ts`**
   - Style presets for different try-on scenarios
   - Preset definitions and instructions

7. **`src/lib/image-processing.ts`**
   - Image normalization, face redaction, garment cropping
   - Pre-processing utilities for try-on pipeline

8. **`src/app/influencer/try-on/page.tsx`**
   - Frontend UI for try-on page
   - Image upload, preset selection, result display
   - ⚠️ **DO NOT** modify storage-related code or API calls structure

---

## 🚫 FILES YOU MUST NOT MODIFY

### Storage & Infrastructure (OFF-LIMITS)
- **`src/lib/storage.ts`** - DO NOT TOUCH
- **`src/lib/auth.ts`** - DO NOT TOUCH
- **`src/lib/prisma.ts`** - DO NOT TOUCH
- **`src/lib/rate-limit.ts`** - DO NOT TOUCH
- **`src/lib/validation.ts`** - Only modify `tryOnSchema` if needed for new parameters

### Other Systems (OFF-LIMITS)
- **`src/lib/openai.ts`** - Only modify the 3 try-on functions listed above
- **`src/app/api/tryon/route.ts`** - Only modify generation logic, NOT storage/auth
- Any file in `src/app/brand/`, `src/app/influencer/dashboard/`, `src/components/` (except try-on UI)
- Database schema files (`prisma/schema.prisma`)
- Environment configuration files

---

## 🎯 IMPROVEMENT AREAS (Focus Here)

### 1. Prompt Quality & Intelligence
- **Current**: GPT-4o Mini generates prompts using reference examples
- **Improve**:
  - Better prompt structure and formatting
  - More detailed scene descriptions
  - Enhanced identity preservation instructions
  - Better clothing consistency directives
  - Improved lighting and tone specifications
  - Add more reference prompts based on successful generations

### 2. Image Analysis Quality
- **Current**: Separate face and clothing analysis
- **Improve**:
  - More detailed feature extraction
  - Better clothing attribute detection (fabric type, fit, patterns)
  - Context-aware analysis (understanding relationships between person and clothing)
  - Better error handling for edge cases

### 3. Gemini Image Generation
- **Current**: Basic prompt passing to Gemini
- **Improve**:
  - Better prompt formatting for Gemini
  - Optimize model parameters (temperature, aspect ratio, resolution)
  - Better handling of multi-image inputs
  - Improved response parsing and error handling
  - Add support for iterative refinement if needed

### 4. Consistency & Quality
- **Current**: Basic consistency checks
- **Improve**:
  - Face consistency validation
  - Clothing accuracy validation
  - Lighting consistency
  - Color palette consistency
  - Realistic physics and fabric behavior

### 5. Error Handling & Edge Cases
- **Current**: Basic error handling
- **Improve**:
  - Better error messages for users
  - Graceful degradation when AI fails
  - Handling of low-quality input images
  - Handling of unusual clothing types
  - Better timeout and retry logic

### 6. Performance Optimization
- **Current**: Sequential processing
- **Improve**:
  - Parallel processing where possible
  - Caching of analysis results
  - Optimized prompt lengths
  - Faster image processing

---

## 🔧 TECHNICAL CONSTRAINTS

### API Keys & Configuration
- **DO NOT** modify how API keys are loaded or validated
- **DO NOT** change environment variable names
- Use existing `OPENAI_API_KEY` and `GEMINI_API_KEY`

### Storage Integration
- **DO NOT** modify `saveUpload()` calls
- **DO NOT** change storage bucket names or paths
- The storage upload at line ~226 in `route.ts` must remain unchanged

### Database Integration
- **DO NOT** modify Prisma queries or schema
- **DO NOT** change `GenerationJob` model usage
- Only read/write job status and metadata as currently done

### Authentication
- **DO NOT** modify authentication checks
- The auth check at the start of `route.ts` must remain

### API Response Format
- **DO NOT** change the API response structure
- Must return: `{ jobId: string, imageUrl: string }` or error format
- Maintain backward compatibility

---

## 📝 SPECIFIC IMPROVEMENT TASKS

### Priority 1: Prompt Engineering
1. Enhance `generateIntelligentTryOnPrompt()` in `src/lib/openai.ts`
   - Improve system prompt with better instructions
   - Add more detailed identity preservation directives
   - Enhance clothing consistency instructions
   - Better scene and lighting descriptions
   - Add photography terminology and technical details

2. Expand `reference-prompts.ts`
   - Add more high-quality example prompts
   - Categorize by clothing type, style, and scenario
   - Add edge case examples

3. Improve `prompt-manager.ts`
   - Better prompt formatting
   - Enhanced validation
   - Dynamic prompt construction based on inputs

### Priority 2: Image Analysis
1. Enhance `analyzeFaceFeatures()` in `src/lib/openai.ts`
   - More detailed feature extraction
   - Better handling of edge cases (glasses, accessories, unusual angles)
   - Improved accuracy for skin tone, hair texture, etc.

2. Enhance `analyzeClothingImage()` in `src/lib/openai.ts`
   - Better fabric type detection
   - Pattern and texture analysis
   - Fit and style detection
   - Color accuracy

### Priority 3: Gemini Integration
1. Improve `generateTryOn()` in `src/lib/nanobanana.ts`
   - Better prompt formatting for Gemini
   - Optimize model parameters
   - Better error handling
   - Improved response parsing
   - Add support for iterative refinement

### Priority 4: Pipeline Optimization
1. Optimize `route.ts` processing flow
   - Parallel processing where possible
   - Better error handling
   - Improved logging
   - Better user feedback

---

## 🧪 TESTING REQUIREMENTS

### Test Cases to Verify
1. **Face Consistency**: Generated image preserves exact facial features
2. **Clothing Accuracy**: Clothing matches reference in color, pattern, fabric
3. **Realistic Physics**: Natural folds, creases, and fabric behavior
4. **Lighting Quality**: Realistic shadows and highlights
5. **Style Consistency**: Tone and color palette remain consistent
6. **Edge Cases**: Glasses, accessories, unusual clothing, low-quality inputs

### Success Criteria
- Generated images maintain 100% facial identity match
- Clothing accuracy > 95% (color, pattern, fabric match)
- Realistic physics and natural appearance
- No artifacts or distortions
- Consistent lighting and tone

---

## 📚 KEY CONCEPTS TO UNDERSTAND

### Identity Preservation
- Face shape, eyes, nose, mouth must match exactly
- Skin tone, hair color/texture/style must match exactly
- Expression and age range must match
- No beautification or stylization of face

### Clothing Consistency
- Color must match exactly (no shifts or variations)
- Patterns must match exactly (stripes, prints, logos)
- Fabric texture must match (silk, cotton, denim, etc.)
- Fit type must match (loose, fitted, oversized, etc.)

### Realism Requirements
- Photorealistic quality (not artistic or stylized)
- Natural fabric behavior (folds, creases, drape)
- Realistic lighting (shadows, highlights, reflections)
- Natural physics (gravity, movement, fit)

### Prompt Engineering
- Use descriptive scenes, not keyword lists
- Include photography terminology
- Specify micro-details (fabric folds, zipper details, pattern specifics)
- Describe lighting setup in detail
- Include camera angles and technical specs

---

## 🚨 CRITICAL RULES

1. **NEVER** modify storage functions (`saveUpload`, `getUploadUrl`, `deleteUpload`)
2. **NEVER** modify authentication or authorization logic
3. **NEVER** modify database schema or Prisma client
4. **NEVER** change API response format structure
5. **NEVER** modify environment variable handling
6. **ONLY** work within the try-on pipeline files listed above
7. **ALWAYS** maintain backward compatibility
8. **ALWAYS** test that storage uploads still work after changes
9. **ALWAYS** verify authentication still works after changes

---

## 📖 REFERENCE DOCUMENTATION

### Current Implementation Files
- `src/app/api/tryon/route.ts` - Main orchestration
- `src/lib/openai.ts` - GPT-4o Mini integration (lines 98-351)
- `src/lib/nanobanana.ts` - Gemini integration
- `src/lib/prompts/reference-prompts.ts` - Reference examples
- `src/lib/prompts/prompt-manager.ts` - Prompt utilities
- `src/lib/prompts/try-on-presets.ts` - Style presets

### Key Functions to Understand
- `analyzeFaceFeatures(imageBase64: string): Promise<FaceFeatures>`
- `analyzeClothingImage(imageBase64: string): Promise<ClothingAnalysis>`
- `generateIntelligentTryOnPrompt(...): Promise<string>`
- `generateTryOn(options: TryOnOptions): Promise<string>`

---

## 🎯 YOUR GOAL

Improve the try-on pipeline to generate:
- **More realistic** images with better physics and fabric behavior
- **More consistent** results with exact identity and clothing preservation
- **Higher quality** outputs with better lighting, tone, and details
- **Better handling** of edge cases and error scenarios
- **Faster processing** through optimization

**Remember**: You are ONLY improving the AI generation pipeline. Storage, auth, database, and other systems are working correctly and must not be modified.

---

## ✅ CHECKLIST BEFORE SUBMITTING

- [ ] Only modified files in the "FILES YOU CAN MODIFY" section
- [ ] Did NOT modify any storage functions
- [ ] Did NOT modify authentication logic
- [ ] Did NOT modify database schema or queries
- [ ] Maintained API response format
- [ ] Tested that try-on generation still works
- [ ] Tested that storage uploads still work
- [ ] Tested that authentication still works
- [ ] Added comments explaining improvements
- [ ] Improved error handling and user feedback
- [ ] Enhanced prompt quality and intelligence
- [ ] Optimized image analysis accuracy
- [ ] Improved Gemini integration

---

**Good luck! Focus on making the AI pipeline smarter, more accurate, and more consistent. The infrastructure is solid - just improve the intelligence layer.**

