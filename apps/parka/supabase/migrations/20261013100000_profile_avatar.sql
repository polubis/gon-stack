-- Profile picture: WebP variants live in the public `avatars` bucket under
-- `<user_id>/<size>.webp`; `profile_avatars` marks that the user has one and
-- when it last changed (used to bust caches). Only the owner writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create table public.profile_avatars (
  user_id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.profile_avatars enable row level security;

create policy profile_avatars_owner on public.profile_avatars
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.profile_avatars to authenticated;

create policy avatars_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
