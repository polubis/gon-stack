---
version: 1.3
hash: 0499ac15f51df91645a9fbffdff4736f1a5b756cc47d9ed1317a0655ac2981cf
---



# Limits

Isolated module: total/category limits + savings goals. Month-scoped progress
(current month) from limits + expenses. Optimistic create/update, rollback,
toast. Clone of dashboard/expenses conventions. Auth required (CSR).

## Architecture

1. "configuration" — `constraints.ts` (`FEATURE_NAME`, defaults, `WARN_PCT`,
   tabs, `ERROR_CODES`); `e2e-ids.ts` exports `LimitsE2eId`, `GoalsE2eId`.
2. "domain" — pure. `models.ts` (branded ids, `Limit` union by `scope`),
   `events.ts`, `format.ts`, `ids.ts`.
3. "core" — `store.ts` (atoms), `bus.ts`, `handlers/` (load, create-limit,
   update-limit, create-goal, dismiss-notice), `actions/notify.ts`,
   `registry.ts`, `facade.ts`, `mediator.ts`.
4. "integration" — `repository.ts` only fetcher (`API_ROUTER` limits, goals,
   categories, expenses); `mappers.ts` DTO → domain.
5. "presentation" — `selectors.ts` (progress pct/tone/category selectors);
   `context.tsx` Provider; `main.tsx` = `Main` (ErrorBoundary
   - view); tabs: `total-limit`, `category-limits`, `goals-tab`; forms
     `new-limit-form`, `new-goal-form`; `limits-skeleton`.
6. "index.ts" — exports `Main` only.

## Code

1. `const` + arrows, named exports, `type` only, factory `createX`.
2. Events `[TRIGGER]_X`; handlers RxJS `ofType(...)`.
3. No imports from other modules or `modules/shared`; helpers copied to domain.
4. `load` on mount fetches 4 lists in parallel; first load `Skeleton`, reload
   keeps data + `LoadingBanner`, failure → `ErrorState`.
5. Mutations: optimistic set → API → `$notice` success; on failure restore
   previous + error toast.
6. Month is view state (current month; old UI had no navigation).
7. Tokens only (no raw px/colors), `cn`, a11y labels.

## References

- [core/handlers/update-limit.ts](./core/handlers/update-limit.ts) — optimistic
  update + rollback.
- [presentation/selectors.ts](./presentation/selectors.ts) — progress selectors (pct/tone).
- [integration/repository.ts](./integration/repository.ts) — fetch boundary.
- [**tests**/limits-flow.test.tsx](./__tests__/limits-flow.test.tsx) — flow.

> Read a reference only when the rule above is unclear.
