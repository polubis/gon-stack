-- First-run finance tour: a row means the user finished it, either walking
-- it to the end (`completed`) or turning it off (`skipped`). The outcome is
-- valid until `expires_at`; after that the tour opens again (new features),
-- and finishing it again extends it. No row = the tour opens.

create table public.finance_tours (
  user_id uuid primary key references auth.users (id) on delete cascade,
  outcome text not null check (outcome in ('completed', 'skipped')),
  finished_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

alter table public.finance_tours enable row level security;

create policy finance_tours_owner on public.finance_tours
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on public.finance_tours to authenticated;

-- Accounts made before the tour existed already know the app: no tour until
-- the first expiry.
insert into public.finance_tours (user_id, outcome)
select id, 'skipped' from auth.users
on conflict (user_id) do nothing;
