-- A category can no longer be deleted while expenses, receipt items,
-- recurring expenses or category limits point at it.
-- `limits.category_id` is null for the total limit; MATCH SIMPLE skips it.

alter table public.expenses
  add constraint expenses_category_fk
  foreign key (user_id, category_id)
  references public.categories (user_id, id) on delete restrict;

alter table public.receipt_items
  add constraint receipt_items_category_fk
  foreign key (user_id, category_id)
  references public.categories (user_id, id) on delete restrict;

alter table public.recurring_expenses
  add constraint recurring_expenses_category_fk
  foreign key (user_id, category_id)
  references public.categories (user_id, id) on delete restrict;

alter table public.limits
  add constraint limits_category_fk
  foreign key (user_id, category_id)
  references public.categories (user_id, id) on delete restrict;

create index expenses_category_idx on public.expenses (user_id, category_id);
create index receipt_items_category_idx on public.receipt_items (user_id, category_id);
create index recurring_expenses_category_idx on public.recurring_expenses (user_id, category_id);
create index limits_category_idx on public.limits (user_id, category_id);
