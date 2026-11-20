-- =============================================================================
-- Security tests for The Ascent's database. Run with: npm run db:test
-- -----------------------------------------------------------------------------
-- Uses pgTAP. Everything runs inside one transaction that is rolled back at the
-- end, so the test users and rows never persist.
--
-- To act as a learner we switch to the `authenticated` role and set the JWT
-- claims that auth.uid() reads, exactly as Supabase does for a real request.
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(50);

-- ----------------------------------------------------------------- fixtures
-- Two learners. Creating them in auth.users fires the profile trigger.
-- The addresses use the reserved .invalid domain, so they can never clash
-- with accounts created while testing the app in a browser.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-a000-00000000000a', 'rls-test-a@pgtap.invalid', '{"display_name": "Ada"}'),
  ('00000000-0000-4000-a000-00000000000b', 'rls-test-b@pgtap.invalid', '{"display_name": "   "}');

-- Published lessons in an OPEN course (kept out of the real habits module, so
-- the "finish a module" test below only counts the real lessons) and one in a
-- PLANNED course.
insert into public.lessons (id, module_id, title, xp_reward, published)
select v.id, m.id, v.title, 40, true
  from (values ('test-open-lesson', 'Test lesson'), ('test-open-lesson-2', 'Second test lesson')) as v(id, title)
 cross join lateral (
   select m.id from public.course_modules m join public.courses c on c.id = m.course_id
    where c.status = 'open' and m.id <> 'personal-habits-course-1' order by m.id limit 1) m;
insert into public.lessons (id, module_id, title, xp_reward, published)
select 'test-planned-lesson', m.id, 'Planned lesson', 40, true
  from public.course_modules m join public.courses c on c.id = m.course_id
 where c.status = 'planned' limit 1;
-- A published lesson in an open course that has NO quiz (must fail closed).
insert into public.lessons (id, module_id, title, xp_reward, published)
select 'test-no-quiz-lesson', m.id, 'No quiz', 40, true
  from public.course_modules m join public.courses c on c.id = m.course_id
 where c.status = 'open' limit 1;

-- Answer keys for the test lessons.
insert into private.lesson_quiz_answers (lesson_id, question_id, correct_choice_id) values
  ('test-open-lesson', 'q1', 'a'),
  ('test-open-lesson', 'q2', 'c'),
  ('test-open-lesson-2', 'q1', 'b'),
  ('test-planned-lesson', 'q1', 'a');

-- 30 extra lessons, used only to build a 30-day streak for learner B.
insert into public.lessons (id, module_id, title, xp_reward, published)
select 'streak-lesson-' || n, m.id, 'Streak lesson ' || n, 1, true
  from generate_series(1, 30) as n
 cross join lateral (
   select m.id from public.course_modules m join public.courses c on c.id = m.course_id
    where c.status = 'open' and m.id <> 'personal-habits-course-1' order by m.id limit 1) m;

-- XP for both learners, written as the database owner (as a trusted function would).
insert into public.xp_transactions (user_id, amount, source_type, source_id, description) values
  ('00000000-0000-4000-a000-00000000000a', 100, 'mission', 'a-1', 'A mission'),
  ('00000000-0000-4000-a000-00000000000b', 500, 'mission', 'b-1', 'B mission');

-- ------------------------------------------------------- 1. structure checks
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'every table in public has Row Level Security enabled'
);

select is(
  (select display_name from public.profiles where id = '00000000-0000-4000-a000-00000000000a'),
  'Ada',
  'sign-up creates a profile using the supplied display name'
);

select is(
  (select display_name from public.profiles where id = '00000000-0000-4000-a000-00000000000b'),
  'Seeker',
  'a blank display name falls back to "Seeker"'
);

select throws_ok(
  $$ insert into public.xp_transactions (user_id, amount, source_type, source_id, description)
     values ('00000000-0000-4000-a000-00000000000a', -10, 'lesson', 'x', 'negative') $$,
  '23514', null,
  'only adjustments may be negative (check constraint)'
);

select throws_ok(
  $$ insert into public.xp_transactions (user_id, amount, source_type, source_id, description)
     values ('00000000-0000-4000-a000-00000000000a', 100, 'mission', 'a-1', 'again') $$,
  '23505', null,
  'the same source can never pay out twice (unique constraint)'
);

select ok(
  (select count(*) from public.schools) = 8,
  'the seed loaded all eight schools'
);

-- Written lessons (Milestone 3): published now that completion checks the quiz.
select is(
  (select count(*)::int from public.lessons where id like 'personal-habits-course-1-%' and published),
  3,
  'the three written lessons are seeded and published'
);

select hasnt_function(
  'public', 'complete_lesson', array['text'],
  'the old complete_lesson(lesson) that skipped the quiz no longer exists'
);

select is(
  (select count(*)::int from public.lessons l
    where l.id like 'personal-habits-course-1-%'
      and not exists (select 1 from private.lesson_quiz_answers a where a.lesson_id = l.id)),
  0,
  'every written lesson has a quiz answer key'
);

-- ------------------------------------------------------- 2. acting as learner A
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-4000-a000-00000000000a", "role": "authenticated"}', true);

select is((select count(*)::int from public.profiles), 1, 'A sees exactly one profile');
select is((select id from public.profiles), '00000000-0000-4000-a000-00000000000a'::uuid, '…and it is their own');
select is((select count(*)::int from public.xp_transactions), 1, 'A sees only their own XP rows');
select is((select total_xp from public.character_xp), 100, 'the character_xp view sums only A''s XP');
select is((select count(*)::int from public.schools), 8, 'A can read the catalogue');

select throws_ok(
  $$ select count(*) from private.lesson_quiz_answers $$,
  '42501', null,
  'A cannot read the quiz answer keys'
);

select is(
  (select count(*)::int from public.lessons where id like 'personal-habits-course-1-%'),
  3,
  'learners can see published lessons'
);

select throws_ok(
  $$ insert into public.xp_transactions (user_id, amount, source_type, source_id, description)
     values ('00000000-0000-4000-a000-00000000000a', 9999, 'lesson', 'free', 'cheat') $$,
  '42501', null,
  'A cannot insert XP directly'
);

select throws_ok(
  $$ update public.xp_transactions set amount = 9999 $$,
  '42501', null,
  'A cannot change existing XP'
);

select throws_ok(
  $$ delete from public.xp_transactions $$,
  '42501', null,
  'A cannot delete XP history'
);

select lives_ok(
  $$ update public.profiles set display_name = 'Ada L.' where id = '00000000-0000-4000-a000-00000000000a' $$,
  'A can rename themselves'
);

select is_empty(
  $$ update public.profiles set display_name = 'Hacked'
     where id = '00000000-0000-4000-a000-00000000000b' returning id $$,
  'A cannot rename B (the row is invisible to them)'
);

select throws_ok(
  $$ update public.profiles set created_at = now() where id = '00000000-0000-4000-a000-00000000000a' $$,
  '42501', null,
  'A can only update display_name and title'
);

select throws_ok(
  $$ select private.award_xp('00000000-0000-4000-a000-00000000000a', 9999, 'lesson', 'x', null, 'x') $$,
  '42501', null,
  'A cannot call the internal award function'
);

-- Completing a lesson: the quiz is checked in the database (migration 6).
select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "b"}') -> 'wrong',
  '["q2"]'::jsonb,
  'a wrong answer fails, naming the question to review'
);
select is(
  (select count(*)::int from public.xp_transactions where source_id = 'test-open-lesson'),
  0,
  'a failed quiz awards no XP'
);
select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a"}') -> 'wrong',
  '["q2"]'::jsonb,
  'an unanswered question counts as wrong'
);
select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c", "extra": "x"}') - 'rewards',
  '{"passed": true, "wrong": [], "awarded": true, "xp": 40}'::jsonb,
  'all answers correct: the lesson is completed and XP awarded'
);
select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c"}'),
  '{"passed": true, "wrong": [], "awarded": false, "xp": 0, "rewards": []}'::jsonb,
  'passing again awards nothing, and earns no new rewards'
);

-- Missions and achievements (migration 7), earned by the database itself.
select is(
  (select status::text from public.user_tasks where template_id = 'daily-one-lesson'),
  'completed',
  'completing a lesson completes today''s "Complete a lesson" mission'
);
select is(
  (select count(*)::int from public.user_achievements where achievement_id = 'first-step'),
  1,
  'the first completed lesson unlocks "First Step"'
);
select ok(
  public.complete_lesson('test-open-lesson-2', '{"q1": "b"}') -> 'rewards'
    @> '[{"kind": "daily", "title": "Keep going: two lessons", "xp": 30}]'::jsonb,
  'a second lesson today completes the two-lesson mission and reports it'
);
select is(
  (select count(*)::int from public.xp_transactions where source_type = 'mission'
     and source_id like 'daily-%:' || (now() at time zone 'utc')::date),
  2,
  'each daily mission pays its XP once (two missions, two rows)'
);
select throws_ok(
  $$ insert into public.user_tasks (user_id, template_id, period_start, progress, status)
     values ('00000000-0000-4000-a000-00000000000a', 'weekly-one-module', current_date, 1, 'completed') $$,
  '42501', null,
  'A cannot mark their own tasks complete'
);
select throws_ok(
  $$ insert into public.user_achievements (user_id, achievement_id)
     values ('00000000-0000-4000-a000-00000000000a', 'polymath') $$,
  '42501', null,
  'A cannot grant themselves achievements'
);
select throws_ok(
  $$ select private.evaluate_progress('00000000-0000-4000-a000-00000000000a') $$,
  '42501', null,
  'A cannot run the progress evaluation directly'
);
select is(
  (select sum(amount)::int from public.xp_transactions where source_id = 'test-open-lesson'),
  40,
  'the amount came from the lessons table, exactly once'
);
select is(
  (select count(*)::int from public.lesson_completions where lesson_id = 'test-open-lesson'),
  1,
  'the completion is recorded once'
);

select throws_ok(
  $$ select public.complete_lesson('test-planned-lesson', '{"q1": "a"}') $$,
  'P0002', null,
  'lessons in planned courses cannot be completed'
);
select throws_ok(
  $$ select public.complete_lesson('test-no-quiz-lesson', '{}') $$,
  'P0002', null,
  'a lesson without an answer key cannot be completed (fails closed)'
);
select throws_ok(
  $$ select public.complete_lesson('test-open-lesson', '["a", "c"]') $$,
  '22023', null,
  'answers that are not an object are rejected'
);

-- ------------------------------------------------------- 2b. learner B
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-4000-a000-00000000000b", "role": "authenticated"}', true);

select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c"}') -> 'awarded',
  'true'::jsonb,
  'each learner earns a lesson''s XP for themselves (B is not blocked by A)'
);

-- B finishes the real "How Habits Form" module (all three planned lessons).
select public.complete_lesson('personal-habits-course-1-1', '{"q1": "b", "q2": "c", "q3": "a"}');
select public.complete_lesson('personal-habits-course-1-2', '{"q1": "b", "q2": "c", "q3": "a"}');
select ok(
  public.complete_lesson('personal-habits-course-1-3', '{"q1": "a", "q2": "b", "q3": "c"}') -> 'rewards'
    @> '[{"kind": "weekly", "title": "Finish a module", "xp": 100}]'::jsonb,
  'finishing every lesson in a module completes the weekly "Finish a module" objective'
);
select is(
  (select count(*)::int from public.xp_transactions
    where source_type = 'objective' and source_id like 'weekly-one-module:%'),
  1,
  'the objective''s XP is recorded once, for B only'
);

-- ------------------------------------------------------- 2c. thresholds (as the database owner)
reset role;

-- B completed lessons TODAY above. Add 2 to 30 days ago, leaving YESTERDAY
-- empty: the longest run is 29 days (2..30 days ago), and today stands alone.
insert into public.lesson_completions (user_id, lesson_id, completed_at)
select '00000000-0000-4000-a000-00000000000b', 'streak-lesson-' || n, now() - make_interval(days => n)
  from generate_series(2, 30) as n;
select private.evaluate_progress('00000000-0000-4000-a000-00000000000b');
select is(
  (select count(*)::int from public.user_achievements
    where user_id = '00000000-0000-4000-a000-00000000000b' and achievement_id = 'thirty-days'),
  0,
  '29 days in a row (with a gap before today) is not yet "Steadfast"'
);
-- Fill the gap: today back to 30 days ago is now one unbroken run of 31 days.
insert into public.lesson_completions (user_id, lesson_id, completed_at)
values ('00000000-0000-4000-a000-00000000000b', 'streak-lesson-1', now() - interval '1 day');
select ok(
  private.evaluate_progress('00000000-0000-4000-a000-00000000000b')
    @> '[{"kind": "achievement", "title": "Steadfast"}]'::jsonb,
  '30 days in a row unlocks "Steadfast"'
);

insert into public.xp_transactions (user_id, amount, source_type, source_id, description)
values ('00000000-0000-4000-a000-00000000000b', 30000, 'adjustment', 'test-big-bonus', 'Test bonus');
select ok(
  private.evaluate_progress('00000000-0000-4000-a000-00000000000b')
    @> '[{"kind": "achievement", "title": "The High Road"}]'::jsonb,
  'reaching the level-25 XP threshold unlocks "The High Road"'
);
select is(
  private.evaluate_progress('00000000-0000-4000-a000-00000000000b'),
  '[]'::jsonb,
  'evaluating again earns nothing new (idempotent)'
);

-- ------------------------------------------------------- 3. not signed in
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok(
  $$ select count(*) from public.profiles $$,
  '42501', null,
  'anonymous visitors cannot read profiles'
);

select throws_ok(
  $$ select public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c"}') $$,
  '42501', null,
  'anonymous visitors cannot complete lessons'
);

select throws_ok(
  $$ select count(*) from private.lesson_quiz_answers $$,
  '42501', null,
  'anonymous visitors cannot read the quiz answer keys'
);

reset role;
select * from finish();
rollback;
