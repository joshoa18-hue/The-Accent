-- =============================================================================
-- 7. Missions, objectives and achievements earned on the server
--    (Milestone 3, checkpoint 3)
-- -----------------------------------------------------------------------------
-- Every task and achievement gets a RULE the database can verify from facts
-- it already holds: completed lessons and the XP ledger. After each passed
-- lesson, complete_lesson() calls private.evaluate_progress(), in the same
-- transaction, which:
--   1. updates the learner's daily and weekly tasks (progress + status);
--   2. awards a task's XP once per period (source id = "<task>:<period>");
--   3. grants any achievement whose threshold is now reached.
-- Nothing here can be triggered by the browser directly.
--
-- Days and weeks are in UTC; weeks start on Monday.
-- =============================================================================

create type public.task_rule as enum ('lessons_completed', 'modules_completed');
create type public.achievement_rule as enum (
  'lessons_completed', 'schools_studied', 'schools_with_xp', 'school_xp', 'total_xp', 'streak_days'
);

-- Existing rows get a placeholder so the columns can be NOT NULL; the seed
-- (generated from src/content/catalogue/) provides the real values. The
-- defaults are then removed so every future row must say its rule.
alter table public.task_templates add column rule public.task_rule not null default 'lessons_completed';
alter table public.task_templates alter column rule drop default;

alter table public.achievements
  add column rule public.achievement_rule not null default 'lessons_completed',
  add column threshold int not null default 1 check (threshold >= 1);
alter table public.achievements alter column rule drop default;
alter table public.achievements alter column threshold drop default;

-- ---------------------------------------------------------------------------
-- The value of an achievement rule for one learner, over their whole history.
-- ---------------------------------------------------------------------------
create function private.achievement_value(p_user uuid, p_rule public.achievement_rule)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select case p_rule
    when 'lessons_completed' then
      (select count(*) from public.lesson_completions where user_id = p_user)
    when 'schools_studied' then
      (select count(distinct cat.school_slug)
         from public.lesson_completions lc
         join public.lessons l             on l.id = lc.lesson_id
         join public.course_modules m      on m.id = l.module_id
         join public.courses co            on co.id = m.course_id
         join public.course_categories cat on cat.id = co.category_id
        where lc.user_id = p_user)
    when 'schools_with_xp' then
      (select count(*) from (
         select school_slug from public.xp_transactions
          where user_id = p_user and school_slug is not null
          group by school_slug having sum(amount) > 0) s)
    when 'school_xp' then
      (select coalesce(max(total), 0) from (
         select sum(amount) as total from public.xp_transactions
          where user_id = p_user and school_slug is not null
          group by school_slug) s)
    when 'total_xp' then
      (select greatest(0, coalesce(sum(amount), 0)) from public.xp_transactions where user_id = p_user)
    when 'streak_days' then
      -- "Gaps and islands": consecutive dates minus their row number give the
      -- same value, so grouping by it finds each run of days in a row.
      (select coalesce(max(run_length), 0) from (
         select count(*) as run_length from (
           select day, day - (row_number() over (order by day))::int as island
             from (select distinct (completed_at at time zone 'utc')::date as day
                     from public.lesson_completions where user_id = p_user) days
         ) numbered
         group by island) runs)
  end;
$$;

-- ---------------------------------------------------------------------------
-- Update tasks and achievements for one learner. Returns what was newly
-- earned, e.g. [{"kind":"daily","title":"Complete a lesson","xp":20}].
-- Safe to call any number of times: everything is idempotent.
-- ---------------------------------------------------------------------------
create function private.evaluate_progress(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today    date := (now() at time zone 'utc')::date;
  v_week     date := v_today - (extract(isodow from v_today)::int - 1);  -- Monday
  v_rewards  jsonb := '[]'::jsonb;
  v_start    date;
  v_end      date;
  v_progress int;
  v_status   public.task_status;
  t          record;
  a          record;
begin
  -- 1 + 2. Daily missions and weekly objectives.
  for t in select * from public.task_templates order by kind, sort_order loop
    v_start := case t.kind when 'daily' then v_today else v_week end;
    v_end   := case t.kind when 'daily' then v_today + 1 else v_week + 7 end;

    if t.rule = 'lessons_completed' then
      select count(*) into v_progress
        from public.lesson_completions c
       where c.user_id = p_user
         and c.completed_at >= (v_start::timestamp at time zone 'utc')
         and c.completed_at <  (v_end::timestamp at time zone 'utc');
    else -- modules_completed: every planned lesson done, the last one in this period
      select count(*) into v_progress from (
        select m.id
          from public.course_modules m
          join public.lessons l             on l.module_id = m.id
          join public.lesson_completions c  on c.lesson_id = l.id and c.user_id = p_user
         where m.planned_lessons > 0
         group by m.id, m.planned_lessons
        having count(*) >= m.planned_lessons
           and max(c.completed_at) >= (v_start::timestamp at time zone 'utc')
           and max(c.completed_at) <  (v_end::timestamp at time zone 'utc')
      ) finished;
    end if;

    v_status := case
      when v_progress >= t.target then 'completed'
      when v_progress > 0 then 'in_progress'
      else 'not_started'
    end;

    insert into public.user_tasks (user_id, template_id, period_start, progress, status)
    values (p_user, t.id, v_start, v_progress, v_status)
    on conflict (user_id, template_id, period_start)
      do update set progress = excluded.progress, status = excluded.status;

    if v_status = 'completed' and private.award_xp(
         p_user, t.xp_reward,
         (case t.kind when 'daily' then 'mission' else 'objective' end)::public.xp_source_type,
         t.id || ':' || v_start::text, null, t.title) then
      v_rewards := v_rewards || jsonb_build_object('kind', t.kind, 'title', t.title, 'xp', t.xp_reward);
    end if;
  end loop;

  -- 3. Achievements (after tasks, so their XP counts towards XP thresholds).
  for a in
    select ach.* from public.achievements ach
     where not exists (select 1 from public.user_achievements ua
                        where ua.user_id = p_user and ua.achievement_id = ach.id)
     order by ach.sort_order
  loop
    if private.achievement_value(p_user, a.rule) >= a.threshold then
      insert into public.user_achievements (user_id, achievement_id) values (p_user, a.id)
      on conflict do nothing;
      if found then
        v_rewards := v_rewards || jsonb_build_object('kind', 'achievement', 'title', a.title, 'xp', 0);
      end if;
    end if;
  end loop;

  return v_rewards;
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_lesson: same checks as migration 6, now also evaluating progress
-- and reporting newly earned rewards.
-- ---------------------------------------------------------------------------
create or replace function public.complete_lesson(p_lesson_id text, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_lesson   record;
  v_wrong    text[];
  v_total    int;
  v_awarded  boolean;
  v_rewards  jsonb;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'answers must be an object of question id → choice id' using errcode = '22023';
  end if;

  select l.id, l.title, l.xp_reward, c.school_slug
    into v_lesson
    from public.lessons l
    join public.course_modules m      on m.id = l.module_id
    join public.courses co            on co.id = m.course_id
    join public.course_categories c   on c.id = co.category_id
   where l.id = p_lesson_id
     and l.published
     and co.status = 'open';

  if not found then
    raise exception 'lesson not available' using errcode = 'P0002';
  end if;

  select count(*)::int,
         coalesce(array_agg(k.question_id order by k.question_id)
                  filter (where p_answers ->> k.question_id is distinct from k.correct_choice_id), '{}')
    into v_total, v_wrong
    from private.lesson_quiz_answers k
   where k.lesson_id = v_lesson.id;

  if v_total = 0 then
    raise exception 'lesson has no quiz' using errcode = 'P0002';
  end if;

  if cardinality(v_wrong) > 0 then
    return jsonb_build_object('passed', false, 'wrong', to_jsonb(v_wrong), 'awarded', false, 'xp', 0,
                              'rewards', '[]'::jsonb);
  end if;

  insert into public.lesson_completions (user_id, lesson_id)
  values (v_user, v_lesson.id)
  on conflict do nothing;

  v_awarded := private.award_xp(
    v_user, v_lesson.xp_reward, 'lesson', v_lesson.id, v_lesson.school_slug, v_lesson.title
  );

  v_rewards := private.evaluate_progress(v_user);

  return jsonb_build_object(
    'passed', true,
    'wrong', '[]'::jsonb,
    'awarded', v_awarded,
    'xp', case when v_awarded then v_lesson.xp_reward else 0 end,
    'rewards', v_rewards
  );
end;
$$;

revoke all on function private.achievement_value(uuid, public.achievement_rule) from public, anon, authenticated;
revoke all on function private.evaluate_progress(uuid) from public, anon, authenticated;
revoke all on function public.complete_lesson(text, jsonb) from public, anon, authenticated;
grant execute on function public.complete_lesson(text, jsonb) to authenticated;
