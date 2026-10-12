-- Per-account typeahead memory for free-text expense fields: every value the
-- user typed and how often it was used. Values are unique per field ignoring
-- case and surrounding spaces.

create table public.field_suggestions (
  user_id uuid not null references auth.users (id) on delete cascade,
  field text not null check (field in ('merchant', 'paymentMethod')),
  value text not null check (btrim(value) <> '' and char_length(value) <= 100),
  value_key text generated always as (lower(btrim(value))) stored,
  use_count integer not null default 0 check (use_count >= 0),
  last_used timestamptz,
  primary key (user_id, field, value_key)
);

alter table public.field_suggestions enable row level security;

create policy field_suggestions_owner on public.field_suggestions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.field_suggestions to authenticated;

-- One more use of a value: creates it on first use, keeps the latest spelling.
create function public.record_field_use(p_field text, p_value text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.field_suggestions (user_id, field, value, use_count, last_used)
  values ((select auth.uid()), p_field, btrim(p_value), 1, now())
  on conflict (user_id, field, value_key) do update
    set use_count = public.field_suggestions.use_count + 1,
        last_used = now(),
        value = excluded.value;
$$;

revoke execute on function public.record_field_use(text, text) from public, anon;
grant execute on function public.record_field_use(text, text) to authenticated;
