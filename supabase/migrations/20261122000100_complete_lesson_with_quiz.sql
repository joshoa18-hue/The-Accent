-- =============================================================================
-- 6. Completing a lesson requires passing its quiz (Milestone 3, checkpoint 2)
-- -----------------------------------------------------------------------------
-- Replaces complete_lesson(text) from migration 4, which awarded XP for any
-- published lesson without checking anything. The old version is removed so
-- it can't be called any more; the new one takes the learner's answers and
-- checks them against private.lesson_quiz_answers (migration 5) BEFORE any
-- XP is awarded.
--
-- Guarantees, all enforced here in the database:
--   WHO    the learner comes from auth.uid() (their login), never a parameter
--   WHAT   only published lessons in OPEN courses
--   PROOF  every quiz question answered correctly
--   HOW MUCH  from public.lessons.xp_reward, never from the caller
--   ONCE   lesson_completions primary key + xp_once_per_source unique key
-- =============================================================================

drop function if exists public.complete_lesson(text);

create function public.complete_lesson(p_lesson_id text, p_answers jsonb)
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

  -- Every question in the answer key must be answered with the right choice.
  -- Missing answers count as wrong; extra keys in p_answers are ignored.
  select count(*)::int,
         coalesce(array_agg(k.question_id order by k.question_id)
                  filter (where p_answers ->> k.question_id is distinct from k.correct_choice_id), '{}')
    into v_total, v_wrong
    from private.lesson_quiz_answers k
   where k.lesson_id = v_lesson.id;

  if v_total = 0 then
    -- A lesson without an answer key can't be completed (fail closed).
    raise exception 'lesson has no quiz' using errcode = 'P0002';
  end if;

  if cardinality(v_wrong) > 0 then
    return jsonb_build_object('passed', false, 'wrong', to_jsonb(v_wrong), 'awarded', false, 'xp', 0);
  end if;

  insert into public.lesson_completions (user_id, lesson_id)
  values (v_user, v_lesson.id)
  on conflict do nothing;

  v_awarded := private.award_xp(
    v_user, v_lesson.xp_reward, 'lesson', v_lesson.id, v_lesson.school_slug, v_lesson.title
  );

  return jsonb_build_object(
    'passed', true,
    'wrong', '[]'::jsonb,
    'awarded', v_awarded,
    'xp', case when v_awarded then v_lesson.xp_reward else 0 end
  );
end;
$$;

revoke all on function public.complete_lesson(text, jsonb) from public, anon, authenticated;
grant execute on function public.complete_lesson(text, jsonb) to authenticated;
