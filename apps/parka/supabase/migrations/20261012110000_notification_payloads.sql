-- Notifications become typed events: a `kind`, a structured `payload` (the
-- data the diff view renders), a real timestamp and a read mark. `age_days`
-- was a seed-only stand-in for the timestamp.
alter table public.notifications
  add column payload jsonb not null default '{}'::jsonb,
  add column created_at timestamptz not null default now(),
  add column read_at timestamptz;

alter table public.notifications drop column age_days;

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
