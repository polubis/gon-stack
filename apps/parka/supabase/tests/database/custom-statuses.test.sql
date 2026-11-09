-- Custom task statuses at the database: steps are private per owner, a task on
-- a custom step is a started task, deleting a step sends its tasks back to the
-- built-in one, MCP lists and sets steps by id or name. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.time_categories (user_id, id, name)
select u, 'work', 'Praca'
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u
on conflict do nothing;
insert into public.time_priorities (user_id, id, name, value)
select u, 'high', 'Wysoki', 9
from unnest(array['00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2']::uuid[]) u
on conflict do nothing;

insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values (
  '0b9a4a52-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-0000000000a1',
  'Claude Desktop',
  encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'),
  'abcd', 'wxyz'
);

-- Nothing configured: today's three states, no stored row.
select is(
  public.mcp_list_statuses('secret-token-aaaaaaaaaaaa') #>> '{items,1,id}',
  'in_progress', 'without configuration the only step is in_progress');
select is(
  jsonb_array_length(public.mcp_list_statuses('secret-token-aaaaaaaaaaaa') -> 'items'),
  3, 'the workflow is open, one step, done');

insert into public.time_statuses (user_id, id, name, position)
values
  ('00000000-0000-0000-0000-0000000000a1', 'in_progress', 'W trakcie', 0),
  ('00000000-0000-0000-0000-0000000000a1', 'tstatus-review', 'Review', 1),
  ('00000000-0000-0000-0000-0000000000b2', 'tstatus-other', 'Cudzy', 0);

select results_eq(
  $$select item ->> 'id' from jsonb_array_elements(public.mcp_list_statuses('secret-token-aaaaaaaaaaaa') -> 'items') item$$,
  $$values ('open'::text), ('in_progress'), ('tstatus-review'), ('done')$$,
  'MCP lists open, the owner''s steps in order, done');
select throws_ok(
  $$insert into public.time_statuses (user_id, id, name, position) values ('00000000-0000-0000-0000-0000000000a1', 'done', 'X', 5)$$,
  '23514', null, 'open and done are reserved ids');

insert into public.time_tasks (user_id, id, title, category_id, priority_id, day, key)
values
  ('00000000-0000-0000-0000-0000000000a1', 't-a', 'Zadanie A', 'work', 'high', '2026-11-10', 'VYB-1'),
  ('00000000-0000-0000-0000-0000000000a1', 't-b', 'Zadanie B', 'work', 'high', '2026-11-10', 'VYB-2');

-- MCP: a step by id or by name (any case) starts the task.
select is(
  public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-a', 'tstatus-review') ->> 'status',
  'tstatus-review', 'a custom step is set by id');
select is(
  (select in_progress and not done from public.time_tasks where id = 't-a'),
  true, 'a task on a custom step is started, not done');
select is(
  public.mcp_get_task('secret-token-aaaaaaaaaaaa', 't-a') ->> 'statusName',
  'Review', 'the task shows the step name');
select is(
  public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-b', 'review') ->> 'status',
  'tstatus-review', 'a step is set by its name, ignoring case');
select throws_ok(
  $$select public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-a', 'nie-ma-takiego')$$,
  'PT400', 'invalid status', 'an unknown status is refused');
select throws_ok(
  $$select public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-a', 'tstatus-other')$$,
  'PT400', 'invalid status', 'another owner''s step is unknown');

-- Filter.
select is(
  jsonb_array_length(public.mcp_list_tasks('secret-token-aaaaaaaaaaaa', 'tstatus-review') -> 'items'),
  2, 'list_tasks filters by a custom step');
select is(
  jsonb_array_length(public.mcp_list_tasks('secret-token-aaaaaaaaaaaa', 'in_progress') -> 'items'),
  0, 'the built-in step filter leaves custom steps out');

-- History: a move between started steps is one named entry.
select public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-a', 'in_progress');
select results_eq(
  $$select old_value, new_value from public.time_task_history where task_id = 't-a' and field = 'status' order by created_at desc limit 1$$,
  $$values ('Review'::text, 'W trakcie'::text)$$,
  'the move from Review to in progress is recorded by names');
select is(
  (select count(*)::int from public.time_task_history where task_id = 't-a' and field = 'in_progress'),
  1, 'the in_progress flag changed once (open to started)');

-- Done clears nothing by itself in MCP, but the database refuses a done task on a step.
select throws_ok(
  $$update public.time_tasks set done = true where id = 't-b'$$,
  '23514', null, 'a task cannot be done and stay on a custom step');
select public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-b', 'done');
select is(
  (select status_id is null and done from public.time_tasks where id = 't-b'),
  true, 'MCP done leaves no custom step');

-- Deleting a step falls its tasks back to the built-in one.
select public.mcp_set_task_status('secret-token-aaaaaaaaaaaa', 't-a', 'tstatus-review');
delete from public.time_statuses where user_id = '00000000-0000-0000-0000-0000000000a1' and id = 'tstatus-review';
select results_eq(
  $$select in_progress, status_id from public.time_tasks where id = 't-a'$$,
  $$values (true, null::text)$$,
  'a removed step sends its tasks back to in_progress');

-- Privacy.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from public.time_statuses),
  1, 'an owner sees only their own steps');
reset role;

select is(
  (select count(*)::int from public.time_statuses where user_id = '00000000-0000-0000-0000-0000000000a1'),
  1, 'the other owner''s steps are untouched');

select * from finish();
rollback;
