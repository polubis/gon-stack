# 0013 - one LOAD, all-or-nothing screen

```json
{
  "status": "done"
}
```

- `integration/repository.ts`: `fetchDashboard(month, signal)` = `Promise.all` of the 6 reads (summary, expenses, categories, limits, goals, recurring); mapping stays in integration. Single fetchers stay exported.
- `domain/models.ts`: `DashboardData` (everything the screen shows).
- State is now `$initialized`, `$loading`, `$error` + data atoms. Gone: `$isLoading`, `$initializing`, `*Initializing`, `*Loading`, `*Error` per section.
- Handlers `load-expenses`, `load-limits`, `load-recurring` and their triggers/facade methods deleted. Mutation handlers unchanged.
- `load.ts` listens to `[TASK]_LOAD`: sets `$initialized`, clears `$error`, `switchMap` + `AbortController`, sets all atoms from one result. `$loading.reset()` in `finalize`, so it also resets after an abort; `$loading.set(true)` sits in `defer` so a superseded load cannot reset the flag under the new one.
- `request-load.ts`: `[TRIGGER]_LOAD` -> `forwardAs('[TASK]_LOAD')`. `reload-on-recurring-change.ts`: `[FACT]_RECURRING_CHANGED` -> `forwardAs('[TASK]_LOAD')`.
- UI: `main.tsx` shows one `ErrorState` (`dashboard:summary-error`, retry reloads) on error, `DashboardSkeleton` (`presentation/skeleton.tsx`, mirrors the layout) until loaded, else the interface; `LoadingBanner` only on later loads.
- Cards lost their own skeleton/error/disabled-while-loading code (`recurring-skeleton.tsx` removed); `TotalHero`/`SpendingChart`/`CategoriesCard` take a non-null summary; `AddLimitButton` lost `loading`.
- Removed ids/codes: `*-error` e2e ids (except `summary-error`), `loadExpenses/Limits/Goals/Recurring` error codes.
- Tests: `__tests__/dashboard-backend.ts` (`readBody`, `readHandlers`) serves all six reads; unit tests load through `ctx.load(month)`; new dashboard-flow tests: skeleton until all arrived, 6 requests once, one failure screen when any read fails.

## Decisions

- Why: the old flow showed a skeleton per section from 4 loads with 4 loading/error states: layout jumped, partial screens, 6+ flags. Now one request set, one state, one failure screen.
- `trigger` is reserved for facade/presentation. Inside the module: `emit` for facts, `forwardAs` for chaining, `[TASK]` for work (`[TRIGGER]_LOAD` -> `[TASK]_LOAD`).
- Month change reloads all 6 reads (was 1): simpler model, accepted cost.
- Recurring change reloads everything (summary includes recurring charges computed server-side; a client-side recompute would duplicate `summarizeDashboard`). Rejected: FE-only delta.
- Known: until the first load ends nothing is shown; `$initialized` flips on load start, not on success.
