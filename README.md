# Bilingual Books

Generate side-by-side bilingual EPUBs from pasted text, existing EPUBs, or
Project Gutenberg books.

Stack: **Next.js 15 (App Router) · TypeScript · Postgres · Prisma · Better-Auth
· Tailwind**, packaged as a multi-stage Docker image for **Railway**.

## Architecture at a glance

- **Translation calls stay at the edge.** Every per-sentence translation goes
  directly from the user's browser to `translate.googleapis.com` — the server
  never sees the body. This preserves the free pipeline and keeps the Railway
  container's CPU/egress flat regardless of conversion volume.
- **Project Gutenberg search** is browser → `gutendex.com` directly. Book
  download is proxied through `/api/gutenberg/fetch` so we can track
  conversions, enforce paywalls, cache files in `BookCache`, and dodge CORS
  on raw `.epub` URLs.
- **Accounts are optional.** Anonymous users can convert; a `bb_anon_id`
  cookie tracks their stats. On first sign-in we migrate those rows to the
  authenticated user.
- **Paywall hooks** live in `src/lib/paywall.ts`. They currently return
  `allowed: true` for every tier; flip `TIER_LIMITS.free.maxWordsPerMonth`
  to a finite number to enforce a monthly word cap.

## Local development

```bash
# 1. Postgres
docker run -d --name bb-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bilingual_books postgres:16

# 2. Env
cp .env.example .env
# fill in BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD; google creds optional

# 3. Install + migrate + seed
npm install
npx prisma migrate dev --name init
npm run seed

# 4. Dev server
npm run dev
```

Open `http://localhost:3000` — you can convert as an anonymous user, or sign
in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and visit `/admin`.

## Deploying to Railway

1. Create a new Railway project, link this repo.
2. Add the **Postgres** add-on. Railway auto-injects `DATABASE_URL`.
3. Set environment variables (see `.env.example`):
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — your public origin
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin seed
4. Deploy. The container's entrypoint runs `prisma migrate deploy` then the
   admin seed before booting the Next.js server.
5. Verify: `curl https://<your-app>/api/health` → `{"ok":true,"db":"up"}`.

## Project layout

```
prisma/          # schema + seed
legacy/          # original static-site files for reference
src/
  app/           # routes, api handlers, server components
  components/    # converter UI, dashboard, admin, auth forms
  lib/
    converter/   # ported translation + EPUB build pipeline
    *.ts         # auth helpers, paywall, stats, validators
  auth.ts        # Better-Auth server config
  middleware.ts  # bb_anon_id cookie
```

## Adding a paywall

Open `src/lib/paywall.ts` and edit `TIER_LIMITS`:

```ts
free: { maxWordsPerMonth: 5000 },    // free users: 5,000 words/month
pro:  { maxWordsPerMonth: 100000 },
```

The precheck endpoint and client UI already render `"X of Y words used"` when
limits are finite; no code changes elsewhere are needed.
