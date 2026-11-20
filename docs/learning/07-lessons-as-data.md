# Lesson 7 — Lessons as data, and keeping answers secret

*Milestone 3, checkpoint 1. Covers modelling content as typed data, drawing it safely, keeping quiz answers away from the browser, and evolving the database with a new migration.*

---

## 1. What we built

| Feature | Where |
|---|---|
| A content model for lessons: typed blocks plus a quiz | `src/types/lesson.ts` |
| The first three lessons: *Building Lasting Habits → How Habits Form* | `src/content/catalogue/lessons/personal-habits/` |
| A lesson page with breadcrumb, reading time, XP, content, read-only quiz, and previous/next | `/lessons/[lessonId]` |
| Written lessons as links in the course outline ("3 of 3 lessons") | `CourseAccordion.tsx` |
| A real 404 for unknown lessons | `src/proxy.ts` |
| A locked database table for the quiz answer keys | `supabase/migrations/…_lesson_quiz_answers.sql` |
| **Bug fix:** school pages crashed for signed-out visitors | `school-details.tsx` |
| 16 new unit tests and 5 new database tests (128 + 29 in total) | `*.test.ts(x)`, `supabase/tests/` |

## 2. Why this approach

**Content as data, not HTML.** A lesson is a list of blocks such as `{ type: "keyIdea", title, text }`, not a blob of HTML. Each block type has exactly one component that draws it. That gives you three things for free:
- **Consistency:** every key idea looks the same.
- **Safety:** text is always drawn *as text*, so a lesson can't inject markup or scripts. A test proves it.
- **Correctness:** misspell a block type or forget a field, and the build fails.

**One source of truth, copied where it's needed.** The lesson files are the source. The page reads them directly; the database gets only what it needs to *enforce rules*: the lesson id, its XP value, and the answer key.

**Secrets flow in one direction.** The answer key is in the lesson file, which is server-only. Pages receive `toPublicQuiz()`, which strips the answers, and a test checks the page data contains no `correctChoiceId` or explanations. In the database, answers live in the `private` schema, which the API can't reach at all.

**Never open a door before the lock exists.** The old `complete_lesson()` would award XP for any *published* lesson without a quiz. So the new lessons go into the database **unpublished** until checkpoint 2 replaces that function with one that checks answers.

## 3. Important files

| File | Why it matters |
|---|---|
| `src/types/lesson.ts` | The whole content model, including the "public" quiz type without answers |
| `src/components/lessons/LessonBlocks.tsx` | `Record<LessonBlockType, …>`: TypeScript forces a renderer for every block type |
| `src/lib/data/lessons.ts` | `server-only`, `toPublicQuiz()`, previous/next |
| `src/content/catalogue/lessons/lessons.test.ts` | The content checker: real module, open course, valid quiz, answers spread out |
| `supabase/migrations/20261121000100_lesson_quiz_answers.sql` | A *new* migration; old ones are never edited |

## 4. The important code, explained

### A union type for blocks

```ts
export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "keyIdea"; title: string; text: string }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | …
```

`type` is the *discriminant*. When code checks `block.type === "list"`, TypeScript knows `block.items` exists.

### Stripping the answers

```ts
export function toPublicQuiz(quiz) {
  return quiz.map(({ id, prompt, choices }) => ({ id, prompt, choices: … }));
}
```

Destructuring picks only the safe fields. `correctChoiceId` and `explanation` are simply never copied.

### Evolving the database safely

```sql
create table private.lesson_quiz_answers ( … );
alter table private.lesson_quiz_answers enable row level security;
revoke all on private.lesson_quiz_answers from public, anon, authenticated;
```

Migrations are append-only: the four from Milestone 2 are untouched, and this fifth one adds to them. It was applied with `supabase migration up` instead of `db reset`, so the local test accounts weren't wiped.

## 5. How the pieces communicate

```
src/content/catalogue/lessons/*.ts  (source of truth, includes answers)
   ├─► src/lib/data/lessons.ts  (server-only) ─► toPublicQuiz() ─► lesson page (no answers)
   ├─► getLessonLinksByModule() ─► CourseAccordion links
   ├─► src/proxy.ts  known lesson ids ─► 404 for unknown
   └─► npm run db:seed ─► public.lessons (id, xp, published=false)
                        └► private.lesson_quiz_answers (answer key only)
                                         ▲
                       checkpoint 2: complete_lesson(lesson, answers) checks here
```

## 6. Concepts to understand

- Discriminated unions, and exhaustive `Record<Union, …>` maps
- Rendering untrusted text safely (React escapes `{text}`; `dangerouslySetInnerHTML` is never used)
- Server-only modules and data minimisation (send the browser only what it needs)
- Database schemas as security boundaries (`public` vs `private`)
- Append-only migrations; `migration up` vs `db reset`
- Feature flags in data (`published`)

## 7. What testing caught or proved

- **A regression from Milestone 2:** every school page failed for signed-out visitors ("Couldn't load your profile (42501)"). The public page was asking for private data, and RLS correctly refused. Now mastery loads only for signed-in learners, and visitors see "Sign in to track your mastery". All eight schools were re-checked. *Lesson: test public pages while signed out after any change to data access.*
- **A content flaw caught by reading the answer keys:** 6 of 9 correct answers were "B". The choices were rearranged, and a test now fails if a lesson's answers all sit in the same position.
- **No answers leak:** the lesson page's raw HTML, including the data Next.js embeds for the browser, contains no explanation text and no `correctChoiceId`.
- **Locked table:** signed-in and anonymous users both get "permission denied" on the answer keys, and unpublished lessons are invisible to learners.
- Lessons return 200; unknown and malformed lesson URLs return 404.

## 8. Exercise

**Part A — add a block type.** Add `{ type: "tip"; text: string }` to `LessonBlock` in `src/types/lesson.ts`. Run `npm run typecheck`. Which file complains, and why is that helpful? Add a renderer for it, then undo both changes.

**Part B — look for the answers.** Open a lesson in the browser, then View Source (Ctrl+U) and search for one of the quiz explanations from the lesson file. Why isn't it there? Which function made sure of that?

**Part C — write a lesson outline.** Module 2 of the habits course is "Designing Your Environment". On paper, sketch lesson 1: a title, five or six blocks (including one `keyIdea`), and three quiz questions whose correct answers fall in different positions.
