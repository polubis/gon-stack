-- Recurring tasks may repeat every day. Recurring expenses keep their
-- weekly / monthly / yearly check.

alter table public.time_recurring
  drop constraint if exists time_recurring_interval_check;

alter table public.time_recurring
  add constraint time_recurring_interval_check
    check (interval in ('daily', 'weekly', 'monthly', 'yearly'));
