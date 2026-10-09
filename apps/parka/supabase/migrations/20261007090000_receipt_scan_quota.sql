-- Receipt scan quota: every scan attempt is recorded, `claim_receipt_scan`
-- admits one only while the caller is under the rolling 24h limit.
-- The table is reachable only through the function, so users cannot erase
-- their own attempts to reset the quota.

create table public.receipt_scans (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index receipt_scans_user_created_idx
  on public.receipt_scans (user_id, created_at desc);

alter table public.receipt_scans enable row level security;
revoke all on public.receipt_scans from anon, authenticated;

create function public.claim_receipt_scan(max_per_day integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
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

revoke execute on function public.claim_receipt_scan(integer) from public, anon;
grant execute on function public.claim_receipt_scan(integer) to authenticated;
