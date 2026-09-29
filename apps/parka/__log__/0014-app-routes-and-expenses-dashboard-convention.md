# 0014 - `/app/*` routing + expenses on dashboard convention

```json
{
  "status": "done"
}
```

- Routes: dashboard `/app/`, expenses `/app/expenses/`. Pages in `src/pages/app/`. Paths only in `shared/router/routes.ts`.
- `/app/*` share `app-layout.astro`: `ClientRouter` + persisted `SyncedAppNav`. No 2nd router. Other pages stay flat.
- Nav: dashboard exact-match (`/app/` prefixes `/app/expenses/`).
- E2E (`src/__e2e__/*`, `server/__e2e__/rest-endpoints.spec.ts`) use `APP_ROUTER`/`API_ROUTER`. No path literals.
- Expenses: branded ids, `integration/mappers.ts`, `domain/grouping.ts`, `FILTER_OPTIONS`, presentation split, `ErrorBoundary`, `AGENTS.md` (hashy). Unit tests for grouping + mappers.
- Category select: lookup in `categories`, no cast.
- Verified: lint, `astro check`, vitest, build, Playwright `flows` + `screens`. `backend.spec.ts` + server e2e need local Supabase - not run.
- Audit by reviewer subagent: no must-fix. Left as-is (same as dashboard): raw colors/px, no dark variants, no skeleton, error pattern, dialog focus trap.

Why: one authenticated zone for client-side nav + persistent shell. Consequence: `/dashboard/`, `/expenses/` now 404 (no redirects, pre-release). Dashboard AGENTS drift: `QUICK_ACTIONS` inline in `main.tsx`, not `constraints.ts`.
