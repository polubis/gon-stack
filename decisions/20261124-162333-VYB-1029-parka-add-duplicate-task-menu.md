---
ticket: VYB-1029
scope: parka/time
summary: Add Duplikuj item to the time task more-menu
why: Finance expense menu already copies a row into a prefilled form, time tasks had no such shortcut.
date: 2026-11-24
tags: [time, ux]
---

- menu: `Duplikuj` item in `TaskMenu` for board and backlog tasks, opens new modal `task-duplicate:<id>` stacked in the URL
- forms: `TaskDialog` and `BacklogAddDialog` take `source` and prefill title, category, priority, description, day, time
- copy is a new task: new id, no key, step reset to open, never recurring, original untouched
- chose prefilled form over instant copy to mirror finance and let user adjust day first
- tests: unit for board copy, saved payload and backlog copy
- evidence: text log of the unit run, no browser recording (needs auth plus real backend)
