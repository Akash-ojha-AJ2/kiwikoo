# Try-On Queue + Worker Architecture

## Why This Redesign Works

- Serverless API routes are request-scoped and bursty; they cannot safely coordinate global Gemini concurrency across simultaneous users.
- Moving generation to a dedicated worker separates request handling from AI execution, so HTTP returns immediately and user traffic no longer creates Gemini call storms.
- A shared Gemini executor now applies global per-process limits and status-code-based 429 backoff for all try-on Gemini calls.
- Queue retries with delayed backoff absorb provider cooldown windows without instantly failing user jobs.

## Runtime Topology

- `Next.js API route`:
  - Auth + request validation
  - Writes `generation_jobs` row (`pending`)
  - Enqueues Redis job
  - Returns `202 { jobId, pollUrl }`
- `Try-on worker`:
  - Pops queued jobs
  - Marks DB row `processing`
  - Runs hybrid try-on pipeline
  - Updates DB row to `completed` or `failed`
- `Frontend`:
  - Calls `/api/tryon`
  - Polls `/api/tryon/jobs/:id`
  - Renders image when status becomes `completed`

## Folder Structure

```text
src/
  app/
    api/
      tryon/
        route.ts                    # enqueue-only endpoint (no AI calls)
        jobs/
          [id]/
            route.ts                # polling endpoint
  lib/
    gemini/
      executor.ts                   # limiter + 429 retry wrapper
    queue/
      redis.ts                      # Upstash/Redis connection singleton
      tryon-queue.ts                # BullMQ queue + enqueue helper
    tryon/
      garment-extractor.ts          # now uses gemini executor
      face-coordinates.ts           # now uses gemini executor
    nanobanana.ts                   # now uses gemini executor for generateContent
  workers/
    tryon-worker.ts                 # background consumer
```

## Global Gemini Controls

Configured in `src/lib/gemini/executor.ts`:

- `gemini-3-pro-image-preview`:
  - `maxConcurrent: 2`
  - `minTime: 500ms`
- Flash models (`gemini-2.5-flash`, `gemini-2.5-flash-image`):
  - `maxConcurrent: 4`
  - `minTime: 200ms`

429 handling:

- Detects real status code from exception metadata.
- Retries in-process with exponential backoff:
  - 500ms → 1000ms → 2000ms (+ jitter)
- If still 429 after 3 attempts:
  - throws `GeminiRateLimitError`
  - worker requeues via BullMQ delayed retry (configured exponential ~8s base)

## Queue Setup (Upstash Compatible)

Required env vars:

- `UPSTASH_REDIS_URL` (preferred, `rediss://...`) or `REDIS_URL`
- existing Supabase/OpenAI/Gemini env vars

NPM scripts:

- `npm run worker:tryon` — starts long-running try-on worker process

## API Contract

### Submit Job

`POST /api/tryon`

Returns:

```json
{
  "accepted": true,
  "jobId": "uuid",
  "status": "pending",
  "pollUrl": "/api/tryon/jobs/uuid"
}
```

### Poll Job

`GET /api/tryon/jobs/:id`

Returns:

```json
{
  "jobId": "uuid",
  "status": "pending | processing | completed | failed",
  "imageUrl": "https://...",
  "base64Image": "...optional...",
  "error": "optional"
}
```

## Frontend Polling Example

Current implementation is in `src/app/influencer/try-on/page.tsx`.

Flow:

1. Submit try-on form to `/api/tryon`
2. Read `jobId`
3. Poll `/api/tryon/jobs/:id` every 2s
4. Stop on `completed` or `failed`

