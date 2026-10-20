-- Time tasks get what expenses already have: the device they were created
-- from, and recurring rules that turn into ordinary tasks.
--
-- Device: same columns and rules as `expenses` (null = made before devices
-- were tracked, or created by a rule).
--
-- Recurring: a rule is an instruction. The server turns each occurrence up to
-- the end of the requested range into a plain task, once. (rule, occurrence)
-- is unique so inserting twice is a no-op, and `last_materialized_date` only
-- moves forward so a task the user deleted is never created again.

alter table public.time_tasks
  add column device_id text,
  add column device_name text,
  add column device_type text
    check (device_type in ('mobile', 'desktop', 'tablet')),
  add column device_model text check (char_length(device_model) <= 64),
  add column device_os text check (char_length(device_os) <= 32),
  add column device_browser text check (char_length(device_browser) <= 32),
  add column device_screen text check (char_length(device_screen) <= 16),
  add constraint time_tasks_device_complete check (
    (device_id is null) = (device_name is null)
    and (device_id is null) = (device_type is null)
  );

create table public.time_recurring (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  title text not null check (char_length(title) between 1 and 40),
  category_id text not null,
  priority_id text not null,
  -- null = lasts the whole day
  at time,
  interval text not null default 'weekly'
    check (interval in ('weekly', 'monthly', 'yearly')),
  start_date date not null,
  end_date date,
  active boolean not null default true,
  last_materialized_date date,
  primary key (user_id, id),
  constraint time_recurring_period_check
    check (end_date is null or end_date >= start_date),
  constraint time_recurring_category_fk
    foreign key (user_id, category_id)
    references public.time_categories (user_id, id) on delete restrict,
  constraint time_recurring_priority_fk
    foreign key (user_id, priority_id)
    references public.time_priorities (user_id, id) on delete restrict
);
create index time_recurring_category_idx on public.time_recurring (user_id, category_id);
create index time_recurring_priority_idx on public.time_recurring (user_id, priority_id);

alter table public.time_recurring enable row level security;
create policy time_recurring_owner on public.time_recurring
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter table public.time_tasks
  add column recurring_id text,
  add column occurrence_date date,
  add constraint time_tasks_recurring_fk
    foreign key (user_id, recurring_id)
    references public.time_recurring (user_id, id)
    on delete set null (recurring_id),
  add constraint time_tasks_occurrence_check
    check (recurring_id is null or occurrence_date is not null);

-- Nulls are distinct: plain tasks never collide, a rule's occurrence does.
create unique index time_tasks_recurring_occurrence_uniq
  on public.time_tasks (user_id, recurring_id, occurrence_date);
