-- MCP knowledge functions: token check, owner isolation, validation errors,
-- topic tags, progress, deletes returning media paths, private helpers.
-- Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

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

-- B owns a catalog A must never reach.
insert into public.knowledge_catalogs (user_id, id, name)
values ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000c0b2', 'Cudzy');

select throws_ok($$select public.mcp_list_knowledge_tags('wrong-token')$$, 'PT401', null, 'an unknown token is refused');

create temp table made (key text primary key, id uuid);
grant all on made to public;

insert into made select 'category', (public.mcp_create_knowledge_category('secret-token-aaaaaaaaaaaa', 'Backend')->>'id')::uuid;
select throws_ok($$select public.mcp_create_knowledge_category('secret-token-aaaaaaaaaaaa', ' backend ')$$, 'PT400', 'A category with this name already exists', 'a taken category name is a readable refusal');

insert into made select 'catalog', (public.mcp_create_knowledge_catalog('secret-token-aaaaaaaaaaaa', 'Supabase', (select id from made where key = 'category'))->>'id')::uuid;
select is(
  public.mcp_create_knowledge_catalog('secret-token-aaaaaaaaaaaa', 'X', '00000000-0000-0000-0000-00000000ca99'),
  null, 'a catalog cannot be filed under a missing category');
select throws_ok(
  $$select public.mcp_delete_knowledge_category('secret-token-aaaaaaaaaaaa', (select id from made where key = 'category'))$$,
  'PT400', null, 'a category with catalogs cannot be deleted');

insert into made select 'tag', (public.mcp_create_knowledge_tag('secret-token-aaaaaaaaaaaa', 'sql')->>'id')::uuid;
select throws_ok($$select public.mcp_create_knowledge_tag('secret-token-aaaaaaaaaaaa', 'SQL')$$, 'PT400', null, 'a taken tag name is refused');

select is(
  public.mcp_create_knowledge_topic('secret-token-aaaaaaaaaaaa', '00000000-0000-0000-0000-00000000c0b2', 'Intruz'),
  null, 'a topic cannot be created in another owner catalog');
insert into made select 'topic', (public.mcp_create_knowledge_topic(
  'secret-token-aaaaaaaaaaaa', (select id from made where key = 'catalog'), 'RLS', 'Polityki',
  '2026-11-18', array[(select id from made where key = 'tag')])->>'id')::uuid;
select is(
  (public.mcp_knowledge_topic_json('00000000-0000-0000-0000-0000000000a1', (select id from made where key = 'topic'))->'tagIds')->>0,
  (select id::text from made where key = 'tag'), 'the topic carries its tag');
select throws_ok(
  $$select public.mcp_update_knowledge_topic('secret-token-aaaaaaaaaaaa', (select id from made where key = 'topic'), '{"tagIds":["00000000-0000-0000-0000-00000000a0b2"]}')$$,
  'PT400', 'Tag not found', 'an unknown tag is refused');
select is(
  public.mcp_update_knowledge_topic('secret-token-aaaaaaaaaaaa', (select id from made where key = 'topic'), '{"studyDay":null,"tagIds":[]}')->>'studyDay',
  null, 'a null study day sends the topic to the backlog and tags can be cleared');

insert into made select 'reel', (public.mcp_create_knowledge_reel('secret-token-aaaaaaaaaaaa', (select id from made where key = 'topic'), '# Polityki')->>'id')::uuid;
select throws_ok(
  $$select public.mcp_create_knowledge_reel('secret-token-aaaaaaaaaaaa', (select id from made where key = 'topic'), '   ')$$,
  'PT400', null, 'a blank reel is refused');
select is(
  (public.mcp_set_knowledge_progress('secret-token-aaaaaaaaaaaa', (select id from made where key = 'reel'), true)->>'done')::boolean,
  true, 'a reel can be marked done');
select is(
  (public.mcp_get_knowledge_topic('secret-token-aaaaaaaaaaaa', (select id from made where key = 'topic'))->'topic'->>'doneCount')::int,
  1, 'the topic counts the finished reel');

select is(
  (public.mcp_list_knowledge_topics('secret-token-bbbbbbbbbbbb')->'items')::text,
  '[]', 'another owner sees none of these topics');

select is(
  public.mcp_delete_knowledge_catalog('secret-token-bbbbbbbbbbbb', (select id from made where key = 'catalog')),
  null, 'another owner cannot delete the catalog');
select is(
  public.mcp_delete_knowledge_catalog('secret-token-aaaaaaaaaaaa', (select id from made where key = 'catalog'))::text,
  '{"paths": []}', 'the owner deletes the catalog and gets the (empty) list of files to remove');
select is(
  (select count(*)::int from public.knowledge_reels where user_id = '00000000-0000-0000-0000-0000000000a1'),
  0, 'topics and reels went with the catalog');

select ok(public.mcp_notify_change('secret-token-aaaaaaaaaaaa', 'knowledge'), 'a knowledge change can be announced');
select ok(
  not has_function_privilege('anon', 'public.mcp_knowledge_topic_json(uuid, uuid)', 'execute'),
  'helpers taking a user id are not callable with the anonymous key');

select * from finish();
rollback;
