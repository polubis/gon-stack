-- fk cross-ref: events.id
create table public.event_attendances (
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  visibility  public.attendance_visibility not null default 'public',
  created_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index on public.event_attendances (user_id);
-- partial index: event.getFriendsAttendance filters to public visibility only
create index on public.event_attendances (event_id) where visibility = 'public';

alter table public.event_attendances enable row level security;

-- own attendance always readable; others' only when public
create policy "attendance_select"
  on public.event_attendances for select
  using (
    user_id = auth.uid()
    or visibility = 'public'
  );

create policy "attendance_insert_own"
  on public.event_attendances for insert
  with check (auth.uid() = user_id);

create policy "attendance_update_own"
  on public.event_attendances for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "attendance_delete_own"
  on public.event_attendances for delete
  using (auth.uid() = user_id);

-- rollback: drop table public.event_attendances;
