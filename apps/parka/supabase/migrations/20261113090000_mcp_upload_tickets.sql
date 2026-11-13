-- One upload path for MCP attachments: a one-time ticket instead of base64 in
-- a tool call or a bearer token in a curl header. The agent asks for a ticket
-- with its MCP token (`mcp_request_upload`), then POSTs the raw file to an URL
-- that carries the ticket and nothing else. Only the SHA-256 of the ticket is
-- stored; it is bound to one task, name and type, lives 5 minutes and works once.
-- The old base64 function (`mcp_add_task_attachment`) is gone.

drop function public.mcp_add_task_attachment(text, text, uuid, text, integer, text);

create table public.mcp_upload_tickets (
  ticket_hash text primary key check (ticket_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Who asked, so the task history is signed as that token (no secret kept).
  mcp_token_id uuid references public.mcp_tokens (id) on delete set null,
  task_id text not null,
  name text not null check (char_length(name) between 1 and 200),
  mime text not null,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index mcp_upload_tickets_expires_idx on public.mcp_upload_tickets (expires_at);
alter table public.mcp_upload_tickets enable row level security;
revoke all on table public.mcp_upload_tickets from public, anon, authenticated;

create function public.mcp_ticket_hash(p_ticket text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(coalesce(p_ticket, ''), 'utf8')), 'hex');
$$;
revoke all on function public.mcp_ticket_hash(text) from public, anon, authenticated;

-- Step 1, with the MCP token: the ticket (shown once) or null for an unknown task.
create function public.mcp_request_upload(
  p_token text,
  p_task_id text,
  p_name text,
  p_mime text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_ticket text;
  v_expires timestamptz := now() + interval '5 minutes';
begin
  if not exists (
    select 1 from public.time_tasks where user_id = v_user and id = p_task_id
  ) then
    return null;
  end if;
  if (
    select count(*) from public.time_task_attachments
    where user_id = v_user and task_id = p_task_id
  ) >= 5 then
    raise exception 'a task takes at most 5 attachments' using errcode = 'PT400';
  end if;
  delete from public.mcp_upload_tickets where expires_at < now() - interval '1 hour';
  v_ticket := 'parka_up_' || replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.mcp_upload_tickets
    (ticket_hash, user_id, mcp_token_id, task_id, name, mime, expires_at)
  values (
    public.mcp_ticket_hash(v_ticket),
    v_user,
    nullif(current_setting('parka.mcp_token_id', true), '')::uuid,
    p_task_id, p_name, p_mime, v_expires
  );
  return jsonb_build_object('ticket', v_ticket, 'expiresAt', v_expires);
end;
$$;

-- Step 2, with the ticket: burns it. Unknown, expired and used all look the same.
create function public.mcp_claim_upload(p_ticket text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.mcp_upload_tickets;
begin
  update public.mcp_upload_tickets
  set claimed_at = now()
  where ticket_hash = public.mcp_ticket_hash(p_ticket)
    and claimed_at is null
    and expires_at > now()
  returning * into v;
  if v.ticket_hash is null then
    return null;
  end if;
  return jsonb_build_object(
    'userId', v.user_id, 'taskId', v.task_id, 'name', v.name, 'mime', v.mime
  );
end;
$$;

-- Storage: the claimed ticket (header `x-upload-ticket`) may write and clean up
-- its owner's folder for 10 minutes, until the row is recorded. Read-only lookup.
create function public.mcp_ticket_user()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select t.user_id
  from public.mcp_upload_tickets t
  where t.ticket_hash = public.mcp_ticket_hash(
      current_setting('request.headers', true)::json ->> 'x-upload-ticket')
    and t.claimed_at is not null
    and t.finished_at is null
    and t.claimed_at > now() - interval '10 minutes';
$$;
revoke all on function public.mcp_ticket_user() from public, anon, authenticated;
grant execute on function public.mcp_ticket_user() to anon;

create policy task_attachments_ticket_insert on storage.objects
  for insert to anon
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select public.mcp_ticket_user())::text
  );

create policy task_attachments_ticket_delete on storage.objects
  for delete to anon
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = (select public.mcp_ticket_user())::text
  );

-- Step 3, with the ticket: records the stored file, signs the history as the
-- requesting token and tells the owner's open app.
create function public.mcp_finish_upload(
  p_ticket text,
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
  v public.mcp_upload_tickets;
begin
  select * into v
  from public.mcp_upload_tickets
  where ticket_hash = public.mcp_ticket_hash(p_ticket)
    and claimed_at is not null
    and finished_at is null
    and claimed_at > now() - interval '10 minutes'
  for update;
  if v.ticket_hash is null then
    raise exception 'invalid ticket' using errcode = 'PT401';
  end if;
  if not exists (
    select 1 from public.time_tasks where user_id = v.user_id and id = v.task_id
  ) then
    raise exception 'task not found' using errcode = 'PT400';
  end if;
  if (
    select count(*) from public.time_task_attachments
    where user_id = v.user_id and task_id = v.task_id
  ) >= 5 then
    raise exception 'a task takes at most 5 attachments' using errcode = 'PT400';
  end if;
  perform set_config('parka.mcp_token_id', coalesce(v.mcp_token_id::text, ''), true);
  insert into public.time_task_attachments (user_id, id, task_id, name, size, mime)
  values (v.user_id, p_id, v.task_id, p_name, p_size, p_mime);
  update public.mcp_upload_tickets set finished_at = now()
  where ticket_hash = v.ticket_hash;
  perform realtime.send(
    jsonb_build_object('domain', 'time'),
    'changed',
    'data-changes:' || v.user_id::text,
    true
  );
  return jsonb_build_object(
    'userId', v.user_id, 'id', p_id, 'name', p_name, 'size', p_size, 'mime', p_mime
  );
end;
$$;

revoke all on function
  public.mcp_request_upload(text, text, text, text),
  public.mcp_claim_upload(text),
  public.mcp_finish_upload(text, uuid, text, integer, text)
from public, anon, authenticated;
grant execute on function
  public.mcp_request_upload(text, text, text, text),
  public.mcp_claim_upload(text),
  public.mcp_finish_upload(text, uuid, text, integer, text)
to anon;
