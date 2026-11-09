-- Custom task statuses. A task keeps `done` and `in_progress` as they are, so
-- no row is migrated: "open" (first) and "done" (last) are fixed, and between
-- them sits the user's ordered list of steps. The built-in step `in_progress`
-- is the default list; a user who never configures anything keeps today's
-- three states. A task on a custom step is `in_progress` too, with `status_id`
-- naming the step; `status_id is null` means the built-in `in_progress` step.
--
-- Deleting a step sends its tasks back to the built-in `in_progress` step
-- (`on delete set null`), nothing else changes.

create table public.time_statuses (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 40),
  position integer not null check (position >= 0),
  primary key (user_id, id),
  -- `open` and `done` are fixed ends, never stored.
  constraint time_statuses_reserved check (id not in ('open', 'done'))
);

alter table public.time_statuses enable row level security;
create policy time_statuses_owner on public.time_statuses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter table public.time_tasks
  add column status_id text,
  add constraint time_tasks_status_fk
    foreign key (user_id, status_id)
    references public.time_statuses (user_id, id) on delete set null (status_id),
  add constraint time_tasks_status_started
    check (status_id is null or (in_progress and not done));

-- History knows the new field.
alter table public.time_task_history
  drop constraint time_task_history_field_check,
  add constraint time_task_history_field_check check (field in (
    'title', 'description', 'category', 'priority', 'day', 'at', 'done',
    'in_progress', 'status'
  ));

-- Name of the step a task stands on while it is started; null otherwise.
create function public.task_step_name(p_user uuid, p_status text, p_progress boolean)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_status is not null then
      (select s.name from public.time_statuses s
       where s.user_id = p_user and s.id = p_status)
    when p_progress then
      coalesce((select s.name from public.time_statuses s
                where s.user_id = p_user and s.id = 'in_progress'), 'W trakcie')
  end;
$$;
revoke all on function public.task_step_name(uuid, text, boolean)
from public, anon, authenticated;

create or replace function public.time_tasks_history()
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
  -- A move between started steps; `done` and `in_progress` entries cover the rest.
  if new.status_id is distinct from old.status_id and new.in_progress and old.in_progress then
    perform public.record_task_history(
      new.user_id, new.id, 'updated', 'status',
      public.task_step_name(old.user_id, old.status_id, old.in_progress),
      public.task_step_name(new.user_id, new.status_id, new.in_progress)
    );
  end if;
  return null;
end;
$$;

-- MCP: one step key per task state: open, done, in_progress or a custom id.
create function public.mcp_resolve_status(p_user uuid, p_ref text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when lower(p_ref) in ('open', 'done', 'in_progress') then lower(p_ref)
    else (select s.id from public.time_statuses s
          where s.user_id = p_user
            and (s.id = p_ref or lower(s.name) = lower(p_ref))
          order by (s.id = p_ref) desc
          limit 1)
  end;
$$;

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
                   when t.status_id is not null then t.status_id
                   when t.in_progress then 'in_progress'
                   else 'open' end,
    'statusName', case when t.done then 'Zrobione'
                       when t.in_progress
                         then public.task_step_name(t.user_id, t.status_id, true)
                       else 'Do zrobienia' end,
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

-- The whole workflow in order: open, the user's steps, done.
create function public.mcp_list_statuses(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_user(p_token);
begin
  return jsonb_build_object('items',
    jsonb_build_array(jsonb_build_object('id', 'open', 'name', 'Do zrobienia', 'kind', 'open'))
    || coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'kind', 'step')
                       order by s.position, s.id)
      from public.time_statuses s where s.user_id = v_user
    ), jsonb_build_array(jsonb_build_object('id', 'in_progress', 'name', 'W trakcie', 'kind', 'step')))
    || jsonb_build_array(jsonb_build_object('id', 'done', 'name', 'Zrobione', 'kind', 'done'))
  );
end;
$$;
revoke all on function public.mcp_list_statuses(text) from public, anon, authenticated;
grant execute on function public.mcp_list_statuses(text) to anon, authenticated;

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
  v_status text;
  v_rows jsonb;
begin
  if p_category is not null then
    v_category := public.mcp_resolve_category(v_user, p_category);
    if v_category is null then
      return jsonb_build_object('items', '[]'::jsonb, 'nextOffset', null);
    end if;
  end if;
  if p_status is not null and lower(p_status) <> 'all' then
    v_status := public.mcp_resolve_status(v_user, p_status);
    if v_status is null then
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
           when t.status_id is not null then t.status_id
           when t.in_progress then 'in_progress'
           else 'open' end as status,
      case when t.done then 'Zrobione'
           when t.in_progress
             then public.task_step_name(t.user_id, t.status_id, true)
           else 'Do zrobienia' end as "statusName",
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
      and (v_status is null
           or (v_status = 'done' and t.done)
           or (v_status = 'in_progress' and t.in_progress and t.status_id is null)
           or (v_status = 'open' and not t.done and not t.in_progress)
           or (v_status not in ('done', 'in_progress', 'open') and t.status_id = v_status))
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

create or replace function public.mcp_update_task(p_token text, p_id text, p_patch jsonb)
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
  v_step text;
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
  v_step := v_task.status_id;
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
    v_status := public.mcp_resolve_status(v_user, p_patch ->> 'status');
    if v_status is null then
      raise exception 'invalid status' using errcode = 'PT400';
    end if;
    v_done := v_status = 'done';
    v_progress := v_status not in ('open', 'done');
    v_step := case when v_status in ('open', 'done', 'in_progress')
                   then null else v_status end;
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
    v_step := null;
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
      in_progress = v_progress,
      status_id = v_step
  where user_id = v_user and id = p_id;

  return public.mcp_task_json(v_user, p_id);
end;
$$;
revoke all on function public.mcp_update_task(text, text, jsonb)
from public, anon, authenticated;
grant execute on function public.mcp_update_task(text, text, jsonb)
to anon, authenticated;
