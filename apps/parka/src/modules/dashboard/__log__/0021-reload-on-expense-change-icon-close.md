# 0021 - full reload after expense change, icon close in popup

```json
{
  "status": "done"
}
```

- `reload-on-expense-change.ts`: `[FACT]_EXPENSE_CHANGED` -> `forwardAs('[TASK]_LOAD')`. Edit and delete of an expense now run the full 6-read load with `LoadingBanner`, same as recurring changes.
- Removed `refresh-summary.ts`, `request-summary-refresh.ts`, `[TASK]_REFRESH_SUMMARY`. Supersedes 0014.
- `DetailDialog`: text `Zamknij` replaced by round icon button (`X`, `aria-label="Zamknij"`), same as `Sheet`.

## Decisions

- Why: one refresh behavior for every mutation that moves totals; no second summary-only path to maintain.
- Cost: 6 reads instead of 1 after expense edit/delete.
