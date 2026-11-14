-- Live refresh of finance data after a write from another device: any row
-- change of the owner's finance tables sends a Realtime broadcast on the
-- private topic `data-changes:<user id>` (domain "finance"), same topic and
-- policy as MCP time notices. Open tabs refetch over REST; a failed notice
-- never fails the write.

create function public.notify_finance_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := coalesce(new.user_id, old.user_id);
begin
  perform realtime.send(
    jsonb_build_object('domain', 'finance'),
    'changed',
    'data-changes:' || v_user::text,
    true
  );
  return null;
exception when others then
  return null;
end;
$$;

revoke all on function public.notify_finance_change() from public, anon, authenticated;

create trigger notify_finance_change
after insert or update or delete on public.expenses
for each row execute function public.notify_finance_change();

create trigger notify_finance_change
after insert or update or delete on public.categories
for each row execute function public.notify_finance_change();

create trigger notify_finance_change
after insert or update or delete on public.recurring_expenses
for each row execute function public.notify_finance_change();

create trigger notify_finance_change
after insert or update or delete on public.limits
for each row execute function public.notify_finance_change();
