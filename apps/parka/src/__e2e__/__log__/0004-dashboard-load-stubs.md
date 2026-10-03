# 0004 - flows/screens stub the whole dashboard load

```json
{
  "status": "done"
}
```

- `screens.spec.ts`: the dashboard mock also answers expenses, categories, limits, goals, recurring with empty lists.
- `flows.spec.ts`: `mockState` stubs the dashboard summary; `i mock the dashboard totals` and `i mock the expenses list` start from `mockState`; `i add and remove a recurring expense` runs on the stateful `installBackend` (`modules/dashboard/__e2e__/fake-backend.ts`).

## Decisions

- Why: the dashboard now loads summary + all lists as one all-or-nothing request set (see dashboard 0013); one unstubbed read shows the failure screen and hides every section. 14 specs failed until all reads were stubbed.
- The recurring add/remove flow needs state: a recurring change reloads the dashboard, and a static empty list would drop the new item.
