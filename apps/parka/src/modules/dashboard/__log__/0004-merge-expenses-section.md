# 0004 - expenses as a dashboard section

```json
{
  "status": "done"
}
```

Expenses list (filter all/category/bills, detail dialog, optimistic edit/delete with toasts) moved from `modules/expenses` into dashboard as a section below the summary. Own load lifecycle (`[TRIGGER]_LOAD_EXPENSES`, `$expenses*` atoms) so an expenses failure never hides the summary, and vice versa. e2e ids moved to `dashboard:*`. Removed `modules/expenses`, `/app/expenses/` page and nav tab. Same approach as 0025 (statistics merge).
