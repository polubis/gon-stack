---
ticket: none
scope: parka/dashboard
summary: Sum dashboard in SQL, bootstrap read, page every reader
why: Dashboard GET was 5x slower than other reads; many readers silently stopped at the 1000-row API cap; cold load made five authed requests
date: 2026-10-30
tags: [performance, api, database]
---

- Migration `dashboard_summary` (security invoker, RLS kept) sums expenses per day or month in the caller zone
  - `get-dashboard` calls it with GET; percentages, change and averages stay in `dashboardFromTotals`
  - Sums are exact decimals now; old float drift (1e-11) is gone, every other output byte-identical
- Expense list reads pages of 1000 (date desc, id) with products embedded, so no cap cuts lists or totals
  - Heavier answer for big histories, but complete; keyset paging left as a follow-up
- Migration swaps `expenses_user_date_idx` for `(user_id, date desc, id)`
  - Page 1 of 50k expenses 229 ms to 23 ms through the Data API; no change at 2k rows
- New `GET /api/bootstrap/` returns dashboard, expenses, categories, limits and recurring with one auth and one recurring charge pass
  - All list endpoints and bootstrap answer from `finance-reads.ts`, so they cannot drift
  - Dashboard loader uses it only when shared reads are not cached; a period change still asks for the summary alone
- `readAllPages` pages every unbounded list (categories, limits, recurring and rule products, device profiles, time lists); first request unordered, only a full page restarts ordered by id
- `own_devices` RPC replaces settings scans of every expense and task row; `readMonthSpending` feeds limit alerts from `dashboard_summary`
  - Settings no longer miss devices of old expenses; alerts count months past 1000 expenses
- MCP tools already page in SQL (limit 100, jsonb) and need no change
- Earlier: series built in one pass, `materializeRecurring` reads rule products only when a charge is due, `limit-alerts` type fix
- API characterization suite `finance-*.spec.ts`: exact JSON for synthetic accounts, zones, recurring, RLS, 401, 400, row cap
