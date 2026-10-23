-- MCP access tokens: bearer secrets an LLM client uses to read tasks and
-- expenses and to change the status of tasks (nothing else).
--
-- The secret is shown once at creation; only its SHA-256 hex digest is stored,
-- and that column is not readable through the API at all. The MCP endpoint is
-- called without a Supabase session, so it talks to the database through the
-- `mcp_*` functions below: each takes the raw token, resolves its owner, and
-- touches only that owner's rows (security definer + explicit user filter).

create table public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  -- A few characters of the secret to tell tokens apart; never enough to use it.
  token_hint text not null check (char_length(token_hint) = 4),
  token_tail text not null check (char_length(token_tail) = 4),
  -- Lifetime picked at creation; null = never expires. Rotation renews it.
  ttl_days smallint check (ttl_days between 1 and 365),
  expires_at timestamptz,
  revoked_at timestamptz,
  rotated_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create index mcp_tokens_user_idx on public.mcp_tokens (user_id, created_at);

alter table public.mcp_tokens enable row level security;

create policy mcp_tokens_owner on public.mcp_tokens
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- The hash never leaves the database: no role can read `token_hash`.
revoke all on table public.mcp_tokens from public, anon, authenticated;
grant select (
  id, user_id, name, token_hint, token_tail, ttl_days,
  expires_at, revoked_at, rotated_at, last_used_at, created_at
) on public.mcp_tokens to authenticated;
grant insert (
  user_id, name, token_hash, token_hint, token_tail, ttl_days, expires_at
) on public.mcp_tokens to authenticated;
grant update (
  token_hash, token_hint, token_tail, expires_at, revoked_at, rotated_at,
  last_used_at
) on public.mcp_tokens to authenticated;
grant delete on public.mcp_tokens to authenticated;

-- At most 10 tokens per account (also guards concurrent creates).
create function public.mcp_tokens_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises one account's inserts, so concurrent creates cannot pass the count together.
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.mcp_tokens where user_id = new.user_id) >= 10 then
    raise exception 'token limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger mcp_tokens_limit
  before insert on public.mcp_tokens
  for each row execute function public.mcp_tokens_limit();

-- Owner of a usable (not revoked, not expired) token, else null. Records the
-- use at one-minute granularity to keep reads from turning into writes.
create function public.mcp_token_user(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_user uuid;
begin
  if p_token is null or char_length(p_token) not between 20 and 200 then
    return null;
  end if;

  select t.id, t.user_id into v_id, v_user
  from public.mcp_tokens t
  where t.token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex')
    and t.revoked_at is null
    and (t.expires_at is null or t.expires_at > now());
  if v_id is null then
    return null;
  end if;

  update public.mcp_tokens
  set last_used_at = now()
  where id = v_id
    and (last_used_at is null or last_used_at < now() - interval '1 minute');
  return v_user;
end;
$$;
revoke all on function public.mcp_token_user(text) from public, anon, authenticated;

-- PostgREST turns the `PT401` error code into an HTTP 401.
create function public.mcp_authenticate(p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.mcp_token_user(p_token) is null then
    raise exception 'invalid token' using errcode = 'PT401';
  end if;
  return true;
end;
$$;

create function public.mcp_list_tasks(
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
      case when t.done then 'done' else 'open' end as status,
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
           or (p_status = 'open' and not t.done))
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

create function public.mcp_get_task(p_token text, p_id text)
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
    'status', case when t.done then 'done' else 'open' end,
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

-- The only write the MCP surface has. Idempotent: setting the current status
-- again changes nothing. Returns the task, or null when it is not the owner's.
create function public.mcp_set_task_status(p_token text, p_id text, p_status text)
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
  if p_status is null or p_status not in ('open', 'done') then
    raise exception 'invalid status' using errcode = 'PT400';
  end if;

  update public.time_tasks
  set done = (p_status = 'done')
  where user_id = v_user and id = p_id;

  return public.mcp_get_task(p_token, p_id);
end;
$$;

create function public.mcp_list_expenses(
  p_token text,
  p_from date default null,
  p_to date default null,
  p_category_id text default null,
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
      row_number() over (order by e.date desc, e.id) as ord,
      e.id,
      e.merchant,
      e.date,
      e.amount::float8 as amount,
      e.category_id as "categoryId",
      c.name as "categoryName",
      e.payment_method as "paymentMethod",
      e.is_bill as "isBill",
      e.source,
      (select count(*) from public.receipt_items i
        where i.user_id = e.user_id and i.expense_id = e.id)::int as "itemCount"
    from public.expenses e
    left join public.categories c
      on c.user_id = e.user_id and c.id = e.category_id
    where e.user_id = v_user
      and (p_from is null or e.date >= p_from::timestamptz)
      and (p_to is null or e.date < (p_to + 1)::timestamptz)
      and (p_category_id is null or e.category_id = p_category_id)
    order by e.date desc, e.id
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

create function public.mcp_get_expense(p_token text, p_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.mcp_token_user(p_token);
  v_expense jsonb;
begin
  if v_user is null then
    raise exception 'invalid token' using errcode = 'PT401';
  end if;

  select jsonb_build_object(
    'id', e.id,
    'merchant', e.merchant,
    'date', e.date,
    'amount', e.amount::float8,
    'categoryId', e.category_id,
    'categoryName', c.name,
    'paymentMethod', e.payment_method,
    'isBill', e.is_bill,
    'source', e.source,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', i.name,
        'unitPrice', i.unit_price::float8,
        'quantity', i.quantity::float8,
        'discount', i.discount::float8,
        'categoryId', i.category_id
      ) order by i.id)
      from public.receipt_items i
      where i.user_id = e.user_id and i.expense_id = e.id
    ), '[]'::jsonb)
  )
  into v_expense
  from public.expenses e
  left join public.categories c
    on c.user_id = e.user_id and c.id = e.category_id
  where e.user_id = v_user and e.id = p_id;

  return v_expense;
end;
$$;

-- Only the anonymous API role (the MCP endpoint holds no session) may call them.
revoke all on function
  public.mcp_authenticate(text),
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer),
  public.mcp_get_task(text, text),
  public.mcp_set_task_status(text, text, text),
  public.mcp_list_expenses(text, date, date, text, integer, integer),
  public.mcp_get_expense(text, text)
from public, anon, authenticated;
grant execute on function
  public.mcp_authenticate(text),
  public.mcp_list_tasks(text, text, date, date, boolean, integer, integer),
  public.mcp_get_task(text, text),
  public.mcp_set_task_status(text, text, text),
  public.mcp_list_expenses(text, date, date, text, integer, integer),
  public.mcp_get_expense(text, text)
to anon, authenticated;
