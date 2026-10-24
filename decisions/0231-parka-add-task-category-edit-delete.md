---
ticket: none
scope: parka/time
summary: Edit and delete task categories, refuse deleting a used one
why: Task categories could only be created; backlog item asked for edit and delete like the finance categories
date: 2026-10-24
tags: [parka, feature, time, categories]
---

- New `PUT` / `DELETE /api/time/categories/[id]` with `update-time-category` / `delete-time-category` procedures, scoped by `user_id`
  - delete of a category still used by tasks or series hits the existing `on delete restrict` FK and answers 409 (`fromSupabaseError`), no migration needed
- Client: `update-category` / `delete-category` handlers (optimistic, rollback, toasts), `CategoryInUseError` as in finance
  - used category: error toast `Kategoria jest używana : TASK_CATEGORY_IN_USE : description`, list restored
- UI: category rows open a stacked edit modal (`category-edit:<id>`), delete asks confirmation in a stacked `category-delete:<id>` modal
- `Toast` z-index raised to `--z-tooltip`: the error toast was hidden under the still-open categories list
- Tests: `categories.test.tsx` (rename, duplicate name, delete, in-use refusal); vitest 858 pass, lint and `astro check` clean
