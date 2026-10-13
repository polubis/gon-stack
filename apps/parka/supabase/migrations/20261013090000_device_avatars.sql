-- Picture a user chose for one of their devices (the device ids that expenses
-- store). One row per account and device; no row means the default type icon.

create table public.device_avatars (
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id text not null check (btrim(device_id) <> ''),
  avatar text not null check (btrim(avatar) <> '' and char_length(avatar) <= 32),
  primary key (user_id, device_id)
);

alter table public.device_avatars enable row level security;

create policy device_avatars_owner on public.device_avatars
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.device_avatars to authenticated;
