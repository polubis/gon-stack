-- Task history: an append-only trail of what happened to a task - creation,
-- every changed field, attachments added or removed, comments written, edited
-- or deleted. Triggers write it, so the app and every MCP client are covered
-- without trusting any caller.
--
-- Nobody edits it: `authenticated` only reads (RLS: own rows), there is no
-- insert/update/delete grant and no policy for them. Rows go away only with
-- their task (foreign key cascade), never one by one.
--
-- Who did it: the MCP functions start with `mcp_user`, which now remembers the
-- calling token's id for the transaction (`parka.mcp_token_id`). A row made in
-- that transaction is signed as a bot with the token's name and the first 8
-- characters of its row id (same convention as comments); otherwise the owner
-- did it. The secret is never stored.

create table public.time_task_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  task_id text not null,
  kind text not null check (kind in (
    'created', 'updated',
    'attachment_added', 'attachment_removed',
    'comment_added', 'comment_edited', 'comment_removed'
  )),
  -- `updated` only: title, description, category, priority, day, at, done, in_progress
  field text check (field in (
    'title', 'description', 'category', 'priority', 'day', 'at', 'done', 'in_progress'
  )),
  old_value text check (char_length(old_value) <= 500),
  new_value text check (char_length(new_value) <= 500),
  mcp_token_id uuid references public.mcp_tokens (id) on delete set null,
  bot_name text check (char_length(bot_name) between 1 and 60),
  bot_ref text check (bot_ref ~ '^[0-9a-f]{8}$'),
  created_at timestamptz not null default clock_timestamp(),
  primary key (user_id, id),
  constraint time_task_history_updated_field_check
    check ((kind = 'updated') = (field is not null)),
  constraint time_task_history_bot_check
    check ((bot_name is null) = (bot_ref is null)),
  constraint time_task_history_task_fk
    foreign key (user_id, task_id)
    references public.time_tasks (user_id, id) on delete cascade
);
create index time_task_history_task_idx
  on public.time_task_history (user_id, task_id, created_at desc);
create index time_task_history_token_idx
  on public.time_task_history (mcp_token_id)
  where mcp_token_id is not null;

alter table public.time_task_history enable row level security;

create policy time_task_history_owner_read on public.time_task_history
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.time_task_history from public, anon, authenticated;
grant select on public.time_task_history to authenticated;

-- Remember which token drives this transaction (see header).
create or replace function public.mcp_user(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_token_user(p_token);
begin
  if v_user is null then
    raise exception 'invalid token' using errcode = 'PT401';
  end if;
  perform set_config(
    'parka.mcp_token_id',
    coalesce((
      select t.id::text from public.mcp_tokens t
      where t.token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex')
    ), ''),
    true
  );
  return v_user;
end;
$$;

-- Appends one entry; signs it with the token of the running MCP call, if any.
create function public.record_task_history(
  p_user uuid,
  p_task text,
  p_kind text,
  p_field text default null,
  p_old text default null,
  p_new text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token uuid := nullif(current_setting('parka.mcp_token_id', true), '')::uuid;
  v_name text;
begin
  -- Cascades from a deleted task must not write history for it.
  if not exists (
    select 1 from public.time_tasks where user_id = p_user and id = p_task
  ) then
    return;
  end if;
  if v_token is not null then
    select t.name into v_name from public.mcp_tokens t where t.id = v_token;
  end if;
  insert into public.time_task_history
    (user_id, task_id, kind, field, old_value, new_value,
     mcp_token_id, bot_name, bot_ref)
  values
    (p_user, p_task, p_kind, p_field, left(p_old, 500), left(p_new, 500),
     case when v_name is null then null else v_token end,
     v_name,
     case when v_name is null then null
          else substr(replace(v_token::text, '-', ''), 1, 8) end);
end;
$$;
revoke all on function
  public.record_task_history(uuid, text, text, text, text, text)
from public, anon, authenticated;

create function public.time_tasks_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old_category text;
  v_new_category text;
  v_old_priority text;
  v_new_priority text;
begin
  if tg_op = 'INSERT' then
    perform public.record_task_history(new.user_id, new.id, 'created', null, null, new.title);
    return null;
  end if;

  if new.title is distinct from old.title then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'title', old.title, new.title);
  end if;
  if new.description is distinct from old.description then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'description', old.description, new.description);
  end if;
  if new.category_id is distinct from old.category_id then
    select coalesce(c.name, old.category_id) into v_old_category
      from (select 1) s left join public.time_categories c
        on c.user_id = old.user_id and c.id = old.category_id;
    select coalesce(c.name, new.category_id) into v_new_category
      from (select 1) s left join public.time_categories c
        on c.user_id = new.user_id and c.id = new.category_id;
    perform public.record_task_history(new.user_id, new.id, 'updated', 'category', v_old_category, v_new_category);
  end if;
  if new.priority_id is distinct from old.priority_id then
    select coalesce(p.name, old.priority_id) into v_old_priority
      from (select 1) s left join public.time_priorities p
        on p.user_id = old.user_id and p.id = old.priority_id;
    select coalesce(p.name, new.priority_id) into v_new_priority
      from (select 1) s left join public.time_priorities p
        on p.user_id = new.user_id and p.id = new.priority_id;
    perform public.record_task_history(new.user_id, new.id, 'updated', 'priority', v_old_priority, v_new_priority);
  end if;
  if new.day is distinct from old.day then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'day', old.day::text, new.day::text);
  end if;
  if new.at is distinct from old.at then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'at', to_char(old.at, 'HH24:MI'), to_char(new.at, 'HH24:MI'));
  end if;
  if new.done is distinct from old.done then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'done', old.done::text, new.done::text);
  end if;
  if new.in_progress is distinct from old.in_progress then
    perform public.record_task_history(new.user_id, new.id, 'updated', 'in_progress', old.in_progress::text, new.in_progress::text);
  end if;
  return null;
end;
$$;

create trigger time_tasks_history_insert
  after insert on public.time_tasks
  for each row execute function public.time_tasks_history();
create trigger time_tasks_history_update
  after update on public.time_tasks
  for each row execute function public.time_tasks_history();

create function public.time_task_attachments_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_task_history(new.user_id, new.task_id, 'attachment_added', null, null, new.name);
  else
    perform public.record_task_history(old.user_id, old.task_id, 'attachment_removed', null, old.name, null);
  end if;
  return null;
end;
$$;

create trigger time_task_attachments_history_insert
  after insert on public.time_task_attachments
  for each row execute function public.time_task_attachments_history();
create trigger time_task_attachments_history_delete
  after delete on public.time_task_attachments
  for each row execute function public.time_task_attachments_history();

create function public.time_task_comments_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_task_history(new.user_id, new.task_id, 'comment_added', null, null, new.body);
  elsif tg_op = 'UPDATE' then
    if new.body is distinct from old.body then
      perform public.record_task_history(new.user_id, new.task_id, 'comment_edited', null, old.body, new.body);
    end if;
  else
    perform public.record_task_history(old.user_id, old.task_id, 'comment_removed', null, old.body, null);
  end if;
  return null;
end;
$$;

create trigger time_task_comments_history_insert
  after insert on public.time_task_comments
  for each row execute function public.time_task_comments_history();
create trigger time_task_comments_history_update
  after update on public.time_task_comments
  for each row execute function public.time_task_comments_history();
create trigger time_task_comments_history_delete
  after delete on public.time_task_comments
  for each row execute function public.time_task_comments_history();

-- History of a task for the MCP surface, newest first; null when the task is
-- not the owner's. Read-only: there is no MCP function that writes it.
create function public.mcp_list_task_history(p_token text, p_task_id text)
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
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', h.id,
        'kind', h.kind,
        'field', h.field,
        'from', h.old_value,
        'to', h.new_value,
        'at', h.created_at,
        'author', case when h.bot_ref is null then 'owner' else 'bot' end,
        'botName', coalesce(t.name, h.bot_name),
        'botRef', h.bot_ref
      ) order by h.created_at desc, h.id)
      from public.time_task_history h
      left join public.mcp_tokens t on t.id = h.mcp_token_id
      where h.user_id = v_user and h.task_id = p_task_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.mcp_list_task_history(text, text)
from public, anon, authenticated;
grant execute on function public.mcp_list_task_history(text, text)
to anon, authenticated;
