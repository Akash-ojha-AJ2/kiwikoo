# Image Generation Architecture Analysis

**Purpose:** Technical analysis of the current try-on image generation flow before redesigning for rate-limit resilience. No solutions—analysis only.

---

## SECTION 1 — Current Execution Model

### When a user clicks "Generate Try-On", does the API route:

**A) Call Gemini directly inside the HTTP request?**  
**Yes.** The API route (`/api/tryon/route.ts`) runs the full pipeline inside the same HTTP request. It does not delegate to a worker or return immediately with a job ID.

**B) Create a job record first?**  
**Yes.** Before any AI calls, the route inserts a row into `generation_jobs` with `status: 'pending'`. The job is updated to `completed` or `failed` after the pipeline finishes. The job is for persistence/audit only—the HTTP response is still blocked until generation completes.

**C) Spawn parallel promises?**  
**Yes, in two places:**
1. **Stage 1 (Nano Banana Pro renderer):** `Promise.all([ getStrictSceneConfig(...), detectFaceCoordinates(personImage), buildForensicFaceAnchor(...) ])` — scene intel, face detection, and forensic anchor run in parallel.
2. **After first image generation:** `Promise.all([ detectFaceCoordinates(generatedImage), assessSceneRealism(...) ])` — face drift check and scene quality run in parallel. Same again after retry if triggered.

**D) Something else?**  
The route also: normalizes images, resolves garment (with optional DB cache), then runs the hybrid pipeline. No server-sent events, no polling, no background worker.

---

### Are we generating:

- **Single image.** One try-on image per request. The response includes `variants: [{ imageUrl, base64Image, variantId: 0, label: 'Nano Banana Pro' }]`—a single variant wrapped in an array for API consistency. No 3 variants in parallel.

---

### How many total Gemini API calls for ONE try-on request?

Breakdown by stage (assuming **no** garment cache hit, **no** quality retry):

| Stage | Component | Model | Count |
|-------|-----------|--------|-------|
| **Garment analysis** | Garment description | GPT (OpenAI) | 1 |
| **Garment extraction** | Extract clean garment from reference | **Gemini** `gemini-2.5-flash-image` | 1 |
| **Scene intelligence** | Scene config / preset refinement | GPT (OpenAI) | 1 or 2* |
| **Face detection (person)** | Face bbox for spatial lock | **Gemini** `gemini-2.5-flash` | 1 |
| **Forensic anchor** | Face/eyes/body text anchor | GPT (OpenAI) | 1 |
| **Image generation** | Main try-on image | **Gemini** `gemini-3-pro-image-preview` | 1 |
| **Validation** | Face bbox on generated image | **Gemini** `gemini-2.5-flash` | 1 |
| **Validation** | Scene realism assessment | GPT (OpenAI) `gpt-4o-mini` | 1 |
| **Retry** | (If face drift or scene low) | **Gemini** `gemini-3-pro-image-preview` | 0 or 1 |
| **Retry validation** | Face + scene again | **Gemini** + GPT | 0 or 2 |

\* Scene: If user selected a preset, `getStrictSceneConfig` calls `buildVisionRealismGuidance` → 1 GPT. If no preset, one GPT call for JSON scene config. So scene = **1 GPT** in both cases.

**Totals (no retry):**

- **Gemini:** 1 (garment extract) + 1 (face detect person) + 1 (main image) + 1 (face detect generated) = **4**
- **GPT (OpenAI):** 1 (garment) + 1 (scene) + 1 (forensic) + 1 (scene assessment) = **4**

**Totals (with one quality retry):**

- **Gemini:** 4 + 1 (retry image) + 1 (face detect retry) = **6**
- **GPT:** 4 + 1 (scene assessment retry) = **5**

---

### Are these calls sequential or parallel?

- **Sequential at top level:** Garment resolution (GPT + Gemini) → then Nano Banana Pro renderer.
- **Inside renderer Stage 1:** Scene config, face detect (person), forensic anchor → **parallel** (3 concurrent: 1 GPT or 2 GPT + 1 Gemini).
- **Then:** One Gemini image call (sequential after Stage 1).
- **Then:** Face detect (generated) + scene assessment → **parallel** (1 Gemini + 1 GPT).
- **If retry:** One more Gemini image, then again face detect + scene assessment in parallel.

So: **multiple waves of parallel calls**, but no global cap across the pipeline—each wave can fire 2–3 requests at once per try-on.

---

### Is there any concurrency limiter (Bottleneck, p-limit, etc.)?

**No.** There is no library-based throttle (Bottleneck, p-limit, etc.) on Gemini or OpenAI calls. Concurrency is only constrained by:

1. **Per-user in-flight guard** (`traffic-guard.ts`): at most one try-on per user at a time (and one ad per user). Second request gets 429 with “A try-on is already in progress.”
2. **Middleware rate limit** (`rate-limit-middleware.ts`): per-minute and per-hour caps (e.g. 6/min, 18/hour user, 24/hour IP for tryon). No cap on *concurrent* Gemini calls *within* a single request.

---

## SECTION 2 — Rate Limit Awareness

### Are we handling HTTP 429 errors explicitly?

**Partially.**

- **Middleware:** Returns 429 when per-minute or per-hour limit is exceeded, with `Retry-After` and `retryAfterSeconds` in the body. Client can show “wait Xs.”
- **API route:** Does not parse Gemini’s response for 429. If Gemini returns 429, the `@google/genai` client throws; the route’s catch turns timeout/quota/rate-limit-like messages into a **503** with `retryAfterSeconds: 60`, not 429. So **429 from Gemini is not explicitly detected**; it’s treated as a generic error and only mapped to 503 when the message contains “timed out”, “timeout”, “quota”, or “rate limit”.

**Conclusion:** 429 from our own middleware: yes. 429 from Gemini API: not explicitly; we rely on error message string matching to return 503.

---

### If yes, how? / If no, confirm.

- **Our 429:** Middleware returns 429 with `Retry-After` and JSON `retryAfterSeconds`. Try-on page treats 429/503 and timeout messages similarly and shows a countdown.
- **Gemini 429:** No structured handling. `nanobanana.ts` only checks `error.message.includes('quota')` and throws a generic message. No retry, no backoff, no parsing of status code.

---

### Is there exponential backoff implemented?

**No.** No retry-with-backoff for Gemini or OpenAI calls. The only “retry” is the **single quality retry** inside the renderer (one more image generation if face drift or scene quality is low), which is a second immediate call, not backoff.

---

### Are we tracking:

| Metric | Tracked? | Where |
|--------|----------|--------|
| **Requests per minute** | Yes (per user + per IP) | Middleware in-memory store; tryon bucket e.g. 6/min. |
| **Tokens per minute** | No | Not tracked anywhere. |
| **In-flight request count** | Per-user only | `traffic-guard.ts`: one try-on and one ad per user. No global in-flight cap across users. |

---

### Do we have a global request throttle per server instance?

**No.** Throttling is:

- Per user (in-flight: 1 try-on, 1 ad; middleware: per-minute/per-hour by user).
- Per IP (middleware: per-minute/per-hour by IP).

There is no process-wide or instance-wide limit such as “max N Gemini calls across all users.” Under 10 concurrent users, each can trigger up to 4–6 Gemini calls in a short window (plus parallel GPT), so **10 users → up to 40–60 Gemini calls in a burst** (and more with retries).

---

## SECTION 3 — Infrastructure

### Where is this hosted?

**Assumed Vercel serverless** (Next.js app with `maxDuration = 60` on try-on and ads routes, typical for Vercel Pro). No explicit “Vercel” in code; structure is standard Next.js API routes.

- Not a dedicated VPS, Docker, or GCP Compute in the codebase.
- Deployment target is not stated in repo; architecture is serverless-friendly.

---

### Is the generation happening inside:

- **API route:** **Yes.** All generation (garment resolution, scene intel, face detection, forensic anchor, image generation, validation, retry) runs inside `POST /api/tryon` (and similarly for ads in their route).
- **Background worker:** No.
- **Cron:** No.
- **Edge function:** No. Standard Node serverless (Next.js API route).

---

### Can this environment run a persistent worker process (e.g. Redis + BullMQ)?

**Not in the current setup.** Vercel serverless (and typical Next.js serverless) is stateless and short-lived; no long-running process. You could add:

- **Vercel:** No persistent worker on Vercel; you’d need an external worker (e.g. Railway, Render, Fly.io) + Redis/BullMQ and have the API route enqueue jobs and return job IDs.
- **Redis + BullMQ:** Only if you introduce an external worker and Redis (e.g. Upstash Redis on Vercel + external worker consuming the queue). Not present today.

---

## SECTION 4 — Scaling Pressure

### If 10 users click Generate simultaneously:

- **In-flight guard:** Each user gets one “slot”; the 10 requests all pass the in-flight check (10 different users).
- **Middleware:** All 10 can pass per-minute limit (e.g. 6/min per user, first request each).
- **Pipeline:** Each request runs independently. So:
  - **10 × Stage 1 (parallel):** 10 × (1 GPT scene + 1 Gemini face + 1 GPT forensic) → **10 Gemini + 20 GPT** in one wave (roughly).
  - Then **10 × main image:** 10 Gemini calls.
  - Then **10 × validation:** 10 Gemini + 10 GPT in parallel.
  - **Total Gemini in a short burst:** on the order of **10×4 = 40** (no retries) or **10×6 = 60** (if all retry).

So: **many Gemini calls fire in a short window**—not batched, **burst sent** (each request runs its own pipeline as fast as the runtimes schedule them).

---

### What is the timeout limit of our serverless function?

**60 seconds.** `export const maxDuration = 60` in both `/api/tryon/route.ts` and `/api/ads/generate/route.ts`. After 60s, the platform will terminate the request (e.g. 504 or timeout error). Long pipelines (garment + scene + face + image + validation + retry) can approach this under load or slow Gemini responses.

---

### Are we blocking the HTTP response until generation completes?

**Yes.** The route `await runHybridTryOnPipeline(...)` and only then saves the image, updates the job, and returns JSON. The client keeps the connection open for the full duration (up to 60s). No streaming, no job polling.

---

## SECTION 5 — Cost & Model Usage

### Which model is currently used?

| Purpose | Model |
|--------|--------|
| Garment extraction | **gemini-2.5-flash-image** |
| Face detection (person + generated) | **gemini-2.5-flash** (vision, JSON) |
| Main try-on image | **gemini-3-pro-image-preview** (Nano Banana Pro) |

So: **both** Gemini 2.5 Flash (image + vision) and **Gemini 3 Pro Image** (preview) are used in the same try-on.

---

### Are we generating 3 variants automatically by default?

**No.** One image per request. The response shape has a `variants` array with one element for API consistency.

---

### Can we reduce to 1 image without breaking UI logic?

**Already 1 image.** No change needed for “single image”; the only way to reduce Gemini calls is to remove or cache stages (e.g. garment extraction cache already exists; scene/face/validation could be reduced or simplified).

---

## SECTION 6 — Simplification Possibility

### If we remove:

- **Multi-variant generation:** Already not used; no change in call count.
- **Scene analysis duplication:** Currently one scene GPT path (preset or free-form). No duplicate scene call; could drop scene GPT and use preset text only → **−1 GPT** per try-on.
- **Redundant validation calls:** Dropping post-generation face detect + scene assessment (and thus the quality retry) would remove: 1 Gemini + 1 GPT after first image, and optionally 1 Gemini + 1 GPT on retry. So **−2 Gemini and −1 or −2 GPT** per request (when retry would have run, −2 GPT).

---

### How many Gemini calls remain per generation (minimal pipeline)?

**Current (no retry):** 4 Gemini (garment, face×2, image).  
**If we remove validation and retry:** 3 Gemini (garment, face person, image).  
**If we also skip face detection for spatial lock:** 2 Gemini (garment, image)—face lock would rely only on forensic text + model behavior.

---

### Minimal pipeline for: face lock, garment swap, preset background

**Without overengineering:**

1. **Garment:** One clean garment image (Gemini or cache). Optional: skip GPT garment analysis and use a fixed “garment from reference” description → **1 Gemini** (or 0 if cached).
2. **Scene:** No GPT. Use preset ID → deterministic preset text (anchor zone, lighting, avoid) from static config. **0 API calls.**
3. **Face/identity:** Either keep one **GPT** forensic anchor (face/eyes/body text) or drop it and use only in-prompt “preserve face from Image 1.” Optional: **1 Gemini** face bbox for spatial lock, or drop for minimal. So **0–1 GPT, 0–1 Gemini** for identity.
4. **Image:** One **Gemini** (gemini-3-pro-image-preview) call with person + garment + prompt.

**Minimal:** 1 Gemini (image) + 0 GPT if we use cached garment, no scene GPT, and no forensic/face API. That would be “preset text + person + garment + short prompt” only.  
**Realistic minimal with face lock and garment swap:** 1 garment Gemini (or cache) + 1 forensic GPT + 1 image Gemini = **2 Gemini + 1 GPT**, and optionally +1 Gemini for face bbox.

---

## Proposals (After Analysis)

### 1. Minimal stable architecture

- **Single path:** Garment (1 Gemini or cache) → prompt build (preset only, no scene GPT) → 1 Gemini image. Optional: 1 GPT forensic + 1 Gemini face bbox.
- **No post-generation validation,** no quality retry → no extra Gemini/GPT.
- **In-flight guard kept;** middleware rate limit kept. No queue.
- **Result:** Predictable 1–2 Gemini + 0–1 GPT per request; no burst from validation/retry.

### 2. Scalable architecture

- **Queue layer:** API route enqueues a job (e.g. Redis + BullMQ or Vercel-friendly queue), returns `jobId` immediately. Worker (separate process or serverless consumer) runs the pipeline and updates job status; client polls or uses SSE/webhook.
- **Single consumer (or N workers)** with a **global concurrency cap** (e.g. max 2–3 Gemini image generations at a time across all users). Garment extraction and scene/face can be parallel per job but total Gemini calls throttled (e.g. Bottleneck/p-limit at worker level).
- **Explicit 429 handling** for Gemini: catch HTTP 429, apply exponential backoff, retry with jitter; surface “rate limited, retry in Xs” to user.
- **Result:** Burst traffic is queued; Gemini sees a controlled request rate; no 60s timeout on the HTTP request (client waits on job, not on connection).

### 3. Exact bottleneck in the current system

1. **No global throttle on Gemini:** Many users → many parallel pipelines → burst of 4–6 Gemini calls per user. Gemini’s rate limit is hit; we don’t back off or queue.
2. **Blocking HTTP:** Long pipeline (many sequential and parallel steps) runs inside one request; 60s limit and user perception of “timeout” when the provider slows or returns 429.
3. **429 from Gemini not handled:** We don’t parse status; we only map message substrings to 503. No retry-with-backoff, so every rate-limit from Gemini looks like a hard failure.
4. **Multiple Gemini models in one request:** Flash (garment, face×2) + Pro (image), and optionally retry Pro. All count against quota/limits together; burst is larger than “one image” suggests.
5. **Validation and retry double the cost:** When we retry, we add 1–2 more Gemini + 1 GPT. Under load, more retries → more calls → worse rate limiting.

---

**Document version:** 1.0 (analysis only; no implementation changes).
