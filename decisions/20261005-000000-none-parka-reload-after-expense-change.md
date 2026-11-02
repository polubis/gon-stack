---
ticket: none
scope: parka/dashboard
summary: Full reload after expense change, icon close in popup
why: One refresh behavior for every mutation that moves totals; no second summary-only path to maintain
date: 2026-10-05
supersedes: 20261003-000000-none-parka-refresh-summary-after-expense-change
---

- `reload-on-expense-change.ts`: `[FACT]_EXPENSE_CHANGED` -> `forwardAs('[TASK]_LOAD')`. Edit and delete of an expense now run the full 6-read load with `LoadingBanner`, same as recurring changes.
- Removed `refresh-summary.ts`, `request-summary-refresh.ts`, `[TASK]_REFRESH_SUMMARY`. Supersedes 0098.
- `DetailDialog`: text `Zamknij` replaced by round icon button (`X`, `aria-label="Zamknij"`), same as `Sheet`.
- Cost: 6 reads instead of 1 after expense edit/delete.
