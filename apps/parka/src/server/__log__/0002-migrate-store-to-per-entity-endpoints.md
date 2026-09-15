# 0002 - migrate store to per-entity endpoints, retire aggregate state

```json
{
  "status": "done"
}
```

Rewired the frontend store (`modules/shared/data/store.ts`) off the debounced full-graph sync onto the per-entity REST endpoints added in 0001. Bootstrap now does parallel `GET` per entity + settings instead of one `GET /api/state`. Mutations replaced the generic `setState(updater)` + debounced-PUT with per-entity actions (`createCategory`, `updateExpense`, `deleteLimit`-style helpers) that update local state and fire the matching `POST`/`PUT`/`DELETE` immediately, chained through a `syncChain` so `whenSynced()` still resolves once in-flight writes settle. Updated every module (`categories`, `expenses`, `receipt`, `limits`, `recurring`, `settings`) to call the new actions instead of building generic state patches. Deleted `pages/api/state.ts`, `get-state`/`sync-state` procedures, and `schemas/state.ts`; fixed `list-expenses`'s stray `FinanceState` type import to use `schemas/general`'s `receiptItem`. Rewrote `__e2e__/backend.spec.ts`'s `synced()` helper to wait on the specific per-entity request instead of the removed aggregate PUT. `pnpm lint` and `pnpm check-types` green.

Aggregate `/api/state` and the per-entity endpoints could both write the same tables since 0001, and every client mutation still went through the wasteful whole-graph wipe-and-reinsert. This finishes the migration flagged as a follow-up in 0001: client-side writes are now scoped to the single row that changed, `selectedMonth`/`authed` stay purely local via the now-unpersisted `setState`, and there is exactly one way to write each entity.
