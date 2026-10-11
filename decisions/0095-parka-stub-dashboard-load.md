---
ticket: none
scope: parka/e2e
summary: Flows/screens stub the whole dashboard load
why: The dashboard loads as one all-or-nothing request set; one unstubbed read shows the failure screen and hides every section
date: 2026-10-03
---

- `screens.spec.ts`: the dashboard mock also answers expenses, categories, limits, goals, recurring with empty lists.
- `flows.spec.ts`: `mockState` stubs the dashboard summary;
  - `i mock the dashboard totals` and `i mock the expenses list` start from `mockState`
  - `i add and remove a recurring expense` runs on the stateful `installBackend` (`modules/dashboard/__e2e__/fake-backend.ts`).
- The recurring add/remove flow needs state: a recurring change reloads the dashboard, and a static empty list would drop the new item.
- the dashboard now loads summary + all lists as one all-or-nothing request set (see dashboard 0097); one unstubbed read shows the failure screen and hides every section. 14 specs failed until all reads were stubbed.
