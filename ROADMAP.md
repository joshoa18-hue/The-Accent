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

## Milestone 2 — Accounts and real data (Supabase)

**Goal:** a real learner can sign in and see their own progress, stored securely.

1. **Supabase project and local development.** Set up the Supabase CLI, migrations in `supabase/migrations/`, and seed data generated from today's sample files.
2. **Schema and Row Level Security** exactly as designed in [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md), with RLS tests for every table.
3. **Authentication.** Email magic link or OAuth via `@supabase/ssr`, with sessions refreshed in `proxy.ts`, and the dashboard and character pages protected.
4. **Data layer swap.** Each `src/lib/data/*` function reads from Supabase and returns `source: "database"`. No component changes are expected. That's the point of the contract.
5. **Profiles.** Display name and title, editable through a validated Server Action.
6. **Security hardening:**
   - A **Content-Security-Policy** header, nonce-based, that allows only our own origin, Supabase and the font host. Start in report-only mode, then enforce.
   - The `server-only` package on any module that touches the service-role key (and ideally use that key nowhere in the web app).
   - Input validation on every Server Action, plus rate limiting on auth endpoints.
   - A true 404 status for unknown school slugs, using a slug check in `proxy.ts` (see ARCHITECTURE §6).
7. **Generated database types** (`supabase gen types`) replacing the hand-written row types.

## Milestone 3 — Learning loop

**Goal:** completing real work earns real XP.

- Lesson pages and a lesson content format (MDX or database-backed), introducing content gradually rather than all at once
- **Lesson completion → XP**, through the `award_xp` database function only. It's idempotent, server-verified, and covered by tests.
- Daily missions and weekly objectives, generated per learner and completed server-side
- Earning achievements from rules evaluated on the server
- Course progress tracking that drives "Continue learning"
- A service worker for offline reading of lessons. Progress is always confirmed by the server, so offline mode never shows invented XP.

## Milestone 4 — Depth and reflection

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
| Unknown school slugs return HTTP 200 with a noindex not-found page | Milestone 2, `proxy.ts` slug check |
| No Content-Security-Policy | Milestone 2 |
| No offline support (manifest only) | Milestone 3 |
| All data is sample data; missions, courses and achievements are display-only | Milestones 2–3 |
