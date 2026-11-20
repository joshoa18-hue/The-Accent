# Lesson 6 — Real data, profile editing and the Content-Security-Policy

*Milestone 2, checkpoint 3. Covers reading each learner's own data, mapping database rows to app types, private caching, your first database write, and locking down the browser with a CSP.*

---

## 1. What we built

| Feature | Where |
|---|---|
| The dashboard and character sheet show **the signed-in learner's own data** | `src/lib/data/character.ts`, `activity.ts` |
| Pure, tested converters from database rows to app types | `src/lib/data/mappers.ts` |
| A Supabase client that just forwards the learner's token | `createSupabaseDataClient()` in `src/lib/supabase/server.ts` |
| The curriculum promoted from "sample" to real catalogue content | `src/content/catalogue/schools.ts` |
| Empty states for a brand-new learner | `XpHistory.tsx` and others |
| **Profile editing**: display name and title | `src/app/character/actions.ts`, `ProfileForm.tsx` |
| A safer sign-out that leaves nothing behind | `src/app/auth/signout/route.ts` |
| An enforced **Content-Security-Policy** | `src/lib/security/csp.ts`, `next.config.ts` |
| 29 new tests (112 in total), and the 24 database tests still green | `*.test.ts(x)` |

## 2. Why this approach

**The database decides what you can see, not our code.** Data functions don't say "get Ada's XP". They say "get XP", and the request carries Ada's token. Row Level Security returns only Ada's rows. Even a bug in our code can't show one learner another's data, and the browser test with two learners proved it.

**Mappers keep the two worlds apart.** The database says `display_name` and `created_at`; the app says `displayName` and `joinedAt`. All conversion happens in one file of small pure functions. Components never learn database names, and the conversions can be tested without a database.

**Private caching.** Learner data depends on cookies and the clock, so it can't be prebuilt. `"use cache: private"` runs at request time, shares a result within one request, and never stores it where another visitor could get it. After a save, `updateTag()` tells Next.js the learner's data changed, so the very next page shows it.

**Defence in depth for the first write.** Saving a profile passes four checks:
1. **Signed in?** `getCurrentUser()`.
2. **Is the text sensible?** `checkProfile()` trims it, removes invisible characters, and limits it to 1–60 characters.
3. **Is it your row?** Row Level Security.
4. **Is it an allowed column, with valid data?** The column-level grant and `CHECK` constraints.

**A CSP as a seatbelt.** If an attacker ever slipped HTML into a page, the browser would still refuse to load scripts or images from their server or send data there. We trialled it in **report-only** mode, which logs but doesn't block, saw zero violations, then switched it to **enforce**.

## 3. Important files

| File | Why it matters |
|---|---|
| `src/lib/data/mappers.ts` | Small pure functions; the easiest place to see how rows become app types |
| `src/lib/data/character.ts` | A complete "read learner data" function: private cache, tag, query, map |
| `src/app/character/actions.ts` | A complete "write" Server Action with every check |
| `src/app/auth/signout/route.ts` | Why sign-out is a Route Handler (read the comment) |
| `src/lib/security/csp.ts` | The whole security policy in about 20 lines |

## 4. The important code, explained

### Reading as the learner

```ts
export async function getCharacterSummary() {
  "use cache: private";
  cacheTag(LEARNER_DATA_TAG);
  const supabase = await createSupabaseDataClient();      // carries the learner's token
  const [profile, ledger] = await Promise.all([
    supabase.from("profiles").select("id, display_name, title, created_at").single(),
    supabase.from("xp_transactions").select("*").order("created_at"),
  ]);
  …
  return { data: buildCharacterSummary({ profile: toProfile(profile.data), … }), source: "database" };
}
```

There's no `where user_id = …` anywhere. `.single()` means "I expect exactly one row", and RLS makes sure the only visible profile is yours.

### Writing, then reading your own write

```ts
const { error } = await supabase.from("profiles")
  .update({ display_name, title }).eq("id", user.id)
  .select("id").single();          // fails loudly if 0 rows changed
updateTag(LEARNER_DATA_TAG);       // next render fetches fresh data
```

`.select("id").single()` matters: an `update` that matches no rows isn't an error in SQL, so asking for the row back turns a silent no-op into a visible failure.

### The CSP builder

```ts
"default-src": ["'self'"],
"object-src": ["'none'"],
"frame-ancestors": ["'none'"],
"connect-src": ["'self'", ...(isDev ? ["ws:"] : [])],
```

Each line is a rule: by default, only load things from our own site; never load plugins; never let another site frame us; only connect to ourselves (plus the dev server's live-reload socket during development). A test checks that the production policy names **no outside domain at all**.

## 5. How the pieces communicate

```
Browser ──GET /character──► Proxy (refresh cookies) ──► page: requireUser()
                                                          │
             ┌────────────────────────────────────────────┤ (parallel, private cache)
             ▼                       ▼                    ▼
   getCharacterSummary()     getAchievements()   getRecentXpTransactions()
             └──── createSupabaseDataClient() ── token ──► Supabase ── RLS ──► only your rows
                                                          │
                                          mappers ──► app types ──► components

Browser ──POST (form)──► updateProfile ──► checkProfile ──► UPDATE (RLS + grants + CHECKs)
                                         └─► updateTag(LEARNER_DATA_TAG) ──► fresh data next render

Response headers ──► Content-Security-Policy ──► browser enforces the allow-list
```

## 6. Concepts to understand

- Row Level Security in practice: queries without user filters
- Mapping and serialisation: snake_case vs camelCase, keeping internal ids (like `user_id`) out of app types
- `"use cache: private"`, `cacheTag`, `updateTag`, and read-your-own-writes
- Validation at several layers; normalising text (Unicode NFC, control characters, direction overrides)
- Soft vs full navigation, and why sign-out needs a full one
- HTTP `303 See Other`, the `Origin` header, `Clear-Site-Data`
- Content-Security-Policy directives; report-only vs enforce; the `'unsafe-inline'` trade-off

## 7. What testing caught or proved

**Proved in the browser:**

| Check | Result |
|---|---|
| New learner | Level 1, 0 XP, missions "Not started", achievements locked, "No XP yet", **no Sample data label** |
| XP from the database (295 XP inserted as admin) | Level 2, 195 / 200, 5 to level 3; Technology "Apprentice · Rank 2"; "First Step" earned |
| Empty profile name | "Enter a display name.", and the field is marked invalid |
| Valid profile save (production build) | "Saved"; the very next dashboard load greets the new name |
| **Two learners** | Learner B sees only their own fresh character; nothing of A's anywhere in the page |
| CSP in report-only | Real pages: zero violations. A deliberately injected outside image: reported (`img-src`) |
| CSP enforced (production) | Pages, styles and fonts all load; no "Refused to…" messages |
| Sign-out | 303 to `/login`, no cookies, no previous learner data in the page; Back asks the server again and is redirected |
| Cross-site sign-out attempt | 403 |

**Bugs found and fixed:**

1. **"A use-cache function is awaiting a promise created outside it."** Parallel data functions shared hidden state inside the full Supabase auth client. Fix: data reads use a minimal client that only forwards the learner's token.
2. **The previous learner's name and email stayed in the page after sign-out.** The sign-out Server Action's soft navigation kept hidden copies of earlier pages. Fix: sign-out is a plain form POST to a Route Handler that answers with a full redirect. This is the most important catch of the checkpoint, because on a shared computer it would have leaked personal data.
3. **The database tests broke once real accounts existed.** The test users shared email addresses with accounts created during browser testing. Fix: test users use the reserved `.invalid` domain. Tests should never depend on what data happens to exist.
4. **One stale page in dev mode after saving.** This is documented dev-only cache behaviour, and it was **verified correct in a production build** rather than assumed.

## 8. Exercise

**Part A — prove isolation yourself.** Sign in as `a@example.test` and change your display name. Sign out, then sign in as `b@example.test`. In DevTools → Elements, press Ctrl+F and search for A's name. Why can't you find it? Name **two** different things that each prevent it.

**Part B — watch the CSP work.** On any page, open the DevTools Console and run:
`document.body.appendChild(Object.assign(document.createElement('img'), { src: 'https://example.com/x.png' }))`
Read the red "Refused to load…" message. Which directive blocked it? Now find that directive in `src/lib/security/csp.ts`.

**Part C — break a mapper.** In `mappers.ts`, change `toWeeklyObjectives` so it no longer uses `Math.min(…, template.target)`. Run `npx vitest run src/lib/data`. Which test fails, and what would a learner have seen on screen? Undo the change.
