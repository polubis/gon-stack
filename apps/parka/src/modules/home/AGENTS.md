---
version: 1.1
hash: f6d4729f7a511e3a26e05312673b6f222800c82725f30aa175ce6f6b5525dd74
---

# Home

Public landing at `/` (prerendered by `pages/index.astro`). Wraps shared
walkthrough; finishing hands off to sign-up. No auth, no fetch, no state.

## Architecture

1. configuration — `constraints.ts` (`FEATURE_NAME`, `STEPS`,
   `PERSISTENCE_KEY`, `ERROR_CODES`), `e2e-ids.ts` (`HomeE2eId`).
2. presentation — `main.tsx`: `ErrorBoundary` + `@/shared/walkthrough`;
   `onFinish` -> `navigateTo(APP_ROUTER.signUp())`.
3. `index.ts` exports `Main` only.

Skipped layers (would be artificial):

- domain — step types are owned by `@/shared/walkthrough`; no own entities.
- core — no state, events or business logic.
- integration — no backend calls.
- presentation/selectors — no derived view logic.

## Code

1. `const` + arrows, named exports, `type` only.
2. Tokens + `cn` only; copy is Polish, ids `home:*` unchanged.
3. Imports nothing from other modules.

## References

- [configuration/constraints.ts](./configuration/constraints.ts)
- [presentation/main.tsx](./presentation/main.tsx)
- [**tests**/home.test.tsx](./__tests__/home.test.tsx)
