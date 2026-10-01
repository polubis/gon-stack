# 0026 - merge expenses into home dashboard

```json
{
  "status": "done"
}
```

- `/app/` shows expenses as an extra section under the summary; list, filter, detail/edit/delete and toasts behave as before.
- Removed `modules/expenses`, `pages/app/expenses.astro`, `APP_ROUTER.expenses`, the Wydatki nav tab, expenses e2e ids and hashy manifest entry.
- Receipt save now redirects to `/app/`.

Why: expenses and dashboard duplicated screens; one home tab is simpler. Backend endpoints unchanged.
