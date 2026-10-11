---
ticket: none
scope: parka/dashboard
summary: Remove savings goals feature
why: Savings goals are dropped from the product (new migration, as `init` may already be applied)
date: 2026-10-03
---

- BE: removed `/api/goals`, `/api/goals/[id]`, the four goal procedures, `schemas/goals.ts`, `goal` schema, `API_ROUTER.goals/goalById`.
- DB: new migration `20261003090000_drop_savings_goals.sql`; `db-schema.ts` without `savings_goals`.
- FE: removed goal form/card/tab, handlers, events, store atom, facade API, mapper, repository calls, ids, constants, e2e ids; dashboard now loads 5 reads.
- Tests: dropped goal cases from limits-flow/mappers; dashboard-flow, e2e stubs, screens, REST e2e updated. Docs: requirements and dictionary.
- 164 unit tests, `check-types`, eslint green. Playwright e2e not run.
