-- =============================================================================
-- 5. Quiz answer keys (Milestone 3, checkpoint 1)
-- -----------------------------------------------------------------------------
-- Each written lesson ends with a short quiz. Its ANSWER KEY lives here, in
-- the `private` schema, which the Supabase API doesn't expose and which the
-- anon/authenticated roles have no access to at all (migration 4).
--
-- Only trusted security-definer functions read it. In checkpoint 2,
-- complete_lesson(lesson, answers) will check a learner's answers against
-- this table before awarding any XP.
--
-- Rows are generated from src/content/catalogue/lessons/ by `npm run db:seed`.
-- =============================================================================

create table private.lesson_quiz_answers (
  lesson_id          text not null references public.lessons (id) on delete cascade,
  question_id        text not null,
  correct_choice_id  text not null,
  primary key (lesson_id, question_id)
);

-- Defence in depth: even though the schema is locked, the table follows the
-- project rule that every table has Row Level Security and no API privileges.
alter table private.lesson_quiz_answers enable row level security;
revoke all on private.lesson_quiz_answers from public, anon, authenticated;
