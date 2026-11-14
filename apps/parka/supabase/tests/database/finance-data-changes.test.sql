-- Live refresh notice after finance writes: owner topic only. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

insert into auth.users (id, instance_id, aud, role, email)
values ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'finance-owner@parka.test');

insert into public.categories (user_id, id, name, icon, color)
values ('00000000-0000-0000-0000-0000000000c1', 'c-1', 'Food', 'cart', '#0f7a4f');

select is(
  (select count(*)::int from realtime.messages where topic = 'data-changes:00000000-0000-0000-0000-0000000000c1' and event = 'changed'),
  1,
  'adding a category notices the owner topic');

update public.categories set name = 'Groceries' where user_id = '00000000-0000-0000-0000-0000000000c1' and id = 'c-1';
delete from public.categories where user_id = '00000000-0000-0000-0000-0000000000c1' and id = 'c-1';

select is(
  (select count(*)::int from realtime.messages where topic = 'data-changes:00000000-0000-0000-0000-0000000000c1'),
  3,
  'update and delete notice too');

select is(
  (select payload->>'domain' from realtime.messages where topic = 'data-changes:00000000-0000-0000-0000-0000000000c1' limit 1),
  'finance',
  'notice carries only the finance domain');

select * from finish();
rollback;
