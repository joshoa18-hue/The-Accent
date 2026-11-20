# Lesson 8 — Earning XP: the database is the referee

*Milestone 3, checkpoint 2. Covers checking quiz answers inside the database, transactions and idempotency, a form that talks to a Server Action, and turning completions into course progress.*

---

## 1. What we built

| Feature | Where |
|---|---|
| `complete_lesson(lesson, answers)`: checks the quiz, records the completion, awards XP once | `supabase/migrations/20261122000100_complete_lesson_with_quiz.sql` |
| The old no-quiz `complete_lesson(lesson)` **removed** | same migration |
| A real quiz form for signed-in learners; a sign-in prompt for visitors | `QuizForm.tsx`, `QuizSection.tsx` |
| A Server Action that cleans the answers and asks the database | `src/app/lessons/[lessonId]/actions.ts` |
| Course progress: Continue Learning, Current Learning, ✓ in the outline | `src/lib/progression/course-progress.ts` |
| 21 new unit tests (149 in total) and 37 database tests | `*.test.ts(x)`, `supabase/tests/` |

The three habit lessons are now **published**, so they can be completed.

## 2. Why this approach

**The database is the referee; everything else just carries messages.** The browser sends answers, and the Server Action tidies them and passes them on. Only `complete_lesson`, running inside the database, decides whether they're right and whether XP is earned. It's the only code with access to the answer key, and it can't be bypassed:

| Question | Who decides | How |
|---|---|---|
| Who is completing it? | The database | `auth.uid()` from the login session, never a parameter |
| Is the lesson available? | The database | Published, in an **open** course |
| Are the answers right? | The database | Compared with `private.lesson_quiz_answers` |
| How much XP? | The database | `lessons.xp_reward`, never the caller |
| Has it already been paid? | The database | Unique keys on completions and on XP sources |

**One transaction.** Everything inside a database function happens together or not at all. You can't end up with a completion but no XP, or XP without a completion.

**Idempotent.** "Idempotent" means doing something twice has the same effect as doing it once. Passing a quiz again gives `awarded: false, xp: 0`. Double-clicks, refreshes and replayed requests are harmless.

**Fail closed.** A lesson with no answer key can't be completed at all, so a mistake in the content can't become free XP.

**Don't open the door before the lock exists.** In checkpoint 1, lessons were seeded *unpublished* because the old function didn't check quizzes. This migration **drops** the old function and adds the new one, and only then are lessons published. A test proves the old version is gone.

## 3. Important files

| File | Why it matters |
|---|---|
| `…_complete_lesson_with_quiz.sql` | Read it top to bottom; every rule is commented |
| `src/app/lessons/[lessonId]/actions.ts` | The "messenger": validate, call `rpc`, check the reply, `updateTag` |
| `src/lib/lessons/quiz.ts` | `readQuizAnswers` keeps only real question/choice ids; `parseCompletionResult` doesn't trust the reply's shape blindly |
| `src/components/lessons/QuizForm.tsx` | `<fieldset>`/`<legend>` radio groups, pending and result states |
| `src/lib/progression/course-progress.ts` | Pure progress maths: completed ÷ **planned** lessons |

## 4. The important code, explained

### Checking answers in SQL

```sql
select count(*)::int,
       coalesce(array_agg(k.question_id order by k.question_id)
                filter (where p_answers ->> k.question_id is distinct from k.correct_choice_id), '{}')
  into v_total, v_wrong
  from private.lesson_quiz_answers k
 where k.lesson_id = v_lesson.id;
```

For each question in the key, `p_answers ->> 'q1'` reads the learner's choice from the JSON. `is distinct from` treats a *missing* answer (NULL) as wrong, where plain `<>` would quietly ignore it. The `filter` collects just the wrong question ids.

### Calling it from the Server Action

```ts
const { data, error } = await supabase.rpc("complete_lesson", { p_lesson_id: lessonId, p_answers: answers });
const result = parseCompletionResult(data);       // never trust the shape blindly
if (result?.passed) updateTag(LEARNER_DATA_TAG);   // XP changed: next render is fresh
```

`rpc` calls a database function **as the signed-in learner** (their session cookie). Explanations are added to the reply only *after* a pass, because before that they'd give the answers away.

### Progress against the plan, not the written lessons

```ts
progressPercent: Math.floor((done.length / planned) * 100)
```

The habits course plans 10 lessons, but only 3 are written. Measuring against the 3 would show "100%" after three lessons, which would be untrue. Measuring against the 10 shows 30%.

## 5. How the pieces communicate

```
QuizForm (browser) ──form──► submitQuiz (Server Action)
                               ├─ readQuizAnswers()        only real ids
                               ├─ getCurrentUser()         signed in?
                               └─ supabase.rpc("complete_lesson", {lesson, answers})
                                        │   as the learner
                                        ▼
                         complete_lesson (database, one transaction)
                           ├─ checks lesson is published & open
                           ├─ compares answers with private.lesson_quiz_answers
                           ├─ insert lesson_completions (once)
                           └─ private.award_xp(...)  → xp_transactions (once)
                                        │
            ◄── { passed, wrong, awarded, xp } ── parseCompletionResult()
                               └─ updateTag(LEARNER_DATA_TAG)

Next render:  lesson_completions + catalogue lessons ──► buildLearningActivities()
              ──► Continue Learning · Current Learning · outline ✓ · mastery · level
```

## 6. Concepts to understand

- Remote procedure calls (`rpc`) and `security definer` functions
- Database transactions: all or nothing
- Idempotency, and why it makes retries safe
- Fail-closed vs fail-open design
- JSON in Postgres (`jsonb`, `->>`, `jsonb_typeof`); `is distinct from` and NULL
- Changing a function's signature safely: drop the old one in the same migration
- Accessible forms: `<fieldset>`, `<legend>`, `aria-describedby`, `aria-live`
- React form actions reset uncontrolled fields; the `key` trick to keep choices
- Validating data at boundaries (`parseCompletionResult`)

## 7. What testing caught or proved

**Database (37 tests):**
- wrong and missing answers fail with no XP;
- a pass awards exactly the lesson's XP, once, and records one completion;
- a planned-course lesson or a lesson with no quiz is rejected;
- non-object answers are rejected;
- learner B earns independently of A;
- anonymous calls are refused;
- the old function is gone.

**In the browser, as a real learner:**

| Step | Result |
|---|---|
| Signed out | Questions read-only, "Sign in to answer…", no form, and no answer keys or explanations in the page source |
| Leave Q3 blank | "Choose an answer for this question." Other choices kept. |
| Wrong Q3 | Q3 flagged, "No XP is lost by trying again". Database: **0** XP rows, **0** completions. |
| All correct | "Lesson complete: +40 XP" and explanations appear. Database: one row, 40 XP, "What a Habit Really Is". |
| Submit again | "All correct… nothing extra was added". Database: still **one** row. |
| Dashboard | Continue Learning: 10%, "Continue: The Habit Loop…" linking to lesson 2 |
| Character | 335 XP, Level 3; newest history entry is the lesson |
| Outline / mastery | Lesson 1 "(completed)"; Personal Development: Novice, Rank 1, 40 XP |

**Caught on the way:** a component test couldn't "see" links inside a closed `<details>`. That's a quirk of the test environment's accessibility model, not an app bug; the test now checks the link text directly. And on this slow laptop, one result took about 16 seconds, so the first check read the page before the reply arrived. The server log showed the truth. *Always check the log before deciding something is broken.*

## 8. Exercise

**Part A — be the referee.** In the migration, find the line that decides a missing answer counts as wrong. Change `is distinct from` to `<>` *in your head*: what would happen to a learner who left every question blank? Why?

**Part B — try to cheat.** Sign in, open a lesson, and in DevTools → Elements change one radio button's `value` to `"z"` before submitting. What happens, and which function stopped it, `readQuizAnswers` or the database?

**Part C — progress maths.** The habits course plans 10 lessons. If you complete all three written lessons, what percentage does Continue Learning show, and what does its button say? Check your answer in the browser.
