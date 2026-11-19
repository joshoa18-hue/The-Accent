# Lesson 2 — Dashboard, Schools and Character

*Milestone 1, checkpoint 2. Covers composing pages from components, parallel data loading, expandable courses with native HTML, a small Client Component with `useEffect`, and component testing.*

---

## 1. What we built

| Feature | Where |
|---|---|
| Dashboard with all ten sections: welcome, character profile, level & XP, attributes, daily missions, weekly objectives, eight schools, current learning, achievements, continue learning | `src/app/page.tsx`, `src/components/dashboard/` |
| School pages: breadcrumb, header with stats, course categories, expandable courses showing their modules, a school mastery panel | `src/app/schools/[slug]/school-details.tsx`, `src/components/schools/` |
| Deep links that open a course: `/schools/…#course-…` | `src/lib/routes.ts`, `CourseHashOpener.tsx` |
| Character sheet: level, total XP, progress, six attributes, mastery in all eight schools, achievements (earned and locked), XP history | `src/app/character/page.tsx`, `src/components/character/` |
| Reusable `Panel` and `ArrowLink` | `src/components/ui/` |
| 19 new tests (48 in total) | `*.test.ts(x)` |

## 2. Why this approach

**Pages arrange; components display.** `app/page.tsx` fetches the data and decides the layout. Each section, such as `DailyMissionList`, only receives props and draws them. Because of this:

- the same `AttributeList` serves the dashboard (`variant="compact"`) and the character page (`variant="detailed"`);
- components can be tested without a server or a database;
- when Supabase arrives, no display component has to change.

**Native `<details>` instead of a JavaScript accordion.** The browser already knows how to expand and collapse content, handle the keyboard and tell screen readers "expanded/collapsed". Writing that ourselves would be more code and more bugs. Tailwind's `group-open:rotate-180` turns the chevron by reacting to the `open` attribute, so even the animation needs no JavaScript.

**No fake buttons.** Missions show their status but have no "complete" button. Courses show their structure but have no "start lesson" button. A button that does nothing, or that awards XP from the browser, would break the rules of the project. The "Continue Learning" call-to-action is a real link to a real page.

## 3. Important files

| File | Why it matters |
|---|---|
| `src/app/page.tsx` | Parallel loading with `Promise.all`, and page composition |
| `src/lib/data/activity.ts` | `toView()` joins activities with course names, like a SQL JOIN |
| `src/components/ui/Panel.tsx` | One component gives every section the same structure and accessibility |
| `src/components/schools/CourseAccordion.tsx` | `<details>` / `<summary>` |
| `src/components/schools/CourseHashOpener.tsx` | `"use client"` + `useEffect` |
| `src/lib/routes.ts` | Every internal URL is built in one place |
| `src/lib/data/source.ts` | `combineSources()` keeps the "Sample data" label honest |

## 4. The important code, explained

### Loading in parallel

```ts
const [character, schools, missions] = await Promise.all([
  getCharacterSummary(), getSchools(), getDailyMissions(),
]);
```

Awaiting three database calls one after another takes `A + B + C` milliseconds. `Promise.all` starts them together and takes only as long as the slowest one. The square brackets on the left are *array destructuring*: they name each result in order.

### The data layer shapes data for the UI

`getLearningActivities()` returns each activity *with* its course title and school name attached (`LearningActivityView`). Components never search through schools to find a name. In Milestone 2 this becomes a single SQL query with a `JOIN`.

The `.filter((view): view is LearningActivityView => view !== null)` line is a *type guard*. It tells TypeScript that after this filter, nothing in the array is `null`.

### Lookup tables instead of `if` chains

```ts
const statusDisplay: Record<TaskStatus, {...}> = {
  completed:   { label: "Completed",   Icon: CheckCircle2, className: "text-emerald-soft" },
  in_progress: { label: "In progress", Icon: CircleDot,    className: "text-gold-400" },
  not_started: { label: "Not started", Icon: Circle,       className: "text-slate-dim" },
};
```

`Record<TaskStatus, …>` forces an entry for *every* status. If someone adds a new status to the type later, TypeScript points straight at this table until they handle it.

### Our second Client Component: `CourseHashOpener`

```tsx
useEffect(() => {
  openCourseFromHash();
  window.addEventListener("hashchange", openCourseFromHash);
  return () => window.removeEventListener("hashchange", openCourseFromHash);
}, []);
```

- `useEffect` runs **in the browser, after** the component appears on screen. `window` and `document` only exist there.
- The function it *returns* is the **cleanup**. It removes the listener when the component leaves the screen, which prevents memory leaks and duplicate listeners.
- `[]` means "run once when it appears". The component returns `null`, so it adds behaviour without drawing anything.

It sits *inside* the Suspense boundary, next to the courses, so it runs only after the courses exist.

## 5. How the pieces communicate

```
Dashboard page ──► getLearningActivities() ──► [activity + course + school]
     │
     ├─► <ContinueLearningCard activity={activities[0]} />
     │        └─ <ArrowLink href={routes.course(slug, id)} />  →  "/schools/x#course-y"
     │
     ▼  (user clicks)
School page ──► <Suspense> ──► SchoolDetails ──► <CourseAccordion id="course-y" />
                                         └────► <CourseHashOpener />  opens #course-y
```

The two pages never import each other. They agree on one thing: the URL format in `routes.ts`. That is called a **contract**.

## 6. Concepts to understand

- Composition: building pages out of small components
- `Promise.all` and array destructuring
- `Record<K, V>` and lookup tables
- Type guards (`x is T`)
- `useEffect`, cleanup functions and the dependency array
- Event listeners (`addEventListener` / `removeEventListener`)
- URL fragments (`#id`)
- Native HTML elements: `<details>`, `<summary>`, `<dl>`, `<nav aria-label="Breadcrumb">`
- Component tests with React Testing Library: query by **role and text**, the way a user finds things, not by CSS classes

## 7. What testing caught or proved

- **The full flow, in a real browser.** Clicking "View course outline" on the dashboard opened the right school, scrolled to the course and expanded it.
- **The keyboard.** Pressing Enter on a focused course summary expands it.
- **Honesty, as automated tests.** `DailyMissionList` and `CourseAccordion` have tests asserting there is *no* button. If someone later adds a fake button, a test fails.
- **An accidental security check.** A test trick that loaded pages inside an `<iframe>` was blocked by our `X-Frame-Options: DENY` header. That header exists to stop other sites embedding The Ascent to trick users (clickjacking). We saw it working.

## 8. Exercise

**Part A — trace a value.** Starting from the "4" shown under *Courses in progress* on the dashboard, follow it backwards: from `WelcomeSection` to `page.tsx` to `getLearningActivities()` to `sampleLearningActivities`. Write down each file and line. This is the most useful debugging skill there is.

**Part B — add a mission.** In `src/content/sample/activity.ts`, add a fifth daily mission with status `"in_progress"` and a reward of 30 XP. Reload the dashboard. Does "1 of 4 completed today" change to "1 of 5"? Which component worked that out?

**Part C — break it on purpose.** In `DailyMissionList.tsx`, delete the `in_progress` line from `statusDisplay`. Run `npm run typecheck` and read the error. Explain in one sentence why TypeScript complained. Then undo the change.
