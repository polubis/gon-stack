-- Videos as task attachments: up to 20 MB each (other files keep 5 MB, enforced
-- by the API). A video is stored after the upload response, so a row carries a
-- `status`; row changes are published to Realtime for the live progress feed.

update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array[
      'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'
    ]
where id = 'task-attachments';

alter table public.time_task_attachments
  drop constraint time_task_attachments_size_check,
  add constraint time_task_attachments_size_check check (size between 1 and 20971520),
  add column status text not null default 'ready'
    check (status in ('uploading', 'ready', 'failed'));

alter publication supabase_realtime add table public.time_task_attachments;

create or replace function public.mcp_list_task_attachments(p_token text, p_task_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  if not exists (
    select 1 from public.time_tasks where user_id = v_user and id = p_task_id
  ) then
    return null;
  end if;
  return jsonb_build_object(
    'userId', v_user,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'name', a.name, 'size', a.size, 'mime', a.mime, 'status', a.status
      ) order by a.created_at, a.id)
      from public.time_task_attachments a
      where a.user_id = v_user and a.task_id = p_task_id
    ), '[]'::jsonb)
  );
end;
$$;
