---
ticket: none
scope: parka
summary: One expenses list and one add/edit popup (recurring merged in)
why: Recurring and normal expenses share data and UI, so they merge into one list and one add/edit popup
date: 2026-10-03
---

- `dashboard/presentation/month-expenses.tsx`: recurring charges are normal rows; single "Dodaj wydatek" button (`dashboard:expense-new`) in the card header; every row opens its popup.
- `dashboard/presentation/detail-dialog.tsx` (new): shared popup shell + `DialogActions` (delete left, cancel/confirm right).
- `dashboard/presentation/expense-detail.tsx`, `recurring-detail.tsx`: fields editable at once, no edit icon/view mode.
- `dashboard/presentation/new-expense.tsx` (new): add popup with a Normalny/Cykliczny switch on top; `recurring-badge.tsx` (new): the one "Cykliczny" mark used in rows and popups.
- `dashboard/core`: `[TRIGGER]_CREATE_EXPENSE` handler, facade `createExpense`, `postExpense` in repository, `newExpenseId`.
- Removed `recurring-card.tsx`, the tracking switch (data keeps `active`), obsolete e2e ids; list + limits share the xl row (8/4).
- Tests: recurring unit tests no longer pause; e2e covers adding a normal expense and the switch.
- Cause: expenses and recurring expenses were the same thing to the user but lived in two cards with two edit patterns.
