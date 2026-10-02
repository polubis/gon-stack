# 0003 - skip monolithic real-backend e2e until it is split

```json
{
  "status": "done-with-clarification"
}
```

`test('every feature works against the real Supabase backend')` in `src/__e2e__/backend.spec.ts` is now `test.skip`. The 14-step flow (register, categories, receipt, expenses, dashboard, report, limit, settings, export, sign out/in, persistence) is unchanged and kept for the split.

Symptoms after `3c39c3e`: intermittent failure at different steps (`getByText('Kultura')` not found after category create, `dashboard:total`, then a 30s test timeout in the last steps). Root cause not established: no zombie `workerd`/`wrangler`, no port clash on 4325; one run exceeded 30s. A stale initial category load overwriting an optimistic create is suspected, not confirmed. Full-flow runtime never measured.

Follow-up: split into several focused tests, each with own account/state (one feature each), and time the steps. Then remove `test.skip`. `rest-endpoints.spec.ts` still covers real-backend CRUD.

Reason: one long flow fails unpredictably and blocks the suite; decision by user to skip now and split later.
