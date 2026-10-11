---
ticket: none
scope: parka/home
summary: Layered home module
why: Steps lived inline in `main.tsx`; content config belongs in `configuration/` like dashboard
date: 2026-09-29
---

- Split `home` into `configuration/constraints.ts` (`FEATURE_NAME`, `STEPS`, `PERSISTENCE_KEY`, `ERROR_CODES`) and `presentation/main.tsx` (wraps `@/shared/walkthrough` in `ErrorBoundary`, hands off to sign-up).
- Add black-box tests + `AGENTS.md`.
- No domain/core/integration: static content, no state, no fetch.
- `data-e2e` ids and behavior unchanged.
