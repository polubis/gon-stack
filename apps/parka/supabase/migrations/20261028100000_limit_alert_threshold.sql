-- A limit always notifies; the user only picks the percent of the limit from
-- which it does. Additive: the old `alert_at80` and `delivery` columns stay
-- (unused) so nothing is dropped.

alter table public.limits
  add column alert_at integer not null default 80
  check (alert_at between 1 and 100);

-- Limits that had alerts off keep them quiet until the limit is reached.
update public.limits set alert_at = 100 where alert_at80 = false;
