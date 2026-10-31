-- Task comments at the database: owner-only access, column grants, edit stamp,
-- 200 cap, bot columns, cascades and the MCP functions. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(37);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.time_categories (user_id, id, name)
select u, 'work', 'Praca'
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u
on conflict do nothing;
insert into public.time_priorities (user_id, id, name, value)
select u, 'high', 'Wysoki', 1
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u
on conflict do nothing;
insert into public.time_tasks (user_id, id, title, category_id, priority_id, day)
values
  ('00000000-0000-0000-0000-0000000000a1', 't-a', 'Zadanie A', 'work', 'high', '2026-10-31'),
  ('00000000-0000-0000-0000-0000000000a1', 't-a2', 'Zadanie A2', 'work', 'high', '2026-10-31'),
  ('00000000-0000-0000-0000-0000000000b2', 't-b', 'Zadanie B', 'work', 'high', '2026-10-31');

insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values (
  '0b9a4a52-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-0000000000a1',
  'Claude Desktop',
  encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'),
  'abcd', 'wxyz'
);

-- Table level (as the table owner): constraints, triggers, cascades.
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a', '   ')$$,
  '23514', null, 'blank body is refused');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a', repeat('x', 2001))$$,
  '23514', null, 'body over 2000 characters is refused');
select lives_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a', repeat('x', 2000))$$,
  'body of exactly 2000 characters is accepted');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 'missing', 'hi')$$,
  '23503', null, 'comment on a missing task is refused');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-b', 'hi')$$,
  '23503', null, 'comment on another owner task is refused');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, bot_name) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'hi', 'Bot')$$,
  '23514', null, 'bot name without ref is refused');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, bot_ref) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'hi', '0b9a4a52')$$,
  '23514', null, 'bot ref without name is refused');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, bot_name, bot_ref) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'hi', 'Bot', 'NOT-HEX!')$$,
  '23514', null, 'malformed bot ref is refused');
select lives_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, bot_name, bot_ref) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'hi', 'Bot', '0b9a4a52')$$,
  'bot name with ref is accepted');

-- 200 cap per task (t-a already holds 2; fill to 200).
insert into public.time_task_comments (user_id, task_id, body)
select '00000000-0000-0000-0000-0000000000a1', 't-a', 'n' || g from generate_series(1, 198) g;
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'one too many')$$,
  '23514', 'Task comment limit reached', '201st comment on a task is refused');
select throws_ok(
  $$select public.mcp_add_task_comment('secret-token-aaaaaaaaaaaa', 't-a', 'one too many')$$,
  'PT400', 'a task takes at most 200 comments', 'a bot hits the same cap');
select lives_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a2', 'other task')$$,
  'the cap is per task');

-- edited_at stamp.
insert into public.time_task_comments (id, user_id, task_id, body)
values ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-0000000000a1', 't-a2', 'first');
select is(
  (select edited_at from public.time_task_comments where id = '11111111-1111-4111-8111-111111111111'),
  null, 'a new comment is not edited');
update public.time_task_comments set body = 'first' where id = '11111111-1111-4111-8111-111111111111';
select is(
  (select edited_at from public.time_task_comments where id = '11111111-1111-4111-8111-111111111111'),
  null, 'saving the same text does not stamp an edit');
update public.time_task_comments set body = 'changed' where id = '11111111-1111-4111-8111-111111111111';
select isnt(
  (select edited_at from public.time_task_comments where id = '11111111-1111-4111-8111-111111111111'),
  null, 'changing the text stamps the edit time');

-- Owner A through the API role.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.time_task_comments where task_id = 't-a2'),
  2, 'owner reads own comments');
select lives_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000a1', 't-a2', 'by owner')$$,
  'owner adds a comment');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, bot_name, bot_ref) values ('00000000-0000-0000-0000-0000000000a1', 't-a2', 'forged', 'Bot', '0b9a4a52')$$,
  '42501', null, 'owner cannot forge bot fields on insert');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body, edited_at) values ('00000000-0000-0000-0000-0000000000a1', 't-a2', 'forged', now())$$,
  '42501', null, 'owner cannot set the edit time on insert');
select throws_ok(
  $$update public.time_task_comments set bot_name = 'Bot', bot_ref = '0b9a4a52' where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'owner cannot forge bot fields on update');
select throws_ok(
  $$update public.time_task_comments set edited_at = null where id = '11111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'owner cannot reset the edit time');
select throws_ok(
  $$insert into public.time_task_comments (user_id, task_id, body) values ('00000000-0000-0000-0000-0000000000b2', 't-b', 'as other')$$,
  '42501', null, 'owner cannot write as another owner');
select lives_ok(
  $$update public.mcp_tokens set name = 'Renamed Bot' where id = '0b9a4a52-1111-4111-8111-111111111111'$$,
  'owner renames own token');
select throws_ok(
  $$update public.mcp_tokens set user_id = '00000000-0000-0000-0000-0000000000b2' where id = '0b9a4a52-1111-4111-8111-111111111111'$$,
  '42501', null, 'owner cannot hand a token to another owner');

-- Owner B sees nothing of A and changes nothing.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.time_task_comments),
  0, 'another owner reads no foreign comments');
with changed as (
  update public.time_task_comments set body = 'hijack' where id = '11111111-1111-4111-8111-111111111111' returning 1
) select is((select count(*)::int from changed), 0, 'another owner updates no foreign comment');
with removed as (
  delete from public.time_task_comments where id = '11111111-1111-4111-8111-111111111111' returning 1
) select is((select count(*)::int from removed), 0, 'another owner deletes no foreign comment');
with renamed as (
  update public.mcp_tokens set name = 'Hijack' where id = '0b9a4a52-1111-4111-8111-111111111111' returning 1
) select is((select count(*)::int from renamed), 0, 'another owner renames no foreign token');

-- Anonymous gets no access at all.
reset role;
set local role anon;
select throws_ok(
  $$select count(*) from public.time_task_comments$$,
  '42501', null, 'anonymous role cannot read comments');
reset role;

-- MCP functions (the only door for bots).
select throws_ok(
  $$select public.mcp_add_task_comment('not-a-known-token-0000000', 't-a2', 'hi')$$,
  'PT401', null, 'unknown token cannot comment');
select throws_ok(
  $$select public.mcp_add_task_comment('secret-token-aaaaaaaaaaaa', 't-a2', '   ')$$,
  'PT400', null, 'bot cannot send a blank comment');
select is(
  public.mcp_add_task_comment('secret-token-aaaaaaaaaaaa', 't-a2', '  from bot  ') ->> 'body',
  'from bot', 'bot comment is trimmed');
select is(
  jsonb_path_query_first(public.mcp_list_task_comments('secret-token-aaaaaaaaaaaa', 't-a2'), '$.items[*] ? (@.body == "from bot")') ->> 'botName',
  'Renamed Bot', 'renamed token signs with the new name');
select ok(
  public.mcp_list_task_comments('secret-token-aaaaaaaaaaaa', 't-a2')::text !~ 'secret-token-a|token_hash',
  'listing never contains the token or its hash');
select is(
  public.mcp_list_task_comments('secret-token-aaaaaaaaaaaa', 't-b'), null,
  'listing another owner task gives nothing');

-- Deleting a token keeps the comment and its stored name.
delete from public.mcp_tokens where id = '0b9a4a52-1111-4111-8111-111111111111';
select is(
  (select bot_name from public.time_task_comments where task_id = 't-a2' and body = 'from bot'),
  'Renamed Bot', 'deleted token leaves the comment with the name stored at write time');

-- Cascade on task delete.
delete from public.time_tasks where user_id = '00000000-0000-0000-0000-0000000000a1' and id = 't-a';
select is(
  (select count(*)::int from public.time_task_comments where task_id = 't-a'),
  0, 'deleting a task deletes its comments');

select * from finish();
rollback;
