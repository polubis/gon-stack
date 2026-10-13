-- Device photo: WebP variants live in the public `device-photos` bucket under
-- `<user_id>/<device_id>/<size>.webp`; `device_profiles.photo_updated_at` marks
-- that the device has one and busts caches. Only the owner writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('device-photos', 'device-photos', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

create policy device_photos_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'device-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy device_photos_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'device-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy device_photos_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'device-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

alter table public.device_profiles
  add column photo_updated_at timestamptz;
