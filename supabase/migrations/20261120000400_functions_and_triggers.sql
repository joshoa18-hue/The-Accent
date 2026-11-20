-- =============================================================================
-- 4. Trusted functions and triggers
-- -----------------------------------------------------------------------------
-- `security definer` functions run with the privileges of their OWNER, not the
-- caller. That is what lets them write to tables learners can't write to, so
-- each one must check everything itself. Every function here also sets
-- `search_path = ''` and uses fully qualified names, so nobody can trick it
-- into calling a look-alike object from another schema.
-- =============================================================================

-- The `private` schema is not exposed through the Supabase API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- New user → profile
-- ---------------------------------------------------------------------------
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- Sign-up metadata is user-supplied: trim it, cap the length, fall back.
    coalesce(nullif(btrim(left(new.raw_user_meta_data ->> 'display_name', 60)), ''), 'Seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- The ONLY code path that inserts XP. Not callable through the API.
-- Returns false when this source already paid out (idempotent).
-- ---------------------------------------------------------------------------
create function private.award_xp(
  p_user_id     uuid,
  p_amount      int,
  p_source_type public.xp_source_type,
  p_source_id   text,
  p_school_slug text,
  p_description text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.xp_transactions
    (user_id, amount, source_type, source_id, school_slug, description)
  values
    (p_user_id, p_amount, p_source_type, p_source_id, p_school_slug, p_description)
  on conflict on constraint xp_once_per_source do nothing;
  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public entry point: mark a lesson complete and award its XP.
-- Called as supabase.rpc('complete_lesson', { p_lesson_id }).
--
-- Milestone 2: the lessons table is empty, so this cannot award anything yet.
-- The app does not call it until Milestone 3. It exists now so its security
-- can be tested from day one.
-- ---------------------------------------------------------------------------
create function public.complete_lesson(p_lesson_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user   uuid := auth.uid();   -- WHO: from the session, never a parameter
  v_lesson record;
begin
  if v_user is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  select l.id, l.title, l.xp_reward, c.school_slug
    into v_lesson
    from public.lessons l
    join public.course_modules m     on m.id = l.module_id
    join public.courses co           on co.id = m.course_id
    join public.course_categories c  on c.id = co.category_id
   where l.id = p_lesson_id
     and l.published
     and co.status = 'open';

  if not found then
    raise exception 'lesson not available' using errcode = 'P0002';
  end if;

  insert into public.lesson_completions (user_id, lesson_id)
  values (v_user, v_lesson.id)
  on conflict do nothing;

  -- HOW MUCH: from the lessons table, never from the caller.
  return private.award_xp(
    v_user, v_lesson.xp_reward, 'lesson', v_lesson.id, v_lesson.school_slug, v_lesson.title
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Function privileges. Postgres lets PUBLIC execute new functions by default
-- and Supabase also grants them to its API roles, so lock them down.
-- ---------------------------------------------------------------------------
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.award_xp(uuid, int, public.xp_source_type, text, text, text)
  from public, anon, authenticated;
revoke all on function public.complete_lesson(text) from public, anon, authenticated;
grant execute on function public.complete_lesson(text) to authenticated;
