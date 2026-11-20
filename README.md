# The Ascent

A lifelong personal learning academy styled as an educational RPG. You study across **eight schools**, earn **XP** and level up a character, whose six attributes and per-school mastery grow with what you learn.

> **Status: Milestone 2 — accounts and real data.** Learners sign in with an emailed link and see their **own** progress, stored in Supabase and protected by Row Level Security. Nothing in the app awards XP yet; that's Milestone 3. See [ROADMAP.md](ROADMAP.md).

## What's in the app

| Area | Route | Access |
|---|---|---|
| Dashboard: welcome, character profile, level and XP, attributes, daily missions, weekly objectives, current learning, achievements, continue learning, the eight schools | `/` | Signed in |
| Character sheet: level, XP, attributes, mastery, achievements, XP history, **profile editing** | `/character` | Signed in |
| Schools index and eight school pages with expandable course outlines | `/schools`, `/schools/[slug]` | Public |
| Lessons: reading, plus a read-only quiz (answering arrives in Milestone 3, checkpoint 2) | `/lessons/[lessonId]` | Public |
| Sign in (magic link) and sign out | `/login`, `/auth/confirm`, `/auth/signout` | Public |
| Web app manifest and icons (installable, no offline mode yet) | `/manifest.webmanifest` | Public |

## Requirements

- **Node.js 24** (tested with 24.20.0). Older versions are untested.
- npm (bundled with Node)

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. The schools work straight away. Signing in and the private pages need the local database and `.env.local`; see "Local database" and "Signing in locally" below.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next.js route types, then runs the TypeScript compiler |
| `npm run test` | Unit and component tests (Vitest), once |
| `npm run test:watch` | Tests in watch mode |
| `npm run check` | **All of the above in order.** Run before every commit. |

### Local database

The private pages read from a local Supabase database, which needs **Docker Desktop** running (on Windows: installed for all users, with WSL 2).

> **Low-memory machines (about 4 GB of RAM):** Docker and a production build don't fit together. Stop Docker (`docker desktop stop`) before `npm run check` or `npm run build`, then start it again afterwards.

| Command | What it does |
|---|---|
| `npm run db:start` | Start a lean local Supabase stack: database, auth, API and email catcher |
| `npm run db:start:studio` | The same plus **Studio** at http://127.0.0.1:55323. Needs more memory. |
| `npm run db:stop` | Stop the stack. Data is kept. |
| `npm run db:reset` | Rebuild the database from `supabase/migrations/` and `supabase/seed.sql` |
| `npm run db:test` | Run the database security tests (pgTAP) |
| `npm run db:seed` | Regenerate `supabase/seed.sql` from `src/content/` |
| `npm run db:types` | Regenerate `src/types/database.ts` from the running database |

Ports are **55320–55329**, not Supabase's defaults, because Windows often reserves the 543xx range for WSL and Hyper-V.

### Signing in locally

1. Copy `.env.example` to `.env.local`, then put the **publishable** key from `npm run db:status` into `SUPABASE_PUBLISHABLE_KEY`.
2. Run `npm run db:start` and `npm run dev`, then open http://localhost:3000. Private pages send you to `/login`.
3. Enter any address, such as `you@example.test`. No real email is sent: open the mail catcher at **http://127.0.0.1:55324** and click the link.

The dashboard and character pages need sign-in; the schools are public.

## Test procedure

### 1. Automated

```bash
npm run check
```

It must finish without errors. The checks cover:

- **Lint and types.** Code style and type safety.
- **Tests.** The level curve, the XP ledger, catalogue integrity, the database-row mappers, profile and email validation, the open-redirect guard, the key check, the CSP builder, navigation matching, and components (queried by role and text, including tests that fail if a fake button appears).
- **Build.** The public pages prerender; the private pages stream their content after checking the session.

Then, with the database running:

```bash
npm run db:test
```

This runs the **database security tests** (29 so far): Row Level Security, privileges, the XP award rules and the locked quiz answer keys.

### 2. Manual, in a browser

With `npm run db:start` running, use `npm run build && npm run start` (or `npm run dev`) and check:

1. **Signed out:** `/` and `/character` redirect to `/login`; `/schools`, **every school page** and every lesson open; `/schools/not-a-school` and `/lessons/not-a-lesson` return **404**.
2. **Sign in** with a made-up address such as `a@example.test`, using the link from the mail catcher at http://127.0.0.1:55324. You land on the page you asked for.
3. **New learner:** the dashboard shows level 1, 0 XP, missions "Not started", achievements locked, **no "Sample data" label**, and "No XP yet" in the XP history.
4. **Profile:** on `/character`, an empty display name shows "Enter a display name."; a valid one shows **Saved**, and the dashboard greets you by the new name on its first load (production build).
5. **Sign out:** you land on `/login`. Pressing **Back** doesn't show the previous learner's page, and View Source contains no trace of their name or email.
6. **Two learners:** sign in as `b@example.test`. They see only their own fresh character, nothing of A's.
7. **Reused email link:** "That sign-in link is invalid or has expired."
8. **Responsive:** at ≥1024px the sidebar shows; below that, the bottom tab bar and the header Sign in / Sign out button, with no sideways scrolling at 375px.
9. **Course outlines** expand and collapse with a click and with **Tab + Enter**; `/schools/x#course-y` opens that course.
10. **Security headers** (DevTools → Network): `Content-Security-Policy`, `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`, and no `X-Powered-By`. The Console shows no "Refused to…" CSP messages.
11. **Manifest** (DevTools → Application → Manifest): "The Ascent" and three icons, no errors.

## Project documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the app is structured and why |
| [ROADMAP.md](ROADMAP.md) | Milestones and what comes next |
| [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | The Supabase schema and security model (the SQL lives in `supabase/migrations/`) |
| [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) | Rules for AI coding assistants working in this repo |
| [docs/learning/](docs/learning/) | Step-by-step lessons explaining how each part was built |
| [docs/reports/](docs/reports/) | Milestone development reports |

## Tech stack

Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Supabase (Postgres, Auth, Row Level Security) via `@supabase/ssr` · lucide-react icons · Vitest, React Testing Library and pgTAP. There is deliberately no UI kit, state library or CSS-in-JS.
