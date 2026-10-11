-- Recurring expenses become instructions only: a rule never counts into any
-- total. The server turns each occurrence that has come due (date <= today)
-- into an ordinary expense, once, and from then on the expense lives on its
-- own. `recurring_id` only remembers where it came from.
--
-- Stability: (user, rule, occurrence date) is unique, so inserting twice is a
-- no-op; `last_materialized_date` marks how far the rule was caught up, so an
-- expense the user deleted is never created again.

alter table public.recurring_expenses
  add column interval text not null default 'monthly'
    check (interval in ('weekly', 'monthly', 'yearly')),
  add column start_date date,
  add column end_date date,
  add column last_materialized_date date,
  add constraint recurring_expenses_period_check
    check (end_date is null or start_date is null or end_date >= start_date);

-- The series starts at its oldest known payment.
update public.recurring_expenses r
set start_date = least(
  r.next_payment_date,
  coalesce(
    (select min(p.date) from public.recurring_payments p
      where p.user_id = r.user_id and p.recurring_id = r.id),
    r.next_payment_date
  )
);

alter table public.recurring_expenses alter column start_date set not null;

alter table public.expenses
  add column recurring_id text,
  add column occurrence_date date,
  add constraint expenses_recurring_fk
    foreign key (user_id, recurring_id)
    references public.recurring_expenses (user_id, id)
    on delete set null (recurring_id),
  add constraint expenses_occurrence_check
    check (recurring_id is null or occurrence_date is not null);

-- Nulls are distinct: plain expenses never collide, a rule's occurrence does.
create unique index expenses_recurring_occurrence_uniq
  on public.expenses (user_id, recurring_id, occurrence_date);

-- Charges the old model derived month by month become plain expenses.
insert into public.expenses (
  user_id, id, merchant, date, amount, category_id, payment_method,
  is_bill, source, recurring_id, occurrence_date
)
select
  r.user_id,
  r.id || ':' || to_char(o.day, 'YYYY-MM-DD'),
  r.name,
  (o.day + time '12:00') at time zone 'UTC',
  r.cost,
  r.category_id,
  r.payment_method,
  true,
  'manual',
  r.id,
  o.day
from public.recurring_expenses r
cross join lateral (
  select (r.start_date + make_interval(months => k))::date as day
  from generate_series(0, 1200) k
) o
where r.active and o.day <= current_date;

update public.recurring_expenses r
set last_materialized_date = (
  select max(e.occurrence_date) from public.expenses e
  where e.user_id = r.user_id and e.recurring_id = r.id
);

-- Payment history is now the rule's expenses.
drop table public.recurring_payments;
alter table public.recurring_expenses drop column next_payment_date;
