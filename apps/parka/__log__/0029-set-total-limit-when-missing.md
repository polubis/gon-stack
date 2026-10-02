# 0029 - set monthly (total) limit from the dashboard when none exists

```json
{
  "status": "done"
}
```

- `dashboard/presentation/total-limit.tsx`: empty state shows "Ustaw limit miesięczny" button (`dashboard:limit-total-new`, wraps on narrow screens); `TotalLimitForm` creates a `total` limit when `limit` is absent, else updates.
- `dashboard/presentation/limits-card.tsx`: `total` sheet opens without an existing limit; title "Ustaw"/"Zmień limit miesięczny".
- `dashboard/configuration/constraints.ts`: `DEFAULT_TOTAL_LIMIT = 3000`; `e2e-ids.ts`: new id.
- `dashboard/__tests__/limits-flow.test.tsx`: test for creating a limit with optimistic add + toast.

Cause: only editing an existing total limit was possible; "Dodaj limit" created category limits only, so an account without a total limit had no way to set one.

Verified: lint, dashboard unit tests (161), screenshots at 320-1920 px (mocked API).
