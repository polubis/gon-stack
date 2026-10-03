# 0016 - remove savings goals feature

```json
{
  "status": "done"
}
```

- BE: removed `/api/goals`, `/api/goals/[id]`, the four goal procedures, `schemas/goals.ts`, `goal` schema, `API_ROUTER.goals/goalById`.
- DB: new migration `20261003090000_drop_savings_goals.sql`; `db-schema.ts` without `savings_goals`.
- FE: removed goal form/card/tab, handlers, events, store atom, facade API, mapper, repository calls, ids, constants, e2e ids; dashboard now loads 5 reads.
- Tests: dropped goal cases from limits-flow/mappers; dashboard-flow, e2e stubs, screens, REST e2e updated. Docs: requirements and dictionary.
- 164 unit tests, `check-types`, eslint green. Playwright e2e not run.

## Decisions

- Why a new migration, not an edit of `init`: init may already be applied.
