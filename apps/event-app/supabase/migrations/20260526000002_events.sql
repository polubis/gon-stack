create table public.events (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text,
  category        public.event_category not null,
  start_date_time timestamptz not null,
  end_date_time   timestamptz,
  street          text not null,
  number          text not null,
  postal_code     text not null,
  city            text not null,
  lat             double precision not null,
  lng             double precision not null,
  external_link   text,
  image_url       text,
  keywords        text[] not null default '{}',
  organizer_info  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint events_end_after_start check (end_date_time is null or end_date_time > start_date_time)
);

create index on public.events (owner_id);
create index on public.events (category);
create index on public.events (city);
create index on public.events (start_date_time);
create index on public.events (category, city, start_date_time);
create index on public.events using gin (name gin_trgm_ops);
create index on public.events using gin (keywords);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

-- all users (anon + authenticated) can read events
create policy "events_select_all"
  on public.events for select
  using (true);

-- authenticated users can insert their own events
create policy "events_insert_authenticated"
  on public.events for insert
  with check (auth.uid() is not null and auth.uid() = owner_id);

-- assumption: admin role is stored in Supabase auth.jwt() app_metadata as { "role": "admin" }
create policy "events_update_owner_or_admin"
  on public.events for update
  using (
    auth.uid() = owner_id
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.uid() = owner_id
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "events_delete_owner_or_admin"
  on public.events for delete
  using (
    auth.uid() = owner_id
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- rollback: drop table public.events;
