-- An expense with products takes its category from them: the shared one, or
-- null when the products differ. Without products the category stays manual.

alter table public.expenses alter column category_id drop not null;

update public.expenses e
set category_id = d.category_id
from (
  select
    user_id,
    expense_id,
    case when count(distinct category_id) = 1 then min(category_id) end
      as category_id
  from public.receipt_items
  group by user_id, expense_id
) d
where d.user_id = e.user_id and d.expense_id = e.id;
