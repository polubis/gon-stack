-- Task history at the database: every change is recorded by triggers, signed
-- as owner or bot, read-only for the owner, private per owner, gone with the
-- task. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.time_categories (user_id, id, name)
select u, c.id, c.name
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u,
  (values ('work', 'Praca'), ('home', 'Dom')) as c (id, name)
on conflict do nothing;
insert into public.time_priorities (user_id, id, name, value)
select u, p.id, p.name, p.value
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u,
  (values ('high', 'Wysoki', 9), ('low', 'Niski', 2)) as p (id, name, value)
on conflict do nothing;

insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values (
  '0b9a4a52-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-0000000000a1',
  'Claude Desktop',
  encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'),
  'abcd', 'wxyz'
);

-- Creation.
insert into public.time_tasks (user_id, id, title, category_id, priority_id, day, key)
values
  ('00000000-0000-0000-0000-0000000000a1', 't-a', 'Zadanie A', 'work', 'high', '2026-11-10', 'VYB-1'),
  ('00000000-0000-0000-0000-0000000000b2', 't-b', 'Zadanie B', 'work', 'high', '2026-11-10', 'VYB-1');
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a'),
  1, 'creating a task records one entry');
select results_eq(
  $$select kind, new_value, bot_ref from public.time_task_history where task_id = 't-a'$$,
  $$values ('created'::text, 'Zadanie A'::text, null::text)$$,
  'the creation entry names the title and is the owner''s');

-- Field changes: one entry per changed field, none for an untouched one.
update public.time_tasks set title = 'Zadanie A', description = null where id = 't-a';
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a'),
  1, 'saving identical values records nothing');
update public.time_tasks
set title = 'Nowy tytuł', description = 'opis', category_id = 'home', priority_id = 'low',
    day = '2026-11-11', at = '09:30', in_progress = true
where id = 't-a';
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a' and kind = 'updated'),
  7, 'each of the seven changed fields gets its own entry');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'title'$$,
  $$values ('Zadanie A'::text, 'Nowy tytuł'::text)$$,
  'a text change keeps the old and the new value');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'category'$$,
  $$values ('Praca'::text, 'Dom'::text)$$,
  'a category change stores names, not ids');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'priority'$$,
  $$values ('Wysoki'::text, 'Niski'::text)$$,
  'a priority change stores names, not ids');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'day'$$,
  $$values ('2026-11-10'::text, '2026-11-11'::text)$$,
  'a day change stores the dates');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'at'$$,
  $$values (null::text, '09:30'::text)$$,
  'setting an hour stores it as HH:MM');
update public.time_tasks set in_progress = false, done = true where id = 't-a';
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'done'$$,
  $$values ('false'::text, 'true'::text)$$,
  'finishing a task is recorded');

-- Backlog move: day goes to null.
update public.time_tasks set day = null, at = null, done = false where id = 't-a';
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'day' order by created_at desc limit 1$$,
  $$values ('2026-11-11'::text, null::text)$$,
  'sending a task to the backlog records the day going away');

-- Attachments and comments.
insert into public.time_task_attachments (id, user_id, task_id, name, size, mime)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-0000000000a1', 't-a', 'plan.pdf', 10, 'application/pdf');
select results_eq(
  $$select kind, new_value from public.time_task_history where task_id = 't-a' and kind = 'attachment_added'$$,
  $$values ('attachment_added'::text, 'plan.pdf'::text)$$,
  'adding an attachment records its name');
update public.time_task_attachments set size = 11 where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a' and kind like 'attachment%'),
  1, 'touching an attachment row records nothing');
delete from public.time_task_attachments where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select results_eq(
  $$select kind, old_value from public.time_task_history where task_id = 't-a' and kind = 'attachment_removed'$$,
  $$values ('attachment_removed'::text, 'plan.pdf'::text)$$,
  'removing an attachment records its name');

insert into public.time_task_comments (id, user_id, task_id, body)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '00000000-0000-0000-0000-0000000000a1', 't-a', 'pierwszy');
update public.time_task_comments set body = 'pierwszy' where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
update public.time_task_comments set body = 'drugi' where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
delete from public.time_task_comments where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
select results_eq(
  $$select kind, old_value, new_value from public.time_task_history where task_id = 't-a' and kind like 'comment%' order by created_at$$,
  $$values
    ('comment_added'::text, null::text, 'pierwszy'::text),
    ('comment_edited'::text, 'pierwszy'::text, 'drugi'::text),
    ('comment_removed'::text, 'drugi'::text, null::text)$$,
  'a comment''s life is recorded; saving the same text is not an edit');

-- Long text is cut to what a row may hold.
select lives_ok(
  $$update public.time_tasks set description = repeat('x', 900) where id = 't-a'$$,
  'a long description does not break the task update');
select is(
  (select char_length(new_value) from public.time_task_history where task_id = 't-a' and field = 'description' order by created_at desc limit 1),
  500, 'a long value is stored cut to 500 characters');

-- A bot: signed with the token name and ref, never the secret.
select is(
  public.mcp_add_task_comment('secret-token-aaaaaaaaaaaa', 't-a', 'od bota') ->> 'body',
  'od bota', 'bot adds a comment');
select results_eq(
  $$select bot_name, bot_ref from public.time_task_history where task_id = 't-a' and new_value = 'od bota'$$,
  $$values ('Claude Desktop'::text, '0b9a4a52'::text)$$,
  'a bot change is signed with the token name and ref');
select ok(
  not exists (select 1 from public.time_task_history where task_id = 't-a' and bot_ref is not null and kind = 'updated'),
  'earlier owner changes stay unsigned');
select set_config('parka.mcp_token_id', '', true);
update public.time_tasks set title = 'Po właścicielu' where id = 't-a';
select is(
  (select bot_ref from public.time_task_history where task_id = 't-a' and new_value = 'Po właścicielu'),
  null, 'a later owner change in a fresh transaction is not signed as the bot');

-- MCP read.
select is(
  jsonb_array_length(public.mcp_list_task_history('secret-token-aaaaaaaaaaaa', 't-a') -> 'items') > 0,
  true, 'bot reads the history');
select is(
  public.mcp_list_task_history('secret-token-aaaaaaaaaaaa', 't-a') -> 'items' -> 0 ->> 'kind',
  'updated', 'the MCP list is newest first');
select ok(
  public.mcp_list_task_history('secret-token-aaaaaaaaaaaa', 't-a')::text !~ 'secret-token-a|token_hash',
  'the MCP list never contains the token or its hash');
select is(
  public.mcp_list_task_history('secret-token-aaaaaaaaaaaa', 't-b'), null,
  'the MCP list of another owner''s task is empty');
select throws_ok(
  $$select public.mcp_list_task_history('not-a-known-token-0000000', 't-a')$$,
  'PT401', null, 'an unknown token reads nothing');

-- Owner through the API role: read only, own rows only.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
select cmp_ok(
  (select count(*)::int from public.time_task_history where task_id = 't-a'), '>', 0,
  'owner reads own history');
select throws_ok(
  $$insert into public.time_task_history (user_id, task_id, kind, new_value) values ('00000000-0000-0000-0000-0000000000a1', 't-a', 'created', 'forged')$$,
  '42501', null, 'owner cannot write history');
select throws_ok(
  $$update public.time_task_history set new_value = 'forged' where task_id = 't-a'$$,
  '42501', null, 'owner cannot edit history');
select throws_ok(
  $$delete from public.time_task_history where task_id = 't-a'$$,
  '42501', null, 'owner cannot delete a history row');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a'),
  0, 'another owner reads none of it');

reset role;

-- Deleting a task takes its history (and its cascaded comments/attachments leave no new rows).
delete from public.time_tasks where user_id = '00000000-0000-0000-0000-0000000000a1' and id = 't-a';
select is(
  (select count(*)::int from public.time_task_history where user_id = '00000000-0000-0000-0000-0000000000a1'),
  0, 'deleting a task deletes all its history, with no stray entries from the cascade');

select * from finish();
rollback;
