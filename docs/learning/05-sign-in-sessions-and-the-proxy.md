# Lesson 5 — Sign-in: magic links, sessions, Server Actions and the Proxy

*Milestone 2, checkpoint 2. Covers passwordless sign-in, how a session lives in cookies, Server Actions and Route Handlers, the Proxy, and defending against open redirects.*

---

## 1. What we built

| Feature | Where |
|---|---|
| Sign-in page with an email form (magic link, no password) | `src/app/login/` |
| A Server Action that emails the link | `src/app/login/actions.ts` |
| The page the email link lands on, which turns the link into a session | `src/app/auth/confirm/route.ts` |
| A working **Sign out** button | `src/app/auth/actions.ts`, `AccountStatus.tsx` |
| "Who is signed in?" in one place (a Data Access Layer) | `src/lib/auth/session.ts` |
| The Proxy: refreshes sessions, guards private pages, **real 404s for unknown schools** | `src/proxy.ts`, `src/lib/supabase/proxy-session.ts` |
| Protection against redirecting to other websites | `src/lib/auth/redirect.ts` |
| A branded sign-in email | `supabase/templates/magic_link.html` |
| 30 new tests (83 in total) | `*.test.ts` |

The dashboard and character pages now require sign-in. The schools stay public. The data shown is **still sample data**; checkpoint 3 swaps in each learner's own.

## 2. Why this approach

**Magic links instead of passwords.** There's no password to choose, forget, reset, leak or reuse on another site. Owning the email inbox *is* the proof of identity. New learners use the same form, and the first link creates their account.

**Everything happens on the server.** The Supabase keys are read from variables *without* the `NEXT_PUBLIC_` prefix, so Next.js never puts them in browser JavaScript. The browser only ever talks to *our* pages; our server talks to Supabase.

**Three layers of checks, each doing its own job:**

| Layer | Job | Can it be the only check? |
|---|---|---|
| **Proxy** | Fast first pass on every request: refresh the session, redirect if obviously signed out | ❌ It only reads cookies; it doesn't query data |
| **`requireUser()`** | The real check, run by the page itself before showing anything private | ✅ for the page |
| **Row Level Security** | The database only ever returns *your* rows | ✅ for the data, even if app code has a bug |

**One-time tokens, not codes in the URL.** The email link carries a `token_hash` that works **once** and expires in an hour. Our server swaps it for a session. Clicking the link again shows "That sign-in link is invalid or has expired".

## 3. Important files

| File | Why it matters |
|---|---|
| `src/proxy.ts` | Runs before every page. Read it top to bottom; it's short. |
| `src/lib/supabase/proxy-session.ts` | How refreshed cookies reach both the page *and* the browser |
| `src/lib/auth/session.ts` | `getCurrentUser()` and `requireUser()`: the only way the app asks "who is this?" |
| `src/app/login/actions.ts` | A Server Action: a function the form calls that runs only on the server |
| `src/app/auth/confirm/route.ts` | A Route Handler: a URL that does work and redirects, with no page |
| `src/lib/auth/redirect.ts` | Small, but it blocks a whole class of phishing tricks |

## 4. The important code, explained

### A Server Action called by a form

```tsx
// LoginForm.tsx (Client Component)
const [state, formAction, pending] = useActionState(sendSignInLink, initialState);
return <form action={formAction}> … </form>;
```

```ts
// actions.ts
"use server";
export async function sendSignInLink(previous: SignInState, formData: FormData) { … }
```

`"use server"` turns the function into an endpoint that only runs on the server. React sends the form data to it and gives back the returned state, `"error"` or `"sent"`, which the form displays. `pending` is `true` while it runs, so the button says "Sending link…". The reply is identical whether or not an account existed, so the form can't be used to find out who has signed up.

### The open-redirect guard

```ts
safeNextPath("/character")              // "/character"
safeNextPath("https://evil.example")    // "/"
safeNextPath("//evil.example")          // "/"  (browsers read // as "another site")
safeNextPath("/\\evil.example")         // "/"  (browsers treat \ like /)
```

After signing in we send people back to where they were going, but that address comes from the URL, which an attacker can write. Without this check, a link to *our* real sign-in page could finish on a fake copy somewhere else. The tests try 12 different tricks.

### Refreshing the session in the Proxy

```ts
setAll(cookiesToSet, headers) {
  for (const { name, value } of cookiesToSet) request.cookies.set(name, value);  // the page sees them
  response = NextResponse.next({ request });
  for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options); // the browser keeps them
}
```

A session is a short-lived *access token* plus a *refresh token*. When the access token is nearly expired, Supabase swaps it for a new one. The new cookies have to go to two places: the request, so the page being rendered sees them, and the response, so the browser stores them.

### `"use cache: private"` for the session

```ts
export async function getCurrentUser() {
  "use cache: private";
  cacheLife({ stale: 30 });
  …
}
```

Checking a token compares its expiry with the current time. Next.js 16 tries to prerender pages ahead of time, and "now" can't be prerendered, which caused the red dev-tools badge we saw. A *private* cache runs at request time with this visitor's cookies and is **never** stored where another visitor could get it.

## 5. How the pieces communicate

```
1. /character (signed out)
   Proxy: no session ──► 307 to /login?next=%2Fcharacter

2. /login  ──form──►  sendSignInLink (Server Action)
                         ├─ checkEmail()        (typos rejected here)
                         ├─ cookie "ascent_return_to" = safeNextPath(next)
                         └─ supabase.auth.signInWithOtp() ──► Supabase Auth ──► email (Mailpit locally)

3. Email link ──► /auth/confirm?token_hash=…&type=email   (Route Handler)
                         ├─ supabase.auth.verifyOtp()  ──► session cookies set
                         └─ 307 to safeNextPath(cookie)  ──► /character

4. /character (signed in)
   Proxy: refreshes cookies ──► page: requireUser() ✓ ──► renders
   Sidebar: <Suspense><AccountStatus/></Suspense> ──► email + [Sign out]

5. [Sign out] ──► signOut (Server Action) ──► cookies cleared ──► /login
```

## 6. Concepts to understand

- Authentication (who are you?) vs authorization (what may you see?)
- Passwordless / magic-link sign-in; one-time tokens
- Cookies: `httpOnly`, `sameSite`, `secure`, `path`, `maxAge`
- Access tokens vs refresh tokens; why a token's *signature* must be verified (`getClaims`, never `getSession`, on the server)
- Server Actions (`"use server"`), `useActionState`, progressive enhancement
- Route Handlers (`route.ts` with `GET`)
- The Proxy (formerly "middleware") and why it's only an *optimistic* check
- Data Access Layer
- Open redirects; account enumeration
- `"use cache: private"`

## 7. What testing caught or proved

**Automated (30 new tests):** 12 redirect attacks are refused, email checks pass, and secret keys are refused even if pasted into `.env.local`.

**In the browser, with the real local stack:**

| Check | Result |
|---|---|
| `/` and `/character` while signed out | 307 to `/login` (with `?next=%2Fcharacter`) |
| `/schools`, `/schools/music-creative-arts` | 200: public |
| `/schools/not-a-real-school` | **404**, fixing a Milestone 1 limitation |
| Invalid email | Clear error, typed text kept |
| Valid email | "Check your inbox"; the email arrived in Mailpit with our subject line |
| Clicking the link | Landed on `/character`, the page originally requested |
| Sign-up trigger | Database created the profile ("Seeker") automatically |
| `/login` while signed in | Redirected to the dashboard |
| Sign out | All Supabase cookies deleted, sent to `/login`, `/character` redirects again |
| Reusing the email link | Rejected, with "That sign-in link is invalid or has expired" |
| `/login?next=https://evil.example` and `//evil.example` | The form received `/` |
| Phone width (375px) | Sign in shown in the header, no sideways scrolling |

**Bugs found and fixed on the way:**
1. **Lost backslashes.** Writing files through the shell turned `\\` into `\`. That broke a regular expression, made two security tests test the wrong thing, and weakened the Proxy's file-type pattern. The tests caught it. Fix: write such files with the editor, then re-run the tests.
2. **`Date.now()` during prerendering.** Checking a token's expiry uses the clock. Fixed with `"use cache: private"`, as the Next.js docs recommend.
3. **A sign-out click during compilation did nothing.** That was a dev-mode race: the page was still compiling. Repeated cleanly, the server log showed `ƒ signOut()` and every cookie was removed. Lesson: **check the logs before believing a bug report**, including your own.

## 8. Exercise

**Part A — follow a sign-in.** Run `npm run db:start` and `npm run dev`. Sign in with a made-up address such as `you@example.test`. Open the mail catcher at http://127.0.0.1:55324. In the email, find the `token_hash`. Click the link, then click it again. What happens the second time, and which line in `route.ts` decides that?

**Part B — break the guard.** In `redirect.ts`, temporarily delete the line that checks `value.startsWith("//")`. Run `npx vitest run src/lib/auth`. Which test fails, and what attack would have worked? Undo the change.

**Part C — find the three locks.** Imagine `requireUser` were accidentally removed from the character page. Write down what a signed-out visitor would see in Milestone 3, once that page shows real data from the database, and why. (Hint: look at section 2's table.)
