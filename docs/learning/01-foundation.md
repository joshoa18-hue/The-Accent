# Lesson 1 — The Foundation

*Milestone 1, checkpoint 1. Covers project setup, the design system, the domain model, the data layer, XP maths and the app shell.*

---

## 1. What we built

| Layer | What it is | Where |
|---|---|---|
| Project | Next.js 16 + TypeScript (strict) + Tailwind CSS 4, tracked with git | project root |
| Design system | Colours, fonts and motion as *tokens*; reusable `Card`, `ProgressBar`, `Badge`, `SectionHeading`, `SampleDataNotice` | `src/app/globals.css`, `src/components/ui/` |
| Domain model | TypeScript types describing schools, courses, XP, characters and missions | `src/types/` |
| Sample content | The eight schools' curriculum outline, a sample learner and their XP ledger | `src/content/sample/` |
| Data layer | The only doorway pages use to get data | `src/lib/data/` |
| Progression engine | Pure functions that turn an XP ledger into levels, attributes and mastery | `src/lib/progression/` |
| App shell | Desktop sidebar, mobile header, mobile tab bar, skip link | `src/components/layout/` |
| Pages | Dashboard, Schools, 8 school pages, Character, 404 (foundation versions) | `src/app/` |
| Tests | 29 automated tests | `*.test.ts(x)` files |

## 2. Why this approach

**Layers with one job each.** Data flows in one direction:

```
content/sample  →  lib/data  →  app/ pages  →  components/
  (raw data)      (doorway)    (fetch + arrange)  (draw)
                      ↑
               lib/progression
               (pure maths)
```

- **Pages never import sample data directly.** They call `getSchools()`, `getCharacterSummary()`, and so on. In Milestone 2 only the inside of those functions changes (to Supabase queries). This idea is called *abstraction*: hide *how* something is done behind a stable *what*.
- **XP is a ledger, not a number.** A bank doesn't store "balance = 500" and let you edit it. It stores every deposit and withdrawal, and the balance is their sum. `sampleTransactions` works the same way, with a correction line (`tx-16`) that reverses a duplicate award. Level, attributes and mastery are *derived* from the ledger, so they can never disagree.
- **Server first.** Every page is a Server Component, which renders on the server and sends finished HTML. Only `NavLink` is a Client Component, because it must read the browser's URL to highlight the current page.
- **Native HTML where possible.** `role="progressbar"`, `aria-current="page"`, real `<nav>`/`<section>`/`<header>` elements and a skip link make the app usable with a keyboard or screen reader for free.

## 3. Important files

| File | Why it matters |
|---|---|
| `src/app/globals.css` | Design tokens. `--color-gold-400` becomes the classes `text-gold-400`, `bg-gold-400`, … |
| `src/app/layout.tsx` | Root layout: loads fonts, loads the schools, wraps every page in `AppShell` |
| `src/types/progression.ts` | Defines `XpTransaction`, the heart of progression |
| `src/lib/progression/levels.ts` | The levelling formula |
| `src/lib/progression/character.ts` | Builds the whole character from the ledger |
| `src/lib/data/*.ts` | The data layer |
| `src/components/layout/Sidebar.tsx` | Navigation and the `<Suspense>` fallback pattern |
| `src/app/schools/[slug]/page.tsx` | Dynamic route: one file serves all eight schools |
| `next.config.ts` | Security headers |

## 4. The important code, explained

### The levelling formula (`levels.ts`)

Going from level *L* to *L+1* costs `100 × L` XP. The total needed to *reach* a level is

```
100 × level × (level − 1) / 2       → level 2: 100, level 3: 300, level 8: 2,800
```

`levelForXp` solves that equation backwards with a square root. It then corrects the answer with two small loops, because computers store decimals approximately (`0.1 + 0.2 === 0.30000000000000004`). The test *"agrees with xpRequiredForLevel for every level"* checks all 100 levels, so a rounding mistake can't slip through.

### Union types (`types/school.ts`)

```ts
export type SchoolSlug = "faith-scripture-wisdom" | "technology-computers-ai" | ...;
```

A `SchoolSlug` can only be one of those eight strings. Misspell one anywhere and the editor underlines it before you even run the app.

### `DataResult<T>` (`types/data.ts`)

```ts
interface DataResult<T> { data: T; source: "sample" | "database" }
```

`<T>` is a *generic*: a placeholder for "some type". `DataResult<School[]>` holds schools and `DataResult<CharacterSummary>` holds a character. The `source` field powers the "Sample data" label, which disappears by itself once real data arrives.

### Dynamic routes (`app/schools/[slug]/page.tsx`)

The folder name `[slug]` means "any value here". `generateStaticParams()` lists the eight real slugs so Next.js pre-builds those pages at build time. The page reads the URL *inside* a `<Suspense>` boundary (in `school-details.tsx`). This lets Next.js preload one shared "App Shell" for every school link, which keeps navigation instant.

### The Suspense fallback in the sidebar

`NavLink` uses `usePathname()`. For an address unknown at build time (such as `/schools/typo`), the pathname isn't available during prerendering, so the component *suspends* (waits). `<Suspense fallback={…StaticNavLink…}>` shows identical links without a highlight in the meantime. Without it, the production build fails.

## 5. How the pieces communicate

1. A browser requests `/`.
2. `layout.tsx` (server) awaits `getSchools()` and renders `AppShell`, passing `schools` down as a **prop**.
3. `page.tsx` (server) awaits `getCharacterSummary()`, which calls `buildCharacterSummary()`, which calls `sumXp()` and `getLevelProgress()`.
4. The page passes `character.level` to `<LevelSummary level={…} />`, which passes numbers to `<ProgressBar value max label />`.
5. The finished HTML goes to the browser. Only `NavLink`'s small piece of JavaScript runs there.

Props always flow **down**, from parent to child. Children never reach up to fetch their own data. That keeps every component predictable and easy to test.

## 6. Concepts to understand

- **Components and props**: functions that take inputs and return UI.
- **Server vs Client Components**: where code runs, and why `"use client"` should be rare.
- **TypeScript types, union types and generics.**
- **async/await and Promises**: `params` is a Promise in Next.js 16.
- **Pure functions**: same input, same output, no side effects. That's why the XP maths is easy to test.
- **Derived state vs stored state**: store the ledger, calculate the totals.
- **Unit testing**: Arrange → Act → Assert (look at `ledger.test.ts`).
- **Accessibility**: semantic HTML and ARIA attributes.
- **Responsive design**: mobile-first classes, with `lg:` overrides for screens 1024px and wider.

## 7. Two problems we hit, and what they teach

1. **Dependency conflict.** `npm install` failed because the scaffold used Node 20 types while you run Node 24, and Vitest wanted matching types. *Lesson:* read the error, then fix the cause (align the versions) instead of forcing it with `--force`.
2. **A fix that broke something else.** Moving the school page's URL read into `<Suspense>` fixed an instant-navigation warning, but it changed unknown schools from HTTP 404 to 200. We only caught it because we tested status codes. With Cache Components this is documented behaviour: the page still shows the 404 screen and is marked `noindex`. *Lesson:* re-test after every fix, and write down the trade-offs you accept.

## 8. Exercise

**Part A — read the code.** Open `src/content/sample/character.ts`. Using only the formula above, work out by hand which level 3,220 XP gives and how far it is to the next level. Then run `npm run dev` and compare your answer with the dashboard.

**Part B — write a test.** In `src/lib/progression/levels.test.ts`, add a test proving that **5,400 XP is exactly level 11**. (Check it first: 100 × 11 × 10 / 2 = ?) Run `npm run test` and watch it pass. Then change the expected level to 10, watch the test fail, read the error message, and change it back.

**Part C — stretch.** Add a ninth colour token, `--color-ivory: #fbf8f1;`, to `globals.css`. Use `text-ivory` on the dashboard heading in `SectionHeading.tsx` and see it change. Then undo it, since it's just practice.
