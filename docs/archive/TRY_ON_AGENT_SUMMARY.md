# Quick Summary for Try-On Improvement Agent

## 🎯 Your Mission
Improve ONLY the virtual try-on AI pipeline. Do NOT touch storage, auth, database, or other systems.

## ✅ Files You CAN Modify
1. `src/app/api/tryon/route.ts` - Main API (generation logic only, NOT storage)
2. `src/lib/openai.ts` - ONLY these 3 functions:
   - `analyzeFaceFeatures()`
   - `analyzeClothingImage()`
   - `generateIntelligentTryOnPrompt()`
3. `src/lib/nanobanana.ts` - Gemini image generation
4. `src/lib/prompts/reference-prompts.ts` - Reference examples
5. `src/lib/prompts/prompt-manager.ts` - Prompt utilities
6. `src/lib/prompts/try-on-presets.ts` - Style presets
7. `src/lib/image-processing.ts` - Image preprocessing
8. `src/app/influencer/try-on/page.tsx` - Frontend UI (UI only, NOT API calls structure)

## 🚫 Files You MUST NOT Touch
- `src/lib/storage.ts` - OFF LIMITS
- `src/lib/auth.ts` - OFF LIMITS
- `src/lib/prisma.ts` - OFF LIMITS
- Any other API routes or components
- Database schema

## 🎯 Focus Areas
1. **Prompt Quality**: Make GPT-4o Mini generate better, more detailed prompts
2. **Image Analysis**: Improve face and clothing feature extraction
3. **Gemini Integration**: Optimize image generation parameters and handling
4. **Consistency**: Better identity and clothing preservation
5. **Error Handling**: Graceful degradation and better user feedback

## 🔧 Critical Rules
- NEVER modify `saveUpload()` calls or storage functions
- NEVER modify authentication checks
- NEVER modify database queries or schema
- ONLY improve the AI generation pipeline
- Maintain API response format: `{ jobId, imageUrl }`

## 📋 Current Flow
```
User Upload → Face Analysis (GPT-4o) → Clothing Analysis (GPT-4o) 
→ Intelligent Prompt (GPT-4o Mini) → Image Generation (Gemini 3 Pro) 
→ Storage → Return
```

**Your job**: Make the AI parts smarter and more accurate. Infrastructure is working - don't break it!

See `TRY_ON_IMPROVEMENT_PROMPT.md` for full detailed instructions.

