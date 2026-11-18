-- Knowledge module at the database: owner-only access (RLS), cross-owner
-- references refused, cascades, restrict on used categories, unique names,
-- size checks, study days, reel media (consistency + private bucket policies)
-- and the edit stamp. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.knowledge_categories (user_id, id, name) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000ca01', 'Backend'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000ca02', 'Backend');
insert into public.knowledge_catalogs (user_id, id, category_id, name) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000ca01', 'Supabase'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000c002', null, 'Cudze');
insert into public.knowledge_tags (user_id, id, name) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000a001', 'sql'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000a002', 'sql');
insert into public.knowledge_topics (user_id, id, catalog_id, title) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000c001', 'RLS'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000c002', 'Cudzy');
insert into public.knowledge_reels (user_id, id, topic_id, body) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001', '# Polityki');

-- Table level (as the table owner): constraints and references.
select throws_ok(
  $$insert into public.knowledge_categories (user_id, name) values ('00000000-0000-0000-0000-0000000000a1', '  backend ')$$,
  '23505', null, 'category name is unique per owner ignoring case');
select lives_ok(
  $$insert into public.knowledge_categories (user_id, name) values ('00000000-0000-0000-0000-0000000000a1', 'Frontend')$$,
  'a different category name is accepted');
select throws_ok(
  $$insert into public.knowledge_tags (user_id, name) values ('00000000-0000-0000-0000-0000000000a1', 'SQL')$$,
  '23505', null, 'tag name is unique per owner ignoring case');
select throws_ok(
  $$insert into public.knowledge_catalogs (user_id, name, category_id) values ('00000000-0000-0000-0000-0000000000a1', 'X', '00000000-0000-0000-0000-00000000ca02')$$,
  '23503', null, 'catalog cannot use another owner category');
select throws_ok(
  $$insert into public.knowledge_topics (user_id, catalog_id, title) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000c002', 'X')$$,
  '23503', null, 'topic cannot sit in another owner catalog');
select throws_ok(
  $$insert into public.knowledge_topic_tags (user_id, topic_id, tag_id) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000a002')$$,
  '23503', null, 'topic cannot take another owner tag');
select throws_ok(
  $$insert into public.knowledge_reels (user_id, topic_id, body) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000d001', '   ')$$,
  '23514', null, 'blank reel is refused');
select throws_ok(
  $$insert into public.knowledge_reels (user_id, topic_id, body) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000d001', repeat('x', 8001))$$,
  '23514', null, 'reel over 8000 characters is refused');
select throws_ok(
  $$insert into public.knowledge_categories (user_id, name, color) values ('00000000-0000-0000-0000-0000000000a1', 'Zly', 'red')$$,
  '23514', null, 'category color must be hex');
select throws_ok(
  $$delete from public.knowledge_categories where id = '00000000-0000-0000-0000-00000000ca01'$$,
  '23503', null, 'a used category cannot be deleted');

-- Study day: a plain date, null means backlog.
select lives_ok(
  $$update public.knowledge_topics set study_day = '2026-11-18' where id = '00000000-0000-0000-0000-00000000d001'$$,
  'a topic takes a study day');

-- Reel media: path and kind come together, inside the owner folder.
select throws_ok(
  $$update public.knowledge_reels set media_path = '00000000-0000-0000-0000-0000000000a1/e001/x' where id = '00000000-0000-0000-0000-00000000e001'$$,
  '23514', null, 'media path without kind is refused');
select throws_ok(
  $$update public.knowledge_reels set media_kind = 'image' where id = '00000000-0000-0000-0000-00000000e001'$$,
  '23514', null, 'media kind without path is refused');
select throws_ok(
  $$update public.knowledge_reels set media_path = '00000000-0000-0000-0000-0000000000a1/e001/x', media_kind = 'audio' where id = '00000000-0000-0000-0000-00000000e001'$$,
  '23514', null, 'media kind must be image or video');
select throws_ok(
  $$update public.knowledge_reels set media_path = '00000000-0000-0000-0000-0000000000b2/e001/x', media_kind = 'image' where id = '00000000-0000-0000-0000-00000000e001'$$,
  '23514', null, 'media file must sit in the owner folder');
select lives_ok(
  $$update public.knowledge_reels set media_path = '00000000-0000-0000-0000-0000000000a1/00000000-0000-0000-0000-00000000e001/x', media_kind = 'image' where id = '00000000-0000-0000-0000-00000000e001'$$,
  'a reel takes media from the owner folder');

-- Bucket: private, images and two video types, 20 MB.
select ok(
  exists (
    select 1 from storage.buckets
    where id = 'knowledge-media' and public = false
      and file_size_limit = 20971520
      and allowed_mime_types @> array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
      and not allowed_mime_types && array['application/pdf', 'text/plain']),
  'knowledge-media is a private bucket for images and mp4/webm video');

-- Edit stamp moves on update.
update public.knowledge_reels set updated_at = '2020-01-01' where id = '00000000-0000-0000-0000-00000000e001';
update public.knowledge_reels set body = 'Nowe' where id = '00000000-0000-0000-0000-00000000e001';
select ok(
  (select updated_at > '2021-01-01' from public.knowledge_reels where id = '00000000-0000-0000-0000-00000000e001'),
  'updating a reel stamps updated_at');

-- Owner A through the API role.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select is((select count(*)::int from public.knowledge_catalogs), 1, 'owner A sees only own catalogs');
select is((select count(*)::int from public.knowledge_topics), 1, 'owner A sees only own topics');
select lives_ok(
  $$insert into public.knowledge_reel_progress (user_id, reel_id) values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000e001')$$,
  'owner A marks an own reel done');
select throws_ok(
  $$insert into public.knowledge_topics (user_id, catalog_id, title) values ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-00000000c002', 'Wlam')$$,
  '42501', null, 'owner A cannot write rows for owner B');
update public.knowledge_topics set title = 'Hack' where id = '00000000-0000-0000-0000-00000000d002';
delete from public.knowledge_catalogs where id = '00000000-0000-0000-0000-00000000c002';

select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id) values ('knowledge-media', '00000000-0000-0000-0000-0000000000a1/00000000-0000-0000-0000-00000000e001/x', '00000000-0000-0000-0000-0000000000a1')$$,
  'owner A stores media in the own folder');
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id) values ('knowledge-media', '00000000-0000-0000-0000-0000000000b2/stolen', '00000000-0000-0000-0000-0000000000a1')$$,
  '42501', null, 'owner A cannot store media in the folder of B');

-- Owner B sees none of A.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is((select count(*)::int from storage.objects where bucket_id = 'knowledge-media'), 0, 'owner B sees no media files of A');
select is((select count(*)::int from public.knowledge_reels), 0, 'owner B sees no reels of A');
select is((select count(*)::int from public.knowledge_reel_progress), 0, 'owner B sees no progress of A');

-- Anonymous role has no access at all.
reset role;
select is(
  (select study_day::text from public.knowledge_topics where id = '00000000-0000-0000-0000-00000000d001'), '2026-11-18',
  'study day of A is kept');
set local role anon;
select throws_ok(
  $$select count(*) from public.knowledge_topics$$,
  '42501', null, 'anon cannot read topics');

-- Cascade: deleting a catalog removes topics, reels and progress.
reset role;
delete from public.knowledge_catalogs where id = '00000000-0000-0000-0000-00000000c001';
select is(
  (select count(*)::int from public.knowledge_reels where user_id = '00000000-0000-0000-0000-0000000000a1')
  + (select count(*)::int from public.knowledge_reel_progress where user_id = '00000000-0000-0000-0000-0000000000a1'),
  0, 'deleting a catalog removes its reels and progress');
select is((select count(*)::int from public.knowledge_tags where user_id = '00000000-0000-0000-0000-0000000000a1'), 1, 'deleting a catalog keeps tags');

select * from finish();
rollback;
