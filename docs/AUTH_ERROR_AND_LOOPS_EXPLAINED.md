# Auth Error, Reloads, and Duplicate Requests — Explained

This doc explains what you see in the terminal and how to fix or reduce it.

---

## 1. `Invalid Refresh Token: Refresh Token Not Found`

**What it is:**  
Supabase Auth returns this when the **refresh token** stored in the user’s cookies is no longer valid: revoked, expired, or from another project/env.

**When it happens:**
- User had a previous session (e.g. old cookies from another env or a revoked session).
- On the **first request**, the middleware runs on almost every route and calls `supabase.auth.getUser()`. That call triggers a **token refresh** using the refresh token in the cookie.
- If that token is invalid, Supabase throws `AuthApiError` with `code: 'refresh_token_not_found'`. Your middleware catches it and continues with `user = null` (so the user is treated as logged out), but the **Supabase client still logs the error** (or it’s rethrown and logged somewhere), so you see it in the terminal.

**Why you see it twice:**  
Two early requests (e.g. `GET /` and another navigation or prefetch) both hit the middleware and both try to refresh the same bad token → two logs.

**Fix / mitigation:**
- **User side:** Log out and log in again (or clear site data for localhost) so cookies get a new, valid refresh token.
- **Code side (optional):** When middleware or server code detects a refresh-token error, **clear the auth cookies** for that request (e.g. delete Supabase auth cookie names) so the next request doesn’t keep sending the bad token and logging the error again. Right now the invalid token stays in the cookie until the user logs in again or clears cookies.

---

## 2. “Reloading” and server restart

**What you see:**  
`Found a change in next.config.ts. Restarting the server to apply the changes...`

**What it is:**  
Next.js dev server **hot-restart** when `next.config.ts` (or other config) is saved. It’s not a redirect loop; the process restarts once and then runs with the new config.

**No fix needed** unless you want to avoid restarts — then avoid saving `next.config.ts` while the server is running.

---

## 3. Middleware deprecation warning

**What you see:**  
`The "middleware" file convention is deprecated. Please use "proxy" instead.`

**What it is:**  
In Next.js 16 the convention is moving from `middleware.ts` to a **proxy**-based model. Your app still works; this is a forward-compatibility warning.

**Fix:**  
When you’re ready, follow the official Next.js docs to migrate from `middleware` to the new proxy convention. No urgent change required for the auth error or “loops.”

---

## 4. Multiple requests (GET /, GET /api/auth/me, GET /dashboard 307, etc.)

**What you see:**  
Several requests in a short time, e.g.:
- `GET /` (maybe twice)
- `GET /api/auth/me` (several times)
- `GET /dashboard` → `307` → `GET /influencer/dashboard`

**What it is:**
- **Two GET /**  
  Common in dev: React Strict Mode double-mount, or prefetch + actual navigation. Not an infinite loop.
- **Several GET /api/auth/me**  
  Multiple components or layouts call the same auth endpoint (e.g. `useUser()` with `refetchOnMount: true`, or both `useUser()` and `ProfileCompletionGate` / profile-status). React Query dedupes by `queryKey: ['user']`, but you can still get one request per “tree” or per focus/mount.
- **GET /dashboard 307 → /influencer/dashboard**  
  Intended behavior: the **central dashboard** (`/dashboard`) runs, reads the profile, sees `role === 'influencer'` and `approval_status === 'approved'`, and **redirects** to `/influencer/dashboard`. So one 307 is not a loop, it’s the role-based routing.

**So:**  
This is **normal request flow** (landing → login → callback → dashboard → role redirect), plus **multiple auth/me (and similar) calls** from different parts of the app. It’s not an “unwanted loop” in the sense of redirect cycles; it’s redundant auth checks and one redirect.

**Optional improvements:**
- **Single auth source:** Use one place (e.g. one `useUser()` in a root layout or provider) and pass auth state down or via context, instead of several components each calling `/api/auth/me` or profile-status.
- **Reduce refetches:** If you don’t need fresh auth on every mount, set `refetchOnMount: false` for the auth query and rely on `refetchOnWindowFocus` or manual invalidation after login/logout.
- **Combine endpoints:** If both `/api/auth/me` and `/api/auth/profile-status` are used for “am I logged in and what’s my profile?”, consider one endpoint or reusing the same React Query key so only one request is made.

---

## 5. Summary

| What you see | Cause | Action |
|--------------|--------|--------|
| `Invalid Refresh Token: Refresh Token Not Found` | Stale or invalid refresh token in cookies; middleware/server calls `getUser()` and refresh fails | User: log out and log in (or clear cookies). Optional: clear auth cookies in middleware when refresh fails. |
| Server “Restarting…” | Change to `next.config.ts` (or similar) | Expected; no change needed. |
| “middleware” deprecated, use “proxy” | Next.js 16 convention change | Plan migration to proxy when convenient. |
| Multiple GET /, GET /api/auth/me, 307 to /influencer/dashboard | Strict Mode, multiple consumers of auth, and intentional dashboard → role redirect | Optional: single auth source and fewer refetches to reduce duplicate requests. |

The only real “error” here is the **refresh token** one; the rest are either expected behavior or warnings you can address over time.
