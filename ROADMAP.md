# Roadmap

Each milestone ends with working, tested software and a development report in [docs/reports/](docs/reports/). Items under future milestones are plans, not commitments; they will be re-planned with approval before work begins.

## ✅ Milestone 1 — Interface foundation *(complete)*

- Next.js 16 + TypeScript + Tailwind 4 foundation, with security headers and tests
- Design system: navy, charcoal and gold tokens, display and body fonts, and reusable UI components
- Typed domain model, plus a sample-data layer behind an async data contract
- Ledger-based progression rules: levels, attributes and mastery, all derived from XP transactions
- Dashboard, eight school pages with expandable course outlines, and a character sheet
- Responsive shell (desktop sidebar, mobile tab bar), web app manifest and icons
- Documentation and learning lessons

## ✅ Milestone 2 — Accounts and real data (Supabase) *(complete)*

**Goal:** a real learner can sign in and see their own progress, stored securely.

1. ✅ **Supabase project and local development.** Set up the Supabase CLI, migrations in `supabase/migrations/`, and seed data generated from today's sample files. *(Checkpoint 1)*
2. ✅ **Schema and Row Level Security** as designed in [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md), with 24 database security tests. *(Checkpoint 1)*
3. ✅ **Authentication.** Email magic link via `@supabase/ssr`, with sessions refreshed in `src/proxy.ts`, and the dashboard and character pages protected. *(Checkpoint 2)*
4. ✅ **Data layer swap.** Learner data reads from Supabase (`source: "database"`); the curriculum became real catalogue content (`source: "catalogue"`). No display component's props changed. *(Checkpoint 3)*
5. ✅ **Profiles.** Display name and title, editable through a validated Server Action. *(Checkpoint 3)*
6. **Security hardening:**
   - ✅ A **Content-Security-Policy**, trialled in report-only mode with zero violations, then enforced. Not nonce-based (see ARCHITECTURE §8). *(Checkpoint 3)*
   - ✅ `server-only` on every module that creates a Supabase client; the web app never uses the service-role key. *(Checkpoint 2)*
   - ✅ Input validation on the sign-in Server Action. Rate limiting of sign-in emails comes from Supabase Auth. *(Checkpoint 2)*
   - ✅ A true 404 status for unknown school slugs, via a slug check in `src/proxy.ts`. *(Checkpoint 2)*
7. ✅ **Generated database types** (`npm run db:types`), plus a compile-time contract with the app's own types. *(Checkpoint 1)*

## Milestone 3 — Learning loop

**Goal:** completing real work earns real XP.

1. ✅ **Lessons you can read** *(Checkpoint 1)*: typed TypeScript content blocks (no new dependencies), the first three lessons of *Building Lasting Habits*, public lesson pages, outline links, 404s, and quiz answer keys in a locked `private` table. Lessons are seeded **unpublished** until step 2.
2. ✅ **Completing a lesson earns XP** *(Checkpoint 2)*: `complete_lesson(lesson, answers)` checks the quiz in the database and awards XP once (the old no-quiz version was dropped); lessons are published; course progress drives Continue Learning, Current Learning and outline ticks.
3. **Missions, objectives and achievements earned on the server** *(Checkpoint 3)*: redesigned to be verifiable from lesson completions; streaks.
4. *Moved to Milestone 4:* a service worker for offline reading, designed around real lesson data so offline mode never shows invented XP.

## Milestone 4 — Depth and reflection

- Offline reading of lessons (service worker), moved from Milestone 3

- Quizzes and spaced-repetition review
- A study journal and reflections
- Streaks, history charts and a richer XP history (filters, per-school views)
- Accessibility audit with assistive technology, and a performance budget

## Later ideas (unscheduled)

- Mentor or AI study assistant per school
- Shared study groups
- Export of personal data (JSON)
- Native app wrappers

## Known limitations carried forward

| Limitation | Planned fix |
|---|---|
| CSP allows `'unsafe-inline'` scripts (needed for static rendering) | Revisit if Next.js offers hash-based CSP for inline scripts |
| "Current learning" is always empty (no lesson content yet) | Milestone 3 |
| Development mode can show one stale load right after saving a profile (production verified correct) | None needed; dev-only cache behaviour |
| The laptop's 3.4 GB of RAM can't run Docker and a production build at once | Stop Docker before `npm run build`, or add RAM |
| No offline support (manifest only) | Milestone 3 |
| Missions, objectives and achievements are display-only | Milestone 3 |
