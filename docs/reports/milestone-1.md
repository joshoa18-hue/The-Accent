# Milestone 1 — Development Report

**Project:** The Ascent · **Milestone:** 1, interface foundation · **Date:** 19 November 2026
**Delivered in three approved checkpoints.** Checkpoints 1 and 2 are committed (`8c0d536`, `d0fa4a2`); checkpoint 3 is the final commit of this milestone.

---

## 1. Summary

The Ascent now has a working, responsive, documented interface. It covers a dashboard, eight school pages with course outlines, and a character sheet, all built on a typed domain model and a ledger-based XP system. All data is clearly labelled sample data. Nothing awards XP, and no control pretends to do something it can't. The codebase is set up so that Milestone 2 (Supabase) replaces the data source without changing any display component.

## 2. What was built

### A. Foundation
- Next.js 16.4.6 (App Router, Turbopack, Cache Components), React 19.3, TypeScript strict, Tailwind CSS 4.3
- Vitest + React Testing Library; a single `npm run check` quality gate
- Security headers: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and no `X-Powered-By`
- Four runtime dependencies: next, react, react-dom and lucide-react
- Prepared for Supabase through an async `DataResult<T>` data-layer contract, `.env.example` and a full database design

### B. Visual identity
- Navy, charcoal and gold design tokens, with Cormorant Garamond for display and Inter for body text, both self-hosted
- Reusable UI kit: `Card`, `Panel`, `ProgressBar`, `Badge`, `ArrowLink`, `SectionHeading`, `SampleDataNotice`
- Brand mark, used in the sidebar, favicon and app icons

### C. Dashboard (`/`)
Welcome with stats, continue learning, character profile, level and XP, skill attributes, recent achievements, daily missions, weekly objectives, current learning, and the eight schools with mastery. It has a "Sample data" label and a footer explaining what is display-only.

### D. Eight schools (`/schools`, `/schools/[slug]`)
- An index of all eight schools
- Each school page has a breadcrumb, a header with stats, three course categories, and 3–4 courses. Each course has an expandable module outline using native `<details>`.
- A school mastery panel
- Deep links (`/schools/x#course-y`) that open and scroll to a course
- Course structure only, as instructed: 26 courses, with modules showing planned lesson counts. No lesson content was generated.

### E. Character (`/character`)
- Level, total XP, progress to the next level, and an explanation of the ledger
- Six attributes, each with a rank and progress
- Mastery in all eight schools, with tiers
- Achievements, earned and locked
- XP history, including a correction entry
- **Everything is derived from XP transactions. There is no XP write path in the app.**

### F. Responsive and PWA-ready
- Desktop sidebar at 1024px and wider. Below that, a mobile header and bottom tab bar with safe-area padding.
- `/manifest.webmanifest` with 192, 512 and maskable 512 icons generated from code, an SVG favicon and an apple-touch-icon

### G. Documentation
`README.md` (setup and test procedure), `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md`, `docs/DATABASE_DESIGN.md` (schema, RLS and the secure XP award function), `.env.example`, and three lessons in `docs/learning/`.

## 3. What was tested

### Automated (`npm run check`, final run on 19 Nov 2026)

| Gate | Result |
|---|---|
| ESLint | ✅ pass |
| TypeScript (`next typegen && tsc --noEmit`) | ✅ pass |
| Vitest | ✅ **11 files, 48 tests passed** |
| Production build | ✅ 20 static pages generated. `/`, `/schools`, `/character`, all 8 schools, the manifest and all icons are prerendered. |

The tests cover:
- the level curve: boundaries, maximum level, and negative and fractional inputs;
- the ledger: corrections, the non-negative total and whole-number checks;
- the character summary;
- sample-data integrity: unique ids and valid references;
- the data layer and route builders;
- navigation matching;
- the components `ProgressBar`, `LevelSummary`, `AchievementList`, `DailyMissionList` and `CourseAccordion`;
- **"no button" assertions** on missions and courses.

### Manual and browser checks

| Check | Result |
|---|---|
| Production server: all 11 pages, manifest and 5 icon URLs return 200; `/nowhere` returns 404 | ✅ |
| Security headers present on the production server; no `X-Powered-By` | ✅ |
| Dashboard HTML contains no `<button>` elements | ✅ |
| "View course outline" opens the school, scrolls to the course and expands it | ✅ |
| Course outline opens with the keyboard (Tab + Enter) | ✅ |
| No horizontal overflow at 375, 768 and 1024px; sidebar and tab bar switch at 1024px | ✅ |
| Icons render correctly; the maskable icon keeps its artwork inside the safe zone | ✅ |
| `X-Frame-Options` blocks embedding in an iframe (found by accident) | ✅ |

**Not tested:**
- Installing the PWA on a real phone
- Real screen readers (NVDA, VoiceOver); only the semantics and the keyboard were checked
- Browsers other than the Chromium-based built-in browser
- Lighthouse and performance audits

## 4. What is incomplete or limited (by design or known)

| Item | Status |
|---|---|
| Authentication, database, real user data | Not started. Planned for Milestone 2. |
| Completing lessons, missions or objectives; earning XP and achievements | Display-only. XP must only be awarded server-side (Milestone 3). |
| Lesson content | Only course and module structure exists, as instructed |
| Offline support / service worker | Manifest only. Postponed so offline mode never shows stale XP. |
| Content-Security-Policy | Deferred to Milestone 2, because it must include the Supabase domain |
| Unknown school slug returns **HTTP 200** (with a not-found UI and `noindex`) instead of 404 | A known Cache Components trade-off (ARCHITECTURE §6). A `proxy.ts` fix is planned. |
| Duplicate XP prevention | Designed (a database unique constraint), not implemented. The TypeScript ledger sums whatever it's given. |
| A dev-only console warning when visiting an unknown school slug | Expected from `notFound()` inside Suspense. Absent in production builds. |
| The Next.js dev indicator overlaps the mobile tab bar | Development only |

## 5. Recommended next steps (Milestone 2)

1. **Set up Supabase locally** (CLI and migrations) and implement `docs/DATABASE_DESIGN.md` with **RLS tests first**.
2. **Add authentication** with `@supabase/ssr`, using session refresh in `proxy.ts`, and protect personal pages.
3. **Swap the data layer** function by function to Supabase. The `source` label flips to `"database"` automatically.
4. **Harden security:** add a CSP (report-only, then enforce), the `server-only` guard, validated Server Actions, and the slug check that gives a true 404.
5. **Profiles:** editable display name and title, as the first real write, validated on the server.

Each step is to be planned and approved before implementation, as in Milestone 1.
