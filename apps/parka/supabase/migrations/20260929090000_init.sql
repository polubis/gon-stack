-- Parka finance backend: schema, row-level security and privileges. No seed data.
--
-- Every domain table is owned by a single `auth.users` row. Client-generated
-- string ids stay the primary identifier (the React store mints them), scoped
-- per user through a composite primary key so two accounts can reuse the same
-- readable id (`groceries`, `exp-biedronka-apr`, ...).

set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  push boolean not null default true,
  email boolean not null default false,
  limit_warnings boolean not null default true,
  receipt_confirmations boolean not null default true,
  limit_alerts boolean not null default true
);

create table public.categories (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  icon text not null default 'sparkles',
  color text not null default '#4b5a52',
  primary key (user_id, id)
);

create table public.expenses (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  merchant text not null,
  date timestamptz not null,
  amount numeric(12, 2) not null default 0,
  category_id text not null,
  payment_method text not null default '',
  is_bill boolean not null default false,
  source text not null default 'manual' check (source in ('receipt', 'manual')),
  primary key (user_id, id)
);
create index expenses_user_date_idx on public.expenses (user_id, date desc);

create table public.receipt_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  expense_id text not null,
  name text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity integer not null default 1,
  discount numeric(12, 2) not null default 0,
  category_id text not null,
  primary key (user_id, id),
  foreign key (user_id, expense_id)
    references public.expenses (user_id, id) on delete cascade
);
create index receipt_items_expense_idx on public.receipt_items (user_id, expense_id);

create table public.limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  scope text not null check (scope in ('total', 'category')),
  category_id text,
  amount numeric(12, 2) not null default 0,
  alert_at80 boolean not null default false,
  delivery text not null default 'push' check (delivery in ('push', 'email')),
  primary key (user_id, id)
);

create table public.savings_goals (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  target numeric(12, 2) not null default 0,
  saved numeric(12, 2) not null default 0,
  months integer not null default 1,
  primary key (user_id, id)
);

create table public.recurring_expenses (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  name text not null,
  cost numeric(12, 2) not null default 0,
  next_payment_date date not null,
  active boolean not null default true,
  payment_method text not null default '',
  category_id text not null,
  primary key (user_id, id)
);

create table public.recurring_payments (
  user_id uuid not null references auth.users (id) on delete cascade,
  id bigint generated always as identity,
  recurring_id text not null,
  date date not null,
  amount numeric(12, 2) not null default 0,
  primary key (user_id, id),
  foreign key (user_id, recurring_id)
    references public.recurring_expenses (user_id, id) on delete cascade
);
create index recurring_payments_parent_idx on public.recurring_payments (user_id, recurring_id);

create table public.notifications (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  kind text not null,
  title text not null,
  body text not null default '',
  age_days integer not null default 0,
  primary key (user_id, id)
);

-- ---------------------------------------------------------------------------
-- Row level security — every row is visible only to its owner
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'notification_preferences', 'categories', 'expenses',
    'receipt_items', 'limits', 'savings_goals', 'recurring_expenses',
    'recurring_payments', 'notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()));',
      t || '_owner', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Data API privileges — hosted projects do not grant them by default
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
