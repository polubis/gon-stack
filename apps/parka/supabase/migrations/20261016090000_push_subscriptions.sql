-- Web Push: one row per browser/device subscription of a user. The endpoint is
-- the push service URL and identifies the device; keys encrypt the payload.
-- Expired subscriptions (push service answers 404/410) are deleted by the sender.

create table public.push_subscriptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy push_subscriptions_owner on public.push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- Push is opt-in: it needs a browser permission and a subscription, so it is
-- off until the user turns it on in settings.
alter table public.notification_preferences alter column push set default false;
update public.notification_preferences set push = false;
