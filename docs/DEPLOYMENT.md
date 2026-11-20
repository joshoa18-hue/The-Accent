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
   - **Region:** London (`eu-west-2`), or the region nearest you
   - **Database password:** generate a long random one and keep it in your password manager. It's never stored in the repo.
2. **You:** in a terminal in the project folder, sign the CLI in:
   ```bash
   npx supabase login
   ```
3. **Claude:** link the project with `npx supabase link --project-ref <ref>`, where the ref is in the project URL. **You** type the database password when asked.
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

> **CLI note:** in this version of the Supabase CLI, `db push` and `test db` target the **local** database unless you add `--remote`.

## 2. Supabase sign-in settings (dashboard)

In the Supabase dashboard → **Authentication**:

- [ ] **URL Configuration → Site URL:** the Vercel production address, e.g. `https://the-ascent.vercel.app`. Do this after step 3.4 if you don't know it yet. The email link is built from this address.
- [ ] **URL Configuration → Redirect URLs:** add `https://<your-app>.vercel.app/auth/confirm`.
- [ ] **Emails → Magic Link:** subject `Your sign-in link for The Ascent`; body = the contents of `supabase/templates/magic_link.html`.
- [ ] **Emails → Confirm signup:** same subject and body.
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
