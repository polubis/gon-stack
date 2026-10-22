-- Task titles grow from 40 to 160 characters, and tasks (and the rules that
-- make them) get an optional description of up to 5000 characters.
-- A description is either null or non-empty: the server stores "nothing" as null.

alter table public.time_tasks
  drop constraint time_tasks_title_check,
  add constraint time_tasks_title_check
    check (char_length(title) between 1 and 160),
  add column description text
    check (char_length(description) between 1 and 5000);

alter table public.time_recurring
  drop constraint time_recurring_title_check,
  add constraint time_recurring_title_check
    check (char_length(title) between 1 and 160),
  add column description text
    check (char_length(description) between 1 and 5000);
