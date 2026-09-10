-- Parka finance backend: schema, row-level security and per-user demo seed.
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
  name text not null default 'Anna Kowalska',
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
-- Per-user demo seed — mirrors the reference design (Anna Kowalska, Apr 2025)
-- ---------------------------------------------------------------------------

create or replace function public.seed_demo_data(p_user uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, email)
    values (p_user, 'Anna Kowalska', coalesce(p_email, ''))
    on conflict (user_id) do update set email = excluded.email;

  insert into public.notification_preferences (user_id)
    values (p_user)
    on conflict (user_id) do nothing;

  insert into public.categories (user_id, id, name, icon, color) values
    (p_user, 'groceries', 'Spożywcze', 'cart', '#0f7a4f'),
    (p_user, 'transport', 'Transport', 'car', '#2563eb'),
    (p_user, 'bills', 'Rachunki', 'receipt', '#7c3aed'),
    (p_user, 'fun', 'Rozrywka', 'popcorn', '#c2410c'),
    (p_user, 'health', 'Zdrowie', 'heart', '#be123c'),
    (p_user, 'other', 'Inne', 'sparkles', '#4b5a52');

  insert into public.expenses
    (user_id, id, merchant, date, amount, category_id, payment_method, is_bill, source) values
    (p_user, 'exp-biedronka-apr', 'Biedronka', '2025-04-12T14:32:00Z', 42.67, 'groceries', 'Karta **** 4213', false, 'receipt'),
    (p_user, 'exp-lidl-apr', 'Lidl', '2025-04-07T11:05:00Z', 78.21, 'groceries', 'Karta **** 4213', false, 'receipt'),
    (p_user, 'exp-kaufland-apr', 'Kaufland', '2025-04-21T17:40:00Z', 1124.44, 'groceries', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-orlen-apr', 'Orlen', '2025-04-10T09:12:00Z', 120.00, 'transport', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-mpk-apr', 'MPK', '2025-04-02T08:00:00Z', 4.90, 'transport', 'BLIK', false, 'manual'),
    (p_user, 'exp-uber-apr', 'Uber', '2025-04-18T22:15:00Z', 295.25, 'transport', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-energia-apr', 'Tauron — Energia', '2025-04-05T00:00:00Z', 156.20, 'bills', 'Karta **** 4213', true, 'manual'),
    (p_user, 'exp-internet-apr', 'Orange — Internet', '2025-04-01T00:00:00Z', 99.90, 'bills', 'Karta **** 4213', true, 'manual'),
    (p_user, 'exp-rent-apr', 'Czynsz', '2025-04-10T00:00:00Z', 100.30, 'bills', 'Przelew', true, 'manual'),
    (p_user, 'exp-kino-apr', 'Kino Helios', '2025-04-14T19:30:00Z', 96.50, 'fun', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-apteka-apr', 'Apteka Dbam o Zdrowie', '2025-04-09T13:20:00Z', 63.40, 'health', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-empik-apr', 'Empik', '2025-04-22T16:05:00Z', 45.60, 'other', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-biedronka-mar', 'Biedronka', '2025-03-11T14:00:00Z', 1402.10, 'groceries', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-transport-mar', 'Orlen', '2025-03-08T09:00:00Z', 590.00, 'transport', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-bills-mar', 'Rachunki marzec', '2025-03-05T00:00:00Z', 648.90, 'bills', 'Przelew', true, 'manual'),
    (p_user, 'exp-fun-mar', 'Spotify + Kino', '2025-03-14T19:00:00Z', 210.00, 'fun', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-health-mar', 'Przychodnia', '2025-03-19T10:30:00Z', 180.00, 'health', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-other-mar', 'Zakupy różne', '2025-03-25T12:00:00Z', 200.00, 'other', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-feb-1', 'Biedronka', '2025-02-10T14:00:00Z', 1180.00, 'groceries', 'Karta **** 4213', false, 'manual'),
    (p_user, 'exp-feb-2', 'Rachunki luty', '2025-02-05T00:00:00Z', 640.00, 'bills', 'Przelew', true, 'manual'),
    (p_user, 'exp-feb-3', 'Orlen', '2025-02-12T09:00:00Z', 505.00, 'transport', 'Karta **** 4213', false, 'manual');

  insert into public.receipt_items
    (user_id, id, expense_id, name, unit_price, quantity, discount, category_id) values
    (p_user, 'ri-1', 'exp-biedronka-apr', 'Chleb pszenny', 1.99, 1, 0, 'groceries'),
    (p_user, 'ri-2', 'exp-biedronka-apr', 'Mleko 2% 1 l', 2.99, 1, 0, 'groceries'),
    (p_user, 'ri-3', 'exp-biedronka-apr', 'Ser twarogowy', 4.49, 1, 0, 'groceries'),
    (p_user, 'ri-4', 'exp-biedronka-apr', 'Jabłka 1 kg', 5.90, 1, 0, 'groceries'),
    (p_user, 'ri-5', 'exp-biedronka-apr', 'Kurczak filet', 18.30, 1, 0, 'groceries'),
    (p_user, 'ri-6', 'exp-biedronka-apr', 'Kawa mielona', 9.00, 1, 0, 'groceries'),
    (p_user, 'rl-1', 'exp-lidl-apr', 'Warzywa mix', 12.99, 1, 0, 'groceries'),
    (p_user, 'rl-2', 'exp-lidl-apr', 'Ryż 1 kg', 6.49, 1, 0, 'groceries'),
    (p_user, 'rl-3', 'exp-lidl-apr', 'Olej rzepakowy', 8.99, 1, 0, 'groceries'),
    (p_user, 'rl-4', 'exp-lidl-apr', 'Jogurt naturalny', 3.75, 4, 0, 'groceries'),
    (p_user, 'rl-5', 'exp-lidl-apr', 'Masło', 7.49, 1, 0, 'groceries'),
    (p_user, 'rl-6', 'exp-lidl-apr', 'Pomidory', 9.50, 1, 0, 'groceries'),
    (p_user, 'rl-7', 'exp-lidl-apr', 'Płatki owsiane', 4.99, 1, 0, 'groceries');

  insert into public.limits (user_id, id, scope, category_id, amount, alert_at80, delivery) values
    (p_user, 'limit-total', 'total', null, 3500, true, 'push'),
    (p_user, 'limit-groceries', 'category', 'groceries', 1000, true, 'push'),
    (p_user, 'limit-transport', 'category', 'transport', 500, false, 'push'),
    (p_user, 'limit-fun', 'category', 'fun', 300, true, 'email');

  insert into public.savings_goals (user_id, id, name, target, saved, months) values
    (p_user, 'goal-holiday', 'Wakacje', 3000, 1200, 9),
    (p_user, 'goal-phone', 'Nowy telefon', 2500, 500, 12);

  insert into public.recurring_expenses
    (user_id, id, name, cost, next_payment_date, active, payment_method, category_id) values
    (p_user, 'rec-internet', 'Internet', 60.00, '2025-05-05', true, 'Karta **** 4213', 'bills'),
    (p_user, 'rec-phone', 'Telefon', 50.00, '2025-05-10', true, 'Karta **** 4213', 'bills'),
    (p_user, 'rec-spotify', 'Spotify', 19.99, '2025-05-02', true, 'Karta **** 4213', 'fun'),
    (p_user, 'rec-gym', 'Subskrypcja siłowni', 79.00, '2025-05-01', false, 'Karta **** 4213', 'health');

  insert into public.recurring_payments (user_id, recurring_id, date, amount) values
    (p_user, 'rec-internet', '2025-04-05', 60.00),
    (p_user, 'rec-internet', '2025-03-05', 60.00),
    (p_user, 'rec-internet', '2025-02-05', 60.00),
    (p_user, 'rec-phone', '2025-04-10', 50.00),
    (p_user, 'rec-phone', '2025-03-10', 50.00),
    (p_user, 'rec-spotify', '2025-04-02', 19.99),
    (p_user, 'rec-spotify', '2025-03-02', 19.99),
    (p_user, 'rec-gym', '2025-04-01', 79.00);

  insert into public.notifications (user_id, id, kind, title, body, age_days) values
    (p_user, 'ntf-1', 'limit-warning', 'Zbliżasz się do limitu kategorii', 'Spożywcze (85%)', 2),
    (p_user, 'ntf-2', 'receipt-confirmation', 'Nowy paragon', 'Biedronka · 42,67 zł', 3),
    (p_user, 'ntf-3', 'recurring', 'Wydatki cykliczne', 'Telefon · 50,00 zł', 5),
    (p_user, 'ntf-4', 'limit-alert', 'Ostrzeżenie o limicie', 'Rozrywka (90%)', 7);
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_demo_data(new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
