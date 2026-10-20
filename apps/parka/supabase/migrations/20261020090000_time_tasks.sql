-- Time module: tasks with their own categories and priorities (separate from
-- expense categories). Composite PKs keep client-minted string ids.

create table public.time_categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 40),
  icon text not null default 'sparkles',
  color text not null default '#4b5a52',
  primary key (user_id, id)
);

create table public.time_priorities (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 40),
  value smallint not null check (value between 1 and 10),
  primary key (user_id, id)
);

create table public.time_tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  title text not null check (char_length(title) between 1 and 40),
  category_id text not null,
  priority_id text not null,
  day date not null,
  -- null = lasts the whole day
  at time,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint time_tasks_category_fk
    foreign key (user_id, category_id)
    references public.time_categories (user_id, id) on delete restrict,
  constraint time_tasks_priority_fk
    foreign key (user_id, priority_id)
    references public.time_priorities (user_id, id) on delete restrict
);
create index time_tasks_day_idx on public.time_tasks (user_id, day);
create index time_tasks_category_idx on public.time_tasks (user_id, category_id);
create index time_tasks_priority_idx on public.time_tasks (user_id, priority_id);

alter table public.time_categories enable row level security;
alter table public.time_priorities enable row level security;
alter table public.time_tasks enable row level security;

create policy time_categories_owner on public.time_categories
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy time_priorities_owner on public.time_priorities
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy time_tasks_owner on public.time_tasks
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Default categories and priorities of an account.
create function public.seed_time_defaults(target uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.time_categories (user_id, id, name, icon, color) values
    (target, 'work', 'Praca', 'briefcase', '#2563eb'),
    (target, 'home', 'Dom', 'home', '#c2410c'),
    (target, 'health', 'Zdrowie', 'heart', '#0d9488'),
    (target, 'learn', 'Nauka', 'graduation', '#7c3aed'),
    (target, 'rest', 'Odpoczynek', 'coffee', '#ca8a04')
  on conflict do nothing;
  insert into public.time_priorities (user_id, id, name, value) values
    (target, 'low', 'Niski', 2),
    (target, 'medium', 'Średni', 5),
    (target, 'high', 'Wysoki', 9)
  on conflict do nothing;
$$;
revoke all on function public.seed_time_defaults(uuid) from public, anon, authenticated;

create function public.handle_new_user_time()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_time_defaults(new.id);
  return new;
end;
$$;
revoke all on function public.handle_new_user_time() from public, anon, authenticated;

create trigger on_auth_user_created_time
  after insert on auth.users
  for each row execute function public.handle_new_user_time();

-- Existing accounts get the defaults too.
select public.seed_time_defaults(id) from auth.users;
