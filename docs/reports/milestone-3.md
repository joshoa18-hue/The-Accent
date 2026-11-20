# Milestone 3 — Development Report

**Project:** The Ascent · **Milestone:** 3, the learning loop · **Date:** 20 November 2026
**Commits:** `e9ef05b` (fix), `e9581d7` (checkpoint 1), `aec625d` (checkpoint 2), and this checkpoint 3 commit.

---

## 1. Summary

The Ascent now has a complete learning loop. A learner reads a real lesson and passes its quiz, and the **database itself** checks the answers, records the completion and awards XP once. In the same transaction it updates their daily missions and weekly objectives, paying each once per period, and grants any achievement whose rule is now met. Course progress, Continue Learning, mastery and level all follow automatically. Nothing is claimed by pressing a button, and nothing in the browser can award XP.

## 2. What was built

### Fix before starting (`e9ef05b`)
- **Public school pages crashed for signed-out visitors**, a regression from Milestone 2: the page asked for private learner data. Mastery now loads only for signed-in learners, with a sign-in invitation otherwise.

### Checkpoint 1 — Lessons you can read (`e9581d7`)
- A typed content model for lessons (blocks plus a quiz), with no new dependencies.
- Three original lessons: *Building Lasting Habits → How Habits Form*.
- Public, prebuilt lesson pages; lesson links in course outlines; real 404s for unknown lessons.
- Quiz answer keys **never reach the browser** (`server-only` data layer, `toPublicQuiz()`), and in the database they live in a locked `private` table.

### Checkpoint 2 — Completing a lesson earns XP (`aec625d`)
- `complete_lesson(lesson, answers)` checks the quiz in the database. It's one transaction, idempotent, and fails closed for lessons without a quiz; the old no-quiz version was dropped.
- An accessible quiz form (signed in) and a read-only preview with a sign-in link (signed out).
- Course progress, measured against *planned* lessons, feeds Continue Learning, Current Learning and the outline ticks.

### Checkpoint 3 — Missions, objectives and achievements
- Every task and achievement has a **verifiable rule**: lessons and modules completed, schools studied, XP per school, total XP, or a streak of days.
- `private.evaluate_progress()` runs inside `complete_lesson`. It updates tasks, pays each once per day or week, grants achievements, and returns `rewards`.
- Thresholds come from the same level curves the UI uses (tested).
- The quiz result lists newly earned rewards; the dashboard's missions and objectives update automatically.

## 3. What was tested

| Gate | Result |
|---|---|
| ESLint, TypeScript (including the database-enum contract) | ✅ |
| Vitest | ✅ **26 files, 158 tests** |
| Production build | ✅ |
| pgTAP (`npm run db:test`) | ✅ **50 tests** |

**Database tests cover:**
- RLS and privileges on every table, and the locked answer keys;
- quiz checking (wrong, missing, extra and malformed answers);
- XP once, completions once, fail-closed, per-learner independence, and the old function being gone;
- daily missions once per day, the module objective, the 30-day streak (just below and at the threshold), the level-25 threshold, idempotent evaluation;
- learners being unable to write their own tasks or achievements, or run the evaluator.

**Mutation tests** (deliberately breaking things to prove a test notices):
- broken RLS policy (Milestone 2);
- `Steadfast` threshold raised to 32 days → the streak test failed;
- enum drift → typecheck failed.

**Browser, as real learners:**
- Signed out, the lesson quiz is read-only and the page source contains no answers.
- Blank, wrong, correct and repeated submissions all behave as designed, confirmed against the database ledger.
- Lesson 2 completed both daily missions; lesson 3 finished the module and completed both weekly objectives; nothing was paid twice.
- The dashboard showed Level 4, 640 XP, "2 of 2 completed today", completed objectives, "First Step" earned, and Continue Learning at 30%.

### Not tested
- A full `supabase db reset` from scratch with all seven migrations. Changes were applied incrementally to keep the local test accounts; each migration ran without errors.
- Behaviour across a real UTC midnight or week boundary. Period maths is unit-tested, and the streak test uses dates in the past.
- Real phones, screen readers, other browsers, and a hosted deployment.

## 4. Problems found and fixed

| Problem | Fix |
|---|---|
| School pages crashed for signed-out visitors | Load learner data only when signed in |
| 6 of 9 quiz answers were "B" | Rearranged; a test prevents all answers sharing a position |
| The old `complete_lesson` would pay for any published lesson without a quiz | Lessons seeded unpublished until the quiz-checking version existed; the old function was then dropped |
| A component test couldn't see links inside a closed `<details>` | Check the link text directly (a test-environment quirk, not an app bug) |
| A streak test setup accidentally made a 30-day run | Caught on review; the setup now leaves a deliberate gap |
| Slow laptop: results took up to ~16 s, so early checks read stale pages | Confirmed via server logs before concluding anything |

## 5. Incomplete or limited

| Item | Status |
|---|---|
| Content | 3 lessons (one module). The format, seed and tests are ready for more. |
| Quiz guessing | The page says which question is wrong, so with 3 choices guessing is possible; XP is still paid only once per lesson. Attempt limits are optional future work. |
| Answer keys in source code | The quiz demonstrates engagement; it isn't an exam. Documented. |
| "Wide Horizons" and "Polymath" | Need lessons in 3 and 8 schools, so they can't be earned until that content exists |
| Offline mode | Moved to Milestone 4 |
| Hosting | Not started |

## 6. Recommended next steps

1. **Write more lessons**, starting with Module 2 of the habits course and one lesson in two other schools, so "Wide Horizons" becomes earnable. It's content work; no code changes are needed.
2. **Plan hosting:** a Supabase project, a host for Next.js, real email (SMTP), a deploy checklist, and running `db reset` in a clean environment to prove the migrations from scratch.
3. **Milestone 4:** reflection journal, spaced review, offline reading, an accessibility audit.

Each is to be planned and approved first, as before.
