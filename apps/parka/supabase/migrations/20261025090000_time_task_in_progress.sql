-- A task can be in progress: started, not finished. `done` stays as it was;
-- the two never hold together, so a task is open, in progress or done.

alter table public.time_tasks
  add column in_progress boolean not null default false,
  add constraint time_tasks_status_exclusive check (not (done and in_progress));

-- The MCP surface reads and writes the same three states.
create or replace function public.mcp_list_tasks(
  p_token text,
  p_status text default 'all',
  p_from date default null,
  p_to date default null,
  p_backlog boolean default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_token_user(p_token);
  v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_rows jsonb;
begin
  if v_user is null then
    raise exception 'invalid token' using errcode = 'PT401';
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

create or replace function public.mcp_get_task(p_token text, p_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_token_user(p_token);
  v_task jsonb;
begin
  if v_user is null then
    raise exception 'invalid token' using errcode = 'PT401';
  end if;

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
  into v_task
  from public.time_tasks t
  left join public.time_categories c
    on c.user_id = t.user_id and c.id = t.category_id
  left join public.time_priorities p
    on p.user_id = t.user_id and p.id = t.priority_id
  where t.user_id = v_user and t.id = p_id;

  return v_task;
end;
$$;

create or replace function public.mcp_set_task_status(p_token text, p_id text, p_status text)
returns jsonb
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
  if p_status is null or p_status not in ('open', 'in_progress', 'done') then
    raise exception 'invalid status' using errcode = 'PT400';
  end if;

  update public.time_tasks
  set done = (p_status = 'done'),
      in_progress = (p_status = 'in_progress')
  where user_id = v_user and id = p_id;

  return public.mcp_get_task(p_token, p_id);
end;
$$;
