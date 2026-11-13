-- One-time attachment upload tickets: bound to a task, 5 min life, burn on first
-- use, only the hash stored, history signed as the requesting token. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

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
  ('00000000-0000-0000-0000-0000000000b2', 't-b', 'Zadanie B', 'work', 'high', '2026-10-31');
insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values (
  '0b9a4a52-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-0000000000a1',
  'Claude Desktop',
  encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'),
  'abcd', 'wxyz'
);

create temp table t as
select public.mcp_request_upload('secret-token-aaaaaaaaaaaa', 't-a', 'demo.mp4', 'video/mp4') as r;

select matches((select r ->> 'ticket' from t), '^parka_up_[0-9a-f]{64}$', 'a valid token gets a ticket');
select is((select count(*)::int from public.mcp_upload_tickets where ticket_hash = (select r ->> 'ticket' from t)), 0, 'the ticket itself is not stored');
select is((select count(*)::int from public.mcp_upload_tickets where ticket_hash = public.mcp_ticket_hash((select r ->> 'ticket' from t))), 1, 'only its hash is stored');
select is(public.mcp_request_upload('secret-token-aaaaaaaaaaaa', 't-b', 'a.txt', 'text/plain'), null, 'another owner task gets no ticket');
select throws_ok($$select public.mcp_request_upload('wrong-token', 't-a', 'a.txt', 'text/plain')$$, 'PT401', null, 'an unknown token gets no ticket');

select is(public.mcp_claim_upload('parka_up_nope'), null, 'an unknown ticket is refused');
select is((public.mcp_claim_upload((select r ->> 'ticket' from t))) ->> 'name', 'demo.mp4', 'the ticket is claimed once');
select is(public.mcp_claim_upload((select r ->> 'ticket' from t)), null, 'a used ticket is refused');

select is(
  (public.mcp_finish_upload((select r ->> 'ticket' from t), '0bc01207-5250-4718-a917-8041238c93d2', 'demo.mp4', 3145728, 'video/mp4')) ->> 'size',
  '3145728', 'a claimed ticket records the file');
select is(
  (select bot_name from public.time_task_history where task_id = 't-a' and kind = 'attachment_added'),
  'Claude Desktop', 'the history is signed as the requesting token');
select throws_ok(
  $$select public.mcp_finish_upload((select r ->> 'ticket' from t), '1bc01207-5250-4718-a917-8041238c93d2', 'x.mp4', 1, 'video/mp4')$$,
  'PT401', null, 'a finished ticket cannot record a second file');

create temp table e as
select public.mcp_request_upload('secret-token-aaaaaaaaaaaa', 't-a', 'old.txt', 'text/plain') as r;
update public.mcp_upload_tickets set expires_at = now() - interval '1 second' where name = 'old.txt';
select is(public.mcp_claim_upload((select r ->> 'ticket' from e)), null, 'an expired ticket is refused');

select throws_ok(
  $$select public.mcp_finish_upload('parka_up_nope', '2bc01207-5250-4718-a917-8041238c93d2', 'x', 1, 'text/plain')$$,
  'PT401', null, 'an unknown ticket records nothing');

select * from finish();
rollback;
