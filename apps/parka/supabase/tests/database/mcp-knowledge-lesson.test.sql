-- mcp_create_knowledge_lesson: reels keep their order, tags are found or
-- created, a failure leaves nothing behind, owners stay isolated.
-- Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values
  ('0b9a4a52-1111-4111-8111-111111111111', '00000000-0000-0000-0000-0000000000a1', 'A',
   encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'), 'abcd', 'wxyz'),
  ('0b9a4a52-2222-4222-8222-222222222222', '00000000-0000-0000-0000-0000000000b2', 'B',
   encode(sha256(convert_to('secret-token-bbbbbbbbbbbb', 'utf8')), 'hex'), 'abcd', 'wxyz');

insert into public.knowledge_catalogs (user_id, id, name)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000c0a1', 'Moj'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000c0b2', 'Cudzy');
insert into public.knowledge_tags (user_id, id, name)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a0a1', 'sql');

create temp table lesson (res jsonb);
grant all on lesson to public;
insert into lesson select public.mcp_create_knowledge_lesson(
  'secret-token-aaaaaaaaaaaa', '00000000-0000-0000-0000-00000000c0a1', 'Lekcja', 'Opis',
  '2026-11-30', array['SQL', 'rls'], array['pierwszy', 'drugi', 'trzeci']);

select is(
  (select array_agg(r->>'body' order by (r->>'position')::int) from lesson, jsonb_array_elements(res->'reels') r),
  array['pierwszy', 'drugi', 'trzeci'], 'reels keep the given order');
select is((select res->'topic'->>'studyDay' from lesson), '2026-11-30', 'the study day is set');
select is(
  (select count(*)::int from public.knowledge_tags where user_id = '00000000-0000-0000-0000-0000000000a1'),
  2, 'an existing tag is reused ignoring case and a missing one is created');
select is((select jsonb_array_length(res->'topic'->'tagIds') from lesson), 2, 'both tags label the topic');

select throws_ok(
  $$select public.mcp_create_knowledge_lesson('secret-token-aaaaaaaaaaaa', '00000000-0000-0000-0000-00000000c0a1', 'Zla', null, null, array['nowy'], array['ok', ''])$$,
  'PT400', null, 'a blank reel refuses the lesson');
select is(
  (select count(*)::int from public.knowledge_topics where user_id = '00000000-0000-0000-0000-0000000000a1' and title = 'Zla')
  + (select count(*)::int from public.knowledge_tags where user_id = '00000000-0000-0000-0000-0000000000a1' and name = 'nowy'),
  0, 'a failed lesson leaves no topic and no tag');
select is(
  public.mcp_create_knowledge_lesson('secret-token-aaaaaaaaaaaa', '00000000-0000-0000-0000-00000000c0b2', 'Intruz'),
  null, 'a lesson cannot go into another owner catalog');
select throws_ok(
  $$select public.mcp_create_knowledge_lesson('wrong-token', '00000000-0000-0000-0000-00000000c0a1', 'X')$$,
  'PT401', null, 'an unknown token is refused');

select * from finish();
rollback;
