-- Live refresh after MCP writes: once a write tool finished, the server calls
-- `mcp_notify_change` and the owner's open app gets a Realtime broadcast on the
-- private topic `data-changes:<user id>` ("time" or "finance" changed) and
-- silently reloads. Only the owner may listen to their topic.

create function public.mcp_notify_change(p_token text, p_domain text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  if p_domain not in ('time', 'finance') then
    raise exception 'unknown domain' using errcode = 'PT400';
  end if;
  perform realtime.send(
    jsonb_build_object('domain', p_domain),
    'changed',
    'data-changes:' || v_user::text,
    true
  );
  return true;
end;
$$;

revoke all on function public.mcp_notify_change(text, text) from public, anon, authenticated;
grant execute on function public.mcp_notify_change(text, text) to anon, authenticated;

create policy "owner listens to own data changes"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) = 'data-changes:' || (select auth.uid())::text
);
