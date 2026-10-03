# 0012 - month passed as argument, not kept in store

```json
{
  "status": "done"
}
```

- `$month` removed from `core/store.ts`; `[TRIGGER]_LOAD` handler no longer writes it.
- `DashboardView` (`useState`, seeded from `?month=`) is the only holder of the month; it passes it down.
- `RecurringCard` takes `month` prop -> `RecurringForm` and the pause toggle.
- `facade.createRecurring/updateRecurring/removeRecurring(…, month)`; the three `*_RECURRING` triggers carry `month`.
- Recurring handlers emit `[FACT]_RECURRING_CHANGED { month }` on success (see 0013).
- `core/actions/refresh-summary.ts` (read `$month`) deleted.
- `recurring-flow` tests pass a month to the three recurring calls.

## Decisions

- Month is an argument of every function that needs it, never state: one source of truth (URL + view state), nothing to drift.
- Why: `refreshSummary` read `$month` from the store, so after a fast month switch it could reload a month the UI no longer showed.
