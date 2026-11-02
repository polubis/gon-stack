---
ticket: none
scope: parka/walkthrough
summary: Move module to `src/shared/walkthrough`
why: Parka keeps cross-cutting app concerns in `src/shared/`, but the walkthrough lived under `src/modules/shared`
date: 2026-09-14
---

- Moved `src/modules/shared/walkthrough` → `src/shared/walkthrough`.
- Updated `home` imports and root `selectors.d.ts` to `@/shared/walkthrough`.
- Aligned `AGENTS.md` (location, compressed per caveman), `progress-dots` uses `cn` from `react-kit`.
- Module lived under `src/modules/shared/walkthrough`, but parka already keeps cross-cutting app concerns in `src/shared/` (`cookies`, `data-sources`, `server-contracts`) — walkthrough is app-wide infra, not a feature module
  - same bucket as cookies.
- Moved folder, public import `@/shared/walkthrough` (mirrors `@/shared/cookies`), layered internals unchanged, only external import paths + docs updated.
- Consequence: callers import from `@/shared/walkthrough`; e2e root union imports `@/shared/walkthrough/configuration/e2e-ids`; no re-export shim in old path.
