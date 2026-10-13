-- Device recognition: what the browser reported about the device is kept on
-- each expense; the per-device picture and custom name live in one profile row
-- (formerly `device_avatars`). No row, or a row with both null, means defaults.

alter table public.expenses
  add column device_model text check (char_length(device_model) <= 64),
  add column device_os text check (char_length(device_os) <= 32),
  add column device_browser text check (char_length(device_browser) <= 32),
  add column device_screen text check (char_length(device_screen) <= 16);

alter table public.device_avatars rename to device_profiles;
alter policy device_avatars_owner on public.device_profiles rename to device_profiles_owner;

alter table public.device_profiles
  alter column avatar drop not null,
  add column custom_name text check (
    custom_name is null
    or (btrim(custom_name) <> '' and char_length(custom_name) <= 40)
  );
