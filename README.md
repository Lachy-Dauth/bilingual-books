# Bilingual Books

Generate side-by-side bilingual EPUBs from pasted text, uploaded EPUB
files, or books on Project Gutenberg. Translation runs in the browser
against Google Translate's free endpoint; the server handles accounts,
stats, paywall hooks, and the Gutenberg download proxy.

**Stack:** Next.js 15 (App Router) · TypeScript · Postgres · Prisma ·
Better-Auth · Tailwind. Packaged as a multi-stage Docker image for
Railway.

---

## Features

- **Four conversion flows**
  - **Paste text** — paste any passage, generate a bilingual EPUB.
  - **Upload EPUB** — upload an existing EPUB and get a bilingual one
    back, with the cover, chapter boundaries, and TOC preserved.
  - **Popular books** — browse the top 20 most-downloaded Gutenberg
    books for a chosen language and convert any of them.
  - **Search Gutenberg** — full-text search the Gutenberg catalogue.
- **Three split modes** (EPUB / Gutenberg flows)
  - *Paragraph* — translate paragraph-by-paragraph (default, fastest).
  - *Sentence* — split into sentences first, then translate each on its
    own. Visual 1:1 alignment but less context for the translator.
  - *Sentence (aligned)* — translate full paragraphs (best context),
    then proportionally split source + target into aligned sentence
    pairs.
  - Abbreviation-aware splitter (handles `Dr.`, `Mr.`, `U.S.`, `e.g.`,
    initials, dialog quotes, CJK punctuation, Arabic `؟`).
- **Speed control** — Slow / Normal / Fast (2 / 6 / 12 concurrent
  translations) with rate-limit retry/backoff.
- **Line-break handling** — preserve or collapse `<br>` boundaries.
- **Save as PDF** — proper one-click PDF via the browser's print engine,
  with a stylesheet that hides UI chrome and adds chapter page-breaks.
- **Three-way theme picker** — Warm / Light / Dark, persisted in
  localStorage, no flash on SSR.
- **Optional accounts** — email + password and Google OAuth via
  Better-Auth. Anonymous users can still convert; a `bb_anon_id`
  cookie tracks their stats and migrates them on sign-in.
- **Stats dashboards** — per-user dashboard (books / words / top
  language pairs / recent conversions) and a site-wide admin panel
  with user management, tier changes, and account deactivation.
- **Paywall hooks** — `src/lib/paywall.ts` with a `TIER_LIMITS` map.
  Flip one number to enforce a monthly word cap, no other code changes.
- **GDPR-ish basics** — cookie consent banner that defers Google
  Analytics until accepted, `/privacy` and `/terms` pages, account
  deletion on the dashboard.

---

## Architecture at a glance

- **Translation calls stay in the browser.** Every per-sentence (or
  per-paragraph) translation is `fetch('https://translate.googleapis.com/translate_a/single?…')`
  directly from the user's browser. The server never sees translation
  traffic, so the free pipeline keeps working and Railway's CPU/egress
  costs stay flat regardless of conversion volume.
- **Project Gutenberg** — browser hits `gutendex.com` directly for
  search and "popular by language" lists; book download is proxied
  through `/api/gutenberg/fetch` so we can track conversions, enforce
  paywalls, cache the bytes in `BookCache`, and dodge CORS on the
  upstream `.epub` URLs.
- **Anonymous-first** — middleware sets `bb_anon_id` (httpOnly cookie,
  1-year, random UUID) on every visitor. The conversion table has
  `userId` and `anonymousId` columns; nulling either is fine. On first
  sign-in, `/dashboard` runs `migrateAnonymousConversions(userId)` to
  claim the cookie's rows for the new user.
- **Theme system** — an inline `<script>` in `<head>` reads `bb_theme`
  from localStorage and applies `html.theme-warm|light|dark` before
  first paint, preventing flash. `<ThemeProvider>` keeps React state
  in sync afterward.
- **Paywall** — `src/lib/paywall.ts` exposes `checkLimit(userId,
  anonymousId, plannedWords)` returning `{ allowed, remaining, used,
  limit, plan }`. The client calls `/api/conversions/precheck` before
  starting a conversion. With `TIER_LIMITS.free.maxWordsPerMonth =
  Infinity` (current default) the check always passes; flip it to a
  finite value to enforce a monthly word cap.

---

## Local development

```bash
# 1. Postgres (Docker)
docker run -d --name bb-postgres -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=bilingual_books postgres:16

# 2. Env
cp .env.example .env.local
# Fill in at minimum:
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bilingual_books"
#   BETTER_AUTH_SECRET="<openssl rand -base64 32>"
#   BETTER_AUTH_URL="http://localhost:3000"
#   ADMIN_EMAIL="admin@example.com"
#   ADMIN_PASSWORD="something-strong"

# 3. Install, migrate, seed
npm install
npx prisma migrate dev --name init
npm run seed

# 4. Dev server
npm run dev
```

Open <http://localhost:3000>. Sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD` and visit `/admin`.

---

## Deploying to Railway

1. Create a Railway project, link this repo + branch.
2. Add the **Postgres** plugin — `DATABASE_URL` is injected
   automatically.
3. Set service variables (see `.env.example` for the full list, all
   required ones below):
   ```
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   BETTER_AUTH_URL=https://<your-app>.up.railway.app
   ADMIN_EMAIL=<your-admin-email>
   ADMIN_PASSWORD=<strong-password>
   ```
   Optional:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   NEXT_PUBLIC_GA_ID=G-XXXXXXX
   ```
4. Deploy. The container entrypoint runs `prisma migrate deploy`, then
   the admin seed, then boots Next.js.
5. Verify with `curl https://<your-app>/api/health` →
   `{"ok":true,"db":"up"}`.

### Google OAuth (optional)

For Sign-in-with-Google:

1. <https://console.cloud.google.com> → APIs & Services → OAuth
   consent screen → **External** → fill in app name, support email,
   add the `openid email profile` scopes.
2. Credentials → Create credentials → OAuth client ID → Web
   application.
3. Authorized JavaScript origin: `https://<your-app>.up.railway.app`.
4. Authorized redirect URI:
   `https://<your-app>.up.railway.app/api/auth/callback/google`.
5. Paste the Client ID and Client Secret into Railway env. The "Continue
   with Google" button appears automatically on `/sign-in` and
   `/sign-up` once both vars are set.

---

## Project layout

```
Dockerfile               # multi-stage build, prisma migrate on boot
docker-entrypoint.sh     # runs migrate + seed, then `npm run start`
railway.json             # Railway config (health check etc.)
prisma/
  schema.prisma          # User, Account, Session, Conversion, BookCache, …
  seed.ts                # upserts admin from ADMIN_EMAIL / ADMIN_PASSWORD
legacy/                  # original static-site files, kept for reference
scripts/
  get-gmail-refresh-token.ts   # one-time OAuth helper (email — disabled)
  test-email.ts                # local SMTP-style smoke test (email — disabled)
src/
  app/
    layout.tsx           # root layout: theme, consent, nav, footer
    page.tsx             # converter
    sign-in/, sign-up/, sign-out/
    dashboard/           # user stats + delete-account button
    admin/               # site stats, user list, user detail, diagnostics
    privacy/, terms/
    api/
      auth/[...all]/     # Better-Auth catch-all
      conversions/       # POST log + GET history; precheck for paywall
      gutenberg/fetch/   # server-side Gutenberg book download
      admin/             # admin-gated endpoints (stats, users, email-test)
      health/
  components/
    converter/           # ConverterShell + tabs (Paste, EPUB, Popular, Gutenberg)
    dashboard/           # StatsCards, ConversionTable, DeleteAccountButton
    admin/               # UserControls, EmailDiagnostics
    auth/                # SignInForm, SignUpForm
    consent/             # ConsentBanner, Analytics, CookiePreferences
    theme/               # ThemeProvider, ThemeScript, ThemeToggle
    Navbar.tsx, Footer.tsx, BuyMeACoffee.tsx
  lib/
    converter/           # ported translation + EPUB build pipeline
      paste.ts           # sentence splitting for the paste flow
      epub-parse.ts      # parse uploaded EPUBs into chapters/blocks
      epub-build.ts      # build a bilingual EPUB
      translate.ts       # browser-side Google Translate calls
      align.ts           # sentence-aligned mode
      expand.ts          # split-mode + line-break handling
      sentences.ts       # abbreviation-aware sentence splitter
      languages.ts       # supported language list (for combobox)
      constants.ts, types.ts, util.ts
    db.ts                # PrismaClient singleton
    auth-helpers.ts      # getSession, requireUser, requireAdmin
    paywall.ts           # TIER_LIMITS + checkLimit
    stats.ts             # aggregation queries
    gutenberg.ts         # gutendex client + server fetch
    anon.ts              # bb_anon_id cookie helpers
    migrate-anon.ts      # claim anon conversions on first sign-in
    email.ts             # Gmail API transport (currently unused)
    env.ts               # runtime env validation
    validators.ts        # zod schemas for API inputs
  auth.ts                # Better-Auth server config (Google + credentials)
  auth-client.ts         # Better-Auth React client
  middleware.ts          # bb_anon_id cookie
  instrumentation.ts     # validates env vars at boot
  hooks/useLocalStorage.ts
```

---

## Configuration

All env vars are documented inline in `.env.example`. Required at
runtime (validated at boot, container fails fast if missing):

| Var | What |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | 32+ byte random secret |
| `BETTER_AUTH_URL` | Public origin (`https://…`) |

Recommended:

| Var | What |
|---|---|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin account |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Sign-in-with-Google |

Optional:

| Var | What |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics tag (only loads after cookie consent) |
| `GUTENBERG_USER_AGENT` | Polite UA for the book proxy |
| `GMAIL_REFRESH_TOKEN` / `GMAIL_SEND_FROM` | Email sending (disabled in UI, see below) |

---

## Re-enabling password-reset email

Email plumbing (Gmail API over HTTPS, admin diagnostics panel, CLI
helpers) is wired but the public flow is disabled. To turn it back on:

1. In Google Cloud Console for your existing project: enable the
   **Gmail API**, add the `https://www.googleapis.com/auth/gmail.send`
   scope to the OAuth consent screen, and add
   `http://localhost:47432/oauth/callback` to your OAuth client's
   redirect URIs.
2. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
   locally, then run `npm run gmail:get-token`. Sign in as the sending
   account, copy the refresh token it prints.
3. Set `GMAIL_REFRESH_TOKEN` in Railway. Visit `/admin` and check the
   Email diagnostics panel — Auth check should be green and a test
   send should land in your inbox.
4. Restore the user-facing flow:
   - re-add `src/app/forgot-password/page.tsx` and
     `src/app/reset-password/page.tsx` (in git history at commit
     `fc88b04` before the disable);
   - re-add `src/components/auth/ForgotPasswordForm.tsx` and
     `ResetPasswordForm.tsx`;
   - uncomment the `sendResetPassword` block in `src/auth.ts` (the
     stub is already there as a comment);
   - add the "Forgot?" link back to `SignInForm.tsx`.

---

## Tweaking the paywall

`src/lib/paywall.ts`:

```ts
export const TIER_LIMITS: Record<Tier, { maxWordsPerMonth: number }> = {
  free: { maxWordsPerMonth: 5000 },       // ← change to enable the gate
  pro:  { maxWordsPerMonth: 100000 },
  unlimited: { maxWordsPerMonth: Infinity },
};
```

The precheck endpoint and client UI already render "X of Y words used
this month" when limits are finite; no code changes elsewhere are
needed.

---

## NPM scripts

| Command | What |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `next lint` |
| `npm run seed` | Upsert admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `npm run prisma:migrate` | `prisma migrate dev` |
| `npm run prisma:deploy` | `prisma migrate deploy` |
| `npm run prisma:studio` | `prisma studio` |
| `npm run email:test -- to@example.com` | Send a test email via Gmail API |
| `npm run gmail:get-token` | Mint a Gmail refresh token (one-time helper) |
