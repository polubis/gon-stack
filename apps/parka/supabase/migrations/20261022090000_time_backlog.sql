-- Backlog: a task without a day. It carries the same data as any task but no
-- time; moving it to a day (an ordinary update) puts it on the board.
-- A backlog task is plain: no hour, not done, not made by a rule.

alter table public.time_tasks
  alter column day drop not null,
  add constraint time_tasks_backlog_plain check (
    day is not null
    or (at is null and not done and recurring_id is null)
  );

create index time_tasks_backlog_idx
  on public.time_tasks (user_id, created_at)
  where day is null;
