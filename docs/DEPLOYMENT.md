# Deploying The Ascent

A repeatable checklist for putting The Ascent online, using **Supabase** (database and sign-in) and **Vercel** (the Next.js app), deployed from a **private GitHub repository**. Steps marked **You** involve accounts, passwords or approvals and are done by the project owner. Steps marked **Claude** are done by the assistant, each with your OK.

> Phase 1 is **private**: only the owner can sign in. Opening it to others is a later, separate step (§6).

---

## 0. Before you start

- [ ] `npm run check` passes on your laptop (stop Docker first on a low-memory machine).
- [ ] `npm run db:test` passes against the local database.
- [ ] Nothing secret is committed: `git status` shows no `.env.local`, and `.env.example` holds placeholders only.

## 1. Supabase project (hosted database)

1. **You:** sign up at supabase.com and create a project:
   - **Name:** `the-ascent`
   - **Region:** the one nearest you. **Check the Region dropdown before clicking Create**: it can't be changed later. (The Ascent's project uses **US West, Oregon**.)
   - **Database password:** generate a long random one and keep it in your password manager. It's never stored in the repo.
2. **You:** in a terminal in the project folder, sign the CLI in:
   ```bash
   npx supabase login
   ```
3. **Claude:** link the project with `npx supabase link --project-ref <ref>`, where the ref is in the project URL. With the current CLI this uses your login and **doesn't ask for the database password**. The ref is stored in `supabase/.temp/`, which is git-ignored.
4. **Claude:** preview the migrations, then apply them **with the seed** to the empty database:
   ```bash
   npx supabase db push --remote --dry-run
   ```
   ```bash
   npx supabase db push --remote --include-seed
   ```
   This is the first time all migrations run from scratch, so it proves the rebuild works.
5. **Claude:** run the security tests against the hosted database. They run inside a transaction that's rolled back, so nothing is left behind:
   ```bash
   npx supabase test db --remote
   ```

> **CLI notes** (learned on the first real run):
> - `db push`, `test db`, `db query` and `db advisors` target the **local** database unless you add `--remote`.
> - Commands that change or read a hosted project ask "…on project X · production?", defaulting to **No**. Run them where someone can answer, or add `--yes` once the action has been approved.
> - `test db --remote` runs the tests inside a **Docker** container on your machine, so Docker must be running.
> - The remote test runner connects as a temporary `cli_login_postgres` role that can't use the `extensions` schema. `supabase/tests/security.test.sql` therefore switches to `postgres` explicitly (`set local role postgres`).
6. **Claude:** run Supabase's security advisor:
   ```bash
   npx supabase db advisors --remote --yes
   ```
   Expected: one **accepted** warning, "Signed-In Users Can Execute SECURITY DEFINER Function" for `complete_lesson`. That's intentional: it's the single guarded way to complete a lesson, and the database tests cover its rules. Anything else must be investigated before going live.

### First run: results (20 November 2026)

| Check | Result |
|---|---|
| `db push --remote --include-seed` on an empty project | ✅ all 7 migrations and the seed applied (**first full rebuild from scratch**) |
| `test db --remote` | ✅ 50/50 (after the role fix above) |
| State afterwards | 8 schools, 26 courses, 8 published lessons, 24 answer keys, 4 tasks, 6 achievements; **0 users, 0 XP rows**; pgTAP removed; no public table without RLS |
| `db advisors --remote` | ✅ only the accepted `complete_lesson` warning |

## 2. Supabase sign-in settings (dashboard)

In the Supabase dashboard → **Authentication**:

- [ ] **URL Configuration → Site URL:** the Vercel production address, e.g. `https://the-ascent.vercel.app`. Do this after step 3.4 if you don't know it yet. The email link is built from this address.
- [ ] **URL Configuration → Redirect URLs:** add `https://<your-app>.vercel.app/auth/confirm`.
- [ ] **Email templates: leave them as Supabase's defaults.** Hosted projects can't edit templates until custom SMTP is set up (§6). The app handles the default email's link: Supabase verifies it, then sends the browser to `/auth/confirm?code=…`, and the app exchanges the code using the PKCE verifier cookie set when the email was requested. (Locally, our own template in `supabase/templates/` sends `token_hash` links instead; `/auth/confirm` accepts both.)
- [ ] **Leave sign-ups on for now.** They're turned off in step 4, after you've created your own account.

> **Email in phase 1:** Supabase's built-in email only sends to members of your Supabase team, and only a few per hour. That's enough while you're the only user. A real email service is part of §6.

## 3. GitHub and Vercel (the app)

1. **You:** create a **private** GitHub repository called `the-ascent`, with no README or licence (the project already has them).
2. **Claude:** add it as the `origin` remote and push the `main` branch.
3. **You:** sign up at vercel.com with GitHub, choose **Add New → Project**, and import `the-ascent`. Framework: Next.js, detected automatically.
4. **You / Claude:** in the Vercel project, **Settings → Environment Variables** (Production and Preview):

   | Name | Value | Notes |
   |---|---|---|
   | `SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase → Project Settings → API |
   | `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | **Publishable** key only. The app refuses secret keys. |

   Do **not** add `DEV_MAILBOX_URL` (it's for local development) or any secret / service-role key.
5. Node.js version: `package.json` asks for `24.x`; Vercel reads it automatically.
6. **Deploy.** Note the production address, then go back to §2 and set the Site URL and redirect URL.

## 4. First sign-in and lock-down

1. **You:** open the production address, sign in with your real email, and click the link in your inbox.
2. **You:** Supabase → Authentication → **Sign In / Providers** → turn **off** "Allow new users to sign up". From now on, only your account can sign in.

## 5. Smoke test the live site

- [ ] `/` while signed out → redirected to `/login`; `/schools` and every school page load.
- [ ] `/schools/not-a-school` and `/lessons/not-a-lesson` → **404**.
- [ ] Sign in: the email arrives and the link lands you back on the site.
- [ ] Open a lesson, pass its quiz: **+40 XP**, any missions or achievements are listed, and the dashboard updates.
- [ ] Sign out: you land on `/login`, and Back doesn't show your data.
- [ ] Response headers include `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, and no `X-Powered-By`.
- [ ] The browser console shows no "Refused to…" CSP messages.
- [ ] On a phone: header, tab bar, lesson reading and the quiz all work.

## 6. Later: opening it to other people

- [ ] A custom domain (Vercel → Domains).
- [ ] A real email service (e.g. Resend), set under Supabase → Authentication → SMTP, sending from your domain.
- [ ] Turn sign-ups back on.
- [ ] A short privacy notice: what's stored (email, display name, progress) and how to ask for deletion.
- [ ] Backups: check the Supabase plan's backup policy.

## Live deployment log

| Date | Event | Result |
|---|---|---|
| 20 Nov 2026 | Hosted database built from scratch (US West) | ✅ 7 migrations + seed; 50/50 security tests; advisor: one accepted warning |
| 21 Nov 2026 | First deploy to **https://the-accent.vercel.app** (Vercel, team POG, Hobby) | ✅ public pages, 404s, CSP/HSTS/security headers, no quiz answers in page source |
| 21 Nov 2026 | Sign-in failed with Supabase's default email link | Fixed: `/auth/confirm` now also exchanges PKCE `code` links (commit 8a0f2c8) |
| 22 Nov 2026 | Owner's first live sign-in | ✅ account created; profile created by the database trigger |

## Everyday operations

| Task | How |
|---|---|
| Deploy a change | Push to `main`; Vercel builds and deploys automatically. Every push to another branch gets its own preview URL. |
| Roll back | Vercel → Deployments → pick the previous one → **Promote to Production** (instant). |
| Change the database | Add a **new** migration file, test locally (`npm run db:test`), then `npx supabase db push --remote`. Never edit a migration that's already been applied. |
| Add lessons | Follow `docs/WRITING_LESSONS.md`; the new seed rows must also reach the hosted database (insert the new lessons and answer keys). |
| Free-tier pause | Supabase pauses free projects after about a week unused; restore from the dashboard. |

## What never goes in the repository

- The database password
- Secret / service-role keys
- `.env.local` (git-ignored)

Values like these go only in your password manager and in the Vercel / Supabase dashboards.
