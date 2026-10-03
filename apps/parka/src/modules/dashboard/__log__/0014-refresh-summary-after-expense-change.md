# 0014 - summary re-read after expense edit/delete

```json
{
  "status": "done"
}
```

- `update-expense` / `delete-expense`: on success `emit('[FACT]_EXPENSE_CHANGED', { month })`.
- `request-summary-refresh.ts`: that fact -> `forwardAs('[TASK]_REFRESH_SUMMARY')`.
- `refresh-summary.ts`: runs `fetchSummary(month)` and sets `$data` only; no `$loading`, no skeleton; `takeUntil([TASK]_LOAD)` so a full load wins; failure keeps the old summary.
- `updateExpense/removeExpense(…, month)`, triggers carry `month`; `ExpenseDetail` gets `month` from `main.tsx`.
- `expenses-flow` tests: summary read again after a saved removal, not after a failed one.

## Decisions

- Why: hero, chart and categories come from the server summary, which stayed stale after an expense edit/delete (only recurring reloaded).
- Summary-only revalidation: the lists are already right (optimistic), so one `GET /api/dashboard/` instead of the 6-read `LOAD`.
- Rejected: FE-only delta of the summary: needs `total`, `change`, `dailyAverage` (elapsed days), `daily`, category slices + `pct` to match the server to the cent: same logic in two places.
- Limit and goal changes not covered here (limit total already checked by e2e; goals do not feed the summary).
