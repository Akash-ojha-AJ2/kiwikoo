# API Diagnostic Report - Exact Code Analysis

## 1. How We're Calling GPT-4o-mini for Face Analysis

### ❌ CURRENT CODE (PROBLEMATIC):
```typescript
// src/lib/openai.ts:101-145
export async function analyzeFaceFeatures(imageBase64: string): Promise<FaceFeatures> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // ⚠️ Using gpt-4o, NOT gpt-4o-mini
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this face image...`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,  // ⚠️ Base64 in data URI
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1200,
  })
  
  const content = response.choices[0]?.message?.content
  // ⚠️ This is where it fails if content is empty
}
```

### ISSUES IDENTIFIED:
1. **Wrong Model**: Using `gpt-4o` instead of `gpt-4o-mini` for analysis
2. **Old API Format**: Using `chat.completions.create()` - might need `responses.create()` for vision
3. **Image Format**: Using `data:image/jpeg;base64,${imageBase64}` (Option C - base64 in data URI)

---

## 2. How We're Sending Images

### CURRENT FORMAT (Option C):
```typescript
{
  type: 'image_url',
  image_url: {
    url: `data:image/jpeg;base64,${imageBase64}`,  // Base64 string in data URI
  },
}
```

### WHERE IT'S USED:
- ✅ Face analysis (line 135-139)
- ✅ Clothing analysis (line 286-289)
- ✅ Prompt generation (line 503-512)

### RECOMMENDATION:
- **Option A** (URL): Better for large images, requires upload first
- **Option B** (Direct base64): Current approach, but format might be wrong
- **Option C** (Current): Base64 in data URI - might not work with new API

---

## 3. Raw API Response Structure

### CURRENT CODE:
```typescript
const content = response.choices[0]?.message?.content
if (!content || content.trim() === '') {
  console.error('Face analysis: No content returned from OpenAI')
  throw new Error('No response from face analysis')
}
```

### WHAT WE NEED TO LOG:
```typescript
// Add this before checking content:
console.log('Full API Response:', JSON.stringify(response, null, 2))
console.log('Response structure:', {
  hasChoices: !!response.choices,
  choicesLength: response.choices?.length,
  firstChoice: response.choices?.[0],
  hasMessage: !!response.choices?.[0]?.message,
  hasContent: !!response.choices?.[0]?.message?.content,
  contentValue: response.choices?.[0]?.message?.content,
  contentType: typeof response.choices?.[0]?.message?.content,
})
```

### EXPECTED RESPONSE FORMAT:
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"faceShape\":\"oval\",\"eyeColor\":\"brown\",...}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "completion_tokens": 500,
    "total_tokens": 1500
  }
}
```

---

## 4. JSON Output Requirement

### YES - We Require JSON:
```typescript
// Face Analysis
response_format: { type: 'json_object' }
// Expected: { faceShape, eyeColor, hairColor, ... }

// Clothing Analysis
response_format: { type: 'json_object' }
// Expected: { garmentType, fabric, pattern, color, ... }

// Prompt Generation
// NO JSON format - expects plain text prompt
```

### CURRENT PROMPT DESIGN:
- Face/Clothing: Explicitly requests JSON with field list
- Prompt Generation: Expects plain text in IDENTITY/BODY/CLOTHING format

---

## 5. Parallelization Status

### ✅ YES - Using Promise.all():
```typescript
// src/app/api/tryon/route.ts:151-173
const [faceFeatures, clothingAnalysis] = await Promise.all([
  analyzeFaceFeatures(normalizedPerson).catch((error) => {
    // Returns default on error
  }),
  normalizedClothing
    ? (async () => {
        const redactedClothing = await redactClothingRefFaces(normalizedClothing)
        const croppedClothing = await autoGarmentCrop(redactedClothing)
        return await analyzeClothingImage(croppedClothing)
      })()
    : Promise.resolve({ /* defaults */ }),
])
```

### POTENTIAL ISSUES:
1. **Concurrency**: Both calls happen simultaneously
2. **Rate Limiting**: Could hit rate limits if many users
3. **Timeout**: One might timeout while other succeeds
4. **Error Handling**: Errors are caught but might mask real issues

### RECOMMENDATION:
- Add retry logic with exponential backoff
- Add rate limit detection
- Add timeout handling
- Consider sequential calls if rate limits are hit

---

## 6. Model Task Assignment

### CURRENT ARCHITECTURE:
```
┌─────────────────────────────────────────┐
│  User Uploads Images                    │
│  - Person Image                         │
│  - Clothing Image                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GPT-4o (NOT mini)                      │
│  - Face Analysis (analyzeFaceFeatures)   │
│  - Clothing Analysis (analyzeClothing)  │
│  Returns: JSON with features            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GPT-4o-mini                            │
│  - Prompt Rewriting (generateIntelligent)│
│  - Preset Selection (if needed)         │
│  Returns: Structured text prompt        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Gemini Flash/Pro                       │
│  - Image Generation (generateTryOn)     │
│  - Face/Body/Clothing Lock              │
│  Returns: Generated image               │
└─────────────────────────────────────────┘
```

### CONFIRMED:
- ✅ GPT-4o → Face & Clothing feature extraction
- ✅ GPT-4o-mini → Prompt rewriting (brain)
- ✅ Gemini Flash/Pro → Image generation (muscle)

---

## 7. Should We Refactor to New Responses API?

### RECOMMENDATION: **YES** - But with caution

### REASONS:
1. **Current API might be deprecated** for vision tasks
2. **New API might fix empty content issues**
3. **Better error handling** in new API
4. **More reliable** for multimodal tasks

### WHAT NEEDS REFACTORING:

#### A. Face Analysis
```typescript
// OLD (Current)
openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...]
})

// NEW (Recommended)
openai.responses.create({
  model: 'gpt-4o-mini',  // Use mini for analysis
  input: [
    {
      type: 'input_text',
      text: 'Analyze this face...'
    },
    {
      type: 'input_image',
      image: imageBase64  // Direct base64, no data URI
    }
  ],
  response_format: { type: 'json_object' }
})
```

#### B. Clothing Analysis
```typescript
// Same refactoring as face analysis
```

#### C. Prompt Generation
```typescript
// OLD (Current)
openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...]
})

// NEW (If needed)
openai.responses.create({
  model: 'gpt-4o-mini',
  input: [
    { type: 'input_text', text: systemPrompt },
    { type: 'input_text', text: userPrompt },
    { type: 'input_image', image: personImageBase64 },
    { type: 'input_image', image: clothingImageBase64 }
  ]
})
```

---

## 8. Immediate Fixes Needed

### Priority 1: Add Response Logging
```typescript
// Add to analyzeFaceFeatures() before line 147
console.log('=== FACE ANALYSIS API RESPONSE ===')
console.log(JSON.stringify(response, null, 2))
console.log('Response choices:', response.choices)
console.log('First choice:', response.choices?.[0])
console.log('Message:', response.choices?.[0]?.message)
console.log('Content:', response.choices?.[0]?.message?.content)
console.log('Content type:', typeof response.choices?.[0]?.message?.content)
```

### Priority 2: Fix Image Format
```typescript
// Option 1: Try direct base64 (Option B)
{
  type: 'image_url',
  image_url: {
    url: imageBase64  // Without data URI prefix
  }
}

// Option 2: Use new API format
{
  type: 'input_image',
  image: imageBase64  // Direct base64 string
}
```

### Priority 3: Test with gpt-4o-mini
```typescript
// Change from gpt-4o to gpt-4o-mini for analysis
model: 'gpt-4o-mini',  // Instead of 'gpt-4o'
```

---

## 9. Testing Checklist

- [ ] Log full API response structure
- [ ] Test with direct base64 (no data URI)
- [ ] Test with gpt-4o-mini instead of gpt-4o
- [ ] Test new Responses API format
- [ ] Check rate limits on parallel calls
- [ ] Verify JSON parsing works
- [ ] Test error handling paths

---

## 10. Next Steps

1. **Add comprehensive logging** to see actual API responses
2. **Test new Responses API** format
3. **Fix image format** (try Option B first)
4. **Switch to gpt-4o-mini** for analysis (cheaper, might work better)
5. **Add retry logic** for failed API calls
6. **Monitor rate limits** on parallel calls

