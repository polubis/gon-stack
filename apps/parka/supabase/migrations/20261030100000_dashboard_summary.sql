-- Dashboard totals computed where the rows live. The app used to pull every
-- expense of two periods plus their products and add them up per request;
-- this sums them in one pass instead, so the cost no longer grows with the
-- history and the Data API row cap (1000) cannot cut a total short.
--
-- Same rules as the app's own `summarizeDashboard`:
--   * an expense belongs to the calendar day it falls on in the caller's
--     zone (`p_tz`), and to the period that holds that day;
--   * an expense with a category counts whole for it; one without (made of
--     products from different categories) is split by its products, each
--     expense's share rounded to the cent;
--   * buckets are days of the period (`day`) or its months (`month`), 1-based.
--
-- Only totals come back (empty buckets are left out); percentages, change,
-- averages and names stay in the app. `security invoker` keeps row level
-- security in force: the caller sees and sums only their own rows.

create function public.dashboard_summary(
  p_from date,
  p_to date,
  p_bucket text,
  p_previous_from date,
  p_previous_to date,
  p_previous_bucket text,
  p_tz text
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with scoped as (
    -- One day wider on both sides: the zone decides the exact edge.
    select e.user_id, e.id, e.amount, e.category_id,
           (e.date at time zone p_tz)::date as day
    from public.expenses e
    where e.date >= (p_previous_from - 1)::timestamp at time zone 'UTC'
      and e.date < (p_to + 2)::timestamp at time zone 'UTC'
  ),
  cur as (select * from scoped where day between p_from and p_to),
  prev as (
    select * from scoped where day between p_previous_from and p_previous_to
  ),
  cur_series as (
    select case p_bucket
             when 'month' then
               (extract(year from day)::int * 12 + extract(month from day)::int)
               - (extract(year from p_from)::int * 12 + extract(month from p_from)::int)
               + 1
             else day - p_from + 1
           end as idx,
           sum(amount) as total
    from cur
    group by 1
  ),
  prev_series as (
    select case p_previous_bucket
             when 'month' then
               (extract(year from day)::int * 12 + extract(month from day)::int)
               - (extract(year from p_previous_from)::int * 12 + extract(month from p_previous_from)::int)
               + 1
             else day - p_previous_from + 1
           end as idx,
           sum(amount) as total
    from prev
    group by 1
  ),
  shares as (
    select category_id, amount from cur where category_id is not null
    union all
    select s.category_id, s.amount
    from (
      select i.category_id,
             round(sum(i.unit_price * i.quantity - i.discount), 2) as amount
      from cur c
      join public.receipt_items i
        on i.user_id = c.user_id and i.expense_id = c.id
      where c.category_id is null
      group by c.id, i.category_id
    ) s
  ),
  slices as (
    select category_id, round(sum(amount), 2) as amount
    from shares
    group by category_id
  )
  select jsonb_build_object(
    'total', (select coalesce(sum(amount), 0) from cur),
    'previousTotal', (select coalesce(sum(amount), 0) from prev),
    'transactions', (select count(*) from cur),
    'series', (
      select coalesce(
        jsonb_agg(jsonb_build_object('index', idx, 'total', total) order by idx),
        '[]'::jsonb)
      from cur_series
    ),
    'previousSeries', (
      select coalesce(
        jsonb_agg(jsonb_build_object('index', idx, 'total', total) order by idx),
        '[]'::jsonb)
      from prev_series
    ),
    'categories', (
      select coalesce(
        jsonb_agg(jsonb_build_object('categoryId', category_id, 'amount', amount)
                  order by category_id),
        '[]'::jsonb)
      from slices
    )
  );
$$;

revoke execute on function public.dashboard_summary(date, date, text, date, date, text, text) from public, anon;
grant execute on function public.dashboard_summary(date, date, text, date, date, text, text) to authenticated;

-- Rollback: drop function public.dashboard_summary(date, date, text, date, date, text, text);
