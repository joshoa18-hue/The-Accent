# The Ascent

A lifelong personal learning academy styled as an educational RPG. You study across **eight schools**, earn **XP** and level up a character, whose six attributes and per-school mastery grow with what you learn.

> **Status: Milestone 1 — interface foundation.** Everything you see runs on clearly labelled **sample data**. There is no login and no database yet, and nothing you click awards XP. See [ROADMAP.md](ROADMAP.md).

## What's in Milestone 1

| Area | Route |
|---|---|
| Dashboard: welcome, character profile, level and XP, attributes, daily missions, weekly objectives, current learning, achievements, continue learning, the eight schools | `/` |
| Schools index | `/schools` |
| Eight school pages with course categories and expandable course outlines | `/schools/[slug]` |
| Character sheet: level, XP, attributes, mastery, achievements, XP history | `/character` |
| Web app manifest and icons (installable, no offline mode yet) | `/manifest.webmanifest` |

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

Open http://localhost:3000. No environment variables are needed for Milestone 1. `.env.example` lists the ones Milestone 2 will add.

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

### Local database (Milestone 2)

The app still runs on sample data without a database. To work on the database you need **Docker Desktop** running (on Windows: installed for all users, with WSL 2).

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
- **Tests.** The level curve, the XP ledger (including corrections and whole-number checks), the integrity of the sample data, the data layer, navigation matching, and components. The components are tested by role and text, and there are tests that fail if a fake button appears.
- **Build.** Every page prerenders: `/`, `/schools`, `/character` and all eight school pages.

### 2. Manual, in a browser

Run `npm run build && npm run start` (or `npm run dev`) and check:

1. **Dashboard (`/`)** shows all ten sections, plus a "Sample data" label.
2. **Sidebar (≥1024px wide):** Dashboard, Schools and Character highlight when active, and all eight school links open.
3. **Mobile (<1024px):** the sidebar is hidden, a bottom tab bar appears, and there's no sideways scrolling at 375px.
4. **"View course outline"** on the dashboard opens the school page and scrolls to the course with it already expanded.
5. **Course outlines** expand and collapse with a click, and with **Tab + Enter**.
6. **`/character`** shows level 8, 3,220 XP and 380 XP to level 9 (sample data).
7. **`/does-not-exist`** shows the "This path doesn't exist" page.
8. **No button awards XP or pretends to work.** Missions and courses are display-only.
9. **Security headers.** In DevTools → Network, open any response: it should have `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`, and no `X-Powered-By`.
10. **Manifest.** DevTools → Application → Manifest shows "The Ascent" and three icons with no errors.

## Project documentation

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the app is structured and why |
| [ROADMAP.md](ROADMAP.md) | Milestones and what comes next |
| [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | Preliminary Supabase schema and security model |
| [CLAUDE.md](CLAUDE.md) / [AGENTS.md](AGENTS.md) | Rules for AI coding assistants working in this repo |
| [docs/learning/](docs/learning/) | Step-by-step lessons explaining how each part was built |
| [docs/reports/](docs/reports/) | Milestone development reports |

## Tech stack

Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · lucide-react icons · Vitest and React Testing Library. There is deliberately no UI kit, state library or CSS-in-JS.
