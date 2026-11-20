# Milestone 2 — Development Report

**Project:** The Ascent · **Milestone:** 2, accounts and real data · **Date:** 20 November 2026
**Delivered in three approved checkpoints:** `02fdc1a` (database), `4ba8044` (sign-in), and this checkpoint 3 commit (real data, profiles, CSP).

---

## 1. Summary

The Ascent now has real accounts. A learner signs in with an emailed one-time link, sees **their own** character, built from **their own** XP ledger in Supabase, and can edit their display name and title. The database itself enforces privacy: every table has Row Level Security plus revoked privileges, proven by 24 database tests and by a two-account browser test. Supabase runs only on the server, and the browser is locked down by an enforced Content-Security-Policy. XP is still never written by the app; awarding it safely is Milestone 3.

## 2. What was built

### Checkpoint 1 — Database (`02fdc1a`)
- A local Supabase stack in Docker, with ports moved to 55320–55329 (Windows reserves the defaults) and a lean start option for low-memory machines.
- Four migrations:
  1. the catalogue tables;
  2. the personal tables and XP ledger, with unique-source and only-corrections-negative constraints;
  3. **privileges revoked, then minimal grants, plus RLS on every table**;
  4. the sign-up trigger and the `complete_lesson` / `private.award_xp` functions, which exist but aren't called yet.
- A seed **generated** from the TypeScript catalogue, with a drift test and SQL-escaping tests.
- **24 pgTAP security tests.** A deliberately broken policy was caught by them.
- Generated database types, plus a compile-time contract with the app's enums.

### Checkpoint 2 — Sign-in (`4ba8044`)
- Magic-link sign-in: Server Action → branded email → `/auth/confirm` (Route Handler) → session cookies.
- `src/proxy.ts`: session refresh, optimistic redirects, and **real 404s for unknown schools**, fixing a Milestone 1 limitation.
- A Data Access Layer (`getCurrentUser` / `requireUser`), using `"use cache: private"` for token checks.
- Open-redirect protection (12 attack cases tested), email validation, and refusal of secret keys.

### Checkpoint 3 — Real data, profiles, CSP
- The data layer reads learner data from Supabase as the learner, and pure mappers (tested) convert rows to app types.
- The curriculum is promoted to real **catalogue** content. The "Sample data" label no longer appears anywhere.
- Empty states for a brand-new learner.
- **Profile editing** through a Server Action with four independent checks; changes appear immediately (`updateTag`).
- **Sign-out rebuilt** as a Route Handler doing a full navigation, so no previous learner data stays in the browser.
- **Content-Security-Policy:** trialled in report-only mode, then **enforced**.
- Documentation: README test procedure, ARCHITECTURE, ROADMAP, CLAUDE.md rules, database design, and lessons 4–6.

## 3. What was tested

### Automated

| Gate | Result |
|---|---|
| ESLint | ✅ pass |
| TypeScript, including the database-enum contract | ✅ pass |
| Vitest | ✅ **19 files, 112 tests** |
| Production build | ✅ 23 pages; public pages prerendered, private pages stream after the session check |
| pgTAP (`npm run db:test`) | ✅ **24/24**, including with real accounts present |

### Browser (local Supabase; dev and production builds)

| Area | Result |
|---|---|
| Signed-out access | `/`, `/character` → 307 to `/login`; schools public; unknown school → **404** |
| Sign-in | Email arrives in Mailpit; link lands on the requested page; reused link rejected |
| New learner | Level 1, 0 XP, missions not started, achievements locked, "No XP yet", no sample label |
| Real XP (inserted as admin) | Level, progress, attribute ranks, mastery tier, history and earned achievement all correct |
| Profile editing | Empty name → field error; valid save → "Saved", and the next page shows it (**production**) |
| **Two-account isolation** | Learner B sees only their own data; no trace of A in the page |
| Sign-out | Cookies cleared, no previous learner data in the page, Back is redirected; cross-site POST → 403 |
| CSP | Report-only: zero violations on real pages, injected outside image reported. Enforced (production): pages, styles and fonts load, no blocks |
| Mobile (375px) | Header Sign in / Sign out, no sideways scrolling |

### Not tested
- A hosted Supabase project. Everything ran on the local stack; nothing has been deployed.
- Real email delivery (local emails are caught by Mailpit) and Supabase's production rate limits.
- Real screen readers, browsers other than the Chromium-based built-in one, and a real phone.
- Load or performance testing.

## 4. Problems found, and how they were solved

| Problem | Fix |
|---|---|
| Docker install stopped: "Virtual Machine Platform not enabled" | Reinstalled for all users (the owner approved the admin prompt) |
| Supabase ports forbidden by Windows | Moved to 55320–55329; no Windows settings changed |
| 3.4 GB of RAM: Studio, Docker and builds don't fit together | Lean `db:start`, optional `db:start:studio`; stop Docker before building |
| The shell collapsed `\\` to `\` in written files | Caught by tests; such files are now written with the editor |
| `Date.now()` during prerendering of session checks | `"use cache: private"` (as the Next.js docs recommend) |
| Parallel cached data reads blocked on shared Supabase auth state | Data reads use a token-forwarding client with no session logic |
| **The previous learner's name and email stayed in the page after sign-out** | Sign-out became a Route Handler doing a full navigation, with `Clear-Site-Data` |
| Database tests clashed with real accounts' emails | Test users use the reserved `.invalid` domain |

## 5. Incomplete or limited

| Item | Status |
|---|---|
| Earning XP, completing missions and lessons, earning achievements | Display-only. Milestone 3, through server-side functions only. |
| "Current learning" | Always empty until lesson content exists (Milestone 3) |
| Hosted Supabase and deployment | Not started. Needs a decision on hosting, plus email (SMTP) setup. |
| CSP `'unsafe-inline'` for scripts | A documented trade-off to keep static rendering |
| Dev mode can show one stale load after a save | Dev-only; production verified correct |
| Low-memory laptop | Workarounds documented; more RAM would remove them |

## 6. Recommended next steps (Milestone 3: the learning loop)

1. **Lesson content format and the first lessons** for one open course. Plan the format (MDX in the repo or database rows) before writing content.
2. **"Complete lesson" through `complete_lesson`**, the only XP path. Add tests for idempotency and planned courses (the database tests already cover the core rules).
3. **Course progress**, which feeds "Continue learning" and "Current learning".
4. **Server-side missions and achievements**, using the same `award_xp` pattern.
5. **Decide on hosting** (Supabase project, Next.js host, SMTP) and write a deploy checklist before anything goes live.

Each step is to be planned and approved first, as before.
