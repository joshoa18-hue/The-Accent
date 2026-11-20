# Writing a lesson

Lessons are plain TypeScript files, so adding one needs no new code. This is the whole process.

## 1. Pick where it goes

Open `src/content/catalogue/schools.ts` and find an **open** course and its module ids, for example `personal-habits-course-3` for "Time and Energy Management". A module's `plannedLessons` number is the maximum you can write for it.

## 2. Create the file

Copy an existing lesson as a template, e.g. `src/content/catalogue/lessons/personal-habits/easy-and-hard.ts`, into a folder named after the course. Then fill in:

| Field | Notes |
|---|---|
| `id` | `<module id>-<number>`, e.g. `personal-habits-course-3-1` |
| `schoolSlug`, `courseId`, `moduleId` | Must match `schools.ts` exactly (the tests check this) |
| `order` | 1, 2, 3… within the module, with no gaps |
| `minutes`, `xpReward` | About 6–8 minutes and 40 XP, like the others |
| `blocks` | `paragraph`, `heading`, `keyIdea`, `list` (`bullet`/`number`), `quote`, `reflection` |
| `quiz` | 2–5 questions, each with 2+ choices, a `correctChoiceId` and an `explanation` |

## 3. Content standards

- **Original writing.** Don't copy text from books or websites.
- **Only claims you can stand behind.** Cite research by author and year, and only well-established findings. Avoid famous studies that have failed to replicate.
- **Quotes** must be public domain: old enough, or from public-domain translations (e.g. the King James Version, George Long's Epictetus), with the source given.
- **Spread the right answers** across A, B and C. A test fails if every answer in a lesson is in the same position.
- **Explanations reveal the answer**, so they're only shown after a learner passes.

## 4. Register it

Add the import and the lesson to `catalogueLessons` in `src/content/catalogue/lessons/index.ts`, in reading order. Use the `.ts` extension in the import path.

## 5. Check and publish

```bash
npm run db:seed
```

```bash
npm run test
```

`db:seed` regenerates `supabase/seed.sql`, which holds the lesson's id, XP and answer key. The tests check that the lesson fits the catalogue, that its quiz is valid, and that `seed.sql` is up to date.

To get it into your **local** database without wiping test accounts, insert just the new rows. Ask Claude, or use `npm run db:reset` if you don't mind losing local accounts.

## 6. Read it in the browser

`npm run dev`, then open `/lessons/<id>`. Read it through once as a learner would, then pass the quiz.
