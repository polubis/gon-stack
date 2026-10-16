-- A rule can carry products. Every expense it makes copies them into
-- `receipt_items`, so an occurrence looks like any expense with products.
-- With products the rule category is derived (shared one, else null).

alter table public.recurring_expenses alter column category_id drop not null;

create table public.recurring_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  recurring_id text not null,
  name text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity numeric(12, 3) not null default 1,
  discount numeric(12, 2) not null default 0,
  category_id text not null,
  primary key (user_id, id),
  foreign key (user_id, recurring_id)
    references public.recurring_expenses (user_id, id) on delete cascade,
  constraint recurring_items_category_fk
    foreign key (user_id, category_id)
    references public.categories (user_id, id) on delete restrict
);
create index recurring_items_recurring_idx on public.recurring_items (user_id, recurring_id);
create index recurring_items_category_idx on public.recurring_items (user_id, category_id);

alter table public.recurring_items enable row level security;
create policy recurring_items_owner on public.recurring_items
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
