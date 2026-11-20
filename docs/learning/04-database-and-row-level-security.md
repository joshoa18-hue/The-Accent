# Lesson 4 — The database: tables, migrations and Row Level Security

*Milestone 2, checkpoint 1. Covers running Supabase locally in Docker, writing schema as migrations, generating seed data from code, and proving the security rules with tests.*

---

## 1. What we built

| Feature | Where |
|---|---|
| A local Supabase stack (Postgres, Auth, API, Studio, a mail catcher) on ports 55320–55329 | `supabase/config.toml`: `npm run db:start` (lean) or `npm run db:start:studio` |
| Four migrations: catalogue tables, personal tables, security, trusted functions | `supabase/migrations/` |
| Seed data **generated** from the TypeScript catalogue | `scripts/seed-sql.ts` → `supabase/seed.sql` |
| 24 database security tests | `supabase/tests/security.test.sql` |
| Generated TypeScript types for every table, plus a compile-time contract with the app types | `src/types/database.ts`, `src/types/database-contract.ts` |
| npm scripts: `db:start`, `db:start:studio`, `db:stop`, `db:status`, `db:seed`, `db:reset`, `db:test`, `db:types` | `package.json` |

The app doesn't read from the database yet. That's checkpoint 3. This checkpoint builds the foundations and proves they're safe.

## 2. Why this approach

**Local first.** Supabase runs on your laptop inside Docker containers. You can wipe it and rebuild it in seconds (`npm run db:reset`), test emails never leave your machine, and nothing is exposed to the internet while you learn.

**Migrations instead of clicking.** Every change to the database is a numbered SQL file. Run the files in order and you get exactly the same database every time, on any machine. They live in git, so changes are reviewed like code, and you can see *why* a table looks the way it does.

**Two locks on every door.**
1. **Privileges** (`grant` / `revoke`) decide *which kinds of statement* a role may run at all. For example, learners can never `insert` into `xp_transactions`.
2. **Row Level Security** policies decide *which rows* a statement can see. For example, you only see rows where `user_id` is you.

Either lock alone would probably be enough. Two means a single mistake doesn't expose anything.

**The seed is generated, not hand-written.** The curriculum already exists in `src/content/`. Copying it by hand into SQL would create two versions that slowly drift apart. Instead, a script writes `seed.sql`, and a test fails if anyone changes the catalogue without regenerating it.

**Security is tested, not assumed.** "I wrote a policy" isn't proof. The pgTAP tests log in as two pretend learners and *try* to cheat. Each test passes only if the cheat is blocked.

## 3. Important files

| File | Why it matters |
|---|---|
| `supabase/migrations/…_row_level_security.sql` | The heart of "you only see your own data" |
| `supabase/migrations/…_functions_and_triggers.sql` | `complete_lesson`: the only door through which XP can enter |
| `supabase/tests/security.test.sql` | Shows how to *prove* the rules |
| `scripts/seed-sql.ts` | `sqlLiteral()` safely turns text into SQL |
| `supabase/config.toml` | What the local stack runs, and where auth emails link to |

## 4. The important code, explained

### A policy reads like a sentence

```sql
create policy "xp: read own"
  on public.xp_transactions for select to authenticated
  using (user_id = (select auth.uid()));
```

This says: *"On `xp_transactions`, signed-in users may SELECT only the rows where `user_id` equals their own id."* `auth.uid()` reads the id from the user's login token, which the database verifies. The browser can't fake it.

### Revoke everything, then grant back

```sql
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.xp_transactions /* … */ to authenticated;
grant update (display_name, title) on public.profiles to authenticated;
```

Supabase gives the API roles full access to new tables by default. We take it all away, then give back the minimum. The last line is a **column-level grant**: you can edit your name and title, but not your id or your join date.

### `security definer`: a carefully guarded side door

`complete_lesson` runs with the powers of its *owner*, so it can insert XP that the learner can't insert directly. That power is dangerous, so the function:

- takes *who* from `auth.uid()`, never from a parameter;
- takes *how much* from the `lessons` table, never from the caller;
- sets `search_path = ''`, so it can't be tricked into running a look-alike table or function;
- relies on the unique constraint, so the second completion pays nothing.

### Escaping text for SQL

```ts
return `'${value.replaceAll("'", "''")}'`;
```

In SQL, a quote inside a string is written as two quotes. Without this, a course title like *Today's Lesson* would end the string early and break the file. Worse, crafted text could inject its own SQL. A test feeds it `Today's '); drop table x; --` to prove it stays harmless text.

### Testing as a pretend user

```sql
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "…a", "role": "authenticated"}', true);
select throws_ok($$ insert into public.xp_transactions … $$, '42501', null, 'A cannot insert XP directly');
```

This is exactly what Supabase does on a real request: switch to the `authenticated` role and load the user's token claims. `42501` is Postgres's code for "permission denied". The test passes only if that error happens. The whole file runs inside `begin; … rollback;`, so the test users vanish afterwards.

## 5. How the pieces communicate

```
src/content/ (TypeScript)  ──npm run db:seed──►  supabase/seed.sql
                                                         │
supabase/migrations/*.sql ──npm run db:reset──►  Postgres (Docker) ◄── supabase/tests (npm run db:test)
                                                         │
                                       npm run db:types  ▼
                                               src/types/database.ts  ──► used by the data layer (checkpoint 3)

Future request:  Browser → Next.js server → Supabase API (as `authenticated`, with the user's token)
                                            → Postgres checks privileges, then RLS policies → only your rows
```

## 6. Concepts to understand

- Docker containers, and why a local stack is useful
- Tables, primary keys, foreign keys, `on delete cascade` vs `restrict`
- Constraints as rules: `check`, `unique`
- Migrations, and why they're append-only
- Roles (`anon`, `authenticated`), privileges, `grant` / `revoke`, column-level grants
- Row Level Security and policies (`using`, `with check`)
- `security definer` vs `security invoker`, and `search_path`
- Views, and why ours use `security_invoker = true`
- SQL injection and escaping
- pgTAP: `plan`, `is`, `throws_ok`, `lives_ok`, `finish`

## 7. What testing caught or proved

- **All four migrations and the seed applied cleanly** on the first run: 8 schools and 26 courses loaded.
- **All 24 security tests passed.**
- **The tests can fail.** A suite that always passes proves nothing, so one policy was deliberately broken ("everyone can read every profile"). The tests immediately reported `A sees exactly one profile — have: 2, want: 1`. Rebuilding from the migrations (`npm run db:reset`) restored the real policy, and all 24 passed again.
- **The type contract can fail too.** `src/types/database-contract.ts` compares the database enums with the app's TypeScript unions. Removing one value on purpose made `npm run typecheck` fail; restoring it passed.

**Real-world problems this checkpoint hit, and their fixes:**

| Problem | Cause | Fix |
|---|---|---|
| `bind: An attempt was made to access a socket in a way forbidden` on port 54322 | Windows reserves blocks of ports for WSL and Hyper-V networking. Here 53845–54468 were reserved, covering every default Supabase port. You can list them with `netsh interface ipv4 show excludedportrange protocol=tcp`. | Moved this project's ports to **55320–55329** in `supabase/config.toml`. No Windows settings changed. |
| Studio and its helper "unhealthy: health check exceeded timeout (2s)" | The laptop has 3.4 GB of RAM, so Studio started too slowly for the CLI's 2-second check. | `npm run db:start` runs a lean stack without Studio. `npm run db:start:studio` includes it and skips the health-check timeout. |
| `DbConnectError: connection terminated unexpectedly` when running tests | The test ran while the stack was still starting up. | Wait for `db:start` to finish, then retry. |
| Docker installer stopped: "Virtual Machine Platform is not enabled" | A *per-user* install can't turn on that Windows feature. | Reinstalled as **all-users**, approving the administrator prompt. |

Debugging tip: every one of these was solved by **reading the actual error message or log file** (`%LOCALAPPDATA%\Docker\install-log.txt`, the CLI's JSON error) before changing anything.

## 8. Exercise

**Part A — explore.** Close other apps, run `npm run db:start:studio`, then open **http://127.0.0.1:55323** (Studio). Open the Table Editor and find the eight schools. Then open the `xp_transactions` table: it's empty. Why is that correct?

**Part B — break a lock on purpose.** In a *new* migration file (never edit an old one), write `grant insert on public.xp_transactions to authenticated;`. Run `npm run db:reset` and then `npm run db:test`. Which test still passes, and which lock saved you? (Hint: there's no insert *policy*.) Then delete your file and reset again.

**Part C — read a policy aloud.** Pick any policy in the RLS migration and write it as one plain-English sentence, like the example in section 4.
