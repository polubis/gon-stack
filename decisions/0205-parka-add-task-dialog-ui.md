---
ticket: none
scope: parka
summary: Add task, category and priority form dialogs to time module
why: Time module lacked widgets to create and edit tasks, categories and priorities
date: 2026-10-20
tags: [parka, time, tasks, ui, modal]
---

- New `TaskDialog` in `modules/time/presentation` (UI only, local form state, save just closes)
  - Fields: name (clearable), category, priority, day, hour, all-day toggle; edit adds "done" toggle
  - Opened via URL modal stack: `?modal=task-new`, `?modal=task-edit:<title>`
- "Dodaj" button and mobile FAB open `AddMenu` (Zadanie / Kategoria / Priorytet), arrow keys + Escape
- Priority = name + value 1..10, built-ins low/medium/high = 2/5/9, selector sorted by value ("7 - Pilny")
  - `TaskRow` shows arrow by value (>= 8 up, <= 3 down), also for custom priorities
- Category form and list mirror finance categories (name + icon preview, colour picker, icon picker, same validation, same list rows)
  - Pickers and icon catalog copied into the module, not imported (isolation over duplication)
  - Stacked URL modals over the task dialog (`categories`, `category-new`, `priority-new`); created item is selected in the task form
- Categories and priorities are local state in `lists-context` (no persistence)
- Audit cleanup: priority/category types and priority helpers moved to `domain/`, task form pickers extracted, tests added (`__tests__/task-forms.test.tsx`)
