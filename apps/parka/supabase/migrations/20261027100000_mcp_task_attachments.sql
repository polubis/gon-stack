-- MCP access to task attachments. The database only handles rows and the
-- ownership checks; the bytes go through Storage on the server with the
-- owner id these functions return, so no token ever reaches another
-- account's files.

-- Owner and attachments of a task; null when the task does not exist.
create function public.mcp_list_task_attachments(p_token text, p_task_id text)
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
        'id', a.id, 'name', a.name, 'size', a.size, 'mime', a.mime
      ) order by a.created_at, a.id)
      from public.time_task_attachments a
      where a.user_id = v_user and a.task_id = p_task_id
    ), '[]'::jsonb)
  );
end;
$$;

-- Records an attachment whose file is already stored at `<user>/<id>`.
create function public.mcp_add_task_attachment(
  p_token text,
  p_task_id text,
  p_id uuid,
  p_name text,
  p_size integer,
  p_mime text
)
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
    raise exception 'task not found' using errcode = 'PT400';
  end if;
  if (
    select count(*) from public.time_task_attachments
    where user_id = v_user and task_id = p_task_id
  ) >= 5 then
    raise exception 'a task takes at most 5 attachments' using errcode = 'PT400';
  end if;
  insert into public.time_task_attachments (user_id, id, task_id, name, size, mime)
  values (v_user, p_id, p_task_id, p_name, p_size, p_mime);
  return jsonb_build_object(
    'userId', v_user, 'id', p_id, 'name', p_name, 'size', p_size, 'mime', p_mime
  );
end;
$$;

-- Deletes the row; returns the owner so the server can remove the file.
create function public.mcp_delete_task_attachment(p_token text, p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_count integer;
begin
  delete from public.time_task_attachments where user_id = v_user and id = p_id;
  get diagnostics v_count = row_count;
  return case when v_count > 0 then v_user else null end;
end;
$$;

revoke all on function
  public.mcp_list_task_attachments(text, text),
  public.mcp_add_task_attachment(text, text, uuid, text, integer, text),
  public.mcp_delete_task_attachment(text, uuid)
from public, anon, authenticated;

grant execute on function
  public.mcp_list_task_attachments(text, text),
  public.mcp_add_task_attachment(text, text, uuid, text, integer, text),
  public.mcp_delete_task_attachment(text, uuid)
to anon, authenticated;

-- Storage has no token login, so the files are reached as `anon` and the token
-- travels in the `x-mcp-token` header. These policies resolve its owner and
-- allow only that owner's folder. Read-only lookup: policies must not write.
create function public.mcp_header_user()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.user_id
  from public.mcp_tokens t
  where t.token_hash = encode(
      sha256(convert_to(
        coalesce(current_setting('request.headers', true)::json ->> 'x-mcp-token', ''),
        'utf8'
      )), 'hex')
    and t.revoked_at is null
    and (t.expires_at is null or t.expires_at > now());
$$;
revoke all on function public.mcp_header_user() from public, anon, authenticated;
grant execute on function public.mcp_header_user() to anon;

create policy task_attachments_mcp_select on storage.objects
  for select to anon
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select public.mcp_header_user())::text
  );

create policy task_attachments_mcp_insert on storage.objects
  for insert to anon
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select public.mcp_header_user())::text
  );

create policy task_attachments_mcp_delete on storage.objects
  for delete to anon
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select public.mcp_header_user())::text
  );
