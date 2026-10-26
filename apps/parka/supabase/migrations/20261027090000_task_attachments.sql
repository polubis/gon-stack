-- Task attachments: files live in the private `task-attachments` bucket under
-- `<user_id>/<attachment_id>`; `time_task_attachments` links them to a task and
-- keeps the original name. At most 5 files of 5 MB per task; only the owner
-- reads and writes. Deleting a task cascades the rows (the API removes the files).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
)
on conflict (id) do nothing;

create policy task_attachments_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy task_attachments_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy task_attachments_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create table public.time_task_attachments (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  task_id text not null,
  name text not null check (char_length(name) between 1 and 200),
  size integer not null check (size between 1 and 5242880),
  mime text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint time_task_attachments_task_fk
    foreign key (user_id, task_id)
    references public.time_tasks (user_id, id) on delete cascade
);
create index time_task_attachments_task_idx
  on public.time_task_attachments (user_id, task_id, created_at);

alter table public.time_task_attachments enable row level security;

create policy time_task_attachments_owner on public.time_task_attachments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create function public.limit_task_attachments()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    select count(*) from public.time_task_attachments
    where user_id = new.user_id and task_id = new.task_id
  ) >= 5 then
    raise exception 'Task attachment limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger time_task_attachments_limit
  before insert on public.time_task_attachments
  for each row execute function public.limit_task_attachments();
