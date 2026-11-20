-- =============================================================================
-- 3. Row Level Security and privileges
-- -----------------------------------------------------------------------------
-- Two independent locks, so one mistake can't open the door:
--   1. PRIVILEGES (grant/revoke) say which kinds of statement a role may run.
--   2. ROW LEVEL SECURITY policies say which ROWS those statements may touch.
-- Supabase's API roles: `anon` (not signed in) and `authenticated`.
-- With RLS enabled and no matching policy, a table looks empty: safe default.
-- =============================================================================

-- ---------------------------------------------------------------- enable RLS
alter table public.schools            enable row level security;
alter table public.course_categories  enable row level security;
alter table public.courses            enable row level security;
alter table public.course_modules     enable row level security;
alter table public.lessons            enable row level security;
alter table public.achievements       enable row level security;
alter table public.task_templates     enable row level security;
alter table public.profiles           enable row level security;
alter table public.xp_transactions    enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.user_achievements  enable row level security;
alter table public.user_tasks         enable row level security;

-- ---------------------------------------------------------------- privileges
-- Supabase grants every new table to anon and authenticated by default.
-- Take everything away, then give back only what each role needs.
revoke all on all tables in schema public from anon, authenticated;

-- Catalogue: read-only for signed-in learners. Written only by migrations/seed.
grant select on
  public.schools, public.course_categories, public.courses, public.course_modules,
  public.lessons, public.achievements, public.task_templates
to authenticated;

-- Personal data: read your own rows.
grant select on
  public.profiles, public.xp_transactions, public.lesson_completions,
  public.user_achievements, public.user_tasks,
  public.character_xp, public.school_xp
to authenticated;

-- The only direct write a learner may make: two columns of their own profile.
grant update (display_name, title) on public.profiles to authenticated;

-- ---------------------------------------------------------------- catalogue policies
create policy "catalogue: signed-in users can read schools"
  on public.schools for select to authenticated using (true);
create policy "catalogue: signed-in users can read categories"
  on public.course_categories for select to authenticated using (true);
create policy "catalogue: signed-in users can read courses"
  on public.courses for select to authenticated using (true);
create policy "catalogue: signed-in users can read modules"
  on public.course_modules for select to authenticated using (true);
create policy "catalogue: signed-in users can read published lessons"
  on public.lessons for select to authenticated using (published);
create policy "catalogue: signed-in users can read achievements"
  on public.achievements for select to authenticated using (true);
create policy "catalogue: signed-in users can read task templates"
  on public.task_templates for select to authenticated using (true);

-- ---------------------------------------------------------------- personal policies
-- (select auth.uid()) is evaluated once per query, not once per row.
create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "xp: read own"
  on public.xp_transactions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "lesson completions: read own"
  on public.lesson_completions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "achievements: read own"
  on public.user_achievements for select to authenticated
  using (user_id = (select auth.uid()));

create policy "tasks: read own"
  on public.user_tasks for select to authenticated
  using (user_id = (select auth.uid()));

-- Deliberately NO insert/update/delete policies on xp_transactions,
-- lesson_completions, user_achievements or user_tasks. Those rows are written
-- only by the security-definer functions in migration 4.
