create type public.user_role as enum ('user', 'admin');

-- Create the profiles table linked to auth.users
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  avatar_url text,
  username text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  primary key (id)
);
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "users_can_read_own_profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Role is excluded from the columns users can update
create policy "users_can_update_own_profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (role = (select role from public.profiles where id = (select auth.uid())));

-- Inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();