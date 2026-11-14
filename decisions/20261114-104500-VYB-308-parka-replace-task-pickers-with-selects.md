---
ticket: VYB-308
scope: parka/time
summary: Replace task form pickers with selects and unify spacing
why: The task form was long, cluttered with link buttons and not in line with the app UX, so category and priority became selects.
date: 2026-11-14
tags: [ux, form, select, time]
---

- Category and priority are now `Select` fields (icon per category, pips per priority), shared by the task and backlog forms; the radio chips are gone
- Only "Nowy priorytet" stays as a link; "Wszystkie", "Nowa kategoria" and "Edytuj statusy" were removed, categories and statuses stay in the add menu
- `Field` takes an optional `action` slot on its label row; the status select uses `Field` too
- Form gap goes from 3 to 4 and the inline error offsets follow, so spacing is uniform
- Radix reports an empty value while its list catches up with a new item; the pickers ignore it so a just-created priority stays selected
- Tests updated to comboboxes, e2e selectors `time:category-select` and `time:priority-select` replace the option ids
