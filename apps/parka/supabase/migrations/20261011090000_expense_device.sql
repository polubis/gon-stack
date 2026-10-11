-- The device an expense was created from: a stable per-browser id, a readable
-- name and its type. Null for expenses made before devices were tracked.

alter table public.expenses
  add column device_id text,
  add column device_name text,
  add column device_type text
    check (device_type in ('mobile', 'desktop', 'tablet')),
  add constraint expenses_device_complete check (
    (device_id is null) = (device_name is null)
    and (device_id is null) = (device_type is null)
  );
