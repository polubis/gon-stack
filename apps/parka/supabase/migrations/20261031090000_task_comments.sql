-- Task comments: optional notes under a task. The owner writes, edits and
-- deletes them in the app; an MCP client may add them (and read them) through
-- the `mcp_*` functions below, never touching the table directly.
--
-- A comment from an MCP client records who wrote it without ever storing the
-- secret: `mcp_token_id` points at the token row (cleared if the token is
-- deleted), `bot_name` keeps the token's name at write time and `bot_ref` the
-- first 8 characters of the token's row id. The row id is not a credential
-- and cannot authenticate; it only tells which token was responsible.
--
-- `edited_at` is set by a trigger whenever the text changes, so a client can
-- not forge it. The app shows an owner-edited bot comment with a split avatar.

-- Naming a token after creation: the one new column the owner may update.
grant update (name) on public.mcp_tokens to authenticated;

create table public.time_task_comments (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  task_id text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  mcp_token_id uuid references public.mcp_tokens (id) on delete set null,
  bot_name text check (char_length(bot_name) between 1 and 60),
  bot_ref text check (bot_ref ~ '^[0-9a-f]{8}$'),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint time_task_comments_bot_check
    check ((bot_name is null) = (bot_ref is null)),
  constraint time_task_comments_task_fk
    foreign key (user_id, task_id)
    references public.time_tasks (user_id, id) on delete cascade
);
create index time_task_comments_task_idx
  on public.time_task_comments (user_id, task_id, created_at);
create index time_task_comments_token_idx
  on public.time_task_comments (mcp_token_id)
  where mcp_token_id is not null;

alter table public.time_task_comments enable row level security;

create policy time_task_comments_owner on public.time_task_comments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- The owner sets only the text of an own (human) comment; bot columns and the
-- edit time are out of reach.
revoke all on table public.time_task_comments from public, anon, authenticated;
grant select on public.time_task_comments to authenticated;
grant insert (user_id, id, task_id, body) on public.time_task_comments to authenticated;
grant update (body) on public.time_task_comments to authenticated;
grant delete on public.time_task_comments to authenticated;

create function public.time_task_comments_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

create trigger time_task_comments_touch
  before update on public.time_task_comments
  for each row execute function public.time_task_comments_touch();

-- At most 200 comments per task (also guards a chatty client).
create function public.time_task_comments_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || new.task_id, 0));
  if (
    select count(*) from public.time_task_comments
    where user_id = new.user_id and task_id = new.task_id
  ) >= 200 then
    raise exception 'Task comment limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger time_task_comments_limit
  before insert on public.time_task_comments
  for each row execute function public.time_task_comments_limit();

-- Comments of a task for the MCP surface; null when the task is not the
-- owner's. Never returns a token or its hash, only the bot's name and ref.
create function public.mcp_list_task_comments(p_token text, p_task_id text)
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
        'id', c.id,
        'body', c.body,
        'createdAt', c.created_at,
        'editedAt', c.edited_at,
        'author', case when c.bot_ref is null then 'owner' else 'bot' end,
        'botName', coalesce(t.name, c.bot_name),
        'botRef', c.bot_ref
      ) order by c.created_at, c.id)
      from public.time_task_comments c
      left join public.mcp_tokens t on t.id = c.mcp_token_id
      where c.user_id = v_user and c.task_id = p_task_id
    ), '[]'::jsonb)
  );
end;
$$;

-- Adds a comment signed with the calling token's name and ref.
create function public.mcp_add_task_comment(
  p_token text,
  p_task_id text,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_token_id uuid;
  v_name text;
  v_row public.time_task_comments;
begin
  if p_body is null or char_length(btrim(p_body)) not between 1 and 2000 then
    raise exception 'comment must be 1 to 2000 characters' using errcode = 'PT400';
  end if;
  if not exists (
    select 1 from public.time_tasks where user_id = v_user and id = p_task_id
  ) then
    return null;
  end if;

  select t.id, t.name into v_token_id, v_name
  from public.mcp_tokens t
  where t.token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex');

  begin
    insert into public.time_task_comments
      (user_id, task_id, body, mcp_token_id, bot_name, bot_ref)
    values
      (v_user, p_task_id, btrim(p_body), v_token_id, v_name,
       substr(replace(v_token_id::text, '-', ''), 1, 8))
    returning * into v_row;
  exception when check_violation then
    raise exception 'a task takes at most 200 comments' using errcode = 'PT400';
  end;

  return jsonb_build_object(
    'id', v_row.id,
    'body', v_row.body,
    'createdAt', v_row.created_at,
    'editedAt', v_row.edited_at,
    'author', 'bot',
    'botName', v_row.bot_name,
    'botRef', v_row.bot_ref
  );
end;
$$;

revoke all on function
  public.mcp_list_task_comments(text, text),
  public.mcp_add_task_comment(text, text, text)
from public, anon, authenticated;
grant execute on function
  public.mcp_list_task_comments(text, text),
  public.mcp_add_task_comment(text, text, text)
to anon, authenticated;
