# 0001 - Layered home module

```json
{
  "status": "done"
}
```

Split `home` into `configuration/constraints.ts` (`FEATURE_NAME`, `STEPS`, `PERSISTENCE_KEY`, `ERROR_CODES`) and `presentation/main.tsx` (wraps `@/shared/walkthrough` in `ErrorBoundary`, hands off to sign-up). Add black-box tests + `AGENTS.md`. No domain/core/integration: static content, no state, no fetch. `data-e2e` ids and behavior unchanged.

Steps lived inline in `main.tsx`; content config belongs in `configuration/` like dashboard.
