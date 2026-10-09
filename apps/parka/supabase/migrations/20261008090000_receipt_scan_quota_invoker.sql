-- Receipt scan quota hardening: `claim_receipt_scan` no longer runs as
-- SECURITY DEFINER and no longer trusts a client-supplied limit.
-- Users may only read/insert their own attempts (no update/delete), so they
-- cannot erase attempts to reset the quota.

drop function public.claim_receipt_scan(integer);

grant select, insert on public.receipt_scans to authenticated;

create policy receipt_scans_select_own on public.receipt_scans
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy receipt_scans_insert_own on public.receipt_scans
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create function public.claim_receipt_scan()
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  max_per_day constant integer := 20;
  used integer;
begin
  if caller is null then
    return false;
  end if;

  -- Serialise concurrent claims of one user so parallel requests cannot overshoot.
  perform pg_advisory_xact_lock(hashtextextended(caller::text, 0));

  select count(*) into used
  from public.receipt_scans
  where user_id = caller
    and created_at > now() - interval '24 hours';

  if used >= max_per_day then
    return false;
  end if;

  insert into public.receipt_scans (user_id) values (caller);
  return true;
end;
$$;

revoke execute on function public.claim_receipt_scan() from public, anon;
grant execute on function public.claim_receipt_scan() to authenticated;
