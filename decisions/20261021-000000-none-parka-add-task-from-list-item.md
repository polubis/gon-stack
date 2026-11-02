---
ticket: none
scope: parka
summary: Time list items get a plus that adds a task for their day
why: Adding a task from the week or month list meant picking the date by hand
date: 2026-10-21
tags: [parka, time, task-form, modal-stack]
---

- Plus button (`lucide-react`) on each day in week cards, week hour grid header and month cells
  - Label `Dodaj zadanie na <day>`, keyboard reachable, opens URL modal `task-new:<date>`
  - Form opens with that date filled in
- Add-task form: "Cały dzień" is on by default (edit keeps the task's own value)
- Tests: plus opens form with date and whole day; existing add tests follow the new default
