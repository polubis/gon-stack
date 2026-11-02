---
ticket: none
scope: parka/server
summary: Migrate store to per-entity endpoints, retire aggregate state
why: Aggregate `/api/state` and per-entity endpoints could write the same tables, and every mutation still did a full-graph wipe-and-reinsert
date: 2026-09-15
---

- Rewired the frontend store (`modules/shared/data/store.ts`) off the debounced full-graph sync onto the per-entity REST endpoints added in 0003.
- Bootstrap now does parallel `GET` per entity + settings instead of one `GET /api/state`.
- Mutations replaced the generic `setState(updater)` + debounced-PUT with per-entity actions (`createCategory`, `updateExpense`, `deleteLimit`-style helpers) that update local state and fire the matching `POST`/`PUT`/`DELETE` immediately
  - chained through a `syncChain` so `whenSynced()` still resolves once in-flight writes settle.
- Updated every module (`categories`, `expenses`, `receipt`, `limits`, `recurring`, `settings`) to call the new actions instead of building generic state patches.
- Deleted `pages/api/state.ts`, `get-state`/`sync-state` procedures, and `schemas/state.ts`; fixed `list-expenses`'s stray `FinanceState` type import to use `schemas/general`'s `receiptItem`.
- Rewrote `__e2e__/backend.spec.ts`'s `synced()` helper to wait on the specific per-entity request instead of the removed aggregate PUT.
- This finishes the migration flagged as a follow-up in 0003: client-side writes are now scoped to the single row that changed, `selectedMonth`/`authed` stay purely local via the now-unpersisted `setState`
  - and there is exactly one way to write each entity.
