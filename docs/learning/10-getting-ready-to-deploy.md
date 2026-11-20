# Lesson 10 — Getting ready to deploy

*Hosting, checkpoint 1. Covers what changes between "works on my laptop" and "safe on the internet": cookies, HTTPS, error pages, configuration, and a repeatable checklist.*

---

## 1. What we built

| Change | Where |
|---|---|
| Session cookies are now `HttpOnly`, `Secure` (in production) and `SameSite=lax` | `src/lib/supabase/cookies.ts` |
| HSTS header in production builds | `next.config.ts` |
| A friendly error page with a working "Try again" | `src/app/error.tsx` |
| Node.js version pinned (`"engines": { "node": "24.x" }`) | `package.json` |
| A step-by-step deploy checklist | `docs/DEPLOYMENT.md` |
| `.env.example` explains local vs hosted values | `.env.example` |
| 5 new tests (163 in total) | `cookies.test.ts`, `error.test.tsx` |

## 2. Why this approach

**Cookies carry your login, so lock them down.** Supabase's defaults let page JavaScript read the session cookie, because many apps use Supabase *in the browser*. Ours never does, so the cookie is now:

| Flag | Protects against |
|---|---|
| `HttpOnly` | A script injected into a page (XSS) reading and stealing the login token |
| `Secure` | The cookie travelling over unencrypted HTTP |
| `SameSite=lax` | Other websites making your browser send forms to The Ascent while you're signed in (CSRF) |

**HTTPS, every time.** `Strict-Transport-Security` tells a browser: "for the next two years, only ever talk to this site over HTTPS". After the first visit, even typing `http://` is upgraded before anything is sent.

**Errors shouldn't leak or strand people.** Without `error.tsx`, a database hiccup shows Next.js's bare default page. Ours explains what happened in plain words, offers a real **Try again** button and a link home, and shows a **reference id** instead of the error message. Error messages can reveal how the system works inside; the id lets you find the full error in the server logs.

**Configuration, not code.** Production differs from your laptop only in two environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) set in Vercel's dashboard. The same code runs everywhere, and secrets never touch git.

**A checklist beats memory.** Deploying involves many small settings across three services. `docs/DEPLOYMENT.md` lists them in order, says who does each step, and ends with a smoke test, so it can be repeated and checked.

## 3. Important files

| File | Why it matters |
|---|---|
| `docs/DEPLOYMENT.md` | The whole deployment, step by step |
| `src/lib/supabase/cookies.ts` | Four lines that make stolen-token attacks much harder |
| `src/app/error.tsx` | Next.js 16's error boundary: note the `retry` prop |

## 4. The important code, explained

```ts
export const sessionCookieOptions = {
  path: "/", sameSite: "lax", httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const;
```

`process.env.NODE_ENV` is `"production"` in `npm run build` / `npm start` and on Vercel, and `"development"` in `npm run dev`. Browsers treat `http://localhost` as secure, so even `Secure` cookies work in a local production test.

```tsx
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) { … }
```

In this version of Next.js the recovery function is called **`retry`** (older versions called it `reset`), and `error` is typed `unknown`, because anything can be thrown in JavaScript. We read the `digest` field carefully instead of assuming its shape.

## 5. How the pieces communicate

```
Your laptop ──git push──► GitHub (private) ──► Vercel builds `npm run build` with Node 24
                                                  │  env: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
                                                  ▼
Browser ──HTTPS only (HSTS)──► Vercel (Next.js) ──server-side only──► Supabase (London)
        ◄── Set-Cookie: sb-…; Secure; HttpOnly; SameSite=lax
```

## 6. Concepts to understand

- Cookie flags: `HttpOnly`, `Secure`, `SameSite`, `Path`, `Max-Age`
- XSS vs CSRF, and which flag defends against which
- HTTPS and HSTS
- Error boundaries; why production hides error messages (`digest`)
- Environments and configuration via environment variables
- Pinning runtime versions (`engines`)
- Checklists and smoke tests

## 7. What testing caught or proved

- **The cookie flags, from the server's real reply:** `sb-127-auth-token=…; Path=/; Max-Age=34560000; Secure; HttpOnly; SameSite=lax`.
- **Sign-in still works** with the stricter cookie on a local production build ("Welcome back, Ada"), and **page JavaScript can no longer see the session cookie** (`document.cookie` shows no `sb-` cookies).
- **Headers in production:** `Content-Security-Policy`, `Strict-Transport-Security: max-age=63072000`, `X-Frame-Options: DENY`.
- **The error page:** "Try again" calls `retry`, there's a link home, the error message is never shown, and the reference id is.
- **A docs catch:** in this Supabase CLI, `db push` and `test db` target the **local** database unless you add `--remote`. Older guides online omit this. The checklist says so explicitly.

## 8. Exercise

**Part A — see the flags yourself.** Run a production build locally, sign in, and open DevTools → Application → Cookies. Which columns show ✓ for the `sb-…` cookie? Then run `document.cookie` in the Console. Why is the session cookie missing from it?

**Part B — read the checklist as if you were deploying.** Open `docs/DEPLOYMENT.md`. Which three steps can *only* you do, and why can't an assistant do them for you?

**Part C — break HSTS (on paper).** HSTS lasts two years. What would happen to visitors if you later moved The Ascent to a host without HTTPS? Why is that a good reason to never do so?
