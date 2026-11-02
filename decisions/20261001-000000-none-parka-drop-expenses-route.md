---
ticket: none
scope: parka/router
summary: Drop expenses route
why: Expenses live inside the dashboard, so the standalone route is dead
date: 2026-10-01
---

- Removed `APP_ROUTER.expenses` (`/app/expenses/`) and the `expenses` nav tab (`NavKey` = `start | more`).
- Expenses now live inside the dashboard at `/app/`; receipt save redirects there.
