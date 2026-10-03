# 0015 - e2e: values recalculated after changes

```json
{
  "status": "done"
}
```

- `__e2e__/dashboard-recalculation.spec.ts` (Playwright via `vibe-test` interpreter, typed `getByE2e`/`getByE2ePrefix`), 11 tests: saving a receipt, editing/deleting an expense, adding/pausing/editing/deleting recurring, changing the monthly limit, switching month (`+100%` change), 6 reads once on open, one extra `LOAD` after a recurring change.
- `__e2e__/fake-backend.ts`: stateful in-memory API behind `page.route`; the summary is computed by the real `summarizeDashboard` + `occurrencesInMonth`.
- Result: 46/46 e2e green (this spec + `flows` + `screens`) on `astro dev`; the two expense edit/delete tests were red until 0014.
- Not covered: real Supabase backend (a spec was written and passed once against local Supabase, then dropped on purpose), `wrangler dev` build.

## Decisions

- Why a stateful fake instead of fixed stubs: a stub only repeats what it was told; the real domain code makes the test prove the numbers the UI shows after each change.
- Dates are seeded relative to the current month; amounts kept small to avoid thousands grouping in assertions.
- Failing tests were kept red until the fix (0014), not skipped.
