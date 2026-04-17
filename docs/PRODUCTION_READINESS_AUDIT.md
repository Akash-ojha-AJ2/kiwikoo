# Tria Production Readiness — Technical Audit

**Date:** 2025  
**Scope:** Full codebase (Tria Next.js app, try-on pipeline, API, DB, queue)  
**Verdict:** See Section 8.

---

## SECTION 1: PROJECT STRUCTURE

### 1.1 Full folder tree (excluding node_modules, .next, dist, build, .git)

```
Tria/
  .cursor/
  database/
    migrations/          # SQL migrations (brand, tryon, collaborations, etc.)
    scripts/             # One-off SQL scripts
  docs/
  prisma/
    migrations/
  public/
    assests/             # TYPO: duplicate of assets
    assets/
    bannervideo/
    mascot/
    *.svg, mascot.png
  scripts/
  src/
    app/
      (auth)/ login, register
      (influencer)/ layout
      about, admin/, ads/, auth/, brand/, campaigns/, complete-profile, contact
      dashboard, favorites, forgot-password, help, inbox
      influencer/ analytics, collaborations, dashboard, generations, pending, try-on
      l/[linkCode]/      # Link redirect
      marketplace/, onboarding/, privacy, products, profile
      reset-password, settings/, signup/, terms
      api/               # 60+ route.ts handlers (see 2b)
      layout.tsx, page.tsx, error.tsx, global-error.tsx, not-found.tsx
    components/
      brand/, brutal/ (onboarding), campaigns/, collaborations/
      influencer/, marketplace/, product/, providers/, transitions/, tryon/, ui/
      Footer, Header, Hero, image-viewer, Locations, Masonry, NewsGrid
      ProductSwitcher, ProfileCompletionGate, ValuesScroll
    lib/
      ads/, campaigns/, config/, email/, gemini/, hooks/, identity/, influencer/
      links/, prompts/, queue/, react-query/, security/, tryon/, utils/
      workers/
    scripts/             # check-legacy-data, verify-lookup-logic, simple-check
  proxy.ts
  next.config.ts, package.json, tsconfig.json, postcss.config.mjs, components.json
  .env*, .eslintrc.json, .gitignore
```

### 1.2 Unused / duplicate / experimental

| Finding | Type | Action |
|--------|------|--------|
| **public/assests/** | Duplicate/typo | SAFE TO DELETE (use `public/assets` only). No imports reference `assests`. |
| **src/app/l/** | Short link route | KEEP (used for product links). |
| **src/lib/tryon/** | Multiple renderers | NEED REVIEW: `renderer.ts`, `simplified-renderer.ts`, `orchestrated-pipeline.ts`, `intelligent-renderer.ts`, `nano-banana-generator.ts`, `gpt-image-generator.ts` exist; production path is **only** `hybrid-tryon-pipeline.ts` → `nano-banana-pro-renderer.ts`. Others are dead or legacy. |
| **src/lib/tryon/intelligence/** | Scene intelligence | Used by scene-intel-adapter; KEEP. |
| **src/lib/tryon/rag/** | RAG storage | NEED REVIEW: may be unused by current try-on path. |
| **docs/** | Documentation | KEEP. |
| **database/scripts/** | One-off SQL | KEEP for ops. |

### 1.3 Suggested production-grade structure

- **Keep:** `src/app`, `src/components`, `src/lib` with clear domains (auth, ads, tryon, queue, etc.).
- **Add:** `src/lib/tryon/README.md` documenting that **only** `hybrid-tryon-pipeline` + `nano-banana-pro-renderer` are production; mark other renderers as deprecated or move to `src/lib/tryon/legacy/`.
- **Remove:** `public/assests` and fix any references if they appear.
- **Optional:** Group API routes by domain in docs (e.g. auth, tryon, ads, brand, admin) for onboarding.

---

## SECTION 2: UNUSED FILES & DEAD CODE

### 2.4 Files never imported

- **Try-on legacy (never imported by API or worker):**  
  `renderer.ts`, `simplified-renderer.ts`, `orchestrated-pipeline.ts`, `intelligent-renderer.ts`, `nano-banana-generator.ts`, `gpt-image-generator.ts`, `environment-refinement.ts` (and possibly others under `lib/tryon` that are not used by `hybrid-tryon-pipeline` or `nano-banana-pro-renderer`).  
  **Category:** NEED REVIEW (confirm no server-side dynamic imports); then SAFE TO DELETE or move to legacy.

### 2.5 React components never used

| File | Verdict |
|------|--------|
| `src/components/Header.tsx` | SAFE TO DELETE (root Header; layout uses BrutalNavbar/BrandNavbar). |
| `src/components/Hero.tsx` (root) | SAFE TO DELETE (app uses `@/components/home/Hero`). |
| `src/components/ValuesScroll.tsx` | SAFE TO DELETE |
| `src/components/ProductSwitcher.tsx` | SAFE TO DELETE |
| `src/components/Locations.tsx` | SAFE TO DELETE |
| `src/components/NewsGrid.tsx` | SAFE TO DELETE (Masonry only used here). |
| `src/components/image-viewer.tsx` | NEED REVIEW (may be used by path not grep’d). |
| `src/components/transitions/PageTransition.tsx` | NEED REVIEW |
| `src/components/tryon/GeneratingOverlay.tsx` | NEED REVIEW (try-on page may use it). |
| `src/components/brutal/HeroTryOn.tsx` | SAFE TO DELETE |
| `src/components/brutal/Section.tsx` | SAFE TO DELETE |
| `src/components/ui/AnimatedButton.tsx` | SAFE TO DELETE |

### 2.6 API routes never called from frontend or server

Never referenced (no fetch/useQuery/useMutation to that path):

- `/api/admin/tryon-research-profiles`
- `/api/ads/rate`, `/api/ads/improve`
- `/api/analytics/brand`, `/api/analytics/influencer`
- `/api/auth/diagnose`, `/api/auth/migrate-user`, `/api/auth/test-email`, `/api/auth/resend-confirmation`
- `/api/debug/check-data`
- `/api/health/db`
- `/api/admin/clear-auth`, `/api/admin/pending-users`
- `/api/setup/admin`
- `/api/profile/socials`, `/api/profile/metrics`
- `/api/fashion-buddy/chat`, `/api/fashion-buddy/analyze`
- `/api/influencers`
- `/api/image-proxy`
- `/api/storage/upload`

**Category:** NEED REVIEW. Some are admin/ops (e.g. health, debug, setup, clear-auth) — keep but document. Others (e.g. fashion-buddy, ads/rate, ads/improve, profile/socials) may be future UI or unused; either wire or remove.

### 2.7 Large commented-out blocks

- Not fully scanned. Manual pass recommended for files under `src/lib/tryon` and `src/app/api` (e.g. >5 line comment blocks that look like disabled code).

### 2.8 Unused variables / functions / exports

- Requires static analysis or ESLint unused vars. Recommendation: enable `@typescript-eslint/no-unused-vars` and fix; then run a pass for unused exports (e.g. ts-prune or custom script).

### 2.9 Duplicate utility functions

- Not fully enumerated. Suspect overlap in `src/lib/utils`, `src/lib/tryon` (image/base64, validation). Recommendation: centralize in `lib/utils` or `lib/image-processing` and reuse.

### 2.10 Duplicate API logic

- Auth: many routes use `createClient`/`createServiceClient` from `@/lib/auth` — good. Ensure no copy-paste of “get user and 401” blocks; consider a small `requireAuth()` wrapper.
- Try-on: single entrypoint `runHybridTryOnPipeline` from API and worker — good.

---

## SECTION 3: DEPENDENCY ANALYSIS

### 3.11 package.json vs actual imports

- **@google/genai** — Used (nanobanana, executor, garment-extractor, renderer, etc.).
- **@google/generative-ai** — Used only in `src/lib/gemini.ts`. Two Gemini SDKs in one app.

### 3.12 Unused dependencies (candidates for removal)

| Dependency | Note |
|------------|------|
| **@google/generative-ai** | Duplicate of @google/genai for Gemini. Used in `lib/gemini.ts` (ads path). Consolidate on `@google/genai` and remove the other after migration. |
| **@types/pg** | Used if Prisma or raw pg is used; prisma present. KEEP. |
| **@studio-freight/react-lenis** | Used in layout (ReactLenis). KEEP. |
| **gsap** | Verify usage; if only Lenis used for scroll, consider dropping gsap. NEED REVIEW. |
| **bottleneck** | Used in `lib/gemini/executor.ts`. KEEP. |
| **bullmq**, **ioredis** | Used for try-on queue and rate limit. KEEP. |

### 3.13 Heavy dependencies (bundle impact)

- **framer-motion** — Large; used across home/ads. Consider lazy-loading or replacing with CSS/Lenis where possible.
- **@tanstack/react-query** — Standard; keep.
- **sharp** — Server-only; no client bundle impact.

### 3.14 Duplicate libraries

- **Two Gemini SDKs:** `@google/genai` (try-on, executor) and `@google/generative-ai` (gemini.ts for ads). **Recommendation:** Use a single SDK (`@google/genai`) and one executor; remove `@google/generative-ai` after migrating `lib/gemini.ts`.

---

## SECTION 4: PERFORMANCE & SCALING

### 4.15 Request flow (frontend → backend)

- **Try-on:** Client → `POST /api/tryon` → auth + validation → (optional Redis queue) → `runHybridTryOnPipeline` → scene intel → Nano Banana Pro (Gemini) → upload → response.
- **Ads:** Client → `POST /api/ads/generate` (and regenerate) → auth → rate limit + in-flight guard → GPT + Gemini → storage → response.
- **Auth:** Supabase (createClient/createServiceClient); session in cookies.

### 4.16 Rate limiting, retry, timeout, errors

| Mechanism | Where | Notes |
|-----------|--------|------|
| **Rate limiting** | `lib/rate-limit.ts` (Redis); `lib/security/rate-limit-middleware.ts` (middleware); `applyApiRateLimit` in middleware. | Try-on and ads have per-user/per-IP limits (env: MAX_TRYON_PER_MINUTE, MAX_ADS_PER_MINUTE, etc.). |
| **In-flight guard** | `lib/traffic-guard.ts` — `tryAcquireInFlight(userId, 'ads')` | Prevents duplicate concurrent ads/tryon for same user. |
| **Retry** | Try-on: optional quality retry inside `nano-banana-pro-renderer` (ENABLE_QUALITY_RETRY). Ads: optional recovery pass (AD_ENABLE_RECOVERY_PASS). | No generic HTTP retry; GeminiRateLimitError handled in routes. |
| **Timeout** | Try-on: `maxDuration` on route; scene intel and face crop have withTimeout fallbacks. Ads: maxDuration 120. | Good. |
| **Error handling** | Routes return 4xx/5xx and messages; try-on returns 504 on timeout; ads return rate limit + retryAfter. | Consistent. |

### 4.17 Concurrent requests per user

- **Try-on:** In-flight guard + rate limit; queue (BullMQ) when enabled. Single user can trigger one try-on at a time (inline) or queued jobs.
- **Ads:** Same user limited by rate limit + in-flight; multiple ads possible within limits.
- Exact concurrency is env-driven (e.g. TRYON_INLINE_GLOBAL_LIMIT, Redis-based limits).

### 4.18 Queue system

- **BullMQ** + Redis (`lib/queue/redis.ts`, `lib/queue/tryon-queue.ts`). Worker: `workers/tryon-worker.ts`. Queue enabled when `TRYON_QUEUE_ENABLED=true` and Redis URL set. If Redis unavailable, try-on can still run inline (with higher risk of timeouts).

### 4.19 Caching

- **Redis** used for rate limits and in-flight keys; not for response caching. Garment cache in DB (by image hash). No CDN or API response cache mentioned.

### 4.20 Debounce / throttle (frontend)

- Not audited per component. Recommendation: ensure try-on and ads “Generate” buttons are disabled after submit and/or debounced to avoid double submissions.

### Scaling risks

- **Single Node process:** Long try-on (e.g. 90–120s) can hold a serverless function; queue + worker preferred for production.
- **Redis dependency:** Rate limit and queue require Redis; fallback behavior when Redis is down should be documented (e.g. inline try-on without rate limit).
- **No response caching:** Repeated preset/config requests hit API every time; consider short-lived cache for presets.

---

## SECTION 5: SECURITY CHECK

### 5.21 API keys on frontend

- **No.** Keys read via `process.env` (OPENAI_API_KEY, GEMINI_API_KEY, SUPABASE_SERVICE_ROLE_KEY) in server-only code. `NEXT_PUBLIC_*` only Supabase URL and anon key (intended for client). **Verdict:** OK.

### 5.22 Environment variables

- **Structure:** Centralized in `lib/config/api-keys.ts` for OpenAI/Gemini; auth uses Supabase env vars. No `.env` committed. **Recommendation:** Maintain a single `.env.example` listing all required vars (including TRYON_*, AD_*, REDIS, etc.).

### 5.23 Endpoint protection

- **Auth:** Most API routes use `createClient`/`createServiceClient` and check session; unauthenticated requests return 401. Admin routes use service role or admin checks. **Verdict:** Good. Ensure every mutation and sensitive read is behind auth.

### 5.24 Request validation

- **Yes.** Zod schemas in `lib/validation.ts` (e.g. tryOnSchema, adGenerationSchema, campaignSchema); used in tryon and ads routes. Body size and type validated. **Verdict:** Good.

### 5.25 File upload validation

- **Try-on:** Base64 in JSON; length capped in schema (e.g. 15M). No file type allowlist in schema (relies on downstream image handling). **Recommendation:** Add MIME or magic-byte check for image payloads if not already in image-processing layer. Storage upload route: confirm type/size checks.

### Vulnerabilities to fix

- **Debug route:** `/api/debug/check-data` should be disabled or strictly guarded in production (e.g. admin-only + feature flag).
- **Admin routes:** Ensure `/api/admin/*`, `/api/setup/admin` are not callable by non-admins (service role or role check).

---

## SECTION 6: DATABASE & STATE

### 6.26 Database schema

- **Supabase (Postgres).** Schema spread across:
  - `database/migrations/brand_portal_tables.sql` (conversations, messages, products, ad_creatives, campaigns, etc.)
  - `database/migrations/collaborations_and_notifications.sql`
  - `database/migrations/tryon_feedback_schema.sql`
  - `database/migrations/create_tryon_research_profiles.sql`
  - Others in `database/migrations/`.
- **Prisma:** `prisma/` present; relationship to Supabase migrations (manual vs Prisma-managed) not confirmed. Recommendation: document single source of truth (Supabase SQL vs Prisma) and migration order.

### 6.27 Indexes

- Migrations define some indexes; not fully audited. Recommendation: ensure indexes on: `profiles(id)`, `conversations(brand_id, influencer_id)`, `messages(conversation_id)`, `products(brand_id)`, `ad_creatives(brand_id)`, try-on tables by user_id and created_at.

### 6.28 Unused tables

- Not fully audited. Recommendation: map each table to a feature or migration; drop or archive unused tables.

### 6.29 State management

- **Server:** Stateless; auth via Supabase session. **Client:** React Query (TanStack) for server state; Zustand possible (not confirmed). No obvious duplication; ensure no duplicate “user” or “session” state (e.g. React Query + local state for same data).

### 6.30 Race conditions

- **Try-on:** In-flight guard reduces duplicate concurrent runs per user. Queue job processing should be idempotent or use job IDs to avoid double application. **Recommendation:** Document job semantics and any idempotency keys.

---

## SECTION 7: CODE QUALITY

### 7.31 TypeScript strict mode

- **Yes.** `tsconfig.json` has `"strict": true`. **Verdict:** Good.

### 7.32 ESLint

- **Configured:** `.eslintrc.json` extends `next/core-web-vitals`. No custom rules for unused vars or imports. **Recommendation:** Add `@typescript-eslint/no-unused-vars` and optionally `no-unused-exports` (or use ts-prune).

### 7.33 Error handling

- **Consistent:** Routes use try/catch and return JSON with status; some log and rethrow. Gemini rate limit and timeouts handled. **Recommendation:** Standardize error shape (e.g. `{ error: string, code?: string }`) and use a small `handleApiError` helper.

### 7.34 Logging

- **Console:** `console.log`/`warn`/`error` with NODE_ENV checks in places. No structured logger (e.g. Pino). **Recommendation:** Introduce structured logging and log levels for production (e.g. request id, user id, duration).

### 7.35 Monitoring

- **None.** No Sentry, Datadog, or APM. Only comments about “monitoring” in generation-limiter and success-memory. **Recommendation:** Add error tracking (e.g. Sentry) and optional performance monitoring before production scale.

### Overall code quality rating: **6/10**

- **Strengths:** Strict TS, Zod validation, central auth and API keys, single try-on production path.
- **Gaps:** Unused code and components, two Gemini SDKs, no APM/error tracking, some routes uncalled, duplicate public folder.

---

## SECTION 8: PRODUCTION READINESS SCORE

### 8.36 Ratings

| Dimension | Score (1–10) | Notes |
|-----------|--------------|------|
| **Architecture** | 7 | Clear separation (app, api, lib); try-on has one production pipeline. Legacy renderers and duplicate SDKs subtract. |
| **Scalability** | 6 | Queue + Redis + rate limits help; single-process long runs and no response caching are limits. |
| **Cleanliness** | 5 | Unused components, unused API routes, duplicate folders and Gemini libs; dead try-on code. |
| **Maintainability** | 6 | TypeScript and validation help; missing README for try-on, no centralized error/shape docs. |
| **Security** | 7 | Keys server-side; auth on routes; validation present. Debug/admin routes need tightening. |

### 8.37 Final verdict

**Beta — with targeted hardening can be production-ready.**

- Core flows (auth, try-on, ads) are implemented with validation, rate limiting, and timeouts.
- Gaps: dead code, unused routes/components, duplicate deps, no observability, and a few security/reliability tweaks.

### 8.38 Prioritized 7-day refactor plan

| Day | Focus | Actions |
|-----|--------|--------|
| **1** | Cleanup & safety | Remove or relocate unused try-on renderers; delete `public/assests`; add README under `src/lib/tryon` stating production path only. |
| **2** | Dead surface | Remove or stub unused components (Header, Hero, ValuesScroll, ProductSwitcher, Locations, NewsGrid, Masonry, HeroTryOn, Section, AnimatedButton) after confirming no dynamic imports. Document or remove uncalled API routes (admin/debug/health stay; fashion-buddy, ads/rate, etc. decide). |
| **3** | Dependencies | Migrate `lib/gemini.ts` to `@google/genai`; remove `@google/generative-ai`. Audit gsap usage; remove if unused. |
| **4** | Security & env | Restrict `/api/debug/*` and `/api/setup/admin` to admin or feature flag. Add `.env.example` with all required vars. |
| **5** | Observability | Add Sentry (or similar) for API errors; structured request logging (request id, user, duration). |
| **6** | DB & state | Document migration order and table ownership; add missing indexes for hot queries; ensure no duplicate client state for auth. |
| **7** | Docs & polish | One-pager: request flow (try-on, ads), env vars, queue/worker setup, rate limits. Run ESLint with unused-vars and fix. |

---

**End of audit.**
