---
ticket: none
scope: parka/dashboard
summary: "E2e: values recalculated after changes"
why: A stateful fake with real domain code proves the numbers the UI shows after each change; static stubs only repeat input
date: 2026-10-03
---

- `__e2e__/dashboard-recalculation.spec.ts` (Playwright via `vibe-test` interpreter, typed `getByE2e`/`getByE2ePrefix`), 11 tests: saving a receipt, editing/deleting an expense, adding/pausing/editing/deleting recurring
  - changing the monthly limit, switching month (`+100%` change), 6 reads once on open, one extra `LOAD` after a recurring change.
- `__e2e__/fake-backend.ts`: stateful in-memory API behind `page.route`; the summary is computed by the real `summarizeDashboard` + `occurrencesInMonth`.
- Not covered: real Supabase backend (a spec was written and passed once against local Supabase, then dropped on purpose), `wrangler dev` build.
- Dates are seeded relative to the current month; amounts kept small to avoid thousands grouping in assertions.
- Failing tests were kept red until the fix (0098), not skipped.
