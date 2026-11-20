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

select plan(37);

-- ----------------------------------------------------------------- fixtures
-- Two learners. Creating them in auth.users fires the profile trigger.
-- The addresses use the reserved .invalid domain, so they can never clash
-- with accounts created while testing the app in a browser.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-a000-00000000000a', 'rls-test-a@pgtap.invalid', '{"display_name": "Ada"}'),
  ('00000000-0000-4000-a000-00000000000b', 'rls-test-b@pgtap.invalid', '{"display_name": "   "}');

-- One published lesson in an OPEN course and one in a PLANNED course.
insert into public.lessons (id, module_id, title, xp_reward, published)
select 'test-open-lesson', m.id, 'Test lesson', 40, true
  from public.course_modules m join public.courses c on c.id = m.course_id
 where c.status = 'open' limit 1;
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
  ('test-planned-lesson', 'q1', 'a');

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
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c", "extra": "x"}'),
  '{"passed": true, "wrong": [], "awarded": true, "xp": 40}'::jsonb,
  'all answers correct: the lesson is completed and XP awarded'
);
select is(
  public.complete_lesson('test-open-lesson', '{"q1": "a", "q2": "c"}'),
  '{"passed": true, "wrong": [], "awarded": false, "xp": 0}'::jsonb,
  'passing again awards nothing'
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
