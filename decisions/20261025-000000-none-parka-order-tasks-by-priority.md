---
ticket: none
scope: parka/time
summary: Priorities and tasks ordered from highest priority
why: Priority chips and tasks listed lowest or alphabetical first, so the most important came last
date: 2026-10-25
tags: [parka, time, priority]
---

- `sortPriorities` in `time/domain/priority.ts` sorts descending by value
  - Ultra pilne 10, Wysoki 9, Średni 5, Niski 2
  - ties keep the incoming order (stable sort); radio and tab order match the visual one
  - a new priority lands at its value spot; chips re-sort only on create, never while editing
- New `sortByPriority` and `priorityWeight` in the same file: one source for any item with `priorityId`
  - unknown priority weighs least, so it goes last
  - backlog dialog lists tasks through `sortByPriority`
- `sortTasks(tasks, priorities)` and `tasksOn(tasks, day, priorities)` in `domain/schedule.ts`
  - day, week (cards and hour grid) and month use it
  - timed tasks keep chronological order, so the timeline and the now marker stay right
  - priority ranks tasks inside the same hour and the whole-day ones; then title
- Status (`done`, `inProgress`) never affects order, so toggling a task does not move its row
- Optimistic add, edit and move land at the right spot since views sort on render
- Tests: domain order, stable ties, unknown priority, backlog dialog order, task form chips
  - `time.spec.ts` needs Supabase and picks priorities by name, left as is
