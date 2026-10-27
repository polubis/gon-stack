-- Every task gets a unique, human-readable key like in Jira: a random
-- per-account prefix plus a running number (`QXT-7`). The key is set once, on
-- insert (any path: app, MCP, recurring rules) and never changes.

create table public.time_task_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prefix text not null unique check (prefix ~ '^[A-Z]{3}$'),
  last_number integer not null default 0
);

-- Only the security-definer trigger below touches it.
alter table public.time_task_keys enable row level security;

alter table public.time_tasks add column key text;

-- Next free key of an account; creates its random prefix on first use.
create function public.next_task_key(p_user uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefix text;
  v_number integer;
begin
  loop
    begin
      insert into public.time_task_keys (user_id, prefix)
      values (
        p_user,
        (select string_agg(chr(65 + floor(random() * 26)::int), '')
         from generate_series(1, 3))
      )
      on conflict (user_id) do nothing;
      exit;
    exception when unique_violation then
      -- Prefix taken by another account: draw again.
      null;
    end;
  end loop;

  update public.time_task_keys
  set last_number = last_number + 1
  where user_id = p_user
  returning prefix, last_number into v_prefix, v_number;

  return v_prefix || '-' || v_number;
end;
$$;
revoke all on function public.next_task_key(uuid) from public, anon, authenticated;

-- Runs as the owner: callers (authenticated) may not execute next_task_key.
create function public.assign_task_key()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.key := public.next_task_key(new.user_id);
  return new;
end;
$$;
revoke all on function public.assign_task_key() from public, anon, authenticated;

create function public.keep_task_key()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.key := old.key;
  return new;
end;
$$;

-- Existing tasks, oldest first.
do $$
declare
  r record;
begin
  for r in
    select user_id, id from public.time_tasks order by created_at, id
  loop
    update public.time_tasks
    set key = public.next_task_key(r.user_id)
    where user_id = r.user_id and id = r.id;
  end loop;
end;
$$;

alter table public.time_tasks alter column key set not null;
alter table public.time_tasks
  add constraint time_tasks_key_uniq unique (user_id, key);

create trigger time_tasks_assign_key
  before insert on public.time_tasks
  for each row execute function public.assign_task_key();
create trigger time_tasks_keep_key
  before update on public.time_tasks
  for each row execute function public.keep_task_key();

-- MCP: tasks carry their key.
create or replace function public.mcp_task_json(p_user uuid, p_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', t.id,
    'key', t.key,
    'title', t.title,
    'description', t.description,
    'status', case when t.done then 'done'
                   when t.in_progress then 'in_progress'
                   else 'open' end,
    'day', t.day,
    'at', to_char(t.at, 'HH24:MI'),
    'categoryId', t.category_id,
    'categoryName', c.name,
    'priorityId', t.priority_id,
    'priorityName', p.name,
    'priorityValue', p.value,
    'recurring', t.recurring_id is not null
  )
  from public.time_tasks t
  left join public.time_categories c
    on c.user_id = t.user_id and c.id = t.category_id
  left join public.time_priorities p
    on p.user_id = t.user_id and p.id = t.priority_id
  where t.user_id = p_user and t.id = p_id;
$$;
revoke all on function public.mcp_task_json(uuid, text) from public, anon, authenticated;

create or replace function public.mcp_list_tasks(
  p_token text,
  p_status text default 'all',
  p_from date default null,
  p_to date default null,
  p_backlog boolean default null,
  p_limit integer default 25,
  p_offset integer default 0,
  p_category text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_category text;
  v_rows jsonb;
begin
  if p_category is not null then
    v_category := public.mcp_resolve_category(v_user, p_category);
    if v_category is null then
      return jsonb_build_object('items', '[]'::jsonb, 'nextOffset', null);
    end if;
  end if;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.ord), '[]'::jsonb)
  into v_rows
  from (
    select
      row_number() over (order by t.day nulls last, t.at nulls first, t.id) as ord,
      t.id,
      t.key,
      t.title,
      t.description,
      case when t.done then 'done'
           when t.in_progress then 'in_progress'
           else 'open' end as status,
      t.day,
      to_char(t.at, 'HH24:MI') as at,
      t.category_id as "categoryId",
      c.name as "categoryName",
      t.priority_id as "priorityId",
      p.name as "priorityName",
      p.value as "priorityValue",
      t.recurring_id is not null as recurring
    from public.time_tasks t
    left join public.time_categories c
      on c.user_id = t.user_id and c.id = t.category_id
    left join public.time_priorities p
      on p.user_id = t.user_id and p.id = t.priority_id
    where t.user_id = v_user
      and (p_status is null or p_status = 'all'
           or (p_status = 'done' and t.done)
           or (p_status = 'in_progress' and t.in_progress)
           or (p_status = 'open' and not t.done and not t.in_progress))
      and (p_from is null or t.day >= p_from)
      and (p_to is null or t.day <= p_to)
      and (p_backlog is null
           or (p_backlog and t.day is null)
           or (not p_backlog and t.day is not null))
      and (v_category is null or t.category_id = v_category)
    order by t.day nulls last, t.at nulls first, t.id
    offset v_offset limit v_limit + 1
  ) x;

  return jsonb_build_object(
    'items', (select coalesce(jsonb_agg(e - 'ord' order by n), '[]'::jsonb)
              from jsonb_array_elements(v_rows) with ordinality as a(e, n)
              where n <= v_limit),
    'nextOffset', case when jsonb_array_length(v_rows) > v_limit
                       then v_offset + v_limit else null end
  );
end;
$$;
revoke all on function
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer, text)
from public, anon, authenticated;
grant execute on function
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer, text)
to anon, authenticated;
