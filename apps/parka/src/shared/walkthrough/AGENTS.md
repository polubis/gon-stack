---
version: 1.1
---

# Shared Walkthrough

Generic multi-step walkthrough engine at `src/shared/walkthrough`. Callers pass `WalkthroughStep[]`, mount `<Main />`. No feature copy here. Cloned from [`user-profile-setup`](../../../../romantic-app/src/modules/user-profile-setup) — see that `AGENTS.md` for layering. `__decision__/` = clone diffs.

## Architecture

1. configuration — `constraints.ts` (`FEATURE_NAME`), `e2e-ids.ts` (module ids, root-combined in `src/__e2e__/selectors.d.ts`).
2. domain — `models.ts`, `events.ts`. Pure types, no React/persistence.
3. core — `store`, `bus`, `handlers/`, `registry`, `facade`, `mediator`.
4. integration — `repository.ts` (localStorage by caller `persistenceKey`), `mappers.ts`.
5. presentation — `context`, step/progress/action primitives, `router`, `main` entry.
6. tests — component tests only; no module `__e2e__` (mount via host page).
7. `__decision__` / `__activity__` — one file per task; cross-linked via `decision_ref`.

## Code

Match `user-profile-setup`: const/arrow, named exports, `createX` factories, branded ids, `type` only, exhaustive `switch`, `$` atoms as `use*` via facade, `[TRIGGER]_NAME` events, presentation → core via facade only.

## References

- [domain/models.ts](./domain/models.ts) — `WalkthroughStep` shape.
- [core/mediator.ts](./core/mediator.ts) — composition root.
- [core/handlers/next.ts](./core/handlers/next.ts) — advance/finish + persist.
- [integration/repository.ts](./integration/repository.ts) — localStorage boundary.
- [presentation/main.tsx](./presentation/main.tsx) — public entry.
- [configuration/e2e-ids.ts](./configuration/e2e-ids.ts) — per-module e2e ids.
- [**decision**/](./__decision__/) — architectural decisions.
- [**activity**/](./__activity__/) — per-task progress/time/cost.

> Read reference only when rule above unclear.
