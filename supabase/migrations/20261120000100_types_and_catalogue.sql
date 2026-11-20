-- =============================================================================
-- 1. Enumerated types and catalogue tables
-- -----------------------------------------------------------------------------
-- The catalogue (schools → categories → courses → modules → lessons, plus
-- achievements and mission templates) is the same for every learner.
-- Its source of truth is TypeScript in src/content/; supabase/seed.sql is
-- generated from it by `npm run db:seed`. These tables exist so personal rows
-- can reference real ids, and so the SERVER knows how much XP things are worth.
-- See docs/DATABASE_DESIGN.md.
-- =============================================================================

-- These mirror the TypeScript unions in src/types/.
create type public.attribute_key  as enum ('wisdom', 'intellect', 'strategy', 'creativity', 'eloquence', 'discipline');
create type public.xp_source_type as enum ('lesson', 'course', 'mission', 'objective', 'achievement', 'adjustment');
create type public.course_level   as enum ('foundation', 'intermediate', 'advanced');
create type public.course_status  as enum ('open', 'planned');
create type public.task_kind      as enum ('daily', 'weekly');
create type public.task_status    as enum ('not_started', 'in_progress', 'completed');

create table public.schools (
  slug               text primary key check (slug ~ '^[a-z0-9-]+$'),
  name               text not null,
  short_name         text not null,
  tagline            text not null,
  description        text not null,
  icon               text not null,
  primary_attribute  public.attribute_key not null,
  sort_order         int  not null default 0
);

create table public.course_categories (
  id           text primary key,
  school_slug  text not null references public.schools (slug) on delete restrict,
  title        text not null,
  description  text not null,
  sort_order   int  not null default 0
);
create index course_categories_school_slug_idx on public.course_categories (school_slug);

create table public.courses (
  id           text primary key,
  category_id  text not null references public.course_categories (id) on delete restrict,
  title        text not null,
  summary      text not null,
  level        public.course_level  not null,
  status       public.course_status not null default 'planned',
  sort_order   int  not null default 0
);
create index courses_category_id_idx on public.courses (category_id);

create table public.course_modules (
  id               text primary key,
  course_id        text not null references public.courses (id) on delete restrict,
  title            text not null,
  planned_lessons  int  not null default 0 check (planned_lessons >= 0),
  sort_order       int  not null default 0
);
create index course_modules_course_id_idx on public.course_modules (course_id);

-- Empty in Milestone 2: lesson content arrives in Milestone 3.
create table public.lessons (
  id          text primary key,
  module_id   text not null references public.course_modules (id) on delete restrict,
  title       text not null,
  -- The server, not the browser, decides what a lesson is worth.
  xp_reward   int  not null check (xp_reward between 1 and 1000),
  published   boolean not null default false,
  sort_order  int  not null default 0
);
create index lessons_module_id_idx on public.lessons (module_id);

create table public.achievements (
  id           text primary key,
  title        text not null,
  description  text not null,
  xp_reward    int  not null default 0 check (xp_reward >= 0),
  sort_order   int  not null default 0
);

create table public.task_templates (
  id           text primary key,
  kind         public.task_kind not null,
  title        text not null,
  description  text not null default '',
  xp_reward    int  not null check (xp_reward between 1 and 500),
  target       int  not null default 1 check (target >= 1),
  unit         text not null default 'sessions',
  school_slug  text references public.schools (slug) on delete restrict,
  sort_order   int  not null default 0
);
create index task_templates_school_slug_idx on public.task_templates (school_slug);
