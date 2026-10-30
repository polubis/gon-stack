-- Devices an account has written from: one row per device, taken from its
-- newest expense, else its newest task. Settings used to read every expense
-- row of the account just to find these, and stopped at the Data API row cap
-- (1000), so a device that only wrote old expenses went missing.
--
-- Rows come expense devices first (newest first), then devices seen only in
-- tasks. `security invoker` keeps row level security in force.

create function public.own_devices()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with expense_devices as (
    select distinct on (device_id)
      device_id, device_name, device_type, device_model, device_os,
      device_browser, device_screen, date::text as seen, 1 as source
    from public.expenses
    where device_id is not null
    order by device_id, date desc
  ),
  task_devices as (
    select distinct on (device_id)
      device_id, device_name, device_type, device_model, device_os,
      device_browser, device_screen, day::text as seen, 2 as source
    from public.time_tasks
    where device_id is not null
    order by device_id, day desc nulls last
  ),
  every_device as (
    select * from expense_devices
    union all
    select * from task_devices
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'device_id', device_id,
        'device_name', device_name,
        'device_type', device_type,
        'device_model', device_model,
        'device_os', device_os,
        'device_browser', device_browser,
        'device_screen', device_screen
      )
      order by source, seen desc, device_id
    ),
    '[]'::jsonb
  )
  from every_device;
$$;

revoke execute on function public.own_devices() from public, anon;
grant execute on function public.own_devices() to authenticated;

-- Rollback: drop function public.own_devices();
