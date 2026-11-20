# Database Design (preliminary)

> **Status: implemented locally (Milestone 2, checkpoint 1).** The SQL now lives in `supabase/migrations/`, which is the source of truth. This document explains the reasoning; where the two differ, the migrations win. Security tests: `supabase/tests/security.test.sql` (`npm run db:test`). Nothing has been applied to a hosted project.

## 1. Goals

1. **Every learner sees only their own progress.** Row Level Security (RLS) is on for every table.
2. **XP can't be faked.** The browser can never insert or change XP; only a server-side function can, after checking the work was really done.
3. **History is never lost.** XP is an append-only ledger. Totals are calculated, never stored as an editable number.
4. **The TypeScript types map 1:1.** Each table matches a type in `src/types/`, so the data-layer swap in `src/lib/data/` is mechanical.

## 2. Overview

```
auth.users (Supabase)
   │ 1:1
   ▼
profiles ───────────────┬──────────────┬─────────────────┬──────────────────┐
                        │ 1:N          │ 1:N             │ 1:N              │ 1:N
                        ▼              ▼                 ▼                  ▼
               xp_transactions  lesson_completions  user_achievements  user_tasks
                        ▲              │                 │                  │
                        └── written only by award functions (security definer)

CATALOGUE (public read, admin write)
schools ─1:N─► course_categories ─1:N─► courses ─1:N─► course_modules ─1:N─► lessons
achievements                    task_templates (daily missions / weekly objectives)
```

There are two kinds of table:

| Kind | Tables | Who can read | Who can write |
|---|---|---|---|
| **Catalogue** (same for everyone) | `schools`, `course_categories`, `courses`, `course_modules`, `lessons`, `achievements`, `task_templates` | Everyone signed in (the published ones) | Only migrations, seeds or admins, using the service role |
| **Personal** (one learner's data) | `profiles`, `xp_transactions`, `lesson_completions`, `user_achievements`, `user_tasks` | Only the owner | The owner may update `profiles`. Everything else is written only by `security definer` functions. |

## 3. Tables

### Enumerated types

```sql
create type attribute_key   as enum ('wisdom','intellect','strategy','creativity','eloquence','discipline');
create type xp_source_type  as enum ('lesson','course','mission','objective','achievement','adjustment');
create type course_level    as enum ('foundation','intermediate','advanced');
create type course_status   as enum ('open','planned');
create type task_kind       as enum ('daily','weekly');
create type task_status     as enum ('not_started','in_progress','completed');
```

These mirror the TypeScript unions `AttributeKey`, `XpSourceType`, `CourseLevel`, `CourseStatus` and `TaskStatus`.

### Catalogue

```sql
create table schools (
  slug               text primary key check (slug ~ '^[a-z0-9-]+$'),
  name               text not null,
  short_name         text not null,
  tagline            text not null,
  description        text not null,
  icon               text not null,
  primary_attribute  attribute_key not null,
  sort_order         int  not null default 0
);

create table course_categories (
  id           text primary key,
  school_slug  text not null references schools(slug) on delete restrict,
  title        text not null,
  description  text not null,
  sort_order   int  not null default 0
);

create table courses (
  id            text primary key,
  category_id   text not null references course_categories(id) on delete restrict,
  title         text not null,
  summary       text not null,
  level         course_level  not null,
  status        course_status not null default 'planned',
  sort_order    int not null default 0
);

create table course_modules (
  id          text primary key,
  course_id   text not null references courses(id) on delete restrict,
  title       text not null,
  sort_order  int  not null default 0
);

create table lessons (
  id           text primary key,
  module_id    text not null references course_modules(id) on delete restrict,
  title        text not null,
  xp_reward    int  not null check (xp_reward between 1 and 1000),
  published    boolean not null default false,
  sort_order   int  not null default 0
);
```

- **Text ids** (`'tech-web-development'`) match the sample data and keep URLs readable. Catalogue rows are created by migrations, not users, so guessable ids are fine.
- **`on delete restrict`** stops anyone deleting a course that learners have progress in.
- **`xp_reward` lives on the lesson**, so the *server* decides how much XP a lesson is worth, never the browser.
- **The catalogue's source of truth stays in TypeScript** (`src/content/`). `supabase/seed.sql` is *generated* from it (`npm run db:seed`), and a test fails if the two drift apart. As built, `course_modules` also has a `planned_lessons` column, and `achievements` and `task_templates` have `sort_order`, so the database mirrors the outline before any lessons exist.

### Personal

```sql
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 60),
  title         text not null default 'Initiate of the Ascent',
  created_at    timestamptz not null default now()
);

create table xp_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  amount       int  not null,
  source_type  xp_source_type not null,
  source_id    text not null,
  school_slug  text references schools(slug),
  description  text not null,
  created_at   timestamptz not null default now(),

  -- The same lesson, mission or achievement can never pay out twice.
  constraint xp_once_per_source unique (user_id, source_type, source_id),
  -- Only corrections may be negative, and zero-value rows are meaningless.
  constraint xp_amount_valid check (
    amount <> 0 and (amount > 0 or source_type = 'adjustment')
  )
);
create index xp_transactions_user_created on xp_transactions (user_id, created_at desc);

create table lesson_completions (
  user_id       uuid not null references profiles(id) on delete cascade,
  lesson_id     text not null references lessons(id) on delete restrict,
  completed_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table achievements (
  id           text primary key,
  title        text not null,
  description  text not null,
  xp_reward    int  not null default 0 check (xp_reward >= 0)
);

create table user_achievements (
  user_id         uuid not null references profiles(id) on delete cascade,
  achievement_id  text not null references achievements(id),
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table task_templates (
  id           text primary key,
  kind         task_kind not null,
  title        text not null,
  description  text not null,
  xp_reward    int  not null check (xp_reward between 1 and 500),
  target       int  not null default 1 check (target >= 1),
  unit         text not null default 'sessions',   -- "3 of 5 sessions"
  school_slug  text references schools(slug)       -- optional link to a school
);

create table user_tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  template_id  text not null references task_templates(id),
  period_start date not null,               -- the day, or the Monday of the week
  progress     int  not null default 0 check (progress >= 0),
  status       task_status not null default 'not_started',
  unique (user_id, template_id, period_start)
);
```

**Why `unique (user_id, source_type, source_id)` matters.** It's the database's guarantee against double-awarding. Even if a learner double-clicks, refreshes or replays a request, the second insert fails. For an `adjustment`, `source_id` is the id of the transaction being corrected, so each mistake can only be reversed once. The sample data shows this with `tx-15` and `tx-16`.

### Derived views

Totals are calculated, never stored:

```sql
create view character_xp
with (security_invoker = true) as         -- RLS of the *caller* applies
select user_id,
       greatest(0, sum(amount))::int as total_xp
from xp_transactions
group by user_id;

create view school_xp
with (security_invoker = true) as
select user_id, school_slug, sum(amount)::int as xp
from xp_transactions
where school_slug is not null
group by user_id, school_slug;
```

Levels, attribute ranks and mastery tiers stay in TypeScript (`src/lib/progression/`), because the curves are game design and are already fully tested there. If the SQL views are ever needed in reports, those functions would be ported along with matching tests.

### Quiz answer keys (Milestone 3)

`private.lesson_quiz_answers (lesson_id, question_id, correct_choice_id)` holds only the answer key for each written lesson's quiz, generated from `src/content/catalogue/lessons/`. It lives in the `private` schema (no API access), has RLS enabled, and all privileges revoked from `public`, `anon` and `authenticated`. Only security-definer functions read it. Database tests prove both signed-in and anonymous users get "permission denied".

## 4. Row Level Security

RLS is enabled on **every** table. With no policy, a table is invisible, which is the safe default.

```sql
alter table schools            enable row level security;
-- … repeated for every table …

-- Catalogue: signed-in users can read. Nobody writes through the API.
create policy "catalogue readable" on schools
  for select to authenticated using (true);
create policy "published lessons readable" on lessons
  for select to authenticated using (published);
-- (same select policy for course_categories, courses, course_modules,
--  achievements, task_templates)

-- Profiles: read and update your own row only.
create policy "own profile readable" on profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "own profile editable" on profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Personal progress: READ ONLY for the owner.
create policy "own xp readable" on xp_transactions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own completions readable" on lesson_completions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own achievements readable" on user_achievements
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own tasks readable" on user_tasks
  for select to authenticated using (user_id = (select auth.uid()));
```

There are **no insert, update or delete policies** on `xp_transactions`, `lesson_completions`, `user_achievements` or `user_tasks`. A learner using the public API key can't write to them at all, even with a modified browser. Writes happen only inside the functions below.

`(select auth.uid())` rather than a bare `auth.uid()` is Supabase's recommended form: it is evaluated once per query instead of once per row.

**Privileges are a second lock.** Supabase grants every new table to `anon` and `authenticated` by default, so the migration first runs `revoke all … from anon, authenticated`, then grants back only `select` (catalogue and own rows) and `update (display_name, title)` on `profiles`. Even if an RLS policy were written wrongly, a learner still couldn't insert XP or change `created_at`. **Anonymous visitors get no table access at all**; public pages read the catalogue from code.

**Every future migration that adds a table must repeat this**: enable RLS, revoke from the API roles, then grant only what's needed. The first security test fails if a table is missing RLS.

## 5. Awarding XP safely

The browser *asks* to complete a lesson. The database *decides*.

```sql
create schema if not exists private;      -- not exposed through the API

-- Internal: the only code path that inserts XP.
create function private.award_xp(
  p_user_id uuid, p_amount int, p_source_type xp_source_type,
  p_source_id text, p_school_slug text, p_description text
) returns boolean
language plpgsql
security definer
set search_path = ''                       -- prevents search-path hijacking
as $$
begin
  insert into public.xp_transactions
    (user_id, amount, source_type, source_id, school_slug, description)
  values
    (p_user_id, p_amount, p_source_type, p_source_id, p_school_slug, p_description)
  on conflict on constraint xp_once_per_source do nothing;
  return found;                            -- false = already awarded
end;
$$;
revoke all on function private.award_xp from public, anon, authenticated;

-- Public: what the app calls (supabase.rpc('complete_lesson', { p_lesson_id })).
create function public.complete_lesson(p_lesson_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();
  v_lesson record;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  select l.id, l.title, l.xp_reward, c.school_slug
    into v_lesson
    from public.lessons l
    join public.course_modules m   on m.id = l.module_id
    join public.courses co         on co.id = m.course_id
    join public.course_categories c on c.id = co.category_id
   where l.id = p_lesson_id and l.published and co.status = 'open';

  if not found then
    raise exception 'lesson not available' using errcode = 'P0002';
  end if;

  insert into public.lesson_completions (user_id, lesson_id)
  values (v_user, v_lesson.id)
  on conflict do nothing;

  -- Amount comes from the lessons table, never from the caller.
  return private.award_xp(v_user, v_lesson.xp_reward, 'lesson',
                          v_lesson.id, v_lesson.school_slug, v_lesson.title);
end;
$$;
revoke all on function public.complete_lesson from public, anon;
grant execute on function public.complete_lesson to authenticated;
```

Security properties:

| Threat | Defence |
|---|---|
| Browser sends a fake XP amount | The function takes only a lesson id. The amount comes from `lessons.xp_reward`. |
| Replaying the request for double XP | The `xp_once_per_source` unique constraint, plus `on conflict do nothing` |
| Completing an unpublished or planned lesson | The `published` and `status = 'open'` checks |
| Acting as another user | The user comes from `auth.uid()` (the session), never from a parameter |
| Inserting directly via the API | There are no insert policies, and `private.award_xp` isn't executable by API roles |
| Search-path hijacking of a `security definer` function | `set search_path = ''` and fully qualified table names |

> **Still to design (Milestone 3):** proof that a lesson was actually *studied*, such as a quiz score or minimum time. Today's design trusts "complete" once per lesson. That is safe against farming, because XP can be earned only once per lesson, but not against skipping.

Missions, objectives and achievements follow the same pattern. Each gets a public function that checks its rule server-side, then calls `private.award_xp`. Adjustments are inserted only by an admin using the service role, with `source_id` set to the transaction being corrected.

## 6. New-user setup

A trigger creates the profile when someone signs up:

```sql
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Seeker'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
```

## 7. Mapping to the TypeScript types

| Table or view | Type in `src/types/` | Notes |
|---|---|---|
| `schools` + categories + courses + modules | `School`, `CourseCategory`, `Course`, `CourseModule` | Nested in one query with Supabase's embedded selects |
| `profiles` | `CharacterProfile` | `created_at` → `joinedAt` |
| `xp_transactions` | `XpTransaction` | snake_case → camelCase in the data layer |
| `user_tasks` + `task_templates` | `DailyMission`, `WeeklyObjective` | Joined |
| `achievements` + `user_achievements` | `Achievement` | Left join; status is `earned` when a row exists |
| `character_xp`, `school_xp` | Inputs to `buildCharacterSummary()` | Or pass the raw ledger, as today |
| `lesson_completions` grouped by course | `LearningActivity` | Progress = completed ÷ published lessons, and "last studied" = latest `completed_at`. No separate enrolment table until one is needed. |

`supabase gen types typescript` will generate row types. The data layer converts them to the domain types above, so components never see database naming.

## 8. Migration and test plan

1. Migrations live in `supabase/migrations/`, one change per file, and are applied locally with the Supabase CLI first.
2. A seed script generates catalogue rows from `src/content/sample/schools.ts`, so content has one source of truth during the transition.
3. **RLS tests** (pgTAP or SQL scripts) for each table, confirming:
   - user A can't read user B's rows;
   - the `authenticated` role can't insert into `xp_transactions`;
   - `complete_lesson` called twice awards XP once;
   - `complete_lesson` on a planned course fails.
4. Run the Supabase security advisor before any migration reaches a hosted project.
5. Nothing is applied to a hosted project without explicit approval.
