-- MCP parity with the tasks UI: create, edit, move, delete tasks, and manage
-- the categories ("tags") and priorities they use.
--
-- Same rules as the first MCP functions: each takes the raw token, resolves
-- its owner and touches only that owner's rows (security definer + explicit
-- user filter). `PT400` marks a refusal the caller may read and act on.
-- Category and priority arguments accept an id or a name (case-insensitive).

create function public.mcp_user(p_token text)
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
  return v_user;
end;
$$;

create function public.mcp_resolve_category(p_user uuid, p_ref text)
returns text
language sql
security definer
set search_path = ''
as $$
  select c.id
  from public.time_categories c
  where c.user_id = p_user
    and (c.id = p_ref or lower(c.name) = lower(p_ref))
  order by (c.id = p_ref) desc, c.id
  limit 1;
$$;

create function public.mcp_resolve_priority(p_user uuid, p_ref text)
returns text
language sql
security definer
set search_path = ''
as $$
  select p.id
  from public.time_priorities p
  where p.user_id = p_user
    and (p.id = p_ref or lower(p.name) = lower(p_ref))
  order by (p.id = p_ref) desc, p.id
  limit 1;
$$;

create function public.mcp_task_json(p_user uuid, p_id text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', t.id,
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

create or replace function public.mcp_get_task(p_token text, p_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.mcp_task_json(public.mcp_user(p_token), p_id);
end;
$$;

-- list_tasks gains a category ("tag") filter.
drop function public.mcp_list_tasks(text, text, date, date, boolean, integer, integer);
create function public.mcp_list_tasks(
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

-- Creates a task. No day = backlog (then no hour and always open).
create function public.mcp_create_task(
  p_token text,
  p_title text,
  p_category text,
  p_priority text,
  p_description text default null,
  p_day date default null,
  p_at time default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_category text := public.mcp_resolve_category(v_user, p_category);
  v_priority text := public.mcp_resolve_priority(v_user, p_priority);
  v_id text := 'task-' || gen_random_uuid()::text;
begin
  if v_category is null then
    raise exception 'unknown category' using errcode = 'PT400';
  end if;
  if v_priority is null then
    raise exception 'unknown priority' using errcode = 'PT400';
  end if;
  if p_day is null and p_at is not null then
    raise exception 'a backlog task has no hour' using errcode = 'PT400';
  end if;

  insert into public.time_tasks (
    user_id, id, title, description, category_id, priority_id, day, at
  ) values (
    v_user, v_id, p_title, nullif(p_description, ''), v_category, v_priority,
    p_day, p_at
  );
  return public.mcp_task_json(v_user, v_id);
end;
$$;

-- Partial update: only the keys present in `p_patch` change. A `null` day
-- sends the task to the backlog; a day moves it onto the board.
create function public.mcp_update_task(p_token text, p_id text, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_task public.time_tasks;
  v_title text;
  v_description text;
  v_category text;
  v_priority text;
  v_day date;
  v_at time;
  v_done boolean;
  v_progress boolean;
  v_status text;
begin
  select * into v_task
  from public.time_tasks
  where user_id = v_user and id = p_id
  for update;
  if not found then
    return null;
  end if;

  v_title := case when p_patch ? 'title' then p_patch ->> 'title' else v_task.title end;
  v_description := case when p_patch ? 'description'
    then nullif(p_patch ->> 'description', '') else v_task.description end;
  v_day := case when p_patch ? 'day' then (p_patch ->> 'day')::date else v_task.day end;
  v_at := case when p_patch ? 'at' then (p_patch ->> 'at')::time else v_task.at end;
  v_done := v_task.done;
  v_progress := v_task.in_progress;
  v_category := v_task.category_id;
  v_priority := v_task.priority_id;

  if p_patch ? 'category' then
    v_category := public.mcp_resolve_category(v_user, p_patch ->> 'category');
    if v_category is null then
      raise exception 'unknown category' using errcode = 'PT400';
    end if;
  end if;
  if p_patch ? 'priority' then
    v_priority := public.mcp_resolve_priority(v_user, p_patch ->> 'priority');
    if v_priority is null then
      raise exception 'unknown priority' using errcode = 'PT400';
    end if;
  end if;
  if p_patch ? 'status' then
    v_status := p_patch ->> 'status';
    if v_status not in ('open', 'in_progress', 'done') then
      raise exception 'invalid status' using errcode = 'PT400';
    end if;
    v_done := v_status = 'done';
    v_progress := v_status = 'in_progress';
  end if;

  if v_day is null then
    -- Backlog: plain, open, no hour, not made by a rule.
    if v_task.recurring_id is not null then
      raise exception 'a task made by a recurring rule cannot go to the backlog'
        using errcode = 'PT400';
    end if;
    if v_status is not null and v_status <> 'open' then
      raise exception 'a backlog task is always open; give it a day first'
        using errcode = 'PT400';
    end if;
    if p_patch ? 'at' and v_at is not null then
      raise exception 'a backlog task has no hour' using errcode = 'PT400';
    end if;
    v_at := null;
    v_done := false;
    v_progress := false;
  elsif v_task.day is null and not (p_patch ? 'at') then
    v_at := null;
  end if;

  update public.time_tasks
  set title = v_title,
      description = v_description,
      category_id = v_category,
      priority_id = v_priority,
      day = v_day,
      at = v_at,
      done = v_done,
      in_progress = v_progress
  where user_id = v_user and id = p_id;

  return public.mcp_task_json(v_user, p_id);
end;
$$;

-- Status stays a shortcut of the same rules.
create or replace function public.mcp_set_task_status(p_token text, p_id text, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.mcp_update_task(
    p_token, p_id, jsonb_build_object('status', p_status)
  );
end;
$$;

-- Permanent. Returns whether a task was removed.
create function public.mcp_delete_task(p_token text, p_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_count integer;
begin
  delete from public.time_tasks where user_id = v_user and id = p_id;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

create function public.mcp_list_categories(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'icon', c.icon,
      'color', c.color,
      'taskCount', (select count(*) from public.time_tasks t
                    where t.user_id = c.user_id and t.category_id = c.id)::int
    ) order by lower(c.name), c.id)
    from public.time_categories c
    where c.user_id = v_user
  ), '[]'::jsonb));
end;
$$;

create function public.mcp_create_category(
  p_token text, p_name text, p_icon text, p_color text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_id text := 'tcat-' || gen_random_uuid()::text;
begin
  if exists (select 1 from public.time_categories c
             where c.user_id = v_user and lower(c.name) = lower(p_name)) then
    raise exception 'a category with this name already exists' using errcode = 'PT400';
  end if;
  insert into public.time_categories (user_id, id, name, icon, color)
  values (v_user, v_id, p_name, p_icon, p_color);
  return jsonb_build_object(
    'id', v_id, 'name', p_name, 'icon', p_icon, 'color', p_color, 'taskCount', 0
  );
end;
$$;

create function public.mcp_update_category(p_token text, p_id text, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_row public.time_categories;
begin
  update public.time_categories c
  set name = coalesce(p_patch ->> 'name', c.name),
      icon = coalesce(p_patch ->> 'icon', c.icon),
      color = coalesce(p_patch ->> 'color', c.color)
  where c.user_id = v_user and c.id = p_id
  returning c.* into v_row;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'id', v_row.id, 'name', v_row.name, 'icon', v_row.icon, 'color', v_row.color,
    'taskCount', (select count(*) from public.time_tasks t
                  where t.user_id = v_user and t.category_id = v_row.id)::int
  );
end;
$$;

-- Permanent. A category still used by a task or a series is refused.
create function public.mcp_delete_category(p_token text, p_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_count integer;
begin
  if exists (select 1 from public.time_tasks t
             where t.user_id = v_user and t.category_id = p_id)
     or exists (select 1 from public.time_recurring r
                where r.user_id = v_user and r.category_id = p_id) then
    raise exception 'category is in use; move its tasks to another one first'
      using errcode = 'PT400';
  end if;
  delete from public.time_categories where user_id = v_user and id = p_id;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

create function public.mcp_list_priorities(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.name, 'value', p.value
    ) order by p.value desc, p.id)
    from public.time_priorities p
    where p.user_id = v_user
  ), '[]'::jsonb));
end;
$$;

create function public.mcp_create_priority(p_token text, p_name text, p_value integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
  v_id text := 'tprio-' || gen_random_uuid()::text;
begin
  if exists (select 1 from public.time_priorities p
             where p.user_id = v_user and lower(p.name) = lower(p_name)) then
    raise exception 'a priority with this name already exists' using errcode = 'PT400';
  end if;
  insert into public.time_priorities (user_id, id, name, value)
  values (v_user, v_id, p_name, p_value);
  return jsonb_build_object('id', v_id, 'name', p_name, 'value', p_value);
end;
$$;

-- Internals stay unreachable; the tool functions are for the anonymous API role.
revoke all on function
  public.mcp_user(text),
  public.mcp_resolve_category(uuid, text),
  public.mcp_resolve_priority(uuid, text),
  public.mcp_task_json(uuid, text),
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer, text),
  public.mcp_create_task(text, text, text, text, text, date, time),
  public.mcp_update_task(text, text, jsonb),
  public.mcp_delete_task(text, text),
  public.mcp_list_categories(text),
  public.mcp_create_category(text, text, text, text),
  public.mcp_update_category(text, text, jsonb),
  public.mcp_delete_category(text, text),
  public.mcp_list_priorities(text),
  public.mcp_create_priority(text, text, integer)
from public, anon, authenticated;

grant execute on function
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer, text),
  public.mcp_create_task(text, text, text, text, text, date, time),
  public.mcp_update_task(text, text, jsonb),
  public.mcp_delete_task(text, text),
  public.mcp_list_categories(text),
  public.mcp_create_category(text, text, text, text),
  public.mcp_update_category(text, text, jsonb),
  public.mcp_delete_category(text, text),
  public.mcp_list_priorities(text),
  public.mcp_create_priority(text, text, integer)
to anon, authenticated;
