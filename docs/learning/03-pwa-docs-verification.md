# Lesson 3 — PWA readiness, documentation and verification

*Milestone 1, checkpoint 3. Covers the web app manifest, generating images from code, writing documentation that matches the code, and designing a database you haven't built yet.*

---

## 1. What we built

| Feature | Where |
|---|---|
| Web app manifest: name, colours, start page, icons | `src/app/manifest.ts` → `/manifest.webmanifest` |
| PNG icons generated from code (192, 512, and a 512 maskable) | `src/lib/brand/app-icon.tsx`, `src/app/icons/[variant]/route.ts` |
| Favicon (SVG) and iOS home-screen icon | `src/app/icon.svg`, `src/app/apple-icon.ts` |
| Project documentation | `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CLAUDE.md` |
| Preliminary database design with security model | `docs/DATABASE_DESIGN.md` |
| Environment variable template, placeholders only | `.env.example` |
| Milestone 1 development report | `docs/reports/milestone-1.md` |

## 2. Why this approach

**A manifest, not a service worker.** A *manifest* is a small JSON file that tells the browser "this site can be installed as an app: here's its name, icon and colours". A *service worker* is a background script that can serve pages offline. The manifest is harmless and done. A service worker that caches pages could show yesterday's XP as if it were today's, so it waits until there's real data to design around (Milestone 3).

**Icons from code.** Instead of committing PNG files drawn in an image editor, `renderAppIcon()` draws the same SVG peak as `LogoMark` using `ImageResponse` from `next/og`. Next.js runs it once at build time and serves the result as a normal PNG. Change the logo in one place, rebuild, and every icon updates.

**"Maskable" icons.** Android crops app icons into circles, squircles or teardrops. A *maskable* icon fills the whole square with background colour and keeps the artwork inside the central safe zone, so nothing important is cut off. That's why the maskable version has no rounded corners and a smaller peak.

**Documentation that is honest.** While writing the docs, I checked every claim against the code. Two sentences were wrong: one said the ledger "handles duplicates" and one said a test checks attributes. Neither was true, so both were rewritten. Documentation that describes code you *wish* you had is worse than none.

**Designing the database before building it.** Writing the schema down now exposed details the screens didn't: where XP amounts should come from (the `lessons` table, never the browser) and how to stop double-awarding (a unique constraint). Those are the hard decisions. Typing the SQL later is the easy part.

## 3. Important files

| File | Why it matters |
|---|---|
| `src/app/manifest.ts` | A *metadata file convention*: export a function and Next.js serves it at a fixed URL |
| `src/app/icons/[variant]/route.ts` | A **Route Handler**: a URL that returns data (here a PNG) instead of a page |
| `src/lib/brand/app-icon.tsx` | One renderer for every icon size |
| `docs/DATABASE_DESIGN.md` §4–5 | Row Level Security and the `complete_lesson` function, the heart of "XP can't be faked" |
| `CLAUDE.md` | The project's rules, read automatically by AI assistants |

## 4. The important code, explained

### A Route Handler with a lookup table and a type guard

```ts
const variants = {
  "icon-192.png": { size: 192 },
  "icon-512.png": { size: 512 },
  "icon-maskable-512.png": { size: 512, maskable: true },
} as const;

function isVariant(value: string): value is Variant {
  return Object.hasOwn(variants, value);
}

export async function GET(_request: Request, { params }: RouteContext<"/icons/[variant]">) {
  const { variant } = await params;
  if (!isVariant(variant)) return new Response("Not found", { status: 404 });
  return renderAppIcon(variants[variant]);
}
```

- A file named `route.ts` exporting `GET` answers HTTP GET requests. It has no React page and no layout.
- `generateStaticParams()` (in the same file) lists the three variants, so all three PNGs are made at build time.
- `isVariant` is a **type guard**, like the one in lesson 2. Inside the `if`, TypeScript knows `variant` is one of the three keys. That's what makes `variants[variant]` type-safe.
- `Object.hasOwn` is used rather than `variant in variants`, because `in` also matches inherited names like `"toString"`.

### The database refuses to trust the browser

```sql
create function public.complete_lesson(p_lesson_id text) ...
  v_user := auth.uid();                      -- who: from the session, not a parameter
  select ... l.xp_reward ... where l.published and co.status = 'open';
  return private.award_xp(v_user, v_lesson.xp_reward, 'lesson', v_lesson.id, ...);
```

The browser sends only *which lesson*. *Who* comes from the login session, and *how much* comes from the `lessons` table. Then the unique constraint `(user_id, source_type, source_id)` makes a second award for the same lesson impossible. Each defence covers a different trick.

## 5. How the pieces communicate

```
Browser                     Next.js                         (Milestone 2) Supabase
───────                     ───────                         ──────────────────────
<link rel="manifest"> ───►  app/manifest.ts
       │                        └─ icons: /icons/icon-512.png ───► icons/[variant]/route.ts
       │                                                            └─ renderAppIcon()
"Install app" uses name, colours and icons

Future:  "Complete lesson" ─► Server Action ─► supabase.rpc('complete_lesson')
                                                   └─► private.award_xp ─► xp_transactions
         Dashboard ◄── src/lib/data/* (SELECT, filtered by RLS) ◄── character_xp view
```

## 6. Concepts to understand

- Web app manifest; installable apps (PWA); service workers, and why we postponed them
- Maskable icons and the safe zone
- Route Handlers (`route.ts`, `GET`, `Response`)
- Generating images with `ImageResponse`
- Environment variables: `.env.local`, the `NEXT_PUBLIC_` prefix (visible in the browser), and server-only secrets
- Row Level Security; `security definer` functions; `set search_path`
- Unique constraints as business rules
- Documentation as a contract that must match the code

## 7. What testing caught or proved

- Every manifest and icon URL returns the right content type. An unknown variant (`/icons/nope.png`) returns 404.
- The page `<head>` contains `<link rel="manifest">`, the SVG favicon and the apple-touch-icon. Next.js added them automatically.
- Viewing the PNGs in the browser confirmed the artwork, and that the maskable icon keeps the peak inside the safe zone.
- Proofreading the docs against the code found two false claims, which were fixed before committing.
- `npm run check` passes: lint, types, tests and the production build.

## 8. Exercise

**Part A — inspect the manifest.** Run `npm run dev`, open DevTools → **Application** → **Manifest**. Find the three icons. Which one is labelled maskable? Is there any warning?

**Part B — change the brand.** In `src/lib/brand/app-icon.tsx`, change `gold400` to another colour. Open `http://localhost:3000/icons/icon-512.png`. Did it change? Now look at the sidebar logo. Why didn't it change? (Hint: what does `LogoMark` use for its colours?) Undo the change.

**Part C — think like an attacker.** Read §5 of `docs/DATABASE_DESIGN.md`. Write down three ways someone might try to get free XP, and the line of SQL that stops each one. Then find the one weakness the document admits is still open.
