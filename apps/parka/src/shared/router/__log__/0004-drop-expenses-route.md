# 0004 - drop expenses route

```json
{
  "status": "done"
}
```

Removed `APP_ROUTER.expenses` (`/app/expenses/`) and the `expenses` nav tab (`NavKey` = `start | more`). Expenses now live inside the dashboard at `/app/`; receipt save redirects there. `API_ROUTER.expenses` stays.
