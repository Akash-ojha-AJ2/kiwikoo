# Redis / Upstash Setup (Optional)

Try-on **works without Redis**. Queue mode is enabled only when:
- `TRYON_QUEUE_ENABLED="true"`
- and a valid `UPSTASH_REDIS_URL` (or `REDIS_URL`) is configured (`redis://` / `rediss://`)

Otherwise, generation runs **inline** in the API request and returns the image in the same response.

Use Redis + the worker when you want:
- **Queue-based** processing (submit job → poll for result)
- **Rate-limit resilience** with a dedicated worker and global Gemini throttling
- **No 60s request timeout** for long-running generations

---

## 1. Get a Redis URL (Upstash – free tier)

1. Go to **[Upstash](https://upstash.com)** and sign up / log in.
2. Open the **[Console](https://console.upstash.com)**.
3. Click **Create database**.
4. Choose:
   - **Type:** Redis
   - **Region:** Pick one close to your app (e.g. `eu-west-1`).
   - **Name:** e.g. `tria-tryon-queue`.
5. Create the database.
6. Open the database and go to the **REST API** or **Details** tab.
7. Copy the **URL** (or **Endpoint**). It looks like:
   - `rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379`
   - or `https://YOUR_HOST.upstash.io` (REST).

   For BullMQ we need the **Redis connection URL** (starts with `rediss://` or `redis://`). In Upstash’s UI it’s often under **Redis Connect** or **Connection** → “Redis URL” or “ioredis”.

8. If you only see a REST URL, use **Upstash Redis** in the console and look for:
   - **Redis URL** / **Endpoint** (e.g. `rediss://default:xxx@xxx.upstash.io:6379`).

---

## 2. Add it to your environment

In your project root, open **`.env`** or **`.env.local`** and add:

```env
# Optional: Try-on queue (Upstash Redis)
# Enable this only when the worker process is running.
TRYON_QUEUE_ENABLED="true"
UPSTASH_REDIS_URL="rediss://default:YOUR_PASSWORD@YOUR_HOST.upstash.io:6379"
```

Replace `YOUR_PASSWORD` and `YOUR_HOST` with the values from the Upstash database page.

- **`.env`** – often used for defaults.
- **`.env.local`** – local overrides (usually not committed). Next.js loads both.

Restart your dev server after changing env vars.

---

## 3. Run the try-on worker (when using Redis)

With Redis configured, the API will **enqueue** jobs instead of running them inline. A separate process must consume the queue:

```bash
npm run worker:tryon
```

Keep this running (e.g. in a separate terminal or as a background process). When a user clicks Generate, the API enqueues the job and returns immediately; the worker runs the pipeline and updates the job so the app can show the result when polling.

---

## 4. Summary

| Variable              | Required | Where to get it                          |
|-----------------------|----------|------------------------------------------|
| `TRYON_QUEUE_ENABLED` | No       | Set manually to `"true"` only when worker is running |
| `UPSTASH_REDIS_URL`   | No       | [Upstash Console](https://console.upstash.com) → Create Redis DB → copy Redis URL |

- **Queue disabled/missing vars:** Try-on runs inline; no worker needed.
- **Queue enabled + valid Redis URL:** API enqueues jobs; run `npm run worker:tryon` so jobs are processed.

For more on the queue/worker design, see [TRYON_QUEUE_WORKER_ARCHITECTURE.md](./TRYON_QUEUE_WORKER_ARCHITECTURE.md).
