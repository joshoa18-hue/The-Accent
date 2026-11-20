# Architecture

This document explains how The Ascent is put together and the reasoning behind the main decisions. Read it before making structural changes.

## 1. The big picture

```
┌──────────────────────────────────────────────────────────────┐
│  src/app/          ROUTES — fetch data, arrange sections     │
│     │                                                        │
│     ├──► src/lib/data/        DATA LAYER — the only place    │
│     │       │                 that knows where data lives    │
│     │       ├──► src/content/sample/   (Milestone 1)         │
│     │       └──► Supabase              (Milestone 2)         │
│     │                                                        │
│     ├──► src/lib/progression/ GAME RULES — pure functions:   │
│     │                         levels, ledger, attributes     │
│     │                                                        │
│     └──► src/components/      DISPLAY — props in, UI out     │
│                                                              │
│  src/types/        SHARED VOCABULARY — used by every layer   │
└──────────────────────────────────────────────────────────────┘
```

Each layer depends only on the layers below it. Components never import sample data. Pages never compute levels themselves. Nothing except `src/lib/data/` knows whether data comes from a file or a database.

## 2. Folder map

| Folder | Responsibility |
|---|---|
| `src/app/` | Routes (App Router). Pages are **Server Components** that load data with `Promise.all` and compose sections. Also holds `manifest.ts`, the icon routes and `not-found.tsx`. |
| `src/components/ui/` | Generic building blocks: `Card`, `Panel`, `ProgressBar`, `Badge`, `ArrowLink`, `SectionHeading`, `SampleDataNotice`. No knowledge of the domain. |
| `src/components/{dashboard,schools,character}/` | Feature sections. Each receives typed props and renders them. |
| `src/components/layout/` | App shell: `Sidebar` (desktop), `MobileHeader` + `MobileNav` (mobile), `NavLink`. |
| `src/lib/data/` | The **data-layer contract** (see §4). |
| `src/lib/progression/` | Pure, fully tested game rules. No React, no I/O. |
| `src/lib/routes.ts` | Every internal URL is built here, so links and pages can't drift apart. |
| `src/lib/brand/` | Brand colours and the icon renderer for generated PNGs. |
| `src/content/sample/` | ⚠ Sample data. Every file is labelled. It will be replaced by database queries. |
| `src/types/` | Domain types: `School`, `Course`, `XpTransaction`, `CharacterSummary` and so on. |
| `src/config/` | Static configuration, such as the primary navigation. |

## 3. Server and Client Components

Almost everything is a **Server Component**: it renders on the server or at build time and sends no JavaScript to the browser. Only three components are Client Components (`"use client"`):

| Component | Why it needs the browser |
|---|---|
| `NavLink` | Reads the current URL with `usePathname()` to highlight the active link. |
| `CourseHashOpener` | Reads `window.location.hash` and opens the matching `<details>` element. |
| `LoginForm` | Shows the pending and error states of the sign-in Server Action (`useActionState`). The form still posts without JavaScript. |

Interactive behaviour that HTML already provides stays native. Course outlines are `<details>`/`<summary>`, so keyboard support, screen-reader states and the open/close behaviour all cost zero JavaScript.

## 4. The data-layer contract

Every data function is `async` and returns a `DataResult<T>`:

```ts
type DataResult<T> = { data: T; source: "sample" | "database" };
```

- **`async` now, even though sample data is synchronous**, so pages already `await` correctly. Swapping in Supabase changes only the function bodies.
- **`source`** travels with the data. A page combines the sources of everything it shows with `combineSources()`. If *any* part is sample data, `SampleDataNotice` shows the "Sample data" label. The label can't become stale or be forgotten.
- **Lookups return `null`** for unknown ids rather than throwing. The page decides what to do, usually `notFound()`.
- **Views are shaped for the UI.** `getLearningActivities()` returns activities already joined with course and school names. In Milestone 2 that becomes a SQL join.
- **Read-only.** There is deliberately no function that writes XP. See §5.

## 5. Progression: the XP ledger

XP is **never stored as one editable number**. Every award is an `XpTransaction`, a line in a ledger, and everything else is *derived*:

```
xp_transactions ─► sumXp() ─► total XP ─► getLevelProgress(CHARACTER_CURVE) ─► level, progress
               └─► xpBySchool() ─► per-school XP ─┬─► MASTERY_CURVE   ─► mastery rank and tier
                                                  └─► school.primaryAttribute ─► ATTRIBUTE_CURVE ─► attribute ranks
```

| Rule | Where |
|---|---|
| The total XP needed to *reach* level L is `baseXp × L × (L−1) / 2`. Each level costs `baseXp` more than the one before. | `levels.ts` |
| Curves: character {100, 100}, attribute {40, 50}, mastery {60, 10} | `levels.ts` |
| Non-integer amounts are rejected, and a total can't go below zero. Negative amounts are meant only for corrections (`adjustment`); the database will enforce that rule with a `CHECK` constraint. | `ledger.ts` |
| Each school feeds one of the six attributes: wisdom, intellect, strategy, creativity, eloquence or discipline. | `school.primaryAttribute` |

**Why a ledger?** It provides a complete history. Mistakes are fixed by adding a correcting entry rather than editing history. Duplicate awards aren't filtered in Milestone 1's TypeScript; instead, in the database a unique key on `(user_id, source_type, source_id)` makes it impossible to earn the same reward twice.

**Why no XP from the browser?** Anything the browser sends can be forged. In Milestone 2, XP is inserted only by a server-side database function that verifies the learner actually completed the work. The browser can *ask*; only the server *awards*. See [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md).

## 6. Rendering with Cache Components (Next.js 16)

`next.config.ts` turns on `cacheComponents` and `partialPrefetching`, the Next.js 16 defaults. Their consequences:

- **All pages are prerendered at build time.** `/schools/[slug]` lists its eight slugs in `generateStaticParams`.
- **Request data must sit inside `<Suspense>`.** Anything that reads the URL (`params`, `usePathname`) must be inside a Suspense boundary, so the static shell can be served instantly:
  - `schools/[slug]/page.tsx` is a non-async page that renders `<Suspense fallback={<SchoolDetailsSkeleton/>}><SchoolDetails params={params}/></Suspense>`. The `params` promise is only awaited *inside* `SchoolDetails`.
  - `Sidebar` and `MobileNav` wrap the `NavLink` version in `<Suspense>` with a fallback that uses `StaticNavLink`, which has no active highlighting. The fallback is visually identical apart from the highlight, so nothing shifts.
- **Unknown school slugs return a real 404 (fixed in Milestone 2).** On its own, `notFound()` inside Suspense can only produce status 200, because the headers were already sent when streaming started. `src/proxy.ts` now checks the slug against the catalogue *before* rendering and rewrites unknown ones to a path no route handles, so the response is a genuine 404.
- **Private pages** (`/`, `/character`) render their content inside `<Suspense>` because they read the session (cookies). The static shell (sidebar, layout) still loads instantly.
- **`"use cache: private"`** wraps `getCurrentUser()`. Verifying a token compares its expiry with the clock, which can't be prerendered. A private cache runs at request time, is shared only within one request, and is never stored in a server-wide cache.

## 6a. Authentication

```
Proxy (every request)      refresh session cookies · optimistic redirects · school 404s
   │
Page / Server Action       requireUser() / getCurrentUser()   ← src/lib/auth/session.ts (Data Access Layer)
   │
Supabase (as that user)    Row Level Security returns only that user's rows
```

- **Magic-link sign-in.** `sendSignInLink` (Server Action) → email with a one-time `token_hash` → `/auth/confirm` (Route Handler) → `verifyOtp` → session cookies → redirect to `safeNextPath(...)`.
- **Server-only Supabase.** `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` have no `NEXT_PUBLIC_` prefix, and the modules that use them import `server-only`. `readSupabaseEnv()` refuses secret and service-role keys.
- **Tokens are verified, not trusted.** The server uses `auth.getClaims()`, which checks the signature. `getSession()` is never used on the server.
- **Open-redirect protection.** Every "where next" value goes through `safeNextPath()`, which allows only paths on this site.
- **No account enumeration.** The sign-in form gives the same reply whether or not an address has an account.
- **The Proxy is not the security boundary.** It only reads cookies. Every private page calls `requireUser()`, and the database enforces RLS regardless.

## 7. Styling

- **Tailwind CSS 4, CSS-first.** Design tokens live in `@theme` in `src/app/globals.css`: the navy, charcoal and gold scales, parchment, mist and the easing curve. Each token automatically becomes a utility class, such as `bg-navy-900` or `text-gold-400`.
- **Fonts** come from `next/font`. Inter is the body font and Cormorant Garamond the display font. Both are downloaded at build time and self-hosted, so visitors' browsers never contact Google.
- **Accessibility:** a skip link, a visible gold `:focus-visible` ring, `aria-current` on active navigation, `role="progressbar"` with readable values, `<section aria-labelledby>` on every panel, status shown in words rather than only by colour or icon, and support for `prefers-reduced-motion`.

## 8. Security posture

| Measure | Where |
|---|---|
| `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` | `next.config.ts` |
| `X-Powered-By` header removed | `poweredByHeader: false` |
| No secrets in the repository. `.env*` is git-ignored except `.env.example`, which holds placeholders only. | `.gitignore` |
| No client-side XP writes and no fake action buttons, enforced by tests | `DailyMissionList.test.tsx`, `CourseAccordion.test.tsx` |
| Seven runtime dependencies (next, react, react-dom, lucide-react, @supabase/supabase-js, @supabase/ssr, server-only) | `package.json` |
| Row Level Security plus revoked privileges on every table, proven by 24 database tests | `supabase/migrations/`, `supabase/tests/` |
| Supabase code runs only on the server; secret keys are refused | `src/lib/supabase/` |
| Open-redirect protection and email validation, each unit-tested | `src/lib/auth/` |

A Content-Security-Policy is planned for Milestone 2, checkpoint 3 (see ROADMAP.md).

## 9. PWA readiness

`src/app/manifest.ts` serves `/manifest.webmanifest` with the name, colours and three PNG icons: 192, 512 and a 512 maskable icon. The icons are **generated from code** by `src/lib/brand/app-icon.tsx` (`next/og` `ImageResponse`) at build time, so there are no binary icon files to keep in sync with the logo. `src/app/icon.svg` is the favicon and `src/app/apple-icon.ts` the iOS home-screen icon.

There is **no service worker yet**, so the app does not work offline. That's a deliberate Milestone 3 item: caching user progress offline needs careful design so it never shows stale XP.

## 10. Testing strategy

| Kind | Environment | Examples |
|---|---|---|
| Pure logic | node (default, fast) | `levels.test.ts`, `ledger.test.ts`, `character.test.ts` |
| Data integrity | node | `sample-data.test.ts` checks that ids are unique, that every school has courses and modules, and that every reference points at a real course or school |
| Data layer | node | `data-layer.test.ts` |
| Components | jsdom (opted in per file with `// @vitest-environment jsdom`) | Queried **by role and text**, as a user would find them |

Production build success is part of `npm run check`, because the build prerenders every page and so catches runtime errors in rendering.
