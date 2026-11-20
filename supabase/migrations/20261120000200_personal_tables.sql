-- =============================================================================
-- 2. Personal tables: one learner's own data
-- -----------------------------------------------------------------------------
-- Every row belongs to one user (user_id → profiles.id → auth.users.id).
-- Deleting an account deletes its rows (on delete cascade).
-- =============================================================================

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 60),
  title         text not null default 'Initiate of the Ascent'
                check (char_length(title) between 1 and 60),
  created_at    timestamptz not null default now()
);

-- The XP ledger. Rows are only ever ADDED (corrections are new rows), and only
-- by trusted functions in migration 4. Totals are calculated, never stored.
create table public.xp_transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  amount       int  not null,
  source_type  public.xp_source_type not null,
  source_id    text not null,
  school_slug  text references public.schools (slug) on delete restrict,
  description  text not null,
  created_at   timestamptz not null default now(),

  -- The same lesson, mission or achievement can never pay out twice.
  -- For an adjustment, source_id is the id of the row being corrected.
  constraint xp_once_per_source unique (user_id, source_type, source_id),
  -- Zero-value rows are meaningless; only corrections may be negative.
  constraint xp_amount_valid check (
    amount <> 0 and (amount > 0 or source_type = 'adjustment')
  )
);
create index xp_transactions_user_created_idx on public.xp_transactions (user_id, created_at desc);
create index xp_transactions_school_slug_idx on public.xp_transactions (school_slug);

create table public.lesson_completions (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  lesson_id     text not null references public.lessons (id) on delete restrict,
  completed_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_completions_lesson_id_idx on public.lesson_completions (lesson_id);

create table public.user_achievements (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  achievement_id  text not null references public.achievements (id) on delete restrict,
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index user_achievements_achievement_id_idx on public.user_achievements (achievement_id);

create table public.user_tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  template_id   text not null references public.task_templates (id) on delete restrict,
  -- The day (daily missions) or the Monday of the week (weekly objectives).
  period_start  date not null,
  progress      int  not null default 0 check (progress >= 0),
  status        public.task_status not null default 'not_started',
  unique (user_id, template_id, period_start)
);
create index user_tasks_template_id_idx on public.user_tasks (template_id);

-- -----------------------------------------------------------------------------
-- Derived views. security_invoker = true means the CALLER's Row Level Security
-- applies, so a learner only ever sums their own rows.
-- -----------------------------------------------------------------------------
create view public.character_xp
with (security_invoker = true) as
select user_id,
       greatest(0, sum(amount))::int as total_xp
from public.xp_transactions
group by user_id;

create view public.school_xp
with (security_invoker = true) as
select user_id, school_slug, sum(amount)::int as xp
from public.xp_transactions
where school_slug is not null
group by user_id, school_slug;
