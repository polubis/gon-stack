---
ticket: none
scope: parka/dashboard
summary: Expenses as a dashboard section
why: Expenses and dashboard duplicated screens; same approach as the statistics merge
date: 2026-10-01
---

- Expenses list (filter all/category/bills, detail dialog, optimistic edit/delete with toasts) moved from `modules/expenses` into dashboard as a section below the summary.
- Own load lifecycle (`[TRIGGER]_LOAD_EXPENSES`, `$expenses*` atoms) so an expenses failure never hides the summary, and vice versa. e2e ids moved to `dashboard:*`.
- Removed `modules/expenses`, `/app/expenses/` page and nav tab.
