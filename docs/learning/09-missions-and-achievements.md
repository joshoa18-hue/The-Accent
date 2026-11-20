# Lesson 9 — Missions and achievements the server can prove

*Milestone 3, checkpoint 3. Covers designing rules that can be verified, evaluating them inside the database, "once per period" rewards, the gaps-and-islands trick for streaks, and mutation testing.*

---

## 1. What we built

| Feature | Where |
|---|---|
| Missions and objectives redesigned around **verifiable rules** | `src/content/catalogue/tasks.ts` |
| Achievements with rules and thresholds | `src/content/catalogue/achievements.ts` |
| `private.evaluate_progress()`: updates tasks, pays them once per period, grants achievements | `supabase/migrations/20261123000100_missions_and_achievements.sql` |
| `complete_lesson` now evaluates progress and reports `rewards` | same migration |
| The quiz result lists what you just earned | `QuizForm.tsx` |
| Compile-time contract extended to the two new rule enums | `src/types/database-contract.ts` |
| 9 new unit tests (158 in total) and 13 new database tests (50 in total) | |

## 2. Why this approach

**If the server can't check it, it can't reward it.** The old sample mission "Study for 25 focused minutes" could only be honoured by trusting a button press, which would break rule 2 ("never award XP from the browser"). So every task and achievement now has a **rule** computed from facts the database already holds: completed lessons and the XP ledger.

| Rule | Measured from |
|---|---|
| `lessons_completed` | `lesson_completions` in the period (or ever, for achievements) |
| `modules_completed` | Modules where every *planned* lesson is completed, the last one in this period |
| `schools_studied` | Distinct schools of completed lessons |
| `schools_with_xp` / `school_xp` / `total_xp` | The XP ledger |
| `streak_days` | Longest run of consecutive UTC days with a completion |

**There are no buttons to claim anything.** Passing a lesson runs `evaluate_progress` inside the *same transaction*, so the lesson, its XP, any mission or objective XP and any achievement are all recorded together, or none of them are.

**Once per period, enforced by the ledger.** A mission's XP uses the source id `"daily-one-lesson:2026-11-20"`. The ledger's unique key (`user_id, source_type, source_id`) means that exact reward can be paid only once. Tomorrow's id is different, so tomorrow it can be earned again.

**One definition of "Scholar".** The achievement threshold isn't typed in by hand. It's calculated by the same `xpRequiredForLevel()` the screen uses, and a test checks that "Scholar's Rank" unlocks exactly where the Scholar tier begins.

## 3. Important files

| File | Why it matters |
|---|---|
| `…_missions_and_achievements.sql` | `evaluate_progress` and `achievement_value`, every step commented |
| `src/content/catalogue/tasks.ts` | The missions, each with a rule, target and XP |
| `src/content/catalogue/rules.test.ts` | Proves tasks are achievable and thresholds match the on-screen tiers |
| `supabase/tests/security.test.sql` §2b–2c | Missions, objectives, streaks and the level-25 threshold, tested |

## 4. The important code, explained

### Paying once per period

```sql
if v_status = 'completed' and private.award_xp(
     p_user, t.xp_reward, 'mission', t.id || ':' || v_start::text, null, t.title) then
  v_rewards := v_rewards || jsonb_build_object('kind', t.kind, 'title', t.title, 'xp', t.xp_reward);
end if;
```

`award_xp` returns `true` only if it inserted a row. The second time, the unique key blocks the insert, it returns `false`, and nothing is reported. That's idempotency again, now per day and per week.

### Gaps and islands: finding streaks

```sql
select day, day - (row_number() over (order by day))::int as island
  from (select distinct (completed_at at time zone 'utc')::date as day …) days
```

| day | row_number | day − row_number |
|---|---|---|
| Nov 1 | 1 | Oct 31 |
| Nov 2 | 2 | Oct 31 |
| Nov 3 | 3 | Oct 31 |
| Nov 5 | 4 | **Nov 1** ← a gap starts a new island |

Consecutive days all subtract to the same date, so `group by island` puts each unbroken run in its own group, and `count(*)` gives its length. It's a classic SQL pattern worth remembering.

### Validating the reply, again

`parseCompletionResult` now also checks every reward: a known `kind`, a non-empty title, and whole-number XP. The app never displays something from the database whose shape it hasn't checked.

## 5. How the pieces communicate

```
Pass a quiz ─► complete_lesson ─┬─ record completion + lesson XP (once)
                                └─ evaluate_progress(learner)          ← same transaction
                                     ├─ for each task template:
                                     │    progress = rule(period) → user_tasks (upsert)
                                     │    completed? → award_xp("<task>:<period>") once
                                     └─ for each achievement not yet earned:
                                          achievement_value(rule) ≥ threshold → user_achievements
                                ◄── rewards: [{kind, title, xp}, …]
QuizForm shows "Daily mission complete: …", "Achievement unlocked: …"
Dashboard reads user_tasks + user_achievements (RLS: own rows) → missions, objectives, honours
```

## 6. Concepts to understand

- Designing for verifiability: rules over self-reporting
- Periods and time zones (UTC days, ISO weeks starting Monday)
- Idempotent keys built from data (`task:period`)
- Upserts: `insert … on conflict … do update`
- Window functions (`row_number() over (…)`) and the gaps-and-islands pattern
- `stable` SQL functions; `case` over an enum
- Single source of truth across languages (TypeScript curve → SQL threshold)
- Mutation testing: deliberately breaking code to prove a test can fail

## 7. What testing caught or proved

**Database (50 tests):**
- the first lesson completes "Complete a lesson" and unlocks "First Step";
- a second lesson completes the two-lesson mission and reports it;
- each mission pays once;
- finishing the real "How Habits Form" module completes "Finish a module" (paid once);
- a 29-day run isn't "Steadfast", but filling the gap makes it 31 and unlocks it;
- the level-25 XP threshold unlocks "The High Road";
- evaluating again earns nothing;
- learners can't write their own tasks or achievements, or call the evaluator.

**A bug in my own test, caught before running it:** the streak setup forgot that learner B had *also* completed lessons today, so "29 days" was really 30. The test would have failed for the wrong reason. The setup now leaves a deliberate gap.

**Mutation test:** raising "Steadfast" to 32 days made the streak test fail ("30 days in a row unlocks Steadfast"), proving it really checks the rule. It was restored to 30 afterwards.

**In the browser, as Ada:**

| Step | Result |
|---|---|
| Pass lesson 2 (lesson 1 was earlier today) | +40 XP; "Daily mission complete: Complete a lesson +20 XP"; "…Keep going: two lessons +30 XP" |
| Pass lesson 3 (module finished) | +40 XP; "Weekly objective complete: Complete lessons +75 XP"; "…Finish a module +100 XP"; daily missions *not* paid again |
| Dashboard | Level 4, 640 XP; "2 of 2 completed today"; objectives "Complete"; "First Step" earned; Continue Learning 30% → "View course outline" |
| Ledger | One row per mission per day (`:2026-11-20`) and per objective per week (`:2026-11-16`, the Monday) |

## 8. Exercise

**Part A — design a rule.** Invent a weekly objective "Study three days this week". Which existing rule could it use, and what *new* rule would make it exact? Sketch the SQL that would count distinct UTC days with a completion in the week.

**Part B — islands by hand.** For the days Nov 3, 4, 5, 8, 9 and 12, write out the `day − row_number` column. How many islands are there, and what's the longest streak?

**Part C — mutation test it yourself.** Change the "Finish a module" XP to 101 in `src/content/catalogue/tasks.ts`, but **don't** run `npm run db:seed`. Run `npm run test`. Which test catches that `seed.sql` no longer matches the catalogue? Now run `npm run db:seed` and test again: why does it pass? Undo the change and re-run `npm run db:seed`.
