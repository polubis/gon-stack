-- Live refresh notice after MCP writes: token check, domain check, private topic
-- readable by the owner only. Run: `pnpm db:test`.
begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-a@parka.test'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner-b@parka.test');

insert into public.mcp_tokens (id, user_id, name, token_hash, token_hint, token_tail)
values (
  '0b9a4a52-1111-4111-8111-111111111111',
  '00000000-0000-0000-0000-0000000000a1',
  'Claude Desktop',
  encode(sha256(convert_to('secret-token-aaaaaaaaaaaa', 'utf8')), 'hex'),
  'abcd', 'wxyz'
);

select ok(public.mcp_notify_change('secret-token-aaaaaaaaaaaa', 'time'), 'a valid token announces a time change');
select ok(public.mcp_notify_change('secret-token-aaaaaaaaaaaa', 'finance'), 'a valid token announces a finance change');
select throws_ok($$select public.mcp_notify_change('wrong-token', 'time')$$, 'PT401', null, 'an unknown token is refused');
select throws_ok($$select public.mcp_notify_change('secret-token-aaaaaaaaaaaa', 'weather')$$, 'PT400', null, 'an unknown domain is refused');

select is(
  (select count(*)::int from realtime.messages where topic = 'data-changes:00000000-0000-0000-0000-0000000000a1' and event = 'changed'),
  2,
  'both notices are on the owner topic');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is(
  (select count(*)::int from realtime.messages where topic = 'data-changes:00000000-0000-0000-0000-0000000000a1'),
  0,
  'another account cannot read the owner topic');

select * from finish();
rollback;
